-- Migration: Create signatures table
-- Created: 2025-01-10

CREATE TABLE IF NOT EXISTS signatures (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  professional_id TEXT NOT NULL,
  signed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  signature_meta TEXT DEFAULT '{}',
  r2_signed_key TEXT,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_signatures_file_id ON signatures(file_id);
CREATE INDEX idx_signatures_professional_id ON signatures(professional_id);
