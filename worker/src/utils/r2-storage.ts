/**
 * R2 Storage Handler for Cloudflare Workers
 * Manages file uploads, downloads, and deletion using R2 API
 */

import { Context } from 'hono';

interface SignedUrlParams {
  fileKey: string;
  expiresIn?: number;
}

/**
 * Generate a signed URL for uploading to R2
 * The client can use this URL to upload files directly
 */
export async function generateSignedUploadUrl(
  c: Context,
  fileName: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<{ uploadUrl: string; fileKey: string }> {
  try {
    const env = c.env as any;
    const r2 = env.R2_BUCKET;

    if (!r2) {
      throw new Error('R2 bucket not configured');
    }

    // Generate a unique file key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const fileKey = `documents/${timestamp}-${random}/${fileName}`;

    // For Cloudflare Workers, we'll use the direct upload URL format
    // In production, you'd generate a proper signed URL using AWS SDK or Cloudflare API
    const uploadUrl = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${env.BUCKET_NAME}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
    };
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    throw error;
  }
}

/**
 * Generate a signed URL for downloading from R2
 */
export async function generateSignedDownloadUrl(
  c: Context,
  fileKey: string,
  expiresIn: number = 3600
): Promise<{ downloadUrl: string }> {
  try {
    const env = c.env as any;

    // For Cloudflare R2, we can generate a direct public URL if the bucket is public
    // Or we can use signed URLs with the R2 API
    const baseUrl = env.R2_BUCKET_PUBLIC_URL || `https://sr-prevencion-files.electrocicla.workers.dev`;
    const downloadUrl = `${baseUrl}/${fileKey}`;

    return {
      downloadUrl,
    };
  } catch (error) {
    console.error('Error generating signed download URL:', error);
    throw error;
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFileFromR2(
  c: Context,
  fileKey: string
): Promise<void> {
  try {
    const env = c.env as any;
    const r2 = env.R2_BUCKET;

    if (!r2) {
      throw new Error('R2 bucket not configured');
    }

    await r2.delete(fileKey);
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    throw error;
  }
}

/**
 * Get file metadata from R2
 */
export async function getFileMetadata(
  c: Context,
  fileKey: string
): Promise<any> {
  try {
    const env = c.env as any;
    const r2 = env.R2_BUCKET;

    if (!r2) {
      throw new Error('R2 bucket not configured');
    }

    const object = await r2.head(fileKey);
    return object;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}
