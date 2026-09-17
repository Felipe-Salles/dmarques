---
phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
verified: 2026-09-16T21:15:00Z
status: passed
score: 15/15 must-haves verified
overrides_applied: 0
deferred:
  - truth: "Lighthouse mobile stays >=95 in all four categories on the preview (roadmap Success Criterion 5)"
    addressed_in: "Phase 6"
    evidence: "Phase 6 goal: 'Titles, canonical, OG/Twitter cards, sitemap, robots, favicons, and single-sourced LocalBusiness + FAQPage JSON-LD' — categories.seo is pinned to `warn` (not `error`) in lighthouserc.json specifically because the preview serves `X-Robots-Tag: noindex` under Vercel Deployment Protection, which structurally fails the `is-crawlable` audit regardless of page content. This is a Phase-1 decision (documented in phase-01.md and reaffirmed in phase-03.md), not a Phase 3 defect — Performance, Accessibility and Best Practices all pass >=0.95 on the authoritative CI `lhci` job for this phase's PR."
---

# Phase 3: Static Zero-JS Sections + CSP-safe Refactor + A11y Verification Report

**Phase Goal:** A shippable, fully static, zero-client-JS one-pager — all 9 sections plus the privacy, thank-you, and 404 pages — with every design inline style converted to token-based CSS and accessibility/contrast fixed.
**Verified:** 2026-09-16T21:15:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The 9 design sections render in the canonical SITE-01 order inside `<main>` | ✓ VERIFIED | Built `.vercel/output/static/index.html`: ids `servicos`(8575) → `processo`(11978) → `diferenciais`(14748) → `sobre`(16581) → `contato`(18385) → `faq`(22979) appear in ascending byte-offset order; `HeroBleed`/`CtaFinal` (no id) confirmed present between/after by direct read of `src/pages/index.astro` |
| 2 | Hero "03 Bleed" is faithfully reproduced (eyebrow, 3-line H1, dual CTAs, bled render, glass testimonial) | ✓ VERIFIED | `src/components/HeroBleed.astro` contains all elements; visual-fidelity gaps found at human checkpoint (15 items, see `03-UI-GAPS.md`) were fixed in commits `d841af9`..`e0b5f01` and re-approved by Felipe with literal "aprovado" — independently confirmed current CSS values (`--color-text-strong: #ffffff`, CTA color swap, underline reset, nav-border, hero peek height) match the gap-closure log |
| 3 | Zero client JavaScript anywhere on the site | ✓ VERIFIED | `grep -rn "<script" src/` → empty; `bash scripts/js-weight-check.sh` → 1302 B gz (only the pre-existing Vercel Analytics beacon), budget 20480 B, PASS |
| 4 | `grep -r 'style="' src/` returns nothing; `:hover`/`:focus-visible` are real CSS | ✓ VERIFIED | `grep -rn 'style="' src/` → empty; `security-check.sh --ci` verificacao 2 PASS; spot-checked `:hover, :focus-visible` grouped pairs in `SiteHeader`, `HeroBleed`, `ServicesSection`, `DifferentiatorsSection`, `ContactSection`, `CtaFinal` |
| 5 | `/politica-de-privacidade`, `/obrigado`, and a branded `/404` exist | ✓ VERIFIED | `pnpm build` produces all three; built HTML contains "Recebemos seu pedido" / "Política de Privacidade" / "Página não encontrada" respectively; live-preview check in `03-09-PLAN.md` Task 1 confirmed real HTTP 404 (not the Vercel generic 404) with no stack/Error/path leak |
| 6 | Anchor nav lands below the header (`scroll-margin-top`), reverts to `auto` scroll under reduced-motion; mobile nav is keyboard-operable, no JS framework, no focus trap | ✓ VERIFIED | `src/styles/base.css` declares `scroll-margin-top: var(--nav-height)` on the 6 section ids + `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }`; `--nav-height` measured live via CDP (68px desktop / 86px mobile) in 03-08; `<details>`/`<summary>` disclosure in `SiteHeader.astro`, zero `aria-expanded` (native semantics), human checkpoint confirmed keyboard open/close and CTA staying outside the menu |
| 7 | Working visible skip link, semantic landmarks, single `<h1>`, `lang="pt-BR"` | ✓ VERIFIED | Built HTML: exactly 1 `<h1>`, 1 `<main>`, 1 `<header>`, 1 `<footer>`, skip-link text appears exactly once, `lang="pt-BR"` present |
| 8 | Real `<label for>`/`id`/`name` on all 5 form fields; focus rings ≥3:1 on dark and light sections | ✓ VERIFIED | `ContactSection.astro` has matched `for`/`id`/`name` for `nome`/`whatsapp`/`email`/`tipo-projeto`/`mensagem`; `required` appears exactly twice (nome, tipo-projeto); global `:focus-visible { outline: 3px solid var(--color-accent) }` in `base.css` + `--focus-ring` opaque box-shadow for form inputs — both computed ≥3:1 by the plan's contrast-solver script (RED→GREEN evidence in `03-02-SUMMARY.md`) |
| 9 | Real alt text on founder portrait; decorative render/canvas/glow marked `aria-hidden` | ✓ VERIFIED | `AboutSection.astro`: `alt="Felipe Salles, fundador da Dmarques"`; `HeroBleed.astro`: hero `<Picture alt="" aria-hidden="true">`, `<canvas aria-hidden="true">`, glow `<div aria-hidden="true">` |
| 10 | All text meets WCAG AA contrast (translucent-white tokens raised, with design sign-off) | ✓ VERIFIED | `--color-text-faint` raised to alpha .47 (03-02), `--color-text-strong` raised to `#ffffff` (gap-closure, commit `d841af9`), non-token `#9096A8` in Diferenciais replaced with `--color-light-text-muted`; design/contrast sign-off is the human "aprovado" response captured verbatim in `03-09-SUMMARY.md`, doubling as A11Y-06/D-13 sign-off per the plan's own acceptance criteria |
| 11 | All raster images via `astro:assets`, explicit dimensions, AVIF/WebP; hero LCP uses `fetchpriority="high"`; zero runtime image optimization | ✓ VERIFIED | Built `index.html` contains `fetchpriority="high"`, `type="image/avif"`, `type="image/webp"`; `.vercel/output/static/_astro/` contains `.avif`/`.webp` files; live-preview check confirmed no `_vercel/image` string in served HTML (Task 1, 03-09) |
| 12 | With JavaScript disabled, the whole page remains visible (reveal gated on `.js-ready` + `prefers-reduced-motion: no-preference`) | ✓ VERIFIED | `base.css`: `[data-reveal] { opacity: 1; transform: none }` is the unconditional default; hidden state only applies inside `html.js-ready [data-reveal]` scoped under `@media (prefers-reduced-motion: no-preference)` — since Phase 3 ships no JS, `js-ready` never gets added to `<html>`, so every element renders visible by construction; human checkpoint independently confirmed via DevTools "Disable JavaScript" |
| 13 | Every `<hover>` state has a `:focus-visible` equivalent; transitions restricted to transform/opacity/box-shadow/border-color, ≤300ms | ✓ VERIFIED | Grouped `:hover, :focus-visible` / `:hover, :focus-within` rules spot-checked across `SiteHeader`, `HeroBleed`, `ServicesSection`, `DifferentiatorsSection`, `ContactSection`, `CtaFinal`, `SiteFooter`; `grep -nE "transition[^;]*(width|height|top|left|margin|padding)"` returns nothing in `base.css`; `DifferentiatorsSection` explicitly avoids `transition: background` per plan instruction |
| 14 | Requirement-ID traceability: every ID in the phase's plans maps to REQUIREMENTS.md and none are orphaned | ✓ VERIFIED | Union of all 9 plans' `requirements:` frontmatter == exactly {SITE-01..09, A11Y-01..07, ANIM-02, ANIM-07, ANIM-08, SEO-02, PERF-05} == the phase's declared requirement list; REQUIREMENTS.md traceability table marks all as "Phase 3 / Complete"; no orphans |
| 15 | SEC-07 checklist run passes with no open High finding | ✓ VERIFIED | `.planning/security/runs/phase-03.md`: 7/7 gabarito items answered, findings table `P03-001`..`P03-006` + carried `P02-003`, explicit "nenhum achado High em aberto" declaration, signed off by Felipe's "aprovado" |

**Score:** 15/15 truths verified

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Lighthouse mobile ≥95 in **all four** categories (roadmap SC5) | Phase 6 | `categories.seo` scores 0.5 on the CI `lhci` job because the preview is under Vercel Deployment Protection (`X-Robots-Tag: noindex`), which fails the `is-crawlable` audit structurally, independent of page content. `lighthouserc.json` pins `categories.seo` to `warn` (not `error`) for exactly this reason — a Phase-1 decision reaffirmed in `phase-03.md`. Performance, Accessibility, and Best Practices all pass with no assertion failures on the PR's `lhci` job. Phase 6 ("Titles, canonical, OG/Twitter cards, sitemap, robots, favicons...") is what makes the site indexable and restores the `error` assertion. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/pages/index.astro` | 9-section composition, single landmarks | ✓ VERIFIED | Confirmed by build + structural greps above |
| `src/components/SiteHeader.astro` | Skip link, anchor nav, `<details>` mobile disclosure, CTA outside menu | ✓ VERIFIED | Present, `aria-expanded` absent (native), CTA sibling of `<details>` |
| `src/components/HeroBleed.astro` | Hero "03 Bleed", `<Picture priority>` | ✓ VERIFIED | `alt=""`, `aria-hidden="true"`, `<canvas>` inert |
| `src/components/AboutSection.astro` | Founder portrait, real alt, no `priority` | ✓ VERIFIED | Confirmed, no `priority` attribute present |
| `src/components/ServicesSection.astro` / `ProcessSection.astro` / `DifferentiatorsSection.astro` / `FaqSection.astro` | Collection-driven, zero JS | ✓ VERIFIED | `getServices`/`getProcess`/`getDifferentiators`/`getFaq` imports confirmed; no `set:html`, no hardcoded copy, `padStart` derivation present in ProcessSection is NOT used (numero comes from schema field) and correctly used in DifferentiatorsSection |
| `src/components/ContactSection.astro` | 5-field static form, no `action`/`method` | ✓ VERIFIED | Confirmed via grep — zero occurrences of `action=`/`method=`/`onsubmit` |
| `src/components/CtaFinal.astro` / `SiteFooter.astro` | Closing CTA, footer landmark/NAP | ✓ VERIFIED | Confirmed present, `rel="noopener noreferrer"` on all `target="_blank"` links |
| `src/pages/obrigado.astro` / `politica-de-privacidade.astro` / `404.astro` | Utility routes | ✓ VERIFIED | Build produces all three with correct copy |
| `src/styles/tokens.css` / `base.css` | Corrected contrast tokens, global contracts | ✓ VERIFIED | `--focus-ring` opaque, `--color-text-faint` .47, `--color-text-strong` `#ffffff`, `--nav-height` measured (86/68px), reveal/reduced-motion/scroll contracts present |
| `.planning/security/runs/phase-03.md` | SEC-07 execution record | ✓ VERIFIED | Exists, complete, signed |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/pages/index.astro` | `src/components/*.astro` | imports + composition order | WIRED | All 10 components imported and rendered in SITE-01 order |
| `src/styles/base.css` | `src/styles/tokens.css` | `var(--nav-height)`, `var(--focus-ring-offset)` | WIRED | Confirmed literal strings present |
| `src/components/ContactSection.astro` | `src/content/project-types.ts` | `PROJECT_TYPES.map()` | WIRED | `<option>` list generated from the shared enum, not hand-authored |
| `src/components/ServicesSection.astro`/`ProcessSection.astro`/etc. | `src/content/index.ts` | `getServices()`/`getProcess()`/etc. | WIRED | All confirmed via frontmatter imports; zero hardcoded collection copy |
| `SiteHeader.astro` skip link | `#conteudo` in `index.astro` | `href="#conteudo"` / `<main id="conteudo">` | WIRED | Both ends confirmed present |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Production build succeeds | `pnpm build` | 4 pages built, exit 0, AVIF/WebP generated | ✓ PASS |
| Type/template check | `pnpm check` | 0 errors, 0 warnings, 0 hints (20 files) | ✓ PASS |
| No inline `style=` in source | `grep -rn 'style="' src/` | empty | ✓ PASS |
| No client `<script>` in source | `grep -rn "<script" src/` | empty | ✓ PASS |
| JS weight budget | `bash scripts/js-weight-check.sh` | 1302 B gz / 20480 B budget, PASS | ✓ PASS |
| Security mechanical gates | `bash scripts/security-check.sh --ci` | 5 PASS / 0 FAIL / 2 SKIP (SKIP = no PREVIEW_URL, expected locally) | ✓ PASS |
| No non-token hex literals in `.astro` | `grep -rnE '#[0-9a-fA-F]{6}' src/ --include='*.astro'` | empty | ✓ PASS |
| No `set:html` anywhere | `grep -rn "set:html" src/` | empty | ✓ PASS |
| No design-editor syntax leakage | `grep -rnE "onClick|onSubmit|ref=\"\{\{|image-slot|sc-if|\{\{ " src/` | empty | ✓ PASS |

### Probe Execution

Not applicable — this phase has no `scripts/*/tests/probe-*.sh` convention; `security-check.sh`/`js-weight-check.sh` (run above) are the project's equivalent mechanical gates and were executed directly, not simulated.

### Requirements Coverage

| Requirement | Source Plan(s) | Status | Evidence |
|-------------|----------------|--------|----------|
| SITE-01 | 03-05, 03-06, 03-07, 03-08 | ✓ SATISFIED | 9 sections in canonical order, confirmed in built HTML |
| SITE-02 | 03-04 | ✓ SATISFIED | HeroBleed fidelity, human-approved after gap closure |
| SITE-03 | 03-05, 03-06, 03-07, 03-08 | ✓ SATISFIED | Zero `<script>`, JS weight = analytics beacon only |
| SITE-04 | 03-05, 03-06, 03-07, 03-08 | ✓ SATISFIED | No `style=` anywhere in `src/` |
| SITE-05 | 03-02, 03-08 | ✓ SATISFIED | `scroll-margin-top` + measured `--nav-height` |
| SITE-06 | 03-03, 03-09 | ✓ SATISFIED | `<details>` disclosure, human-verified keyboard operability |
| SITE-07 | 03-03 | ✓ SATISFIED | `/obrigado` builds and reads correctly |
| SITE-08 | 03-03, 03-09 | ✓ SATISFIED | `/404` branded, live-preview HTTP 404 confirmed |
| SITE-09 | 03-01, 03-04, 03-08 | ✓ SATISFIED | `astro:assets`, AVIF/WebP, `fetchpriority="high"`, no `_vercel/image` |
| A11Y-01 | 03-03, 03-08 | ✓ SATISFIED | Skip link first node, single occurrence |
| A11Y-02 | 03-03, 03-04, 03-05, 03-06, 03-07, 03-08 | ✓ SATISFIED | Single landmarks, correct heading hierarchy |
| A11Y-03 | 03-02, 03-09 | ✓ SATISFIED | Opaque `--focus-ring`/`outline`, contrast-solver GREEN |
| A11Y-04 | 03-03, 03-08, 03-09 | ✓ SATISFIED | Keyboard-operable, human-checkpoint confirmed no trap |
| A11Y-05 | 03-04 | ✓ SATISFIED | Real alt on portrait, decoratives `aria-hidden` |
| A11Y-06 | 03-02, 03-05, 03-06, 03-07, 03-09 | ✓ SATISFIED | Token fixes + human design sign-off ("aprovado") |
| A11Y-07 | 03-02, 03-03, 03-09 | ✓ SATISFIED | Global reduced-motion guard in `base.css` |
| ANIM-02 | 03-02, 03-04, 03-05, 03-06, 03-07, 03-08, 03-09 | ✓ SATISFIED | `[data-reveal]` visible-by-default contract |
| ANIM-07 | 03-02, 03-03, 03-04, 03-05, 03-06, 03-07, 03-08, 03-09 | ✓ SATISFIED | Grouped hover/focus-visible, restricted transition properties |
| ANIM-08 | 03-02 | ✓ SATISFIED | `scroll-behavior: smooth` → `auto` under reduced-motion |
| SEO-02 | 03-03, 03-08 | ✓ SATISFIED | `lang="pt-BR"` present |
| PERF-05 | 03-01, 03-04, 03-08, 03-09 | ✓ SATISFIED | Sharp build-time only, no runtime image optimization |

**No orphaned requirements** — the union of all plan `requirements:` frontmatter across 03-01..03-09 exactly matches the phase's declared 21-requirement list from ROADMAP.md/REQUIREMENTS.md.

### Anti-Patterns Found

None. Scanned all files modified in this phase (`src/components/*.astro`, `src/pages/*.astro`, `src/styles/*.css`) for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/"coming soon"/"not yet implemented" — the only matches were false positives (the `placeholder="..."` form-field HTML attribute, and Portuguese words containing the substring "todo"/"método"). No debt markers, no stub returns, no empty handlers.

### Human Verification Required

None. This phase's own workflow (plan 03-09, Task 3, `checkpoint:human-verify` gate) already executed the human-verification items that would otherwise require escalation here — keyboard-only navigation, no-JS visibility, reduced-motion behavior, anchor landing, and visual/contrast fidelity — directly against a live Vercel preview. The checkpoint was initially **rejected** with 15 specific fidelity items (transcribed verbatim in `03-09-SUMMARY.md` and traced to root cause in `03-UI-GAPS.md`), all fixed in commits `d841af9`..`e0b5f01`, and re-approved with a literal "aprovado" response. This verification independently confirmed, by reading the current file contents (not the SUMMARY narrative), that the specific CSS/token changes described in the gap-closure log are actually present in the codebase (e.g., `--color-text-strong: #ffffff`, hero CTA color swap, WhatsApp underline-only treatment, nav-pill neutral border, contact textarea `resize: none`, softened glow tokens). No further human verification is warranted.

### Gaps Summary

No blocking gaps. One item is deferred to Phase 6 (Lighthouse SEO category, structurally blocked by preview Deployment Protection's `noindex` header — not a defect introduced by or fixable within Phase 3). All 15 derived observable truths, all required artifacts, and all key links are verified against the current state of the codebase (post-gap-closure commits), not merely against SUMMARY.md narrative. `pnpm build`, `pnpm check`, `bash scripts/security-check.sh --ci`, and `bash scripts/js-weight-check.sh` were re-run independently during this verification and all pass. All 21 requirement IDs declared across the phase's 9 plans are accounted for with no orphans.

---

*Verified: 2026-09-16T21:15:00Z*
*Verifier: Claude (gsd-verifier)*
