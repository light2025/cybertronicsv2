// Maps AppId -> { title, icon, Component, defaultSize, showInStartMenu }.
// Icons are now image paths to authentic XP PNGs.

import type { ComponentType } from 'react';
import type { AppId, WindowPayload } from '@/types/xp';

import MyComputer from './apps/MyComputer';
import InternetExplorer from './apps/InternetExplorer';
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
import Calculator from './apps/Calculator';
import Snake from './apps/Snake';
import ComingSoon from './apps/ComingSoon';

export type AppDef = {
  title: string;
  icon: string;
  Component: ComponentType<{ winId: string; payload?: WindowPayload }>;
  defaultSize: { w: number; h: number };
  showInStartMenu: boolean;
};

export const apps: Record<AppId, AppDef> = {
  'my-computer': {
    title: 'My Computer',
    icon: '/xp/icons/My Computer.png',
    Component: MyComputer,
    defaultSize: { w: 580, h: 400 },
    showInStartMenu: true,
  },
  ie: {
    title: 'Internet Explorer',
    icon: '/xp/icons/Internet Explorer 6.png',
    Component: InternetExplorer,
    defaultSize: { w: 760, h: 560 },
    showInStartMenu: true,
  },
  lifestyle: {
    title: 'Lifestyle',
    icon: '/xp/icons/Folder Opened.png',
    Component: LifestyleFolder,
    defaultSize: { w: 640, h: 440 },
    showInStartMenu: false,
  },
  gallery: {
    title: 'Gallery',
    icon: '/xp/icons/Gallery.png',
    Component: Gallery,
    defaultSize: { w: 660, h: 500 },
    showInStartMenu: true,
  },
  notepad: {
    title: 'Notepad',
    icon: '/xp/icons/Notepad.png',
    Component: Notepad,
    defaultSize: { w: 480, h: 360 },
    showInStartMenu: true,
  },
  paint: {
    title: 'Paint',
    icon: '/xp/icons/Paint.png',
    Component: Paint,
    defaultSize: { w: 680, h: 500 },
    showInStartMenu: true,
  },
  music: {
    title: 'Music Player',
    icon: '/xp/icons/Windows Media Player.png',
    Component: MusicPlayer,
    defaultSize: { w: 380, h: 440 },
    showInStartMenu: true,
  },
  video: {
    title: 'Video Player',
    icon: '/xp/icons/VLC.png',
    Component: VideoPlayer,
    defaultSize: { w: 600, h: 420 },
    showInStartMenu: true,
  },
  terminal: {
    title: 'Terminal',
    icon: '/xp/icons/Briefcase.png',
    Component: Terminal,
    defaultSize: { w: 540, h: 360 },
    showInStartMenu: true,
  },
  settings: {
    title: 'Settings',
    icon: '/xp/icons/My Computer.png',
    Component: Settings,
    defaultSize: { w: 520, h: 380 },
    showInStartMenu: true,
  },
  help: {
    title: 'Help',
    icon: '/xp/icons/AboutUS.png',
    Component: Help,
    defaultSize: { w: 540, h: 400 },
    showInStartMenu: true,
  },
  about: {
    title: 'About Us',
    icon: '/xp/icons/AboutUS.png',
    Component: About,
    defaultSize: { w: 460, h: 380 },
    showInStartMenu: true,
  },
  contact: {
    title: 'Contact Us',
    icon: '/xp/icons/Briefcase.png',
    Component: Contact,
    defaultSize: { w: 440, h: 320 },
    showInStartMenu: true,
  },
  'product-detail': {
    title: 'Product',
    icon: '/xp/icons/Folder Opened.png',
    Component: ProductDetail,
    defaultSize: { w: 520, h: 480 },
    showInStartMenu: false,
  },
  cart: {
    title: 'Shopping Cart',
    icon: '/xp/icons/Briefcase.png',
    Component: Cart,
    defaultSize: { w: 520, h: 460 },
    showInStartMenu: true,
  },
  checkout: {
    title: 'Checkout',
    icon: '/xp/icons/Briefcase.png',
    Component: Checkout,
    defaultSize: { w: 560, h: 480 },
    showInStartMenu: false,
  },
  calculator: {
    title: 'Calculator',
    icon: '/xp/icons/Calculator.png',
    Component: Calculator,
    defaultSize: { w: 300, h: 460 },
    showInStartMenu: true,
  },
  snake: {
    title: 'Snake',
    icon: '/xp/icons/Alert.png',
    Component: Snake,
    defaultSize: { w: 380, h: 540 },
    showInStartMenu: true,
  },
  call: {
    title: 'Call',
    icon: '/xp/icons/Briefcase.png',
    Component: ComingSoon,
    defaultSize: { w: 360, h: 360 },
    showInStartMenu: false,
  },
  mail: {
    title: 'Mail',
    icon: '/xp/icons/Briefcase.png',
    Component: ComingSoon,
    defaultSize: { w: 360, h: 400 },
    showInStartMenu: false,
  },
};

export const startMenuApps = (): AppId[] =>
  (Object.keys(apps) as AppId[]).filter((id) => apps[id].showInStartMenu);
