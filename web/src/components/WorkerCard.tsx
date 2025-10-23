import { User, Mail, Phone } from 'lucide-react';
import type { Worker } from '../types/company';

interface WorkerCardProps {
  worker: Worker;
  documentsStatus?: {
    approved: number;
    pending: number;
    expired: number;
    total: number;
  };
  onSelect: (worker: Worker) => void;
}

/**
 * Tarjeta de trabajador con foto de perfil, nombre y estado de documentos
 */
export function WorkerCard({ worker, documentsStatus, onSelect }: WorkerCardProps) {
  return (
    <div
      onClick={() => onSelect(worker)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
    >
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
      <div className="p-4">
        <h3 className="font-bold text-gray-900">
          {worker.first_name} {worker.last_name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">RUT: {worker.rut}</p>

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
          <div className="border-t border-gray-200 pt-3">
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
      </div>
    </div>
  );
}
