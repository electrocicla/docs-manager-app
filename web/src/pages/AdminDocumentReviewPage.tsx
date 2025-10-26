import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdminDocuments } from '../hooks/useCompany';
import { Boton } from '../components/ui/Boton';
import { generateSignedDownloadUrl } from '../utils/r2-storage';
import {
  ArrowLeft,
  LogOut,
  AlertCircle,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Search,
} from 'lucide-react';
import type { WorkerDocument } from '../types/company';
import { useNavigate } from 'react-router-dom';

interface DocumentWithWorkerInfo extends WorkerDocument {
  worker_name?: string;
  company_name?: string;
  document_type_name?: string;
}

interface FilteredDocument extends DocumentWithWorkerInfo {
  isExpanded?: boolean;
}

export default function AdminDocumentReviewPage() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { documents: apiDocuments, loading: apiLoading, fetchPendingDocuments, updateDocumentStatus } = useAdminDocuments();
  
  const [documents, setDocuments] = useState<FilteredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [expandedId, setExpandedId] = useState<string>();
  const [editingId, setEditingId] = useState<string>();
  const [editingData, setEditingData] = useState<{
    status: string;
    admin_comments: string;
  }>({
    status: '',
    admin_comments: '',
  });

  // Verificar que es admin
  useEffect(() => {
    if (usuario && usuario.role !== 'admin') {
      navigate('/companies');
    }
  }, [usuario, navigate]);

  // Cargar documentos desde la API
  useEffect(() => {
    fetchPendingDocuments();
  }, [fetchPendingDocuments]);

  // Actualizar documentos locales cuando los datos de la API cambian
  useEffect(() => {
    if (!apiLoading && apiDocuments.length > 0) {
      const mappedDocs = apiDocuments.map((doc: any) => ({
        ...doc,
        worker_name: `${doc.first_name} ${doc.last_name}`,
        company_name: doc.company_name,
        document_type_name: doc.document_type_name,
      }));
      setDocuments(mappedDocs);
      setLoading(false);
    } else if (!apiLoading && apiDocuments.length === 0) {
      setDocuments([]);
      setLoading(false);
    }
  }, [apiDocuments, apiLoading]);

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      doc.worker_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.document_type_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Iniciar edición
  const handleEditClick = (doc: FilteredDocument) => {
    setEditingId(doc.id);
    setEditingData({
      status: doc.status,
      admin_comments: doc.admin_comments || '',
    });
  };

  // Guardar cambios
  const handleSaveClick = async (docId: string) => {
    try {
      // Llamar API para actualizar documento
      await updateDocumentStatus(docId, editingData.status, editingData.admin_comments);
      setSuccess('Documento actualizado exitosamente');
      setEditingId(undefined);
      setTimeout(() => setSuccess(undefined), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar documento'
      );
    }
  };

  // Cancelar edición
  const handleCancelClick = () => {
    setEditingId(undefined);
    setEditingData({ status: '', admin_comments: '' });
  };

  // Descargar documento
  const handleDownloadClick = async (doc: FilteredDocument) => {
    try {
      if (!doc.file_r2_key) {
        setError('El documento no tiene archivo asociado');
        return;
      }
      setError(undefined);
      const downloadUrl = await generateSignedDownloadUrl(doc.file_r2_key);
      
      // Crear link y disparar descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.file_name || 'documento';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al descargar documento'
      );
    }
  };

  // Obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'UNDER_REVIEW':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Obtener icono según estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'UNDER_REVIEW':
        return <Eye className="w-4 h-4" />;
      case 'IN_REVIEW':
        return <Eye className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'EXPIRED':
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Traducir estado
  const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
      PENDING: 'Pendiente',
      UNDER_REVIEW: 'En Revisión',
      IN_REVIEW: 'Revisando',
      APPROVED: 'Aprobado',
      EXPIRED: 'Expirado',
      REJECTED: 'Rechazado',
    };
    return translations[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/companies')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <FileText className="inline w-8 h-8 mr-2 text-primary-600" />
                  Panel de Revisión de Documentos
                </h1>
                <p className="text-gray-600 mt-1">Administrador</p>
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por trabajador, empresa, tipo de documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'PENDING'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setStatusFilter('UNDER_REVIEW')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'UNDER_REVIEW'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En Revisión
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aprobados
              </button>
              <button
                onClick={() => setStatusFilter('EXPIRED')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'EXPIRED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expirados
              </button>
              <button
                onClick={() => setStatusFilter('REJECTED')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rechazados
              </button>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin mb-4">
              <FileText className="w-8 h-8 text-primary-600 mx-auto" />
            </div>
            <p className="text-gray-600">Cargando documentos...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              {documents.length === 0
                ? 'No hay documentos para revisar'
                : 'No hay documentos que coincidan con tu búsqueda'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Document Row */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {doc.document_type_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {doc.worker_name} • {doc.company_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Status Badge */}
                      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        <span className="text-sm font-medium">
                          {translateStatus(doc.status)}
                        </span>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === doc.id ? undefined : doc.id)
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronDown
                          className={`w-5 h-5 text-gray-600 transition-transform ${
                            expandedId === doc.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Document Details - Expandable */}
                  {expandedId === doc.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                      
                      {/* File Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Archivo</label>
                          <div className="mt-2 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                            <Download className="w-4 h-4 text-primary-600" />
                            <span className="text-sm text-gray-700">{doc.file_name}</span>
                            <span className="text-xs text-gray-600">
                              ({doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) : '0'} MB)
                            </span>
                          </div>
                        </div>

                        {doc.file_r2_key_back && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Archivo Dorso
                            </label>
                            <div className="mt-2 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                              <Download className="w-4 h-4 text-primary-600" />
                              <span className="text-sm text-gray-700">
                                {doc.file_name} (dorso)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Fecha de Emisión
                          </label>
                          <p className="mt-2 text-gray-900">
                            {doc.emission_date
                              ? new Date(doc.emission_date).toLocaleDateString('es-CL')
                              : '-'}
                          </p>
                        </div>

                        {doc.expiry_date && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Fecha de Vencimiento
                            </label>
                            <p className="mt-2 text-gray-900">
                              {new Date(doc.expiry_date).toLocaleDateString('es-CL')}
                              {doc.days_remaining && (
                                <span className={`ml-2 text-sm ${
                                  doc.days_remaining > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}>
                                  ({doc.days_remaining > 0 ? '+' : ''}{doc.days_remaining} días)
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Review Info */}
                      {doc.reviewed_by && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Revisado Por
                          </label>
                          <p className="mt-2 text-gray-900">
                            {doc.reviewed_by} • {new Date(doc.reviewed_at!).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      )}

                      {/* Admin Comments */}
                      {editingId === doc.id ? (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Comentarios del Administrador
                          </label>
                          <textarea
                            value={editingData.admin_comments}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                admin_comments: e.target.value,
                              })
                            }
                            placeholder="Agregar comentarios..."
                            rows={3}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      ) : doc.admin_comments ? (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Comentarios del Administrador
                          </label>
                          <p className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700">
                            {doc.admin_comments}
                          </p>
                        </div>
                      ) : null}

                      {/* Status Change */}
                      {editingId === doc.id && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Cambiar Estado
                          </label>
                          <select
                            value={editingData.status}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                status: e.target.value,
                              })
                            }
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="PENDING">Pendiente</option>
                            <option value="UNDER_REVIEW">En Revisión</option>
                            <option value="IN_REVIEW">Revisando</option>
                            <option value="APPROVED">Aprobado</option>
                            <option value="REJECTED">Rechazado</option>
                          </select>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        {editingId === doc.id ? (
                          <>
                            <button
                              onClick={handleCancelClick}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveClick(doc.id)}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                            >
                              Guardar Cambios
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDownloadClick(doc)}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
                            >
                              <Download className="w-4 h-4" />
                              <span>Descargar</span>
                            </button>
                            <button
                              onClick={() => handleEditClick(doc)}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                            >
                              Editar Estado
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
