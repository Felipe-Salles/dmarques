---
phase: 04-progressive-enhancement-effects
plan: 01
subsystem: testing
tags: [node-test, vitest-free, canvas-math, ci]

requires:
  - phase: 01-foundation
    provides: CI verify job (astro sync/check/build/audit/js-weight-check/security-check), pnpm/Node 24 toolchain
provides:
  - src/scripts/particles.pure.ts exporting computePointCount and shouldReduceParticles as DOM-free pure functions
  - src/scripts/particles.pure.test.mjs with node:test coverage for the ANIM-05 formula bounds and the three D-06/D-07/D-08 reduction triggers
  - pnpm test script running Node's native test runner, zero new dependencies
  - CI verify job gated by pnpm test between astro check and build
affects: [04-02, 04-03]

tech-stack:
  added: []
  patterns:
    - "node:test + node:assert/strict as the project's only test runner, invoked via explicit .ts extension import from a .mjs file (Node 24 native type stripping, no loader/devDependency)"

key-files:
  created:
    - src/scripts/particles.pure.ts
    - src/scripts/particles.pure.test.mjs
  modified:
    - package.json
    - .github/workflows/ci.yml

key-decisions:
  - "pnpm test uses the quoted glob form node --test \"src/scripts/*.test.mjs\" (not a bare directory arg), confirmed empirically in this repo to avoid the runner treating particles.pure.ts as a test file"
  - "CI pnpm test step placed immediately after astro check and before build so unit failures short-circuit the more expensive build/Lighthouse steps"

patterns-established:
  - "Pure canvas math lives in a *.pure.ts file with zero DOM globals, unit-tested via node:test; DOM-touching consumers (particles.ts in 04-03) import from it rather than duplicating the formula"

requirements-completed: [ANIM-05]

duration: 3min
completed: 2026-09-17
---

# Phase 4 Plan 1: Particle Math Test Scaffold Summary

**Pure computePointCount/shouldReduceParticles functions extracted from the design source's canvas math and covered by a 14-case node:test suite wired into pnpm test and the CI verify gate, with zero new dependencies.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-09-17T14:36:45Z
- **Completed:** 2026-09-17T14:39:15Z
- **Tasks:** 2 completed
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- `computePointCount` and `shouldReduceParticles` extracted as pure, DOM-free functions matching the ANIM-05 formula and the D-06/D-07/D-08 reduction triggers exactly
- 14-case `node:test` suite covers both formula boundaries (piso 28, teto 90, both exact boundary inputs, two mid-range values) and all three reduction triggers isolated, at their exact viewport boundary, and combined
- `pnpm test` runs Node's native test runner with no new devDependency; wired into the CI `verify` job right after `astro check` and before the costlier `build` step

## Task Commits

Each task was committed atomically:

1. **Task 1: Funções puras do canvas + suíte node:test** - `bc9aa50` (feat)
2. **Task 2: Script test no package.json e gate no CI** - `8f37e42` (chore)

**Plan metadata:** pending (this commit)

## Files Created/Modified
- `src/scripts/particles.pure.ts` - exports `computePointCount(width, height)` and `shouldReduceParticles(input)`, no DOM access
- `src/scripts/particles.pure.test.mjs` - 14 `node:test` cases importing from `./particles.pure.ts` with explicit extension
- `package.json` - added `scripts.test`: `node --test "src/scripts/*.test.mjs"`
- `.github/workflows/ci.yml` - added `- run: pnpm test` between `astro check` and `build` in the `verify` job

## Decisions Made
- Used the quoted-glob form for the test script rather than a directory argument, per the plan's empirically-verified note that the directory form makes the runner try to execute `particles.pure.ts` as a test file
- Kept the D-08 halving logic out of `computePointCount` itself, per the plan's interface contract — the function stays a 1:1 match with the locked ANIM-05 formula, halving belongs to the 04-03 consumer

## Deviations from Plan

None — plan executed exactly as written. Import order in `particles.pure.test.mjs` (`node:assert` before `node:test`) and a one-line formatting adjustment in `particles.pure.ts` were made to satisfy the existing Biome config's `organizeImports`/formatter rules before committing; both are mechanical, zero-semantic-change fixes required to keep `pnpm lint` at zero new warnings (the plan's own acceptance criterion), not deviations from the specified logic.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `particles.pure.ts`'s two exports are ready for `src/scripts/particles.ts` (plan 04-03) to import and consume, per the interfaces contract in this plan
- CI now fails fast on unit-test regressions to the ANIM-05 formula or the three reduction triggers before any build/Lighthouse cost is spent
- No blockers for 04-02 or 04-03

---
*Phase: 04-progressive-enhancement-effects*
*Completed: 2026-09-17*

## Self-Check: PASSED

All created/modified files found on disk; both task commits (`bc9aa50`, `8f37e42`) found in git history.
