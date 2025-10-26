import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWorkerProfile, useWorkerDocuments } from '../hooks/useCompany';
import { config } from '../config';
import { DocumentGrid } from '../components/DocumentGrid';
import DocumentUploadForm from '../components/DocumentUploadForm';
import { DashboardLayout } from '../components/DashboardLayout';
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload';
import {
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import { formatRut } from '../utils/rut';

export default function WorkerProfilePage() {
  const { workerId, companyId } = useParams<{ workerId: string; companyId: string }>();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, fetchProfile } = useWorkerProfile(workerId || '');
  const { deleteDocument } = useWorkerDocuments(workerId || '');

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [uploadSuccess, setUploadSuccess] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  // Cargar perfil del trabajador
  useEffect(() => {
    if (workerId) {
      fetchProfile();
    }
  }, [workerId, fetchProfile]);

  if (!profile && loading) {
    return (
      <DashboardLayout
        title="Cargando Perfil"
        subtitle="Por favor espere..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-gray-600">Cargando perfil del trabajador...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile || !profile.worker) {
    return (
      <DashboardLayout
        title="Trabajador no encontrado"
        subtitle="El perfil solicitado no está disponible"
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Trabajador no encontrado</p>
          <button
            onClick={() => navigate(`/company/${companyId}/workers`)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Volver a Trabajadores
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const worker = profile.worker;

  const handleUploadSubmit = async (data: {
    document_type_id: string;
    emission_date?: string;
    expiry_date?: string;
    file: File;
    file_back?: File;
  }) => {
    try {
      setUploadError(undefined);
      setUploading(true);

      // Create FormData for multipart upload
      const formData = new FormData();
      if (!workerId) {
        throw new Error('Worker ID is required');
      }
      formData.append('worker_id', workerId);
      formData.append('document_type_id', data.document_type_id);
      if (data.emission_date) formData.append('emission_date', data.emission_date);
      if (data.expiry_date) formData.append('expiry_date', data.expiry_date);
      formData.append('file', data.file);
      if (data.file_back) formData.append('file_back', data.file_back);

      // Upload document directly to backend
      const response = await fetch(`${config.apiUrl}/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      setUploadSuccess('Documento subido exitosamente. Pendiente de revisión');
      setShowUploadForm(false);
      setTimeout(() => setUploadSuccess(undefined), 3000);

      // Recargar perfil
      await fetchProfile();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Error al subir el documento'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFront = async (documentId: string) => {
    await downloadFile(documentId, 'front');
  };

  const handleDownloadBack = async (documentId: string) => {
    await downloadFile(documentId, 'back');
  };

  const downloadFile = async (documentId: string, fileType: 'front' | 'back') => {
    try {
      // Call the download endpoint to get the signed URLs
      const response = await fetch(`${config.apiUrl}/documents/download/${documentId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get download URL');
      }

      const data = await response.json();
      const { downloadUrl, downloadUrlBack, hasBackFile } = data.data;

      // Choose which URL to use based on fileType
      let urlToDownload: string;
      if (fileType === 'front') {
        urlToDownload = downloadUrl;
      } else if (fileType === 'back' && hasBackFile && downloadUrlBack) {
        urlToDownload = downloadUrlBack;
      } else {
        throw new Error('Archivo no disponible');
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = urlToDownload;
      link.download = ''; // Let the browser determine the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setUploadError(
        err instanceof Error ? err.message : 'Error al descargar el documento'
      );
      setTimeout(() => setUploadError(undefined), 3000);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      await deleteDocument(documentId);
      setUploadSuccess('Documento eliminado exitosamente');
      setTimeout(() => setUploadSuccess(undefined), 3000);
      // Recargar perfil
      await fetchProfile();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Error al eliminar el documento'
      );
      setTimeout(() => setUploadError(undefined), 3000);
    }
  };

  return (
    <DashboardLayout
      title={`${worker.first_name} ${worker.last_name}`}
      subtitle={`RUT: ${formatRut(worker.rut)} • Perfil del Trabajador`}
    >
      {/* Alert Messages */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{uploadError}</p>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-green-700 text-sm">{uploadSuccess}</p>
            </div>
          </div>
        )}

        {/* Secciones */}
        <div className="space-y-8">
          
          {/* Información Personal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Personal</h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Foto de Perfil */}
              <div className="lg:col-span-1">
                <ProfilePhotoUpload
                  workerId={worker.id}
                  currentPhotoKey={worker.profile_image_r2_key}
                  onPhotoUpdated={() => fetchProfile()}
                />
              </div>

              {/* Información del Trabajador */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* RUT */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <label className="text-sm font-medium text-gray-700">RUT</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatRut(worker.rut)}</p>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <label className="text-sm font-medium text-gray-700">Email</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">{worker.email || '-'}</p>
              </div>

              {/* Teléfono */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <label className="text-sm font-medium text-gray-700">Teléfono</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">{worker.phone || '-'}</p>
              </div>

              {/* Puesto */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  <label className="text-sm font-medium text-gray-700">Puesto</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">{worker.job_title || '-'}</p>
              </div>

              {/* Departamento */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <label className="text-sm font-medium text-gray-700">Departamento</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">{worker.department || '-'}</p>
              </div>

              {/* Fecha de Registro */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <label className="text-sm font-medium text-gray-700">Registrado</label>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(worker.created_at).toLocaleDateString('es-CL')}
                </p>
                </div>
              </div>
            </div>
          </div>

            {/* Comentarios */}
            {worker.additional_comments && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-sm font-medium text-gray-700">Comentarios</label>
                <p className="mt-2 text-gray-700">{worker.additional_comments}</p>
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <DocumentGrid
              documents={profile.documents}
              documentTypes={profile.documentTypes}
              loading={uploading}
              onUploadClick={() => setShowUploadForm(true)}
              isAdmin={usuario?.role === 'admin'}
              onDownloadFront={handleDownloadFront}
              onDownloadBack={handleDownloadBack}
              onDelete={handleDelete}
            />
          </div>
        </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <DocumentUploadForm
          documentTypes={profile.documentTypes}
          onSubmit={handleUploadSubmit}
          onCancel={() => setShowUploadForm(false)}
          loading={uploading}
        />
      )}
    </DashboardLayout>
  );
}
