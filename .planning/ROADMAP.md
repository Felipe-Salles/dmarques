# Roadmap: Dmarques — Site institucional

## Overview

Dmarques is a one-page Astro SSG marketing site for a solo web agency, deployed on
Vercel as immutable static HTML plus a single serverless form endpoint. The build
runs from a hardened foundation (Phase 1) that front-loads every gate — Lighthouse
mobile >=95, a versioned per-phase security checklist, dependency audit, and Vercel
account lockdown — so every later phase ships against a live preview with the
numbers enforced. Typed content collections (Phase 2) feed nine zero-JS sections
whose design inline styles are converted to token-based CSS with accessibility and
contrast fixed (Phase 3). Progressive-enhancement effects are layered on as small
vanilla islands that degrade under reduced-motion (Phase 4). The quote form and its
LGPD Privacy Policy ship together as one release behind honeypot, timing, and
durable rate-limiting (Phase 5). SEO metadata and single-sourced structured data
follow (Phase 6), and the strict Content-Security-Policy is locked last, once every
origin the finished site uses is known (Phase 7). Cloudflare edge protection is
Milestone 2.

## Residual Risk Statement (SEC-08) — accepted for v1

**v1 has no edge L3/L7 volumetric DDoS / WAF protection.** Cloudflare (WAF, edge
rate-limiting, DDoS/flood mitigation, Turnstile) is deferred to Milestone 2. This
gap is knowingly accepted for v1, mitigated by the following compensating controls:

- The site is **100% static** — every page is immutable HTML served from Vercel's
  CDN, so a flood of GET requests is absorbed at the edge at negligible cost.

- The only dynamic surface, `/api/orcamento`, is protected by **durable per-IP
  rate-limiting plus a global hourly cap and a hard daily cap**, a honeypot, a
  submit-timing check, a request body-size limit, and an Origin allow-list.

- A **Vercel WAF rate-limit rule on `/api/*`** enforces limiting at the edge
  (no serverless-statelessness gap).

- The project stays on the **Vercel Hobby plan with no payment method on file**, so
  spend is structurally capped at $0 — the project pauses when the free-tier ceiling
  is reached rather than incurring a bill, and usage notifications fire at 75% and
  100%. This is weaker than the Pro-only Spend Management feature: there is no
  configurable USD cap, no tunable auto-pause action, and no "form off, site up"
  graceful degradation. Milestone 2 revisits this alongside the Cloudflare layer.

- **DNS is kept at low TTL** with no registrar lock-in, so Cloudflare can be put in
  front quickly if v1 is attacked (Milestone 2 pulled forward).

- A **flood runbook** exists: enable Vercel Attack Challenge Mode / firewall rules,
  then accelerate Cloudflare onboarding.

Milestone 2 (Cloudflare layer) closes this statement.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked INSERTED)

- [ ] **Phase 1: Foundation & CI Gate** - Astro + Vercel static scaffold, self-hosted fonts, design tokens, BaseLayout, preview deploys, Lighthouse CI + audit gates, Vercel lockdown, security-review checklist artifact
- [ ] **Phase 2: Content Collections** - All copy and portfolio cases as typed, build-validated Astro Content Collections (no CMS)
- [ ] **Phase 3: Static Zero-JS Sections + CSP-safe Refactor + A11y** - The 9 design sections + privacy/thank-you/404 pages as fully static HTML, every inline style converted to token CSS, accessibility and AA contrast fixed
- [ ] **Phase 4: Progressive-Enhancement Effects** - Scroll reveal, cursor glow, particle canvas, and reduced-motion handling as small vanilla islands
- [ ] **Phase 5: Form Backend + Enhancement + LGPD** - Working quote form (no-JS + enhanced) via Resend behind layered spam/abuse defenses, shipped with the Privacy Policy page and inline data-use notice
- [ ] **Phase 6: SEO / Metadata / Structured Data** - Titles, canonical, OG/Twitter cards, sitemap, robots, favicons, and single-sourced LocalBusiness + FAQPage JSON-LD
- [ ] **Phase 7: Security Headers Finalize** - Full security-header set + strict CSP in vercel.json, Report-Only then enforced, sourcemaps off, securityheaders.com >= A

### Milestone 2 (planned) — Cloudflare layer

Not part of v1. Closes the residual-risk statement above.

- **CF-01**: Cloudflare in front of the site (DNS + proxy)
- **CF-02**: WAF + edge rate-limiting rules against request floods
- **CF-03**: DDoS L3/L7 mitigation
- **CF-04**: Cloudflare Turnstile on the quote form (reinforces honeypot + timing)
- **CF-05**: Privacy Policy updated to name Cloudflare as an operator
- **CF-06**: CSP delta for Turnstile (`challenges.cloudflare.com` in `script-src` + `frame-src`)

## Phase Details

### Phase 1: Foundation & CI Gate

**Goal**: The project scaffold, deploy pipeline, and quality/security gates exist so every later phase ships against a live preview URL with perf and security numbers enforced.
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08, INFRA-09, INFRA-10, PERF-01, PERF-02, PERF-03, PERF-04, SEC-07
**Success Criteria** (what must be TRUE):

  1. `pnpm dev` serves the site locally and `pnpm build` produces static `dist/` output with `output: 'static'` + `@astrojs/vercel` and exactly one serverless-function boundary reserved for the form endpoint; `astro check` passes.
  2. Every push produces a Vercel preview deploy and merges to the protected production branch deploy live; the Vercel account/repo is hardened — 2FA, protected production branch, Deployment Protection on previews, scoped secret env vars, and a hard spend cap with usage alerts.
  3. CI blocks any merge that fails `astro check`, build, `pnpm audit`, GitHub Dependency Review, the landing-route JS-weight budget (<20 KB, no UI framework / no animation library), or the Lighthouse mobile run (preset mobile, 4x CPU, Slow 4G) scoring <95 in Performance, SEO, Best Practices, or Accessibility, with Web Vitals budgets asserted (LCP <2.5 s, CLS <0.05, TBT <200 ms, INP <200 ms).
  4. Outfit and DM Sans are self-hosted (zero Google Fonts requests in production) with metrics-adjusted fallbacks and `preload` on the two critical files; `RESEND_API_KEY` and other server secrets are declared in the `astro:env` secret schema and a CI grep of `dist/` for secret names and `re_` returns nothing.
  5. Design tokens live in one CSS custom-properties file consumed by all components, `build.inlineStylesheets` is `never`, `BaseLayout.astro` and an empty `vercel.json` exist, and the SEC-07 security-review checklist artifact exists in `.planning/` with its first run passing and no open High finding.

**Plans**: 8 plans

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Astro + Vercel scaffold and every root config file (pinned stack, astro.config.mjs, vercel.json)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Design tokens, base styles, BaseLayout and the pt-BR placeholder page; resolve STATIC_DIR

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — js-weight-check.sh, security-check.sh and the SEC-07 checklist gabarito
- [x] 01-04-PLAN.md — lighthouserc.json and the ci.yml / lighthouse.yml workflows

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-05-PLAN.md — Public GitHub repo, workflow token scope, master to main rename, first push (human-gated)

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 01-06-PLAN.md — Vercel link, Deployment Protection, bypass secret, spend-cap decision (human-gated)

**Wave 6** *(blocked on Wave 5 completion)*

- [ ] 01-07-PLAN.md — Prove the gates block and pass, capture check contexts, lock branch protection

**Wave 7** *(blocked on Wave 6 completion)*

- [ ] 01-08-PLAN.md — SEC-07 phase-01 run file and sign-off

### Phase 2: Content Collections

**Goal**: All site copy and portfolio cases live as typed, build-validated content collections with no CMS and no admin surface.
**Depends on**: Phase 1
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05
**Success Criteria** (what must be TRUE):

  1. `services`, `process`, `differentiators`, and `faq` content is authored as YAML validated by strict Zod schemas at build; a bad key or missing field fails `pnpm build`.
  2. Portfolio `cases` are Markdown with `image()` covers in a problem -> solution -> result structure, and 1-2 honestly-labeled entries ("projeto proprio" / "demo") are published.
  3. The `faq` collection is the single source that feeds both the visible FAQ section and the `FAQPage` JSON-LD, and the "tipo de projeto" enum is defined once and reused as the quote-form allow-list.
  4. The SEC-07 checklist run for this phase passes with no open High finding (no new inline surface, `pnpm audit` clean, every added dependency justified in the phase notes).

**Plans**: TBD

### Phase 3: Static Zero-JS Sections + CSP-safe Refactor + A11y

**Goal**: A shippable, fully static, zero-client-JS one-pager — all 9 sections plus the privacy, thank-you, and 404 pages — with every design inline style converted to token-based CSS and accessibility/contrast fixed.
**Depends on**: Phase 2
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, SITE-07, SITE-08, SITE-09, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, A11Y-07, ANIM-02, ANIM-07, ANIM-08, SEO-02, PERF-05
**Success Criteria** (what must be TRUE):

  1. A visitor sees the 9 design sections in order with the Hero "03 Bleed" faithfully reproduced (nav, headline, "Comecar um projeto" + WhatsApp CTAs, 3D render bleeding off the edge, glass testimonial card; canvas added later), every section renders with zero client JavaScript, and `grep -r 'style="' src/` returns nothing — `:hover` / `:focus-visible` are real CSS with transitions limited to transform/opacity/box-shadow/border-color and <=300 ms.
  2. `/politica-de-privacidade`, `/obrigado`, and a branded `/404` exist; anchor nav (`#servicos`, `#processo`, `#sobre`, `#contato`) lands below the header via `scroll-margin-top` (smooth-scroll becomes `auto` under reduced-motion); mobile nav is keyboard-operable with no JS framework and no focus trap.
  3. Keyboard and screen-reader users get a working visible skip link, semantic landmarks, one `<h1>`, `<html lang="pt-BR">`, real `<label for>`/`id`/`name` on form fields, focus rings with >=3:1 contrast on dark and light sections, real alt text on the founder portrait with decorative render/canvas/glow marked `aria-hidden`, and all text meets WCAG AA contrast (translucent-white tokens raised, with design sign-off).
  4. All raster images go through `astro:assets` with explicit dimensions and AVIF/WebP, the hero LCP image uses `fetchpriority="high"`, no image is optimized at runtime (build-time Sharp only), and with JavaScript disabled the whole page is visible (reveal hidden state gated on a `.js-ready` class + `prefers-reduced-motion: no-preference`).
  5. Lighthouse mobile stays >=95 in all four categories on the preview and the SEC-07 checklist run passes with no open High finding.

**Plans**: TBD
**UI hint**: yes

### Phase 4: Progressive-Enhancement Effects

**Goal**: The design's motion behaviors are layered on as small hand-rolled vanilla islands that degrade cleanly and never regress performance or accessibility.
**Depends on**: Phase 3
**Requirements**: ANIM-01, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-09
**Success Criteria** (what must be TRUE):

  1. Scroll reveal (opacity + translateY with stagger) runs from a single IntersectionObserver (`rootMargin: 0px 0px -8% 0px`) that unobserves each element after firing, with a ~2.6 s timeout fallback that reveals everything.
  2. The cursor glow follows the pointer via `pointermove` + `requestAnimationFrame`, is `aria-hidden` with `pointer-events: none`, and activates only on `pointer: fine` with `prefers-reduced-motion: no-preference`.
  3. The particle canvas loads as a `client:visible` island, is `aria-hidden="true"`, pauses via IntersectionObserver when off-screen and on `document.hidden`, caps DPR at ~1.5, scales point count to viewport / core count / data-saver, and renders a single static frame (or nothing) under `prefers-reduced-motion`.
  4. Under `prefers-reduced-motion` all reveal, glow, canvas, and `dmFloat` / `dmPulse` motion stops while the page still looks finished; no animation touches layout-triggering properties and there is no parallax, scroll-jacking, or preloader/splash.
  5. Lighthouse mobile stays >=95 in all four categories with TBT <200 ms and CLS <0.05, DevTools shows no scripting activity while the hero is scrolled away, and the SEC-07 checklist run passes with no open High finding.

**Plans**: TBD
**UI hint**: yes

### Phase 5: Form Backend + Enhancement + LGPD

**Goal**: The quote form works end-to-end to the founder's inbox with or without JavaScript, behind layered spam/abuse defenses, and ships in the same release as the Privacy Policy page and inline data-use notice.
**Depends on**: Phase 3 (form markup), Phase 1 (env schema)
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, FORM-08, FORM-09, FORM-10, FORM-11, FORM-12, FORM-13, LGPD-01, LGPD-02, LGPD-03, LGPD-04, LGPD-05, LGPD-06, LGPD-07, SEC-08, SEC-09
**Success Criteria** (what must be TRUE):

  1. With JavaScript disabled, submitting the form (Nome, WhatsApp, E-mail, Tipo de projeto, Mensagem; at least one of WhatsApp/e-mail required) natively POSTs to `/api/orcamento` and redirects (303) to `/obrigado`; with JavaScript, the enhancer does a `fetch` with inline idle/sending/success/error states, mirrors the schema in on-blur client validation, preserves typed input on error, disables submit in-flight, surfaces accessible errors (text not just color, `aria-invalid`, `aria-describedby`, `aria-live`, focus to first error), and offers a pre-filled WhatsApp deep-link as the fallback path.
  2. The endpoint validates every field server-side with Zod (project-type must match the content enum), rejects a populated honeypot and out-of-window submit timing, enforces durable per-IP + global hourly + hard daily rate limits (429 with a friendly message), HTML-escapes and CR/LF-strips all interpolated email fields with hard-coded `from`/`to`/`subject` and a `text` body, returns generic errors with no stack trace and no client-supplied redirect, and caps request body size; a Vercel WAF rate-limit rule covers `/api/*`.
  3. `/politica-de-privacidade` (pt-BR) goes live in this same release covering controller, encarregado/contato, data collected, purposes, legal bases (Art. 7 V + IX), operators (Vercel, Resend, analytics), international transfer (USA), retention, Art. 18 rights and how to exercise them, absence of tracking cookies, no automated decisions, ANPD complaint, and last-updated date; a notice-only data-use sentence with a policy link sits next to the submit button.
  4. IP, user-agent, and timestamp are used only during the request (rate-limit + timing) and never persisted or logged; no analytics/marketing script fires on form interaction; analytics is verified in DevTools to set zero cookies / no persistent ID; the chosen legal basis and retention period are recorded as a Key Decision in the repo and reflected in the policy.
  5. SPF, DKIM, and DMARC (`p=none` -> quarantine) are configured for the sending domain in Resend with mail-tester >=8 before go-live; the SEC-08 residual-risk statement is recorded in this roadmap; Lighthouse mobile stays >=95 in all four categories and the SEC-07 checklist run passes with no open High finding.

**Plans**: TBD
**UI hint**: yes

### Phase 6: SEO / Metadata / Structured Data

**Goal**: The site is fully shareable and locally discoverable — complete metadata, social cards, and single-sourced structured data.
**Depends on**: Phase 5 (real content and NAP finalized)
**Requirements**: SEO-01, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08
**Success Criteria** (what must be TRUE):

  1. Every page has a `<title>`, a ~150-char meta description citing Ibitinga / sites / sistemas / automacao, and an absolute `<link rel="canonical">`; a favicon set, `apple-touch-icon`, and `theme-color` (#0A0A12) are present.
  2. Open Graph and Twitter Card tags are complete, with a designed static 1200x630 share image (<300 KB) served from `public/`.
  3. `sitemap.xml` (via `@astrojs/sitemap`) and `robots.txt` (allow-all, points to the sitemap) are served.
  4. JSON-LD `["ProfessionalService","LocalBusiness"]` (with `founder` Person, E.164 phone, `areaServed`, `address` with `addressRegion: "SP"` / `addressCountry: "BR"`, `sameAs` Instagram, `image`/`logo`) and `FAQPage` (single-sourced from the `faq` collection) pass the Google Rich Results Test, and NAP is byte-identical between the footer and the JSON-LD.
  5. Lighthouse mobile stays >=95 in all four categories and the SEC-07 checklist run passes with no open High finding.

**Plans**: TBD

### Phase 7: Security Headers Finalize

**Goal**: Lock the Content-Security-Policy and the full security-header set once every script/style/img/connect origin the finished site uses is known.
**Depends on**: Phase 4, Phase 5, Phase 6 (all origins final)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-10
**Success Criteria** (what must be TRUE):

  1. `vercel.json` sets, on every response including the API route, HSTS with `preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` denying camera/microphone/geolocation, `X-Frame-Options: DENY` with CSP `frame-ancestors 'none'`, and COOP/CORP.
  2. The CSP is delivered as a header (not `<meta>`) with `default-src 'self'`, `script-src 'self'` and `style-src 'self'` (no `unsafe-inline` / `unsafe-eval`), `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`, `frame-ancestors 'none'`, and `upgrade-insecure-requests`.
  3. The CSP shipped first as `Content-Security-Policy-Report-Only` on preview, was confirmed to produce zero violations on page load and on form submit, then was promoted to enforcing.
  4. Production source maps are disabled, custom 404/500 pages leak no diagnostics, v1 loads zero third-party assets with a documented SRI rule for any future external asset, no Astro View Transitions are used (decision recorded), and `securityheaders.com` grades >= A verified by a `curl -I` header-regression check in CI.
  5. The final SEC-07 checklist run passes with no open High finding and Lighthouse mobile stays >=95 in all four categories.

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & CI Gate | 6/8 | In Progress|  |
| 2. Content Collections | 0/TBD | Not started | - |
| 3. Static Zero-JS Sections + CSP-safe Refactor + A11y | 0/TBD | Not started | - |
| 4. Progressive-Enhancement Effects | 0/TBD | Not started | - |
| 5. Form Backend + Enhancement + LGPD | 0/TBD | Not started | - |
| 6. SEO / Metadata / Structured Data | 0/TBD | Not started | - |
| 7. Security Headers Finalize | 0/TBD | Not started | - |

## Coverage

- v1 requirements: **83 total** (the requirements doc's earlier "78 total" was a miscount; all 83 enumerated IDs are mapped)
- Mapped to phases: **83 / 83**
- Orphaned / unmapped: **0**
- Cross-cutting homes: SEC-07 (per-phase security checklist) and PERF-01 (Lighthouse mobile >=95 gate) are established in Phase 1 but RUN at every phase — each phase's success criteria require both to pass.

---
*Roadmap created: 2026-09-05*
