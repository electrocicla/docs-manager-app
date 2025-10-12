import { clienteHttp } from './cliente-http';
import type { RespuestaArchivo } from '../types';

/**
 * Servicio de Archivos
 * Responsabilidad: Gestionar subida y descarga de archivos
 */
export class ServicioArchivos {
  /**
   * Subir un archivo
   */
  async subirArchivo(
    archivo: File,
    jobId?: string
  ): Promise<RespuestaArchivo> {
    const formData = new FormData();
    formData.append('file', archivo);
    
    if (jobId) {
      formData.append('jobId', jobId);
    }

    return clienteHttp.postFormData<RespuestaArchivo>(
      '/files/upload',
      formData,
      { requiresAuth: true }
    );
  }

  /**
   * Obtener información de un archivo
   */
  async obtenerArchivo(archivoId: string): Promise<RespuestaArchivo> {
    return clienteHttp.get<RespuestaArchivo>(`/files/${archivoId}`, {
      requiresAuth: true,
    });
  }

  /**
   * Descargar un archivo
   */
  async descargarArchivo(archivoId: string, nombreArchivo: string): Promise<void> {
    const blob = await clienteHttp.descargarArchivo(`/files/download/${archivoId}`);
    
    // Crear URL temporal y descargar
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Validar tamaño de archivo
   */
  validarTamano(archivo: File, maxSizeMB: number = 200): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return archivo.size <= maxBytes;
  }

  /**
   * Validar tipo de archivo
   */
  validarTipo(archivo: File): boolean {
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    return tiposPermitidos.includes(archivo.type);
  }

  /**
   * Formatear tamaño de archivo para mostrar
   */
  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Instancia singleton
export const servicioArchivos = new ServicioArchivos();
