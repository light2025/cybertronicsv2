import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// New projects use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sb_publishable_…).
// Older projects use NEXT_PUBLIC_SUPABASE_ANON_KEY (eyJ… JWT).
// Both work as the same browser-side key — accept either.
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!_client) {
    if (!url || !key) {
      throw new Error(
        '[supabase] NEXT_PUBLIC_SUPABASE_URL or ' +
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing. ' +
        'Copy .env.local.example to .env.local and fill them in.'
      );
    }
    _client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return _client;
}

export const isSupabaseConfigured = (): boolean => Boolean(url && key);
