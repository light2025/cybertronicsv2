'use client';

import { useState } from 'react';
import { Save, Trash2, FileText } from 'lucide-react';
import { safeLocalGet, safeLocalSet, safeLocalRemove } from '@/lib/storage';

const STORAGE_KEY = 'cybertronics:notepad';

const MENUBAR_STYLE = {
  background: '#ece9d8',
  borderBottom: '1px solid #aaa',
};

export default function Notepad() {
  const [text, setText] = useState(() => safeLocalGet<string>(STORAGE_KEY, ''));
  const [saved, setSaved] = useState(true);
  const [flash, setFlash] = useState('');

  const save = () => {
    safeLocalSet(STORAGE_KEY, text);
    setSaved(true);
    setFlash('Saved.');
    setTimeout(() => setFlash(''), 1500);
  };

  const clear = () => {
    setText('');
    safeLocalRemove(STORAGE_KEY);
    setSaved(true);
    setFlash('Cleared.');
    setTimeout(() => setFlash(''), 1500);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#fff' }}>
      {/* Menu bar */}
      <div
        className="flex items-center gap-0.5 px-1 py-0.5 shrink-0"
        style={MENUBAR_STYLE}
      >
        <button
          onClick={save}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] hover:bg-[#316ac5] hover:text-white rounded"
          title="Save"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
        <button
          onClick={clear}
          className="flex items-center gap-1 px-2 py-0.5 text-[11px] hover:bg-[#316ac5] hover:text-white rounded"
          title="Clear"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1 text-[10px] text-gray-500 pr-2">
          <FileText className="w-3 h-3" />
          {flash || (saved ? 'Saved' : 'Unsaved changes')}
        </div>
      </div>

      {/* Text area */}
      <textarea
        className="flex-1 resize-none p-2 text-[12px] font-mono text-gray-900 focus:outline-none leading-relaxed"
        style={{ background: '#fff', border: 'none' }}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            save();
          }
        }}
        placeholder="Start typing... (Ctrl+S to save)"
        spellCheck={false}
      />

      {/* Status bar */}
      <div
        className="flex items-center px-2 py-0.5 text-[10px] text-gray-500 shrink-0"
        style={{ background: '#ece9d8', borderTop: '1px solid #aaa' }}
      >
        <span>{text.length} chars</span>
        <span className="mx-2 opacity-40">|</span>
        <span>{text.split('\n').length} lines</span>
      </div>
    </div>
  );
}
