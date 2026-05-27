'use client';

import { useState } from 'react';
import { safeLocalGet, safeLocalSet, safeLocalRemove } from '@/lib/storage';

const STORAGE_KEY = 'cybertronics:notepad';

export default function MobileNotes() {
  // Lazy init: MobileNotes only mounts post-user-interaction (after Menu tap),
  // never during SSR, so reading localStorage during init is safe.
  const [text, setText] = useState(() => safeLocalGet<string>(STORAGE_KEY, ''));
  const [saved, setSaved] = useState(true);
  const [flash, setFlash] = useState('');

  const save = () => {
    safeLocalSet(STORAGE_KEY, text);
    setSaved(true);
    setFlash('Saved');
    window.setTimeout(() => setFlash(''), 1500);
  };

  const clear = () => {
    setText('');
    safeLocalRemove(STORAGE_KEY);
    setSaved(true);
    setFlash('Cleared');
    window.setTimeout(() => setFlash(''), 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      <div
        className="flex items-center justify-between px-2 py-1 text-[11px] shrink-0"
        style={{ background: '#dce8f8', borderBottom: '1px solid #6896d2' }}
      >
        <span className="text-[#0a3060] font-bold">{flash || (saved ? 'Saved · synced with Notepad' : 'Editing…')}</span>
        <div className="flex gap-1">
          <button
            onClick={save}
            className="px-2 py-0.5 text-[11px] rounded-sm text-gray-900"
            style={{ background: '#ece9d8', border: '1px solid #777' }}
          >
            Save
          </button>
          <button
            onClick={clear}
            className="px-2 py-0.5 text-[11px] rounded-sm text-gray-900"
            style={{ background: '#ece9d8', border: '1px solid #777' }}
          >
            Clear
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        onBlur={save}
        placeholder="Start typing… auto-saves on blur. Shared with desktop Notepad."
        className="flex-1 p-3 text-[12px] font-mono text-gray-900 focus:outline-none resize-none"
        style={{ background: '#fffef8' }}
        spellCheck={false}
      />
      <div
        className="px-2 py-1 text-[10px] text-[#4a5878] shrink-0"
        style={{ background: '#dce8f8', borderTop: '1px solid #6896d2' }}
      >
        {text.length} chars · {text.split('\n').length} lines
      </div>
    </div>
  );
}
