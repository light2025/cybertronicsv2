import { supabase } from '@/lib/supabase/client';
import type { CustomGroupRow } from '@/lib/supabase/types';

export type CustomGroup = {
  id: string;
  title: string;
  slug: string;
  description: string;
  createdAt: string;
};

const rowToCustomGroup = (r: CustomGroupRow): CustomGroup => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  description: r.description,
  createdAt: r.created_at,
});

export async function listCustomGroups(): Promise<CustomGroup[]> {
  const { data, error } = await supabase()
    .from('custom_groups')
    .select('*')
    .order('title', { ascending: true });
  if (error) throw error;
  return (data as CustomGroupRow[]).map(rowToCustomGroup);
}

export async function createCustomGroup(
  input: Omit<CustomGroup, 'createdAt'>
): Promise<CustomGroup> {
  const { data, error } = await supabase()
    .from('custom_groups')
    .insert({
      id: input.id,
      title: input.title,
      slug: input.slug,
      description: input.description,
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToCustomGroup(data as CustomGroupRow);
}

export async function updateCustomGroup(
  id: string,
  patch: Partial<CustomGroup>
): Promise<CustomGroup> {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined)       row.title = patch.title;
  if (patch.slug !== undefined)        row.slug = patch.slug;
  if (patch.description !== undefined) row.description = patch.description;
  const { data, error } = await supabase()
    .from('custom_groups')
    .update(row)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return rowToCustomGroup(data as CustomGroupRow);
}

export async function deleteCustomGroup(id: string): Promise<void> {
  const { error } = await supabase().from('custom_groups').delete().eq('id', id);
  if (error) throw error;
}
