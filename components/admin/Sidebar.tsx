'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Package,
  Tag,
  Receipt,
  Bookmark,
  Image as ImageIcon,
  Users,
  Percent,
  Truck,
  Megaphone,
  Settings,
  Sliders,
  type LucideIcon,
} from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { cn } from '@/lib/utils';
import type { AdminFeatureFlags } from '@/types';

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  match?: (path: string) => boolean;
  featureFlag?: keyof AdminFeatureFlags;
};

const NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    Icon: LayoutDashboard,
    match: (p) => p === '/admin',
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    Icon: Receipt,
    match: (p) => p.startsWith('/admin/orders'),
  },
  {
    href: '/admin/customers',
    label: 'Customers',
    Icon: Users,
    match: (p) => p.startsWith('/admin/customers'),
    featureFlag: 'customers',
  },
  {
    href: '/admin/groups',
    label: 'Groups',
    Icon: Layers,
    match: (p) => p.startsWith('/admin/groups'),
  },
  {
    href: '/admin/products',
    label: 'Products',
    Icon: Package,
    match: (p) => p.startsWith('/admin/products'),
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    Icon: Tag,
    match: (p) => p.startsWith('/admin/categories'),
  },
  {
    href: '/admin/custom-groups',
    label: 'Custom Groups',
    Icon: Bookmark,
    match: (p) => p.startsWith('/admin/custom-groups'),
  },
  {
    href: '/admin/lookbook',
    label: 'Lookbook',
    Icon: ImageIcon,
    match: (p) => p.startsWith('/admin/lookbook'),
  },
  {
    href: '/admin/coupons',
    label: 'Coupons',
    Icon: Percent,
    match: (p) => p.startsWith('/admin/coupons'),
    featureFlag: 'coupons',
  },
  {
    href: '/admin/shipping',
    label: 'Shipping',
    Icon: Truck,
    match: (p) => p.startsWith('/admin/shipping'),
    featureFlag: 'shipping',
  },
  {
    href: '/admin/banners',
    label: 'Banners',
    Icon: Megaphone,
    match: (p) => p.startsWith('/admin/banners'),
    featureFlag: 'banners',
  },
  {
    href: '/admin/store-settings',
    label: 'Store Settings',
    Icon: Settings,
    match: (p) => p.startsWith('/admin/store-settings'),
    featureFlag: 'storeSettings',
  },
  {
    href: '/admin/feature-flags',
    label: 'Feature Flags',
    Icon: Sliders,
    match: (p) => p.startsWith('/admin/feature-flags'),
  },
];

export default function Sidebar() {
  const pathname = usePathname() ?? '/admin';
  const hydrated = useHydrated();
  const pendingCount = useDataStore((s) =>
    s.orders.filter((o) => o.status === 'pending').length
  );
  const adminFeatures = useSettingsStore((s) => s.adminFeatures) ?? {};

  // Filter nav items based on feature flags
  const visibleNav = NAV.filter((item) => {
    if (!item.featureFlag) return true;
    return adminFeatures[item.featureFlag] ?? false;
  });

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Brand */}
      <div className="px-5 h-14 flex items-center border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyber to-cyber-dark grid place-items-center text-white font-bold text-[12px]">
            C
          </span>
          <span className="font-bold text-[14px] text-gray-900 tracking-tight">
            Cybertronics
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500 ml-1">
            admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {visibleNav.map(({ href, label, Icon, match }) => {
          const active = match ? match(pathname) : pathname === href;
          const showBadge = hydrated && label === 'Orders' && pendingCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-2.5 px-3 h-9 rounded-lg text-[13px] transition-colors',
                active
                  ? 'bg-cyber/10 text-cyber-dark font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  active ? 'text-cyber-dark' : 'text-gray-400 group-hover:text-gray-700'
                )}
                strokeWidth={2}
              />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
              {active && !showBadge && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-dark" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 text-[10px] text-gray-400 leading-relaxed">
        <div className="font-semibold text-gray-500 text-[10px] uppercase tracking-wider mb-1">
          v1.0.0 · S3
        </div>
        Local data — TODO: connect Supabase.
      </div>
    </aside>
  );
}
