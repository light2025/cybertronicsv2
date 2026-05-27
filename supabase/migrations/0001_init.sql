-- Cybertronics Stage 2 — initial schema
-- Run via Supabase CLI: `supabase db push` (after `supabase link`).
-- Or paste into Supabase SQL Editor for the linked project.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- profiles : 1-1 with auth.users. Role drives admin access.
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  email text,
  role text not null default 'customer' check (role in ('guest','customer','admin')),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- categories : single recursive tree. parent_category null = top-level.
--             Sub-categories live here too, with parent_category set.
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  parent_category uuid references categories(id) on delete set null,
  icon text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- product_groups : drop/collection containers (one-per-product).
-- ---------------------------------------------------------------------------
create table product_groups (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  cover_image text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- custom_groups : owner-defined tag-like buckets (many-to-many w/ products).
--                Brief §5 calls these "Custom Groups" alongside category.
-- ---------------------------------------------------------------------------
create table custom_groups (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products : the catalog. Stage 2 expansion of Stage 1 type.
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references product_groups(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null default '',
  category uuid references categories(id) on delete set null,
  sub_category uuid references categories(id) on delete set null,
  price numeric(10,2) not null check (price >= 0),
  discount_price numeric(10,2) check (discount_price is null or discount_price >= 0),
  currency text not null default 'AED',
  images text[] not null default '{}'::text[] check (cardinality(images) <= 15),
  primary_image_index int not null default 0 check (primary_image_index >= 0),
  videos text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  seo_tags text[] not null default '{}'::text[],
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock','out_of_stock','preorder')),
  stock_count int not null default 0 check (stock_count >= 0),
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_selling boolean not null default false,
  available_sizes text[] not null default '{}'::text[],
  available_colors text[] not null default '{}'::text[],
  barcode text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- product ↔ custom_groups (many-to-many)
create table product_custom_groups (
  product_id uuid not null references products(id) on delete cascade,
  custom_group_id uuid not null references custom_groups(id) on delete cascade,
  primary key (product_id, custom_group_id)
);

-- ---------------------------------------------------------------------------
-- orders : guest-friendly (customer_id nullable). Status tracks fulfilment.
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  discount_total numeric(10,2) not null default 0 check (discount_total >= 0),
  shipping numeric(10,2) not null default 0 check (shipping >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('cart','pending','paid','shipped','cancelled')),
  payment_method text check (payment_method in ('tabby','tamara','card','cod')),
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  title text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total_price numeric(10,2) not null check (total_price >= 0),
  selected_size text,
  selected_color text
);

-- ---------------------------------------------------------------------------
-- save_for_later : per-customer wishlist. Variant-keyed like cart lines.
-- ---------------------------------------------------------------------------
create table save_for_later (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  selected_size text,
  selected_color text,
  saved_at timestamptz not null default now(),
  unique (customer_id, product_id, selected_size, selected_color)
);

-- ---------------------------------------------------------------------------
-- Indexes : tuned for the filters the brief calls out.
-- ---------------------------------------------------------------------------
create index idx_categories_parent on categories(parent_category);
create index idx_products_category on products(category);
create index idx_products_sub_category on products(sub_category);
create index idx_products_group on products(group_id);
create index idx_products_new_arrival on products(is_new_arrival) where is_new_arrival;
create index idx_products_best_selling on products(is_best_selling) where is_best_selling;
create index idx_products_featured on products(is_featured) where is_featured;
create index idx_products_on_sale on products(discount_price) where discount_price is not null;
create index idx_products_barcode on products(barcode) where barcode is not null;
create index idx_products_seo_tags on products using gin (seo_tags);
create index idx_products_tags on products using gin (tags);
create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);
create index idx_order_items_order on order_items(order_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

create trigger product_groups_set_updated_at before update on product_groups
  for each row execute function set_updated_at();
