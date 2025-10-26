import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCompanies, useWorkers } from '../hooks/useCompany';
import WorkerList from '../components/WorkerList';
import WorkerForm from '../components/WorkerForm';
import { Boton } from '../components/ui/Boton';
import { ArrowLeft, LogOut, AlertCircle, Building2, Users } from 'lucide-react';
import type { Company, Worker, WorkerInput } from '../types/company';
import { formatRut } from '../utils/rut';

export default function CompanyDetailsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { companies } = useCompanies();
  const { workers, loading: workersLoading, createWorker, deleteWorker } = useWorkers(companyId || '');

  const [company, setCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Worker | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

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

  const handleEditClick = (worker: Worker) => {
    setEditingWorker(worker);
    setShowForm(true);
    setError(undefined);
  };

  const handleFormSubmit = async (data: WorkerInput) => {
    try {
      setError(undefined);
      if (editingWorker) {
        // TODO: Implementar updateWorker en hook
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

  const handleDeleteClick = (worker: Worker) => {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando empresa...</p>
        </div>
      </div>
    );
  }

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
                title="Volver a empresas"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <Building2 className="inline w-8 h-8 mr-2 text-primary-600" />
                  {company.name}
                </h1>
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

          {/* Información de la empresa */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
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
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900 truncate">{company.email || '-'}</p>
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
                ¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong>? Esta acción marcará al trabajador como inactivo.
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
      </main>
    </div>
  );
}
