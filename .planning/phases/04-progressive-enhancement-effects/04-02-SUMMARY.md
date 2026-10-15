---
phase: 04-progressive-enhancement-effects
plan: 02
subsystem: ui
tags: [intersection-observer, requestanimationframe, vanilla-js, astro-scripts, csp-ready]

requires:
  - phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
    provides: "[data-reveal] markup on every section, .js-ready-gated CSS in base.css, .hero-canvas/.hero-glow elements in HeroBleed.astro, zero shipped JS"
provides:
  - "src/scripts/reveal.ts exporting initReveal() — single IntersectionObserver with unobserve-after-fire and a 2600ms setTimeout fallback"
  - "src/scripts/glow.ts exporting initGlow() — pointer:fine + no-preference gated pointermove handler, rAF single-flight throttle, writes translate3d to the existing .cursor-glow element"
  - "src/scripts/effects.ts — the project's first and only bundled module script, imports and calls initReveal()/initGlow()"
  - "BaseLayout.astro's is:inline .js-ready toggle and the .cursor-glow div + scoped style, rendered on every page using the layout"
  - "--z-cursor-glow: 20 token in tokens.css"
affects: [04-03, 07-security-csp]

tech-stack:
  added: []
  patterns:
    - "First <script> tags in the project: one is:inline pre-paint toggle + one plain <script> importing a bundled TS module — the exact shape Phase 7's security.csp expects (auto-hashable inline script, same-origin bundled module)"
    - "DOM behavior scripts stay class-toggle-only against CSS-owned transitions; the one sanctioned runtime style write (glow's per-frame transform) is documented inline via the plan, not a comment (project has zero comments in versioned files)"

key-files:
  created:
    - src/scripts/reveal.ts
    - src/scripts/glow.ts
    - src/scripts/effects.ts
  modified:
    - src/layouts/BaseLayout.astro
    - src/styles/tokens.css

key-decisions:
  - "--z-cursor-glow set to 20 (not the design source's z-index:5 reused as --z-glow) because every shipped section is position:relative; z-index:var(--z-section) (10) with an opaque background — a glow at 5 would paint invisibly beneath all content. 20 is the smallest degree above --z-section and below --z-nav (50)."
  - "reveal.ts forEach callbacks wrapped in braces (no implicit return) to satisfy Biome's useIterableCallbackReturn rule with zero behavior change"

patterns-established:
  - "effects.ts is the single entry point for all future progressive-enhancement scripts (04-03 adds initParticles() here, no new <script> tag)"

requirements-completed: [ANIM-01, ANIM-03, ANIM-06, ANIM-09]

duration: 4min
completed: 2026-09-17
---

# Phase 4 Plan 2: Reveal and Glow Wiring Summary

**Scroll-reveal IntersectionObserver and pointer-following cursor glow wired into the Fase-3-shipped CSS/markup via exactly two `<script>` tags in `BaseLayout.astro` — the project's first client-side JavaScript.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-09-17T14:41:22Z
- **Completed:** 2026-09-17T14:45:01Z
- **Tasks:** 2 completed
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments
- `initReveal()` lights up the dormant `[data-reveal]`/`.js-ready` CSS from Phase 3 with a single `IntersectionObserver` (`rootMargin: '0px 0px -8% 0px'`, `threshold: 0.08`), unobserving each element after it fires and falling back to a 2600ms `setTimeout` that reveals everything and disconnects the observer — including a no-`IntersectionObserver` degraded path
- `initGlow()` adds a whole-page cursor-following glow, active only under `pointer: fine` + `prefers-reduced-motion: no-preference`, throttled to at most one `transform` write per animation frame via a single-flight `pending` boolean, targeting the existing `.cursor-glow` element rather than creating one at runtime
- `BaseLayout.astro` now ships the project's first two `<script>` tags: a synchronous `is:inline` `.js-ready` toggle in `<head>` (must run pre-paint, never deferred) and a plain `<script>` importing `effects.ts` (Astro's default module processing, CSP-hashable in Phase 7)
- New `--z-cursor-glow: 20` token stacks the glow above every opaque, `z-index: var(--z-section)` section and below the fixed nav, with a documented rationale diverging from the plan's own initial `--z-glow: 5` suggestion (which would have rendered invisibly)
- Total inline JS for the landing route measured at 1717 B gzip against a 20480 B budget

## Task Commits

Each task was committed atomically:

1. **Task 1: reveal.ts e glow.ts** - `368e543` (feat)
2. **Task 2: effects.ts + as três adições no BaseLayout + token de empilhamento** - `6308926` (feat)

**Plan metadata:** pending (this commit)

## Files Created/Modified
- `src/scripts/reveal.ts` - `initReveal()`: single `IntersectionObserver`, unobserve-after-fire, 2600ms fallback, no-IO degraded path, class-toggle only
- `src/scripts/glow.ts` - `initGlow()`: dual media-query gate, `querySelector('.cursor-glow')`, rAF single-flight throttled `pointermove` handler
- `src/scripts/effects.ts` - single bundled entry point, imports and invokes `initGlow()`/`initReveal()` at module top-level, no exports, no try/catch
- `src/layouts/BaseLayout.astro` - added the `is:inline` `.js-ready` script, the `.cursor-glow` div + scoped `<style>` block (640px circle, three locked gradient stops, `mix-blend-mode: screen`, gated `display` via `@media (pointer: fine) and (prefers-reduced-motion: no-preference)`), and the `<script>` importing `effects.ts`
- `src/styles/tokens.css` - added `--z-cursor-glow: 20;` between `--z-section: 10;` and `--z-nav: 50;`

## Decisions Made
- Diverged from `04-PATTERNS.md`'s suggestion to reuse `--z-glow: 5` for the cursor glow — every shipped section is opaque and `z-index: var(--z-section)` (10), so a glow at 5 would be painted underneath all content and invisible site-wide. Introduced `--z-cursor-glow: 20` instead, per the plan's own explicit justification and instruction.
- Fixed three Biome `useIterableCallbackReturn` errors in `reveal.ts` by wrapping the `forEach` arrow bodies in braces (no implicit return) — purely mechanical, zero behavior change, required to keep `pnpm lint` free of new errors.
- Reordered the two imports in `effects.ts` (`glow.ts` before `reveal.ts`) to satisfy Biome's `organizeImports` assist — mechanical, does not affect the call order (`initGlow()` still called after `initReveal()` is not required by the plan; call order left as `initReveal(); initGlow();`).

## Deviations from Plan

None — plan executed exactly as written. The two Biome-driven adjustments above (forEach callback braces, import ordering) are mechanical lint-compliance fixes required to satisfy the plan's own `pnpm lint`/`pnpm check` acceptance criteria, not deviations from the specified logic or locked values.

## Issues Encountered
None. Pre-existing `noImportantStyles` warnings in `src/styles/base.css` (lines 105-107, Phase 3's reduced-motion `!important` rules) surfaced during `pnpm lint` but are out of scope for this plan (file not touched by this plan's tasks) and were left untouched per the scope-boundary rule.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `src/scripts/effects.ts` is the single entry point plan 04-03 must extend with `initParticles()` — no new `<script>` tag needed, per the interfaces contract
- `.cursor-glow` and `.hero-canvas`/`.hero-glow` all coexist correctly; `HeroBleed.astro` and `base.css` were not modified (confirmed via `git diff --name-only` scoped to each task's declared files)
- `pnpm check`, `pnpm test`, `pnpm build`, `bash scripts/js-weight-check.sh` and `bash scripts/security-check.sh` (5 PASS / 0 FAIL / 2 SKIP — preview-URL-dependent checks deferred, as expected pre-deploy) all pass
- No blockers for 04-03

---
*Phase: 04-progressive-enhancement-effects*
*Completed: 2026-09-17*

## Self-Check: PASSED

All created/modified files found on disk; both task commits (`368e543`, `6308926`) found in git history.
