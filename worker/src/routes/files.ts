import { Hono } from 'hono';
import type { Env, AuthContext } from '../types';
import { requireAuth } from '../lib/jwt';
import {
  createFile,
  getFileById,
  getFilesByJobId,
  createAuditLog,
} from '../lib/db';
import {
  uploadToR2,
  downloadFromR2,
  generateR2Key,
  sanitizeFilename,
  validateFileSize,
  validateMimeType,
  getAllowedMimeTypes,
} from '../lib/r2';

const files = new Hono<{ Bindings: Env }>();

// Upload file
files.post('/upload', requireAuth(), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const contentType = c.req.header('content-type') || '';

    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const jobId = formData.get('jobId') as string | null;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file size
    if (!validateFileSize(file.size)) {
      return c.json({ error: 'File size exceeds maximum allowed (200MB)' }, 400);
    }

    // Validate MIME type
    const allowedTypes = getAllowedMimeTypes();
    if (!validateMimeType(file.type, allowedTypes)) {
      return c.json({ error: 'File type not allowed' }, 400);
    }

    // Generate R2 key
    const r2Key = generateR2Key(authContext.userId, file.name);

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await uploadToR2(c.env.FILESTORE, r2Key, arrayBuffer, {
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedBy: authContext.userId,
      },
    });

    // Create file record in DB
    const fileRecord = await createFile(c.env.DB, {
      job_id: jobId || undefined,
      uploaded_by: authContext.userId,
      filename: file.name,
      r2_key: r2Key,
      mime: file.type,
      size: file.size,
    });

    // Log audit
    await createAuditLog(c.env.DB, {
      user_id: authContext.userId,
      action: 'FILE_UPLOAD',
      resource_type: 'file',
      resource_id: fileRecord.id,
      details: { filename: file.name, size: file.size, mime: file.type },
      ip_address: c.req.header('cf-connecting-ip'),
      user_agent: c.req.header('user-agent'),
    });

    return c.json({
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        size: fileRecord.size,
        mime: fileRecord.mime,
        status: fileRecord.status,
        created_at: fileRecord.created_at,
      },
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return c.json({ error: 'Failed to upload file', message: error.message }, 500);
  }
});

// Get file by ID
files.get('/:id', requireAuth(), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const fileId = c.req.param('id');

    const file = await getFileById(c.env.DB, fileId);
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Check permissions (users can only access their own files, professionals/admin can access all)
    if (
      authContext.role === 'user' &&
      file.uploaded_by !== authContext.userId
    ) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json({
      file: {
        id: file.id,
        filename: file.filename,
        size: file.size,
        mime: file.mime,
        status: file.status,
        created_at: file.created_at,
        job_id: file.job_id,
      },
    });
  } catch (error: any) {
    console.error('Get file error:', error);
    return c.json({ error: 'Failed to get file', message: error.message }, 500);
  }
});

// Download file
files.get('/download/:id', requireAuth(), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const fileId = c.req.param('id');

    const file = await getFileById(c.env.DB, fileId);
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Check permissions
    if (
      authContext.role === 'user' &&
      file.uploaded_by !== authContext.userId
    ) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Get file from R2
    const object = await downloadFromR2(c.env.FILESTORE, file.r2_key);
    if (!object) {
      return c.json({ error: 'File not found in storage' }, 404);
    }

    // Log audit
    await createAuditLog(c.env.DB, {
      user_id: authContext.userId,
      action: 'FILE_DOWNLOAD',
      resource_type: 'file',
      resource_id: file.id,
      ip_address: c.req.header('cf-connecting-ip'),
      user_agent: c.req.header('user-agent'),
    });

    // Return file
    return new Response(object.body, {
      headers: {
        'Content-Type': file.mime,
        'Content-Disposition': `attachment; filename="${sanitizeFilename(file.filename)}"`,
        'Content-Length': file.size.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download file error:', error);
    return c.json({ error: 'Failed to download file', message: error.message }, 500);
  }
});

export default files;
