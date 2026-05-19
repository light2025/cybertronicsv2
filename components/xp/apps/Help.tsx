'use client';

import { useState } from 'react';

type Section = 'getting-started' | 'apps' | 'shortcuts' | 'support';

const SECTIONS: { id: Section; title: string }[] = [
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'apps', title: 'Apps & Folders' },
  { id: 'shortcuts', title: 'Keyboard Shortcuts' },
  { id: 'support', title: 'Support' },
];

export default function Help() {
  const [section, setSection] = useState<Section>('getting-started');

  return (
    <div className="flex h-full" style={{ background: '#ece9d8' }}>
      {/* Index */}
      <div
        className="w-44 shrink-0 overflow-y-auto p-2 flex flex-col gap-1"
        style={{ background: '#dce8f8', borderRight: '1px solid #6896d2' }}
      >
        <div className="text-[10px] uppercase tracking-wide text-[#1a3060] font-bold px-1 mb-1">
          Help Topics
        </div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className="text-left px-2 py-1 text-[11px] rounded-sm"
            style={{
              background: section === s.id ? '#316ac5' : 'transparent',
              color: section === s.id ? '#fff' : '#1a3060',
              fontWeight: section === s.id ? 700 : 500,
            }}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 bg-white text-[12px] text-gray-800 leading-relaxed">
        {section === 'getting-started' && (
          <div className="space-y-3">
            <h1 className="text-[16px] font-bold text-[#0a246a]">Welcome to Cybertronics OS</h1>
            <p>
              This is an XP-themed storefront. You can browse products, customize your
              workspace, and explore.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><b>Double-click</b> a desktop icon to open it.</li>
              <li>Drag a window by its <b>titlebar</b> to move it.</li>
              <li>Click the <b>start</b> button (bottom-left) to see all apps.</li>
              <li>Press <kbd className="px-1 border rounded text-[10px]">Ctrl+K</kbd> to search.</li>
            </ul>
          </div>
        )}

        {section === 'apps' && (
          <div className="space-y-2">
            <h1 className="text-[16px] font-bold text-[#0a246a]">Apps</h1>
            <ul className="space-y-1.5">
              <li><b>My Computer</b> — browse all sections.</li>
              <li><b>Lifestyle</b> — shop the latest drop.</li>
              <li><b>Gallery</b> — lookbook & visual content.</li>
              <li><b>Terminal</b> — command-line access (try <code>help</code>).</li>
              <li><b>Settings</b> — change wallpaper.</li>
              <li><b>About Us</b> · <b>Contact Us</b> — info pages.</li>
            </ul>
          </div>
        )}

        {section === 'shortcuts' && (
          <div className="space-y-3">
            <h1 className="text-[16px] font-bold text-[#0a246a]">Keyboard Shortcuts</h1>
            <table className="text-left">
              <tbody>
                {[
                  ['Ctrl + K', 'Open quick search'],
                  ['Esc', 'Close search / start menu'],
                  ['↑ / ↓ (in Terminal)', 'Cycle through history'],
                ].map(([k, d]) => (
                  <tr key={k}>
                    <td className="pr-4 py-1">
                      <kbd className="px-1.5 py-0.5 border border-gray-400 rounded text-[10px] bg-gray-100 font-mono">
                        {k}
                      </kbd>
                    </td>
                    <td className="text-gray-700">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section === 'support' && (
          <div className="space-y-2">
            <h1 className="text-[16px] font-bold text-[#0a246a]">Support</h1>
            <p>Need help? Open <b>Contact Us</b> from the desktop or Start menu.</p>
            <p className="text-gray-600 text-[11px]">
              For shipping & order issues, please include your order ID.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
