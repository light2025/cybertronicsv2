'use client';

import Standby from './Standby';
import AppCarousel from './AppCarousel';
import MobileApp from './MobileApp';
import BootSequence from './BootSequence';
import { useMobileStore } from '@/lib/store/mobileStore';
import { apps } from '@/components/xp/appRegistry';

const LCD_BG = '#7BA226';
const LCD_DARK = '#324C0D';

export default function MotoShell() {
  const stack = useMobileStore((s) => s.stack);
  const push = useMobileStore((s) => s.push);
  const pop = useMobileStore((s) => s.pop);
  const current = stack[stack.length - 1];

  let leftKey: { label: string; onClick: () => void } | undefined;
  let rightKey: { label: string; onClick: () => void } | undefined;
  let title: string | null = null;

  if (current.kind === 'standby') {
    leftKey = undefined;
    rightKey = undefined;
  } else if (current.kind === 'menu') {
    leftKey = { label: 'Select', onClick: () => {} };
    rightKey = { label: 'Back', onClick: pop };
    title = 'Menu';
  } else {
    leftKey = undefined;
    rightKey = { label: 'Back', onClick: pop };
    title = apps[current.appId].title;
  }

  return (
    <div
      className="absolute inset-0 select-none overflow-hidden"
      style={{
        fontFamily: 'var(--font-pixel)',
        background: LCD_BG,
      }}
    >
      {/* Phone frame overlay */}
      <img
        src="/mobile/frame.png"
        alt=""
        className="absolute inset-0 w-full h-full object-fill z-[100] pointer-events-none"
      />

      {/* Glass reflection overlay */}
      <img
        src="/mobile/glass.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-[90] pointer-events-none"
        style={{ opacity: 0.6, mixBlendMode: 'normal' }}
      />

      {/* Display area — inset from frame edges */}
      <div
        className="absolute z-20"
        style={{
          top: '15%',
          bottom: '18%',
          left: '18%',
          right: '18%',
          color: LCD_DARK,
        }}
      >
        {current.kind === 'standby' && (
          <Standby onMenuPress={() => push({ kind: 'menu' })} />
        )}

        {current.kind === 'menu' && (
          <AppCarousel
            leftKey={leftKey}
            rightKey={rightKey}
          />
        )}

        {current.kind === 'app' && (
          <div className="w-full h-full flex flex-col">
            {/* App title bar */}
            <div
              className="shrink-0 flex items-center justify-between px-2 py-1 text-[14px] font-bold"
              style={{ borderBottom: `2px solid ${LCD_DARK}` }}
            >
              <span>{title}</span>
            </div>

            {/* App content */}
            <div className="flex-1 min-h-0 overflow-auto">
              <MobileApp appId={current.appId} payload={current.payload} />
            </div>

            {/* Soft keys */}
            <div
              className="shrink-0 flex items-center justify-between px-2 py-2 text-[18px] font-bold"
              style={{ borderTop: `2px solid ${LCD_DARK}` }}
            >
              <span></span>
              <button
                onClick={rightKey?.onClick}
                className="active:scale-95"
              >
                {rightKey?.label}
              </button>
            </div>
          </div>
        )}
      </div>

      <BootSequence />
    </div>
  );
}
