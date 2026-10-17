---
phase: 06-seo-metadata-structured-data
plan: 04
subsystem: seo
tags: [sitemap, robots, astro-integration]
requires: []
provides:
  - sitemap-index.xml and sitemap-0.xml listing only the home URL
  - robots.txt allow-all with sitemap pointer
affects: [06-08]
tech-stack:
  added: ["@astrojs/sitemap 3.7.4"]
  patterns: [sitemap filter excluding noindex pages]
key-files:
  created: [public/robots.txt]
  modified: [package.json, pnpm-lock.yaml, astro.config.mjs]
key-decisions:
  - "Sitemap filter excludes /obrigado and /erro-envio because the integration ignores noindex"
  - "robots.txt has no Disallow so noindex pages stay crawlable and the meta is seen"
requirements-completed: [SEO-04]
duration: 15min
completed: 2026-10-17
---

# Phase 6 Plan 04: Sitemap and robots Summary

`@astrojs/sitemap` 3.7.4 (exact pin) with a filter leaving only `https://agenciadmarques.com.br/` in the sitemap, plus an allow-all `public/robots.txt` pointing to `sitemap-index.xml`.

## Tasks

1. Registry evidence (no install, no commit). Collected via `npm view`:
   - `@astrojs/sitemap@3.7.4`, repository `git+https://github.com/withastro/astro.git`, maintainers fredkschott and matthewp, published 2026-08-31T19:39:18Z (3.7.3 on 2026-05-26).
   - Dependencies: zod ^4.3.6, sitemap ^9.0.0. No preinstall/install/postinstall scripts.
   - `dist.integrity`: sha512-LbKNC24bdUWcQf/pThB6qLlSqHojxGjZDURIzFocY8rlWnAn2t74nnhnK6S5x0NHriHoAduLEpVjRykmeGiVvA==
   - `sitemap@9` (ekalinin/sitemap.js) has no install scripts. `slopcheck` was not on PATH, so no verdict.
2. Legitimacy checkpoint (blocking-human). Approved by Felipe on 2026-10-17, verbatim response: "pode seguir". Nothing was installed before this approval.
3. Install, config, robots - commit 74d13cc. `pnpm add @astrojs/sitemap@3.7.4 --save-exact`; `sitemap({ filter })` added in `integrations` after `adapter`; `public/robots.txt` created.

## Verification

- `pnpm build` emits `sitemap-index.xml` and `sitemap-0.xml`; the only `<loc>` is `https://agenciadmarques.com.br/`.
- `.vercel/output/static/robots.txt` carries the Sitemap line; `grep -c "^Disallow"` prints 0.
- `node scripts/verify/seo-gates.mjs --check=sitemap,robots`: 2 PASS / 0 FAIL.
- `pnpm audit --audit-level=high` exits 0 (2 high advisories are covered by the existing ignoreGhsas).
- `scripts/js-weight-check.sh`: PASS (landing JS 5501 B gzip, no client JS added).
- Zero comments in `astro.config.mjs`.

## Deviations from Plan

None. The plan was executed as written.

## Deferred Issues

- `biome check astro.config.mjs` reports a formatting error on the pre-existing `UPSTASH_REDIS_REST_*` lines of the `env` schema (line length). It is not caused by this plan and was left untouched.

## Known Stubs

None.

## Self-Check: PASSED

Verified: public/robots.txt, astro.config.mjs, package.json pin, commit 74d13cc.
