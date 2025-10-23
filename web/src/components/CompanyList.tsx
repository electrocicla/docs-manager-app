import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { CompanyCard } from './CompanyCard';
import type { Company } from '../types/company';

interface CompanyListProps {
  companies: Company[];
  loading: boolean;
  onCreateClick: () => void;
  onEditClick: (company: Company) => void;
  onDeleteClick: (company: Company) => void;
}

export default function CompanyList({
  companies,
  loading,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: CompanyListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Filtrar y buscar empresas
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      // Filtro de estado
      if (statusFilter !== 'ALL' && company.status !== statusFilter) {
        return false;
      }

      // Búsqueda por nombre, RUT, email, ciudad
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          company.name.toLowerCase().includes(query) ||
          company.rut?.toLowerCase().includes(query) ||
          company.email?.toLowerCase().includes(query) ||
          company.city?.toLowerCase().includes(query) ||
          company.industry?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [companies, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <Building2 className="w-8 h-8 text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Empresas</h2>
          <p className="text-gray-600 mt-1">
            {filteredCompanies.length} {filteredCompanies.length === 1 ? 'empresa' : 'empresas'}
            {statusFilter !== 'ALL' && ` (${statusFilter === 'ACTIVE' ? 'Activas' : 'Inactivas'})`}
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Empresa</span>
        </button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT, email, ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'ACTIVE'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'INACTIVE'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactivas
          </button>
        </div>
      </div>

      {/* Lista de Empresas */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            {companies.length === 0
              ? 'No tienes empresas registradas aún'
              : 'No hay empresas que coincidan con tu búsqueda'}
          </p>
          {companies.length === 0 && (
            <button
              onClick={onCreateClick}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              <span>Crear primera empresa</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <div key={company.id} className="relative group">
              <CompanyCard
                company={company}
                onSelect={() => {}} // No implementado aquí
                onEdit={onEditClick}
                onDelete={onDeleteClick}
              />
              
              {/* Acciones rápidas en hover */}
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4 space-x-2">
                <button
                  onClick={() => onEditClick(company)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => onDeleteClick(company)}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
