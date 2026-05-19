/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDataStore } from '@/lib/store/dataStore';
import { useXpStore } from '@/lib/store/xpStore';
import type { WindowPayload } from '@/types/xp';

type GalleryItem = { src: string; title: string; productId: string };

const PANEL_HEADER = 'linear-gradient(to bottom, #4a86d8 0%, #2060c0 50%, #1448a8 100%)';

export default function Gallery({ payload }: { payload?: WindowPayload }) {
  const products = useDataStore((s) => s.products);
  const openApp = useXpStore((s) => s.open);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const kind = payload?.kind as string | undefined;

  // Flatten all product images into gallery items
  const items: GalleryItem[] = products.flatMap((p) =>
    p.images.map((src) => ({ src, title: p.title, productId: p.id }))
  );

  const featured = kind === 'lookbook'
    ? products.filter((p) => p.isFeatured).flatMap((p) =>
        p.images.map((src): GalleryItem => ({ src, title: p.title, productId: p.id }))
      )
    : items;

  const displayed = featured.length > 0 ? featured : items;

  const prev = () => setLightboxIdx((i) => (i != null ? Math.max(0, i - 1) : null));
  const next = () => setLightboxIdx((i) => (i != null ? Math.min(displayed.length - 1, i + 1) : null));

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') setLightboxIdx(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, displayed.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full" style={{ background: '#ece9d8' }}>
      <div
        className="px-3 py-1.5 shrink-0 text-white text-[11px] font-bold"
        style={{ background: PANEL_HEADER, borderBottom: '1px solid #1448a8' }}
      >
        {kind === 'lookbook' ? '⭐ Lookbook — Featured Pieces' : '🖼️ Gallery — All Images'}
        <span className="ml-2 font-normal opacity-70">{displayed.length} items</span>
      </div>

      {displayed.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[11px] text-gray-500">
          No images yet.
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {displayed.map((item, i) => (
              <button
                key={`${item.productId}-${i}`}
                onClick={() => setLightboxIdx(i)}
                className="relative overflow-hidden focus:outline-none group"
                style={{ aspectRatio: '1/1', border: '1px solid #aac', borderRadius: 2 }}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end p-1">
                  <span className="text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity leading-tight line-clamp-2">
                    {item.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && displayed[lightboxIdx] && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative max-w-[90%] max-h-[80%]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayed[lightboxIdx].src}
              alt={displayed[lightboxIdx].title}
              className="max-w-full max-h-[70vh] object-contain"
              style={{ border: '2px solid #3a6ea5', borderRadius: 2 }}
            />
            <div className="mt-1 text-center text-white text-[11px] font-bold">
              {displayed[lightboxIdx].title}
            </div>
            <div className="mt-1 text-center text-white/60 text-[10px]">
              {lightboxIdx + 1} / {displayed.length}
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-4 mt-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={prev}
              disabled={lightboxIdx === 0}
              className="p-1.5 text-white hover:bg-white/20 rounded disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => openApp('product-detail', { payload: { productId: displayed[lightboxIdx!].productId } })}
              className="text-[10px] text-white/70 hover:text-white hover:underline"
            >
              View product
            </button>
            <button
              onClick={next}
              disabled={lightboxIdx === displayed.length - 1}
              className="p-1.5 text-white hover:bg-white/20 rounded disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-2 right-2 p-1 text-white hover:bg-white/20 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
