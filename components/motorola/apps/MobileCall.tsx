'use client';

import { Phone } from 'lucide-react';

const PHONE_NUMBER = '+971501234567';
const DISPLAY_NUMBER = '+971 50 123 4567';

export default function MobileCall() {
  return (
    <div className="flex-1 flex flex-col bg-white px-6 py-6 items-center text-center min-h-0">
      <div
        className="w-20 h-20 rounded-full grid place-items-center mb-4"
        style={{
          background: 'linear-gradient(to bottom, #4a8a3a 0%, #3a6a2a 100%)',
          border: '2px solid #2a5028',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        }}
      >
        <Phone className="w-9 h-9 text-white" strokeWidth={2} />
      </div>

      <h2 className="text-[14px] font-bold text-[#0a3060]">Customer Service</h2>
      <p className="text-[11px] text-[#4a5878] mt-1 mb-5">
        Mon–Fri, 9:00–18:00 GST
      </p>

      <div
        className="text-[18px] font-mono font-bold text-[#0a3060] mb-4 px-3 py-1.5"
        style={{
          background: '#dce8f8',
          border: '1px solid #6896d2',
          borderRadius: 2,
        }}
      >
        {DISPLAY_NUMBER}
      </div>

      <a
        href={`tel:${PHONE_NUMBER}`}
        className="px-6 py-2.5 text-[13px] font-bold rounded-sm inline-flex items-center gap-2"
        style={{
          background: 'linear-gradient(to bottom, #62c462 0%, #52b452 35%, #3d9c3d 60%, #2c882c 100%)',
          color: '#fff',
          border: '1px solid #2c662c',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)',
        }}
      >
        <Phone className="w-3.5 h-3.5" strokeWidth={2.5} />
        Call now
      </a>

      <p className="text-[10px] text-[#4a5878] mt-6 max-w-[18rem]">
        Opens your device&apos;s phone dialer.
      </p>
    </div>
  );
}
