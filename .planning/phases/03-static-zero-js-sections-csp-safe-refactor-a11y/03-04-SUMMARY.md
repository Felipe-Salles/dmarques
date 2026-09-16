---
phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
plan: 04
subsystem: ui
tags: [astro, astro-assets, picture, sharp, a11y, contrast, csp-safe-css]

requires:
  - phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
    provides: "sharp@0.35.4 devDependency + branded placeholder WebP assets (03-01), corrected --focus-ring/--color-text-faint/--color-accent-light tokens (03-02), SiteHeader.astro nav/wordmark (03-03)"
provides:
  - "HeroBleed.astro: the '03 Bleed' hero variant reproduced as zero-JS Astro markup (eyebrow, single site-wide <h1>, lead paragraph, primary/secondary CTAs, inert canvas + glow fixture points, right-bled render via astro:assets Picture with fetchpriority=high, glass testimonial card)"
  - "AboutSection.astro: Sobre section with founder-portrait Picture (real final alt text, lazy-loaded), bio copy, corrected-contrast eyebrow, secured Instagram link"
affects: [03-05, 03-08]

tech-stack:
  added: []
  patterns:
    - "astro:assets <Picture> with priority (LCP) vs. no priority (below-fold, lazy) established as the canonical image pattern for later section plans"
    - "Decorative visual layers (canvas/glow/render) marked aria-hidden with overflow:hidden scoped to their own container, never to the section or a page wrapper"

key-files:
  created:
    - src/components/HeroBleed.astro
    - src/components/AboutSection.astro
  modified: []

key-decisions:
  - "Primary hero CTA follows PLAN.md's explicit token contract (background: var(--color-accent) at rest, var(--color-accent-hover) on hover/focus) rather than the design source's literal white-fill/dark-text styling — PLAN.md's token instructions are authoritative over the raw design file per the phase's design-to-code conversion contract."
  - "Hero glow uses the `transparent` CSS keyword for its radial-gradient fade-out stop instead of an rgba() literal, avoiding any hard-coded RGB channel values while still satisfying the visual fade design intent."
  - "Neither component is wired into index.astro yet — page assembly is explicitly plan 03-08's scope; this plan's contract is limited to the two consuming components per its own file_modified list."

requirements-completed: [SITE-02, SITE-09, A11Y-02, A11Y-05, ANIM-02, ANIM-07, PERF-05]

duration: 12min
completed: 2026-09-16
---

# Phase 3 Plan 4: HeroBleed + AboutSection Summary

**Hero "03 Bleed" and Sobre section authored as zero-JS Astro components consuming astro:assets `<Picture>` for the LCP render (fetchpriority=high, AVIF/WebP) and the founder portrait (lazy, real alt text).**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-09-16T05:55:58Z
- **Tasks:** 2
- **Files modified:** 2 (both created)

## Accomplishments
- `HeroBleed.astro` reproduces the "03 Bleed" hero: eyebrow, the site's single `<h1>` with the accent-highlighted third line, lead paragraph, primary ("Começar um projeto") and secondary ("Falar no WhatsApp", secured with `rel="noopener noreferrer"`) CTAs, an inert `<canvas>` + radial glow fixture point for Phase 4, the right-bled 3D render via `<Picture priority formats={['avif','webp']} width={960} height={720}>`, and the glass testimonial card — with zero client JS, zero inline `style=`, and no duplicate `<nav>`/wordmark.
- `AboutSection.astro` ships the Sobre section (`id="sobre"`) with the founder portrait via `<Picture alt="Felipe Salles, fundador da Dmarques" formats={['avif','webp']} width={480} height={600}>` (no `priority` — below-fold, default lazy load), the verbatim bio copy, the corrected-contrast `--color-accent-light` eyebrow, and a secured Instagram link.
- Both files carry `data-reveal="1"` groundwork markup (About) and stay 100% visible without any JS this phase, matching the Phase 3 reveal-markup contract.

## Task Commits

Each task was committed atomically:

1. **Task 1: HeroBleed.astro — the Hero "03 Bleed" fiel, zero JS** - `71a9dbb` (feat)
2. **Task 2: AboutSection.astro — retrato do fundador com alt real e bio** - `7f9d734` (feat)

**Plan metadata:** pending (this commit)

## Files Created/Modified
- `src/components/HeroBleed.astro` - Hero "03 Bleed" section: content column (eyebrow/H1/lead/CTAs) + visual column (canvas, glow, right-bled Picture render, glass testimonial)
- `src/components/AboutSection.astro` - Sobre section: portrait column (Picture + decorative halo) + copy column (eyebrow/H2/subtitle/bio/Instagram link)

## Decisions Made
- Followed PLAN.md's explicit primary-CTA token contract (`var(--color-accent)` fill at rest) over the raw design source's white-fill styling, since PLAN.md's task instructions are the authoritative conversion contract for this phase (design source is reference-only per 03-RESEARCH.md Pitfall 5).
- Used the `transparent` CSS keyword rather than an `rgba(108,76,255,0)` literal for the hero glow's gradient fade-out stop, keeping every color value token- or keyword-derived with zero hard-coded RGB channels.
- Confirmed via `.planning/phases/.../03-08-PLAN.md` that final `index.astro` composition (importing these two components) is out of this plan's scope — deferred intentionally, not a gap.

## Deviations from Plan

None — plan executed exactly as written. `pnpm format` (Prettier + Biome) additionally reformatted two previously-committed, out-of-scope files (`SiteHeader.astro`, `obrigado.astro`); those unrelated formatting changes were reverted with `git checkout --` before committing, keeping each task commit scoped to only its own files per the task_commit_protocol scope boundary.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `HeroBleed.astro` and `AboutSection.astro` are ready to be imported by `index.astro` in plan 03-08 alongside the other section components.
- The `<canvas>` and glow fixture points in `HeroBleed.astro` are inert (no `ref`, no JS) and ready for Phase 4's IntersectionObserver/particle-network script to attach to by class name.
- `pnpm build` succeeds end-to-end (Sharp/astro:assets pipeline confirmed working from plan 03-01); `bash scripts/security-check.sh --ci` remains 5 PASS / 0 FAIL / 2 SKIP.

---
*Phase: 03-static-zero-js-sections-csp-safe-refactor-a11y*
*Completed: 2026-09-16*

## Self-Check: PASSED

- FOUND: src/components/HeroBleed.astro
- FOUND: src/components/AboutSection.astro
- FOUND: 71a9dbb (Task 1 commit)
- FOUND: 7f9d734 (Task 2 commit)
