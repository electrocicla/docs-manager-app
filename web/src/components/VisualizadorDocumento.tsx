import { FileText } from 'lucide-react';
import { Tarjeta } from './ui/Tarjeta';

/**
 * Componente Visualizador Documento
 * Responsabilidad: Mostrar preview de documentos
 * Nota: Implementación básica, se puede expandir con librerías como react-pdf
 */
export function VisualizadorDocumento({
  nombreArchivo,
  tipoMime,
}: {
  nombreArchivo: string;
  tipoMime: string;
}) {
  // Placeholder - en una implementación real, cargar y mostrar el documento
  return (
    <Tarjeta>
      <div className="flex items-center space-x-3">
        <FileText className="w-8 h-8 text-gray-400" />
        <div>
          <h3 className="font-medium">{nombreArchivo}</h3>
          <p className="text-sm text-gray-500">{tipoMime}</p>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">
          Visualización de documentos próximamente disponible
        </p>
      </div>
    </Tarjeta>
  );
}