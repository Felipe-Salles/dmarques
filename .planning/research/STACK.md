# Stack Research

**Domain:** Marketing / agency one-page landing site (Astro SSG, animation-heavy UI, security-hardened, Vercel)
**Researched:** 2026-09-05
**Confidence:** HIGH for core framework + versions (Context7 + npm + official blog verified); MEDIUM for the rate-limiting and CSP-refactor recommendations (judgement calls, verified against official docs but project-specific).

---

## TL;DR (prescriptive)

- **Astro 7.3.x**, `output: 'static'`, with the **`@astrojs/vercel` 11.x** adapter — *not* pure static, because the one contact-form endpoint needs a serverless function. Everything else prerenders to immutable HTML.
- **Keep the hand-rolled animations.** The design already ships a correct IntersectionObserver reveal, a rAF-throttled cursor glow, and a DPR-capped canvas particle network in ~2 KB of vanilla JS. No animation library (Motion, GSAP, AOS, Lenis) earns its bytes here. Refactor the DC-editor `<script>` into one bundled Astro module script and wrap every effect in a `prefers-reduced-motion` guard.
- **Self-host fonts** via Astro's built-in **Fonts API** (stable since Astro 6) with the Fontsource provider. Drop the Google Fonts CDN, the two `preconnect`s, and the third-party origins from CSP.
- **Contact form:** Astro API route (`export const prerender = false`) → Vercel Node function. **`resend` 6.x** SDK + **`zod` 4.x** server-side validation + honeypot + min-fill-time check. Rate limiting: **`@upstash/ratelimit` 2.x + `@upstash/redis` 1.x** on the Upstash free tier (durable rate limiting is impossible on Vercel serverless without external state).
- **Security headers:** non-CSP headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors) in **`vercel.json`** `headers` (applies to static assets too — Astro middleware cannot, on a static build). **CSP** via Astro's native **`security.csp`** (auto-hashes inline `<script>`/`<style>`).
- **Analytics:** **Vercel Web Analytics** (`@vercel/analytics` 2.x). Cookieless, same-origin beacon, no consent banner, no new CSP origin, LGPD-friendly.
- **Tooling:** **pnpm 9.x**, **TypeScript 5.x** (`astro/tsconfigs/strict`), **Biome 2.x** for TS/JS/JSON/CSS + Prettier w/ `prettier-plugin-astro` for `.astro`, **`@lhci/cli`** (Lighthouse CI) gating ≥95 in CI, **`unlighthouse`** for local full-site scans.
- **Node 24.x** on Vercel (LTS default). Minimum Node 22.12 (Astro 7 engine requirement).

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Astro** | `7.3.x` | Static site generator; islands for the few interactive bits | Client's chosen stack. Astro 7 (June 2026) ships a Rust `.astro` compiler + Rust Markdown pipeline (15–61% faster builds), zero JS by default, first-class Content Collections. Smallest attack surface: prerendered HTML. |
| **@astrojs/vercel** | `11.x` (peer `astro@^7`) | Vercel adapter | Required so a single route can opt out of prerendering (`export const prerender = false`) and deploy as a Vercel Function for the form. Also wires up `Astro.csp` header emission and Vercel-native route caching. Keep `output: 'static'` so *only* the form route is dynamic. |
| **@astrojs/sitemap** | `3.7.x` | `sitemap.xml` + `sitemap-index.xml` at build | Official integration, zero-config with `site` set. Feeds the SEO requirement. `robots.txt` is a static file in `public/`. |
| **astro:assets + Sharp** | Sharp `0.35.x` (bundled dep) | Build-time image optimization (`<Image>`, `<Picture>`), AVIF/WebP, responsive `srcset` | Built into Astro. Optimizes the 3D render + founder photo at **build time** → files ship as immutable static assets. Do **not** enable Vercel Image Optimization (`imageService: true`) for v1: it adds runtime cost, a third-party image origin to CSP, and defeats "100% static". Few, known-at-build-time images = Sharp is the right call. |
| **Astro Fonts API** | built into Astro 7 (stable since 6.0) | Self-host **Outfit** + **DM Sans**, generate size-adjusted fallbacks, emit `preload` | `experimental.fonts` graduated to stable `fonts` in Astro 6. Downloads/caches font files at build, serves them same-origin. Removes Google Fonts CDN → faster LCP, no `fonts.googleapis.com`/`fonts.gstatic.com` in CSP, LGPD-cleaner (no third-party request carrying visitor IP). Use `provider: fontProviders.fontsource()`. |
| **Node.js** | `24.x` on Vercel (min `22.12`) | Build + serverless runtime | Vercel's default LTS in 2026 (Node 20 disabled Oct 1 2026). Astro 7 engines require `node >=22.12.0`. Pin via `"engines"` in `package.json` and the Vercel project setting. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **resend** | `6.x` | Send the "Pedir orçamento" email from the API route | Official Node SDK. API key stays in a Vercel env var, never in the client bundle. Free tier 3,000/mo. Pair with a verified sending domain (SPF/DKIM) for deliverability. |
| **zod** | `4.x` | Server-side validation of form payload (name, WhatsApp, project-type enum, honeypot empty) | Zod 4 is the current major (smaller core, faster). Validate on the server **only** — never trust the client. Reject on any parse failure with a generic message. |
| **@upstash/ratelimit** | `2.x` | Sliding-window rate limit on the form endpoint (e.g. 5 req / 10 min / IP) | HTTP-based, connectionless — designed for Vercel serverless. Needs external state (see below). |
| **@upstash/redis** | `1.x` | Backing store for `@upstash/ratelimit` | Upstash free tier (~10K commands/day) is ample for an agency contact form. REST client, no persistent socket. |
| **@vercel/analytics** | `2.x` | Cookieless pageview + Web Vitals analytics | Same-origin beacon to `/_vercel/insights/*` → no new CSP origin, no consent banner. Use the Astro component/script include; the adapter's `webAnalytics` option is legacy (for `@vercel/analytics` ≤1.3). |
| **@vercel/speed-insights** | `2.x` | *(optional)* field Core Web Vitals (RUM) | Helps prove the Lighthouse ≥95 target holds in the field. Same privacy profile as Analytics. Add only if the client wants ongoing perf telemetry. |
| **@astrojs/rss** | `4.x` | *(not needed v1)* | No blog in scope. Skip. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **pnpm** `9.x` | Package manager | Strict node_modules, fast, disk-efficient, first-class in Astro docs. Commit `pnpm-lock.yaml`. npm is a fine fallback if the client prefers. |
| **TypeScript** `5.x` | Types across `.astro`, API route, scripts | Extend `astro/tsconfigs/strict`. Run `astro check` in CI. |
| **Biome** `2.x` | Lint + format for `.ts`/`.js`/`.json`/`.css` | One fast binary, one config — replaces ESLint + Prettier for non-Astro files. `.astro` support is still partial in Biome 2. |
| **Prettier** + **prettier-plugin-astro** | Format `.astro` files only | Astro's official formatting path. Scope Prettier to `**/*.astro` so it doesn't fight Biome. (If the team would rather have one tool, use Prettier + `eslint-plugin-astro` for everything instead — acceptable, just slower.) |
| **@lhci/cli** (Lighthouse CI) | Gate: assert Performance/SEO/Best-Practices/Accessibility ≥ 95 | Run against `astro preview` (or the Vercel preview URL) in GitHub Actions; fail the PR below budget. This is the enforcement mechanism for the perf requirement. |
| **unlighthouse** `0.18.x` | Local full-site Lighthouse scan | One command scans every route + gives a diff view. Use during development; LHCI is the CI gate. |
| **@axe-core/cli** or **pa11y-ci** | *(optional)* automated a11y gate | Backstops the AA-contrast / keyboard-nav requirement. Manual keyboard + screen-reader pass still required. |
| **npm audit** / **pnpm audit** in CI | Dependency vuln gate | Client requirement: `audit` clean. Keep the dependency tree small (this stack is ~8 runtime deps). |

---

## Installation

```bash
# Scaffold
pnpm create astro@latest -- --template minimal --typescript strict

# Core integrations
pnpm add @astrojs/vercel @astrojs/sitemap

# Fonts (provider packages for the Astro Fonts API)
pnpm add -D @fontsource-variable/outfit @fontsource/dm-sans   # if using the fontsource provider offline

# Form endpoint
pnpm add resend zod @upstash/ratelimit @upstash/redis

# Analytics
pnpm add @vercel/analytics            # + @vercel/speed-insights if wanted

# Image optimization (usually pulled in automatically by astro:assets)
pnpm add sharp

# Dev tooling
pnpm add -D @biomejs/biome prettier prettier-plugin-astro @lhci/cli unlighthouse
```

### `astro.config.mjs` shape (reference)

```js
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dmarques.com.br',
  output: 'static',
  adapter: vercel(),               // no imageService — build-time Sharp only
  integrations: [sitemap()],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",           // Vercel Analytics posts same-origin
        "style-src 'self' 'unsafe-inline'", // see CSP tension below
        "upgrade-insecure-requests",
      ],
      // script-src stays strict: Astro injects 'self' + sha256 hashes automatically
    },
  },
  fonts: [
    { provider: fontProviders.fontsource(), name: 'Outfit',  cssVariable: '--font-display', weights: [300,400,500,600,700,800] },
    { provider: fontProviders.fontsource(), name: 'DM Sans', cssVariable: '--font-body',    weights: [400,500], styles: ['normal','italic'] },
  ],
});
```

---

## The two tensions, addressed head-on

### Performance budget vs. animation richness

**Verdict: keep everything hand-rolled. Add no animation library.**

The design's motion is already implemented well:
- **Reveal-on-scroll** — `IntersectionObserver` with `rootMargin: '0px 0px -8% 0px'`, `threshold: 0.08`, `unobserve` after firing, plus a `setTimeout` fallback. Animates only `opacity`/`transform`. This is exactly the recommended pattern; a library would do the same thing with more bytes.
- **Cursor glow** — `pointermove` (passive) throttled through a single `requestAnimationFrame`, writes `translate3d` on a `will-change:transform` layer. Correct.
- **Particle network** — `<canvas>`, `devicePixelRatio` capped at 2, point count scaled to area, `ResizeObserver` re-seed. Needs one addition: **stop the rAF loop when the hero canvas is off-screen** (IntersectionObserver toggling `requestAnimationFrame`/`cancelAnimationFrame`) — the PROJECT requirement already calls for this.

What a library would cost, for zero functional gain (no timelines, no scroll-scrubbing, no SVG morphing needed):

| Library | Approx. cost | Why not here |
|---------|--------------|--------------|
| `motion` (Motion, ex-Motion One) | ~18 KB min+gz for the full package; ~4–5 KB if you cherry-pick `animate`/`inView` | Only worth it if you later need spring physics or orchestrated sequences. It *is* the sanctioned escape hatch — but not for fade-up + glow. |
| **GSAP + ScrollTrigger** | ~50 KB+ min+gz | Massive for a landing page. Justified only for complex scroll-scrubbed storytelling. Blows the budget. |
| **AOS** | ~14 KB + mandatory CSS, ships its own global styles, no SSR/island story, effectively unmaintained | Strictly worse than the 15 lines of IO already written. |
| **Lenis / Locomotive smooth-scroll** | ~10 KB + hijacks native scroll | Introduces scroll jank, breaks `scroll-behavior`, harms accessibility and Lighthouse. The design's `html{scroll-behavior:smooth}` is sufficient. |
| **@bprogress / nprogress** | small | It's a route-change progress bar for SPAs. Irrelevant to a static one-pager. |

**Refactor required:** the current `<script>` is the Claude-Design editor runtime (`DCLogic`, React-ish lifecycle). Rewrite it as **one plain `<script>` module in the Astro page** (Astro bundles + hashes it for CSP). Structure:
1. `matchMedia('(prefers-reduced-motion: reduce)')` — if reduced, immediately set all `[data-reveal]` to final state, skip glow + particles entirely.
2. IO reveal (as-is).
3. Glow (as-is), but also gate on a pointer-fine media query so it's not attached on touch devices.
4. Particles as an **Astro island** (`ParticleField.astro` with a `<canvas>` + `client:visible`) *or* a module script that only calls `getContext('2d')` after an IO fires — either keeps it off the critical path. Prefer the island for clean lifecycle + automatic non-execution when reduced-motion is set via a guard.

No island is needed for the reveal or the glow — a module `<script>` (defer by default in Astro) is enough. The form is a plain HTML `<form>` posting to the API route; it needs **no client JS framework** — progressive-enhancement fetch handler is a ~30-line module script.

### CSP vs. the design's inline styles/scripts

The design uses **inline `style="..."` attributes on nearly every element** and one big inline `<script>`. CSP treats these differently:

| Source type | CSP directive | Astro `security.csp` behavviour |
|-------------|---------------|------------------------------|
| `<script>` blocks (inline + Astro-generated) | `script-src` / `script-src-elem` | **Auto-hashed** (`sha256-…`). Strict `script-src 'self'` works with **no `unsafe-inline`**. |
| `<style>` blocks + Astro scoped styles | `style-src` / `style-src-elem` | **Auto-hashed.** Strict works. |
| **Inline `style="..."` attributes** | `style-src-attr` | **Not hashable in practice.** Requires `'unsafe-inline'` (or `'unsafe-hashes'` + a hash per distinct attribute value — unmanageable here). |

**Recommendation (two-step):**

1. **During build-out, migrate inline `style=""` → Astro component `<style>` blocks / scoped styles.** This is the right move for maintainability anyway (the design tokens — `#0A0A12`, `#6C4CFF`, Outfit/DM Sans — belong in CSS custom properties, not repeated inline). Astro hashes scoped styles automatically, so `style-src 'self'` becomes achievable with no `unsafe-*`.
2. **Pragmatic v1 fallback:** ship `style-src 'self' 'unsafe-inline'` while `script-src` stays strict (`'self'` + hashes, no `unsafe-inline`). Rationale: **inline *style* is not a meaningful XSS vector** — the injection risk that CSP exists to stop is script execution, which stays locked down. Keeping `'unsafe-inline'` only on `style-src` is a widely accepted tradeoff. Document it and tighten in a later phase as styles get extracted.

**Never** add `'unsafe-inline'` or `'unsafe-eval'` to `script-src`. If Astro's hashing misses a dynamically injected script, add its hash via `Astro.csp.insertScriptResource()` rather than loosening the directive.

**Header delivery split:**
- **`vercel.json` `headers`** → `Strict-Transport-Security` (with `preload`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (lock down `geolocation=()`, `camera=()`, `microphone=()`, etc.), `X-Frame-Options: DENY`. These must live in `vercel.json` because they have to apply to **static assets and prerendered HTML**, which Astro middleware cannot touch on a static build.
- **Astro `security.csp`** → the CSP itself, because only the build knows the script/style hashes. Emitted as a `<meta http-equiv>` on static pages and as a real header on the on-demand form route.

---

## Rate limiting on Vercel serverless — the honest picture

**You cannot do durable, cross-instance rate limiting on Vercel serverless without external state.** Each function instance has its own memory; a fresh instance (cold start, scale-out) has no history. Anything "in-memory" is best-effort only.

**Recommended for v1:**
- **`@upstash/ratelimit` + `@upstash/redis`**, Upstash free tier. Sliding window, e.g. `Ratelimit.slidingWindow(5, '10 m')` keyed by client IP (`x-forwarded-for` / `x-real-ip`). HTTP-based, no connection pooling problem. ~10K commands/day free is far more than an agency contact form needs.
- **Plus** a **honeypot** hidden field (bots fill it → silently drop) and a **min-fill-time** check (form rendered-to-submitted < ~2 s → drop). These need no state and stop the majority of spam.

**Acceptable minimal alternative** (if the client wants zero extra services in v1): module-scope `Map` token bucket keyed by IP — resets per instance, leaky, but combined with the honeypot + Vercel's platform-level DDoS protection it's *tolerable* for a low-traffic site where the real hardening lands in **milestone 2** (Cloudflare Turnstile + WAF + edge rate limiting, already in PROJECT scope). Call this out explicitly as a known gap, don't present it as sufficient.

Do **not** reach for Vercel KV as a separate concept — it's Upstash Redis under the hood; use `@upstash/redis` directly.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `@astrojs/vercel` adapter + `output: 'static'` | **Pure static, no adapter**, form handled by a standalone `/api/*.ts` Vercel Function outside Astro | Works, but you lose Astro's CSP header integration for that route and split the codebase's routing model. Only pick this if you want the form function completely decoupled from Astro's build. |
| Build-time Sharp (`astro:assets`) | Vercel Image Optimization (`imageService: true`) | Only if you later add many CMS/user-supplied images not known at build time. For a fixed set of hero/founder images it's pure downside (cost, CSP origin, runtime dep). |
| Astro Fonts API (self-host) | `@fontsource-variable/*` imported manually in CSS | Fully valid and rock-solid. Use it if the Fonts API's fallback-metrics generation or caching misbehaves in your build. Same performance outcome, slightly more manual `@font-face` + `preload` wiring. |
| Google Fonts CDN | — | **Never** for this project. Adds two third-party origins to CSP, a render-blocking request chain, and sends visitor IPs to Google (LGPD friction). The design's current `<link>` to `fonts.googleapis.com` should be deleted. |
| Vercel Web Analytics | **Plausible Cloud** ($9/mo) | If the client wants a polished standalone dashboard (goals, funnels) or anticipates leaving Vercel. Adds `plausible.io` to `script-src` + `connect-src`. Still cookieless / no banner. |
| Vercel Web Analytics | **Umami** (self-hosted) | Only if the client insists on owning the analytics data. Requires hosting a DB + app — extra infrastructure and attack surface, contradicts the "minimal surface" requirement for v1. |
| Hand-rolled motion | `motion` (`animate` + `inView`, cherry-picked) | If a future phase needs spring physics, orchestrated multi-element sequences, or scroll-scrubbed animation. Tree-shakes to ~4–5 KB. This is the *only* sanctioned library escape hatch. |
| Biome + scoped Prettier | ESLint (`eslint-plugin-astro`) + Prettier | If the team already has a shared ESLint config they want to reuse, or needs a lint rule Biome lacks. Slower, more config, but battle-tested with `.astro`. |
| pnpm | npm | Client/CI preference. npm works fine; just commit `package-lock.json` and set it consistently in Vercel. |
| `@upstash/ratelimit` | In-memory `Map` bucket | v1-only, if the client wants no external service before the milestone-2 Cloudflare layer. Document the gap. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **GSAP + ScrollTrigger** | ~50 KB+ for effects the design doesn't need (no scroll-scrubbing / timelines). Destroys the Lighthouse ≥95 budget on mobile. | Hand-rolled IntersectionObserver + CSS transitions (already written). |
| **AOS (Animate On Scroll)** | ~14 KB + forced global CSS, no island/SSR model, effectively unmaintained. Strictly worse than the existing 15-line observer. | Existing `[data-reveal]` + IO pattern. |
| **Lenis / Locomotive Scroll** (smooth-scroll hijack) | Overrides native scrolling → jank, accessibility regressions, worse CLS/INP, Lighthouse penalties. | Native `html { scroll-behavior: smooth }` (already in the design). |
| **`@bprogress` / `nprogress`** | Route-transition progress bars for SPAs — no concept applies to a static one-page site. | Nothing. |
| **A UI framework (React/Vue/Svelte) for the form** | Ships a runtime + hydration for a 4-field form. Violates "sem framework de UI pesado". | Plain `<form>` + progressive-enhancement `fetch` in a module `<script>`. |
| **Google Fonts `<link>` CDN** | Third-party CSP origins, render-blocking chain, sends IPs to Google (LGPD). | Astro Fonts API self-hosting. |
| **Vercel Image Optimization for v1** | Runtime cost + `connect-src`/`img-src` third-party origin + not "100% static". | `astro:assets` + Sharp at build time. |
| **`'unsafe-inline'` / `'unsafe-eval'` in `script-src`** | Defeats the primary purpose of CSP; the client's explicit "no one can alter the site" requirement. | Astro `security.csp` auto-hashing; `Astro.csp.insertScriptResource()` for edge cases. |
| **`experimental.csp` / `experimental.fonts` flags** | Removed — both graduated to stable (`security.csp`, `fonts`) in Astro 6. Stale tutorials still reference the flags. | Stable config keys. |
| **`output: 'hybrid'`** | Removed in Astro 5. `output: 'static'` + a per-route `export const prerender = false` is the current way to mix static + on-demand. | `output: 'static'` + adapter + `prerender = false` on the form route only. |
| **Storing leads in a DB (v1)** | Explicitly out of scope; adds a stateful attack surface. | Resend email only. |
| **A CMS / admin panel** | Explicitly out of scope; entire attack-surface class. | Content Collections + Markdown. |

---

## Stack Patterns by Variant

**If the contact form must not depend on any external service in v1:**
- Drop `@upstash/*`; use a module-scope `Map` token-bucket + honeypot + min-fill-time.
- Accept that rate limiting is best-effort until milestone 2 (Cloudflare Turnstile + WAF). Document in the security review.

**If the client wants a standalone analytics dashboard or may leave Vercel:**
- Swap Vercel Web Analytics → Plausible Cloud. Add `script-src https://plausible.io` and `connect-src https://plausible.io` to CSP. Still no consent banner.

**If the Astro Fonts API misbehaves in the Vercel build:**
- Fall back to `@fontsource-variable/outfit` + `@fontsource/dm-sans`, import the `.css` in a layout, add manual `<link rel="preload">` for the two most-used weights. Same runtime result.

**If a later phase needs real scroll-driven storytelling:**
- Add `motion` and use `inView` + `animate`; keep it in an island with a `prefers-reduced-motion` guard. Do not add GSAP.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `astro@7.3.x` | Node `>=22.12.0` (`>=24` recommended on Vercel) | Astro 7 engine requirement; Node 20 deprecated on Vercel Oct 1 2026. |
| `@astrojs/vercel@11.x` | `astro@^7.0.0` (peer) | Must move in lockstep with Astro majors. v11 targets Astro 7. |
| `@astrojs/sitemap@3.7.x` | `astro@^7` (and 5/6) | Current release (Aug 2026). Needs `site` set in config. |
| `security.csp` | All official adapters incl. Vercel | Stable since Astro 6.0. Emits `<meta>` on prerendered pages, header on SSR routes. |
| Astro Fonts API | Stable since Astro 6.0 | Config key is `fonts` (top-level), not `experimental.fonts`. |
| `zod@4.x` | Node 18+ | Standalone; no Astro coupling. Astro Content Collections also accept Zod 4 schemas. |
| `resend@6.x` | Node 18+ | Runs in the Vercel Node function only; never import into a prerendered page. |
| `@upstash/ratelimit@2.x` | `@upstash/redis@1.x` | Use together; both are REST clients (no TCP). |
| `@vercel/analytics@2.x` | Astro (component/script include) | Adapter `webAnalytics` option is for `@vercel/analytics` ≤1.3; use the include for v2. |
| Biome `2.x` | `.ts`/`.js`/`.json`/`.css` | `.astro` support still partial — keep Prettier + `prettier-plugin-astro` for `.astro`. |

---

## Sources

- Context7 `/withastro/docs` — CSP config (`security.csp`, `Astro.csp.insertDirective/insertScriptResource`, `styleDirective`), Vercel adapter (`imageService`, `devImageService`, `webAnalytics`, `imagesConfig`), `output: 'static'`. HIGH.
- Context7 `/withastro/astro` (version `astro_6.3.1` indexed) + npm `astro@7.3.1` (published 2026-09-03), `engines.node >=22.12.0`. HIGH.
- npm registry (2026-09-05) — verified latest: `@astrojs/vercel@11.0.10` (peer `astro@^7.0.0`), `@astrojs/sitemap@3.7.4`, `resend@6.26.0`, `zod@4.5.4`, `@upstash/ratelimit@2.0.8`, `@upstash/redis@1.38.4`, `motion@13.2.0`, `@vercel/analytics@2.0.1`, `@vercel/speed-insights@2.0.0`, `@biomejs/biome@2.5.12`, `@fontsource-variable/outfit@5.3.0`, `sharp@0.35.4`, `unlighthouse@0.18.0`. HIGH.
- https://astro.build/blog/whats-new-june-2026/ + https://astro.build/blog/astro-7/ — Astro 7 (Rust compiler, Vite 8, Advanced Routing, route caching stable, 15–61% faster builds). HIGH.
- https://astro.build/blog/astro-6/ + web search — `experimental.csp` → stable `security.csp` in Astro 6; `experimental.fonts` → stable `fonts` in Astro 6; auto-hashing of inline scripts/styles; compatible with Vercel/Netlify/Cloudflare/Node adapters. HIGH.
- https://docs.astro.build/en/reference/experimental-flags/csp/ + https://docs.astro.build/en/guides/fonts/ — CSP hashes-not-nonces rationale, `style-src-attr` limitation for inline `style=""`; Fonts API providers (Fontsource, Google, Bunny, local). HIGH for mechanism, MEDIUM for the `style-src 'unsafe-inline'` pragmatic recommendation (judgement call).
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions + https://vercel.com/changelog/node-js-20-is-being-deprecated — Node 24 default LTS on Vercel 2026, Node 20 disabled Oct 1 2026. HIGH.
- https://upstash.com/docs/redis/sdks/ratelimit-ts/overview + https://vercel.com/docs/functions/limitations — connectionless rate limiting for serverless; per-instance statelessness → external store required. HIGH.
- https://www.pkgpulse.com/guides/vercel-analytics-vs-plausible-vs-umami-privacy-first-2026 + https://scripts.nuxt.com/learn/privacy-first-analytics-compared — all three cookieless / no-consent-banner; Vercel Analytics zero-config same-origin. MEDIUM (secondary sources, corroborated).
- Motion package size (`motion@13.2.0` unpacked ~718 KB; tree-shaken `animate`/`inView` subset ~4–5 KB min+gz) — npm + Motion docs. MEDIUM.

---
*Stack research for: Astro SSG marketing landing site (animation-heavy, security-hardened, Vercel)*
*Researched: 2026-09-05*
