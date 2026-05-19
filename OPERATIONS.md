# Cybertronics — Operations & Launch

The operations bible for shipping and running this site safely. Covers deployment, domain, analytics, payments, security, env vars, the launch checklist, and the trigger reference (what fires what across the system).

This is **not** a build roadmap — features and phases live in `README.md` (§1–12). Code architecture lives in `ARCHITECTURE_MAP.md`. Day-to-day commands live in `QUICK_START.md`. Project rules live in `CLAUDE.md`. Past-mistake log lives in `COMMON_MISTAKES.md`. Read this when you're about to deploy, change DNS, wire up payments, add tracking, or tighten security.

---

## Table of contents

1. [The full operations stack](#1-the-full-operations-stack)
2. [Deployment pipeline](#2-deployment-pipeline)
3. [Domain & DNS plan](#3-domain--dns-plan)
4. [Analytics & monitoring](#4-analytics--monitoring)
5. [Payments — UAE first](#5-payments--uae-first)
6. [Security hardening](#6-security-hardening)
7. [Environment variables](#7-environment-variables)
8. [Trigger reference — when things fire](#8-trigger-reference--when-things-fire)
9. [Launch checklist](#9-launch-checklist)

---

## 1. The full operations stack

What each service is, what it does, and why this project uses it. Everything's free-tier or cheap to start.

| Service | Layer | What it does | Why this project uses it | Tier |
|---|---|---|---|---|
| **GitHub** | Source control | Hosts code + history; webhook trigger for Vercel | Required for auto-deploys | Free |
| **Vercel** | App hosting | Builds & serves Next.js on edge CDN | Built by Next team; zero-config deploys | Hobby = Free |
| **GoDaddy** | Domain registrar (today) | Owns the domain name | Already purchased; keep until renewal | Paid |
| **Cloudflare / AEserver** | Future registrar | Cheaper renewal | Move at renewal to save $10–15/yr | At-cost |
| **Supabase** | Backend (Postgres + Auth + Storage + Realtime) | Database, auth, file storage | Already installed; activates in Phase E | Free tier |
| **Stripe** | Payments | Cards + Apple Pay + Google Pay, AED-native | Best DX, UAE-supported | 2.9% + AED 1 |
| **Tabby** | BNPL payments | "Split in 4" for UAE buyers | Lifts fashion conversion 15–25% | ~3–6% |
| **Telr** (optional) | Backup payments + COD flow | Fallback if Stripe slow to approve; cash-on-delivery routing | UAE-native, COD-friendly | ~2.5% |
| **Sentry** | Error tracking | Catches JS errors, source-maps, groups | Catches silent `localStorage` failures, persist rehydration bugs | Free 5k/mo |
| **Microsoft Clarity** | UX analytics | Heatmaps + session replay | Watch real users discover (or fail) drag, Terminal, Start menu | Free unlimited |
| **Vercel Analytics** | Traffic | Page views, devices, referrers — cookie-free | No consent banner needed | Free 2.5k/mo |
| **Vercel Speed Insights** | Performance | Core Web Vitals from real users | Flags XP gradient/animation regressions | Free |
| **PostHog** (later) | Product analytics | Funnels, identified users, A/B, feature flags | Activates after Phase C auth lands | Free 1M/mo |
| **Google Search Console** | SEO | What queries surface your site on Google | Free, no script — DNS TXT verify | Free |
| **UptimeRobot** | Uptime | Pings site every 5 min, SMS on downtime | Mandatory once live | Free 50 monitors |
| **Upstash Redis** | Rate limiting backend | Counter store for `@upstash/ratelimit` middleware | Stops checkout abuse / bot floods | Free 10k req/day |
| **Cloudflare** (in front) | DDoS + WAF + CDN | L3/L4 DDoS protection, bot scoring, managed rules | Free tier covers a small UAE site | Free |

**Explicitly skipped:** Hostinger (wrong stack for Next), AWS/GCP directly (overkill — Vercel + Supabase are AWS-on-rails), GoDaddy hosting (PHP-shaped, not Next-shaped), Mongo (data is relational), GA4 (only worth it if running Google Ads), Google Business Profile (no physical storefront), Hotjar (Clarity is free and better), LogRocket (Sentry + Clarity cover it), Mixpanel (PostHog free tier beats it).

---

## 2. Deployment pipeline

### The flow

```
local edit → git push → GitHub webhook → Vercel build
  ├─ feature branch  → preview deploy at branch-name-cybertronics.vercel.app
  └─ merge to main   → production deploy → DNS → live domain
```

### One-time setup

1. **Create GitHub repo**, push project, `main` as default branch.
2. **Vercel** dashboard → New Project → import repo → framework auto-detected as Next.js → Deploy. First deploy lands at `cybertronics-xx.vercel.app` in ~90 seconds.
3. **Add env vars** (§7) in Vercel Settings before Supabase / Stripe work.
4. **Branch strategy:**
   - `main` → production
   - any other branch / PR → preview (one URL per commit, shareable with reviewers)

### When deployment triggers fire

| Action | Triggers | Result |
|---|---|---|
| `git push` to any branch | Vercel preview build | Preview URL ready in 60–90s |
| Merge PR to `main` | Vercel production deploy | Live site updated |
| Push commit during a running build | Cancels in-progress, starts fresh | Latest commit wins |
| Build fails | Email notification | Previous version stays live (atomic deploys) |
| Vercel cron (if added) | Scheduled function run | For nightly tasks |

### Costs

Hobby tier is free and covers this entire project: 100 GB bandwidth/mo, unlimited deploys, free SSL, edge functions. Upgrade to **Pro ($20/mo)** only when: bandwidth caps, team seats, password-protected previews, or long log retention.

---

## 3. Domain & DNS plan

Domain registration and DNS are **separate from hosting**. You can keep GoDaddy as registrar while Vercel hosts.

### Today — point GoDaddy DNS at Vercel (no transfer)

1. Vercel → Project → Settings → Domains → add `yourdomain.xx`.
2. Vercel displays the records to add. Typically:
   - `A` record: `@` → `76.76.21.21`
   - `CNAME` record: `www` → `cname.vercel-dns.com`
3. GoDaddy → DNS Management → add both records exactly as shown.
4. Wait 5–30 min for DNS propagation. Vercel auto-issues a free Let's Encrypt SSL cert.
5. **Delete GoDaddy's default Parking / Forwarding rules** — they override the `A` record and silently serve a parking page. Common gotcha at 2am.

### Later — transfer to save money (at renewal)

| Domain type | Move to | Annual saving |
|---|---|---|
| `.com` | Cloudflare Registrar (at-cost) | ~$10/yr forever |
| `.ae` | AEserver (UAE local) | ~AED 30–50/yr |
| `.store` / `.shop` | Porkbun | ~$15/yr |

Do this **~30 days before renewal** — the transfer adds 1 year to expiration, so it's effectively free. Safe order: recreate identical DNS at the new registrar → change nameservers → confirm propagation → initiate transfer.

> `.ae` note: only TDRA-accredited registrars can sell `.ae` (GoDaddy, AEserver, etisalat, etc.). Cloudflare and Namecheap don't. So `.ae` realistic options are GoDaddy or AEserver.

### Free Cloudflare layer (without transferring)

Even while GoDaddy owns the name, you can route DNS through Cloudflare for free DDoS + CDN + WAF + analytics: sign up at Cloudflare → add domain → it gives you two nameservers → set those at GoDaddy. Now Cloudflare handles DNS and shields Vercel from junk traffic. GoDaddy stays the registrar.

---

## 4. Analytics & monitoring

### Layered setup (install Day-1 tier all at once)

| Tool | What it captures | Install |
|---|---|---|
| Vercel Analytics | Page views, top pages, referrers, devices, country | `<Analytics />` in root layout |
| Vercel Speed Insights | LCP, FID, CLS, INP — Core Web Vitals from real users | `<SpeedInsights />` in root layout |
| Microsoft Clarity | Click heatmaps, session replays, scroll depth, rage clicks | One `<Script>` tag |
| Sentry | Uncaught errors with source maps, grouped by fingerprint | `npx @sentry/wizard@latest -i nextjs` |
| Google Search Console | Search queries, indexed pages, crawl errors | DNS TXT verify |
| UptimeRobot | 5-min uptime pings from multiple regions, SMS/email alerts | Paste URL |

### The analytics facade — highest-leverage pattern

Single chokepoint so swapping providers is a one-file change. Add this before installing any provider:

```ts
// lib/analytics/track.ts
const noop = (..._args: unknown[]) => {};
export const track = {
  pageView: noop,
  productViewed: noop,
  addToCart: noop,
  cartOpened: noop,
  checkoutStarted: noop,
  paymentMethodSelected: noop,
  orderPlaced: noop,
  // XP-specific
  windowOpened: noop,
  terminalCommand: noop,
  mobileCardViewed: noop,
  wallpaperChanged: noop,
  bootCompleted: noop,
};
```

Sprinkle `track.productViewed(id)` through components today. Replace `noop` bodies with PostHog/Clarity/Vercel calls later — components stay untouched.

### What to track (focused, ~12 events)

**E-commerce funnel:** `product_viewed → cart_added → cart_opened → checkout_started → payment_method_selected → order_placed`. The biggest drop step is what you fix next.

**XP-specific (this is your differentiator — instrument it):** `window_opened {app_id}`, `terminal_command {command}`, `mobile_card_viewed`, `wallpaper_changed`, `boot_completed {duration_ms}`. Generic e-com analytics can't capture what makes this site special — the XP layer **is** the product.

### When telemetry fires

| Event | Fires when | Source |
|---|---|---|
| Page view | App Router route change | Vercel Analytics SDK (auto) |
| Web vital | After page load + on each vital event | Speed Insights SDK (auto) |
| Clarity recording | Page load; session ends at 30 min idle or tab close | Clarity script |
| Sentry error | Any uncaught exception or rejected promise | Sentry SDK + `instrumentation.ts` |
| Manual analytics event | `track.*()` call in code | Your facade |
| Uptime ping | Every 5 min from multiple regions | UptimeRobot (external) |
| Search Console crawl | Google's own schedule (not controllable) | Submit sitemap to nudge |

---

## 5. Payments — UAE first

### UAE method mix (plan for all of it)

| Method | Share | Tool |
|---|---|---|
| Card (Visa / MC) | ~50% | Stripe |
| Apple Pay / Google Pay | ~25% (rising) | Stripe (one-flag enable) |
| Cash on Delivery | ~25% | Telr + Aramex API later |
| BNPL (Tabby / Tamara) | ~15% | Tabby SDK |

### Recommended setup

**v1 (Phase F launch):** Stripe (cards + Apple Pay) + Tabby (BNPL).
**v2:** add Telr for COD when fulfillment can support cash collection.

### Stripe — how the flow works

1. User clicks Checkout in the Cart `<Window>`.
2. Frontend POSTs cart to `/api/checkout` (Next.js Route Handler).
3. Server creates `Stripe.checkout.sessions.create({...})` with line items, currency `aed`, success/cancel URLs.
4. Server returns `session.url`. Frontend redirects to it.
5. Stripe hosts the payment page (3DS, Apple Pay UI, PCI compliance handled).
6. On success → Stripe redirects user back to `/order/success?id=cs_...`.
7. **Independently**, Stripe POSTs `checkout.session.completed` webhook to `/api/stripe/webhook`. **This is the source of truth** — not the redirect. Verify signature, then mark order paid in Supabase.

### Why webhooks are non-negotiable

The success-page redirect can fail: user closes tab, loses signal, browser crashes. The webhook always fires. Always:
1. **Verify signature** with `STRIPE_WEBHOOK_SECRET` — reject unsigned requests with 400.
2. **Use `req.text()`, not `req.json()`** — Stripe signs the raw body; parsing it first breaks verification.
3. **Make the handler idempotent** — Stripe retries on 5xx; store processed `event.id`s and skip duplicates.
4. **Mark orders paid only inside the webhook handler.**

### When payment triggers fire

| Stripe event | Fires when | What to do |
|---|---|---|
| `checkout.session.completed` | Payment succeeds | Mark order paid, send confirmation email, decrement stock |
| `payment_intent.payment_failed` | Card declined / 3DS failed | Log reason; show user error on return |
| `charge.refunded` | You refund via Stripe dashboard | Mark order refunded, restock |
| `customer.dispute.created` | Chargeback opened | Alert ops; freeze fulfillment |
| Tabby `pre_authorize` | Customer approved BNPL | Confirm order; capture later on shipping |
| Tabby `cancel` | Customer rejects after approval | Free reserved stock |

### UAE regulatory checklist

| Requirement | Why |
|---|---|
| UAE trade license (Mainland DED or Freezone — Meydan / SHAMS / IFZA) | Required by every UAE gateway |
| UAE business bank account (AED) | Where Stripe/Telr/Tabby settle |
| VAT registration (mandatory above AED 375k/yr revenue) | Charge 5%, file quarterly with FTA |
| Published refund + shipping policies | Gateway activation gate |
| Privacy policy page | UAE PDPL compliance |
| Terms of service page | Gateway activation gate |
| PCI-DSS SAQ-A (self-attestation) | Trivial when using hosted Stripe Checkout — you never touch a card number |

Start trade-license + bank-account paperwork **today**, in parallel with the build. That paperwork is the real critical path, not the code.

---

## 6. Security hardening

Layered defense. Each layer assumes the others might fail.

### 6.1 Transport

**HTTPS** — automatic on Vercel via Let's Encrypt. Nothing to configure.

### 6.2 HTTP security headers (high impact, low effort)

Add to `next.config.ts`:

```ts
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
  { key: 'Content-Security-Policy', value:
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.clarity.ms https://*.clarity.ms; " +
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.clarity.ms https://*.ingest.sentry.io https://api.tabby.ai; " +
      "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.tabby.ai; " +
      "img-src 'self' data: https:; " +
      "style-src 'self' 'unsafe-inline'; " +
      "font-src 'self' data:;" },
];

export default {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

What each does:
- **HSTS** — browsers refuse HTTP for 2 years. Prevents downgrade attacks.
- **X-Frame-Options: DENY** — no one can iframe your site. Prevents clickjacking of the cart/checkout.
- **X-Content-Type-Options: nosniff** — browser honors declared MIME types. Stops MIME-confusion XSS.
- **Referrer-Policy** — limits what URL you leak in the `Referer` header.
- **Permissions-Policy** — locks down camera/mic/geolocation/payment APIs to your origin.
- **CSP** — whitelists where scripts, styles, images, frames, and connections can come from. Single strongest XSS mitigation.

Verify at securityheaders.com after deploy (target A or A+).

### 6.3 Secrets management

- Never commit `.env*` — already gitignored. Run `git log -p | findstr /I secret` as a sanity check before pushing.
- Store all secrets in **Vercel env vars** (Settings → Environment Variables), per-env (Production / Preview / Development).
- Prefix client-readable values with `NEXT_PUBLIC_`. Anything else is server-only.
- **Never** put a secret behind `NEXT_PUBLIC_`. If you accidentally do, **rotate it immediately** — it's shipped to every browser that loads your site.
- Rotate keys quarterly. Stripe + Supabase support overlapping windows for zero-downtime rotation.

### 6.4 Input validation (server-side)

Every Route Handler and Server Action validates with **Zod**. Never trust the client.

```ts
// app/api/checkout/route.ts
import { z } from 'zod';

const Schema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    qty: z.number().int().positive().max(99),
  })).max(50),
});

export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json());
  if (!parsed.success) return new Response('Bad input', { status: 400 });
  // recompute prices/totals SERVER-SIDE from the database — never trust client-sent prices
}
```

### 6.5 Rate limiting

`middleware.ts` with `@upstash/ratelimit` over Upstash Redis (free 10k req/day):

```ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anon';
  const { success } = await limiter.limit(ip);
  if (!success) return new Response('Too many requests', { status: 429 });
}

export const config = { matcher: '/api/:path*' };
```

Tighter limits on critical endpoints: `/api/checkout` → 3/min, `/api/auth/*` → 5/min.

### 6.6 Bot & DDoS protection

- **Cloudflare in front** (free) — L3/L4 DDoS shielding, bot scoring, WAF managed rules. Activated by routing DNS through Cloudflare nameservers (see §3).
- **Cloudflare Turnstile** on checkout & auth forms — invisible CAPTCHA, free, no Google. Adds friction only when bot score is high.

### 6.7 Webhook signature verification

Repeated from §5 because it's *the* most-skipped security control: every webhook endpoint (Stripe, Tabby, Supabase, Sentry) must verify the signature header against a shared secret stored in env vars. An unverified webhook is a free order-placement bug.

### 6.8 Database (Supabase, Phase E)

- **Enable Row-Level Security (RLS) on every table.** Default-deny — no policy = no access.
- Use the **`anon` key client-side only**. The **service role key bypasses RLS** and is server-only, kept in Vercel env, never logged.
- Write explicit policies: `users can SELECT/UPDATE their own orders`, `admin role can do anything on products`. Test with Supabase dashboard's "Impersonate" feature.
- **No raw SQL string interpolation.** Use Supabase's typed query builder, parameterized.

### 6.9 Authentication (Phase C + G)

- Supabase Auth: magic link or email+password + TOTP 2FA factor.
- Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict` if no cross-site flows). Set by Supabase SSR helpers — don't roll your own.
- Enforce **2FA on every dashboard you operate**: GitHub, Vercel, Stripe, Supabase, GoDaddy, Cloudflare, UptimeRobot, Sentry. The blast radius of any one of these being compromised is your entire business.
- **Principle of least privilege**: separate "admin" role from "owner" role. Daily ops use admin; only owner can rotate keys or delete data.

### 6.10 Dependency hygiene

- Enable **GitHub Dependabot** (Settings → Code security) — auto-PRs for vulnerable deps.
- Enable **CodeQL** scanning — catches injection/XSS patterns in your own code.
- Run `npm audit` before any release. Treat `high`/`critical` as blockers.
- `package-lock.json` is committed; never delete it casually.

### 6.11 Logs & audit

- Vercel logs: 1 hour retention on Hobby, 7 days on Pro. Pipe to **Axiom** (free 500 MB/mo) or **Better Stack Logs** for long retention.
- Log every order state change, every refund, every admin action with `userId + before + after + timestamp`.
- **Never log PII** (card numbers, full addresses, passwords). Stripe stores card data; you don't.

### 6.12 Backups

- Supabase Free: daily auto-backups, 7-day retention. **Test a restore at least once** before relying on it.
- GitHub is your code backup. Plus a private mirror on GitLab/Gitea if you want zero vendor lock-in.
- Stripe stores payment history independently — even if your DB is lost, you can rebuild the order ledger from Stripe.

### 6.13 Misc tightening

- **Subresource Integrity (SRI)** hashes on any third-party `<script src>` if you can't use the npm package version. Stops a compromised CDN from injecting code.
- **`next/image`** with explicit `remotePatterns` in `next.config.ts` — limits which domains your site can proxy images from.
- `poweredByHeader: false` already in the config above. Smaller fingerprint for attackers.
- Audit installed packages for "post-install" scripts before adding new deps — supply-chain attacks live there.

---

## 7. Environment variables

Set in **Vercel dashboard** per environment (Production / Preview / Development). Copy to a local `.env.local` for `npm run dev`. **Never commit `.env*` files.**

```bash
# Public — exposed to the browser (safe to leak)
NEXT_PUBLIC_URL=https://cybertronics.xx
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_TABBY_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_CLARITY_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com

# Server-only — never prefix with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # bypasses RLS — server only
STRIPE_SECRET_KEY=sk_live_...              # full Stripe API access
STRIPE_WEBHOOK_SECRET=whsec_...            # verifies webhook signatures
TABBY_SECRET_KEY=sk_test_...
TABBY_WEBHOOK_SECRET=...
SENTRY_AUTH_TOKEN=sntrys_...               # build-time source map upload
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
CLOUDFLARE_TURNSTILE_SECRET=...
```

Rule: if it's secret, omit `NEXT_PUBLIC_`. If a `NEXT_PUBLIC_` var accidentally holds a secret → rotate it the moment you notice.

---

## 8. Trigger reference — when things fire

The one-shot mental model of "what causes what" across the whole system.

| Trigger | System reacts | Where it lives |
|---|---|---|
| `git push` (any branch) | Vercel preview build → shareable URL | GitHub → Vercel webhook |
| Merge PR to `main` | Vercel production deploy → live site | Same |
| Build fails | Email; previous version stays live | Vercel |
| User visits any page | Vercel Analytics page view, Speed Insights vitals, Clarity records, CSP applied, Sentry init | Browser SDKs + edge headers |
| User clicks Add to Cart | `useDataStore.addToCart()` → `track.addToCart()` → localStorage write | `lib/store/dataStore.ts` |
| User opens any XP `<Window>` | `useXpStore.open()` → `track.windowOpened()` | `lib/store/xpStore.ts` |
| Uncaught JS error | Sentry catches, source-maps, groups, alerts if new | `instrumentation.ts` |
| User clicks Checkout | POST `/api/checkout` → Stripe session → redirect | `app/api/checkout/route.ts` |
| Card charged | Stripe webhook `checkout.session.completed` → mark order paid in Supabase | `app/api/stripe/webhook/route.ts` |
| Card declined / 3DS fails | Webhook `payment_intent.payment_failed` → log reason | Same |
| Tabby BNPL approved | Webhook `pre_authorize` → confirm order | `app/api/tabby/webhook/route.ts` |
| Refund issued in Stripe dashboard | Webhook `charge.refunded` → restock + email | `app/api/stripe/webhook/route.ts` |
| Site returns 5xx for 1 min | UptimeRobot detects → SMS/email alert | UptimeRobot (external) |
| Dependabot finds CVE | GitHub auto-PR | GitHub |
| Supabase auth login | Cookie set (HttpOnly, Secure) → `authStore` populated | `lib/store/authStore.ts` |
| Rate limit hit | Middleware returns 429 | `middleware.ts` |
| Stripe key rotation | Both old + new valid during overlap window | Vercel env vars |
| Cron job (Vercel cron) | Scheduled function runs | `app/api/cron/*` |
| Admin posts notification | New row in `notifications` table → `TrayNotifications` subscribes → balloon | Supabase Realtime channel |

---

## 9. Launch checklist

### Pre-launch — infrastructure

- [ ] GitHub repo created, `main` default branch, branch protection on `main`
- [ ] Vercel project connected, auto-deploys verified on a preview branch
- [ ] All env vars set in Vercel for Production env
- [ ] `npm run build` passes locally and on Vercel
- [ ] `npm run lint` clean
- [ ] Domain DNS points at Vercel; SSL cert auto-issued; verified at `https://yourdomain.xx`
- [ ] `www` redirect set (Vercel handles when both apex + www are added)
- [ ] Security headers verified at securityheaders.com (A or A+)
- [ ] SSL grade verified at ssllabs.com (A or A+)

### Pre-launch — telemetry

- [ ] `<Analytics />` + `<SpeedInsights />` in `app/(xp)/layout.tsx`
- [ ] Clarity script added with project ID
- [ ] Sentry wizard run; test error fires and shows in dashboard
- [ ] UptimeRobot monitor created for production URL
- [ ] Google Search Console verified via DNS TXT
- [ ] `app/sitemap.ts` generates a sitemap; submitted to Search Console
- [ ] `app/robots.ts` exists, allows indexing of public routes, disallows `/admin`
- [ ] `lib/analytics/track.ts` facade exists; key events sprinkled

### Pre-launch — UAE business

- [ ] Trade license issued (Mainland or Freezone)
- [ ] UAE business bank account open (AED)
- [ ] Stripe account approved, AED enabled, Apple Pay enabled, test charge succeeded
- [ ] Tabby merchant approved, sandbox integration tested
- [ ] Stripe webhook live at `/api/stripe/webhook`, signature verification confirmed
- [ ] Tabby webhook live at `/api/tabby/webhook`, signature verification confirmed
- [ ] Refund policy page published
- [ ] Shipping policy page published
- [ ] Privacy policy page published (mentions cookies, analytics, payment data, PDPL)
- [ ] Terms of service page published
- [ ] VAT 5% displayed at checkout (if registered)

### Pre-launch — security

- [ ] CSP header configured in `next.config.ts` and tested with browser dev tools
- [ ] HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy all set
- [ ] Rate limiting middleware active on `/api/*` (Upstash Redis configured)
- [ ] Stripe webhook signature verification confirmed (bad sig → 400)
- [ ] Dependabot enabled on the repo
- [ ] CodeQL enabled on the repo
- [ ] 2FA enabled on every dashboard: GitHub, Vercel, Stripe, Supabase, GoDaddy, Cloudflare, UptimeRobot, Sentry
- [ ] No secrets in git history (sanity check)
- [ ] `.env*` in `.gitignore` and verified
- [ ] Supabase RLS enabled on every table; policies tested with the "Impersonate" feature
- [ ] Service role key only in Vercel server env; not in any client bundle

### Day-0 smoke tests on production domain

- [ ] Boot screen completes; desktop icons clickable
- [ ] Open IE (Phase A) or Lifestyle → product list renders → product detail loads
- [ ] Add to cart → cart count updates → open Cart window
- [ ] Checkout → Stripe page loads with AED amount → test card `4242 4242 4242 4242` charges → webhook fires → order row appears in Supabase
- [ ] Refresh — cart persists from `localStorage`
- [ ] Resize to mobile width → stacked cards mode activates
- [ ] Throw a test error from devtools (`Sentry.captureException(new Error('test'))`) → Sentry receives + groups it
- [ ] Hit `/api/checkout` 20× in 10 seconds → rate limiter returns 429
- [ ] Apple Pay button shows on Safari iOS test device

---

## Doc map

- `README.md` — Stage-2 build roadmap (features, apps, auth, admin, backend, commerce phases)
- **`OPERATIONS.md`** (this file) — deployment, domain, analytics, payments, security, env vars, launch
- `QUICK_START.md` — daily commands, file paths, adding a new XP app
- `ARCHITECTURE_MAP.md` — code structure, store layout, mount order, drag pattern
- `CLAUDE.md` — project rules + auto-imports companion docs
- `COMMON_MISTAKES.md` — bugs already debugged; don't repeat them
- `AGENTS.md` — agent-specific guidance
- `docs/archive/stage-1-plan.md` — historical, full Stage-1 plan
