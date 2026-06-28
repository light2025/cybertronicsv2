'use client';

import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import ProductCard from '../ProductCard';
import { useIE } from './IEContext';

const CBTR_ORANGE = '#F57C20';
const CBTR_DARK = '#1B1F2A';
const DARK_BG = '#050505';

export default function IEShop({ categorySlug }: { categorySlug?: string }) {
  const ie = useIE();
  const categories = useDataStore((s) => s.categories);
  const products = useDataStore((s) => s.products);
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className="p-8 text-center text-[12px]" style={{ background: DARK_BG, color: '#fff' }}>Loading shop…</div>;
  }

  if (categorySlug) {
    const cat = categories.find((c) => c.slug === categorySlug);
    const catProducts = products.filter((p) => p.category === cat?.id);

    return (
      <div className="p-3" style={{ background: DARK_BG }}>
        <div className="mb-3 text-[11px] flex items-center gap-1" style={{ color: '#fff' }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); ie?.navigate('cybertronics://shop'); }}
            className="hover:text-orange-400 transition-colors"
            style={{ color: CBTR_ORANGE }}
          >
            Shop
          </a>
          <span>/</span>
          <span className="font-bold">{cat?.icon} {cat?.title ?? 'Unknown'}</span>
        </div>
        {catProducts.length === 0 ? (
          <div className="py-8 text-center text-[11px]" style={{ color: 'rgba(255,255,255,.5)' }}>
            No products in this category.
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
    <div className="p-3" style={{ background: DARK_BG }}>
      <div className="px-3 py-2 font-bold text-[12px] mb-3 rounded" style={{ background: `linear-gradient(to bottom, ${CBTR_ORANGE} 0%, #E86A0F 100%)`, color: '#fff' }}>
        ◆ SHOP BY CATEGORY
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.filter((c) => c.parentCategory === null).map((c) => {
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => ie?.navigate(`cybertronics://shop/${c.slug}`)}
              className="flex flex-col items-center gap-1 p-3 rounded transition-all hover:opacity-80"
              style={{ background: 'rgba(245,124,32,.1)', border: `1px solid rgba(245,124,32,.2)` }}
            >
              <span className="text-3xl">{c.icon ?? '📁'}</span>
              <span className="text-[10px] font-bold" style={{ color: '#fff' }}>{c.title}</span>
              <span className="text-[9px]" style={{ color: 'rgba(255,255,255,.6)' }}>
                {count} item{count !== 1 ? 's' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
