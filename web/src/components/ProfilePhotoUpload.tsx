import { useState, useRef } from 'react';
import { Camera, X, User } from 'lucide-react';
import { config } from '../config';

interface ProfilePhotoUploadProps {
  workerId: string;
  currentPhotoKey?: string;
  onPhotoUpdated: (photoKey: string | null) => void;
}

/**
 * Componente para subir y gestionar foto de perfil del trabajador
 */
export function ProfilePhotoUpload({
  workerId,
  currentPhotoKey,
  onPhotoUpdated
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede ser mayor a 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Primero obtener URL de subida
      const uploadUrlResponse = await fetch(`${config.apiUrl}/r2/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          fileName: `profile-${workerId}-${Date.now()}.${file.name.split('.').pop()}`,
          contentType: file.type,
        }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Error al obtener URL de subida');
      }

      const { uploadUrl, fileKey } = await uploadUrlResponse.json();

      // Subir archivo a R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir la imagen');
      }

      // Actualizar el trabajador con la nueva foto
      const updateResponse = await fetch(`${config.apiUrl}/workers/${workerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          profile_image_r2_key: fileKey,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      onPhotoUpdated(fileKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoKey) return;

    setUploading(true);
    setError(null);

    try {
      // Actualizar el trabajador removiendo la foto
      const updateResponse = await fetch(`${config.apiUrl}/workers/${workerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          profile_image_r2_key: null,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Error al remover la foto');
      }

      onPhotoUpdated(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setUploading(false);
    }
  };

  const getPhotoUrl = (key: string) => {
    return `${config.apiUrl}/r2/files/${key}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Foto de perfil */}
      <div className="relative">
        <div className="w-32 h-40 bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
          {currentPhotoKey ? (
            <img
              src={getPhotoUrl(currentPhotoKey)}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>

        {/* Botones de acción */}
        <div className="absolute -bottom-2 -right-2 flex space-x-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 disabled:opacity-50"
            title="Cambiar foto"
          >
            <Camera className="w-4 h-4" />
          </button>

          {currentPhotoKey && (
            <button
              onClick={handleRemovePhoto}
              disabled={uploading}
              className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 disabled:opacity-50"
              title="Remover foto"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        className="hidden"
      />

      {/* Estado de carga */}
      {uploading && (
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
          <span>Subiendo...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Instrucciones */}
      <div className="text-xs text-gray-500 text-center max-w-32">
        Formato carnet<br />
        Máx. 5MB
      </div>
    </div>
  );
}