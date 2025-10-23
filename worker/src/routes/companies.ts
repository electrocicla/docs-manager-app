import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { requireAuth } from '../lib/jwt';
import { generateId } from '../lib/db';

const companies = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to require authentication
companies.use('/*', requireAuth());

/**
 * GET /api/companies - Obtener empresas del usuario actual
 */
companies.get('/', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const db = c.env.DB;

    const companiesList = await db
      .prepare(
        `SELECT id, user_id, name, rut, industry, address, city, region, phone, email, website, employees_count, description, logo_r2_key, status, created_at, updated_at
         FROM companies
         WHERE user_id = ?
         ORDER BY created_at DESC`
      )
      .bind(userId)
      .all();

    return c.json({
      success: true,
      data: companiesList.results || [],
      total: companiesList.results?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return c.json({ error: 'Failed to fetch companies', message: (error as Error).message }, 500);
  }
});

/**
 * GET /api/companies/:id - Obtener empresa por ID
 */
companies.get('/:id', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const companyId = c.req.param('id');
    const db = c.env.DB;

    const company = await db
      .prepare(
        `SELECT id, user_id, name, rut, industry, address, city, region, phone, email, website, employees_count, description, logo_r2_key, status, created_at, updated_at
         FROM companies
         WHERE id = ? AND user_id = ?`
      )
      .bind(companyId, userId)
      .first();

    if (!company) {
      return c.json({ error: 'Company not found' }, 404);
    }

    return c.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return c.json({ error: 'Failed to fetch company', message: (error as Error).message }, 500);
  }
});

/**
 * POST /api/companies - Crear nueva empresa
 */
companies.post('/', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const body = await c.req.json();
    const db = c.env.DB;

    // Validar campos requeridos
    const { name, rut, industry, address, city, region, phone, email, website, employees_count, description } = body;

    if (!name || !rut || !city || !region) {
      return c.json(
        { error: 'Missing required fields: name, rut, city, region' },
        400
      );
    }

    // Verificar que el RUT no esté duplicado para este usuario
    const existingCompany = await db
      .prepare('SELECT id FROM companies WHERE user_id = ? AND rut = ?')
      .bind(userId, rut)
      .first();

    if (existingCompany) {
      return c.json({ error: 'Company with this RUT already exists for your account' }, 409);
    }

    const companyId = generateId('company');
    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO companies (id, user_id, name, rut, industry, address, city, region, phone, email, website, employees_count, description, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        companyId,
        userId,
        name,
        rut,
        industry || null,
        address || null,
        city,
        region,
        phone || null,
        email || null,
        website || null,
        employees_count || null,
        description || null,
        'ACTIVE',
        now,
        now
      )
      .run();

    const company = await db
      .prepare('SELECT * FROM companies WHERE id = ?')
      .bind(companyId)
      .first();

    return c.json(
      {
        success: true,
        message: 'Company created successfully',
        data: company,
      },
      201
    );
  } catch (error) {
    console.error('Error creating company:', error);
    return c.json({ error: 'Failed to create company', message: (error as Error).message }, 500);
  }
});

/**
 * PUT /api/companies/:id - Actualizar empresa
 */
companies.put('/:id', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const companyId = c.req.param('id');
    const body = await c.req.json();
    const db = c.env.DB;

    // Verificar que la empresa pertenece al usuario
    const company = await db
      .prepare('SELECT id FROM companies WHERE id = ? AND user_id = ?')
      .bind(companyId, userId)
      .first();

    if (!company) {
      return c.json({ error: 'Company not found or not authorized' }, 404);
    }

    const { name, rut, industry, address, city, region, phone, email, website, employees_count, description, status } = body;
    const now = new Date().toISOString();

    // Construir query dinámico según campos proporcionados
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (rut !== undefined) { updates.push('rut = ?'); values.push(rut); }
    if (industry !== undefined) { updates.push('industry = ?'); values.push(industry); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (city !== undefined) { updates.push('city = ?'); values.push(city); }
    if (region !== undefined) { updates.push('region = ?'); values.push(region); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (website !== undefined) { updates.push('website = ?'); values.push(website); }
    if (employees_count !== undefined) { updates.push('employees_count = ?'); values.push(employees_count); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(companyId);
    values.push(userId);

    if (updates.length > 1) { // Al menos updated_at
      await db
        .prepare(`UPDATE companies SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`)
        .bind(...values)
        .run();
    }

    const updatedCompany = await db
      .prepare('SELECT * FROM companies WHERE id = ?')
      .bind(companyId)
      .first();

    return c.json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany,
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return c.json({ error: 'Failed to update company', message: (error as Error).message }, 500);
  }
});

/**
 * DELETE /api/companies/:id - Eliminar empresa (cambiar a INACTIVE)
 */
companies.delete('/:id', async (c) => {
  try {
    const authContext = c.get('authContext');
    const userId = authContext.userId;
    const companyId = c.req.param('id');
    const db = c.env.DB;

    // Verificar que la empresa pertenece al usuario
    const company = await db
      .prepare('SELECT id FROM companies WHERE id = ? AND user_id = ?')
      .bind(companyId, userId)
      .first();

    if (!company) {
      return c.json({ error: 'Company not found or not authorized' }, 404);
    }

    // Cambiar estado a INACTIVE en lugar de borrar
    const now = new Date().toISOString();
    await db
      .prepare('UPDATE companies SET status = ?, updated_at = ? WHERE id = ?')
      .bind('INACTIVE', now, companyId)
      .run();

    return c.json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return c.json({ error: 'Failed to delete company', message: (error as Error).message }, 500);
  }
});

export default companies;
