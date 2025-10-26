import type { RespuestaError } from '../types';
import { config } from '../config';

export class ApiError extends Error {
  constructor(
    message: string,
    public _status: number,
    public _data?: RespuestaError
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface OpcionesSolicitud extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Cliente HTTP base siguiendo el principio SRP
 * Responsabilidad: Manejar comunicación HTTP con el backend
 */
export class ClienteHttp {
  constructor(private baseUrl: string = config.apiUrl) {}

  private obtenerToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private obtenerHeaders(requiresAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = this.obtenerToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async manejarRespuesta<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: 'Error desconocido', rawStatus: response.status, statusText: response.statusText };
      }
      console.error(`[ClienteHttp] API Error ${response.status}:`, {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: response.url,
      });
      throw new ApiError(
        errorData.error || 'Error en la solicitud',
        response.status,
        errorData
      );
    }

    return response.json();
  }

  async get<T>(
    endpoint: string,
    opciones: OpcionesSolicitud = {}
  ): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = opciones;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'GET',
      headers: this.obtenerHeaders(requiresAuth),
    });

    return this.manejarRespuesta<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    opciones: OpcionesSolicitud = {}
  ): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = opciones;
    
    const headers = this.obtenerHeaders(requiresAuth) as Record<string, string>;
    const body = data ? JSON.stringify(data) : undefined;
    
    console.log(`[ClienteHttp] POST ${endpoint}:`, {
      requiresAuth,
      hasAuth: !!headers['Authorization'],
      token: headers['Authorization']?.substring(0, 50) + '...',
      body: body ? JSON.parse(body) : undefined,
    });
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body,
    });

    return this.manejarRespuesta<T>(response);
  }

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    opciones: OpcionesSolicitud = {}
  ): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = opciones;
    
    const headers: HeadersInit = {};
    if (requiresAuth) {
      const token = this.obtenerToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'POST',
      headers,
      body: formData,
    });

    return this.manejarRespuesta<T>(response);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    opciones: OpcionesSolicitud = {}
  ): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = opciones;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'PUT',
      headers: this.obtenerHeaders(requiresAuth),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.manejarRespuesta<T>(response);
  }

  async delete<T>(
    endpoint: string,
    opciones: OpcionesSolicitud = {}
  ): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = opciones;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      method: 'DELETE',
      headers: this.obtenerHeaders(requiresAuth),
    });

    return this.manejarRespuesta<T>(response);
  }

  async descargarArchivo(endpoint: string): Promise<Blob> {
    const token = this.obtenerToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new ApiError(
        'Error al descargar archivo',
        response.status
      );
    }

    return response.blob();
  }
}

// Instancia singleton del cliente HTTP
export const clienteHttp = new ClienteHttp();
