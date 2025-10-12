import { Trabajo } from '../types';
import { TarjetaTrabajo } from './TarjetaTrabajo';
import { CargadorSpinner } from './ui/CargadorSpinner';

interface PropiedadesListaTrabajos {
  trabajos: Trabajo[];
  cargando?: boolean;
  alSeleccionarTrabajo?: (_trabajo: Trabajo) => void;
  mensajeVacio?: string;
}

/**
 * Componente Lista Trabajos
 * Responsabilidad: Mostrar lista de trabajos en grid
 */
export function ListaTrabajos({
  trabajos,
  cargando = false,
  alSeleccionarTrabajo,
  mensajeVacio = 'No hay trabajos para mostrar',
}: PropiedadesListaTrabajos) {
  if (cargando) {
    return (
      <div className="flex justify-center py-8">
        <CargadorSpinner mensaje="Cargando trabajos..." />
      </div>
    );
  }

  if (trabajos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{mensajeVacio}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {trabajos.map(trabajo => (
        <TarjetaTrabajo
          key={trabajo.id}
          trabajo={trabajo}
          alHacerClic={() => alSeleccionarTrabajo?.(trabajo)}
        />
      ))}
    </div>
  );
}