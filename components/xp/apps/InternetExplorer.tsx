'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  X as XIcon,
  RotateCcw,
  Home,
  Search,
  Star,
  Globe,
} from 'lucide-react';
import About from './About';
import Contact from './Contact';
import Help from './Help';
import Cart from './Cart';
import Checkout from './Checkout';
import { IEContext, type IEContextValue, type IENavigate } from './ie/IEContext';
import {
  IE_HOME_URL,
  defaultTitleForRoute,
  normalizeAddressInput,
  parseUrl,
  type IERoute,
} from './ie/types';
import IEHome from './ie/IEHome';
import IEShop from './ie/IEShop';
import IEProduct from './ie/IEProduct';
import IENotFound from './ie/IENotFound';
import IENav from './ie/IENav';
import type { WindowPayload } from '@/types/xp';

type HistoryEntry = { url: string; title: string };
type Props = { winId: string; payload?: WindowPayload };

const CHROME_BG = '#ece9d8';
const CHROME_BORDER = '#aaa';

export default function InternetExplorer({ payload }: Props) {
  const initialUrl =
    typeof payload?.url === 'string' && payload.url.length > 0 ? payload.url : IE_HOME_URL;
  const initialTitle = defaultTitleForRoute(parseUrl(initialUrl));

  const [history, setHistory] = useState<HistoryEntry[]>([
    { url: initialUrl, title: initialTitle },
  ]);
  const [cursor, setCursor] = useState(0);
  const [addressInput, setAddressInput] = useState(initialUrl);
  const [loading, setLoading] = useState(false);

  const current = history[cursor];
  const route = parseUrl(current.url);

  const canGoBack = cursor > 0;
  const canGoForward = cursor < history.length - 1;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAddressInput(current.url);
  }, [current.url]);

  const flashLoading = () => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(t);
  };

  const navigate: IENavigate = useCallback(
    (rawUrl: string) => {
      const url = normalizeAddressInput(rawUrl);
      const next = parseUrl(url);
      const title = defaultTitleForRoute(next);
      setHistory((h) => {
        const truncated = h.slice(0, cursor + 1);
        return [...truncated, { url, title }];
      });
      setCursor((c) => c + 1);
      flashLoading();
    },
    [cursor]
  );

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    setCursor((c) => c - 1);
    flashLoading();
  }, [canGoBack]);

  const goForward = useCallback(() => {
    if (!canGoForward) return;
    setCursor((c) => c + 1);
    flashLoading();
  }, [canGoForward]);

  const goHome = useCallback(() => navigate(IE_HOME_URL), [navigate]);

  const refresh = useCallback(() => {
    flashLoading();
  }, []);

  const onSubmitAddress = () => {
    if (!addressInput.trim()) return;
    navigate(addressInput);
  };

  const ctx: IEContextValue = {
    navigate,
    back: goBack,
    forward: goForward,
    refresh,
    current,
  };

  return (
    <IEContext.Provider value={ctx}>
      <div className="flex flex-col h-full" style={{ background: CHROME_BG }}>
        {/* Menu bar (decorative) */}
        <div
          className="px-2 py-0.5 text-[11px] text-gray-800 select-none flex gap-3 shrink-0"
          style={{ borderBottom: `1px solid ${CHROME_BORDER}` }}
        >
          {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map((m) => (
            <span
              key={m}
              className="px-1 cursor-default"
              style={{ userSelect: 'none' }}
            >
              <u>{m[0]}</u>
              {m.slice(1)}
            </span>
          ))}
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-0.5 px-2 py-1 shrink-0"
          style={{ borderBottom: `1px solid ${CHROME_BORDER}` }}
        >
          <ToolBtn icon={<ArrowLeft size={14} />} label="Back" onClick={goBack} disabled={!canGoBack} />
          <ToolBtn icon={<ArrowRight size={14} />} label="Forward" onClick={goForward} disabled={!canGoForward} />
          <ToolBtn icon={<XIcon size={14} />} label="Stop" onClick={() => setLoading(false)} disabled={!loading} />
          <ToolBtn icon={<RotateCcw size={14} />} label="Refresh" onClick={refresh} />
          <ToolBtn icon={<Home size={14} />} label="Home" onClick={goHome} />
          <div className="w-px h-7 mx-1" style={{ background: '#bbb' }} />
          <ToolBtn icon={<Search size={14} />} label="Search" onClick={() => {}} disabled />
          <ToolBtn icon={<Star size={14} />} label="Favorites" onClick={() => {}} disabled />
        </div>

        {/* Address bar */}
        <div
          className="flex items-center gap-1 px-2 py-1 shrink-0"
          style={{ borderBottom: `1px solid ${CHROME_BORDER}` }}
        >
          <span className="text-[11px] text-gray-700 mr-1">Address</span>
          <Globe className="w-3.5 h-3.5 text-[#0050a0] shrink-0" strokeWidth={2} />
          <input
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmitAddress();
              }
            }}
            className="flex-1 px-1.5 py-0.5 text-[12px] font-mono text-gray-900 focus:outline-none"
            style={{ background: '#fff', border: '1px solid #7f9db9' }}
            spellCheck={false}
          />
          <button
            onClick={onSubmitAddress}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-gray-900 rounded-sm"
            style={{
              background: CHROME_BG,
              border: '1px solid #777',
              boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
            }}
          >
            <ArrowRight size={10} strokeWidth={2.5} /> Go
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          <IENav />
          <div className="flex-1 overflow-auto">
            {renderRoute(route, current.url)}
          </div>
        </div>

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-2 py-0.5 text-[10px] text-gray-700 shrink-0"
          style={{ borderTop: `1px solid ${CHROME_BORDER}` }}
        >
          <span>{loading ? 'Loading…' : 'Done'}</span>
          <span className="flex items-center gap-1">
            <Globe size={10} strokeWidth={2} className="text-[#0050a0]" />
            Cybertronics zone
          </span>
        </div>
      </div>

    </IEContext.Provider>
  );
}

function ToolBtn({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex flex-col items-center px-1.5 py-0.5 rounded-sm hover:bg-[#cee3f4] disabled:opacity-40 disabled:hover:bg-transparent"
      style={{ minWidth: 44 }}
    >
      {icon}
      <span className="text-[9px] leading-none mt-0.5 text-gray-800">{label}</span>
    </button>
  );
}

function renderRoute(route: IERoute, url: string) {
  switch (route.kind) {
    case 'home':           return <IEHome />;
    case 'shop':           return <IEShop />;
    case 'shop-category':  return <IEShop categorySlug={route.slug} />;
    case 'product':        return <IEProduct slug={route.slug} />;
    case 'cart':           return <Cart />;
    case 'checkout':       return <Checkout winId="ie-embedded" />;
    case 'about':          return <About />;
    case 'contact':        return <Contact />;
    case 'help':           return <Help />;
    case 'not-found':      return <IENotFound url={url} />;
  }
}
