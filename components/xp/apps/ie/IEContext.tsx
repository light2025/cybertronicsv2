'use client';

import { createContext, useContext } from 'react';

export type IENavigate = (url: string) => void;

export type IEContextValue = {
  navigate: IENavigate;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  current: { url: string; title: string };
};

export const IEContext = createContext<IEContextValue | null>(null);

export const useIE = (): IEContextValue | null => useContext(IEContext);
