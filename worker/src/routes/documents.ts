import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { requireAuth } from '../lib/jwt';
import { generateId } from '../lib/db';
import { generateSignedDownloadUrl } from '../utils/r2-storage';

const documents = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to require authentication
documents.use('/*', requireAuth());

/**
 * GET /api/documents/types - Obtener tipos de documentos requeridos
 */
documents.get('/types', async (c) => {
  try {
    const db = c.env.DB;

    const types = await db
      .prepare(
        `SELECT id, code, name, description, requires_front_back, requires_expiry_date, order_index, created_at
         FROM worker_document_types
         ORDER BY order_index ASC`
      )
      .all();

    return c.json({
      success: true,
      data: types.results || [],
    });
  } catch (error) {
    console.error('Error fetching document types:', error);
    return c.json({ error: 'Failed to fetch document types', message: (error as Error).message }, 500);
  }
});

/**
 * GET /api/documents/pending - Obtener documentos pendientes de revisión (solo para admin)
 */
documents.get('/pending', async (c) => {
  try {
    const authContext = c.get('authContext');
    const isAdmin = authContext.role === 'admin';
    const db = c.env.DB;

    if (!isAdmin) {
      return c.json({ error: 'Only admins can access pending documents' }, 403);
    }

    const docs = await db
      .prepare(
        `SELECT 
          wd.id, wd.worker_id, wd.document_type_id, 
          w.first_name, w.last_name, w.rut as worker_rut,
          co.id as company_id, co.name as company_name, co.rut as company_rut,
          wdt.code as document_type_code, wdt.name as document_type_name, wdt.description as document_type_description,
          wd.status, wd.emission_date, wd.expiry_date, wd.file_r2_key, wd.file_r2_key_back,
          wd.file_name, wd.file_size, wd.mime_type, wd.reviewed_by, wd.reviewed_at, wd.admin_comments,
          wd.created_at, wd.updated_at
         FROM worker_documents wd
         JOIN workers w ON wd.worker_id = w.id
         JOIN companies co ON w.company_id = co.id
         JOIN worker_document_types wdt ON wd.document_type_id = wdt.id
         WHERE wd.status IN ('PENDING', 'UNDER_REVIEW')
         ORDER BY wd.created_at ASC`
      )
      .all();

    const documents = (docs.results || []).map((doc: any) => ({
      ...doc,
      days_remaining: calculateDaysRemaining(doc.expiry_date as string | null),
    }));

    return c.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Error fetching pending documents:', error);
    return c.json({ error: 'Failed to fetch pending documents', message: (error as Error).message }, 500);
  }
});

/**
 * GET /api/documents/worker/:workerId - Obtener documentos de un trabajador
 */
documents.get('/worker/:workerId', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const workerId = c.req.param('workerId');
    const db = c.env.DB;

    // Verificar que el trabajador pertenece a una empresa del usuario
    const worker = await db
      .prepare(
        `SELECT w.id, w.company_id 
         FROM workers w 
         JOIN companies co ON w.company_id = co.id 
         WHERE w.id = ? AND co.user_id = ?`
      )
      .bind(workerId, userId)
      .first();

    if (!worker) {
      return c.json({ error: 'Worker not found or not authorized' }, 404);
    }

    // Obtener los documentos del trabajador
    const documentsList = await db
      .prepare(
        `SELECT wd.id, wd.worker_id, wd.document_type_id, wdt.code, wdt.name, wdt.description, 
                wdt.requires_front_back, wdt.requires_expiry_date,
                wd.status, wd.emission_date, wd.expiry_date, wd.file_r2_key, wd.file_r2_key_back, 
                wd.file_name, wd.file_size, wd.mime_type, wd.reviewed_by, wd.reviewed_at, wd.admin_comments,
                wd.created_at, wd.updated_at
         FROM worker_documents wd
         JOIN worker_document_types wdt ON wd.document_type_id = wdt.id
         WHERE wd.worker_id = ?
         ORDER BY wdt.order_index ASC, wd.created_at DESC`
      )
      .bind(workerId)
      .all();

    // Calcular días restantes para cada documento
    const documents = (documentsList.results || []).map((doc: any) => ({
      ...doc,
      days_remaining: calculateDaysRemaining(doc.expiry_date as string | null),
    }));

    return c.json({
      success: true,
      data: documents,
      total: documents.length,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return c.json({ error: 'Failed to fetch documents', message: (error as Error).message }, 500);
  }
});

/**
 * GET /api/documents/:id - Obtener documento específico
 */
documents.get('/:id', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const docId = c.req.param('id');
    const db = c.env.DB;

    const doc = await db
      .prepare(
        `SELECT wd.id, wd.worker_id, wd.document_type_id, wdt.code, wdt.name, wdt.description,
                wdt.requires_front_back, wdt.requires_expiry_date,
                wd.status, wd.emission_date, wd.expiry_date, wd.file_r2_key, wd.file_r2_key_back,
                wd.file_name, wd.file_size, wd.mime_type, wd.reviewed_by, wd.reviewed_at, wd.admin_comments,
                wd.created_at, wd.updated_at
         FROM worker_documents wd
         JOIN worker_document_types wdt ON wd.document_type_id = wdt.id
         WHERE wd.id = ?`
      )
      .bind(docId)
      .first();

    if (!doc) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Verificar que el trabajador pertenece a una empresa del usuario
    const worker = await db
      .prepare(
        `SELECT w.id FROM workers w 
         JOIN companies c ON w.company_id = c.id 
         WHERE w.id = ? AND c.user_id = ?`
      )
      .bind(doc.worker_id, userId)
      .first();

    if (!worker) {
      return c.json({ error: 'Document not authorized for your account' }, 403);
    }

    return c.json({
      success: true,
      data: {
        ...doc,
        days_remaining: calculateDaysRemaining(doc.expiry_date as string | null),
      },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return c.json({ error: 'Failed to fetch document', message: (error as Error).message }, 500);
  }
});

/**
 * POST /api/documents - Crear nuevo documento
 */
documents.post('/', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const body = await c.req.json();
    const db = c.env.DB;

    const { worker_id, document_type_id, emission_date, expiry_date, file_r2_key, file_r2_key_back, file_name, file_size, mime_type } = body;

    if (!worker_id || !document_type_id || !file_r2_key) {
      return c.json(
        { error: 'Missing required fields: worker_id, document_type_id, file_r2_key' },
        400
      );
    }

    // Verificar que el trabajador pertenece a una empresa del usuario
    const worker = await db
      .prepare(
        `SELECT w.id FROM workers w 
         JOIN companies c ON w.company_id = c.id 
         WHERE w.id = ? AND c.user_id = ?`
      )
      .bind(worker_id, userId)
      .first();

    if (!worker) {
      return c.json({ error: 'Worker not found or not authorized' }, 404);
    }

    // Verificar que el tipo de documento existe
    const docType = await db
      .prepare('SELECT id FROM worker_document_types WHERE id = ?')
      .bind(document_type_id)
      .first();

    if (!docType) {
      return c.json({ error: 'Document type not found' }, 404);
    }

    const docId = generateId('doc');
    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO worker_documents (id, worker_id, document_type_id, status, emission_date, expiry_date, file_r2_key, file_r2_key_back, file_name, file_size, mime_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        docId,
        worker_id,
        document_type_id,
        'PENDING', // Estado inicial
        emission_date || null,
        expiry_date || null,
        file_r2_key,
        file_r2_key_back || null,
        file_name || null,
        file_size || null,
        mime_type || null,
        now,
        now
      )
      .run();

    const document = await db
      .prepare('SELECT * FROM worker_documents WHERE id = ?')
      .bind(docId)
      .first();

    return c.json(
      {
        success: true,
        message: 'Document created successfully',
        data: {
          ...document,
          days_remaining: calculateDaysRemaining(document?.expiry_date as string | null ?? null),
        },
      },
      201
    );
  } catch (error) {
    console.error('Error creating document:', error);
    return c.json({ error: 'Failed to create document', message: (error as Error).message }, 500);
  }
});

/**
 * PUT /api/documents/:id - Actualizar documento (estado, fechas, comentarios)
 */
documents.put('/:id', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const isAdmin = authContext.role === 'admin';
    const docId = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;

    // Obtener el documento
    const doc = await db
      .prepare('SELECT worker_id FROM worker_documents WHERE id = ?')
      .bind(docId)
      .first();

    if (!doc) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Verificar permisos
    const worker = await db
      .prepare(
        `SELECT w.id FROM workers w 
         JOIN companies c ON w.company_id = c.id 
         WHERE w.id = ? AND c.user_id = ?`
      )
      .bind(doc.worker_id, userId)
      .first();

    if (!worker) {
      return c.json({ error: 'Document not authorized for your account' }, 403);
    }

    // Solo admins pueden cambiar estado y agregar comentarios
    const { status, emission_date, expiry_date, admin_comments } = body;
    const now = new Date().toISOString();

    const updates: string[] = [];
    const values: any[] = [];

    if (emission_date !== undefined) { updates.push('emission_date = ?'); values.push(emission_date); }
    if (expiry_date !== undefined) { updates.push('expiry_date = ?'); values.push(expiry_date); }

    // Solo si es admin
    if (isAdmin) {
      if (status !== undefined) { 
        updates.push('status = ?'); 
        values.push(status);
        updates.push('reviewed_at = ?');
        values.push(now);
        updates.push('reviewed_by = ?');
        values.push(userId);
      }
      if (admin_comments !== undefined) { updates.push('admin_comments = ?'); values.push(admin_comments); }
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(docId);

    if (updates.length > 1) { // Al menos updated_at
      await db
        .prepare(`UPDATE worker_documents SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run();
    }

    const updatedDoc = await db
      .prepare('SELECT * FROM worker_documents WHERE id = ?')
      .bind(docId)
      .first();

    return c.json({
      success: true,
      message: 'Document updated successfully',
      data: {
        ...updatedDoc,
        days_remaining: calculateDaysRemaining(updatedDoc?.expiry_date as string | null ?? null),
      },
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return c.json({ error: 'Failed to update document', message: (error as Error).message }, 500);
  }
});

/**
 * DELETE /api/documents/:id - Eliminar documento
 */
documents.delete('/:id', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const isAdmin = authContext.role === 'admin';
    const docId = c.req.param('id');
    const db = c.env.DB;

    // Obtener el documento
    const doc = await db
      .prepare('SELECT worker_id FROM worker_documents WHERE id = ?')
      .bind(docId)
      .first();

    if (!doc) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Verificar permisos (admin puede borrar cualquier documento, usuario normal solo los de sus trabajadores)
    if (!isAdmin) {
      const worker = await db
        .prepare(
          `SELECT w.id FROM workers w 
           JOIN companies c ON w.company_id = c.id 
           WHERE w.id = ? AND c.user_id = ?`
        )
        .bind(doc.worker_id, userId)
        .first();

      if (!worker) {
        return c.json({ error: 'Document not authorized for your account' }, 403);
      }
    }

    // Eliminar documento
    await db
      .prepare('DELETE FROM worker_documents WHERE id = ?')
      .bind(docId)
      .run();

    return c.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return c.json({ error: 'Failed to delete document', message: (error as Error).message }, 500);
  }
});

/**
 * GET /api/documents/download/:documentId - Obtener URL para descargar documento
 */
documents.get('/download/:documentId', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const docId = c.req.param('documentId');
    const db = c.env.DB;

    // Obtener el documento
    const doc = await db
      .prepare('SELECT worker_id, file_r2_key, file_r2_key_back FROM worker_documents WHERE id = ?')
      .bind(docId)
      .first();

    if (!doc) {
      return c.json({ error: 'Document not found' }, 404);
    }

    // Verificar permisos
    const worker = await db
      .prepare(
        `SELECT w.id FROM workers w 
         JOIN companies c ON w.company_id = c.id 
         WHERE w.id = ? AND c.user_id = ?`
      )
      .bind(doc.worker_id, userId)
      .first();

    if (!worker) {
      return c.json({ error: 'Document not authorized for your account' }, 403);
    }

    // Generar URL firmada para descarga
    const { downloadUrl } = await generateSignedDownloadUrl(
      c,
      doc.file_r2_key as string
    );

    return c.json({
      success: true,
      data: {
        downloadUrl,
        file_r2_key_back: doc.file_r2_key_back,
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return c.json({ error: 'Failed to download document', message: (error as Error).message }, 500);
  }
});

/**
 * POST /api/documents/upload - Subir documento de trabajador
 */
documents.post('/upload', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;

    // Parse multipart form data
    const formData = await c.req.formData();
    const workerId = formData.get('worker_id') as string;
    const documentTypeId = formData.get('document_type_id') as string;
    const emissionDate = formData.get('emission_date') as string | null;
    const expiryDate = formData.get('expiry_date') as string | null;
    const fileEntry = formData.get('file');
    const fileBackEntry = formData.get('file_back');

    if (!workerId || !documentTypeId || !fileEntry) {
      return c.json(
        { error: 'Missing required fields: worker_id, document_type_id, file' },
        400
      );
    }

    if (typeof fileEntry === 'string') {
      return c.json({ error: 'Invalid file format' }, 400);
    }

    const file = fileEntry as File;
    const fileBack = fileBackEntry && typeof fileBackEntry !== 'string' ? fileBackEntry as File : null;

    // Verificar que el trabajador pertenece a una empresa del usuario
    const worker = await c.env.DB
      .prepare(
        `SELECT w.id FROM workers w 
         JOIN companies c ON w.company_id = c.id 
         WHERE w.id = ? AND c.user_id = ?`
      )
      .bind(workerId, userId)
      .first();

    if (!worker) {
      return c.json({ error: 'Worker not found or not authorized' }, 404);
    }

    // Verificar que el tipo de documento existe
    const docType = await c.env.DB
      .prepare('SELECT id FROM worker_document_types WHERE id = ?')
      .bind(documentTypeId)
      .first();

    if (!docType) {
      return c.json({ error: 'Document type not found' }, 404);
    }

    // Generate unique file keys
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const fileKey = `documents/${timestamp}-${random}/FRONT.${file.name.split('.').pop()}`;
    const fileKeyBack = fileBack ? `documents/${timestamp}-${random}/BACK.${fileBack.name.split('.').pop()}` : null;

    // Upload files to R2
    const fileBuffer = await file.arrayBuffer();
    await c.env.FILESTORE.put(fileKey, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    if (fileBack && fileKeyBack) {
      const fileBackBuffer = await fileBack.arrayBuffer();
      await c.env.FILESTORE.put(fileKeyBack, fileBackBuffer, {
        httpMetadata: {
          contentType: fileBack.type,
        },
      });
    }

    // Create document record in database
    const docId = generateId('doc');
    const now = new Date().toISOString();

    await c.env.DB
      .prepare(
        `INSERT INTO worker_documents (id, worker_id, document_type_id, status, emission_date, expiry_date, file_r2_key, file_r2_key_back, file_name, file_size, mime_type, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        docId,
        workerId,
        documentTypeId,
        'UNDER_REVIEW', // Estado inicial: En espera de revisión
        emissionDate || null,
        expiryDate || null,
        fileKey,
        fileKeyBack || null,
        file.name,
        file.size,
        file.type,
        now,
        now
      )
      .run();

    return c.json({
      success: true,
      data: {
        id: docId,
        file_r2_key: fileKey,
        file_r2_key_back: fileKeyBack,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return c.json({ error: 'Failed to upload document', message: (error as Error).message }, 500);
  }
});

/**
 * Helper: Calcular días restantes hasta vencimiento
 */
function calculateDaysRemaining(expiryDate: string | null): number | null {
  if (!expiryDate) return null;

  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export default documents;
