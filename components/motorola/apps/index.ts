import type { ComponentType } from 'react';
import type { AppId, WindowPayload } from '@/types/xp';
import MobileLifestyle from './MobileLifestyle';
import MobileProduct from './MobileProduct';
import MobileCart from './MobileCart';
import MobileCheckout from './MobileCheckout';
import MobileAbout from './MobileAbout';
import MobileContact from './MobileContact';
import MobileHelp from './MobileHelp';
import MobileGallery from './MobileGallery';
import MobileNotes from './MobileNotes';
import MobileSettings from './MobileSettings';
import MobileCall from './MobileCall';
import MobileMail from './MobileMail';
import Calculator from '@/components/xp/apps/Calculator';
import Snake from '@/components/xp/apps/Snake';
import MusicPlayer from '@/components/xp/apps/MusicPlayer';
import VideoPlayer from '@/components/xp/apps/VideoPlayer';

export const mobileApps: Partial<Record<AppId, ComponentType<{ payload?: WindowPayload }>>> = {
  lifestyle: MobileLifestyle,
  'product-detail': MobileProduct,
  cart: MobileCart,
  checkout: MobileCheckout,
  about: MobileAbout,
  contact: MobileContact,
  help: MobileHelp,
  gallery: MobileGallery,
  notepad: MobileNotes,
  calculator: Calculator,
  snake: Snake,
  music: MusicPlayer,
  video: VideoPlayer,
  settings: MobileSettings,
  call: MobileCall,
  mail: MobileMail,
};

// Menu grid — order matters (3 cols × 5 rows).
export const mobileMenuApps: AppId[] = [
  'lifestyle', 'gallery',    'cart',
  'notepad',   'calculator', 'snake',
  'music',     'video',      'mail',
  'call',      'settings',   'about',
  'contact',
];
