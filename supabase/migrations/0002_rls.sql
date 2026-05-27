-- Cybertronics Stage 2 — Row Level Security
-- Run AFTER 0001_init.sql.

alter table profiles              enable row level security;
alter table categories            enable row level security;
alter table product_groups        enable row level security;
alter table custom_groups         enable row level security;
alter table products              enable row level security;
alter table product_custom_groups enable row level security;
alter table orders                enable row level security;
alter table order_items           enable row level security;
alter table save_for_later        enable row level security;

-- ---------------------------------------------------------------------------
-- Helper : is the current session user an admin?
-- security definer so the policy can read profiles even when caller can't.
-- ---------------------------------------------------------------------------
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  )
$$;

-- ---------------------------------------------------------------------------
-- profiles : self-read/update; admin sees all; insert allowed on signup row
-- ---------------------------------------------------------------------------
create policy "profiles_self_read"
  on profiles for select
  using (id = auth.uid() or is_admin());

create policy "profiles_self_update"
  on profiles for update
  using (id = auth.uid());

create policy "profiles_insert_on_signup"
  on profiles for insert
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Public catalog : everyone reads, admin writes
-- ---------------------------------------------------------------------------
create policy "categories_public_read" on categories
  for select using (true);
create policy "categories_admin_write" on categories
  for all using (is_admin()) with check (is_admin());

create policy "product_groups_public_read" on product_groups
  for select using (true);
create policy "product_groups_admin_write" on product_groups
  for all using (is_admin()) with check (is_admin());

create policy "custom_groups_public_read" on custom_groups
  for select using (true);
create policy "custom_groups_admin_write" on custom_groups
  for all using (is_admin()) with check (is_admin());

create policy "products_public_read" on products
  for select using (true);
create policy "products_admin_write" on products
  for all using (is_admin()) with check (is_admin());

create policy "pcg_public_read" on product_custom_groups
  for select using (true);
create policy "pcg_admin_write" on product_custom_groups
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Orders : customer reads own; admin reads/updates all; guest checkout allowed
-- ---------------------------------------------------------------------------
create policy "orders_self_or_admin_read" on orders
  for select using (customer_id = auth.uid() or is_admin());

create policy "orders_insert_open" on orders
  for insert with check (true);

create policy "orders_admin_update" on orders
  for update using (is_admin()) with check (is_admin());

create policy "order_items_via_order_read" on order_items
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_id
        and (o.customer_id = auth.uid() or is_admin())
    )
  );

create policy "order_items_insert_open" on order_items
  for insert with check (true);

-- ---------------------------------------------------------------------------
-- Save for later : strictly per-customer; requires auth
-- ---------------------------------------------------------------------------
create policy "save_for_later_self_all" on save_for_later
  for all
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
