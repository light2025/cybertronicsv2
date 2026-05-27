'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { useDataStore } from '@/lib/store/dataStore';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { useIE } from './IEContext';

const NAV_BG = 'linear-gradient(to bottom, #ffe05a 0%, #f0c020 100%)';
const ACCENT_BORDER = '#a07000';
const LINK_BLUE = '#0050a0';

export default function IENav() {
  const ie = useIE();
  const categories = useDataStore((s) => s.categories);
  const products = useDataStore((s) => s.products);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const [categoryFilter, setCategoryFilter] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onDoc);
    return () => window.removeEventListener('mousedown', onDoc);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => {
        if (
          categoryFilter &&
          p.category !== categoryFilter &&
          p.subCategory !== categoryFilter
        ) {
          return false;
        }
        if (p.title.toLowerCase().includes(q)) return true;
        if (p.tags.some((t) => t.toLowerCase().includes(q))) return true;
        if (p.seoTags?.some((t) => t.toLowerCase().includes(q))) return true;
        return false;
      })
      .slice(0, 8);
  }, [products, query, categoryFilter]);

  const submitSearch = () => {
    if (!ie) return;
    if (categoryFilter) {
      const cat = categories.find((c) => c.id === categoryFilter);
      if (cat) ie.navigate(`cybertronics://shop/${cat.slug}`);
      else ie.navigate('cybertronics://shop');
    } else {
      ie.navigate('cybertronics://shop');
    }
    setOpen(false);
  };

  const topCategories = categories.filter((c) => c.parentCategory === null);

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 shrink-0"
      style={{ background: NAV_BG, borderBottom: `1px solid ${ACCENT_BORDER}` }}
    >
      <button
        onClick={() => ie?.navigate('cybertronics://')}
        className="text-[14px] font-bold tracking-tight shrink-0"
        style={{ color: '#dc1f1f', textShadow: '1px 1px 0 #fff' }}
        title="Home"
      >
        Cybertronics
        <span style={{ color: LINK_BLUE }}>!</span>
      </button>

      <div ref={wrapRef} className="flex-1 flex items-stretch gap-1 max-w-2xl">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-[11px] text-gray-900 px-1.5 py-0.5 focus:outline-none"
          style={{ background: '#fff', border: '1px solid #999', borderRadius: 0 }}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {topCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.title}
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (results.length === 1) {
                  ie?.navigate(`cybertronics://product/${results[0].slug}`);
                  setQuery('');
                  setOpen(false);
                  return;
                }
                submitSearch();
              } else if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
            placeholder="Search products…"
            className="w-full text-[12px] text-gray-900 px-2 py-0.5 focus:outline-none"
            style={{ background: '#fff', border: '1px solid #999' }}
            aria-label="Search products"
          />
          {open && query.trim() && results.length > 0 && (
            <ul
              className="absolute top-full left-0 right-0 z-30 max-h-64 overflow-auto"
              style={{
                background: '#fff',
                border: '1px solid #999',
                boxShadow: '2px 2px 6px rgba(0,0,0,0.25)',
              }}
            >
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      ie?.navigate(`cybertronics://product/${p.slug}`);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="w-full px-2 py-1 text-left flex items-center gap-2 hover:bg-yellow-50"
                  >
                    <span className="flex-1 min-w-0 truncate text-[11px] text-gray-900">
                      {p.title}
                    </span>
                    <span
                      className="text-[10px] font-bold shrink-0"
                      style={{ color: p.discountPrice !== null ? '#c44030' : '#000' }}
                    >
                      {formatPrice(p.discountPrice ?? p.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {open && query.trim() && results.length === 0 && (
            <div
              className="absolute top-full left-0 right-0 z-30 px-2 py-1.5 text-[11px] text-gray-500"
              style={{ background: '#fff', border: '1px solid #999' }}
            >
              No matches for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        <button
          onClick={submitSearch}
          className="px-2 py-0.5 text-[11px] font-bold text-white shrink-0 flex items-center gap-1"
          style={{ background: LINK_BLUE, border: '1px solid #003070' }}
          title="Search"
        >
          <Search className="w-3 h-3" strokeWidth={2.5} />
          Go
        </button>
      </div>

      <button
        onClick={() => ie?.navigate('cybertronics://cart')}
        className="flex items-center gap-1 text-[11px] font-bold shrink-0 hover:underline"
        style={{ color: LINK_BLUE }}
        title={`Cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
      >
        <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2} />
        Cart ({cartCount})
      </button>
    </div>
  );
}
