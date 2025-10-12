import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File as FileIcon, AlertCircle } from 'lucide-react';
import { servicioArchivos } from '../api/servicio-archivos';
import { CargadorSpinner } from './ui/CargadorSpinner';
import { Boton } from './ui/Boton';

interface PropiedadesSubidorArchivos {
  jobId?: string;
  alSubirExitoso?: (_archivo: any) => void;
  maxSizeMB?: number;
  multiple?: boolean;
  aceptarTipos?: string;
}

/**
 * Componente Subidor de Archivos
 * Responsabilidad: Gestionar subida de archivos con drag & drop
 */
export function SubidorArchivos({
  jobId,
  alSubirExitoso,
  maxSizeMB = 200,
  multiple = false,
  aceptarTipos = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp',
}: PropiedadesSubidorArchivos) {
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState<Record<string, number>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});

  const inputRef = useRef<HTMLInputElement>(null);

  const validarArchivo = useCallback((archivo: File): string | null => {
    if (!servicioArchivos.validarTamano(archivo, maxSizeMB)) {
      return `El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`;
    }

    if (!servicioArchivos.validarTipo(archivo)) {
      return 'Tipo de archivo no permitido.';
    }

    return null;
  }, [maxSizeMB]);

  const manejarArchivosSeleccionados = useCallback((archivos: FileList | null) => {
    if (!archivos) return;

    const nuevosArchivos: File[] = [];
    const nuevosErrores: Record<string, string> = {};

    Array.from(archivos).forEach((archivo) => {
      const error = validarArchivo(archivo);
      if (error) {
        nuevosErrores[archivo.name] = error;
      } else {
        nuevosArchivos.push(archivo);
      }
    });

    setArchivosSeleccionados(prev => multiple ? [...prev, ...nuevosArchivos] : nuevosArchivos);
    setErrores(prev => ({ ...prev, ...nuevosErrores }));
  }, [multiple, validarArchivo]);

  const manejarDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(false);
    manejarArchivosSeleccionados(e.dataTransfer.files);
  }, [manejarArchivosSeleccionados]);

  const manejarDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(true);
  }, []);

  const manejarDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(false);
  }, []);

  const removerArchivo = (index: number) => {
    setArchivosSeleccionados(prev => prev.filter((_, i) => i !== index));
    setErrores(prev => {
      const nuevo = { ...prev };
      delete nuevo[archivosSeleccionados[index].name];
      return nuevo;
    });
  };

  const subirArchivos = async () => {
    if (archivosSeleccionados.length === 0) return;

    setSubiendo(true);
    setErrores({});

    const resultados: any[] = [];
    const nuevosErrores: Record<string, string> = {};

    for (const archivo of archivosSeleccionados) {
      try {
        setProgreso(prev => ({ ...prev, [archivo.name]: 0 }));

        // Simular progreso (en una implementación real, usar XMLHttpRequest para progreso real)
        const intervalo = setInterval(() => {
          setProgreso(prev => ({
            ...prev,
            [archivo.name]: Math.min((prev[archivo.name] || 0) + 10, 90)
          }));
        }, 100);

        const resultado = await servicioArchivos.subirArchivo(archivo, jobId);

        clearInterval(intervalo);
        setProgreso(prev => ({ ...prev, [archivo.name]: 100 }));

        resultados.push(resultado.file);
        alSubirExitoso?.(resultado.file);
      } catch (error: any) {
        nuevosErrores[archivo.name] = error.message || 'Error al subir archivo';
      }
    }

    setErrores(nuevosErrores);
    setSubiendo(false);

    if (resultados.length > 0 && !multiple) {
      setArchivosSeleccionados([]);
    }
  };

  return (
    <div className="w-full">
      {/* Área de drop */}
      <div
        onDrop={manejarDrop}
        onDragOver={manejarDragOver}
        onDragLeave={manejarDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          estaArrastrando
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className={`mx-auto h-12 w-12 ${estaArrastrando ? 'text-primary-500' : 'text-gray-400'}`} />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            {estaArrastrando ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Máximo {maxSizeMB}MB por archivo • {aceptarTipos}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={aceptarTipos}
        onChange={(e) => manejarArchivosSeleccionados(e.target.files)}
        className="hidden"
      />

      {/* Lista de archivos seleccionados */}
      {archivosSeleccionados.length > 0 && (
        <div className="mt-4 space-y-2">
          {archivosSeleccionados.map((archivo, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{archivo.name}</p>
                  <p className="text-xs text-gray-500">
                    {servicioArchivos.formatearTamano(archivo.size)}
                  </p>
                </div>
              </div>

              {subiendo && progreso[archivo.name] !== undefined && (
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progreso[archivo.name]}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{progreso[archivo.name]}%</span>
                </div>
              )}

              {!subiendo && (
                <button
                  onClick={() => removerArchivo(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Errores */}
      {Object.keys(errores).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(errores).map(([nombre, error]) => (
            <div key={nombre} className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">
                <strong>{nombre}:</strong> {error}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Botón de subida */}
      {archivosSeleccionados.length > 0 && !subiendo && (
        <div className="mt-4">
          <Boton onClick={subirArchivos} className="w-full">
            Subir {archivosSeleccionados.length} archivo{archivosSeleccionados.length > 1 ? 's' : ''}
          </Boton>
        </div>
      )}

      {subiendo && (
        <div className="mt-4 flex justify-center">
          <CargadorSpinner mensaje="Subiendo archivos..." />
        </div>
      )}
    </div>
  );
}