import type { ComponentType } from 'react';
import type { AppId, WindowPayload } from '@/types/xp';
import NokiaLifestyle from './NokiaLifestyle';
import NokiaProductDetail from './NokiaProductDetail';
import NokiaCart from './NokiaCart';
import NokiaCheckout from './NokiaCheckout';
import NokiaAbout from './NokiaAbout';
import NokiaContact from './NokiaContact';
import NokiaHelp from './NokiaHelp';
import NokiaGallery from './NokiaGallery';

export const nokiaApps: Partial<Record<AppId, ComponentType<{ payload?: WindowPayload }>>> = {
  lifestyle: NokiaLifestyle,
  'product-detail': NokiaProductDetail,
  cart: NokiaCart,
  checkout: NokiaCheckout,
  about: NokiaAbout,
  contact: NokiaContact,
  help: NokiaHelp,
  gallery: NokiaGallery,
};

// Commerce-only allowlist for the Nokia phone menu grid. Keep this tight.
export const nokiaMenuApps: AppId[] = ['lifestyle', 'gallery', 'cart', 'settings', 'about', 'contact'];
