import { supabase } from '@/lib/supabase/client';
import { rowToCategory } from '@/lib/supabase/mappers';
import type { CategoryRow } from '@/lib/supabase/types';
import type { Category } from '@/types';

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase()
    .from('categories')
    .select('*')
    .order('position', { ascending: true });
  if (error) throw error;
  return (data as CategoryRow[]).map(rowToCategory);
}

export async function listSubCategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabase()
    .from('categories')
    .select('*')
    .eq('parent_category', parentId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data as CategoryRow[]).map(rowToCategory);
}

export async function createCategory(
  input: Category & { position?: number }
): Promise<Category> {
  const { data, error } = await supabase()
    .from('categories')
    .insert({
      id: input.id,
      title: input.title,
      slug: input.slug,
      parent_category: input.parentCategory,
      icon: input.icon,
      position: input.position ?? 0,
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToCategory(data as CategoryRow);
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined)          row.title = patch.title;
  if (patch.slug !== undefined)           row.slug = patch.slug;
  if (patch.parentCategory !== undefined) row.parent_category = patch.parentCategory;
  if (patch.icon !== undefined)           row.icon = patch.icon;
  const { data, error } = await supabase()
    .from('categories')
    .update(row)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return rowToCategory(data as CategoryRow);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase().from('categories').delete().eq('id', id);
  if (error) throw error;
}
