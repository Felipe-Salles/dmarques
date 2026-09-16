---
phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
plan: 02
subsystem: ui
tags: [css, wcag, contrast, a11y, tokens, reduced-motion, astro]

requires:
  - phase: 01-foundation
    provides: src/styles/tokens.css and src/styles/base.css scaffold (color-scheme dark, spacing/typography scale, initial focus-ring/text tokens)
provides:
  - Corrected --color-text-faint (0.47 alpha) and --focus-ring (opaque --color-accent) tokens passing WCAG AA/non-text 3:1
  - New --nav-height token (84px provisional, revised in 03-08)
  - Global :focus-visible outline contract (outline-based, immune to overflow:hidden clipping)
  - Global anchor scroll-margin-top contract for 6 section ids + prefers-reduced-motion: reduce -> scroll-behavior: auto
  - Global inert reveal contract ([data-reveal] / html.js-ready / .is-revealed) that all 03-03..03-07 section components will consume
  - Global dmFloat/dmPulse keyframes plus a project-wide prefers-reduced-motion: reduce guard (animation/transition duration collapse)
affects: [03-03, 03-04, 03-05, 03-06, 03-07, 03-08, phase-04-scroll-reveal-js]

tech-stack:
  added: []
  patterns:
    - "Ad-hoc, non-versioned WCAG contrast verifier script (scratchpad-only, D-13) run before/after token edits to prove remediation numerically rather than by eyeballing"
    - "outline (not box-shadow) as the global :focus-visible mechanism, reserving --focus-ring box-shadow for components needing it explicitly (form inputs)"
    - "CSS-only 'inert until JS arrives' reveal contract: hidden state scoped to html.js-ready so zero-JS default render is 100% visible"

key-files:
  created: []
  modified:
    - src/styles/tokens.css
    - src/styles/base.css

key-decisions:
  - "Contrast fixes applied via calculate-and-apply (D-13): --color-text-faint raised from alpha .45 to .47, --focus-ring switched from 50%-alpha accent to fully opaque var(--color-accent) -- both verified by an ad-hoc contrast-solver script (scratchpad, not committed) that went from 6 FAIL to 0 FAIL"
  - "--nav-height added as a provisional 84px token, explicitly flagged for revision once 03-08 measures the real rendered SiteHeader height"
  - "Global :focus-visible uses outline instead of the --focus-ring box-shadow token, because outline is never clipped by ancestor overflow:hidden (hero/CTA-final containers), while --focus-ring stays available for form inputs"
  - "prefers-reduced-motion: reduce consolidated into one block covering both scroll-behavior: auto and the global animation/transition duration collapse, satisfying the plan's 'one consolidated block' allowance"

requirements-completed: [A11Y-03, A11Y-06, A11Y-07, ANIM-02, ANIM-07, ANIM-08, SITE-05]

duration: 6min
completed: 2026-09-16
---

# Phase 3 Plan 02: Token Contrast Fixes + Global CSS Contracts Summary

**Fixed two WCAG-failing design tokens (`--color-text-faint`, `--focus-ring`) via a numeric contrast solver and authored the global `base.css` contracts (focus, anchor scroll, inert reveal, reduced-motion) that all later Phase 3 section components inherit.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-09-16T02:35:03-03:00 (previous plan commit)
- **Completed:** 2026-09-16T02:37:44-03:00
- **Tasks:** 3 completed
- **Files modified:** 2

## Accomplishments

- Authored an ad-hoc WCAG contrast-solver script (scratchpad, never committed per D-13) implementing `hexToRgb`/`relLuminance`/`contrastRatio`/`compositeOver`/`minAlphaForRatio` exactly per the research spec (0.04045 linearization threshold). Ran RED against the unmodified `tokens.css`: 6 assertions failed (`--color-text-faint` at 4.46-4.49 vs 4.5 target on all three dark backgrounds; `--focus-ring` at 1.78-2.12 vs 3.0 target on all three backgrounds).
- Applied the two locked token fixes in `tokens.css` (`--color-text-faint` -> `rgba(255,255,255,0.47)`, `--focus-ring` -> `0 0 0 3px var(--color-accent)`) plus the new provisional `--nav-height: 84px` token. Re-ran the solver: 0 failures, all 24 assertions OK (text tokens, focus-ring, `--color-accent`, `--color-accent-light`, `--color-light-text-muted` across every relevant background).
- Extended `base.css` with five global contracts: expanded margin reset (h2/h3/h4/figure/blockquote + `img,svg,picture{display:block;max-width:100%}`), global `:focus-visible` outline (outline-based so it survives `overflow:hidden` ancestors) with `:focus:not(:focus-visible){outline:none}`, anchor scroll (`scroll-behavior:smooth` + `scroll-margin-top:var(--nav-height)` on all 6 section ids + reduced-motion reversal to `auto`), the exact ANIM-02 inert-reveal contract (`[data-reveal]`/`html.js-ready`/`.is-revealed`), and `dmFloat`/`dmPulse` keyframes with a consolidated `prefers-reduced-motion: reduce` guard collapsing all animation/transition durations project-wide.

## Task Commits

Each task was committed atomically:

1. **Task 1: Criar o verificador de contraste WCAG (scaffold Wave 0)** - no commit (scratchpad-only artifact per D-13; `git status --porcelain` confirmed clean tree). RED output captured below.
2. **Task 2: Aplicar as correções de contraste e adicionar --nav-height** - `fab5f42` (fix)
3. **Task 3: Escrever os contratos globais em base.css** - `7c35150` (feat)

**Plan metadata:** pending (this commit)

### Task 1 RED evidence (contrast-solver against unmodified tokens.css)

```
FAIL --color-text-faint vs #0A0A12 ratio=4.489 target=4.5
FAIL --color-text-faint vs #05050A ratio=4.487 target=4.5
FAIL --color-text-faint vs #0D1B2A ratio=4.462 target=4.5
FAIL --focus-ring vs #0A0A12 ratio=1.777 target=3
FAIL --focus-ring vs #FFFFFF ratio=2.124 target=3
FAIL --focus-ring vs #F2F3F6 ratio=2.047 target=3

6 asserção(oes) FAIL
EXIT:1
```

### Task 2 GREEN evidence (contrast-solver after token fixes)

```
OK --color-text-faint vs #0A0A12 ratio=4.810 target=4.5
OK --color-text-faint vs #05050A ratio=4.815 target=4.5
OK --color-text-faint vs #0D1B2A ratio=4.724 target=4.5
OK --focus-ring vs #0A0A12 ratio=3.864 target=3
OK --focus-ring vs #FFFFFF ratio=5.103 target=3
OK --focus-ring vs #F2F3F6 ratio=4.599 target=3
...
Todas as asserções OK
EXIT:0
```

## Files Created/Modified

- `src/styles/tokens.css` - `--color-text-faint` raised to alpha .47, `--focus-ring` switched to opaque `var(--color-accent)`, new `--nav-height: 84px` token added
- `src/styles/base.css` - expanded margin reset, global `:focus-visible` outline contract, anchor scroll-margin-top + reduced-motion reversal, inert reveal contract, `dmFloat`/`dmPulse` keyframes + consolidated reduced-motion guard

## Decisions Made

- Contrast remediation followed D-13 exactly (calculate-and-apply, no per-value sign-off table) — see Key Decisions in frontmatter.
- `--nav-height` shipped as a documented provisional value (84px), not left silently as a permanent guess — 03-08 owns measuring the real header height.
- Global focus ring uses CSS `outline` rather than the `--focus-ring` box-shadow token, since `outline` is never clipped by `overflow:hidden` ancestors present in the hero/CTA-final sections; `--focus-ring` remains available for form inputs that need a box-shadow-style ring.

## Deviations from Plan

None - plan executed exactly as written. All three tasks matched their `<action>` and `<verify>` blocks precisely; no Rule 1-4 triggers encountered.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `tokens.css` and `base.css` now provide a WCAG-AA-passing, zero-JS-safe foundation for every section component authored in 03-03 through 03-07.
- `--nav-height` is a known-provisional value; 03-08 must measure the real rendered `SiteHeader` height (mobile + desktop) and update the token — flagged here so it is not forgotten.
- `html.js-ready`/`is-revealed`/`data-reveal` contract is locked and ready for Phase 4's IntersectionObserver to attach to without any CSS changes.
- `bash scripts/security-check.sh --ci` still reports 5 PASS / 0 FAIL / 2 SKIP (unchanged from the Phase 2 baseline) — no regression introduced by this plan's CSS-only changes.

---
*Phase: 03-static-zero-js-sections-csp-safe-refactor-a11y*
*Completed: 2026-09-16*
