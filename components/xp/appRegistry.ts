// Maps AppId -> { title, Icon, Component, defaultSize, showInStartMenu }.
// To add an app: implement component, register here, done.

import type { ComponentType } from 'react';
import {
  Monitor,
  ShoppingBag,
  ShoppingCart,
  Image as ImageIcon,
  NotebookPen,
  Palette,
  Music,
  Video,
  Settings as SettingsIcon,
  Info,
  Mail,
  Package,
  TerminalSquare,
  HelpCircle,
  Receipt,
  type LucideIcon,
} from 'lucide-react';

import type { AppId, WindowPayload } from '@/types/xp';
import MyComputer from './apps/MyComputer';
import LifestyleFolder from './apps/LifestyleFolder';
import ProductDetail from './apps/ProductDetail';
import Gallery from './apps/Gallery';
import Notepad from './apps/Notepad';
import Paint from './apps/Paint';
import MusicPlayer from './apps/MusicPlayer';
import VideoPlayer from './apps/VideoPlayer';
import Terminal from './apps/Terminal';
import Settings from './apps/Settings';
import About from './apps/About';
import Contact from './apps/Contact';
import Help from './apps/Help';
import Cart from './apps/Cart';
import Checkout from './apps/Checkout';

export type AppDef = {
  title: string;
  Icon: LucideIcon;
  Component: ComponentType<{ winId: string; payload?: WindowPayload }>;
  defaultSize: { w: number; h: number };
  showInStartMenu: boolean;
};

export const apps: Record<AppId, AppDef> = {
  'my-computer': {
    title: 'My Computer',
    Icon: Monitor,
    Component: MyComputer,
    defaultSize: { w: 580, h: 400 },
    showInStartMenu: true,
  },
  lifestyle: {
    title: 'Lifestyle',
    Icon: ShoppingBag,
    Component: LifestyleFolder,
    defaultSize: { w: 640, h: 440 },
    showInStartMenu: true,
  },
  gallery: {
    title: 'Gallery',
    Icon: ImageIcon,
    Component: Gallery,
    defaultSize: { w: 660, h: 500 },
    showInStartMenu: true,
  },
  notepad: {
    title: 'Notepad',
    Icon: NotebookPen,
    Component: Notepad,
    defaultSize: { w: 480, h: 360 },
    showInStartMenu: true,
  },
  paint: {
    title: 'Paint',
    Icon: Palette,
    Component: Paint,
    defaultSize: { w: 680, h: 500 },
    showInStartMenu: true,
  },
  music: {
    title: 'Music Player',
    Icon: Music,
    Component: MusicPlayer,
    defaultSize: { w: 380, h: 440 },
    showInStartMenu: true,
  },
  video: {
    title: 'Video Player',
    Icon: Video,
    Component: VideoPlayer,
    defaultSize: { w: 600, h: 420 },
    showInStartMenu: true,
  },
  terminal: {
    title: 'Terminal',
    Icon: TerminalSquare,
    Component: Terminal,
    defaultSize: { w: 540, h: 360 },
    showInStartMenu: true,
  },
  settings: {
    title: 'Settings',
    Icon: SettingsIcon,
    Component: Settings,
    defaultSize: { w: 520, h: 380 },
    showInStartMenu: true,
  },
  help: {
    title: 'Help',
    Icon: HelpCircle,
    Component: Help,
    defaultSize: { w: 540, h: 400 },
    showInStartMenu: true,
  },
  about: {
    title: 'About Us',
    Icon: Info,
    Component: About,
    defaultSize: { w: 460, h: 380 },
    showInStartMenu: true,
  },
  contact: {
    title: 'Contact Us',
    Icon: Mail,
    Component: Contact,
    defaultSize: { w: 440, h: 320 },
    showInStartMenu: true,
  },
  'product-detail': {
    title: 'Product',
    Icon: Package,
    Component: ProductDetail,
    defaultSize: { w: 520, h: 480 },
    showInStartMenu: false,
  },
  cart: {
    title: 'Shopping Cart',
    Icon: ShoppingCart,
    Component: Cart,
    defaultSize: { w: 520, h: 460 },
    showInStartMenu: true,
  },
  checkout: {
    title: 'Checkout',
    Icon: Receipt,
    Component: Checkout,
    defaultSize: { w: 560, h: 480 },
    showInStartMenu: false,
  },
};

export const startMenuApps = (): AppId[] =>
  (Object.keys(apps) as AppId[]).filter((id) => apps[id].showInStartMenu);
