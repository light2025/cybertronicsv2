'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { StoreSettings } from '@/types';

type SocialLink = { platform: string; url: string };

export default function StoreSettingsPage() {
  const settings = useDataStore((s) => s.storeSettings);
  const updateSettings = useDataStore((s) => s.updateStoreSettings);
  const hydrated = useHydrated();

  const [form, setForm] = useState<StoreSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (hydrated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(settings);
    }
  }, [hydrated, settings]);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addSocialLink = () => {
    setForm({
      ...form,
      socialLinks: [...form.socialLinks, { platform: '', url: '' }],
    });
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...form.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, socialLinks: updated });
  };

  const removeSocialLink = (index: number) => {
    setForm({
      ...form,
      socialLinks: form.socialLinks.filter((_, i) => i !== index),
    });
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Store Settings</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            Configure your store information
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-1" />
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Basic Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[14px] font-bold text-gray-900">Basic Information</h2>

        <Input
          label="Store Name"
          value={form.storeName}
          onChange={(e) => setForm({ ...form, storeName: e.target.value })}
        />

        <Input
          label="Logo URL"
          value={form.logo}
          onChange={(e) => setForm({ ...form, logo: e.target.value })}
          placeholder="https://..."
        />

        <Input
          label="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </section>

      {/* Contact */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[14px] font-bold text-gray-900">Contact Information</h2>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Phone"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Commerce */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-[14px] font-bold text-gray-900">Commerce Settings</h2>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as 'AED' })}
              className="w-full h-9 rounded-lg border border-gray-300 px-3 text-[13px]"
            >
              <option value="AED">AED (UAE Dirham)</option>
            </select>
          </div>
          <div className="flex-1">
            <Input
              label="Tax Rate (%)"
              type="number"
              value={form.taxRate.toString()}
              onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Free Shipping Above (AED)"
              type="number"
              value={form.freeShippingThreshold.toString()}
              onChange={(e) => setForm({ ...form, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-gray-900">Social Links</h2>
          <Button variant="secondary" size="sm" onClick={addSocialLink}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Link
          </Button>
        </div>

        {form.socialLinks.length === 0 ? (
          <p className="text-[13px] text-gray-500">No social links added yet.</p>
        ) : (
          <div className="space-y-3">
            {form.socialLinks.map((link, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="w-32">
                  <Input
                    label={i === 0 ? 'Platform' : ''}
                    value={link.platform}
                    onChange={(e) => updateSocialLink(i, 'platform', e.target.value)}
                    placeholder="Instagram"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label={i === 0 ? 'URL' : ''}
                    value={link.url}
                    onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSocialLink(i)}
                  className="text-red-500 hover:bg-red-50 mb-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
