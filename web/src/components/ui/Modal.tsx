import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface PropiedadesModal {
  estaAbierto: boolean;
  alCerrar: () => void;
  titulo?: string;
  children: ReactNode;
  tamanio?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Componente Modal reutilizable
 * Responsabilidad: Mostrar contenido en una ventana modal
 */
export function Modal({
  estaAbierto,
  alCerrar,
  titulo,
  children,
  tamanio = 'md',
}: PropiedadesModal) {
  useEffect(() => {
    const manejarEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        alCerrar();
      }
    };

    if (estaAbierto) {
      document.addEventListener('keydown', manejarEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', manejarEscape);
      document.body.style.overflow = 'unset';
    };
  }, [estaAbierto, alCerrar]);

  if (!estaAbierto) return null;

  const clasesTamanio = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={alCerrar}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl w-full mx-4 ${clasesTamanio[tamanio]} max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        {titulo && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
            <button
              onClick={alCerrar}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}