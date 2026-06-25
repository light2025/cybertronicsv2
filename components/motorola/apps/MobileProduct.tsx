/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { useCartStore } from '@/lib/store/cartStore';
import { useMobileStore } from '@/lib/store/mobileStore';
import { formatPrice } from '@/lib/utils';
import type { WindowPayload } from '@/types/xp';
import type { Product } from '@/types';

type Props = { payload?: WindowPayload };

const STOCK_MAP: Record<Product['stockStatus'], { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: '#3a843a' },
  out_of_stock: { label: 'Out of Stock', color: '#c44030' },
  preorder: { label: 'Pre-order', color: '#d47a00' },
};

const PRIMARY_BTN = {
  background: 'linear-gradient(to bottom, #62c462 0%, #52b452 35%, #3d9c3d 60%, #2c882c 100%)',
  border: '1px solid #2c662c',
  color: '#fff',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)',
};
const PRIMARY_BTN_PRESSED = {
  background: 'linear-gradient(to bottom, #5ab85a 0%, #3d9c3d 60%, #2c882c 100%)',
  border: '1px solid #2c662c',
  color: '#fff',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)',
};
const NEUTRAL_BTN = {
  background: '#ece9d8',
  border: '1px solid #777',
  boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
};

const CHIP_ACTIVE = {
  background: 'linear-gradient(to bottom, #4a86d8 0%, #2060c0 50%, #1448a8 100%)',
  color: '#fff',
  border: '1px solid #0a3060',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
};
const CHIP_IDLE = {
  background: '#fff',
  color: '#0a3060',
  border: '1px solid #5878a0',
  boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #d8e2ee',
};

function ChipRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string | undefined;
  onSelect: (v: string) => void;
}) {
  const missing = !selected;
  return (
    <div>
      <div className="text-[10px] font-bold text-[#4a5878] uppercase tracking-wide mb-1.5">
        {label}
        {missing && <span className="text-[#c44030] ml-1 normal-case font-normal">— select one</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className="min-w-[44px] px-2.5 py-1 text-[11px] font-bold rounded-sm"
              style={active ? CHIP_ACTIVE : CHIP_IDLE}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MobileProduct({ payload }: Props) {
  const productId = payload?.productId as string | undefined;
  const products = useDataStore((s) => s.products);
  const categories = useDataStore((s) => s.categories);
  const addToCart = useCartStore((s) => s.add);
  const popMobile = useMobileStore((s) => s.pop);
  const hydrated = useHydrated();
  const [imgIdx, setImgIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  const product: Product | undefined = products.find((p) => p.id === productId);

  useEffect(() => {
    if (!product) return;
    const init = () => {
      const startIdx = product.primaryImageIndex ?? 0;
      const maxIdx = Math.max(0, product.images.length - 1);
      setImgIdx(Math.min(startIdx, maxIdx));
      if (product.availableSizes?.length === 1) setSelectedSize(product.availableSizes[0]);
      if (product.availableColors?.length === 1) setSelectedColor(product.availableColors[0]);
    };
    init();
  }, [product]);

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center text-[11px] text-[#4a5878] bg-white">
        Loading…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3 bg-white">
        <div className="text-[12px] font-bold text-gray-800">Product not found.</div>
        <div className="text-[11px] text-gray-600">
          It may have been removed or never existed.
        </div>
        <button
          onClick={popMobile}
          className="mt-1 px-4 py-1.5 text-[11px] text-gray-900 rounded-sm"
          style={NEUTRAL_BTN}
        >
          Back
        </button>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === product.category);
  const stock = STOCK_MAP[product.stockStatus];
  const imgs = product.images.length > 0 ? product.images : [''];
  const displayPrice = product.discountPrice ?? product.price;

  const hasSizes = (product.availableSizes?.length ?? 0) > 0;
  const hasColors = (product.availableColors?.length ?? 0) > 0;
  const needsSize = hasSizes && !selectedSize;
  const needsColor = hasColors && !selectedColor;
  const outOfStock = product.stockStatus === 'out_of_stock';
  const canAddToCart = !outOfStock && !needsSize && !needsColor;

  let buttonLabel: ReactNode = (
    <>
      <ShoppingCart className="w-4 h-4" />
      Add to Cart — {formatPrice(displayPrice)}
    </>
  );
  if (justAdded) {
    buttonLabel = (
      <>
        <Check className="w-4 h-4" strokeWidth={3} />
        Added to cart
      </>
    );
  } else if (outOfStock) {
    buttonLabel = <>Out of Stock</>;
  } else if (needsSize) {
    buttonLabel = <>Select a size</>;
  } else if (needsColor) {
    buttonLabel = <>Select a color</>;
  }

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addToCart(product.id, 1, { size: selectedSize, color: selectedColor });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div className="flex-1 overflow-auto min-h-0 bg-white">
      {/* Image carousel */}
      <div
        className="relative w-full aspect-square overflow-hidden bg-gray-100 flex items-center justify-center"
        style={{ borderBottom: '1px solid #cdd8e8' }}
      >
        {imgs[imgIdx] ? (
          <img
            src={imgs[imgIdx]}
            alt={product.title}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-4xl">🖼️</div>
        )}

        {imgs.length > 1 && (
          <>
            <button
              onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
              disabled={imgIdx === 0}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full text-white disabled:opacity-30"
              style={{ background: 'rgba(0,0,0,0.45)' }}
              aria-label="previous image"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setImgIdx((i) => Math.min(imgs.length - 1, i + 1))}
              disabled={imgIdx === imgs.length - 1}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full text-white disabled:opacity-30"
              style={{ background: 'rgba(0,0,0,0.45)' }}
              aria-label="next image"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>

            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {imgs.map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                    boxShadow: '0 0 1px rgba(0,0,0,0.4)',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-2.5">
        <div className="text-[10px] text-[#4a5878]">
          {cat?.icon} {cat?.title}
        </div>
        <h2 className="text-[14px] font-bold text-[#0a3060] leading-snug">
          {product.title}
        </h2>

        <div className="flex items-baseline gap-2">
          {product.discountPrice !== null ? (
            <>
              <span className="text-[18px] font-bold text-[#c44030]">
                {formatPrice(product.discountPrice)}
              </span>
              <span className="text-[12px] text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-[18px] font-bold text-[#0a3060]">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <div>
          <span
            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: stock.color, border: `1px solid ${stock.color}` }}
          >
            {stock.label}
          </span>
        </div>

        {hasSizes && (
          <ChipRow
            label="Size"
            options={product.availableSizes!}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />
        )}

        {hasColors && (
          <ChipRow
            label="Color"
            options={product.availableColors!}
            selected={selectedColor}
            onSelect={setSelectedColor}
          />
        )}

        <button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={justAdded ? PRIMARY_BTN_PRESSED : PRIMARY_BTN}
        >
          {buttonLabel}
        </button>

        <div
          className="p-2.5 rounded text-[11px] text-gray-700 leading-relaxed"
          style={{ background: '#f4f6fa', border: '1px solid #cdd8e8' }}
        >
          {product.description}
        </div>

        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.map((t) => (
              <span
                key={t}
                className="text-[9px] px-1.5 py-0.5 rounded"
                style={{
                  background: '#d0dff5',
                  border: '1px solid #6896cc',
                  color: '#1a3080',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {product.isFeatured && (
          <div className="text-[10px] font-semibold text-[#d47a00] pt-1">
            ⭐ Featured item
          </div>
        )}
      </div>
    </div>
  );
}
