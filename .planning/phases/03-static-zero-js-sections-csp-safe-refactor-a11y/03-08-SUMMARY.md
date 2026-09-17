---
phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
plan: 08
subsystem: ui
tags: [astro, composition, a11y, nav-height, gates]

requires:
  - phase: 03-static-zero-js-sections-csp-safe-refactor-a11y (03-03..03-07)
    provides: SiteHeader, HeroBleed, ServicesSection, ProcessSection, DifferentiatorsSection, AboutSection, ContactSection, FaqSection, CtaFinal, SiteFooter (all zero-JS, verified in isolation)
provides:
  - "src/pages/index.astro: the full one-page composition of all 9 SITE-01 sections inside BaseLayout, with a single h1/header/main/footer and a single skip link"
  - "src/styles/tokens.css: --nav-height carrying the real measured header height (86px mobile default, 68px desktop override at >=860px) instead of the 84px placeholder"
affects: [phase-05-form-endpoint, phase-06-seo-jsonld, phase-07-csp, phase-09-preview-verification]

tech-stack:
  added: []
  patterns:
    - "--nav-height as a single token overridden inside a min-width media query in tokens.css, rather than a second token, so base.css's scroll-margin-top consumer stays unchanged"

key-files:
  created: []
  modified:
    - src/pages/index.astro
    - src/styles/tokens.css
    - src/components/ContactSection.astro
    - src/components/CtaFinal.astro
    - src/components/DifferentiatorsSection.astro
    - src/components/ProcessSection.astro
    - src/components/ServicesSection.astro
    - src/components/SiteFooter.astro
    - src/components/SiteHeader.astro
    - src/pages/obrigado.astro

key-decisions:
  - "The `cases` Content Collection (Phase 2 'projeto próprio' entry + cover) is deliberately NOT rendered on the home in this phase. SITE-01 lists exactly 9 sections and none of them is a portfolio section; TRUST-04 (real client cases/depoimentos) is explicitly deferred to v1.x. This is an intentional omission, not a gap to fix."
  - "--nav-height measured live (headless Chrome via CDP, since no interactive browser session exists in this execution environment) at two breakpoints: 68px at 1440px width, 86px at 390px width. The two values diverge by 18px (>8px threshold), so per the plan's own decision rule the mobile value became the :root default with a `@media (min-width: 860px)` override for desktop, keeping base.css's single `var(--nav-height)` consumer untouched."
  - "No page-level <div overflow-x:clip> wrapper was added around the section composition — each component already scopes its own overflow, avoiding the mobile <details> panel clipping pitfall called out in the plan."

requirements-completed: [SITE-01, SITE-03, SITE-04, SITE-05, A11Y-01, A11Y-02, A11Y-04, ANIM-02, ANIM-07, SEO-02, PERF-05]

duration: 25min
completed: 2026-09-16
---

# Phase 3 Plan 08: Home Composition + nav-height + Full Gate Battery Summary

**Composed `index.astro` from the 10 previously-isolated components into the canonical 9-section SITE-01 order, replaced the provisional 84px `--nav-height` guess with the header's real measured height (68px desktop / 86px mobile), and ran the phase's full local gate battery green.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 3
- **Files modified:** 10 (2 plan-scoped: `index.astro`, `tokens.css`; 8 reformatted by `pnpm format` during Task 3's gate run)

## Accomplishments

- `src/pages/index.astro` now imports and composes all 10 components in the exact SITE-01 order: `SiteHeader` → `<main id="conteudo">` (`HeroBleed`, `ServicesSection`, `ProcessSection`, `DifferentiatorsSection`, `AboutSection`, `ContactSection`, `FaqSection`, `CtaFinal`) → `SiteFooter`. The Phase 1 placeholder `<h1>`/`<style>` block was removed entirely.
- The built `.vercel/output/static/index.html` was mechanically verified to contain `servicos`/`processo`/`diferenciais`/`sobre`/`contato`/`faq` in that exact order of appearance, exactly one `<h1>`/`<main>`/`<header>`/`<footer>`, `id="conteudo"`, the skip-link text exactly once, `lang="pt-BR"`, `fetchpriority="high"`, and both AVIF and WebP `<source>` types.
- `--nav-height` was measured against the running `pnpm dev` server using headless Chrome driven over the Chrome DevTools Protocol (native Node `WebSocket`, no new dependency added) — `getBoundingClientRect().height` on `.site-header` returned 68px at a 1440px viewport and 86px at a 390px viewport. Because the two measurements diverge by more than 8px, `tokens.css` now declares `--nav-height: 86px` in `:root` and overrides it to `68px` inside `@media (min-width: 860px)`; `base.css`'s `scroll-margin-top: var(--nav-height)` rule was not touched.
- All four anchor targets (`#servicos`, `#processo`, `#sobre`, `#contato`) were verified via the same CDP session at both viewport widths: navigating directly to each `#hash` URL leaves the target heading's `getBoundingClientRect().top` within ~1px of the active `--nav-height` value at every breakpoint — i.e. the heading sits immediately below the header, never underneath it.
- The full local gate battery ran green: `pnpm format` (reformatted 8 previously-authored files with only whitespace/wrapping changes, no visual/functional diff), `pnpm lint` (exit 0; 3 pre-existing `noImportantStyles` warnings in `base.css`'s reduced-motion override are an intentional, out-of-scope pattern), `pnpm check` (0 errors), `pnpm build` (AVIF+WebP present in `_astro/`), `scripts/js-weight-check.sh` (1302 B gz — only the pre-existing Vercel Analytics beacon script, budget 20480 B), `scripts/security-check.sh --ci` (5 PASS / 0 FAIL / 2 SKIP — checks 6/7 skip only because no `PREVIEW_URL` exists yet), and all three manual greps (design-editor syntax, non-tokenized hex literals, stray comments) returned empty.

## Task Commits

1. **Task 1: Compor index.astro com as 9 seções na ordem de SITE-01** - `0001370` (feat)
2. **Task 2: Medir a altura real do cabeçalho e fixar --nav-height** - `4649243` (fix)
3. **Task 3: Rodar a bateria completa de gates locais da fase** - `ca9c40f` (style)

**Plan metadata:** (this commit, docs: complete plan)

## Files Created/Modified

- `src/pages/index.astro` - Full replacement: imports `BaseLayout` + all 10 components, composes them in SITE-01 order, no page-level `<style>`
- `src/styles/tokens.css` - `--nav-height` changed from the 84px placeholder to 86px (`:root`) with a 68px override at `@media (min-width: 860px)`
- `src/components/ContactSection.astro`, `CtaFinal.astro`, `DifferentiatorsSection.astro`, `ProcessSection.astro`, `ServicesSection.astro`, `SiteFooter.astro`, `SiteHeader.astro`, `src/pages/obrigado.astro` - Whitespace-only reformatting from `pnpm format` (prettier-plugin-astro), no functional change

## Measurement Evidence (Task 2)

| Viewport | `.site-header` height measured | `--nav-height` value recorded |
|---|---|---|
| 1440px (desktop) | 68px | `68px` (media query `min-width: 860px`) |
| 390px (mobile, below 860px breakpoint) | 86px | `86px` (`:root` default) |

Anchor landing check (heading `top` after navigating to each `#hash`, both breakpoints land within ~1px of the active `--nav-height`):

| Anchor | 1440px top (px) | 390px top (px) |
|---|---|---|
| `#servicos` | 68 | 85.8 |
| `#processo` | 67.6 | 86.1 |
| `#sobre` | 68.5 | 86.5 |
| `#contato` | 67.7 | 86.2 |

Measurement method: `pnpm dev` (Astro dev server) + a headless Chrome instance launched with `--remote-debugging-port`, driven from a Node scratchpad script using the native `WebSocket` global (Node ≥22) to speak the Chrome DevTools Protocol directly (`Emulation.setDeviceMetricsOverride`, `Page.navigate`, `Runtime.evaluate`). No new package was added to the project; both the dev server and the headless Chrome process were stopped (`astro dev stop`, `taskkill`) before continuing.

## Gate Battery Evidence (Task 3, verbatim)

**`bash scripts/js-weight-check.sh`:**
```
diretorio de saida: .vercel/output/static
  <script> inline  1302 B gz (2817 B bruto)
JS da rota da landing (gzip): 1302 B  orcamento: 20480 B
PASS: nenhum framework de UI / biblioteca de animacao nas dependencias
PASS: peso de JS dentro do orcamento
```

**`bash scripts/security-check.sh --ci`:**
```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 8  |  blocos @font-face: 48  |  <script> inline sem src: 4
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 0 (no maximo 1)
SKIP: verificacao 6 - PREVIEW_URL nao definido; inspecao curl -I de cabecalhos adiada
SKIP: verificacao 7 - nenhuma URL de preview disponivel; gate do Lighthouse adiado
== resumo: 5 PASS / 0 FAIL / 2 SKIP ==
```

Manual greps (all returned empty as required):
- `grep -rn 'onClick\|onSubmit\|ref="{{\|{{ \|image-slot\|sc-if' src/` → empty
- `grep -rnE '#[0-9a-fA-F]{6}' src/ --include='*.astro'` → empty
- Comment scan (`/*`, `//` in comment position) across `.astro`/`.css` → empty (the only `//` matches found are inside `https://` URL strings, not comments)

`.vercel/output/static/_astro/` contains both `.avif` and `.webp` files (hero + founder portrait placeholders, plus the existing case cover).

## Decisions Made

- The `cases` collection is not rendered on the home in this phase — recorded verbatim in the plan and here so a future reviewer does not "fix" this as a missing section. SITE-01's 9 sections do not include portfolio; TRUST-04 owns that for v1.x.
- `--nav-height` is a single token with a breakpoint override inside `tokens.css` (not a second token name), keeping `base.css`'s `scroll-margin-top: var(--nav-height)` consumer unchanged, per the plan's explicit instruction.
- No `<title>`, meta description, canonical, OG, or JSON-LD were added to `index.astro` — all Phase 6 scope, as instructed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking, environment adaptation] No interactive browser session for DevTools measurement**
- **Found during:** Task 2
- **Issue:** The plan's instructions assume a human/agent can open DevTools interactively to read `getBoundingClientRect().height`. This execution environment has no interactive browser UI.
- **Fix:** Used the Chrome binary already installed on the machine in headless mode with `--remote-debugging-port`, driving it via the Chrome DevTools Protocol over Node's native `WebSocket` (no new dependency installed — respecting the package-install exclusion under Rule 3). This produces the same authoritative, real-render measurement the plan calls for, just via CDP instead of the DevTools panel.
- **Files modified:** None (measurement-only; result recorded in `tokens.css`)
- **Verification:** Two independent viewport widths measured twice (once for header height, once again per-anchor for scroll landing), both dev server and headless Chrome processes cleanly stopped afterward.
- **Committed in:** `4649243`

None of the other tasks required deviation from the plan.

---

**Total deviations:** 1 (Rule 3, environment adaptation, no scope change)
**Impact on plan:** None — the plan's acceptance criteria (real measured height, not a guess; anchors verified visually below the header at both breakpoints) are met exactly as specified, using CDP instead of an interactive DevTools session.

## Issues Encountered

None beyond the environment adaptation above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The home page is fully composed and passes every mechanical acceptance criterion in the plan (section order, single landmarks, single skip link, `lang="pt-BR"`, `fetchpriority`, AVIF/WebP sources).
- `--nav-height` is now a real measured value, not a placeholder; anchor navigation lands correctly at both the mobile and desktop breakpoints.
- The full local gate battery (`pnpm lint`, `pnpm check`, `pnpm build`, `js-weight-check.sh`, `security-check.sh --ci`, and the three manual greps) is green, matching everything plan `03-09` needs before it runs the same battery against a real Vercel preview (checks 6/7, currently SKIP for lack of `PREVIEW_URL`).
- `requirements-completed` for this plan were already marked `[x]` in `REQUIREMENTS.md`'s traceability table ahead of this execution (Phase 3 rows); this plan's evidence is what makes SITE-01, SITE-05, and the zero-JS claim observable in the actual built HTML rather than just asserted per-component.

---
*Phase: 03-static-zero-js-sections-csp-safe-refactor-a11y*
*Completed: 2026-09-16*

## Self-Check: PASSED
Both modified files (`src/pages/index.astro`, `src/styles/tokens.css`) and all 3 task commits (0001370, 4649243, ca9c40f) verified present.
