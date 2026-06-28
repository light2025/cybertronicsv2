-- Cybertronics Stage 2 — seed data
-- Mirrors lib/data/seedProducts.ts so dev + prod start with the same catalog.
-- Run AFTER 0001_init.sql + 0002_rls.sql. Idempotent via ON CONFLICT DO NOTHING.

-- Categories ----------------------------------------------------------------
insert into categories (id, title, slug, parent_category, icon, position) values
  ('11111111-1111-1111-1111-000000000001', 'T-Shirts',    't-shirts',    null, '👕', 10),
  ('11111111-1111-1111-1111-000000000002', 'Pants',       'pants',       null, '👖', 20),
  ('11111111-1111-1111-1111-000000000003', 'Shorts',      'shorts',      null, '🩳', 30),
  ('11111111-1111-1111-1111-000000000004', 'Hoodies',     'hoodies',     null, '🧥', 40),
  ('11111111-1111-1111-1111-000000000005', 'Socks',       'socks',       null, '🧦', 50),
  ('11111111-1111-1111-1111-000000000006', 'Caps',        'caps',        null, '🧢', 60),
  ('11111111-1111-1111-1111-000000000007', 'Headwear',    'headwear',    null, '👒', 70),
  ('11111111-1111-1111-1111-000000000008', 'Accessories', 'accessories', null, '🕶️', 80)
on conflict (id) do nothing;

-- Sub-categories (children of T-Shirts) -------------------------------------
insert into categories (id, title, slug, parent_category, icon, position) values
  ('22222222-1111-1111-1111-000000000001', 'Graphic Tees',  'graphic-tees',  '11111111-1111-1111-1111-000000000001', '🎨', 10),
  ('22222222-1111-1111-1111-000000000002', 'Plain Tees',    'plain-tees',    '11111111-1111-1111-1111-000000000001', '⬜', 20),
  ('22222222-1111-1111-1111-000000000003', 'Oversized Tees','oversized-tees','11111111-1111-1111-1111-000000000001', '🫥', 30)
on conflict (id) do nothing;

-- Product groups ------------------------------------------------------------
insert into product_groups (id, title, slug, description, cover_image, is_active) values
  ('33333333-1111-1111-1111-000000000001', 'Cybertronics Drop 001', 'cybertronics-drop-001', 'First drop — limited release.',          'https://picsum.photos/seed/cy-drop-001/800/800',  true),
  ('33333333-1111-1111-1111-000000000002', 'Cyber XP Essentials',   'cyber-xp-essentials',   'Everyday Cybertronics basics.',          'https://picsum.photos/seed/cy-essentials/800/800', true),
  ('33333333-1111-1111-1111-000000000003', 'Lifestyle Collection',  'lifestyle-collection',  'Lifestyle pieces for the cyber commute.','https://picsum.photos/seed/cy-lifestyle/800/800',  true)
on conflict (id) do nothing;

-- Custom groups -------------------------------------------------------------
insert into custom_groups (id, title, slug, description) values
  ('44444444-1111-1111-1111-000000000001', 'New Arrivals', 'new-arrivals', 'Auto-populated from is_new_arrival flag (kept as a group for manual override).'),
  ('44444444-1111-1111-1111-000000000002', 'Lifestyles',   'lifestyles',   'Curated lifestyle picks.'),
  ('44444444-1111-1111-1111-000000000003', 'Best Sellers', 'best-sellers', 'Top-moving SKUs this month.')
on conflict (id) do nothing;

-- Products ------------------------------------------------------------------
insert into products (
  id, group_id, title, slug, description, category, price, discount_price, currency,
  images, tags, stock_status, stock_count, is_featured, is_new_arrival, is_best_selling,
  available_sizes, barcode
) values
  ('55555555-1111-1111-1111-000000000001', '33333333-1111-1111-1111-000000000001',
   'XP Boot Screen Tee', 'xp-boot-screen-tee',
   'Heavyweight 280gsm oversized tee screen-printed with the iconic Windows XP boot sequence. Garment-dyed in midnight black. Limited to 100 units.',
   '11111111-1111-1111-1111-000000000001',
   220, 165, 'AED',
   array['https://picsum.photos/seed/prd-001/800/800','https://picsum.photos/seed/prd-001b/800/800'],
   array['tshirt','graphic','limited','drop001','oversized'],
   'in_stock', 78, true, true, false,
   array['XS','S','M','L','XL','XXL'], 'CYB-001-2026'),

  ('55555555-1111-1111-1111-000000000002', '33333333-1111-1111-1111-000000000001',
   'Luna Blue Cargo Pants', 'luna-blue-cargo-pants',
   'Six-pocket tactical cargo pants woven in Luna Blue — the exact shade from the XP Luna theme. Tapered fit, 100% cotton ripstop. Unisex sizing.',
   '11111111-1111-1111-1111-000000000002',
   420, null, 'AED',
   array['https://picsum.photos/seed/prd-002/800/800','https://picsum.photos/seed/prd-002b/800/800'],
   array['pants','cargo','tactical','drop001','luna-blue'],
   'in_stock', 42, false, true, false,
   array['S','M','L','XL'], 'CYB-002-2026'),

  ('55555555-1111-1111-1111-000000000003', '33333333-1111-1111-1111-000000000001',
   'Bliss Wallpaper Bucket Hat', 'bliss-wallpaper-bucket-hat',
   'Sublimation-printed bucket hat featuring the full Bliss XP landscape. UV-resistant fabric, adjustable inner band. One size fits most.',
   '11111111-1111-1111-1111-000000000003',
   145, 110, 'AED',
   array['https://picsum.photos/seed/prd-003/800/800'],
   array['hat','bucket','sublimation','drop001','bliss'],
   'in_stock', 120, true, true, true,
   array[]::text[], 'CYB-003-2026'),

  ('55555555-1111-1111-1111-000000000004', '33333333-1111-1111-1111-000000000002',
   'Cyber Core Tee', 'cyber-core-tee',
   'The everyday essential. 200gsm ringspun cotton in Cyber Black with a subtle tonal Cybertronics wordmark on the chest. Relaxed fit.',
   '11111111-1111-1111-1111-000000000001',
   110, null, 'AED',
   array['https://picsum.photos/seed/prd-004/800/800'],
   array['tshirt','essential','minimal','everyday'],
   'in_stock', 200, false, false, true,
   array['S','M','L','XL','XXL'], 'CYB-004-2026'),

  ('55555555-1111-1111-1111-000000000005', '33333333-1111-1111-1111-000000000002',
   'Cyber Commute Low-Tops', 'cyber-commute-low-tops',
   'Vulcanised low-top sneakers in off-white canvas with a cyan sole stripe. Lightweight, breathable, and built for daily wear. Pre-order ships in 6 weeks.',
   '11111111-1111-1111-1111-000000000005',
   550, null, 'AED',
   array['https://picsum.photos/seed/prd-005/800/800'],
   array['shoes','sneakers','essential','preorder'],
   'preorder', 0, false, false, false,
   array['EU 39','EU 40','EU 41','EU 42','EU 43','EU 44'], 'CYB-005-2026'),

  ('55555555-1111-1111-1111-000000000006', '33333333-1111-1111-1111-000000000002',
   'Signal Crossbody Pouch', 'signal-crossbody-pouch',
   'Compact 2L crossbody pouch in nylon with an RFID-blocking inner pocket, quick-release buckle, and adjustable strap. Fits phone, keys, and cards.',
   '11111111-1111-1111-1111-000000000006',
   185, 149, 'AED',
   array['https://picsum.photos/seed/prd-006/800/800'],
   array['bag','accessory','everyday','nylon'],
   'in_stock', 64, false, false, false,
   array[]::text[], 'CYB-006-2026'),

  ('55555555-1111-1111-1111-000000000007', '33333333-1111-1111-1111-000000000003',
   'Cyber Commute Full Set', 'cyber-commute-full-set',
   'The complete look: Cyber Core Tee + Luna Blue Cargo Pants + Bliss Bucket Hat, bundled and priced together. Available in S–XL. Mix sizes at checkout.',
   '11111111-1111-1111-1111-000000000004',
   699, 549, 'AED',
   array['https://picsum.photos/seed/prd-007/800/800'],
   array['combo','lifestyle','bundle','featured'],
   'in_stock', 24, true, false, true,
   array['S','M','L','XL'], 'CYB-007-2026'),

  ('55555555-1111-1111-1111-000000000008', '33333333-1111-1111-1111-000000000003',
   'Studio Fleece Joggers', 'studio-fleece-joggers',
   'Midweight French-terry fleece joggers with a tapered leg and ribbed cuffs. Ideal for studio sessions and late-night drops. Stone Grey.',
   '11111111-1111-1111-1111-000000000002',
   295, null, 'AED',
   array['https://picsum.photos/seed/prd-008/800/800'],
   array['pants','joggers','fleece','lifestyle','comfort'],
   'in_stock', 88, false, false, false,
   array['S','M','L','XL','XXL'], 'CYB-008-2026'),

  ('55555555-1111-1111-1111-000000000009', '33333333-1111-1111-1111-000000000003',
   'Wide-Visor Shield Shades', 'wide-visor-shield-shades',
   'Oversized shield-style sunglasses with a single curved lens in smoked grey. Lightweight TR90 frame. UV400 protection. Currently sold out — restock TBD.',
   '11111111-1111-1111-1111-000000000006',
   210, null, 'AED',
   array['https://picsum.photos/seed/prd-009/800/800'],
   array['accessory','sunglasses','shield','lifestyle'],
   'out_of_stock', 0, false, false, false,
   array[]::text[], 'CYB-009-2026')
on conflict (id) do nothing;

-- SEO tags (hidden from storefront, used by search) -------------------------
update products set seo_tags = array['xp','windows','retro','y2k','nostalgia','boot','graphic tee']
  where slug = 'xp-boot-screen-tee';
update products set seo_tags = array['cargo','tactical','workwear','utility','blue']
  where slug = 'luna-blue-cargo-pants';
update products set seo_tags = array['bucket hat','bliss','xp wallpaper','summer','printed hat']
  where slug = 'bliss-wallpaper-bucket-hat';

-- Wire featured/lifestyle products to custom_groups -------------------------
insert into product_custom_groups (product_id, custom_group_id) values
  ('55555555-1111-1111-1111-000000000001', '44444444-1111-1111-1111-000000000001'),
  ('55555555-1111-1111-1111-000000000002', '44444444-1111-1111-1111-000000000001'),
  ('55555555-1111-1111-1111-000000000003', '44444444-1111-1111-1111-000000000001'),
  ('55555555-1111-1111-1111-000000000003', '44444444-1111-1111-1111-000000000003'),
  ('55555555-1111-1111-1111-000000000004', '44444444-1111-1111-1111-000000000003'),
  ('55555555-1111-1111-1111-000000000007', '44444444-1111-1111-1111-000000000002'),
  ('55555555-1111-1111-1111-000000000007', '44444444-1111-1111-1111-000000000003'),
  ('55555555-1111-1111-1111-000000000008', '44444444-1111-1111-1111-000000000002'),
  ('55555555-1111-1111-1111-000000000009', '44444444-1111-1111-1111-000000000002')
on conflict do nothing;
