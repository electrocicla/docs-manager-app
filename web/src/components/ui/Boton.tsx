import { ButtonHTMLAttributes } from 'react';

interface PropiedadesBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primary' | 'secondary' | 'danger';
  cargando?: boolean;
}

/**
 * Componente Botón reutilizable
 * Responsabilidad: Renderizar botones con estilos consistentes
 */
export function Boton({
  children,
  variante = 'primary',
  cargando = false,
  disabled,
  className = '',
  ...props
}: PropiedadesBoton) {
  const claseBase = 'btn';
  const claseVariante = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }[variante];

  return (
    <button
      className={`${claseBase} ${claseVariante} ${className} ${
        (disabled || cargando) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando ? 'Cargando...' : children}
    </button>
  );
}
