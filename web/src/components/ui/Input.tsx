import { InputHTMLAttributes } from 'react';

interface PropiedadesInput extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Componente Input reutilizable
 * Responsabilidad: Renderizar campos de entrada con validación
 */
export function Input({
  label,
  error,
  className = '',
  ...props
}: PropiedadesInput) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`input ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
