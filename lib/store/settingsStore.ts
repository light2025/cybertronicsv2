// XP user settings — wallpaper, theme. Persisted to localStorage.
// TODO(db): swap persist middleware for Supabase user-prefs row.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WallpaperId =
  | 'bliss'
  | 'azul'
  | 'teal'
  | 'luna-blue'
  | 'crimson'
  | 'black';

type SettingsState = {
  wallpaper: WallpaperId;
  searchOpen: boolean;
  setWallpaper: (id: WallpaperId) => void;
  toggleSearch: () => void;
  closeSearch: () => void;
  openSearch: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      wallpaper: 'bliss',
      searchOpen: false,
      setWallpaper: (id) => set({ wallpaper: id }),
      toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
      closeSearch: () => set({ searchOpen: false }),
      openSearch: () => set({ searchOpen: true }),
    }),
    {
      name: 'cybertronics:settings:v1',
      partialize: (s) => ({ wallpaper: s.wallpaper }),
    }
  )
);
