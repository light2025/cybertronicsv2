'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  width?: string;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyText?: string;
  className?: string;
};

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyText = 'No data.',
  className,
}: Props<T>) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 px-4 py-2.5"
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[12px] text-gray-500">
                  {emptyText}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-gray-100 last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-gray-50'
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn('px-4 py-2.5 text-gray-800 align-middle', c.className)}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
