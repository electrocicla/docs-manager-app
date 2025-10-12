import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Download } from 'lucide-react';
import { Archivo } from '../types';
import { servicioArchivos } from '../api/servicio-archivos';
import { Tarjeta } from './ui/Tarjeta';
import { Boton } from './ui/Boton';

/**
 * Componente Historial Archivos
 * Responsabilidad: Mostrar versiones históricas de archivos
 */
export function HistorialArchivos({
  archivos,
  alDescargar,
}: {
  archivos: Archivo[];
  alDescargar?: (_archivo: Archivo) => void;
}) {
  const formatearFecha = (fecha: string) => {
    return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  if (archivos.length === 0) {
    return (
      <Tarjeta>
        <p className="text-gray-600 text-center py-4">
          No hay archivos en el historial
        </p>
      </Tarjeta>
    );
  }

  return (
    <div className="space-y-3">
      {archivos.map((archivo) => (
        <Tarjeta key={archivo.id}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">{archivo.filename}</p>
                <p className="text-sm text-gray-500">
                  Versión {archivo.version} • {servicioArchivos.formatearTamano(archivo.size)} • {formatearFecha(archivo.created_at)}
                </p>
              </div>
            </div>
            <Boton
              onClick={() => alDescargar?.(archivo)}
              variante="secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Boton>
          </div>
        </Tarjeta>
      ))}
    </div>
  );
}