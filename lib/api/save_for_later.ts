import { supabase } from '@/lib/supabase/client';
import type { SaveForLaterRow } from '@/lib/supabase/types';

export type SavedItem = {
  id: string;
  productId: string;
  selectedSize?: string;
  selectedColor?: string;
  savedAt: string;
};

const rowToSaved = (r: SaveForLaterRow): SavedItem => ({
  id: r.id,
  productId: r.product_id,
  selectedSize: r.selected_size ?? undefined,
  selectedColor: r.selected_color ?? undefined,
  savedAt: r.saved_at,
});

export async function listSaved(customerId: string): Promise<SavedItem[]> {
  const { data, error } = await supabase()
    .from('save_for_later')
    .select('*')
    .eq('customer_id', customerId)
    .order('saved_at', { ascending: false });
  if (error) throw error;
  return (data as SaveForLaterRow[]).map(rowToSaved);
}

export async function saveItem(
  customerId: string,
  productId: string,
  opts?: { size?: string; color?: string }
): Promise<SavedItem> {
  const { data, error } = await supabase()
    .from('save_for_later')
    .insert({
      customer_id: customerId,
      product_id: productId,
      selected_size: opts?.size ?? null,
      selected_color: opts?.color ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToSaved(data as SaveForLaterRow);
}

export async function unsaveItem(id: string): Promise<void> {
  const { error } = await supabase().from('save_for_later').delete().eq('id', id);
  if (error) throw error;
}
