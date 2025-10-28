/**
 * Crypto utilities for password hashing and verification
 * Uses Web Crypto API compatible with Cloudflare Workers
 * Implements PBKDF2 for secure password hashing
 */

/**
 * Hash a password using PBKDF2 with SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000; // High iteration count for security

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive key using PBKDF2
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );

  // Combine salt and derived key
  const combined = new Uint8Array(salt.length + derivedKey.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(derivedKey), salt.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a PBKDF2 hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // Decode the stored hash
    const combined = new Uint8Array(
      atob(storedHash)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const salt = combined.slice(0, 16);
    const storedKeyData = combined.slice(16);
    const iterations = 100000;

    const encoder = new TextEncoder();

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    // Derive key using same parameters
    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const computedKeyData = new Uint8Array(derivedKey);

    // Compare the computed key with the stored key
    if (computedKeyData.length !== storedKeyData.length) {
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    let result = 0;
    for (let i = 0; i < computedKeyData.length; i++) {
      result |= computedKeyData[i] ^ storedKeyData[i];
    }

    return result === 0;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// Rate limiting stores (in-memory for Cloudflare Workers)
interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockoutUntil?: number;
}

const registrationRateLimit = new Map<string, RateLimitEntry>();
const loginRateLimit = new Map<string, { attempts: number; lastAttempt: number; lockoutUntil?: number }>();

/**
 * Check registration rate limit (5 attempts per hour per IP)
 */
export function checkRegistrationRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 5;

  const entry = registrationRateLimit.get(ip);
  if (!entry) {
    registrationRateLimit.set(ip, { attempts: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Reset if window has passed
  if (now - entry.lastAttempt > windowMs) {
    registrationRateLimit.set(ip, { attempts: 1, lastAttempt: now });
    return { allowed: true };
  }

  if (entry.attempts >= maxAttempts) {
    return { allowed: false, message: 'Demasiados intentos de registro. Intente nuevamente en una hora.' };
  }

  entry.attempts++;
  entry.lastAttempt = now;
  return { allowed: true };
}

/**
 * Check login rate limit (5 attempts per 15 minutes per IP+email, 30 min lockout)
 */
export function checkLoginRateLimit(ip: string, email: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const lockoutMs = 30 * 60 * 1000; // 30 minutes
  const maxAttempts = 5;
  const key = `${ip}:${email}`;

  const entry = loginRateLimit.get(key);
  if (!entry) {
    loginRateLimit.set(key, { attempts: 1, lastAttempt: now });
    return { allowed: true };
  }

  // Check if currently locked out
  if (entry.lockoutUntil && now < entry.lockoutUntil) {
    const remainingMinutes = Math.ceil((entry.lockoutUntil - now) / (60 * 1000));
    return { allowed: false, message: `Cuenta bloqueada temporalmente. Intente nuevamente en ${remainingMinutes} minutos.` };
  }

  // Reset if window has passed and not locked out
  if (now - entry.lastAttempt > windowMs) {
    loginRateLimit.set(key, { attempts: 1, lastAttempt: now });
    return { allowed: true };
  }

  if (entry.attempts >= maxAttempts) {
    entry.lockoutUntil = now + lockoutMs;
    return { allowed: false, message: 'Demasiados intentos de inicio de sesión. Cuenta bloqueada por 30 minutos.' };
  }

  entry.attempts++;
  entry.lastAttempt = now;
  return { allowed: true };
}

/**
 * Reset login attempts on successful login
 */
export function resetLoginAttempts(ip: string, email: string): void {
  const key = `${ip}:${email}`;
  loginRateLimit.delete(key);
}