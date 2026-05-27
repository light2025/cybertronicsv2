'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useDataStore } from '@/lib/store/dataStore';
import { useXpStore } from '@/lib/store/xpStore';
import { formatPrice, nowIso, uid } from '@/lib/utils';
import type { Order, OrderItem, PaymentMethod } from '@/types';
import { useIE } from './ie/IEContext';

const PANEL_HEADER = 'linear-gradient(to bottom, #4a86d8 0%, #2060c0 50%, #1448a8 100%)';
const FREE_SHIPPING_THRESHOLD = 200;
const SHIPPING_FLAT = 25;

const BTN_STYLE = {
  background: '#ece9d8',
  border: '1px solid #777',
  boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
};
const BTN_PRIMARY = {
  background: 'linear-gradient(to bottom, #5ab85a 0%, #3d9c3d 60%, #2c882c 100%)',
  border: '1px solid #2c662c',
  color: '#fff',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)',
};
const INPUT_STYLE = {
  background: '#fff',
  border: '1px solid #7a96b8',
  boxShadow: 'inset 1px 1px 1px rgba(0,0,0,0.1)',
};

type PaymentOptionDef = {
  value: PaymentMethod;
  title: string;
  subtitle: string;
  emoji: string;
};

const PAYMENT_OPTIONS: PaymentOptionDef[] = [
  { value: 'tabby',  title: 'Tabby',  subtitle: 'Pay in 4 — 0% interest, no late fees · UAE',  emoji: '🟣' },
  { value: 'tamara', title: 'Tamara', subtitle: 'Buy now, pay in 3 — Sharia compliant · UAE', emoji: '🟢' },
  { value: 'card',   title: 'Credit / Debit Card', subtitle: 'Visa · Mastercard · Amex',      emoji: '💳' },
  { value: 'cod',    title: 'Cash on Delivery',    subtitle: 'Pay when you receive · UAE',    emoji: '💵' },
];

type Form = { name: string; email: string; phone: string };
type FormErrors = Partial<Form> & { payment?: string };
const EMPTY: Form = { name: '', email: '', phone: '' };

export default function Checkout({ winId }: { winId: string }) {
  const items      = useCartStore((s) => s.items);
  const clearCart  = useCartStore((s) => s.clear);
  const products   = useDataStore((s) => s.products);
  const placeOrder = useDataStore((s) => s.placeOrder);
  const closeWin   = useXpStore((s) => s.close);
  const openApp    = useXpStore((s) => s.open);
  const ie         = useIE();

  const keepShopping = () => {
    if (ie) ie.navigate('cybertronics://shop');
    else openApp('ie', { title: 'Internet Explorer', payload: { url: 'cybertronics://shop' } });
  };

  const [form, setForm]                       = useState<Form>(EMPTY);
  const [paymentMethod, setPaymentMethod]     = useState<PaymentMethod | null>(null);
  const [errors, setErrors]                   = useState<FormErrors>({});
  const [placedOrderId, setPlacedOrderId]     = useState<string | null>(null);
  const [placedMethod, setPlacedMethod]       = useState<PaymentMethod | null>(null);

  const orderLines: OrderItem[] = items
    .map((line): OrderItem | null => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      const unit = product.discountPrice ?? product.price;
      return {
        productId: product.id,
        title: product.title,
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
  const total    = subtotal + shipping;

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim())  e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!paymentMethod)     e.payment = 'Pick a payment method';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const order: Order = {
      id: uid(),
      customerName:  form.name.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      items: orderLines,
      subtotal,
      discountTotal,
      total,
      status: 'pending',
      paymentMethod: paymentMethod ?? undefined,
      createdAt: nowIso(),
    };
    placeOrder(order);
    setPlacedOrderId(order.id);
    setPlacedMethod(paymentMethod);
    clearCart();
  };

  // Confirmation view
  if (placedOrderId) {
    const methodLabel = PAYMENT_OPTIONS.find((o) => o.value === placedMethod)?.title ?? '—';
    return (
      <div className="flex flex-col h-full" style={{ background: '#ece9d8' }}>
        <div
          className="px-3 py-1.5 shrink-0 text-white text-[11px] font-bold"
          style={{ background: PANEL_HEADER, borderBottom: '1px solid #1448a8' }}
        >
          ✓ Order Placed
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div
            className="w-14 h-14 rounded-full grid place-items-center"
            style={{ background: '#3a843a', border: '2px solid #2c682c', color: '#fff' }}
          >
            <Check className="w-7 h-7" strokeWidth={3} />
          </div>
          <div className="text-[13px] font-bold text-gray-900">Thank you for your order.</div>
          <div className="text-[11px] text-gray-700">
            Order ID: <span className="font-mono text-gray-900">{placedOrderId.slice(0, 8)}</span>
          </div>
          <div className="text-[11px] text-gray-700">
            Payment method: <span className="font-semibold">{methodLabel}</span>
          </div>
          <div className="text-[11px] text-gray-600 max-w-sm">
            A confirmation email will be sent to {form.email}. You can track this order in the admin panel.
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={keepShopping} className="px-4 py-1 text-[11px] text-gray-900 rounded-sm" style={BTN_STYLE}>
              Keep shopping
            </button>
            <button
              onClick={() => closeWin(winId)}
              className="px-4 py-1 text-[11px] rounded-sm font-bold"
              style={BTN_PRIMARY}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart fallback
  if (orderLines.length === 0) {
    return (
      <div className="flex flex-col h-full" style={{ background: '#ece9d8' }}>
        <div
          className="px-3 py-1.5 shrink-0 text-white text-[11px] font-bold"
          style={{ background: PANEL_HEADER, borderBottom: '1px solid #1448a8' }}
        >
          Checkout
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <div className="text-[12px] text-gray-700">Your cart is empty.</div>
          <button
            onClick={() => closeWin(winId)}
            className="px-4 py-1 text-[11px] text-gray-900 rounded-sm"
            style={BTN_STYLE}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="flex flex-col h-full" style={{ background: '#ece9d8' }}>
      <div
        className="px-3 py-1.5 shrink-0 text-white text-[11px] font-bold"
        style={{ background: PANEL_HEADER, borderBottom: '1px solid #1448a8' }}
      >
        Checkout
      </div>

      <div className="flex-1 overflow-auto p-3 grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3">
        {/* Left column: customer info + payment */}
        <div className="space-y-3">
          <div
            className="p-3 space-y-2"
            style={{ background: '#fff', border: '1px solid #aac', borderRadius: 2 }}
          >
            <h3 className="text-[11px] font-bold text-[#0a246a] uppercase tracking-wide">
              Customer Information
            </h3>
            <label className="block">
              <span className="text-[11px] text-gray-700 block mb-0.5">
                Full Name {errors.name && <span className="text-red-600">— {errors.name}</span>}
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-2 py-1 text-[12px] text-gray-900 focus:outline-none"
                style={INPUT_STYLE}
                placeholder="Jane Doe"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-gray-700 block mb-0.5">
                Email {errors.email && <span className="text-red-600">— {errors.email}</span>}
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-2 py-1 text-[12px] text-gray-900 focus:outline-none"
                style={INPUT_STYLE}
                placeholder="jane@example.com"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-gray-700 block mb-0.5">
                Phone {errors.phone && <span className="text-red-600">— {errors.phone}</span>}
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-2 py-1 text-[12px] text-gray-900 focus:outline-none"
                style={INPUT_STYLE}
                placeholder="+971 ..."
              />
            </label>
          </div>

          <div
            className="p-3 space-y-2"
            style={{ background: '#fff', border: '1px solid #aac', borderRadius: 2 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-[#0a246a] uppercase tracking-wide">
                Payment Method
              </h3>
              {errors.payment && <span className="text-[10px] text-red-600">— {errors.payment}</span>}
            </div>
            <div className="space-y-1.5">
              {PAYMENT_OPTIONS.map((opt) => {
                const active = paymentMethod === opt.value;
                return (
                  <label
                    key={opt.value}
                    className="flex items-start gap-2 p-2 cursor-pointer hover:bg-blue-50 select-none"
                    style={{
                      background: active ? '#dce8f8' : '#fff',
                      border: active ? '2px solid #2060c0' : '1px solid #aac',
                      borderRadius: 2,
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={active}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="mt-0.5 accent-cyber"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-gray-900">
                        {opt.emoji} {opt.title}
                      </div>
                      <div className="text-[10px] text-gray-600">{opt.subtitle}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500 italic">
              Demo storefront — no payment will be charged. Real Tabby / Tamara / Stripe wiring deferred.
            </p>
          </div>
        </div>

        {/* Right column: order summary */}
        <div
          className="p-3 self-start space-y-2 text-[11px]"
          style={{ background: '#dce8f8', border: '1px solid #6896d2', borderRadius: 2 }}
        >
          <h3 className="text-[11px] font-bold text-[#0a246a] uppercase tracking-wide">
            Order Summary
          </h3>
          <ul className="space-y-1 max-h-40 overflow-auto">
            {orderLines.map((l, i) => {
              const variantBits = [l.selectedSize, l.selectedColor].filter(Boolean);
              return (
                <li
                  key={`${l.productId}|${l.selectedSize ?? ''}|${l.selectedColor ?? ''}|${i}`}
                  className="flex justify-between gap-2"
                >
                  <span className="text-gray-800 truncate">
                    {l.title}
                    {variantBits.length > 0 && (
                      <span className="text-gray-500"> ({variantBits.join(' · ')})</span>
                    )}{' '}
                    <span className="text-gray-500">× {l.quantity}</span>
                  </span>
                  <span className="font-bold text-gray-900 shrink-0">{formatPrice(l.totalPrice)}</span>
                </li>
              );
            })}
          </ul>
          <div className="pt-1 mt-1 space-y-0.5" style={{ borderTop: '1px solid #6896d2' }}>
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Saved</span>
                <span>− {formatPrice(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div
              className="flex justify-between font-bold text-gray-900 pt-1 mt-1"
              style={{ borderTop: '1px solid #6896d2' }}
            >
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div
        className="shrink-0 p-3 flex items-center justify-end gap-2"
        style={{ background: '#ece9d8', borderTop: '1px solid #aaa' }}
      >
        <button onClick={() => closeWin(winId)} className="px-3 py-1 text-[11px] text-gray-900 rounded-sm" style={BTN_STYLE}>
          Cancel
        </button>
        <button onClick={submit} className="px-4 py-1 text-[11px] rounded-sm font-bold" style={BTN_PRIMARY}>
          Place Order — {formatPrice(total)}
        </button>
      </div>
    </div>
  );
}
