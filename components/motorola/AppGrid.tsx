'use client';

import { useMobileStore } from '@/lib/store/mobileStore';
import { apps } from '@/components/xp/appRegistry';
import { mobileMenuApps } from './apps';
import { iconForAppId } from './PixelIcon';
import type { AppId } from '@/types/xp';

// Pixel-grid background — light surface with faint grid lines for an LCD feel.
const GRID_BG = `
  repeating-linear-gradient(0deg, transparent 0 7px, rgba(0,0,0,0.04) 7px 8px),
  repeating-linear-gradient(90deg, transparent 0 7px, rgba(0,0,0,0.04) 7px 8px),
  #f4f6fa
`;

const TILE_BG = 'linear-gradient(to bottom, #ffffff 0%, #d8dee8 100%)';

export default function AppGrid() {
  const push = useMobileStore((s) => s.push);
  const list = mobileMenuApps;

  const openApp = (id: AppId) => push({ kind: 'app', appId: id });

  return (
    <div className="flex-1 overflow-auto p-4" style={{ background: GRID_BG }}>
      <div className="grid grid-cols-3 gap-y-4 gap-x-2">
        {list.map((id) => {
          const def = apps[id];
          const Icon = iconForAppId(id);
          return (
            <button
              key={id}
              onClick={() => openApp(id)}
              className="flex flex-col items-center justify-start gap-1.5 p-2 active:translate-y-[1px]"
            >
              <div
                className="grid place-items-center"
                style={{
                  width: 56,
                  height: 56,
                  background: TILE_BG,
                  border: '2px solid #4a5868',
                  borderRadius: 4,
                  boxShadow: '1px 2px 0 rgba(0,0,0,0.25)',
                }}
              >
                <Icon size={36} color="#0a1e48" />
              </div>
              <span
                className="text-[11px] font-bold text-[#0a1e48] leading-tight text-center px-0.5"
                style={{ fontFamily: 'Tahoma, sans-serif' }}
              >
                {def.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
