'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Tag,
  Layers,
  Percent,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StockPill from '@/components/admin/StockPill';
import OrderStatusPill from '@/components/admin/OrderStatusPill';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { formatPrice } from '@/lib/utils';
import type { Product, Order } from '@/types';

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const products = useDataStore((s) => s.products);
  const groups = useDataStore((s) => s.groups);
  const categories = useDataStore((s) => s.categories);
  const orders = useDataStore((s) => s.orders);
  const hydrated = useHydrated();
  const showAnalytics = useSettingsStore((s) => s.adminFeatures?.analytics ?? false);

  const stats = useMemo(() => {
    const activeDiscounts = products.filter((p) => p.discountPrice !== null).length;
    const outOfStock = products.filter((p) => p.stockStatus === 'out_of_stock').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;

    // Unique customers
    const uniqueEmails = new Set(orders.map((o) => o.customerEmail.toLowerCase()));

    // This month's revenue
    const now = new Date();
    const thisMonth = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyRevenue = thisMonth.reduce((sum, o) => sum + o.total, 0);

    // Average order value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      products: products.length,
      groups: groups.length,
      categories: categories.length,
      activeDiscounts,
      outOfStock,
      orders: orders.length,
      totalRevenue,
      monthlyRevenue,
      pendingOrders,
      uniqueCustomers: uniqueEmails.size,
      avgOrderValue,
    };
  }, [products, groups, categories, orders]);

  // Top selling products (by order count)
  const topProducts = useMemo(() => {
    const counts = new Map<string, { product: Product; count: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const p = products.find((pr) => pr.id === item.productId);
        if (!p) continue;
        const existing = counts.get(p.id);
        if (existing) {
          existing.count += item.quantity;
          existing.revenue += item.totalPrice;
        } else {
          counts.set(p.id, { product: p, count: item.quantity, revenue: item.totalPrice });
        }
      }
    }
    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders, products]);

  const recentOrders: Order[] = useMemo(
    () =>
      [...orders]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 5),
    [orders]
  );

  const recentProducts: Product[] = useMemo(
    () =>
      [...products]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 5),
    [products]
  );

  const v = (n: number) => (hydrated ? n : '—');

  const productColumns: Column<Product>[] = [
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

  const orderColumns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Order',
      width: '100px',
      render: (o) => (
        <Link href={`/admin/orders/${o.id}`} className="font-mono text-[12px] text-cyber hover:underline">
          {o.id.slice(0, 8)}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => <span className="text-gray-900">{o.customerName}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      width: '100px',
      render: (o) => <span className="font-semibold text-gray-900">{formatPrice(o.total)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (o) => <OrderStatusPill status={o.status} />,
    },
    {
      key: 'time',
      header: '',
      width: '70px',
      render: (o) => (
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getTimeAgo(o.createdAt)}
        </span>
      ),
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

      {/* Revenue stats (shown when analytics enabled) */}
      {showAnalytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 text-emerald-100 text-[11px] uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </div>
            <div className="text-2xl font-bold mt-1">
              {hydrated ? formatPrice(stats.totalRevenue) : '—'}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 text-blue-100 text-[11px] uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              This Month
            </div>
            <div className="text-2xl font-bold mt-1">
              {hydrated ? formatPrice(stats.monthlyRevenue) : '—'}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 text-purple-100 text-[11px] uppercase tracking-wider">
              <Users className="w-4 h-4" />
              Customers
            </div>
            <div className="text-2xl font-bold mt-1">
              {hydrated ? stats.uniqueCustomers : '—'}
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 text-amber-100 text-[11px] uppercase tracking-wider">
              <ShoppingCart className="w-4 h-4" />
              Avg. Order
            </div>
            <div className="text-2xl font-bold mt-1">
              {hydrated ? formatPrice(stats.avgOrderValue) : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Basic stats grid */}
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
        <StatCard
          label="Pending"
          value={v(stats.pendingOrders)}
          Icon={ShoppingCart}
          hint="needs attention"
        />
      </div>

      {/* Two column layout for tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[11px] text-cyber hover:underline">
              View all →
            </Link>
          </div>
          <DataTable<Order>
            columns={orderColumns}
            rows={hydrated ? recentOrders : []}
            rowKey={(o) => o.id}
            emptyText="No orders yet."
          />
        </section>

        {/* Top products (shown when analytics enabled) */}
        {showAnalytics && topProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-gray-900">Top Products</h2>
              <span className="text-[11px] text-gray-500">by quantity sold</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {topProducts.map(({ product, count, revenue }, i) => (
                <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-5 h-5 rounded-full bg-gray-100 grid place-items-center text-[11px] font-bold text-gray-500">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{product.title}</div>
                    <div className="text-[11px] text-gray-500">{count} sold • {formatPrice(revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent products (shown when analytics disabled) */}
        {!showAnalytics && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-gray-900">Recent Products</h2>
              <Link href="/admin/products" className="text-[11px] text-cyber hover:underline">
                View all →
              </Link>
            </div>
            <DataTable<Product>
              columns={productColumns}
              rows={hydrated ? recentProducts : []}
              rowKey={(p) => p.id}
              emptyText="No products yet."
            />
          </section>
        )}
      </div>

      {/* Recent products (always show when analytics enabled) */}
      {showAnalytics && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-bold text-gray-900">Recent Products</h2>
            <Link href="/admin/products" className="text-[11px] text-cyber hover:underline">
              View all →
            </Link>
          </div>
          <DataTable<Product>
            columns={productColumns}
            rows={hydrated ? recentProducts : []}
            rowKey={(p) => p.id}
            emptyText="No products yet. Create one in Products."
          />
        </section>
      )}
    </div>
  );
}
