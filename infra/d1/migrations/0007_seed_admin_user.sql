-- Migration: Seed initial admin user
-- Created: 2025-01-10

INSERT INTO users (id, email, full_name, role, created_at)
VALUES (
  'admin-' || hex(randomblob(16)),
  'admin@sr-prevencion.cl',
  'Administrator',
  'admin',
  CURRENT_TIMESTAMP
);

-- Note: In production, set password_hash properly using bcrypt
-- This is just a placeholder for initial setup
