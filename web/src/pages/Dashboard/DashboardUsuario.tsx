import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTrabajos } from '../../hooks/useTrabajos';
import { Boton } from '../../components/ui/Boton';
import { Tarjeta } from '../../components/ui/Tarjeta';
import { TarjetaTrabajo } from '../../components/TarjetaTrabajo';
import { Plus, LogOut } from 'lucide-react';

export default function DashboardUsuario() {
  const { usuario, cerrarSesion } = useAuth();
  const { trabajos, cargando, cargarTrabajos } = useTrabajos();
  const navigate = useNavigate();

  useEffect(() => {
    cargarTrabajos();
  }, [cargarTrabajos]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mi Dashboard</h1>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Mis Trabajos</h2>
          <Boton onClick={() => navigate('/crear-trabajo')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Trabajo
          </Boton>
        </div>

        {cargando ? (
          <Tarjeta>
            <p className="text-gray-600 text-center py-8">Cargando trabajos...</p>
          </Tarjeta>
        ) : trabajos.length === 0 ? (
          <Tarjeta>
            <p className="text-gray-600 text-center py-8">
              No tienes trabajos aún. ¡Crea uno para comenzar!
            </p>
          </Tarjeta>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trabajos.map(trabajo => (
              <TarjetaTrabajo
                key={trabajo.id}
                trabajo={trabajo}
                alHacerClic={() => navigate(`/trabajo/${trabajo.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}