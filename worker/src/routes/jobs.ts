import { Hono } from 'hono';
import type { Env, Variables, AuthContext } from '../types';
import { requireAuth } from '../lib/jwt';
import {
  createJob,
  getJobById,
  getJobsByUserId,
  getAllJobs,
  updateJobStatus,
  getFilesByJobId,
  createQuote,
  getQuotesByJobId,
  createAuditLog,
} from '../lib/db';

const jobs = new Hono<{ Bindings: Env; Variables: Variables }>();

// Create a new job
jobs.post('/', requireAuth(['user']), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const body = await c.req.json();
    const { title, description, fileIds } = body;

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    // Create job
    const job = await createJob(c.env.DB, {
      user_id: authContext.userId,
      title,
      description,
    });

    // If fileIds provided, update files to link to this job
    if (fileIds && Array.isArray(fileIds)) {
      for (const fileId of fileIds) {
        await c.env.DB.prepare('UPDATE files SET job_id = ? WHERE id = ? AND uploaded_by = ?')
          .bind(job.id, fileId, authContext.userId)
          .run();
      }
    }

    // Log audit
    await createAuditLog(c.env.DB, {
      user_id: authContext.userId,
      action: 'JOB_CREATED',
      resource_type: 'job',
      resource_id: job.id,
      details: { title, fileCount: fileIds?.length || 0 },
      ip_address: c.req.header('cf-connecting-ip'),
      user_agent: c.req.header('user-agent'),
    });

    return c.json({ job });
  } catch (error: any) {
    console.error('Create job error:', error);
    return c.json({ error: 'Failed to create job', message: error.message }, 500);
  }
});

// Get all jobs (for professionals/admin) or user's jobs
jobs.get('/', requireAuth(), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const status = c.req.query('status');
    const limit = c.req.query('limit');

    let jobsList;
    if (authContext.role === 'user') {
      // Users only see their own jobs
      jobsList = await getJobsByUserId(c.env.DB, authContext.userId);
    } else {
      // Professionals and admin see all jobs
      jobsList = await getAllJobs(c.env.DB, {
        status,
        limit: limit ? parseInt(limit) : undefined,
      });
    }

    return c.json({ jobs: jobsList });
  } catch (error: any) {
    console.error('Get jobs error:', error);
    return c.json({ error: 'Failed to get jobs', message: error.message }, 500);
  }
});

// Get job by ID with details
jobs.get('/:id', requireAuth(), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const jobId = c.req.param('id');

    const job = await getJobById(c.env.DB, jobId);
    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    // Check permissions
    if (authContext.role === 'user' && job.user_id !== authContext.userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Get related data
    const files = await getFilesByJobId(c.env.DB, jobId);
    const quotes = await getQuotesByJobId(c.env.DB, jobId);

    return c.json({
      job,
      files,
      quotes,
    });
  } catch (error: any) {
    console.error('Get job error:', error);
    return c.json({ error: 'Failed to get job', message: error.message }, 500);
  }
});

// Professional creates a quote for a job
jobs.post('/:id/quotes', requireAuth(['professional', 'admin']), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const jobId = c.req.param('id');
    const body = await c.req.json();
    const { amount, message } = body;

    if (!amount || amount <= 0) {
      return c.json({ error: 'Valid amount is required' }, 400);
    }

    const job = await getJobById(c.env.DB, jobId);
    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    // Create quote
    const quote = await createQuote(c.env.DB, {
      job_id: jobId,
      professional_id: authContext.userId,
      amount,
      message,
    });

    // Update job status if not already in COTIZACION
    if (job.status === 'POR_REVISAR' || job.status === 'REVISION_EN_PROGRESO') {
      await updateJobStatus(c.env.DB, jobId, 'COTIZACION');
    }

    // Log audit
    await createAuditLog(c.env.DB, {
      user_id: authContext.userId,
      action: 'QUOTE_CREATED',
      resource_type: 'quote',
      resource_id: quote.id,
      details: { job_id: jobId, amount },
      ip_address: c.req.header('cf-connecting-ip'),
      user_agent: c.req.header('user-agent'),
    });

    return c.json({ quote });
  } catch (error: any) {
    console.error('Create quote error:', error);
    return c.json({ error: 'Failed to create quote', message: error.message }, 500);
  }
});

// Client accepts a quote
jobs.post('/:id/accept-quote', requireAuth(['user']), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const jobId = c.req.param('id');
    const body = await c.req.json();
    const { quote_id } = body;

    const job = await getJobById(c.env.DB, jobId);
    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    if (job.user_id !== authContext.userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Get quote details
    const quote = await c.env.DB.prepare('SELECT * FROM quotes WHERE id = ? AND job_id = ?')
      .bind(quote_id, jobId)
      .first();

    if (!quote) {
      return c.json({ error: 'Quote not found' }, 404);
    }

    // Update job with accepted quote
    await updateJobStatus(c.env.DB, jobId, 'TRABAJO_EN_PROGRESO', {
      professional_id: quote.professional_id as string,
      quote_amount: quote.amount as number,
      accepted_at: new Date().toISOString(),
    });

    // Update quote status
    await c.env.DB.prepare('UPDATE quotes SET status = ? WHERE id = ?')
      .bind('ACCEPTED', quote_id)
      .run();

    // Log audit
    await createAuditLog(c.env.DB, {
      user_id: authContext.userId,
      action: 'QUOTE_ACCEPTED',
      resource_type: 'job',
      resource_id: jobId,
      details: { quote_id, amount: quote.amount },
      ip_address: c.req.header('cf-connecting-ip'),
      user_agent: c.req.header('user-agent'),
    });

    return c.json({ success: true, message: 'Quote accepted' });
  } catch (error: any) {
    console.error('Accept quote error:', error);
    return c.json({ error: 'Failed to accept quote', message: error.message }, 500);
  }
});

// Professional marks job as finished
jobs.post('/:id/finish', requireAuth(['professional', 'admin']), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const jobId = c.req.param('id');

    const job = await getJobById(c.env.DB, jobId);
    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    // Check if professional is assigned to this job
    if (
      authContext.role === 'professional' &&
      job.professional_id !== authContext.userId
    ) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Update job status
    await updateJobStatus(c.env.DB, jobId, 'FINALIZADO', {
      finished_at: new Date().toISOString(),
    });

    // Log audit
    await createAuditLog(c.env.DB, {
      user_id: authContext.userId,
      action: 'JOB_FINISHED',
      resource_type: 'job',
      resource_id: jobId,
      ip_address: c.req.header('cf-connecting-ip'),
      user_agent: c.req.header('user-agent'),
    });

    return c.json({ success: true, message: 'Job marked as finished' });
  } catch (error: any) {
    console.error('Finish job error:', error);
    return c.json({ error: 'Failed to finish job', message: error.message }, 500);
  }
});

export default jobs;
