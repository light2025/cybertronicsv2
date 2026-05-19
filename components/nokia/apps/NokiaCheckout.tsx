'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useCartStore, useCartHydrated } from '@/lib/store/cartStore';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { useNokiaStore } from '@/lib/store/nokiaStore';
import { formatPrice, nowIso, uid } from '@/lib/utils';
import type { Order, OrderItem } from '@/types';

const FREE_SHIPPING_THRESHOLD = 200;
const SHIPPING_FLAT = 25;

const SUB_HEADER_BG = '#dce8f8';
const SUB_HEADER_BORDER = '#6896d2';

const PRIMARY_BTN = {
  background: 'linear-gradient(to bottom, #62c462 0%, #52b452 35%, #3d9c3d 60%, #2c882c 100%)',
  border: '1px solid #2c662c',
  color: '#fff',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)',
};
const NEUTRAL_BTN = {
  background: '#ece9d8',
  border: '1px solid #777',
  boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
};
const INPUT_STYLE = {
  background: '#fff',
  border: '1px solid #5878a0',
  boxShadow: 'inset 1px 1px 1px rgba(0,0,0,0.08)',
};

type Form = { name: string; email: string; phone: string };
const EMPTY: Form = { name: '', email: '', phone: '' };

export default function NokiaCheckout() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const cartHydrated = useCartHydrated();
  const products = useDataStore((s) => s.products);
  const placeOrder = useDataStore((s) => s.placeOrder);
  const dataHydrated = useHydrated();
  const popNokia = useNokiaStore((s) => s.pop);
  const resetNokia = useNokiaStore((s) => s.reset);
  const push = useNokiaStore((s) => s.push);

  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  if (!cartHydrated || !dataHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center text-[11px] text-[#4a5878] bg-white">
        Loading…
      </div>
    );
  }

  const orderLines: OrderItem[] = items
    .map((line): OrderItem | null => {
      const p = products.find((q) => q.id === line.productId);
      if (!p) return null;
      const unit = p.discountPrice ?? p.price;
      return {
        productId: p.id,
        title: p.title,
        quantity: line.quantity,
        unitPrice: unit,
        totalPrice: unit * line.quantity,
        selectedSize: line.selectedSize,
        selectedColor: line.selectedColor,
      };
    })
    .filter((x): x is OrderItem => x !== null);

  const subtotal = orderLines.reduce((sum, l) => sum + l.totalPrice, 0);
  const discountTotal = items.reduce((sum, line) => {
    const p = products.find((q) => q.id === line.productId);
    if (!p || p.discountPrice == null) return sum;
    return sum + (p.price - p.discountPrice) * line.quantity;
  }, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const order: Order = {
      id: uid(),
      customerName: form.name.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      items: orderLines,
      subtotal,
      discountTotal,
      total,
      status: 'pending',
      createdAt: nowIso(),
    };
    placeOrder(order);
    setPlacedOrderId(order.id);
    clearCart();
  };

  // Confirmation view
  if (placedOrderId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center bg-white">
        <div
          className="w-14 h-14 rounded-full grid place-items-center"
          style={{ background: '#3a843a', border: '2px solid #2c682c', color: '#fff' }}
        >
          <Check className="w-7 h-7" strokeWidth={3} />
        </div>
        <div className="text-[14px] font-bold text-[#0a3060]">Thank you for your order.</div>
        <div className="text-[11px] text-[#4a5878]">
          Order ID:{' '}
          <span className="font-mono text-[#0a3060]">{placedOrderId.slice(0, 8)}</span>
        </div>
        <div className="text-[11px] text-[#4a5878] max-w-[18rem]">
          A confirmation email will be sent to {form.email}.
        </div>
        <div className="flex gap-2 pt-3 w-full">
          <button
            onClick={() => {
              resetNokia();
              push({ kind: 'app', appId: 'lifestyle' });
            }}
            className="flex-1 px-3 py-1.5 text-[11px] text-gray-900 rounded-sm"
            style={NEUTRAL_BTN}
          >
            Keep shopping
          </button>
          <button
            onClick={resetNokia}
            className="flex-1 px-3 py-1.5 text-[11px] font-bold rounded-sm"
            style={PRIMARY_BTN}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Empty cart guard
  if (orderLines.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center bg-white">
        <div className="text-[12px] font-bold text-[#0a3060]">Your cart is empty.</div>
        <button
          onClick={popNokia}
          className="px-4 py-1.5 text-[11px] text-gray-900 rounded-sm"
          style={NEUTRAL_BTN}
        >
          Back
        </button>
      </div>
    );
  }

  // Form view
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div
        className="px-3 py-1.5 shrink-0 text-[11px] font-bold text-[#0a3060]"
        style={{ background: SUB_HEADER_BG, borderBottom: `1px solid ${SUB_HEADER_BORDER}` }}
      >
        Customer Information
      </div>

      <div className="flex-1 overflow-auto min-h-0 px-3 py-3 space-y-3">
        <label className="block">
          <span className="text-[11px] text-[#4a5878] block mb-0.5">
            Full Name{' '}
            {errors.name && <span className="text-red-600">— {errors.name}</span>}
          </span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jane Doe"
            className="w-full px-2 py-1.5 text-[12px] text-gray-900 focus:outline-none"
            style={INPUT_STYLE}
          />
        </label>

        <label className="block">
          <span className="text-[11px] text-[#4a5878] block mb-0.5">
            Email{' '}
            {errors.email && <span className="text-red-600">— {errors.email}</span>}
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="jane@example.com"
            className="w-full px-2 py-1.5 text-[12px] text-gray-900 focus:outline-none"
            style={INPUT_STYLE}
          />
        </label>

        <label className="block">
          <span className="text-[11px] text-[#4a5878] block mb-0.5">
            Phone{' '}
            {errors.phone && <span className="text-red-600">— {errors.phone}</span>}
          </span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+971 ..."
            className="w-full px-2 py-1.5 text-[12px] text-gray-900 focus:outline-none"
            style={INPUT_STYLE}
          />
        </label>

        {/* Order summary card */}
        <div
          className="p-2.5 rounded space-y-1 text-[11px]"
          style={{ background: '#dce8f8', border: '1px solid #6896d2' }}
        >
          <h3 className="text-[10px] font-bold text-[#0a3060] uppercase tracking-wide">
            Order Summary
          </h3>
          <ul className="space-y-0.5 max-h-32 overflow-auto">
            {orderLines.map((l, i) => {
              const variantBits = [l.selectedSize, l.selectedColor].filter(Boolean);
              return (
                <li key={`${l.productId}|${l.selectedSize ?? ''}|${l.selectedColor ?? ''}|${i}`} className="flex justify-between gap-2">
                  <span className="text-[#0a3060] truncate">
                    {l.title}
                    {variantBits.length > 0 && (
                      <span className="text-[#4a5878]"> ({variantBits.join(' · ')})</span>
                    )}{' '}
                    <span className="text-[#4a5878]">× {l.quantity}</span>
                  </span>
                  <span className="font-bold text-[#0a3060] shrink-0">
                    {formatPrice(l.totalPrice)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div
            className="pt-1 mt-1 space-y-0.5"
            style={{ borderTop: '1px solid #6896d2' }}
          >
            <div className="flex justify-between text-[#4a5878]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Saved</span>
                <span>− {formatPrice(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#4a5878]">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div
              className="flex justify-between font-bold text-[#0a3060] pt-1 mt-1"
              style={{ borderTop: '1px solid #6896d2' }}
            >
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[#4a5878]">
          Demo storefront — no payment will be charged.
        </p>
      </div>

      {/* Footer actions */}
      <div
        className="shrink-0 px-3 py-2 flex items-center gap-2"
        style={{ background: SUB_HEADER_BG, borderTop: `1px solid ${SUB_HEADER_BORDER}` }}
      >
        <button
          onClick={popNokia}
          className="flex-1 px-2 py-1.5 text-[11px] text-gray-900 rounded-sm"
          style={NEUTRAL_BTN}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          className="flex-1 px-2 py-1.5 text-[11px] font-bold rounded-sm"
          style={PRIMARY_BTN}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
