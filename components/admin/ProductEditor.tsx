'use client';

import { useState, useEffect, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Save, ArrowLeft, X, Plus } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { uid, slugify, nowIso, formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageUploadField from '@/components/admin/ImageUploadField';
import TagChipsInput from '@/components/admin/TagChipsInput';
import type { Product, StockStatus } from '@/types';

type Props = { productId: string };

type FormState = {
  title: string;
  slug: string;
  description: string;
  category: string;
  subCategory: string;
  groupId: string;
  customGroups: string[];
  price: string;
  discountPrice: string;
  images: string[];
  videos: string[];
  tags: string;
  seoTags: string[];
  stockStatus: StockStatus;
  stockCount: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSelling: boolean;
  availableSizes: string;
  availableColors: string;
  barcode: string;
};

const EMPTY: FormState = {
  title: '', slug: '', description: '', category: '', subCategory: '',
  groupId: '', customGroups: [], price: '', discountPrice: '',
  images: [], videos: [], tags: '', seoTags: [],
  stockStatus: 'in_stock', stockCount: '0',
  isFeatured: false, isNewArrival: false, isBestSelling: false,
  availableSizes: '', availableColors: '', barcode: '',
};

function toForm(p: Product): FormState {
  return {
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category,
    subCategory: p.subCategory ?? '',
    groupId: p.groupId ?? '',
    customGroups: p.customGroups ?? [],
    price: String(p.price),
    discountPrice: p.discountPrice != null ? String(p.discountPrice) : '',
    images: p.images,
    videos: p.videos ?? (p.videoUrl ? [p.videoUrl] : []),
    tags: p.tags.join(', '),
    seoTags: p.seoTags ?? [],
    stockStatus: p.stockStatus,
    stockCount: String(p.stockCount ?? 0),
    isFeatured: p.isFeatured,
    isNewArrival: p.isNewArrival ?? false,
    isBestSelling: p.isBestSelling ?? false,
    availableSizes: p.availableSizes?.join(', ') ?? '',
    availableColors: p.availableColors?.join(', ') ?? '',
    barcode: p.barcode ?? '',
  };
}

const STOCK_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'preorder', label: 'Pre-order' },
];

const SELECT_CLS =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyber/30 focus:border-cyber';

export default function ProductEditor({ productId }: Props) {
  const router = useRouter();
  const products      = useDataStore((s) => s.products);
  const categories    = useDataStore((s) => s.categories);
  const groups        = useDataStore((s) => s.groups);
  const customGroups  = useDataStore((s) => s.customGroups);
  const addProduct    = useDataStore((s) => s.addProduct);
  const updateProduct = useDataStore((s) => s.updateProduct);
  const deleteProduct = useDataStore((s) => s.deleteProduct);
  const hydrated      = useHydrated();

  const isNew = productId === 'new';
  const existing = isNew ? undefined : products.find((p) => p.id === productId);

  const [form, setForm]               = useState<FormState>(EMPTY);
  const [slugDirty, setSlugDirty]     = useState(false);
  const [errors, setErrors]           = useState<Partial<Record<keyof FormState, string>>>({});
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [videoDraft, setVideoDraft]   = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(toForm(existing));
      setSlugDirty(true);
    }
  }, [hydrated, productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setTitle = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugDirty ? f.slug : slugify(title) }));
  };

  const setCategory = (id: string) => {
    // Reset sub-category when parent changes — old sub may not belong to new parent.
    setForm((f) => ({ ...f, category: id, subCategory: '' }));
  };

  const toggleCustomGroup = (id: string) => {
    setForm((f) => ({
      ...f,
      customGroups: f.customGroups.includes(id)
        ? f.customGroups.filter((cg) => cg !== id)
        : [...f.customGroups, id],
    }));
  };

  const addVideo = () => {
    const url = videoDraft.trim();
    if (!url || form.videos.includes(url)) { setVideoDraft(''); return; }
    setForm((f) => ({ ...f, videos: [...f.videos, url] }));
    setVideoDraft('');
  };

  const removeVideo = (i: number) =>
    setForm((f) => ({ ...f, videos: f.videos.filter((_, idx) => idx !== i) }));

  const onVideoKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addVideo(); }
  };

  // Sub-categories filter to children of the chosen parent.
  const subCategories = categories.filter((c) => c.parentCategory === form.category);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.slug.trim()) e.slug = 'Required';
    if (!form.category) e.category = 'Required';
    const p = parseFloat(form.price);
    if (isNaN(p) || p < 0) e.price = 'Enter a valid price';
    const sc = parseInt(form.stockCount, 10);
    if (isNaN(sc) || sc < 0) e.stockCount = 'Enter 0 or more';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const now = nowIso();
    const priceVal      = parseFloat(form.price);
    const discountVal   = form.discountPrice.trim() ? parseFloat(form.discountPrice) : null;
    const stockCountVal = parseInt(form.stockCount, 10) || 0;
    const tagsArr       = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const sizesArr      = form.availableSizes.split(',').map((t) => t.trim()).filter(Boolean);
    const colorsArr     = form.availableColors.split(',').map((t) => t.trim()).filter(Boolean);

    const productPatch: Partial<Product> = {
      title: form.title,
      slug: form.slug,
      description: form.description,
      category: form.category,
      subCategory: form.subCategory || null,
      groupId: form.groupId || null,
      customGroups: form.customGroups,
      price: priceVal,
      discountPrice: discountVal,
      images: form.images,
      videos: form.videos,
      videoUrl: form.videos[0] ?? null,
      tags: tagsArr,
      seoTags: form.seoTags,
      stockStatus: form.stockStatus,
      stockCount: stockCountVal,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      isBestSelling: form.isBestSelling,
      availableSizes: sizesArr.length > 0 ? sizesArr : undefined,
      availableColors: colorsArr.length > 0 ? colorsArr : undefined,
      barcode: form.barcode.trim() || null,
    };

    if (isNew) {
      addProduct({
        id: uid(),
        currency: 'AED',
        createdAt: now,
        updatedAt: now,
        ...productPatch,
      } as Product);
    } else {
      updateProduct(productId, productPatch);
    }
    router.push('/admin/products');
  };

  const confirmDelete = () => {
    deleteProduct(productId);
    router.push('/admin/products');
  };

  if (hydrated && !isNew && !existing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-gray-500 text-[14px]">Product not found.</p>
        <Button variant="ghost" onClick={() => router.push('/admin/products')}>
          <ArrowLeft className="w-4 h-4" /> Back to products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-[18px] font-bold text-gray-900">
              {isNew ? 'New Product' : 'Edit Product'}
            </h1>
            {!isNew && existing && (
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">{existing.slug}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          )}
          <Button variant="primary" onClick={save}>
            <Save className="w-4 h-4" />
            {isNew ? 'Create product' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* 1. Basic info */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Basic Info</h2>
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="XP Boot Tee"
          error={errors.title}
        />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => { setSlugDirty(true); patch('slug', e.target.value); }}
          placeholder="xp-boot-tee"
          hint="Auto-generated from title. Used in URLs."
          error={errors.slug}
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => patch('description', e.target.value)}
          placeholder="Describe this product…"
          rows={3}
        />
      </section>

      {/* 2. Classification */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Classification</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-[12px] font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </span>
            <select
              value={form.category}
              onChange={(e) => setCategory(e.target.value)}
              className={SELECT_CLS + (errors.category ? ' border-red-400' : '')}
            >
              <option value="">Select category…</option>
              {categories.filter((c) => c.parentCategory === null).map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.title}</option>
              ))}
            </select>
            {errors.category && <span className="block text-[11px] text-red-600 mt-1">{errors.category}</span>}
          </label>

          <label className="block">
            <span className="block text-[12px] font-medium text-gray-700 mb-1">Sub-category</span>
            <select
              value={form.subCategory}
              onChange={(e) => patch('subCategory', e.target.value)}
              className={SELECT_CLS}
              disabled={subCategories.length === 0}
            >
              <option value="">{subCategories.length === 0 ? 'None available' : 'Optional'}</option>
              {subCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.title}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="block text-[12px] font-medium text-gray-700 mb-1">Group (Drop / Collection)</span>
          <select
            value={form.groupId}
            onChange={(e) => patch('groupId', e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">No group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </label>

        <div>
          <span className="block text-[12px] font-medium text-gray-700 mb-1.5">Custom Groups</span>
          {customGroups.length === 0 ? (
            <p className="text-[11px] text-gray-500">
              No custom groups yet. Create some in{' '}
              <a href="/admin/custom-groups" className="text-cyber-dark hover:underline">Custom Groups</a>.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customGroups.map((cg) => {
                const active = form.customGroups.includes(cg.id);
                return (
                  <button
                    key={cg.id}
                    type="button"
                    onClick={() => toggleCustomGroup(cg.id)}
                    className={`px-2.5 py-1 text-[12px] font-medium rounded-md border ${
                      active
                        ? 'bg-cyber/10 text-cyber-dark border-cyber-dark/40'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {cg.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. Flags */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Flags</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2.5">
          <FlagToggle
            checked={form.isFeatured}
            onChange={(v) => patch('isFeatured', v)}
            label="Featured"
          />
          <FlagToggle
            checked={form.isNewArrival}
            onChange={(v) => patch('isNewArrival', v)}
            label="New Arrival"
          />
          <FlagToggle
            checked={form.isBestSelling}
            onChange={(v) => patch('isBestSelling', v)}
            label="Best Selling"
          />
        </div>
      </section>

      {/* 4. Inventory */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Inventory</h2>
        <div className="grid grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-[12px] font-medium text-gray-700 mb-1">Stock Status</span>
            <select
              value={form.stockStatus}
              onChange={(e) => patch('stockStatus', e.target.value as StockStatus)}
              className={SELECT_CLS}
            >
              {STOCK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <Input
            label="Stock Count"
            type="number"
            min={0}
            step={1}
            value={form.stockCount}
            onChange={(e) => patch('stockCount', e.target.value)}
            placeholder="0"
            error={errors.stockCount}
            hint="Numeric on-hand quantity"
          />
          <Input
            label="Barcode"
            value={form.barcode}
            onChange={(e) => patch('barcode', e.target.value)}
            placeholder="CYB-001-2026"
            hint="For barcode scanner lookup"
          />
        </div>
      </section>

      {/* 5. Pricing */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Pricing (AED)</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price *"
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={(e) => patch('price', e.target.value)}
            placeholder="199"
            error={errors.price}
            hint={form.price ? formatPrice(parseFloat(form.price) || 0) : undefined}
          />
          <Input
            label="Discount Price"
            type="number"
            min={0}
            step={0.01}
            value={form.discountPrice}
            onChange={(e) => patch('discountPrice', e.target.value)}
            placeholder="Leave blank for no discount"
            hint={form.discountPrice ? formatPrice(parseFloat(form.discountPrice) || 0) : undefined}
          />
        </div>
      </section>

      {/* 6. Images */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide mb-4">Images</h2>
        <ImageUploadField
          value={form.images}
          onChange={(urls) => patch('images', urls)}
          label=""
          max={15}
        />
      </section>

      {/* 7. Videos */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Videos</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={videoDraft}
              onChange={(e) => setVideoDraft(e.target.value)}
              onKeyDown={onVideoKey}
              placeholder="https://example.com/clip.mp4 or YouTube URL"
              hint="Press Enter to add. TODO: Supabase Storage upload."
            />
          </div>
          <Button variant="secondary" onClick={addVideo} type="button" className="shrink-0">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        {form.videos.length > 0 && (
          <ul className="space-y-1.5">
            {form.videos.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <span className="text-[11px] font-mono text-gray-500 shrink-0">#{i + 1}</span>
                <span className="flex-1 text-[12px] text-gray-800 truncate">{url}</span>
                <button
                  type="button"
                  onClick={() => removeVideo(i)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label={`Remove video ${i + 1}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {form.videos.length === 0 && (
          <p className="text-[11px] text-gray-400">No videos added yet.</p>
        )}
      </section>

      {/* 8. Tags & SEO */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Tags &amp; SEO</h2>
        <Input
          label="Public Tags"
          value={form.tags}
          onChange={(e) => patch('tags', e.target.value)}
          placeholder="tshirt, graphic, drop001"
          hint="Comma-separated. Visible to customers on the product page."
        />
        <TagChipsInput
          value={form.seoTags}
          onChange={(next) => patch('seoTags', next)}
          label="Search Tags (hidden)"
          placeholder="Add a search term and press Enter…"
          hint="Powers product search. Never shown to customers — use synonyms, misspellings, related terms."
        />
      </section>

      {/* 9. Variants */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Variants</h2>
        <Input
          label="Available Sizes"
          value={form.availableSizes}
          onChange={(e) => patch('availableSizes', e.target.value)}
          placeholder="XS, S, M, L, XL, XXL"
          hint="Comma-separated. Leave blank for one-size-fits-all items."
        />
        <Input
          label="Available Colors"
          value={form.availableColors}
          onChange={(e) => patch('availableColors', e.target.value)}
          placeholder="Black, Off-White, Luna Blue"
          hint="Comma-separated. Leave blank if the product has only one color."
        />
      </section>

      {/* Bottom actions */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="ghost" onClick={() => router.push('/admin/products')}>Cancel</Button>
        <Button variant="primary" onClick={save}>
          <Save className="w-4 h-4" />
          {isNew ? 'Create product' : 'Save changes'}
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete product?"
        message={`Permanently delete "${form.title || existing?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

function FlagToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-cyber rounded"
      />
      <span className="text-[13px] text-gray-700 font-medium">{label}</span>
    </label>
  );
}
