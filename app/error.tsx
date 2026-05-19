'use client';

import { useEffect } from 'react';

const TITLEBAR =
  'linear-gradient(to bottom, #98c8f8 0%, #98c8f8 2%, #4a90e0 3%, #1e60c8 10%, #1050b0 50%, #1050b0 52%, #1a60c8 56%, #2870d0 100%)';

const BTN_STYLE = {
  background: '#ece9d8',
  border: '1px solid #777',
  boxShadow: 'inset 0 1px 0 #fff, inset 0 -1px 0 #999',
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Cybertronics OS fault]', error);
  }, [error]);

  return (
    <main
      className="h-screen w-screen flex items-center justify-center font-xp"
      style={{ background: '#008080' }}
    >
      <div
        className="w-[min(460px,92vw)] flex flex-col"
        style={{
          border: '2px solid #3a6ea5',
          outline: '1px solid #0a246a',
          boxShadow: '0 0 0 1px #0a246a, 4px 6px 18px rgba(0,0,0,0.55)',
          borderRadius: '6px 6px 2px 2px',
          background: '#ece9d8',
          overflow: 'hidden',
        }}
      >
        <header
          className="flex items-center px-2 shrink-0"
          style={{ height: 22, background: TITLEBAR, borderRadius: '4px 4px 0 0' }}
        >
          <span
            className="text-white text-[11px] font-bold"
            style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}
          >
            Cybertronics OS — System Fault
          </span>
        </header>

        <div className="p-5 flex gap-4 items-start bg-[#ece9d8]">
          <span
            className="w-10 h-10 rounded-full grid place-items-center text-white text-[18px] font-bold shrink-0"
            style={{ background: '#c44030', border: '2px solid #882010' }}
          >
            ×
          </span>
          <div className="flex-1 text-[12px] text-gray-900 leading-relaxed">
            <p className="font-bold mb-2">Cybertronics OS has encountered a fault.</p>
            <p className="text-gray-700 mb-2">
              An unexpected error has occurred. Try restarting the workspace.
            </p>
            <p className="text-[10px] text-gray-500 font-mono break-words">
              {error.message || 'Unknown error'}
              {error.digest && ` · ${error.digest}`}
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-end px-3 py-2 gap-2 shrink-0"
          style={{ background: '#ece9d8', borderTop: '1px solid #aaa' }}
        >
          <button
            onClick={reset}
            className="px-4 py-1 text-[11px] text-gray-900 rounded-sm"
            style={BTN_STYLE}
          >
            Restart
          </button>
        </div>
      </div>
    </main>
  );
}
