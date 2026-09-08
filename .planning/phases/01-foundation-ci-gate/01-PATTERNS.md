# Phase 1: Foundation & CI Gate - Pattern Map

**Mapped:** 2026-09-08
**Files analyzed:** 19 new / 1 modified
**Analogs found:** 0 in-repo / 20 — greenfield repository, no source code exists yet

## Greenfield Notice

This repo currently contains only `CLAUDE.md`, `.gitignore` (30 bytes), `.planning/`,
and `arquivos de design/`. There is **no `src/`, no `package.json`, no
`astro.config.*`, no `scripts/`, no `.github/`**. `git ls-files` confirms it.

Therefore **every target file below has no in-repo analog.** Each entry points
instead to the canonical reference that the planner and executor must copy from:

| Ref key | Location |
|---------|----------|
| `RESEARCH` | `.planning/phases/01-foundation-ci-gate/01-RESEARCH.md` (line numbers cited) |
| `UI-SPEC` | `.planning/phases/01-foundation-ci-gate/01-UI-SPEC.md` (line numbers cited) |
| `CONTEXT` | `.planning/phases/01-foundation-ci-gate/01-CONTEXT.md` (decision IDs cited) |
| `CLAUDE` | `F:\Projetos\dmarques\CLAUDE.md` (§ Technology Stack / TL;DR / What NOT to Use / Version Compatibility) |
| `DESIGN` | `F:\Projetos\dmarques\arquivos de design\Dmarques Landing.dc.html` (615 lines; line numbers cited) |

Do **not** invent analogs. Do **not** copy from `arquivos de design/image-slot.js`
or `support.js` — CONTEXT `<canonical_refs>` marks them design-editor runtime, not
production code.

**Project-wide convention (CONTEXT D-04):** zero comments in any version-controlled
file — `.astro`, `.ts`, `.js`, `.mjs`, `.css`, `.json`, YAML, workflows,
`vercel.json`, shell scripts. The RESEARCH/UI-SPEC code samples carry explanatory
comments; **strip every comment** when materialising the real file.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `astro.config.mjs` | config | build-time transform | `RESEARCH` Pattern 1 (L234-286) + `UI-SPEC` L389 (font-weight reconciliation) | canonical-ref only |
| `package.json` | config | n/a | `RESEARCH` Installation (L129-137), Standard Stack (L90-108), Anti-Patterns (L468-470) | canonical-ref only |
| `tsconfig.json` | config | n/a | `RESEARCH` L535 (`astro/tsconfigs/strict`, scaffold-generated) | canonical-ref only |
| `biome.json` | config | n/a | `CLAUDE` § Development Tools (Biome 2.x, TS/JS/JSON/CSS only) | canonical-ref only |
| `.prettierrc` | config | n/a | `CLAUDE` § Development Tools + `RESEARCH` L108 (scope to `**/*.astro`) | canonical-ref only |
| `.gitignore` (modify) | config | n/a | `RESEARCH` Anti-Patterns L470 + Runtime State L497 | canonical-ref only |
| `.nvmrc` / `engines` + `packageManager` | config | n/a | `RESEARCH` L57, L126, L229 | canonical-ref only |
| `vercel.json` | config | n/a | `RESEARCH` `vercel.json` section (L691-697) — literally `{}` | canonical-ref only |
| `lighthouserc.json` | config / test-harness | request-response (audits URL) | `RESEARCH` Pattern 4 (L384-420) | canonical-ref only |
| `src/layouts/BaseLayout.astro` | layout / component | request-response (SSG render) | `RESEARCH` Pattern 2 (L287-316) + `UI-SPEC` Placeholder Page Contract (L277-318) | canonical-ref only |
| `src/pages/index.astro` | route / page | request-response (SSG render) | `UI-SPEC` Placeholder Page Contract (L277-310) + Copywriting (L342-353) | canonical-ref only |
| `src/styles/tokens.css` | style / design-token contract | n/a (CSS custom props) | `UI-SPEC` full color token contract (L140-264) + file rules (L266-269) — **supersedes** `RESEARCH` skeleton L568-658 | canonical-ref only |
| `src/styles/base.css` | style | n/a | `UI-SPEC` L269 (reset + element base) + `UI-SPEC` Layout & type treatment (L302-310) | canonical-ref only |
| `scripts/js-weight-check.sh` | utility / CI gate | batch / transform (reads build output) | `RESEARCH` Pattern 5 (L422-460) | canonical-ref only |
| `scripts/security-check.sh` | utility / CI gate | batch (runs many checks, prints PASS/FAIL) | `RESEARCH` `security-check.sh` spec (L855-868) + SEC-07 items (L843-853) | canonical-ref only |
| `.github/workflows/ci.yml` | config / CI pipeline | event-driven (`on: pull_request`, `push: main`) | `RESEARCH` Pattern 3 ci.yml (L322-355) | canonical-ref only |
| `.github/workflows/lighthouse.yml` | config / CI pipeline | event-driven (`on: deployment_status`) | `RESEARCH` Pattern 3 lighthouse.yml (L359-382) | canonical-ref only |
| `.planning/security/SECURITY-CHECKLIST.md` | doc / template | n/a | `RESEARCH` SEC-07 gabarito content (L843-853) + `CONTEXT` D-10/D-12/D-13 | canonical-ref only |
| `.planning/security/runs/phase-01.md` | doc / dated run | n/a | `RESEARCH` findings table schema (L870-878) + `security-check.sh` output capture (L868) | canonical-ref only |

## Pattern Assignments

### `astro.config.mjs` (config, build-time transform)

**Canonical source:** `RESEARCH` Pattern 1, lines 234-286.

**Copy verbatim (strip comments — D-04):**
- `import { defineConfig, envField, fontProviders } from 'astro/config';` + `import vercel from '@astrojs/vercel';`
- `site: 'https://agenciadmarques.com.br'` — the **real** domain. `CLAUDE`'s `dmarques.com.br` is a stale hypothesis (`CONTEXT` `<code_context>` L196-200).
- `output: 'static'`, `adapter: vercel()` — bare adapter call, **no `webAnalytics`, no `imageService`** (`RESEARCH` Anti-Patterns L465-466).
- `build: { inlineStylesheets: 'never' }` (INFRA-05).
- `env.schema.RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' })` — declared only, no value, `validateSecrets` left default `false` (`RESEARCH` L285).
- `fonts: [...]` two entries via `fontProviders.fontsource()`, `cssVariable: '--font-display'` (Outfit) and `'--font-body'` (DM Sans), `optimizedFallbacks: true`, `display: 'swap'`, `fallbacks: ['system-ui', 'sans-serif']`, `subsets: ['latin']`.

**Deviation from the sample — font weights:** use `UI-SPEC` L389 (cross-doc
reconciliation), **not** the RESEARCH sample's `[300..800]`:
- Outfit: `weights: [400, 500, 600, 700]`, `styles: ['normal']`
- DM Sans: `weights: [400, 500]`, `styles: ['normal', 'italic']` (`DESIGN` L14 loads DM Sans italic 400)

**Explicitly absent:** no `security.csp` block (Phase 7 — `RESEARCH` L283, L464), no
`experimental.*` flags (graduated to stable in Astro 6 — `RESEARCH` L703-704).

---

### `package.json` (config)

**Canonical source:** `RESEARCH` Installation (L129-137) + Standard Stack tables (L90-108).

**Scaffold command:** `pnpm create astro@latest -- --template minimal --typescript strict` (`RESEARCH` L132).

**Dependencies (pinned per `CLAUDE` § Version Compatibility / `RESEARCH` L137):**
- `dependencies`: `astro@7.3.1`, `@astrojs/vercel@11.0.10`, `@vercel/analytics@2.0.1`
- `devDependencies`: `@astrojs/check@~0.9`, `typescript@5.x`, `@fontsource-variable/outfit@5.3.0`, `@fontsource/dm-sans@5.3.0`, `@biomejs/biome@2.5.12`, `prettier` + `prettier-plugin-astro@0.14.1`, `@lhci/cli@0.15.1`, `sirv-cli` (local Lighthouse fallback — `RESEARCH` L106, Pitfall 2 L510-515)

**Fields:**
- `"packageManager": "pnpm@11.15.1"` (`RESEARCH` L126) — `pnpm/action-setup` reads it
- `"engines": { "node": ">=22.12.0" }` (Astro 7 requirement — `RESEARCH` L94); CI pins `node-version: 24`
- `scripts`: exactly one command each for dev and build (INFRA-02 — `RESEARCH` L57). Include `astro sync` before `astro check` (Pitfall 5 — `RESEARCH` L531-536).

**Denylist (enforced by `js-weight-check.sh`, must stay true here):** no `react`,
`preact`, `vue`, `svelte`, `@angular/*`, `solid-js`, `framer-motion`, `motion`,
`gsap`, `aos`, `lenis`, `locomotive-scroll`, `nprogress`, `@bprogress/*`
(`RESEARCH` L451, `CLAUDE` § What NOT to Use).

**NOT installed this phase** (`RESEARCH` L110-118): `resend`, `zod` (explicit),
`@astrojs/sitemap`, `@upstash/*`, `unlighthouse`.

---

### `tsconfig.json` (config)

**Canonical source:** generated by the scaffold; `RESEARCH` L535.

Extends `astro/tsconfigs/strict`. Keep the scaffold's `.astro/types.d.ts` reference
so `astro:env` / `astro:assets` virtual types resolve (Pitfall 5 — `RESEARCH` L531-536).
No manual edits needed beyond what `pnpm create astro` emits.

---

### `biome.json` (config)

**Canonical source:** `CLAUDE` § Development Tools + § TL;DR ("Biome 2.x for TS/JS/JSON/CSS").

- Scope: `.ts`, `.js`, `.mjs`, `.json`, `.css` only. `.astro` is **not** covered by Biome 2 — Prettier owns it.
- Formatter + linter on. No comment rules needed (D-04 forbids comments; Biome won't emit them).
- No in-repo example — this is the first Biome config in the project.

---

### `.prettierrc` (config)

**Canonical source:** `CLAUDE` § Development Tools; `RESEARCH` L108.

- Load `prettier-plugin-astro`.
- Scope Prettier to `**/*.astro` via `overrides` so it does not fight Biome on other file types.

---

### `.gitignore` (modify)

**Canonical source:** `RESEARCH` Anti-Patterns L470, Runtime State Inventory L497-498.

Current file is 30 bytes (`arquivos de design/.thumbnail`). **Append**, do not replace:
`node_modules/`, `dist/`, `.vercel/`, `.astro/`, `.lighthouseci/`.
Keep `pnpm-lock.yaml` **tracked** (`RESEARCH` L498).

---

### `vercel.json` (config)

**Canonical source:** `RESEARCH` `vercel.json` section, L691-697.

Content is exactly `{}`. Success criterion 5 requires the file to exist and be
empty. Security headers (HSTS, X-Content-Type-Options, Referrer-Policy,
Permissions-Policy, frame-ancestors) land in Phase 7 — do not add them now.

---

### `lighthouserc.json` (config / test-harness, request-response)

**Canonical source:** `RESEARCH` Pattern 4, lines 384-420.

**Copy verbatim:**
- `ci.collect.numberOfRuns: 3`
- `ci.collect.settings.throttlingMethod: "simulate"` + `throttling` block: `cpuSlowdownMultiplier: 4`, `rttMs: 150`, `throughputKbps: 1638.4`, `downloadThroughputKbps: 1638.4`, `uploadThroughputKbps: 675`
- `ci.assert.assertions`:
  - `categories:performance` / `:seo` / `:best-practices` / `:accessibility` → `["error", { "minScore": 0.95 }]`
  - `largest-contentful-paint` → `["error", { "maxNumericValue": 2500 }]`
  - `cumulative-layout-shift` → `["error", { "maxNumericValue": 0.05 }]`
  - `total-blocking-time` → `["error", { "maxNumericValue": 200 }]` (lab proxy for INP — `RESEARCH` A2 L719)
  - `resource-summary:script:size` → `["error", { "maxNumericValue": 20480 }]`

**Do NOT set `preset`** — mobile is Lighthouse's default (Moto-G, 412×823, Slow 4G,
4× CPU); the only valid `preset` values are `desktop`/`perf`/`experimental`
(`RESEARCH` L418, L708).

---

### `src/layouts/BaseLayout.astro` (layout / component, SSG render)

**Canonical source:** `RESEARCH` Pattern 2 (L287-316) + `UI-SPEC` Placeholder Page
Contract (L277-318).

**Frontmatter:**
```
import { Font } from 'astro:assets';
import '../styles/tokens.css';
import '../styles/base.css';
```
(`RESEARCH` L292 shows only `tokens.css`; `UI-SPEC` L269 adds `base.css`, imported
**after** tokens.)

**`<head>`:** `<meta charset>`, `<meta name="viewport">`, `<title>`, then exactly:
```
<Font cssVariable="--font-display" preload={[{ weight: 700, style: 'normal' }]} />
<Font cssVariable="--font-body"    preload={[{ weight: 400, style: 'normal' }]} />
```
Preloading an array preloads **exactly** those two files → satisfies PERF-04's "two
critical files" (`RESEARCH` L315). Outfit 700 = LCP `<h1>`; DM Sans 400 = body.

**`<html lang="pt-BR">`** (i18n constraint, A11Y).

**Analytics (D-05/D-06):** bundled module `<script>` in `<body>`:
```
import { inject } from '@vercel/analytics';
inject();
```
Astro hashes this script so it survives a future strict `script-src 'self'`
(`RESEARCH` L316). At implementation, check `node_modules/@vercel/analytics/package.json`
`exports` for a first-class `@vercel/analytics/astro` `<Analytics />` component and
prefer it if present (`RESEARCH` Open Question 3, L737-739); `inject()` is the
guaranteed fallback.

**Absent by design:** no `<meta name="description">`, canonical, OG, favicon (Phase 6);
no `<meta http-equiv="content-security-policy">` (Phase 7); no `<header>`/`<nav>`/
`<footer>` (D-08). No Google Fonts `<link>` and no `preconnect` — `DESIGN` L12-14
are the lines being removed.

---

### `src/pages/index.astro` (route / page, SSG render)

**Canonical source:** `UI-SPEC` Placeholder Page Contract (L277-310) + Copywriting
Contract (L342-353).

**Body:** wraps `BaseLayout`, renders exactly:
```
<main>
  <h1>Dmarques — Soluções Web</h1>
  <p>Um visitante entende em segundos o que a Dmarques faz, confia na agência e pede um orçamento — com um site que carrega rápido e nunca sai do ar.</p>
</main>
```
- Exactly **one `<h1>`** (A11Y-02). `<main>` MAY carry `id="conteudo"` to pre-wire the Phase 3 skip link (optional — `UI-SPEC` L298).
- Copy is pt-BR, verbatim from `UI-SPEC` L345-347. Title = `Dmarques — Soluções Web`.
- Scoped styles here or in `base.css` per `UI-SPEC` Layout & type treatment table
  (L302-310): `<main>` = `min-height: 100svh; display: grid; place-items: center;
  padding: var(--space-16) var(--space-gutter); text-align: center;`; content column
  `max-width: 42rem; display: flex; flex-direction: column; gap: var(--space-6);`;
  `<h1>` uses `var(--font-heading)` / `var(--font-weight-bold)` /
  `font-size: clamp(2rem, 1.4rem + 3vw, 3rem)` / `var(--leading-tight)` /
  `var(--tracking-tight)` / `var(--color-text-strong)` / `text-wrap: balance`;
  tagline `<p>` uses `var(--font-text)` / `400` / `var(--text-lg)` /
  `var(--leading-body)` / `var(--color-text)` / `max-width: 34rem` / `text-wrap: pretty`.
- **No motion:** no `@keyframes`, no `transition`, no `animation`, no
  `scroll-behavior: smooth` (`UI-SPEC` L316-318; `DESIGN` L16, L22-23 are deliberately
  not carried over).

---

### `src/styles/tokens.css` (design-token contract)

**Canonical source:** `UI-SPEC` "Full color token contract", lines 140-264. This
**supersedes** the `RESEARCH` skeleton (L568-658) wherever they differ (`UI-SPEC` L138).

**Copy the entire `:root { ... }` block from `UI-SPEC` L141-263** — it is complete:
`color-scheme: dark`; dark surfaces/structure; accent ramp; text-on-dark; light-section
tokens; typography (`--font-heading: var(--font-display)`, `--font-text: var(--font-body)`,
weight tokens, `--text-2xs..--text-5xl`, `--leading-*`, `--tracking-*`); spacing
(`--space-1..--space-24`, `--space-section`, `--space-gutter`); radii; shadows/blur;
`--focus-ring` (reserved); z-index layers; motion tokens (`--dur-*`, `--ease-*`).

**File rules (`UI-SPEC` L266-269):**
- `:root` selector **only**. No `@keyframes` (`dmFloat`/`dmPulse` belong to the
  Phase 4 effects island). No other selectors, no component rules, no `@layer`.
- **Strip all comments** (D-04 — the `/* dark surfaces */` group labels in the
  UI-SPEC block are spec annotations, not shippable).
- Must **not** redefine `--font-display` / `--font-body` — the Fonts API injects
  those via `cssVariable` (`UI-SPEC` L110); `tokens.css` only composes
  `--font-heading` / `--font-text` on top.

**Provisional values (do not block on, do not use on the Phase 1 page):**
`--color-text-faint` (0.45 alpha) ≈ 4.5:1 on `#0A0A12` — A11Y-06 raises the low
rungs in Phase 3 (`RESEARCH` Pitfall 9 L560-564; `UI-SPEC` L332). The Phase 1
`<h1>` uses `--color-text-strong` (≈16.6:1) and the tagline `--color-text` (≈12:1).

---

### `src/styles/base.css` (style)

**Canonical source:** `UI-SPEC` L269 + Layout & type treatment table (L302-310).

Reset + element base only, imported **after** `tokens.css`:
- `*, *::before, *::after { box-sizing: border-box }`
- `body { margin: 0 }` + `background: var(--color-bg); color: var(--color-text);
  font-family: var(--font-text); -webkit-font-smoothing: antialiased;`
- `h1, p { margin: 0 }` (or reset via the content-column `gap`)

No comments. Keeps `tokens.css` a pure contract. No `scroll-behavior`, no transitions
(`UI-SPEC` L316-318).

---

### `scripts/js-weight-check.sh` (utility / CI gate, batch transform)

**Canonical source:** `RESEARCH` Pattern 5, lines 422-460.

**Copy the structure, with two corrections the research itself flags:**
- **Delete** the deliberately-broken `grep -Eqidrecursive...` placeholder line
  (`RESEARCH` L450, L457). Implement the denylist purely in the `node -e` check
  that reads `package.json` (`RESEARCH` L451-453).
- `OUT_DIR` / `STATIC_DIR`: do **not** hardcode `dist`. Thread a single
  `STATIC_DIR` variable, resolved in Wave 0 by running `pnpm build` and inspecting
  `dist/` vs `.vercel/output/static/` (`RESEARCH` Open Question 1 L729-732).

**Behaviour:** sum gzip size of `<script src>` + `modulepreload` hrefs referenced
from the landing `index.html`; `BUDGET_BYTES=20480`; exit non-zero over budget;
exit non-zero if any denylisted dep is present (PERF-03). `chmod +x`. No comments (D-04).

---

### `scripts/security-check.sh` (utility / CI gate, batch)

**Canonical source:** `RESEARCH` `scripts/security-check.sh` spec (L855-868) +
SEC-07 gabarito item list (L843-853).

**Invocation:** `bash scripts/security-check.sh [--ci]` — one script for humans and
CI (D-11). `--ci` = non-interactive, machine-parseable. Exit `0` iff no `FAIL`
(SKIPs allowed).

**Checks, each printing `PASS:` / `FAIL:` / `SKIP:` + detail (`RESEARCH` L859-867):**
1. `pnpm audit --audit-level=high` — non-zero → FAIL (Pitfall 7 L546-549).
2. `grep -rn 'style="' src/` — any hit → FAIL (guards Phase 3 inline-style regressions early).
3. inline `<style>` / non-hashed inline `<script>` count in `"$STATIC_DIR"/**/*.html` — report.
4. secret scan: `grep -rIE 'RESEND_API_KEY|re_[A-Za-z0-9]{20,}' "$STATIC_DIR" .vercel/output` — any hit → FAIL (Pitfall 4 L525-529 — the tight `re_[A-Za-z0-9]{20,}` regex, not bare `re_`).
5. function count: `find .vercel/output/functions -maxdepth 1 -name '*.func' | wc -l` — `> 1` → FAIL. **Assert `<= 1`, never `== 1`** (Phase 1 = 0; `RESEARCH` Pitfall 1 L503-508).
6. `curl -sI -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" "$PREVIEW_URL"` — Phase 1 prints headers, always PASS (assertions added Phase 7); SKIP if no URL.
7. Lighthouse: `lhci autorun` or read the uploaded assertion result — non-zero → FAIL; SKIP if no URL and no local server.

`chmod +x`. No comments (D-04). CI calls it with `--ci`; `.planning/security/runs/phase-01.md` appends its stdout.

---

### `.github/workflows/ci.yml` (CI pipeline, event-driven)

**Canonical source:** `RESEARCH` Pattern 3 ci.yml, lines 322-355.

**Copy verbatim (strip comments — D-04, YAML included):**
- `on: pull_request` + `push: branches: [main]`
- `permissions: contents: read`
- Job `verify` (ubuntu-latest): `actions/checkout@v6` → `pnpm/action-setup@v6` →
  `actions/setup-node@v7` (`node-version: 24`, `cache: pnpm`) →
  `pnpm install --frozen-lockfile` → `pnpm astro sync` → `pnpm astro check` →
  `pnpm build` → `pnpm audit --audit-level=high` → `bash scripts/js-weight-check.sh` →
  `bash scripts/security-check.sh --ci`
- Job `dependency-review` (ubuntu-latest): `actions/checkout@v6` →
  `actions/dependency-review-action@v5` with `fail-on-severity: high`,
  `comment-summary-in-pr: on-failure`

**Prerequisite:** `gh auth refresh -s workflow -h github.com` before the first push
that includes this file — the machine token lacks `workflow` scope (`RESEARCH`
Pitfall 8 L552-557; `CONTEXT` `<code_context>` L189-192).

---

### `.github/workflows/lighthouse.yml` (CI pipeline, event-driven)

**Canonical source:** `RESEARCH` Pattern 3 lighthouse.yml, lines 359-382.

**Copy verbatim (strip comments):**
- `on: deployment_status`
- `permissions: { contents: read, statuses: write }`
- Job `lhci`, gated: `if: github.event.deployment_status.state == 'success' && contains(github.event.deployment_status.environment, 'Preview')`
- `treosh/lighthouse-ci-action@v12` (verify the current major tag at execution —
  `RESEARCH` Open Question 5 L743-744) with
  `urls: ${{ github.event.deployment_status.target_url }}`,
  `configPath: ./lighthouserc.json`, `uploadArtifacts: true`
- `env: LHCI_EXTRA_HEADERS: '{"x-vercel-protection-bypass":"${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}"}'` — bypasses Deployment Protection (`RESEARCH` Pitfall 3 L517-522)

**Fallback** if `deployment_status` proves unreliable as a required check: run
Lighthouse inside `ci.yml` against `sirv-cli .vercel/output/static` and mitigate the
`/_vercel/insights/*` 404 (`RESEARCH` L381, Pitfall 6 L538-543).

---

### `.planning/security/SECURITY-CHECKLIST.md` (doc / template)

**Canonical source:** `RESEARCH` SEC-07 gabarito content (L843-853) + `CONTEXT`
D-10 / D-12 / D-13.

- Top line, verbatim, pt-BR: **"Nenhuma fase fecha com achado High em aberto."** (`RESEARCH` L878)
- The 7 mechanical items exactly as `RESEARCH` L847-853 lists them, each mapped to
  its `security-check.sh` check number.
- Findings table schema (`RESEARCH` L872-876): `| ID | Description | Severity | Status | Action | Target date | Owner |`; default owner **Felipe Salles**.
- This is the reusable gabarito; later phases append phase-specific items (`CONTEXT` D-13).
- Repo-only. Doc prose may be pt-BR (project language); no code comments involved.

---

### `.planning/security/runs/phase-01.md` (doc / dated run)

**Canonical source:** `RESEARCH` `security-check.sh` output capture (L868) +
findings schema (L870-876); `CONTEXT` D-10 / D-11.

- Dated run file for Phase 1.
- Appends the full stdout of `bash scripts/security-check.sh --ci`.
- Hand-answers the judgement-only items (e.g. "every new dependency justified in
  the phase notes?").
- Findings table with the D-12 schema; Phase 1 target: no open High.
- Also the record of truth for dashboard-only state that git cannot hold: Vercel
  project settings, GitHub branch protection, Protection Bypass secret, spend-cap
  decision (`RESEARCH` Runtime State Inventory L494-499).

## Shared Patterns

### D-04 — Zero comments in version-controlled files

**Source:** `CONTEXT` D-04 (L63-66), reinforced `RESEARCH` L22, `UI-SPEC` L267.
**Apply to:** every file this phase creates — `.astro`, `.ts`, `.mjs`, `.js`,
`.css`, `.json`, `.sh`, `.yml`, `vercel.json`.
**Action:** all RESEARCH/UI-SPEC code samples carry teaching comments; delete every
one when writing the real file. Rationale lives in `.planning/` or the README only.

### Pinned versions from the stack table

**Source:** `CLAUDE` § Version Compatibility + `RESEARCH` L137 (npm-verified 2026-09-05).
**Apply to:** `package.json`, both workflow files (action tags), `.nvmrc`.
**Action:** `astro@7.3.1`, `@astrojs/vercel@11.0.10`, `@vercel/analytics@2.0.1`,
`@lhci/cli@0.15.1`, `@biomejs/biome@2.5.12`, `prettier-plugin-astro@0.14.1`,
`@fontsource-variable/outfit@5.3.0`, `@fontsource/dm-sans@5.3.0`. Node 24 in CI,
`engines.node >=22.12.0`, `packageManager: pnpm@11.15.1`. Re-verify `astro` /
`@astrojs/vercel` immediately before install (`RESEARCH` "Valid until" L921).

### Real domain

**Source:** `CONTEXT` `<code_context>` L195-200; `RESEARCH` L284.
**Apply to:** `astro.config.mjs` `site`. (Downstream: canonical URLs, OG, JSON-LD,
Resend sending domain.)
**Action:** use `agenciadmarques.com.br`. `dmarques.com.br` / `felipe@dmarques.com.br`
in `CLAUDE` and REQUIREMENTS TRUST-01 are a stale hypothesis — do not use.

### STATIC_DIR resolution

**Source:** `RESEARCH` Open Question 1 (L729-732), Assumption A4 (L721).
**Apply to:** `js-weight-check.sh`, `security-check.sh`, both workflows, the local
Lighthouse fallback.
**Action:** Wave 0 — run `pnpm build`, `ls -la dist .vercel/output/static`, define
one `STATIC_DIR` variable, thread it everywhere. Update any success-criteria wording
that says `dist/` if the real path differs.

### Secret hygiene

**Source:** `RESEARCH` Security Domain L825, L834; Pitfall 4 L525-529.
**Apply to:** `astro.config.mjs` (`env.schema`), `security-check.sh`, both workflows.
**Action:** `RESEND_API_KEY` declared `context: 'server', access: 'secret'`, value
never in repo (Phase 5 adds it in Vercel). `VERCEL_AUTOMATION_BYPASS_SECRET` stored
as a GitHub Actions secret, never echoed. Secret scan uses
`re_[A-Za-z0-9]{20,}` + literal env-var names against `$STATIC_DIR` **and** `.vercel/output`.

### Phase-boundary exclusions (do not pull work forward)

**Source:** `CONTEXT` `<domain>` L40-43; `RESEARCH` Anti-Patterns L462-471; `UI-SPEC` L26, L300.
**Apply to:** all files.
**Action:** no `security.csp` / CSP `<meta>` (Phase 7); no security headers in
`vercel.json` (Phase 7); no `imageService` (PERF-05); no stub `src/pages/api/*.ts`
route — adapter-only reservation, function count stays 0 (Pitfall 1); no
`@keyframes` / effects / `scroll-behavior` (Phase 4); no SEO meta / favicon / OG
(Phase 6); no content collections (Phase 2); no `resend` / `zod` / `@upstash/*`
install (Phase 5).

## No Analog Found

**All 20 target files** — greenfield repo, zero existing source. The planner must
drive each file from the canonical reference cited in its Pattern Assignment above
(`RESEARCH` code patterns L234-460 & L661-697, `UI-SPEC` token contract L140-264 &
page contract L277-318, `CLAUDE` § Technology Stack, `DESIGN` L12-23 for what to
remove). No RESEARCH `Code Examples` fallback is needed beyond what is already
cited — the research is exhaustive for this wiring phase.

| File | Role | Data Flow | Reason (no in-repo analog) |
|------|------|-----------|----------------------------|
| `astro.config.mjs` | config | build transform | first Astro config in the repo |
| `package.json` | config | n/a | no Node project exists yet |
| `tsconfig.json` | config | n/a | scaffold-generated, none present |
| `biome.json` | config | n/a | first lint/format config |
| `.prettierrc` | config | n/a | first Prettier config |
| `.nvmrc` / engines | config | n/a | no Node project yet |
| `vercel.json` | config | n/a | first deploy config (`{}`) |
| `lighthouserc.json` | config / test | request-response | no CI harness exists |
| `src/layouts/BaseLayout.astro` | layout / component | SSG render | no `src/` exists |
| `src/pages/index.astro` | route / page | SSG render | no `src/` exists |
| `src/styles/tokens.css` | design-token contract | n/a | first stylesheet; contract defined only in `UI-SPEC` |
| `src/styles/base.css` | style | n/a | no `src/` exists |
| `scripts/js-weight-check.sh` | utility / CI gate | batch transform | no `scripts/` exists |
| `scripts/security-check.sh` | utility / CI gate | batch | no `scripts/` exists |
| `.github/workflows/ci.yml` | CI pipeline | event-driven | no `.github/` exists |
| `.github/workflows/lighthouse.yml` | CI pipeline | event-driven | no `.github/` exists |
| `.planning/security/SECURITY-CHECKLIST.md` | doc / template | n/a | `.planning/security/` not created yet |
| `.planning/security/runs/phase-01.md` | doc / run | n/a | `.planning/security/runs/` not created yet |
| `.gitignore` (modify) | config | n/a | exists (30 bytes) but no build-output entries — append only |

## Metadata

**Analog search scope:** entire repo — `git ls-files` (19 tracked files, all
`.planning/` docs + `CLAUDE.md` + 3 design assets), plus `ls -la` of the working
tree root. No `src/`, `scripts/`, `.github/`, `package.json`, or `astro.config.*`
exist.
**Files scanned for patterns:** 0 source files (none exist).
**Canonical references consulted:** `01-RESEARCH.md` (922 lines), `01-UI-SPEC.md`
(390 lines), `01-CONTEXT.md` (241 lines), `CLAUDE.md` (§ Technology Stack),
`arquivos de design/Dmarques Landing.dc.html` (L12-23 — Google Fonts + keyframes to
remove).
**Project skills:** none (`.claude/skills/`, `.agents/skills/` etc. absent — `CLAUDE`
confirms).
**Pattern extraction date:** 2026-09-08
