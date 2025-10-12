import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicioTrabajos } from '../api/servicio-trabajos';
import { Boton } from './ui/Boton';
import { Input } from './ui/Input';
import { Tarjeta } from './ui/Tarjeta';
import { ArrowLeft, Send } from 'lucide-react';

interface PropiedadesFormularioCotizacion {
  trabajoId: string;
  alCancelar?: () => void;
  alExito?: () => void;
}

/**
 * Componente Formulario Cotización
 * Responsabilidad: Crear una cotización para un trabajo
 */
export function FormularioCotizacion({
  trabajoId,
  alCancelar,
  alExito,
}: PropiedadesFormularioCotizacion) {
  const navigate = useNavigate();
  const [monto, setMonto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    const montoNum = parseFloat(monto);
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await servicioTrabajos.crearCotizacion(trabajoId, {
        amount: montoNum,
        message: mensaje.trim() || undefined,
      });

      if (alExito) {
        alExito();
      } else {
        navigate(`/trabajo/${trabajoId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear la cotización');
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
        <h1 className="text-2xl font-bold mb-6">Crear Cotización</h1>

        <form onSubmit={manejarEnvio} className="space-y-6">
          <Input
            label="Monto (CLP)"
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ingresa el monto en pesos chilenos"
            min="1"
            step="1"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje (Opcional)
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Describe los detalles de tu cotización"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
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
              <Send className="w-4 h-4 mr-2" />
              Enviar Cotización
            </Boton>
          </div>
        </form>
      </Tarjeta>
    </div>
  );
}