'use client';

import { useMemo, useState } from 'react';
import { User, ShoppingBag, Phone } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { formatPrice } from '@/lib/utils';
import DataTable, { type Column } from '@/components/admin/DataTable';

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
};

export default function CustomersPage() {
  const orders = useDataStore((s) => s.orders);
  const hydrated = useHydrated();
  const [search, setSearch] = useState('');

  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();
    for (const o of orders) {
      const key = o.customerEmail.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += o.total;
        if (o.createdAt > existing.lastOrder) {
          existing.lastOrder = o.createdAt;
          existing.name = o.customerName;
          existing.phone = o.customerPhone;
        }
      } else {
        map.set(key, {
          id: key,
          name: o.customerName,
          email: o.customerEmail,
          phone: o.customerPhone,
          orderCount: 1,
          totalSpent: o.total,
          lastOrder: o.createdAt,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, search]);

  const columns: Column<CustomerRow>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyber/10 grid place-items-center">
            <User className="w-4 h-4 text-cyber-dark" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{c.name}</span>
            <span className="text-[11px] text-gray-500">{c.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      width: '140px',
      render: (c) => (
        <div className="flex items-center gap-1.5 text-gray-700 text-[13px]">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          {c.phone || '—'}
        </div>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      width: '90px',
      render: (c) => (
        <div className="flex items-center gap-1.5 text-gray-700">
          <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
          {c.orderCount}
        </div>
      ),
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      width: '120px',
      render: (c) => (
        <span className="font-semibold text-gray-900">{formatPrice(c.totalSpent)}</span>
      ),
    },
    {
      key: 'lastOrder',
      header: 'Last Order',
      width: '130px',
      render: (c) => (
        <span className="text-[12px] text-gray-500">
          {new Date(c.lastOrder).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Customers</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {hydrated ? `${customers.length} unique customers` : '…'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="flex-1 max-w-sm h-9 rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber/30 focus:border-cyber"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider">Total Customers</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {hydrated ? customers.length : '—'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {hydrated ? formatPrice(customers.reduce((s, c) => s + c.totalSpent, 0)) : '—'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider">Avg. Order Value</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {hydrated && orders.length > 0
              ? formatPrice(orders.reduce((s, o) => s + o.total, 0) / orders.length)
              : '—'}
          </div>
        </div>
      </div>

      <DataTable<CustomerRow>
        columns={columns}
        rows={hydrated ? filtered : []}
        rowKey={(c) => c.id}
        emptyText={
          search
            ? 'No customers match your search.'
            : 'No customers yet. Orders will populate this list.'
        }
      />
    </div>
  );
}
