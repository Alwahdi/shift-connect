/**
 * @syndeocare/storage — File Upload Utilities
 *
 * Type-safe wrappers around Supabase Storage for
 * avatars, documents, and chat files.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type StorageBucket = "avatars" | "documents" | "chat-files";

interface UploadOptions {
  bucket: StorageBucket;
  path: string;
  file: File;
  upsert?: boolean;
}

interface UploadResult {
  url: string;
  path: string;
  error: Error | null;
}

/**
 * Upload a file to Supabase Storage.
 *
 * @example
 * const { url } = await uploadFile(supabase, {
 *   bucket: "avatars",
 *   path: `${userId}/avatar.jpg`,
 *   file: avatarFile,
 *   upsert: true,
 * });
 */
export async function uploadFile(
  supabase: SupabaseClient,
  { bucket, path, file, upsert = false }: UploadOptions
): Promise<UploadResult> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert,
    });

  if (error) {
    return { url: "", path: "", error: error as unknown as Error };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return {
    url: urlData.publicUrl,
    path,
    error: null,
  };
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  path: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error: error as unknown as Error | null };
}

/**
 * Get a signed URL for private file access.
 */
export async function getSignedUrl(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600
): Promise<{ url: string; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  return {
    url: data?.signedUrl ?? "",
    error: error as unknown as Error | null,
  };
}

/**
 * Validate file before upload.
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedTypes } = options;

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File exceeds ${maxSizeMB}MB limit` };
  }

  if (allowedTypes && !allowedTypes.some((t) => file.type.match(t))) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Accepted: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}
