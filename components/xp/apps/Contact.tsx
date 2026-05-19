'use client';

import { Mail, MapPin, AtSign } from 'lucide-react';

export default function Contact() {
  return (
    <div className="h-full overflow-auto p-5 bg-white text-[12px] text-gray-800 space-y-3">
      <h1 className="text-[16px] font-bold text-[#0a246a]">Get in touch</h1>
      <p className="text-gray-600">
        We reply within 1–2 business days. UAE working week (Mon–Fri).
      </p>

      <ul className="space-y-2 mt-3">
        <li className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#0a246a]" />
          <a href="mailto:hello@cybertronics.shop" className="text-[#0a246a] underline">
            hello@cybertronics.shop
          </a>
        </li>
        <li className="flex items-center gap-2">
          <AtSign className="w-4 h-4 text-[#0a246a]" />
          <a href="https://instagram.com/cybertronics" target="_blank" rel="noreferrer" className="text-[#0a246a] underline">
            @cybertronics
          </a>
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#0a246a]" />
          <span>Dubai, UAE</span>
        </li>
      </ul>

      <div className="mt-4 pt-3 border-t border-gray-200 text-gray-500 text-[10px]">
        © Cybertronics — All rights reserved.
      </div>
    </div>
  );
}
