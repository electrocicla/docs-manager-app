import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, User } from 'lucide-react';
import { Cotizacion } from '../types';
import { servicioTrabajos } from '../api/servicio-trabajos';
import { Tarjeta } from './ui/Tarjeta';
import { Etiqueta } from './ui/Etiqueta';

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
  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'ACCEPTED':
        return 'green';
      case 'REJECTED':
        return 'gray';
      default:
        return 'yellow';
    }
  };

  const obtenerEtiquetaEstado = (estado: string) => {
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
              {formatearFecha(cotizacion.created_at)}
            </p>
          </div>
        </div>
        <Etiqueta
          texto={obtenerEtiquetaEstado(cotizacion.status)}
          color={obtenerColorEstado(cotizacion.status) as any}
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