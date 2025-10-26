import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCompany } from '../hooks/useCompanyManager';
import CompanyList from '../components/CompanyList';
import CompanyForm from '../components/CompanyForm';
import { Boton } from '../components/ui/Boton';
import { LogOut, ArrowLeft, AlertCircle, Shield } from 'lucide-react';
import type { Company, CompanyInput } from '../types/company';

export default function CompaniesPage() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { companies, loading, createCompany, updateCompany, deleteCompany } = useCompany();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<Company | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  // Cargar empresas al montar
  useEffect(() => {
    // Las empresas se cargan automáticamente en useCompany
  }, []);

  const handleCreateClick = () => {
    setEditingCompany(undefined);
    setShowForm(true);
    setError(undefined);
  };

  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
    setShowForm(true);
    setError(undefined);
  };

  const handleFormSubmit = async (data: CompanyInput) => {
    try {
      setError(undefined);
      if (editingCompany) {
        await updateCompany(editingCompany.id, data);
        setSuccess('Empresa actualizada exitosamente');
      } else {
        await createCompany(data);
        setSuccess('Empresa creada exitosamente');
      }
      setShowForm(false);
      setEditingCompany(undefined);
      setTimeout(() => setSuccess(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la empresa');
    }
  };

  const handleDeleteClick = (company: Company) => {
    setDeleteConfirm(company);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    
    try {
      setError(undefined);
      await deleteCompany(deleteConfirm.id);
      setSuccess('Empresa eliminada exitosamente');
      setDeleteConfirm(undefined);
      setTimeout(() => setSuccess(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la empresa');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCompany(undefined);
    setError(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Volver al dashboard"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Empresas</h1>
                <p className="text-gray-600 mt-1">Manage your companies and workers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back</p>
                <p className="font-semibold text-gray-900">{usuario?.full_name}</p>
              </div>
              {usuario?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/documents')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}
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

        {/* Company List */}
        <CompanyList
          companies={companies}
          loading={loading}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />

        {/* Create/Edit Form Modal */}
        {showForm && (
          <CompanyForm
            company={editingCompany}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                ¿Eliminar empresa?
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar <strong>{deleteConfirm.name}</strong>? Esta acción marcará la empresa como inactiva.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(undefined)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
