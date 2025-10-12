import { Loader } from 'lucide-react';

interface PropiedadesCargadorSpinner {
  tamanio?: 'sm' | 'md' | 'lg';
  color?: string;
  mensaje?: string;
}

/**
 * Componente Cargador Spinner
 * Responsabilidad: Mostrar indicador de carga
 */
export function CargadorSpinner({
  tamanio = 'md',
  color = 'text-primary-600',
  mensaje,
}: PropiedadesCargadorSpinner) {
  const clasesTamanio = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader className={`animate-spin ${clasesTamanio[tamanio]} ${color}`} />
      {mensaje && (
        <p className="mt-2 text-sm text-gray-600">{mensaje}</p>
      )}
    </div>
  );
}