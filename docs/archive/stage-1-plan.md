# Stage 1 Plan (archived)

Original lives at `C:\Users\aldus\.claude\plans\i-have-a-next-js-reactive-dusk.md` (Claude Code plan store, outside project). This is the condensed actionable version.

## Chunk progress

| Chunk | Owner | Status | Notes |
|---|---|---|---|
| A | Opus | DONE | Root layout, globals.css XP tokens, `(xp)` shell, Taskbar v1, DesktopIcon |
| B | Opus | DONE | Types, stores (xp/data), WindowManager, Window, StartMenu, MyComputer, appRegistry, seed |
| B-visual-pass | Sonnet | DONE | Authentic XP Luna chrome — multi-stop gradients on Taskbar, Window, StartMenu, MyComputer; Tahoma font; XP color tokens |
| B-ux-pass | Opus | DONE | BootScreen, WallpaperLayer, settingsStore, Terminal, Settings, About, Help, Contact, SearchOverlay, window resize. Inspired by wesdieleman.com UX. |
| C | Opus | IN PROGRESS | Admin shell at `/admin` (NOT route group — would collide with `(xp)/page.tsx`). Sidebar, Topbar, StatCard, DataTable, ConfirmDialog, Button/Input/Modal primitives, dashboard with 6 stats + recent products table. |
| D | Sonnet | DONE | XP apps breadth — LifestyleFolder, ProductCard, ProductDetail, Notepad, Paint, MusicPlayer, VideoPlayer, Gallery |
| E | Sonnet | DONE | Admin breadth — ProductGroupManager, ProductEditor, ImageUploadField, categories page |
| F | Sonnet | DONE | Copy polish (AED prices, descriptions), eslint sweep, SSR guard fix in useHydrated |

## Locked decisions (do not re-litigate)
- Currency: AED. Constant in `lib/utils.ts`.
- Data storage: Zustand + persist on `cybertronics:data:v1`. TODO swap to Supabase.
- Window state: Zustand NOT persisted (positions reset on reload — desired).
- Settings: Zustand + persist on `cybertronics:settings:v1` (wallpaper only).
- Auth: none for S1. TODO add Supabase Auth gate on `(admin)`.
- Image upload: URL-only field. TODO swap for Supabase Storage upload.
- Mobile (<768px): stacked cards, no drag.
- Route groups: `(xp)` and `(admin)` (separate layouts).
- Icons: lucide-react + emoji where playful.
- One Lifestyle folder component, parameterized by `categorySlug` payload.

## NOT in Stage 1 (defer to S2)
Real auth · real DB · real upload · cart/checkout · window maximize functionality · real audio/video files · search-filter UI on storefront · pagination · i18n · theme switching · tests · CI · per-customer accounts UI · admin orders UI

## Window resize (added to S1 during B-ux-pass)
Originally NOT-S1, promoted because wesdieleman.com reference UX includes it. Implementation: pointer-events on bottom-right grip, raw event listeners (no framer-motion drag), updates `xpStore.resize(id, w, h)` with min size constraints.
