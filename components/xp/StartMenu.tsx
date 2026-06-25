'use client';

import { PowerIcon, LogOut } from 'lucide-react';
import { useXpStore } from '@/lib/store/xpStore';
import { apps, startMenuApps } from './appRegistry';
import type { AppId, WindowPayload } from '@/types/xp';

const HEADER_BG =
  'linear-gradient(to bottom, #4a90d0 0%, #1855a8 55%, #0a3888 100%)';

const SIDEBAR_BG =
  'linear-gradient(to bottom, #2468c8 0%, #1048a8 45%, #0a3490 100%)';

const FOOTER_BG =
  'linear-gradient(to bottom, #1248a8 0%, #0a3480 100%)';

type SidebarLink = { label: string; id: AppId; payload?: WindowPayload };

const SIDEBAR_LINKS: SidebarLink[] = [
  { label: 'My Shop', id: 'ie', payload: { url: 'cybertronics://shop' } },
  { label: 'Gallery', id: 'gallery' },
  { label: 'About Us', id: 'about' },
  { label: 'Contact Us', id: 'contact' },
];

const SIDEBAR_LINKS2: SidebarLink[] = [
  { label: 'Notepad', id: 'notepad' },
  { label: 'Paint', id: 'paint' },
  { label: 'Settings', id: 'settings' },
];

export default function StartMenu() {
  const isOpen = useXpStore((s) => s.startMenuOpen);
  const close = useXpStore((s) => s.closeStartMenu);
  const openApp = useXpStore((s) => s.open);

  if (!isOpen) return null;

  const list = startMenuApps();

  const handleOpen = (id: AppId) => {
    const a = apps[id];
    openApp(id, { title: a.title, w: a.defaultSize.w, h: a.defaultSize.h });
  };

  const handleLink = (link: SidebarLink) => {
    const a = apps[link.id];
    openApp(link.id, {
      title: link.payload ? link.label : a.title,
      w: a.defaultSize.w,
      h: a.defaultSize.h,
      payload: link.payload,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={close} />
      <div
        className="absolute bottom-[30px] left-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 360,
          maxWidth: '90vw',
          borderRadius: '0 8px 0 0',
          border: '1px solid #0a246a',
          boxShadow: '3px -3px 14px rgba(0,0,0,0.55)',
        }}
      >
        {/* Header — user avatar + name */}
        <div
          className="flex items-center gap-3 px-3 shrink-0"
          style={{ background: HEADER_BG, height: 52 }}
        >
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center text-2xl shrink-0"
            style={{ border: '2px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)' }}
          >
            🧑‍💻
          </div>
          <span className="text-white font-bold text-[13px]" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            Cybertronics
          </span>
        </div>

        {/* Two-pane body */}
        <div className="flex overflow-hidden" style={{ minHeight: 280 }}>

          {/* Left pane — app list */}
          <div
            className="flex flex-col bg-white overflow-hidden"
            style={{ flex: '0 0 56%', borderRight: '1px solid #96b4d4' }}
          >
            <ul className="py-1 flex-1 overflow-y-auto">
              {list.map((id) => {
                const a = apps[id];
                return (
                  <li key={id}>
                    <button
                      onClick={() => handleOpen(id)}
                      className="w-full px-2 py-1.5 flex items-center gap-2 text-left group hover:bg-xp-select"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.icon} alt="" className="w-6 h-6 object-contain shrink-0" />
                      <span className="text-[12px] font-bold text-[#222] group-hover:text-white leading-tight">
                        {a.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {/* All Programs */}
            <div style={{ borderTop: '1px solid #d4cfc0' }}>
              <button className="w-full px-3 py-1.5 flex items-center justify-between group hover:bg-xp-select">
                <span className="text-[11px] font-bold text-[#333] group-hover:text-white">
                  All Programs
                </span>
                <span className="text-[10px] text-gray-500 group-hover:text-white">▶</span>
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div
            className="flex flex-col py-2 px-1.5 overflow-y-auto"
            style={{ background: SIDEBAR_BG, flex: '0 0 44%' }}
          >
            {SIDEBAR_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLink(link)}
                className="px-2 py-[5px] text-left text-[11px] text-white rounded hover:bg-white/20 hover:underline"
              >
                {link.label}
              </button>
            ))}
            <div className="my-1.5 border-t border-white/20" />
            {SIDEBAR_LINKS2.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLink(link)}
                className="px-2 py-[5px] text-left text-[11px] text-white rounded hover:bg-white/20 hover:underline"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer — log off / shutdown */}
        <div
          className="flex items-center justify-end gap-1 px-3 py-1.5 shrink-0"
          style={{ background: FOOTER_BG, borderTop: '1px solid #0a2e60' }}
        >
          <button
            onClick={close}
            className="flex items-center gap-1.5 px-3 py-1 text-white text-[11px] rounded hover:bg-white/20"
            style={{ border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Off
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1 text-white text-[11px] rounded hover:bg-white/20"
            style={{ border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <PowerIcon className="w-3.5 h-3.5" />
            Turn Off Computer
          </button>
        </div>
      </div>
    </>
  );
}
