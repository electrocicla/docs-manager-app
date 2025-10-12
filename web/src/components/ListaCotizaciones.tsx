import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, Check, X, User } from 'lucide-react';
import { Cotizacion, EstadoCotizacion } from '../types';
import { servicioTrabajos } from '../api/servicio-trabajos';
import { Tarjeta } from './ui/Tarjeta';
import { Boton } from './ui/Boton';
import { Etiqueta } from './ui/Etiqueta';

interface PropiedadesListaCotizaciones {
  cotizaciones: Cotizacion[];
  esCliente?: boolean;
  alAceptarCotizacion?: (_cotizacionId: string) => void;
  alRechazarCotizacion?: (_cotizacionId: string) => void;
  cargando?: boolean;
}

/**
 * Componente Lista de Cotizaciones
 * Responsabilidad: Mostrar y gestionar cotizaciones de un trabajo
 */
export function ListaCotizaciones({
  cotizaciones,
  esCliente = false,
  alAceptarCotizacion,
  alRechazarCotizacion,
  cargando = false,
}: PropiedadesListaCotizaciones) {
  const [aceptando, setAceptando] = useState<string | null>(null);
  const [rechazando, setRechazando] = useState<string | null>(null);

  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const obtenerColorEstado = (estado: EstadoCotizacion) => {
    switch (estado) {
      case 'ACCEPTED':
        return 'green';
      case 'REJECTED':
        return 'gray';
      default:
        return 'yellow';
    }
  };

  const obtenerEtiquetaEstado = (estado: EstadoCotizacion) => {
    switch (estado) {
      case 'ACCEPTED':
        return 'Aceptada';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  };

  const manejarAceptar = async (cotizacionId: string) => {
    if (!alAceptarCotizacion) return;

    setAceptando(cotizacionId);
    try {
      await alAceptarCotizacion(cotizacionId);
    } finally {
      setAceptando(null);
    }
  };

  const manejarRechazar = async (cotizacionId: string) => {
    if (!alRechazarCotizacion) return;

    setRechazando(cotizacionId);
    try {
      await alRechazarCotizacion(cotizacionId);
    } finally {
      setRechazando(null);
    }
  };

  if (cotizaciones.length === 0) {
    return (
      <Tarjeta>
        <p className="text-gray-600 text-center py-8">
          No hay cotizaciones disponibles
        </p>
      </Tarjeta>
    );
  }

  return (
    <div className="space-y-4">
      {cotizaciones.map((cotizacion) => (
        <Tarjeta key={cotizacion.id}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  Profesional #{cotizacion.professional_id}
                </p>
                <p className="text-sm text-gray-500">
                  {formatearFecha(cotizacion.created_at)}
                </p>
              </div>
            </div>
            <Etiqueta
              texto={obtenerEtiquetaEstado(cotizacion.status)}
              color={obtenerColorEstado(cotizacion.status)}
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {servicioTrabajos.formatearMonto(cotizacion.amount)} {cotizacion.currency}
              </span>
            </div>
            {cotizacion.message && (
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                {cotizacion.message}
              </p>
            )}
          </div>

          {esCliente && cotizacion.status === 'PENDING' && (
            <div className="flex space-x-2">
              <Boton
                onClick={() => manejarAceptar(cotizacion.id)}
                variante="primary"
                cargando={aceptando === cotizacion.id}
                disabled={cargando}
              >
                <Check className="w-4 h-4 mr-2" />
                Aceptar
              </Boton>
              <Boton
                onClick={() => manejarRechazar(cotizacion.id)}
                variante="danger"
                cargando={rechazando === cotizacion.id}
                disabled={cargando}
              >
                <X className="w-4 h-4 mr-2" />
                Rechazar
              </Boton>
            </div>
          )}
        </Tarjeta>
      ))}
    </div>
  );
}