'use client';

import { useState } from 'react';
import { Plus, Trash2, Percent, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { formatPrice, nowIso } from '@/lib/utils';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import type { Coupon, CouponType } from '@/types';

function generateId() {
  return `coupon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type FormState = {
  code: string;
  type: CouponType;
  value: string;
  minOrderAmount: string;
  maxUses: string;
  validFrom: string;
  validUntil: string;
};

const defaultForm: FormState = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderAmount: '',
  maxUses: '',
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

export default function CouponsPage() {
  const coupons = useDataStore((s) => s.coupons);
  const addCoupon = useDataStore((s) => s.addCoupon);
  const updateCoupon = useDataStore((s) => s.updateCoupon);
  const deleteCoupon = useDataStore((s) => s.deleteCoupon);
  const hydrated = useHydrated();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value.toString(),
      minOrderAmount: c.minOrderAmount?.toString() ?? '',
      maxUses: c.maxUses?.toString() ?? '',
      validFrom: c.validFrom.split('T')[0],
      validUntil: c.validUntil.split('T')[0],
    });
    setEditingId(c.id);
    setShowModal(true);
  };

  const handleSave = () => {
    const data: Coupon = {
      id: editingId ?? generateId(),
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: parseFloat(form.value) || 0,
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
      maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
      usedCount: editingId ? coupons.find((c) => c.id === editingId)?.usedCount ?? 0 : 0,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
      isActive: true,
      createdAt: editingId ? coupons.find((c) => c.id === editingId)?.createdAt ?? nowIso() : nowIso(),
    };

    if (editingId) {
      updateCoupon(editingId, data);
    } else {
      addCoupon(data);
    }
    setShowModal(false);
  };

  const toggleActive = (c: Coupon) => {
    updateCoupon(c.id, { isActive: !c.isActive });
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
            {c.code}
          </span>
          {!c.isActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
              INACTIVE
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      width: '120px',
      render: (c) => (
        <div className="flex items-center gap-1">
          {c.type === 'percentage' ? (
            <>
              <Percent className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-emerald-600">{c.value}% off</span>
            </>
          ) : (
            <>
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-emerald-600">{formatPrice(c.value)} off</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      width: '100px',
      render: (c) => (
        <span className="text-gray-700">
          {c.usedCount} / {c.maxUses ?? '∞'}
        </span>
      ),
    },
    {
      key: 'minOrder',
      header: 'Min. Order',
      width: '100px',
      render: (c) => (
        <span className="text-gray-500">
          {c.minOrderAmount ? formatPrice(c.minOrderAmount) : '—'}
        </span>
      ),
    },
    {
      key: 'validity',
      header: 'Valid Until',
      width: '110px',
      render: (c) => {
        const expired = new Date(c.validUntil) < new Date();
        return (
          <span className={expired ? 'text-red-500' : 'text-gray-500'}>
            {new Date(c.validUntil).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => toggleActive(c)}
            title={c.isActive ? 'Deactivate' : 'Activate'}
          >
            {c.isActive ? (
              <ToggleRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => openEdit(c)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => deleteCoupon(c.id)}
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
          <h1 className="text-[18px] font-bold text-gray-900">Coupons</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {hydrated ? `${coupons.length} coupon${coupons.length !== 1 ? 's' : ''}` : '…'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Add Coupon
        </Button>
      </div>

      <DataTable<Coupon>
        columns={columns}
        rows={hydrated ? coupons : []}
        rowKey={(c) => c.id}
        emptyText="No coupons yet. Create your first discount code."
      />

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Coupon' : 'New Coupon'}>
        <div className="space-y-4">
          <Input
            label="Coupon Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="SUMMER20"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
                className="w-full h-9 rounded-lg border border-gray-300 px-3 text-[13px]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (AED)</option>
              </select>
            </div>
            <div className="flex-1">
              <Input
                label={form.type === 'percentage' ? 'Discount %' : 'Discount AED'}
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={form.type === 'percentage' ? '20' : '50'}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Min. Order Amount (optional)"
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                placeholder="100"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Max Uses (optional)"
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="Valid From"
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Valid Until"
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
            <Button onClick={handleSave} disabled={!form.code || !form.value}>
              {editingId ? 'Update' : 'Create'} Coupon
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
