import type { Env } from '../types';

/**
 * Sanitize filename to prevent path traversal and other security issues
 */
export function sanitizeFilename(filename: string): string {
  // Remove any directory path components
  const basename = filename.replace(/^.*[\\\/]/, '');
  // Remove any non-alphanumeric characters except dots, dashes, and underscores
  return basename.replace(/[^a-zA-Z0-9.-_]/g, '_');
}

/**
 * Generate R2 key for a file
 */
export function generateR2Key(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(filename);
  return `${userId}/${timestamp}-${sanitized}`;
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  data: ArrayBuffer | ReadableStream,
  options: {
    contentType?: string;
    metadata?: Record<string, string>;
  } = {}
): Promise<void> {
  await bucket.put(key, data, {
    httpMetadata: {
      contentType: options.contentType,
    },
    customMetadata: options.metadata,
  });
}

/**
 * Download file from R2
 */
export async function downloadFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return await bucket.get(key);
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key);
}

/**
 * Generate presigned URL for R2 file (simplified version)
 * Note: R2 presigned URLs require additional setup with Workers
 */
export function generatePresignedUrl(
  baseUrl: string,
  key: string,
  expiresIn: number = 3600
): string {
  // In production, implement proper presigned URL generation
  // This is a simplified version that assumes a proxy endpoint
  const expiry = Date.now() + expiresIn * 1000;
  return `${baseUrl}/api/files/download/${encodeURIComponent(key)}?expires=${expiry}`;
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number = 200 * 1024 * 1024): boolean {
  return size <= maxSize;
}

/**
 * Validate MIME type
 */
export function validateMimeType(mime: string, allowedTypes: string[]): boolean {
  const normalized = mime.toLowerCase();
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return normalized.startsWith(prefix);
    }
    return normalized === type;
  });
}

/**
 * Get allowed MIME types for documents
 */
export function getAllowedMimeTypes(): string[] {
  return [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
}
