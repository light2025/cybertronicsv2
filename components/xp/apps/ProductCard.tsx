/* eslint-disable @next/next/no-img-element */
'use client';

import { useXpStore } from '@/lib/store/xpStore';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { useIE } from './ie/IEContext';

const STOCK_LABEL: Record<Product['stockStatus'], string> = {
  in_stock: 'In stock',
  out_of_stock: 'Out of stock',
  preorder: 'Pre-order',
};
const STOCK_COLOR: Record<Product['stockStatus'], string> = {
  in_stock: '#3a843a',
  out_of_stock: '#c44030',
  preorder: '#d47a00',
};

export default function ProductCard({ product }: { product: Product }) {
  const open = useXpStore((s) => s.open);
  const ie = useIE();

  const onOpen = () => {
    if (ie) {
      ie.navigate(`cybertronics://product/${product.slug}`);
    } else {
      open('product-detail', { payload: { productId: product.id } });
    }
  };

  return (
    <button
      onClick={onOpen}
      className="flex flex-col text-left focus:outline-none group"
      style={{ border: '1px solid #aac', borderRadius: 2, background: '#fff', overflow: 'hidden' }}
    >
      <div
        className="w-full bg-gray-100 overflow-hidden"
        style={{ height: 120 }}
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🖼️</div>
        )}
      </div>
      <div className="p-2 flex-1 flex flex-col gap-0.5">
        <div className="text-[11px] font-bold text-gray-800 leading-snug line-clamp-2">
          {product.title}
        </div>
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          {product.discountPrice !== null ? (
            <>
              <span className="text-[11px] font-bold text-[#c44030]">
                {formatPrice(product.discountPrice)}
              </span>
              <span className="text-[10px] text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-[11px] font-bold text-gray-800">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <div className="text-[9px] font-semibold" style={{ color: STOCK_COLOR[product.stockStatus] }}>
          {STOCK_LABEL[product.stockStatus]}
        </div>
      </div>
    </button>
  );
}
