'use client';

import { useState } from 'react';
import { Plus, Trash2, Truck, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { formatPrice } from '@/lib/utils';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import type { ShippingZone } from '@/types';

function generateId() {
  return `zone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type FormState = {
  name: string;
  regions: string;
  rate: string;
  freeAbove: string;
  estimatedDays: string;
};

const defaultForm: FormState = {
  name: '',
  regions: '',
  rate: '',
  freeAbove: '',
  estimatedDays: '2-3',
};

export default function ShippingPage() {
  const zones = useDataStore((s) => s.shippingZones);
  const addZone = useDataStore((s) => s.addShippingZone);
  const updateZone = useDataStore((s) => s.updateShippingZone);
  const deleteZone = useDataStore((s) => s.deleteShippingZone);
  const hydrated = useHydrated();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (z: ShippingZone) => {
    setForm({
      name: z.name,
      regions: z.regions.join(', '),
      rate: z.rate.toString(),
      freeAbove: z.freeAbove?.toString() ?? '',
      estimatedDays: z.estimatedDays,
    });
    setEditingId(z.id);
    setShowModal(true);
  };

  const handleSave = () => {
    const data: ShippingZone = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      regions: form.regions.split(',').map((r) => r.trim()).filter(Boolean),
      rate: parseFloat(form.rate) || 0,
      freeAbove: form.freeAbove ? parseFloat(form.freeAbove) : undefined,
      estimatedDays: form.estimatedDays,
      isActive: editingId ? zones.find((z) => z.id === editingId)?.isActive ?? true : true,
    };

    if (editingId) {
      updateZone(editingId, data);
    } else {
      addZone(data);
    }
    setShowModal(false);
  };

  const toggleActive = (z: ShippingZone) => {
    updateZone(z.id, { isActive: !z.isActive });
  };

  const columns: Column<ShippingZone>[] = [
    {
      key: 'name',
      header: 'Zone',
      render: (z) => (
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{z.name}</span>
            <span className="text-[11px] text-gray-500">{z.regions.join(', ')}</span>
          </div>
          {!z.isActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
              INACTIVE
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'rate',
      header: 'Rate',
      width: '100px',
      render: (z) => (
        <span className={`font-semibold ${z.rate === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
          {z.rate === 0 ? 'FREE' : formatPrice(z.rate)}
        </span>
      ),
    },
    {
      key: 'freeAbove',
      header: 'Free Above',
      width: '120px',
      render: (z) => (
        <span className="text-gray-500">
          {z.freeAbove ? formatPrice(z.freeAbove) : '—'}
        </span>
      ),
    },
    {
      key: 'delivery',
      header: 'Delivery',
      width: '100px',
      render: (z) => (
        <span className="text-gray-700">{z.estimatedDays} days</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (z) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => toggleActive(z)}
            title={z.isActive ? 'Deactivate' : 'Activate'}
          >
            {z.isActive ? (
              <ToggleRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => openEdit(z)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => deleteZone(z.id)}
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
          <h1 className="text-[18px] font-bold text-gray-900">Shipping Zones</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {hydrated ? `${zones.length} zone${zones.length !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Add Zone
        </Button>
      </div>

      <DataTable<ShippingZone>
        columns={columns}
        rows={hydrated ? zones : []}
        rowKey={(z) => z.id}
        emptyText="No shipping zones yet. Add your first zone."
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Shipping Zone' : 'New Shipping Zone'}>
        <div className="space-y-4">
          <Input
            label="Zone Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Dubai"
          />

          <Input
            label="Regions (comma-separated)"
            value={form.regions}
            onChange={(e) => setForm({ ...form, regions: e.target.value })}
            placeholder="Dubai, Sharjah, Ajman"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Shipping Rate (AED)"
                type="number"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                placeholder="15"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Free Shipping Above (optional)"
                type="number"
                value={form.freeAbove}
                onChange={(e) => setForm({ ...form, freeAbove: e.target.value })}
                placeholder="200"
              />
            </div>
          </div>

          <Input
            label="Estimated Delivery (days)"
            value={form.estimatedDays}
            onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
            placeholder="2-3"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name || !form.regions}>
              {editingId ? 'Update' : 'Create'} Zone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
