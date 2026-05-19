'use client';

import StatusBar from './StatusBar';
import SoftKeys from './SoftKeys';
import Standby from './Standby';
import AppGrid from './AppGrid';
import NokiaApp from './NokiaApp';
import { useNokiaStore } from '@/lib/store/nokiaStore';
import { apps } from '@/components/xp/appRegistry';

const SCREEN_BG = 'linear-gradient(to bottom, #eef3f9 0%, #c8d8ea 100%)';

const TITLE_BG = 'linear-gradient(to bottom, #4a86d8 0%, #2060c0 60%, #1448a8 100%)';

export default function NokiaShell() {
  const stack = useNokiaStore((s) => s.stack);
  const push = useNokiaStore((s) => s.push);
  const pop = useNokiaStore((s) => s.pop);
  const reset = useNokiaStore((s) => s.reset);
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
            borderBottom: '1px solid #1448a8',
            textShadow: '0 1px 1px rgba(0,0,0,0.4)',
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
        <NokiaApp appId={current.appId} payload={current.payload} />
      )}

      <SoftKeys left={left} right={right} />
    </div>
  );
}
