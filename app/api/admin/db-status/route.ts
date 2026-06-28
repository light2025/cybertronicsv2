import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const REQUIRED_TABLES = ['categories', 'products', 'orders', 'product_groups', 'custom_groups', 'profiles'];

export async function GET() {
  try {
    const admin = supabaseAdmin();
    const results: Record<string, { exists: boolean; rows?: number; error?: string }> = {};

    for (const table of REQUIRED_TABLES) {
      try {
        const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true });
        if (error) {
          results[table] = { exists: false, error: error.message };
        } else {
          results[table] = { exists: true, rows: count ?? 0 };
        }
      } catch (e) {
        results[table] = { exists: false, error: String(e) };
      }
    }

    // Check storage bucket
    const { data: buckets } = await admin.storage.listBuckets();
    const hasBucket = buckets?.some((b) => b.name === 'product-images') ?? false;

    const allTablesExist = REQUIRED_TABLES.every((t) => results[t]?.exists);

    return NextResponse.json({
      ok: allTablesExist,
      bucket: hasBucket ? 'product-images ✓' : 'product-images MISSING',
      tables: results,
      migrations_needed: !allTablesExist,
      hint: !allTablesExist
        ? 'Run: npx supabase link --project-ref edtoxcmzdsskklldhzsfv && npx supabase db push'
        : null,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
