import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { requireAuth } from '../lib/jwt';
import { generateId } from '../lib/db';

const workers = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to require authentication
workers.use('/*', requireAuth());

/**
 * GET /api/workers?companyId=:companyId - Obtener trabajadores de una empresa
 */
workers.get('/', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const companyId = c.req.query('companyId');
    const db = c.env.DB;

    if (!companyId) {
      return c.json({ error: 'companyId query parameter is required' }, 400);
    }

    // Verificar que la empresa pertenece al usuario
    const company = await db
      .prepare('SELECT id FROM companies WHERE id = ? AND user_id = ?')
      .bind(companyId, userId)
      .first();

    if (!company) {
      return c.json({ error: 'Company not found or not authorized' }, 404);
    }

    const workersList = await db
      .prepare(
        `SELECT id, company_id, first_name, last_name, rut, email, phone, job_title, department, profile_image_r2_key, additional_comments, status, created_at, updated_at
         FROM workers
         WHERE company_id = ?
         ORDER BY created_at DESC`
      )
      .bind(companyId)
      .all();

    return c.json({
      success: true,
      data: workersList.results || [],
      total: workersList.results?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return c.json({ error: 'Failed to fetch workers', message: (error as Error).message }, 500);
  }
});

/**
 * GET /api/workers/:id - Obtener trabajador por ID
 */
workers.get('/:id', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const workerId = c.req.param('id');
    const db = c.env.DB;

    // Primero obtener el trabajador
    const worker = await db
      .prepare(
        `SELECT w.id, w.company_id, w.first_name, w.last_name, w.rut, w.email, w.phone, w.job_title, w.department, w.profile_image_r2_key, w.additional_comments, w.status, w.created_at, w.updated_at
         FROM workers w
         WHERE w.id = ?`
      )
      .bind(workerId)
      .first();

    if (!worker) {
      return c.json({ error: 'Worker not found' }, 404);
    }

    // Verificar que la empresa pertenece al usuario
    const company = await db
      .prepare('SELECT id FROM companies WHERE id = ? AND user_id = ?')
      .bind(worker.company_id, userId)
      .first();

    if (!company) {
      return c.json({ error: 'Worker not authorized for your account' }, 403);
    }

    return c.json({
      success: true,
      data: worker,
    });
  } catch (error) {
    console.error('Error fetching worker:', error);
    return c.json({ error: 'Failed to fetch worker', message: (error as Error).message }, 500);
  }
});

/**
 * POST /api/workers - Crear nuevo trabajador
 */
workers.post('/', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const body = await c.req.json();
    const db = c.env.DB;

    const { company_id, first_name, last_name, rut, email, phone, job_title, department, additional_comments } = body;

    console.log('POST /workers - body recibido:', JSON.stringify(body));
    console.log('POST /workers - userId:', userId);

    // Validar y normalizar campos requeridos
    const companyIdValue = typeof company_id === 'string' ? company_id.trim() : '';
    const firstNameValue = typeof first_name === 'string' ? first_name.trim() : '';
    const lastNameValue = typeof last_name === 'string' ? last_name.trim() : '';
    const rutValue = typeof rut === 'string' ? rut.trim() : '';

    console.log('Campos extraídos:', { companyIdValue, firstNameValue, lastNameValue, rutValue });

    if (!companyIdValue || !firstNameValue || !lastNameValue || !rutValue) {
      console.log('Validación fallida - campos faltantes:', {
        company_id: !!companyIdValue,
        first_name: !!firstNameValue,
        last_name: !!lastNameValue,
        rut: !!rutValue,
      });
      return c.json(
        {
          error: 'Missing required fields',
          details: {
            company_id: !companyIdValue ? 'Company ID is required' : null,
            first_name: !firstNameValue ? 'First name is required' : null,
            last_name: !lastNameValue ? 'Last name is required' : null,
            rut: !rutValue ? 'RUT is required' : null,
          },
        },
        400
      );
    }

    // Verificar que la empresa pertenece al usuario
    const company = await db
      .prepare('SELECT id FROM companies WHERE id = ? AND user_id = ?')
      .bind(companyIdValue, userId)
      .first();

    if (!company) {
      return c.json({ error: 'Company not found or not authorized' }, 404);
    }

    // Verificar que el RUT no esté duplicado en esta empresa
    const existingWorker = await db
      .prepare('SELECT id FROM workers WHERE company_id = ? AND rut = ?')
      .bind(companyIdValue, rutValue)
      .first();

    if (existingWorker) {
      return c.json(
        {
          error: 'Duplicate worker RUT',
          message: `Ya existe un trabajador con el RUT ${rutValue} en esta empresa. Por favor usa un RUT diferente o verifica si el trabajador ya existe.`,
          rut: rutValue,
        },
        409
      );
    }

    // Normalizar campos opcionales
    const emailValue = email && typeof email === 'string' && email.trim() ? email.trim() : null;
    const phoneValue = phone && typeof phone === 'string' && phone.trim() ? phone.trim() : null;
    const jobTitleValue = job_title && typeof job_title === 'string' && job_title.trim() ? job_title.trim() : null;
    const departmentValue = department && typeof department === 'string' && department.trim() ? department.trim() : null;
    const commentsValue = additional_comments && typeof additional_comments === 'string' && additional_comments.trim() ? additional_comments.trim() : null;

    const workerId = generateId('worker');
    const now = new Date().toISOString();

    console.log('Valores a insertar:', {
      workerId,
      company_id: companyIdValue,
      first_name: firstNameValue,
      last_name: lastNameValue,
      rut: rutValue,
      email: emailValue,
      phone: phoneValue,
      job_title: jobTitleValue,
      department: departmentValue,
      additional_comments: commentsValue,
    });

    await db
      .prepare(
        `INSERT INTO workers (id, company_id, first_name, last_name, rut, email, phone, job_title, department, additional_comments, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        workerId,
        companyIdValue,
        firstNameValue,
        lastNameValue,
        rutValue,
        emailValue,
        phoneValue,
        jobTitleValue,
        departmentValue,
        commentsValue,
        'ACTIVE',
        now,
        now
      )
      .run();

    const worker = await db
      .prepare('SELECT * FROM workers WHERE id = ?')
      .bind(workerId)
      .first();

    return c.json(
      {
        success: true,
        message: 'Worker created successfully',
        data: worker,
      },
      201
    );
  } catch (error) {
    console.error('Error creating worker:', error);
    return c.json({ error: 'Failed to create worker', message: (error as Error).message }, 500);
  }
});

/**
 * PUT /api/workers/:id - Actualizar trabajador
 */
workers.put('/:id', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const workerId = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;

    // Obtener el trabajador y verificar permisos
    const worker = await db
      .prepare('SELECT company_id FROM workers WHERE id = ?')
      .bind(workerId)
      .first();

    if (!worker) {
      return c.json({ error: 'Worker not found' }, 404);
    }

    const company = await db
      .prepare('SELECT id FROM companies WHERE id = ? AND user_id = ?')
      .bind(worker.company_id, userId)
      .first();

    if (!company) {
      return c.json({ error: 'Worker not authorized for your account' }, 403);
    }

    const { first_name, last_name, rut, email, phone, job_title, department, additional_comments, status, profile_image_r2_key } = body;
    const now = new Date().toISOString();

    // Construir query dinámico según campos proporcionados
    const updates: string[] = [];
    const values: any[] = [];

    if (first_name !== undefined) { updates.push('first_name = ?'); values.push(first_name); }
    if (last_name !== undefined) { updates.push('last_name = ?'); values.push(last_name); }
    if (rut !== undefined) { updates.push('rut = ?'); values.push(rut); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (job_title !== undefined) { updates.push('job_title = ?'); values.push(job_title); }
    if (department !== undefined) { updates.push('department = ?'); values.push(department); }
    if (additional_comments !== undefined) { updates.push('additional_comments = ?'); values.push(additional_comments); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (profile_image_r2_key !== undefined) { updates.push('profile_image_r2_key = ?'); values.push(profile_image_r2_key); }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(workerId);

    if (updates.length > 1) { // Al menos updated_at
      await db
        .prepare(`UPDATE workers SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run();
    }

    const updatedWorker = await db
      .prepare('SELECT * FROM workers WHERE id = ?')
      .bind(workerId)
      .first();

    return c.json({
      success: true,
      message: 'Worker updated successfully',
      data: updatedWorker,
    });
  } catch (error) {
    console.error('Error updating worker:', error);
    return c.json({ error: 'Failed to update worker', message: (error as Error).message }, 500);
  }
});

/**
 * DELETE /api/workers/:id - Eliminar trabajador (DELETE real)
 */
workers.delete('/:id', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const workerId = c.req.param('id');
    const db = c.env.DB;

    // Obtener el trabajador y verificar permisos
    const worker = await db
      .prepare('SELECT company_id FROM workers WHERE id = ?')
      .bind(workerId)
      .first();

    if (!worker) {
      return c.json({ error: 'Worker not found' }, 404);
    }

    const company = await db
      .prepare('SELECT id FROM companies WHERE id = ? AND user_id = ?')
      .bind(worker.company_id, userId)
      .first();

    if (!company) {
      return c.json({ error: 'Worker not authorized for your account' }, 403);
    }

    // DELETE real - eliminar el trabajador completamente de la base de datos
    // Nota: Los documentos relacionados se eliminarán automáticamente
    // debido a las constraints ON DELETE CASCADE definidas en la base de datos
    await db
      .prepare('DELETE FROM workers WHERE id = ?')
      .bind(workerId)
      .run();

    return c.json({
      success: true,
      message: 'Worker deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting worker:', error);
    return c.json({ error: 'Failed to delete worker', message: (error as Error).message }, 500);
  }
});

export default workers;
