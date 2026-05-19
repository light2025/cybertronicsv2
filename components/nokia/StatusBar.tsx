'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useNokiaStore } from '@/lib/store/nokiaStore';

const BAR_BG = 'linear-gradient(to bottom, #6e90b8 0%, #4a6e96 40%, #38567e 100%)';

function SignalBars() {
  return (
    <div className="flex items-end gap-[1px] h-3" aria-label="signal">
      <div className="w-[2px] h-1 bg-white" />
      <div className="w-[2px] h-1.5 bg-white" />
      <div className="w-[2px] h-2 bg-white" />
      <div className="w-[2px] h-3 bg-white" />
    </div>
  );
}

function Battery() {
  return (
    <div className="flex items-center" aria-label="battery">
      <div
        className="w-4 h-2 relative flex items-center gap-[1px] px-[1px]"
        style={{ border: '1px solid #fff' }}
      >
        <div className="flex-1 h-[3px] bg-white" />
        <div className="flex-1 h-[3px] bg-white" />
        <div className="flex-1 h-[3px] bg-white" />
      </div>
      <div className="w-[2px] h-[5px] bg-white" />
    </div>
  );
}

export default function StatusBar() {
  const [time, setTime] = useState('');
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const push = useNokiaStore((s) => s.push);

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
      className="flex items-center justify-between px-2 shrink-0 text-white text-[10px] font-bold select-none"
      style={{
        height: 22,
        background: BAR_BG,
        borderBottom: '1px solid #1e3858',
        textShadow: '0 1px 1px rgba(0,0,0,0.45)',
      }}
    >
      <div className="flex items-center gap-1.5">
        <SignalBars />
      </div>

      <div className="flex-1 text-center tracking-wide">Cybertronics</div>

      <div className="flex items-center gap-2">
        {cartCount > 0 && (
          <button
            onClick={() => push({ kind: 'app', appId: 'cart' })}
            className="flex items-center gap-0.5 active:opacity-70 -m-0.5 p-0.5 rounded-sm"
            aria-label={`Open cart, ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
            title={`${cartCount} item(s) — open cart`}
          >
            <ShoppingCart className="w-2.5 h-2.5" />
            <span>{cartCount}</span>
          </button>
        )}
        <Battery />
        <span>{time}</span>
      </div>
    </div>
  );
}
