# Supabase setup (Stage 2)

End-to-end checklist for wiring this project to a Supabase backend. Run this once per environment (local dev, staging, prod).

## 1. Create the project

1. Sign in at https://supabase.com.
2. **New project** → pick a name (e.g. `cybertronics-dev`), region (closest to you), and a strong DB password (save it).
3. Wait for the project to provision (~1 min).

## 2. Copy keys into `.env.local`

From **Project Settings → API**:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, do not expose to the browser)

```bash
cp .env.local.example .env.local
# then edit .env.local
```

## 3. Apply the schema

Two ways:

### Option A — SQL Editor (fastest)
1. Open **SQL Editor** in the Supabase dashboard.
2. Paste the contents of `supabase/migrations/0001_init.sql`, click **Run**.
3. Paste `supabase/migrations/0002_rls.sql`, click **Run**.
4. (Optional) Paste `supabase/seed.sql` for sample data.

### Option B — Supabase CLI
```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase db push          # runs files in supabase/migrations/
psql "$DATABASE_URL" -f supabase/seed.sql   # optional
```

## 4. Promote your user to admin

After signing up via the app (or via the Supabase dashboard → Authentication → Users → Invite), run in SQL Editor:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

This is required because the RLS policies in `0002_rls.sql` gate all admin writes on `role = 'admin'`.

## 5. Verify

```bash
npm run dev
```

Open the app. The console should *not* show `[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing`. If it does, double-check `.env.local` and restart the dev server.

## What's wired vs not

| Surface | Source of truth (now) | Source of truth (after Chunk H) |
|---|---|---|
| Products / Categories / Groups | `lib/data/seedProducts.ts` + localStorage | Supabase (via `lib/api/*`) |
| Cart | `useCartStore` persist → localStorage | Same for guests; per-user Supabase for signed-in |
| Orders | `useDataStore.orders` | Supabase `orders` + `order_items` |
| Save for Later | not yet | Supabase `save_for_later` (requires auth) |
| Product images | URL fields | Supabase Storage bucket `product-images` (Chunk H) |
| Admin auth | open | Supabase Auth + middleware role check (Chunk H) |

## Notes

- The `lib/supabase/types.ts` file is hand-written for now. Once you've applied the migrations, replace it with `npx supabase gen types typescript --linked > lib/supabase/types.gen.ts` and re-export from there.
- `is_admin()` in `0002_rls.sql` is a `security definer` function so policies can read `profiles` even when the caller's own RLS would block it. Don't drop the `security definer` clause.
- The `images` array has a CHECK constraint of 15. Brief §5 calls for "up to 15 high-res images per product."
