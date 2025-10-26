/**
 * R2 Storage Utilities
 * Cloudflare R2 integration for file storage and retrieval
 */

import { config } from '../config';

interface SignedUrlOptions {
  expiresIn?: number; // seconds, default 3600 (1 hour)
}

/**
 * Generate a signed upload URL for R2
 * Client can use this URL to upload files directly to R2
 */
export async function generateSignedUploadUrl(
  fileName: string,
  contentType: string,
  options?: SignedUrlOptions
): Promise<{ uploadUrl: string; fileKey: string }> {
  try {
    const response = await fetch(`${config.apiUrl}/r2/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        fileName,
        contentType,
        expiresIn: options?.expiresIn || 3600,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate upload URL');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    throw error;
  }
}

/**
 * Upload a file directly to R2 using signed URL
 */
export async function uploadFileToR2(
  file: File,
  uploadUrl: string
): Promise<void> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to R2');
    }
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw error;
  }
}

/**
 * Generate a signed download URL for R2
 * Returns a URL that can be used to download the file
 */
export async function generateSignedDownloadUrl(
  fileKey: string,
  options?: SignedUrlOptions
): Promise<string> {
  try {
    const response = await fetch(`${config.apiUrl}/r2/download-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        fileKey,
        expiresIn: options?.expiresIn || 3600,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate download URL');
    }

    const data = await response.json();
    return data.downloadUrl;
  } catch (error) {
    console.error('Error generating signed download URL:', error);
    throw error;
  }
}

/**
 * Delete a file from R2
 */
export async function deleteFileFromR2(fileKey: string): Promise<void> {
  try {
    const response = await fetch(`${config.apiUrl}/r2/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ fileKey }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete file from R2');
    }
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    throw error;
  }
}

/**
 * Upload multiple files (frente and optional dorso)
 * For now, returns placeholder keys - actual upload will be handled by backend
 */
export async function uploadDocumentFiles(
  fileFrente: File,
  fileDorso?: File
): Promise<{ keyFrente: string; keyDorso?: string }> {
  try {
    // In production, these would be uploaded to R2 via signed URLs
    // For now, we return placeholder keys that the backend will use
    const timestamp = Date.now();
    const results = {
      keyFrente: `documents/${timestamp}/${fileFrente.name}`,
      keyDorso: fileDorso ? `documents/${timestamp}/${fileDorso.name}` : undefined,
    };

    console.log('Document files keys generated:', results);
    return results;
  } catch (error) {
    console.error('Error uploading document files:', error);
    throw error;
  }
}
