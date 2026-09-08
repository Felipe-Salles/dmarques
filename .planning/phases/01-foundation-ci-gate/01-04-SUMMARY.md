---
phase: 01-foundation-ci-gate
plan: 04
subsystem: infra
tags: [github-actions, lighthouse-ci, lhci, ci-gate, vercel-deployment-protection, dependency-review, perf-budget]

requires:
  - phase: "01-01"
    provides: "package.json scripts (build, sync, check), packageManager pnpm@11.15.1 pin, engines node >=22.12, .nvmrc = 24"
  - phase: "01-02"
    provides: "STATIC_DIR = .vercel/output/static (the Vercel-served tree)"
  - phase: "01-03"
    provides: "scripts/js-weight-check.sh + scripts/security-check.sh invocation contract; pnpm-workspace.yaml overrides + auditConfig.ignoreGhsas (path-to-regexp 6.3.0, tmp 0.2.7, 2 extract-zip GHSAs allowlisted)"
provides:
  - "lighthouserc.json — mobile Lighthouse assertions: four categories >= 0.95 (error) + LCP 2500 / CLS 0.05 / TBT 200 / script-size 20480, 3 runs, Slow 4G + 4x CPU throttling, no preset"
  - ".github/workflows/ci.yml — blocking PR + push-to-main job `verify` (install --frozen-lockfile -> sync -> check -> build -> pnpm audit --audit-level=high -> js-weight-check -> security-check --ci) + separate `dependency-review` job (fail-on-severity high)"
  - ".github/workflows/lighthouse.yml — deployment_status-triggered `lhci` job against the Vercel preview URL with the x-vercel-protection-bypass header from secrets.VERCEL_AUTOMATION_BYPASS_SECRET"
  - "GitHub check names for plan 07 branch protection: verify, dependency-review (ci.yml), lhci (lighthouse.yml)"
  - "PERF-02 INP-deferral sentence recorded verbatim for plan 08 to copy into .planning/security/runs/phase-01.md"
affects: [phase-1-branch-protection-plan-07, phase-1-security-run-plan-08, phase-1-github-vercel-setup-plan-05, every-later-phase-perf-gate, every-later-phase-security-review]

tech-stack:
  added: []
  patterns:
    - "Split CI: fast comment-free ci.yml (no deploy needed) blocks the PR; lighthouse.yml runs only after the Vercel preview finishes, against the live URL"
    - "Third-party actions pinned to a major-version tag whose existence was verified via `gh api` before writing; dependency-review-action pinned to the exact release v5.0.0 because it publishes no moving major tag"
    - "STATIC_DIR lives in exactly one place per workflow — a job-level `env` entry on `verify` — and both gate-script steps read it (js-weight-check via arg, security-check via environment)"
    - "pnpm audit --audit-level=high runs as a plain blocking step (no `|| true`, no continue-on-error): green on the resolved tree from 01-03, still blocks any NEW high advisory"
    - "D-04 zero-comment convention holds for JSON and YAML — asserted by `grep -cE '^\\s*#'` == 0 on both workflow files"
    - "lighthouse.yml trigger is `deployment_status`, never `pull_request_target` — a fork PR cannot read VERCEL_AUTOMATION_BYPASS_SECRET; the secret is only interpolated into LHCI_EXTRA_HEADERS, never echoed in a run step"

key-files:
  created:
    - "lighthouserc.json"
    - ".github/workflows/ci.yml"
    - ".github/workflows/lighthouse.yml"
  modified: []

key-decisions:
  - "actions/checkout pinned to @v7 (current major; `gh api releases/latest` = v7.0.1), not the RESEARCH pattern's @v6 which is now a trailing major. Recorded as a deviation."
  - "actions/dependency-review-action pinned to @v5.0.0 (exact release). It publishes no moving `v5` / `v4` major tag (verified 404 via `gh api git/ref/tags/v5`), so the RESEARCH pattern's @v5 does not resolve. Recorded as a deviation."
  - "actions/setup-node@v7, pnpm/action-setup@v6, treosh/lighthouse-ci-action@v12 all confirmed to exist as major tags via `gh api` — used as-is per the RESEARCH pattern."
  - "ci.yml carries no per-job `permissions` block: top-level `permissions: contents: read` is inherited by both jobs (threat model T-04-02 — least privilege). `comment-summary-in-pr: on-failure` degrades to a log line without `pull-requests: write`; the job still fails the check, which is what blocks merge. Plan 07 can widen if the PR comment is wanted."
  - "PERF-02 INP clause is consciously deferred to field monitoring, never reported as met on the TBT number alone — the verbatim sentence is recorded below and plan 08 copies it into the SEC-07 phase-01 run file."

patterns-established:
  - "Pattern 1: every version-controlled CI file is comment-free (D-04), including JSON and YAML"
  - "Pattern 2: third-party GitHub Actions are pinned to a tag whose existence is API-verified at authoring time (threat model T-04-03)"
  - "Pattern 3: the Lighthouse blocking gate runs against the real Vercel preview URL with the Deployment-Protection bypass header, not a local static server"

requirements-completed: [INFRA-08, INFRA-09, PERF-01, PERF-02, PERF-03]

duration: 20min
completed: 2026-09-08
---

# Phase 1 Plan 04: Lighthouse Config & CI Gate Workflows Summary

**A comment-free `lighthouserc.json` (four categories >= 0.95 plus LCP/CLS/TBT/script-size budgets over 3 Slow-4G + 4x-CPU runs, no preset) and two GitHub Actions workflows — `ci.yml` turning type-check, build, `pnpm audit --audit-level=high`, dependency review, the JS-weight gate and the SEC-07 security check into merge blockers, and `lighthouse.yml` scoring the live Vercel preview URL through Deployment Protection via the `x-vercel-protection-bypass` header.**

## PERF-02 INP deferral — mandatory written record

`INP is not lab-assertable in Lighthouse; total-blocking-time <=200 ms is the asserted lab proxy; field INP <200 ms is monitored via Vercel Analytics post-launch (PERF-02 compensating control).`

ROADMAP Phase 1 success criterion 3 names INP, but Lighthouse ships no lab INP audit (RESEARCH Assumption A2), so `total-blocking-time` is the only thing `lighthouserc.json` can assert. Success criterion 3's INP clause is therefore **consciously deferred** to field monitoring and must never be reported as fully met on the strength of the TBT assertion alone. Plan 08 Task 1 copies the sentence above, verbatim, into `.planning/security/runs/phase-01.md`.

## Performance

- **Duration:** ~20 min
- **Started:** 2026-09-08T23:36:53Z
- **Tasks:** 3
- **Files modified:** 3 created, 0 modified

## Accomplishments

- **`lighthouserc.json`** — `ci.collect.numberOfRuns: 3`; `ci.collect.settings.throttlingMethod: "simulate"` with the Slow 4G + 4x CPU `throttling` block (`cpuSlowdownMultiplier: 4`, `rttMs: 150`, `throughputKbps: 1638.4`, `downloadThroughputKbps: 1638.4`, `uploadThroughputKbps: 675`) that PERF-01 demands. `ci.assert.assertions`: `categories:performance` / `:seo` / `:best-practices` / `:accessibility` each `["error", { "minScore": 0.95 }]`; `largest-contentful-paint` `["error", { "maxNumericValue": 2500 }]`; `cumulative-layout-shift` `["error", { "maxNumericValue": 0.05 }]`; `total-blocking-time` `["error", { "maxNumericValue": 200 }]`; `resource-summary:script:size` `["error", { "maxNumericValue": 20480 }]`. **No `preset` key** (mobile Moto-G / 412x823 / Slow 4G / 4x CPU is Lighthouse's default; the only valid `preset` values — `desktop` / `perf` / `experimental` — would all break the required mobile emulation). No `collect.url` / `collect.startServerCommand` — the target URL is supplied by `lighthouse.yml` at run time. Comment-free (JSON); `pnpm exec biome check lighthouserc.json` clean.
- **`.github/workflows/ci.yml`** — `name: ci`; `on: pull_request` + `push: branches: [main]`; top-level `permissions: contents: read`. Job `verify` (ubuntu-latest) with a job-level `env: STATIC_DIR: .vercel/output/static` and steps in order: `actions/checkout@v7` -> `pnpm/action-setup@v6` (reads the `packageManager` pin) -> `actions/setup-node@v7` (`node-version: 24`, `cache: pnpm`) -> `pnpm install --frozen-lockfile` -> `pnpm astro sync` -> `pnpm astro check` -> `pnpm build` -> `pnpm audit --audit-level=high` -> `bash scripts/js-weight-check.sh "$STATIC_DIR"` -> `bash scripts/security-check.sh --ci`. `astro sync` precedes `astro check` (Pitfall 5 — the `astro:env` / `astro:assets` virtual types are not generated on a clean CI checkout otherwise). Separate job `dependency-review` (ubuntu-latest): `actions/checkout@v7` -> `actions/dependency-review-action@v5.0.0` with `fail-on-severity: high` and `comment-summary-in-pr: on-failure`. No Lighthouse / `lhci` / `astro preview` step (the blocking Lighthouse gate lives in `lighthouse.yml`; the Vercel adapter disables `astro preview`, Pitfall 2). Comment-free YAML.
- **`.github/workflows/lighthouse.yml`** — `name: lighthouse`; `on: deployment_status`; `permissions: contents: read` + `statuses: write` (so the check posts against the PR head SHA). Job `lhci` (ubuntu-latest) gated `if: github.event.deployment_status.state == 'success' && contains(github.event.deployment_status.environment, 'Preview')` so production deploys and failed/pending deploys do not trigger a run. Steps: `actions/checkout@v7` -> `treosh/lighthouse-ci-action@v12` with `urls: ${{ github.event.deployment_status.target_url }}`, `configPath: ./lighthouserc.json`, `uploadArtifacts: true`, and `env: LHCI_EXTRA_HEADERS: '{"x-vercel-protection-bypass":"${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}"}'` (without this header Vercel Deployment Protection returns the SSO login page and Lighthouse scores that — Pitfall 3). Trigger is `deployment_status`, never `pull_request_target`; the secret is never echoed in a `run:` step. Comment-free YAML.

## Resolved action tags

| Action | Pattern in RESEARCH | Verified via `gh api` | Pinned as | Note |
|--------|--------------------|-----------------------|-----------|------|
| `actions/checkout` | `@v6` | `releases/latest` = v7.0.1; `git/ref/tags/v7` exists | `@v7` | **Deviation** — pinned current major, not the trailing `@v6` |
| `pnpm/action-setup` | `@v6` | `git/ref/tags/v6` exists (latest v6.1.0) | `@v6` | as pattern |
| `actions/setup-node` | `@v7` | `git/ref/tags/v7` exists (latest v7.0.0) | `@v7` | as pattern |
| `actions/dependency-review-action` | `@v5` | `git/ref/tags/v5` -> 404; latest release `v5.0.0` | `@v5.0.0` | **Deviation** — no moving major tag published; pinned exact release |
| `treosh/lighthouse-ci-action` | `@v12` (placeholder) | `git/ref/tags/v12` exists (latest release 12.6.2) | `@v12` | placeholder confirmed real |

## STATIC_DIR wired into ci.yml

```
.vercel/output/static
```
Job-level `env` on `verify`. `js-weight-check.sh` receives it as `"$STATIC_DIR"`; `security-check.sh --ci` reads it from the environment.

## Check names for plan 07 (branch protection)

| Workflow | Job | Expected check context (plan 07 confirms exact strings from a live PR) |
|----------|-----|----------------------------------------------------------------------|
| `ci.yml` | `verify` | `verify` |
| `ci.yml` | `dependency-review` | `dependency-review` |
| `lighthouse.yml` | `lhci` | `lhci` |

## Task Commits

Each task was committed atomically:

1. **Task 1: Author lighthouserc.json and record the PERF-02 INP deferral** - `TASK1_HASH` (feat)
2. **Task 2: Author .github/workflows/ci.yml** - `TASK2_HASH` (chore)
3. **Task 3: Author .github/workflows/lighthouse.yml** - `TASK3_HASH` (chore)

**Plan metadata:** `META_HASH` (docs: complete plan)

## Files Created/Modified

- `lighthouserc.json` - mobile Lighthouse CI assertions (4 categories >= 0.95 + Web Vitals + script-size budgets, 3 runs, Slow 4G + 4x CPU, no preset)
- `.github/workflows/ci.yml` - blocking PR + push-to-main gate: sync -> check -> build -> audit -> js-weight -> security-check, plus a separate dependency-review job
- `.github/workflows/lighthouse.yml` - deployment_status-triggered Lighthouse run against the Vercel preview URL with the Deployment-Protection bypass header

## Decisions Made

- **`actions/checkout@v7`** — pinned the current major (`releases/latest` = v7.0.1) rather than the RESEARCH pattern's `@v6`; the plan instructs pinning the current major and recording the deviation.
- **`actions/dependency-review-action@v5.0.0`** — the repo publishes no moving `v5` major tag (`gh api .../git/ref/tags/v5` -> 404), so the pattern's `@v5` is unresolvable; pinned the exact latest release.
- **No per-job `permissions` in `ci.yml`** — top-level `contents: read` is inherited; `statuses: write` is granted only in `lighthouse.yml` where posting the check requires it (threat model T-04-02).
- **HIGH-advisory triage is closed** (orchestrator, Felipe's decision — commits `656d5be` + follow-ups): `pnpm-workspace.yaml` carries `overrides` (path-to-regexp 6.3.0, tmp 0.2.7) and `auditConfig.ignoreGhsas` (the two unfixable dev/CI-only extract-zip advisories). `pnpm audit --audit-level=high` exits 0 on the resolved tree, so the CI step is a plain blocking run with no `|| true` — it stays green now and still blocks any new high advisory. Not re-opened here.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `actions/checkout` pinned to `@v7`, not the RESEARCH pattern's `@v6`**
- **Found during:** Task 2 (action-tag verification per the plan's explicit instruction)
- **Issue:** RESEARCH Pattern 3 shows `actions/checkout@v6`. `gh api repos/actions/checkout/releases/latest` returns `v7.0.1` — v7 is the current major.
- **Fix:** Pinned `actions/checkout@v7` in both `ci.yml` and `lighthouse.yml`. Existence confirmed via `gh api repos/actions/checkout/git/ref/tags/v7`.
- **Files modified:** `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml`
- **Verification:** `gh api` ref lookup returns `refs/tags/v7`; YAML parses.
- **Committed in:** Task 2 and Task 3 commits

**2. [Rule 3 - Blocking] `actions/dependency-review-action` pinned to `@v5.0.0` (exact release), not `@v5`**
- **Found during:** Task 2 (action-tag verification)
- **Issue:** RESEARCH Pattern 3 shows `actions/dependency-review-action@v5`. That repo publishes only full semver tags — `gh api .../git/ref/tags/v5` and `.../v4` both return 404; there is no moving major tag.
- **Fix:** Pinned `actions/dependency-review-action@v5.0.0` (the current `releases/latest`).
- **Files modified:** `.github/workflows/ci.yml`
- **Verification:** `gh api repos/actions/dependency-review-action/releases/latest` = `v5.0.0`; YAML parses.
- **Committed in:** Task 2 commit

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking, both forced by the plan's own "verify the current major tag before pinning" instruction). No scope creep — the workflows deliver exactly the gate surface the plan specifies.
**Impact on plan:** None functional. Tag pins are more current / correct than the RESEARCH placeholders.

## Issues Encountered

None. All three files authored from the RESEARCH patterns; only the action tags needed live resolution.

## Known Stubs

- None. The three files are complete. They cannot *execute* until the repo is on GitHub (plan 05) with `VERCEL_AUTOMATION_BYPASS_SECRET` set (plan 06) and the Vercel Git integration emitting `deployment_status` events — authoring + YAML/JSON validity is this plan's deliverable, and plan 07 proves them green on a live PR.

## Threat Surface

Matches the plan's `<threat_model>`; no new security-relevant surface.
- T-04-01 (bypass-secret disclosure): `lighthouse.yml` trigger is `deployment_status`, never `pull_request_target`; the secret is only interpolated into `LHCI_EXTRA_HEADERS` and never echoed in a `run:` step.
- T-04-02 (token scope): top-level `permissions: contents: read`; `statuses: write` only in `lighthouse.yml`.
- T-04-03 (supply chain): every action pinned to an API-verified tag.
- T-04-04 / T-04-05 (dependency drift / malicious dep): `pnpm install --frozen-lockfile` + `pnpm audit --audit-level=high` + `dependency-review-action` at `fail-on-severity: high`.
- T-04-06 (Lighthouse scoring the SSO page): `x-vercel-protection-bypass` header on every request; plan 07 confirms real page metrics.
- T-04-07 (flaky `deployment_status` association): accepted; plan 07 empirically confirms the check appears on a live PR; RESEARCH documents the local-static-server fallback (not implemented now).

## Next Phase Readiness

- **Plan 05** (GitHub repo + Vercel project): must run `gh auth refresh -s workflow -h github.com` before the first push that includes `.github/workflows/*` — the machine token lacks the `workflow` scope (Pitfall 8). Sequence: create repo -> push non-workflow files -> refresh scope -> push workflows.
- **Plan 06**: set `VERCEL_AUTOMATION_BYPASS_SECRET` as a GitHub Actions repository secret (same value Vercel auto-injects into deployments) so `lighthouse.yml` can bypass Deployment Protection.
- **Plan 07** (branch protection): confirm the exact reported check contexts from a live PR (`verify`, `dependency-review`, `lhci`) before writing them into the branch-protection `contexts` array; if `deployment_status` proves unusable as a required check, the documented fallback is a local `sirv-cli` Lighthouse run inside `ci.yml`.
- **Plan 08** (SEC-07 run file): copy the PERF-02 INP-deferral sentence verbatim into `.planning/security/runs/phase-01.md`; the deferred-items D1 HIGH-advisory triage is already resolved (overrides + allowlist) — record the two `extract-zip` GHSAs as accepted `Med` findings with a target date.
- Branch is still `master` (rename to `main` owned by plan 05).

---
*Phase: 01-foundation-ci-gate*
*Completed: 2026-09-08*
