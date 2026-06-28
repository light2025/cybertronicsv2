import { isSupabaseConfigured, supabase } from './client';
import { uid } from '@/lib/utils';

const BUCKET = 'product-images';

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_MIMES = [...IMAGE_MIMES, ...VIDEO_MIMES];

const IMAGE_MAX = 4 * 1024 * 1024;   // 4 MB
const VIDEO_MAX = 100 * 1024 * 1024; // 100 MB

export type MediaKind = 'image' | 'video';

export function mediaKind(mime: string): MediaKind {
  return VIDEO_MIMES.includes(mime) ? 'video' : 'image';
}

export type UploadError =
  | { kind: 'not_configured' }
  | { kind: 'invalid_mime'; got: string }
  | { kind: 'too_large'; got: number }
  | { kind: 'upload_failed'; message: string };

export async function uploadProductMedia(file: File): Promise<{ url: string; kind: MediaKind }> {
  if (!isSupabaseConfigured()) {
    throw Object.assign(new Error('Supabase not configured'), { kind: 'not_configured' });
  }
  if (!ALLOWED_MIMES.includes(file.type)) {
    throw Object.assign(new Error(`Unsupported file type: ${file.type}`), {
      kind: 'invalid_mime',
      got: file.type,
    });
  }
  const isVideo = VIDEO_MIMES.includes(file.type);
  const maxBytes = isVideo ? VIDEO_MAX : IMAGE_MAX;
  if (file.size > maxBytes) {
    throw Object.assign(
      new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${maxBytes / 1024 / 1024}MB)`),
      { kind: 'too_large', got: file.size }
    );
  }

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const dir  = isVideo ? 'videos' : 'images';
  const path = `${new Date().getFullYear()}/${dir}/${uid()}.${ext}`;

  const { data, error } = await supabase().storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    throw Object.assign(new Error(error.message), { kind: 'upload_failed', message: error.message });
  }
  const { data: pub } = supabase().storage.from(BUCKET).getPublicUrl(data.path);
  return { url: pub.publicUrl, kind: isVideo ? 'video' : 'image' };
}

// Back-compat alias used by existing code
export async function uploadProductImage(file: File): Promise<string> {
  const { url } = await uploadProductMedia(file);
  return url;
}
