'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-cyber text-gray-900 hover:bg-cyber-dark hover:text-white border border-cyber-dark/40 shadow-sm',
  secondary:
    'bg-white text-gray-800 hover:bg-gray-50 border border-gray-300',
  danger:
    'bg-red-600 text-white hover:bg-red-700 border border-red-700',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 border border-transparent',
};

const SIZE: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[12px]',
  md: 'h-9 px-3.5 text-[13px]',
  lg: 'h-11 px-5 text-[14px]',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  className,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyber/40',
        VARIANT[variant],
        SIZE[size],
        className
      )}
    />
  );
}
