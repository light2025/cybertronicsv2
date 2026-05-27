'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useMobileStore } from '@/lib/store/mobileStore';

const BAR_BG = 'linear-gradient(to bottom, #d8dade 0%, #a8acb2 50%, #797f86 100%)';

function PixelSignalBars() {
  return (
    <div className="flex items-end gap-px" aria-label="signal" style={{ height: 12 }}>
      {[3, 6, 9, 12].map((h) => (
        <div key={h} className="bg-black" style={{ width: 3, height: h }} />
      ))}
    </div>
  );
}

function PixelBattery() {
  return (
    <div className="flex items-center" aria-label="battery">
      <div
        className="relative flex"
        style={{ height: 9, width: 17, border: '1.5px solid #000', borderRadius: 1 }}
      >
        <div className="absolute inset-px flex gap-px">
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-black" />
        </div>
      </div>
      <div style={{ width: 2, height: 5, background: '#000' }} />
    </div>
  );
}

export default function StatusBar() {
  const [time, setTime] = useState('');
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const push = useMobileStore((s) => s.push);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-2 shrink-0 text-black text-[10px] font-bold select-none"
      style={{
        height: 24,
        background: BAR_BG,
        borderBottom: '1px solid #404448',
        textShadow: '0 1px 0 rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex items-center gap-1.5">
        <PixelSignalBars />
        <span className="font-mono" style={{ letterSpacing: '0.18em' }}>
          CYBERTRONICS
        </span>
      </div>

      <div className="flex items-center gap-2">
        {cartCount > 0 && (
          <button
            onClick={() => push({ kind: 'app', appId: 'cart' })}
            className="flex items-center gap-0.5 active:opacity-70 -m-0.5 p-0.5 rounded-sm"
            aria-label={`Open cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
            title={`${cartCount} item(s) — open cart`}
          >
            <ShoppingCart className="w-2.5 h-2.5" strokeWidth={2.5} />
            <span>{cartCount}</span>
          </button>
        )}
        <PixelBattery />
        <span className="font-mono">{time}</span>
      </div>
    </div>
  );
}
