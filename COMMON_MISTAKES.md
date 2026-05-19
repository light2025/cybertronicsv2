# Common Mistakes (debugged before — don't repeat)

## 1. Zustand selector returning a fresh closure → infinite re-renders
```ts
// WRONG: new function on every state change
const closeTop = useXpStore((s) => () => s.close(s.windows.at(-1)?.id ?? ''));
```
Fix: select stable references separately, compute the closure inside the event handler.
```ts
const closeWin = useXpStore((s) => s.close);
const windows = useXpStore((s) => s.windows);
// inside handler: const t = windows.find(...); if (t) closeWin(t.id);
```

## 2. RSC boundary error: Lucide icons crossing server → client
`app/(xp)/page.tsx` initially worked as a server component, but `<DesktopIcon>` is `'use client'` and was passed `Icon: LucideIcon` (a function reference). Functions can't cross the RSC boundary.
Fix: add `'use client'` to any page that hands components/functions to client children. (Or pass a string `appId` and let the client look up the icon — what `DesktopIcon` does now.)

## 3. Desktop icons unclickable when WindowManager mounts
WindowManager's `absolute inset-0` container ate all pointer events even with no windows open.
Fix: `pointer-events-none` on the WindowManager outer div; `pointer-events-auto` on each `<Window>` and each mobile card.

## 4. Tailwind v4: `from-/via-/to-` only supports 3 stops
XP gradients (taskbar, titlebar) need 6–8 stops. Don't bend Tailwind for this — use inline `style={{ background: 'linear-gradient(...)' }}`. Co-locate the gradient string at the top of the component as a constant.

## 5. Hydration mismatch on the clock / time-based UI
Initialize `useState('')` empty. Both SSR and first client render show empty. Populate via `useEffect(() => setTime(...), [])` after mount.

## 6. Zustand+persist hydration flash
Components reading persisted state must be `'use client'`. Without a `useHydrated()` gate, the first SSR paint shows the persisted-store *initial* value, then snaps to the rehydrated localStorage value. Use a `useHydrated()` hook (returns true after `onRehydrateStorage`) and render skeletons until then.

## 7. Lucide-react: `Instagram` doesn't exist
Removed by Lucide due to Meta trademark concerns. Use `AtSign` for social handles, or write a tiny inline SVG. Build error is unhelpful ("Did you mean Star?"). Other removed-for-trademark icons may follow — when an import fails, check the [icon list on lucide.dev](https://lucide.dev) before assuming it's a typo.

## 8. Mid-build context bloat
Re-attaching the giant Stage-1 plan file each session burns tokens. The plan now lives at `docs/archive/stage-1-plan.md` and is loaded only on demand. Reference it explicitly when needed.

## 9. Cart line dedup key must include variant
`CartItem` dedups on `(productId, selectedSize, selectedColor)`, not just `productId`. Forget this in three places and bad things happen:
- **Store actions** — `add`/`remove`/`setQuantity` all accept `opts?: { size?, color? }`. Pass them. Else "M Black" and "M White" of the same product collapse into one line.
- **React key prop** — render with `key={`${productId}|${selectedSize ?? ''}|${selectedColor ?? ''}`}` in cart and checkout lists. Without it, two-variant lines trigger React's duplicate-key warning and reuse DOM nodes incorrectly.
- **Order capture** — `OrderItem.selectedSize` / `selectedColor` must be copied from the cart line at checkout. Admin OrderDetail reads them; missing values means "size · color" subline is empty on the receipt.

## 10. Nokia menu pulls from XP's start-menu registry
The phone tile grid lives in `components/nokia/AppGrid.tsx`. It must read `nokiaMenuApps` (commerce-only allowlist in `components/nokia/apps/index.ts`), **not** `startMenuApps()` from `components/xp/appRegistry.ts`. Importing `startMenuApps()` directly looks innocent — and immediately leaks every desktop-only XP utility (Notepad, Paint, Terminal, Music, Video, Settings, My Computer) onto the phone. See memory `feedback-mobile-commerce-only`. The two surfaces are decoupled by design so a new desktop easter-egg app can't accidentally surface on customer phones.

## 11. Cross-tab admin edits don't propagate without a `storage` listener
Zustand's `persist` middleware writes to localStorage but doesn't *subscribe* to it. Each browser tab is its own Zustand instance — they share storage but not state. Without `window.addEventListener('storage', …)` calling `persist.rehydrate()`, an admin edit in tab A is invisible to a storefront preview in tab B until the customer hits F5. Both `dataStore.ts` and `cartStore.ts` register this listener at module load. Don't remove it. Cross-device (laptop ↔ phone over LAN) still needs a real backend — `localStorage` is per-device, no event helps.
