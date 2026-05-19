'use client';

import { useState } from 'react';
import { useSettingsStore, type WallpaperId } from '@/lib/store/settingsStore';
import { WALLPAPERS } from '../WallpaperLayer';

type Tab = 'display' | 'sound' | 'about';

export default function Settings() {
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const setWallpaper = useSettingsStore((s) => s.setWallpaper);
  const [tab, setTab] = useState<Tab>('display');

  return (
    <div className="flex h-full" style={{ background: '#ece9d8' }}>
      {/* Sidebar tabs */}
      <div
        className="w-32 shrink-0 p-2 flex flex-col gap-1"
        style={{ background: '#dce8f8', borderRight: '1px solid #6896d2' }}
      >
        {(['display', 'sound', 'about'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-left px-2 py-1 text-[11px] capitalize rounded-sm"
            style={{
              background: tab === t ? '#316ac5' : 'transparent',
              color: tab === t ? '#fff' : '#1a3060',
              fontWeight: tab === t ? 700 : 500,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        {tab === 'display' && (
          <div>
            <h2 className="text-[13px] font-bold text-[#0a246a] mb-2">Desktop Background</h2>
            <p className="text-[11px] text-gray-600 mb-3">
              Choose a wallpaper. Your selection persists between sessions.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(WALLPAPERS) as WallpaperId[]).map((id) => {
                const w = WALLPAPERS[id];
                const active = wallpaper === id;
                return (
                  <button
                    key={id}
                    onClick={() => setWallpaper(id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full aspect-[4/3] rounded-sm"
                      style={{
                        background: w.bg,
                        border: active ? '2px solid #ff8000' : '1px solid #6896cc',
                        boxShadow: active ? '0 0 4px rgba(255,128,0,0.6)' : 'inset 1px 1px 2px rgba(0,0,0,0.2)',
                      }}
                    />
                    <span className="text-[10px] text-gray-700">{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'sound' && (
          <div className="text-[11px] text-gray-700">
            <h2 className="text-[13px] font-bold text-[#0a246a] mb-2">Sounds</h2>
            <p>System sound scheme: <span className="italic">Cybertronics (default)</span></p>
            <p className="mt-2 text-gray-500">Sound playback is disabled in this build.</p>
          </div>
        )}

        {tab === 'about' && (
          <div className="text-[11px] text-gray-700 space-y-2">
            <h2 className="text-[13px] font-bold text-[#0a246a]">About Cybertronics OS</h2>
            <div className="border-t border-gray-300 pt-2 space-y-1">
              <div><span className="font-bold">Version:</span> 1.0.0 (XP Edition)</div>
              <div><span className="font-bold">Build:</span> Next.js 16 · React 19 · Tailwind 4</div>
              <div><span className="font-bold">User:</span> guest</div>
              <div><span className="font-bold">License:</span> Proprietary</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
