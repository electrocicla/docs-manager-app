import { Download, MoreVertical, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { WorkerDocument, WorkerDocumentType, DocumentStatus } from '../types/company';

/**
 * Calcula los días restantes hasta el vencimiento
 */
function getDaysRemaining(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Retorna el color según el estado del documento
 */
function getStatusColor(status: DocumentStatus): string {
  const colors: Record<DocumentStatus, string> = {
    'PENDING': 'bg-gray-100 text-gray-800 border-gray-300',
    'UNDER_REVIEW': 'bg-orange-100 text-orange-800 border-orange-300',
    'IN_REVIEW': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'APPROVED': 'bg-green-100 text-green-800 border-green-300',
    'EXPIRED': 'bg-red-100 text-red-800 border-red-300',
    'REJECTED': 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status];
}

/**
 * Retorna el texto para mostrar del estado
 */
function getStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    'PENDING': 'Faltante',
    'UNDER_REVIEW': 'En espera de revisión',
    'IN_REVIEW': 'En revisión',
    'APPROVED': 'Aprobado/Vigente',
    'EXPIRED': 'Obsoleto/Vencido',
    'REJECTED': 'Rechazado',
  };
  return labels[status];
}

interface DocumentCardProps {
  document: WorkerDocument;
  documentType: WorkerDocumentType;
  isAdmin?: boolean;
  onStatusChange?: (status: DocumentStatus) => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

/**
 * Tarjeta de documento con estado visual, fechas y acciones
 */
export function DocumentCard({
  document,
  documentType,
  isAdmin = false,
  onStatusChange,
  onDownload,
  onDelete,
}: DocumentCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const daysRemaining = getDaysRemaining(document.expiry_date);
  const statusColor = getStatusColor(document.status);
  const statusLabel = getStatusLabel(document.status);

  const statusOptions: DocumentStatus[] = ['PENDING', 'UNDER_REVIEW', 'IN_REVIEW', 'APPROVED', 'EXPIRED', 'REJECTED'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{documentType.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{documentType.description}</p>
        </div>

        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Más acciones"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {statusOptions.map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      onStatusChange?.(status);
                      setShowStatusMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      document.status === status ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColor} mb-3`}>
        {statusLabel}
      </div>

      {/* Dates */}
      {(document.emission_date || document.expiry_date) && (
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          {document.emission_date && (
            <div>
              <p className="text-gray-500">Emisión</p>
              <p className="font-medium text-gray-900">
                {new Date(document.emission_date).toLocaleDateString('es-CL')}
              </p>
            </div>
          )}
          {document.expiry_date && (
            <div>
              <p className="text-gray-500">Vencimiento</p>
              <p className="font-medium text-gray-900">
                {new Date(document.expiry_date).toLocaleDateString('es-CL')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Days remaining */}
      {daysRemaining !== null && (
        <div className={`flex items-center space-x-2 p-2 rounded-lg mb-4 ${
          daysRemaining < 0
            ? 'bg-red-50'
            : daysRemaining < 30
            ? 'bg-yellow-50'
            : 'bg-green-50'
        }`}>
          {daysRemaining < 0 ? (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-primary-600 flex-shrink-0" />
          )}
          <div className="text-xs">
            <p className="font-bold text-gray-900">
              {daysRemaining < 0 ? 'VENCIDO' : `${daysRemaining} días`}
            </p>
            {daysRemaining >= 0 && (
              <p className="text-gray-600">Faltan para vencer</p>
            )}
          </div>
        </div>
      )}

      {/* Comments */}
      {isAdmin && document.admin_comments && (
        <div className="bg-gray-50 rounded p-2 mb-4 text-xs">
          <p className="font-medium text-gray-700 mb-1">Comentarios:</p>
          <p className="text-gray-600">{document.admin_comments}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {onDownload && (
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Descargar</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>
        )}
      </div>
    </div>
  );
}
