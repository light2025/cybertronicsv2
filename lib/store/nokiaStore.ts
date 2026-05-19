import { create } from 'zustand';
import type { AppId, WindowPayload } from '@/types/xp';

export type NokiaScreen =
  | { kind: 'standby' }
  | { kind: 'menu' }
  | { kind: 'app'; appId: AppId; payload?: WindowPayload };

type NokiaState = {
  stack: NokiaScreen[];
  push: (screen: NokiaScreen) => void;
  pop: () => void;
  reset: () => void;
};

export const useNokiaStore = create<NokiaState>((set) => ({
  stack: [{ kind: 'standby' }],
  push: (screen) => set((s) => ({ stack: [...s.stack, screen] })),
  pop: () =>
    set((s) => ({
      stack: s.stack.length > 1 ? s.stack.slice(0, -1) : s.stack,
    })),
  reset: () => set({ stack: [{ kind: 'standby' }] }),
}));
