---
phase: 06-seo-metadata-structured-data
plan: 02
subsystem: seo
tags: [verification, gate, sitemap, json-ld, open-graph]

requires: []
provides:
  - scripts/verify/seo-gates.mjs dist gate with 10 checks (head-home, secundarias, og-twitter, og-image, icones, sitemap, robots, json-ld, nap, marca)
affects: [06-04, 06-05, 06-06, 06-07]

tech-stack:
  added: []
  patterns:
    - "Async check runner with --list and --check=a,b, asserting against built HTML in .vercel/output/static"

key-files:
  created: [scripts/verify/seo-gates.mjs]
  modified: []

key-decisions:
  - "Both tasks delivered in a single file/commit since the second task only appends checks to the same object"

requirements-completed: [SEO-01, SEO-03, SEO-04, SEO-05, SEO-06, SEO-08]

duration: 10min
completed: 2026-10-17
---

# Phase 6 Plan 02: SEO dist gate Summary

**Ten-check gate script (`seo-gates.mjs`) that asserts every phase SEO invariant against the built HTML, with subset selection via `--check=`.**

## Tasks

| Task | Name | Commit |
|------|------|--------|
| 1-2 | Skeleton, helpers, head/meta checks, og-image, sitemap, robots, json-ld, nap | 1f71a02 |

## Verification

- `--list` prints 10 checks; unknown check prints `FAIL nao-existe: verificacao desconhecida` and exits 1
- On the pre-phase build, all 10 checks FAIL for the expected reasons (old title, no canonical, no OG tags, no og-image.jpg, no sitemap/robots, no JSON-LD, no theme-color)
- `marca` FAILs as expected before 06-06: 'Soluções Web' remains in 404, erro-envio and other built pages
- Zero comments; biome check clean

## Deviations from Plan

None - plan executed as written (tasks 1 and 2 committed together).

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED
