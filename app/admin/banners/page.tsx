'use client';

import { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { nowIso } from '@/lib/utils';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import type { Banner, BannerPosition } from '@/types';

function generateId() {
  return `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type FormState = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  position: BannerPosition;
  validFrom: string;
  validUntil: string;
};

const defaultForm: FormState = {
  title: '',
  subtitle: '',
  image: '',
  link: '',
  position: 'hero',
  validFrom: '',
  validUntil: '',
};

const POSITIONS: { value: BannerPosition; label: string }[] = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'announcement', label: 'Announcement Bar' },
  { value: 'sidebar', label: 'Sidebar' },
];

export default function BannersPage() {
  const banners = useDataStore((s) => s.banners);
  const addBanner = useDataStore((s) => s.addBanner);
  const updateBanner = useDataStore((s) => s.updateBanner);
  const deleteBanner = useDataStore((s) => s.deleteBanner);
  const hydrated = useHydrated();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (b: Banner) => {
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? '',
      image: b.image,
      link: b.link ?? '',
      position: b.position,
      validFrom: b.validFrom?.split('T')[0] ?? '',
      validUntil: b.validUntil?.split('T')[0] ?? '',
    });
    setEditingId(b.id);
    setShowModal(true);
  };

  const handleSave = () => {
    const existing = editingId ? banners.find((b) => b.id === editingId) : null;
    const data: Banner = {
      id: editingId ?? generateId(),
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || undefined,
      image: form.image.trim(),
      link: form.link.trim() || undefined,
      position: form.position,
      isActive: existing?.isActive ?? true,
      displayOrder: existing?.displayOrder ?? banners.length,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      createdAt: existing?.createdAt ?? nowIso(),
    };

    if (editingId) {
      updateBanner(editingId, data);
    } else {
      addBanner(data);
    }
    setShowModal(false);
  };

  const toggleActive = (b: Banner) => {
    updateBanner(b.id, { isActive: !b.isActive });
  };

  const sortedBanners = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);

  const columns: Column<Banner>[] = [
    {
      key: 'order',
      header: '',
      width: '40px',
      render: () => (
        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
      ),
    },
    {
      key: 'preview',
      header: 'Preview',
      width: '80px',
      render: (b) => (
        <div className="w-16 h-10 rounded bg-gray-100 overflow-hidden">
          {b.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <ImageIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Banner',
      render: (b) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{b.title}</span>
          {b.subtitle && (
            <span className="text-[11px] text-gray-500">{b.subtitle}</span>
          )}
          {!b.isActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 w-fit mt-0.5">
              INACTIVE
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Position',
      width: '130px',
      render: (b) => (
        <span className="text-[12px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
          {b.position}
        </span>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      width: '150px',
      render: (b) => {
        if (!b.validFrom && !b.validUntil) return <span className="text-gray-400">Always</span>;
        return (
          <span className="text-[11px] text-gray-500">
            {b.validFrom && new Date(b.validFrom).toLocaleDateString()}
            {b.validFrom && b.validUntil && ' – '}
            {b.validUntil && new Date(b.validUntil).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (b) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => toggleActive(b)}
            title={b.isActive ? 'Deactivate' : 'Activate'}
          >
            {b.isActive ? (
              <ToggleRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => openEdit(b)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => deleteBanner(b.id)}
            className="text-red-500 hover:bg-red-50"
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
          <h1 className="text-[18px] font-bold text-gray-900">Banners</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {hydrated ? `${banners.length} banner${banners.length !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Add Banner
        </Button>
      </div>

      <DataTable<Banner>
        columns={columns}
        rows={hydrated ? sortedBanners : []}
        rowKey={(b) => b.id}
        emptyText="No banners yet. Create your first promotional banner."
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Banner' : 'New Banner'}>
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Summer Sale"
          />

          <Input
            label="Subtitle (optional)"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Up to 50% off"
          />

          <Input
            label="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://..."
          />

          <Input
            label="Link (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            placeholder="/products/summer-collection"
          />

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Position</label>
            <select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value as BannerPosition })}
              className="w-full h-9 rounded-lg border border-gray-300 px-3 text-[13px]"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Valid From (optional)"
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Valid Until (optional)"
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.title || !form.image}>
              {editingId ? 'Update' : 'Create'} Banner
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
