import { EstadoTrabajo } from '../../types';
import { servicioTrabajos } from '../../api/servicio-trabajos';

interface PropiedadesFiltroEstado {
  estadoSeleccionado?: string;
  alSeleccionarEstado: (_estado: string | undefined) => void;
}

/**
 * Componente Filtro Estado
 * Responsabilidad: Filtrar elementos por estado
 */
export function FiltroEstado({
  estadoSeleccionado,
  alSeleccionarEstado,
}: PropiedadesFiltroEstado) {
  const estados: EstadoTrabajo[] = [
    'POR_REVISAR',
    'REVISION_EN_PROGRESO',
    'COTIZACION',
    'TRABAJO_EN_PROGRESO',
    'FINALIZADO',
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => alSeleccionarEstado(undefined)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          !estadoSeleccionado
            ? 'bg-primary-100 text-primary-800'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Todos
      </button>

      {estados.map((estado) => {
        const etiqueta = servicioTrabajos.obtenerEtiquetaEstado(estado);
        const color = servicioTrabajos.obtenerColorEstado(estado);
        const esSeleccionado = estadoSeleccionado === estado;

        return (
          <button
            key={estado}
            onClick={() => alSeleccionarEstado(estado)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              esSeleccionado
                ? `bg-${color}-100 text-${color}-800`
                : `bg-${color}-50 text-${color}-700 hover:bg-${color}-100`
            }`}
          >
            {etiqueta}
          </button>
        );
      })}
    </div>
  );
}