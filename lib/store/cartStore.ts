import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

type LineKey = {
  productId: string;
  selectedSize?: string;
  selectedColor?: string;
};

const sameLine = (a: LineKey, b: LineKey) =>
  a.productId === b.productId &&
  a.selectedSize === b.selectedSize &&
  a.selectedColor === b.selectedColor;

type VariantOpts = { size?: string; color?: string };

type CartState = {
  items: CartItem[];
  add: (productId: string, qty?: number, opts?: VariantOpts) => void;
  remove: (productId: string, opts?: VariantOpts) => void;
  setQuantity: (productId: string, qty: number, opts?: VariantOpts) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (productId, qty = 1, opts) =>
        set((s) => {
          const key: LineKey = {
            productId,
            selectedSize: opts?.size,
            selectedColor: opts?.color,
          };
          const existing = s.items.find((i) => sameLine(i, key));
          if (existing) {
            return {
              items: s.items.map((i) =>
                sameLine(i, key) ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                productId,
                quantity: qty,
                selectedSize: opts?.size,
                selectedColor: opts?.color,
              },
            ],
          };
        }),

      remove: (productId, opts) =>
        set((s) => {
          const key: LineKey = {
            productId,
            selectedSize: opts?.size,
            selectedColor: opts?.color,
          };
          return { items: s.items.filter((i) => !sameLine(i, key)) };
        }),

      setQuantity: (productId, qty, opts) =>
        set((s) => {
          const key: LineKey = {
            productId,
            selectedSize: opts?.size,
            selectedColor: opts?.color,
          };
          if (qty <= 0) {
            return { items: s.items.filter((i) => !sameLine(i, key)) };
          }
          return {
            items: s.items.map((i) =>
              sameLine(i, key) ? { ...i, quantity: qty } : i
            ),
          };
        }),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'cybertronics:cart:v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Mirrors useHydrated in dataStore. Use to gate cart-reading UI so shoppers
// don't see "empty cart" flash before localStorage rehydrates.
export const useCartHydrated = () => {
  const [hydrated, setHydrated] = useState(() =>
    typeof window !== 'undefined' && useCartStore.persist.hasHydrated()
  );
  useEffect(() => {
    if (hydrated) return;
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return hydrated;
};

// Cross-tab cart sync: if a shopper has the site open in two tabs and adds
// items in one, the other tab should reflect the new cart without a refresh.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'cybertronics:cart:v1' && e.newValue !== e.oldValue) {
      useCartStore.persist.rehydrate();
    }
  });
}
