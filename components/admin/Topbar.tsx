'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { useDataStore } from '@/lib/store/dataStore';

const TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/groups': 'Product Groups',
  '/admin/products': 'Products',
  '/admin/products/new': 'New Product',
  '/admin/categories': 'Categories',
};

function deriveCrumbs(
  path: string,
  resolveLabel: (fullPath: string, segment: string) => string
): { label: string; href?: string }[] {
  if (path === '/admin') return [{ label: 'Dashboard' }];
  const segments = path.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [
    { label: 'Admin', href: '/admin' },
  ];
  let acc = '';
  for (let i = 1; i < segments.length; i++) {
    acc += '/' + segments[i];
    const full = '/admin' + acc;
    const isLast = i === segments.length - 1;
    crumbs.push({
      label: resolveLabel(full, segments[i]),
      href: isLast ? undefined : full,
    });
  }
  return crumbs;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Topbar() {
  const pathname = usePathname() ?? '/admin';

  const productMatch = pathname.match(/^\/admin\/products\/([^/]+)$/);
  const productId = productMatch?.[1];
  const product = useDataStore((s) =>
    productId && productId !== 'new'
      ? s.products.find((p) => p.id === productId)
      : undefined
  );

  const orderMatch = pathname.match(/^\/admin\/orders\/([^/]+)$/);
  const orderId = orderMatch?.[1];
  const order = useDataStore((s) =>
    orderId ? s.orders.find((o) => o.id === orderId) : undefined
  );
  const orderLabel = order ? `Order ${order.id.slice(0, 8)}` : 'Order';

  const resolveLabel = (full: string, segment: string): string => {
    if (TITLES[full]) return TITLES[full];
    if (productId && segment === productId) return product?.title ?? 'Edit Product';
    if (orderId && segment === orderId) return orderLabel;
    return capitalize(segment);
  };

  const crumbs = deriveCrumbs(pathname, resolveLabel);
  const title =
    TITLES[pathname] ??
    (productId && productId !== 'new'
      ? product?.title ?? 'Edit Product'
      : orderId
      ? orderLabel
      : capitalize(pathname.split('/').pop() ?? 'Admin'));

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-0.5">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {c.href ? (
                <Link href={c.href} className="hover:text-gray-700">
                  {c.label}
                </Link>
              ) : (
                <span className="text-gray-700">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
            </span>
          ))}
        </div>
        <h1 className="text-[16px] font-bold text-gray-900 leading-none">{title}</h1>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-100 border border-gray-200"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View storefront
      </Link>
    </header>
  );
}
