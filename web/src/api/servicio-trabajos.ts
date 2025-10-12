import { clienteHttp } from './cliente-http';
import type {
  Trabajo,
  RespuestaTrabajo,
  SolicitudCrearTrabajo,
  SolicitudCrearCotizacion,
  SolicitudAceptarCotizacion,
  RespuestaCotizacion,
} from '../types';

/**
 * Servicio de Trabajos
 * Responsabilidad: Gestionar trabajos y cotizaciones
 */
export class ServicioTrabajos {
  /**
   * Crear un nuevo trabajo
   */
  async crearTrabajo(datos: SolicitudCrearTrabajo): Promise<{ job: Trabajo }> {
    return clienteHttp.post<{ job: Trabajo }>('/jobs', datos, {
      requiresAuth: true,
    });
  }

  /**
   * Obtener lista de trabajos
   */
  async obtenerTrabajos(filtros?: {
    status?: string;
    limit?: number;
  }): Promise<{ jobs: Trabajo[] }> {
    const params = new URLSearchParams();
    
    if (filtros?.status) {
      params.append('status', filtros.status);
    }
    
    if (filtros?.limit) {
      params.append('limit', filtros.limit.toString());
    }

    const query = params.toString();
    const endpoint = query ? `/jobs?${query}` : '/jobs';

    return clienteHttp.get<{ jobs: Trabajo[] }>(endpoint, {
      requiresAuth: true,
    });
  }

  /**
   * Obtener detalle de un trabajo
   */
  async obtenerTrabajo(trabajoId: string): Promise<RespuestaTrabajo> {
    return clienteHttp.get<RespuestaTrabajo>(`/jobs/${trabajoId}`, {
      requiresAuth: true,
    });
  }

  /**
   * Crear una cotización para un trabajo (profesional)
   */
  async crearCotizacion(
    trabajoId: string,
    datos: SolicitudCrearCotizacion
  ): Promise<RespuestaCotizacion> {
    return clienteHttp.post<RespuestaCotizacion>(
      `/jobs/${trabajoId}/quotes`,
      datos,
      { requiresAuth: true }
    );
  }

  /**
   * Aceptar una cotización (cliente)
   */
  async aceptarCotizacion(
    trabajoId: string,
    datos: SolicitudAceptarCotizacion
  ): Promise<{ success: boolean; message: string }> {
    return clienteHttp.post<{ success: boolean; message: string }>(
      `/jobs/${trabajoId}/accept-quote`,
      datos,
      { requiresAuth: true }
    );
  }

  /**
   * Marcar trabajo como finalizado (profesional)
   */
  async finalizarTrabajo(
    trabajoId: string
  ): Promise<{ success: boolean; message: string }> {
    return clienteHttp.post<{ success: boolean; message: string }>(
      `/jobs/${trabajoId}/finish`,
      {},
      { requiresAuth: true }
    );
  }

  /**
   * Obtener etiqueta legible del estado
   */
  obtenerEtiquetaEstado(estado: string): string {
    const etiquetas: Record<string, string> = {
      POR_REVISAR: 'Por Revisar',
      REVISION_EN_PROGRESO: 'Revisión en Progreso',
      COTIZACION: 'Cotización',
      TRABAJO_EN_PROGRESO: 'Trabajo en Progreso',
      FINALIZADO: 'Finalizado',
    };

    return etiquetas[estado] || estado;
  }

  /**
   * Obtener color del estado para UI
   */
  obtenerColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      POR_REVISAR: 'gray',
      REVISION_EN_PROGRESO: 'blue',
      COTIZACION: 'yellow',
      TRABAJO_EN_PROGRESO: 'indigo',
      FINALIZADO: 'green',
    };

    return colores[estado] || 'gray';
  }

  /**
   * Formatear monto en CLP
   */
  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(monto);
  }
}

// Instancia singleton
export const servicioTrabajos = new ServicioTrabajos();
