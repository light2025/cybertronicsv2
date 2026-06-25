'use client';

import { useState, useEffect } from 'react';
import { useMobileStore } from '@/lib/store/mobileStore';
import { apps } from '@/components/xp/appRegistry';
import { mobileMenuApps } from './apps';
import type { AppId } from '@/types/xp';

const LCD_DARK = '#324C0D';
const RETRO_TINT = 'brightness(0) invert(26%) sepia(16%) saturate(2059%) hue-rotate(54deg) brightness(96%) contrast(92%)';

const MOBILE_ICON_MAP: Partial<Record<AppId, string>> = {
  lifestyle: '/mobile/icons/Internet Explorer.webp',
  gallery: '/mobile/icons/Gallery.webp',
  cart: '/mobile/icons/Games.webp',
  notepad: '/mobile/icons/Notes.webp',
  calculator: '/mobile/icons/Calculator.webp',
  snake: '/mobile/icons/Games.webp',
  music: '/mobile/icons/Music.webp',
  video: '/mobile/icons/Videos.webp',
  mail: '/mobile/icons/Call.webp',
  call: '/mobile/icons/Call.webp',
  settings: '/mobile/icons/Settings.webp',
  about: '/mobile/icons/AboutUs.webp',
  contact: '/mobile/icons/Call.webp',
};

type Props = {
  leftKey?: { label: string; onClick: () => void };
  rightKey?: { label: string; onClick: () => void };
};

export default function AppCarousel({ leftKey: _leftKey, rightKey }: Props) {
  void _leftKey; // Reserved for future soft key
  const push = useMobileStore((s) => s.push);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [now, setNow] = useState<Date | null>(null);

  const list = mobileMenuApps;
  const currentAppId = list[currentIndex];
  const currentApp = apps[currentAppId];
  const iconSrc = MOBILE_ICON_MAP[currentAppId] || '/mobile/icons/AboutUs.webp';

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  const time = now
    ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    : '--:--';

  const goPrev = () => {
    setCurrentIndex((i) => (i === 0 ? list.length - 1 : i - 1));
  };

  const goNext = () => {
    setCurrentIndex((i) => (i === list.length - 1 ? 0 : i + 1));
  };

  const selectApp = () => {
    push({ kind: 'app', appId: currentAppId });
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ color: LCD_DARK }}>
      {/* Top bar with time and notification */}
      <div
        className="shrink-0 h-[32px] flex justify-between items-center px-1 text-[18px]"
        style={{ borderBottom: `2px solid ${LCD_DARK}` }}
      >
        <span>{time}</span>
        <div className="flex items-center gap-1">
          <img
            src="/mobile/icons/Call.webp"
            alt="Call"
            className="w-[18px] h-[18px] object-contain"
            style={{ filter: RETRO_TINT }}
          />
          <span>CALL</span>
        </div>
      </div>

      {/* Carousel area */}
      <div className="flex-1 flex items-center justify-between px-0">
        {/* Left arrow */}
        <button
          onClick={goPrev}
          className="w-[34px] h-[44px] flex items-center justify-center active:scale-90"
        >
          <img
            src="/mobile/ui/arrows.png"
            alt="Prev"
            className="h-full w-auto object-contain"
            style={{ filter: RETRO_TINT, transform: 'scaleX(-1)' }}
          />
        </button>

        {/* Center — app icon and name */}
        <div className="flex flex-col items-center justify-center flex-1 min-w-0">
          <img
            src={iconSrc}
            alt={currentApp.title}
            className="w-[116px] h-[116px] object-contain mb-2"
            style={{ imageRendering: 'pixelated' }}
          />
          <div
            className="text-[18px] font-bold text-center max-w-[150px] truncate"
          >
            {currentApp.title}
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={goNext}
          className="w-[34px] h-[44px] flex items-center justify-center active:scale-90"
        >
          <img
            src="/mobile/ui/arrows.png"
            alt="Next"
            className="h-full w-auto object-contain"
            style={{ filter: RETRO_TINT }}
          />
        </button>
      </div>

      {/* Soft keys */}
      <div
        className="shrink-0 h-[42px] flex justify-between items-end px-1 text-[20px] font-bold"
      >
        <button
          onClick={selectApp}
          className="active:scale-95"
        >
          Select
        </button>
        <button
          onClick={rightKey?.onClick}
          className="active:scale-95"
        >
          {rightKey?.label || 'Back'}
        </button>
      </div>
    </div>
  );
}
