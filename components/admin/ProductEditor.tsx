'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Save, ArrowLeft } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { uid, slugify, nowIso, formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import ImageUploadField from '@/components/admin/ImageUploadField';
import type { Product, StockStatus } from '@/types';

type Props = { productId: string };

type FormState = {
  title: string;
  slug: string;
  description: string;
  category: string;
  groupId: string;
  price: string;
  discountPrice: string;
  images: string[];
  videoUrl: string;
  tags: string;
  stockStatus: StockStatus;
  isFeatured: boolean;
  availableSizes: string;
  availableColors: string;
};

const EMPTY: FormState = {
  title: '', slug: '', description: '', category: '', groupId: '',
  price: '', discountPrice: '', images: [], videoUrl: '',
  tags: '', stockStatus: 'in_stock', isFeatured: false,
  availableSizes: '', availableColors: '',
};

function toForm(p: Product): FormState {
  return {
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category,
    groupId: p.groupId ?? '',
    price: String(p.price),
    discountPrice: p.discountPrice != null ? String(p.discountPrice) : '',
    images: p.images,
    videoUrl: p.videoUrl ?? '',
    tags: p.tags.join(', '),
    stockStatus: p.stockStatus,
    isFeatured: p.isFeatured,
    availableSizes: p.availableSizes?.join(', ') ?? '',
    availableColors: p.availableColors?.join(', ') ?? '',
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
  const products = useDataStore((s) => s.products);
  const categories = useDataStore((s) => s.categories);
  const groups = useDataStore((s) => s.groups);
  const addProduct = useDataStore((s) => s.addProduct);
  const updateProduct = useDataStore((s) => s.updateProduct);
  const deleteProduct = useDataStore((s) => s.deleteProduct);
  const hydrated = useHydrated();

  const isNew = productId === 'new';
  const existing = isNew ? undefined : products.find((p) => p.id === productId);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugDirty, setSlugDirty] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(toForm(existing));
      setSlugDirty(true);
    }
  }, [hydrated, productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (key: keyof FormState, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setTitle = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugDirty ? f.slug : slugify(title) }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.slug.trim()) e.slug = 'Required';
    if (!form.category) e.category = 'Required';
    const p = parseFloat(form.price);
    if (isNaN(p) || p < 0) e.price = 'Enter a valid price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const now = nowIso();
    const priceVal = parseFloat(form.price);
    const discountVal = form.discountPrice.trim() ? parseFloat(form.discountPrice) : null;
    const tagsArr = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const sizesArr = form.availableSizes.split(',').map((t) => t.trim()).filter(Boolean);
    const colorsArr = form.availableColors.split(',').map((t) => t.trim()).filter(Boolean);

    if (isNew) {
      addProduct({
        id: uid(),
        title: form.title,
        slug: form.slug,
        description: form.description,
        category: form.category,
        groupId: form.groupId || null,
        price: priceVal,
        discountPrice: discountVal,
        currency: 'AED',
        images: form.images,
        videoUrl: form.videoUrl.trim() || null,
        tags: tagsArr,
        stockStatus: form.stockStatus,
        isFeatured: form.isFeatured,
        availableSizes: sizesArr.length > 0 ? sizesArr : undefined,
        availableColors: colorsArr.length > 0 ? colorsArr : undefined,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      updateProduct(productId, {
        title: form.title,
        slug: form.slug,
        description: form.description,
        category: form.category,
        groupId: form.groupId || null,
        price: priceVal,
        discountPrice: discountVal,
        images: form.images,
        videoUrl: form.videoUrl.trim() || null,
        tags: tagsArr,
        stockStatus: form.stockStatus,
        isFeatured: form.isFeatured,
        availableSizes: sizesArr.length > 0 ? sizesArr : undefined,
        availableColors: colorsArr.length > 0 ? colorsArr : undefined,
      });
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

      {/* Section 1: Basic info */}
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

      {/* Section 2: Classification */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Classification</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-[12px] font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </span>
            <select
              value={form.category}
              onChange={(e) => patch('category', e.target.value)}
              className={SELECT_CLS + (errors.category ? ' border-red-400' : '')}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.title}</option>
              ))}
            </select>
            {errors.category && <span className="block text-[11px] text-red-600 mt-1">{errors.category}</span>}
          </label>

          <label className="block">
            <span className="block text-[12px] font-medium text-gray-700 mb-1">Group</span>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => patch('isFeatured', e.target.checked)}
                className="w-4 h-4 accent-cyber rounded"
              />
              <span className="text-[13px] text-gray-700 font-medium">Featured</span>
            </label>
          </div>
        </div>
      </section>

      {/* Section 3: Pricing */}
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

      {/* Section 4: Images */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide mb-4">Images</h2>
        <ImageUploadField
          value={form.images}
          onChange={(urls) => patch('images', urls)}
          label=""
        />
      </section>

      {/* Section 5: Media & Tags */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">Media & Tags</h2>
        <Input
          label="Video URL"
          value={form.videoUrl}
          onChange={(e) => patch('videoUrl', e.target.value)}
          placeholder="https://…"
          hint="Optional. TODO: Supabase Storage"
        />
        <Input
          label="Tags"
          value={form.tags}
          onChange={(e) => patch('tags', e.target.value)}
          placeholder="tshirt, graphic, drop001"
          hint="Comma-separated"
        />
      </section>

      {/* Section 6: Variants */}
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
