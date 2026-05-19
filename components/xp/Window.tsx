'use client';

import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { useEffect, useState, type PointerEvent, type RefObject } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { useXpStore } from '@/lib/store/xpStore';
import type { WindowState } from '@/types/xp';

const MIN_W = 300;
const MIN_H = 200;

type Props = {
  win: WindowState;
  parentRef: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
};

export const TITLEBAR_ACTIVE =
  'linear-gradient(to bottom, #98c8f8 0%, #98c8f8 2%, #4a90e0 3%, #1e60c8 10%, #1050b0 50%, #1050b0 52%, #1a60c8 56%, #2870d0 100%)';

export const TITLEBAR_INACTIVE =
  'linear-gradient(to bottom, #c0d0e4 0%, #c0d0e4 2%, #8aa4c0 3%, #6082a8 10%, #527498 50%, #527498 52%, #6082a8 56%, #7090b8 100%)';

const BTN_CLOSE =
  'linear-gradient(to bottom, #e8593a 0%, #d84020 45%, #c03018 100%)';

const BTN_MIN_MAX =
  'linear-gradient(to bottom, #5a9ae8 0%, #3c7ed0 45%, #2868c0 100%)';

function CaptionBtn({
  onClick,
  label,
  type,
  children,
}: {
  onClick: () => void;
  label: string;
  type: 'close' | 'other';
  children: React.ReactNode;
}) {
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      aria-label={label}
      className="w-[21px] h-[17px] flex items-center justify-center rounded-[2px] text-white"
      style={{
        background: type === 'close' ? BTN_CLOSE : BTN_MIN_MAX,
        border: type === 'close' ? '1px solid #882010' : '1px solid #1a4898',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)',
      }}
    >
      {children}
    </button>
  );
}

export default function Window({ win, parentRef, children }: Props) {
  const controls = useDragControls();
  const move = useXpStore((s) => s.move);
  const close = useXpStore((s) => s.close);
  const focus = useXpStore((s) => s.focus);
  const toggleMinimize = useXpStore((s) => s.toggleMinimize);
  const toggleMaximize = useXpStore((s) => s.toggleMaximize);
  const resize = useXpStore((s) => s.resize);
  const zCounter = useXpStore((s) => s.zCounter);
  const active = win.z === zCounter;

  const x = useMotionValue(win.x);
  const y = useMotionValue(win.y);
  const [size, setSize] = useState({ w: win.w, h: win.h });

  useEffect(() => {
    if (win.maximized) {
      x.set(0);
      y.set(0);
      return;
    }
    x.set(win.x);
    y.set(win.y);
  }, [win.x, win.y, win.maximized, x, y]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSize({ w: win.w, h: win.h });
  }, [win.w, win.h]);

  const onResizeStart = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    focus(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.w;
    const startH = size.h;
    const onMove = (ev: globalThis.PointerEvent) => {
      const w = Math.max(MIN_W, startW + (ev.clientX - startX));
      const h = Math.max(MIN_H, startH + (ev.clientY - startY));
      setSize({ w, h });
    };
    const onUp = (ev: globalThis.PointerEvent) => {
      const w = Math.max(MIN_W, startW + (ev.clientX - startX));
      const h = Math.max(MIN_H, startH + (ev.clientY - startY));
      resize(win.id, w, h);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <motion.div
      drag={!win.maximized}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={parentRef}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.3 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        x,
        y,
        width: win.maximized ? '100%' : size.w,
        height: win.maximized ? '100%' : size.h,
        zIndex: win.z,
        position: 'absolute',
        borderRadius: win.maximized ? 0 : '6px 6px 2px 2px',
        border: active ? '2px solid #3a6ea5' : '2px solid #6a89ae',
        outline: active ? '1px solid #0a246a' : '1px solid #4a648a',
        boxShadow: active
          ? '0 0 0 1px #0a246a, 4px 6px 18px rgba(0,0,0,0.55)'
          : '0 0 0 1px #4a648a, 2px 3px 10px rgba(0,0,0,0.35)',
        transformOrigin: 'left bottom',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onPointerDown={() => focus(win.id)}
      onDragEnd={() => !win.maximized && move(win.id, x.get(), y.get())}
      className="pointer-events-auto"
    >
      {/* Titlebar */}
      <header
        onPointerDown={(e) => !win.maximized && controls.start(e)}
        onDoubleClick={() => toggleMaximize(win.id)}
        className={`flex items-center justify-between px-1.5 shrink-0 select-none ${
          win.maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
        style={{
          height: 22,
          background: active ? TITLEBAR_ACTIVE : TITLEBAR_INACTIVE,
          borderRadius: win.maximized ? 0 : '4px 4px 0 0',
        }}
      >
        <span
          className="text-white text-[11px] font-bold truncate flex-1 min-w-0 pr-1"
          style={{
            textShadow: active ? '1px 1px 1px rgba(0,0,0,0.5)' : '1px 1px 1px rgba(0,0,0,0.3)',
            opacity: active ? 1 : 0.85,
          }}
        >
          {win.title}
        </span>
        <div className="flex items-center gap-[2px] shrink-0">
          <CaptionBtn type="other" label="minimize" onClick={() => toggleMinimize(win.id)}>
            <Minus size={8} strokeWidth={3} />
          </CaptionBtn>
          <CaptionBtn
            type="other"
            label={win.maximized ? 'restore' : 'maximize'}
            onClick={() => toggleMaximize(win.id)}
          >
            <Square size={7} strokeWidth={2} />
          </CaptionBtn>
          <CaptionBtn type="close" label="close" onClick={() => close(win.id)}>
            <X size={9} strokeWidth={2.5} />
          </CaptionBtn>
        </div>
      </header>

      {/* Toolbar-area separator line */}
      <div
        className="shrink-0"
        style={{ height: 2, background: 'linear-gradient(to right, #4a86cc, #6aace8)' }}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white text-black relative">
        {children}
      </div>

      {/* Resize grip — bottom-right corner */}
      {!win.maximized && (
        <div
          onPointerDown={onResizeStart}
          className="absolute bottom-0 right-0 w-3.5 h-3.5"
          style={{
            cursor: 'nwse-resize',
            background:
              'linear-gradient(135deg, transparent 0%, transparent 45%, #888 46%, #888 50%, transparent 51%, transparent 65%, #888 66%, #888 70%, transparent 71%)',
            zIndex: 2,
          }}
        />
      )}
    </motion.div>
  );
}
