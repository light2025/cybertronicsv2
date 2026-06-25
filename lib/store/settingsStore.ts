// XP user settings — wallpaper, theme. Persisted to localStorage.
// TODO(db): swap persist middleware for Supabase user-prefs row.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminFeatureFlags } from '@/types';

export type WallpaperId =
  | 'bliss'
  | 'azul'
  | 'teal'
  | 'luna-blue'
  | 'crimson'
  | 'black'
  | 'win-xp'
  | 'win-7'
  | 'win-10'
  | 'win-11-light'
  | 'win-11-dark'
  | 'xp-classic-default';

// Default: all new features hidden until explicitly enabled
const defaultAdminFeatures: AdminFeatureFlags = {
  customers: false,
  coupons: false,
  shipping: false,
  banners: false,
  storeSettings: false,
  analytics: false,
};

type SettingsState = {
  wallpaper: WallpaperId;
  soundEnabled: boolean;
  searchOpen: boolean;
  adminFeatures: AdminFeatureFlags;
  setWallpaper: (id: WallpaperId) => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  toggleSearch: () => void;
  closeSearch: () => void;
  openSearch: () => void;
  setAdminFeature: (key: keyof AdminFeatureFlags, enabled: boolean) => void;
  toggleAdminFeature: (key: keyof AdminFeatureFlags) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      wallpaper: 'win-xp',
      soundEnabled: true,
      searchOpen: false,
      adminFeatures: defaultAdminFeatures,
      setWallpaper: (id) => set({ wallpaper: id }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
      closeSearch: () => set({ searchOpen: false }),
      openSearch: () => set({ searchOpen: true }),
      setAdminFeature: (key, enabled) =>
        set((s) => ({ adminFeatures: { ...s.adminFeatures, [key]: enabled } })),
      toggleAdminFeature: (key) =>
        set((s) => ({ adminFeatures: { ...s.adminFeatures, [key]: !s.adminFeatures[key] } })),
    }),
    {
      name: 'cybertronics:settings:v1',
      partialize: (s) => ({
        wallpaper: s.wallpaper,
        soundEnabled: s.soundEnabled,
        adminFeatures: s.adminFeatures,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SettingsState>),
        // Ensure adminFeatures always has all keys with defaults for missing ones
        adminFeatures: {
          ...defaultAdminFeatures,
          ...((persisted as Partial<SettingsState>)?.adminFeatures ?? {}),
        },
      }),
    }
  )
);
