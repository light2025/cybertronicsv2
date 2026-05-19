/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { useNokiaStore } from '@/lib/store/nokiaStore';
import { formatPrice } from '@/lib/utils';
import type { WindowPayload } from '@/types/xp';
import type { Product } from '@/types';

type Props = { payload?: WindowPayload };

const STOCK_LABEL: Record<Product['stockStatus'], { label: string; color: string }> = {
  in_stock: { label: 'In stock', color: '#3a843a' },
  out_of_stock: { label: 'Out of stock', color: '#c44030' },
  preorder: { label: 'Pre-order', color: '#d47a00' },
};

const SUB_HEADER_BG = '#dce8f8';
const SUB_HEADER_BORDER = '#6896d2';
const ROW_DIVIDER = '#d8e2ee';

function ProductRow({ product, onOpen }: { product: Product; onOpen: (id: string) => void }) {
  const stock = STOCK_LABEL[product.stockStatus];
  return (
    <li>
      <button
        onClick={() => onOpen(product.id)}
        className="w-full px-3 py-2 flex items-center gap-3 active:bg-[#cee0f5] text-left"
        style={{ borderBottom: `1px solid ${ROW_DIVIDER}` }}
      >
        <div
          className="w-14 h-14 shrink-0 overflow-hidden bg-gray-100"
          style={{ border: '1px solid #aac', borderRadius: 2 }}
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

        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-[#0a3060] leading-tight line-clamp-2">
            {product.title}
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            {product.discountPrice !== null ? (
              <>
                <span className="text-[11px] font-bold text-[#c44030]">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-[9px] text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-[11px] font-bold text-[#0a3060]">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <div
            className="text-[9px] font-semibold mt-0.5"
            style={{ color: stock.color }}
          >
            {stock.label}
          </div>
        </div>

        <ChevronRight
          className="w-3.5 h-3.5 text-[#5878a0] shrink-0"
          strokeWidth={2}
        />
      </button>
    </li>
  );
}

export default function NokiaLifestyle({ payload }: Props) {
  const slug = payload?.categorySlug as string | undefined;

  const categories = useDataStore((s) => s.categories);
  const products = useDataStore((s) => s.products);
  const pushNokia = useNokiaStore((s) => s.push);
  const popNokia = useNokiaStore((s) => s.pop);
  const hydrated = useHydrated();
  const [query, setQuery] = useState('');

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center text-[11px] text-[#4a5878] bg-white">
        Loading…
      </div>
    );
  }

  const openProduct = (productId: string) =>
    pushNokia({ kind: 'app', appId: 'product-detail', payload: { productId } });

  // Sub-view: products in the selected category (no search here — search is a top-level affordance).
  if (slug) {
    const cat = categories.find((c) => c.slug === slug);
    const catProducts = products.filter((p) => p.category === cat?.id);

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        <div
          className="px-3 py-1.5 shrink-0 flex items-center gap-2 text-[11px]"
          style={{ background: SUB_HEADER_BG, borderBottom: `1px solid ${SUB_HEADER_BORDER}` }}
        >
          <button onClick={popNokia} className="text-[#1a4a8a] font-bold">
            ‹ Categories
          </button>
          <span className="opacity-50">›</span>
          <span className="font-bold text-[#0a3060] truncate">
            {cat?.icon} {cat?.title}
          </span>
        </div>

        {catProducts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6 text-center text-[11px] text-gray-500">
            No products in this category yet.
          </div>
        ) : (
          <ul className="flex-1 overflow-auto min-h-0">
            {catProducts.map((p) => (
              <ProductRow key={p.id} product={p} onOpen={openProduct} />
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Top view: search bar + (search results when query present, else categories).
  const q = query.trim().toLowerCase();
  const matches = q
    ? products.filter((p) => {
        if (p.title.toLowerCase().includes(q)) return true;
        if (p.tags.some((t) => t.toLowerCase().includes(q))) return true;
        const cat = categories.find((c) => c.id === p.category);
        if (cat?.title.toLowerCase().includes(q)) return true;
        return false;
      })
    : [];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div
        className="px-3 py-2 shrink-0"
        style={{ background: SUB_HEADER_BG, borderBottom: `1px solid ${SUB_HEADER_BORDER}` }}
      >
        <div className="relative">
          <Search
            className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5878a0] pointer-events-none"
            strokeWidth={2}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full pl-7 pr-2 py-1.5 text-[12px] text-gray-900 focus:outline-none"
            style={{
              background: '#fff',
              border: '1px solid #5878a0',
              borderRadius: 2,
              boxShadow: 'inset 1px 1px 1px rgba(0,0,0,0.08)',
            }}
          />
        </div>
      </div>

      {q ? (
        matches.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-1">
            <div className="text-[11px] text-gray-700 font-bold">No products match</div>
            <div className="text-[10px] text-gray-500">
              Try a different word, or clear the search to browse categories.
            </div>
          </div>
        ) : (
          <>
            <div
              className="px-3 py-1 text-[10px] text-[#4a5878] shrink-0"
              style={{ background: '#f4f6fa', borderBottom: `1px solid ${ROW_DIVIDER}` }}
            >
              {matches.length} result{matches.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </div>
            <ul className="flex-1 overflow-auto min-h-0">
              {matches.map((p) => (
                <ProductRow key={p.id} product={p} onOpen={openProduct} />
              ))}
            </ul>
          </>
        )
      ) : (
        <ul className="flex-1 overflow-auto min-h-0">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            return (
              <li key={cat.id}>
                <button
                  onClick={() =>
                    pushNokia({
                      kind: 'app',
                      appId: 'lifestyle',
                      payload: { categorySlug: cat.slug },
                    })
                  }
                  className="w-full px-3 py-2.5 flex items-center gap-3 active:bg-[#cee0f5] text-left"
                  style={{ borderBottom: `1px solid ${ROW_DIVIDER}` }}
                >
                  <div
                    className="w-10 h-10 shrink-0 grid place-items-center text-xl rounded-md"
                    style={{
                      background: 'linear-gradient(to bottom, #e4ecf6 0%, #c8d8ea 100%)',
                      border: '1px solid #6896d2',
                    }}
                  >
                    {cat.icon ?? '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-[#0a3060] leading-tight">
                      {cat.title}
                    </div>
                    <div className="text-[10px] text-[#4a5878] mt-0.5">
                      {count} item{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-[#5878a0] shrink-0"
                    strokeWidth={2}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
