import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompanies, useWorkers } from '../hooks/useCompany';
import WorkerList from '../components/WorkerList';
import WorkerForm from '../components/WorkerForm';
import { DashboardLayout } from '../components/DashboardLayout';
import { AlertCircle, Users } from 'lucide-react';
import type { Company, WorkerModel, WorkerInput } from '../types/company';
import { formatRut } from '../utils/rut';

export default function CompanyDetailsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { companies, loading: companiesLoading, fetchCompanies } = useCompanies();
  const { workers, loading: workersLoading, createWorker, updateWorker, deleteWorker } = useWorkers(companyId || '');

  const [company, setCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerModel | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<WorkerModel | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  // Cargar empresas al montar si no están cargadas
  useEffect(() => {
    if (companies.length === 0 && !companiesLoading) {
      fetchCompanies().catch(err => {
        console.error('Error al cargar empresas:', err);
        setError('No se pudieron cargar las empresas');
      });
    }
  }, []);

  // Buscar empresa y cargar trabajadores
  useEffect(() => {
    if (companyId && companies.length > 0) {
      const found = companies.find(c => c.id === companyId);
      if (found) {
        setCompany(found);
      } else {
        setError('Empresa no encontrada');
        setTimeout(() => navigate('/companies'), 2000);
      }
    }
  }, [companyId, companies, navigate]);

  const handleCreateClick = () => {
    setEditingWorker(undefined);
    setShowForm(true);
    setError(undefined);
  };

  const handleEditClick = (worker: WorkerModel) => {
    setEditingWorker(worker);
    setShowForm(true);
    setError(undefined);
  };

  const handleFormSubmit = async (data: WorkerInput) => {
    try {
      setError(undefined);
      if (editingWorker) {
        await updateWorker(editingWorker.id, data);
        setSuccess('Trabajador actualizado exitosamente');
      } else {
        await createWorker(data);
        setSuccess('Trabajador creado exitosamente');
      }
      setShowForm(false);
      setEditingWorker(undefined);
      setTimeout(() => setSuccess(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el trabajador');
    }
  };

  const handleDeleteClick = (worker: WorkerModel) => {
    setDeleteConfirm(worker);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setError(undefined);
      await deleteWorker(deleteConfirm.id);
      setSuccess('Trabajador eliminado exitosamente');
      setDeleteConfirm(undefined);
      setTimeout(() => setSuccess(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el trabajador');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingWorker(undefined);
    setError(undefined);
  };

  if (!company) {
    return (
      <DashboardLayout
        title="Cargando Empresa"
        subtitle="Por favor espere..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando empresa...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`${company.name} - Detalles`}
      subtitle={`RUT: ${formatRut(company.rut || '')} • ${company.employees_count || 0} empleados`}
    >
      {/* Información de la empresa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">RUT</p>
            <p className="font-semibold text-gray-900">{company.rut ? formatRut(company.rut) : '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Empleados</p>
            <p className="font-semibold text-gray-900">{company.employees_count || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ciudad</p>
            <p className="font-semibold text-gray-900">{company.city}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Región</p>
            <p className="font-semibold text-gray-900">{company.region || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900 truncate">{company.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Teléfono</p>
            <p className="font-semibold text-gray-900">{company.phone || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Industria</p>
            <p className="font-semibold text-gray-900">{company.industry || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sitio Web</p>
            <p className="font-semibold text-gray-900 truncate">
              {company.website ? (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {company.website}
                </a>
              ) : (
                '-'
              )}
            </p>
          </div>
        </div>

        {/* Descripción */}
        {company.description && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            <p className="text-sm text-gray-600">Descripción</p>
            <p className="text-gray-900 mt-1">{company.description}</p>
          </div>
        )}

        {/* Dirección */}
        {company.address && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            <p className="text-sm text-gray-600">Dirección</p>
            <p className="text-gray-900 mt-1">{company.address}</p>
          </div>
        )}
      </div>

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

        {/* Trabajadores Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Trabajadores</h2>
          </div>

          <WorkerList
            workers={workers}
            loading={workersLoading}
            companyId={companyId}
            onCreateClick={handleCreateClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <WorkerForm
            companyId={companyId || ''}
            worker={editingWorker}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={workersLoading}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                ¿Eliminar trabajador?
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong> y todos sus documentos asociados? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(undefined)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  disabled={workersLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  disabled={workersLoading}
                >
                  {workersLoading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
