import { ReactNode } from 'react';

interface PropiedadesTarjeta {
  children: ReactNode;
  titulo?: string;
  className?: string;
}

/**
 * Componente Tarjeta reutilizable
 * Responsabilidad: Contenedor con estilos consistentes
 */
export function Tarjeta({ children, titulo, className = '' }: PropiedadesTarjeta) {
  return (
    <div className={`card ${className}`}>
      {titulo && (
        <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
      )}
      {children}
    </div>
  );
}
