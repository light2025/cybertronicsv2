// XP desktop window types. AppId enum drives appRegistry lookups.

export type AppId =
  | 'my-computer'
  | 'lifestyle'
  | 'gallery'
  | 'notepad'
  | 'paint'
  | 'music'
  | 'video'
  | 'settings'
  | 'about'
  | 'contact'
  | 'terminal'
  | 'help'
  | 'product-detail'
  | 'cart'
  | 'checkout';

export type WindowPayload = Record<string, unknown> | undefined;

export type WindowState = {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  prevRect?: { x: number; y: number; w: number; h: number };
  payload?: WindowPayload;
};
