# Cybertronics — XP T-Shirt Store

A retro Windows XP-themed storefront for the Cybertronics t-shirt label. The whole site is a fake desktop OS: products live inside a draggable "Lifestyle" window opened from My Computer / Start Menu / Internet Explorer. A modern admin panel sits at `/admin` for catalog management.

- **Stack**: Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · Zustand · framer-motion · lucide-react
- **Backend (planned)**: Supabase (Auth, Postgres, Storage)
- **Currency**: AED
- **Status**: Stage 1 complete — frontend works end-to-end on localStorage. Stage 2 is this roadmap.

---

## Run

```bash
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Routes

| Path | What |
|---|---|
| `/` | XP desktop (route group `app/(xp)`) |
| `/admin` | Admin dashboard (not yet auth-gated) |

See `CLAUDE.md`, `QUICK_START.md`, `ARCHITECTURE_MAP.md`, and `COMMON_MISTAKES.md` for the working contracts. Read those before editing — they encode load-bearing decisions (route-group naming, pointer-events rule, lucide trademark gotchas, Zustand selector pitfalls).

---

## What works today

- XP desktop chrome: boot screen, wallpaper, taskbar, draggable/resizable windows, start menu, Ctrl+K search.
- Apps: My Computer, Lifestyle (category browse + product cards), Product Detail, Gallery, Notepad, Paint, Music, Video, Settings, About, Contact, Terminal, Help.
- Admin: dashboard, products CRUD, groups CRUD, categories CRUD.
- Shared `useDataStore` so admin edits show up in the storefront on next render.
- Persisted state via Zustand `persist` middleware (`cybertronics:data:v1`, `cybertronics:settings:v1`).
- Mobile fallback: WindowManager stacks windows as vertical cards under 768px.

## What's stubbed

- No backend. `@supabase/supabase-js` is installed but never imported.
- No auth on `/admin`.
- No cart, no checkout, no order processing.
- Music/Video tracks have empty `src` (decorative only).
- `ImageUploadField` only accepts URLs — no real upload.
- `updateCategory` missing in `dataStore` (admin hacks delete+re-add).
- `Window.maximize` button is wired to `() => {}`.

---

# Improvement Roadmap

Organised by area. Each item has a target state and the rough touch surface.

## 1. Storefront shell — nostalgia polish

### 1.1 Real icon set
**Today**: lucide-react glyphs (clean, modern).
**Target**: authentic XP/Vista icon set for desktop, start menu, and window titlebars.
**Where**:
- Add `/public/icons/xp/` with PNG/ICO assets (My Computer, IE, Recycle Bin, Paint, Notepad, Calculator, WMP, Folder, etc.).
- Extend `appRegistry.ts` `AppDef` with `iconUrl?: string` alongside the existing `Icon: LucideIcon`. Components prefer `iconUrl` when present and fall back to lucide.
- Keep lucide for admin/UI primitives — only XP surfaces switch.

### 1.2 Real wallpapers (4 OS eras)
**Today**: 6 CSS-only gradient wallpapers.
**Target**: 4 photographic wallpapers covering the OS history.
- **Windows XP Bliss** (the hill)
- **Windows Vista** (Aurora)
- **Windows 10 Hero** (geometric)
- **Windows 11 Bloom** (flower)

**Where**:
- Vendor real JPGs into `/public/wallpapers/{xp,vista,win10,win11}.jpg`.
- Rewrite `WALLPAPERS` map in `components/xp/WallpaperLayer.tsx` to use `backgroundImage: url(...)`.
- Keep the CSS gradient ones as a "Classic" tab in Settings for the lighter bundle.

### 1.3 Folder structure rework
**Today**: My Computer shows a flat shortcut grid + a sidebar.
**Target**: nested folders that mirror XP Explorer.
- **Top level**: `My Documents`, `My Pictures`, `My Music`, `Shop` (replaces Lifestyle root), `Network`, `Recycle Bin`.
- Each folder is a window with a breadcrumb path and back/up navigation in the toolbar.
- Generalise `LifestyleFolder.tsx` into a `Folder.tsx` driven by a tree definition; Lifestyle becomes one configured node.
- Add `lib/data/folderTree.ts` for the tree shape; admin can later edit it.

### 1.4 Classic "My Computer" button on desktop
**Today**: identical to other desktop icons.
**Target**: matches the classic XP "My Computer" pinned icon — slightly larger, distinct rendering, always top-left.
- Pin position in `app/(xp)/page.tsx`; render with the new icon set; add a thin selection ring on focus.

### 1.5 Internet Explorer (NEW) — Lifestyle moves inside
**Today**: Lifestyle is a top-level XP app.
**Target**: an Internet Explorer 6 window with an address bar, back/forward/refresh/home buttons, and a "page" area. The shop loads inside it at `cybertronics://shop`.

**Why this matters**: it's the centrepiece nostalgia move — browsing the store should feel like opening IE in 2002. Lifestyle as a standalone window competes with IE for the same job.

**Where**:
- New app `components/xp/apps/InternetExplorer.tsx`. Registry id `'ie'`.
- IE owns its own mini-router: a stack of `{url, title, payload}` entries with back/forward.
- Built-in URLs:
  - `cybertronics://shop` → renders the existing `LifestyleFolder` content
  - `cybertronics://shop/<categorySlug>` → category drilldown
  - `cybertronics://product/<slug>` → product detail
  - `cybertronics://about`, `cybertronics://contact`, `cybertronics://help` → static pages
- Address bar accepts `cybertronics://` URLs and falls back to a fake "page not found" for anything else.
- `LifestyleFolder` becomes a route-aware component receiving the parsed URL instead of `payload.categorySlug`.
- Remove `lifestyle` from `startMenuApps` (still available, but hidden — IE replaces it as the user-facing entry).
- Add IE as a desktop icon and the top Start Menu pin.

### 1.6 Start menu — user profile + logout
**Today**: header shows hard-coded `🧑‍💻 Cybertronics`.
**Target**: real user data in the header, **logout** in the footer.
- Read from a new `authStore` (see §5). Show `avatarUrl`, `displayName`, `email`.
- Footer: replace "Turn Off Computer" semantics — keep visual, but make "Log Off" call `authStore.logout()`, which returns to the dial-up login screen.
- Add a `Sign in as someone else…` link for completeness.

### 1.7 Taskbar notifications (admin-controlled)
**Today**: taskbar shows clock + running windows only.
**Target**: a small system-tray notification icon next to the clock. Click → popover with messages. Admin posts them.
- New table/store: `Notification { id, type: 'discount'|'arrival'|'offer'|'info', title, body, link?: {appId,payload?}, createdAt, expiresAt?, dismissedBy?: string[] }`.
- Component: `components/xp/TrayNotifications.tsx` — icon with unread badge, balloon-style popover (XP "balloon tip" aesthetic on first new notification).
- Admin page `/admin/notifications` — create/edit/expire, target audience (all / logged in / role).
- `link` opens the relevant XP window when clicked (e.g. a discount opens `ie` at `cybertronics://shop`).

---

## 2. Apps — per-app plan

### 2.1 Notepad — keep as is
Status: working. Saves to `localStorage['cybertronics:notepad']`. No changes.

### 2.2 Paint — improve
**Add**:
- Undo / redo stack (store last N `ImageData` snapshots in a ref, capped at ~20 to avoid memory bloat).
- Save as PNG (download via `canvas.toDataURL('image/png')` + temp `<a>`).
- Open image (file input → drawImage to canvas).
- Brush tool with adjustable opacity.
- Rectangle / ellipse / line shape tools.
- Custom colour picker (`<input type="color">`).
- Eyedropper.

**Why**: today it's only pencil/fill/eraser. A real Paint clone needs at least the shape tools and save-to-disk to be useful.

### 2.3 Calculator — NEW
A standard XP calculator (Standard mode only for v1; Scientific in v2).
- File: `components/xp/apps/Calculator.tsx`. AppId `'calculator'`.
- Buttons: 0–9, +, −, ×, ÷, =, %, ±, ., C, CE, ←, MR/MC/MS/M+.
- Display: top-right aligned, monospace, max 16 chars.
- Keyboard input support.
- Add to registry + start menu + Accessories submenu (when accessory grouping ships).

### 2.4 Music Player — classic Windows Media Player rebuild
**Today**: dark-themed compact player.
**Target**: looks like Windows Media Player 9/10 (XP-era) — blue-glass chrome, big "Now Playing" panel, equaliser visualisation, playlist sidebar with track count + total time.

**Add**:
- Playlists (saved sets): `Playlist { id, name, trackIds[] }`. Default playlist is "All Music".
- Real audio. Vendor 6–10 royalty-free tracks into `/public/audio/` OR use a free streaming source (admin controls the list — see §6.6).
- Working play/pause/seek/volume/next/prev (the wiring exists; just point to real `src`).
- Equaliser visualisation: a series of bars animated via `requestAnimationFrame` driven by the `<audio>` element's `AnalyserNode` from Web Audio API.
- Mini mode (collapsed) toggle.

### 2.5 Video Player — YouTube gallery
**Today**: 3 hard-coded items with empty `src`.
**Target**: embedded YouTube player playing curated gallery videos chosen by admin.

**Add**:
- Switch the `<video>` element for a YouTube iframe (`https://www.youtube.com/embed/<id>?...`).
- Use the YouTube IFrame API for the play/pause/progress wiring (already drafted in the component).
- Admin page `/admin/videos` — manage a list of `{ id, title, description, youtubeUrl, position }`. Parse the YouTube ID server-side (or with a small client util `extractYoutubeId`).
- Store: new `videos` slice in `useDataStore` (or separate `mediaStore`).
- Playlist sidebar shows real thumbnails (`https://img.youtube.com/vi/<id>/hqdefault.jpg`).

### 2.6 Internet Explorer — see §1.5

---

## 3. Settings — dark/normal theme

**Today**: wallpaper picker, dummy sound tab, about tab.
**Target**:
- **Themes**: `xp-luna-blue` (default), `xp-silver`, `xp-olive`, plus a **Dark** theme for the admin panel (storefront stays Luna because dark XP wasn't a thing).
- Wallpaper tab uses the new real wallpapers (§1.2).
- Add a Display tab section for taskbar size (auto-hide toggle, small icons toggle).
- About tab: show real build info (Next.js / build hash via env var at build time).

**Where**:
- Extend `settingsStore` with `theme: 'luna-blue' | 'silver' | 'olive' | 'dark'`.
- `theme` becomes a CSS class on `<html>`; Tailwind v4 `@theme inline` already supports per-class theme blocks — declare alternate token sets.
- Admin reads the same store but only respects `light` / `dark`.

---

## 4. Gallery — curated images

**Today**: flattens every product image into one grid; "Lookbook" mode shows only featured products.
**Target**: a curated subset, chosen by admin, in a specific order. Plus the existing "All product images" view as a fallback.

**Where**:
- Extend `useDataStore` with `galleryItems: GalleryItem[]`.
  `GalleryItem { id, imageUrl, caption?, productId?, position }`.
- Admin page `/admin/gallery` — pick from product images (multi-select grid) + add standalone images, reorder by drag (start with up/down arrows; drag later).
- Gallery app reads `galleryItems` in order. Lookbook mode keeps the "featured products" filter.

---

## 5. Authentication — dial-up login + 2FA + reset

### 5.1 Dial-up connection login screen
**Today**: no login. Anyone hits `/` and sees the desktop.
**Target**: pre-desktop overlay styled like the Windows XP "Connect to the Internet" dialer.
- Fake CRT-style dialog: Username, Password, Save password checkbox, Dial button.
- On Dial: animated phases — "Dialing… Verifying username and password… Registering computer on the network… Authenticated."
- Underneath the cinematic, a real Supabase Auth `signInWithPassword` call.
- After success → BootScreen → desktop. After failure → "Could not connect. Verify the username and password."
- File: `components/xp/auth/DialupLogin.tsx`. Mounted from `(xp)/layout.tsx` ahead of BootScreen.
- Skip-button in dev mode for fast iteration.

### 5.2 2FA via authenticator app
- Use Supabase Auth's TOTP factor (`auth.mfa.enroll({factorType:'totp'})`).
- After password phase succeeds, dialer flips to a second phase: "Verifying secondary factor…" with a 6-digit input.
- Settings → Security tab: enrol authenticator, view recovery codes (downloadable .txt), unenrol with re-auth.

### 5.3 Password reset / recovery
- "Forgot password?" link on the dialer.
- Page `/auth/reset` (outside `(xp)` group, plain UI) — email entry, calls `auth.resetPasswordForEmail`.
- Email template (configure in Supabase): "Reset your Cybertronics password". Link returns to `/auth/reset/confirm` to set a new one.
- Secondary recovery: support a phone-number factor for future sprint.

### 5.4 Session state
- New `lib/store/authStore.ts` — Zustand slice over the Supabase session.
  `{ user, profile, role, loading, signIn, signOut, refresh }`
- Profile shape: `{ id, displayName, avatarUrl, email, role: 'guest'|'customer'|'admin' }`.
- Admin layout middleware: `/middleware.ts` calls `supabase.auth.getUser()` and rewrites to `/auth/login` if missing or non-admin.
- Storefront stays open to guests but features that need auth (cart save, orders) gate via this store.

---

## 6. Admin panel

### 6.1 Multi-image product gallery (Amazon/Flipkart style)
**Today**: thumbnails appended via a URL field; `ProductDetail` shows a single image with chevron paging.
**Target**:
- Admin: drag-to-reorder image grid; first image is "primary" (used as card thumbnail); add via Supabase Storage upload (or URL fallback during transition).
- Storefront `ProductDetail`: large main image with left/right arrow nav, thumbnail strip below (or to the left, your call), keyboard arrow support, hover-zoom on desktop.
- Type already supports it (`images: string[]`). Add a `primaryImageIndex?: number` field, or just treat `images[0]` as primary (simpler — recommend the latter).

### 6.2 Image upload (Supabase Storage)
- New bucket `product-images` (public read, authenticated write).
- Replace `ImageUploadField` with: drop-zone + file input → upload to `/products/<productId>/<uuid>.<ext>` → save returned public URL.
- Image optimisation: Supabase Storage transformations (`?width=600&quality=80`) or Next `<Image>` with the Supabase loader.
- Validate: mime in `['image/jpeg','image/png','image/webp']`, size < 4 MB.

### 6.3 Light / Dark theme
- Add a theme toggle in the admin Topbar (sun/moon icon).
- Drives the same `settingsStore.theme` flag (admin-only branch: `light` / `dark`).
- All admin components already use Tailwind utilities — add `dark:` variants. Re-paint cards (`bg-white` → `dark:bg-zinc-900`, etc.).
- Persisted per-user once auth ships (write to `profiles.preferences` JSON column).

### 6.4 Minimalist redesign for owner ergonomics
- Reduce visual chrome: thinner sidebar (220 → 192 px), smaller stat cards on mobile (already mostly OK), denser tables.
- Replace the dashboard's six-card stats grid with a focused "today" panel (orders today, revenue today, low-stock list) and a sparkline.
- Use system fonts (Geist is already imported but unused in admin — wire it up).
- Single accent colour (`--color-cyber`) — keep usage <10% of any view.

### 6.5 Admin controllers for storefront content
Add admin pages that drive the storefront content the user listed:
- `/admin/notifications` — create/edit taskbar notifications (§1.7).
- `/admin/gallery` — pick which product images go into the Gallery app (§4).
- `/admin/videos` — manage YouTube video gallery (§2.5).
- `/admin/wallpapers` — optional: upload custom wallpapers that appear in user Settings.
- `/admin/site-content` — edit About / Contact / Help bodies (currently hard-coded text).

### 6.6 2FA enrolment UI
- `/admin/security` — enrol TOTP, list active sessions, revoke. (Same code path as user-facing 2FA; admin just lands here on first login if not enrolled.)

---

## 7. Backend — Supabase migration

### 7.1 Schema
```
profiles          (id PK = auth.users.id, display_name, avatar_url, role, preferences jsonb)
categories        (id, title, slug, parent_category, icon)
product_groups    (id, title, slug, description, cover_image, is_active, timestamps)
products          (id, group_id, title, slug, description, category, price, discount_price,
                   currency, images jsonb, video_url, tags text[], stock_status,
                   is_featured, timestamps)
orders            (id, customer_id FK profiles, customer_name, customer_email,
                   customer_phone, subtotal, discount_total, total, status, created_at)
order_items       (id, order_id FK, product_id, title, quantity, unit_price,
                   total_price, selected_size, selected_color)
notifications     (id, type, title, body, link jsonb, created_at, expires_at, audience)
notification_reads(user_id, notification_id, read_at)   -- to track per-user dismissal
gallery_items     (id, image_url, caption, product_id, position)
videos            (id, title, description, youtube_id, position)
```

### 7.2 RLS
- `products`, `product_groups`, `categories`, `gallery_items`, `videos`, `notifications`: public `SELECT`; `INSERT/UPDATE/DELETE` admin role only.
- `orders`, `order_items`: customer can read their own; admin reads all.
- `profiles`: user reads/updates own row; admin reads all.

### 7.3 API layer
- `lib/api/<resource>.ts` for each table. Typed functions that return `Promise<T>`. No raw Supabase calls from components.
- Wrap in TanStack Query (`useProducts()`, `useProduct(id)`, etc.). The persist middleware on `dataStore` then degrades to an offline-only cache or is dropped entirely.

### 7.4 Migration order
1. Read paths first (products list/detail) — admin and storefront keep writing to localStorage for one sprint.
2. Auth + admin protection.
3. Admin write paths — flip CRUD to Supabase, keep local cache for optimistic UI.
4. Storage migration — copy any in-localStorage images to the bucket on user's first authed visit.
5. Retire `dataStore.persist` once writes are server-backed.

---

## 8. Order & cart (carryover)

Still missing from Stage 1. Required to ship as a real store:
- `cartStore` (small Zustand slice, persisted under `cybertronics:cart:v1`).
- "Add to cart" CTA on `ProductDetail` (inside IE).
- Cart XP app (taskbar tray icon shows item count).
- Checkout app (multi-step form, terms checkbox, `placeOrder()` call → Supabase).
- Admin `/admin/orders` — list, status transitions (`pending → paid → shipped → cancelled`).

See `docs/archive/stage-1-plan.md` and the `Order`/`OrderItem` types in `types/index.ts` — schemas are ready.

---

## 9. Code-level cleanups (cheap wins)

These don't change scope but make the codebase healthier:

- Bump `lucide-react` (pinned at `^1.14.0` — far behind current major; the `Instagram` icon is back in newer versions, so `Contact.tsx`'s `AtSign` workaround can be removed).
- Drop `'use client'` from static-text apps (`About`, `Contact`, the static parts of `Help`). Keep client only on interactive islands. Saves bundle.
- Implement `dataStore.updateCategory` and remove the delete+re-add hack in `app/admin/categories/page.tsx`.
- Fix the broken maximize button in `Window.tsx` (`onClick={() => {}}`) — either implement or remove.
- Constrain window resize to `parentRef` bounds so windows can't extend past the desktop area.
- Move Notepad's `localStorage` calls into Zustand so all persistence runs through one mechanism.
- Add Zod schemas for product/group/category forms and reuse the same schema server-side after Supabase migration.
- Add Vitest + RTL with starter tests for: `dataStore` reducers, `useXpStore` open/close/focus invariants, `ProductEditor.validate()`, cart math (once cart lands).
- Search overlay should also match products, not just app titles. Enter on a product hit opens IE at `cybertronics://product/<slug>`.

---

## 10. Folder reorg (suggested)

Once IE wraps Lifestyle and apps multiply, the current flat layout strains. Suggested layout:

```
components/
├── xp/
│   ├── shell/             ← desktop chrome (BootScreen, Taskbar, StartMenu, WallpaperLayer, SearchOverlay, DesktopIcon)
│   ├── window/            ← Window, WindowManager
│   ├── apps/
│   │   ├── ie/            ← Internet Explorer (multi-file: AddressBar, Page, History)
│   │   ├── shop/          ← Folder, ProductCard, ProductDetail (rendered inside IE)
│   │   ├── media/         ← MusicPlayer (WMP rebuild), VideoPlayer (YouTube)
│   │   ├── tools/         ← Notepad, Paint, Calculator, Terminal
│   │   └── system/        ← MyComputer, Settings, About, Contact, Help, Gallery
│   ├── auth/              ← DialupLogin, MfaPrompt
│   └── tray/              ← TrayNotifications
├── admin/
│   ├── layout/            ← Sidebar, Topbar, ThemeToggle
│   ├── tables/            ← DataTable, columns
│   ├── forms/             ← ProductEditor, GroupEditor, CategoryEditor, NotificationEditor
│   └── widgets/           ← StatCard, ImageGalleryField, YouTubeLinkField
└── ui/                    ← Button, Input, Modal, Tabs, Toast

lib/
├── api/                   ← Supabase wrappers (products, groups, categories, orders, notifications, videos, gallery, auth, storage)
├── store/                 ← xpStore, authStore, settingsStore, cartStore, notificationStore
├── data/                  ← seed data (kept until Supabase migration is final)
├── hooks/                 ← useHydrated, useShortcut, useYoutubePlayer
└── utils.ts
```

---

## 11. Delivery phases

Suggested order, each phase shippable on its own:

**Phase A — visual nostalgia**
Real icon set · 4 real wallpapers · classic My Computer button · Internet Explorer with Lifestyle inside · folder restructure · start menu user header.

**Phase B — new apps**
Calculator · Paint upgrade (undo/save/shapes) · Music Player (WMP rebuild + audio) · Video Player (YouTube embed).

**Phase C — auth surface**
Dial-up login screen · session in start menu · logout · forgot-password page. Supabase Auth wired but admin still uses localStorage.

**Phase D — admin controllers**
Notifications · gallery picker · video links · multi-image product gallery · admin dark theme · minimalist refresh.

**Phase E — backend**
Supabase schema + RLS · `lib/api/*` layer · TanStack Query · admin write paths flipped · storage bucket for images · retire `dataStore.persist`.

**Phase F — commerce**
Cart · checkout · orders admin · order status emails.

**Phase G — 2FA + recovery**
TOTP enrolment · recovery codes · password reset flow · session management.

---

## 12. Open questions to decide before building

1. **Single user model or two?** Customers and admins in one `profiles` table (role column) vs separate tables. Recommend single table — Supabase Auth gives one identity per email anyway.
2. **YouTube only or also self-hosted videos?** YouTube-only is cheapest and matches the spec. Self-hosted via Supabase Storage adds bandwidth cost.
3. **Wallpaper personalisation per user or per device?** Today it's localStorage = per device. Recommend per user once auth ships (write to `profiles.preferences`).
4. **Notification dismissal**: per-user (needs a `notification_reads` table) or session-only? Per-user is the right answer if users have accounts; otherwise local.
5. **Internet Explorer URL scheme**: `cybertronics://` is the suggestion. Could also be `http://cybertronics.shop/...` (more realistic). Pick one and stick with it.
6. **Cart for guests?** Allow guest cart (localStorage), persist on login. Standard pattern, worth confirming.
