import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTrabajos } from '../../hooks/useTrabajos';
import { Boton } from '../../components/ui/Boton';
import { Tarjeta } from '../../components/ui/Tarjeta';
import { Tabla } from '../../components/ui/Tabla';
import { FiltroEstado } from '../../components/ui/FiltroEstado';
import { DashboardSidebar } from '../../components/DashboardSidebar';
import { LogOut, Users, Briefcase, TrendingUp, FileCheck } from 'lucide-react';
import { EstadoTrabajo } from '../../types';
import { Link } from 'react-router-dom';

export default function DashboardAdmin() {
  const { usuario, cerrarSesion } = useAuth();
  const { trabajos, cargando, cargarTrabajos } = useTrabajos();
  const [filtroEstado, setFiltroEstado] = useState<EstadoTrabajo | undefined>();

  useEffect(() => {
    cargarTrabajos({ status: filtroEstado });
  }, [cargarTrabajos, filtroEstado]);

  const trabajosFiltrados = filtroEstado
    ? trabajos.filter(trabajo => trabajo.status === filtroEstado)
    : trabajos;

  const estadisticas = {
    totalTrabajos: trabajos.length,
    trabajosActivos: trabajos.filter(t => t.status !== 'FINALIZADO').length,
    trabajosFinalizados: trabajos.filter(t => t.status === 'FINALIZADO').length,
    // En una implementación real, obtendrías usuarios de una API
    totalUsuarios: 0,
  };

  const columnasTrabajos = [
    {
      clave: 'title',
      titulo: 'Título',
    },
    {
      clave: 'status',
      titulo: 'Estado',
      render: (valor: string) => {
        const etiqueta = {
          'POR_REVISAR': 'Por Revisar',
          'REVISION_EN_PROGRESO': 'Revisión en Progreso',
          'COTIZACION': 'Cotización',
          'TRABAJO_EN_PROGRESO': 'Trabajo en Progreso',
          'FINALIZADO': 'Finalizado',
        }[valor] || valor;
        return <span className="capitalize">{etiqueta}</span>;
      },
    },
    {
      clave: 'created_at',
      titulo: 'Creado',
      render: (valor: string) => new Date(valor).toLocaleDateString('es-ES'),
    },
    {
      clave: 'quote_amount',
      titulo: 'Cotización',
      render: (valor: number) => valor ? `$${valor.toLocaleString()}` : '-',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrador</h1>
              <p className="text-sm text-gray-600 mt-1">Panel de control administrativo</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hola, <span className="font-semibold">{usuario?.full_name}</span></span>
              <Boton variante="secondary" onClick={cerrarSesion}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Boton>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link to="/admin/documents" className="block">
            <Tarjeta className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
              <div className="flex items-center">
                <FileCheck className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-lg font-bold text-gray-900">Revisar Documentos</p>
                  <p className="text-sm text-gray-600">Panel de aprobación</p>
                </div>
              </div>
            </Tarjeta>
          </Link>
          <Link to="/companies" className="block">
            <Tarjeta className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-lg font-bold text-gray-900">Gestionar Empresas</p>
                  <p className="text-sm text-gray-600">Ver todas las empresas</p>
                </div>
              </div>
            </Tarjeta>
          </Link>
          <Tarjeta className="border-l-4 border-purple-500">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-lg font-bold text-gray-900">Usuarios</p>
                <p className="text-sm text-gray-600">Total usuarios registrados</p>
              </div>
            </div>
          </Tarjeta>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Tarjeta>
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{estadisticas.totalTrabajos}</p>
                <p className="text-gray-600">Total Trabajos</p>
              </div>
            </div>
          </Tarjeta>

          <Tarjeta>
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{estadisticas.trabajosActivos}</p>
                <p className="text-gray-600">Trabajos Activos</p>
              </div>
            </div>
          </Tarjeta>

          <Tarjeta>
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{estadisticas.trabajosFinalizados}</p>
                <p className="text-gray-600">Finalizados</p>
              </div>
            </div>
          </Tarjeta>

          <Tarjeta>
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{estadisticas.totalUsuarios}</p>
                <p className="text-gray-600">Total Usuarios</p>
              </div>
            </div>
          </Tarjeta>
        </div>

        {/* Gestión de Trabajos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Gestión de Trabajos</h2>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <FiltroEstado
                estadoSeleccionado={filtroEstado}
                alSeleccionarEstado={(estado) => setFiltroEstado(estado as EstadoTrabajo | undefined)}
              />
            </div>

            <Tabla
              datos={trabajosFiltrados}
              columnas={columnasTrabajos}
              cargando={cargando}
              mensajeVacio="No hay trabajos para mostrar"
            />
          </div>
        </div>
        </main>
      </div>
    </div>
  );
}