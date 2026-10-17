---
phase: 06-seo-metadata-structured-data
plan: 03
subsystem: infra
tags: [lighthouse, lhci, seo, github-actions]
requires: []
provides:
  - Preview LHCI config with per-audit SEO error assertions
  - Production LHCI config with categories:seo at error 0.95
  - lhci-production job (deployment_status Production + workflow_dispatch)
affects: [06-08]
tech-stack:
  added: []
  patterns: [split LHCI configs per environment]
key-files:
  created: [lighthouserc.production.json]
  modified: [lighthouserc.json, .github/workflows/lighthouse.yml]
key-decisions:
  - "Preview asserts nine SEO audits at error and turns is-crawlable off; production asserts the whole SEO category"
  - "canonical kept at error on preview: installed canonical.js has no cross-domain rule"
requirements-completed: [SEO-01, SEO-04, SEO-05]
duration: 8min
completed: 2026-10-17
---

# Phase 6 Plan 03: Lighthouse SEO gate split Summary

SEO is no longer `warn`: previews enforce nine per-audit SEO assertions (is-crawlable off), production enforces all four categories at >= 0.95.

## Tasks

1. Configs - commit 58529fe. Removed `categories:seo` warn and added `is-crawlable: off` plus document-title, meta-description, http-status-code, link-text, crawlable-anchors, robots-txt, image-alt, canonical, hreflang at `["error", {minScore: 1}]`. All nine ids exist in installed Lighthouse 12.6.1 (none dropped). Created lighthouserc.production.json (same collect plus `blockedUrlPatterns`, four categories at 0.95, same LCP/CLS/TBT/script-size).
2. Workflow - commit 13f438b. Added `workflow_dispatch` and `lhci-production` job (no secrets, configPath ./lighthouserc.production.json, URL https://agenciadmarques.com.br/); Preview job untouched.

## Findings

- Lighthouse read: 12.6.1. `findCommonCanonicalURLMistakes` fails only on hreflang conflicts and same-origin canonical to `/` from a non-root page; no cross-domain rule, so `canonical` stays at error on preview. Empirical confirmation is deferred to the phase PR in 06-08 (fallback: `"canonical": "off"`).
- treosh/lighthouse-ci-action@v12 bundles @lhci/cli ^0.15.1.
- Trigger rationale: deployment_status Production gives a post-deploy gate on every release; workflow_dispatch allows on-demand runs from 06-08 (`gh workflow run lighthouse.yml`). It cannot block merges; the preview per-audit asserts remain the merge gate.
- YAML validated by parsing with the yaml@2.8.3 package from the pnpm store (jobs: lhci, lhci-production; triggers: deployment_status, workflow_dispatch). Python yaml not installed.

## Deviations from Plan

- `biome format --write` expanded the inline assertion arrays in lighthouserc.json to multi-line form (required for `biome check` to exit 0); values are unchanged, so the diff is larger than the semantic change.

## Self-Check: PASSED

Files exist, commits 58529fe and 13f438b present, verification scripts exit 0, no comments in YAML/JSON.
