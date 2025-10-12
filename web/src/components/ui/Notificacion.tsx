import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type TipoNotificacion = 'success' | 'error' | 'warning' | 'info';

interface PropiedadesNotificacion {
  tipo: TipoNotificacion;
  titulo: string;
  mensaje?: string;
  duracion?: number;
  alCerrar?: () => void;
}

/**
 * Componente Notificación (Toast)
 * Responsabilidad: Mostrar mensajes temporales al usuario
 */
export function Notificacion({
  tipo,
  titulo,
  mensaje,
  duracion = 5000,
  alCerrar,
}: PropiedadesNotificacion) {
  const [estaVisible, setEstaVisible] = useState(true);

  useEffect(() => {
    if (duracion > 0) {
      const timer = setTimeout(() => {
        setEstaVisible(false);
        alCerrar?.();
      }, duracion);

      return () => clearTimeout(timer);
    }
  }, [duracion, alCerrar]);

  if (!estaVisible) return null;

  const configuraciones = {
    success: {
      icono: CheckCircle,
      clases: 'bg-green-50 border-green-200 text-green-800',
      iconoClases: 'text-green-400',
    },
    error: {
      icono: XCircle,
      clases: 'bg-red-50 border-red-200 text-red-800',
      iconoClases: 'text-red-400',
    },
    warning: {
      icono: AlertCircle,
      clases: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconoClases: 'text-yellow-400',
    },
    info: {
      icono: AlertCircle,
      clases: 'bg-blue-50 border-blue-200 text-blue-800',
      iconoClases: 'text-blue-400',
    },
  };

  const config = configuraciones[tipo];
  const Icono = config.icono;

  return (
    <div className={`flex items-start p-4 border rounded-lg shadow-lg ${config.clases}`}>
      <Icono className={`w-5 h-5 mt-0.5 mr-3 ${config.iconoClases}`} />
      <div className="flex-1">
        <h4 className="font-semibold">{titulo}</h4>
        {mensaje && <p className="mt-1 text-sm opacity-90">{mensaje}</p>}
      </div>
      <button
        onClick={() => {
          setEstaVisible(false);
          alCerrar?.();
        }}
        className="ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Contexto para manejar múltiples notificaciones
interface EstadoNotificaciones {
  notificaciones: Array<PropiedadesNotificacion & { id: string }>;
}

let estadoNotificaciones: EstadoNotificaciones = {
  notificaciones: [],
};

let listeners: Array<(_estado: EstadoNotificaciones) => void> = [];

const notificar = (notificacion: Omit<PropiedadesNotificacion, 'alCerrar'>) => {
  const id = Date.now().toString();
  const nuevaNotificacion = {
    ...notificacion,
    id,
    alCerrar: () => {
      estadoNotificaciones.notificaciones = estadoNotificaciones.notificaciones.filter(
        n => n.id !== id
      );
      listeners.forEach(listener => listener(estadoNotificaciones));
    },
  };

  estadoNotificaciones.notificaciones.push(nuevaNotificacion);
  listeners.forEach(listener => listener(estadoNotificaciones));
};

export const servicioNotificaciones = {
  success: (titulo: string, mensaje?: string) =>
    notificar({ tipo: 'success', titulo, mensaje }),
  error: (titulo: string, mensaje?: string) =>
    notificar({ tipo: 'error', titulo, mensaje }),
  warning: (titulo: string, mensaje?: string) =>
    notificar({ tipo: 'warning', titulo, mensaje }),
  info: (titulo: string, mensaje?: string) =>
    notificar({ tipo: 'info', titulo, mensaje }),
  suscribir: (listener: (_estado: EstadoNotificaciones) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  obtenerEstado: () => estadoNotificaciones,
};