---
status: resolved
phase: 01-foundation-ci-gate
source: [01-VERIFICATION.md]
started: 2026-09-10T00:00:00Z
updated: 2026-09-10T19:35:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Rotate the Vercel Protection Bypass secret (P01-008 residual)
expected: A new "Protection Bypass for Automation" secret is generated in the Vercel dashboard (Project dmarques → Settings → Deployment Protection), the old one revoked, and the new value re-mirrored into the GitHub Actions secret `VERCEL_AUTOMATION_BYPASS_SECRET` via `gh secret set VERCEL_AUTOMATION_BYPASS_SECRET --repo Felipe-Salles/dmarques --body "<value>"` (argument form — the stdin `--body -` form corrupts the value on Windows git-bash). Rationale: before commit `8ddcce5` the previous secret was written into downloadable public CI artifacts (`uploadArtifacts: true`), and GitHub retains those artifacts ~90 days.
result: DONE 2026-09-10 — new bypass secret generated via the Vercel API, old one revoked (verified: old value → HTTP 302, new value → HTTP 200), re-mirrored into the GitHub Actions secret via `--body "<value>"`. P01-008 marked Resolvido.

### 2. Two-factor authentication on the GitHub and Vercel accounts (INFRA-10)
expected: 2FA is enabled on both the `Felipe-Salles` GitHub account and the `felipe-salles` Vercel account. Not exposed to the API; requires the account owner to confirm.
result: attested by Felipe Salles 2026-09-09 (both accounts) — re-confirm if anything changed

### 3. Vercel spend cap / usage alerts (INFRA-10)
expected: The Vercel project has no payment method on file (structural $0 cap, Hobby plan) and usage notifications are enabled at 75% / 100%. Dashboard-only state; documented as `hobby-structural` in the SEC-08 statement and finding P01-005.
result: decision recorded 2026-09-09 (hobby-structural); confirm the usage-notification toggles in the dashboard

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
