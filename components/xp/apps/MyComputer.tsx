/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useXpStore } from '@/lib/store/xpStore';
import type { AppId } from '@/types/xp';

type FolderEntry = {
  label: string;
  appId: AppId;
  icon: string;
  payload?: Record<string, unknown>;
};

const folders: FolderEntry[] = [
  { label: 'Shop', appId: 'ie', icon: '/xp/icons/Internet Explorer 6.png', payload: { url: 'cybertronics://shop' } },
  { label: 'Cart', appId: 'cart', icon: '/xp/icons/Briefcase.png' },
  { label: 'Gallery', appId: 'gallery', icon: '/xp/icons/Gallery.png' },
  { label: 'About Us', appId: 'about', icon: '/xp/icons/AboutUS.png' },
  { label: 'Contact Us', appId: 'contact', icon: '/xp/icons/Briefcase.png' },
  { label: 'Videos', appId: 'video', icon: '/xp/icons/VLC.png' },
  { label: 'Music', appId: 'music', icon: '/xp/icons/Windows Media Player.png' },
  { label: 'Lookbook', appId: 'gallery', icon: '/xp/icons/Gallery.png', payload: { kind: 'lookbook' } },
];

const PANEL_HEADER =
  'linear-gradient(to bottom, #4a86d8 0%, #2060c0 50%, #1448a8 100%)';

const PANEL_BODY = '#d8e8f8';

function SidePanel({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: FolderEntry[];
  onOpen: (f: FolderEntry) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-2 overflow-hidden rounded-sm" style={{ border: '1px solid #6896cc' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2 py-1 text-white text-[11px] font-bold select-none"
        style={{ background: PANEL_HEADER }}
      >
        <span>{title}</span>
        <span className="text-[9px] opacity-80">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="py-1" style={{ background: PANEL_BODY }}>
          {items.map((f) => (
            <button
              key={f.label}
              onDoubleClick={() => onOpen(f)}
              onClick={() => onOpen(f)}
              className="w-full px-2 py-[3px] flex items-center gap-1.5 text-left group hover:bg-xp-select"
            >
              <img src={f.icon} alt="" className="w-4 h-4 object-contain shrink-0" />
              <span className="text-[11px] text-[#1a3080] group-hover:text-white leading-snug">
                {f.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyComputer() {
  const open = useXpStore((s) => s.open);

  const handleOpen = (f: FolderEntry) =>
    open(f.appId, { title: f.label, payload: f.payload });

  return (
    <div className="flex h-full" style={{ background: '#ece9d8' }}>
      {/* Explorer sidebar */}
      <div
        className="w-36 shrink-0 overflow-y-auto p-1.5"
        style={{ background: '#dce8f8', borderRight: '1px solid #6896d2' }}
      >
        <SidePanel title="Store Links" items={folders.slice(0, 5)} onOpen={handleOpen} />
        <SidePanel title="Media" items={folders.slice(5)} onOpen={handleOpen} />

        {/* Details panel */}
        <div
          className="mt-1 p-2 text-[10px] text-[#1a3060]"
          style={{ background: '#e0eaf8', border: '1px solid #98b8d8', borderRadius: 2 }}
        >
          <div className="font-bold mb-1">Details</div>
          <div>Cybertronics OS</div>
          <div className="text-[9px] text-[#4a6090]">v1.0 · XP Edition</div>
        </div>
      </div>

      {/* Main content area: large icons */}
      <div className="flex-1 p-3 overflow-auto">
        <div className="flex flex-wrap gap-6">
          {folders.map((f) => (
            <button
              key={f.label}
              onDoubleClick={() => handleOpen(f)}
              className="w-20 flex flex-col items-center text-center gap-1 p-1 rounded hover:bg-[#316ac5]/20 focus:bg-[#316ac5]/20 outline-none"
            >
              <img src={f.icon} alt="" className="w-10 h-10 object-contain" />
              <span className="text-[11px] text-[#1a3060] leading-tight">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
