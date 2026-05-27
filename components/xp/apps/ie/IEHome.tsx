/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { formatPrice } from '@/lib/utils';
import { useIE } from './IEContext';
import type { Product } from '@/types';

// Yahoo-era portal palette
const HEAD_BG = '#ffe05a';
const HEAD_TEXT = '#5a3a00';
const SECTION_BG = '#fefce8';
const TABLE_BORDER = '#a07000';
const LINK_BLUE = '#0050a0';
const SALE_RED = '#c44030';

export default function IEHome() {
  const ie = useIE();
  const categories = useDataStore((s) => s.categories);
  const products = useDataStore((s) => s.products);
  const customGroups = useDataStore((s) => s.customGroups);
  const hydrated = useHydrated();
  const [search, setSearch] = useState('');

  if (!hydrated) {
    return <div className="p-8 text-center text-[12px] text-gray-500">Connecting to cybertronics.shop…</div>;
  }

  const featured = products.filter((p) => p.isFeatured).slice(0, 6);
  const onSale = products.filter((p) => p.discountPrice !== null).slice(0, 5);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);

  // Lifestyles section — filter by custom group slug (resilient to ID changes).
  const lifestyleGroupId = customGroups.find((cg) => cg.slug === 'lifestyles')?.id;
  const lifestyles: Product[] = lifestyleGroupId
    ? products.filter((p) => p.customGroups?.includes(lifestyleGroupId)).slice(0, 4)
    : [];

  const topCategories = categories.filter((c) => c.parentCategory === null).slice(0, 9);

  const submitSearch = () => {
    if (!ie) return;
    if (!search.trim()) {
      ie.navigate('cybertronics://shop');
    } else {
      ie.navigate('cybertronics://shop');
    }
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="font-sans p-3 text-[12px] bg-white">
      {/* Header banner */}
      <div
        className="flex items-center justify-between mb-3"
        style={{
          background: HEAD_BG,
          padding: '8px 12px',
          border: `2px solid ${TABLE_BORDER}`,
          borderRadius: 2,
        }}
      >
        <div>
          <h1
            className="text-[30px] font-bold tracking-tight leading-none"
            style={{ color: '#dc1f1f', textShadow: '2px 2px 0 #fff' }}
          >
            Cybertronics<span style={{ color: LINK_BLUE }}>!</span>
          </h1>
          <div className="text-[11px] mt-0.5" style={{ color: HEAD_TEXT }}>
            Your retro portal for clothing — Est. 2026
          </div>
        </div>
        <div className="text-[10px] text-right" style={{ color: HEAD_TEXT }}>
          <div>Sign in · Help · Settings</div>
          <div>{today}</div>
        </div>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 mb-3 p-2"
        style={{ background: SECTION_BG, border: `1px solid ${TABLE_BORDER}` }}
      >
        <span className="font-bold text-[12px]" style={{ color: HEAD_TEXT }}>
          Search:
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitSearch(); } }}
          placeholder="t-shirts, hats, accessories…"
          className="flex-1 px-2 py-0.5 text-[12px] focus:outline-none"
          style={{ background: '#fff', border: '1px solid #999' }}
        />
        <button
          onClick={submitSearch}
          className="px-3 py-0.5 text-[11px] font-bold"
          style={{
            background: LINK_BLUE,
            color: '#fff',
            border: `2px solid ${LINK_BLUE}`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
          }}
        >
          Search the Shop
        </button>
      </div>

      {/* 3-column body: categories | featured */}
      <div className="grid grid-cols-3 gap-3">
        {/* Categories list */}
        <div style={{ border: `1px solid ${TABLE_BORDER}` }}>
          <div
            className="px-2 py-1 font-bold text-[12px]"
            style={{ background: HEAD_BG, color: HEAD_TEXT, borderBottom: `1px solid ${TABLE_BORDER}` }}
          >
            Shop by Category
          </div>
          <ul className="p-2 space-y-1 text-[11px]">
            {topCategories.map((c) => (
              <li key={c.id}>
                <span style={{ color: TABLE_BORDER }}>•</span>{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    ie?.navigate(`cybertronics://shop/${c.slug}`);
                  }}
                  className="hover:underline"
                  style={{ color: LINK_BLUE }}
                >
                  {c.icon} {c.title}
                </a>{' '}
                <span className="text-gray-500">
                  ({products.filter((p) => p.category === c.id).length})
                </span>
              </li>
            ))}
          </ul>
          <div
            className="p-2 text-center"
            style={{ borderTop: `1px solid ${TABLE_BORDER}` }}
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                ie?.navigate('cybertronics://shop');
              }}
              className="hover:underline text-[11px] font-bold"
              style={{ color: LINK_BLUE }}
            >
              All Departments »
            </a>
          </div>
        </div>

        {/* Featured products */}
        <div className="col-span-2" style={{ border: `1px solid ${TABLE_BORDER}` }}>
          <div
            className="px-2 py-1 font-bold text-[12px]"
            style={{ background: HEAD_BG, color: HEAD_TEXT, borderBottom: `1px solid ${TABLE_BORDER}` }}
          >
            🔥 Featured Products
          </div>
          {featured.length === 0 ? (
            <div className="p-4 text-center text-[11px] text-gray-500">
              No featured products yet — flag some in admin.
            </div>
          ) : (
            <div className="p-2 grid grid-cols-3 gap-2">
              {featured.map((p) => (
                <a
                  key={p.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    ie?.navigate(`cybertronics://product/${p.slug}`);
                  }}
                  className="block text-center p-1 hover:bg-yellow-50"
                >
                  {p.images[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full aspect-square object-cover mb-1"
                      style={{ border: '1px solid #aaa' }}
                    />
                  ) : (
                    <div
                      className="w-full aspect-square flex items-center justify-center text-2xl mb-1"
                      style={{ border: '1px solid #aaa', background: '#f4f4f4' }}
                    >
                      🖼️
                    </div>
                  )}
                  <div
                    className="text-[10px] leading-tight font-bold hover:underline"
                    style={{ color: LINK_BLUE }}
                  >
                    {p.title}
                  </div>
                  <div
                    className="text-[10px] font-bold mt-0.5"
                    style={{ color: p.discountPrice !== null ? SALE_RED : '#000' }}
                  >
                    {formatPrice(p.discountPrice ?? p.price)}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Arrivals strip (only if any) */}
      {newArrivals.length > 0 && (
        <div className="mt-3" style={{ border: `1px solid ${TABLE_BORDER}` }}>
          <div
            className="px-2 py-1 font-bold text-[12px]"
            style={{ background: '#3a843a', color: '#fff' }}
          >
            ✨ New Arrivals
          </div>
          <div className="p-2 grid grid-cols-4 gap-2">
            {newArrivals.map((p) => (
              <a
                key={p.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  ie?.navigate(`cybertronics://product/${p.slug}`);
                }}
                className="block text-center hover:bg-emerald-50"
              >
                {p.images[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full aspect-square object-cover"
                    style={{ border: '1px solid #aaa' }}
                  />
                )}
                <div
                  className="text-[10px] font-bold mt-1 hover:underline"
                  style={{ color: LINK_BLUE }}
                >
                  {p.title}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyles strip (only if any) */}
      {lifestyles.length > 0 && (
        <div className="mt-3" style={{ border: `1px solid ${TABLE_BORDER}` }}>
          <div
            className="px-2 py-1 font-bold text-[12px]"
            style={{ background: '#2868c8', color: '#fff' }}
          >
            🌆 Lifestyles
          </div>
          <div className="p-2 grid grid-cols-4 gap-2">
            {lifestyles.map((p) => (
              <a
                key={p.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  ie?.navigate(`cybertronics://product/${p.slug}`);
                }}
                className="block text-center hover:bg-blue-50"
              >
                {p.images[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full aspect-square object-cover"
                    style={{ border: '1px solid #aaa' }}
                  />
                )}
                <div
                  className="text-[10px] font-bold mt-1 hover:underline"
                  style={{ color: LINK_BLUE }}
                >
                  {p.title}
                </div>
                <div
                  className="text-[10px] font-bold mt-0.5"
                  style={{ color: p.discountPrice !== null ? SALE_RED : '#000' }}
                >
                  {formatPrice(p.discountPrice ?? p.price)}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* On sale strip (only if any) */}
      {onSale.length > 0 && (
        <div className="mt-3" style={{ border: `1px solid ${TABLE_BORDER}` }}>
          <div
            className="px-2 py-1 font-bold text-[12px]"
            style={{ background: SALE_RED, color: '#fff' }}
          >
            💰 On Sale Now
          </div>
          <ul className="p-2 space-y-1 text-[11px]">
            {onSale.map((p) => (
              <li key={p.id}>
                <span style={{ color: TABLE_BORDER }}>•</span>{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    ie?.navigate(`cybertronics://product/${p.slug}`);
                  }}
                  className="hover:underline"
                  style={{ color: LINK_BLUE }}
                >
                  {p.title}
                </a>{' '}
                — <span className="font-bold" style={{ color: SALE_RED }}>{formatPrice(p.discountPrice!)}</span>
                <span className="text-gray-400 line-through ml-1">{formatPrice(p.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-4 pt-2 text-center text-[10px] text-gray-500"
        style={{ borderTop: '1px solid #aaa' }}
      >
        © 2026 Cybertronics. All rights reserved. ·{' '}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); ie?.navigate('cybertronics://about'); }}
          className="hover:underline"
          style={{ color: LINK_BLUE }}
        >
          About
        </a>{' '}·{' '}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); ie?.navigate('cybertronics://contact'); }}
          className="hover:underline"
          style={{ color: LINK_BLUE }}
        >
          Contact
        </a>{' '}·{' '}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); ie?.navigate('cybertronics://help'); }}
          className="hover:underline"
          style={{ color: LINK_BLUE }}
        >
          Help
        </a>
      </div>
    </div>
  );
}
