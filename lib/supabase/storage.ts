import { isSupabaseConfigured, supabase } from './client';
import { uid } from '@/lib/utils';

const BUCKET = 'product-images';
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 4 * 1024 * 1024; // 4MB

export type UploadError =
  | { kind: 'not_configured' }
  | { kind: 'invalid_mime'; got: string }
  | { kind: 'too_large'; got: number }
  | { kind: 'upload_failed'; message: string };

export async function uploadProductImage(file: File): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw Object.assign(new Error('Supabase not configured'), { kind: 'not_configured' });
  }
  if (!ALLOWED_MIMES.includes(file.type)) {
    throw Object.assign(new Error(`Unsupported file type: ${file.type}`), {
      kind: 'invalid_mime',
      got: file.type,
    });
  }
  if (file.size > MAX_BYTES) {
    throw Object.assign(new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB`), {
      kind: 'too_large',
      got: file.size,
    });
  }

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${new Date().getFullYear()}/${uid()}.${ext}`;

  const { data, error } = await supabase().storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    throw Object.assign(new Error(error.message), { kind: 'upload_failed', message: error.message });
  }
  const { data: pub } = supabase().storage.from(BUCKET).getPublicUrl(data.path);
  return pub.publicUrl;
}
