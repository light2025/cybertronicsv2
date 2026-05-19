// Shared data store: products, groups, categories, orders.
// Persisted to localStorage. TODO(db): swap persist middleware for Supabase queries.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import type {
  Category,
  Order,
  Product,
  ProductGroup,
} from '@/types';
import { seedCategories, seedGroups, seedProducts } from '@/lib/data/seedProducts';
import { nowIso } from '@/lib/utils';

type DataState = {
  products: Product[];
  groups: ProductGroup[];
  categories: Category[];
  orders: Order[];

  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addGroup: (g: ProductGroup) => void;
  updateGroup: (id: string, patch: Partial<ProductGroup>) => void;
  deleteGroup: (id: string) => void;

  addCategory: (c: Category) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  placeOrder: (o: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;

  resetToSeed: () => void;
};

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      products: seedProducts,
      groups: seedGroups,
      categories: seedCategories,
      orders: [],

      addProduct: (p) =>
        set((s) => ({ products: [...s.products, p] })),
      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p
          ),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addGroup: (g) =>
        set((s) => ({ groups: [...s.groups, g] })),
      updateGroup: (id, patch) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === id ? { ...g, ...patch, updatedAt: nowIso() } : g
          ),
        })),
      deleteGroup: (id) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          products: s.products.map((p) =>
            p.groupId === id ? { ...p, groupId: null } : p
          ),
        })),

      addCategory: (c) =>
        set((s) => ({ categories: [...s.categories, c] })),
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      placeOrder: (o) =>
        set((s) => ({ orders: [...s.orders, o] })),
      updateOrder: (id, patch) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),

      resetToSeed: () =>
        set({
          products: seedProducts,
          groups: seedGroups,
          categories: seedCategories,
          orders: [],
        }),
    }),
    {
      name: 'cybertronics:data:v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Returns true once persist has rehydrated from localStorage on the client.
// Use to gate render so you don't show seed flash before user data appears.
export const useHydrated = () => {
  const [hydrated, setHydrated] = useState(() =>
    typeof window !== 'undefined' && useDataStore.persist.hasHydrated()
  );
  useEffect(() => {
    if (hydrated) return;
    const unsub = useDataStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return hydrated;
};

// Cross-tab sync: when another tab writes to this store's localStorage key,
// rehydrate so admin edits in tab A propagate to a storefront preview in tab B.
// Same-tab updates already flow via Zustand's subscription. Cross-device sync
// would need a real backend — see TODO(db) at the top of this file.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'cybertronics:data:v1' && e.newValue !== e.oldValue) {
      useDataStore.persist.rehydrate();
    }
  });
}
