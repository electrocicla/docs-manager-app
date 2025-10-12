import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicioTrabajos } from '../api/servicio-trabajos';
import { servicioArchivos } from '../api/servicio-archivos';
import { useAuth } from '../hooks/useAuth';
import { Tarjeta } from '../components/ui/Tarjeta';
import { Boton } from '../components/ui/Boton';
import { ListaCotizaciones } from '../components/ListaCotizaciones';
import { SubidorArchivos } from '../components/SubidorArchivos';
import { CargadorSpinner } from '../components/ui/CargadorSpinner';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { Trabajo, Archivo, Cotizacion } from '../types';

export default function DetalleTrabajo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aceptandoCotizacion, setAceptandoCotizacion] = useState(false);
  const [finalizandoTrabajo, setFinalizandoTrabajo] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDetalleTrabajo();
    }
  }, [id]);

  const cargarDetalleTrabajo = async () => {
    if (!id) return;

    try {
      const { job, files, quotes } = await servicioTrabajos.obtenerTrabajo(id);
      setTrabajo(job);
      setArchivos(files || []);
      setCotizaciones(quotes || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el trabajo');
    } finally {
      setCargando(false);
    }
  };

  const manejarAceptarCotizacion = async (cotizacionId: string) => {
    if (!id) return;

    setAceptandoCotizacion(true);
    try {
      await servicioTrabajos.aceptarCotizacion(id, { quote_id: cotizacionId });
      await cargarDetalleTrabajo(); // Recargar datos
    } catch (err: any) {
      setError(err.message || 'Error al aceptar la cotización');
    } finally {
      setAceptandoCotizacion(false);
    }
  };

  const manejarFinalizarTrabajo = async () => {
    if (!id) return;

    setFinalizandoTrabajo(true);
    try {
      await servicioTrabajos.finalizarTrabajo(id);
      await cargarDetalleTrabajo(); // Recargar datos
    } catch (err: any) {
      setError(err.message || 'Error al finalizar el trabajo');
    } finally {
      setFinalizandoTrabajo(false);
    }
  };

  const manejarDescargarArchivo = async (archivo: Archivo) => {
    try {
      await servicioArchivos.descargarArchivo(archivo.id, archivo.filename);
    } catch (err: any) {
      setError(err.message || 'Error al descargar el archivo');
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CargadorSpinner mensaje="Cargando trabajo..." />
      </div>
    );
  }

  if (!trabajo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Tarjeta>
          <p className="text-gray-600 text-center">Trabajo no encontrado</p>
        </Tarjeta>
      </div>
    );
  }

  const esCliente = usuario?.id === trabajo.user_id;
  const esProfesional = usuario?.id === trabajo.professional_id;
  const puedeCotizar = trabajo.status === 'COTIZACION' && !trabajo.professional_id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold">Detalle del Trabajo</h1>
          <div></div> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Tarjeta>
              <h2 className="text-xl font-semibold mb-4">{trabajo.title}</h2>
              {trabajo.description && (
                <p className="text-gray-600 mb-4">{trabajo.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Estado:</span>
                  <span className="ml-2 capitalize">
                    {servicioTrabajos.obtenerEtiquetaEstado(trabajo.status)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Creado:</span>
                  <span className="ml-2">
                    {new Date(trabajo.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                {trabajo.quote_amount && (
                  <div>
                    <span className="font-medium">Cotización:</span>
                    <span className="ml-2">
                      {servicioTrabajos.formatearMonto(trabajo.quote_amount)} {trabajo.quote_currency}
                    </span>
                  </div>
                )}
                {trabajo.accepted_at && (
                  <div>
                    <span className="font-medium">Aceptado:</span>
                    <span className="ml-2">
                      {new Date(trabajo.accepted_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>
            </Tarjeta>

            {/* Archivos */}
            {archivos.length > 0 && (
              <Tarjeta>
                <h3 className="text-lg font-semibold mb-4">Archivos</h3>
                <div className="space-y-2">
                  {archivos.map(archivo => (
                    <div key={archivo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{archivo.filename}</p>
                        <p className="text-sm text-gray-500">
                          {servicioArchivos.formatearTamano(archivo.size)}
                        </p>
                      </div>
                      <Boton
                        onClick={() => manejarDescargarArchivo(archivo)}
                        variante="secondary"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Boton>
                    </div>
                  ))}
                </div>
              </Tarjeta>
            )}

            {/* Cotizaciones */}
            {cotizaciones.length > 0 && (
              <Tarjeta>
                <h3 className="text-lg font-semibold mb-4">Cotizaciones</h3>
                <ListaCotizaciones
                  cotizaciones={cotizaciones}
                  esCliente={esCliente}
                  alAceptarCotizacion={manejarAceptarCotizacion}
                  cargando={aceptandoCotizacion}
                />
              </Tarjeta>
            )}
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Acciones */}
            <Tarjeta>
              <h3 className="text-lg font-semibold mb-4">Acciones</h3>
              <div className="space-y-3">
                {esCliente && trabajo.status === 'TRABAJO_EN_PROGRESO' && (
                  <Boton
                    onClick={manejarFinalizarTrabajo}
                    cargando={finalizandoTrabajo}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Finalizado
                  </Boton>
                )}

                {esProfesional && puedeCotizar && (
                  <Boton
                    onClick={() => navigate(`/trabajo/${trabajo.id}/cotizar`)}
                    className="w-full"
                  >
                    Crear Cotización
                  </Boton>
                )}

                {esCliente && trabajo.status === 'POR_REVISAR' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subir Archivos Adicionales
                    </label>
                    <SubidorArchivos
                      jobId={trabajo.id}
                      alSubirExitoso={() => cargarDetalleTrabajo()}
                    />
                  </div>
                )}
              </div>
            </Tarjeta>

            {error && (
              <Tarjeta>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </Tarjeta>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}