'use client';

import type { StockStatus } from '@/types';

const MAP: Record<StockStatus, { label: string; cls: string }> = {
  in_stock: { label: 'In stock', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  out_of_stock: { label: 'Out', cls: 'bg-red-100 text-red-700 border-red-200' },
  preorder: { label: 'Preorder', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export default function StockPill({ status }: { status: StockStatus }) {
  const m = MAP[status];
  return (
    <span className={`inline-flex items-center px-2 h-5 rounded-full text-[10px] font-semibold border ${m.cls}`}>
      {m.label}
    </span>
  );
}
