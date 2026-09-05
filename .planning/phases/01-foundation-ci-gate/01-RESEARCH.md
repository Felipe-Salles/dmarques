# Phase 1: Foundation & CI Gate - Research

**Researched:** 2026-09-05
**Domain:** Astro 7 static scaffold + Vercel deploy pipeline + GitHub Actions quality/security gates
**Confidence:** HIGH for stack versions and Astro config mechanics (npm registry + official docs verified); MEDIUM for the Lighthouse-CI-vs-preview mechanics and the Vercel hardening steps (official docs verified, but plan-vs-plan behaviour and CI wiring are judgement calls); MEDIUM for design-token values (derived from the design file, not a spec).

## Summary

Phase 1 is almost entirely *wiring*, not application code. The stack is locked by `CLAUDE.md`; this research fills the implementation-mechanics gaps: the exact `astro.config.mjs` shape, how the "one reserved serverless function" is (not) expressed when no route exists yet, the `astro:env` secret-schema syntax, the stable Fonts API `<Font>` usage and `preload` targeting, and — the genuinely hard part — how to run a merge-blocking Lighthouse mobile gate when Vercel Deployment Protection sits in front of every preview URL.

The single biggest decision the planner must surface to Felipe: **Vercel Spend Management (a configurable USD hard cap + auto-pause + usage alerts) is a Pro-plan feature.** On the Hobby (free) plan there is no configurable cap and no auto-pause; the "hard cap" is structural (no payment method on file → spend physically cannot exceed $0, and Hobby projects auto-pause when the free-tier ceiling is hit). INFRA-10 / success-criterion 2 says "hard spend cap with usage alerts" — that is satisfiable on Hobby only by that structural interpretation. If Felipe wants graceful degradation under a flood (form endpoint off, site still served) with a named dollar figure, that needs Pro ($20/mo) + Spend Management. This ties directly to the SEC-08 residual-risk statement, which lists "spend cap with alerts" as a compensating control.

**Primary recommendation:** Scaffold with `pnpm create astro` (minimal, strict TS), add `@astrojs/vercel` with `output: 'static'` and `build.inlineStylesheets: 'never'`, declare `RESEND_API_KEY` in `env.schema` (no value needed yet), wire the stable Fonts API for Outfit + DM Sans with `preload` on one weight per family, and split CI into a fast `pull_request` job (astro check, build, `pnpm audit`, Dependency Review, deterministic JS-weight gate) plus a Lighthouse job that runs against the **real Vercel preview URL** using an `x-vercel-protection-bypass` header. Ship `scripts/security-check.sh` as the single source of truth for the mechanical SEC-07 checks, called identically by CI and by humans.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Git host is GitHub. Repo is **public** (free-plan branch protection + Dependency Review). No secrets in code — all server secrets are Vercel env vars.
- **D-02:** Production branch is **`main`**. Rename local `master` → `main` before first push.
- **D-03:** Claude creates the remote repo via `gh` CLI (account `Felipe-Salles`), pushes, and walks Felipe through Vercel-dashboard steps (project link, env vars, Deployment Protection, spend cap). Claude asks approval before each irreversible action (repo creation, first push, branch rename).
- **D-04 (project-wide):** **Zero comments in any version-controlled file** — `.astro`, `.ts`, `.js`, `.mjs`, `.css`, `.json`, YAML, CI workflows, `vercel.json`, everything. Rationale goes in `.planning/` or README, never inline.
- **D-05:** Analytics ships in Phase 1, in `BaseLayout`, so the CI JS-weight budget and Lighthouse gate measure the real production script from day one.
- **D-06:** Analytics tool is **Vercel Web Analytics** (`@vercel/analytics` 2.x): cookieless, same-origin beacon (`/_vercel/insights/*`), no new CSP origin, no consent banner. Use the Astro component/script include, **not** the adapter's legacy `webAnalytics` option.
- **D-07:** **No** Vercel Speed Insights in Phase 1.
- **D-08:** End-of-phase root page is a **minimal placeholder**: `BaseLayout` + `<main>` with an `<h1>` and the Core Value tagline, using the design tokens, self-hosted fonts, dark background `#0A0A12`. No header/nav/footer, no "coming soon" page.
- **D-09:** Real domain stays closed to the public during Phases 1–7; only the Deployment-Protection-gated preview URL is used.
- **D-10:** SEC-07 artifact layout = **template + per-phase run**: `.planning/security/SECURITY-CHECKLIST.md` (gabarito) + `.planning/security/runs/phase-NN.md` (dated runs). Repo-only.
- **D-11:** Mechanical checks are a single script `scripts/security-check.sh` (pnpm audit, inline-surface grep, `curl -I` headers, `dist/` secret scan, single-Function count, Lighthouse gate) printing PASS/FAIL. **CI runs the same script.** The run file appends script output and answers judgement-only items by hand.
- **D-12:** Findings table with fixed owner: ID, description, severity (Low/Med/High), status, action, target date. Owner defaults to **Felipe Salles**. Hard rule "no phase closes with an open High finding" at the top of the gabarito.
- **D-13:** Phase 1 gabarito implements **exactly the SEC-07 item list from REQUIREMENTS.md**. Later phases append phase-specific items.

### Claude's Discretion

- Exact pinned versions (follow the `CLAUDE.md` Technology Stack table).
- Lighthouse CI against the live Vercel preview URL vs a local `astro preview` server (Deployment Protection can block an external runner — factor this in).
- Scope/shape of the design-token file beyond the confirmed palette + font families + `font-display` + fallback metrics (spacing scale, radii, shadows, type scale, z-index, light/dark section tokens).
- `pnpm` vs `npm` — default to `pnpm`, commit `pnpm-lock.yaml`, unless Felipe asks otherwise.
- CI provider mechanics (GitHub Actions assumed), job matrix, caching.
- Exact spend-cap amount and env-var grouping (confirm the number with Felipe during execution).

### Deferred Ideas (OUT OF SCOPE for Phase 1)

- Skeleton header/nav/footer shells → Phase 3.
- "Em breve" holding page → skipped (D-09).
- Vercel Speed Insights → post-launch.
- DNS TTL lowering / Resend SPF·DKIM·DMARC on `agenciadmarques.com.br` → Phase 5 (SEC-08/SEC-09).
- Domain cutover (point domain at Vercel) → after Phase 7, at v1 approval.
- Re-scoping the `gh` token with `workflow` → a setup prerequisite handled during execution, not a scope change.
- The 9 design sections (Phase 3), content collections (Phase 2), form markup/endpoint (Phase 5), strict CSP + full security-header set (Phase 7), SEO metadata / structured data / favicons / OG image (Phase 6), progressive-enhancement effects (Phase 4).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Astro 7 `output: 'static'` + `@astrojs/vercel`; all pages prerendered except the form endpoint | `astro.config.mjs` shape below; "one reserved function" clarified in Pitfall 1 — with **no** `prerender = false` route the adapter builds a pure-static site and `.vercel/output/functions/` is empty; that is the correct Phase-1 end state |
| INFRA-02 | `pnpm dev` and `pnpm build` work with one command each | `package.json` scripts; Node 24 / pnpm pinned via `packageManager` field |
| INFRA-03 | Outfit + DM Sans self-hosted (Astro Fonts API / Fontsource); zero Google Fonts requests in prod | Stable `fonts` config + `<Font>` from `astro:assets`; verification greps below |
| INFRA-04 | Design tokens (colors, fonts, radii, shadows) as CSS custom properties in one file, consumed by all components | `src/styles/tokens.css` + `:root` skeleton in Code Examples; imported once in `BaseLayout` |
| INFRA-05 | `build.inlineStylesheets: 'never'` — all CSS as external files | One config line; default is `'auto'`, verified values `'always'\|'auto'\|'never'` |
| INFRA-06 | Server secrets via `astro:env` (`context: 'server', access: 'secret'`); `RESEND_API_KEY` never in client bundle | `envField.string({ context: 'server', access: 'secret' })`; secrets are never in the final bundle (verified in docs); CI secret-scan proves it |
| INFRA-07 | Vercel continuous deploy via Git integration; preview deploy per PR | Vercel Git integration (Felipe links project in dashboard); preview-per-push is default |
| INFRA-08 | CI runs `astro check`, build, `pnpm audit`, Dependency Review; blocks merge on failure | `pull_request` workflow + branch protection required status checks |
| INFRA-09 | Lighthouse CI (mobile preset, 4x CPU, Slow 4G) ≥95 in Perf/SEO/Best-Practices/A11y against the preview | `lighthouserc` + preview-URL run with bypass header; mobile is the Lighthouse **default** (no `preset` needed) |
| INFRA-10 | Vercel account/repo hardened — 2FA, protected production branch, Deployment Protection on previews, spend cap + usage alerts | Split into "Claude via gh CLI" and "Felipe in dashboard" below; **spend cap caveat: Pro-only feature** (Assumption A1) |
| PERF-01 | Lighthouse ≥95 all four categories, mobile 4x CPU Slow 4G, measured in CI per PR | Same as INFRA-09 |
| PERF-02 | Web Vitals budgets: LCP <2.5 s, CLS <0.05, TBT <200 ms, INP <200 ms | `lighthouserc` audit assertions; **INP has no Lighthouse lab audit** — assert `total-blocking-time` as the lab proxy and monitor INP as a field metric (Assumption A2) |
| PERF-03 | Landing-route JS weight <20 KB; no UI framework, no animation library | Deterministic `scripts/js-weight-check.sh` on the build output + Lighthouse `resource-summary:script:size` budget + dependency denylist grep |
| PERF-04 | `font-display: swap` + metrics-adjusted fallback (no CLS); two critical families/weights `preload` | Fonts API `display: 'swap'`, `optimizedFallbacks: true`, `<Font preload>` on one weight per family |
| SEC-07 | Versioned security-review checklist in `.planning/`, run each phase; no phase closes with an open High finding | Gabarito + run-file layout (D-10..D-13); `scripts/security-check.sh` spec below; exact SEC-07 item list is the Phase-1 gabarito content |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page HTML for the landing route | Build (Astro SSG) | CDN / Static (Vercel edge) | `output: 'static'` prerenders to immutable HTML; served from Vercel's CDN |
| Reserved form endpoint boundary | API / Serverless Function (Vercel) | — | Only route that will opt out of prerender (Phase 5); Phase 1 configures the adapter, adds no route |
| Server secret storage | CI / Vercel env vars | Build (`astro:env` schema = the contract) | `RESEND_API_KEY` lives in Vercel env + GitHub Actions secrets; the schema only declares shape/context, never a value |
| Self-hosted fonts | Build (Fonts API downloads + rewrites `@font-face`) | CDN / Static (same-origin `/_astro/` font files) | Removes the third-party `fonts.googleapis.com` / `fonts.gstatic.com` origins entirely |
| Design tokens | Build (one CSS file emitted as external asset) | Browser (CSS custom properties resolved at render) | `build.inlineStylesheets: 'never'` forces an external file |
| Analytics beacon | CDN / Static (same-origin `/_vercel/insights/*`, injected by Vercel) | Browser (tiny bootstrap script) | No new origin, no cookies; script + beacon are same-origin on Vercel only |
| Quality/security gates | CI (GitHub Actions) | Build (produces the artifact the gates inspect) | `astro check`, build, `pnpm audit`, Dependency Review, JS-weight, Lighthouse |
| Deploy pipeline | CDN / Static (Vercel Git integration) | CI (branch protection gates the merge that triggers the production deploy) | Vercel builds on push; GitHub gates which pushes reach `main` |
| Account/repo hardening | External dashboards (GitHub + Vercel) | CI (branch protection API is scriptable via `gh`) | 2FA, Deployment Protection, spend cap are dashboard-only; branch protection is `gh api` |

## Standard Stack

All versions verified against the npm registry on 2026-09-05. Local machine already has **Node 24.14.0, npm 11.13.0, pnpm 11.15.1**.

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | `7.3.1` | SSG; `output: 'static'` | `[VERIFIED: npm registry]` `engines.node >=22.12.0`; locked by `CLAUDE.md` |
| `@astrojs/vercel` | `11.0.10` | Vercel adapter (peer `astro@^7`) | `[VERIFIED: npm registry]` reserves the future function boundary; emits CSP as `<meta>` on static pages |
| `@astrojs/check` + `typescript` | check `~0.9`, ts `5.x` | `astro check` type-gate | Required for the `astro check` CI step; pulls the `astro:env` virtual types via `astro sync` |
| `@vercel/analytics` | `2.0.1` | Cookieless analytics in `BaseLayout` (D-05/D-06) | `[VERIFIED: npm registry]` same-origin beacon; use `inject()` in a bundled `<script>` (see Pitfall 6) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@fontsource-variable/outfit` | `5.3.0` | Local fallback for the Fonts API fontsource provider | `[VERIFIED: npm registry]` install as `devDependency`; only strictly needed if the Fonts API's remote fetch misbehaves in CI (Alternatives below) |
| `@fontsource/dm-sans` | `5.3.0` | Same, for DM Sans | `[VERIFIED: npm registry]` |
| `@lhci/cli` | `0.15.1` | Lighthouse assertions in CI | `[VERIFIED: npm registry]` Lighthouse CI is still `0.x`; pair with `treosh/lighthouse-ci-action` |
| `sirv-cli` **or** `serve` **or** `http-server` | latest | Serve the built static output for the local Lighthouse fallback | `@astrojs/vercel` **disables `astro preview`** (see Pitfall 2) — need a plain static server if not testing the real preview URL |
| `@biomejs/biome` | `2.5.12` | Lint/format `.ts` `.js` `.json` `.css` | `[VERIFIED: npm registry]` `CLAUDE.md` tooling choice |
| `prettier` + `prettier-plugin-astro` | plugin `0.14.1` | Format `.astro` only | `[VERIFIED: npm registry]` scope Prettier to `**/*.astro` |

### NOT installed in Phase 1 (deferred)

| Library | Deferred to | Why |
|---------|-------------|-----|
| `resend` | Phase 5 | Only the `env.schema` key is declared now; the SDK ships with the endpoint |
| `zod` (explicit dep) | Phase 2 | Astro bundles Zod for content collections; no direct install needed until schemas exist |
| `@astrojs/sitemap` | Phase 6 | SEO phase owns `sitemap.xml` / `robots.txt` |
| `@upstash/ratelimit` / `@upstash/redis` | Phase 5 (open decision) | Rate-limiter choice not yet made |
| `unlighthouse` | optional, any time | Local full-site scans; not a gate |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Fonts API remote fontsource provider | `@fontsource-variable/outfit` + `@fontsource/dm-sans` imported in CSS + manual `<link rel="preload">` | Rock-solid offline; loses auto metrics-adjusted fallback generation (must hand-write `size-adjust`/`ascent-override`). Use only if the Fonts API's build-time fetch fails in CI. |
| Lighthouse against the real Vercel preview URL | Lighthouse against a local static server in the CI job | Local is deterministic and needs no bypass token, but the `/_vercel/insights/*` beacon 404s (dings Best-Practices/Perf) and you don't measure real edge Brotli/caching. See "Pitfall 3" and the recommendation below. |
| `pnpm` 11 (installed) | `pnpm` 9 (`CLAUDE.md` text) | pnpm 11 is fine; pin the exact version via `"packageManager": "pnpm@11.15.1"` and let `pnpm/action-setup` read it. Minor doc drift, not a blocker. |
| `treosh/lighthouse-ci-action` | raw `lhci autorun` in a `run:` step | The action handles Chrome install and result upload; raw `lhci` is fewer moving parts if you already have Chrome. Either works. |

**Installation:**

```bash
pnpm create astro@latest -- --template minimal --typescript strict
pnpm add @astrojs/vercel @vercel/analytics
pnpm add -D @astrojs/check typescript @fontsource-variable/outfit @fontsource/dm-sans @biomejs/biome prettier prettier-plugin-astro @lhci/cli sirv-cli
```

**Version verification performed (npm registry, 2026-09-05):** `astro@7.3.1` (`engines.node >=22.12.0`), `@astrojs/vercel@11.0.10`, `@vercel/analytics@2.0.1`, `@lhci/cli@0.15.1`, `@biomejs/biome@2.5.12`, `prettier-plugin-astro@0.14.1`, `@fontsource-variable/outfit@5.3.0`, `@fontsource/dm-sans@5.3.0`, `resend@6.26.0` (not installed), `unlighthouse@0.18.0` (not installed).

## Package Legitimacy Audit

slopcheck was **not available** in this session (`pip install slopcheck` not run; no network guarantee). Per protocol, packages that are not already ubiquitous, official Astro/Vercel packages are tagged `[ASSUMED]` and the planner should gate any non-obvious install behind a `checkpoint:human-verify` task. In practice every package below is either first-party (`@astrojs/*`, `@vercel/*`, `astro`) or a well-known OSS tool with millions of weekly downloads.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `astro` | npm | 4+ yrs | very high | github.com/withastro/astro | n/a | Approved (first-party framework) |
| `@astrojs/vercel` | npm | 3+ yrs | high | github.com/withastro/astro | n/a | Approved (first-party adapter) |
| `@astrojs/check` | npm | 2+ yrs | high | github.com/withastro/language-tools | n/a | Approved (first-party) |
| `@vercel/analytics` | npm | 3+ yrs | very high | github.com/vercel/analytics | n/a | Approved (first-party) |
| `@fontsource-variable/outfit` | npm | 2+ yrs | high | github.com/fontsource/font-files | n/a | Approved |
| `@fontsource/dm-sans` | npm | 4+ yrs | high | github.com/fontsource/font-files | n/a | Approved |
| `@lhci/cli` | npm | 5+ yrs | high | github.com/GoogleChrome/lighthouse-ci | n/a | Approved (Google) |
| `@biomejs/biome` | npm | 2+ yrs | very high | github.com/biomejs/biome | n/a | Approved |
| `prettier-plugin-astro` | npm | 3+ yrs | high | github.com/withastro/prettier-plugin-astro | n/a | Approved |
| `sirv-cli` | npm | 6+ yrs | very high | github.com/lukeed/sirv | n/a | Approved (or swap for `serve`) |

**Packages removed due to slopcheck [SLOP] verdict:** none (slopcheck unavailable).
**Packages flagged as suspicious [SUS]:** none.

**Node.js postinstall note:** run `pnpm view <pkg> scripts.postinstall` during execution for any package the planner is unsure about. `sharp` (pulled transitively by `astro:assets`) has a legitimate native-binary postinstall — expected.

## Architecture Patterns

### System Architecture Diagram

```
                          ┌─────────────────────────── GitHub (public repo) ───────────────────────────┐
   developer push ──────► │  branch: feature/*                                                          │
                          │       │                                                                    │
                          │       ▼   opens PR → main                                                   │
                          │  ┌──────────────────────── GitHub Actions: on pull_request ─────────────┐   │
                          │  │  setup (pnpm + Node 24, cache pnpm-lock.yaml)                        │   │
                          │  │  ├─ pnpm astro sync && pnpm astro check      ─┐                      │   │
                          │  │  ├─ pnpm build                                │ all must pass        │   │
                          │  │  ├─ pnpm audit --audit-level=high             │ = required status    │   │
                          │  │  ├─ actions/dependency-review-action          │   checks for         │   │
                          │  │  ├─ scripts/js-weight-check.sh (<20 KB gz)    │   branch protection  │   │
                          │  │  └─ scripts/security-check.sh (mechanical)   ─┘                      │   │
                          │  └─────────────────────────────────────────────────────────────────────┘   │
                          │  ┌──────────────── GitHub Actions: on deployment_status (Preview=success) ┐  │
                          │  │  treosh/lighthouse-ci-action                                          │  │
                          │  │    target = deployment_status.target_url                              │  │
                          │  │    extraHeaders: x-vercel-protection-bypass: <secret>                 │  │
                          │  │    assert categories ≥0.95 + LCP/CLS/TBT budgets  → required check    │  │
                          │  └──────────────────────────────────────────────────────────────────────┘  │
                          │       │ merge allowed only when every required check is green              │
                          └───────┼───────────────────────────────────────────────────────────────────┘
                                  │ push to main
                                  ▼
              ┌──────────────────────────── Vercel (Git integration) ────────────────────────────┐
              │  every push/PR → Preview deploy   (Deployment Protection: Vercel Authentication)  │
              │  push to main   → Production deploy (domain NOT attached during Phases 1–7)       │
              │  build: pnpm build → .vercel/output/{config.json, static/**}                      │
              │         (functions/ is EMPTY in Phase 1 — no prerender:false route yet)           │
              │  env vars (scoped Production+Preview): RESEND_API_KEY [added Phase 5],            │
              │            VERCEL_AUTOMATION_BYPASS_SECRET [auto, from Protection Bypass]          │
              └─────────────────────────────────────────────────────────────────────────────────┘
                                  │ serves
                                  ▼
   visitor ─────► immutable HTML from Vercel CDN  ──► same-origin /_vercel/insights/* beacon (no cookies)
                  self-hosted Outfit/DM Sans from /_astro/*.woff2 (zero Google Fonts requests)
```

### Recommended Project Structure

```
.
├── .github/workflows/
│   ├── ci.yml                 # on: pull_request — check, build, audit, dep-review, js-weight, security-check
│   └── lighthouse.yml         # on: deployment_status — LHCI vs the preview URL
├── .planning/security/
│   ├── SECURITY-CHECKLIST.md  # gabarito (template) — D-10/D-12/D-13
│   └── runs/
│       └── phase-01.md        # dated run: appended script output + hand-answered judgement items
├── scripts/
│   ├── security-check.sh      # single source of truth for mechanical SEC-07 checks (D-11)
│   └── js-weight-check.sh     # deterministic <20 KB gz landing-route JS gate (PERF-03)
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro   # <html lang="pt-BR">, <Font> preloads, tokens import, <Analytics>
│   ├── pages/
│   │   └── index.astro        # minimal placeholder: <main> + <h1> + Core Value tagline (D-08)
│   └── styles/
│       └── tokens.css         # the single design-token file (INFRA-04) — emitted external
├── astro.config.mjs
├── lighthouserc.json
├── vercel.json                # empty object {} in Phase 1 (success criterion 5)
├── biome.json
├── .prettierrc                # prettier-plugin-astro, scoped to *.astro
├── .nvmrc / "engines" + "packageManager" in package.json
├── .gitignore                 # node_modules, dist, .vercel, .astro, .lighthouseci
└── package.json
```

### Pattern 1: `astro.config.mjs` for Phase 1 (minimal — no CSP yet, CSP is Phase 7)

```js
// Source: https://docs.astro.build/en/guides/integrations-guide/vercel/
//         https://docs.astro.build/en/guides/environment-variables/
//         https://docs.astro.build/en/guides/fonts/
import { defineConfig, envField, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://agenciadmarques.com.br',
  output: 'static',
  adapter: vercel(),
  build: {
    inlineStylesheets: 'never',
  },
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Outfit',
      cssVariable: '--font-display',
      weights: [300, 400, 500, 600, 700, 800],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
      optimizedFallbacks: true,
      display: 'swap',
    },
    {
      provider: fontProviders.fontsource(),
      name: 'DM Sans',
      cssVariable: '--font-body',
      weights: [400, 500],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
      optimizedFallbacks: true,
      display: 'swap',
    },
  ],
});
```

Notes:
- **No `security.csp` block** — Phase 7 owns CSP. Adding it now would emit a `<meta http-equiv="content-security-policy">` on the placeholder page prematurely.
- `site` uses `agenciadmarques.com.br` (the real domain — `CLAUDE.md`'s `dmarques.com.br` is a stale hypothesis per CONTEXT `<code_context>`).
- `env.validateSecrets` left at default `false` so the build does **not** require `RESEND_API_KEY` to be present (nothing imports `astro:env/server` until Phase 5).

### Pattern 2: `BaseLayout.astro` (minimal)

```astro
---
// Source: https://docs.astro.build/en/reference/modules/astro-assets/
import { Font } from 'astro:assets';
import '../styles/tokens.css';
const { title = 'Dmarques — Soluções Web' } = Astro.props;
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <Font cssVariable="--font-display" preload={[{ weight: 700, style: 'normal' }]} />
    <Font cssVariable="--font-body" preload={[{ weight: 400, style: 'normal' }]} />
  </head>
  <body>
    <slot />
    <script>
      import { inject } from '@vercel/analytics';
      inject();
    </script>
  </body>
</html>
```

- `preload` accepts `boolean | { weight?, style?, subset? }[]`. Passing an array preloads **exactly** the matching file(s) — this is how PERF-04's "two critical files" is satisfied: Outfit 700 (headings) + DM Sans 400 (body). Everything else self-hosts but is not preloaded.
- The `<script>` is a module script; Astro bundles + hashes it, so it survives a future strict `script-src 'self'` (Phase 7). At implementation, verify whether `@vercel/analytics/astro` exports a first-class `<Analytics />` component in 2.0.1 — if so, prefer it; the `inject()` form is the guaranteed-portable fallback (Open Question 3).

### Pattern 3: Split CI — fast PR job + preview-URL Lighthouse job

**`.github/workflows/ci.yml`** (blocking, no deploy needed):

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm astro sync
      - run: pnpm astro check
      - run: pnpm build
      - run: pnpm audit --audit-level=high
      - run: bash scripts/js-weight-check.sh
      - run: bash scripts/security-check.sh --ci
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/dependency-review-action@v5
        with:
          fail-on-severity: high
          comment-summary-in-pr: on-failure
```

**`.github/workflows/lighthouse.yml`** (blocking, runs when the Vercel preview finishes):

```yaml
name: lighthouse
on:
  deployment_status:
permissions:
  contents: read
  statuses: write
jobs:
  lhci:
    if: github.event.deployment_status.state == 'success' && contains(github.event.deployment_status.environment, 'Preview')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: ${{ github.event.deployment_status.target_url }}
          configPath: ./lighthouserc.json
          uploadArtifacts: true
        env:
          LHCI_EXTRA_HEADERS: '{"x-vercel-protection-bypass":"${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}"}'
```

- If the `deployment_status` trigger proves finicky as a **required** status check (it posts against the PR head SHA via the `statuses: write` permission, which normally works but depends on the Vercel integration deploying that exact SHA), the fallback is to run Lighthouse in `ci.yml` against a local static server (`pnpm build && pnpm dlx sirv-cli .vercel/output/static --port 4321 --single` then `lhci autorun`) and accept the analytics-beacon 404 (mitigate by stubbing `/_vercel/insights/script.js` as an empty file in `public/` for the CI run only, or by asserting Best-Practices at `["warn", ...]` for the local run and keeping the hard `error` gate on the preview run).
- **Recommendation:** preview-URL run as the blocking Lighthouse gate (it is the ROADMAP's stated intent — "ships against a live preview URL with the numbers enforced"), local run optional for fast local feedback.

### Pattern 4: `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "throttlingMethod": "simulate",
        "throttling": {
          "cpuSlowdownMultiplier": 4,
          "rttMs": 150,
          "throughputKbps": 1638.4,
          "downloadThroughputKbps": 1638.4,
          "uploadThroughputKbps": 675
        }
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.05 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 20480 }]
      }
    }
  }
}
```

- **Mobile is Lighthouse's default** (Moto G-class device, 412×823, Slow 4G, 4× CPU). Do **not** set `"preset": "mobile"` — the only valid `preset` values are `desktop`, `perf`, `experimental`. Setting `preset: "desktop"` would be wrong here; omitting `preset` gives the required mobile emulation. `[VERIFIED: Lighthouse CLI + treosh action docs]`
- `total-blocking-time` ≤ 200 ms is the **lab proxy for INP** — Lighthouse has no lab INP audit. Field INP is monitored via Vercel Analytics post-launch. Document this in the phase notes.
- `resource-summary:script:size` is transfer size (compressed) of all scripts on the route — a good secondary check; the deterministic hard gate is `scripts/js-weight-check.sh`.

### Pattern 5: Deterministic JS-weight gate — `scripts/js-weight-check.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${1:-dist}"
BUDGET_BYTES=20480
INDEX="$OUT_DIR/index.html"

[ -f "$INDEX" ] || { echo "FAIL: $INDEX not found (run pnpm build first)"; exit 1; }

mapfile -t SCRIPTS < <(grep -oE '<script[^>]+src="[^"]+"' "$INDEX" | grep -oE 'src="[^"]+"' | sed -E 's/src="([^"]+)"/\1/' | grep -E '\.js$' || true)
mapfile -t MODULEPRELOADS < <(grep -oE '<link[^>]+rel="modulepreload"[^>]+href="[^"]+"' "$INDEX" | grep -oE 'href="[^"]+"' | sed -E 's/href="([^"]+)"/\1/' || true)

total=0
for rel in "${SCRIPTS[@]}" "${MODULEPRELOADS[@]}"; do
  f="$OUT_DIR/${rel#/}"
  [ -f "$f" ] || continue
  gz=$(gzip -c "$f" | wc -c)
  echo "  $rel  ${gz} B gz"
  total=$((total + gz))
done

echo "landing-route JS (gzip): ${total} B  budget: ${BUDGET_BYTES} B"
[ "$total" -le "$BUDGET_BYTES" ] || { echo "FAIL: JS weight over budget"; exit 1; }

DENY='react|react-dom|preact|vue|svelte|@angular|solid-js|framer-motion|(^|[^a-z])motion([^a-z]|$)|gsap|aos|lenis|locomotive-scroll|nprogress|@bprogress'
if grep -EqidrecursiveHint "$DENY" package.json 2>/dev/null; then :; fi
if node -e "const d={...require('./package.json').dependencies,...require('./package.json').devDependencies};const bad=Object.keys(d).filter(k=>/^(react|react-dom|preact|vue|svelte|@angular\/|solid-js|framer-motion|motion|gsap|aos|lenis|locomotive-scroll|nprogress|@bprogress\/)/.test(k));if(bad.length){console.error('FAIL: forbidden UI/animation deps: '+bad.join(', '));process.exit(1)}"; then
  echo "PASS: no UI framework / animation library in dependencies"
fi
echo "PASS: JS weight within budget"
```

(The `grep -Eqidrecursive...` line above is a deliberately-broken placeholder to remove — the planner should implement the denylist purely in the `node -e` check, which reads `package.json` cleanly. Keep the script comment-free per D-04.)

- `OUT_DIR` default `dist` but **must be pointed at whichever directory actually holds the servable static site** — see Open Question 1. If the adapter only populates `.vercel/output/static/`, pass that path.
- Phase 1 expected result: only `@vercel/analytics`'s bootstrap + the same-origin `insights` loader — comfortably under 20 KB (typically <2 KB gz).

### Anti-Patterns to Avoid

- **Enabling `security.csp` in Phase 1** — CSP is Phase 7, after every origin is known. A premature `<meta>` CSP on the placeholder page creates rework and can silently break the analytics script.
- **Using the adapter's `webAnalytics: { enabled: true }` option** — legacy (`@vercel/analytics` ≤1.3), explicitly rejected by D-06.
- **Enabling `imageService: true`** on the Vercel adapter — PERF-05 forbids runtime image optimization; build-time Sharp only (and there are no images in Phase 1 anyway).
- **Adding a stub `/src/pages/api/*.ts` route "to reserve the function"** — CONTEXT D says adapter-only, no route file. A stub would create a real Vercel Function and change the single-Function count from 0 to 1 in Phase 1.
- **Requiring PR approvals on branch protection** — Felipe is solo; set `required_approving_review_count: 0` (PR still required, no approver needed).
- **`enforce_admins: true` during initial setup** — locks Felipe out of emergency fixes; start `false`, revisit.
- **Committing `.vercel/`, `dist/`, `.astro/`, `.lighthouseci/`** — expand the 30-byte `.gitignore`.
- **Injecting a year into Lighthouse throttling as a "preset"** — there is no `preset: "mobile"`; mobile is the default.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Self-hosting fonts + `@font-face` + metrics fallback | Manual `@font-face` blocks with hand-computed `size-adjust`/`ascent-override` | Astro Fonts API `optimizedFallbacks: true` | Auto-downloads, subsets, unicode-ranges, generates the size-adjusted fallback — matching the CLS requirement PERF-04 |
| Preload tags for critical fonts | Hand-written `<link rel="preload" as="font" crossorigin>` | `<Font preload={[{ weight }]} />` | Emits the correct `type`, `crossorigin`, and hashed URL; stays in sync with the build |
| Secret handling in a static build | `.env` parsing / `import.meta.env` gymnastics to keep keys out of the bundle | `astro:env` `envField.string({ context: 'server', access: 'secret' })` | Type-safe, build-enforced separation; secrets provably never enter client output |
| Lighthouse mobile emulation | Custom Chrome flags for CPU/network throttle | Lighthouse default mobile profile + `lighthouserc` throttling block | The default already is Slow 4G + 4× CPU (the exact requirement) |
| Category/vitals gating | Parsing Lighthouse JSON in a bash script | `lhci` `assert.assertions` | Handles multi-run medians, numeric-value vs score assertions, upload |
| Dependency vulnerability + license gate on PRs | Diffing `pnpm audit` JSON between base and head | `actions/dependency-review-action@v5` | Free for public repos, no GHAS needed; blocks the *diff*, not the whole tree |
| Branch protection | Client-side "please use PRs" convention | `gh api PUT .../branches/main/protection` | Enforced server-side; the merge is physically blocked |

**Key insight:** Every capability in this phase has a first-party or well-worn tool. The only bespoke scripts that earn their keep are `security-check.sh` (glue that runs many small checks and prints one PASS/FAIL, shared by CI and humans per D-11) and `js-weight-check.sh` (a deterministic byte count that Lighthouse's networked measurement can't guarantee).

## Runtime State Inventory

> Phase 1 is greenfield — there is no pre-existing runtime state to migrate. Included for completeness because Phase 1 *creates* state that later phases and operators depend on.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no database, no datastore. Vercel Web Analytics stores aggregates server-side (no PII, no cookie). | None |
| Live service config | **Vercel project settings** (not in git): Git integration, Deployment Protection = Vercel Authentication, Environment Variables scoping, Protection Bypass for Automation secret, Spend Management. **GitHub repo settings** (partially scriptable): branch protection, Actions secrets (`VERCEL_AUTOMATION_BYPASS_SECRET`). | Document every dashboard setting in `.planning/security/runs/phase-01.md`; script branch protection via `gh api` |
| OS-registered state | None (no Task Scheduler / cron / launchd). Local `git` branch rename `master`→`main` is the only local mutation. | Rename branch; set upstream to new remote |
| Secrets/env vars | `RESEND_API_KEY` — **declared** in `env.schema` in Phase 1, **value** added in Vercel (Production+Preview, marked Sensitive) in Phase 5. `VERCEL_AUTOMATION_BYPASS_SECRET` — generated in Vercel Protection Bypass, auto-injected into deployments, **manually copied** into a GitHub Actions secret of the same name for the Lighthouse job. | Phase 1: create the bypass secret + mirror to GH Actions. Phase 5: add `RESEND_API_KEY` value. |
| Build artifacts | `dist/` and/or `.vercel/output/` (git-ignored), `.astro/` type cache, `.lighthouseci/` reports. `pnpm-lock.yaml` **is** committed. | Expand `.gitignore`; commit lockfile + `packageManager` pin |

**The canonical question — "after every repo file is set, what runtime systems still hold state?":** the Vercel project configuration and the GitHub repo settings. Neither is fully reconstructible from git. `.planning/security/runs/phase-01.md` is the record of truth for them.

## Common Pitfalls

### Pitfall 1: Expecting a serverless function to exist after Phase 1

**What goes wrong:** Success criterion 1 says "exactly one serverless-function boundary reserved for the form endpoint." A reviewer greps `.vercel/output/functions/` (or checks the Vercel dashboard "Functions" tab) after the Phase 1 deploy, finds **zero**, and flags it as incomplete.
**Why it happens:** `[VERIFIED: docs.astro.build/en/guides/integrations-guide/vercel/]` "If no routes set `prerender = false`, the adapter still functions validly — it simply builds a static site without serverless functions." CONTEXT D explicitly says adapter-only, no route file. So zero functions is the **correct** Phase-1 end state.
**How to avoid:** The "reservation" is: `@astrojs/vercel` is installed, `adapter: vercel()` is in config, and `output: 'static'` is set — so Phase 5 only has to add `src/pages/api/orcamento.ts` with `export const prerender = false`. The `security-check.sh` single-Function check must assert **`count <= 1`** (Phase 1: 0; Phase 5+: exactly 1), never `== 1`.
**Warning signs:** A plan task that says "create the API route stub" — that violates CONTEXT D and turns the count into 1 prematurely.

### Pitfall 2: `astro preview` does not work with `@astrojs/vercel`

**What goes wrong:** CI (or a dev) runs `astro build && astro preview` to get a local server for Lighthouse / the JS-weight check and gets: `The @astrojs/vercel adapter does not support the preview command.`
**Why it happens:** `[VERIFIED: web search — multiple sources, incl. astro GitHub issues]` Static-output adapters disable `preview`.
**How to avoid:** Serve the build output with a plain static server — `pnpm dlx sirv-cli <static-dir> --port 4321 --single` (or `serve -s`, `http-server`). Or `astro preview --node` if the Node adapter is also installed (heavier — not recommended just for this). The blocking Lighthouse gate runs against the real Vercel preview URL anyway, sidestepping this.
**Warning signs:** A workflow step `run: pnpm astro preview &`.

### Pitfall 3: Vercel Deployment Protection blocks the Lighthouse runner

**What goes wrong:** Preview deployments require Vercel Authentication (INFRA-10). An external Lighthouse runner hitting the preview URL gets a 401 / SSO redirect and Lighthouse scores the login page.
**Why it happens:** Deployment Protection intercepts all unauthenticated requests to preview URLs.
**How to avoid:** `[VERIFIED: vercel.com/docs/deployment-protection/.../protection-bypass-automation]` Generate a **Protection Bypass for Automation** secret in Vercel Project Settings → Deployment Protection. Vercel auto-sets it as `VERCEL_AUTOMATION_BYPASS_SECRET` in deployments; **also** copy the value into a GitHub Actions repository secret of the same name. Send it as the HTTP header `x-vercel-protection-bypass: <secret>` (or query param `?x-vercel-protection-bypass=<secret>`) on every Lighthouse request. For `treosh/lighthouse-ci-action`, pass it via `LHCI_EXTRA_HEADERS` env or `lighthouserc` `collect.settings.extraHeaders` (JSON string). The bypass does **not** override active DDoS mitigations or attack-time rate limits — fine for CI.
**Warning signs:** Lighthouse Performance ~30, Accessibility ~100, "page title is 'Login'".

### Pitfall 4: `re_` secret scan false-positives on minified JS

**What goes wrong:** `grep -r 're_' dist/` matches innocuous minified identifiers (`...re_e`, `core_`) and the secret-scan step fails on a clean build.
**Why it happens:** Two-character prefix is too loose.
**How to avoid:** Match the actual Resend key shape: `grep -rIE 're_[A-Za-z0-9]{20,}'` and also grep the literal env-var **names** (`RESEND_API_KEY`, and any others in `env.schema`). Scan both `dist/` and `.vercel/output/` (Open Question 1). Exit non-zero on any hit.
**Warning signs:** Secret scan fails but `git grep re_ -- src/` is empty.

### Pitfall 5: `astro check` fails in CI because `astro:env` types aren't generated

**What goes wrong:** `astro check` errors with "Cannot find module 'astro:env/server'" or missing virtual types.
**Why it happens:** The `astro:*` virtual modules/types are produced by `astro sync` (run implicitly by `dev`/`build`, not always before a bare `check`).
**How to avoid:** CI runs `pnpm astro sync` before `pnpm astro check`. Also add `"types": ["astro/client"]` via the generated `.astro/types.d.ts` reference in `tsconfig.json` (the scaffold does this).
**Warning signs:** `check` passes locally (after a prior `dev`) but fails on a clean CI checkout.

### Pitfall 6: Vercel Analytics beacon 404s outside Vercel

**What goes wrong:** Running Lighthouse against a local static server, `/_vercel/insights/script.js` and `/_vercel/insights/view` return 404; Best-Practices drops (failed requests / console errors), possibly below 95.
**Why it happens:** `/_vercel/insights/*` is injected by Vercel's edge at runtime; it does not exist in the static build or on a non-Vercel host.
**How to avoid:** Make the **blocking** Lighthouse gate run against the real Vercel preview URL (where the beacon resolves). If a local run is also wanted, either drop an empty `public/_vercel/insights/script.js` for that run, or assert Best-Practices as `warn` locally and `error` only on the preview run.
**Warning signs:** Best-Practices exactly at 92–94 with a "browser errors were logged to the console" audit citing `_vercel/insights`.

### Pitfall 7: `pnpm audit` exit code / severity threshold

**What goes wrong:** `pnpm audit` exits non-zero on a `low`/`moderate` transitive advisory with no available fix, blocking every PR indefinitely.
**Why it happens:** Default `pnpm audit` fails on any advisory.
**How to avoid:** `pnpm audit --audit-level=high` (fail only on high/critical) as the CI gate, matching `dependency-review-action`'s `fail-on-severity: high`. Document the threshold in the SEC-07 gabarito. Record any accepted lower-severity advisory as a Low/Med finding with an owner + target date (D-12), never silently ignored.
**Warning signs:** CI red on `main` with an advisory that has `"fixAvailable": false`.

### Pitfall 8: The `workflow` token scope gap

**What goes wrong:** `git push` fails: `refusing to allow an OAuth App to create or update workflow ... without 'workflow' scope`.
**Why it happens:** `[VERIFIED: CONTEXT <code_context>]` The machine's `gh` token has `gist, read:org, repo` — no `workflow`.
**How to avoid:** Run `gh auth refresh -s workflow -h github.com` **before** the first push that includes `.github/workflows/*`. This is a one-time interactive step for Felipe. Sequence: create repo → push non-workflow files → refresh scope → push workflows. Or refresh scope first, then push everything.
**Warning signs:** First push rejected only when workflow files are staged.

### Pitfall 9: Design-token low-opacity whites fail AA now

**What goes wrong:** The token file bakes in `rgba(255,255,255,.45)` / `.62` text colors from the design; a later contrast check (A11Y-06, Phase 3) flags them.
**Why it happens:** The design file's translucent whites are below WCAG AA on `#0A0A12` at small sizes.
**How to avoid:** Phase 1 only needs the placeholder `<h1>` + tagline to pass (use a high-contrast token, e.g. `--text-strong: rgba(255,255,255,.92)`). Define the full translucent scale as tokens but treat the low rungs as provisional — A11Y-06 (Phase 3, with design sign-off) raises them. Note this explicitly in the token file's companion doc (not inline — D-04).
**Warning signs:** Lighthouse Accessibility <100 on the placeholder page over a contrast audit.

## Code Examples

### `src/styles/tokens.css` — recommended `:root` skeleton (INFRA-04)

Values derived from `arquivos de design/Dmarques Landing.dc.html` (hex + rgba frequency analysis). Confidence MEDIUM — these are a sensible tokenization, not a spec; Phase 3 will refine against the real sections and A11Y-06.

```css
:root {
  --color-bg: #0A0A12;
  --color-bg-deep: #05050A;
  --color-surface: rgba(255, 255, 255, 0.045);
  --color-surface-raised: rgba(255, 255, 255, 0.06);
  --color-border: rgba(255, 255, 255, 0.09);
  --color-border-strong: rgba(255, 255, 255, 0.12);

  --color-accent: #6C4CFF;
  --color-accent-light: #9A85FF;
  --color-accent-deep: #7E62FF;
  --color-accent-glow: rgba(108, 76, 255, 0.35);
  --color-accent-glow-strong: rgba(108, 76, 255, 0.55);

  --color-text-strong: rgba(255, 255, 255, 0.92);
  --color-text: rgba(255, 255, 255, 0.82);
  --color-text-muted: rgba(255, 255, 255, 0.66);
  --color-text-faint: rgba(255, 255, 255, 0.45);

  --color-light-bg: #F2F3F6;
  --color-light-bg-alt: #F7F8FA;
  --color-light-text: #3D4253;
  --color-light-text-muted: #565C6E;
  --color-light-text-faint: #767C8E;

  --font-heading: var(--font-display), system-ui, sans-serif;
  --font-body-family: var(--font-body), system-ui, sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-black: 800;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.375rem;
  --text-2xl: 1.75rem;
  --text-3xl: 2.25rem;
  --text-4xl: 3rem;
  --text-5xl: 3.75rem;
  --leading-tight: 1.1;
  --leading-snug: 1.3;
  --leading-normal: 1.6;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;
  --space-section: clamp(4rem, 10vw, 7.5rem);

  --radius-xs: 8px;
  --radius-sm: 10px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-pill: 999px;
  --radius-circle: 50%;
  --radius-bubble-in: 18px 18px 18px 4px;
  --radius-bubble-out: 18px 18px 4px 18px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.45);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 24px 60px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 40px var(--color-accent-glow);
  --blur-glass: 18px;

  --z-base: 0;
  --z-canvas: 1;
  --z-content: 2;
  --z-glow: 3;
  --z-nav: 100;
  --z-skiplink: 200;

  --dur-fast: 0.2s;
  --dur-mid: 0.25s;
  --dur-slow: 0.3s;
  --ease-standard: ease;
}
```

### `astro:env` secret access (reference for Phase 5, not Phase 1)

```ts
// Source: https://docs.astro.build/en/guides/environment-variables/
import { RESEND_API_KEY, getSecret } from 'astro:env/server';
```

Docs, verbatim: *"Secret server variables are not part of your final bundle"* and *"by default, all secrets are validated whenever anything is imported from the `astro:env/server` module."* Phase 1 imports nothing from it, so no value is required at build time.

### Branch protection via `gh` (Claude runs this)

```bash
# Source: https://docs.github.com/en/rest/branches/branch-protection
gh api -X PUT repos/Felipe-Salles/<repo>/branches/main/protection \
  -H "Accept: application/vnd.github+json" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["verify", "dependency-review", "lhci"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true
}
JSON
```

- `contexts` must match the **job names/check names** GitHub reports. With the workflows above the check names are `verify` and `dependency-review` (from `ci.yml`) and `lhci` (from `lighthouse.yml`). Verify the exact strings after the first PR run (`gh pr checks`) and adjust.
- `[VERIFIED: docs.github.com]` Branch protection is available on **public** repos on GitHub Free — private repos would need Pro/Team.

### `vercel.json` (Phase 1)

```json
{}
```

Success criterion 5 requires the file to exist and be empty. Security headers + CSP land in Phase 7.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `experimental.fonts` flag | stable top-level `fonts` config + `<Font>` from `astro:assets` | Astro 6.0 | Use the stable key; ignore tutorials referencing `experimental.fonts` |
| `experimental.csp` flag | stable `security.csp` | Astro 6.0 | (Phase 7) |
| `output: 'hybrid'` | `output: 'static'` + per-route `export const prerender = false` | Astro 5 | Phase 1 sets `output: 'static'`; Phase 5 adds the per-route opt-out |
| adapter `webAnalytics: { enabled: true }` | `@vercel/analytics` component / `inject()` include | `@vercel/analytics` 1.4+ | D-06 mandates the include form |
| `pnpm/action-setup` + `actions/setup-node` (still fine) | optionally `pnpm/setup` (self-contained, installs the JS runtime too) for pnpm 11+ | 2026 | Either works; `action-setup@v6` + `setup-node@v7` with `cache: pnpm` is the well-documented path |
| Lighthouse `--preset=mobile` (never existed) | mobile is the **default**; `preset` only = `desktop`/`perf`/`experimental` | always | Omit `preset` for the required mobile run |

**Deprecated/outdated:**
- `@astrojs/vercel/static` and `@astrojs/vercel/serverless` sub-path imports — removed; import `@astrojs/vercel` and set `output`.
- Google Fonts `<link>` + two `preconnect`s (present in the design file) — deleted in Phase 1, replaced by the Fonts API.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel **Spend Management** (configurable USD hard cap + auto-pause + 50/75/100% alerts) is **Pro-plan only**; on Hobby the "hard cap" is structural (no payment method → $0 max; Hobby auto-pauses at the free-tier ceiling) and usage notifications exist at 75/100%. | User Constraints / INFRA-10 / Vercel hardening | If Felipe expects a named-dollar cap with graceful form-off degradation on Hobby, INFRA-10 / SEC-08's "spend cap with alerts" control is weaker than assumed. **Must be confirmed with Felipe** — decide Hobby-structural-cap vs upgrade to Pro. `[CITED: vercel.com/docs/spend-management]` states Owner/Billing on a Pro team is required. |
| A2 | Lighthouse has **no lab INP audit**; `total-blocking-time` ≤ 200 ms is the accepted lab proxy, and true INP <200 ms (PERF-02) is a **field** metric monitored via Vercel Analytics post-launch. | Pattern 4 / PERF-02 | If a stricter reading of PERF-02 demands a lab INP number, the gate as specified doesn't assert it directly. Low risk — this is standard practice. |
| A3 | With `output: 'static'` + `@astrojs/vercel` and no `prerender = false` route, `.vercel/output/functions/` is empty and that is the correct Phase-1 state (single-Function check must be `<= 1`, not `== 1`). | Pitfall 1 | If a reviewer insists on a visible reserved function, a stub route would be needed — contradicting CONTEXT D. `[CITED: docs.astro.build vercel adapter]` supports the "empty is valid" reading. |
| A4 | `@astrojs/vercel` with `output: 'static'` still emits a git-ignored `dist/` **and** `.vercel/output/static/`. | Open Question 1 | If only `.vercel/output/static/` is produced, every path literal in `security-check.sh` / `js-weight-check.sh` / the success criteria's `dist/` wording must target that path instead. Verify in Wave 0. |
| A5 | `@vercel/analytics` 2.0.1 `inject()` in a bundled `<script>` is the correct static-Astro pattern; a first-class `@vercel/analytics/astro` `<Analytics />` component may also exist and would be preferable. | Pattern 2 / Open Question 3 | Low — `inject()` is documented and portable; worst case is a one-line swap. |
| A6 | Design-token values in `src/styles/tokens.css` (palette beyond the confirmed few, spacing/radii/shadow scales) are a reasonable tokenization of the design file, **not** a locked spec; Phase 3 refines them. | Code Examples | Low for Phase 1 (placeholder page only needs a handful); the low-opacity white text rungs specifically will change under A11Y-06. |
| A7 | The `deployment_status` GitHub event from the Vercel integration can carry the Lighthouse check as a **required status check** on the PR (posts against the PR head SHA). | Pattern 3 | If it doesn't reliably associate with the PR SHA, fall back to the local-static-server Lighthouse run inside `ci.yml` (with the analytics-404 mitigation). |
| A8 | `pnpm audit --audit-level=high` + `dependency-review-action` `fail-on-severity: high` is the right threshold for a solo low-traffic marketing site. | Pitfall 7 | If Felipe wants `moderate` as the bar, both thresholds move together; more PRs will block on unfixable transitive advisories. Confirm during execution. |

## Open Questions

1. **Which directory holds the servable static site after `pnpm build` with `@astrojs/vercel` + `output: 'static'` — `dist/`, `.vercel/output/static/`, or both?**
   - What we know: the adapter writes `.vercel/output/{config.json,static/}`; Astro's normal build target is `dist/`; older reports show `dist/` still present with the static Vercel adapter.
   - What's unclear: whether current `@astrojs/vercel@11` leaves `dist/` in place.
   - Recommendation: Wave 0 task — run `pnpm build`, `ls -la dist .vercel/output/static`, and set a single `STATIC_DIR` variable consumed by `js-weight-check.sh`, `security-check.sh`, and the local Lighthouse fallback. Update the success-criteria wording if it's not `dist/`.

2. **Spend cap: accept Hobby's structural cap, or upgrade to Pro for real Spend Management?** (see Assumption A1)
   - Recommendation: surface to Felipe during execution as a Claude's-Discretion escalation (CONTEXT lists "exact spend-cap amount" as needing his confirmation anyway). Default path: stay Hobby, no payment method on file, enable usage-limit email notifications, document "hard cap = no billing relationship" in `phase-01.md`. Note the SEC-08 statement may need a one-line adjustment to reflect the Hobby reality.

3. **Does `@vercel/analytics@2.0.1` export a first-class Astro `<Analytics />` component (`@vercel/analytics/astro`)?** (see Assumption A5)
   - Recommendation: check `node_modules/@vercel/analytics/package.json` `exports` at implementation; prefer the component if present, else `inject()`.

4. **Exact required-status-check context strings.**
   - Recommendation: run one throwaway PR, `gh pr checks <n>`, copy the exact names into the branch-protection `contexts` array, then re-apply protection.

5. **`treosh/lighthouse-ci-action` major version.**
   - Recommendation: verify the latest tag during execution (`gh api repos/treosh/lighthouse-ci-action/releases/latest`); pin to a full SHA or major tag. `@v12` in Pattern 3 is a placeholder.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build + CI runtime | ✓ | 24.14.0 (local); CI pins `node-version: 24` | — |
| pnpm | package manager (D: default) | ✓ | 11.15.1 | npm 11.13.0 present; not preferred |
| `gh` CLI | repo creation, branch protection, scope refresh | ✓ | 2.96.0, auth as `Felipe-Salles` | — |
| `gh` `workflow` token scope | pushing `.github/workflows/*` | ✗ | scopes: `gist, read:org, repo` | `gh auth refresh -s workflow -h github.com` (one-time, interactive) — Pitfall 8 |
| Git remote | push to GitHub | ✗ | local repo only, branch `master` | Claude creates via `gh repo create` (D-03, with approval) |
| Vercel account (Felipe) | project link, Deployment Protection, env vars, Protection Bypass, spend cap | ? (assumed exists) | — | Felipe creates/links in dashboard (D-03) |
| Vercel **Pro** plan | configurable spend cap + auto-pause (INFRA-10 strict reading) | ✗ (assume Hobby) | — | Hobby structural cap (no payment method) + usage notifications — Assumption A1 / Open Question 2 |
| Chrome/Chromium for Lighthouse | LHCI collect | ✓ in CI (`treosh` action / `@lhci/cli` installs it) | — | — |
| Internet during CI build | Fonts API fontsource fetch, pnpm install | ✓ (GitHub-hosted runners) | — | `@fontsource-*` local packages as offline fallback for fonts |

**Missing dependencies with no fallback:** none that block — the Git remote and `workflow` scope are created/refreshed during execution.
**Missing dependencies with fallback:** `workflow` scope (refresh command); Vercel Pro (Hobby structural cap); Fonts API remote fetch (local `@fontsource-*`).

## Validation Architecture

`workflow.nyquist_validation` is `true`. Phase 1 has **no application logic** to unit-test — the "tests" are the CI gates themselves plus `scripts/security-check.sh`. Validation = observable signals that each success criterion is true.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None (no app logic). Gate harness = GitHub Actions + `@lhci/cli` + two bash scripts |
| Config file | `lighthouserc.json`, `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml` (none exist yet — Wave 0) |
| Quick run command | `pnpm astro sync && pnpm astro check && pnpm build && bash scripts/js-weight-check.sh "$STATIC_DIR"` |
| Full suite command | the above + `pnpm audit --audit-level=high` + `bash scripts/security-check.sh` + `lhci autorun` (or the preview-URL job) |

### Phase Requirements → Signal Map

| Req | Observable signal | Command / check | Exists? |
|-----|-------------------|-----------------|---------|
| INFRA-01 | `output: 'static'` set; adapter present; `.vercel/output/functions/` empty | `grep -q "output: 'static'" astro.config.mjs`; `test $(find .vercel/output/functions -maxdepth 1 -name '*.func' 2>/dev/null \| wc -l) -le 1` | ❌ Wave 0 |
| INFRA-02 | `pnpm dev` serves; `pnpm build` exits 0 and produces the static dir | `pnpm build && test -f "$STATIC_DIR/index.html"` | ❌ Wave 0 |
| INFRA-03 | zero Google Fonts references in built output | `! grep -rIE 'fonts\.(googleapis\|gstatic)\.com' "$STATIC_DIR"` ; `ls "$STATIC_DIR"/_astro/*.woff2` | ❌ Wave 0 |
| INFRA-04 | one token file, emitted as an external stylesheet, referenced by the page | `test -f src/styles/tokens.css` ; `grep -qE '<link[^>]+rel="stylesheet"' "$STATIC_DIR/index.html"` ; `! grep -q '<style>:root' "$STATIC_DIR/index.html"` | ❌ Wave 0 |
| INFRA-05 | no inlined `<style>` blocks in output HTML | `grep -c '<style' "$STATIC_DIR/index.html"` returns `0` ; `grep -q "inlineStylesheets: 'never'" astro.config.mjs` | ❌ Wave 0 |
| INFRA-06 | `RESEND_API_KEY` in `env.schema` with `context:'server', access:'secret'` ; not in output | `grep -A2 RESEND_API_KEY astro.config.mjs \| grep -q "access: 'secret'"` ; `! grep -rIE 'RESEND_API_KEY\|re_[A-Za-z0-9]{20,}' "$STATIC_DIR" .vercel/output` | ❌ Wave 0 |
| INFRA-07 | every push → Vercel preview; PR shows a preview URL | manual: open a PR, confirm the Vercel bot comment / deployment | ❌ (needs Vercel link) |
| INFRA-08 | CI job fails the PR on any of: check, build, audit, dep-review | manual: push a branch with a type error / a known-vuln dep, confirm red + merge blocked | ❌ Wave 0 |
| INFRA-09 / PERF-01 | Lighthouse mobile ≥95 in all four categories on the preview | `lighthouserc` `categories:* ["error",{minScore:0.95}]` green against `target_url` | ❌ Wave 0 |
| INFRA-10 | 2FA on; `main` protected; preview auth on; bypass secret set; spend alerts on | `gh api repos/OWNER/REPO/branches/main/protection` returns the expected JSON; rest = screenshots in `phase-01.md` | ❌ |
| PERF-02 | LCP<2.5s, CLS<0.05, TBT<200ms asserted | `lighthouserc` audit assertions green | ❌ Wave 0 |
| PERF-03 | landing-route JS <20 KB gz; no framework/anim dep | `bash scripts/js-weight-check.sh "$STATIC_DIR"` exits 0 | ❌ Wave 0 |
| PERF-04 | `font-display: swap`; metrics fallback present; exactly two `preload` font links | `grep -o 'font-display:swap' "$STATIC_DIR"/_astro/*.css` ; `grep -c 'rel="preload" as="font"' "$STATIC_DIR/index.html"` returns `2` ; `grep -qE 'size-adjust|ascent-override' "$STATIC_DIR"/_astro/*.css` | ❌ Wave 0 |
| SEC-07 | gabarito + phase-01 run exist; run PASS; no open High | `test -f .planning/security/SECURITY-CHECKLIST.md` ; `test -f .planning/security/runs/phase-01.md` ; `bash scripts/security-check.sh` exits 0 ; `! grep -E '^\| .* \| High \| (Open\|open) ' .planning/security/runs/phase-01.md` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm astro check && pnpm build && bash scripts/js-weight-check.sh "$STATIC_DIR"`
- **Per PR (CI):** full `ci.yml` (check, build, audit, dep-review, js-weight, security-check) + `lighthouse.yml` on the preview
- **Phase gate:** every row above green + `security-check.sh` PASS + `phase-01.md` has no open High finding, before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `astro.config.mjs`, `package.json` (scripts, `engines`, `packageManager`), `tsconfig.json`, `biome.json`, `.prettierrc`, expanded `.gitignore`
- [ ] `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/styles/tokens.css`
- [ ] `vercel.json` (`{}`)
- [ ] `lighthouserc.json`
- [ ] `scripts/js-weight-check.sh`, `scripts/security-check.sh` (both `chmod +x`, comment-free per D-04)
- [ ] `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml`
- [ ] `.planning/security/SECURITY-CHECKLIST.md`, `.planning/security/runs/phase-01.md`
- [ ] Determine `STATIC_DIR` (Open Question 1) and thread it through both scripts + workflows
- [ ] One throwaway PR to capture exact required-status-check context names (Open Question 4)
- [ ] Framework install: none (no test framework needed)

## Security Domain

`security_enforcement` is not disabled — this section is included. Phase 1 stands up the *gate*; the strict header/CSP work is Phase 7. Phase 1's own attack surface is tiny (a static placeholder page + a build pipeline).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control (Phase 1 scope) |
|---------------|---------|-----------------|
| V1 Architecture / SDLC | yes | SEC-07 checklist artifact + `security-check.sh` run every phase; dependency review + `pnpm audit` gates; branch protection so no unreviewed code reaches `main` |
| V2 Authentication | partial | Human-facing: 2FA on GitHub + Vercel accounts (INFRA-10). No app auth. |
| V5 Input Validation | no (Phase 5) | No inputs in Phase 1 (placeholder page, no form) |
| V6 Cryptography / Secrets | yes | `astro:env` secret schema keeps `RESEND_API_KEY` out of the client bundle; CI secret-scan of the build output; Vercel env vars scoped Production+Preview and marked Sensitive; `VERCEL_AUTOMATION_BYPASS_SECRET` stored as a GH Actions secret, never echoed |
| V10 Malicious Code | yes | `dependency-review-action` blocks new vulnerable/badly-licensed deps in the PR diff; JS-weight denylist blocks framework/animation-lib creep; zero third-party runtime origins (fonts + analytics same-origin) |
| V12 Files / Resources | yes | `build.inlineStylesheets: 'never'`; no user uploads; `vercel.json` empty (headers in Phase 7) |
| V14 Configuration | yes | Deployment Protection (Vercel Authentication) on all previews so the WIP site is never public (D-09); spend cap / usage alerts so an attack degrades gracefully (INFRA-10 / SEC-08); production build source maps off is a Phase 7 item but can be set now (`build.sourcemap` unset = off by default) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation (Phase 1) |
|---------|--------|---------------------|
| Secret leaked into the client bundle / built assets | Information Disclosure | `astro:env` `access: 'secret'`; CI grep of `$STATIC_DIR` + `.vercel/output` for env-var names and `re_[A-Za-z0-9]{20,}` |
| Malicious / typo-squatted dependency added in a PR | Tampering / Elevation | `dependency-review-action` (fail-on high) + `pnpm audit --audit-level=high` + `pnpm-lock.yaml` committed + `--frozen-lockfile` in CI |
| Supply-chain: unpinned GitHub Action | Tampering | Pin actions to a major tag (or SHA) in the workflow; `permissions:` block scoped to `contents: read` (plus `statuses: write` only where needed) |
| Unreviewed / force-pushed code onto `main` | Tampering | Branch protection: `strict` required checks, `allow_force_pushes: false`, `allow_deletions: false`, `required_linear_history: true`, PR required (`required_approving_review_count: 0`) |
| WIP site indexed / seen by a client before approval | Information Disclosure | Deployment Protection = Vercel Authentication on previews (D-09); domain not attached until after Phase 7 |
| Third-party font/analytics origin becomes an injection vector | Tampering | Self-hosted fonts (no `fonts.gstatic.com`), same-origin analytics beacon (`/_vercel/insights/*`) — zero third-party origins in v1 (SEC-05 groundwork) |
| Cost / availability attack on the deploy (flood) | Denial of Service | 100% static (CDN-absorbed); spend cap + usage alerts (INFRA-10, subject to Assumption A1); full edge WAF deferred to Milestone 2 per SEC-08 |
| CI secret (`VERCEL_AUTOMATION_BYPASS_SECRET`) exfiltrated via a malicious PR | Information Disclosure | The Lighthouse job runs `on: deployment_status` (not `pull_request_target`), so a fork PR cannot read repo secrets; keep it that way |

### SEC-07 gabarito content for Phase 1 (from REQUIREMENTS.md SEC-07, verbatim scope)

The Phase 1 `.planning/security/SECURITY-CHECKLIST.md` must contain **exactly** these mechanical items (D-13), each mapped to a `security-check.sh` check:

1. `pnpm audit` clean (threshold `--audit-level=high`; lower-severity advisories logged as findings).
2. grep for **new** inline surface — `style="` attributes in `src/`, inline `<script>`/`<style>` blocks in the built HTML (Phase 1 baseline: the placeholder page has none of its own).
3. `curl -I` header inspection of the deployed preview (Phase 1: records the baseline; the header assertions become meaningful in Phase 7).
4. secret scan of the build output — env-var names + `re_[A-Za-z0-9]{20,}` — returns nothing.
5. single-Function count — `<= 1` (Phase 1: `0`).
6. Lighthouse gate — mobile ≥95 all four categories on the preview.
7. findings recorded with severity / owner (Felipe Salles) / target date; **no phase closes with an open High finding** (rule at the top of the gabarito).

### `scripts/security-check.sh` spec (D-11)

- **Invocation:** `bash scripts/security-check.sh [--ci]` — same script for humans and CI. `--ci` makes it non-interactive and machine-parseable; without it, prints a human summary.
- **Inputs:** `STATIC_DIR` (env or arg), optional `PREVIEW_URL` + `VERCEL_AUTOMATION_BYPASS_SECRET` for the `curl -I` and Lighthouse checks (skipped with a printed `SKIP` if absent, e.g. local pre-deploy runs).
- **Checks (each prints `PASS:`/`FAIL:`/`SKIP:` + detail):**
  1. `pnpm audit --audit-level=high` — non-zero → `FAIL`.
  2. `grep -rn 'style="' src/` → any hit → `FAIL` (Phase 1 has none; this guards Phase 3 regressions early).
  3. `grep -nE '<style|<script>[^<]' "$STATIC_DIR"/**/*.html` for **inline** blocks not emitted by Astro's hashing pipeline — report count.
  4. secret scan: `grep -rIE 'RESEND_API_KEY|re_[A-Za-z0-9]{20,}' "$STATIC_DIR" .vercel/output` → any hit → `FAIL`.
  5. function count: `find .vercel/output/functions -maxdepth 1 -name '*.func' | wc -l` → `> 1` → `FAIL`.
  6. `curl -sI -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" "$PREVIEW_URL"` — Phase 1: print headers, always `PASS` (assertions added Phase 7); `SKIP` if no URL.
  7. Lighthouse: invoke `lhci autorun` (or check the uploaded assertion result) — non-zero → `FAIL`; `SKIP` if no URL and no local server.
- **Exit code:** `0` iff no `FAIL` (SKIPs allowed). CI treats non-zero as a blocking failure.
- **Output capture:** the phase run file (`.planning/security/runs/phase-01.md`) appends the full stdout of a `--ci` run, then a human answers the judgement-only items (e.g. "every new dependency justified in the phase notes?").

### Findings table schema (D-12) — for `.planning/security/runs/phase-NN.md`

```
| ID | Description | Severity | Status | Action | Target date | Owner |
|----|-------------|----------|--------|--------|-------------|-------|
| P01-001 | example | Low | Open | ... | 2026-09-20 | Felipe Salles |
```

Top of `SECURITY-CHECKLIST.md`, verbatim (pt-BR per project language): **"Nenhuma fase fecha com achado High em aberto."**

## Sources

### Primary (HIGH confidence)
- npm registry (2026-09-05) — `astro@7.3.1` (`engines.node >=22.12.0`), `@astrojs/vercel@11.0.10`, `@astrojs/sitemap@3.7.4`, `@vercel/analytics@2.0.1`, `@lhci/cli@0.15.1`, `@biomejs/biome@2.5.12`, `prettier-plugin-astro@0.14.1`, `@fontsource-variable/outfit@5.3.0`, `@fontsource/dm-sans@5.3.0`, `resend@6.26.0`, `unlighthouse@0.18.0`.
- https://docs.astro.build/en/guides/environment-variables/ — `env.schema`, `envField.string({ context, access })`, `astro:env/server`, `getSecret`, "secret server variables are not part of your final bundle".
- https://docs.astro.build/en/guides/fonts/ — stable `fonts` config, `fontProviders.fontsource()`, `<Font>` from `astro:assets`, `preload` prop, `optimizedFallbacks`, `display`.
- https://docs.astro.build/en/reference/modules/astro-assets/ — `<Font>` props (`cssVariable`, `preload: boolean | {weight,style,subset}[]`), `Image`/`Picture` exports.
- https://docs.astro.build/en/guides/integrations-guide/vercel/ — `output: 'static'` behaviour, `prerender = false` → Vercel Function, "no routes set `prerender = false` → static site without serverless functions", `webAnalytics`/`imageService`/`isr`/`staticHeaders`.
- https://docs.astro.build/en/reference/configuration-reference/ — `build.inlineStylesheets` (`'always'|'auto'|'never'`, default `auto`), `build.assets` (`_astro`), `output` default `static`.
- https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation — `VERCEL_AUTOMATION_BYPASS_SECRET`, `x-vercel-protection-bypass` header + query param, `x-vercel-set-bypass-cookie`, what is / isn't bypassed, "available on all plans".
- https://vercel.com/docs/spend-management — Spend Management is Pro (Owner/Billing role); pause-production action, 50/75/100% alerts, checks "every few minutes", 503 `DEPLOYMENT_PAUSED` when paused.
- https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md — `assert.assertions` (`categories:*`, `largest-contentful-paint`, `cumulative-layout-shift`, `total-blocking-time`, `resource-summary:script:size`), `collect.settings.throttling`, `startServerCommand`, `numberOfRuns`, `extraHeaders`.
- https://github.com/actions/dependency-review-action — public-repo support without GHAS, `permissions: contents: read`, `fail-on-severity`, `comment-summary-in-pr`.
- https://docs.github.com/en/rest/branches/branch-protection — `PUT /repos/{owner}/{repo}/branches/{branch}/protection` body shape; branch protection on public repos on GitHub Free.

### Secondary (MEDIUM confidence)
- Web search (multiple results incl. astro GitHub issues, yusif.fi) — `@astrojs/vercel` disables `astro preview` ("does not support the preview command"), workaround `astro preview --node`.
- https://github.com/treosh/lighthouse-ci-action + Unlighthouse LHCI-in-Actions guide — Lighthouse mobile default = 412×823, Slow 4G, CPU ×4; `configPath` usage.
- Web search (pnpm CI docs, setup-node advanced-usage) — `pnpm/action-setup@v6` + `actions/setup-node@v7` + `cache: pnpm`, `--frozen-lockfile`, `pnpm/setup` successor for pnpm 11+.
- Web search (Vercel pricing 2026 explainers, vercel.com/docs/plans/hobby, vercel.com/docs/limits) — Hobby cannot purchase overage; Hobby projects pause at the free-tier ceiling; usage notifications at 75/100%.
- Design file analysis — `arquivos de design/Dmarques Landing.dc.html`: hex palette (`#0A0A12`, `#05050A`, `#6C4CFF`, `#9A85FF`, `#7E62FF`, `#F2F3F6`, `#F7F8FA`, `#3D4253`, `#565C6E`, `#767C8E`), radii (8/9/10/12/18/20/22/24/26/999px/50%), `blur(14px|18px)`, transition durations (.2/.25/.3/.7s), `@keyframes dmFloat` (`translateY` 0→−14px), `@keyframes dmPulse` (`opacity` .35→.75), Google Fonts `<link>` + two `preconnect`s to remove, 287 inline `style="` attributes + one `<style>` block (Phase 3 scope).

### Tertiary (LOW confidence — validate at execution)
- `@vercel/analytics/astro` first-class component existence in 2.0.1 (npmjs.com page returned 403; inferred from mixed community posts) — Open Question 3.
- Exact `@astrojs/vercel@11` output directory (`dist/` retained alongside `.vercel/output/static/`) — Open Question 1 / Assumption A4.
- `treosh/lighthouse-ci-action` current major tag — Open Question 5.
- `deployment_status`-triggered job usable as a required PR status check — Assumption A7.

## Metadata

**Confidence breakdown:**
- Standard stack + versions: HIGH — npm registry verified 2026-09-05, matches `CLAUDE.md`.
- Astro config mechanics (`env.schema`, `fonts`, `output: 'static'`, `inlineStylesheets`): HIGH — official docs.
- Vercel Deployment Protection bypass: HIGH — official Vercel docs.
- Vercel Spend Management plan gating: MEDIUM-HIGH — official docs state Pro; Hobby structural-cap behaviour from pricing explainers (MEDIUM).
- Lighthouse CI config: HIGH for assertion syntax; MEDIUM for the preview-URL-vs-local CI wiring (judgement call).
- Branch protection / Dependency Review: HIGH — official docs; MEDIUM on exact context-string names (must confirm post-first-PR).
- Static output directory: LOW-MEDIUM — needs Wave 0 verification.
- Design-token values: MEDIUM — derived from the design file, not a spec; Phase 3 refines.

**Research date:** 2026-09-05
**Valid until:** ~2026-10-05 for the stack/versions (Astro moves fast — re-verify `astro` / `@astrojs/vercel` before install); ~2026-09-20 for the Vercel plan/Deployment-Protection details (Vercel changelog is active).
