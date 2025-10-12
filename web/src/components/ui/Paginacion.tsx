import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Boton } from './Boton';

interface PropiedadesPaginacion {
  paginaActual: number;
  totalPaginas: number;
  alCambiarPagina: (_pagina: number) => void;
  mostrarNumeros?: boolean;
  maximoBotonesVisibles?: number;
}

/**
 * Componente Paginación
 * Responsabilidad: Navegación entre páginas de datos
 */
export function Paginacion({
  paginaActual,
  totalPaginas,
  alCambiarPagina,
  mostrarNumeros = true,
  maximoBotonesVisibles = 5,
}: PropiedadesPaginacion) {
  if (totalPaginas <= 1) return null;

  const generarNumerosPagina = () => {
    const paginas: (number | string)[] = [];
    const mitad = Math.floor(maximoBotonesVisibles / 2);

    let inicio = Math.max(1, paginaActual - mitad);
    let fin = Math.min(totalPaginas, inicio + maximoBotonesVisibles - 1);

    if (fin - inicio + 1 < maximoBotonesVisibles) {
      inicio = Math.max(1, fin - maximoBotonesVisibles + 1);
    }

    // Agregar primera página y puntos suspensivos si es necesario
    if (inicio > 1) {
      paginas.push(1);
      if (inicio > 2) {
        paginas.push('...');
      }
    }

    // Agregar páginas del medio
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    // Agregar última página y puntos suspensivos si es necesario
    if (fin < totalPaginas) {
      if (fin < totalPaginas - 1) {
        paginas.push('...');
      }
      paginas.push(totalPaginas);
    }

    return paginas;
  };

  const paginas = mostrarNumeros ? generarNumerosPagina() : [];

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <Boton
          variante="secondary"
          onClick={() => alCambiarPagina(paginaActual - 1)}
          disabled={paginaActual <= 1}
        >
          Anterior
        </Boton>
        <Boton
          variante="secondary"
          onClick={() => alCambiarPagina(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
        >
          Siguiente
        </Boton>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Página <span className="font-medium">{paginaActual}</span> de{' '}
            <span className="font-medium">{totalPaginas}</span>
          </p>
        </div>

        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <Boton
              variante="secondary"
              onClick={() => alCambiarPagina(paginaActual - 1)}
              disabled={paginaActual <= 1}
              className="rounded-l-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </Boton>

            {mostrarNumeros && paginas.map((pagina, index) => {
              if (pagina === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }

              const numeroPagina = pagina as number;
              const esActual = numeroPagina === paginaActual;

              return (
                <button
                  key={numeroPagina}
                  onClick={() => alCambiarPagina(numeroPagina)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    esActual
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {numeroPagina}
                </button>
              );
            })}

            <Boton
              variante="secondary"
              onClick={() => alCambiarPagina(paginaActual + 1)}
              disabled={paginaActual >= totalPaginas}
              className="rounded-r-md"
            >
              <ChevronRight className="w-4 h-4" />
            </Boton>
          </nav>
        </div>
      </div>
    </div>
  );
}