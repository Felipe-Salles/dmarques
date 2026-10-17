# Phase 6: SEO / Metadata / Structured Data - Research

**Researched:** 2026-10-17
**Domain:** Astro 7 static head metadata, @astrojs/sitemap, schema.org JSON-LD (LocalBusiness), build-time OG image generation, Lighthouse CI SEO gate
**Confidence:** HIGH (codebase facts verified by inspection; sitemap behaviour verified from package source); MEDIUM on GBP canonical URL (not resolvable to a CID) and on Rich Results Test (manual step)

## Summary

Phase 6 is almost entirely head/metadata work in one file (`src/layouts/BaseLayout.astro`) plus three new artifacts: a single-source business-data module, a repo script that renders the share image, and the sitemap/robots files. The only new runtime dependency is `@astrojs/sitemap` 3.7.4 (build-time only; deps `zod`, `sitemap@^9`; no postinstall; published 2026-08-31). Everything else reuses installed tooling (`playwright` 1.64.1 + `sharp` 0.35.5 in devDeps, `scripts/verify/static-server.mjs` helper).

Three findings change the plan shape. (1) `@astrojs/sitemap` excludes `404`/`500` by default (`STATUS_CODE_PAGES`) but does NOT honor `<meta name="robots" content="noindex">`; `/obrigado` and `/erro-envio/{limite,invalido,falha}` must be removed with `filter`. (2) The Lighthouse SEO category cannot reach 0.95 on Vercel previews (Deployment Protection injects `X-Robots-Tag: noindex`, failing `is-crawlable`, weight ~4); the SEO category gate must run against the production URL, while the preview job asserts individual SEO audits. Production currently returns no `X-Robots-Tag` and `/robots.txt` is a 404 today (verified by curl). (3) `share.google/5cU7xCYeXu5uWD9Yq` resolves (302 then 200) to a Google Search knowledge panel with `kgmid=/g/11zyld6fyl`, not to a Maps URL; no CID can be derived without Felipe's GBP, so keep the shortlink as locked and treat a Maps URL as optional.

CSP: `astro.config.mjs` has NO `security.csp` yet (Phase 7 owns CSP) and `vercel.json` is `{}`. A `<script type="application/ld+json">` is a non-executable data block; CSP `script-src` does not apply to it, so Phase 7 needs no hash or allowance for it. Phase 6 must still emit it JSON-encoded with `<` escaped.

**Primary recommendation:** Create `src/lib/business.ts` as the single NAP/identity source, extend `BaseLayout` props (`title`, `description`, `noindex`, `ogImage`, `jsonLd`), generate `public/og-image.jpg` with `scripts/generate-og.mjs` (Playwright + sharp), add `@astrojs/sitemap` with a `filter`, and split Lighthouse CI into a preview job (per-audit SEO assertions, `is-crawlable` off) and a production job (`categories:seo` error >= 0.95).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Official name everywhere is "Dmarques Desenvolvimento Web": JSON-LD `name`, footer copyright (today `© {year} Dmarques Soluções Web` in `src/components/SiteFooter.astro:39` must change), header/footer `aria-label` (already correct), default `<title>` brand suffix, `og:site_name`. Matches the Google Business Profile name exactly. `PROJECT.md` "What This Is" may keep the prose but the planner should note the official name.
- **D-02:** Address is city only, no street: `addressLocality: "Ibitinga"`, `addressRegion: "SP"`, `addressCountry: "BR"`. Service-area business (GBP address hidden). Footer keeps "Ibitinga · SP".
- **D-03:** Phone displayed in the footer stays `(16) 99611-1785`; JSON-LD `telephone` uses E.164 `+5516996111785`. SEO-08 "byte-identical" is satisfied by deriving both from one source (same digits, different presentation formats from one constant); the planner must make that single source explicit (e.g. reuse `WHATSAPP_NUMBER` in `src/lib/whatsapp.ts` or a new shared business-data module consumed by footer and JSON-LD).
- **D-04:** `areaServed` = the GBP service area: Ibitinga, Araraquara, Matão, Itápolis, Iacanga, Bauru (all SP), as `City` entries.
- **D-05:** `sameAs` = Instagram `https://www.instagram.com/agenciadmarques/` and the Google Business Profile link `https://share.google/5cU7xCYeXu5uWD9Yq` (researcher: check whether a canonical `maps.google.com/?cid=` / `g.page` URL is preferable to the share shortlink, and resolve it if so). GBP primary category is "Serviço de Informática" (informational; no schema field required).
- **D-06:** `openingHoursSpecification` = Mon-Fri 07:00-19:00, Sat 09:00-14:00, Sunday closed, mirroring the GBP. Hours appear only in the JSON-LD, not in the footer (accepted drift risk).
- **D-07:** No `priceRange`.
- **D-08:** No CNPJ / razão social yet; add when TRUST-02 lands.
- **D-09:** `founder` = Person with name only ("Felipe Salles"); no photo, jobTitle or sameAs on the Person.
- **D-10:** `email` = `contato@agenciadmarques.com.br`; `url` = `https://agenciadmarques.com.br/`; `image`/`logo` from the existing brand assets (symbol/lockup) at absolute URLs.
- **D-11:** Share image: dark `#070A14` background with the hero aurora glow, logo lockup (symbol + logotipo), hero headline "Software sob medida, com acabamento de produto." in Sora. Key content centred so the WhatsApp square crop keeps it legible.
- **D-12:** Generated automatically by a repo script (HTML template using real fonts/tokens, headless browser screenshot, optimized PNG/JPG in `public/`, < 300 KB, 1200x630), regenerable when the brand changes. Follow `scripts/capture-site.mjs` approach where useful.
- **D-13:** One share image for the whole site. Include `og:image:width/height/alt`, `twitter:card = summary_large_image`.
- **D-14:** Home `<title>`: "Sites, sistemas e automações em Ibitinga/SP | Dmarques" (~55 chars). Secondary pages keep "<Page> — Dmarques"-style titles (Claude's discretion on exact form, using the official name where it fits).
- **D-15:** Home meta description: "Criamos sites, sistemas sob medida e automações em Ibitinga/SP e região. Rápidos, seguros e prontos para crescer. Fale direto com quem desenvolve." (planner trims to ~150-160 chars if needed without losing Ibitinga / sites / sistemas / automações).
- **D-16:** `og:title` / `og:description` / `twitter:*` reuse the same title and description as the page (single source, passed through `BaseLayout` props).
- **D-17:** Zero comments in any version-controlled file.
- **D-18:** Only claims already published on the site (04.1 D-03); voice "nós".
- **D-19:** No new runtime JS; JSON-LD is a build-time `<script type="application/ld+json">` emitted by Astro (JSON-encoded, no string concatenation, closes Phase 2 finding P02-004 spirit).

### Claude's Discretion
- Favicon set details (SVG favicon, sizes, `site.webmanifest` or not) beyond what exists in `public/`.
- Sitemap filtering: exclude `noindex` pages (`/obrigado`, `/erro-envio/*`) and `/404`.
- `robots.txt` content (allow-all + sitemap line) and whether Vercel previews keep `noindex` (they do via Deployment Protection).
- Restoring `categories:seo` in `lighthouserc.json` from `warn` to `error` >= 0.95, and how to gate it given previews send `X-Robots-Tag: noindex`.
- JSON-LD `@id` structure, `image` vs `logo` asset choice, whether to emit on every page or only home.
- Exact secondary-page titles/descriptions.

### Deferred Ideas (OUT OF SCOPE)
- CNPJ / razão social in JSON-LD and footer (when TRUST-02 lands).
- Showing business hours on the site (JSON-LD only).
- FAQPage / SEO-07 (dropped, 04.1 D-02). No new pages, no visible content sections, no CSP work (Phase 7).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | title, ~150-char description citing Ibitinga/sites/sistemas/automação, absolute canonical | BaseLayout props + `new URL(Astro.url.pathname, Astro.site)`; length assertion test |
| SEO-03 | OG + Twitter complete, static 1200x630 image < 300 KB in `public/` | `scripts/generate-og.mjs` (Playwright + sharp), JPEG output, absolute `og:image` URL |
| SEO-04 | `sitemap.xml` via `@astrojs/sitemap` + `robots.txt` allow-all with sitemap line | integration with `filter`; `public/robots.txt`; output is `sitemap-index.xml` + `sitemap-0.xml` |
| SEO-05 | favicon set + apple-touch-icon + theme-color #070A14 | existing files in `public/`; add `<meta name="theme-color">`; optional SVG |
| SEO-06 | JSON-LD `["ProfessionalService","LocalBusiness"]` valid for Rich Results | `src/lib/business.ts` + `src/lib/json-ld.ts` builder, emitted in BaseLayout |
| SEO-08 | NAP identical footer vs JSON-LD | footer and JSON-LD both import from `business.ts`; dist-level test compares them |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Title/description/canonical/OG/Twitter tags | Build-time (SSG) | CDN / Static | Emitted into prerendered HTML by BaseLayout |
| JSON-LD | Build-time (SSG) | — | Serialized once at build from `business.ts` |
| sitemap.xml / robots.txt | Build-time (integration) / CDN static (`public/`) | — | Sitemap generated at build; robots is a static file |
| Share image | Repo tooling (script, dev machine) | CDN / Static | Rendered offline, committed to `public/`, served as immutable static |
| Favicons / theme-color | CDN / Static | — | Static files plus head tags |
| Lighthouse SEO gate | CI (GitHub Actions) | Vercel preview/production | Measures deployed URLs |
| Noindex for previews | Vercel platform | — | Deployment Protection header, not app code |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@astrojs/sitemap` | 3.7.4 (exact pin) | sitemap-index.xml + sitemap-0.xml | Official; mandated by SEO-04. [VERIFIED: npm registry] `latest` = 3.7.4, published 2026-08-31, deps `zod ^4.3.6` + `sitemap ^9.0.0`, no postinstall |
| `playwright` | 1.64.1 (already devDep) | Headless render of share-image template | Already used by `scripts/verify/static-server.mjs` `launchBrowser()` |
| `sharp` | 0.35.5 (already devDep) | Compress screenshot to JPEG/PNG < 300 KB | Already used by `scripts/capture-site.mjs` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Astro Fonts API (`astro:assets` `Font`) | built into 7.3.8 | Source of the real Sora/Inter Tight woff2 for the OG template | Script parses `@font-face` urls out of built HTML/CSS |
| `node:test` | built in | Unit/dist tests for SEO invariants | Existing `pnpm test` glob `src/**/*.test.mjs` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Playwright-rendered HTML template | `satori` / `astro-og-canvas` | New runtime/dev deps and a font-loading path separate from the Fonts API; D-12 asks for a headless-browser template |
| Hand-written `sitemap.xml` | integration | SEO-04 explicitly requires the integration |
| Raw `JSON.stringify` in a `<script>` | `schema-dts` | Types only; dev dependency not worth it for one object |

**Installation:**
```bash
pnpm add @astrojs/sitemap@3.7.4
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| @astrojs/sitemap | npm | years (official withastro, 3.7.4 on 2026-08-31) | high (official Astro integration) | github.com/withastro/astro | slopcheck not run (pip install attempted, tool not confirmed available) | Approved on authority: named in Astro docs and in REQUIREMENTS SEO-04 and CLAUDE.md stack; `npm view` confirms version, deps, no postinstall. Tag `[ASSUMED]` for slopcheck purposes only; planner may add a trivial human-verify of the lockfile diff |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged [SUS]:** none. Transitive `sitemap@9.0.1` (npm, last modified 2026-02-28) is the library @astrojs/sitemap has depended on for years. `pnpm-workspace.yaml` has `minimumReleaseAge` settings; 3.7.4 is ~7 weeks old so it passes any normal age gate.

## Architecture Patterns

### System Architecture Diagram

```
src/lib/business.ts  (name, url, email, phone digits, areaServed, hours, sameAs, founder)
   |                \
   |                 \--> src/lib/json-ld.ts: buildLocalBusiness(site) -> plain object
   v                                             |
SiteFooter.astro (display phone, email)          v
                                  BaseLayout.astro  <-- props: title, description, noindex, ogImage, jsonLd?
                                     | emits <head>: title, description, canonical (unless noindex),
                                     | og:*, twitter:*, theme-color, icons, ld+json (home only)
                                     v
astro build --> dist/client/*.html
        |-- @astrojs/sitemap (filter drops /obrigado, /erro-envio/*) --> sitemap-index.xml, sitemap-0.xml
        |-- public/robots.txt, public/og-image.jpg (copied verbatim)
        v
Vercel deploy
   |-- Preview (X-Robots-Tag: noindex) --> LHCI job A: per-audit SEO asserts, is-crawlable off
   '-- Production                      --> LHCI job B: categories:seo >= 0.95 (error)

scripts/generate-og.mjs (manual, dev machine):
 dist build -> parse @font-face woff2 urls (Sora 600, Inter Tight) -> template HTML (tokens + aurora gradients + base64 logos)
 -> Playwright 1200x630 screenshot -> sharp mozjpeg -> public/og-image.jpg (< 300 KB)
```

### Recommended Project Structure
```
src/lib/business.ts          single source: BUSINESS constant + formatPhoneDisplay() + phoneE164()
src/lib/json-ld.ts           buildLocalBusinessJsonLd(): returns plain object (testable)
src/lib/seo.test.mjs         unit tests: description length, E.164, areaServed, hours
src/layouts/BaseLayout.astro extended head
scripts/generate-og.mjs      share image renderer
scripts/og/template.html     (or inline template string in the script)
scripts/verify/seo-gates.mjs dist-level gate: head tags per page, sitemap content, NAP parity, og size
public/robots.txt
public/og-image.jpg
lighthouserc.json            preview config (per-audit SEO)
lighthouserc.production.json production config (categories:seo error)
```

### Pattern 1: Single-source NAP
**What:** `business.ts` owns the phone digits derived from `WHATSAPP_NUMBER` (`'5516996111785'`): E.164 = `'+' + WHATSAPP_NUMBER`; display = `(16) 99611-1785` built by a formatter that slices digits 2-4, 4-9, 9-13. Footer renders the formatter output instead of the hard-coded literal; JSON-LD uses E.164. Same for e-mail and name. Note `whatsapp.ts` imports `form-schema.ts`; `business.ts` should import only the constant (import cycle risk is nil since `whatsapp.ts` does not import business).
**Example:**
```typescript
// Source: project convention, derived from src/lib/whatsapp.ts
import { WHATSAPP_NUMBER } from './whatsapp.ts';

export const BUSINESS = {
  name: 'Dmarques Desenvolvimento Web',
  shortName: 'Dmarques',
  url: 'https://agenciadmarques.com.br/',
  email: 'contato@agenciadmarques.com.br',
  locality: 'Ibitinga',
  region: 'SP',
  country: 'BR',
} as const;

export const phoneE164 = `+${WHATSAPP_NUMBER}`;

export function phoneDisplay(): string {
  const d = WHATSAPP_NUMBER.slice(2);
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
```

### Pattern 2: JSON-LD emission (CSP-neutral, injection-safe)
**What:** Build a plain object, `JSON.stringify`, escape `<` to `<` (and U+2028/2029), emit with `set:html`. In Astro, a `<script>` with a non-JS `type` is not bundled/processed (left as inline data). [CITED: docs.astro.build/en/guides/client-side-scripts/ — `type`/attributes other than `src` imply is:inline] [ASSUMED for exact attribute handling; verify in the built HTML in a Wave 0 check]
```astro
---
const json = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
---
{jsonLd && <script type="application/ld+json" set:html={json} />}
```
Recommended graph shape (emit on home only; the only indexable page with business meaning):
```json
{
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "LocalBusiness"],
  "@id": "https://agenciadmarques.com.br/#organization",
  "name": "Dmarques Desenvolvimento Web",
  "url": "https://agenciadmarques.com.br/",
  "image": "https://agenciadmarques.com.br/og-image.jpg",
  "logo": "https://agenciadmarques.com.br/<absolute simbolo URL>",
  "telephone": "+5516996111785",
  "email": "contato@agenciadmarques.com.br",
  "address": {"@type": "PostalAddress", "addressLocality": "Ibitinga", "addressRegion": "SP", "addressCountry": "BR"},
  "areaServed": [{"@type": "City", "name": "Ibitinga"}, {"@type": "City", "name": "Araraquara"}, {"@type": "City", "name": "Matão"}, {"@type": "City", "name": "Itápolis"}, {"@type": "City", "name": "Iacanga"}, {"@type": "City", "name": "Bauru"}],
  "founder": {"@type": "Person", "name": "Felipe Salles"},
  "sameAs": ["https://www.instagram.com/agenciadmarques/", "https://share.google/5cU7xCYeXu5uWD9Yq"],
  "openingHoursSpecification": [
    {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "07:00", "closes": "19:00"},
    {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00"}
  ]
}
```
Notes: `logo`/`image` absolute URL. Simplest stable choice: `image` = `/og-image.jpg` (static, public/); `logo` = absolute URL of the symbol through `getImage({ src: simbolo, format: 'png', width: 512 })` + `new URL(img.src, Astro.site)` (291x269 source exceeds Google's 112x112 minimum; width upscale not wanted, use native width). Alternative: copy a `public/logo.png`. Either is acceptable (Claude's discretion). [ASSUMED: Google logo guidance of >= 112x112 px, from training; confirm in Rich Results Test]. `areaServed` as `City` objects is valid schema.org. Omit `priceRange` (D-07), CNPJ (D-08), street (D-02). Google does not require `address.streetAddress` for a service-area business in the Rich Results Test (LocalBusiness lists `name` and `address` as required/recommended; verify manually, see Open Questions).

### Pattern 3: BaseLayout head
Compute once: `const canonical = noindex ? undefined : new URL(Astro.url.pathname, Astro.site).href`. Emit `og:type=website`, `og:locale=pt_BR`, `og:site_name`, `og:title`, `og:description`, `og:url` (= canonical or page URL), `og:image` (absolute), `og:image:width=1200`, `og:image:height=630`, `og:image:alt`, `og:image:type=image/jpeg`, `twitter:card=summary_large_image`, `twitter:title/description/image/image:alt`. `<meta name="theme-color" content="#070A14">` (tokens: `--color-bg: #070a14`). Default `title`/`description` props in BaseLayout currently hold the old generic copy ("Dmarques — Soluções Web"); replace with the D-14/D-15 strings so home and any page lacking props are correct. Home `index.astro` currently passes no props, so it relies on those defaults.

### Pattern 4: Sitemap with filter
```js
// Source: docs.astro.build sitemap integration guide (filter) + package source dist/index.js (STATUS_CODE_PAGES = {"404","500"})
import sitemap from '@astrojs/sitemap';

integrations: [
  sitemap({
    filter: (page) => {
      const { pathname } = new URL(page);
      return pathname !== '/obrigado/' && !pathname.startsWith('/erro-envio/');
    },
  }),
],
```
`filter` receives the full URL, which includes a trailing slash with default Astro settings (use `startsWith`/regex to tolerate both). The 404 page is dropped by default. Output: `dist/client/sitemap-index.xml` (references `sitemap-0.xml`). `robots.txt` must therefore point to `https://agenciadmarques.com.br/sitemap-index.xml`. The `/api/orcamento` endpoint is on-demand and is not listed. After the filter the sitemap contains only `/`; that is correct and expected. `erro-envio/[motivo]` uses `getStaticPaths`, so those three pages ARE prerendered and WOULD be listed without the filter.
`public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://agenciadmarques.com.br/sitemap-index.xml
```
Do not `Disallow` the noindex pages in robots.txt: a disallowed URL cannot be crawled, so crawlers never see the `noindex` meta. Keep them crawlable + `noindex`.

### Pattern 5: Share image generation (D-12)
- `launchBrowser()` and `startStaticServer()` already exist in `scripts/verify/static-server.mjs`; `STATIC_DIR` resolves `.vercel/output/static` then `dist`. Build output here is `dist/client/` (contains `_astro/fonts/*.woff2`, five files).
- Fonts: the Fonts API emits `@font-face` rules inline in built HTML with `url(/_astro/fonts/<hash>.woff2)` (verified: the home page contains "Sora" once and the check script counts `@font-face` blocks). The script should read `STATIC_DIR/index.html`, extract the `@font-face` blocks for `Sora` (600) and `Inter Tight`, and either serve the template through `startStaticServer()` pointing at those urls, or base64-embed. Zero new dependency, always the same bytes as production.
- Aurora: reproduce with layered `radial-gradient` in the template using the token values (`--aurora-cyan #00c8ff`, `--aurora-blue #3a5bff`, `--aurora-indigo #0e1e5b`, bg `#070a14`); inspect `src/components/Aurora.astro` for the exact composition. Do not include the grain SVG (bloats JPEG).
- Logos: `src/assets/brand/simbolo.png` (291x269) and `logotipo.png` (895x204) as data URIs.
- Layout: viewport 1200x630, `deviceScaleFactor: 1` (output must be exactly 1200x630), content centred inside the central ~630x630 square (WhatsApp crops to square). Headline exactly "Software sob medida, com acabamento de produto." in Sora 600, accent word styled as in `Words accentFrom={4}`.
- Output: `sharp(png).jpeg({ quality: 82, mozjpeg: true })` to `public/og-image.jpg`; script asserts `size < 300*1024` and dimensions 1200x630, lowering quality stepwise (e.g. 82 -> 70) until it fits. A dark gradient JPEG should land well below 300 KB. PNG would likely exceed the budget with smooth gradients; use JPEG (supported by Facebook, WhatsApp, LinkedIn, X).
- Social crawlers cache by URL; if the image changes after first share, either rename or accept stale caches (document; optional `?v=` is not needed for a first release).
- Add a `package.json` script `og:generate` (name at planner's discretion). Never run in CI or at build: the image is a committed artifact.

### Anti-Patterns to Avoid
- **Hard-coding the phone string in JSON-LD and footer separately** (violates SEO-08 single-sourcing).
- **`Disallow` for noindex pages** in robots.txt.
- **Canonical on noindex pages** (contradictory signals); omit canonical when `noindex`.
- **Using `Astro.url` for canonical host**: on previews it is the preview host; use `Astro.site` as base so canonical is always the production origin.
- **String-concatenated JSON-LD**: use `JSON.stringify` only.
- **Adding hours to the footer** (rejected by D-06).
- **Comments in code** (D-17), including test files and the OG script.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| sitemap XML | custom `sitemap.xml.ts` endpoint | `@astrojs/sitemap` | Requirement + handles index, escaping, `site` |
| JSON escaping in script | regex-built JSON string | `JSON.stringify` + `<` escape | Prevents `</script>` break-out |
| Image compression | manual canvas/PNG tuning | `sharp` (mozjpeg) | Already installed |
| Font acquisition for the OG image | downloading TTFs from CDN | built woff2 from the Fonts API output | Same files as production, no third-party fetch |
| Phone formatting drift | two literals | one `business.ts` | SEO-08 |

**Key insight:** every value that appears twice (name, phone, e-mail, area, URL) must have exactly one definition; tests then assert parity against the BUILT HTML, not against source.

## Runtime State Inventory

Not a rename phase in the strict sense, but D-01 renames the visible brand name in one place. Check:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None: no database (leads are e-mailed, not stored). | None |
| Live service config | Google Business Profile already named "Dmarques Desenvolvimento Web" (source of truth). Resend `from` display name "Site Dmarques" unaffected. | None |
| OS-registered state | None | None |
| Secrets/env vars | None reference the brand string | None |
| Build artifacts | `dist/` holds stale copies of the old footer string until rebuilt; `src/content` strings should be grepped for "Soluções Web" | Code edit; grep `Soluções Web` across `src/`, `README.md`, `docs/` and `.planning` (docs optional) |

Code occurrences to fix: `SiteFooter.astro:39` (`© {year} Dmarques Soluções Web`), BaseLayout default title (`Dmarques — Soluções Web`). CLAUDE.md/PROJECT.md keep prose "Dmarques Soluções Web"; note official name only.

## Common Pitfalls

### Pitfall 1: LHCI SEO category cannot pass on previews
**What goes wrong:** `categories:seo >= 0.95` fails on Vercel preview because `X-Robots-Tag: noindex` fails `is-crawlable` (weight ~4 of ~14), capping the score near ~0.7 even if everything else is perfect. Previously measured 0.45 (STATE.md, with the then-missing description/robots.txt).
**Why:** Deployment Protection injects the header; the bypass header does not remove it.
**How to avoid:** Two configs. Preview job (existing workflow, `lighthouserc.json`): remove `categories:seo`, add per-audit assertions at `error`: `document-title`, `meta-description`, `http-status-code`, `link-text`, `crawlable-anchors`, `robots-txt`, `image-alt`, `canonical`, `hreflang`, `viewport`, `font-size`, `tap-targets` (use `minScore: 1`), and `is-crawlable: off`. Production job (new job in `.github/workflows/lighthouse.yml`, or a new workflow on `deployment_status` with `environment == 'Production'`, or `workflow_dispatch` + schedule): `treosh/lighthouse-ci-action@v12` against `https://agenciadmarques.com.br/` with `categories:seo` error >= 0.95 plus the other three categories. Production needs no bypass header. A production-only job cannot block a merge; document that it is a post-deploy gate and that SEC-07 item 6 for this phase must be run (or pasted) against production.
**Warning signs:** SEO ~0.7-0.9 with only `is-crawlable` failing on preview.
[VERIFIED: codebase lighthouserc.json + workflow; production headers checked via curl 2026-10-17: no X-Robots-Tag]

### Pitfall 2: sitemap lists noindex pages
**What goes wrong:** `/obrigado` and `/erro-envio/*` are prerendered and the integration does not read robots meta, so they appear in the sitemap.
**How to avoid:** `filter` (above) + `scripts/verify/seo-gates.mjs` asserting the sitemap contains only `/`. [VERIFIED: package source; docs say all pages included by default]

### Pitfall 3: canonical relative or on preview host
**How to avoid:** build with `new URL(path, Astro.site)`; test asserts every indexable page's canonical starts with `https://agenciadmarques.com.br/`. Lighthouse `canonical` audit on a non-root page pointing to the root fails, so only home needs it set to root; each page canonical must be its own URL.

### Pitfall 4: description length and og duplication
Meta description ~150 chars; Google may truncate near 155-160. D-15 text is ~146 characters; assert 120-160 in the test, and assert it contains `Ibitinga`, `sites`, `sistemas`, `automações`.

### Pitfall 5: social image fetch
`og:image` must be absolute https, served `200` with an image content type, no redirect; Vercel serves `public/` files directly. Non-ASCII chars are fine in alt text. WhatsApp ignores images > ~300 KB sometimes, which is why the budget exists.

### Pitfall 6: JSON-LD vs SEC-07 inline check
`scripts/security-check.sh` check 3 counts `<script>` without `src` (informational) and only FAILS on residual inline `<style>`; a JSON-LD script does not trip it. The `is:inline` theme script already exists, so the count is already non-zero. Verified by reading the script. When Phase 7 adds `security.csp`, data blocks (`type="application/ld+json"`) are not executed and are not subject to `script-src`, but Astro's CSP hashing may still list them if it hashes inline scripts; either outcome is harmless. [CITED: Content Security Policy spec — script-src governs script execution; data blocks are not executed] [ASSUMED for Astro hash behaviour]

### Pitfall 7: Rich Results Test is a manual, external step
Google's tool at search.google.com/test/rich-results validates supported types (LocalBusiness is supported as "Local business"); `ProfessionalService` multi-type is accepted since it is a LocalBusiness subtype. It cannot be run from CI without scraping. Plan a human-verify checkpoint (paste production URL or code snippet) and also validate with schema.org validator (validator.schema.org) as a second opinion. No automatable gate; add a local structural test instead (required keys present, E.164 regex `^\+[1-9]\d{10,14}$`).

### Pitfall 8: Trailing slash mismatch
Sitemap URLs carry trailing slashes with Astro defaults; canonical built from `Astro.url.pathname` (`/` for home) matches. For `/404`, skip canonical (page returns 404 status).

### Pitfall 9: GBP shortlink in `sameAs`
See Open Questions.

## Code Examples

### Dist-level SEO gate (node:test or script)
```javascript
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const html = readFileSync(join(process.env.STATIC_DIR ?? 'dist/client', 'index.html'), 'utf8');
const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const footerPhone = html.match(/\(16\) 99611-1785/);
const digits = ld.telephone.replace(/\D/g, '');
const footerDigits = footerPhone[0].replace(/\D/g, '');
if (digits !== `55${footerDigits}`) throw new Error('NAP divergente');
```
Run after `pnpm build`, in the style of `scripts/verify/aurora-gates.mjs` (which resolves `STATIC_DIR` the same way).

### Head tags (illustrative)
```astro
<link rel="canonical" href={canonical} />
<meta property="og:image" content={ogImageUrl} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#070A14" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `experimental.csp` | `security.csp` | Astro 6 | Phase 7 only |
| Google+ Local `sameAs` | GBP URL in `sameAs` / `hasMap` | ongoing | use GBP link |
| FAQPage rich result | Google restricted FAQ rich results to authoritative gov/health sites (Aug 2023) | 2023 | consistent with SEO-07 drop [ASSUMED from training] |

**Deprecated/outdated:** `<meta name="keywords">` (ignored; do not add).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Astro leaves `<script type="application/ld+json" set:html>` unprocessed (data block) | Pattern 2 | Low: verify with built HTML in Wave 0 test |
| A2 | Rich Results Test does not require `streetAddress` for LocalBusiness with `areaServed` | Pattern 2 | Medium: a warning could appear; city-only address is locked (D-02), so expect non-blocking "recommended field" warnings |
| A3 | Logo minimum 112x112 for Google | Pattern 2 | Low: symbol is 291x269 |
| A4 | Astro CSP auto-hash behaviour on ld+json blocks | Pitfall 6 | Low: Phase 7 concern |
| A5 | slopcheck not run for `@astrojs/sitemap` | Package Audit | Low: official package |
| A6 | `is-crawlable` weight ~4 and category math (~0.7 cap) | Pitfall 1 | Low: only affects expected score numbers; STATE.md measured 0.45 earlier |
| A7 | Google FAQ rich results restriction | State of Art | None (SEO-07 already dropped) |

## Open Questions

1. **Canonical GBP URL for `sameAs` (D-05)**
   - Known: `https://share.google/5cU7xCYeXu5uWD9Yq` returns 302 to `https://www.google.com/share.google?q=5cU7xCYeXu5uWD9Yq` and ultimately to a Google Search result for "Dmarques Desenvolvimento Web" with `kgmid=/g/11zyld6fyl` (the business knowledge-panel entity), i.e. it resolves to the GBP/knowledge panel, not to a Maps place. No `cid=` or `g.page` appears. Web search found no official Google statement on `cid` in `sameAs`/`hasMap`.
   - Unclear: the Maps CID or `maps.app.goo.gl` link (needs the GBP "Compartilhar" action by Felipe).
   - Recommendation: keep `share.google/...` as locked (it identifies the same entity; schema.org `sameAs` only requires an unambiguous URL). Optionally add `hasMap` later with a `maps.app.goo.gl` link copied from the GBP. Do not fabricate a CID. Alternative acceptable value if the shortlink ever breaks: `https://www.google.com/search?kgmid=/g/11zyld6fyl` (MEDIUM/LOW confidence, not verified as stable).

2. **Production LHCI trigger**
   - Recommend `workflow_dispatch` + `deployment_status` with `environment == 'Production'` calling `treosh/lighthouse-ci-action@v12` with `lighthouserc.production.json`. Planner to choose; must not break the existing preview job (`if` currently requires `Preview`).

3. **Secondary page titles**: proposals: 404 "Página não encontrada | Dmarques", obrigado "Pedido enviado | Dmarques", erro-envio "Não foi possível enviar | Dmarques". Existing use em dash ("— Dmarques"); D-14 uses a pipe on home. Either acceptable; keep one separator consistently (recommend pipe to match home, or update home to... D-14 is locked with pipe).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node / pnpm | build, tests | yes | engines >=22.18, pnpm 11.15.1 | — |
| Playwright Chromium | OG script | yes (devDep 1.64.1; `launchBrowser` falls back to system Chrome) | 1.64.1 | `channel: 'chrome'` |
| sharp | OG script | yes | 0.35.5 | — |
| curl / jq | CI scripts | yes | — | — |
| Google Rich Results Test | SEO-06 validation | external web tool | — | schema.org validator; manual step |
| Production site | LHCI production job | yes (200, no X-Robots-Tag; /robots.txt currently 404) | — | — |

**Missing with no fallback:** none.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (`pnpm test` = `node --test "src/**/*.test.mjs"`) + dist-level scripts under `scripts/verify/` |
| Config file | none (package.json scripts) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm build && node scripts/verify/seo-gates.mjs && pnpm verify:gates && bash scripts/security-check.sh` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEO-01 | home title/description present, description 120-160 chars with Ibitinga/sites/sistemas/automações, canonical absolute `https://agenciadmarques.com.br/` | dist | `node scripts/verify/seo-gates.mjs` | Wave 0 |
| SEO-01 | noindex pages have no canonical | dist | same | Wave 0 |
| SEO-03 | og:* and twitter:* complete; `og:image` absolute; file 1200x630 and < 300 KB | dist | same (sharp metadata) | Wave 0 |
| SEO-04 | `sitemap-index.xml` and `sitemap-0.xml` exist; contain `/` only; no `/obrigado`, `/erro-envio`, `/404`; robots.txt allow-all + sitemap line | dist | same | Wave 0 |
| SEO-05 | theme-color `#070A14`, icon links resolve to existing files | dist | same | Wave 0 |
| SEO-06 | JSON-LD parses; `@type` equals the two types; E.164 regex; address SP/BR; 6 `City` entries; `sameAs` contains Instagram; `founder.name` | unit + dist | `pnpm test` (`src/lib/seo.test.mjs`) | Wave 0 |
| SEO-06 | Google Rich Results Test passes | manual | human-verify checkpoint against production | manual-only (no public API) |
| SEO-08 | footer phone/e-mail/name derive from same source; digits parity footer vs JSON-LD in built HTML | dist | `seo-gates.mjs` | Wave 0 |
| Lighthouse | mobile >= 95 four categories; SEO via production job | CI | LHCI preview + production | config edit |
| SEC-07 | checklist run | script + manual | `bash scripts/security-check.sh`, write `.planning/security/runs/phase-06.md` | script exists |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm build` then `node scripts/verify/seo-gates.mjs`
- **Phase gate:** full suite green, Rich Results Test manual pass, production LHCI >= 0.95, SEC-07 run with no open High

### Wave 0 Gaps
- [ ] `src/lib/seo.test.mjs` and `src/lib/business.ts` / `json-ld.ts`
- [ ] `scripts/verify/seo-gates.mjs`
- [ ] `lighthouserc.production.json` and workflow job
- [ ] `public/robots.txt`, `public/og-image.jpg` (generated)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation / Output Encoding | yes | JSON-LD built from constants only; `JSON.stringify` + `<` escape; no user input reaches head |
| V6 Cryptography | no | — |
| V14 Config | yes | no secrets in static output (security-check item 4); robots.txt must not enumerate private paths |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Script break-out via `</script>` in JSON-LD | Tampering | escape `<` as `<` |
| Information disclosure through sitemap/robots | Info disclosure | sitemap lists only `/`; robots has no private paths; `/api/orcamento` not listed |
| Misleading preview indexing | Spoofing/SEO | previews keep platform `noindex`; canonical always production origin |
| Supply chain (new dep) | Tampering | exact pin 3.7.4, `pnpm audit` clean, justify dep in phase notes (SEC-07 judgement item) |
| Unintended third-party fetch in OG script | Info disclosure | fonts from built output, no CDN |

SEC-07 phase-specific additions to append: (a) JSON-LD contains no field derived from request data; (b) sitemap excludes noindex pages; (c) `@astrojs/sitemap` justified as build-time only (no client JS; `js-weight-check` unaffected).

## Project Constraints (from CLAUDE.md)
- Astro static + `@astrojs/vercel`; no heavy UI framework; no new runtime JS (D-19).
- Lighthouse >= 95 all categories; fonts via Fonts API (self-hosted); images via `astro:assets` where processed; `public/` for the static share image and favicons.
- Security: CSP is Phase 7; no secret in client bundle; `pnpm audit` clean; exact version pins.
- pt-BR only; zero comments in versioned files (user memory + D-17).
- GSD workflow: edits go through GSD commands.
- Respond to the user in pt-BR (Felipe).

## Sources

### Primary (HIGH confidence)
- Codebase: `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/components/SiteFooter.astro`, `src/lib/whatsapp.ts`, `lighthouserc.json`, `.github/workflows/lighthouse.yml`, `scripts/security-check.sh`, `scripts/capture-site.mjs`, `scripts/verify/static-server.mjs`, `package.json`, `vercel.json`, `public/`
- npm registry: `@astrojs/sitemap` 3.7.4 (deps, no postinstall, publish date 2026-08-31)
- `@astrojs/sitemap@3.7.4` package tarball source `dist/index.js` (`STATUS_CODE_PAGES = {"404","500"}`; no noindex handling)
- https://docs.astro.build/en/guides/integrations-guide/sitemap/ (filter, customPages, serialize)
- curl checks 2026-10-17: production headers (no X-Robots-Tag, 200) and `/robots.txt` 404; `share.google` shortlink redirect chain

### Secondary (MEDIUM confidence)
- Web search on `hasMap`/`sameAs` (third-party SEO blogs; no official statement on `cid`)

### Tertiary (LOW confidence)
- Google logo size and Rich Results field requirements from training knowledge (A2, A3)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, one new official package verified
- Architecture: HIGH, based on inspected code
- Pitfalls: HIGH for sitemap/LHCI/robots; MEDIUM for Rich Results details
- GBP URL: MEDIUM (resolved to knowledge panel, no Maps CID)

**Research date:** 2026-10-17
**Valid until:** 2026-11-17
