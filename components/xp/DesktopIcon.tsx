/* eslint-disable @next/next/no-img-element */
'use client';

import { useXpStore } from '@/lib/store/xpStore';
import { apps } from './appRegistry';
import type { AppId } from '@/types/xp';

type Props = { appId: AppId };

export default function DesktopIcon({ appId }: Props) {
  const open = useXpStore((s) => s.open);
  const isMobile = useXpStore((s) => s.isMobile);
  const def = apps[appId];

  const handleOpen = () =>
    open(appId, {
      title: def.title,
      w: def.defaultSize.w,
      h: def.defaultSize.h,
    });

  return (
    <button
      onDoubleClick={handleOpen}
      onClick={isMobile ? handleOpen : undefined}
      className="flex flex-col items-center gap-1 w-[75px] p-1 focus:outline-none hover:bg-[#316ac5]/40 active:bg-[#316ac5]/60"
      style={{ borderRadius: 2 }}
    >
      <img
        src={def.icon}
        alt={def.title}
        className="w-10 h-10 object-contain"
        style={{
          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
        }}
        draggable={false}
      />
      <span
        className="text-white text-[11px] text-center px-0.5 leading-tight"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.9), -1px -1px 1px rgba(0,0,0,0.6)' }}
      >
        {def.title}
      </span>
    </button>
  );
}
