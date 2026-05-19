'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useDataStore } from '@/lib/store/dataStore';
import type { WindowPayload } from '@/types/xp';
import ProductCard from './ProductCard';

const PANEL_HEADER = 'linear-gradient(to bottom, #4a86d8 0%, #2060c0 50%, #1448a8 100%)';

export default function LifestyleFolder({ payload }: { payload?: WindowPayload }) {
  const initialSlug = payload?.categorySlug as string | undefined;
  const [slug, setSlug] = useState<string | undefined>(initialSlug);

  const categories = useDataStore((s) => s.categories);
  const products = useDataStore((s) => s.products);

  if (slug) {
    const cat = categories.find((c) => c.slug === slug);
    const catProducts = products.filter((p) => p.category === cat?.id);

    return (
      <div className="flex flex-col h-full" style={{ background: '#ece9d8' }}>
        {/* Toolbar */}
        <div
          className="flex items-center gap-2 px-2 py-1 shrink-0 text-white text-[11px]"
          style={{ background: PANEL_HEADER, borderBottom: '1px solid #1448a8' }}
        >
          <button
            onClick={() => setSlug(undefined)}
            className="flex items-center gap-0.5 hover:underline text-white"
          >
            <ChevronLeft className="w-3 h-3" />
            Back
          </button>
          <span className="opacity-60">›</span>
          <span className="font-bold">{cat?.icon} {cat?.title}</span>
        </div>

        {catProducts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[11px] text-gray-500">
            No products in this category yet.
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {catProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Category grid
  return (
    <div className="flex flex-col h-full" style={{ background: '#ece9d8' }}>
      <div
        className="px-3 py-1.5 shrink-0 text-white text-[11px] font-bold"
        style={{ background: PANEL_HEADER, borderBottom: '1px solid #1448a8' }}
      >
        Lifestyle — Browse by category
      </div>
      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSlug(cat.slug)}
                className="flex flex-col items-center gap-1 p-3 bg-white hover:bg-[#e5f0ff] active:bg-[#cde0ff] focus:outline-none group"
                style={{ border: '1px solid #aac', borderRadius: 2 }}
              >
                <span className="text-3xl">{cat.icon ?? '📁'}</span>
                <span className="text-[11px] font-bold text-gray-800 group-hover:text-[#0a246a]">
                  {cat.title}
                </span>
                <span className="text-[10px] text-gray-500">{count} item{count !== 1 ? 's' : ''}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
