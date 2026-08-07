import { createClient } from '@supabase/supabase-js';
import { AuditLogger } from './logger';

export enum StorageFileStatus {
  AVAILABLE = 'AVAILABLE',
  METADATA_MISSING = 'METADATA_MISSING',
  FILE_MISSING = 'FILE_MISSING',
  URL_GENERATION_FAILED = 'URL_GENERATION_FAILED',
}

export interface StorageResource {
  bucket: string;
  path?: string;
  entityId?: string;
  entityType?: 'submission' | 'review' | 'certificate' | 'galley';
}

export interface FileMetadataResult {
  exists: boolean;
  status: StorageFileStatus;
  signedUrl?: string;
  mimeType?: string;
  size?: number;
  filename?: string;
  legacyFallbackUsed?: boolean;
  resolvedFolderPath?: string;
  error?: {
    code: string;
    message: string;
    provider: string;
  };
}

/**
 * Gets a server-side Supabase admin client for storage operations.
 */
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Validates a path and checks if the file actually exists in the given bucket.
 */
async function checkFileExists(bucket: string, fullPath: string): Promise<{ exists: boolean; size?: number; mimeType?: string; filename?: string; resolvedFolderPath?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const parts = fullPath.split('/');
    const fileName = parts.pop() || '';
    const folderPath = parts.join('/');

    const { data: files, error } = await supabase.storage.from(bucket).list(folderPath, { search: fileName });
    if (error) {
      return { exists: false };
    }

    // Exact match
    const fileNode = files?.find(f => f.name === fileName);
    if (fileNode && fileNode.id) {
      return {
        exists: true,
        size: fileNode.metadata?.size,
        mimeType: fileNode.metadata?.mimetype,
        filename: fileNode.name,
      };
    }
    
    // If not found as a file, maybe fullPath is actually a folder?
    // Let's try listing fullPath as a folder directly.
    const { data: folderFiles, error: folderError } = await supabase.storage.from(bucket).list(fullPath + '/');
    if (!folderError && folderFiles && folderFiles.length > 0) {
      const validFiles = folderFiles.filter(f => !f.name.includes('.emptyFolderPlaceholder'));
      if (validFiles.length > 0) {
        // Prefer anonymous file for reviewers, or just the first file
        const bestFile = validFiles.find(f => f.name.toLowerCase().includes('anonymous')) || validFiles[0];
        if (bestFile && bestFile.id) {
           return {
             exists: true,
             size: bestFile.metadata?.size,
             mimeType: bestFile.metadata?.mimetype,
             filename: bestFile.name,
             resolvedFolderPath: fullPath // Signal that it was actually a folder
           };
        }
      }
    }
    
    return { exists: false };
  } catch (err) {
    return { exists: false };
  }
}

/**
 * Generates a signed URL for a given bucket and path.
 */
async function generateSignedUrl(bucket: string, path: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    // 24 hours expiry
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24);
    if (error || !data?.signedUrl) {
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    return null;
  }
}

/**
 * Tries to perform legacy fallback resolution for orphaned or unhexed files.
 * This is a migration mechanism and should be removed once data is fully migrated.
 */
async function resolveLegacyFallback(resource: StorageResource): Promise<{ path: string; fileNode: any } | null> {
  const { bucket, entityId } = resource;
  if (!entityId) return null;

  try {
    const supabase = getSupabaseAdmin();
    
    // Fallback 1: Unhexed ID
    const unhexedId = Buffer.from(entityId.replace(/-/g, ''), 'hex').toString('utf8');
    
    // Sometimes the unhexed ID is slightly truncated or malformed, so let's try a partial match
    // e.g., if unhexedId is 'sub_178453030287', try searching 'sub_178453030'
    const partialMatch = unhexedId.length > 10 ? unhexedId.substring(0, unhexedId.length - 2) : unhexedId;

    if (unhexedId && unhexedId !== entityId) {
      const { data: files } = await supabase.storage.from(bucket).list(unhexedId + '/');
      if (files && files.length > 0) {
        // Find a plausible document
        const fileNode = files.find(f => !f.name.includes('.emptyFolderPlaceholder')) || files[0];
        if (fileNode && fileNode.name) {
          return { path: `${unhexedId}/${fileNode.name}`, fileNode };
        }
      } else {
        // Fallback 2: Check root bucket for file starting with partialMatch
        const { data: rootFiles } = await supabase.storage.from(bucket).list('', { search: partialMatch });
        if (rootFiles && rootFiles.length > 0) {
          // Exclude placeholders and find the one that matches our entityId best if possible
          const fileNode = rootFiles.find(f => !f.name.includes('.emptyFolderPlaceholder')) || rootFiles[0];
          if (fileNode && fileNode.name) {
             return { path: fileNode.name, fileNode };
          }
        }
      }
    }
  } catch (err) {
    // Ignore legacy lookup errors
  }
  
  return null;
}

/**
 * Resolves a file reference to a fully validated Signed URL with rich metadata.
 * Uses strict SSOT (Single Source of Truth) from the database path.
 */
export async function resolveFile(resource: StorageResource): Promise<FileMetadataResult> {
  let { bucket, path, entityId } = resource;

  // 1. Check if metadata path is completely missing
  if (!path) {
    let recoveredPath = null;
    if (entityId) {
      const fallback = await resolveLegacyFallback(resource);
      if (fallback) {
        recoveredPath = fallback.path;
      } else {
        // Try direct entityId folder
        try {
          const supabase = getSupabaseAdmin();
          const { data: files } = await supabase.storage.from(bucket).list(entityId + '/');
          if (files && files.length > 0) {
            const fileNode = files.find(f => !f.name.includes('.emptyFolderPlaceholder')) || files[0];
            if (fileNode && fileNode.name) {
              recoveredPath = `${entityId}/${fileNode.name}`;
            }
          }
        } catch (e) {}
      }
    }

    if (recoveredPath) {
      AuditLogger.info(`[METADATA_RECOVERED] Found orphaned file in storage for entity ${entityId}: ${recoveredPath}`);
      path = recoveredPath; // Rescue the path!
      
      // If we recovered it, we can just generate the signed URL directly here and return
      const signedUrl = await generateSignedUrl(bucket, path);
      if (signedUrl) {
          AuditLogger.info(`[METADATA_RECOVERED] Successfully generated signed URL for recovered path: ${path}`);
          return {
              exists: true,
              status: StorageFileStatus.AVAILABLE,
              signedUrl,
              filename: path.includes('/') ? path.split('/').pop() : path,
              legacyFallbackUsed: true
          };
      } else {
          AuditLogger.error(`[METADATA_RECOVERED] Failed to generate signed URL for recovered path: ${path}`);
          // Update DB if possible? Actually let's just fall back to standard metadata missing
      }
    } else {
      AuditLogger.warn(`[METADATA_MISSING] Missing path for entity ${entityId || 'unknown'}`);
      return {
        exists: false,
        status: StorageFileStatus.METADATA_MISSING,
        error: { code: 'METADATA_MISSING', message: 'No file path provided from database', provider: 'database' }
      };
    }
  }

  // 2. If it's already a full HTTP URL (external or previously generated public url)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return {
      exists: true,
      status: StorageFileStatus.AVAILABLE,
      signedUrl: path,
      filename: path.split('/').pop(),
    };
  }

  // 3. Strict SSOT resolution
  const fileMeta = await checkFileExists(bucket, path);

  if (fileMeta.exists) {
    // If it was actually a folder, append the real filename to the path
    if (fileMeta.resolvedFolderPath) {
      path = `${fileMeta.resolvedFolderPath}/${fileMeta.filename}`;
    }
    
    // Generate Signed URL
    const signedUrl = await generateSignedUrl(bucket, path);
    if (!signedUrl) {
      AuditLogger.error(`[URL_GENERATION_FAILED] Failed to generate signed url for ${path}`);
      return {
        ...fileMeta,
        status: StorageFileStatus.URL_GENERATION_FAILED,
        error: { code: 'SIGNED_URL_FAILED', message: 'Could not create signed URL', provider: 'supabase-storage' }
      };
    }

    return {
      ...fileMeta,
      status: StorageFileStatus.AVAILABLE,
      signedUrl,
    };
  }

  // 4. File missing in primary SSOT path -> Trigger Legacy Migration Fallback
  AuditLogger.warn(`[FILE_MISSING] Primary file missing for ${path}. Triggering Legacy Fallback.`);
  
  const legacyResult = await resolveLegacyFallback(resource);
  if (legacyResult) {
    const { path: legacyPath, fileNode } = legacyResult;
    const signedUrl = await generateSignedUrl(bucket, legacyPath);
    
    if (signedUrl) {
      AuditLogger.warn(`[LEGACY FALLBACK USED] Entity: ${entityId} | Original Path: ${path} | Found Path: ${legacyPath}`);
      return {
        exists: true,
        status: StorageFileStatus.AVAILABLE,
        signedUrl,
        size: fileNode.metadata?.size,
        mimeType: fileNode.metadata?.mimetype,
        filename: fileNode.name,
        legacyFallbackUsed: true,
      };
    }
  }

  // 5. Truly missing
  AuditLogger.error(`[FILE_MISSING] File completely missing for ${path} (including legacy fallbacks)`);
  return {
    exists: false,
    status: StorageFileStatus.FILE_MISSING,
    error: { code: 'OBJECT_NOT_FOUND', message: `File not found at path: ${path}`, provider: 'supabase-storage' }
  };
}
