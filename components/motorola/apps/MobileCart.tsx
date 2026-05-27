/* eslint-disable @next/next/no-img-element */
'use client';

import { Minus, Plus, X, ShoppingCart, BookmarkPlus } from 'lucide-react';
import { useCartStore, useCartHydrated } from '@/lib/store/cartStore';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { useSaveForLaterStore, useSavedHydrated } from '@/lib/store/saveForLaterStore';
import { useMobileStore } from '@/lib/store/mobileStore';
import { formatPrice } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 200;
const SHIPPING_FLAT = 25;

const SUB_HEADER_BG = '#dce8f8';
const SUB_HEADER_BORDER = '#6896d2';

const NEUTRAL_BTN = {
  background: '#ece9d8',
  border: '1px solid #777',
  boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
};
const PRIMARY_BTN = {
  background: 'linear-gradient(to bottom, #62c462 0%, #52b452 35%, #3d9c3d 60%, #2c882c 100%)',
  border: '1px solid #2c662c',
  color: '#fff',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)',
};
const QTY_BTN = {
  background: 'linear-gradient(to bottom, #ffffff 0%, #e4ecf6 100%)',
  border: '1px solid #5878a0',
};

export default function MobileCart() {
  const items       = useCartStore((s) => s.items);
  const addToCart   = useCartStore((s) => s.add);
  const remove      = useCartStore((s) => s.remove);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clear       = useCartStore((s) => s.clear);
  const cartHydrated = useCartHydrated();

  const savedItems   = useSaveForLaterStore((s) => s.items);
  const saveItem     = useSaveForLaterStore((s) => s.save);
  const unsaveItem   = useSaveForLaterStore((s) => s.unsave);
  const savedHydrated = useSavedHydrated();

  const products = useDataStore((s) => s.products);
  const dataHydrated = useHydrated();
  const push = useMobileStore((s) => s.push);

  if (!cartHydrated || !dataHydrated || !savedHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center text-[11px] text-[#4a5878] bg-white">
        Loading…
      </div>
    );
  }

  const lines = items
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      const unit = product.discountPrice ?? product.price;
      return { line, product, unit, total: unit * line.quantity };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const savedLines = savedItems
    .map((saved) => {
      const product = products.find((p) => p.id === saved.productId);
      if (!product) return null;
      const unit = product.discountPrice ?? product.price;
      return { saved, product, unit };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal  = lines.reduce((sum, l) => sum + l.total, 0);
  const itemCount = lines.reduce((n, l) => n + l.line.quantity, 0);
  const shipping  = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total     = subtotal + shipping;

  const moveToSaved = (productId: string, opts: { size?: string; color?: string }) => {
    saveItem(productId, opts);
    remove(productId, opts);
  };
  const moveToCart = (productId: string, opts: { size?: string; color?: string }) => {
    addToCart(productId, 1, opts);
    unsaveItem(productId, opts);
  };

  const hasCart  = lines.length > 0;
  const hasSaved = savedLines.length > 0;

  if (!hasCart && !hasSaved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center bg-white">
        <ShoppingCart className="w-12 h-12 text-[#9aabc4]" strokeWidth={1.3} />
        <div className="text-[13px] font-bold text-[#0a3060]">Your cart is empty.</div>
        <div className="text-[11px] text-[#4a5878]">Browse the Lifestyle folder to find something.</div>
        <button
          onClick={() => push({ kind: 'app', appId: 'lifestyle' })}
          className="mt-2 px-4 py-1.5 text-[11px] text-gray-900 rounded-sm"
          style={NEUTRAL_BTN}
        >
          Browse Lifestyle
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div
        className="px-3 py-1.5 shrink-0 flex items-center justify-between text-[11px]"
        style={{ background: SUB_HEADER_BG, borderBottom: `1px solid ${SUB_HEADER_BORDER}` }}
      >
        <span className="font-bold text-[#0a3060]">Shopping Cart</span>
        <span className="text-[#4a5878]">
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {hasCart && (
          <ul className="divide-y" style={{ borderColor: '#d8e2ee' }}>
            {lines.map(({ line, product, unit, total: lineTotal }) => {
              const variantOpts = { size: line.selectedSize, color: line.selectedColor };
              const variantBits = [line.selectedSize, line.selectedColor].filter(Boolean);
              return (
                <li key={`${product.id}|${line.selectedSize ?? ''}|${line.selectedColor ?? ''}`} className="px-3 py-2 flex gap-2.5">
                  <div
                    className="w-12 h-12 shrink-0 overflow-hidden bg-gray-100"
                    style={{ border: '1px solid #aac', borderRadius: 2 }}
                  >
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-lg">🖼️</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-[#0a3060] leading-tight line-clamp-2">
                          {product.title}
                        </div>
                        {variantBits.length > 0 && (
                          <div className="text-[9px] text-[#4a5878] mt-0.5">{variantBits.join(' · ')}</div>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        <button
                          onClick={() => moveToSaved(product.id, variantOpts)}
                          className="w-5 h-5 grid place-items-center rounded-sm text-gray-500 active:bg-blue-100"
                          aria-label="Save for later"
                          title="Save for later"
                        >
                          <BookmarkPlus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => remove(product.id, variantOpts)}
                          className="w-5 h-5 grid place-items-center rounded-sm text-gray-500 active:bg-red-100"
                          aria-label="Remove from cart"
                          title="Remove from cart"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setQuantity(product.id, line.quantity - 1, variantOpts)}
                          className="w-6 h-6 grid place-items-center rounded-sm text-[#0a3060]"
                          style={QTY_BTN}
                          aria-label="decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[12px] font-bold w-6 text-center text-[#0a3060]">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(product.id, line.quantity + 1, variantOpts)}
                          className="w-6 h-6 grid place-items-center rounded-sm text-[#0a3060]"
                          style={QTY_BTN}
                          aria-label="increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-[#4a5878] ml-1">× {formatPrice(unit)}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#0a3060] shrink-0">
                        {formatPrice(lineTotal)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!hasCart && (
          <div className="text-center text-[11px] text-[#4a5878] py-6 px-3">
            Cart is empty. Move items from <em className="not-italic font-semibold">Saved for later</em> below to start.
          </div>
        )}

        {hasSaved && (
          <div className="mt-2 pt-2" style={{ borderTop: '1px dashed #6896d2' }}>
            <div className="px-3 py-1 text-[11px] font-bold text-[#0a3060]">
              Saved for later ({savedLines.length})
            </div>
            <ul className="divide-y" style={{ borderColor: '#d8e2ee' }}>
              {savedLines.map(({ saved, product, unit }) => {
                const variantOpts = { size: saved.selectedSize, color: saved.selectedColor };
                const variantBits = [saved.selectedSize, saved.selectedColor].filter(Boolean);
                return (
                  <li key={`${product.id}|${saved.selectedSize ?? ''}|${saved.selectedColor ?? ''}`} className="px-3 py-2 flex gap-2.5">
                    <div
                      className="w-11 h-11 shrink-0 overflow-hidden bg-gray-100"
                      style={{ border: '1px solid #aac', borderRadius: 2 }}
                    >
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-lg">🖼️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-[#0a3060] leading-tight line-clamp-2">
                            {product.title}
                          </div>
                          {variantBits.length > 0 && (
                            <div className="text-[9px] text-[#4a5878] mt-0.5">{variantBits.join(' · ')}</div>
                          )}
                          <div className="text-[10px] text-[#0a3060] mt-0.5">{formatPrice(unit)}</div>
                        </div>
                        <button
                          onClick={() => unsaveItem(product.id, variantOpts)}
                          className="shrink-0 w-5 h-5 grid place-items-center rounded-sm text-gray-500 active:bg-red-100"
                          aria-label="Remove from saved"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => moveToCart(product.id, variantOpts)}
                          className="px-2 py-0.5 text-[10px] font-bold text-gray-900 rounded-sm inline-flex items-center gap-1"
                          style={NEUTRAL_BTN}
                        >
                          <ShoppingCart className="w-2.5 h-2.5" />
                          Move to cart
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {hasCart && (
        <div
          className="shrink-0 px-3 py-2 space-y-1 text-[11px]"
          style={{ background: SUB_HEADER_BG, borderTop: `1px solid ${SUB_HEADER_BORDER}` }}
        >
          <div className="flex justify-between text-[#4a5878]">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#4a5878]">
            <span>
              Shipping{' '}
              {shipping === 0 && subtotal > 0 && (
                <em className="not-italic text-emerald-700 text-[10px]">
                  (free over {formatPrice(FREE_SHIPPING_THRESHOLD)})
                </em>
              )}
            </span>
            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          <div
            className="flex justify-between font-bold text-[#0a3060] text-[12px] pt-1 mt-1"
            style={{ borderTop: `1px solid ${SUB_HEADER_BORDER}` }}
          >
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className="flex items-center gap-2 pt-1.5">
            <button onClick={clear} className="flex-1 px-2 py-1.5 text-[11px] text-gray-900 rounded-sm" style={NEUTRAL_BTN}>
              Clear cart
            </button>
            <button
              onClick={() => push({ kind: 'app', appId: 'checkout' })}
              className="flex-1 px-2 py-1.5 text-[11px] font-bold rounded-sm"
              style={PRIMARY_BTN}
            >
              Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
