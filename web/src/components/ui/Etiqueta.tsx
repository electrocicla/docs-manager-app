import { EtiquetaColor } from '../../types/ui';

interface PropiedadesEtiqueta {
  texto: string;
  color?: EtiquetaColor;
}

/**
 * Componente Etiqueta/Badge
 * Responsabilidad: Mostrar estados o categorías con colores
 */
export function Etiqueta({ texto, color = 'gray' }: PropiedadesEtiqueta) {
  const claseColor = `badge-${color}`;

  return (
    <span className={claseColor}>
      {texto}
    </span>
  );
}
