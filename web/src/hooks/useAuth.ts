import { useState, useEffect } from 'react';
import { servicioAuth } from '../api/servicio-auth';
import type { Usuario, SolicitudRegistro, SolicitudLogin } from '../types';

interface EstadoAuth {
  usuario: Usuario | null;
  cargando: boolean;
  error: string | null;
}

/**
 * Hook personalizado para gestionar autenticación
 * Responsabilidad: Estado y operaciones de autenticación
 */
export function useAuth() {
  const [estado, setEstado] = useState<EstadoAuth>({
    usuario: null,
    cargando: true,
    error: null,
  });

  // Cargar perfil del usuario al montar
  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    if (!servicioAuth.estaAutenticado()) {
      setEstado({ usuario: null, cargando: false, error: null });
      return;
    }

    try {
      const { user } = await servicioAuth.obtenerPerfil();
      setEstado({ usuario: user, cargando: false, error: null });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setEstado({ usuario: null, cargando: false, error: null });
      servicioAuth.cerrarSesion();
    }
  };

  const registrarse = async (datos: SolicitudRegistro) => {
    setEstado(prev => ({ ...prev, cargando: true, error: null }));
    
    try {
      const { user } = await servicioAuth.registrarse(datos);
      setEstado({ usuario: user, cargando: false, error: null });
    } catch (error: any) {
      setEstado(prev => ({
        ...prev,
        cargando: false,
        error: error.message || 'Error al registrarse',
      }));
      throw error;
    }
  };

  const iniciarSesion = async (datos: SolicitudLogin) => {
    setEstado(prev => ({ ...prev, cargando: true, error: null }));
    
    try {
      const { user } = await servicioAuth.iniciarSesion(datos);
      setEstado({ usuario: user, cargando: false, error: null });
    } catch (error: any) {
      setEstado(prev => ({
        ...prev,
        cargando: false,
        error: error.message || 'Error al iniciar sesión',
      }));
      throw error;
    }
  };

  const cerrarSesion = () => {
    servicioAuth.cerrarSesion();
    setEstado({ usuario: null, cargando: false, error: null });
  };

  return {
    usuario: estado.usuario,
    cargando: estado.cargando,
    error: estado.error,
    estaAutenticado: !!estado.usuario,
    registrarse,
    iniciarSesion,
    cerrarSesion,
    recargarPerfil: cargarPerfil,
  };
}
