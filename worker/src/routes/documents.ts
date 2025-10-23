import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { requireAuth } from '../lib/jwt';
import { generateId } from '../lib/db';

const documents = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to require authentication
documents.use('/*', requireAuth());

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

    // Verificar permisos (solo admin puede borrar)
    if (!isAdmin) {
      return c.json({ error: 'Only admins can delete documents' }, 403);
    }

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

    // Aquí se devolvería la URL firmada de R2
    // Por ahora, devolvemos los keys de R2 para ser descargados por el frontend
    return c.json({
      success: true,
      data: {
        file_r2_key: doc.file_r2_key,
        file_r2_key_back: doc.file_r2_key_back,
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return c.json({ error: 'Failed to download document', message: (error as Error).message }, 500);
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
