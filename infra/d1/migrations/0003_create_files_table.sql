-- Migration: Create files table
-- Created: 2025-01-10

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  job_id TEXT,
  uploaded_by TEXT NOT NULL,
  filename TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'POR_REVISAR' CHECK(status IN (
    'POR_REVISAR',
    'EN_REVISION',
    'APROBADO',
    'RECHAZADO',
    'FIRMADO'
  )),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_files_job_id ON files(job_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_created_at ON files(created_at);
