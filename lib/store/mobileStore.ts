import { create } from 'zustand';
import type { AppId, WindowPayload } from '@/types/xp';

export type MobileScreen =
  | { kind: 'standby' }
  | { kind: 'menu' }
  | { kind: 'app'; appId: AppId; payload?: WindowPayload };

type MobileState = {
  stack: MobileScreen[];
  push: (screen: MobileScreen) => void;
  pop: () => void;
  reset: () => void;
};

export const useMobileStore = create<MobileState>((set) => ({
  stack: [{ kind: 'standby' }],
  push: (screen) => set((s) => ({ stack: [...s.stack, screen] })),
  pop: () =>
    set((s) => ({
      stack: s.stack.length > 1 ? s.stack.slice(0, -1) : s.stack,
    })),
  reset: () => set({ stack: [{ kind: 'standby' }] }),
}));
