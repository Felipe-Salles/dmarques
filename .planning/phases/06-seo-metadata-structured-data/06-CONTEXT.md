# Phase 6: SEO / Metadata / Structured Data - Context

**Gathered:** 2026-10-17
**Status:** Ready for planning

<domain>
## Phase Boundary

The site is fully shareable and locally discoverable: per-page `<title>`, meta
description and absolute canonical; Open Graph + Twitter Card tags with one designed
1200x630 share image; `sitemap.xml` + `robots.txt`; favicon set + `apple-touch-icon` +
`theme-color` (#070A14); single-sourced JSON-LD `["ProfessionalService","LocalBusiness"]`
whose NAP is byte-identical to the footer. Requirements: SEO-01, SEO-03, SEO-04, SEO-05,
SEO-06, SEO-08. FAQPage (SEO-07) is dropped (04.1 D-02). No new pages, no visible content
sections, no CSP work (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### NAP and business identity
- **D-01:** Official name everywhere is **"Dmarques Desenvolvimento Web"**: JSON-LD
  `name`, footer copyright (today `© {year} Dmarques Soluções Web` in
  `src/components/SiteFooter.astro:39` must change), header/footer `aria-label` (already
  correct), default `<title>` brand suffix, `og:site_name`. Matches the Google Business
  Profile name exactly. `PROJECT.md` "What This Is" may keep the prose but the planner
  should note the official name.
- **D-02:** Address is **city only, no street**: `addressLocality: "Ibitinga"`,
  `addressRegion: "SP"`, `addressCountry: "BR"`. The business is a service-area business
  (GBP has the address hidden). Footer keeps "Ibitinga · SP".
- **D-03:** Phone displayed in the footer stays **`(16) 99611-1785`**; JSON-LD
  `telephone` uses E.164 `+5516996111785`. SEO-08 "byte-identical" is satisfied by deriving
  both from one source (same digits, different presentation formats from one constant);
  the planner must make that single source explicit (e.g. reuse `WHATSAPP_NUMBER` in
  `src/lib/whatsapp.ts` or a new shared business-data module consumed by footer and
  JSON-LD).
- **D-04:** `areaServed` = the GBP service area: **Ibitinga, Araraquara, Matão, Itápolis,
  Iacanga, Bauru** (all SP), as `City` entries.
- **D-05:** `sameAs` = Instagram `https://www.instagram.com/agenciadmarques/` **and** the
  Google Business Profile link `https://share.google/5cU7xCYeXu5uWD9Yq` (researcher:
  check whether a canonical `maps.google.com/?cid=` / `g.page` URL is preferable to the
  share shortlink, and resolve it if so). GBP primary category is "Serviço de
  Informática" (informational; no schema field required).
- **D-06:** `openingHoursSpecification` = **Mon–Fri 07:00–19:00, Sat 09:00–14:00**, Sunday
  closed, mirroring the GBP. Hours appear **only in the JSON-LD, not in the footer**
  (Felipe's choice; accepted drift risk if the GBP hours change).
- **D-07:** **No `priceRange`** (site never talks price; quote follows diagnosis).
- **D-08:** **No CNPJ / razão social** yet (doesn't exist); add when TRUST-02 lands.
- **D-09:** `founder` = Person with **name only** ("Felipe Salles"); no photo, jobTitle or
  sameAs on the Person.
- **D-10:** `email` = `contato@agenciadmarques.com.br`; `url` = `https://agenciadmarques.com.br/`;
  `image`/`logo` from the existing brand assets (symbol/lockup) at absolute URLs.

### Share image (OG / Twitter)
- **D-11:** Composition: dark `#070A14` background **with the hero aurora glow**, the
  logo lockup (symbol + logotipo), and the hero headline **"Software sob medida, com
  acabamento de produto."** in Sora. Key content centred so the WhatsApp square crop
  keeps it legible.
- **D-12:** **Generated automatically by a repo script** (HTML template using the real
  fonts/tokens → headless browser screenshot → optimized PNG/JPG in `public/`, < 300 KB,
  1200x630), regenerable when the brand changes. Follow the existing
  `scripts/capture-site.mjs` approach where useful.
- **D-13:** One share image for the whole site (Claude's discretion, confirmed implicitly).
  Include `og:image:width/height/alt`, `twitter:card = summary_large_image`.

### Title and description
- **D-14:** Home `<title>`: service + city first —
  **"Sites, sistemas e automações em Ibitinga/SP | Dmarques"** (~55 chars). Secondary
  pages keep "<Page> — Dmarques"-style titles (Claude's discretion on exact form, using the
  official name where it fits).
- **D-15:** Home meta description:
  **"Criamos sites, sistemas sob medida e automações em Ibitinga/SP e região. Rápidos,
  seguros e prontos para crescer. Fale direto com quem desenvolve."** (planner trims to
  ~150–160 chars if needed without losing Ibitinga / sites / sistemas / automações).
- **D-16:** `og:title` / `og:description` / `twitter:*` **reuse the same title and
  description** as the page (single source, passed through `BaseLayout` props).

### Project-wide conventions carried forward
- **D-17:** Zero comments in any version-controlled file.
- **D-18:** Only claims already published on the site (04.1 D-03); voice "nós".
- **D-19:** No new runtime JS; JSON-LD is a build-time `<script type="application/ld+json">`
  emitted by Astro (JSON-encoded, no string concatenation — closes Phase 2 finding
  P02-004 spirit).

### Claude's Discretion
- Favicon set details (SVG favicon, sizes, `site.webmanifest` or not) beyond what exists in
  `public/` (`favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`).
- Sitemap filtering: exclude `noindex` pages (`/obrigado`, `/erro-envio/*`) and `/404`.
- `robots.txt` content (allow-all + sitemap line) and whether Vercel previews keep
  `noindex` (they do via Deployment Protection).
- Restoring `categories:seo` in `lighthouserc.json` from `warn` to `error` ≥ 0.95, and how
  to gate it given previews send `X-Robots-Tag: noindex` (Phase 1 decision says Phase 6
  restores it against the indexable production site).
- JSON-LD `@id` structure, `image` vs `logo` asset choice, whether to emit on every page or
  only home (home is the one that matters).
- Exact secondary-page titles/descriptions.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirements
- `.planning/ROADMAP.md` §"Phase 6: SEO / Metadata / Structured Data" — goal + 5 success criteria
- `.planning/REQUIREMENTS.md` §"SEO & Descoberta (SEO)" — SEO-01..08 (SEO-07 dropped)
- `.planning/PROJECT.md` — constraints (perf ≥95, CSP, LGPD, pt-BR), Key Decisions

### Prior decisions that constrain this phase
- `.planning/phases/04.1-redesign-aurora-tecnica/04.1-CONTEXT.md` — D-02 (FAQ/FAQPage removed), D-03 (allowed claims), Aurora visual direction
- `.planning/phases/05-form-backend-enhancement-lgpd/05-CONTEXT.md` — D-09 (contato@ e-mail), D-29 (no privacy page)
- `.claude/skills/sketch-findings-dmarques/SKILL.md` — Aurora tokens/visual for the share image
- `.planning/security/SECURITY-CHECKLIST.md` — SEC-07 run required at phase end (`.planning/security/runs/phase-06.md`)
- `lighthouserc.json` — SEO category currently `warn`; Phase 1 decision says Phase 6 restores `error`

### External
- Google Business Profile: https://share.google/5cU7xCYeXu5uWD9Yq (name "Dmarques Desenvolvimento Web", service-area, category "Serviço de Informática")
- Google Rich Results Test — validation target for the JSON-LD

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/layouts/BaseLayout.astro`: already takes `title`, `description`, `noindex` props and renders favicon/apple-touch links — extend here with canonical, OG/Twitter, theme-color, JSON-LD.
- `src/lib/whatsapp.ts`: `WHATSAPP_NUMBER = '5516996111785'` — candidate single source for phone (E.164 and display).
- `src/assets/brand/simbolo.png`, `logotipo.png`: logo sources for share image and JSON-LD `logo`.
- `src/components/Aurora.astro` + `src/styles/tokens.css`: aurora look and tokens to reuse in the share-image template.
- `scripts/capture-site.mjs`: existing headless-browser capture script pattern (04.1 D-06).
- `public/favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`: existing favicon set.

### Established Patterns
- `astro.config.mjs` already sets `site: 'https://agenciadmarques.com.br'` (canonical/sitemap base); `@astrojs/sitemap` not yet installed.
- Pages with `noindex`: `src/pages/obrigado.astro`, `src/pages/erro-envio/[motivo].astro`.
- Exact version pins for deps; `pnpm audit` must stay clean.

### Integration Points
- `src/components/SiteFooter.astro`: © line → official name; phone/e-mail must come from the same source as JSON-LD.
- `src/components/SiteHeader.astro`: aria-label already uses the official name.
- `src/pages/index.astro`, `404.astro`, `obrigado.astro`, `erro-envio/[motivo].astro`: per-page title/description.
- `lighthouserc.json`, `.github/workflows/lighthouse.yml`: SEO gate.

</code_context>

<specifics>
## Specific Ideas

- Share image = "logo + frase + aurora": same visual language as the hero, headline verbatim.
- NAP mirrors the existing Google Business Profile exactly so the two reinforce each other in local search.

</specifics>

<deferred>
## Deferred Ideas

- CNPJ / razão social in JSON-LD and footer — when TRUST-02 lands.
- Showing business hours on the site — declined for now (JSON-LD only).

</deferred>

---

*Phase: 06-seo-metadata-structured-data*
*Context gathered: 2026-10-17*
