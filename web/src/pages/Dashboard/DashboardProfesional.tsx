import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTrabajos } from '../../hooks/useTrabajos';
import { Boton } from '../../components/ui/Boton';
import { Tarjeta } from '../../components/ui/Tarjeta';
import { TarjetaTrabajo } from '../../components/TarjetaTrabajo';
import { FiltroEstado } from '../../components/ui/FiltroEstado';
import { LogOut, Briefcase } from 'lucide-react';
import { EstadoTrabajo } from '../../types';

export default function DashboardProfesional() {
  const { usuario, cerrarSesion } = useAuth();
  const { trabajos, cargando, cargarTrabajos } = useTrabajos();
  const navigate = useNavigate();
  const [filtroEstado, setFiltroEstado] = useState<EstadoTrabajo | undefined>();

  useEffect(() => {
    cargarTrabajos({ status: filtroEstado });
  }, [cargarTrabajos, filtroEstado]);

  const trabajosFiltrados = filtroEstado
    ? trabajos.filter(trabajo => trabajo.status === filtroEstado)
    : trabajos;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Profesional</h1>
          <div className="flex items-center space-x-4">
            <span>Hola, {usuario?.full_name}</span>
            <Boton variante="secondary" onClick={cerrarSesion}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Boton>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Trabajos Disponibles</h2>
          <FiltroEstado
            estadoSeleccionado={filtroEstado}
            alSeleccionarEstado={(estado) => setFiltroEstado(estado as EstadoTrabajo | undefined)}
          />
        </div>

        {cargando ? (
          <Tarjeta>
            <p className="text-gray-600 text-center py-8">Cargando trabajos...</p>
          </Tarjeta>
        ) : trabajosFiltrados.length === 0 ? (
          <Tarjeta>
            <p className="text-gray-600 text-center py-8">
              {filtroEstado
                ? `No hay trabajos en estado "${filtroEstado}"`
                : 'No hay trabajos disponibles'
              }
            </p>
          </Tarjeta>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trabajosFiltrados.map(trabajo => (
              <TarjetaTrabajo
                key={trabajo.id}
                trabajo={trabajo}
                alHacerClic={() => navigate(`/trabajo/${trabajo.id}`)}
                acciones={
                  trabajo.status === 'COTIZACION' && !trabajo.professional_id ? (
                    <Boton
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trabajo/${trabajo.id}/cotizar`);
                      }}
                      variante="primary"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Crear Cotización
                    </Boton>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}