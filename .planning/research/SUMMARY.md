# Project Research Summary

**Project:** Dmarques — Site institucional (one-page agency landing site)
**Domain:** Solo web-agency marketing / lead-capture landing page — Astro SSG on Vercel, animation-heavy dark UI, first-class security mandate, Brazil LGPD scope
**Researched:** 2026-09-05
**Confidence:** HIGH for stack, architecture, and animation/perf failure modes; MEDIUM for LGPD legal specifics and CSS scroll-driven animation browser coverage

## Executive Summary

This is a brochure-plus-lead-capture one-pager for a new solo web agency. Experts build this exact shape as a **static-by-default Astro site with a single serverless route**: every one of the 9 design sections prerenders to immutable HTML served from the CDN, and only the `/api` quote-form endpoint opts out of prerendering (`export const prerender = false`) to run as a Vercel Node function. No UI framework is used anywhere — the four interactive behaviors (scroll reveal, cursor glow, particle canvas, form enhancement) are small vanilla `<script>` modules that Astro bundles to external, deferred, CSP-clean files. Content lives in typed Astro Content Collections (YAML for lists, Markdown for cases), validated by Zod at build. This keeps the attack surface at "static files + one function," which is the direct expression of the client's "ninguem pode derrubar ou alterar o site" requirement.

The recommended stack is **Astro 7.3.x + `@astrojs/vercel` 11.x** with `output: 'static'`, `@astrojs/sitemap`, build-time Sharp image optimization (no runtime image service), **self-hosted Outfit + DM Sans** via the Astro Fonts API (drops Google Fonts entirely), **Resend 6.x + Zod 4.x + honeypot + submit-timing + `@upstash/ratelimit` 2.x** for the form, **Vercel Web Analytics** (cookieless, same-origin, no consent banner), and a toolchain of **pnpm 9 / TypeScript 5 strict / Biome 2 (+ Prettier for `.astro`) / Lighthouse CI** on **Node 24**. Security headers split by delivery mechanism: HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`/`frame-ancestors` live in `vercel.json` (so they cover static assets); the CSP is authored there too and rolled out `Report-Only` first, then enforced.

Two hard tensions dominate the build, and both have clear resolutions. **(1) Animation richness vs. Lighthouse >=95 on throttled mobile:** keep every effect hand-rolled, add no animation library (GSAP/AOS/Lenis/Motion all lose their bytes here), and make the canvas particle loop pause via IntersectionObserver + `visibilitychange` and skip entirely under `prefers-reduced-motion` / data-saver / small viewport — the design prototype does neither today. **(2) Strict CSP with no `unsafe-inline` vs. a design that is 100% inline `style=""`:** migrate every inline style into Astro scoped `<style>` + design-token CSS custom properties during the section-build phase (with `build.inlineStylesheets: 'never'` forcing external CSS), so `style-src 'self'` becomes achievable; `script-src` stays strict from day one with zero `unsafe-inline`. The pragmatic fallback, if style extraction slips, is `style-src 'self' 'unsafe-inline'` while `script-src` remains locked — documented as debt, never applied to scripts. Cross-cutting: the mandated per-phase security review must be a **concrete checklist artifact in `.planning/`** (npm audit, grep for new inline surface, `curl -I` header check, `dist/` secret scan, one-Function verification, Lighthouse gate, findings with severity/owner) — not a rubber stamp — and the roadmap must carry a **written residual-risk statement** that v1 has no edge L3/L7 DDoS/WAF protection (deferred to the Cloudflare Milestone 2), mitigated in v1 by a 100% static site (CDN absorbs GET floods), durable + global rate-limiting on `/api`, a Vercel WAF rule on `/api/*`, a spend cap with alerts, low-TTL DNS for fast cutover, and a flood runbook.

## Key Findings

### Recommended Stack

Astro's static output with a single `prerender = false` route is the whole architecture; the Vercel adapter exists only so that one route can be a function and so Astro's CSP integration works on it. Everything else — sections, primitives, content — ships zero JS. The dependency tree is deliberately tiny (~8 runtime deps). Self-hosting fonts and using same-origin analytics means **v1 loads zero third-party assets**, which makes an enforceable CSP (`default-src 'self'`, no `unsafe-inline`, no `unsafe-eval`) realistic and removes the LGPD friction of sending visitor IPs to Google. See `STACK.md` for versions, `astro.config` shape, and alternatives.

**Core technologies:**
- **Astro 7.3.x** (`output: 'static'`) — SSG for all 9 sections; smallest attack surface, zero JS by default, first-class Content Collections.
- **@astrojs/vercel 11.x** — lets only `src/pages/api/orcamento.ts` become a serverless function; wires Astro CSP header emission for that route.
- **@astrojs/sitemap 3.7.x** + static `robots.txt` — SEO crawlability baseline.
- **astro:assets + Sharp 0.35.x** — build-time AVIF/WebP + responsive `srcset`; do NOT enable Vercel Image Optimization (runtime cost, CSP origin, breaks "100% static").
- **Astro Fonts API** (self-host Outfit + DM Sans via Fontsource provider) — removes Google Fonts CDN, two `preconnect`s, and two CSP origins; metrics-adjusted fallback kills font-swap CLS.
- **resend 6.x + zod 4.x** — server-only email send with schema validation; API key in a Vercel env var, never in the client bundle.
- **@upstash/ratelimit 2.x + @upstash/redis 1.x** (free tier) — durable sliding-window per-IP rate limiting; in-memory limiters are ineffective on Vercel's per-instance serverless.
- **@vercel/analytics 2.x** — cookieless, same-origin beacon, no consent banner, no new CSP origin, LGPD-friendly.
- **pnpm 9 / TypeScript 5 (`astro/tsconfigs/strict`) / Biome 2 (+ Prettier + `prettier-plugin-astro`) / `@lhci/cli` / Node 24** — tooling; Lighthouse CI is the enforcement mechanism for the >=95 budget.

### Expected Features

The visual design (9 sections, Hero "03 Bleed") is locked; feature research is about the capabilities behind the sections. The site depends on two conversion paths — the quote form and the `wa.me` deep-link — and on being sharable (OG tags) and locally discoverable (JSON-LD + consistent NAP). See `FEATURES.md` for the full T1-T32 / D1-D14 / X1-X18 breakdown and the LGPD form spec.

**Must have (table stakes):**
- Working quote form to founder inbox via Resend, with server-side Zod validation, client-side inline validation, accessible error/status messaging, and idle/submitting/success/error states.
- Spam defenses: honeypot + submit-timing check + durable per-IP rate limiting (429 with friendly message).
- Privacy Policy page (`/politica-de-privacidade`, pt-BR) **shipped in the same release as the live form**, plus an inline LGPD data-use notice next to the submit button.
- WhatsApp deep-link with per-entry `?text=` pre-fill; `tel:`/`mailto:` links; "resposta no mesmo dia util" promise repeated at CTAs and in the success message.
- SEO baseline: title/meta description/canonical, OG + Twitter tags + designed 1200x630 static share image, `<html lang="pt-BR">`, sitemap, robots, favicon set, `theme-color`.
- Structured data: `LocalBusiness` + `ProfessionalService` (+ `Person` founder) + `FAQPage` JSON-LD, single-sourced from content.
- Accessibility baseline: skip link, semantic landmarks, one `<h1>`, `:focus-visible` on every interactive element, keyboard operability, alt text, **AA contrast fixes** (several design translucent-white tokens fail 4.5:1), `prefers-reduced-motion` for all motion, no-JS visible fallback for reveal (design's inline `opacity:0` would otherwise hide the whole page).
- Anchor nav with `scroll-margin-top` + a keyboard-operable mobile nav (no JS framework — wrapped row or `<details>` disclosure).
- Security headers + CSP; cookieless analytics disclosed in the policy; branded 404 page.

**Should have (competitive differentiators — most BR agency sites skip these):**
- The site as its own proof of work — a "Lighthouse 100, sem cookies, acessivel" line backed by a real PageSpeed link.
- Portfolio/cases as problem to solution to outcome stories (1-2 real or honestly-labeled entries) in a Content Collection.
- Scroll-spy active-section nav highlight (pure enhancement, degrades to plain anchors).
- Domain e-mail everywhere instead of `@hotmail.com`; CNPJ/MEI + razao social in the footer; linked NAP-consistent Google Business Profile.
- Self-hosted fonts as a perf + privacy win; reduced-motion treated as a first-class polished path, not a kill-switch.
- "O retorno e de quem constroi" copy at the form and final CTA.

**Defer (v1.x / v2+):**
- Cloudflare + Turnstile on the form (Milestone 2, or pulled forward if v1 is attacked).
- Real client testimonials (structure the component now, populate after first delivery).
- Lead storage / lightweight CRM (revisit LGPD retention first).
- Blog / content marketing; online scheduling for the "Diagnostico" call; case-study detail pages; client portal; English version.
- Anti-features to actively refuse: autoplay/background video, carousels, live-chat widgets, newsletter/exit-intent popups, cookie-consent banner (nothing to consent to), reCAPTCHA, preloader/splash, custom cursor that hides the pointer, parallax/scroll-jacking, fake urgency, stock "team" photos.

### Architecture Approach

Static-by-default Astro with one opt-out route. `src/components/` is split three ways — `sections/` and `primitives/` render HTML and ship **zero JS**; `interactive/` components each pair markup with one co-located processed `<script>` (bundled to external, deferred). `src/lib/` holds framework-free, unit-testable modules (`validation`, `anti-spam`, `rate-limit`, `mailer`, `client-ip`, `env`) that never import `astro:*` except through `lib/env.ts`, so the form logic is portable to a Cloudflare Worker in M2. Content is Zod-validated collections. Security headers are single-sourced in `vercel.json`; `middleware.ts` is unnecessary for v1. Design tokens become CSS custom properties in `tokens.css`; `build.inlineStylesheets: 'never'` forces all scoped component styles to external files so `style-src 'self'` holds. Secrets use `astro:env` `context: 'server', access: 'secret'` (a build guarantee, not a naming convention). The form flow is progressive-enhancement: a real `<form method="POST">` works with no JS (native submit to 303 to `/obrigado`); the `ContactFormEnhancer` island upgrades it to a `fetch` + inline states. Anti-spam order is honeypot to timing to rate-limit to send (cheapest rejection first, external call last). See `ARCHITECTURE.md` for the full tree, the inline-style-to-CSP-safe conversion table, and the M2 Cloudflare-readiness matrix.

**Major components:**
1. **`src/pages/index.astro` + `layouts/BaseLayout.astro`** — compose the one-pager; own `<head>`, meta/OG/Twitter, JSON-LD, self-hosted font links, skip link.
2. **`src/components/sections/*` + `primitives/*`** — one `.astro` file per design section, pulling data via `getCollection()`; zero client JS.
3. **`src/components/interactive/*`** — `RevealObserver`, `CursorGlow`, `ParticleField`, `ContactFormEnhancer`; vanilla `<script>` replicating `client:idle`/`client:visible` semantics, all gated on `prefers-reduced-motion` / pointer / saveData / viewport.
4. **`src/pages/api/orcamento.ts`** — the ONLY `prerender = false` route: parse (JSON or formData) to Zod to anti-spam to rate-limit to Resend to 200 JSON or 303 redirect.
5. **`src/lib/*`** — framework-free form modules; `lib/env.ts` is the single import site for `astro:env/server`.
6. **`src/content.config.ts` + `src/content/*`** — `services` / `process` / `differentiators` / `faq` (YAML) + `cases` (Markdown), strict Zod schemas with enums (the project-type enum is also the form's allow-list).
7. **`vercel.json`** — CSP + all security headers on every response; **`.github/workflows/`** — `astro check` + build + `npm audit` + Dependency Review, and Lighthouse CI >=0.95 x4 against the Vercel preview URL.

### Critical Pitfalls

1. **CSP shipped with `unsafe-inline` — mandate defeated on day one.** The design is 100% inline `style=""` plus inline `<style>`/`<script>`. Kill author-written inline styles during the section-build phase (definition-of-done: `grep -r 'style="' src/` returns nothing), move `style-hover`/`style-focus` design-tool attrs to real `:hover`/`:focus-visible` CSS, deliver CSP as a **header** (not just `<meta>` — `<meta>` cannot do `frame-ancestors`), and never put `unsafe-inline`/`unsafe-eval` in `script-src`. Handle the `<Image>` framework-inline-style gap with `getImage()` + plain `<img>` or a narrow `unsafe-hashes`.
2. **Canvas particle loop never pauses / ignores reduced-motion.** The prototype runs an unconditional rAF loop with an O(n^2) neighbour scan, no IntersectionObserver pause, no `prefers-reduced-motion` guard — continuous main-thread + GPU work that drains mobile battery and fails throttled-mobile Lighthouse, and it violates an explicit PROJECT requirement. Gate the whole loop on reduced-motion (render one static frame), pause via IntersectionObserver + `visibilitychange`, cap DPR ~1.5, lower point count / drop the link-scan on small viewports and low-core devices, load `client:visible`.
3. **Form endpoint becomes an email-bomb / spam relay.** Without durable throttling a script exhausts the Resend 3k/mo tier (real leads then silently fail), floods the inbox, and runs up function cost. In-memory `Map` counters are effectively absent on serverless. Use Upstash Redis per-IP **plus a coarse global hourly cap**, honeypot + timing, hard-coded `from`/`to`/`subject` (never client-chosen), body-size cap, Origin allow-list, and a Vercel WAF rate-limit rule on `/api/*`. Residual DDoS risk is explicitly carried to M2.
4. **Unescaped user input in the email HTML / headers.** Interpolating the lead's name/message into a hand-built HTML string enables phishing content from a trusted sender; a CR/LF in a field used for `subject`/address enables header injection (`Bcc:`). Zod-validate (project-type must match the fixed enum), HTML-escape every interpolated value, strip CR/LF from subject/address fields, always send a `text` body too, keep contact info in the body not the envelope.
5. **`RESEND_API_KEY` leaks into the client bundle** — usually via a `PUBLIC_` prefix or importing `resend` from a component/island. Call Resend only from the API route; use `astro:env` secret schema so misuse is a build error; `.env*` gitignored; CI greps `dist/` for `re_` and the var names; least-privilege sending-only key with a documented rotation runbook.
6. **`client:load` / a UI framework creeps in**, shipping a runtime + hydration for content that is 100% static and blowing TBT/INP on mobile. Sections stay `.astro` with zero client JS; only form/glow/canvas are islands, `client:visible`/`client:idle` only; CI budget of <20 KB JS on the landing route.
7. **Lighthouse passes on desktop but fails throttled mobile — and mobile is the acceptance bar.** Define the gate as Lighthouse mobile preset + 4x CPU throttle + Slow 4G, run in CI against the Vercel preview on every PR, all four categories >=95; scaffold the LHCI job in the first phase so every phase sees the number. Budgets: LCP <2.5 s, CLS <0.05, TBT <200 ms, INP <200 ms.
8. **LGPD gaps** — no privacy notice / undecided legal basis, "cookieless" analytics that actually sets an ID, undisclosed Resend US transfer, no retention statement. Ship the policy page **with** the form; verify analytics sets zero cookies in DevTools; name Resend / Vercel / analytics as recipients; state a real retention period. (Legal-basis choice and retention number are open founder/legal decisions — see Gaps.)
9. **"Security review each phase" degrades into a rubber stamp.** Make it a concrete repo checklist artifact with findings, severity, owner, and fix-by; run one new external scanner each phase; no phase closes with an open High.

(Also: adapter misconfig turning the site into full SSR; Astro View Transitions breaking script listeners on the second navigation — decide "none in v1"; `astro:assets` not actually used so images ship unoptimized; missing SPF/DKIM/DMARC making mail spoofable and spam-binned; Content Collections misconfig / MDX pulled in needlessly; open redirect on form success. See `PITFALLS.md` Critical 9-20.)

## Implications for Roadmap

Architecture's build-order table (steps 1-8) and Pitfalls' phase vocabulary (P1-P7 + cross-cutting) converge on the same sequence. Suggested phases:

### Phase 1: Foundation & CI gate
**Rationale:** Everything depends on the scaffold, and the perf/security gates must exist from the start so every later phase sees the numbers (Pitfall 7, 20). Establishes the zero-inline, static-output baseline.
**Delivers:** Astro 7 init; astro.config (Vercel adapter, output static, env secret schema, build.inlineStylesheets never, Fonts API); tsconfig strict; .nvmrc = Node 24; self-hosted Outfit + DM Sans with metrics-adjusted fallback; tokens.css + global.css (absorb the design's inline style block + keyframes verbatim); BaseLayout.astro; empty vercel.json; Vercel Git integration + preview deploys; Lighthouse CI job (mobile preset, 4x CPU, Slow 4G, >=0.95 x4); astro check + pnpm audit + Dependency Review in CI; .env.example, .gitignore, gitleaks pre-commit; the per-phase security-review checklist file created in .planning/; Vercel account lockdown (2FA, protected production branch, scoped env vars, Deployment Protection on previews, spend cap + usage alerts).
**Addresses:** T13-T16, T19, T31 plumbing; D10.
**Uses:** Astro 7.3, @astrojs/vercel 11, Astro Fonts API, pnpm, TypeScript strict, @lhci/cli, Node 24.
**Avoids:** Pitfalls 5 (env schema + CI grep), 7 (LHCI scaffolded early), 8 (font CLS strategy), 9 (static output verified), 11 (Vercel/repo/sourcemap lockdown), 15 (Astro 5+ collections API), 20 (checklist artifact defined).

### Phase 2: Content collections
**Rationale:** Pure data with no dependencies beyond the scaffold; unblocks every section. Realizes the "no CMS" requirement safely.
**Delivers:** content.config.ts with strict Zod schemas + enums for services / process / differentiators / faq (YAML) and cases (Markdown, image() helper for covers); seed entries (1-2 honestly-labeled cases).
**Implements:** Architecture component 6. **Uses:** Zod 4, getCollection/render. **Avoids:** Pitfall 15 (no MDX, no raw HTML, strict schemas, current API).

### Phase 3: Static zero-JS sections + CSP-safe refactor + a11y/contrast
**Rationale:** The biggest single chunk and the one where the inline-style-to-scoped-style conversion must happen — there is no cheaper time (Anti-Pattern 3). Produces a shippable, fully static, Lighthouse-100 site with a non-functional form.
**Delivers:** SiteNav, Hero markup (no canvas yet), Services, Process, Differentiators, About, Contact (form markup only, with a slot for the LGPD notice), Faq, FinalCta, SiteFooter; politica-de-privacidade, obrigado, 404 pages; every inline style attribute to scoped style + var(--token); real hover/focus-visible CSS; semantic landmarks, one h1, real label-for + input id/name, FAQ as dl or details, aria-hidden decorative SVG, skip link; AA contrast fixes on translucent-white tokens (with design sign-off); all astro:assets images with explicit dimensions, AVIF/WebP, hero fetchpriority high; reveal's hidden state in document CSS gated by a .js-ready class (no-JS = fully visible); mobile nav.
**Addresses:** T1 markup, T11, T20-T27, T29; D4, D11.
**Avoids:** Pitfalls 1 (kill inline styles), 6 (sections stay static), 8 (image dimensions, reveal CSS), 14 (astro:assets), 18 (semantics + contrast + SEO plumbing).

### Phase 4: Progressive-enhancement effects
**Rationale:** Depends only on section markup + tokens; the three effects are independent of each other and can be parallel sub-tasks. Build the reduced-motion path first, then layer motion.
**Delivers:** RevealObserver (single IntersectionObserver over [data-reveal], rootMargin 0 0 -8% 0, unobserve after firing, ~2.6 s timeout fallback; optional CSS animation-timeline view() layer behind @supports); CursorGlow (gated on pointer:fine + no-reduced-motion, pointermove + rAF, translate3d); ParticleField (client:visible, IntersectionObserver + visibilitychange pause, DPR <=1.5, point count proportional to area, skip on reduced-motion / saveData / <768 px); dmFloat/dmPulse with reduced-motion animation:none; hover states each paired with a focus-visible equivalent. Decide and document "no View Transitions in v1."
**Addresses:** the A1-A8 motion-to-a11y pairings; D12.
**Uses:** hand-rolled vanilla JS — no animation library (GSAP/AOS/Lenis/Motion all rejected).
**Avoids:** Pitfalls 2 (canvas pause + reduced-motion), 6 (island directives), 10 (View Transitions decision).

### Phase 5: Form backend + progressive enhancement
**Rationale:** The no-JS path (form markup + endpoint + obrigado page) works before the enhancer exists. Needs RESEND_API_KEY (+ optional Upstash) in Vercel. The Privacy Policy page (from Phase 3) and the inline LGPD notice must go live in the same release.
**Delivers:** lib/validation (Zod, project-type enum, length caps), lib/anti-spam (honeypot + timing), lib/client-ip, lib/rate-limit (Upstash per-IP sliding window + global hourly cap + hard daily cap), lib/mailer (Resend wrapper, hard-coded from/to/subject, HTML-escaped fields, text body), api/orcamento.ts (content-negotiated JSON vs 303, generic error responses, no stack traces, no client-supplied redirect), then ContactFormEnhancer (client:visible, preventDefault + fetch, inline idle/submitting/success/error, preserves input on error, disables submit in-flight, shows WhatsApp fallback on error); inline LGPD data-use notice + policy link next to submit; Vercel WAF rate-limit rule on /api/*.
**Addresses:** T1-T8, T12; the LGPD form-side checklist.
**Uses:** Resend 6, Zod 4, @upstash/ratelimit 2 + @upstash/redis 1, astro:env/server.
**Avoids:** Pitfalls 3 (durable + global rate-limit), 4 (escape + enum + CRLF strip), 5 (server-only, secret schema), 13 (compensating controls), 19 (no open redirect, real error states).

### Phase 6: SEO / metadata / structured data
**Rationale:** Mostly BaseLayout work; low risk; needs sections in place so titles/descriptions/JSON-LD reflect real content and NAP.
**Delivers:** @astrojs/sitemap, robots.txt, per-page title/meta description/canonical, OG + Twitter tags + designed 1200x630 static public/og/ image, JSON-LD LocalBusiness + ProfessionalService + Person + FAQPage (single-sourced from collections, validated with Google Rich Results Test), theme-color, favicon set.
**Addresses:** T13-T18; D8, D14.
**Avoids:** Pitfall 18 (SEO half).

### Phase 7: Security headers finalize (Report-Only to enforce)
**Rationale:** Must be last of the build phases because you can only lock the CSP once every script/style/img/connect origin the finished site uses is known (Architecture build-order step 7).
**Delivers:** fill vercel.json with the full CSP (default-src self, script-src self, style-src self, frame-ancestors none, base-uri none, object-src none, form-action self, upgrade-insecure-requests) + HSTS (preload), X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options DENY, COOP/CORP; ship as Content-Security-Policy-Report-Only on preview first, confirm zero DevTools violations on load and on form submit, then flip to enforcing; build.sourcemap false; custom 404/500 with no diagnostics; SRI rule documented for any future third-party asset; securityheaders.com >= A gate.
**Addresses:** T32.
**Avoids:** Pitfalls 1 (header delivery, no unsafe-inline in script-src), 11 (SRI, sourcemaps, error hardening), 12 (all headers present on HTML + API).

### Cross-cutting workstreams (not standalone phases)

- **CI/CD gates — tighten throughout.** Preview deploys wired in Phase 1; Lighthouse CI, JS-weight budget, npm audit / osv-scanner, header-regression curl check, axe/Pa11y all added and tightened as features land.
- **Per-phase security review (/gsd:secure-phase).** The checklist artifact from Phase 1 runs at every phase boundary and expands as Phases 5/6 add surface; findings written to .planning/ with severity/owner/fix-by; one new external scanner per phase.
- **LGPD & mail authentication.** The Privacy Policy page ships with the form (Phase 5). Domain verification in Resend (SPF/DKIM) + a _dmarc TXT record (p=none to quarantine) and mail-tester >=8 land whenever the sending domain is available (Phase 5, or a follow-up). Legal basis and retention period are open decisions to resolve before the form goes live.
- **Analytics verification.** Whichever tool is finally chosen, confirm zero cookies / no persistent ID in DevTools before launch, and name it in the policy.

### Phase Ordering Rationale

- **Dependencies:** scaffold to content (pure data) to static sections (need content) to effects (need section markup) to form backend (needs env + form markup) to SEO (needs real content) to CSP finalize (needs all origins known). This is exactly Architecture's build-order table and Pitfalls' P1-P7.
- **Grouping:** the hard no-inline-styles refactor is bundled into the section-build phase because that is the only cheap time to do it; the reduced-motion path is built before motion is layered on; the no-JS form path exists before the enhancer.
- **Pitfall avoidance:** gates (Lighthouse CI, security checklist, Vercel lockdown) are front-loaded into Phase 1 so regressions are caught every phase; CSP enforcement is deferred to the end so it is enforceable rather than loosened; the DDoS residual-risk statement is written into the roadmap itself.

### Research Flags

Phases likely needing /gsd:plan-phase --research-phase <N> during planning:
- **Phase 4 (effects):** MEDIUM. The canvas rewrite (pause logic, DPR/point-count tuning for real mid-range Android) and the choice between a CSS scroll-driven animation-timeline view() layer + IO fallback vs. a single IO island (Safari still lacks view() as of early 2026) benefit from a focused spike.
- **Phase 5 (form backend):** MEDIUM. Confirm the Upstash dependency decision vs. strict minimal-deps (fallback: in-memory Map + honeypot + Vercel WAF rule, documented as a gap); confirm Resend sending-domain / DNS control; nail down the exact HTML-escape + CRLF-strip implementation and the content-negotiation branching.
- **LGPD workstream:** MEDIUM. Legal-basis wording (Art. 7, V pre-contractual vs. legitimate interest vs. consent checkbox), retention period, and third-party-recipient disclosure need a Brazilian data-protection reference or lawyer sign-off — sources so far are practitioner guides.

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 1 (foundation):** Astro + Vercel + Fonts API + LHCI are all first-class documented; STACK.md already has the config shape.
- **Phase 2 (content collections):** ARCHITECTURE.md contains the full content.config.ts.
- **Phase 3 (static sections):** the design is locked; work is mechanical HTML/CSS + the conversion table in ARCHITECTURE.md.
- **Phase 6 (SEO):** established patterns; JSON-LD shape is in FEATURES.md T17.
- **Phase 7 (security headers):** the vercel.json block and Report-Only rollout are in both STACK.md and ARCHITECTURE.md.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified against Context7 + npm registry (2026-09-05) + official Astro 7 / Vercel blog posts. MEDIUM only on the Upstash-vs-minimal-deps and style-src unsafe-inline fallback judgement calls. |
| Features | HIGH | Conversion / SEO / accessibility patterns corroborated by multiple current sources and official WCAG/schema specs. MEDIUM on LGPD legal-basis nuance (practitioner guides, no case law). |
| Architecture | HIGH | Astro mechanics and project layout from Context7 + official docs. MEDIUM on exact CSP-to-scoped-style interplay (version-sensitive, known open issues 14301 / 14495) and CSS scroll-driven animation coverage. |
| Pitfalls | HIGH | Astro/Vercel/CSP/Resend failure modes from official docs + issue trackers; animation/perf traps are directly visible in the supplied design code. MEDIUM on LGPD specifics (secondary Brazilian sources). |

**Overall confidence:** HIGH — the build path is well understood and internally consistent across all four research files; residual uncertainty is concentrated in LGPD legal wording and a few deliberately-flagged implementation choices.

### Gaps to Address

- **Rate-limiter dependency vs. strict minimal-deps:** @upstash/ratelimit + @upstash/redis (free tier) is recommended, but adds two runtime deps and an external service. Decide at roadmap time; if rejected, ship in-memory Map + honeypot + timing + Vercel WAF rule on /api/* and document the gap. Resolve in Phase 5 planning.
- **Resend sending domain / DNS control:** the design shows a hotmail.com address; deliverability and DMARC need a verified domain the founder controls. Confirm domain availability and DNS access before Phase 5; SPF/DKIM/DMARC + mail-tester >=8 is a launch gate.
- **Analytics final pick + verification:** Vercel Web Analytics is recommended (same-origin, no CSP change). If Plausible/Umami is chosen instead, the CSP gains an origin. Whatever is picked, verify zero cookies in DevTools before launch and name it in the policy.
- **Vercel plan tier:** WAF rate-limit rules, Deployment Protection, and spend-management granularity vary by plan. Confirm the tier so Phase 1 lockdown and the Phase 5 /api/* firewall rule are accurately scoped.
- **LGPD legal basis + retention period:** choose Art. 7, V (pre-contractual) + legitimate interest with a notice-only pattern (recommended) vs. a consent checkbox; pick a real retention number (e.g. 12-24 months) and a purge routine. Founder/legal decision; blocks the Privacy Policy page finalization.
- **Portfolio / cases content availability:** v1 needs 1-2 real or honestly-labeled (projeto proprio / demo) case entries. Confirm what exists; the collection + component ship regardless.
- **Mobile nav pattern:** wrapped/scrollable link row vs. details disclosure menu — both are JS-framework-free; pick one in Phase 3 based on the final nav item count.
- **CSS scroll-driven reveal vs. single IO island:** ship the animation-timeline view() layer with an IO fallback (removes JS for ~70% of visitors, two code paths to keep identical) vs. one ~20-line IO island (simpler, one path). Decide in Phase 4.
- **Astro Image inline-style / CSP interaction:** known open issues; validate the chosen approach (getImage() + img vs. narrow unsafe-hashes) in a real Vercel preview build, not just astro dev, during Phase 3/7.

## Sources

### Primary (HIGH confidence)
- Context7 /withastro/docs and /withastro/astro — security.csp, Vercel adapter options, output static + per-route prerender, astro:env secret guarantee, Content Collections (defineCollection, glob, render).
- npm registry (2026-09-05) — verified latest: astro@7.3.1, @astrojs/vercel@11.0.10, @astrojs/sitemap@3.7.4, resend@6.26.0, zod@4.5.4, @upstash/ratelimit@2.0.8, @upstash/redis@1.38.4, @vercel/analytics@2.0.1, @biomejs/biome@2.5.12, sharp@0.35.4, unlighthouse@0.18.0.
- astro.build/blog/astro-7 + /whats-new-june-2026 + /blog/astro-6 — Astro 7 (Rust compiler, Node >=22.12), CSP + Fonts API graduated to stable in Astro 6.
- docs.astro.build — experimental-flags/csp, guides/fonts, guides/environment-variables, guides/integrations-guide/vercel, guides/view-transitions — CSP hash mechanism, Fonts API providers, secret schema, adapter, View Transitions script lifecycle.
- vercel.com/docs — functions/runtimes/node-js/node-js-versions, vercel-firewall/vercel-waf/rate-limiting, deployment-protection + KB "Limit Abuse with Rate Limiting" — Node 24 default, WAF rules, preview protection, in-memory limiter statelessness.
- upstash.com/docs/redis/sdks/ratelimit-ts/overview — connectionless per-IP sliding-window rate limiting for serverless.
- W3C WAI Forms Tutorial (User Notifications); WCAG 2.2 (2.3.3, 2.4.7/2.4.11, 3.3.1/3.3.3); Google structured-data / LocalBusiness docs.
- withastro/astro issues 14301 (Image inline style vs. CSP), 14495 (CSP hash env-specific), 10211 (functionPerRoute), 9798 / 9359 (View Transitions script re-execution).
- Supplied design file (arquivos de design/Dmarques Landing.dc.html) — inline-style-heavy markup, particles() loop with no offscreen pause / reduced-motion guard, IO reveal with 2.6 s timeout, pointermove + rAF glow, Google Fonts link with 6 Outfit weights, image-slot placeholders without dimensions.
- .planning/PROJECT.md.

### Secondary (MEDIUM confidence)
- Landingi / Branded Agency / WPForms / LandingPageFlow — landing-page conversion best practices (2025-2026).
- Bidsketch / Viktor Shmatko / listallexperts — trust-building for new freelancers/agencies.
- Splitforms / Formester / FORMLOVA / 3ZeroDigital — honeypot vs. CAPTCHA vs. Turnstile comparisons.
- cookiebeam / analytics-alternatives / opensource-analytics — cookieless analytics and when no consent banner is required.
- pkgpulse / scripts.nuxt.com — Vercel Analytics vs. Plausible vs. Umami privacy profiles.
- MDN + Chrome for Developers — animation-timeline view() support (Chromium since 2023, Safari unsupported early 2026) + CSS.supports fallback.
- Trevor Lasn — practical vercel.json CSP + Report-Only rollout for Astro.
- Resend docs — Node SDK + domain verification (SPF/DKIM), quotas.

### Tertiary (LOW confidence — needs validation during planning)
- Serpro / FullSaaS / Cayman / Divia — LGPD site-adequacy guides (contact-form notice, legal basis, privacy-policy required elements, retention). Practitioner guides, not the statute — confirm legal-basis wording, consent-vs-notice choice, retention period, and Resend/Vercel international-transfer disclosure with a Brazilian data-protection reference or lawyer.
- Competitor feature analysis in FEATURES.md — archetype descriptions of typical BR small-agency / DIY-freelancer sites (no specific competitors catalogued).
- Motion package tree-shaken size (~4-5 KB for animate/inView subset) — npm + Motion docs; only relevant if a future phase needs spring physics.

---
*Research completed: 2026-09-05*
*Ready for roadmap: yes*
