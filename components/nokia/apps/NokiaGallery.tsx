/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { useNokiaStore } from '@/lib/store/nokiaStore';
import type { WindowPayload } from '@/types/xp';
import type { Product } from '@/types';

type GalleryItem = { src: string; title: string; productId: string };

const SUB_HEADER_BG = '#dce8f8';
const SUB_HEADER_BORDER = '#6896d2';

const NEUTRAL_BTN = {
  background: '#ece9d8',
  border: '1px solid #777',
  boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
};

function buildItems(products: Product[], kind?: string): GalleryItem[] {
  const all: GalleryItem[] = products.flatMap((p) =>
    p.images.map((src) => ({ src, title: p.title, productId: p.id }))
  );
  if (kind === 'lookbook') {
    const featured: GalleryItem[] = products
      .filter((p) => p.isFeatured)
      .flatMap((p) =>
        p.images.map((src): GalleryItem => ({ src, title: p.title, productId: p.id }))
      );
    return featured.length > 0 ? featured : all;
  }
  return all;
}

type Props = { payload?: WindowPayload };

export default function NokiaGallery({ payload }: Props) {
  const initialIdx = payload?.imgIdx as number | undefined;
  const kind = payload?.kind as string | undefined;
  if (initialIdx !== undefined) {
    return <Viewer initialIdx={initialIdx} kind={kind} />;
  }
  return <Grid kind={kind} />;
}

function Grid({ kind }: { kind?: string }) {
  const products = useDataStore((s) => s.products);
  const pushNokia = useNokiaStore((s) => s.push);
  const hydrated = useHydrated();
  const items = buildItems(products, kind);

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center text-[11px] text-[#4a5878] bg-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div
        className="px-3 py-1.5 shrink-0 text-[11px] font-bold text-[#0a3060]"
        style={{ background: SUB_HEADER_BG, borderBottom: `1px solid ${SUB_HEADER_BORDER}` }}
      >
        {kind === 'lookbook' ? '⭐ Lookbook' : '🖼️ Gallery'}{' '}
        <span className="font-normal text-[#4a5878]">· {items.length} items</span>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-6 text-center text-[11px] text-gray-500">
          No images yet.
        </div>
      ) : (
        <div className="flex-1 overflow-auto min-h-0 p-2">
          <div className="grid grid-cols-3 gap-1.5">
            {items.map((item, i) => (
              <button
                key={`${item.productId}-${i}`}
                onClick={() =>
                  pushNokia({
                    kind: 'app',
                    appId: 'gallery',
                    payload: { ...(kind ? { kind } : {}), imgIdx: i },
                  })
                }
                className="aspect-square overflow-hidden bg-gray-100 active:opacity-80"
                style={{ border: '1px solid #aac', borderRadius: 2 }}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Viewer({ initialIdx, kind }: { initialIdx: number; kind?: string }) {
  const products = useDataStore((s) => s.products);
  const pushNokia = useNokiaStore((s) => s.push);
  const popNokia = useNokiaStore((s) => s.pop);
  const hydrated = useHydrated();
  const items = buildItems(products, kind);

  const [idx, setIdx] = useState(initialIdx);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight') setIdx((i) => Math.min(items.length - 1, i + 1));
      else if (e.key === 'Escape') popNokia();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items.length, popNokia]);

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center text-[11px] text-[#4a5878] bg-white">
        Loading…
      </div>
    );
  }

  const item = items[idx];
  if (!item) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-white text-[11px]">
        Image not found.
      </div>
    );
  }

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(items.length - 1, i + 1));

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black">
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <img
          src={item.src}
          alt={item.title}
          className="max-w-full max-h-full object-contain"
        />

        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={idx === 0}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full text-white disabled:opacity-30"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              aria-label="previous image"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <button
              onClick={next}
              disabled={idx === items.length - 1}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full text-white disabled:opacity-30"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              aria-label="next image"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </>
        )}

        <button
          onClick={popNokia}
          className="absolute top-1.5 right-1.5 w-8 h-8 grid place-items-center rounded-full text-white"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          aria-label="close"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      <div
        className="shrink-0 px-3 py-2 flex items-center justify-between gap-2 text-white"
        style={{ background: 'rgba(0,0,0,0.85)' }}
      >
        <div className="min-w-0">
          <div className="text-[11px] font-bold truncate">{item.title}</div>
          <div className="text-[10px] text-white/60">
            {idx + 1} / {items.length}
          </div>
        </div>
        <button
          onClick={() =>
            pushNokia({
              kind: 'app',
              appId: 'product-detail',
              payload: { productId: item.productId },
            })
          }
          className="px-3 py-1 text-[11px] text-gray-900 rounded-sm shrink-0"
          style={NEUTRAL_BTN}
        >
          View product
        </button>
      </div>
    </div>
  );
}
