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
import { Textarea } from '@/components/ui/Input';
import type { CustomGroup } from '@/types';

type CgForm = { title: string; slug: string; description: string };
const EMPTY: CgForm = { title: '', slug: '', description: '' };

export default function CustomGroupsPage() {
  const customGroups = useDataStore((s) => s.customGroups);
  const products = useDataStore((s) => s.products);
  const addCustomGroup = useDataStore((s) => s.addCustomGroup);
  const updateCustomGroup = useDataStore((s) => s.updateCustomGroup);
  const deleteCustomGroup = useDataStore((s) => s.deleteCustomGroup);
  const hydrated = useHydrated();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomGroup | null>(null);
  const [form, setForm] = useState<CgForm>(EMPTY);
  const [slugDirty, setSlugDirty] = useState(false);
  const [error, setError] = useState('');

  const productCountFor = (gid: string) =>
    products.filter((p) => p.customGroups?.includes(gid)).length;

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY);
    setSlugDirty(false);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (g: CustomGroup) => {
    setEditTarget(g);
    setForm({ title: g.title, slug: g.slug, description: g.description });
    setSlugDirty(true);
    setError('');
    setModalOpen(true);
  };

  const setTitle = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugDirty ? f.slug : slugify(title) }));
  };

  const save = () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.slug.trim())  { setError('Slug is required.'); return; }

    if (editTarget) {
      updateCustomGroup(editTarget.id, {
        title: form.title,
        slug: form.slug,
        description: form.description,
      });
    } else {
      addCustomGroup({
        id: uid(),
        title: form.title,
        slug: form.slug,
        description: form.description,
      });
    }
    setModalOpen(false);
  };

  const columns: Column<CustomGroup>[] = [
    {
      key: 'title',
      header: 'Custom Group',
      render: (g) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{g.title}</span>
          <span className="text-[11px] text-gray-400 font-mono">{g.slug}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (g) => (
        <span className="text-gray-600 text-[12px] line-clamp-1">{g.description || '—'}</span>
      ),
    },
    {
      key: 'products',
      header: 'Products',
      width: '90px',
      render: (g) => (
        <span className="text-gray-700">{hydrated ? productCountFor(g.id) : '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (g) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => openEdit(g)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(g)}
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
          <h1 className="text-[18px] font-bold text-gray-900">Custom Groups</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Cross-cutting tags products can belong to many of (e.g. Best Sellers, Lifestyles).
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          New Custom Group
        </Button>
      </div>

      <DataTable<CustomGroup>
        columns={columns}
        rows={hydrated ? customGroups : []}
        rowKey={(g) => g.id}
        emptyText="No custom groups yet. Create one to start tagging products."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Custom Group' : 'New Custom Group'}
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
            placeholder="Best Sellers"
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => { setSlugDirty(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
            placeholder="best-sellers"
            hint="Used in URLs"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description…"
            rows={3}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteCustomGroup(deleteTarget.id)}
        title="Delete custom group?"
        message={`Delete "${deleteTarget?.title}"? Products tagged with this group will be unlinked.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
