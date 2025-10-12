import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrabajos } from '../hooks/useTrabajos';
import { Boton } from './ui/Boton';
import { Input } from './ui/Input';
import { Tarjeta } from './ui/Tarjeta';
import { SubidorArchivos } from './SubidorArchivos';
import { ArrowLeft, Save } from 'lucide-react';

interface PropiedadesFormularioTrabajo {
  alCancelar?: () => void;
}

/**
 * Componente Formulario Trabajo
 * Responsabilidad: Crear un nuevo trabajo con archivos opcionales
 */
export function FormularioTrabajo({ alCancelar }: PropiedadesFormularioTrabajo) {
  const navigate = useNavigate();
  const { crearTrabajo } = useTrabajos();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivosIds, setArchivosIds] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarSubidaArchivo = (archivo: any) => {
    setArchivosIds(prev => [...prev, archivo.id]);
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const nuevoTrabajo = await crearTrabajo({
        title: titulo.trim(),
        description: descripcion.trim() || undefined,
        fileIds: archivosIds.length > 0 ? archivosIds : undefined,
      });

      navigate(`/trabajo/${nuevoTrabajo.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear el trabajo');
    } finally {
      setCargando(false);
    }
  };

  const manejarCancelar = () => {
    if (alCancelar) {
      alCancelar();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={manejarCancelar}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </button>
      </div>

      <Tarjeta>
        <h1 className="text-2xl font-bold mb-6">Crear Nuevo Trabajo</h1>

        <form onSubmit={manejarEnvio} className="space-y-6">
          <Input
            label="Título del Trabajo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Describe brevemente el trabajo"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Proporciona detalles adicionales sobre el trabajo"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivos (Opcional)
            </label>
            <SubidorArchivos
              alSubirExitoso={manejarSubidaArchivo}
              multiple={true}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <Boton
              type="button"
              variante="secondary"
              onClick={manejarCancelar}
              disabled={cargando}
            >
              Cancelar
            </Boton>
            <Boton
              type="submit"
              cargando={cargando}
            >
              <Save className="w-4 h-4 mr-2" />
              Crear Trabajo
            </Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  );
}