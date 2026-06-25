// Shared data store: products, groups, categories, customGroups, orders.
//
// Default behaviour (Stage 1): Zustand + persist middleware writing to
// localStorage under cybertronics:data:v1.
//
// Optional cutover (Stage 2 Chunk H): when NEXT_PUBLIC_SUPABASE_URL is set,
//   • on module load, fetch the catalog from Supabase and overwrite local state
//   • every mutation also fires a fire-and-forget call to lib/api/*
//   • localStorage stays as a write-through cache so guests + offline still works
//
// Activation requires no code changes — just fill in .env.local.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import type {
  Banner,
  Category,
  Coupon,
  CustomGroup,
  Order,
  Product,
  ProductGroup,
  ShippingZone,
  StoreSettings,
} from '@/types';
import { seedCategories, seedCustomGroups, seedGroups, seedProducts } from '@/lib/data/seedProducts';
import type { LookbookImage } from '@/lib/data/lookbookImages';
import { defaultLookbookImages } from '@/lib/data/lookbookImages';
import { nowIso } from '@/lib/utils';
import {
  fetchCatalog,
  fetchOrders,
  pushAsync,
} from '@/lib/supabase/sync';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import * as productsApi      from '@/lib/api/products';
import * as categoriesApi    from '@/lib/api/categories';
import * as groupsApi        from '@/lib/api/groups';
import * as customGroupsApi  from '@/lib/api/custom_groups';
import * as ordersApi        from '@/lib/api/orders';

const defaultStoreSettings: StoreSettings = {
  storeName: 'Cybertronics',
  logo: '/xp/icons/ie.png',
  contactEmail: 'hello@cybertronics.ae',
  contactPhone: '+971 50 000 0000',
  address: 'Dubai, UAE',
  socialLinks: [],
  currency: 'AED',
  taxRate: 5,
  freeShippingThreshold: 200,
};

const defaultShippingZones: ShippingZone[] = [
  { id: 'uae-dubai', name: 'Dubai', regions: ['Dubai'], rate: 0, freeAbove: 0, estimatedDays: '1-2', isActive: true },
  { id: 'uae-other', name: 'Other Emirates', regions: ['Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ'], rate: 15, freeAbove: 200, estimatedDays: '2-3', isActive: true },
];

type DataState = {
  products: Product[];
  groups: ProductGroup[];
  categories: Category[];
  customGroups: CustomGroup[];
  orders: Order[];
  lookbookImages: LookbookImage[];
  coupons: Coupon[];
  shippingZones: ShippingZone[];
  banners: Banner[];
  storeSettings: StoreSettings;

  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addGroup: (g: ProductGroup) => void;
  updateGroup: (id: string, patch: Partial<ProductGroup>) => void;
  deleteGroup: (id: string) => void;

  addCategory: (c: Category) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addCustomGroup: (g: CustomGroup) => void;
  updateCustomGroup: (id: string, patch: Partial<CustomGroup>) => void;
  deleteCustomGroup: (id: string) => void;

  placeOrder: (o: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;

  addLookbookImage: (img: LookbookImage) => void;
  updateLookbookImage: (id: string, patch: Partial<LookbookImage>) => void;
  deleteLookbookImage: (id: string) => void;

  addCoupon: (c: Coupon) => void;
  updateCoupon: (id: string, patch: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  incrementCouponUsage: (id: string) => void;

  addShippingZone: (z: ShippingZone) => void;
  updateShippingZone: (id: string, patch: Partial<ShippingZone>) => void;
  deleteShippingZone: (id: string) => void;

  addBanner: (b: Banner) => void;
  updateBanner: (id: string, patch: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;

  updateStoreSettings: (patch: Partial<StoreSettings>) => void;

  resetToSeed: () => void;
  refreshFromSupabase: () => Promise<void>;
};

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      products: seedProducts,
      groups: seedGroups,
      categories: seedCategories,
      customGroups: seedCustomGroups,
      orders: [],
      lookbookImages: defaultLookbookImages,
      coupons: [],
      shippingZones: defaultShippingZones,
      banners: [],
      storeSettings: defaultStoreSettings,

      addProduct: (p) => {
        set((s) => ({ products: [...s.products, p] }));
        pushAsync('createProduct', productsApi.createProduct(p));
      },
      updateProduct: (id, patch) => {
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: nowIso() } : p
          ),
        }));
        pushAsync('updateProduct', productsApi.updateProduct(id, patch));
      },
      deleteProduct: (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        pushAsync('deleteProduct', productsApi.deleteProduct(id));
      },

      addGroup: (g) => {
        set((s) => ({ groups: [...s.groups, g] }));
        pushAsync('createGroup', groupsApi.createGroup(g));
      },
      updateGroup: (id, patch) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === id ? { ...g, ...patch, updatedAt: nowIso() } : g
          ),
        }));
        pushAsync('updateGroup', groupsApi.updateGroup(id, patch));
      },
      deleteGroup: (id) => {
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          products: s.products.map((p) =>
            p.groupId === id ? { ...p, groupId: null } : p
          ),
        }));
        pushAsync('deleteGroup', groupsApi.deleteGroup(id));
      },

      addCategory: (c) => {
        set((s) => ({ categories: [...s.categories, c] }));
        pushAsync('createCategory', categoriesApi.createCategory(c));
      },
      updateCategory: (id, patch) => {
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        }));
        pushAsync('updateCategory', categoriesApi.updateCategory(id, patch));
      },
      deleteCategory: (id) => {
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
        pushAsync('deleteCategory', categoriesApi.deleteCategory(id));
      },

      addCustomGroup: (g) => {
        set((s) => ({ customGroups: [...s.customGroups, g] }));
        pushAsync('createCustomGroup', customGroupsApi.createCustomGroup(g));
      },
      updateCustomGroup: (id, patch) => {
        set((s) => ({
          customGroups: s.customGroups.map((g) =>
            g.id === id ? { ...g, ...patch } : g
          ),
        }));
        pushAsync('updateCustomGroup', customGroupsApi.updateCustomGroup(id, patch));
      },
      deleteCustomGroup: (id) => {
        set((s) => ({
          customGroups: s.customGroups.filter((g) => g.id !== id),
          products: s.products.map((p) =>
            p.customGroups?.includes(id)
              ? { ...p, customGroups: p.customGroups.filter((cg) => cg !== id) }
              : p
          ),
        }));
        pushAsync('deleteCustomGroup', customGroupsApi.deleteCustomGroup(id));
      },

      placeOrder: (o) => {
        set((s) => ({ orders: [...s.orders, o] }));
        pushAsync('placeOrder', ordersApi.placeOrder({ ...o, shipping: 0 }));
      },
      updateOrder: (id, patch) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        }));
        if (patch.status) {
          pushAsync('updateOrderStatus', ordersApi.updateOrderStatus(id, patch.status));
        }
      },

      addLookbookImage: (img) => {
        set((s) => ({ lookbookImages: [...s.lookbookImages, img] }));
      },
      updateLookbookImage: (id, patch) => {
        set((s) => ({
          lookbookImages: s.lookbookImages.map((img) =>
            img.id === id ? { ...img, ...patch } : img
          ),
        }));
      },
      deleteLookbookImage: (id) => {
        set((s) => ({ lookbookImages: s.lookbookImages.filter((img) => img.id !== id) }));
      },

      addCoupon: (c) => {
        set((s) => ({ coupons: [...s.coupons, c] }));
      },
      updateCoupon: (id, patch) => {
        set((s) => ({
          coupons: s.coupons.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
      },
      deleteCoupon: (id) => {
        set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) }));
      },
      incrementCouponUsage: (id) => {
        set((s) => ({
          coupons: s.coupons.map((c) =>
            c.id === id ? { ...c, usedCount: c.usedCount + 1 } : c
          ),
        }));
      },

      addShippingZone: (z) => {
        set((s) => ({ shippingZones: [...s.shippingZones, z] }));
      },
      updateShippingZone: (id, patch) => {
        set((s) => ({
          shippingZones: s.shippingZones.map((z) => (z.id === id ? { ...z, ...patch } : z)),
        }));
      },
      deleteShippingZone: (id) => {
        set((s) => ({ shippingZones: s.shippingZones.filter((z) => z.id !== id) }));
      },

      addBanner: (b) => {
        set((s) => ({ banners: [...s.banners, b] }));
      },
      updateBanner: (id, patch) => {
        set((s) => ({
          banners: s.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        }));
      },
      deleteBanner: (id) => {
        set((s) => ({ banners: s.banners.filter((b) => b.id !== id) }));
      },

      updateStoreSettings: (patch) => {
        set((s) => ({ storeSettings: { ...s.storeSettings, ...patch } }));
      },

      resetToSeed: () =>
        set({
          products: seedProducts,
          groups: seedGroups,
          categories: seedCategories,
          customGroups: seedCustomGroups,
          orders: [],
          lookbookImages: defaultLookbookImages,
          coupons: [],
          shippingZones: defaultShippingZones,
          banners: [],
          storeSettings: defaultStoreSettings,
        }),

      refreshFromSupabase: async () => {
        const catalog = await fetchCatalog();
        if (catalog) set(catalog);
        const ord = await fetchOrders();
        if (ord) set(ord);
      },
    }),
    {
      name: 'cybertronics:data:v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Hydration gate: true once persist has rehydrated from localStorage on the
// client. Use to gate render so you don't show seed flash before user data
// appears.
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

// Cross-tab sync via localStorage `storage` event. Browser fires this only in
// *other* tabs, so no double-handling.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'cybertronics:data:v1' && e.newValue !== e.oldValue) {
      useDataStore.persist.rehydrate();
    }
  });
}

// One-shot Supabase sync at module load. Only runs when configured AND on the
// client. Catalog is public-readable; orders only resolve when a session
// exists. Failures fall back silently to localStorage.
if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  fetchCatalog().then((catalog) => {
    if (catalog) useDataStore.setState(catalog);
  });
  fetchOrders().then((ord) => {
    if (ord) useDataStore.setState(ord);
  });
}
