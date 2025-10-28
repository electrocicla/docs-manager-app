/**
 * Crypto utilities for password hashing and verification
 * Uses Web Crypto API compatible with Cloudflare Workers
 */

/**
 * Hash a password using SHA-256 with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Create a simple hash: salt + password
  const data = new Uint8Array(salt.length + password.length);
  data.set(salt);
  data.set(encoder.encode(password), salt.length);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Combine salt and hash
  const combined = new Uint8Array(salt.length + hashBuffer.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hashBuffer), salt.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a hash
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
    const storedHashData = combined.slice(16);

    const encoder = new TextEncoder();
    const data = new Uint8Array(salt.length + password.length);
    data.set(salt);
    data.set(encoder.encode(password), salt.length);

    const computedHash = await crypto.subtle.digest('SHA-256', data);
    const computedHashData = new Uint8Array(computedHash);

    // Compare the computed hash with the stored hash
    if (computedHashData.length !== storedHashData.length) {
      return false;
    }

    return computedHashData.every((byte, index) => byte === storedHashData[index]);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}