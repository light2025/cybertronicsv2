/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { formatPrice } from '@/lib/utils';
import { useIE } from './IEContext';
import type { Product } from '@/types';

const CBTR_ORANGE = '#F57C20';
const CBTR_BLUE   = '#4D77BE';
const CBTR_GREEN  = '#8DC63F';
const DARK_BG     = '#050505';
const LIGHT_TEXT  = '#FFFFFF';

function heroImg(p: Product): string | null {
  if (p.images.length === 0) return null;
  return p.images[p.primaryImageIndex ?? 0] ?? p.images[0];
}

export default function IEHome() {
  const ie = useIE();
  const categories  = useDataStore((s) => s.categories);
  const products    = useDataStore((s) => s.products);
  const customGroups = useDataStore((s) => s.customGroups);
  const hydrated    = useHydrated();
  const [search, setSearch] = useState('');

  if (!hydrated) {
    return (
      <div className="p-8 text-center text-[12px]" style={{ background: DARK_BG, color: LIGHT_TEXT }}>
        Connecting…
      </div>
    );
  }

  const featured     = products.filter((p) => p.isFeatured).slice(0, 6);
  const newArrivals  = products.filter((p) => p.isNewArrival).slice(0, 4);
  const onSale       = products.filter((p) => p.discountPrice !== null).slice(0, 5);
  const topCategories = categories.filter((c) => c.parentCategory === null).slice(0, 8);

  const lifestyleGroupId = customGroups.find((cg) => cg.slug === 'lifestyles')?.id;
  const lifestyles: Product[] = lifestyleGroupId
    ? products.filter((p) => p.customGroups?.includes(lifestyleGroupId)).slice(0, 4)
    : [];

  return (
    <div className="font-xp text-[12px]" style={{ background: DARK_BG, color: LIGHT_TEXT }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-between gap-4 px-5 py-5 animate-in fade-in slide-in-from-top duration-500"
        style={{
          background: 'linear-gradient(135deg, #1B1F2A 0%, rgba(245,124,32,.08) 100%)',
          borderBottom: '1px solid rgba(245,124,32,.2)',
        }}
      >
        <div>
          {/* Logo */}
          <img
            src="/xp/logo/CBTR_White_Text.png"
            alt="Cybertronic"
            className="h-8 w-auto mb-2"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="text-[10px]" style={{ color: 'rgba(255,255,255,.7)' }}>
            Premium XP-inspired merch · Dubai, UAE
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => ie?.navigate('cybertronics://shop')}
              className="px-3 py-1 text-[10px] font-bold rounded transition-all hover:opacity-90"
              style={{ background: CBTR_ORANGE, color: '#fff' }}
            >
              SHOP NOW
            </button>
            <button
              onClick={() => ie?.navigate('cybertronics://shop')}
              className="px-3 py-1 text-[10px] font-bold rounded transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,.1)', color: LIGHT_TEXT, border: '1px solid rgba(255,255,255,.15)' }}
            >
              ALL DROPS
            </button>
          </div>
        </div>
        {/* Stats pill */}
        <div
          className="shrink-0 p-3 rounded text-[9px] hidden sm:block"
          style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}
        >
          <div style={{ color: 'rgba(255,255,255,.5)' }}>Drop</div>
          <div className="font-bold" style={{ color: CBTR_ORANGE }}>V3.0</div>
          <div className="mt-1" style={{ color: 'rgba(255,255,255,.5)' }}>Status</div>
          <div className="font-bold" style={{ color: CBTR_GREEN }}>LIVE</div>
        </div>
      </div>

      {/* ── Marquee ticker ────────────────────────────────────────── */}
      <div
        className="py-2 text-[10px] font-bold overflow-hidden"
        style={{ background: CBTR_ORANGE, color: '#1B1F2A' }}
      >
        <div className="inline-block animate-marquee whitespace-nowrap px-4">
          ▸ CYBERTRONIC • T-SHIRTS • PANTS • HOODIES • SOCKS • CAPS • ACCESSORIES • CYBERTRONIC • T-SHIRTS • PANTS • HOODIES • SOCKS •
        </div>
      </div>

      {/* ── Search ────────────────────────────────────────────────── */}
      <div
        className="flex gap-2 px-4 py-3"
        style={{ background: 'rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.07)' }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') ie?.navigate('cybertronics://shop'); }}
          placeholder="Search products…"
          className="flex-1 px-2 py-1 text-[11px] rounded focus:outline-none"
          style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: LIGHT_TEXT }}
        />
        <button
          onClick={() => ie?.navigate('cybertronics://shop')}
          className="px-3 py-1 text-[11px] font-bold rounded transition-opacity hover:opacity-90"
          style={{ background: CBTR_ORANGE, color: '#fff' }}
        >
          Go
        </button>
      </div>

      {/* ── Category chips ────────────────────────────────────────── */}
      <div
        className="flex gap-2 px-4 py-3 overflow-x-auto"
        style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}
      >
        {topCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => ie?.navigate(`cybertronics://shop/${c.slug}`)}
            className="px-3 py-1 text-[10px] font-bold rounded whitespace-nowrap transition-all hover:opacity-80 active:scale-95"
            style={{ background: 'rgba(245,124,32,.15)', color: CBTR_ORANGE, border: '1px solid rgba(245,124,32,.3)' }}
          >
            {c.icon} {c.title}
          </button>
        ))}
      </div>

      {/* ── Featured ──────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <div className="px-4 py-4 animate-in fade-in duration-500 delay-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold" style={{ color: CBTR_ORANGE }}>⭐ FEATURED</span>
            <button
              onClick={() => ie?.navigate('cybertronics://shop')}
              className="text-[9px] hover:text-orange-400 transition-colors"
              style={{ color: 'rgba(255,255,255,.5)' }}
            >
              See all ▶
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {featured.map((p) => {
              const img = heroImg(p);
              return (
                <a
                  key={p.id}
                  href="#"
                  onClick={(e) => { e.preventDefault(); ie?.navigate(`cybertronics://product/${p.slug}`); }}
                  className="p-2 rounded text-center transition-all hover:opacity-75 active:scale-95 group"
                  style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full aspect-square object-cover mb-1.5 rounded group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center text-xl mb-1.5 rounded" style={{ background: 'rgba(255,255,255,.02)' }}>
                      🖼️
                    </div>
                  )}
                  <div className="text-[9px] font-bold leading-tight line-clamp-2 mb-1" style={{ color: LIGHT_TEXT }}>
                    {p.title}
                  </div>
                  <div className="text-[9px] font-bold" style={{ color: p.discountPrice !== null ? CBTR_ORANGE : 'rgba(255,255,255,.8)' }}>
                    {formatPrice(p.discountPrice ?? p.price)}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── New Arrivals ──────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <div className="px-4 py-4 animate-in fade-in duration-500 delay-150">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold" style={{ color: CBTR_GREEN }}>✨ NEW ARRIVALS</span>
            <button
              onClick={() => ie?.navigate('cybertronics://shop')}
              className="text-[9px] hover:text-green-400 transition-colors"
              style={{ color: 'rgba(255,255,255,.5)' }}
            >
              See all ▶
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {newArrivals.map((p) => {
              const img = heroImg(p);
              return (
                <a
                  key={p.id}
                  href="#"
                  onClick={(e) => { e.preventDefault(); ie?.navigate(`cybertronics://product/${p.slug}`); }}
                  className="p-1.5 rounded text-center transition-all hover:opacity-75 active:scale-95 group"
                  style={{ background: 'rgba(141,198,63,.08)', border: '1px solid rgba(141,198,63,.2)' }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full aspect-square object-cover mb-1 rounded group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center text-lg mb-1 rounded" style={{ background: 'rgba(255,255,255,.02)' }}>
                      🖼️
                    </div>
                  )}
                  <div className="text-[8px] font-bold leading-tight line-clamp-2" style={{ color: LIGHT_TEXT }}>
                    {p.title}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Lifestyles ────────────────────────────────────────────── */}
      {lifestyles.length > 0 && (
        <div className="px-4 py-4 animate-in fade-in duration-500 delay-200">
          <div className="text-[11px] font-bold mb-3" style={{ color: CBTR_BLUE }}>🌆 LIFESTYLES</div>
          <div className="grid grid-cols-4 gap-2">
            {lifestyles.map((p) => {
              const img = heroImg(p);
              return (
                <a
                  key={p.id}
                  href="#"
                  onClick={(e) => { e.preventDefault(); ie?.navigate(`cybertronics://product/${p.slug}`); }}
                  className="p-1.5 rounded text-center transition-all hover:opacity-75 active:scale-95 group"
                  style={{ background: 'rgba(77,119,190,.1)', border: '1px solid rgba(77,119,190,.2)' }}
                >
                  {img && (
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full aspect-square object-cover mb-1 rounded group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  )}
                  <div className="text-[8px] font-bold leading-tight line-clamp-2" style={{ color: LIGHT_TEXT }}>
                    {p.title}
                  </div>
                  <div className="text-[8px] font-bold mt-0.5" style={{ color: p.discountPrice !== null ? CBTR_ORANGE : 'rgba(255,255,255,.6)' }}>
                    {formatPrice(p.discountPrice ?? p.price)}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── On Sale ───────────────────────────────────────────────── */}
      {onSale.length > 0 && (
        <div className="px-4 py-4 animate-in fade-in duration-500 delay-300">
          <div className="text-[11px] font-bold mb-3" style={{ color: CBTR_ORANGE }}>💰 ON SALE</div>
          <ul className="space-y-1.5 text-[10px]">
            {onSale.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); ie?.navigate(`cybertronics://product/${p.slug}`); }}
                  className="flex-1 hover:text-orange-400 transition-colors truncate"
                  style={{ color: LIGHT_TEXT }}
                >
                  {p.title}
                </a>
                <span className="font-bold shrink-0" style={{ color: CBTR_ORANGE }}>
                  {formatPrice(p.discountPrice!)}
                </span>
                <span className="line-through shrink-0 text-[9px]" style={{ color: 'rgba(255,255,255,.35)' }}>
                  {formatPrice(p.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div
        className="px-4 py-4 text-center text-[9px] animate-in fade-in duration-500 delay-400"
        style={{ background: 'rgba(255,255,255,.02)', borderTop: '1px solid rgba(255,255,255,.07)', color: 'rgba(255,255,255,.45)' }}
      >
        <img
          src="/xp/logo/CBTR_White.png"
          alt=""
          className="h-5 w-auto mx-auto mb-2 opacity-40"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="mb-1">© 2026 Cybertronics. All rights reserved.</div>
        <div className="flex gap-3 justify-center">
          {(['about', 'contact', 'help'] as const).map((slug) => (
            <a
              key={slug}
              href="#"
              onClick={(e) => { e.preventDefault(); ie?.navigate(`cybertronics://${slug}`); }}
              className="hover:text-orange-400 transition-colors capitalize"
            >
              {slug}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
