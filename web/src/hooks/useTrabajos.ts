import { useState, useCallback } from 'react';
import { servicioTrabajos } from '../api/servicio-trabajos';
import type { Trabajo, SolicitudCrearTrabajo } from '../types';

/**
 * Hook personalizado para gestionar trabajos
 * Responsabilidad: Estado y operaciones de trabajos
 */
export function useTrabajos() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarTrabajos = useCallback(async (filtros?: {
    status?: string;
    limit?: number;
  }) => {
    setCargando(true);
    setError(null);

    try {
      const { jobs } = await servicioTrabajos.obtenerTrabajos(filtros);
      setTrabajos(jobs);
    } catch (err: any) {
      setError(err.message || 'Error al cargar trabajos');
      console.error('Error al cargar trabajos:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  const crearTrabajo = async (datos: SolicitudCrearTrabajo) => {
    setCargando(true);
    setError(null);

    try {
      const { job } = await servicioTrabajos.crearTrabajo(datos);
      setTrabajos(prev => [job, ...prev]);
      return job;
    } catch (err: any) {
      setError(err.message || 'Error al crear trabajo');
      throw err;
    } finally {
      setCargando(false);
    }
  };

  return {
    trabajos,
    cargando,
    error,
    cargarTrabajos,
    crearTrabajo,
  };
}
