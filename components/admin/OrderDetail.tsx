'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import OrderStatusPill from '@/components/admin/OrderStatusPill';
import type { OrderStatus } from '@/types';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const order = useDataStore((s) => s.orders.find((o) => o.id === orderId));
  const updateOrder = useDataStore((s) => s.updateOrder);
  const hydrated = useHydrated();

  if (hydrated && !order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-gray-500 text-[14px]">Order not found.</p>
        <Button variant="ghost" onClick={() => router.push('/admin/orders')}>
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Button>
      </div>
    );
  }

  if (!order) {
    return <div className="text-gray-500 text-[13px]">Loading…</div>;
  }

  const shippingCost = order.total - order.subtotal;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-[18px] font-bold text-gray-900">
              Order <span className="font-mono">{order.id.slice(0, 8)}</span>
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">{fmtDate(order.createdAt)}</p>
          </div>
        </div>
        <OrderStatusPill status={order.status} />
      </div>

      {/* Two-column: customer + status updater */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
            Customer
          </h2>
          <div className="space-y-2 text-[13px]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <a
                href={`mailto:${order.customerEmail}`}
                className="text-cyber-dark hover:underline"
              >
                {order.customerEmail}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <a
                href={`tel:${order.customerPhone}`}
                className="text-gray-900 hover:underline"
              >
                {order.customerPhone}
              </a>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
            Status
          </h2>
          <label className="block">
            <span className="block text-[12px] font-medium text-gray-700 mb-1">
              Update status
            </span>
            <select
              value={order.status}
              onChange={(e) =>
                updateOrder(order.id, { status: e.target.value as OrderStatus })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyber/30 focus:border-cyber"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[11px] text-gray-500">
            Changes save immediately.
          </p>
        </section>
      </div>

      {/* Line items */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200">
          <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
            Line Items
          </h2>
        </div>
        <table className="w-full text-[13px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 px-5 py-2.5">
                Product
              </th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500 px-5 py-2.5">
                Qty
              </th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500 px-5 py-2.5">
                Unit
              </th>
              <th className="text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500 px-5 py-2.5">
                Line Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i, idx) => {
              const variantBits = [i.selectedSize, i.selectedColor].filter(Boolean);
              return (
                <tr
                  key={`${i.productId}|${i.selectedSize ?? ''}|${i.selectedColor ?? ''}|${idx}`}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-5 py-2.5 text-gray-900">
                    <div>{i.title}</div>
                    {variantBits.length > 0 && (
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {variantBits.join(' · ')}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-right text-gray-700 align-top">{i.quantity}</td>
                  <td className="px-5 py-2.5 text-right text-gray-700 align-top">
                    {formatPrice(i.unitPrice)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-semibold text-gray-900 align-top">
                    {formatPrice(i.totalPrice)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Totals */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="ml-auto max-w-xs space-y-1.5 text-[13px]">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Saved</span>
              <span>− {formatPrice(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-700">
            <span>Shipping</span>
            <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
