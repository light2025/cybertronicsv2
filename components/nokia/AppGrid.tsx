'use client';

import { useNokiaStore } from '@/lib/store/nokiaStore';
import { apps } from '@/components/xp/appRegistry';
import { nokiaMenuApps } from './apps';
import type { AppId } from '@/types/xp';

const ICONS: Partial<Record<AppId, string>> = {
  lifestyle: '👕',
  gallery: '🖼️',
  cart: '🛒',
  settings: '⚙️',
  about: 'ℹ️',
  contact: '✉️',
};

const ICON_SHADOW = 'drop-shadow(1px 2px 1px rgba(0,0,0,0.25))';

export default function AppGrid() {
  const push = useNokiaStore((s) => s.push);
  const list = nokiaMenuApps;

  const open = (id: AppId) => push({ kind: 'app', appId: id });

  return (
    <div className="flex-1 overflow-auto p-4 bg-white">
      <div className="grid grid-cols-3 gap-y-5 gap-x-2">
        {list.map((id) => {
          const def = apps[id];
          const glyph = ICONS[id] ?? '❓';
          return (
            <button
              key={id}
              onClick={() => open(id)}
              className="flex flex-col items-center justify-start gap-1.5 p-1 active:translate-y-[1px]"
            >
              <span
                className="text-[44px] leading-none select-none"
                style={{ filter: ICON_SHADOW }}
                aria-hidden
              >
                {glyph}
              </span>
              <span className="text-[12px] font-bold text-[#202020] leading-tight text-center px-0.5">
                {def.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
