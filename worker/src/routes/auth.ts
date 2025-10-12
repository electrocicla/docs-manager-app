import { Hono } from 'hono';
import type { Env, Variables, AuthContext } from '../types';
import { generateToken, verifyToken, requireAuth } from '../lib/jwt';
import { getUserByEmail, createUser, getUserById, createAuditLog } from '../lib/db';
import { generateId } from '../lib/db';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// Signup endpoint
auth.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, full_name, password, role = 'user' } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(c.env.DB, email);
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409);
    }

    // In production, hash the password with bcrypt or similar
    // For now, we'll store a simple hash (DO NOT USE IN PRODUCTION)
    const password_hash = await hashPassword(password);

    // Create user
    const user = await createUser(c.env.DB, {
      email,
      full_name,
      password_hash,
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
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user', message: error.message }, 500);
  }
});

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Get user
    const user = await getUserByEmail(c.env.DB, email);
    if (!user || !user.password_hash) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

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

// Simple password hashing (USE bcrypt OR scrypt IN PRODUCTION)
async function hashPassword(password: string): Promise<string> {
  // This is a placeholder - in production use proper hashing
  // For Workers, consider using @noble/hashes or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple password verification
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export default auth;
