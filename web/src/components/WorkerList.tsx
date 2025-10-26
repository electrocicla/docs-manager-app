import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, User } from 'lucide-react';
import { WorkerCard } from './WorkerCard';
import type { Worker } from '../types/company';
import { stripRutFormatting } from '../utils/rut';

interface WorkerListProps {
  workers: Worker[];
  loading: boolean;
  companyId?: string;
  onCreateClick: () => void;
  onEditClick: (worker: Worker) => void;
  onDeleteClick: (worker: Worker) => void;
}

export default function WorkerList({
  workers,
  loading,
  companyId,
  onCreateClick,
  onEditClick,
  onDeleteClick,
}: WorkerListProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Filtrar y buscar trabajadores
  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      // Filtro de estado
      if (statusFilter !== 'ALL' && worker.status !== statusFilter) {
        return false;
      }

      // Búsqueda por nombre, RUT, email, puesto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const normalizedQuery = stripRutFormatting(searchQuery).toLowerCase();
        const fullName = `${worker.first_name} ${worker.last_name}`.toLowerCase();
        const workerRutDigits = stripRutFormatting(worker.rut).toLowerCase();
        return (
          fullName.includes(query) ||
          worker.rut.toLowerCase().includes(query) ||
          (normalizedQuery.length > 0 && workerRutDigits.includes(normalizedQuery)) ||
          worker.email?.toLowerCase().includes(query) ||
          worker.job_title?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [workers, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <User className="w-8 h-8 text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trabajadores</h2>
          <p className="text-gray-600 mt-1">
            {filteredWorkers.length} {filteredWorkers.length === 1 ? 'trabajador' : 'trabajadores'}
            {statusFilter !== 'ALL' && ` (${statusFilter === 'ACTIVE' ? 'Activos' : 'Inactivos'})`}
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Trabajador</span>
        </button>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT, email, puesto..."
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
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'ACTIVE'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'INACTIVE'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Inactivos
          </button>
        </div>
      </div>

      {/* Lista de Trabajadores */}
      {filteredWorkers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            {workers.length === 0
              ? 'No hay trabajadores en esta empresa aún'
              : 'No hay trabajadores que coincidan con tu búsqueda'}
          </p>
          {workers.length === 0 && (
            <button
              onClick={onCreateClick}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar primer trabajador</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map(worker => (
            <div key={worker.id} className="relative group">
              <div
                onClick={() => companyId && navigate(`/company/${companyId}/worker/${worker.id}`)}
                className="cursor-pointer"
              >
                <WorkerCard
                  worker={worker}
                  onSelect={() => {}}
                />
              </div>
              
              {/* Acciones rápidas en hover */}
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4 space-x-2">
                <button
                  onClick={() => onEditClick(worker)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => onDeleteClick(worker)}
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
