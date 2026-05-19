'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useDataStore, useHydrated } from '@/lib/store/dataStore';
import { formatPrice } from '@/lib/utils';
import DataTable, { type Column } from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StockPill from '@/components/admin/StockPill';
import Button from '@/components/ui/Button';
import type { Product } from '@/types';

export default function ProductsPage() {
  const products = useDataStore((s) => s.products);
  const categories = useDataStore((s) => s.categories);
  const groups = useDataStore((s) => s.groups);
  const deleteProduct = useDataStore((s) => s.deleteProduct);
  const hydrated = useHydrated();

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? products.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.includes(search.toLowerCase())
      )
    : products;

  const sorted = [...filtered].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{p.title}</span>
          <span className="text-[11px] text-gray-400 font-mono">{p.slug}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: '120px',
      render: (p) => {
        const c = categories.find((c) => c.id === p.category);
        return <span className="text-gray-700 text-[12px]">{c ? `${c.icon ?? ''} ${c.title}` : '—'}</span>;
      },
    },
    {
      key: 'price',
      header: 'Price',
      width: '130px',
      render: (p) => (
        <div className="flex flex-col">
          {p.discountPrice !== null ? (
            <>
              <span className="font-semibold text-[#c44030] text-[12px]">{formatPrice(p.discountPrice)}</span>
              <span className="text-[10px] text-gray-400 line-through">{formatPrice(p.price)}</span>
            </>
          ) : (
            <span className="font-semibold text-gray-900 text-[12px]">{formatPrice(p.price)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      width: '90px',
      render: (p) => <StockPill status={p.stockStatus} />,
    },
    {
      key: 'group',
      header: 'Group',
      width: '140px',
      render: (p) => {
        const g = groups.find((g) => g.id === p.groupId);
        return <span className="text-gray-600 text-[12px]">{g?.title ?? '—'}</span>;
      },
    },
    {
      key: 'actions',
      header: '',
      width: '90px',
      render: (p) => (
        <div className="flex gap-1 justify-end">
          <Link href={`/admin/products/${p.id}`}>
            <Button variant="ghost" size="sm" type="button">
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(p)}
            className="hover:text-red-600 hover:bg-red-50"
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
          <h1 className="text-[18px] font-bold text-gray-900">Products</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {hydrated ? `${products.length} total` : '…'}
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary">
            <Plus className="w-4 h-4" />
            New Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products…"
        className="w-full max-w-xs h-9 rounded-lg border border-gray-300 bg-white px-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber/30 focus:border-cyber"
      />

      <DataTable<Product>
        columns={columns}
        rows={hydrated ? sorted : []}
        rowKey={(p) => p.id}
        emptyText={search ? 'No products match your search.' : 'No products yet. Create one above.'}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteProduct(deleteTarget.id)}
        title="Delete product?"
        message={`Permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
