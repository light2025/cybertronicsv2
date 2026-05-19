'use client';

import { Mail, MapPin, AtSign, ChevronRight } from 'lucide-react';
import type { ComponentType } from 'react';

type Row = {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  href?: string;
};

const ROWS: Row[] = [
  {
    Icon: Mail,
    label: 'Email',
    value: 'hello@cybertronics.shop',
    href: 'mailto:hello@cybertronics.shop',
  },
  {
    Icon: AtSign,
    label: 'Instagram',
    value: '@cybertronics',
    href: 'https://instagram.com/cybertronics',
  },
  {
    Icon: MapPin,
    label: 'Location',
    value: 'Dubai, UAE',
  },
];

const ROW_DIVIDER = '#d8e2ee';

export default function NokiaContact() {
  return (
    <div className="flex-1 overflow-auto min-h-0 bg-white">
      <div className="px-3 py-3">
        <h1 className="text-[14px] font-bold text-[#0a3060]">Get in touch</h1>
        <p className="text-[11px] text-[#4a5878] mt-1">
          We reply within 1–2 business days. UAE working week (Mon–Fri).
        </p>
      </div>

      <ul>
        {ROWS.map(({ Icon, label, value, href }) => {
          const inner = (
            <div className="w-full px-3 py-2.5 flex items-center gap-3 active:bg-[#cee0f5]">
              <div
                className="w-9 h-9 shrink-0 grid place-items-center rounded-md"
                style={{
                  background: 'linear-gradient(to bottom, #e4ecf6 0%, #c8d8ea 100%)',
                  border: '1px solid #6896d2',
                }}
              >
                <Icon className="w-4 h-4 text-[#1a4a8a]" strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-[#4a5878] uppercase tracking-wide">
                  {label}
                </div>
                <div className="text-[12px] font-bold text-[#0a3060] truncate">
                  {value}
                </div>
              </div>
              {href && (
                <ChevronRight
                  className="w-4 h-4 text-[#5878a0] shrink-0"
                  strokeWidth={2}
                />
              )}
            </div>
          );

          return (
            <li key={label} style={{ borderTop: `1px solid ${ROW_DIVIDER}` }}>
              {href ? (
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noreferrer' : undefined}
                  className="block"
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>

      <div
        className="px-3 py-3 text-[10px] text-[#4a5878]"
        style={{ borderTop: `1px solid ${ROW_DIVIDER}` }}
      >
        © Cybertronics — All rights reserved.
      </div>
    </div>
  );
}
