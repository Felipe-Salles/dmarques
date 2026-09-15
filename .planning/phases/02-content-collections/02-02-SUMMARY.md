---
phase: 02-content-collections
plan: 02
subsystem: content
tags: [astro, content-collections, zod, sharp, webp, image]

requires:
  - phase: 02-content-collections
    provides: "src/content.config.ts (four YAML collections + z.strictObject pattern), src/content/project-types.ts (PROJECT_TYPE_VALUES tuple)"
provides:
  - "src/content/cases/dmarques-cover.webp (1600x1000 branded placeholder cover, generated with astro's bundled Sharp)"
  - "src/content/cases/dmarques.md (the single v1 portfolio case, honestly labeled 'projeto próprio')"
  - "cases collection in src/content.config.ts using the schema-as-function image() form and PROJECT_TYPE_VALUES enum"
  - "src/content/index.ts (getServices/getProcess/getDifferentiators/getFaq/getCases order-sorted barrel)"
affects: [phase-03-sections, phase-05-form, phase-06-seo]

tech-stack:
  added: []
  patterns:
    - "Schema-as-function collections (schema: ({ image }) => z.strictObject({...})) used only where image() is needed; the other four collections stay plain-object schemas"
    - "Single consumption barrel (src/content/index.ts) centralizes the order sort and is the only getCollection('faq') call site"
    - "Placeholder binary assets generated at execution time via the Sharp already bundled inside astro, resolved from the pnpm store with createRequire, zero new dependency"

key-files:
  created:
    - src/content/cases/dmarques-cover.webp
    - src/content/cases/dmarques.md
    - src/content/index.ts
  modified:
    - src/content.config.ts

key-decisions:
  - "Placeholder cover art built from vector shapes only (rect/circle/radialGradient/path) in an SVG written to the scratchpad, then rasterized to WebP with the Sharp bundled inside astro@7.3.1 (resolved via node_modules/.pnpm/sharp@*/node_modules/sharp + createRequire) — no text glyphs, no new dependency, scratchpad SVG deleted after rasterization."

patterns-established:
  - "getFaq() in src/content/index.ts is the single getCollection('faq') read path in the codebase — Phase 3 FAQ section and Phase 6 FAQPage JSON-LD both call it, satisfying CONTENT-04/SEO-07 mechanically."

requirements-completed: [CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05]

duration: ~20min
completed: 2026-09-15
---

# Phase 2 Plan 02: Portfolio case + cases collection + consumption barrel Summary

**Single honestly-labeled portfolio case (the Dmarques site itself) published as a Markdown Content Collection entry with a build-processed WebP cover, plus the order-sorted `src/content/index.ts` barrel that centralizes the FAQ single-read-path.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-09-15T20:15:00Z
- **Completed:** 2026-09-15T20:34:23Z
- **Tasks:** 3
- **Files modified:** 3 created, 1 modified

## Accomplishments
- Generated a 1600x1000 branded placeholder WebP cover (8,468 bytes, well under the 150 KB ceiling) using only the Sharp already bundled inside `astro@7.3.1` — no dependency added.
- Published `src/content/cases/dmarques.md`, the single v1 case, labeled `rotulo: projeto próprio`, with a problema → solução → resultado structure citing the real Phase 1 Lighthouse/CI metrics.
- Extended `src/content.config.ts` with the `cases` collection using the schema-as-function `image()` form and `PROJECT_TYPE_VALUES` for `tipo`, keeping the other four collections as plain-object schemas.
- Added `src/content/index.ts`, the single typed read layer exporting `getServices`/`getProcess`/`getDifferentiators`/`getFaq`/`getCases`, centralizing the `order` sort.

## Task Commits

Each task was committed atomically:

1. **Task 1: Generate the branded placeholder cover image** - `7462c3b` (feat)
2. **Task 2: Publish the Dmarques case entry and wire the cases collection** - `754ee6a` (feat)
3. **Task 3: Add the order-sorted consumption barrel** - `e516c6a` (feat)

## Files Created/Modified
- `src/content/cases/dmarques-cover.webp` - 1600x1000 branded placeholder cover (dark bg, purple glow, "D" mark), 8,468 bytes
- `src/content/cases/dmarques.md` - the single v1 case entry, `rotulo: projeto próprio`, `cover: ./dmarques-cover.webp`, two-paragraph Markdown body
- `src/content.config.ts` - added `cases` collection (`schema: ({ image }) => z.strictObject({...})`) and updated `collections` export to include it
- `src/content/index.ts` - five async accessors, `byOrder` comparator applied to four collections, `getCases` unsorted

## Decisions Made
- Built the placeholder cover from vector shapes only (no `<text>` element) since the repo self-hosts fonts through the Astro Fonts API, which an offline SVG rasterizer cannot resolve; the "D" mark is a rounded rect plus a stroked arc path.
- Resolved Sharp from `node_modules/.pnpm/sharp@0.35.4_@types+node@26.5.0/node_modules/sharp` via `createRequire`, since it's a transitive dependency not resolvable from the project root under pnpm's strict layout.

## Deviations from Plan

None - plan executed exactly as written. All acceptance criteria for all three tasks verified directly (grep/wc/ls checks) and passed; `pnpm run check` and `pnpm build` both exit 0; `package.json` and `pnpm-lock.yaml` unchanged.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `src/content.config.ts` now exports all five collections (`services, process, differentiators, faq, cases`); `src/content/index.ts` is ready for Phase 3 sections and Phase 6 JSON-LD to import directly.
- The case cover is a deliberate placeholder (D-08); the real screenshot swap remains a tracked post-Phase-3 deferred item.
- No blockers.

---
*Phase: 02-content-collections*
*Completed: 2026-09-15*
