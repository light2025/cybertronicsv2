'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BaseProps = {
  label?: string;
  hint?: string;
  error?: string;
};

type InputProps = InputHTMLAttributes<HTMLInputElement> & BaseProps;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps;

const FIELD =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber/30 focus:border-cyber';

function Wrapper({
  label,
  hint,
  error,
  children,
}: BaseProps & { children: React.ReactNode }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-[12px] font-medium text-gray-700 mb-1">
          {label}
        </span>
      )}
      {children}
      {hint && !error && (
        <span className="block text-[11px] text-gray-500 mt-1">{hint}</span>
      )}
      {error && (
        <span className="block text-[11px] text-red-600 mt-1">{error}</span>
      )}
    </label>
  );
}

export default function Input({
  label,
  hint,
  error,
  className,
  ...rest
}: InputProps) {
  return (
    <Wrapper label={label} hint={hint} error={error}>
      <input
        {...rest}
        className={cn(FIELD, error && 'border-red-400 focus:ring-red-400/30 focus:border-red-500', className)}
      />
    </Wrapper>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className,
  ...rest
}: TextareaProps) {
  return (
    <Wrapper label={label} hint={hint} error={error}>
      <textarea
        {...rest}
        className={cn(FIELD, 'resize-y min-h-[72px]', error && 'border-red-400 focus:ring-red-400/30 focus:border-red-500', className)}
      />
    </Wrapper>
  );
}
