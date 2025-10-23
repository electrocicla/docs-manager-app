import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';
import DashboardUsuario from './pages/Dashboard/DashboardUsuario';
import DashboardProfesional from './pages/Dashboard/DashboardProfesional';
import DashboardAdmin from './pages/Dashboard/DashboardAdmin';
import DetalleTrabajo from './pages/DetalleTrabajo';
import CrearTrabajo from './pages/CrearTrabajo';
import CotizarTrabajo from './pages/CotizarTrabajo';
import Perfil from './pages/Perfil';

// New Pages - SR Manager
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import AdminDocumentReviewPage from './pages/AdminDocumentReviewPage';

// Component for protected routes
function RutaProtegida({ 
  children, 
  rolesPermitidos 
}: { 
  children: React.ReactNode;
  rolesPermitidos?: string[];
}) {
  const { estaAutenticado, usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && usuario && !rolesPermitidos.includes(usuario.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Rutas protegidas - Usuario */}
      <Route
        path="/dashboard"
        element={
          <RutaProtegida rolesPermitidos={['user']}>
            <DashboardUsuario />
          </RutaProtegida>
        }
      />

      {/* Detalle de Trabajo */}
      <Route
        path="/trabajo/:id"
        element={
          <RutaProtegida>
            <DetalleTrabajo />
          </RutaProtegida>
        }
      />

      {/* Crear Trabajo */}
      <Route
        path="/crear-trabajo"
        element={
          <RutaProtegida rolesPermitidos={['user']}>
            <CrearTrabajo />
          </RutaProtegida>
        }
      />

      {/* Cotizar Trabajo */}
      <Route
        path="/trabajo/:id/cotizar"
        element={
          <RutaProtegida rolesPermitidos={['professional']}>
            <CotizarTrabajo />
          </RutaProtegida>
        }
      />

      {/* Perfil */}
      <Route
        path="/perfil"
        element={
          <RutaProtegida>
            <Perfil />
          </RutaProtegida>
        }
      />

      {/* Rutas protegidas - Profesional */}
      <Route
        path="/profesional"
        element={
          <RutaProtegida rolesPermitidos={['professional']}>
            <DashboardProfesional />
          </RutaProtegida>
        }
      />

      {/* Rutas protegidas - Admin */}
      <Route
        path="/admin"
        element={
          <RutaProtegida rolesPermitidos={['admin']}>
            <DashboardAdmin />
          </RutaProtegida>
        }
      />

      {/* SR Manager Routes */}
      <Route
        path="/companies"
        element={
          <RutaProtegida>
            <CompaniesPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/company/:companyId"
        element={
          <RutaProtegida>
            <CompanyDetailsPage />
          </RutaProtegida>
        }
      />

      <Route
        path="/company/:companyId/worker/:workerId"
        element={
          <RutaProtegida>
            <WorkerProfilePage />
          </RutaProtegida>
        }
      />

      <Route
        path="/admin/documents"
        element={
          <RutaProtegida rolesPermitidos={['admin']}>
            <AdminDocumentReviewPage />
          </RutaProtegida>
        }
      />

      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
