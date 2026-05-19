'use client';

import { useMemo } from 'react';
import {
  Package,
  Tag,
  Layers,
  Percent,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StockPill from '@/components/admin/StockPill';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export default function AdminDashboard() {
  const products = useDataStore((s) => s.products);
  const groups = useDataStore((s) => s.groups);
  const categories = useDataStore((s) => s.categories);
  const orders = useDataStore((s) => s.orders);
  const hydrated = useHydrated();

  const stats = useMemo(() => {
    const activeDiscounts = products.filter((p) => p.discountPrice !== null).length;
    const outOfStock = products.filter((p) => p.stockStatus === 'out_of_stock').length;
    return {
      products: products.length,
      groups: groups.length,
      categories: categories.length,
      activeDiscounts,
      outOfStock,
      orders: orders.length,
    };
  }, [products, groups, categories, orders]);

  const recent: Product[] = useMemo(
    () =>
      [...products]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 5),
    [products]
  );

  const v = (n: number) => (hydrated ? n : '—');

  const columns: Column<Product>[] = [
    {
      key: 'title',
      header: 'Product',
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{p.title}</span>
          <span className="text-[11px] text-gray-500 font-mono">{p.slug}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => {
        const c = categories.find((c) => c.id === p.category);
        return <span className="text-gray-700">{c?.title ?? '—'}</span>;
      },
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => (
        <div className="flex flex-col">
          {p.discountPrice !== null ? (
            <>
              <span className="font-semibold text-gray-900">{formatPrice(p.discountPrice)}</span>
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(p.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-gray-900">{formatPrice(p.price)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Status',
      width: '120px',
      render: (p) => <StockPill status={p.stockStatus} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-gray-600">
            Welcome back. Here&apos;s the state of your store.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Products" value={v(stats.products)} Icon={Package} hint="total in catalog" />
        <StatCard label="Groups" value={v(stats.groups)} Icon={Layers} hint="active drops" />
        <StatCard label="Categories" value={v(stats.categories)} Icon={Tag} hint="taxonomy" />
        <StatCard label="On Sale" value={v(stats.activeDiscounts)} Icon={Percent} hint="discounted" />
        <StatCard
          label="Out of Stock"
          value={v(stats.outOfStock)}
          Icon={AlertTriangle}
          hint="needs restock"
        />
        <StatCard label="Orders" value={v(stats.orders)} Icon={ShoppingCart} hint="lifetime" />
      </div>

      {/* Recent products */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-bold text-gray-900">Recent products</h2>
          <span className="text-[11px] text-gray-500">
            {hydrated ? `${products.length} total` : '...'}
          </span>
        </div>
        <DataTable<Product>
          columns={columns}
          rows={recent}
          rowKey={(p) => p.id}
          emptyText="No products yet. Create one in Products."
        />
      </section>
    </div>
  );
}

