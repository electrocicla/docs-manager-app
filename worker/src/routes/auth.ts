import { Hono } from 'hono';
import type { Env, Variables, AuthContext } from '../types';
import { generateToken, verifyToken, requireAuth } from '../lib/jwt';
import { getUserByEmail, createUser, getUserById, createAuditLog } from '../lib/db';
import { hashPassword, verifyPassword, checkRegistrationRateLimit, checkLoginRateLimit, resetLoginAttempts } from '../lib/crypto';
import { generateId } from '../lib/db';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// Rate limiting is now handled in crypto.ts

// Signup endpoint
auth.post('/signup', async (c) => {
  try {
    const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';

    // Check rate limit
    const rateLimitCheck = checkRegistrationRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return c.json({ error: rateLimitCheck.message }, 429);
    }

    const body = await c.req.json();
    const { email, full_name, password, role = 'user' } = body;

    // Sanitize inputs
    const sanitizedEmail = email?.toString().trim().toLowerCase() || '';
    const sanitizedFullName = full_name?.toString().trim() || '';
    const sanitizedPassword = password?.toString() || '';

    if (!sanitizedEmail || !sanitizedPassword) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return c.json({ error: 'Please provide a valid email address' }, 400);
    }

    // Additional validation
    if (!sanitizedFullName || sanitizedFullName.length < 2) {
      return c.json({ error: 'Full name is required and must be at least 2 characters' }, 400);
    }

    if (sanitizedPassword.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters long' }, 400);
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(c.env.DB, sanitizedEmail);
    if (existingUser) {
      return c.json({ error: 'Ya existe una cuenta con este correo electrónico' }, 409);
    }

    // Hash the password using PBKDF2
    const password_hash = await hashPassword(password);

    // Create user
    const user = await createUser(c.env.DB, {
      email: sanitizedEmail,
      full_name: sanitizedFullName,
      password_hash: password_hash,
      role: role as 'user' | 'professional' | 'admin',
    });

    // Generate JWT token
    const token = await generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      c.env
    );

    // Log audit
    await createAuditLog(c.env.DB, {
      user_id: user.id,
      action: 'USER_SIGNUP',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: clientIP,
      user_agent: c.req.header('user-agent'),
      details: { email: sanitizedEmail, role: user.role }
    });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user', message: error.message }, 500);
  }
});

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Check login rate limit
    const rateLimitCheck = checkLoginRateLimit(clientIP, email.toLowerCase());
    if (!rateLimitCheck.allowed) {
      return c.json({ error: rateLimitCheck.message }, 429);
    }

    // Get user
    const user = await getUserByEmail(c.env.DB, email.toLowerCase());
    if (!user || !user.password_hash) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    // Reset login attempts on successful login
    resetLoginAttempts(clientIP, email.toLowerCase());

    // Generate JWT token
    const token = await generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      c.env
    );

    // Log audit
    await createAuditLog(c.env.DB, {
      user_id: user.id,
      action: 'USER_LOGIN',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: c.req.header('cf-connecting-ip'),
      user_agent: c.req.header('user-agent'),
    });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: 'Failed to login', message: error.message }, 500);
  }
});

// Get current user profile
auth.get('/me', requireAuth(), async (c) => {
  try {
    const authContext = c.get('authContext') as AuthContext;
    const user = await getUserById(c.env.DB, authContext.userId);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile', message: error.message }, 500);
  }
});

export default auth;
