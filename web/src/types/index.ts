// Tipos de Usuario
export type RolUsuario = 'user' | 'professional' | 'admin';

export interface Usuario {
  id: string;
  email: string;
  full_name: string | null;
  role: RolUsuario;
  created_at: string;
}

// Tipos de Trabajo
export type EstadoTrabajo = 
  | 'POR_REVISAR' 
  | 'REVISION_EN_PROGRESO' 
  | 'COTIZACION' 
  | 'TRABAJO_EN_PROGRESO' 
  | 'FINALIZADO';

export interface Trabajo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: EstadoTrabajo;
  created_at: string;
  updated_at: string;
  quote_amount: number | null;
  quote_currency: string;
  accepted_at: string | null;
  finished_at: string | null;
  professional_id: string | null;
}

// Tipos de Archivo
export type EstadoArchivo = 
  | 'POR_REVISAR' 
  | 'EN_REVISION' 
  | 'APROBADO' 
  | 'RECHAZADO' 
  | 'FIRMADO';

export interface Archivo {
  id: string;
  job_id: string | null;
  uploaded_by: string;
  filename: string;
  r2_key: string;
  mime: string;
  size: number;
  version: number;
  status: EstadoArchivo;
  created_at: string;
}

// Tipos de Cotización
export type EstadoCotizacion = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Cotizacion {
  id: string;
  job_id: string;
  professional_id: string;
  amount: number;
  currency: string;
  message: string | null;
  status: EstadoCotizacion;
  created_at: string;
}

// Respuestas de API
export interface RespuestaAuth {
  token: string;
  user: Usuario;
}

export interface RespuestaError {
  error: string;
  message?: string;
}

export interface RespuestaTrabajo {
  job: Trabajo;
  files?: Archivo[];
  quotes?: Cotizacion[];
}

export interface RespuestaArchivo {
  file: Archivo;
}

export interface RespuestaCotizacion {
  quote: Cotizacion;
}

// Requests
export interface SolicitudRegistro {
  email: string;
  password: string;
  full_name: string;
  role?: RolUsuario;
}

export interface SolicitudLogin {
  email: string;
  password: string;
}

export interface SolicitudCrearTrabajo {
  title: string;
  description?: string;
  fileIds?: string[];
}

export interface SolicitudCrearCotizacion {
  amount: number;
  message?: string;
}

export interface SolicitudAceptarCotizacion {
  quote_id: string;
}
