'use client';

export default function About() {
  return (
    <div
      className="h-full overflow-auto p-5 font-mono text-[12px] leading-relaxed"
      style={{ background: '#fffef8', color: '#202020' }}
    >
      <div className="text-gray-500 text-[10px] mb-3">📄 about.txt — Notepad</div>
      <pre className="whitespace-pre-wrap">{`================================
  CYBERTRONICS — About Us
================================

We make t-shirts you actually want to wear.

Cybertronics is a small lifestyle label
born from a mix of internet culture,
old-school computer aesthetics, and a
soft spot for the early 2000s.

What we do
----------
- Limited drops. No restocks.
- Premium heavy-cotton blanks.
- Designs printed in the UAE.
- Free shipping on orders over AED 200.

Where we are
------------
Dubai, UAE → ships worldwide.

Why "XP"?
---------
Because the early 2000s were a vibe,
and we like that you double-clicked
to get here.

— The Cybertronics team`}</pre>
    </div>
  );
}
