import { SignJWT, jwtVerify, createRemoteJWKSet, type JWTPayload } from 'jose';
import type { Env, AuthContext } from '../types';

const JWT_ALGORITHM = 'HS256';

/**
 * Generate a JWT token for a user
 */
export async function generateToken(
  payload: { userId: string; email: string; role: string },
  env: Env
): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET || 'fallback-secret-change-me');
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  
  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string, env: Env): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET || 'fallback-secret-change-me');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Validate Cloudflare Access JWT for professionals/admin
 * This should be used for routes that require Cloudflare Access authentication
 */
export async function validateCfAccessJwt(request: Request): Promise<JWTPayload | null> {
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return null;

  try {
    // In production, replace with your actual Cloudflare Access team domain
    const TEAM_DOMAIN = process.env.CF_ACCESS_TEAM_DOMAIN || 'your-team.cloudflareaccess.com';
    const JWKS_URL = `https://${TEAM_DOMAIN}/cdn-cgi/access/certs`;
    
    const JWKS = createRemoteJWKSet(new URL(JWKS_URL));
    const { payload } = await jwtVerify(jwt, JWKS);
    
    return payload;
  } catch (error) {
    console.error('CF Access JWT validation failed:', error);
    return null;
  }
}

/**
 * Extract auth context from request
 */
export async function getAuthContext(request: Request, env: Env): Promise<AuthContext | null> {
  // Try custom JWT first (for clients)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = await verifyToken(token, env);
    if (payload && payload.userId && payload.email && payload.role) {
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as 'user' | 'professional' | 'admin',
      };
    }
  }

  // Try Cloudflare Access JWT (for professionals/admin)
  const cfPayload = await validateCfAccessJwt(request);
  if (cfPayload && cfPayload.email) {
    // You would need to look up the user in DB by email to get userId and role
    // This is a simplified version
    return {
      userId: cfPayload.sub as string || '',
      email: cfPayload.email as string,
      role: 'professional', // or 'admin' - determine from DB or JWT claims
    };
  }

  return null;
}

/**
 * Require authentication middleware
 */
export function requireAuth(allowedRoles?: ('user' | 'professional' | 'admin')[]) {
  return async (c: any, next: any) => {
    const authContext = await getAuthContext(c.req.raw, c.env);
    
    if (!authContext) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (allowedRoles && !allowedRoles.includes(authContext.role)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    c.set('authContext', authContext);
    await next();
  };
}
