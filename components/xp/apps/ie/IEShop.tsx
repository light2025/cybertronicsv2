'use client';

import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import ProductCard from '../ProductCard';
import { useIE } from './IEContext';

const HEAD_BG = '#ffe05a';
const HEAD_TEXT = '#5a3a00';
const TABLE_BORDER = '#a07000';
const LINK_BLUE = '#0050a0';

export default function IEShop({ categorySlug }: { categorySlug?: string }) {
  const ie = useIE();
  const categories = useDataStore((s) => s.categories);
  const products = useDataStore((s) => s.products);
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className="p-8 text-center text-[12px] text-gray-500">Loading shop…</div>;
  }

  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    const catProducts = products.filter((p) => p.category === cat?.id);

    return (
      <div className="p-3 bg-white">
        <div className="mb-3 text-[11px] flex items-center gap-1">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); ie?.navigate('cybertronics://shop'); }}
            className="hover:underline"
            style={{ color: LINK_BLUE }}
          >
            Shop
          </a>
          <span className="text-gray-400">›</span>
          <span className="font-bold">
            {cat?.icon} {cat?.title ?? 'Unknown category'}
          </span>
        </div>
        {catProducts.length === 0 ? (
          <div className="py-12 text-center text-[12px] text-gray-500">
            No products in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {catProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 bg-white">
      <div
        className="px-2 py-1 font-bold text-[12px] mb-3"
        style={{
          background: HEAD_BG,
          color: HEAD_TEXT,
          border: `1px solid ${TABLE_BORDER}`,
        }}
      >
        Shop by Category
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((c) => {
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => ie?.navigate(`cybertronics://shop/${c.slug}`)}
              className="flex flex-col items-center gap-1 p-3 bg-white hover:bg-yellow-50 active:bg-yellow-100"
              style={{ border: '1px solid #aac', borderRadius: 2 }}
            >
              <span className="text-3xl">{c.icon ?? '📁'}</span>
              <span className="text-[11px] font-bold text-gray-800">{c.title}</span>
              <span className="text-[10px] text-gray-500">
                {count} item{count !== 1 ? 's' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
