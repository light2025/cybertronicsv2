/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
};

export default function ImageUploadField({ value, onChange, label = 'Images' }: Props) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const url = draft.trim();
    if (!url || value.includes(url)) return;
    onChange([...value, url]);
    setDraft('');
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  return (
    <div className="space-y-2">
      <span className="block text-[12px] font-medium text-gray-700">{label}</span>

      {/* URL input row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="https://example.com/image.jpg"
            hint="TODO: replace with file upload (Supabase Storage)"
          />
        </div>
        <Button variant="secondary" size="md" onClick={add} type="button" className="shrink-0">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((url, i) => (
            <div
              key={url}
              className="relative group"
              style={{ width: 72, height: 72 }}
            >
              {url ? (
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-full rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 inset-x-0 text-center text-[8px] text-white bg-black/50 rounded-b-lg py-0.5 opacity-0 group-hover:opacity-100 truncate px-0.5">
                #{i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <p className="text-[11px] text-gray-400">No images added yet.</p>
      )}
    </div>
  );
}
