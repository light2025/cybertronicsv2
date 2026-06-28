/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Star, Upload, Loader2, Film } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { uploadProductMedia, mediaKind } from '@/lib/supabase/storage';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
  primaryIndex?: number;
  onPrimaryChange?: (index: number) => void;
};

const DEFAULT_MAX = 12;

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
}

export default function ImageUploadField({
  value,
  onChange,
  label = 'Media',
  max = DEFAULT_MAX,
  primaryIndex = 0,
  onPrimaryChange,
}: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseActive = isSupabaseConfigured();
  const effectivePrimary = Math.min(primaryIndex, Math.max(0, value.length - 1));
  const atCap = value.length >= max;

  const add = () => {
    const url = draft.trim();
    if (!url) return;
    if (value.includes(url)) { setError('URL already added.'); return; }
    if (atCap) { setError(`Max ${max} items.`); return; }
    onChange([...value, url]);
    setDraft('');
    setError('');
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!supabaseActive) { setError('Configure Supabase to enable uploads.'); return; }

    const slots = max - value.length;
    if (slots <= 0) { setError(`Max ${max} items reached.`); return; }

    const toUpload = Array.from(files).slice(0, slots);
    setError('');
    setUploading(true);
    const results: string[] = [];

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      setUploadProgress(`Uploading ${i + 1}/${toUpload.length}…`);
      try {
        const { url, kind } = await uploadProductMedia(file);
        // Validate type matches declared kind
        const detected = mediaKind(file.type);
        if (detected !== kind) console.warn('Kind mismatch', file.type, kind);
        results.push(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed.');
        break;
      }
    }

    if (results.length) onChange([...value, ...results]);
    setUploading(false);
    setUploadProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
    if (onPrimaryChange) {
      if (i === effectivePrimary && value.length > 1) onPrimaryChange(Math.max(0, effectivePrimary - 1));
      else if (i < effectivePrimary) onPrimaryChange(effectivePrimary - 1);
    }
  };

  const moveLeft  = (i: number) => onChange(move(value, i, i - 1));
  const moveRight = (i: number) => onChange(move(value, i, i + 1));

  const makePrimary = (i: number) => {
    if (onPrimaryChange) onPrimaryChange(i);
    else onChange(move(value, i, 0));
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <span className="block text-[12px] font-medium text-gray-700">{label}</span>
          <span className={`text-[11px] ${atCap ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
            {value.length} / {max}
          </span>
        </div>
      )}

      {/* Upload row */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <Button
          variant="secondary"
          size="md"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={atCap || uploading || !supabaseActive}
          title={supabaseActive ? 'Upload images or videos' : 'Configure Supabase to enable uploads'}
        >
          {uploading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Upload className="w-4 h-4" />}
          {uploading ? uploadProgress : 'Upload files'}
        </Button>
        <span className="text-[11px] text-gray-400">
          {supabaseActive
            ? 'Images (JPG/PNG/WebP/GIF ≤4MB) · Videos (MP4/WebM ≤100MB) · multi-select OK'
            : 'Supabase not configured — paste URLs below.'}
        </span>
      </div>

      {/* URL fallback */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={draft}
            onChange={(e) => { setDraft(e.target.value); if (error) setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
            placeholder="https://… (image or video URL)"
            error={error || undefined}
          />
        </div>
        <Button variant="secondary" size="md" onClick={add} type="button" className="shrink-0" disabled={atCap}>
          Add URL
        </Button>
      </div>

      {/* Media grid */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((url, i) => {
            const isPrimary = i === effectivePrimary;
            const vid = isVideo(url);
            return (
              <div key={`${url}-${i}`} className="relative group" style={{ width: 96, height: 96 }}>
                {vid ? (
                  <video
                    src={url}
                    className={`w-full h-full object-cover rounded-lg ${
                      isPrimary ? 'border-2 border-cyber' : 'border border-gray-200'
                    }`}
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Media ${i + 1}`}
                    className={`w-full h-full object-cover rounded-lg ${
                      isPrimary ? 'border-2 border-cyber' : 'border border-gray-200'
                    }`}
                  />
                )}

                {/* Video badge */}
                {vid && (
                  <div className="absolute bottom-7 left-1 bg-black/60 rounded px-1 py-0.5">
                    <Film className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Hero badge */}
                {isPrimary && (
                  <div className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1.5 h-4 rounded text-[9px] font-bold bg-cyber text-white">
                    <Star className="w-2.5 h-2.5" strokeWidth={3} />
                    HERO
                  </div>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  aria-label="Remove"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Move left / index / move right */}
                <div className="absolute bottom-0 inset-x-0 flex items-stretch justify-between bg-black/65 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveLeft(i)}
                    disabled={i === 0}
                    className="px-1 py-0.5 text-white disabled:opacity-30 hover:bg-white/15"
                    aria-label="Move left"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="text-[9px] text-white px-1 grid place-items-center font-mono">
                    #{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveRight(i)}
                    disabled={i === value.length - 1}
                    className="px-1 py-0.5 text-white disabled:opacity-30 hover:bg-white/15"
                    aria-label="Move right"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Set hero */}
                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => makePrimary(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 text-cyber-dark hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Set as hero"
                    aria-label="Set as hero"
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
          No media yet. First image becomes the hero thumbnail.
        </p>
      )}
    </div>
  );
}
