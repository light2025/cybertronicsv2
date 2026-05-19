'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE = {
  sm: 'w-[min(380px,92vw)]',
  md: 'w-[min(520px,92vw)]',
  lg: 'w-[min(720px,92vw)]',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 8, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 4, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden',
              SIZE[size],
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                <h2 className="text-[14px] font-bold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="close"
                  className="w-7 h-7 grid place-items-center rounded-md hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="px-5 py-4 flex-1 overflow-y-auto">{children}</div>
            {footer && (
              <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-end gap-2 bg-gray-50">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
