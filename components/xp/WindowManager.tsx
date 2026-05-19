'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useXpStore } from '@/lib/store/xpStore';
import Window, { TITLEBAR_ACTIVE } from './Window';
import WindowErrorBoundary from './WindowErrorBoundary';
import { apps } from './appRegistry';

export default function WindowManager() {
  const windows = useXpStore((s) => s.windows);
  const isMobile = useXpStore((s) => s.isMobile);
  const setIsMobile = useXpStore((s) => s.setIsMobile);
  const close = useXpStore((s) => s.close);
  const focus = useXpStore((s) => s.focus);

  const parentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [setIsMobile]);

  if (isMobile) {
    const stack = [...windows]
      .filter((w) => !w.minimized)
      .sort((a, b) => b.z - a.z);
    return (
      <div className="absolute inset-0 bottom-[30px] overflow-y-auto p-2 flex flex-col gap-2 pointer-events-none">
        {stack.map((w) => {
          const def = apps[w.appId];
          const Body = def.Component;
          return (
            <div
              key={w.id}
              onPointerDown={() => focus(w.id)}
              className="overflow-hidden flex flex-col pointer-events-auto"
              style={{
                minHeight: 240,
                border: '2px solid #3a6ea5',
                outline: '1px solid #0a246a',
                borderRadius: '6px 6px 2px 2px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <header
                className="flex items-center justify-between px-1.5 shrink-0"
                style={{
                  height: 22,
                  background: TITLEBAR_ACTIVE,
                  borderRadius: '4px 4px 0 0',
                }}
              >
                <span className="text-white text-[11px] font-bold truncate flex-1" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>
                  {w.title}
                </span>
                <button
                  onClick={() => close(w.id)}
                  className="w-[21px] h-[17px] flex items-center justify-center rounded-[2px] text-white shrink-0"
                  aria-label="close"
                  style={{
                    background: 'linear-gradient(to bottom, #e8593a, #c03018)',
                    border: '1px solid #882010',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                  }}
                >
                  <X className="w-[9px] h-[9px]" strokeWidth={2.5} />
                </button>
              </header>
              <div className="flex-1 overflow-auto bg-white text-black">
                <WindowErrorBoundary winId={w.id}>
                  <Body winId={w.id} payload={w.payload} />
                </WindowErrorBoundary>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={parentRef} className="absolute inset-0 bottom-[30px] overflow-hidden pointer-events-none">
      <AnimatePresence>
        {windows
          .filter((w) => !w.minimized)
          .map((w) => {
            const def = apps[w.appId];
            const Body = def.Component;
            return (
              <Window key={w.id} win={w} parentRef={parentRef}>
                <WindowErrorBoundary winId={w.id}>
                  <Body winId={w.id} payload={w.payload} />
                </WindowErrorBoundary>
              </Window>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
