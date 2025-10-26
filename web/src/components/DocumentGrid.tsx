import { Plus, FileText } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import type { WorkerDocument, WorkerDocumentType } from '../types/company';

interface DocumentGridProps {
  documents: WorkerDocument[];
  documentTypes: WorkerDocumentType[];
  loading: boolean;
  onUploadClick: () => void;
  isAdmin?: boolean;
  onDownload?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
}

/**
 * Grid de 6 documentos con estados visuales
 * Muestra todos los tipos de documentos requeridos
 */
export function DocumentGrid({
  documents,
  documentTypes,
  loading,
  onUploadClick,
  isAdmin = false,
  onDownload,
  onDelete,
}: DocumentGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <FileText className="w-8 h-8 text-primary-600" />
        </div>
      </div>
    );
  }

  // Crear un map de documento por tipo para búsqueda rápida
  const documentsByType = new Map(
    documents.map(doc => [doc.document_type_id, doc])
  );

  // Mostrar solo los tipos definidos (normalmente 5 + 1 foto de perfil)
  const displayTypes = documentTypes.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">
          Documentos Requeridos ({documents.length}/{displayTypes.length})
        </h3>
        <button
          onClick={onUploadClick}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Subir Documento</span>
        </button>
      </div>

      {/* Grid de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayTypes.map(docType => {
          const document = documentsByType.get(docType.id);

          if (document) {
            // Si existe el documento, mostrar la tarjeta
            return (
              <DocumentCard
                key={docType.id}
                document={document}
                documentType={docType}
                isAdmin={isAdmin}
                onDownload={onDownload ? () => onDownload(document.id) : undefined}
                onDelete={onDelete ? () => onDelete(document.id) : undefined}
              />
            );
          }

          // Si no existe, mostrar placeholder vacío
          return (
            <div
              key={docType.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center min-h-48"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{docType.name}</h4>
              <p className="text-gray-600 text-sm mb-4">{docType.description}</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                Faltante
              </span>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayTypes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No hay tipos de documentos disponibles</p>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Estado de Documentos</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>Faltante/Pendiente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
            <span>En espera de revisión</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
            <span>En revisión</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-300 rounded-full"></div>
            <span>Aprobado/Vigente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-300 rounded-full"></div>
            <span>Vencido/Rechazado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
