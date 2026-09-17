---
phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
plan: 06
subsystem: ui
tags: [astro, content-collections, a11y, css-tokens, wcag-contrast]

requires:
  - phase: 02-content-collections-cases-differentiators
    provides: differentiators and faq Content Collections (getDifferentiators/getFaq in src/content/index.ts)
  - phase: 03-02
    provides: global CSS tokens, [data-reveal] contract, :focus-visible, scroll-margin-top anchors
provides:
  - DifferentiatorsSection.astro rendering 4 items from the differentiators collection on the page's only light-background section, with numbering derived from data.order (no literal "01".."04")
  - FaqSection.astro rendering 4 question/answer pairs from the faq collection, questions as <h3>, answers always visible (no accordion)
affects: [03-08-assembly, 06-seo-jsonld, 07-csp]

tech-stack:
  added: []
  patterns:
    - "Numeric label derivation via String(item.data.order).padStart(2, '0') instead of a schema numero field or literal strings — single source of truth when items are reordered"
    - "Light-background section (--color-light-*) contrast math kept separate from the dark-section token family; --color-accent used as-is on light bg (4.599:1) while --color-accent-light is reserved for dark-bg small text (D-14)"

key-files:
  created:
    - src/components/DifferentiatorsSection.astro
    - src/components/FaqSection.astro
  modified: []

key-decisions:
  - "Design's literal non-token color #9096A8 (2.661:1 against #F2F3F6, fails 3:1 for large text) replaced with the existing --color-light-text-muted token (6.0:1) instead of inventing a new intermediate tone — no new token added"
  - "Differentiators tile hover swaps background instantly and transitions only box-shadow/border-color, since background is not in the ANIM-07 allowed transition-property list (transform/opacity/box-shadow/border-color)"
  - "FAQ questions render as <h3> (not <p>) and answers stay always visible with no <details>/<summary> accordion, per the UI-SPEC locked decision — keeps heading-based screen-reader navigation and matches the FAQPage JSON-LD structure Phase 6 will emit from the same collection"
  - "FAQ answer text interpolated as an escaped {item.data.resposta} text node, never set:html — schema defines it as plain text with no Markdown"

requirements-completed: [SITE-01, SITE-03, SITE-04, A11Y-02, A11Y-06, ANIM-02, ANIM-07]

duration: ~10min
completed: 2026-09-16
---

# Phase 03 Plan 06: DifferentiatorsSection + FaqSection Summary

**Two zero-JS, collection-driven sections — the page's only light-background section (Diferenciais, with a corrected non-token color) and the FAQ (heading-structured, always-visible answers, ready for Phase 6's JSON-LD reuse).**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-09-16T03:10:xxZ (approx, derived from commit timestamps)
- **Completed:** 2026-09-16T06:11:08Z
- **Tasks:** 2
- **Files modified:** 2 (both created)

## Accomplishments
- `DifferentiatorsSection.astro` renders all 4 items from `getDifferentiators()` on `var(--color-light-bg)`, the page's only light section, with tile numbering derived via `String(item.data.order).padStart(2, '0')` and the design's non-token `#9096A8` corrected to `var(--color-light-text-muted)` (6.0:1)
- `FaqSection.astro` renders all 4 pairs from `getFaq()` with each question as `<h3>` and each answer as an always-visible `<p>`, eyebrow migrated to `var(--color-accent-light)` per D-14
- Both sections consume the `[data-reveal]`, `:focus-within`/`:focus-visible`, and `scroll-margin-top` contracts from plan 03-02 with no new global CSS

## Task Commits

Each task was committed atomically:

1. **Task 1: DifferentiatorsSection.astro — light-background grid with derived numbering and corrected contrast** - `31f7bbb` (feat)
2. **Task 2: FaqSection.astro — 4 Q/A pairs as shared source for future JSON-LD** - `65db2d7` (feat)

**Plan metadata:** this commit (docs: close out plan after executor session interruption)

## Files Created/Modified
- `src/components/DifferentiatorsSection.astro` - Only light-background section; 4 tiles from the `differentiators` collection, derived numbering, corrected `--color-light-text-muted` heading span, hover transitioning only `box-shadow`
- `src/components/FaqSection.astro` - FAQ section; 4 Q/A pairs from the `faq` collection, questions as `<h3>`, answers always visible, no `set:html`

## Decisions Made
- See `key-decisions` in frontmatter above — contrast token substitution, ANIM-07-compliant hover transition, `<h3>`-not-`<p>` question structure, and escaped-text FAQ answers.

## Deviations from Plan

None - plan executed exactly as written (verified by re-running every automated acceptance script in the plan against the committed files).

## Issues Encountered

**Executor session interruption:** the original execution agent hit a provider-side session/rate limit (`HTTP 429 rate_limit`) immediately after committing both tasks (`31f7bbb`, `65db2d7`) but before writing this SUMMARY.md. The orchestrator resumed via the safe-resume "close out manually" path: inspected the two existing commits, re-ran `pnpm check`, `pnpm build`, `bash scripts/security-check.sh --ci`, and both tasks' exact automated verification scripts from `03-06-PLAN.md` against the already-committed files (all passed with no changes needed), then wrote this SUMMARY.md and the tracking updates. No code was re-executed or modified.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `DifferentiatorsSection.astro` and `FaqSection.astro` are ready to be imported into `index.astro` by the composition plan (03-08); neither is wired into the page yet, matching this plan's `files_modified` scope
- No blockers for remaining Phase 3 plans (03-07 through 03-09)

---
*Phase: 03-static-zero-js-sections-csp-safe-refactor-a11y*
*Completed: 2026-09-16*

## Self-Check: PASSED

- FOUND: src/components/DifferentiatorsSection.astro
- FOUND: src/components/FaqSection.astro
- FOUND: .planning/phases/03-static-zero-js-sections-csp-safe-refactor-a11y/03-06-SUMMARY.md
- FOUND commit: 31f7bbb
- FOUND commit: 65db2d7
