import { ReactNode } from 'react';

interface Columna<T> {
  clave: keyof T | string;
  titulo: string;
  render?: (_valor: any, _item: T) => ReactNode;
  clase?: string;
}

interface PropiedadesTabla<T> {
  datos: T[];
  columnas: Columna<T>[];
  clavePrimaria?: keyof T;
  cargando?: boolean;
  mensajeVacio?: string;
}

/**
 * Componente Tabla reutilizable
 * Responsabilidad: Mostrar datos en formato tabular
 */
export function Tabla<T extends Record<string, any>>({
  datos,
  columnas,
  clavePrimaria = 'id' as keyof T,
  cargando = false,
  mensajeVacio = 'No hay datos para mostrar',
}: PropiedadesTabla<T>) {
  if (cargando) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (datos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {mensajeVacio}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columnas.map((columna, index) => (
              <th
                key={String(columna.clave) || index}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${columna.clase || ''}`}
              >
                {columna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {datos.map((item, index) => (
            <tr key={item[clavePrimaria] || index} className="hover:bg-gray-50">
              {columnas.map((columna, colIndex) => {
                const valor = item[columna.clave as keyof T];
                const contenido = columna.render
                  ? columna.render(valor, item)
                  : String(valor || '');

                return (
                  <td
                    key={String(columna.clave) || colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${columna.clase || ''}`}
                  >
                    {contenido}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}