'use client';

import { useEffect, useState } from 'react';

const LCD_DARK = '#324C0D';
const RETRO_TINT = 'brightness(0) invert(26%) sepia(16%) saturate(2059%) hue-rotate(54deg) brightness(96%) contrast(92%)';

type Props = {
  onMenuPress: () => void;
};

export default function Standby({ onMenuPress }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const time = now
    ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    : '--:--';

  const date = now
    ? `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
    : '';

  return (
    <div
      className="w-full h-full flex"
      style={{ color: LCD_DARK }}
    >
      {/* Left sidebar — Network icon */}
      <div className="h-full w-[48px] flex justify-center items-center" style={{ transform: 'translateX(-30px)' }}>
        <img
          src="/mobile/ui/Network.png"
          alt="Network"
          className="h-[88%] w-auto object-contain"
          style={{ filter: RETRO_TINT }}
        />
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col justify-between items-center py-4">
        {/* Clock area */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="text-[58px] font-bold leading-none">
            {time}
          </div>
          <div className="text-[18px] mt-2">
            {date}
          </div>
        </div>

        {/* Menu button */}
        <div className="h-[46px] flex items-center">
          <button
            onClick={onMenuPress}
            className="text-[34px] font-bold uppercase active:scale-95"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Right sidebar — Battery icon */}
      <div className="h-full w-[48px] flex justify-center items-center" style={{ transform: 'translateX(30px)' }}>
        <img
          src="/mobile/ui/Battery.png"
          alt="Battery"
          className="h-[88%] w-auto object-contain"
          style={{ filter: RETRO_TINT }}
        />
      </div>
    </div>
  );
}
