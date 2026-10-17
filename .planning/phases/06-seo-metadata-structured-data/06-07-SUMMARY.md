---
phase: 06-seo-metadata-structured-data
plan: 07
subsystem: seo
tags: [ci, seo-gates, rich-results, share-image]
requires: [06-03, 06-04, 06-05, 06-06]
provides:
  - seo-gates enforced in CI verify job
  - verify:seo package script
  - Official business name recorded in PROJECT.md
  - Human validation of JSON-LD and share image
affects: [06-08]
key-files:
  modified: [package.json, .github/workflows/ci.yml, .planning/PROJECT.md]
key-decisions:
  - "seo-gates runs in CI immediately after aurora-gates so SEO/NAP regressions block merges"
  - "Official name 'Dmarques Desenvolvimento Web' recorded in PROJECT.md (D-01)"
requirements-completed: [SEO-01, SEO-03, SEO-04, SEO-05, SEO-06, SEO-08]
duration: 15min
completed: 2026-10-17
---

# Phase 6 Plan 07: SEO gate in CI and pre-merge validation Summary

CI now runs `node scripts/verify/seo-gates.mjs` after the aurora gates, `verify:seo` exists in package.json, PROJECT.md records the official business name, and Felipe validated the built JSON-LD in Rich Results Test and approved the share image.

## Tasks

| Task | Name | Commit |
|------|------|--------|
| 1 | Wire seo-gates in package.json and CI, official name in PROJECT.md, full suite | fe1587d |
| 2 | Pre-merge validation of JSON-LD and share image (checkpoint, resolved) | n/a |

## Full local suite (CI order, STATIC_DIR=.vercel/output/static)

- astro sync: PASS
- astro check: PASS (0 errors, 0 warnings, 1 hint)
- pnpm test: 129 pass / 0 fail
- pnpm build: PASS
- aurora-gates: 13 PASS / 0 FAIL
- seo-gates: 10 PASS / 0 FAIL
- browser-gates: 9 PASS / 0 FAIL
- form-gates: 15 PASS / 0 FAIL
- form-card-height: PASS
- pnpm audit --audit-level=high: exit 0 (10 vulnerabilities reported: 8 moderate, 2 high, 2 ignored via project config)
- js-weight-check: PASS (6115 B gzip of 20480 B budget)
- security-check --ci: 6 PASS / 0 FAIL / 2 SKIP (no PREVIEW_URL locally)

## Checkpoint outcome (Task 2, resolved 2026-10-17 by Felipe)

- Rich Results Test (code snippet tab, JSON-LD extracted from built index.html): "2 itens válidos detectados" — types "Empresas locais" (LocalBusiness) and "Organização" (Organization). 0 errors.
- Felipe first tried the URL tab against production and got "nenhum item detectado", expected because Phase 6 is not deployed yet; live-URL validation belongs to 06-08.
- Share image `public/og-image.jpg`: approved ("imagem está aprovada").

## Deviations from Plan

None. No regressions found, so no fixes were needed. The pre-existing biome formatting error in `astro.config.mjs` is out of scope and untouched.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED
