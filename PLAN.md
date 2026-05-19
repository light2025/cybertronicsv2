# Build Plan — Pre-flight & Requirements

Companion to `README.md` (the roadmap) and `CLAUDE.md` (the working rules).
This file lists **everything that must exist or be decided before I start editing code** for each phase, plus the verification I'll do first.

---

## 0. How to use this doc

1. Read § 1–4 once. These are global.
2. Before kicking off any phase, satisfy that phase's checklist in § 5.
3. Tick items off in this file as we go — that becomes the build log.

---

## 1. Pre-flight (read-only verification I'll run before any edits)

Independent of decisions. Zero risk. Done once.

- [ ] `npm install` succeeds clean (lockfile resolves, no peer warnings on Node 20+).
- [ ] `npm run build` passes on `main` baseline. Confirms I'm not introducing a regression.
- [ ] `npm run dev` boots on `http://localhost:3000`. `/` shows the XP desktop; `/admin` shows the dashboard.
- [ ] Read `node_modules/next/dist/docs/` to confirm Next.js 16 specifics — params-as-Promise pattern, route-group rules, server actions changes. `AGENTS.md` says this version has breaking changes from training data.
- [ ] Re-read `CLAUDE.md`, `QUICK_START.md`, `ARCHITECTURE_MAP.md`, `COMMON_MISTAKES.md` to keep load-bearing rules in mind.
- [ ] Verify Tailwind v4 `@theme inline` supports the per-class theme variant pattern I'm proposing for dark mode (`html.dark`). If not, fall back to CSS variable swap via `<html data-theme>`.
- [ ] Identify keyboard shortcuts already in use (Ctrl+K is taken by SearchOverlay) so new ones don't conflict.

---

## 2. Environment & tooling

### Local dev — confirm in place
- [ ] **Node.js 20+** (Next.js 16 requires it).
- [ ] **npm** (lockfile is `package-lock.json` — stay on npm unless you want to migrate).
- [ ] A modern browser for visual testing. **Chrome or Edge recommended** — Tahoma renders most authentically there. Safari/Firefox font-stack fallback differs.
- [ ] Optional: VS Code with the ESLint + Tailwind extensions.

### Files I'll need to create later (don't make them yet)
- `.env.local` — Supabase creds (Phase 5+).
- `.env.example` — committed template with placeholder values.
- `middleware.ts` — admin gate (Phase 5).

### What I will NOT do without explicit OK
- Bump dependencies (lucide-react major bump, anything in `package.json`).
- Delete files. Even when migrating Lifestyle into IE, the original file stays until verified.
- Run `npm install <new-package>` without you confirming the addition.
- Start the dev server unannounced (port might be in use).
- Touch `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`, `postcss.config.mjs` unless a feature genuinely requires it.
- Commit, push, or initialise git (this directory isn't a git repo right now).

---

## 3. Decisions I need from you (global, blocking)

These shape everything downstream. Pick before Phase 1 starts.

### 3.1 Phase start (which item first)
- [ ] **Recommended**: Phase 1, **Internet Explorer first**. IE wraps Lifestyle / About / Contact / Help, so doing it first means we don't re-touch those files in later Phase-1 work.
- Alternative: wallpapers + icons first (visually loud, low risk, but causes rework after IE lands).
- Alternative: Calculator first (pure warm-up).
- Alternative: code cleanups first (fix maximize, `updateCategory`, lucide bump).

### 3.2 Asset sourcing
- [ ] **Recommended**: I source royalty-free / CC0 wallpapers, icons, and short audio tracks. You can swap in licensed originals later.
- Alternative: you provide all assets. Drop them in `/public/{wallpapers,icons,audio}/` and tell me the filenames.
- Alternative: keep current CSS gradients and lucide icons as placeholders for now.

### 3.3 Auth strategy in Phase 3
- [ ] **Recommended**: mock `authStore` first (any user/pass works, fake profile), real Supabase swap in Phase 5. UX work proceeds without backend blocking.
- Alternative: stand up Supabase from day one. Slower start; requires creds from you upfront.
- Alternative: skip auth entirely. Dialer is cosmetic. Admin stays unprotected. (**not recommended** for a real shop.)

### 3.4 IE URL scheme
- [ ] **Recommended**: `cybertronics://` — distinct from real URLs, reads as obviously fake.
- Alternative: `http://cybertronics.shop/...` — more realistic but conflates fake/real.
- Alternative: defer, build a URL abstraction so we can swap later.

### 3.5 Single vs split user table
- [ ] **Recommended**: one `profiles` table with a `role` column (`'customer' | 'admin'`). Supabase Auth gives one identity per email anyway; splitting tables doubles work.

### 3.6 Notification dismissal scope
- [ ] **Recommended**: per-device (localStorage) for Phase 1 + Phase 4, per-user (`notification_reads` table) after Supabase auth ships. Don't build it twice.

### 3.7 Wallpaper persistence scope
- [ ] **Recommended**: per-device today (already implemented), per-user once auth ships (write to `profiles.preferences`).

### 3.8 Video source
- [ ] **Recommended**: YouTube embed only (cheapest, matches the spec).
- Alternative: also support self-hosted MP4 via Supabase Storage (extra cost, extra Storage RLS work).

### 3.9 Guest cart
- [ ] **Recommended**: allow guest cart in localStorage, persist to Supabase on login.
- Alternative: require login to add to cart.

### 3.10 Production hosting
- [ ] **Recommended**: Vercel for the Next.js app + Supabase for everything else. Cleanest path.
- Alternative: any Node host (Railway, Render, Fly.io). Means manual env wiring.

---

## 4. Credentials & accounts I will need from you

Listed by **when** I need them, so you don't have to gather everything upfront.

### 4.1 Phase 1–4 (UI + mock auth + admin redesign)
**Nothing.** All client-side, no creds.

### 4.2 Phase 5 — Supabase migration (required to proceed)

#### 4.2.1 Supabase project
- [ ] Create a project at https://supabase.com.
- [ ] Choose a region close to your users (recommend **Frankfurt** or **Mumbai** for UAE).
- [ ] Send me, for `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, never goes to the client — used for admin operations / seed scripts)

> Service role key is sensitive. Send via a secure channel (1Password, secure note). Never paste in chat or commit.

#### 4.2.2 Supabase Storage buckets
I'll create these from the dashboard or via migration:
- `product-images` (public read, authenticated write).
- `wallpapers` (public read, admin write) — only if Settings allows custom wallpapers later.
- `gallery` (public read, admin write).
- `avatars` (public read, owner write).

#### 4.2.3 Supabase Auth — email provider
For the dial-up login + password reset to actually send mail:
- [ ] In Supabase dashboard → Authentication → Email Templates: customise the "Reset Password", "Confirm Signup", "Magic Link" templates with the Cybertronics tone.
- [ ] Choose the email sender:
  - **Default** (Supabase built-in, limited to 3-4 emails/hour, for dev) — no creds needed.
  - **Custom SMTP** (Resend / SendGrid / Postmark recommended for production).
- [ ] If you go custom SMTP, send me:
  - SMTP host, port, username, password
  - Sender email (e.g. `noreply@cybertronics.shop`) and sender name.

#### 4.2.4 Optional OAuth providers
If you want "Sign in with Google" etc:
- Google OAuth client ID + secret (from Google Cloud Console).
- Apple Services ID + private key (if iOS-friendly login).
> Defer to Phase 7 unless you want it earlier.

### 4.3 Phase 6 — Commerce (payments)

- [ ] **Stripe account** (or alternative — Tabby/Tamara for UAE BNPL?).
- [ ] Stripe keys: publishable + secret + webhook signing secret.
- [ ] Decide: hosted Checkout (fastest) vs Payment Elements (custom UI inside an XP "checkout" window).
- [ ] AED is supported by Stripe. Confirm your Stripe account is in the right country.

### 4.4 Phase 7 — 2FA + recovery

- [ ] Nothing extra from you — Supabase Auth's TOTP factor is built in.
- [ ] If you want SMS fallback recovery: a Twilio account (account SID, auth token, sender phone number). Optional.

### 4.5 Production deployment

- [ ] **Domain name** (e.g. `cybertronics.shop`). Send me the registrar or grant me a delegated DNS user if you want me to wire records.
- [ ] **Vercel account** (recommended). Link the GitHub repo (you'll need to initialise git first — this directory isn't a repo currently).
- [ ] DNS records: I'll list what's needed when we get there (A/CNAME for the apex/www, plus Supabase email-sender verification records if you use a custom domain for outbound email).

### 4.6 Other accounts (later, optional)

- [ ] **YouTube Data API key** — only if we want to auto-fetch video titles/durations when admin pastes a URL. Embedding works without it.
- [ ] **Plausible / PostHog / Vercel Analytics** — analytics. Defer.
- [ ] **Sentry** — error tracking. Defer to post-launch.

---

## 5. Per-phase prerequisites

Before each phase starts, this checklist must be satisfied.

### Phase 1 — UI nostalgia
- [ ] Decision 3.1 made (start with IE recommended).
- [ ] Decision 3.4 made (URL scheme).
- [ ] Decision 3.2 made (asset sourcing strategy).
- [ ] If you're providing wallpapers/icons: assets are in `/public/wallpapers/` and `/public/icons/` with documented filenames.
- [ ] If I'm sourcing: confirm I can vendor CC0 images into the repo.

### Phase 2 — New apps
- [ ] Calculator: nothing needed.
- [ ] Paint upgrades: nothing needed.
- [ ] Music Player: 6–8 audio tracks. CC0 sourced by me, OR you provide MP3/OGG files in `/public/audio/`.
- [ ] Video Player: 3–5 placeholder YouTube video IDs (I can pick generic ones until admin replaces them).

### Phase 3 — Auth surface (mock)
- [ ] Decision 3.3 made.
- [ ] If "mock first": no creds needed.
- [ ] If "Supabase from start": Phase 5.4.2.1 creds required now instead.

### Phase 4 — Admin redesign + controllers
- [ ] Phase 3 shipped (admin pages need to gate on the `authStore`).
- [ ] Decision 3.6 made (notification dismissal scope).

### Phase 5 — Supabase migration
- [ ] **All of § 4.2 satisfied** — project URL + anon key + service role key in `.env.local`, email provider configured.
- [ ] Decision 3.5 made (user table shape).
- [ ] Decision 3.7 made (wallpaper persistence scope).
- [ ] Decision 3.8 made (video source).
- [ ] You've reviewed the SQL migrations I'll send before I run them against your project. **I won't run destructive SQL on your prod project without sign-off.**

### Phase 6 — Commerce
- [ ] Phase 5 complete.
- [ ] § 4.3 satisfied (Stripe or alternative).
- [ ] Decision 3.9 made (guest cart).
- [ ] Tax handling decision — flat 5% UAE VAT vs Stripe Tax. Default: flat 5%.
- [ ] Shipping rate decision — flat AED 25 vs zonal vs free over threshold. README mentions "Free shipping over AED 200" — confirm.

### Phase 7 — 2FA + recovery
- [ ] Phase 5 complete.
- [ ] Optional: § 4.4 SMS creds if you want phone-fallback recovery.

### Production launch
- [ ] § 4.5 satisfied (domain + Vercel + DNS).
- [ ] All test orders cleared from `orders` table.
- [ ] Robots.txt, sitemap.xml.
- [ ] Open Graph + Twitter card metadata.
- [ ] Real product photography in place (currently picsum placeholders).

---

## 6. Data I need from you, one-time, before Phase 5

This is content, not credentials. Send when convenient.

- [ ] Real **product list** — title, description, price (AED), category, images, stock. CSV or just paste in a message; I'll seed the migration.
- [ ] Real **category list** if you want to change the seed taxonomy (currently T-Shirts, Pants, Headwear, Full Costume Combo, Footwear, Accessories).
- [ ] **Brand voice rules** for About / Contact / Help — current copy is mine; replace with what you actually want to say.
- [ ] **Support email** to wire into the contact app and reset emails (currently `hello@cybertronics.shop` is a placeholder).
- [ ] **Social handles** for the contact app footer (currently just `@cybertronics` placeholder).
- [ ] **Logo asset** if you have one — currently we render the wordmark in CSS. A real PNG/SVG would replace it in BootScreen + login + footer.

---

## 7. What I'll send back to you, per phase

So you know what to expect in each PR-equivalent batch:

- A short **change summary** (files touched, why).
- A **manual test plan** (click-through steps to verify in the browser).
- Any **rollback notes** if relevant.
- For Phase 5+: SQL migration files in `supabase/migrations/` for review **before** I run them.
- For each phase: an updated entry in this PLAN.md ticking off the checklists.

---

## 8. Things I will explicitly NOT do without confirmation

- Run a destructive SQL migration on your Supabase project.
- Run `npm install` for any new dependency.
- Delete or rename a file that's still referenced (will refactor in place first).
- Push to a production environment.
- Embed any image I'm not sure has rights cleared.
- Hardcode any credential into a tracked file.
- Send mail from your domain during development.

---

## 9. Open items for your reply

Minimum to start **Phase 1**, in order of priority:

1. **§ 3.1** — confirm start point (IE first is my recommendation).
2. **§ 3.2** — asset sourcing strategy.
3. **§ 3.4** — URL scheme for IE.
4. **§ 3.3** — mock-auth-first vs Supabase-now.

Everything else can wait until the relevant phase.
