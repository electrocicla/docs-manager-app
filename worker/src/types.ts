export interface Env {
  DB: D1Database;
  FILESTORE: R2Bucket;
  JWT_SECRET: string;
  ENVIRONMENT: string;
}

// Variables de contexto para Hono
export type Variables = {
  authContext: AuthContext;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  password_hash: string | null;
  role: 'user' | 'professional' | 'admin';
  created_at: string;
  updated_at: string;
  metadata: string;
}

export interface Job {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'POR_REVISAR' | 'REVISION_EN_PROGRESO' | 'COTIZACION' | 'TRABAJO_EN_PROGRESO' | 'FINALIZADO';
  created_at: string;
  updated_at: string;
  quote_amount: number | null;
  quote_currency: string;
  accepted_at: string | null;
  finished_at: string | null;
  professional_id: string | null;
}

export interface File {
  id: string;
  job_id: string | null;
  uploaded_by: string;
  filename: string;
  r2_key: string;
  mime: string;
  size: number;
  version: number;
  status: 'POR_REVISAR' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'FIRMADO';
  created_at: string;
}

export interface Quote {
  id: string;
  job_id: string;
  professional_id: string;
  amount: number;
  currency: string;
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
}

export interface Signature {
  id: string;
  file_id: string;
  professional_id: string;
  signed_at: string;
  signature_meta: string;
  r2_signed_key: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuthContext {
  userId: string;
  email: string;
  role: 'user' | 'professional' | 'admin';
}
