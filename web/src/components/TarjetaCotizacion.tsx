import React from 'react';
import { DollarSign, User } from 'lucide-react';
import { Cotizacion, EstadoCotizacion } from '../types';
import { servicioTrabajos } from '../api/servicio-trabajos';
import { Tarjeta } from './ui/Tarjeta';
import { Etiqueta } from './ui/Etiqueta';
import { formatDateTime } from '../utils/date';

interface PropiedadesTarjetaCotizacion {
  cotizacion: Cotizacion;
  acciones?: React.ReactNode;
}

/**
 * Componente Tarjeta Cotización
 * Responsabilidad: Mostrar información resumida de una cotización
 */
export function TarjetaCotizacion({
  cotizacion,
  acciones,
}: PropiedadesTarjetaCotizacion) {
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

  return (
    <Tarjeta>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">
              Profesional #{cotizacion.professional_id}
            </p>
            <p className="text-sm text-gray-500">
              {formatDateTime(cotizacion.created_at)}
            </p>
          </div>
        </div>
        <Etiqueta
          texto={obtenerEtiquetaEstado(cotizacion.status)}
          color={servicioTrabajos.obtenerColorEstado(cotizacion.status)}
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <span className="text-2xl font-bold text-gray-900">
            {servicioTrabajos.formatearMonto(cotizacion.amount)} {cotizacion.currency}
          </span>
        </div>
      </div>

      {cotizacion.message && (
        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg mb-4">
          {cotizacion.message}
        </p>
      )}

      {acciones && (
        <div className="flex justify-end space-x-2">
          {acciones}
        </div>
      )}
    </Tarjeta>
  );
}
