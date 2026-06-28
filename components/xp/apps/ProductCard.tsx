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
  in_stock: '#8DC63F',
  out_of_stock: '#E86A0F',
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
      className="flex flex-col text-left focus:outline-none group rounded overflow-hidden hover:opacity-75 transition-all duration-200"
      style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(245,124,32,.15)', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}
    >
      <div className="w-full bg-gray-900 overflow-hidden" style={{ height: 120 }}>
        {product.images.length > 0 ? (
          <img
            src={product.images[product.primaryImageIndex ?? 0] ?? product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,.02)' }}>
            🖼️
          </div>
        )}
      </div>
      <div className="p-2 flex-1 flex flex-col gap-0.5">
        <div className="text-[10px] font-bold text-white leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors">
          {product.title}
        </div>
        <div className="flex items-baseline gap-1 mt-auto pt-1">
          {product.discountPrice !== null ? (
            <>
              <span className="text-[10px] font-bold text-orange-400">
                {formatPrice(product.discountPrice)}
              </span>
              <span className="text-[9px] text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-white">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <div className="text-[8px] font-semibold" style={{ color: STOCK_COLOR[product.stockStatus] }}>
          {STOCK_LABEL[product.stockStatus]}
        </div>
      </div>
    </button>
  );
}
