---
phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
plan: 01
subsystem: infra
tags: [sharp, astro-assets, image-pipeline, pnpm, webp]

# Dependency graph
requires:
  - phase: 02-content-collections
    provides: precedent for vector-only branded WebP placeholder generation (dmarques-cover.webp)
provides:
  - sharp@0.35.4 as an explicit pinned devDependency, bare-importable under pnpm's strict layout
  - src/assets/hero-render-placeholder.webp (1920x1440, 4:3) for HeroBleed's bleeding 3D render slot
  - src/assets/founder-portrait-placeholder.webp (960x1200, 4:5) for AboutSection's founder portrait slot
affects: [03-static-zero-js-sections-csp-safe-refactor-a11y (later plans consuming these images via astro:assets)]

# Tech tracking
tech-stack:
  added: ["sharp@0.35.4 (devDependency, was already a transitive dep of astro@7.3.1)"]
  patterns:
    - "Placeholder images authored as vector-only SVG (no <text>) then rasterized to WebP via sharp, matching the Phase 2 case-cover precedent"
    - "One-off generator scripts live in the session scratchpad, never in the repo; run via `node --input-type=module < script.mjs` with cwd at the project root so bare `sharp` import resolves against the project's own node_modules"

key-files:
  created:
    - src/assets/hero-render-placeholder.webp
    - src/assets/founder-portrait-placeholder.webp
  modified:
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "Confirmed via `pnpm why sharp` that the transitive version already resolved by astro@7.3.1 is exactly 0.35.4 before installing, avoiding a second copy in the tree"
  - "Did not touch astro.config.mjs or pnpm-workspace.yaml — the MissingSharp fix is purely a dependency-declaration change, keeping imageService fully build-time (PERF-05/SITE-09)"

patterns-established:
  - "Placeholder asset generation: vector-shapes-only SVG buffer -> sharp -> .webp, quality ~80, target <300KB, dimensions at 2x the component's declared width/height to avoid upscale"

requirements-completed: [SITE-09, PERF-05]

# Metrics
duration: 5min
completed: 2026-09-16
---

# Phase 03 Plan 01: Sharp devDependency + Branded Image Placeholders Summary

**Promoted sharp@0.35.4 to an explicit pinned devDependency (unblocking astro:assets `<Image>`/`<Picture>` under pnpm's strict layout) and generated two vector-only branded WebP placeholders for the hero render and founder portrait slots.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-09-16T05:28:57Z
- **Completed:** 2026-09-16T05:32:58Z
- **Tasks:** 2 completed
- **Files modified:** 4 (package.json, pnpm-lock.yaml, 2 new .webp assets)

## Accomplishments

- `sharp` is now a declared devDependency (`0.35.4`, exact pin, alphabetically ordered), resolvable via bare `import`/`require` without the Phase 2 `createRequire` workaround
- `pnpm audit --audit-level=high` remains clean (exit 0) after the change — the resolved dependency tree did not shift
- `src/assets/hero-render-placeholder.webp` (1920x1440, 18.5 KB) and `src/assets/founder-portrait-placeholder.webp` (960x1200, 9.9 KB) exist, both well under the 300 KB budget and built from vector shapes only (zero `<text>` elements)
- `pnpm build` and `bash scripts/security-check.sh --ci` both still pass at the same PASS/FAIL/SKIP baseline as before the plan (5 PASS / 0 FAIL / 2 SKIP)

## Task Commits

Each task was committed atomically:

1. **Task 1: Promover sharp a devDependency explícita pinada** - `ea51a8c` (chore)
2. **Task 2: Gerar os dois assets placeholder branded via Sharp** - `627969f` (feat)

**Plan metadata:** _pending_ (this SUMMARY + STATE/ROADMAP commit)

## Files Created/Modified

- `package.json` - added `"sharp": "0.35.4"` under `devDependencies`, alphabetically between `prettier-plugin-astro` and `typescript`
- `pnpm-lock.yaml` - lockfile updated to reflect sharp as a direct dependency
- `src/assets/hero-render-placeholder.webp` - abstract neon-purple vector render placeholder, 1920x1440
- `src/assets/founder-portrait-placeholder.webp` - abstract branded silhouette placeholder, 960x1200

## Decisions Made

- Verified with `pnpm why sharp` that the version already resolved transitively (via `astro@7.3.1`) is exactly `0.35.4` before installing — installing a different version would have introduced a second copy of sharp in the tree, outside the RESEARCH.md legitimacy audit's scope
- Left `astro.config.mjs` and `pnpm-workspace.yaml` untouched per plan constraint: `imageService: true` is forbidden by PERF-05, `passthroughImageService()` would violate SITE-09, and sharp's prebuilt binaries need no `onlyBuiltDependencies` entry

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Generator script execution method adjusted for Node ESM resolution**
- **Found during:** Task 2 (asset generation)
- **Issue:** The plan directs writing the generator script into the session scratchpad directory and running it directly. Node's ESM bare-specifier resolution walks up from the *script file's own path*, not the process cwd — since the scratchpad lives outside the repo entirely, a direct `node scratchpad/script.mjs` could never find the project's `node_modules/sharp`, even after Task 1.
- **Fix:** Kept the generator script itself in the scratchpad (never copied into the repo), but executed its contents via `node --input-type=module < scratchpad/script.mjs` with cwd set to the project root — Node's `-e`/stdin eval resolves bare specifiers against the cwd's `node_modules` tree, so `import sharp from "sharp"` resolves correctly with no `createRequire` trick.
- **Files modified:** none (execution-only adjustment, no repo files affected beyond the two intended assets)
- **Verification:** Script ran successfully, both assets produced with exact required dimensions/format/weight, confirmed by the plan's automated verification command
- **Committed in:** `627969f` (Task 2 commit) — the script itself was never staged or committed

---

**Total deviations:** 1 auto-fixed (1 blocking — execution mechanism only, no scope or output change)
**Impact on plan:** No change to deliverables, dimensions, weight, or vector-only constraint. The fix only concerns how the one-off script was invoked.

## Issues Encountered

None beyond the Node ESM resolution adjustment documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `sharp` is now resolvable for any later Phase 3 plan that wires `<Image>`/`<Picture>` into `HeroBleed.astro` or `AboutSection.astro`
- Both placeholder assets are in place at the exact aspect ratios (`4:3` hero bleed, `4:5` founder portrait) the UI-SPEC's Image Placeholder Contract expects, so component authoring in later plans can proceed without waiting on real photography/3D render assets
- No blockers for Wave 1 continuation

---
*Phase: 03-static-zero-js-sections-csp-safe-refactor-a11y*
*Completed: 2026-09-16*

## Self-Check: PASSED

- FOUND: package.json
- FOUND: src/assets/hero-render-placeholder.webp
- FOUND: src/assets/founder-portrait-placeholder.webp
- FOUND: commit ea51a8c
- FOUND: commit 627969f
