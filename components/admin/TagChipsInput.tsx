'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  label: string;
  placeholder?: string;
  hint?: string;
};

export default function TagChipsInput({ value, onChange, label, placeholder, hint }: Props) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...value, v]);
    setDraft('');
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-gray-700 mb-1">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-cyber/30 focus-within:border-cyber min-h-[38px]">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyber/10 text-cyber-dark text-[12px] rounded-md font-medium"
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              className="hover:text-red-600"
              aria-label={`Remove ${t}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder ?? 'Type and press Enter…' : ''}
          className="flex-1 min-w-[120px] text-[13px] text-gray-900 placeholder:text-gray-400 px-1 py-0.5 bg-transparent focus:outline-none"
        />
      </div>
      {hint && <span className="block text-[11px] text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}
