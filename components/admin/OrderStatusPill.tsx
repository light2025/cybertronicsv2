'use client';

import type { OrderStatus } from '@/types';

const MAP: Record<OrderStatus, { label: string; cls: string }> = {
  cart: { label: 'Cart', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  paid: { label: 'Paid', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
  shipped: { label: 'Shipped', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border-red-200' },
};

export default function OrderStatusPill({ status }: { status: OrderStatus }) {
  const m = MAP[status];
  return (
    <span className={`inline-flex items-center px-2 h-5 rounded-full text-[10px] font-semibold border ${m.cls}`}>
      {m.label}
    </span>
  );
}
