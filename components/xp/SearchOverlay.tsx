'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useXpStore } from '@/lib/store/xpStore';
import { apps, startMenuApps } from './appRegistry';
import type { AppId } from '@/types/xp';

type Hit = { id: AppId; title: string; sub?: string };

export default function SearchOverlay() {
  const open = useSettingsStore((s) => s.searchOpen);
  const close = useSettingsStore((s) => s.closeSearch);
  const toggle = useSettingsStore((s) => s.toggleSearch);
  const openApp = useXpStore((s) => s.open);

  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, close]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    const list = startMenuApps().map((id) => ({ id, title: apps[id].title }));
    if (!q) return list;
    return list.filter((h) => h.title.toLowerCase().includes(q) || h.id.includes(q));
  }, [query]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => Math.min(hits.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = hits[idx];
      if (hit) {
        const a = apps[hit.id];
        openApp(hit.id, { title: a.title, w: a.defaultSize.w, h: a.defaultSize.h });
        close();
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute inset-0 z-[90] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-[2px]"
          onClick={close}
        >
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[min(560px,92vw)] rounded-md overflow-hidden flex flex-col"
            style={{
              background: '#fff',
              border: '2px solid #3a6ea5',
              outline: '1px solid #0a246a',
              boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
            }}
          >
            {/* Header / input */}
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{
                background: 'linear-gradient(to bottom, #98c8f8 0%, #4a90e0 4%, #1e60c8 12%, #1050b0 100%)',
              }}
            >
              <Search className="w-4 h-4 text-white shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIdx(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search apps..."
                className="flex-1 bg-transparent text-white placeholder-blue-100/80 outline-none text-[13px]"
                style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.4)' }}
              />
              <button
                onClick={close}
                aria-label="close"
                className="w-5 h-5 grid place-items-center rounded-sm bg-red-500/90 hover:bg-red-600"
              >
                <X className="w-3 h-3 text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* Hits */}
            <ul className="max-h-[55vh] overflow-y-auto py-1">
              {hits.length === 0 && (
                <li className="px-4 py-6 text-center text-[12px] text-gray-500">
                  No matches.
                </li>
              )}
              {hits.map((h, i) => {
                const a = apps[h.id];
                const active = i === idx;
                return (
                  <li key={h.id}>
                    <button
                      onMouseEnter={() => setIdx(i)}
                      onClick={() => {
                        openApp(h.id, { title: a.title, w: a.defaultSize.w, h: a.defaultSize.h });
                        close();
                      }}
                      className="w-full px-3 py-2 flex items-center gap-3 text-left"
                      style={{
                        background: active ? '#316ac5' : 'transparent',
                        color: active ? '#fff' : '#1a1a1a',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.icon} alt="" className="w-5 h-5 shrink-0 object-contain" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold truncate">{a.title}</div>
                        <div
                          className="text-[10px] truncate"
                          style={{ color: active ? 'rgba(255,255,255,0.8)' : '#666' }}
                        >
                          {h.id}
                        </div>
                      </div>
                      {active && (
                        <kbd
                          className="text-[10px] px-1.5 py-0.5 rounded border"
                          style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
                        >
                          ↵
                        </kbd>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Footer hint */}
            <div
              className="flex items-center gap-3 px-3 py-1.5 text-[10px] text-gray-500"
              style={{ background: '#f4f4f4', borderTop: '1px solid #d4d4d4' }}
            >
              <span><kbd className="px-1 border rounded font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="px-1 border rounded font-mono">↵</kbd> open</span>
              <span><kbd className="px-1 border rounded font-mono">Esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
