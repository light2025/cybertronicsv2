'use client';

import { useEffect, useState } from 'react';

export default function Standby() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const time = now
    ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';
  const date = now
    ? now.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'long' })
    : '';

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 select-none">
      <div className="text-[12px] font-bold text-[#0a3060] uppercase tracking-[0.3em] mb-2">
        Cybertronics
      </div>

      <div
        className="text-[64px] font-bold leading-none"
        style={{
          color: '#0a3060',
          textShadow: '1px 1px 0 rgba(255,255,255,0.6)',
          letterSpacing: '-0.02em',
        }}
      >
        {time || '--:--'}
      </div>

      <div className="text-[12px] text-[#4a5878] mt-2 capitalize">{date}</div>

      <div className="mt-10 text-[10px] text-[#4a5878]">
        Press <span className="font-bold text-[#0a3060]">Menu</span> to begin
      </div>
    </div>
  );
}
