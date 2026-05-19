'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useDataStore } from '@/lib/store/dataStore';
import { useHydrated } from '@/lib/store/dataStore';
import { uid, slugify } from '@/lib/utils';
import { nowIso } from '@/lib/utils';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import type { ProductGroup } from '@/types';

type GroupForm = { title: string; slug: string; description: string; isActive: boolean };
const EMPTY_FORM: GroupForm = { title: '', slug: '', description: '', isActive: true };

export default function GroupsPage() {
  const groups = useDataStore((s) => s.groups);
  const products = useDataStore((s) => s.products);
  const addGroup = useDataStore((s) => s.addGroup);
  const updateGroup = useDataStore((s) => s.updateGroup);
  const deleteGroup = useDataStore((s) => s.deleteGroup);
  const hydrated = useHydrated();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductGroup | null>(null);
  const [form, setForm] = useState<GroupForm>(EMPTY_FORM);
  const [slugDirty, setSlugDirty] = useState(false);
  const [error, setError] = useState('');

  const productCountFor = (gid: string) => products.filter((p) => p.groupId === gid).length;

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setSlugDirty(false);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (g: ProductGroup) => {
    setEditTarget(g);
    setForm({ title: g.title, slug: g.slug, description: g.description, isActive: g.isActive });
    setSlugDirty(true);
    setError('');
    setModalOpen(true);
  };

  const setTitle = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: slugDirty ? f.slug : slugify(title),
    }));
  };

  const save = () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.slug.trim()) { setError('Slug is required.'); return; }
    if (editTarget) {
      updateGroup(editTarget.id, { title: form.title, slug: form.slug, description: form.description, isActive: form.isActive });
    } else {
      const now = nowIso();
      addGroup({ id: uid(), title: form.title, slug: form.slug, description: form.description, isActive: form.isActive, coverImage: null, createdAt: now, updatedAt: now });
    }
    setModalOpen(false);
  };

  const columns: Column<ProductGroup>[] = [
    {
      key: 'title',
      header: 'Group',
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
      key: 'status',
      header: 'Status',
      width: '90px',
      render: (g) => (
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${g.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
          {g.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {g.isActive ? 'Active' : 'Inactive'}
        </span>
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
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(g)} className="hover:text-red-600 hover:bg-red-50">
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
          <h1 className="text-[18px] font-bold text-gray-900">Product Groups</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Organize products into drops and collections.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          New Group
        </Button>
      </div>

      <DataTable<ProductGroup>
        columns={columns}
        rows={hydrated ? groups : []}
        rowKey={(g) => g.id}
        emptyText="No groups yet. Create one to start organizing products."
      />

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Group' : 'New Group'}
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={save}>
              {editTarget ? 'Save changes' : 'Create group'}
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
            placeholder="Cybertronics Drop 002"
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => { setSlugDirty(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
            placeholder="cybertronics-drop-002"
            hint="Used in URLs"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description of this drop or collection…"
            rows={3}
          />
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 accent-cyber rounded"
            />
            <span className="text-[13px] text-gray-700 font-medium">Active</span>
          </label>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteGroup(deleteTarget.id)}
        title="Delete group?"
        message={`Delete "${deleteTarget?.title}"? Products in this group will be unassigned but not deleted.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
