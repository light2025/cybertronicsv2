'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { formatPrice } from '@/lib/utils';
import DataTable, { type Column } from '@/components/admin/DataTable';
import OrderStatusPill from '@/components/admin/OrderStatusPill';
import Button from '@/components/ui/Button';
import type { Order, OrderStatus } from '@/types';

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersPage() {
  const orders = useDataStore((s) => s.orders);
  const hydrated = useHydrated();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((o) => (statusFilter === 'all' ? true : o.status === statusFilter))
      .filter((o) =>
        q === ''
          ? true
          : o.customerName.toLowerCase().includes(q) ||
            o.customerEmail.toLowerCase().includes(q) ||
            o.id.startsWith(q)
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [orders, search, statusFilter]);

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Order',
      width: '120px',
      render: (o) => (
        <div className="flex flex-col">
          <span className="font-mono text-[12px] text-gray-900">{o.id.slice(0, 8)}</span>
          <span className="text-[10px] text-gray-400">{fmtDate(o.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{o.customerName}</span>
          <span className="text-[11px] text-gray-500">{o.customerEmail}</span>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      width: '70px',
      render: (o) => (
        <span className="text-gray-700">
          {o.items.reduce((n, i) => n + i.quantity, 0)}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      width: '110px',
      render: (o) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{formatPrice(o.total)}</span>
          {o.discountTotal > 0 && (
            <span className="text-[10px] text-emerald-600">
              − {formatPrice(o.discountTotal)} saved
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (o) => <OrderStatusPill status={o.status} />,
    },
    {
      key: 'actions',
      header: '',
      width: '70px',
      render: (o) => (
        <div className="flex justify-end">
          <Link href={`/admin/orders/${o.id}`}>
            <Button variant="ghost" size="sm" type="button">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Orders</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {hydrated ? `${orders.length} total` : '…'}
          </p>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or order ID…"
          className="flex-1 max-w-sm h-9 rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber/30 focus:border-cyber"
        />
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-2.5 h-7 rounded-md text-[12px] font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-cyber/10 text-cyber-dark'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable<Order>
        columns={columns}
        rows={hydrated ? filtered : []}
        rowKey={(o) => o.id}
        emptyText={
          search || statusFilter !== 'all'
            ? 'No orders match your filters.'
            : 'No orders yet. Place one from the storefront cart.'
        }
      />
    </div>
  );
}
