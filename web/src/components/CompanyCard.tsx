import { Building2, Users, Mail, Phone, Edit2, Trash2, ChevronRight } from 'lucide-react';
import type { Company } from '../types/company';
import { formatRut } from '../utils/rut';

interface CompanyCardProps {
  company: Company;
  onSelect: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  isAdmin?: boolean;
}

/**
 * Tarjeta para mostrar información de una empresa
 * Contiene nombre, RUT, empleados y acciones
 */
export function CompanyCard({
  company,
  onSelect,
  onEdit,
  onDelete,
  isAdmin = false,
}: CompanyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {company.logo_r2_key ? (
              <img
                src={`/r2/${company.logo_r2_key}`}
                alt={company.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
              <p className="text-sm text-gray-500">
                RUT: {company.rut ? formatRut(company.rut) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            company.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : company.status === 'INACTIVE'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {company.status === 'ACTIVE' ? 'Activa' : company.status === 'INACTIVE' ? 'Inactiva' : 'Suspendida'}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {company.employees_count && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{company.employees_count} empleados</span>
            </div>
          )}
          {company.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="truncate">{company.email}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{company.phone}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onSelect(company)}
            className="flex-1 px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <span>Acceder</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {isAdmin && onEdit && (
            <button
              onClick={() => onEdit(company)}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center space-x-1"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
              <span className="text-sm">Editar</span>
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(company)}
              className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors flex items-center space-x-1"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Eliminar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
