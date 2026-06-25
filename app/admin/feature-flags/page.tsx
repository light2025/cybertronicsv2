'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import type { AdminFeatureFlags } from '@/types';
import { ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';

type FeatureInfo = {
  key: keyof AdminFeatureFlags;
  title: string;
  description: string;
};

const FEATURES: FeatureInfo[] = [
  {
    key: 'customers',
    title: 'Customers',
    description: 'View customer list aggregated from orders, with total spend and order history.',
  },
  {
    key: 'coupons',
    title: 'Coupons',
    description: 'Create and manage discount codes (percentage or fixed amount).',
  },
  {
    key: 'shipping',
    title: 'Shipping Zones',
    description: 'Configure shipping rates and free shipping thresholds by region.',
  },
  {
    key: 'banners',
    title: 'Banners',
    description: 'Manage promotional banners for hero, announcement bar, and sidebar.',
  },
  {
    key: 'storeSettings',
    title: 'Store Settings',
    description: 'Configure store name, contact info, tax rate, and social links.',
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Enhanced dashboard with revenue charts, top products, and trends.',
  },
];

export default function FeatureFlagsPage() {
  const [hydrated, setHydrated] = useState(false);
  const features = useSettingsStore((s) => s.adminFeatures);
  const toggleFeature = useSettingsStore((s) => s.toggleAdminFeature);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Safely compute enabled count with fallback
  const safeFeatures = features ?? {};
  const enabledCount = Object.values(safeFeatures).filter(Boolean).length;

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-[18px] font-bold text-gray-900">Admin Features</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">
          Toggle visibility of admin sections. {enabledCount} of {FEATURES.length} enabled.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-[13px] text-amber-800">
          <strong>Note:</strong> These features are ready but hidden from the sidebar by default.
          Enable them here to make them visible in the admin navigation.
        </p>
      </div>

      <div className="space-y-3">
        {FEATURES.map((f) => {
          const enabled = safeFeatures[f.key] ?? false;
          return (
            <div
              key={f.key}
              className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-colors ${
                enabled ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'
              }`}
            >
              <button
                onClick={() => toggleFeature(f.key)}
                className="shrink-0"
              >
                {enabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-300" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{f.title}</span>
                  {enabled ? (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                      <Eye className="w-3 h-3" /> Visible
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      <EyeOff className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-gray-500 mt-0.5">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <p className="text-[12px] text-gray-600">
          Changes are saved automatically and will be reflected immediately in the sidebar.
          You can access feature pages directly via URL even when hidden (e.g., /admin/customers).
        </p>
      </div>
    </div>
  );
}
