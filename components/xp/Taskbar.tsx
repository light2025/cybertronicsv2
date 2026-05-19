'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useXpStore } from '@/lib/store/xpStore';
import { useCartStore } from '@/lib/store/cartStore';
import { apps } from './appRegistry';
import { cn } from '@/lib/utils';

const BAR_GRADIENT =
  'linear-gradient(to bottom, #58aee8 0%, #58aee8 2%, #4298de 3%, #2878d0 8%, #1a5abc 48%, #0f47a6 52%, #1c66cc 56%, #2878d4 100%)';

const BTN_START =
  'linear-gradient(to bottom, #62c462 0%, #52b452 35%, #3d9c3d 60%, #2c882c 100%)';

const BTN_START_ACTIVE =
  'linear-gradient(to bottom, #449044 0%, #3a8a3a 40%, #2a782a 100%)';

const BTN_PILL =
  'linear-gradient(to bottom, #3a78d8 0%, #2260c0 30%, #1a52b4 50%, #2060be 51%, #2868c8 100%)';

const BTN_PILL_PRESSED =
  'linear-gradient(to bottom, #1448a0 0%, #1050ac 50%, #1c60bc 100%)';

const TRAY_BG =
  'linear-gradient(to bottom, #1c60c8 0%, #0e4aaa 40%, #0a3898 100%)';

export default function Taskbar() {
  const windows = useXpStore((s) => s.windows);
  const toggleStartMenu = useXpStore((s) => s.toggleStartMenu);
  const focus = useXpStore((s) => s.focus);
  const toggleMinimize = useXpStore((s) => s.toggleMinimize);
  const openApp = useXpStore((s) => s.open);
  const startMenuOpen = useXpStore((s) => s.startMenuOpen);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="absolute bottom-0 w-full h-[30px] flex items-center z-50 select-none overflow-hidden"
      style={{ background: BAR_GRADIENT }}
    >
      {/* Start button — protrudes 2px above bar for authentic XP look */}
      <button
        onClick={toggleStartMenu}
        className="relative h-[34px] -mt-[4px] pl-2 pr-4 flex items-center gap-1 text-white font-bold italic text-[13px] rounded-br-xl shrink-0 cursor-pointer"
        style={{
          background: startMenuOpen ? BTN_START_ACTIVE : BTN_START,
          boxShadow: startMenuOpen
            ? 'inset 0 2px 4px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.35)'
            : '0 0 0 1px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.35), 2px 0 6px rgba(0,0,0,0.35)',
          borderTop: '1px solid #78c878',
          filter: startMenuOpen ? 'brightness(0.9)' : 'none',
        }}
      >
        <span className="text-[11px] leading-none opacity-90">⊞</span>
        <span className="tracking-wide drop-shadow-sm" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.5)' }}>
          start
        </span>
      </button>

      {/* Running windows */}
      <div className="flex items-center gap-[3px] px-1.5 overflow-x-auto flex-1 min-w-0 h-full">
        {windows.map((w) => {
          const def = apps[w.appId];
          const Icon = def.Icon;
          const active = !w.minimized;
          return (
            <button
              key={w.id}
              onClick={() => (w.minimized ? focus(w.id) : toggleMinimize(w.id))}
              className={cn(
                'h-[22px] px-1.5 flex items-center gap-1 text-white text-[11px] font-bold shrink-0 max-w-[160px] rounded-[3px]',
              )}
              style={{
                background: active ? BTN_PILL_PRESSED : BTN_PILL,
                border: '1px solid rgba(0,0,0,0.45)',
                boxShadow: active
                  ? 'inset 1px 1px 2px rgba(0,0,0,0.35)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)',
              }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{w.title}</span>
            </button>
          );
        })}
      </div>

      {/* System tray */}
      <div
        className="h-full px-2 flex items-center gap-2 text-white text-[11px] shrink-0"
        style={{
          background: TRAY_BG,
          borderLeft: '1px solid rgba(255,255,255,0.15)',
          boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.2)',
          minWidth: 54,
        }}
      >
        <button
          onClick={() => openApp('cart', { title: 'Shopping Cart' })}
          className="relative w-6 h-6 grid place-items-center rounded-sm hover:bg-white/15"
          aria-label={`Shopping cart (${cartCount} item${cartCount !== 1 ? 's' : ''})`}
          title={`Shopping cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
        >
          <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2} />
          {cartCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 grid place-items-center rounded-full text-[9px] font-bold leading-none"
              style={{
                background: '#c44030',
                color: '#fff',
                border: '1px solid #882010',
                textShadow: 'none',
              }}
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
        <span>{time}</span>
      </div>
    </div>
  );
}
