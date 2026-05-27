'use client';

import { Mail } from 'lucide-react';

const EMAIL = 'hello@cybertronics.shop';

const QUICK_SUBJECTS = [
  { label: 'Order question', subject: 'Order question' },
  { label: 'Sizing help', subject: 'Sizing help' },
  { label: 'Return / exchange', subject: 'Return / exchange request' },
];

export default function MobileMail() {
  return (
    <div className="flex-1 flex flex-col bg-white px-6 py-5 items-center text-center min-h-0 overflow-auto">
      <div
        className="w-20 h-20 rounded-full grid place-items-center mb-4 shrink-0"
        style={{
          background: 'linear-gradient(to bottom, #4060a8 0%, #1e3e88 100%)',
          border: '2px solid #0a1e48',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        }}
      >
        <Mail className="w-9 h-9 text-white" strokeWidth={2} />
      </div>

      <h2 className="text-[14px] font-bold text-[#0a3060]">Email us</h2>
      <p className="text-[11px] text-[#4a5878] mt-1 mb-3">
        We reply within 1–2 business days.
      </p>

      <div
        className="text-[13px] font-mono font-bold text-[#0a3060] mb-4 px-3 py-1.5 break-all"
        style={{
          background: '#dce8f8',
          border: '1px solid #6896d2',
          borderRadius: 2,
        }}
      >
        {EMAIL}
      </div>

      <a
        href={`mailto:${EMAIL}`}
        className="px-6 py-2.5 text-[13px] font-bold rounded-sm inline-flex items-center gap-2 mb-5"
        style={{
          background: 'linear-gradient(to bottom, #4a86d8 0%, #2060c0 60%, #1448a8 100%)',
          color: '#fff',
          border: '1px solid #0a3060',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)',
        }}
      >
        <Mail className="w-3.5 h-3.5" strokeWidth={2.5} />
        Open mail app
      </a>

      <div className="text-[11px] text-[#4a5878] w-full text-left">
        <div className="font-bold mb-2 text-center">Quick topics</div>
        <div className="flex flex-col gap-1.5">
          {QUICK_SUBJECTS.map((q) => (
            <a
              key={q.subject}
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(q.subject)}`}
              className="px-3 py-2 text-[11px] active:bg-[#cee0f5]"
              style={{ background: '#dce8f8', border: '1px solid #6896d2', borderRadius: 2 }}
            >
              › {q.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
