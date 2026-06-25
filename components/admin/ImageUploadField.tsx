/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState } from 'react';
import {
  Plus, X, Image as ImageIcon, ChevronUp, ChevronDown, Star, Upload, Loader2,
} from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { uploadProductImage } from '@/lib/supabase/storage';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
  primaryIndex?: number;
  onPrimaryChange?: (index: number) => void;
};

const DEFAULT_MAX = 10;

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function ImageUploadField({
  value,
  onChange,
  label = 'Images',
  max = DEFAULT_MAX,
  primaryIndex = 0,
  onPrimaryChange,
}: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseActive = isSupabaseConfigured();
  const effectivePrimary = Math.min(primaryIndex, Math.max(0, value.length - 1));

  const add = () => {
    const url = draft.trim();
    if (!url) return;
    if (value.includes(url)) {
      setError('That URL is already in the list.');
      return;
    }
    if (value.length >= max) {
      setError(`You can add up to ${max} images.`);
      return;
    }
    onChange([...value, url]);
    setDraft('');
    setError('');
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (value.length >= max) {
      setError(`You can add up to ${max} images.`);
      return;
    }
    if (!supabaseActive) {
      setError('File upload needs Supabase configured. Use a URL below for now.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      onChange([...value, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
    if (onPrimaryChange && i === effectivePrimary && value.length > 1) {
      onPrimaryChange(Math.max(0, effectivePrimary - 1));
    } else if (onPrimaryChange && i < effectivePrimary) {
      onPrimaryChange(effectivePrimary - 1);
    }
  };
  const moveUp = (i: number) => onChange(move(value, i, i - 1));
  const moveDown = (i: number) => onChange(move(value, i, i + 1));
  const makePrimary = (i: number) => {
    if (onPrimaryChange) {
      onPrimaryChange(i);
    } else {
      onChange(move(value, i, 0));
    }
  };

  const atCap = value.length >= max;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="block text-[12px] font-medium text-gray-700">{label}</span>
          <span className={`text-[11px] ${atCap ? 'text-amber-600 font-semibold' : 'text-gray-500'}`}>
            {value.length} / {max}
          </span>
        </div>
      )}

      {/* Upload-from-disk row (Supabase Storage when configured). */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
        <Button
          variant="secondary"
          size="md"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={atCap || uploading || !supabaseActive}
          title={supabaseActive ? 'Upload an image file' : 'Configure Supabase to enable file uploads'}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload file'}
        </Button>
        <span className="text-[11px] text-gray-500">
          {supabaseActive
            ? 'JPG / PNG / WebP / GIF, up to 4MB. Stored in Supabase Storage.'
            : 'File upload disabled — Supabase not configured. Paste a URL below.'}
        </span>
      </div>

      {/* URL fallback row. */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={draft}
            onChange={(e) => { setDraft(e.target.value); if (error) setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="https://example.com/image.jpg"
            hint={supabaseActive ? 'Or paste an external image URL.' : undefined}
            error={error || undefined}
          />
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={add}
          type="button"
          className="shrink-0"
          disabled={atCap}
        >
          <Plus className="w-4 h-4" />
          Add URL
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((url, i) => {
            const isPrimary = i === effectivePrimary;
            return (
              <div
                key={`${url}-${i}`}
                className="relative group"
                style={{ width: 88, height: 88 }}
              >
                {url ? (
                  <img
                    src={url}
                    alt={`Image ${i + 1}`}
                    className={`w-full h-full object-cover rounded-lg ${
                      isPrimary ? 'border-2 border-cyber' : 'border border-gray-200'
                    }`}
                  />
                ) : (
                  <div className="w-full h-full rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                {isPrimary && (
                  <div className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1.5 h-4 rounded text-[9px] font-bold bg-cyber text-white">
                    <Star className="w-2.5 h-2.5" strokeWidth={3} />
                    HERO
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>

                <div className="absolute bottom-0 inset-x-0 flex items-stretch justify-between bg-black/65 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="px-1 py-0.5 text-white disabled:opacity-30 hover:bg-white/15"
                    aria-label="Move earlier"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <span className="text-[9px] text-white px-1 grid place-items-center font-mono">
                    #{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === value.length - 1}
                    className="px-1 py-0.5 text-white disabled:opacity-30 hover:bg-white/15"
                    aria-label="Move later"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => makePrimary(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 text-cyber-dark hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Set as hero image"
                    aria-label="Make hero image"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {value.length === 0 && (
        <p className="text-[11px] text-gray-400">
          No images added yet. The first image becomes the primary thumbnail.
        </p>
      )}
    </div>
  );
}
