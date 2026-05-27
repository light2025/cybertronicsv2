'use client';

import { useSettingsStore, type WallpaperId } from '@/lib/store/settingsStore';
import { WALLPAPERS } from '@/components/xp/WallpaperLayer';

const WALLPAPER_IDS: WallpaperId[] = ['bliss', 'azul', 'teal', 'luna-blue', 'crimson', 'black'];

export default function MobileSettings() {
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const setWallpaper = useSettingsStore((s) => s.setWallpaper);

  return (
    <div className="flex-1 overflow-auto bg-white px-3 py-3 min-h-0">
      <h2 className="text-[13px] font-bold text-[#0a3060] mb-1">Wallpaper</h2>
      <p className="text-[11px] text-[#4a5878] mb-3">
        Synced with the desktop wallpaper picker.
      </p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {WALLPAPER_IDS.map((id) => {
          const def = WALLPAPERS[id];
          const active = wallpaper === id;
          return (
            <button
              key={id}
              onClick={() => setWallpaper(id)}
              className="flex flex-col items-stretch gap-1 p-1.5 active:opacity-80"
              style={{
                border: active ? '2px solid #ff8000' : '1px solid #5878a0',
                background: '#f4f6fa',
                borderRadius: 2,
              }}
            >
              <div
                className="w-full"
                style={{
                  aspectRatio: '4 / 3',
                  background: def.bg,
                  border: '1px solid #6896cc',
                  borderRadius: 1,
                }}
              />
              <span className="text-[11px] font-bold text-[#0a3060] text-center">
                {def.label}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="text-[13px] font-bold text-[#0a3060] mb-1">About this device</h2>
      <div
        className="p-3 text-[11px] text-[#0a3060] space-y-1"
        style={{ background: '#dce8f8', border: '1px solid #6896d2', borderRadius: 2 }}
      >
        <div><span className="font-bold">Model:</span> Cybertronics Mobile</div>
        <div><span className="font-bold">OS:</span> Cybertronics Edition 1.0</div>
        <div><span className="font-bold">Build:</span> Next.js 16 · React 19</div>
        <div><span className="font-bold">Owner:</span> guest</div>
      </div>

      <p className="text-[10px] text-[#4a5878] mt-3 italic">
        Pixelated mobile-only wallpapers coming in a future update.
      </p>
    </div>
  );
}
