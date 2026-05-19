// XP window manager state. Not persisted — drag positions reset on reload.

import { create } from 'zustand';
import type { AppId, WindowPayload, WindowState } from '@/types/xp';
import { uid } from '@/lib/utils';

type OpenOpts = {
  title?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  payload?: WindowPayload;
};

type XpState = {
  windows: WindowState[];
  zCounter: number;
  startMenuOpen: boolean;
  isMobile: boolean;

  open: (appId: AppId, opts?: OpenOpts) => string;
  close: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  setIsMobile: (b: boolean) => void;
};

export const useXpStore = create<XpState>((set, get) => ({
  windows: [],
  zCounter: 0,
  startMenuOpen: false,
  isMobile: false,

  open: (appId, opts = {}) => {
    const id = uid();
    const z = get().zCounter + 1;
    const cascade = (get().windows.length % 8) * 24;
    set((s) => ({
      zCounter: z,
      startMenuOpen: false,
      windows: [
        ...s.windows,
        {
          id,
          appId,
          title: opts.title ?? appId,
          x: opts.x ?? 80 + cascade,
          y: opts.y ?? 60 + cascade,
          w: opts.w ?? 480,
          h: opts.h ?? 360,
          z,
          minimized: false,
          maximized: false,
          payload: opts.payload,
        },
      ],
    }));
    return id;
  },

  close: (id) =>
    set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  focus: (id) =>
    set((s) => {
      const z = s.zCounter + 1;
      return {
        zCounter: z,
        windows: s.windows.map((w) =>
          w.id === id ? { ...w, z, minimized: false } : w
        ),
      };
    }),

  move: (id, x, y) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
    })),

  resize: (id, w, h) =>
    set((s) => ({
      windows: s.windows.map((win) =>
        win.id === id ? { ...win, w, h } : win
      ),
    })),

  toggleMinimize: (id) =>
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, minimized: !w.minimized } : w
      ),
    })),

  toggleMaximize: (id) =>
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) {
          const r = w.prevRect;
          return r
            ? { ...w, maximized: false, x: r.x, y: r.y, w: r.w, h: r.h, prevRect: undefined }
            : { ...w, maximized: false, prevRect: undefined };
        }
        return { ...w, maximized: true, prevRect: { x: w.x, y: w.y, w: w.w, h: w.h } };
      }),
    })),

  toggleStartMenu: () =>
    set((s) => ({ startMenuOpen: !s.startMenuOpen })),

  closeStartMenu: () =>
    set({ startMenuOpen: false }),

  setIsMobile: (b) => set({ isMobile: b }),
}));
