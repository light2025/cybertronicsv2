import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SavedItem = {
  productId: string;
  selectedSize?: string;
  selectedColor?: string;
  savedAt: string;
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

type SaveForLaterState = {
  items: SavedItem[];
  save: (productId: string, opts?: VariantOpts) => void;
  unsave: (productId: string, opts?: VariantOpts) => void;
  clear: () => void;
};

export const useSaveForLaterStore = create<SaveForLaterState>()(
  persist(
    (set) => ({
      items: [],

      save: (productId, opts) =>
        set((s) => {
          const key: LineKey = {
            productId,
            selectedSize: opts?.size,
            selectedColor: opts?.color,
          };
          if (s.items.some((i) => sameLine(i, key))) return s;
          return {
            items: [
              ...s.items,
              {
                productId,
                selectedSize: opts?.size,
                selectedColor: opts?.color,
                savedAt: new Date().toISOString(),
              },
            ],
          };
        }),

      unsave: (productId, opts) =>
        set((s) => {
          const key: LineKey = {
            productId,
            selectedSize: opts?.size,
            selectedColor: opts?.color,
          };
          return { items: s.items.filter((i) => !sameLine(i, key)) };
        }),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'cybertronics:saveForLater:v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Mirrors useCartHydrated. Gate render against rehydration flash on screens
// that read saved items (Cart, Checkout) so the saved section doesn't pop.
export const useSavedHydrated = () => {
  const [hydrated, setHydrated] = useState(() =>
    typeof window !== 'undefined' && useSaveForLaterStore.persist.hasHydrated()
  );
  useEffect(() => {
    if (hydrated) return;
    const unsub = useSaveForLaterStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return hydrated;
};

// Cross-tab sync mirroring cartStore — saved-for-later in tab A reflects in
// tab B without a refresh. localStorage events only fire in *other* tabs.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'cybertronics:saveForLater:v1' && e.newValue !== e.oldValue) {
      useSaveForLaterStore.persist.rehydrate();
    }
  });
}
