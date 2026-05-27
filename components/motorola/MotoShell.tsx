'use client';

import StatusBar from './StatusBar';
import SoftKeys from './SoftKeys';
import Standby from './Standby';
import AppGrid from './AppGrid';
import MobileApp from './MobileApp';
import BootSequence from './BootSequence';
import { useMobileStore } from '@/lib/store/mobileStore';
import { apps } from '@/components/xp/appRegistry';

// Pixelated body wallpaper — repeating diagonal pattern over a silver gradient.
// `image-rendering: pixelated` keeps SVG icons crisp inside this shell.
const SCREEN_BG = `
  repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 6px),
  linear-gradient(to bottom, #e8eaee 0%, #b8c0c8 100%)
`;

const TITLE_BG = 'linear-gradient(to bottom, #4060a8 0%, #1e3e88 60%, #0e2e68 100%)';

export default function MotoShell() {
  const stack = useMobileStore((s) => s.stack);
  const push = useMobileStore((s) => s.push);
  const pop = useMobileStore((s) => s.pop);
  const reset = useMobileStore((s) => s.reset);
  const current = stack[stack.length - 1];

  let left: { label: string; onClick: () => void } | undefined;
  let right: { label: string; onClick: () => void } | undefined;
  let title: string | null = null;

  if (current.kind === 'standby') {
    left = { label: 'Menu', onClick: () => push({ kind: 'menu' }) };
    right = { label: 'Cart', onClick: () => push({ kind: 'app', appId: 'cart' }) };
  } else if (current.kind === 'menu') {
    left = undefined;
    right = { label: 'Back', onClick: pop };
    title = 'Menu';
  } else {
    left = undefined;
    right = { label: 'Back', onClick: pop };
    title = apps[current.appId].title;
  }

  return (
    <div
      className="absolute inset-0 flex flex-col font-xp select-none"
      style={{ background: SCREEN_BG }}
    >
      <StatusBar />

      {title && (
        <div
          className="flex items-center justify-between px-3 py-1 shrink-0 text-white text-[11px] font-bold"
          style={{
            background: TITLE_BG,
            borderBottom: '1px solid #0a1e48',
            textShadow: '0 1px 0 rgba(0,0,0,0.5)',
          }}
        >
          <span>{title}</span>
          {stack.length > 2 && (
            <button
              onClick={reset}
              className="text-[10px] font-normal opacity-80 hover:opacity-100"
              aria-label="home"
              title="Back to standby"
            >
              ⌂
            </button>
          )}
        </div>
      )}

      {current.kind === 'standby' && <Standby />}
      {current.kind === 'menu' && <AppGrid />}
      {current.kind === 'app' && (
        <MobileApp appId={current.appId} payload={current.payload} />
      )}

      <SoftKeys left={left} right={right} />

      <BootSequence />
    </div>
  );
}
