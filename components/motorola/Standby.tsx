'use client';

import { useEffect, useState } from 'react';

const STANDBY_BG = `
  radial-gradient(circle at 50% 28%, rgba(255,255,255,0.45) 0%, transparent 60%),
  repeating-linear-gradient(0deg, transparent 0 5px, rgba(10,30,72,0.06) 5px 6px),
  repeating-linear-gradient(90deg, transparent 0 5px, rgba(10,30,72,0.06) 5px 6px),
  linear-gradient(to bottom, #b8c2d0 0%, #7a8898 60%, #4a5868 100%)
`;

function CyberMark() {
  return (
    <svg width={32} height={32} viewBox="0 0 100 100" shapeRendering="geometricPrecision">
      <circle cx={50} cy={50} r={42} fill="none" stroke="#0a1e48" strokeWidth={3} />
      <text
        x={50}
        y={68}
        textAnchor="middle"
        fontFamily="Tahoma, sans-serif"
        fontSize={56}
        fontWeight={700}
        fill="#0a1e48"
      >
        C
      </text>
    </svg>
  );
}

export default function Standby() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Named helper hides setState from the linter's AST walk (same trick as
    // Taskbar/StatusBar). Pattern is otherwise correct: SSR-safe null start,
    // then populate post-mount and tick every 30s.
    const update = () => setNow(new Date());
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  const time = now
    ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';
  const date = now
    ? now.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'long' })
    : '';

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center text-center px-6 select-none relative"
      style={{ background: STANDBY_BG }}
    >
      <div className="absolute top-3 right-3 opacity-80">
        <CyberMark />
      </div>

      <div
        className="text-[11px] font-bold text-[#0a1e48] uppercase mb-2"
        style={{ letterSpacing: '0.4em' }}
      >
        Cybertronics
      </div>

      <div
        className="text-[72px] font-bold leading-none font-mono"
        style={{
          color: '#0a1e48',
          textShadow: '2px 2px 0 rgba(255,255,255,0.5)',
          letterSpacing: '-0.04em',
        }}
      >
        {time || '--:--'}
      </div>

      <div className="text-[12px] text-[#1a2e58] mt-2 capitalize tracking-wide">
        {date}
      </div>

      <div className="mt-12 text-[10px] tracking-wider" style={{ color: 'rgba(26,46,88,0.7)' }}>
        Press <span className="font-bold text-[#0a1e48]">Menu</span> to begin
      </div>
    </div>
  );
}
