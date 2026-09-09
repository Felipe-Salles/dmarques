---
phase: 01-foundation-ci-gate
plan: 05
subsystem: infra
tags: [github, gh-cli, git, oauth-scopes, public-repo, branch-rename, ci-gate]

requires:
  - phase: "01-03"
    provides: "scripts/js-weight-check.sh + scripts/security-check.sh; pnpm-workspace.yaml overrides + auditConfig.ignoreGhsas; .gitattributes *.sh eol=lf"
  - phase: "01-04"
    provides: ".github/workflows/ci.yml + lighthouse.yml; check names verify / dependency-review / lhci; STATIC_DIR wired into ci.yml"
provides:
  - "Public GitHub repository Felipe-Salles/dmarques, default branch main"
  - "origin remote (https://github.com/Felipe-Salles/dmarques.git) with upstream tracking on main"
  - "Entire Phase 1 tree (plans 01-01..01-04) live on GitHub at SHA 75a90ea, including both workflow files and vercel.json"
  - "Local branch renamed master -> main; no master branch remains"
  - "Confirmed pnpm audit severity threshold = high (no edit to security-check.sh / ci.yml)"
  - "gh token for account Felipe-Salles carries the workflow scope (enables .github/workflows/* pushes for all later plans)"
affects: [phase-1-vercel-setup-plan-06, phase-1-branch-protection-plan-07, phase-1-security-run-plan-08, every-later-phase-ci-run]

tech-stack:
  added: []
  patterns:
    - "Irreversible remote actions (repo creation, public visibility, branch rename, first push) each gated on Felipe's explicit recorded approval (D-03)"
    - "Repo created with gh repo create <name> --public --source=. --remote=origin --push as Felipe-Salles (D-01/D-03); default branch set to main by the push of the renamed local branch (D-02)"
    - "Build artefacts (node_modules, dist, .vercel, .astro, .lighthouseci) confirmed absent from git ls-files before the first push to a permanently world-readable history"

key-files:
  created: []
  modified: []

key-decisions:
  - "Repository name: dmarques (Felipe, 2026-09-08). Full name Felipe-Salles/dmarques"
  - "Audit severity threshold: high (Felipe, 2026-09-08). Per plan Task 3, high => no edit to scripts/security-check.sh or .github/workflows/ci.yml; both already ship --audit-level=high / fail-on-severity: high from plan 04"
  - "PUBLIC visibility, master -> main rename, and first push of the full Phase 1 tree all explicitly approved by Felipe (2026-09-08) before any irreversible command ran"
  - "Task 2 (gh auth refresh -s workflow) completed by Felipe out-of-band; gh auth status now lists scopes gist, read:org, repo, workflow for Felipe-Salles — the workflow-file push in Task 3 succeeded"
  - "Branch protection NOT applied here — deferred to plan 07 once the live required-status-check context strings are known (Open Question 4)"

patterns-established:
  - "Pattern 1: the public GitHub history starts clean — git ls-files carries zero build artefacts and the committed pnpm-lock.yaml"
  - "Pattern 2: the gh token scope is the minimum needed (workflow added, nothing broader like admin:org / delete_repo)"

requirements-completed: [INFRA-08]

duration: 10min
completed: 2026-09-08
---

# Phase 1 Plan 05: Public GitHub Repo & First Push Summary

**Public `Felipe-Salles/dmarques` repository created via `gh` as Felipe-Salles with `main` as its default branch, the local `master` branch renamed to `main`, and the complete Phase 1 tree (plans 01-01..01-04, both CI workflow files and `vercel.json`) pushed at SHA `75a90ea` with upstream tracking configured — the `pnpm audit` gate confirmed at `high`, and every irreversible step taken only after Felipe's explicit recorded approval.**

## Checkpoint resolution (Tasks 1 & 2)

**Task 1 — checkpoint:decision (Felipe, 2026-09-08):**
- Repository name: **`dmarques`**
- Explicitly approved: **PUBLIC** visibility, **`master` -> `main`** rename, **first push** of the full Phase 1 tree
- Audit severity threshold: **`high`** — so per the plan, **no edit** was made to `scripts/security-check.sh` or `.github/workflows/ci.yml` (both already carry `--audit-level=high` / `fail-on-severity: high` from plan 04)

**Task 2 — checkpoint:human-action (done out-of-band):**
- `gh auth refresh -s workflow -h github.com` completed by Felipe. `gh auth status` now reports scopes `'gist', 'read:org', 'repo', 'workflow'` for account `Felipe-Salles`. The `workflow` scope being present is what let the Task 3 push carry `.github/workflows/*` without rejection.

## Performance

- **Duration:** ~10 min (continuation; Tasks 1 & 2 resolved earlier by Felipe)
- **Started:** 2026-09-08 (continuation execution)
- **Completed:** 2026-09-08
- **Tasks:** 1 executed here (Task 3); Tasks 1 & 2 were human-gated checkpoints resolved beforehand
- **Files modified:** 0 code files (audit threshold `high` => no edits); 3 planning docs updated (SUMMARY, STATE, ROADMAP)

## Accomplishments

- **Branch renamed** `master` -> `main` (`git branch -m master main`); `git branch --list master` now empty (D-02).
- **Public repository created**: `gh repo create dmarques --public --source=. --remote=origin --push` as `Felipe-Salles` -> `https://github.com/Felipe-Salles/dmarques`. `origin` remote configured, `main` pushed and set to track `origin/main`.
- **Default branch** on the remote is `main` (set by the push of the renamed local branch; `gh repo view --json defaultBranchRef` = `main` — no `gh repo edit` needed).
- **Full Phase 1 tree live** at SHA `75a90ea602f7a0e3a9ae85c1445005df75ba39bc`, including `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml` and `vercel.json` (all three confirmed present via `gh api repos/{owner}/{repo}/contents/...`).
- **Clean public history**: `git ls-files | grep -cE '^(node_modules|dist|\.vercel|\.astro|\.lighthouseci)/'` = `0`; `pnpm-lock.yaml` is tracked.
- **Audit threshold confirmed** at `high` and consistent between `scripts/security-check.sh` (check 1 `--audit-level=high`) and `.github/workflows/ci.yml` (`pnpm audit --audit-level=high` step + `dependency-review-action` `fail-on-severity: high`) — both unchanged, as the plan requires for the `high` selection.

## Repository facts (for plans 06-08)

| Fact | Value |
|------|-------|
| Repository full name | `Felipe-Salles/dmarques` |
| URL | https://github.com/Felipe-Salles/dmarques |
| Visibility | `PUBLIC` |
| Default branch | `main` |
| origin remote | `https://github.com/Felipe-Salles/dmarques.git` |
| Pushed Phase 1 SHA | `75a90ea602f7a0e3a9ae85c1445005df75ba39bc` |
| Audit severity threshold | `high` |
| gh account / scopes | `Felipe-Salles` / `gist, read:org, repo, workflow` |

## Acceptance criteria verification

| Criterion | Result |
|-----------|--------|
| `git rev-parse --abbrev-ref HEAD` = `main` | PASS (`main`) |
| `git branch --list master` empty | PASS (no output) |
| `git remote get-url origin` contains `github.com` | PASS (`https://github.com/Felipe-Salles/dmarques.git`) |
| `gh repo view --json visibility` = `PUBLIC` | PASS |
| `gh repo view --json defaultBranchRef` = `main` | PASS |
| `gh api .../contents/.github/workflows/ci.yml` = `ci.yml` | PASS |
| `gh api .../contents/.github/workflows/lighthouse.yml` = `lighthouse.yml` | PASS |
| `gh api .../contents/vercel.json` = `vercel.json` | PASS |
| `git status --porcelain` lists no build-artefact path | PASS (clean tree) |
| `git ls-files \| grep -cE '^(node_modules\|dist\|\.vercel\|\.astro\|\.lighthouseci)/'` = `0` | PASS |
| `git ls-files \| grep -q '^pnpm-lock.yaml$'` | PASS |
| `git log origin/main --oneline -1` resolves (upstream tracking) | PASS (`@{u}` = `origin/main`) |

## Task Commits

Task 3 made no code commits — the working tree was already clean (all Phase 1 work committed across plans 01-01..01-04) and the `high` audit threshold means no edit to `security-check.sh` / `ci.yml`. The task's product is remote state: the branch rename, the repository, and the push of existing commit `75a90ea`.

1. **Task 1: Approve repo creation + audit threshold** - checkpoint:decision, resolved by Felipe 2026-09-08 (no commit)
2. **Task 2: Grant gh token the workflow scope** - checkpoint:human-action, resolved by Felipe (no commit)
3. **Task 3: Rename branch, create remote, push** - no code commit; `git branch -m master main` + `gh repo create ... --push` of `75a90ea`

**Plan metadata:** `docs(01-05): complete github-repo-first-push plan` (final commit — this SUMMARY + STATE + ROADMAP)

## Files Created/Modified

- None in the repository source tree. `git branch -m` and `gh repo create` operate on git refs / the remote, not tracked files.
- Planning docs updated: `.planning/phases/01-foundation-ci-gate/01-05-SUMMARY.md` (new), `.planning/STATE.md`, `.planning/ROADMAP.md`.

## Decisions Made

- **Repository name `dmarques`** — Felipe's choice (2026-09-08); the plan's proposed default.
- **Audit threshold `high`** — Felipe's choice; matches `dependency-review-action`'s `fail-on-severity: high` and avoids PRs blocked by unfixable low/moderate transitive advisories (RESEARCH A8, Pitfall 7). No edit to `security-check.sh` / `ci.yml`.
- **No `gh repo edit --default-branch`** — the remote's default branch was already `main` after the push of the renamed local branch, so step 4 of the plan was a no-op.
- **No branch protection** — deferred to plan 07 by design (needs the live required-status-check contexts).

## Deviations from Plan

None - plan executed exactly as written. Task 3 step 2 ("stage and commit every Phase 1 file") was a no-op because the working tree was already clean (all Phase 1 files committed in plans 01-01..01-04); the plan's `<task_3_steps>` explicitly anticipates this ("If nothing is uncommitted, skip the stage and commit sub-step"). Task 3 step 4 (`gh repo edit --default-branch main`) was a no-op because `gh repo create --push` of the renamed branch already made `main` the default.

## Authentication Gates

- **Task 2** (`gh auth refresh -s workflow -h github.com`) — a one-time browser-consent action only Felipe can complete. Resolved out-of-band before this continuation; `gh auth status` confirmed the `workflow` scope for `Felipe-Salles` prior to the Task 3 push. Normal flow, not a defect.

## Requirements

- **INFRA-08** (CI pipeline blocking merge on `astro check` / build / `pnpm audit` / Dependency Review) — the workflow files authored in plan 04 are now live on GitHub, so the pipeline exists as a real gate. Marked complete. (It was already checked `[x]` from plan 04's authoring; the push makes it operative.)
- **INFRA-10** (Vercel/repo hardening — 2FA, protected production branch, Deployment Protection, spend cap) — **remains Pending**. Plan 05 delivers only the public repo. Branch protection is plan 07; Deployment Protection + spend cap are plan 06; 2FA verification is plan 08. Not marked complete here.

## Known Stubs

- None. The CI workflows are complete and now live; they still cannot fully execute end-to-end until plan 06 links the Vercel project and sets `VERCEL_AUTOMATION_BYPASS_SECRET`, and plan 07 proves them green/red on a live PR.

## Threat Surface

Matches the plan's `<threat_model>`; no new security-relevant surface.
- T-05-01 (info disclosure on first public push): `git ls-files` carries zero build artefacts; no secret value exists in the tree (only the `astro:env` key NAME is declared, per plan 01). Verified before the push.
- T-05-02 (token scope broadened to `workflow`): accepted — minimum scope to push `.github/workflows/*`; granted interactively by Felipe on his own account; narrower than `admin:org` / `delete_repo`.
- T-05-03 (unreviewed code on `main`): open single-operator window; closes in plan 07 when branch protection lands.
- T-05-05 (irreversible actions without consent): every irreversible step (repo creation, public visibility, branch rename, first push) had Felipe's explicit recorded approval.

## Next Phase Readiness

- **Plan 06** (Vercel link): repository is `Felipe-Salles/dmarques`, default branch `main`. Link the Vercel project to it, set `VERCEL_AUTOMATION_BYPASS_SECRET` as a GitHub Actions repository secret (same value Vercel injects), configure Deployment Protection on previews, and confirm the spend-cap amount with Felipe.
- **Plan 07** (branch protection): use `Felipe-Salles/dmarques` for the branch-protection API call; capture the exact reported check contexts (`verify`, `dependency-review`, `lhci`) from a live PR before writing the `contexts` array.
- **Plan 08** (SEC-07 run file): copy the PERF-02 INP-deferral sentence verbatim into `.planning/security/runs/phase-01.md`; record the two `extract-zip` GHSAs as accepted `Med` findings; verify 2FA on the `Felipe-Salles` GitHub account for INFRA-10.
- Branch is now `main`, tracking `origin/main`. The next commit (this plan's metadata) lands on `main`.

## Self-Check: PASSED

- `.planning/phases/01-foundation-ci-gate/01-05-SUMMARY.md` - FOUND
- Remote `Felipe-Salles/dmarques` visibility `PUBLIC`, default branch `main` - verified via `gh repo view`
- `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml`, `vercel.json` present on remote - verified via `gh api .../contents/...`
- Local `HEAD` = `main`, no `master` branch, `@{u}` = `origin/main` - verified
- `git ls-files` build-artefact count = `0`; `pnpm-lock.yaml` tracked - verified
- Pushed SHA `75a90ea602f7a0e3a9ae85c1445005df75ba39bc` resolves on `origin/main` - verified

---
*Phase: 01-foundation-ci-gate*
*Completed: 2026-09-08*
