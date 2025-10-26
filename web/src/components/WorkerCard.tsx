import { User, Mail, Phone, Edit, Trash2, LogIn } from 'lucide-react';
import type { WorkerModel } from '../types/company';
import { formatRut } from '../utils/rut';

interface WorkerCardProps {
  worker: WorkerModel;
  companyId?: string;
  documentsStatus?: {
    approved: number;
    pending: number;
    expired: number;
    total: number;
  };
  onEdit?: (worker: WorkerModel) => void;
  onDelete?: (worker: WorkerModel) => void;
  onAccess?: (worker: WorkerModel) => void;
}

/**
 * Tarjeta de trabajador con foto de perfil, nombre, estado de documentos y botones de acción
 */
export function WorkerCard({ worker, documentsStatus, onEdit, onDelete, onAccess }: WorkerCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Foto de perfil */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
        {worker.profile_image_r2_key ? (
          <img
            src={`/r2/${worker.profile_image_r2_key}`}
            alt={`${worker.first_name} ${worker.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center">
            <User className="w-16 h-16 text-primary-300" />
            <p className="text-xs text-primary-400 mt-2">Sin foto</p>
          </div>
        )}

        {/* Status badge */}
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
          worker.status === 'ACTIVE'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {worker.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900">
          {worker.first_name} {worker.last_name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">RUT: {formatRut(worker.rut)}</p>

        <div className="space-y-1 text-xs text-gray-600 mb-4">
          {worker.job_title && (
            <p className="font-medium text-gray-700">{worker.job_title}</p>
          )}
          {worker.email && (
            <div className="flex items-center space-x-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{worker.email}</span>
            </div>
          )}
          {worker.phone && (
            <div className="flex items-center space-x-1">
              <Phone className="w-3 h-3" />
              <span>{worker.phone}</span>
            </div>
          )}
        </div>

        {/* Documentos status */}
        {documentsStatus && (
          <div className="border-t border-gray-200 pt-3 mb-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Aprobados</p>
                <p className="text-sm font-bold text-green-600">{documentsStatus.approved}/{documentsStatus.total}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Pendientes</p>
                <p className="text-sm font-bold text-yellow-600">{documentsStatus.pending}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Vencidos</p>
                <p className="text-sm font-bold text-red-600">{documentsStatus.expired}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Removed hover overlay, added direct buttons */}
        <div className="border-t border-gray-200 pt-3 mt-auto space-y-2">
          {onAccess && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccess(worker);
              }}
              className="w-full inline-flex items-center justify-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Acceder</span>
            </button>
          )}

          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(worker);
                }}
                className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(worker);
                }}
                className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

