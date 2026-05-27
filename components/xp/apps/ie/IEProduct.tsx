'use client';

import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import ProductDetail from '../ProductDetail';
import { useIE } from './IEContext';

export default function IEProduct({ slug }: { slug: string }) {
  const ie = useIE();
  const products = useDataStore((s) => s.products);
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className="p-8 text-center text-[12px] text-gray-500">Loading product…</div>;
  }

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="p-8 bg-white">
        <h2 className="text-[14px] font-bold mb-2" style={{ color: '#c44030' }}>
          The page cannot be displayed
        </h2>
        <p className="text-[12px] text-gray-700 mb-1">
          No product was found at the address you requested.
        </p>
        <p className="text-[11px] font-mono text-gray-500 mb-4">
          cybertronics://product/{slug}
        </p>
        <button
          onClick={() => ie?.back()}
          className="px-4 py-1 text-[11px] text-gray-900 rounded-sm"
          style={{
            background: '#ece9d8',
            border: '1px solid #777',
            boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
          }}
        >
          ← Back
        </button>
      </div>
    );
  }

  return <ProductDetail winId="ie-embedded" payload={{ productId: product.id }} />;
}
