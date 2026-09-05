# Architecture Research

**Domain:** Static one-page marketing site (Astro SSG on Vercel) with one serverless form endpoint, Markdown/YAML content collections, canvas + scroll effects, and a strict security + performance budget
**Researched:** 2026-09-05
**Confidence:** HIGH for Astro mechanics and project layout (Context7 + official docs), MEDIUM for exact CSP/scoped-style interplay (version-sensitive) and CSS scroll-driven animation coverage (still evolving)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  BUILD TIME (CI / `astro build`)                                      │
├──────────────────────────────────────────────────────────────────────┤
│  src/content/*  ──►  content.config.ts (zod schema)  ──►  getCollection()
│         │                                                    │        │
│         ▼                                                    ▼        │
│  Markdown / YAML                                   Section .astro     │
│  (services, process,                              components render   │
│   differentiators, faq, cases)                            │          │
│                                                           ▼          │
│  src/styles/tokens.css + global.css  ──►  bundled EXTERNAL .css      │
│  src/components/interactive/*<script> ──►  bundled EXTERNAL .js      │
│                                                           │          │
│                                                           ▼          │
│                          dist/  =  static HTML + hashed assets       │
│                          + 1 serverless function (api/orcamento)     │
└──────────────────────────────────────────────────────────────────────┘
                                   │  git push
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│  EDGE / CDN  (Vercel today ──► Cloudflare in front at Milestone 2)   │
├──────────────────────────────────────────────────────────────────────┤
│  vercel.json `headers`  ─► CSP / HSTS / X-CTO / Referrer-Policy /    │
│                            Permissions-Policy on EVERY response      │
│  ┌────────────────────────────┐   ┌───────────────────────────────┐  │
│  │ Static HTML/CSS/JS/img     │   │ /api/orcamento (Node fn)      │  │
│  │ (immutable, cached at CDN) │   │ prerender = false             │  │
│  └────────────┬───────────────┘   └───────────────┬───────────────┘  │
└───────────────┼───────────────────────────────────┼──────────────────┘
                │ GET (document)                    │ POST (form)
                ▼                                   ▼
┌───────────────────────────┐        ┌──────────────────────────────────┐
│  BROWSER                  │        │  validation.ts (zod)             │
│  ┌─────────────────────┐  │        │      ▼                           │
│  │ Zero-JS HTML shell  │  │        │  anti-spam.ts (honeypot+timing)  │
│  │ + external CSS      │  │        │      ▼                           │
│  └─────────────────────┘  │        │  rate-limit.ts (Upstash REST)    │
│  progressive enhancement: │        │      ▼                           │
│  · RevealObserver (idle)  │        │  mailer.ts ──► Resend API        │
│  · CursorGlow (idle)      │        │      ▼                           │
│  · ParticleField (visible)│        │  303 redirect  OR  JSON result   │
│  · ContactFormEnhancer    │◄───────┤                                  │
│    (visible)              │  resp  └──────────────────────────────────┘
└───────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `src/pages/index.astro` | Compose the one-pager from section components; owns page-level `<head>` via layout | Prerendered `.astro`, zero JS of its own |
| `src/layouts/BaseLayout.astro` | `<head>`, meta/OG/Twitter, JSON-LD `LocalBusiness`, `<link>` to self-hosted fonts, global CSS import, skip-link, `<slot />` | `.astro` layout |
| `src/components/sections/*` | One file per design section (Nav, Hero, Serviços, Processo, Diferenciais, Sobre, Contato, FAQ, CTA, Rodapé); pull data via `getCollection()` | Pure `.astro`, no client JS |
| `src/components/primitives/*` | Reusable zero-JS bits: `Button`, `Icon` (inline SVG registry), `SectionHeader`, `Reveal` wrapper | Pure `.astro` |
| `src/components/interactive/*` | The four behaviors that need JS, each = markup + co-located `<script>` (no UI framework): `ParticleField`, `CursorGlow`, `RevealObserver`, `ContactFormEnhancer` | `.astro` + processed `<script>` (bundled, deferred, external) |
| `src/content.config.ts` | Declare collections + zod schemas (`services`, `process`, `differentiators`, `faq`, `cases`) | `defineCollection` + `glob()` loader |
| `src/pages/api/orcamento.ts` | The ONLY on-demand route: parse body, validate, anti-spam, rate-limit, send email, respond | `export const prerender = false`; `POST` handler |
| `src/lib/*` | Framework-free, unit-testable modules: `validation`, `anti-spam`, `rate-limit`, `mailer`, `client-ip`, `env` | Plain TS |
| `src/data/site.ts` | Global constants not authored as repeated content: phone, e-mail, Instagram, nav items, `wa.me` URL | Plain TS module |
| `vercel.json` | Single source of truth for security headers on every response (static + function) | JSON `headers[]` |
| `src/middleware.ts` (optional) | Headers/logic that only make sense on the on-demand response (e.g. per-request CSP nonce) — not needed for v1 | `defineMiddleware` |

---

## Recommended Project Structure

```
.
├── astro.config.mjs          # integrations, env schema, security.csp, build.inlineStylesheets:'never'
├── vercel.json               # headers[] — CSP/HSTS/etc for all routes
├── tsconfig.json             # extends astro/tsconfigs/strict
├── .env.example              # documents required vars, no values
├── .nvmrc                    # pin Node version = Vercel runtime
├── lighthouserc.json         # Lighthouse CI assertions (>=0.95 x4)
├── public/
│   ├── favicon.svg
│   ├── robots.txt            # or generate via @astrojs/sitemap + integration
│   ├── fonts/                # self-hosted Outfit + DM Sans (woff2, latin subset)
│   └── og/                   # pre-rendered Open Graph image(s)
├── src/
│   ├── pages/
│   │   ├── index.astro                     # one-pager (prerendered)
│   │   ├── politica-de-privacidade.astro   # LGPD page (prerendered)
│   │   ├── obrigado.astro                  # no-JS form success target (prerendered)
│   │   ├── 404.astro
│   │   └── api/
│   │       └── orcamento.ts                # prerender = false — single serverless fn
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── sections/    SiteNav Hero Services Process Differentiators
│   │   │               About Contact Faq FinalCta SiteFooter  (.astro)
│   │   ├── primitives/  Button Icon SectionHeader Reveal        (.astro)
│   │   └── interactive/ ParticleField CursorGlow RevealObserver
│   │                    ContactFormEnhancer                     (.astro + <script>)
│   ├── content.config.ts
│   ├── content/
│   │   ├── services/*.yaml
│   │   ├── process/*.yaml
│   │   ├── differentiators/*.yaml
│   │   ├── faq/*.yaml
│   │   └── cases/*.md
│   ├── lib/
│   │   ├── env.ts            # re-export from astro:env/server (one import site)
│   │   ├── validation.ts     # zod schema for the quote form
│   │   ├── anti-spam.ts      # honeypot + timing checks
│   │   ├── rate-limit.ts     # Upstash Redis REST limiter + hard daily cap
│   │   ├── mailer.ts         # Resend wrapper + email body
│   │   └── client-ip.ts      # IP extraction (x-forwarded-for now / cf-connecting-ip M2)
│   ├── styles/
│   │   ├── tokens.css        # :root design tokens as CSS custom properties
│   │   ├── global.css        # reset, base elements, @keyframes, .reveal, .hp, reduced-motion
│   │   └── utilities.css     # optional small utilities (.delay-*, layout helpers)
│   ├── data/
│   │   └── site.ts
│   └── middleware.ts         # optional; only touches on-demand responses
└── .github/workflows/
    ├── ci.yml               # astro check + build + npm audit + dependency review
    └── lighthouse.yml       # Lighthouse CI gate against the Vercel preview URL
```

### Structure Rationale

- **`sections/` vs `primitives/` vs `interactive/`:** hard separation between "renders HTML, ships no JS" (sections, primitives) and "ships a small deferred script" (interactive). Makes the perf budget auditable at a glance and makes the security review trivial: only `interactive/` and `api/` can introduce runtime code.
- **`lib/` holds framework-free modules:** the form logic (validation, anti-spam, rate-limit, mailer) never imports from `astro:*` except through `lib/env.ts`, so it is unit-testable and portable if the endpoint ever moves to a Cloudflare Worker in M2.
- **`content/` split by collection, YAML for lists, Markdown for prose:** `services`/`process`/`differentiators`/`faq` are short structured records → YAML data collections (clean schema, no Markdown renderer needed). `cases` has prose and a cover image → Markdown with frontmatter.
- **`styles/` is three files, imported once in `BaseLayout`:** tokens are separate so they can be referenced by every scoped component `<style>` without re-declaration. `global.css` absorbs the design's current inline `<style>` block verbatim (reset + `@keyframes`).
- **`data/site.ts` not a collection:** contact details and nav are referenced everywhere but authored once; a typed module beats a one-entry collection.
- **`api/` under `pages/`:** Astro routes API endpoints from `src/pages/`; keeping it the only file with `prerender = false` makes the "one serverless function" guarantee visible in the tree.

---

## Architectural Patterns

### Pattern 1: Static-by-default, one route opts out

**What:** `output: 'static'` is the Astro default. Add the Vercel adapter for the function. Every page prerenders to HTML at build; only `src/pages/api/orcamento.ts` sets `export const prerender = false` and becomes a Node serverless function.

**When to use:** Any mostly-static site with a small dynamic surface. This is the correct shape for the whole PROJECT requirement set.

**Trade-offs:** You must remember the opt-out is per-file; a stray `prerender = false` (or an adapter misconfig like `functionPerRoute: true`) silently turns pages into functions, enlarging the attack surface and hurting Lighthouse. Guard it in the per-phase security review.

```js
// astro.config.mjs
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dmarques.com.br',
  adapter: vercel({ webAnalytics: { enabled: true } }), // same-origin analytics, no CSP change
  integrations: [sitemap()],
  build: { inlineStylesheets: 'never' },   // force ALL CSS to external files -> style-src 'self'
  image: { service: { entrypoint: 'astro/assets/services/sharp' } }, // build-time optimise, no runtime image svc
  env: {
    schema: {
      RESEND_API_KEY:        envField.string({ context: 'server', access: 'secret' }),
      RESEND_TO:             envField.string({ context: 'server', access: 'secret' }),
      UPSTASH_REDIS_REST_URL:   envField.string({ context: 'server', access: 'secret', optional: true }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
```

### Pattern 2: Islands without a UI framework

**What:** Astro `.astro` components ship zero JS. The four interactive behaviors are each an `.astro` component with a co-located processed `<script>` (NOT `is:inline`). Astro bundles those scripts into external, deferred `<script type="module" src>` files — CSP-clean under `script-src 'self'`. The `client:*` hydration directives only apply to framework components, which this project does not use; replicate their semantics in vanilla JS.

**Directive → vanilla mapping used here:**

| Interactive piece | Intended directive | Vanilla equivalent in the `<script>` | Extra gates |
|---|---|---|---|
| `RevealObserver` (scroll reveal) | `client:idle` | run at module eval; `requestIdleCallback` to attach a single `IntersectionObserver` over all `[data-reveal]` | honor `prefers-reduced-motion`; `rootMargin: '0px 0px -8% 0px'`; `setTimeout` fallback reveal-all at ~2.6 s; skip entirely if `CSS.supports('animation-timeline','view()')` and you ship the CSS path (see Pattern 6) |
| `CursorGlow` | `client:idle` | `requestIdleCallback`; bail unless `matchMedia('(pointer:fine)')` and `prefers-reduced-motion: no-preference`; `pointermove` + `requestAnimationFrame`, write `transform: translate3d()` on a `will-change` layer | none |
| `ParticleField` (canvas) | `client:visible` | `IntersectionObserver` on the canvas: start `requestAnimationFrame` loop on enter, `cancelAnimationFrame` on exit; also stop on `visibilitychange` hidden | skip if `prefers-reduced-motion`, `navigator.connection?.saveData`, or viewport `< 768px`; `devicePixelRatio` capped at 2; point count ∝ area (matches the design prototype) |
| `ContactFormEnhancer` | `client:visible` | `IntersectionObserver` on the `<form>`; on enter, attach `submit` listener that `preventDefault()`s and `fetch()`es JSON | form works with no JS before this attaches (Pattern 5) |

**When to use:** Perf-critical sites where a framework runtime (even Preact ~5 KB) is unnecessary. Escape hatch: if the form UX grows (multi-step, live masking), introduce Preact for `ContactForm` only and hydrate `client:visible` — nothing else changes.

**Trade-offs:** You hand-write IntersectionObserver/idle plumbing instead of getting it from a directive. It is ~15–30 lines per behavior and keeps total shipped JS in the low single-digit KB.

### Pattern 3: Typed content collections

**What:** `content.config.ts` defines every collection with a zod schema; sections call `getCollection('services')` etc. Build fails on malformed content.

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const order = z.number().int().nonnegative();

const services = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/services' }),
  schema: z.object({
    title: z.string(), description: z.string(),
    icon: z.enum(['site', 'system', 'web', 'automation']),
    order, featured: z.boolean().default(false),
  }),
});
const process = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/process' }),
  schema: z.object({ step: z.number().int().positive(), title: z.string(), description: z.string() }),
});
const differentiators = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/differentiators' }),
  schema: z.object({ number: z.string(), title: z.string(), description: z.string(), order }),
});
const faq = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/faq' }),
  schema: z.object({ question: z.string(), answer: z.string(), order }),
});
const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: ({ image }) => z.object({
    title: z.string(), client: z.string().optional(), summary: z.string(),
    cover: image(), tags: z.array(z.string()).default([]),
    url: z.string().url().optional(), order, draft: z.boolean().default(false),
  }),
});

export const collections = { services, process, differentiators, faq, cases };
```

**Trade-offs:** Slight ceremony for five tiny collections, but it is the PROJECT's "no CMS" requirement realized safely — content is data, validated at build, zero runtime.

### Pattern 4: Design tokens as CSS custom properties + scoped component styles

**What:** `tokens.css` declares one `:root` block with every value from PROJECT "Tokens de design" (`--bg`, `--bg-deep`, `--accent`, `--accent-light`, `--surface-1/2`, font stacks, fluid type steps, radii, shadows, easings, durations). Components use `var(--...)` in Astro **scoped** `<style>`. With `build.inlineStylesheets: 'never'`, every scoped block is extracted to an external stylesheet → `style-src 'self'`, no hashes, no `unsafe-inline`.

```css
/* src/styles/tokens.css */
:root {
  --bg:#0A0A12; --bg-deep:#05050A; --accent:#6C4CFF; --accent-light:#9A85FF;
  --surface-1:#F2F3F6; --surface-2:#F7F8FA;
  --font-display:'Outfit',system-ui,sans-serif; --font-body:'DM Sans',system-ui,sans-serif;
  --dur-reveal:.7s; --ease-out:cubic-bezier(.16,1,.3,1); --radius-card:20px;
}
```

**Trade-offs:** `'never'` adds a couple of small CSS requests vs inlining; negligible over HTTP/2 on Vercel and worth it for the clean CSP. Do NOT use `<style define:vars>` or `style={...}` — both emit inline `style` attributes.

### Pattern 5: Progressive-enhancement form flow

**What:** The `<form>` is real HTML that works with no JavaScript; the island only upgrades the UX.

```
No-JS path:
  <form method="POST" action="/api/orcamento">  (nome, whatsapp, tipo_projeto,
     + hidden honeypot `empresa`, + hidden `ts` build marker)
        │  native submit (application/x-www-form-urlencoded)
        ▼
  /api/orcamento  →  zod.parse  →  honeypot empty? timing ok? under rate-limit?
        │  ok                                   │ fail
        ▼                                       ▼
  Resend.emails.send()                    303 → /?erro=validacao#contato
        │
        ▼
  303 See Other → /obrigado   (prerendered thank-you page)

JS-enhanced path (ContactFormEnhancer, client:visible):
  submit → preventDefault → fetch('/api/orcamento', {method:'POST',
           headers:{'content-type':'application/json'}, body: JSON})
        → 200 {ok:true}  → swap in inline success state, keep scroll/particles
        → 4xx {ok:false, errors} → render field errors inline, no navigation
```

The endpoint content-negotiates: `application/json` → JSON response; otherwise → `303` redirect (native form). Anti-spam order is **honeypot → timing → rate-limit → send** (cheapest rejections first, external call last).

```ts
// src/pages/api/orcamento.ts
export const prerender = false;
import type { APIRoute } from 'astro';
import { quoteSchema } from '../../lib/validation';
import { isBot } from '../../lib/anti-spam';
import { limit } from '../../lib/rate-limit';
import { sendQuote } from '../../lib/mailer';
import { clientIp } from '../../lib/client-ip';

export const POST: APIRoute = async ({ request }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json')
    || request.headers.get('content-type')?.includes('application/json');
  const raw = request.headers.get('content-type')?.includes('application/json')
    ? await request.json()
    : Object.fromEntries(await request.formData());

  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success || isBot(raw)) return fail(wantsJson, 'validacao');

  const gate = await limit(clientIp(request));           // per-IP + hard daily cap
  if (!gate.success) return fail(wantsJson, 'limite', 429);

  await sendQuote(parsed.data);
  return wantsJson
    ? new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    : new Response(null, { status: 303, headers: { Location: '/obrigado' } });
};
```

**Timing check caveat (static hosting):** there is no server render of the page, so a hidden timestamp is frozen at build time and cannot measure "time on page". Treat timing as a **JS-only bonus** (the enhancer stamps `ts` on mount) and lean on honeypot + rate-limit for the no-JS baseline. Turnstile in Milestone 2 is the real bot defense — the flow is already shaped for it (same-origin POST, server-side verify step slots in before `sendQuote`).

**Trade-offs:** Content-negotiation branching adds a few lines. In exchange the form is resilient to hydration failure, slow networks, and the pre-`client:visible` window.

### Pattern 6: Zero-JS scroll reveal with a JS fallback

**What:** The design's reveal is `opacity:0; transform:translateY(20px); transition:...` toggled by IntersectionObserver. Two ways to ship it CSP-safely:

- **Primary (preferred), CSS scroll-driven:** `.reveal { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }` inside `@media (prefers-reduced-motion: no-preference)` and `@supports (animation-timeline: view())`. Zero JS in Chromium/Edge (and Firefox as it ships it).
- **Fallback, `RevealObserver` island (`client:idle`):** for Safari and older browsers — a single `IntersectionObserver` over `[data-reveal]` that adds `.is-visible`. Guard with `if (CSS.supports('animation-timeline','view()')) return;` so it is inert where the CSS path runs.
- Per-item stagger via `.reveal[data-delay="1..6"] { animation-delay: … }` in external CSS (no inline `style`).

**Status / confidence (MEDIUM):** `animation-timeline: view()` is Chromium/Edge/Opera since mid-2023; Firefox trailing; **Safari still unsupported as of early 2026**. So the IO fallback is mandatory, not optional. If you would rather ship one code path, skip the CSS layer and use only the `RevealObserver` island — it is ~20 lines and non-render-blocking.

**Trade-offs:** Two code paths to keep visually identical. The single-island route is simpler; the CSS route removes JS for ~70% of visitors.

### Pattern 7: Security headers in `vercel.json`, middleware only for the dynamic route

**What:** All security headers are declared once in `vercel.json` `headers[]` matching `/(.*)`. They apply at Vercel's edge to static assets AND the function response — and survive putting Cloudflare in front later. Astro `middleware.ts` is reserved for logic that needs the request (e.g. a per-response CSP nonce) and only runs for on-demand routes, i.e. `/api/orcamento`; for v1 it is unnecessary.

Why not `<meta http-equiv>` CSP only: a `<meta>` CSP cannot express `frame-ancestors`, `report-uri`/`report-to`, or `sandbox`. `frame-ancestors 'none'` is a hard requirement, so a real header is required regardless. Keep CSP in one place — the header.

```json
// vercel.json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "Content-Security-Policy",
        "value": "default-src 'self'; base-uri 'none'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; upgrade-insecure-requests" },
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
      { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
    ]
  }]
}
```

**Rollout:** ship as `Content-Security-Policy-Report-Only` first on preview deploys, confirm zero violations in DevTools, then flip to enforcing.

**Optional belt-and-suspenders:** Astro 6's `security.csp` (stable) auto-hashes any bundled scripts/scoped styles and can inject a `<meta>` CSP on prerendered pages. If you keep `build.inlineStylesheets: 'never'` and use only processed `<script>` (external), you do not need it — `'self'` covers everything. Enabling it is harmless and gives defense in depth. Note it is incompatible with `<ClientRouter />` view transitions (not used here) and Shiki (use Prism if you add code highlighting).

### Pattern 8: Server-only secrets via `astro:env`

**What:** `RESEND_API_KEY` (and recipient, Upstash tokens) are declared `context: 'server', access: 'secret'` in the config `env.schema`. Import from `astro:env/server` only, funneled through `src/lib/env.ts`. Per Astro docs, "secret server variables are not part of your final bundle" — this is a build guarantee, not a naming convention like `PUBLIC_`/`import.meta.env`.

```ts
// src/lib/env.ts   — the ONLY place astro:env/server is imported
export { RESEND_API_KEY, RESEND_TO, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from 'astro:env/server';
```

- In Vercel: add the same keys as **Environment Variables** (Production + Preview). `.env` is gitignored; `.env.example` lists names only.
- Never reference these in a `sections/` or `interactive/` component. The security review greps the built `dist/` for `re_` (Resend key prefix) and the var names.
- `import.meta.env.PUBLIC_*` is for genuinely public values (site URL, analytics id) and still ends up in the client bundle — do not put anything sensitive there.

**Trade-offs:** Schema must be kept in sync with Vercel's dashboard; a missing required secret fails the build loudly (desired).

---

## Data Flow

### Request flow — document (GET)

```
Browser ─GET /─► Vercel CDN edge ─► static index.html (+ vercel.json headers)
   │
   ├─ parses HTML, loads external tokens.css + global.css + component css   (style-src 'self')
   ├─ loads self-hosted woff2 from /fonts                                   (font-src 'self')
   ├─ deferred module scripts execute:                                      (script-src 'self')
   │     RevealObserver (idle) · CursorGlow (idle) · ParticleField (visible) · ContactFormEnhancer (visible)
   └─ Vercel Web Analytics beacon → /_vercel/insights/*                     (same-origin, connect-src 'self')
```

### Request flow — quote submission (POST)

```
[user submits #contato form]
        │
   JS present? ──yes──► fetch POST /api/orcamento  (application/json)
        │ no
        └──────────────► native POST /api/orcamento (x-www-form-urlencoded)
                                   │
                    ┌──────────────▼───────────────────────────────┐
                    │ src/pages/api/orcamento.ts (prerender=false) │
                    │  1 parse body (json | formData)              │
                    │  2 quoteSchema.safeParse  (lib/validation)   │
                    │  3 isBot: honeypot + timing (lib/anti-spam)  │
                    │  4 limit(ip): Upstash REST + daily cap       │──► Upstash Redis (HTTPS REST)
                    │  5 sendQuote(data) (lib/mailer)              │──► Resend API  (Authorization: RESEND_API_KEY)
                    └──────────────┬───────────────────────────────┘
                        ok         │            fail
              json: 200 {ok}       │      json: 4xx/429 {ok:false,errors}
              form: 303 /obrigado  │      form: 303 /?erro=...#contato
```

### Build-time content flow

```
src/content/{services,process,differentiators,faq}/*.yaml   src/content/cases/*.md
        └────────────► content.config.ts (zod validate) ◄────────────┘
                                   │  getCollection('...')
                                   ▼
        sections/*.astro  ──►  index.astro  ──►  dist/index.html  (fully rendered, zero JS from content)
```

### Key data flows

1. **Content → HTML (build only):** YAML/Markdown is validated by zod, read with `getCollection()`, rendered by section components into static HTML. No content code reaches the browser.
2. **Lead capture (runtime, one direction):** browser → `/api/orcamento` → Resend. Nothing is persisted (PROJECT: "não armazenar leads" in v1). Upstash holds only rate-limit counters keyed by hashed IP, with TTL.
3. **Effects (runtime, client-only):** particle/glow/reveal read DOM + media queries, write style/canvas. No network, no cross-island messaging — each island is independent.
4. **Secrets (build + runtime):** declared in `env.schema`, injected by Vercel into the function environment, read via `astro:env/server`; never serialized into any static asset.

---

## Build Order / Component Dependencies

Ordered so each step only depends on earlier ones. Maps to candidate roadmap phases.

| # | Deliverable | Depends on | Notes for roadmap |
|---|-------------|-----------|-------------------|
| 1 | **Foundation:** Astro init, `astro.config` (adapter, env schema, `inlineStylesheets:'never'`), `tsconfig` strict, `.nvmrc`, self-hosted fonts, `tokens.css` + `global.css` (absorb the design's inline `<style>` + `@keyframes`), `BaseLayout.astro`, empty `vercel.json` | — | Everything else depends on this. Establishes the zero-inline baseline. |
| 2 | **Content layer:** `content.config.ts` + seed `services`/`process`/`differentiators`/`faq`/`cases` files | 1 | Pure data; unblocks every section. |
| 3 | **Static sections (zero JS):** SiteNav, Hero markup (no canvas yet), Services, Process, Differentiators, About, Contact (form markup only), Faq, FinalCta, SiteFooter; `politica-de-privacidade`, `obrigado`, `404` pages | 1, 2 | This is a shippable, fully static, Lighthouse-100 site with a non-functional form. Biggest single chunk — the CSP-safe refactor of the design happens here. |
| 4 | **Progressive-enhancement effects:** `RevealObserver` (+ optional CSS scroll-driven layer), `CursorGlow`, `ParticleField` | 3 (markup + tokens) | Independent of each other; can be parallel sub-tasks. All gated on `prefers-reduced-motion` / pointer / saveData. |
| 5 | **Form backend + enhancement:** `lib/validation`, `lib/anti-spam`, `lib/client-ip`, `lib/rate-limit` (Upstash), `lib/mailer` (Resend), `api/orcamento.ts`, then `ContactFormEnhancer` | 1 (env), 3 (form markup) | No-JS path (steps + endpoint + `/obrigado`) works before the enhancer exists. Needs `RESEND_API_KEY` (+ optional Upstash) in Vercel. |
| 6 | **SEO / metadata:** `@astrojs/sitemap`, `robots.txt`, JSON-LD `LocalBusiness`, OG/Twitter tags + `public/og/` image, `display=swap` + `font-display` | 1, 3 | Mostly in `BaseLayout`; low risk. |
| 7 | **Security headers finalize:** fill `vercel.json` CSP/HSTS/etc, run Report-Only pass, flip to enforce; add `middleware.ts` only if a nonce is needed | 4, 5 (all origins known) | Do last because you must know every script/style/img/connect origin the finished site uses. |
| 8 | **CI/CD gates:** Vercel Git integration + preview deploys (from #1), then Lighthouse CI ≥ 0.95 ×4, `npm audit`/Dependency Review, `astro check`, header-regression check | runs alongside all phases | Wire preview deploys at #1; tighten gates as features land. |

**Component dependency summary (what talks to what):**

```
index.astro ─uses─► sections/*  ─read─► getCollection() ─validated by─► content.config.ts
sections/*  ─use─► primitives/* (Button, Icon, SectionHeader, Reveal)
sections/Contact ─renders─► <form action="/api/orcamento">
interactive/ContactFormEnhancer ─POST─► /api/orcamento ─imports─► lib/{validation,anti-spam,rate-limit,mailer,client-ip,env}
lib/env ─imports─► astro:env/server            (only import site for secrets)
lib/rate-limit ─HTTPS─► Upstash Redis REST
lib/mailer ─HTTPS─► Resend API
BaseLayout ─imports─► styles/{tokens,global}.css ; data/site.ts
vercel.json ─sets headers on─► every response (static + function)
interactive/* ─touch─► DOM + matchMedia only   (no network, no inter-island calls)
```

---

## How the inline-style-heavy design becomes CSP-safe

The design file (`arquivos de design/Dmarques Landing.dc.html`) is a Claude Design canvas: `style="..."` on nearly every element, `style-hover=""` / `style-focus=""` pseudo-attributes, one inline `<style>` in `<helmet>`, and one inline `<script type="text/x-dc">` (the design-editor runtime). Concrete conversion:

| In the design | CSP problem | Refactor |
|---|---|---|
| `style="display:flex;gap:…;color:#fff;…"` on every element | needs `style-src 'unsafe-inline'` | Move into the component's Astro **scoped `<style>`** using semantic classes + `var(--token)`. With `build.inlineStylesheets:'never'` these become external CSS → `style-src 'self'`. |
| `style-hover="color:#6C4CFF"` / `style-focus="…"` | editor-only attribute; not real CSS | Real `:hover` / `:focus-visible` rules in the scoped `<style>`. |
| Per-card stagger `transition:… .12s` inline | inline style | `.reveal[data-delay="1..6"]{animation-delay:…}` (or `:nth-child()`) in external CSS. `data-*` is CSP-safe. |
| `data-reveal="1"` + inline `opacity:0;transform:translateY(20px)` | inline style | `.reveal { opacity:0; transform:translateY(20px) }` in `global.css`; `.is-visible` (or CSS `view()` timeline) does the rest. |
| Inline `<style>` in `<helmet>` (reset + `@keyframes dmFloat/dmPulse`) | inline `<style>` element | Paste verbatim into `src/styles/global.css`, imported once by `BaseLayout`. |
| Inline `<script type="text/x-dc">` (IO reveal, glow rAF, particle canvas, form `onSubmit`) | inline `<script>` → `script-unsafe-inline` | Split into four `interactive/*.astro` components with **processed** `<script>` (Astro bundles → external, deferred). The particle algorithm, `rootMargin`, `devicePixelRatio<=2`, timeout fallback all carry over as-is. |
| `onSubmit="{{ onSubmit }}"`, `onClick="{{ … }}"` inline handlers | inline event handler → blocked by strict CSP | `addEventListener` inside the component `<script>`. The hero-variant switcher buttons are design-only and are dropped (v1 ships Hero 03 Bleed). |
| SVG icons inline in markup | none — SVG elements are not scripts/styles | Keep; move into `primitives/Icon.astro` as a registry to dedupe. |
| Google Fonts `<link>` to `fonts.googleapis.com` + `fonts.gstatic.com` | two third-party origins in `style-src`/`font-src`; extra RTT; logs visitor IP (LGPD) | **Self-host** Outfit + DM Sans (Fontsource or manual woff2 subset) in `public/fonts/`, `@font-face` in `global.css`, `font-display: swap`. Removes both origins and the `preconnect`. |
| Analytics | third-party script origin | **Vercel Web Analytics** is served same-origin (`/_vercel/insights/*`) → no CSP change. (Plausible/Umami would need their origin added.) |

**Result:** no `style` attributes, no inline `<style>`, no inline `<script>`, no inline event handlers, no third-party origins → enforceable

```
default-src 'self'; base-uri 'none'; object-src 'none';
script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self';
connect-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none';
upgrade-insecure-requests
```

with **no `unsafe-inline` and no `unsafe-eval`**.

**SRI:** with fonts self-hosted and analytics same-origin, v1 loads **zero CDN assets**, so there is nothing to SRI. Rule for future phases: any `<script src>` / `<link href>` to a third-party origin must carry `integrity="sha384-…"` + `crossorigin="anonymous"` and a version-pinned URL, and must be added to the CSP in the same change. Prefer vendoring the file into `public/` over a CDN.

---

## Does not preclude the Milestone 2 Cloudflare edge layer

| M2 need | Why v1 architecture already allows it |
|---|---|
| Cloudflare proxying (orange-cloud) in front of Vercel | Site is plain static + one same-origin POST path. `site` uses the real domain, never a `*.vercel.app` URL. DNS repoint only. |
| Edge WAF / DDoS / flood mitigation | Static assets are CDN-served and absorb load; the single function is the only dynamic target and is already behind app-level rate-limiting, so Cloudflare rules layer on top rather than replace. |
| Edge rate-limiting | `lib/rate-limit.ts` is a single swappable module. Cloudflare can take over and the module becomes a thin no-op or second layer. |
| Turnstile on the quote form | Flow already has a discrete server-side gate before `sendQuote()` — Turnstile verify slots in there. CSP delta is known and documented: add `https://challenges.cloudflare.com` to `script-src` and `frame-src`. Not added in v1. |
| Real client IP behind Cloudflare | All IP reads go through `lib/client-ip.ts`; switch `x-forwarded-for` → `cf-connecting-ip` in one place. |
| Security headers | Declared in `vercel.json`; Cloudflare in front does not strip them. Optionally move to Cloudflare Transform Rules later without touching app code. |

---

## Scaling Considerations

| Scale | Architecture adjustments |
|-------|--------------------------|
| 0–1k visits/day | Nothing. Static from CDN; function cold starts are fine for a contact form. Resend free tier (3k/mo) ample. |
| Traffic spike / press hit | Static pages scale on Vercel's CDN automatically. Ensure `ParticleField` stays gated (mobile/saveData/reduced-motion) so it never dominates main-thread on low-end devices. |
| Form abuse / spam flood | Upstash per-IP limit + a **hard daily global cap** in `rate-limit.ts` so a flood cannot exhaust the Resend quota or incur cost; honeypot rejects the naive bots. M2 Turnstile + Cloudflare edge rate-limit is the durable fix. |
| Content growth (many cases / FAQ) | Collections scale to hundreds of entries with no runtime cost — still fully prerendered. If cases ever need pagination or their own pages, add `src/pages/cases/[...slug].astro`, still static. |
| Need to store leads | Add a persistence step in `lib/mailer`/a new `lib/store` (e.g. Vercel KV / a DB) behind the same endpoint — no structural change. Revisit LGPD basis first. |

### Scaling priorities

1. **First bottleneck: the serverless function under spam.** Fix: strict per-IP + daily-cap rate limiting (in v1), Turnstile + Cloudflare rate rules (M2).
2. **Second bottleneck: main-thread on low-end mobile from the canvas.** Fix: the media/saveData/reduced-motion gates and offscreen `cancelAnimationFrame` must be in from day one, not retrofitted.

---

## Anti-Patterns

### Anti-Pattern 1: Going SSR to "simplify" the form

**What people do:** set `output: 'server'` or a global `prerender = false`.
**Why it's wrong:** turns every page into a function — larger attack surface, slower TTFB, harder to hit Lighthouse ≥ 95, contradicts the PROJECT's "menor superfície de ataque" rationale.
**Do this instead:** keep `static` default; only `api/orcamento.ts` opts out. Verify in each security review that no other file has `prerender = false` and the Vercel adapter is not set to `functionPerRoute: true`.

### Anti-Pattern 2: A UI framework for the whole page

**What people do:** scaffold with React/Vue and hydrate sections.
**Why it's wrong:** ships a runtime and hydration JS for content that is 100% static; blows the perf budget.
**Do this instead:** `.astro` components everywhere; four small vanilla `<script>` islands. Reach for Preact (`client:visible`) only for `ContactForm` and only if its UX genuinely grows.

### Anti-Pattern 3: Keeping the design's inline styles / handlers "for now"

**What people do:** port `style="..."`, `onClick=""`, `is:inline`, or `set:html` to move fast, plan to clean up later.
**Why it's wrong:** any one of them forces `script-src`/`style-src 'unsafe-inline'`, defeating the entire strict-CSP requirement; "later" never comes.
**Do this instead:** do the class/scoped-style conversion during Phase 3 as the sections are built — there is no cheaper time.

### Anti-Pattern 4: CSP via `<meta>` only

**What people do:** rely on Astro's `<meta http-equiv>` CSP injection.
**Why it's wrong:** `<meta>` cannot set `frame-ancestors`, `report-to`, or `sandbox`; you still need a header for clickjacking protection.
**Do this instead:** CSP (and all security headers) live in `vercel.json`. Astro `security.csp` is optional defense-in-depth, not the delivery mechanism.

### Anti-Pattern 5: In-memory rate limiting

**What people do:** a module-level `Map<ip, count>` in the function.
**Why it's wrong:** resets on cold start and is per-instance, not global — trivially bypassed.
**Do this instead:** Upstash Redis REST (`@upstash/ratelimit`) keyed by hashed IP with TTL, plus a daily global counter. Abstracted so M2 can swap it for Cloudflare.

### Anti-Pattern 6: Trusting `x-forwarded-for` raw / loading Google Fonts from the CDN

**What people do:** read the full `x-forwarded-for` header for rate-limit keys; keep the `fonts.googleapis.com` `<link>`.
**Why it's wrong:** `x-forwarded-for` is client-appendable (spoof the key, evade the limit); Google Fonts adds two CSP origins, an extra RTT, and logs visitor IPs (LGPD friction).
**Do this instead:** derive IP from the platform-trusted value in one helper (`lib/client-ip.ts`); self-host the fonts.

---

## Integration Points

### External Services

| Service | Integration pattern | Notes / gotchas |
|---------|---------------------|-----------------|
| **Resend** | `resend` SDK called from `lib/mailer.ts` inside `api/orcamento.ts`; key from `astro:env/server` | Verify sending domain (SPF/DKIM) or deliverability suffers. Never import the SDK from a component. Free tier 3k/mo — enforce a daily cap. Set a plain-text + minimal HTML body; include submitted fields only. |
| **Upstash Redis** | REST API via `@upstash/ratelimit` + `@upstash/redis` from `lib/rate-limit.ts` | REST (not TCP) so it works in serverless with no connection pooling. Optional in v1 (`envField … optional: true`) — if unset, fall back to honeypot + daily cap and log a warning. |
| **Vercel** | Git integration (preview per push, prod on `main`), env vars, Web Analytics, adapter `@astrojs/vercel` | Analytics script is same-origin — no CSP entry. Immutable deploys give instant rollback. Pin Node via `.nvmrc` to match the function runtime. |
| **Google Fonts** | NOT integrated at runtime — download once, self-host `woff2` in `public/fonts/` | Removes `fonts.googleapis.com` + `fonts.gstatic.com` from CSP and the LGPD IP-logging concern. |
| **Cloudflare (M2)** | DNS proxy in front of Vercel; Turnstile widget + server verify; WAF + rate rules | Nothing in v1 blocks it. Known CSP delta: `https://challenges.cloudflare.com` in `script-src` + `frame-src`. Switch IP source to `cf-connecting-ip` in `lib/client-ip.ts`. |

### Internal Boundaries

| Boundary | Communication | Considerations |
|----------|---------------|----------------|
| section component ↔ content | `getCollection()` at build | zod schema is the contract; build fails on drift |
| `ContactFormEnhancer` ↔ `/api/orcamento` | HTTP POST (JSON when JS present, form-encoded otherwise) | endpoint must handle both bodies and both response styles (JSON vs 303) |
| `api/orcamento` ↔ `lib/*` | direct function calls | `lib/*` free of `astro:*` imports except via `lib/env.ts` → portable to a Worker in M2 |
| interactive island ↔ interactive island | none | each self-contained; no shared bus, no global state |
| app ↔ security headers | `vercel.json` (build-independent) | one place; middleware only for on-demand-route-specific needs |
| build ↔ secrets | `env.schema` ↔ Vercel env vars | names must match; missing required secret fails the build (intended) |

---

## "Security review each phase" — what it checks

Run at every phase boundary (`/gsd:secure-phase`):

- **No new inline surface:** grep source for `style=`, `is:inline`, `set:html`, `on<event>=`, inline `<style>`/`<script>`. Must be zero.
- **CSP still enforceable:** preview deploy responds with the enforcing `Content-Security-Policy` header (no `unsafe-inline`/`unsafe-eval`); DevTools console shows zero CSP violations on load and on form submit.
- **Headers present:** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY` on both a static route and the API route.
- **Secrets server-only:** `grep -r "re_" dist/` and a search for secret var names in `dist/` return nothing; no `PUBLIC_` var holds anything sensitive; `.env` is gitignored.
- **Static guarantee intact:** exactly one file has `prerender = false`; adapter not in `functionPerRoute` mode; `dist/` output is HTML + assets + one function.
- **New third-party origin?** must come with a CSP update in the same change + SRI (or be vendored into `public/`).
- **Form defenses live:** honeypot submission is rejected; over-limit submission returns 429; oversized/invalid payload returns 4xx without a stack trace; error responses leak no internals.
- **Dependency hygiene:** `npm audit --audit-level=high` clean; GitHub Dependency Review passes on the PR; every dependency added this phase is justified in the phase notes; lockfile committed; CI uses `npm ci`.
- **Lighthouse gate:** Performance / SEO / Best-Practices / Accessibility all ≥ 0.95 on the preview URL (Lighthouse CI, PR-blocking).
- **Reduced motion / a11y:** `prefers-reduced-motion` disables particle loop, glow, and reveal transitions; keyboard nav and visible focus intact; contrast AA.

---

## Sources

- Astro Docs — Experimental/stable Content Security Policy: https://docs.astro.build/en/reference/experimental-flags/csp/ (CSP stable in Astro 6.0; `style-src-attr`, `scriptDirective`/`styleDirective`, meta vs header behavior, ClientRouter/Shiki incompatibility) — HIGH
- Astro Docs — Environment variables / `astro:env`: https://docs.astro.build/en/guides/environment-variables/ ("secret server variables are not part of your final bundle", `envField`, `context`/`access`, adapter `getSecret`) — HIGH
- Astro Docs — Vercel adapter: https://docs.astro.build/en/guides/integrations-guide/vercel/ — HIGH
- Astro blog — 5.9 (CSP introduced experimentally): https://astro.build/blog/astro-590/ ; Astro 6: https://astro.build/blog/astro-6/ — HIGH
- Vercel — Astro on Vercel: https://vercel.com/docs/frameworks/frontend/astro — HIGH
- withastro/astro issue #10211 — `functionPerRoute` generates functions for prerendered routes: https://github.com/withastro/astro/issues/10211 — MEDIUM
- Astro roadmap — hybrid rendering merged into `static` + per-route `prerender`: https://github.com/withastro/roadmap/blob/main/proposals/0039-hybrid-rendering.md — MEDIUM
- MDN — `animation-timeline` / CSS scroll-driven animations (Chromium-only, Safari unsupported as of early 2026): https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations — MEDIUM
- Chrome for Developers — Scroll-driven animations + `CSS.supports` fallback guidance: https://developer.chrome.com/docs/css-ui/scroll-driven-animations — MEDIUM
- Trevor Lasn — CSP headers for Astro (practical `vercel.json` + report-only rollout): https://www.trevorlasn.com/blog/csp-headers-astro — MEDIUM
- Upstash — `@upstash/ratelimit` for serverless (REST, per-IP fixed/sliding window): https://github.com/upstash/ratelimit-js — MEDIUM
- Resend — Node SDK / domain verification: https://resend.com/docs/send-with-nodejs — MEDIUM
- Project inputs: `.planning/PROJECT.md`; `arquivos de design/Dmarques Landing.dc.html` (inline-style + inline-script inventory) — HIGH

---
*Architecture research for: Astro static one-pager + single serverless form endpoint, strict CSP/perf budget, Cloudflare-ready*
*Researched: 2026-09-05*
