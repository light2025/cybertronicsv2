-- Migration 0004: extend products with media jsonb for richer ordering/type support.
-- Additive only — no existing data is touched.

alter table products
  add column if not exists hero_image text,
  add column if not exists media jsonb not null default '[]'::jsonb;

comment on column products.hero_image is 'Explicit hero/main image URL. Falls back to images[primary_image_index].';
comment on column products.media is 'Ordered media array: [{url, type, order, isHero, alt, filename}]';
