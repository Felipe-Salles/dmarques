---
phase: 01-foundation-ci-gate
plan: 02
subsystem: ui-foundation
tags: [astro, css-tokens, fonts-api, vercel-analytics, pt-br, static-build]

requires:
  - "01-01: astro.config.mjs (output static, vercel adapter, inlineStylesheets never, Fonts API injecting --font-display / --font-body, RESEND_API_KEY env schema)"
provides:
  - "src/styles/tokens.css — the single design-token :root contract (colour, type, spacing, radii, shadows, focus, z-index, motion) consumed by every later component"
  - "src/styles/base.css — reset + element base rules (box-sizing, body background/colour/font, h1/p margin reset)"
  - "src/layouts/BaseLayout.astro — html lang=pt-BR shell, tokens-then-base imports, two <Font> preloads (Outfit 700 + DM Sans 400), @vercel/analytics/astro <Analytics /> include"
  - "src/pages/index.astro — minimal pt-BR placeholder route: one <main>#conteudo, one <h1>, Core Value tagline, token-only scoped styles, zero motion"
  - "STATIC_DIR = .vercel/output/static — the resolved servable static output path for plans 03 and 04"
  - "RESEARCH Open Question 3 closed: @vercel/analytics 2.0.1 DOES export a first-class Astro component at @vercel/analytics/astro"
affects: [gate-scripts-plan, ci-workflows-plan, phase-3-sections, phase-4-effects, phase-7-csp]

tech-stack:
  added: []
  patterns:
    - "STATIC_DIR is .vercel/output/static (the Vercel-served tree); dist/ is also emitted by the build but is not the servable path — shared fallback spelling for later plans is \"${STATIC_DIR:-.vercel/output/static}\""
    - "Analytics ships as the @vercel/analytics/astro <Analytics /> component (not inject(), not the adapter webAnalytics option) — D-06"
    - "Page/component styling is token-only: no raw hex/rgba/px where a token exists, no inline style= attributes"
    - "D-04 zero-comment convention held across .css and .astro"
    - ".prettierrc tuned (printWidth 100 + singleQuote) so Prettier agrees with the plan-mandated single-quote inline <Font> shape — mirrors the 01-01 Biome single-quote tuning"

key-files:
  created:
    - "src/styles/tokens.css"
    - "src/styles/base.css"
    - "src/layouts/BaseLayout.astro"
    - "src/pages/index.astro"
  modified:
    - ".prettierrc"

key-decisions:
  - "STATIC_DIR resolved to .vercel/output/static — both dist/ and .vercel/output/static/ are emitted and both contain index.html; .vercel/output/static wins because that is what Vercel serves (RESEARCH Open Question 1 closed)"
  - "Analytics include form: @vercel/analytics/astro <Analytics /> component — the package exports ./astro -> ./dist/astro/component.ts in 2.0.1; astro check and build both accept it (RESEARCH Open Question 3 closed)"
  - "Task 3 acceptance criterion 'grep -c \"<style\" index.html == 0' is not literally satisfiable with the mandated Astro Fonts API: the Fonts API injects inline <style> @font-face metrics blocks. INFRA-05 intent (token + page CSS external) is fully met; the inline blocks are @font-face only and are CSP-hashable via security.csp in Phase 7."

requirements-completed: [INFRA-04, PERF-04]

duration: 20min
completed: 2026-09-08
---

# Phase 1 Plan 02: Design Tokens, Base Styles, BaseLayout & Placeholder Page Summary

**One dark pt-BR placeholder page — single `:root` token contract + reset in external CSS, `lang="pt-BR"` BaseLayout with two self-hosted font preloads and the Vercel Analytics Astro component — that builds to `.vercel/output/static` with zero Google Fonts requests, zero secrets, and zero serverless functions.**

## STATIC_DIR

```
.vercel/output/static
```

`pnpm build` emits **both** `dist/` and `.vercel/output/static/`, each containing a servable `index.html`. `.vercel/output/static` is the resolved `STATIC_DIR` because it is the tree Vercel actually serves. Later plans use the fallback spelling `"${STATIC_DIR:-.vercel/output/static}"` (the exact form plan 03 already uses).

## Analytics include form

`@vercel/analytics/astro` **`<Analytics />` component** (not `inject()`). `node_modules/@vercel/analytics/package.json` `exports` maps `"./astro"` → `"./dist/astro/component.ts"`, which re-exports the default from `./index.astro`. `astro check` and `pnpm build` both accept it. It renders a `<vercel-analytics>` custom element plus one bundled, Astro-hashed module `<script>` (no `style=` attributes, CSP-safe for the Phase 7 strict `script-src 'self'`). This closes RESEARCH Open Question 3: a first-class Astro component **does** exist in 2.0.1.

## Performance

- **Duration:** ~20 min
- **Tasks:** 3
- **Files:** 5 (4 created, 1 modified)
- **Build:** `pnpm build` completes in ~2 s, 1 page, 8 woff2 font files copied, 0 serverless functions.

## Accomplishments

- **`src/styles/tokens.css`** — one `:root` block, 90+ custom properties transcribed verbatim from UI-SPEC L141-L263: `color-scheme: dark` first; dark surfaces/structure; accent ramp; text-on-dark; light-section tokens; typography (`--font-heading: var(--font-display)`, `--font-text: var(--font-body)`, weight tokens, `--text-2xs`..`--text-5xl`, `--leading-*`, `--tracking-*`); spacing (`--space-1`..`--space-24`, `--space-section`, `--space-gutter`); radii; shadows/blur; `--focus-ring` + `--focus-ring-offset`; z-index layers; motion tokens. No comments, no `@keyframes`, no selector other than `:root`, no redefinition of the Fonts-API variables.
- **`src/styles/base.css`** — `box-sizing: border-box` reset, `body` background/colour/font-family from tokens + `-webkit-font-smoothing`, `h1, p { margin: 0 }`. No motion, no `scroll-behavior`.
- **`src/layouts/BaseLayout.astro`** — `<!doctype html>`, `<html lang="pt-BR">`, `<meta charset>` + viewport + `<title>` (prop, default `Dmarques — Soluções Web`), then exactly two `<Font cssVariable=… preload={[{ weight, style: 'normal' }]} />` tags (Outfit 700, DM Sans 400), `tokens.css` then `base.css` imports, `<slot />` + `<Analytics />` in `<body>`. No description/canonical/OG/favicon/theme-color (Phase 6), no CSP meta (Phase 7), no header/nav/footer (D-08), no Google Fonts link / preconnect.
- **`src/pages/index.astro`** — wraps `BaseLayout`, renders one `<main id="conteudo">` → `<div class="stack">` → one `<h1>Dmarques — Soluções Web</h1>` + one `<p>` with the verbatim Core Value tagline. Scoped `<style>` block uses only tokens (`--space-16`, `--space-gutter`, `--space-6`, `--font-heading`, `--font-weight-bold`, `--leading-tight`, `--tracking-tight`, `--color-text-strong`, `--font-text`, `--text-lg`, `--leading-body`, `--color-text`) plus `clamp()` / `text-wrap` / layout keywords. No raw hex/rgba, no inline `style=`, no motion.
- **Build signal checks against `STATIC_DIR`:** zero `fonts.googleapis.com` / `fonts.gstatic.com` anywhere in `dist/` or `.vercel/output/static/`; 8 self-hosted `.woff2` under `_astro/fonts/`; token contract + `base.css` + scoped page CSS all in the single external `/_astro/index.BKGq4XlZ.css` (`<link rel="stylesheet">`); exactly **2** `<link rel="preload" … as="font">` tags; `font-display:swap` and `size-adjust` / `ascent-override` metrics fallbacks present in the emitted font CSS; **zero** `RESEND_API_KEY` / `re_[A-Za-z0-9]{20,}` matches in `STATIC_DIR` or `.vercel/output`; `.vercel/output/functions` absent → function count **0** (correct Phase 1 state, Pitfall 1); `index.html` is `lang="pt-BR"` with exactly one `<h1>`.
- `pnpm run check` (astro sync && astro check) exits 0; `pnpm exec biome check .` exits 0; `pnpm exec prettier --check "src/**/*.astro"` exits 0.

## Task Commits

1. **Task 1: Author tokens.css and base.css** — `43396ca` (feat)
2. **Task 2: Author BaseLayout.astro and the placeholder index page** — `676ae4c` (feat)
3. **Task 3: Build, resolve/export STATIC_DIR, assert phase-1 output signals** — no source changes required (build + all signals verified); recorded here and in the metadata commit.

## Files Created/Modified

- `src/styles/tokens.css` (created) — single `:root` design-token contract, 122 lines
- `src/styles/base.css` (created) — reset + element base, 17 lines
- `src/layouts/BaseLayout.astro` (created) — pt-BR shell, font preloads, analytics include
- `src/pages/index.astro` (created) — pt-BR placeholder page + scoped token-only styles
- `.prettierrc` (modified) — added `printWidth: 100` and `singleQuote: true`

## Decisions Made

- **`STATIC_DIR = .vercel/output/static`** (see dedicated section). `dist/` is also emitted; documented so plan 03's `js-weight-check.sh` / `security-check.sh` and both workflows target the Vercel-served tree.
- **Analytics = `@vercel/analytics/astro` component** (see dedicated section). Chosen over `inject()` per the plan's "prefer the first-class component if exported" instruction.
- **`<main>` carries `id="conteudo"`** to pre-wire the Phase 3 skip link (optional per UI-SPEC L298); no skip link ships this phase.
- **`<h1>` text = `Dmarques — Soluções Web`** (UI-SPEC Copywriting Contract L346, brand-statement framing; Phase 3 replaces the whole `<main>` body).
- **Content column is a `<div class="stack">` wrapper**, not `<main>` itself, because `<main>` needs `display: grid; place-items: center` while the column needs `display: flex; flex-direction: column` — they cannot share one element.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Tuned `.prettierrc` so Prettier agrees with the plan-mandated code shape**
- **Found during:** Task 2 (`pnpm run check` passed, but `prettier --check` on the new `.astro` files failed).
- **Issue:** The inherited `.prettierrc` from 01-01 has no `printWidth` / `singleQuote`, so Prettier's defaults (80 cols, double quotes) rewrote `<Font cssVariable="…" preload={[{ weight: 700, style: 'normal' }]} />` into a multi-line, double-quoted form. That breaks Task 2 acceptance criteria `grep -c '<Font cssVariable='` (expects `2` on single lines) and `grep -q "preload={[{ weight: 700, style: 'normal' }]}"` (expects single quotes) — the criteria encode the exact single-quote inline shape from the RESEARCH/UI-SPEC samples.
- **Fix:** Added `"printWidth": 100` (matches `biome.json` `lineWidth: 100`) and `"singleQuote": true` to `.prettierrc`. Prettier now leaves the mandated shape untouched; `prettier --check "src/**/*.astro"` exits 0. Directly mirrors the 01-01 deviation #3 where `biome.json` was set to single-quote so `astro.config.mjs` passed lint against its committed acceptance criteria.
- **Files modified:** `.prettierrc` (one file beyond the plan's `files_modified` list).
- **Verification:** `pnpm exec prettier --check "src/**/*.astro"` exits 0; `pnpm exec biome check .` exits 0; all Task 2 grep criteria pass; `pnpm run check` exits 0.
- **Committed in:** `676ae4c` (Task 2 commit).

**2. [Spec/reality mismatch — documented, not code-fixed] Task 3 acceptance `grep -c '<style' index.html == 0` cannot hold with the mandated Astro Fonts API**
- **Found during:** Task 3 (output signal assertions).
- **Issue:** `.vercel/output/static/index.html` contains **2** inline `<style>` blocks. They are injected by Astro's Fonts API and contain **only** `@font-face` declarations (with `font-display:swap`, `size-adjust`, `ascent-override`, `unicode-range`) plus the `:root{--font-display:…}` / `:root{--font-body:…}` family-variable declarations. This is intrinsic, non-configurable Fonts API behaviour (the `@font-face` CSS is inlined into `<head>` by design for critical-path performance). `build.inlineStylesheets: 'never'` only governs Astro's *bundled* CSS, not the Fonts API block. RESEARCH L791 / the Task 3 criterion assumed a `0` count.
- **Why not code-fixed:** No source change removes the inline block while keeping self-hosted fonts. The only alternative is abandoning the Astro Fonts API for a hand-wired `@fontsource` `@font-face` CSS import — an architectural reversal of the 01-01 stack decision (CLAUDE.md, UI-SPEC, and plan 01-01 all mandate the Fonts API), disproportionate to a grep-count assumption.
- **Intent is met:** INFRA-05's real requirement — token contract + page/component CSS emitted as an **external** stylesheet, not inlined — is fully satisfied: the complete `:root` token contract, `base.css`, and the page's scoped styles are all in the single external `/_astro/index.BKGq4XlZ.css` referenced by `<link rel="stylesheet">`. No page/token/component rule is inlined (verified: the inline blocks contain no `--color-*`, `--space-*`, `.stack`, `data-astro-cid`, or `place-items`). `astro.config.mjs` has `inlineStylesheets: 'never'`.
- **CSP forward-safety:** CLAUDE.md's CSP table states Astro `security.csp` **auto-hashes** inline `<style>` blocks, so the Fonts API block works with a strict `style-src` (no `unsafe-inline`) when Phase 7 lands. Plan 03's `security-check.sh` check #3 only **reports** the inline-style count (does not `FAIL` on it), so this does not affect the Phase 1 gate.
- **Recommended follow-up:** plan 03 should implement the INFRA-05 inline-`<style>` check as "no *bundled/page/token* styles inlined; Fonts API `@font-face` block permitted" rather than a bare `count == 0`.

**Total deviations:** 1 auto-fixed (Rule 3, config tuning), 1 documented spec/reality mismatch (no code fix possible without architectural reversal).

## Known Stubs

- `src/pages/index.astro` is a deliberate minimal placeholder (D-08): one `<h1>` + the Core Value tagline, no nav/header/footer, no "coming soon" copy. Phase 3 replaces the entire `<main>` body with the 9 real sections. Not a data stub — no data source is expected in Phase 1. The real domain stays closed to the public through Phase 7 (D-09), so this page is never client-facing or indexed.
- `--color-text-faint` (and `--color-light-text-faint`) are defined in `tokens.css` but provisional (borderline AA at ~4.5:1). Not used on the Phase 1 page; A11Y-06 (Phase 3, with design sign-off) raises the low rungs.

## Threat Surface

No new security-relevant surface beyond the plan's `<threat_model>`. Confirmed against the register:
- T-02-01 (secret disclosure): `grep -rIE 'RESEND_API_KEY|re_[A-Za-z0-9]{20,}'` over `STATIC_DIR` + `.vercel/output` → 0 hits.
- T-02-02 (third-party font origin): 0 `fonts.googleapis.com` / `fonts.gstatic.com` references; 8 self-hosted woff2.
- T-02-03 (inline script/style surface): bundled CSS is external; the only inline `<style>` is the Fonts API `@font-face` block (CSP-hashable Phase 7); the analytics `<script>` is a bundled, Astro-hashed module script.
- T-02-04 (function surface): `.vercel/output/functions` absent → count 0. No `src/pages/api/*` stub created.
- T-02-06 (page weight): 0 images, 0 motion, exactly 2 font files preloaded.

## Next Phase Readiness

- `STATIC_DIR = .vercel/output/static` is resolved and recorded — plan 03 (`js-weight-check.sh`, `security-check.sh`) and plan 04 (`ci.yml`, `lighthouse.yml`) can thread it now, with `"${STATIC_DIR:-.vercel/output/static}"` as the shared fallback.
- The build produces a servable `index.html` with the pt-BR placeholder, external token CSS, two font preloads, and zero functions — ready for the gate scripts to run against.
- Branch is still `master` (rename to `main` owned by plan 01-05).
- `security.csp` intentionally still absent from `astro.config.mjs` (Phase 7). Plan 03's inline-`<style>` check should account for the Fonts API `@font-face` block (see Deviation 2).

## Self-Check: PASSED

- `src/styles/tokens.css` — FOUND
- `src/styles/base.css` — FOUND
- `src/layouts/BaseLayout.astro` — FOUND
- `src/pages/index.astro` — FOUND
- `.prettierrc` — FOUND (modified)
- Commit `43396ca` — FOUND in git history
- Commit `676ae4c` — FOUND in git history

---
*Phase: 01-foundation-ci-gate*
*Completed: 2026-09-08*
