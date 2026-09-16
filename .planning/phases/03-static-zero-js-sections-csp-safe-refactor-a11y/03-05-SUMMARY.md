---
phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
plan: 05
subsystem: ui
tags: [astro, content-collections, svg, a11y, css-tokens]

requires:
  - phase: 02-content-collections-cases-differentiators
    provides: services and process Content Collections (getServices/getProcess in src/content/index.ts)
  - phase: 03-02
    provides: global CSS tokens, [data-reveal] contract, :focus-visible, scroll-margin-top anchors
provides:
  - ServicesSection.astro rendering 4 service cards from the services collection with hand-authored inline SVG icons
  - ProcessSection.astro rendering 4 process steps from the process collection in a semantic ordered list
affects: [03-09-assembly, 04-scroll-animation, 07-csp]

tech-stack:
  added: []
  patterns:
    - "SVG icon set as structured shape data (Record<enum, {tag,...}[]>) mapped to real <rect>/<circle>/<path> JSX elements per icon key, avoiding set:html entirely"
    - "Accent-card treatment (last-in-order card) applied via class:list keyed on item.data.order === max(order), never by array index or title string"

key-files:
  created:
    - src/components/ServicesSection.astro
    - src/components/ProcessSection.astro
  modified: []

key-decisions:
  - "Rejected the plan's literal object-literal-of-HTML-string icon map in favor of structured shape objects rendered as real Astro/JSX elements, because the phase threat model (T-03-11) and the plan's own overall verification step both forbid set:html anywhere in src/ — a raw-HTML-string map would have required set:html to render"
  - "Process closing-quote span kept on var(--color-accent) (not --color-accent-light): its font-size is clamp(19px, 2vw, 26px), whose floor (19px) stays above the 18.66px large-text contrast threshold at every breakpoint, so the 3:1 large-text exception applies"

requirements-completed: [SITE-01, SITE-03, SITE-04, A11Y-02, A11Y-06, ANIM-02, ANIM-07]

duration: 10min
completed: 2026-09-16
---

# Phase 03 Plan 05: ServicesSection + ProcessSection Summary

**Two zero-JS, collection-driven sections (Serviços, Processo) with hand-rolled SVG icons stored as structured shape data instead of raw markup strings, keeping `set:html` out of the codebase entirely.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-09-16T06:02:28Z
- **Completed:** 2026-09-16T06:07:31Z
- **Tasks:** 2
- **Files modified:** 2 (both created)

## Accomplishments
- `ServicesSection.astro` renders all 4 services from `getServices()` with zero hand-authored titles/descriptions, one inline SVG icon per card chosen via `item.data.icon`, and the eyebrow migrated to `--color-accent-light` per D-14 contrast fix
- `ProcessSection.astro` renders all 4 steps from `getProcess()` inside a real `<ol>`/`<li>` sequence, using the schema's own `numero` field (no `padStart` derivation), with decorative dot/connector wrapped in `aria-hidden="true"`
- Both sections consume `[data-reveal]`, `:focus-within`/`:focus-visible`, and `scroll-margin-top` contracts from plan 03-02 with no new global CSS

## Task Commits

Each task was committed atomically:

1. **Task 1: ServicesSection.astro — 4 cards from collection, icon map** - `db691b1` (feat)
2. **Task 2: ProcessSection.astro — 4 steps from collection, numero field** - `43ee4dd` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `src/components/ServicesSection.astro` - Services grid section, 4 cards from the `services` collection, structured-shape SVG icon map, accent treatment on the last-order card
- `src/components/ProcessSection.astro` - Process timeline section, 4 steps from the `process` collection in a semantic `<ol>`, tokenized gradient background, closing quote line

## Decisions Made
- Icon content stored as `Record<IconEnum, IconShape[]>` (shape descriptors: `{tag:'rect'|'circle'|'path', ...attrs}`) rendered via a ternary chain inside `.map()`, producing real `<rect>`/`<circle>`/`<path>` elements — not `set:html` over a raw markup string. This still satisfies the plan's literal requirement ("objeto literal mapeando cada valor do enum") while eliminating the injection surface the threat model and the plan-wide verification step (`grep -rn 'set:html' src/`) explicitly forbid.
- Process closing-quote span (`"nada começa antes de estar combinado"`) kept on `var(--color-accent)`: font-size `clamp(19px, 2vw, 26px)` never drops below 19px, which is above the 18.66px large-text WCAG threshold, so the 3:1 large-text contrast exception applies at every breakpoint. No migration to `--color-accent-light` needed.
- Accent-card treatment on the 4th services card applied by comparing `item.data.order` to `Math.max(...services.map(s => s.data.order))`, not by array index (order-independent) or by matching a title string (content-independent).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical / security correctness] Replaced the plan's literal icon-map-of-HTML-strings with structured shape data to avoid `set:html`**
- **Found during:** Task 1 (ServicesSection.astro icon rendering)
- **Issue:** The task's literal instructions describe "um objeto literal mapeando cada valor do enum para o conteúdo do `<path>`/`<rect>`/`<circle>`" — the most direct reading of that (a map of raw HTML strings) can only be rendered in Astro via `set:html`. The plan's own threat model (T-03-11) explicitly states "Proibido introduzir `set:html` nesta fase," and the plan's `<verification>` block runs `grep -rn 'set:html' src/` expecting zero matches across the whole `src/` tree (not just this plan's two files).
- **Fix:** Stored each icon as an array of typed shape descriptors (`{tag:'rect', x, y, width, height, rx}` etc.) and rendered them as genuine Astro/JSX `<rect>`/`<circle>`/`<path>` elements chosen by a ternary inside `.map()`. Same visual output, same "one object literal per enum value" shape, zero `set:html`.
- **Files modified:** src/components/ServicesSection.astro
- **Verification:** `grep -rn 'set:html' src/` returns no matches; `pnpm check` and `pnpm build` both exit 0; Task 1's automated verification script (icon/attribute presence, banned-string, hex-literal, comment checks) passes.
- **Committed in:** db691b1 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 2 — security correctness, no scope creep)
**Impact on plan:** The fix keeps the exact card/icon output the plan specifies while honoring a hard constraint (no `set:html`) stated elsewhere in the same plan file. No visual, semantic, or content change.

## Issues Encountered
None beyond the deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `ServicesSection.astro` and `ProcessSection.astro` are ready to be imported into `index.astro` by the assembly plan (03-09); neither is wired into the page yet, matching this plan's `files_modified` scope (component authoring only, consistent with 03-04's HeroBleed/AboutSection precedent)
- No blockers for remaining Phase 3 plans (03-06 through 03-09)

---
*Phase: 03-static-zero-js-sections-csp-safe-refactor-a11y*
*Completed: 2026-09-16*

## Self-Check: PASSED

- FOUND: src/components/ServicesSection.astro
- FOUND: src/components/ProcessSection.astro
- FOUND: .planning/phases/03-static-zero-js-sections-csp-safe-refactor-a11y/03-05-SUMMARY.md
- FOUND commit: db691b1
- FOUND commit: 43ee4dd
