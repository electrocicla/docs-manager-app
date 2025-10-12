-- Migration: Create jobs table
-- Created: 2025-01-10

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'POR_REVISAR' CHECK(status IN (
    'POR_REVISAR',
    'REVISION_EN_PROGRESO',
    'COTIZACION',
    'TRABAJO_EN_PROGRESO',
    'FINALIZADO'
  )),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  quote_amount INTEGER,
  quote_currency TEXT DEFAULT 'CLP',
  accepted_at DATETIME,
  finished_at DATETIME,
  professional_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_professional_id ON jobs(professional_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
