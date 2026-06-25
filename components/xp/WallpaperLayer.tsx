'use client';

import { useSettingsStore, type WallpaperId } from '@/lib/store/settingsStore';

type WallpaperDef = {
  label: string;
  bg?: string;
  image?: string;
};

export const WALLPAPERS: Record<WallpaperId, WallpaperDef> = {
  'win-xp': {
    label: 'Windows XP',
    image: '/xp/wallpapers/win-xp.jpg',
  },
  'xp-classic-default': {
    label: 'XP Classic',
    image: '/xp/wallpapers/xp-classic-default.jpg',
  },
  'win-7': {
    label: 'Windows 7',
    image: '/xp/wallpapers/win-7.jpg',
  },
  'win-10': {
    label: 'Windows 10',
    image: '/xp/wallpapers/win-10.jpg',
  },
  'win-11-light': {
    label: 'Windows 11 Light',
    image: '/xp/wallpapers/win-11-light.jpg',
  },
  'win-11-dark': {
    label: 'Windows 11 Dark',
    image: '/xp/wallpapers/win-11-dark.jpg',
  },
  bliss: {
    label: 'Bliss (CSS)',
    bg: `
      radial-gradient(ellipse 120% 60% at 50% 100%, #4a8a3a 0%, #5a9a40 18%, transparent 60%),
      radial-gradient(ellipse 80% 30% at 70% 80%, #b8c850 0%, transparent 60%),
      linear-gradient(to bottom, #5cb0e8 0%, #7ec0e8 25%, #98d0f0 45%, #c5d890 60%, #6c9c4c 100%)
    `,
  },
  azul: {
    label: 'Azul',
    bg: 'radial-gradient(ellipse at 30% 30%, #5a9ee8 0%, #2868c8 35%, #0a3888 100%)',
  },
  teal: {
    label: 'Teal (Classic)',
    bg: '#008080',
  },
  'luna-blue': {
    label: 'Luna Blue',
    bg: 'linear-gradient(135deg, #1a4fa8 0%, #3a6ea5 100%)',
  },
  crimson: {
    label: 'Crimson',
    bg: 'linear-gradient(135deg, #6a1010 0%, #b03020 50%, #6a1010 100%)',
  },
  black: {
    label: 'Black',
    bg: '#000000',
  },
};

export default function WallpaperLayer() {
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const def = WALLPAPERS[wallpaper] ?? WALLPAPERS['win-xp'];

  if (def.image) {
    return (
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${def.image})` }}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: def.bg }}
    />
  );
}
