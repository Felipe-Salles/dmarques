# Deferred / Out-of-Scope Items — Phase 01

Discoveries logged during execution that are outside the current plan's scope.

## From plan 01-03 (gate scripts)

### D1 — `pnpm audit --audit-level=high` reports 4 pre-existing HIGH advisories

**Found during:** 01-03 Task 2 verification (`bash scripts/security-check.sh --ci`).

**Condition:** The plan-01 dependency tree already carries 4 HIGH advisories, all
transitive. `security-check.sh` check 1 correctly FAILs on them, so the script
exits non-zero on the current tree (the plan assumed a clean audit).

| Advisory | Package | Path | Fix available |
|----------|---------|------|---------------|
| GHSA-9wv6-86v2-598j | `path-to-regexp` (>=4.0.0 <6.3.0) | `@astrojs/vercel` > `@vercel/routing-utils` > `path-to-regexp` | yes — `path-to-regexp@6.3.0` (touches the production adapter path) |
| GHSA-ph9p-34f9-6g65 | `tmp` (<0.2.6) | `@lhci/cli` > `inquirer` > `external-editor` > `tmp`; `@lhci/cli` > `tmp` | yes — `tmp@0.2.7` (devDependency, CI tooling only) |
| GHSA-jmr9-qjv8-65gv | `extract-zip` (<=2.0.1) | `@lhci/cli` > `lighthouse` > `puppeteer-core` > `@puppeteer/browsers` > `extract-zip` | **no** — latest published `extract-zip` is `2.0.1`; advisory's "Patched >=2.0.2" does not exist on npm |
| GHSA-7pqw-9j4j-h8q3 | `extract-zip` (<=2.0.1) | same as above | **no** |

Also present but below the gate threshold: 1 low, 3 moderate.

**Why deferred (not fixed in 01-03):**
- Pre-existing — introduced by 01-01's pinned dependency set, not by 01-03's changes (SCOPE BOUNDARY).
- Not auto-fixable — resolution needs `pnpm` overrides / dependency-tree edits, which is Rule 4 (architectural: changes 01-01's committed dependency contract, and one path is the production `@astrojs/vercel` adapter).
- Not fully resolvable anyway — `extract-zip` has no patched release, so a clean `--audit-level=high` is impossible today regardless of overrides.

**Owner action (Felipe, before Phase 1 closes — SEC-07 "no open High" rule):**
1. Decide on `pnpm.overrides` for `path-to-regexp` (>=6.3.0) and `tmp` (>=0.2.7); re-run `pnpm build` + `pnpm run check` to confirm the Vercel adapter still routes.
2. For the two `extract-zip` advisories (dev/CI-only, reached only when `lhci` downloads Chrome): record as `Med` findings in `.planning/security/runs/phase-01.md` with a target date, or pin `@puppeteer/browsers` / drop the transitive path. `lhci` never ships to the client and runs only in CI.
3. Consider whether the CI `pnpm audit --audit-level=high` step (01-04) and `security-check.sh` check 1 should be allowed to be red on `main` until (1)/(2) land, or whether 01-04 lands after the triage.

This item belongs to plan 01-08 (security run file) and/or a follow-up dependency-hardening pass.
