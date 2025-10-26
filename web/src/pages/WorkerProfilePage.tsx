import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWorkerProfile } from '../hooks/useCompany';
import { DocumentGrid } from '../components/DocumentGrid';
import DocumentUploadForm from '../components/DocumentUploadForm';
import { Boton } from '../components/ui/Boton';
import {
  ArrowLeft,
  LogOut,
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import type { WorkerDocumentType } from '../types/company';
import { formatRut } from '../utils/rut';

export default function WorkerProfilePage() {
  const { workerId, companyId } = useParams<{ workerId: string; companyId: string }>();
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, fetchProfile } = useWorkerProfile(workerId || '');

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [uploadSuccess, setUploadSuccess] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<WorkerDocumentType[]>([]);

  // Cargar perfil y obtener tipos de documentos
  useEffect(() => {
    if (workerId) {
      fetchProfile();
      // TODO: Cargar tipos de documentos desde API o usar valores hardcodeados
      setDocumentTypes([
        {
          id: 'cedula',
          code: 'CEDULA',
          name: 'Cédula de Identidad',
          description: 'Documento de identidad válido',
          requires_front_back: true,
          requires_expiry_date: true,
          order_index: 1,
          created_at: '',
        },
        {
          id: 'contrato',
          code: 'CONTRATO',
          name: 'Contrato de Trabajo',
          description: 'Acuerdo laboral vigente',
          requires_front_back: false,
          requires_expiry_date: false,
          order_index: 2,
          created_at: '',
        },
        {
          id: 'ds44',
          code: 'DS_44',
          name: 'Información DS 44',
          description: 'Registro de información de riesgos',
          requires_front_back: false,
          requires_expiry_date: true,
          order_index: 3,
          created_at: '',
        },
        {
          id: 'riohs',
          code: 'RIOHS',
          name: 'Registro Entrega RIOHS',
          description: 'Constancia de entrega de RIOHS',
          requires_front_back: false,
          requires_expiry_date: true,
          order_index: 4,
          created_at: '',
        },
        {
          id: 'epp',
          code: 'EPP',
          name: 'Registro Entrega EPP',
          description: 'Constancia de entrega de equipos de protección',
          requires_front_back: false,
          requires_expiry_date: true,
          order_index: 5,
          created_at: '',
        },
      ]);
    }
  }, [workerId, fetchProfile]);

  if (!profile && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-gray-600">Cargando perfil del trabajador...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate(`/company/${companyId}/workers`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome back</p>
                  <p className="font-semibold text-gray-900">{usuario?.full_name}</p>
                </div>
                <Boton variante="secondary" onClick={cerrarSesion}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Boton>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Trabajador no encontrado</p>
            <Boton onClick={() => navigate(`/company/${companyId}/workers`)}>
              Volver a Trabajadores
            </Boton>
          </div>
        </main>
      </div>
    );
  }

  const worker = profile.worker;
  const documents = profile.documents || [];

  const handleUploadSubmit = async (_data: {
    document_type_id: string;
    emission_date?: string;
    expiry_date?: string;
    file: File;
    file_back?: File;
  }) => {
    try {
      setUploadError(undefined);
      setUploading(true);

      // TODO: Implementar upload a R2 y API call
      // Por ahora, solo mostramos un mensaje de éxito
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/company/${companyId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <User className="inline w-8 h-8 mr-2 text-primary-600" />
                  {worker.first_name} {worker.last_name}
                </h1>
                <p className="text-gray-600 mt-1">Perfil del Trabajador</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back</p>
                <p className="font-semibold text-gray-900">{usuario?.full_name}</p>
              </div>
              <Boton variante="secondary" onClick={cerrarSesion}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Boton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
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
              documents={documents}
              documentTypes={documentTypes}
              loading={loading}
              onUploadClick={() => setShowUploadForm(true)}
              isAdmin={false}
            />
          </div>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <DocumentUploadForm
            documentTypes={documentTypes}
            onSubmit={handleUploadSubmit}
            onCancel={() => setShowUploadForm(false)}
            loading={uploading}
          />
        )}
      </main>
    </div>
  );
}
