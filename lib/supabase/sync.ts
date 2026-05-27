// Optional Supabase sync layer.
// Activates only when NEXT_PUBLIC_SUPABASE_URL is set; otherwise no-ops and
// the existing localStorage flow stays in charge.
//
// Imported by dataStore.ts. No reverse import — sync exports a fetchAll()
// helper instead of grabbing the store directly, which keeps the module graph
// acyclic.

import { isSupabaseConfigured, supabase } from './client';
import { listProducts }      from '@/lib/api/products';
import { listCategories }    from '@/lib/api/categories';
import { listGroups }        from '@/lib/api/groups';
import { listCustomGroups }  from '@/lib/api/custom_groups';
import { listOrders }        from '@/lib/api/orders';
import type { Category, CustomGroup, Order, Product, ProductGroup } from '@/types';

export type CatalogSnapshot = {
  products: Product[];
  categories: Category[];
  groups: ProductGroup[];
  customGroups: CustomGroup[];
};

export type OrderSnapshot = { orders: Order[] };

// Public catalog: anon key + RLS public-read. Safe to call without a session.
export async function fetchCatalog(): Promise<CatalogSnapshot | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const [products, categories, groups, customGroups] = await Promise.all([
      listProducts(),
      listCategories(),
      listGroups(),
      listCustomGroups(),
    ]);
    return { products, categories, groups, customGroups };
  } catch (err) {
    console.warn('[supabase-sync] fetchCatalog failed:', err);
    return null;
  }
}

// Orders: requires a signed-in session (RLS gates on customer_id = auth.uid()
// or admin role). Skip the call when no user.
export async function fetchOrders(): Promise<OrderSnapshot | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data: { user } } = await supabase().auth.getUser();
    if (!user) return null;
    const orders = await listOrders();
    return { orders };
  } catch (err) {
    console.warn('[supabase-sync] fetchOrders failed:', err);
    return null;
  }
}

// Fire-and-forget helper — wraps a promise so callers never await.
// Errors log to console but never bubble into store actions.
export function pushAsync<T>(label: string, promise: Promise<T>): void {
  if (!isSupabaseConfigured()) return;
  promise.catch((err) => {
    console.warn(`[supabase-sync] ${label} failed:`, err);
  });
}
