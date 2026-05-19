/* eslint-disable @next/next/no-img-element */
'use client';

import { Minus, Plus, X, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useDataStore } from '@/lib/store/dataStore';
import { useXpStore } from '@/lib/store/xpStore';
import { formatPrice } from '@/lib/utils';

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

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.remove);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clear = useCartStore((s) => s.clear);

  const products = useDataStore((s) => s.products);
  const openApp = useXpStore((s) => s.open);

  const lines = items
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      const unit = product.discountPrice ?? product.price;
      return { line, product, unit, total: unit * line.quantity };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col h-full" style={{ background: '#ece9d8' }}>
        <div
          className="px-3 py-1.5 shrink-0 text-white text-[11px] font-bold"
          style={{ background: PANEL_HEADER, borderBottom: '1px solid #1448a8' }}
        >
          🛒 Shopping Cart — Empty
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <ShoppingCart className="w-12 h-12 text-gray-400" strokeWidth={1.3} />
          <div className="text-[12px] text-gray-700 font-bold">Your cart is empty.</div>
          <div className="text-[11px] text-gray-500">Open the Lifestyle folder to browse products.</div>
          <button
            onClick={() => openApp('lifestyle', { title: 'Lifestyle' })}
            className="mt-2 px-4 py-1 text-[11px] text-gray-900 rounded-sm"
            style={BTN_STYLE}
          >
            Browse Lifestyle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#ece9d8' }}>
      <div
        className="px-3 py-1.5 shrink-0 text-white text-[11px] font-bold flex items-center justify-between"
        style={{ background: PANEL_HEADER, borderBottom: '1px solid #1448a8' }}
      >
        <span>🛒 Shopping Cart</span>
        <span className="opacity-80 font-normal">
          {lines.reduce((n, l) => n + l.line.quantity, 0)} item
          {lines.reduce((n, l) => n + l.line.quantity, 0) !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lines */}
      <div className="flex-1 overflow-auto p-2 space-y-1.5">
        {lines.map(({ line, product, unit, total: lineTotal }) => {
          const variantOpts = { size: line.selectedSize, color: line.selectedColor };
          const variantBits = [line.selectedSize, line.selectedColor].filter(Boolean);
          return (
            <div
              key={`${product.id}|${line.selectedSize ?? ''}|${line.selectedColor ?? ''}`}
              className="flex gap-2 p-2 bg-white"
              style={{ border: '1px solid #aac', borderRadius: 2 }}
            >
              <div
                className="w-14 h-14 shrink-0 overflow-hidden bg-gray-100"
                style={{ border: '1px solid #ccc' }}
              >
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xl">🖼️</div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2">
                      {product.title}
                    </div>
                    {variantBits.length > 0 && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {variantBits.join(' · ')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(product.id, variantOpts)}
                    className="shrink-0 w-5 h-5 grid place-items-center rounded-sm hover:bg-red-100 text-gray-500 hover:text-red-600"
                    aria-label="remove"
                    title="Remove from cart"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQuantity(product.id, line.quantity - 1, variantOpts)}
                      className="w-5 h-5 grid place-items-center text-gray-900 rounded-sm"
                      style={BTN_STYLE}
                      aria-label="decrease"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[11px] font-bold w-6 text-center">{line.quantity}</span>
                    <button
                      onClick={() => setQuantity(product.id, line.quantity + 1, variantOpts)}
                      className="w-5 h-5 grid place-items-center text-gray-900 rounded-sm"
                      style={BTN_STYLE}
                      aria-label="increase"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[10px] text-gray-500 ml-1">× {formatPrice(unit)}</span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-900">{formatPrice(lineTotal)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / totals */}
      <div
        className="shrink-0 p-3 space-y-1 text-[11px]"
        style={{ background: '#dce8f8', borderTop: '1px solid #6896d2' }}
      >
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping {shipping === 0 && subtotal > 0 && <em className="not-italic text-emerald-700">(free over {formatPrice(FREE_SHIPPING_THRESHOLD)})</em>}</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        <div
          className="flex justify-between font-bold text-gray-900 pt-1 mt-1"
          style={{ borderTop: '1px solid #6896d2' }}
        >
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={clear}
            className="px-3 py-1 text-[11px] text-gray-900 rounded-sm"
            style={BTN_STYLE}
          >
            Clear cart
          </button>
          <button
            onClick={() => openApp('checkout', { title: 'Checkout' })}
            className="px-4 py-1 text-[11px] rounded-sm font-bold"
            style={BTN_PRIMARY}
          >
            Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}
