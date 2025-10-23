import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, Variables } from './types';
import authRoutes from './routes/auth';
import filesRoutes from './routes/files';
import jobsRoutes from './routes/jobs';
import companiesRoutes from './routes/companies';
import workersRoutes from './routes/workers';
import documentsRoutes from './routes/documents';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS middleware
app.use('/*', cors({
  origin: '*', // Configure for production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/files', filesRoutes);
app.route('/api/jobs', jobsRoutes);
app.route('/api/companies', companiesRoutes);
app.route('/api/workers', workersRoutes);
app.route('/api/documents', documentsRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

export default app;
