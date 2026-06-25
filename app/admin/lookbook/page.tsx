/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { uid } from '@/lib/utils';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { uploadProductImage } from '@/lib/supabase/storage';
import type { LookbookImage } from '@/lib/data/lookbookImages';

const CATEGORIES = ['lifestyle', 'outfit', 'campaign', 'behind-the-scenes'] as const;

export default function LookbookPage() {
  const lookbookImages = useDataStore((s) => s.lookbookImages);
  const addLookbookImage = useDataStore((s) => s.addLookbookImage);
  // Reserved for future edit functionality
  const _updateLookbookImage = useDataStore((s) => s.updateLookbookImage);
  void _updateLookbookImage;
  const deleteLookbookImage = useDataStore((s) => s.deleteLookbookImage);
  const hydrated = useHydrated();

  const [deleteTarget, setDeleteTarget] = useState<LookbookImage | null>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [captionDraft, setCaptionDraft] = useState('');
  const [categoryDraft, setCategoryDraft] = useState<LookbookImage['category']>('lifestyle');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseActive = isSupabaseConfigured();

  const addFromUrl = () => {
    const url = urlDraft.trim();
    if (!url) { setError('URL is required.'); return; }
    if (lookbookImages.some((img) => img.url === url)) {
      setError('This image URL already exists.'); return;
    }
    addLookbookImage({
      id: uid(),
      url,
      caption: captionDraft.trim() || undefined,
      category: categoryDraft,
    });
    setUrlDraft('');
    setCaptionDraft('');
    setError('');
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!supabaseActive) {
      setError('File upload needs Supabase configured. Use a URL below for now.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      addLookbookImage({
        id: uid(),
        url,
        caption: captionDraft.trim() || undefined,
        category: categoryDraft,
      });
      setCaptionDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Lookbook Gallery</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Curated lifestyle and promotional images separate from product photos.
            These appear in the Gallery app&apos;s Lookbook mode.
          </p>
        </div>
      </div>

      {/* Add new image section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Add New Image</h2>

        {error && <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        {/* Upload row */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !supabaseActive}
            title={supabaseActive ? 'Upload an image file' : 'Configure Supabase to enable file uploads'}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading…' : 'Upload file'}
          </Button>
          <span className="text-[11px] text-gray-500">
            {supabaseActive
              ? 'JPG / PNG / WebP / GIF, up to 4MB.'
              : 'File upload disabled — Supabase not configured.'}
          </span>
        </div>

        {/* URL input row */}
        <div className="grid grid-cols-[1fr,auto] gap-3">
          <Input
            label="Image URL"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://example.com/lookbook-1.jpg"
            hint="Paste an external image URL"
          />
          <div className="flex items-end">
            <Button variant="primary" onClick={addFromUrl}>
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Caption (optional)"
            value={captionDraft}
            onChange={(e) => setCaptionDraft(e.target.value)}
            placeholder="Spring Collection 2026"
          />
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryDraft}
              onChange={(e) => setCategoryDraft(e.target.value as LookbookImage['category'])}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyber/30 focus:border-cyber"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Image grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Images ({hydrated ? lookbookImages.length : 0})
        </h2>

        {!hydrated ? (
          <div className="text-[12px] text-gray-500">Loading…</div>
        ) : lookbookImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <ImageIcon className="w-10 h-10 mb-2" />
            <p className="text-[12px]">No lookbook images yet.</p>
            <p className="text-[11px]">Upload or add URLs above to build your gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {lookbookImages.map((img) => (
              <div
                key={img.id}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={img.url}
                  alt={img.caption || 'Lookbook image'}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with info */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeleteTarget(img)}
                      className="w-7 h-7 rounded-full bg-red-500 text-white grid place-items-center hover:bg-red-600"
                      aria-label="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-white">
                    {img.caption && (
                      <div className="text-[11px] font-medium truncate">{img.caption}</div>
                    )}
                    {img.category && (
                      <div className="text-[10px] opacity-70 capitalize">{img.category.replace(/-/g, ' ')}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteLookbookImage(deleteTarget.id)}
        title="Delete lookbook image?"
        message={`Delete this image${deleteTarget?.caption ? ` ("${deleteTarget.caption}")` : ''}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
