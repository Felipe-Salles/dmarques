# Pitfalls Research

**Domain:** Animation-heavy static marketing site (Astro SSG on Vercel) with a hard security mandate, a Resend contact form, and Brazil LGPD scope
**Researched:** 2026-09-05
**Confidence:** HIGH for Astro/Vercel/CSP/Resend mechanics (official docs + issue trackers); MEDIUM for LGPD specifics (secondary Brazilian sources, no case law cited); HIGH for the animation/perf failure modes (directly visible in the supplied design code)

> Suggested phase vocabulary used in this doc (roadmap may rename):
> - **P1 Scaffold** — Astro project, Vercel adapter, content collections, base layout, SEO plumbing
> - **P2 Sections** — the 9 sections as static HTML/CSS, responsive, `astro:assets` images
> - **P3 Motion** — reveal-on-scroll, cursor glow, float/pulse, canvas particles, `prefers-reduced-motion`
> - **P4 Form** — Astro endpoint + Resend, validation, honeypot, rate-limit, success/error UX
> - **P5 Security hardening** — CSP, response headers, dependency surface, Vercel project lockdown, SRI
> - **P6 LGPD & analytics** — privacy policy page, form notice/legal basis, cookieless analytics, mail auth (SPF/DKIM/DMARC)
> - **P7 Perf & a11y gate** — Lighthouse ≥95 on throttled mobile, axe pass, CLS/LCP budget
> - **Cross-cutting:** per-phase security review (`/gsd:secure-phase`)

---

## Critical Pitfalls

### Pitfall 1: CSP shipped with `unsafe-inline` for styles — the mandate is defeated on day one

**What goes wrong:**
The client's requirement is "nobody can deface the site," and the countermeasure on a static site is a strict Content-Security-Policy. But the supplied design is 100% inline `style="..."` attributes on every element (plus two inline `<style>` blocks and inline `<svg>`). The path of least resistance is `style-src 'self' 'unsafe-inline'`, which makes the style half of the CSP cosmetic — any injected markup can carry its own styling, and if `script-src` is ever loosened the same way, XSS-based defacement is wide open.

**Why it happens:**
The design tool emits inline styles; converting ~200 inline style attributes to classes/scoped styles is tedious, so teams keep the inline styles "for now" and add `unsafe-inline` to make the page render. Astro's own `<Image>`/`<Picture>` components also emit inline styles, which pushes people toward `unsafe-inline` even if their own code is clean (withastro/astro#14301).

**How to avoid:**
- In **P2**, treat "no author-written inline styles" as a definition-of-done. Move every `style="..."` into Astro scoped `<style>` or a small design-token CSS file. The `style-hover` / `style-focus` / `data-screen-label` attributes in the design are design-tool runtime, not production — they must become real `:hover`/`:focus-visible` CSS regardless.
- Adopt Astro's experimental hash-based CSP (`experimental.csp`, stable-ish since Astro 5.9) so Astro auto-generates hashes for the inline `<style>`/`<script>` it controls. Confirm your Astro version and test in a Vercel preview, not just `astro dev` (hash injection has had environment-specific bugs — withastro/astro#14495).
- For the unavoidable framework inline styles on `<img>`, prefer plain `<img>` from `astro:assets` `getImage()` (no wrapper inline style) over `<Image>`, or add a **narrowly scoped** `style-src-attr 'unsafe-hashes' '<hash>'` rather than blanket `unsafe-inline`.
- Deliver CSP as a **response header** via `vercel.json` (or middleware), not only a `<meta>` tag, so it also covers non-HTML responses and `frame-ancestors` (which `<meta>` cannot enforce).
- Include `frame-ancestors 'none'`, `base-uri 'none'`, `object-src 'none'`, `form-action 'self'`, `upgrade-insecure-requests`.

**Warning signs:**
`grep -r 'style="'` in `src/` returns hits after P2. CSP string contains `unsafe-inline` for `script-src`. CSP only present as `<meta>`. "CSP works locally but violations in preview."

**Phase to address:** P2 (kill inline styles), P5 (author + ship the header), re-checked every `/gsd:secure-phase`.

---

### Pitfall 2: The canvas particle loop never pauses — battery drain, throttled-mobile Lighthouse failure, and it contradicts a stated requirement

**What goes wrong:**
The design's `particles()` runs an unconditional `requestAnimationFrame` loop with an O(n²) neighbour-link scan (up to 90 points → ~4,000 `Math.hypot` calls + canvas strokes per frame). It only wires a `ResizeObserver` — there is **no** IntersectionObserver to pause when the hero scrolls out of view, and **no** `prefers-reduced-motion` guard. On a mid-range Android this is continuous main-thread work and GPU upload for the entire session, draining battery and keeping the page from ever going idle. PROJECT.md explicitly requires "canvas de partículas pausado fora da viewport" and `prefers-reduced-motion` respected — the prototype does neither.

**Why it happens:**
The design canvas code is copied over as-is because "it already works." Pause/visibility logic and reduced-motion handling are easy to forget because they don't affect the happy-path demo on a fast desktop.

**How to avoid (in P3):**
- Gate the whole loop: `if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;` — render one static frame instead of animating.
- Wrap the canvas in an `IntersectionObserver`; on `isIntersecting === false` call `cancelAnimationFrame` and set a flag; resume on re-entry. Also pause on `document.visibilitychange` (tab hidden).
- Cap devicePixelRatio at ~1.5 for the canvas backing store (the design caps at 2 — still heavy on a 3x phone), and lower the point count on small viewports / `navigator.hardwareConcurrency <= 4`.
- Consider dropping the per-frame neighbour-link scan on mobile (the most expensive part) and keep only drifting dots.
- Load the canvas island `client:visible` (or `client:idle`), never `client:load`.
- Respect the design's `particles` boolean prop as a kill switch.

**Warning signs:**
DevTools Performance shows scripting activity while the hero is scrolled away. Battery/thermal warnings on a real phone after a few minutes. Lighthouse "Minimizes main-thread work" / "JavaScript execution time" red on mobile. TBT > 200 ms.

**Phase to address:** P3 build it correctly; P7 verify on throttled mobile.

---

### Pitfall 3: The form endpoint becomes an email-bomb / spam relay because rate-limiting was designed for a stateful server

**What goes wrong:**
The `/api/contato` Astro endpoint calls Resend on every POST. Without durable throttling, a script can fire thousands of POSTs: it exhausts the Resend free tier (3,000/mo) so real leads silently fail, floods the founder's inbox, runs up Vercel function invocations, and — if the recipient/subject is attacker-influenced — turns the site into an open relay for third-party spam. The subtle version: the team *does* add rate-limiting, but as an in-memory `Map` counter. On Vercel each invocation may be a fresh isolate, so the counter resets constantly and the limit is effectively absent (Vercel KB: "In-memory rate limiting doesn't persist across serverless cold starts").

**Why it happens:**
Rate-limiting tutorials assume a long-lived Node process. Serverless statelessness is easy to forget. Milestone 2 (Cloudflare Turnstile + edge rate-limiting) is the "real" defense, so v1 rate-limiting gets treated as a formality.

**How to avoid (in P4):**
- Use a **shared store**: Upstash Redis (`@upstash/ratelimit`, free tier) keyed by client IP (`x-forwarded-for` first hop) **and** by a coarse global counter (e.g. max N sends/hour site-wide) as a hard backstop against distributed abuse.
- Add a **honeypot** field (already required by PROJECT.md) — a hidden input real users never fill; reject if populated. Cheap and catches most dumb bots.
- Add a **timing check**: reject submissions that arrive < ~2–3 s after page load (needs a signed timestamp field, see Pitfall 4).
- **Never** let the client choose the recipient, subject, or `from`. Hard-code them server-side.
- Cap request body size; reject non-`application/x-www-form-urlencoded`/`multipart` content types; require an `Origin`/`Referer` from your own domain (`form-action` in CSP helps too).
- Return `429` with `Retry-After` on limit; make the client UX degrade gracefully.
- Log abuse (without logging PII) so you know if you're being hit before M2 lands.
- Set a **Vercel WAF rate-limit rule** on the `/api/*` path if the plan allows — even on Hobby you can set some firewall rules; this is edge-level and free of the statelessness problem.

**Warning signs:**
Rate-limit code imports no external store. No honeypot in the form markup. Endpoint reads `to`/`subject` from `formData`. Resend dashboard shows bursts. Founder reports inbox spam.

**Phase to address:** P4 (build), P5 (review), residual risk explicitly carried to Milestone 2.

---

### Pitfall 4: User input is interpolated into the email HTML (and headers) unescaped — HTML/header injection

**What goes wrong:**
The lead's name / phone / project-type / message get dropped into an HTML email template via string concatenation. An attacker submits a name like `<a href="https://evil">click</a>` or `"><img src=x onerror=...>` and the founder's mail client renders it — phishing content delivered from a trusted sender. Worse: if any field flows into `subject`, `reply_to`, or a `from` display name and contains `\r\n`, it's classic email header injection (inject `Bcc:` etc.). Putting the raw phone/name into `reply_to` also lets an attacker set the reply target to an arbitrary address.

**Why it happens:**
"It's just an internal email to one person" lowers the guard. Template literals make HTML concatenation frictionless. Resend's API takes an `html` string, so people build it by hand.

**How to avoid (in P4):**
- Server-side validation with a schema (Zod/Valibot): name length + allowed characters, phone normalized to digits/`+()- `, project-type must be one of the fixed `<option>` values (reject anything else — never trust the select), message length cap.
- HTML-escape every interpolated value (`<`, `>`, `&`, `"`, `'`) before it touches the template, or build the email with a templating lib that auto-escapes. Prefer sending a `text` body in addition to `html`.
- Strip CR/LF from any value used in `subject` or address fields. Keep `reply_to` = a validated email only if you add an email field; otherwise don't set it from user input.
- Hard-code `from` to a verified-domain address; put the lead's contact info in the **body**, not the envelope.

**Warning signs:**
Endpoint code contains `` html: `<p>${body.nome}` `` with no escape step. `subject` includes `body.*`. No schema; fields read straight off `formData`. Project-type accepted as free text.

**Phase to address:** P4, verified in P5 security review.

---

### Pitfall 5: `RESEND_API_KEY` (or other secrets) leak into the client bundle

**What goes wrong:**
The Resend key ends up shipped to browsers — usually because it was named `PUBLIC_RESEND_API_KEY`, referenced from a `.astro` component's client script or a hydrated island, or read via `import.meta.env` in code that gets bundled to the client. Anyone can then send mail on the account until the key is rotated. Related leaks: committing `.env`, printing the key in a build log, or exposing it through a verbose error response.

**Why it happens:**
Astro only exposes vars prefixed `PUBLIC_` to the client, but people add the prefix to "make it work" when the real bug is that Resend is being called from the wrong place. Islands blur the server/client line.

**How to avoid:**
- Resend is called **only** from the server endpoint (`src/pages/api/contato.ts` with `export const prerender = false`). Never from a component script or island.
- Name it `RESEND_API_KEY` (no `PUBLIC_`). Use Astro's `astro:env` schema with `context: "secret", access: "secret"` so misuse is a build error.
- Add `.env*` to `.gitignore`; add a secret-scanning pre-commit hook (gitleaks) — this is a cheap per-phase check.
- After build, grep `dist/` for the key value and for `resend` — CI gate.
- Restrict the Resend key to "sending only" and a single verified domain; keep the rotate procedure documented.

**Warning signs:**
`PUBLIC_` prefix on any secret. `import { Resend }` appears in a `.astro`/`.tsx` that isn't an API route. `grep -r RESEND dist/` returns anything. Key visible in Vercel build logs.

**Phase to address:** P1 (env schema + gitignore + CI grep), P4 (endpoint), every `/gsd:secure-phase`.

---

### Pitfall 6: `client:load` everywhere — a "static" site that ships a framework runtime and blocks interaction

**What goes wrong:**
Only three things on this page need JS: the contact form, the cursor glow, and the hero canvas. If sections are built as framework components hydrated with `client:load` (or the whole page is one big island), the site ships React/Preact/Vue runtime + component code, hydrates on load, inflates TBT, and undermines the "carrega rápido" core value. Lighthouse mobile suffers most.

**Why it happens:**
Coming from Next/CRA, devs reach for components + hooks by habit. `client:load` is the "just make it interactive" default. The design's single `<script type="text/x-dc">` class encourages porting it as one monolithic client component.

**How to avoid:**
- Sections are `.astro` files with **zero** client JS. Reveal-on-scroll, float, pulse, and hover are CSS + one tiny vanilla `IntersectionObserver` script (`is:inline` or a `<script>` Astro bundles), not a hydrated island.
- Only the form, glow, and canvas are islands, and they use `client:visible` / `client:idle`, never `client:load`. The glow can be plain vanilla JS gated on a pointer + `prefers-reduced-motion` check.
- If a UI framework is added at all, prefer Preact or none. Budget: **< 20 KB** of JS transferred on the landing route.
- Add a CI check on `dist/` JS weight.

**Warning signs:**
`client:load` in any `.astro`. `node_modules/react-dom` in the client graph. Total JS on `/` > 30 KB gz. Hydration visible as a flash. TBT > 150 ms on throttled mobile.

**Phase to address:** P2 (sections stay static), P3 (island directives), P7 (JS-weight gate).

---

### Pitfall 7: Lighthouse ≥95 on desktop, but mobile / throttled fails — and mobile is the acceptance bar

**What goes wrong:**
The team runs Lighthouse in Chrome DevTools on a fast laptop, sees 98/100/100/100, and calls the perf requirement met. Vercel's own analytics and real Brazilian users (mid-range Android, 4G) see LCP > 3 s and a red Performance score. Big contributors specific to this design: the hero render-3D image as LCP with no `priority`/`srcset`; a 640 px blurred `mix-blend-mode:screen` glow div painting every frame; six `backdrop-filter: blur()` glass panels; render-blocking Google Fonts with six Outfit weights; the always-on canvas.

**Why it happens:**
DevTools Lighthouse defaults hide behind a fast machine; the "Mobile" preset still runs on desktop CPU unless throttling is honored. "It passed" is taken at face value.

**How to avoid:**
- Define the gate as: **Lighthouse mobile preset, 4x CPU throttle, Slow 4G, run in CI (Lighthouse CI / `@lhci/cli`) against a Vercel preview URL**, all four categories ≥ 95, on every PR. Desktop numbers are informational only.
- Also track field-style metrics with Vercel Speed Insights / Web Vitals after launch.
- Budget per metric: LCP < 2.5 s, CLS < 0.05 (stricter than 0.1 given the reveal transforms), TBT < 200 ms, INP < 200 ms.
- Test on a real cheap Android at least once before launch.

**Warning signs:**
Lighthouse only ever run from DevTools. No CI perf job. Score reported without device/throttle context. Perf passes but Speed Insights shows poor LCP post-launch.

**Phase to address:** P7 owns the gate; P1 should scaffold the Lighthouse CI job so every phase sees the number.

---

### Pitfall 8: CLS from web fonts + reveal transforms + images without dimensions

**What goes wrong:**
Three compounding sources: (1) Outfit/DM Sans load from Google with `display=swap`, so headings render in a fallback then reflow to Outfit — big `clamp(36px..68px)` headings shift noticeably; (2) `data-reveal` elements start at `opacity:0; transform:translateY(20px)` and the JS may not run before first paint, or the timeout fallback fires late, causing late movement counted as layout instability if not purely transform; (3) `image-slot` placeholders (hero 3D, founder portrait, future portfolio) rendered without intrinsic `width`/`height` collapse then push content when they load.

**Why it happens:**
`display=swap` is cargo-culted as "the fast option." Reveal animations are assumed to be CLS-free because they use transform — true only if the element also reserves its space and starts hidden via CSS that's present at first paint. Placeholder images rarely get dimensions.

**How to avoid:**
- **Self-host the fonts** (Astro experimental Fonts API, or `@fontsource-variable/outfit` + `@fontsource/dm-sans`), `font-display: optional` or `swap` with a **metrics-adjusted fallback** (`size-adjust`, `ascent-override`) so the swap is near-invisible. Self-hosting also removes a render-blocking third-party origin and the LGPD/data-transfer concern of Google Fonts (Pitfall 15). Subset to Latin + only the weights actually used (audit: the design uses ~4 Outfit weights, not 6).
- `preload` the two primary font files; keep `preconnect` only if you truly stay on Google.
- Ship the reveal's initial hidden state as **CSS in the document** (not applied by JS), scoped to `.no-js`-free `[data-reveal]`, and only animate `opacity`/`transform`. Provide a `<noscript>`/reduced-motion path that shows everything.
- Every `astro:assets` image and every `image-slot` replacement gets explicit `width`/`height` (or aspect-ratio box). Hero LCP image: `loading="eager"`, `fetchpriority="high"`, responsive `widths`.
- Measure CLS in the Lighthouse CI mobile run; budget < 0.05.

**Warning signs:**
`fonts.googleapis.com` in `<head>` at launch. Heading visibly reflows on reload. CLS > 0.05 in CI. `image-slot`/`<img>` without dimensions. Reveal state only set in the island's JS.

**Phase to address:** P1 (font strategy), P2 (image dimensions, reveal CSS), P7 (CLS budget).

---

### Pitfall 9: Adapter misconfig turns the "static" site into an on-demand SSR app

**What goes wrong:**
PROJECT.md wants "estático + uma função serverless para o formulário." With `@astrojs/vercel` it's easy to end up with `output: 'server'` (everything rendered per-request as a Vercel Function) instead of `output: 'static'` + one route opting out via `export const prerender = false`. Consequences: every page view is a function invocation (cost, cold starts, slower TTFB, worse Lighthouse), the HTML is no longer immutably CDN-cached, and the attack surface grows from "static files" to "a running renderer on every request" — the opposite of the client's mandate. The mirror-image mistake: forgetting `prerender = false` on the form route so it gets statically built and the POST 405s.

**Why it happens:**
Tutorials show `output: 'server'`. Astro 5 removed `hybrid`, so people over-correct. The Vercel adapter "just works" in either mode, hiding the mistake until the bill or the Lighthouse TTFB shows up.

**How to avoid (in P1):**
- `astro.config` = default static output + `@astrojs/vercel`. Only `src/pages/api/contato.ts` has `export const prerender = false`.
- After a deploy, verify in Vercel: exactly **one** Function (the API route); all HTML served as static assets. Add this to the P1 security-review checklist.
- Check response headers on `/`: should be a static `cache-control` with an immutable hash, not `x-vercel-cache: MISS` from a function on every hit.
- Don't add ISR/`isr` config — there's no dynamic content in v1.

**Warning signs:**
`output: 'server'` in config. Vercel dashboard shows many Functions or a catch-all render function. `/` responds with dynamic cache headers. Build output has no `dist/*.html`.

**Phase to address:** P1, re-verified at each `/gsd:secure-phase` and before launch.

---

### Pitfall 10: Astro View Transitions (or a nav enhancement) silently break the scroll/glow/canvas listeners

**What goes wrong:**
If `<ClientRouter />` / View Transitions get added (for a polished feel, or later for the Privacy Policy page), client scripts that ran on `DOMContentLoaded` / at module top-level **do not re-run** after a client-side navigation. The IntersectionObserver for reveals, the `pointermove` glow handler, and the canvas init stop working after navigating from `/politica-de-privacidade` back to `/` — and duplicate listeners can stack up if partially re-init'd. `scroll-behavior: smooth` + hash links (`#servicos` etc.) can also fight a router.

**Why it happens:**
View Transitions look free and are often added late. The failure only shows on the *second* page visited, so it escapes a single-page smoke test.

**How to avoid:**
- v1 has two routes (landing + privacy). **Don't add View Transitions** unless there's a concrete reason; a normal `<a>` navigation to the privacy page is fine and keeps every script's lifecycle simple.
- If added: move all init into `astro:page-load` listeners; tear down listeners/observers/`cancelAnimationFrame` on `astro:before-swap`; use `data-astro-rerun` for inline scripts that must re-execute; give the canvas/glow elements `transition:persist` if they should survive swaps.
- Keep anchor smooth-scroll as CSS only; test all in-page `#` links after any router change.

**Warning signs:**
Reveals/glow work on first load, dead after navigating back. Multiple glow elements or doubled observers in the Elements panel. Console errors on `astro:after-swap`.

**Phase to address:** P3 (decide + document "no View Transitions in v1"); revisit if routing grows.

---

### Pitfall 11: Availability & defacement gaps — third-party scripts without SRI, an unlocked Vercel project, exposed env vars

**What goes wrong:**
"Deface the site" has several cheap vectors on an otherwise-static site:
- A `<script src="https://cdn.some/thing.js">` (analytics, a font loader, an icon kit) with no `integrity`/SRI: if that CDN or npm package is compromised, arbitrary JS runs on your domain (supply-chain defacement). Google Fonts CSS is a variant.
- Vercel project not locked down: no 2FA on the account, Git integration lets any repo collaborator ship to production, no protected production branch, environment variables readable by everyone on the team, preview deployments publicly reachable.
- Secrets or internal notes in the repo / build output / source maps.
- Verbose error pages leaking stack traces, file paths, dependency versions.

**Why it happens:**
Static sites feel "unhackable," so account/pipeline hygiene is skipped. SRI is omitted because Astro-bundled local assets don't need it and the habit doesn't form for the one external script.

**How to avoid (P5, plus P1 for account setup):**
- **Zero third-party scripts** if at all possible. Self-host fonts (Pitfall 8) and use a first-party or serverless-proxied analytics (Pitfall 16). Every remaining external `<script>`/`<link rel=stylesheet>` gets SRI `integrity` + `crossorigin` + is pinned; add it to `script-src`/`style-src` by hash or exact origin, not wildcards.
- Astro's experimental CSP can emit SRI hashes for bundled scripts — enable it.
- Vercel: enable account 2FA; set the production branch and require PRs; restrict who can promote to production; scope env vars to the right environments and mark sensitive; turn on **Deployment Protection** (Standard Protection / Vercel Authentication) for Preview and, if the pre-launch site shouldn't be public, for Production too. Note previews are `X-Robots-Tag: noindex` by default but still URL-reachable without protection.
- `vite: { build: { sourcemap: false } }` (or ensure the adapter doesn't upload them) so production source maps aren't served.
- Custom `404`/`500` with no diagnostics; ensure the API route never returns raw error objects/stack traces — log server-side, return a generic message + request id.
- `npm audit` clean + `npm ci` from a committed lockfile; enable Dependabot; keep the dependency count minimal (the design needs almost none).
- Add security headers (Pitfall 12).

**Warning signs:**
Any non-self origin in `<head>`. `integrity=` missing on an external asset. Vercel "Everyone can deploy." Env vars not scoped. `.map` files fetchable under `/`. Stack traces in a 500 response. `npm audit` shows highs.

**Phase to address:** P1 (Vercel/account/repo lockdown, sourcemap off), P5 (SRI, CSP, headers, error hardening), every `/gsd:secure-phase`.

---

### Pitfall 12: Missing / weak security response headers

**What goes wrong:**
The site ships without `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`/`frame-ancestors`, `Cross-Origin-Opener-Policy`. Individually minor, collectively they're the baseline a security-mandate client (and any pentest / securityheaders.com scan) expects. Vercel does **not** add HSTS or CSP for you automatically — only TLS.

**Why it happens:**
Assumed to be "handled by Vercel." No single place owns headers on a static deploy.

**How to avoid (P5):**
- `vercel.json` `headers` (or Astro middleware) applied to all routes:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` (plus deny anything unused)
  - `X-Frame-Options: DENY` **and** CSP `frame-ancestors 'none'`
  - `Cross-Origin-Opener-Policy: same-origin`
  - the CSP from Pitfall 1
- Verify with `curl -I` and securityheaders.com (target A/A+) as a launch gate and a per-phase check.
- Confirm the API route inherits them and adds `Cache-Control: no-store`.

**Warning signs:**
`curl -I https://<site>` shows only Vercel defaults. securityheaders.com grade < A. HSTS absent. Headers present on HTML but not on the API response.

**Phase to address:** P5, checked every `/gsd:secure-phase` and at launch.

---

### Pitfall 13: The v1 residual risk — no edge DDoS/WAF protection — is left unstated and unmitigated

**What goes wrong:**
Cloudflare (WAF, edge rate-limiting, DDoS/flood mitigation, Turnstile) is explicitly deferred to Milestone 2. If that deferral is treated as "security done later," v1 launches with the origin (Vercel) directly exposed: a volumetric flood or a targeted hammering of `/api/contato` can exhaust Vercel Hobby limits (bandwidth, function invocations/duration), causing the site to go down or Vercel to soft-block it — which directly violates "ninguém pode derrubar o site." This is a **known, accepted** gap, but it must be documented with compensating controls, not ignored.

**Why it happens:**
Milestone boundaries make it easy to say "not my phase." The client's "can't be taken down" expectation and the deferral haven't been reconciled in writing.

**What v1 can still do (P4/P5), honestly:**
- **Static HTML is inherently DDoS-resilient**: pages are served from Vercel's CDN as immutable assets; a flood of GETs is absorbed by the edge cache and costs little. Keeping the site truly static (Pitfall 9) is the single biggest availability win available in v1.
- Put the only dynamic surface — `/api/contato` — behind: durable rate-limiting (Pitfall 3), honeypot + timing, a strict global hourly send cap, small body-size limit, `Origin` allow-list, and a **Vercel WAF/firewall rate-limit rule** on `/api/*` (available with limited rules even on lower tiers; edge-enforced, no statelessness issue).
- Set Vercel **Spend Management / usage alerts** and a hard spend cap so an attack degrades gracefully (form off) instead of a surprise bill or account suspension.
- Keep DNS at a provider where flipping to Cloudflare is a fast change (low TTL, no vendor lock) so M2 can be pulled forward if v1 gets attacked.
- Have a runbook: "if flooded, enable Vercel Attack Challenge Mode / accelerate Cloudflare onboarding."
- **Write the residual risk into PROJECT.md / the roadmap**: "v1 has no L3/L7 volumetric DDoS mitigation beyond CDN caching and app-level rate-limiting; accepted until Milestone 2; compensating controls listed above."

**Warning signs:**
No spend cap set. No Vercel firewall rule on `/api/*`. "DDoS" not mentioned anywhere in v1 planning docs. DNS TTL is 24 h / registrar-locked to a slow provider.

**Phase to address:** P4 + P5 for compensating controls; explicit risk-acceptance note in the roadmap; full fix in Milestone 2.

---

### Pitfall 14: `astro:assets` not actually used — images ship unoptimized

**What goes wrong:**
The design's `image-slot` placeholders get replaced with plain `<img src="/hero.png">` in `public/`, or with `<img>` pointing at big source files. Astro's build then does nothing to them: no WebP/AVIF, no responsive `srcset`, no compression, no lazy-loading below the fold. The hero render-3D (LCP) and the founder portrait and future portfolio shots become multi-hundred-KB PNGs — instant Lighthouse mobile failure and CLS.

**Why it happens:**
`public/` "just works" for images and skips the import ceremony. `astro:assets` requires importing the asset or using `<Image>`/`getImage()`, which is a small extra step per image.

**How to avoid (P2):**
- All raster images live in `src/` and go through `astro:assets` (`<Image>`, `<Picture>`, or `getImage()` + plain `<img>` to avoid the wrapper inline style — see Pitfall 1). Emit AVIF + WebP with fallback.
- Explicit `width`/`height`; `densities`/`widths` for responsive; `loading="eager"` + `fetchpriority="high"` only on the hero LCP image, `loading="lazy"` for the rest.
- SVG icons: keep inline (they're tiny) but consider a sprite; make sure they're covered by CSP (they're markup, not script).
- Set a per-image weight budget (e.g. hero < 120 KB at 1x) and check transferred bytes in the Lighthouse CI run.
- Confirm `@astrojs/vercel` image optimization config matches (or use Astro's built-in Sharp at build time so images are static assets, not on-demand — keeps the "static" property).

**Warning signs:**
Images in `public/`. `<img>` with a raw `.png`/`.jpg` `src` and no `srcset`. No `.avif`/`.webp` in `dist/`. Hero image > 200 KB. Lighthouse "Properly size images" / "Serve images in next-gen formats" red.

**Phase to address:** P2, verified P7.

---

### Pitfall 15: MDX / Content Collections misconfig

**What goes wrong:**
Content (services, process steps, differentiators, FAQ) goes into Content Collections but: no Zod `schema` in `src/content.config.ts`, so a typo in a Markdown frontmatter key fails silently or breaks the build cryptically; the FAQ answers contain raw HTML in Markdown and either get escaped (shows tags as text) or, if `allowDangerousHtml`/raw HTML is enabled, become an unreviewed injection surface; MDX is pulled in "just in case" and drags a compiler + lets JS/expressions into content (attack surface + slower build) when plain Markdown would do; the legacy `src/content/config.ts` + `getEntryBySlug` API is used instead of the current `content.config.ts` + `getEntry`/`render` (Astro 5), causing upgrade pain.

**Why it happens:**
Schemas feel optional for a solo project. MDX is the default reach. The API changed between Astro 4 and 5 and old tutorials abound.

**How to avoid (P1/P2):**
- Define every collection with a strict Zod schema (`z.object({...}).strict()`), including enums for anything constrained (service icon name, project-type list — this is also the allow-list the form validates against in Pitfall 4).
- Use **Markdown, not MDX**, for all v1 content (no interactivity needed). Don't install `@astrojs/mdx`.
- Don't enable raw HTML in Markdown; if a FAQ answer needs emphasis/links, that's standard Markdown. Content is authored by the founder only, but keep the "no arbitrary HTML in content" rule so it stays a non-vector.
- Use the Astro 5 API: `defineCollection` in `src/content.config.ts`, `getCollection`, `render(entry)`.
- Keep the `image()` helper for any content-referenced images so they still go through `astro:assets`.

**Warning signs:**
`src/content/config.ts` present (old location). No `schema:` key. `@astrojs/mdx` in deps. `getEntryBySlug` in code. Frontmatter typos don't fail the build. `rehype-raw` / `allowDangerousHtml` enabled.

**Phase to address:** P1 (collection setup + API version), P2 (author content against schema).

---

### Pitfall 16: LGPD — contact form with no privacy notice / legal basis, "cookieless" analytics that isn't, undisclosed data sharing, no retention statement

**What goes wrong:**
The form collects name + WhatsApp (personal data under LGPD). Common failures:
- No privacy notice at point of collection and no stated **base legal** (for a quote request the natural basis is *execução de contrato / procedimentos preliminares* under Art. 7, or legitimate interest — but it must be chosen and, if consent, actually collected).
- The privacy policy page is missing the LGPD-required elements: what's collected, purpose, legal basis, retention period, sharing with third parties, data-subject rights (Art. 18) and how to exercise them, controller identity/contact (a DPO/"encarregado" contact).
- "Cookieless analytics" that in practice sets a cookie or `localStorage` ID / fingerprints (some self-hosted setups do) — then a consent banner *is* required and the "no banner" design decision is invalid. Vercel Analytics/Plausible/Umami in their cookieless modes are fine, but this must be **verified**, not assumed.
- Lead data is emailed via Resend (a US processor) and possibly stored in the founder's inbox/Google account — an international transfer + a processor relationship that must be disclosed in the policy; no data-processing basis or mention.
- No retention statement: leads sit in an inbox forever with no deletion routine.
- `mailto:`/WhatsApp links and the founder's personal Hotmail address for business contact — fine, but the policy should reflect where data actually goes.

**Why it happens:**
"It's just a name and phone." LGPD compliance is treated as a single "add a policy page" task. Analytics cookie behavior isn't tested. Resend as a sub-processor isn't thought of as "sharing."

**How to avoid (P6):**
- Inline notice next to the submit button: short sentence + link to `/politica-de-privacidade`, stating purpose ("responder seu pedido de orçamento") and that data goes to Dmarques. If relying on consent, add an unchecked checkbox; if relying on contract/legitimate interest, a notice is enough — decide and document which.
- Privacy policy page content: controller (Felipe Salles / Dmarques, Ibitinga-SP, contact email), data collected (nome, WhatsApp, tipo de projeto, mensagem, timestamp/IP for anti-abuse), purpose, **legal basis per purpose**, retention ("leads mantidos por X meses e então excluídos" — pick a period, e.g. 12–24 months), recipients/processors (**Resend Inc. – EUA**, e-mail hosting, Vercel logs, analytics vendor), international transfer disclosure, data-subject rights + how to request, date + version.
- **Test** the chosen analytics with DevTools → Application: confirm zero cookies and no persistent identifier. If it sets one, either reconfigure to truly cookieless or add a compliant consent mechanism (which contradicts a project goal — so pick the tool that's genuinely cookieless: Vercel Web Analytics or Plausible in default mode).
- Anti-abuse IP logging (Pitfall 3) is itself personal-data processing — mention it in the policy (legal basis: legitimate interest / security) and keep those logs short-lived.
- Add a lightweight retention routine (even "manually purge the leads label quarterly") and note it.
- Link the policy from the footer and the form.

**Warning signs:**
Form has no notice/link. Policy page is a generic template with no legal basis and no retention period. Resend/Vercel/analytics not named as recipients. Analytics sets a `_pk`/`umami`/any cookie. No "encarregado"/contact for rights requests.

**Phase to address:** P6 owns it; P4 must leave a slot in the form markup for the notice; the analytics choice in P1/P6 must be verified cookieless.

---

### Pitfall 17: Mail is spoofable — no SPF / DKIM / DMARC on the sending domain

**What goes wrong:**
The form sends via Resend but from an unverified domain (or from `onboarding@resend.dev`), or the domain has SPF/DKIM but no DMARC. Result: lead emails land in spam (founder misses real business), and worse, the domain can be spoofed — anyone can send "Dmarques" email, which is a reputation/defacement-adjacent risk for a company whose pitch is trustworthiness.

**Why it happens:**
Resend works immediately with its sandbox sender, so domain verification gets postponed. DMARC is a separate, less-known third record.

**How to avoid (P6, or P4 if a domain exists):**
- Verify the sending domain in Resend: add the DKIM (CNAME/TXT) and SPF (`include:` / MX) records it provides. Send `from` a verified subdomain (e.g. `contato@send.dmarques...`) to isolate reputation.
- Add a **DMARC** TXT record: start `p=none; rua=mailto:...` to monitor, move to `p=quarantine`/`reject` once aligned.
- Optionally set a custom Return-Path / MAIL FROM for full alignment.
- Verify with mail-tester.com / Google Admin Toolbox before launch; target 10/10.
- Set Resend's own webhook/bounce handling or at least check the dashboard for delivery failures.

**Warning signs:**
`from` is `@resend.dev` or an unverified domain. `dig TXT _dmarc.<domain>` returns nothing. Test submissions land in spam. mail-tester score < 8.

**Phase to address:** P6 (or P4 when the domain is ready); launch gate.

---

### Pitfall 18: Accessibility regressions that also sink Lighthouse Best-Practices / SEO

**What goes wrong:**
The dark, low-contrast aesthetic and motion-heavy design create failures that Lighthouse Accessibility **and** SEO **and** Best Practices all catch (the project wants ≥95 on all four):
- `color: rgba(255,255,255,.42)` / `.5` / `.62` body and label text on `#0A0A12` — several of these are **below WCAG AA 4.5:1** (the design leans on it heavily for "secondary" text and the giant `rgba(255,255,255,.045)` "DMARQUES" watermark).
- Reveal animations with no `prefers-reduced-motion` path (also Pitfall 2) — motion + vestibular.
- The "chat bubble" FAQ has no real semantics (it's `<div><p>` question/answer, not `<dl>` or a disclosure `<button>`), and no expand/collapse for keyboard users if it becomes interactive.
- `<select>` and text `<input>`s in the form have `<span>` labels wrapped in `<label>` but no `for`/`id` and no `name` — screen-reader association is fragile and the form won't even submit field names.
- Focus styles: the design only defines `style-focus` (design-tool runtime) — real `:focus-visible` styling is absent, so keyboard focus is invisible on the dark bg.
- Icon-only SVGs (arrows, WhatsApp) have no `aria-hidden`/`<title>`.
- `<html>` has no `lang="pt-BR"`; headings may skip levels (multiple `<h2>` is fine, but check the hero `<h1>` is the only one).
- Smooth-scroll without respecting reduced-motion.
- Missing `alt` on the hero/founder/portfolio images.
- SEO: missing meta description, non-descriptive link text ("Começar um projeto" repeated 4x is OK, but footer/nav must be crawlable), `robots.txt`/`sitemap.xml` absent, canonical missing, JSON-LD `LocalBusiness` malformed.

**Why it happens:**
The design is validated visually on desktop by a sighted developer. Contrast of translucent white is not obvious without a checker. The design tool's `style-hover`/`style-focus` attributes lull you into thinking focus is handled.

**How to avoid:**
- **P2:** semantic HTML — real `<label for>`+`<input id name>`, `<nav aria-label>`, one `<h1>`, `<html lang="pt-BR">`, `alt` on every image, `aria-hidden="true"` on decorative SVG, FAQ as `<dl>` or native `<details>`/disclosure buttons, visible `:focus-visible` outline (e.g. `2px solid #9A85FF` + offset) on all interactive elements.
- **P2:** run every text/background pair through a contrast checker; bump the translucent whites to meet AA (`.42`→ at least ~`.62–.7` depending on size; large text can use 3:1). Get sign-off that the visual change is acceptable.
- **P3:** `@media (prefers-reduced-motion: reduce)` disables reveals, float, pulse, canvas, smooth-scroll.
- **P1:** SEO plumbing — `@astrojs/sitemap`, `robots.txt`, per-page `<title>`/description, OG/Twitter tags, canonical, JSON-LD `LocalBusiness` (validate with Google Rich Results Test).
- **P7:** `axe-core` / `@axe-core/cli` or Pa11y in CI against the preview; Lighthouse a11y + SEO + best-practices ≥ 95 as a gate.

**Warning signs:**
Contrast checker flags secondary text. Keyboard Tab shows no visible focus ring. `<input>` with no `name`. Lighthouse a11y < 95, or "contrast" / "form elements have labels" / "document has lang" audits red. No sitemap. Rich Results Test errors.

**Phase to address:** P1 (SEO), P2 (semantics + contrast), P3 (reduced-motion), P7 (automated gate).

---

### Pitfall 19: Open redirect / weak success + error UX on the form

**What goes wrong:**
The endpoint reads a `redirect` / `next` / `return_to` param (or a hidden field) and `Response.redirect()`s to it after send → open redirect (phishing: `yoursite/api/contato?next=evil`). Or the "thank you" state is a separate URL that's directly linkable and crawlable. Or on Resend failure the endpoint 500s with a raw error and the user loses their typed message with no retry. The design's prototype just does `e.preventDefault(); setState({sent:true})` — the real version needs a server round-trip with proper states.

**Why it happens:**
"Redirect back to where they came from" seems user-friendly. Error states are an afterthought.

**How to avoid (P4):**
- Never redirect to a client-supplied URL. Success = same-page inline confirmation (progressive-enhancement friendly: the endpoint can return the page with a `?enviado=1` **only** if you validate it's your own route, or better, handle via `fetch` and swap in a success panel).
- Preserve field values on error; show a friendly retry message; keep the user's message client-side until a 2xx.
- Endpoint returns structured JSON `{ ok: true }` / `{ ok: false, error: "generic" }` — never the Resend error object.
- Add `autocomplete` attributes (`name`, `tel`) and client-side required/format hints, but treat client validation as UX only.
- Disable the submit button while in-flight to prevent double-send (also helps Pitfall 3).

**Warning signs:**
`redirect`/`next` param read in the endpoint. `Response.redirect(userValue)`. 500 with stack trace on Resend failure. Typed data lost on error. Submit fires twice on double-click.

**Phase to address:** P4.

---

### Pitfall 20: "Security review each phase" degrades into a rubber stamp

**What goes wrong:**
PROJECT.md mandates a security review at the end of every phase (`/gsd:secure-phase`). Without a concrete checklist it becomes "looks fine, ✓" — which fails the client's first-class security requirement and misses regressions (a dependency added in P3, an inline style reintroduced in P6, a header dropped by a `vercel.json` edit).

**Why it happens:**
Reviews without artifacts drift to vibes. Same reviewer, same blind spots. Time pressure at phase end.

**What a real per-phase check looks like (make this a repo checklist file):**
- [ ] `npm audit --production` clean (no high/critical); lockfile committed; any new dependency justified in the phase notes (name, why, weekly downloads, last publish, transitive count).
- [ ] `git diff` for the phase reviewed for: new `style="`, new `client:load`, new external `<script>`/`<link>` origin, new `import.meta.env`/`PUBLIC_` usage, new `dangerouslySetInnerHTML`/`set:html`.
- [ ] `grep -r` in `dist/` for `RESEND`, the key value, `.env`, TODO/FIXME secrets, and any internal URL.
- [ ] `curl -I` the preview: all security headers present (HSTS, CSP, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors); CSP has no `unsafe-inline` in `script-src`.
- [ ] securityheaders.com grade ≥ A on the preview URL.
- [ ] Vercel: still exactly one Function; output still static; Deployment Protection state as intended; env vars scoped; spend cap set.
- [ ] No production source maps served (`curl` a `.js.map`).
- [ ] Custom 404/500 return no diagnostics; API route returns generic errors.
- [ ] Lighthouse CI (mobile, throttled) all four ≥ 95 — a perf regression is a security-adjacent availability regression here.
- [ ] For P4+ phases: form still honeypot-protected, rate-limit store reachable, recipient/subject/from still hard-coded, input still schema-validated + HTML-escaped, body-size cap present.
- [ ] For P6+: privacy notice still on the form, policy page still linked, analytics still sets zero cookies (re-test).
- [ ] Findings written to `.planning/` with severity + owner + fix-by; no phase closes with an open High.
- [ ] Rotate reviewer perspective: run one external scanner (e.g. Mozilla Observatory, `npm audit`, `osv-scanner`) you didn't run last phase.

**Warning signs:**
Phase transition notes say "security: ok" with no checklist output. No `.planning/` security findings file. Same three bullet points every phase. Scanners never actually run.

**Phase to address:** Cross-cutting — define the checklist in P1, run it every `/gsd:secure-phase`, expand it as P4/P6 add surface.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keep design-tool inline `style="..."` + `style-hover` attrs, add `unsafe-inline` | Page renders immediately, pixel-matches design fast | Guts the CSP (the core deliverable), `style-hover` doesn't work in real browsers, every future edit fights inline specificity | Never — this is the project's headline requirement |
| Port the design's monolithic `<script>` class as one `client:load` island | Fastest way to "make it move" | Ships a framework runtime, TBT/Lighthouse hit, hydration flash, breaks the "static/fast" value prop | Never for `client:load`; a single small `client:idle` vanilla island is fine |
| In-memory `Map` rate limiter on the endpoint | No external service to set up | Silently ineffective on serverless; discovered only when abused | Only as a *secondary* layer behind a durable store + honeypot |
| Google Fonts via `<link>` with 6 Outfit weights | One line, matches design | Render-blocking third-party, CLS on big headings, LGPD data-transfer question, extra DNS/TLS | For a throwaway staging preview only; self-host before launch |
| Images in `public/` as PNG | `<img src>` just works | No AVIF/WebP/srcset, LCP + CLS failure on mobile, bigger bandwidth bill / DDoS blast radius | Never for hero/portrait/portfolio; OK for a tiny favicon/OG image that's already optimized |
| Ship `output: 'server'` "to be safe" | Form route definitely works | Whole site is on-demand SSR: cost, cold starts, worse TTFB, bigger attack surface | Never here — static + one `prerender=false` route |
| Privacy policy = generic template, fill in later | Unblocks launch checklist | No legal basis / retention / processor disclosure = non-compliant; Resend transfer undisclosed | Never ship it; if time-boxed, delay launch of the form, not the policy |
| Skip DMARC (do SPF+DKIM only) | Fewer DNS records | Domain spoofable; brand-trust risk for a trust-selling agency | `p=none` monitoring record is 5 min — just do it |
| No Lighthouse CI; run DevTools manually | No pipeline work | Desktop passes, throttled mobile (the acceptance bar) regresses unnoticed each phase | Never — scaffold LHCI in P1 |
| Add Astro View Transitions for polish | Nice page-to-page fade | Reveal/glow/canvas listeners die on second navigation; subtle, ships broken | Only with full `astro:page-load` lifecycle wiring + teardown |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Resend** | Send from `onboarding@resend.dev` or unverified domain; read `to`/`subject`/`from` from form data; interpolate raw name into `html`; 500 with raw Resend error | Verify domain (DKIM+SPF) + add DMARC; hard-code `from`/`to`/`subject`; schema-validate + HTML-escape all fields, send `text` too; catch errors, return generic JSON, log server-side with request id |
| **Resend quotas** | Assume 3,000/mo is unreachable; no alerting | Durable per-IP + global hourly cap; monitor Resend dashboard; treat quota exhaustion as an availability incident |
| **`@astrojs/vercel`** | `output: 'server'`; forget `prerender=false` on the API route; enable ISR; upload source maps | Default static output; only the API route opts out; no ISR in v1; `build.sourcemap: false` |
| **Vercel platform** | "Static sites can't be DDoSed" → no spend cap, no firewall rule; preview URLs public; env vars unscoped; no account 2FA | Spend Management cap + usage alerts; WAF rate-limit rule on `/api/*`; Deployment Protection on previews; scope + mark sensitive env vars; enforce 2FA + protected production branch |
| **Google Fonts** | Render-blocking `<link>`, all weights, third-party origin, CLS, LGPD transfer | Self-host (Astro Fonts API / `@fontsource*`), subset Latin + used weights, `preload`, metrics-adjusted fallback for near-zero CLS |
| **Analytics (Vercel/Plausible/Umami)** | Assume "cookieless"; never test; still fingerprints or sets `localStorage` id | DevTools → Application check: zero cookies, no persistent id; if not, switch tool; disclose in policy anyway (IP processing) |
| **Astro Content Collections** | Old `src/content/config.ts` + `getEntryBySlug`; no Zod schema; pull in MDX; enable raw HTML | Astro 5 `src/content.config.ts` + `getCollection`/`render`; `.strict()` Zod schemas with enums; Markdown only; no raw HTML |
| **Astro experimental CSP** | Assume it covers framework `<Image>` inline styles; only emit `<meta>`; test only in `astro dev` | Know the `<Image>` inline-style gap (#14301); ship CSP as a **header** for `frame-ancestors`; test in a Vercel preview build (#14495) |
| **IntersectionObserver reveals** | Initial hidden state set only by island JS → FOUC / CLS / broken with JS disabled | Hidden state in document CSS on `[data-reveal]`; JS only flips to visible; reduced-motion + `<noscript>` shows all |
| **WhatsApp `wa.me` links** | `target="_blank"` without `rel="noopener"`; treat as a form (no consent trail) | `rel="noopener noreferrer"`; note in privacy policy that WhatsApp contact routes data to Meta |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Always-on canvas particle rAF loop (O(n²) links) | Scripting activity while hero off-screen; phone gets warm; TBT high; battery complaints | IntersectionObserver + `visibilitychange` pause; `prefers-reduced-motion` skip; cap DPR ~1.5; fewer points / no link-scan on mobile | Immediately on mid-range Android; any session > a few minutes |
| 640px blurred `mix-blend-mode: screen` glow div following the cursor | Paint/composite spikes on `pointermove`; jank while scrolling on mobile | `will-change: transform` (already in design) + `translate3d` + rAF throttle (already in design); disable on coarse pointer / reduced-motion; consider smaller radius | Low-GPU phones; when combined with scroll |
| 6+ `backdrop-filter: blur()` glass panels | Scroll jank, high paint area, GPU memory; worse when reveal transitions run simultaneously | Limit count; use a semi-opaque background as fallback; avoid animating them; test scroll FPS on mobile | Older Android / Safari; when several are on-screen during a reveal |
| Many simultaneous reveal transitions with long `.7s` durations + stagger | Long paint frames when a whole section enters at once; perceived sluggishness | `IntersectionObserver` per-element with `unobserve` (design already does this); keep transitions to `opacity`/`transform`; shorten to ~.4–.5s; cap concurrent by staggering via CSS `transition-delay` only | Sections with 4+ cards entering together on a slow device |
| Scroll-driven effects via `scroll` event handlers | Main-thread scroll handler → dropped frames | Use IntersectionObserver (design does) or CSS scroll-driven animations; never a non-passive `scroll` listener | Any device once handler does layout reads |
| Hero image as LCP with no priority/responsive sizing | LCP > 3s on 4G mobile; Lighthouse "Largest Contentful Paint element" slow | `astro:assets`, AVIF/WebP, responsive `widths`, `fetchpriority="high"`, explicit dimensions, < ~120KB @1x | Every throttled-mobile run |
| Font swap reflow on `clamp(36px..68px)` headings | CLS spike on reload; heading visibly jumps | Self-host + metrics-adjusted fallback + `preload`; or `font-display: optional` | Every cold load until fixed |
| Lighthouse only run on desktop | 98 on laptop, 70s on throttled mobile in the field | LHCI in CI, mobile preset + 4x CPU + Slow 4G, against preview URL, per PR | As soon as real users on mid-range Android hit it |
| `client:load` islands / monolithic hydration | TBT/INP regression; hydration flash; JS weight creep | Static `.astro` sections; `client:visible`/`client:idle` only for form/glow/canvas; JS-weight CI budget (<20KB) | Grows silently each phase without a budget check |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| CSP with `unsafe-inline` (script or style) | XSS / injected-content defacement not blocked — defeats the stated mandate | Kill author inline styles (P2); Astro hash-based CSP; header-delivered; no `unsafe-inline` in `script-src`; narrow `unsafe-hashes` only for unavoidable framework `<img>` styles |
| `RESEND_API_KEY` in client bundle | Account takeover for sending; spam from your domain; quota burn | Server-only endpoint; `astro:env` secret schema; no `PUBLIC_` prefix; CI grep of `dist/`; least-privilege key; rotation runbook |
| Form endpoint: no durable rate-limit / honeypot | Email-bomb, Resend quota exhaustion (real leads fail), function-cost abuse, open spam relay | Upstash Redis per-IP + global hourly cap; honeypot + submit-timing; hard-coded recipient/subject/from; body-size cap; Origin allow-list; Vercel WAF rule on `/api/*` |
| Unescaped user input in email HTML / headers | Phishing content from a trusted sender; header injection (`Bcc:`) | Zod schema (enum for project-type); HTML-escape all interpolation; strip CR/LF from subject/address fields; send `text` body |
| Open redirect on form success | Phishing via your domain | Never redirect to client-supplied URL; same-page inline confirmation |
| External `<script>`/`<link>` without SRI | Supply-chain defacement if CDN/package compromised | Eliminate third-party origins (self-host fonts, first-party analytics); SRI `integrity`+`crossorigin` on any remainder; pin versions; CSP by hash/exact origin |
| Missing security headers (no HSTS/CSP/nosniff/Permissions-Policy/frame-ancestors) | Clickjacking, MIME sniffing, downgrade, referrer leak; fails pentest/scan | `vercel.json` headers on all routes; verify with `curl -I` + securityheaders.com (≥A) as a gate |
| Production source maps served | Full source disclosure eases targeted attacks | `build.sourcemap: false`; `curl` a `.js.map` in the per-phase check |
| Verbose error responses | Stack traces / paths / dep versions leak | Custom 404/500 with no diagnostics; API returns generic JSON + request id; log server-side only |
| Unlocked Vercel project / no 2FA / unscoped env vars / open previews | Unauthorized deploy = defacement; secret exposure; staging content leaks | Account 2FA; protected production branch + required PRs; restrict promote-to-prod; scope+mark sensitive env vars; Deployment Protection on previews |
| No SPF/DKIM/DMARC | Domain spoofable; lead mail to spam | Verify domain in Resend (DKIM+SPF); add DMARC (`p=none`→`quarantine`); validate with mail-tester |
| Dependency supply-chain (transitive bloat) | Malicious/compromised package runs at build or in bundle | Minimal deps (this design needs almost none); committed lockfile; `npm audit` + `osv-scanner` in CI; Dependabot; justify every new dep in phase notes |
| No edge DDoS/WAF in v1 (deferred to M2) | Volumetric flood or `/api` hammering → Vercel limits hit → site down / soft-blocked | Keep site 100% static (CDN absorbs GET floods); durable + global rate-limit on `/api`; Vercel spend cap + firewall rule; low-TTL DNS for fast Cloudflare cutover; documented runbook; **write the residual-risk acceptance into the roadmap** |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Low-contrast translucent white text (`rgba(255,255,255,.42–.62)`) | Hard to read for many users; fails AA; hurts conversion | Raise opacity/color to meet AA 4.5:1 (3:1 for large); get design sign-off on the change |
| Motion plays regardless of `prefers-reduced-motion` | Nausea/vestibular issues; distraction; some users can't focus on CTA | `@media (prefers-reduced-motion: reduce)` disables reveal/float/pulse/canvas/smooth-scroll; static fallback frame |
| Reveal-on-scroll hides content when JS fails / is slow | Blank sections; content invisible to some crawlers/users | Hidden state in CSS + `<noscript>` override + timeout fallback (design has 2.6s); ensure content is in the DOM regardless |
| Form gives no error state (prototype just sets `sent:true`) | On Resend failure user thinks it sent; lead lost; or user loses typed message | Real states: idle/submitting/success/error; preserve input on error; friendly retry; disable button in-flight |
| FAQ as non-semantic `<div>` bubbles | Screen-reader users get no structure; no keyboard expand if it becomes interactive | `<dl>` or native `<details>`/disclosure `<button>` with `aria-expanded` |
| Invisible keyboard focus on dark background | Keyboard users lose their place | Explicit `:focus-visible` outline (e.g. `2px solid #9A85FF`, offset) on all interactive elements |
| Canvas/glow run on battery-constrained phones | Battery drain, heat, throttled scrolling — bad first impression | Pause offscreen/hidden; reduce work on low-core devices; honor reduced-motion / data-saver |
| Giant `wa.me` reliance without fallback | Users without WhatsApp / on desktop without the app can't reach out | Keep the form + `mailto:` visible and equally prominent; don't make WhatsApp the only path |

## "Looks Done But Isn't" Checklist

- [ ] **CSP:** present as a **response header** (not just `<meta>`), `script-src` has no `unsafe-inline`, `frame-ancestors 'none'`, tested on a Vercel **preview** build, framework `<Image>` inline-style case handled — verify with `curl -I` + browser console (zero violations).
- [ ] **"Static" build:** Vercel shows exactly **one** Function (the form route); `/` returns immutable static cache headers, not a per-request function — verify in Vercel dashboard + `curl -I /`.
- [ ] **Form security:** honeypot field present; durable (Redis) rate-limit reachable in prod; global hourly send cap; recipient/subject/from hard-coded; every field Zod-validated (project-type is an enum) and HTML-escaped; body-size cap — verify by submitting a `<img onerror>` name and a 10k-char message and a flood script.
- [ ] **Secrets:** `grep -r RESEND dist/` and a scan for the key value return nothing; no `PUBLIC_` on secrets; `.env*` gitignored; build logs don't print the key.
- [ ] **Images:** every raster goes through `astro:assets`; AVIF/WebP emitted; hero has `fetchpriority=high` + responsive `widths` + dimensions; nothing large in `public/` — verify `dist/` has `.avif`/`.webp` and check transferred bytes.
- [ ] **Fonts:** self-hosted (or explicitly accepted Google risk), subset, `preload`ed, metrics-adjusted fallback; reload shows no heading reflow — verify CLS < 0.05 in LHCI.
- [ ] **Motion:** `prefers-reduced-motion` disables reveal/float/pulse/canvas/smooth-scroll; canvas pauses when hero is scrolled away and when tab is hidden — verify in DevTools Performance + Rendering "Emulate CSS prefers-reduced-motion".
- [ ] **Headers:** HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`/`frame-ancestors` on all routes incl. the API; securityheaders.com ≥ A.
- [ ] **Source maps:** `curl` of a `dist/*.js.map` under the site 404s.
- [ ] **Errors:** custom 404 and 500; API route returns generic JSON on Resend failure (no stack) — verify by forcing a bad Resend key in preview.
- [ ] **Mail auth:** `dig TXT` shows SPF, DKIM, `_dmarc`; mail-tester ≥ 8; a test lead lands in inbox not spam.
- [ ] **LGPD:** inline privacy notice + link next to submit; policy page has controller, data list, **legal basis**, **retention period**, **Resend/Vercel/analytics named as recipients**, international-transfer disclosure, rights + contact; analytics sets **zero cookies** (re-tested).
- [ ] **SEO:** `sitemap.xml`, `robots.txt`, per-page title + meta description, canonical, OG/Twitter tags, JSON-LD `LocalBusiness` passes Google Rich Results Test; `<html lang="pt-BR">`.
- [ ] **A11y:** axe/Pa11y clean in CI; every `<input>` has `id`+`name`+associated `<label>`; decorative SVG `aria-hidden`; visible focus ring; contrast AA on all text incl. translucent whites.
- [ ] **Lighthouse:** mobile preset, 4x CPU, Slow 4G, in CI against preview — Performance/SEO/Best-Practices/Accessibility all ≥ 95.
- [ ] **Vercel lockdown:** account 2FA, protected production branch, scoped+sensitive env vars, Deployment Protection on previews, spend cap + usage alert set.
- [ ] **Per-phase security review:** checklist artifact exists in `.planning/` with findings + severity, not just "ok".

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CSP shipped with `unsafe-inline` (styles) | MEDIUM | Enable Astro CSP flag; sweep `src/` for `style="` and move to scoped styles/tokens (mechanical, a few hours for this page); switch `<Image>`→`getImage()`+`<img>`; add narrow `unsafe-hashes` only if a framework style remains; re-test in preview |
| `RESEND_API_KEY` leaked to client | LOW (act fast) | Rotate the key in Resend immediately; purge from bundle (move call to endpoint, drop `PUBLIC_`); scrub git history if committed (`git filter-repo`) + force-push; add CI grep gate |
| Form abused (spam/email-bomb) before Redis limit added | MEDIUM | Temporarily disable the endpoint (feature flag / return 503) or add Vercel WAF rule on `/api/*`; add honeypot + Upstash limit + global cap; re-enable; check Resend for reputation damage; consider pulling Milestone 2 (Cloudflare Turnstile) forward |
| HTML/header injection discovered in emails | LOW | Add Zod schema + HTML-escape + CR/LF strip in the endpoint; redeploy; the blast radius is one inbox — inform the founder to be wary of past lead emails |
| Site rendered as full SSR (`output: 'server'`) | LOW | Switch config to static output; add `prerender=false` only to the API route; redeploy; verify one Function + static cache headers |
| Google Fonts causing CLS/blocking at launch | LOW | Swap to `@fontsource*`/Astro Fonts API, subset, `preload`, metrics fallback; remove `fonts.gstatic` from `<head>` and CSP; re-run LHCI |
| Canvas draining battery in the field | LOW | Add reduced-motion guard + IntersectionObserver/`visibilitychange` pause + DPR cap; ship patch; the fix is ~20 lines |
| Analytics found setting cookies (LGPD) | MEDIUM | Reconfigure to cookieless mode or replace the tool (Vercel Web Analytics / Plausible default); if it ran with cookies, add a note to the policy and consider it a minor incident; no banner needed once truly cookieless |
| Missing legal basis / retention in policy | LOW | Legal/content task: choose basis per purpose, add retention period, name processors (Resend/Vercel/analytics) + transfer clause; republish with a version date |
| Site taken down by a flood (no edge protection) | MEDIUM–HIGH | Enable Vercel Attack Challenge Mode / firewall rules; accelerate Cloudflare onboarding (proxy DNS, enable "Under Attack" mode, add rate-limit + Turnstile); if static, most GET floods are CDN-absorbed so focus mitigation on `/api` |
| No SPF/DKIM/DMARC, mail going to spam | LOW | Add the DNS records Resend provides + a `_dmarc` TXT; wait for propagation; re-test with mail-tester; ask the founder to mark past messages "not spam" |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1 — CSP `unsafe-inline` defeats mandate | P2 (kill inline styles), P5 (author + ship header) | `grep 'style="' src/` empty; `curl -I` shows CSP header, no `unsafe-inline` in `script-src`; zero console violations on preview |
| 2 — Canvas never pauses / ignores reduced-motion | P3 | DevTools Performance: no scripting while hero off-screen; Rendering panel reduced-motion emulation stops animation; LHCI TBT < 200ms mobile |
| 3 — Form = email-bomb/spam relay | P4 (build), P5 (review), M2 (edge) | Flood script hits 429 after N; honeypot present in markup; rate-limit store reachable in prod; global cap enforced |
| 4 — Unescaped input in email HTML/headers | P4 | Submit `<img onerror>` name → email shows escaped text; `\r\n` in a field → no header injection; project-type outside enum rejected |
| 5 — `RESEND_API_KEY` in client bundle | P1 (env schema/gitignore/CI grep), P4 (endpoint) | `grep -r RESEND dist/` empty; `astro:env` secret schema present; build fails if key used client-side |
| 6 — `client:load` everywhere | P2 (static sections), P3 (island directives) | No `client:load` in repo; landing route JS < 20KB gz in CI; no framework runtime in client graph |
| 7 — Lighthouse desktop-only pass | P1 (scaffold LHCI), P7 (gate) | LHCI job runs mobile preset + 4x CPU + Slow 4G against preview on every PR; all four ≥ 95 |
| 8 — CLS from fonts + reveal + images | P1 (font strategy), P2 (dimensions + reveal CSS), P7 (budget) | Self-hosted fonts; every image has width/height; CLS < 0.05 in LHCI; no heading reflow on reload |
| 9 — Adapter SSR when static intended | P1 | Vercel shows one Function; `/` has immutable static cache headers; `dist/*.html` exists |
| 10 — View Transitions break listeners | P3 (decide "none in v1"; if used, lifecycle wiring) | Navigate landing→privacy→landing: reveal/glow/canvas still work; no doubled listeners |
| 11 — SRI / Vercel lockdown / exposed env | P1 (account/repo/sourcemap), P5 (SRI/CSP/errors) | No non-self origin in `<head>`; `integrity=` on any external asset; Vercel 2FA + protected branch + scoped vars; `.js.map` 404s |
| 12 — Missing security headers | P5 | `curl -I` all headers on HTML + API; securityheaders.com ≥ A |
| 13 — No edge DDoS protection (residual) | P4/P5 (compensating controls), roadmap (risk acceptance), M2 (fix) | Spend cap set; Vercel firewall rule on `/api/*`; site 100% static; residual-risk paragraph in PROJECT.md/roadmap; runbook exists |
| 14 — `astro:assets` not used | P2 | `dist/` has AVIF/WebP; no raster in `public/`; hero < ~120KB @1x; LHCI image audits green |
| 15 — Content Collections misconfig | P1 (setup/API/schema), P2 (author) | `src/content.config.ts` with `.strict()` Zod + enums; no `@astrojs/mdx`; `getCollection`/`render` used; frontmatter typo fails build |
| 16 — LGPD notice/basis/analytics/retention | P6 (P4 leaves form slot; P1/P6 verify analytics) | Inline notice + policy link on form; policy has basis + retention + named processors + transfer clause; analytics = zero cookies (DevTools) |
| 17 — No SPF/DKIM/DMARC | P6 (or P4 if domain ready) | `dig TXT` shows all three; mail-tester ≥ 8; test lead in inbox |
| 18 — A11y regressions failing LH BP/SEO | P1 (SEO), P2 (semantics/contrast), P3 (reduced-motion), P7 (axe gate) | axe/Pa11y clean in CI; LH a11y/SEO/BP ≥ 95; labels/focus/contrast/lang checks pass; Rich Results Test clean |
| 19 — Open redirect / weak form UX | P4 | No client-supplied redirect in endpoint; error state preserves input; API returns generic JSON |
| 20 — Security review = rubber stamp | Cross-cutting (checklist defined P1) | Each `/gsd:secure-phase` produces a `.planning/` findings artifact with severity/owner; one new scanner run per phase; no phase closes with open High |

## Sources

- Astro Docs — Experimental Content Security Policy: https://docs.astro.build/en/reference/experimental-flags/csp/
- Astro 5.9 release notes (CSP support): https://astro.build/blog/astro-590/
- withastro/astro #14301 — Experimental CSP not working with Astro image components: https://github.com/withastro/astro/issues/14301
- withastro/astro #14495 — CSP style hash not inserting in staging environment: https://github.com/withastro/astro/issues/14495
- Astro Docs — `@astrojs/vercel` adapter: https://docs.astro.build/en/guides/integrations-guide/vercel/
- Astro on Vercel (framework guide): https://vercel.com/docs/frameworks/frontend/astro
- Astro SSR: adapters, hybrid rendering, deployment (static default, per-page `prerender`): https://eastondev.com/blog/en/posts/dev/20251202-astro-ssr-guide/
- Astro Docs — View Transitions (script lifecycle, `astro:page-load`, `data-astro-rerun`): https://docs.astro.build/en/guides/view-transitions/
- withastro/astro #9798 — inline scripts in layout with view transitions not re-executing: https://github.com/withastro/astro/issues/9798
- withastro/astro #9359 — ViewTransition prevents third-party JS from executing: https://github.com/withastro/astro/issues/9359
- Vercel KB — Limit Abuse with Rate Limiting (in-memory doesn't persist across cold starts): https://vercel.com/kb/guide/limit-abuse-with-rate-limiting
- Vercel Docs — WAF Rate Limiting: https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- Rate limiting without overhead on Netlify/Vercel functions (Upstash pattern): https://lihbr.com/posts/rate-limiting-without-overhead-netlify-or-vercel-functions
- Vercel KB — Are Vercel Preview Deployments indexed by search engines (`X-Robots-Tag: noindex` default, still URL-reachable): https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines
- Vercel Docs — Deployment Protection: https://vercel.com/docs/deployment-protection
- CSP headers for Astro (header vs meta, directive set): https://www.trevorlasn.com/blog/csp-headers-astro
- LGPD site adequacy guides (contact-form notice, legal basis, privacy-policy elements — secondary Brazilian sources): https://www.cayman.com.br/postagem/1/como-adaptar-o-meu-site-a-lei-geral-de-protecao-de-dados , https://www.divia.com.br/como-colocar-lgpd-no-site-da-sua-empresa-saiba-como-adequar-seu-site-em-conformidade-com-a-lgpd
- Supplied design file — `arquivos de design/Dmarques Landing.dc.html` (inline-style-heavy markup; `particles()` loop with no offscreen pause / no reduced-motion guard; IntersectionObserver reveal with 2.6s timeout fallback; `pointermove` + rAF glow; Google Fonts `<link>` with 6 Outfit weights; `image-slot` placeholders without dimensions; `style-hover`/`style-focus` design-tool attributes)
- Project context — `.planning/PROJECT.md` (Astro SSG on Vercel, Resend endpoint, honeypot + rate-limit required, Lighthouse ≥95 all categories, `prefers-reduced-motion`, cookieless analytics, LGPD privacy policy, per-phase security review, Cloudflare deferred to Milestone 2)

---
*Pitfalls research for: animation-heavy secure static marketing site (Astro/Vercel/Resend/LGPD)*
*Researched: 2026-09-05*
