-- Migration: Create quotes table
-- Created: 2025-01-10

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  professional_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'CLP',
  message TEXT,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_quotes_job_id ON quotes(job_id);
CREATE INDEX idx_quotes_professional_id ON quotes(professional_id);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
