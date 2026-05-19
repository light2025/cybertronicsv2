/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { useDataStore } from '@/lib/store/dataStore';
import { useXpStore } from '@/lib/store/xpStore';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils';
import type { WindowPayload } from '@/types/xp';
import type { Product } from '@/types';

const STOCK_MAP = {
  in_stock: { label: 'In Stock', color: '#3a843a' },
  out_of_stock: { label: 'Out of Stock', color: '#c44030' },
  preorder: { label: 'Pre-order', color: '#d47a00' },
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
  return (
    <div>
      <div className="text-[10px] font-bold text-[#4a5878] uppercase tracking-wide mb-1">
        {label}
        {!selected && <span className="text-[#c44030] ml-1 normal-case font-normal">— select one</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className="min-w-[40px] px-2 py-0.5 text-[11px] font-bold rounded-sm"
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

export default function ProductDetail({ winId, payload }: { winId: string; payload?: WindowPayload }) {
  const productId = payload?.productId as string | undefined;
  const products = useDataStore((s) => s.products);
  const categories = useDataStore((s) => s.categories);
  const closeWin = useXpStore((s) => s.close);
  const addToCart = useCartStore((s) => s.add);
  const [imgIdx, setImgIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  const product: Product | undefined = products.find((p) => p.id === productId);

  useEffect(() => {
    if (!product) return;
    if (product.availableSizes?.length === 1) setSelectedSize(product.availableSizes[0]);
    if (product.availableColors?.length === 1) setSelectedColor(product.availableColors[0]);
  }, [product]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#ece9d8] gap-3 px-6 text-center">
        <div className="text-[12px] font-bold text-gray-800">Product not found.</div>
        <div className="text-[11px] text-gray-600">
          It may have been removed or never existed.
        </div>
        <button
          onClick={() => closeWin(winId)}
          className="mt-1 px-4 py-1 text-[11px] text-gray-900 rounded-sm"
          style={{
            background: '#ece9d8',
            border: '1px solid #777',
            boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
          }}
        >
          Close
        </button>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === product.category);
  const stock = STOCK_MAP[product.stockStatus];
  const imgs = product.images.length > 0 ? product.images : [''];

  const hasSizes = (product.availableSizes?.length ?? 0) > 0;
  const hasColors = (product.availableColors?.length ?? 0) > 0;
  const needsSize = hasSizes && !selectedSize;
  const needsColor = hasColors && !selectedColor;
  const outOfStock = product.stockStatus === 'out_of_stock';
  const canAddToCart = !outOfStock && !needsSize && !needsColor;

  let buttonLabel: ReactNode = (
    <>
      <ShoppingCart className="w-3.5 h-3.5" />
      Add to Cart — {formatPrice(product.discountPrice ?? product.price)}
    </>
  );
  if (justAdded) {
    buttonLabel = (
      <>
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
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

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#ece9d8' }}>
      {/* Image pane */}
      <div
        className="w-48 shrink-0 flex flex-col"
        style={{ borderRight: '1px solid #6896d2', background: '#dce8f8' }}
      >
        <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
          {imgs[imgIdx] ? (
            <img
              src={imgs[imgIdx]}
              alt={product.title}
              className="max-w-full max-h-full object-contain rounded"
              style={{ border: '1px solid #aac' }}
            />
          ) : (
            <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-3xl">🖼️</div>
          )}
        </div>
        {imgs.length > 1 && (
          <div className="flex items-center justify-center gap-1 py-1 px-2">
            <button
              onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
              disabled={imgIdx === 0}
              className="p-0.5 hover:bg-[#316ac5] hover:text-white rounded disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-gray-500">{imgIdx + 1}/{imgs.length}</span>
            <button
              onClick={() => setImgIdx((i) => Math.min(imgs.length - 1, i + 1))}
              disabled={imgIdx === imgs.length - 1}
              className="p-0.5 hover:bg-[#316ac5] hover:text-white rounded disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Detail pane */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
        <div>
          <div className="text-[10px] text-gray-500 mb-0.5">{cat?.icon} {cat?.title}</div>
          <h2 className="text-[15px] font-bold text-gray-900 leading-snug">{product.title}</h2>
          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{product.slug}</div>
        </div>

        <div className="flex items-baseline gap-2">
          {product.discountPrice !== null ? (
            <>
              <span className="text-[18px] font-bold text-[#c44030]">
                {formatPrice(product.discountPrice)}
              </span>
              <span className="text-[13px] text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-[18px] font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <div>
          <span
            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: stock.color, border: `1px solid ${stock.color}`, background: 'transparent' }}
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
          onClick={() => {
            if (!canAddToCart) return;
            addToCart(product.id, 1, { size: selectedSize, color: selectedColor });
            setJustAdded(true);
            window.setTimeout(() => setJustAdded(false), 1400);
          }}
          disabled={!canAddToCart}
          className="flex items-center justify-center gap-1.5 px-4 py-1.5 text-[12px] font-bold rounded-sm self-start disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: justAdded
              ? 'linear-gradient(to bottom, #5ab85a 0%, #3d9c3d 60%, #2c882c 100%)'
              : 'linear-gradient(to bottom, #62c462 0%, #52b452 35%, #3d9c3d 60%, #2c882c 100%)',
            border: '1px solid #2c662c',
            color: '#fff',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)',
          }}
        >
          {buttonLabel}
        </button>

        <div
          className="p-2 rounded text-[11px] text-gray-700 leading-relaxed"
          style={{ background: '#fff', border: '1px solid #aac' }}
        >
          {product.description}
        </div>

        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: '#d0dff5', border: '1px solid #6896cc', color: '#1a3080' }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {product.isFeatured && (
          <div className="text-[10px] font-semibold text-[#d47a00]">⭐ Featured item</div>
        )}
      </div>
    </div>
  );
}
