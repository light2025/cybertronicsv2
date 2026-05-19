# Architecture Map

## Open-app flow (XP desktop)
`<DesktopIcon>` (or `<StartMenu>`, or Terminal `open <app>`) → `useXpStore.open(appId, opts)` → store appends a `WindowState` → `<WindowManager>` re-renders → looks up `apps[appId]` in `appRegistry.ts` → renders `<Window>` wrapping `<App.Component payload={...}>`.

## Open-app flow (Nokia mobile)
Tile on `<AppGrid>` (or status-bar cart shortcut) → `useNokiaStore.push({ kind: 'app', appId })` → `<NokiaShell>` re-renders → looks up `nokiaApps[appId]` in `components/nokia/apps/index.ts` → renders `<NokiaImpl payload={...}>`. Missing entries fall back to a "being ported" placeholder via `<NokiaApp>`.

## Layer order in `app/(xp)/layout.tsx`
Surface splits at the `md` breakpoint (768px). Two disjoint trees — never both mounted.
```
<main className="relative h-screen w-screen bg-xp-desktop overflow-hidden font-xp">
  <div className="hidden md:contents">      {/* desktop ≥ md */}
    <WallpaperLayer/>
    {children}                              {/* page.tsx desktop icons */}
    <WindowManager/>
    <StartMenu/>
    <Taskbar/>
    <SearchOverlay/>
    <BootScreen/>
  </div>
  <div className="md:hidden">                {/* phone < md */}
    <NokiaShell/>
  </div>
</main>
```
Note: `WindowManager.tsx` still has an `isMobile` branch (stacked cards). It is **dead** — under `md`, NokiaShell renders instead and WindowManager never mounts. The branch is kept harmless but should not be relied on.

## Stores (zustand)
- **`xpStore`** — windows (open/close/focus/move/resize/minimize), zCounter, startMenuOpen, isMobile. Not persisted.
- **`nokiaStore`** — `stack: NokiaScreen[]` with `push/pop/reset`. `kind: 'standby' | 'menu' | 'app'`. Not persisted (always boots to standby).
- **`dataStore`** — products, groups, categories, orders. Persisted to `cybertronics:data:v1`. Seeded on first load. Exports `useHydrated()` to gate render against rehydration flash. Listens for cross-tab `storage` events and re-runs `persist.rehydrate()`.
- **`cartStore`** — cart items (with optional `selectedSize` / `selectedColor`). Persisted to `cybertronics:cart:v1`. Exports `useCartHydrated()`. Lines dedupe on `(productId, selectedSize, selectedColor)`. Same cross-tab listener pattern.
- **`settingsStore`** — wallpaper, searchOpen. Wallpaper is persisted; searchOpen is session-only.

## Drag (XP only — framer-motion pattern)
- `<Window>` is `motion.div drag dragControls={controls} dragListener={false}` so the whole div doesn't trigger drag.
- Titlebar `<header onPointerDown={(e) => controls.start(e)}>` is the drag handle.
- `useMotionValue(x/y)` synced from store on `onDragEnd → store.move(id, x, y)` and via `useEffect` when store position changes externally.
- `dragConstraints={parentRef}` keeps windows inside desktop bounds.

## Pointer-events rule (XP only)
- `WindowManager` outer = `pointer-events-none` (so desktop icons stay clickable underneath).
- Each `<Window>` = `pointer-events-auto`.

## Mobile shell (Nokia)
The mobile surface is a separate metaphor (early-2000s feature phone), not a responsive shrink of the XP desktop.

**Layout** (rendered by `components/nokia/NokiaShell.tsx`):
```
┌────────────────────┐
│ StatusBar          │ ← signal, carrier, cart count (clickable), battery, clock
├────────────────────┤
│ Title bar (opt)    │ ← shows on Menu and app screens
├────────────────────┤
│                    │
│   Screen body      │ ← Standby | AppGrid | NokiaApp
│                    │
├────────────────────┤
│ SoftKeys           │ ← left + right (left undefined on app screens — no dead buttons)
└────────────────────┘
```

**Navigation model:** stack, not windows. `nokiaStore.push(screen)` and `pop()`. Always boots to `{kind:'standby'}`. Right softkey on app screens is `Back` → `pop()`.

**App registry split (intentional):**
- `components/nokia/apps/index.ts` exports:
  - `nokiaApps` — Nokia-specific impl per AppId (mirror of XP apps, mobile-shaped).
  - `nokiaMenuApps` — commerce-only allowlist for the menu grid. Does **not** read from `startMenuApps()` because that leaks XP utility apps (Notepad/Paint/Terminal/Music/Video) onto the phone.

**Visual treatment:** `AppGrid` uses chunky emoji icons (👕 🖼️ 🛒 ⚙️ ℹ️ ✉️) on plain white with drop-shadow — old-phone metaphor, not modern lucide.

## Storefront ↔ Admin data sync
- **Single source of truth:** `useDataStore` (products, categories, orders); `useCartStore` (cart items). All three surfaces (Admin, XP, Nokia) subscribe.
- **Same-tab updates** propagate instantly via Zustand subscription.
- **Cross-tab updates** propagate via `window.addEventListener('storage', …)` in both stores → `persist.rehydrate()`. The browser only fires `storage` in *other* tabs, so no double-handling.
- **Cross-device sync:** not implemented. localStorage is per-device. Real backend would replace persist middleware — see `TODO(db)` at top of `lib/store/dataStore.ts`.
- `useHydrated()` / `useCartHydrated()` gate render against the brief rehydration window. Required on any Nokia or admin screen that reads persisted state, else seed-flash UX.

## Product variants
- `Product.availableSizes?: string[]` and `Product.availableColors?: string[]` — both optional. Absent → no picker shown.
- Auto-select if there's only one option (no useless single-chip UI).
- `CartItem` carries `selectedSize?` / `selectedColor?`. Dedup key is `(productId, size, color)` — same product in two sizes = two cart lines.
- `OrderItem` already had `selectedSize?` / `selectedColor?` slots in `types/index.ts:51-59` — variant capture flows through to admin OrderDetail.
- CTA state machine on PDPs: `Out of Stock` → `Select a size` → `Select a color` → `Add to Cart — AED X` → `Added to cart`. The button label always explains why it's disabled.
- Admin variant editing: `ProductEditor.tsx` "Variants" section — two comma-separated text fields. Parsed on save, written to the store.

## Visual chrome
- Multi-stop XP gradients via inline `style={{ background: 'linear-gradient(...)' }}` (Tailwind `from-/via-/to-` only supports 3 stops).
- XP color tokens in `app/globals.css` `@theme inline` block.
- Nokia title-bar / sub-header gradient: `linear-gradient(to bottom, #4a86d8 0%, #2060c0 50%, #1448a8 100%)`. Body text: `#0a3060`. See [[feedback-nokia-ui-validated]] in memory.
- Font: Tahoma via `font-xp` token.

## Admin surface (`/admin`)
- Path: `app/admin/` — **not** a route group. `(admin)` parens would collide with `(xp)/page.tsx`.
- Layout: `app/admin/layout.tsx` — Sidebar + Topbar + main scroll area. No XP chrome.
- Building blocks: `components/admin/{Sidebar,Topbar,StatCard,DataTable,ConfirmDialog,ProductEditor,OrderDetail}.tsx`.
- Primitives: `components/ui/{Button,Input,Modal}.tsx` — shared.
- Visual: white cards, `rounded-xl`, light gray bg (`bg-gray-50`), cyan accent (`--color-cyber: #00d4ff`).
- Reads same `useDataStore` as storefront; writes via store actions (`addProduct`, `updateProduct`, `deleteProduct`, …). Gate with `useHydrated()` to avoid SSR/CSR flash on persisted data.
