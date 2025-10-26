-- Fix: Change RUT constraint from UNIQUE to UNIQUE(user_id, rut)
-- This allows different users to have the same RUT, but each user can only have one company per RUT

-- SQLite doesn't support ALTER TABLE to modify constraints directly,
-- so we need to recreate the table

-- Backup the existing data
CREATE TABLE companies_backup AS SELECT * FROM companies;

-- Drop the old companies table
DROP TABLE IF EXISTS companies;

-- Create the new companies table with the corrected constraint
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  rut TEXT,
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, rut)
);

-- Restore the data from backup
INSERT INTO companies SELECT * FROM companies_backup;

-- Drop the backup table
DROP TABLE companies_backup;

-- Recreate indices
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_rut ON companies(rut);
