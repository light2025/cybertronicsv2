'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Image as ImageIcon,
  Video,
  Music,
  Info,
  Mail,
  Layers,
  Folder,
} from 'lucide-react';
import { useXpStore } from '@/lib/store/xpStore';
import type { AppId } from '@/types/xp';

type FolderEntry = {
  label: string;
  appId: AppId;
  Icon: typeof Folder;
  payload?: Record<string, unknown>;
};

const folders: FolderEntry[] = [
  { label: 'Shop', appId: 'ie', Icon: ShoppingBag, payload: { url: 'cybertronics://shop' } },
  { label: 'Cart', appId: 'cart', Icon: ShoppingCart },
  { label: 'Gallery', appId: 'gallery', Icon: ImageIcon },
  { label: 'About Us', appId: 'about', Icon: Info },
  { label: 'Contact Us', appId: 'contact', Icon: Mail },
  { label: 'Videos', appId: 'video', Icon: Video },
  { label: 'Music', appId: 'music', Icon: Music },
  { label: 'Lookbook', appId: 'gallery', Icon: Layers, payload: { kind: 'lookbook' } },
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
              <f.Icon className="w-4 h-4 text-[#3a6ea5] group-hover:text-white shrink-0" strokeWidth={1.5} />
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
          style={{ background: '#d0dff5', border: '1px solid #6896cc', borderRadius: 2 }}
        >
          <div className="font-bold mb-0.5">Cybertronics</div>
          <div className="text-[#555]">XP Edition</div>
          <div className="text-[#555] mt-0.5">{folders.length} items</div>
        </div>
      </div>

      {/* Main folder view */}
      <div className="flex-1 overflow-auto bg-white p-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {folders.map((f) => (
            <button
              key={f.label}
              onDoubleClick={() => handleOpen(f)}
              className="flex flex-col items-center gap-1 p-2 focus:outline-none hover:bg-[#e5f0ff] active:bg-[#cde0ff]"
              style={{ borderRadius: 2 }}
            >
              <f.Icon className="w-10 h-10 text-[#4a72c8]" strokeWidth={1.2} />
              <span className="text-[11px] text-center text-gray-800 leading-tight">{f.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
