import { supabase } from '@/lib/supabase/client';
import { productToRowPatch, rowToProduct } from '@/lib/supabase/mappers';
import type { ProductRow } from '@/lib/supabase/types';
import type { Product } from '@/types';

type PcgRow = { product_id: string; custom_group_id: string };

async function attachCustomGroups(rows: ProductRow[]): Promise<Product[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const { data, error } = await supabase()
    .from('product_custom_groups')
    .select('product_id, custom_group_id')
    .in('product_id', ids);
  if (error) throw error;
  const byProduct = new Map<string, string[]>();
  (data as PcgRow[] | null)?.forEach((p) => {
    const list = byProduct.get(p.product_id) ?? [];
    list.push(p.custom_group_id);
    byProduct.set(p.product_id, list);
  });
  return rows.map((r) => rowToProduct(r, byProduct.get(r.id) ?? []));
}

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return attachCustomGroups((data ?? []) as ProductRow[]);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase()
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [p] = await attachCustomGroups([data as ProductRow]);
  return p;
}

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  const { data, error } = await supabase()
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [p] = await attachCustomGroups([data as ProductRow]);
  return p;
}

export async function createProduct(input: Product): Promise<Product> {
  // Preserve the client-generated UUID so local state and DB rows stay aligned.
  const patch = { ...productToRowPatch(input), id: input.id };
  const { data, error } = await supabase()
    .from('products')
    .insert(patch)
    .select('*')
    .single();
  if (error) throw error;
  if (input.customGroups?.length) {
    await replaceCustomGroups((data as ProductRow).id, input.customGroups);
  }
  return rowToProduct(data as ProductRow, input.customGroups ?? []);
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
  const rowPatch = productToRowPatch(patch);
  const { data, error } = await supabase()
    .from('products')
    .update(rowPatch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  if (patch.customGroups !== undefined) {
    await replaceCustomGroups(id, patch.customGroups);
  }
  const [p] = await attachCustomGroups([data as ProductRow]);
  return p;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase().from('products').delete().eq('id', id);
  if (error) throw error;
}

async function replaceCustomGroups(productId: string, customGroupIds: string[]) {
  const client = supabase();
  const { error: delErr } = await client
    .from('product_custom_groups')
    .delete()
    .eq('product_id', productId);
  if (delErr) throw delErr;
  if (customGroupIds.length === 0) return;
  const rows = customGroupIds.map((cg) => ({ product_id: productId, custom_group_id: cg }));
  const { error: insErr } = await client.from('product_custom_groups').insert(rows);
  if (insErr) throw insErr;
}
