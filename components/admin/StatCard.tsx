'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  value: string | number;
  Icon?: LucideIcon;
  hint?: string;
  trend?: { dir: 'up' | 'down' | 'flat'; text: string };
  className?: string;
};

const TREND_COLOR = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  flat: 'text-gray-500',
};

export default function StatCard({ label, value, Icon, hint, trend, className }: Props) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        {Icon && (
          <span className="w-8 h-8 grid place-items-center rounded-lg bg-cyber/10 text-cyber-dark">
            <Icon className="w-4 h-4" strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="text-[26px] font-bold text-gray-900 leading-none">{value}</div>
      {(hint || trend) && (
        <div className="flex items-center gap-2 text-[11px]">
          {trend && (
            <span className={cn('font-medium', TREND_COLOR[trend.dir])}>
              {trend.dir === 'up' ? '↑' : trend.dir === 'down' ? '↓' : '·'} {trend.text}
            </span>
          )}
          {hint && <span className="text-gray-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}
