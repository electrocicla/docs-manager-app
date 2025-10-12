import { clienteHttp } from './cliente-http';
import type {
  RespuestaAuth,
  SolicitudRegistro,
  SolicitudLogin,
  Usuario,
} from '../types';

/**
 * Servicio de Autenticación
 * Responsabilidad: Gestionar autenticación de usuarios
 */
export class ServicioAuth {
  /**
   * Registrar nuevo usuario
   */
  async registrarse(datos: SolicitudRegistro): Promise<RespuestaAuth> {
    const respuesta = await clienteHttp.post<RespuestaAuth>(
      '/auth/signup',
      datos
    );
    
    // Guardar token en localStorage
    if (respuesta.token) {
      this.guardarToken(respuesta.token);
    }
    
    return respuesta;
  }

  /**
   * Iniciar sesión
   */
  async iniciarSesion(datos: SolicitudLogin): Promise<RespuestaAuth> {
    const respuesta = await clienteHttp.post<RespuestaAuth>(
      '/auth/login',
      datos
    );
    
    // Guardar token en localStorage
    if (respuesta.token) {
      this.guardarToken(respuesta.token);
    }
    
    return respuesta;
  }

  /**
   * Obtener perfil del usuario actual
   */
  async obtenerPerfil(): Promise<{ user: Usuario }> {
    return clienteHttp.get<{ user: Usuario }>('/auth/me', {
      requiresAuth: true,
    });
  }

  /**
   * Cerrar sesión
   */
  cerrarSesion(): void {
    this.eliminarToken();
  }

  /**
   * Verificar si el usuario está autenticado
   */
  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  /**
   * Guardar token en localStorage
   */
  private guardarToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Obtener token de localStorage
   */
  private obtenerToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Eliminar token de localStorage
   */
  private eliminarToken(): void {
    localStorage.removeItem('auth_token');
  }
}

// Instancia singleton
export const servicioAuth = new ServicioAuth();
