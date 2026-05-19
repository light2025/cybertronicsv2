# Quick Start

## Run
- `npm run dev` → http://localhost:3000
- `npm run build` → production build (run before claiming "done")
- `npm run lint`

## Surfaces (one app, three faces)
- `/` at ≥ 768px → **XP desktop** (route group `app/(xp)`); draggable windows, taskbar, start menu, boot screen
- `/` at < 768px → **Nokia phone shell** (`components/nokia/NokiaShell.tsx`); status bar, app grid, soft keys, stack nav
- `/admin` → admin panel (white cards, cyan accent). Writes to the same store as the storefront.

## See mobile from your laptop
- DevTools → device mode (`Ctrl+Shift+M`) → pick iPhone/Pixel preset
- Or resize browser window below 768px
- Or visit the LAN URL printed by `next dev` (e.g. `http://192.168.x.x:3000`) from a real phone on the same Wi-Fi

## Add a new XP desktop app (3 steps)
1. Create `components/xp/apps/<Name>.tsx` — one file, default export, takes `{ winId, payload? }`.
2. If new id: add to `AppId` union in `types/xp.ts`.
3. Register in `components/xp/appRegistry.ts`: `{ title, Icon, Component, defaultSize, showInStartMenu }`.

The Window manager, Start menu, and MyComputer all read from the registry.

## Add a Nokia mobile app (3 steps)
1. Create `components/nokia/apps/<NokiaName>.tsx` — default export, takes `{ payload? }`.
2. Register in `components/nokia/apps/index.ts` → `nokiaApps[<appId>] = <NokiaName>`.
3. If it should appear on the phone menu: add the AppId to `nokiaMenuApps` in the same file. **Don't** add new utility apps — mobile is commerce-only.

A Nokia app without a registry entry falls back to a "being ported" placeholder. Add one to unblock the customer journey first; build the real screen later.

## Key paths
**Storefront — XP:**
- `app/(xp)/layout.tsx` — splits desktop vs mobile at `md` breakpoint
- `app/(xp)/page.tsx` — desktop icons grid (must be `'use client'`)
- `components/xp/appRegistry.ts` — single source of truth for XP apps
- `components/xp/Window.tsx` — drag chrome
- `components/xp/apps/*` — one file per XP app

**Storefront — Nokia (mobile):**
- `components/nokia/NokiaShell.tsx` — shell (status bar, title, soft keys)
- `components/nokia/AppGrid.tsx` — emoji-tile menu, reads `nokiaMenuApps`
- `components/nokia/apps/index.ts` — registry + commerce-only allowlist
- `components/nokia/apps/Nokia*.tsx` — one file per mobile app

**Admin:**
- `app/admin/` — pages (not a route group)
- `components/admin/ProductEditor.tsx` — write surface; includes Variants section
- `components/admin/OrderDetail.tsx` — order line items show selectedSize · selectedColor

**Stores:**
- `lib/store/xpStore.ts` — XP windows + drag (not persisted)
- `lib/store/nokiaStore.ts` — Nokia screen stack (not persisted)
- `lib/store/dataStore.ts` — products/orders/categories (persisted: `cybertronics:data:v1`); exports `useHydrated()`; cross-tab sync via `storage` event
- `lib/store/cartStore.ts` — cart with variant dedup (persisted: `cybertronics:cart:v1`); exports `useCartHydrated()`; cross-tab sync
- `lib/store/settingsStore.ts` — wallpaper (persisted: `cybertronics:settings:v1`)

**Seed:**
- `lib/data/seedProducts.ts` — initial products, groups, categories. Only `dataStore.ts` imports this.
