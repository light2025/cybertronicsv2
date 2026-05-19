'use client';

export default function NokiaAbout() {
  return (
    <div className="flex-1 overflow-auto min-h-0 bg-white">
      <div className="px-3 py-4 space-y-3 text-[12px] text-[#202020] leading-relaxed">
        <h1 className="text-[14px] font-bold text-[#0a3060]">About Cybertronics</h1>

        <p>
          Cybertronics is a small lifestyle label born from a mix of internet
          culture, old-school computer aesthetics, and a soft spot for the early
          2000s.
        </p>

        <h2 className="text-[12px] font-bold text-[#0a3060] pt-2">What we do</h2>
        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
          <li>Limited drops. No restocks.</li>
          <li>Premium heavy-cotton blanks.</li>
          <li>Designs printed in the UAE.</li>
          <li>Free shipping on orders over AED 200.</li>
        </ul>

        <h2 className="text-[12px] font-bold text-[#0a3060] pt-2">Where we are</h2>
        <p className="text-[11px]">Dubai, UAE → ships worldwide.</p>

        <h2 className="text-[12px] font-bold text-[#0a3060] pt-2">Why “XP”?</h2>
        <p className="text-[11px]">
          Because the early 2000s were a vibe, and we like that you double-clicked
          to get here.
        </p>

        <p className="pt-3 text-[11px] text-[#4a5878] italic">
          — The Cybertronics team
        </p>
      </div>
    </div>
  );
}
