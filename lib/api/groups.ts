import { supabase } from '@/lib/supabase/client';
import { rowToGroup } from '@/lib/supabase/mappers';
import type { ProductGroupRow } from '@/lib/supabase/types';
import type { ProductGroup } from '@/types';

export async function listGroups(): Promise<ProductGroup[]> {
  const { data, error } = await supabase()
    .from('product_groups')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ProductGroupRow[]).map(rowToGroup);
}

export async function createGroup(input: ProductGroup): Promise<ProductGroup> {
  const { data, error } = await supabase()
    .from('product_groups')
    .insert({
      id: input.id,
      title: input.title,
      slug: input.slug,
      description: input.description,
      cover_image: input.coverImage,
      is_active: input.isActive,
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToGroup(data as ProductGroupRow);
}

export async function updateGroup(
  id: string,
  patch: Partial<ProductGroup>
): Promise<ProductGroup> {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined)       row.title = patch.title;
  if (patch.slug !== undefined)        row.slug = patch.slug;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.coverImage !== undefined)  row.cover_image = patch.coverImage;
  if (patch.isActive !== undefined)    row.is_active = patch.isActive;
  const { data, error } = await supabase()
    .from('product_groups')
    .update(row)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return rowToGroup(data as ProductGroupRow);
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase().from('product_groups').delete().eq('id', id);
  if (error) throw error;
}
