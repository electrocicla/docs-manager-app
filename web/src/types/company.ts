/**
 * Tipos para empresas, trabajadores y documentos
 */

export interface Company {
  id: string;
  user_id: string;
  name: string;
  rut?: string;
  industry?: string;
  address?: string;
  city?: string;
  region?: string;
  phone?: string;
  email?: string;
  website?: string;
  employees_count?: number;
  description?: string;
  logo_r2_key?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export interface CompanyInput {
  name: string;
  rut: string;
  industry?: string;
  address?: string;
  city: string;
  region: string;
  phone?: string;
  email?: string;
  website?: string;
  employees_count?: number;
  description?: string;
}

export type UpdateCompanyPayload = Partial<CompanyInput>;

export interface Worker {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  rut: string;
  email: string;
  phone?: string;
  job_title?: string;
  department?: string;
  profile_image_r2_key?: string;
  additional_comments?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface WorkerInput {
  company_id: string;
  first_name: string;
  last_name: string;
  rut: string;
  email?: string;
  phone?: string;
  job_title?: string;
  department?: string;
  additional_comments?: string;
}

export interface WorkerDocumentType {
  id: string;
  code: string;
  name: string;
  description?: string;
  requires_front_back: boolean;
  requires_expiry_date: boolean;
  order_index: number;
  created_at: string;
}

export type DocumentStatus = 'PENDING' | 'UNDER_REVIEW' | 'IN_REVIEW' | 'APPROVED' | 'EXPIRED' | 'REJECTED';

export interface WorkerDocument {
  id: string;
  worker_id: string;
  document_type_id: string;
  status: DocumentStatus;
  emission_date?: string; // YYYY-MM-DD
  expiry_date?: string; // YYYY-MM-DD
  file_r2_key?: string;
  file_r2_key_back?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_comments?: string;
  created_at: string;
  updated_at: string;
  days_remaining?: number; // Calculado
}

export interface WorkerProfile {
  worker: Worker;
  documents: WorkerDocument[];
  documentTypes: WorkerDocumentType[];
  profileCompleteness: {
    hasPhoto: boolean;
    documentsApproved: number;
    documentsPending: number;
    documentsExpired: number;
    percentageComplete: number;
  };
}
