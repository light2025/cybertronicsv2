'use client';

import { ChevronRight } from 'lucide-react';
import { useNokiaStore } from '@/lib/store/nokiaStore';
import type { WindowPayload } from '@/types/xp';

type TopicId = 'getting-started' | 'apps' | 'shortcuts' | 'support';

const TOPICS: { id: TopicId; title: string; hint: string }[] = [
  { id: 'getting-started', title: 'Getting Started', hint: 'How to use Cybertronics OS' },
  { id: 'apps', title: 'Apps & Folders', hint: 'What each app does' },
  { id: 'shortcuts', title: 'Shortcuts', hint: 'Keyboard tips for desktop' },
  { id: 'support', title: 'Support', hint: 'How to reach us' },
];

const SUB_HEADER_BG = '#dce8f8';
const SUB_HEADER_BORDER = '#6896d2';
const ROW_DIVIDER = '#d8e2ee';

type Props = { payload?: WindowPayload };

export default function NokiaHelp({ payload }: Props) {
  const topic = payload?.topic as TopicId | undefined;
  const pushNokia = useNokiaStore((s) => s.push);
  const popNokia = useNokiaStore((s) => s.pop);

  if (!topic) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-white">
        <div
          className="px-3 py-1.5 shrink-0 text-[11px] font-bold text-[#0a3060]"
          style={{ background: SUB_HEADER_BG, borderBottom: `1px solid ${SUB_HEADER_BORDER}` }}
        >
          Help Topics
        </div>
        <ul className="flex-1 overflow-auto min-h-0">
          {TOPICS.map((t) => (
            <li key={t.id}>
              <button
                onClick={() =>
                  pushNokia({
                    kind: 'app',
                    appId: 'help',
                    payload: { topic: t.id },
                  })
                }
                className="w-full px-3 py-2.5 flex items-center gap-3 active:bg-[#cee0f5] text-left"
                style={{ borderBottom: `1px solid ${ROW_DIVIDER}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-[#0a3060] leading-tight">
                    {t.title}
                  </div>
                  <div className="text-[10px] text-[#4a5878] mt-0.5">{t.hint}</div>
                </div>
                <ChevronRight
                  className="w-4 h-4 text-[#5878a0] shrink-0"
                  strokeWidth={2}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const current = TOPICS.find((t) => t.id === topic);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      <div
        className="px-3 py-1.5 shrink-0 flex items-center gap-2 text-[11px]"
        style={{ background: SUB_HEADER_BG, borderBottom: `1px solid ${SUB_HEADER_BORDER}` }}
      >
        <button onClick={popNokia} className="text-[#1a4a8a] font-bold">
          ‹ Topics
        </button>
        <span className="opacity-50">›</span>
        <span className="font-bold text-[#0a3060] truncate">{current?.title}</span>
      </div>

      <div className="flex-1 overflow-auto min-h-0 px-3 py-4 text-[12px] text-[#202020] leading-relaxed">
        {topic === 'getting-started' && (
          <div className="space-y-2">
            <h2 className="text-[13px] font-bold text-[#0a3060]">
              Welcome to Cybertronics OS
            </h2>
            <p>This is an XP-themed storefront. Browse products, place orders, and explore.</p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Tap <b>Menu</b> from standby to see all apps.</li>
              <li>Tap <b>Cart</b> from standby to jump to your cart.</li>
              <li>The cart icon at the top shows your current item count.</li>
              <li>Use the <b>Back</b> soft-key to step backward through screens.</li>
            </ul>
          </div>
        )}

        {topic === 'apps' && (
          <div className="space-y-1.5 text-[11px]">
            <h2 className="text-[13px] font-bold text-[#0a3060]">Apps</h2>
            <ul className="space-y-1">
              <li><b>Lifestyle</b> — Shop the latest drop.</li>
              <li><b>Cart</b> — Items you’ve added.</li>
              <li><b>Gallery</b> — Lookbook & visual content.</li>
              <li><b>About Us</b> · <b>Contact Us</b> — Info pages.</li>
              <li><b>Settings</b> — Change preferences.</li>
            </ul>
          </div>
        )}

        {topic === 'shortcuts' && (
          <div className="space-y-2">
            <h2 className="text-[13px] font-bold text-[#0a3060]">Desktop Shortcuts</h2>
            <p className="text-[11px] text-[#4a5878]">
              These keyboard shortcuts work on the desktop version.
            </p>
            <table className="text-left text-[11px]">
              <tbody>
                {[
                  ['Ctrl + K', 'Open quick search'],
                  ['Esc', 'Close search / start menu'],
                  ['↑ / ↓ (Terminal)', 'Command history'],
                ].map(([k, d]) => (
                  <tr key={k}>
                    <td className="pr-3 py-1">
                      <kbd
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                        style={{ background: '#f0f3f8', border: '1px solid #6896d2' }}
                      >
                        {k}
                      </kbd>
                    </td>
                    <td className="text-[#4a5878]">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {topic === 'support' && (
          <div className="space-y-2">
            <h2 className="text-[13px] font-bold text-[#0a3060]">Support</h2>
            <p className="text-[11px]">
              Need help? Open <b>Contact Us</b> from the Menu.
            </p>
            <p className="text-[11px] text-[#4a5878]">
              For shipping & order issues, include your order ID.
            </p>
            <button
              onClick={() => {
                popNokia();
                pushNokia({ kind: 'app', appId: 'contact' });
              }}
              className="mt-2 px-4 py-1.5 text-[11px] text-gray-900 rounded-sm"
              style={{
                background: '#ece9d8',
                border: '1px solid #777',
                boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
              }}
            >
              Open Contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
