import type { Env, User, Job, File, Quote, Signature, AuditLog } from '../types';

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Get user by email
 */
export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<User>();
  return result || null;
}

/**
 * Get user by ID
 */
export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const result = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>();
  return result || null;
}

/**
 * Create a new user
 */
export async function createUser(
  db: D1Database,
  data: {
    email: string;
    full_name?: string;
    password_hash?: string;
    role: 'user' | 'professional' | 'admin';
    metadata?: Record<string, any>;
  }
): Promise<User> {
  const id = generateId('user');
  const metadata = JSON.stringify(data.metadata || {});
  
  await db
    .prepare(
      'INSERT INTO users (id, email, full_name, password_hash, role, metadata) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(id, data.email, data.full_name || null, data.password_hash || null, data.role, metadata)
    .run();
  
  const user = await getUserById(db, id);
  if (!user) throw new Error('Failed to create user');
  return user;
}

/**
 * Get job by ID with details
 */
export async function getJobById(db: D1Database, id: string): Promise<Job | null> {
  const result = await db.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first<Job>();
  return result || null;
}

/**
 * Get all jobs for a user
 */
export async function getJobsByUserId(db: D1Database, userId: string): Promise<Job[]> {
  const result = await db
    .prepare('SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<Job>();
  return result.results || [];
}

/**
 * Get all jobs (for admin/professional)
 */
export async function getAllJobs(db: D1Database, filters?: { status?: string; limit?: number }): Promise<Job[]> {
  let query = 'SELECT * FROM jobs';
  const params: any[] = [];
  
  if (filters?.status) {
    query += ' WHERE status = ?';
    params.push(filters.status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  if (filters?.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  const stmt = db.prepare(query);
  const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all<Job>();
  return result.results || [];
}

/**
 * Create a new job
 */
export async function createJob(
  db: D1Database,
  data: {
    user_id: string;
    title: string;
    description?: string;
  }
): Promise<Job> {
  const id = generateId('job');
  
  await db
    .prepare('INSERT INTO jobs (id, user_id, title, description, status) VALUES (?, ?, ?, ?, ?)')
    .bind(id, data.user_id, data.title, data.description || null, 'POR_REVISAR')
    .run();
  
  const job = await getJobById(db, id);
  if (!job) throw new Error('Failed to create job');
  return job;
}

/**
 * Update job status
 */
export async function updateJobStatus(
  db: D1Database,
  jobId: string,
  status: Job['status'],
  additionalData?: { professional_id?: string; quote_amount?: number; accepted_at?: string; finished_at?: string }
): Promise<void> {
  let query = 'UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP';
  const params: any[] = [status];
  
  if (additionalData?.professional_id) {
    query += ', professional_id = ?';
    params.push(additionalData.professional_id);
  }
  
  if (additionalData?.quote_amount !== undefined) {
    query += ', quote_amount = ?';
    params.push(additionalData.quote_amount);
  }
  
  if (additionalData?.accepted_at) {
    query += ', accepted_at = ?';
    params.push(additionalData.accepted_at);
  }
  
  if (additionalData?.finished_at) {
    query += ', finished_at = ?';
    params.push(additionalData.finished_at);
  }
  
  query += ' WHERE id = ?';
  params.push(jobId);
  
  await db.prepare(query).bind(...params).run();
}

/**
 * Get files for a job
 */
export async function getFilesByJobId(db: D1Database, jobId: string): Promise<File[]> {
  const result = await db
    .prepare('SELECT * FROM files WHERE job_id = ? ORDER BY created_at DESC')
    .bind(jobId)
    .all<File>();
  return result.results || [];
}

/**
 * Get file by ID
 */
export async function getFileById(db: D1Database, id: string): Promise<File | null> {
  const result = await db.prepare('SELECT * FROM files WHERE id = ?').bind(id).first<File>();
  return result || null;
}

/**
 * Create a file record
 */
export async function createFile(
  db: D1Database,
  data: {
    job_id?: string;
    uploaded_by: string;
    filename: string;
    r2_key: string;
    mime: string;
    size: number;
  }
): Promise<File> {
  const id = generateId('file');
  
  await db
    .prepare(
      'INSERT INTO files (id, job_id, uploaded_by, filename, r2_key, mime, size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(id, data.job_id || null, data.uploaded_by, data.filename, data.r2_key, data.mime, data.size, 'POR_REVISAR')
    .run();
  
  const file = await getFileById(db, id);
  if (!file) throw new Error('Failed to create file');
  return file;
}

/**
 * Create a quote
 */
export async function createQuote(
  db: D1Database,
  data: {
    job_id: string;
    professional_id: string;
    amount: number;
    message?: string;
  }
): Promise<Quote> {
  const id = generateId('quote');
  
  await db
    .prepare('INSERT INTO quotes (id, job_id, professional_id, amount, message, status) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, data.job_id, data.professional_id, data.amount, data.message || null, 'PENDING')
    .run();
  
  const result = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first<Quote>();
  if (!result) throw new Error('Failed to create quote');
  return result;
}

/**
 * Get quotes for a job
 */
export async function getQuotesByJobId(db: D1Database, jobId: string): Promise<Quote[]> {
  const result = await db
    .prepare('SELECT * FROM quotes WHERE job_id = ? ORDER BY created_at DESC')
    .bind(jobId)
    .all<Quote>();
  return result.results || [];
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  db: D1Database,
  data: {
    user_id?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    details?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
  }
): Promise<void> {
  const id = generateId('audit');
  const details = JSON.stringify(data.details || {});
  
  await db
    .prepare(
      'INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(
      id,
      data.user_id || null,
      data.action,
      data.resource_type,
      data.resource_id || null,
      details,
      data.ip_address || null,
      data.user_agent || null
    )
    .run();
}
