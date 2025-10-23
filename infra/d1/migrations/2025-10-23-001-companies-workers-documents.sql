-- Crear tabla de empresas
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  rut TEXT UNIQUE,
  industry TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  employees_count INTEGER,
  description TEXT,
  logo_r2_key TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear tabla de trabajadores
CREATE TABLE IF NOT EXISTS workers (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  rut TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  job_title TEXT,
  department TEXT,
  profile_image_r2_key TEXT,
  additional_comments TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Crear tabla de tipos de documentos requeridos
CREATE TABLE IF NOT EXISTS worker_document_types (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  requires_front_back BOOLEAN DEFAULT 0,
  requires_expiry_date BOOLEAN DEFAULT 1,
  order_index INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de documentos del trabajador
CREATE TABLE IF NOT EXISTS worker_documents (
  id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL,
  document_type_id TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  emission_date DATE,
  expiry_date DATE,
  file_r2_key TEXT,
  file_r2_key_back TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  reviewed_by TEXT,
  reviewed_at DATETIME,
  admin_comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  FOREIGN KEY (document_type_id) REFERENCES worker_document_types(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Crear índices para optimización
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_workers_company_id ON workers(company_id);
CREATE INDEX idx_worker_documents_worker_id ON worker_documents(worker_id);
CREATE INDEX idx_worker_documents_status ON worker_documents(status);
CREATE INDEX idx_worker_documents_expiry ON worker_documents(expiry_date);
