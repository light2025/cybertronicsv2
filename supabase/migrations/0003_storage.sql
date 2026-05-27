-- Storage bucket for product images.
-- Run AFTER 0001_init.sql + 0002_rls.sql (needs the is_admin() helper).
--
-- Bucket settings:
--   • Public read (product photos are customer-facing)
--   • Admin-only writes (uses is_admin() from RLS migration)
--   • 4MB file size limit
--   • Restricted to common image MIMEs

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public            = excluded.public,
  file_size_limit   = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Object-level RLS policies.
-- (Supabase's storage.objects table already has RLS enabled by default.)
-- `drop policy if exists` keeps the migration re-runnable — Supabase's
-- create policy is non-idempotent, so without these drops a second run
-- fails with 42710 "policy already exists".

drop policy if exists "product_images_public_read"   on storage.objects;
drop policy if exists "product_images_admin_insert"  on storage.objects;
drop policy if exists "product_images_admin_update"  on storage.objects;
drop policy if exists "product_images_admin_delete"  on storage.objects;

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());

create policy "product_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'product-images' and is_admin())
  with check (bucket_id = 'product-images' and is_admin());

create policy "product_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());
