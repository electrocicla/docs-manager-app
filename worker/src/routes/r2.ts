/**
 * R2 Storage Routes
 * Handles signed URLs for file upload/download and file management
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { requireAuth } from '../lib/jwt';
import {
  generateSignedUploadUrl,
  generateSignedDownloadUrl,
  deleteFileFromR2,
} from '../utils/r2-storage';

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * POST /api/r2/upload-url
 * Generate a signed URL for uploading a file to R2
 * Body: { fileName: string, contentType: string, expiresIn?: number }
 */
router.post('/upload-url', requireAuth(), async (c) => {
  try {
    const body = await c.req.json();
    const { fileName, contentType, expiresIn } = body;

    if (!fileName || !contentType) {
      return c.json(
        { error: 'fileName and contentType are required' },
        400
      );
    }

    const result = await generateSignedUploadUrl(
      c,
      fileName,
      contentType,
      expiresIn || 3600
    );

    return c.json(result);
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return c.json(
      {
        error: 'Failed to generate upload URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

/**
 * GET /api/r2/files/:key
 * Serve a file directly from R2 (no auth required - secured by obscurity/complex keys)
 */
router.get('/files/:key', async (c) => {
  try {
    const fileKey = c.req.param('key');
    const env = c.env as any;

    // Get the file from R2
    const object = await env.FILESTORE.get(fileKey);

    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    // Return the file with appropriate headers
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileKey.split('/').pop()}"`,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return c.json(
      {
        error: 'Failed to serve file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

/**
 * POST /api/r2/download-url
 * Generate a signed URL for downloading a file from R2
 * Body: { fileKey: string, expiresIn?: number }
 */
router.post('/download-url', requireAuth(), async (c) => {
  try {
    const body = await c.req.json();
    const { fileKey, expiresIn } = body;

    if (!fileKey) {
      return c.json({ error: 'fileKey is required' }, 400);
    }

    const result = await generateSignedDownloadUrl(
      c,
      fileKey,
      expiresIn || 3600
    );

    return c.json(result);
  } catch (error) {
    console.error('Error generating download URL:', error);
    return c.json(
      {
        error: 'Failed to generate download URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

/**
 * POST /api/r2/delete
 * Delete a file from R2
 * Body: { fileKey: string }
 * Only ADMIN can delete files
 */
router.post('/delete', requireAuth(['admin']), async (c) => {
  try {
    const authContext = c.get('authContext');
    if (authContext.role !== 'admin') {
      return c.json({ error: 'Only admins can delete files' }, 403);
    }

    const body = await c.req.json();
    const { fileKey } = body;

    if (!fileKey) {
      return c.json({ error: 'fileKey is required' }, 400);
    }

    await deleteFileFromR2(c, fileKey);

    return c.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return c.json(
      {
        error: 'Failed to delete file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default router;
