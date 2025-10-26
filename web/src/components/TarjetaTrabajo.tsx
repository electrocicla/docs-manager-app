import React from 'react';
import { Calendar, User, FileText, DollarSign } from 'lucide-react';
import { Trabajo } from '../types';
import { servicioTrabajos } from '../api/servicio-trabajos';
import { Etiqueta } from './ui/Etiqueta';
import { Tarjeta } from './ui/Tarjeta';
import { formatDate } from '../utils/date';

interface PropiedadesTarjetaTrabajo {
  trabajo: Trabajo;
  alHacerClic?: () => void;
  acciones?: React.ReactNode;
}

/**
 * Componente Tarjeta de Trabajo
 * Responsabilidad: Mostrar información resumida de un trabajo
 */
export function TarjetaTrabajo({
  trabajo,
  alHacerClic,
  acciones,
}: PropiedadesTarjetaTrabajo) {
  const etiquetaEstado = servicioTrabajos.obtenerEtiquetaEstado(trabajo.status);
  const colorEstado = servicioTrabajos.obtenerColorEstado(trabajo.status);

  return (
    <div
      className={`cursor-pointer transition-shadow hover:shadow-md ${alHacerClic ? 'cursor-pointer' : ''}`}
      onClick={alHacerClic}
    >
      <Tarjeta>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {trabajo.title}
            </h3>
            {trabajo.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {trabajo.description}
              </p>
            )}
          </div>
          <Etiqueta texto={etiquetaEstado} color={colorEstado} />
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Creado: {formatDate(trabajo.created_at)}</span>
          </div>

          {trabajo.professional_id && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Asignado a profesional</span>
            </div>
          )}

          {trabajo.quote_amount && (
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>
                {servicioTrabajos.formatearMonto(trabajo.quote_amount)} {trabajo.quote_currency}
              </span>
            </div>
          )}

          {trabajo.accepted_at && (
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Aceptado: {formatDate(trabajo.accepted_at)}</span>
            </div>
          )}

          {trabajo.finished_at && (
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Finalizado: {formatDate(trabajo.finished_at)}</span>
            </div>
          )}
        </div>

        {acciones && (
          <div className="mt-4 flex justify-end space-x-2">
            {acciones}
          </div>
        )}
      </Tarjeta>
    </div>
  );
}
