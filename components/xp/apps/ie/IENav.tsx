'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { useDataStore } from '@/lib/store/dataStore';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { useIE } from './IEContext';

const CBTR_ORANGE = '#F57C20';
const CBTR_DARK = '#1B1F2A';
const LIGHT_TEXT = '#FFFFFF';

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
        if (categoryFilter && p.category !== categoryFilter && p.subCategory !== categoryFilter) return false;
        if (p.title.toLowerCase().includes(q)) return true;
        if (p.tags.some((t) => t.toLowerCase().includes(q))) return true;
        if (p.seoTags?.some((t) => t.toLowerCase().includes(q))) return true;
        return false;
      })
      .slice(0, 8);
  }, [products, query, categoryFilter]);

  const submitSearch = () => {
    if (!ie) return;
    ie.navigate(categoryFilter ? `cybertronics://shop/${categories.find((c) => c.id === categoryFilter)?.slug}` : 'cybertronics://shop');
    setOpen(false);
  };

  const topCategories = categories.filter((c) => c.parentCategory === null);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 shrink-0"
      style={{ background: `linear-gradient(to bottom, ${CBTR_ORANGE} 0%, #E86A0F 100%)`, borderBottom: `1px solid rgba(0,0,0,.2)` }}
    >
      <button
        onClick={() => ie?.navigate('cybertronics://')}
        className="text-[12px] font-bold tracking-tight shrink-0 hover:opacity-80 transition-opacity"
        style={{ color: LIGHT_TEXT, textShadow: '1px 1px 2px rgba(0,0,0,.3)' }}
        title="Home"
      >
        ◆ CYBERTRONIC
      </button>

      <div ref={wrapRef} className="flex-1 flex items-stretch gap-1 max-w-2xl">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-[10px] px-1.5 py-0.5 focus:outline-none rounded"
          style={{ background: 'rgba(255,255,255,.9)', border: '1px solid rgba(0,0,0,.1)', color: CBTR_DARK }}
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
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
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
            placeholder="Search…"
            className="w-full text-[11px] px-2 py-0.5 focus:outline-none rounded"
            style={{ background: 'rgba(255,255,255,.9)', border: '1px solid rgba(0,0,0,.1)', color: CBTR_DARK }}
            aria-label="Search products"
          />
          {open && query.trim() && results.length > 0 && (
            <ul
              className="absolute top-full left-0 right-0 z-30 max-h-64 overflow-auto animate-in fade-in duration-150 rounded"
              style={{
                background: 'rgba(5,5,5,.95)',
                border: `1px solid rgba(245,124,32,.3)`,
                boxShadow: '0 4px 12px rgba(0,0,0,.4)',
              }}
            >
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => { ie?.navigate(`cybertronics://product/${p.slug}`); setOpen(false); setQuery(''); }}
                    className="w-full px-2 py-1.5 text-left flex items-center gap-2 hover:bg-orange-900/30 transition-colors text-[10px]"
                  >
                    <span className="flex-1 min-w-0 truncate" style={{ color: LIGHT_TEXT }}>
                      {p.title}
                    </span>
                    <span className="text-[9px] font-bold shrink-0" style={{ color: p.discountPrice ? CBTR_ORANGE : LIGHT_TEXT }}>
                      {formatPrice(p.discountPrice ?? p.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {open && query.trim() && results.length === 0 && (
            <div
              className="absolute top-full left-0 right-0 z-30 px-2 py-1.5 text-[10px] animate-in fade-in duration-150 rounded"
              style={{ background: 'rgba(5,5,5,.95)', border: `1px solid rgba(245,124,32,.3)`, color: 'rgba(255,255,255,.5)' }}
            >
              No matches
            </div>
          )}
        </div>

        <button
          onClick={submitSearch}
          className="px-2 py-0.5 text-[10px] font-bold text-white shrink-0 flex items-center gap-1 hover:opacity-90 active:opacity-75 transition-opacity rounded"
          style={{ background: '#4D77BE', border: '1px solid rgba(0,0,0,.2)' }}
          title="Search"
        >
          <Search className="w-3 h-3" strokeWidth={2.5} />
          Go
        </button>
      </div>

      <button
        onClick={() => ie?.navigate('cybertronics://cart')}
        className="flex items-center gap-1 text-[10px] font-bold shrink-0 hover:opacity-80 transition-opacity"
        style={{ color: LIGHT_TEXT }}
        title={`Cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
      >
        <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2} />
        Cart ({cartCount})
      </button>
    </div>
  );
}
