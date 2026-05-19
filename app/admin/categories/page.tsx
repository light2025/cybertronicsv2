'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { uid, slugify } from '@/lib/utils';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Category } from '@/types';

type CatForm = { title: string; slug: string; icon: string; parentCategory: string };
const EMPTY_FORM: CatForm = { title: '', slug: '', icon: '', parentCategory: '' };

export default function CategoriesPage() {
  const categories = useDataStore((s) => s.categories);
  const products = useDataStore((s) => s.products);
  const addCategory = useDataStore((s) => s.addCategory);
  const updateCategory = useDataStore((s) => s.updateCategory);
  const deleteCategory = useDataStore((s) => s.deleteCategory);
  const hydrated = useHydrated();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<CatForm>(EMPTY_FORM);
  const [slugDirty, setSlugDirty] = useState(false);
  const [error, setError] = useState('');

  const countFor = (cid: string) => products.filter((p) => p.category === cid).length;

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setSlugDirty(false);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditTarget(c);
    setForm({ title: c.title, slug: c.slug, icon: c.icon ?? '', parentCategory: c.parentCategory ?? '' });
    setSlugDirty(true);
    setError('');
    setModalOpen(true);
  };

  const setTitle = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugDirty ? f.slug : slugify(title) }));
  };

  const save = () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.slug.trim()) { setError('Slug is required.'); return; }

    if (editTarget) {
      updateCategory(editTarget.id, {
        title: form.title,
        slug: form.slug,
        icon: form.icon || null,
        parentCategory: form.parentCategory || null,
      });
    } else {
      addCategory({
        id: uid(),
        title: form.title,
        slug: form.slug,
        icon: form.icon || null,
        parentCategory: form.parentCategory || null,
      });
    }
    setModalOpen(false);
  };

  const columns: Column<Category>[] = [
    {
      key: 'title',
      header: 'Category',
      render: (c) => (
        <div className="flex items-center gap-2">
          {c.icon && <span className="text-xl leading-none">{c.icon}</span>}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{c.title}</span>
            <span className="text-[11px] text-gray-400 font-mono">{c.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      width: '140px',
      render: (c) => {
        const parent = categories.find((p) => p.id === c.parentCategory);
        return <span className="text-gray-600 text-[12px]">{parent?.title ?? '—'}</span>;
      },
    },
    {
      key: 'products',
      header: 'Products',
      width: '90px',
      render: (c) => (
        <span className="text-gray-700">{hydrated ? countFor(c.id) : '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (c) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(c)}
            className="hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Categories</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Taxonomy for products in the storefront.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          New Category
        </Button>
      </div>

      <DataTable<Category>
        columns={columns}
        rows={hydrated ? categories : []}
        rowKey={(c) => c.id}
        emptyText="No categories yet."
      />

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Category' : 'New Category'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={save}>
              {editTarget ? 'Save changes' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="T-Shirts"
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => { setSlugDirty(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
            placeholder="t-shirts"
            hint="Used in URLs and filters"
          />
          <Input
            label="Icon (emoji)"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            placeholder="👕"
            maxLength={4}
          />
          <label className="block">
            <span className="block text-[12px] font-medium text-gray-700 mb-1">Parent Category</span>
            <select
              value={form.parentCategory}
              onChange={(e) => setForm((f) => ({ ...f, parentCategory: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyber/30 focus:border-cyber"
            >
              <option value="">None (top-level)</option>
              {categories
                .filter((c) => c.id !== editTarget?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.title}</option>
                ))}
            </select>
          </label>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteCategory(deleteTarget.id)}
        title="Delete category?"
        message={`Delete "${deleteTarget?.title}"? Products assigned to it will lose their category.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
