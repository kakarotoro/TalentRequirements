import { createClient } from "@supabase/supabase-js";

// Private storage buckets
export const STORAGE_BUCKETS = {
  KTP: "ktp",
  SELFIES: "selfies",
  VIDEOS: "videos",
  ATTENDANCE: "attendance",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

function getAdminStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-role-key";
  return createClient(supabaseUrl, serviceRoleKey);
}

/**
 * Generate a signed upload URL so the client can upload directly to Supabase Storage.
 * The client does not need the service role key.
 */
export async function createSignedUploadUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds: number = 300 // 5 minutes
): Promise<{ signedUrl: string; token: string; path: string }> {
  const supabase = getAdminStorageClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`Failed to generate signed upload URL: ${error?.message}`);
  }

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path,
  };
}

/**
 * Generate a temporary signed download URL for private files (e.g. for Admin review).
 * Valid for only 60 seconds by default.
 */
export async function createSignedDownloadUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds: number = 60
): Promise<string> {
  const supabase = getAdminStorageClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) {
    throw new Error(`Failed to generate signed download URL: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Download file buffer directly on the server (e.g. for passing to Rekognition).
 */
export async function getFileBuffer(
  bucket: StorageBucket,
  path: string
): Promise<Buffer> {
  const supabase = getAdminStorageClient();
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error(`Failed to download file from storage: ${error?.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
