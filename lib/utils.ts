// Tiny shared utils. Caveman.

export const CURRENCY = 'AED' as const;

export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const formatPrice = (n: number) => `${CURRENCY} ${n.toFixed(2)}`;

export const nowIso = () => new Date().toISOString();
