'use client';

import { useIE } from './IEContext';

export default function IENotFound({ url }: { url: string }) {
  const ie = useIE();
  return (
    <div className="p-8 bg-white">
      <h2 className="text-[14px] font-bold mb-2" style={{ color: '#c44030' }}>
        The page cannot be displayed
      </h2>
      <p className="text-[12px] text-gray-700 mb-1">
        Internet Explorer could not navigate to the address you requested.
      </p>
      <p className="text-[11px] font-mono text-gray-500 mb-4 break-all">{url}</p>
      <div className="border-t border-gray-300 pt-3 space-y-2 text-[11px] text-gray-700">
        <p className="font-bold">Try the following:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Check the address bar for typos.</li>
          <li>
            Return to the{' '}
            <button
              onClick={() => ie?.navigate('cybertronics://')}
              className="hover:underline"
              style={{ color: '#0050a0' }}
            >
              home page
            </button>{' '}
            and start fresh.
          </li>
          <li>
            Browse the{' '}
            <button
              onClick={() => ie?.navigate('cybertronics://shop')}
              className="hover:underline"
              style={{ color: '#0050a0' }}
            >
              shop
            </button>{' '}
            instead.
          </li>
        </ul>
      </div>
    </div>
  );
}
