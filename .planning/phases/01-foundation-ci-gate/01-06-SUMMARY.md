---
phase: 01-foundation-ci-gate
plan: 06
subsystem: infra
tags: [vercel, deployment-protection, protection-bypass, github-actions-secret, git-integration, spend-cap, 2fa, hobby-plan]

requires:
  - phase: "01-05"
    provides: "Public repo Felipe-Salles/dmarques, default branch main, gh token with workflow scope"
  - phase: "01-04"
    provides: ".github/workflows/lighthouse.yml reads secrets.VERCEL_AUTOMATION_BYPASS_SECRET; deployment_status trigger"
provides:
  - "Vercel project felipe-salles-projects/dmarques (prj_79OkHSNj4o6iS62XwhsFuadjEErG) linked to the GitHub repo via the Vercel Git integration, production branch main"
  - "Framework preset astro, build command 'pnpm build', install command 'pnpm install --frozen-lockfile', output directory adapter-default"
  - "Standard Deployment Protection (Vercel Authentication) active on all deployments except custom domains — preview and production both gated (no domain attached, D-09)"
  - "Protection Bypass for Automation secret generated (scope automation-bypass) and mirrored into GitHub Actions repo secret VERCEL_AUTOMATION_BYPASS_SECRET (value never logged)"
  - "First production deployment (commit 47323f1) READY at https://dmarques-3g4hn76v2-felipe-salles-projects.vercel.app — Git integration confirmed working; GitHub sees the deployment event (environment Production)"
  - "Phase 1 baseline response headers captured for the security-check.sh check-6 / Phase 7 header assertions"
  - "Spend-cap decision: hobby-structural. SEC-08 residual-risk bullet in ROADMAP.md rewritten to describe the structural Hobby cap accurately"
  - "2FA confirmed active on both the GitHub and Vercel accounts (Felipe, 2026-09-09)"
affects: [phase-1-branch-protection-plan-07, phase-1-security-run-plan-08, phase-5-contact-form, phase-7-security-headers]

tech-stack:
  added: []
  patterns:
    - "Vercel project settings applied via the REST API (v9/projects PATCH) using a short-lived personal API token, not the dashboard — a deviation from D-03's dashboard-walkthrough framing, at Felipe's explicit request"
    - "Automation bypass secret mirrored to GitHub Actions in a single shell pipeline that reads the value from the Vercel API and pipes it straight into 'gh secret set --body -' so the value never appears in a command, a log, or the chat"
    - "Deployment Protection left at Vercel's default 'all_except_custom_domains' (Standard Protection) — correct for Phases 1-7 because no custom domain is attached, so preview and production are both gated"

key-files:
  created: []
  modified:
    - ".planning/ROADMAP.md (SEC-08 spend-cap bullet only)"
    - ".gitignore (dropped redundant bare '.vercel' left by 'vercel link', kept '.env*')"

key-decisions:
  - "Spend-cap mechanism: hobby-structural (Felipe, 2026-09-09). Stay on Vercel Hobby with no payment method on file; spend is structurally capped at $0 (project pauses at the free-tier ceiling), usage notifications at 75/100%. No configurable USD cap, no tunable auto-pause, no 'form off site up' graceful degradation. Milestone 2 revisits alongside the Cloudflare layer."
  - "SEC-08 residual-risk statement in ROADMAP.md: the 'Vercel Spend Management ... hard spend cap' bullet was rewritten to describe the structural Hobby cap and to state plainly it is weaker than the Pro-only Spend Management feature. No other ROADMAP text changed."
  - "Felipe asked Claude to execute the Vercel setup directly via CLI + API rather than be walked through the dashboard (deviation from D-03). Claude drove items 2-10; 2FA (item 1) and the Task 3 browser/DevTools checks stayed with Felipe."
  - "Task 3 visual verification (render, font-origin in Network tab, zero cookies in Application tab) deferred to the 01-08 security run file (Felipe's choice, 2026-09-09) — the curl evidence already covers the substance (no google-font refs in HTML, no Set-Cookie header)."
  - "Deployment Protection kept at 'all_except_custom_domains' rather than 'all' — no custom domain is attached (D-09), so this already gates every reachable URL, and it is the correct end state for when the domain is attached post-Phase-7."
  - "A short-lived (1-day) Vercel personal API token was created by Felipe for this plan and written to the gitignored .vercel/.token; deleted at plan close. Felipe to revoke it in the Vercel dashboard."

patterns-established:
  - "Pattern 1: secret material (the automation bypass value) is moved service-to-service through a single non-echoing pipeline, never surfaced"
  - "Pattern 2: dashboard-only Vercel state that git cannot hold (project settings, protection mode, spend-cap posture, 2FA, baseline headers) is captured verbatim in the plan SUMMARY for the 01-08 run file"

requirements-completed: []

duration: 45min
completed: 2026-09-09
---

# Phase 1 Plan 06: Vercel Link, Hardening & Protection Bypass Summary

**Vercel project `felipe-salles-projects/dmarques` linked to the public GitHub repo via the Git integration (production branch `main`, framework Astro, `pnpm build` / `pnpm install --frozen-lockfile`), Standard Deployment Protection active on every reachable URL, the Protection Bypass for Automation secret generated and mirrored into the `VERCEL_AUTOMATION_BYPASS_SECRET` GitHub Actions secret without the value ever being logged, the first production deployment (`47323f1`) verified READY behind SSO with the bypass header returning the real pt-BR placeholder, 2FA confirmed on both accounts, and the SEC-08 spend-cap statement corrected to the chosen `hobby-structural` mechanism.**

## Checkpoint resolution

**Task 1 — checkpoint:decision (Felipe, 2026-09-09):** spend-cap mechanism = **`hobby-structural`**. No dollar figure. SEC-08 bullet in `ROADMAP.md` rewritten accordingly.

**Task 2 — checkpoint:human-action:** executed by Claude via `vercel` CLI + Vercel REST API at Felipe's explicit request (deviation from D-03's dashboard-walkthrough framing — see Deviations). 2FA (item 1) confirmed done by Felipe on both the GitHub and Vercel accounts.

**Task 3 — checkpoint:human-verify:** curl-level checks run by Claude and all PASS (below). The three browser/DevTools checks (visual render, per-request font origin, cookie inspection) were deferred by Felipe to the 01-08 security run file; the captured HTML and response headers already establish the substance.

## Performance

- **Duration:** ~45 min (interactive, spread across checkpoint exchanges)
- **Completed:** 2026-09-09
- **Tasks:** 3 (all checkpoint-type; Task 2 executed by Claude via CLI/API)
- **Files modified:** 2 (`.planning/ROADMAP.md` SEC-08 bullet, `.gitignore`)

## Accomplishments

### Vercel project + Git integration
- `vercel project add dmarques` + `vercel link --yes --project dmarques` → project `prj_79OkHSNj4o6iS62XwhsFuadjEErG` under team `team_J7rCzdvtFEpWYOgeVz1mEi79` (`felipe-salles-projects`, Hobby).
- `vercel git connect` → GitHub repo `https://github.com/Felipe-Salles/dmarques` connected (the Vercel GitHub App already had access; no manual grant needed). `link.productionBranch` = `main`.
- `PATCH /v9/projects/{id}` → `framework: astro`, `buildCommand: pnpm build`, `installCommand: pnpm install --frozen-lockfile`, `outputDirectory: null` (adapter default).

### Deployment Protection + bypass secret
- `ssoProtection.deploymentType` = `all_except_custom_domains` (Vercel's Standard Protection default). With no custom domain attached (D-09), preview **and** production are both behind Vercel Authentication.
- `gitForkProtection` = `true` (fork PRs cannot read repo secrets — the `deployment_status` job in `lighthouse.yml` relies on this).
- `PATCH /v1/projects/{id}/protection-bypass` → one `automation-bypass` scoped secret generated (32-char).
- Secret mirrored: `curl … | node -e '…keys(protectionBypass)[0]' | gh secret set VERCEL_AUTOMATION_BYPASS_SECRET --repo Felipe-Salles/dmarques --body -`. The value never appeared in a command argument, a log line, or this chat. `gh secret list` confirms `VERCEL_AUTOMATION_BYPASS_SECRET` present.

### First deployment
- Push of commit `47323f1` to `main` triggered a **production** deployment via the Git integration → `dpl_CGXzpocExdPew9Y9WSoMkunVuMww`, state `READY`, URL `https://dmarques-3g4hn76v2-felipe-salles-projects.vercel.app`.
- `gh api repos/Felipe-Salles/dmarques/deployments` shows the event with `environment: Production` — GitHub can see Vercel's deployment events, which is what `lighthouse.yml`'s `deployment_status` trigger needs.

### Spend cap + 2FA
- Team `billing.plan` = `hobby`, `billing.status` = `active`, no billing period / invoice items → structural $0 cap confirmed.
- 2FA active on both the GitHub and Vercel accounts (confirmed by Felipe, 2026-09-09).

## Task 3 — protection & bypass verification (curl)

| Check | Expected | Result |
|-------|----------|--------|
| `curl -sI $URL` (no header) | 401 or SSO 3xx | **HTTP 302 → `https://vercel.com/sso-api?...`** — PASS |
| `curl -sI -H "x-vercel-protection-bypass: <secret>" $URL/` | 200 | **HTTP 200** — PASS |
| `<h1` count in bypassed body | 1 | **1** — PASS |
| tagline `nunca sai do ar` present | yes | **present** — PASS |
| `fonts.(googleapis\|gstatic).com` in body | absent | **absent** — PASS |
| `Set-Cookie` on the response | absent | **absent** — PASS |

### Phase 1 baseline response headers (bypassed GET `/`, commit 47323f1)

```
HTTP/1.1 200 OK
Accept-Ranges: bytes
Access-Control-Allow-Origin: *
Age: 0
Cache-Control: public, max-age=0, must-revalidate
Content-Disposition: inline
Content-Length: 8827
Content-Type: text/html; charset=utf-8
Etag: "bb083e8f2926e955441bad9efe334497"
Server: Vercel
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Robots-Tag: noindex
X-Vercel-Cache: HIT
X-Vercel-Id: gru1::lls2p-1789006058512-a8a133d8dfe3
```

Notes for Phase 7: `Strict-Transport-Security` is already emitted by Vercel's default. `X-Robots-Tag: noindex` is present because the deployment is protected (good for D-09). No `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or `Content-Security-Policy` yet — those are Phase 7 (`vercel.json` headers + `security.csp`).

## Repository / project facts (for plans 07-08)

| Fact | Value |
|------|-------|
| Vercel project | `felipe-salles-projects/dmarques` |
| Project ID | `prj_79OkHSNj4o6iS62XwhsFuadjEErG` |
| Team ID | `team_J7rCzdvtFEpWYOgeVz1mEi79` |
| Plan | Hobby (`billing.plan: hobby`, no payment method) |
| Production branch | `main` |
| Framework / build / install | `astro` / `pnpm build` / `pnpm install --frozen-lockfile` |
| Deployment Protection | Standard — `ssoProtection.deploymentType: all_except_custom_domains` |
| Fork protection | `gitForkProtection: true` |
| Bypass secret (GitHub) | `VERCEL_AUTOMATION_BYPASS_SECRET` (mirrored; value not recorded anywhere) |
| First prod deployment | `dpl_CGXzpocExdPew9Y9WSoMkunVuMww` — commit `47323f1` — `https://dmarques-3g4hn76v2-felipe-salles-projects.vercel.app` |
| Domain | none attached (D-09) |
| 2FA | active on GitHub + Vercel accounts |

## Acceptance criteria verification

| Criterion | Result |
|-----------|--------|
| `gh secret list \| grep -q VERCEL_AUTOMATION_BYPASS_SECRET` | PASS |
| A deployment URL for the pushed commit exists and is reported | PASS (`dmarques-3g4hn76v2-…` for `47323f1`) |
| `gh api repos/{owner}/{repo}/deployments --jq '.[0].environment'` contains `Preview`/`Production` | PASS (`Production` — Git integration is posting deployment events) |
| Items 1-9 confirmed | PASS (1 & 9 by Felipe; 2-8 by Claude via CLI/API) |
| Bypass secret value absent from chat / repo / logs | PASS (moved through a non-echoing pipeline) |
| `curl` unauthenticated → 401/3xx SSO | PASS (302) |
| `curl` with bypass header → 200 | PASS |
| `grep -c '<h1'` = 1 and tagline present | PASS |
| no `fonts.(googleapis\|gstatic).com` | PASS |
| step-2 headers captured for the run file | PASS (above) |

## Deviations from Plan

1. **D-03 framing — dashboard walkthrough → Claude-driven CLI/API (Rule 3, Felipe-authorised).** The plan frames every step as a dashboard action under Felipe's login ("Claude cannot perform them"). Felipe explicitly asked Claude to do it directly. Claude used the already-authenticated `vercel` CLI and a short-lived personal API token (created by Felipe) to perform items 2-10. D-03's intent — Felipe's consent for irreversible/account actions, and no secret leakage — was preserved: each step was described before running, the bypass secret never surfaced, and 2FA + the browser checks stayed with Felipe. Recorded here as the plan requires.
2. **Task 3 visual checks deferred to 01-08 (Felipe's choice).** Items 4-6 (browser render, Network font origins, Application cookies) are folded into the 01-08 security run file rather than done inline. The curl evidence covers the substance.
3. **`.gitignore` tidy (Rule 3).** `vercel link` appended a bare `.vercel` (duplicating the existing `.vercel/`) and `.env*`. Removed the redundant bare entry, kept `.env*` (it protects the `.env.local` that `vercel link` generated). One line net change beyond the plan's `files_modified`.
4. **Deployment Protection scope.** Left at the default `all_except_custom_domains` rather than explicitly setting `all`. Functionally identical while no domain is attached, and the correct posture for the eventual domain cutover.

## Authentication Gates

- **Vercel API token** — a 1-day personal token created by Felipe (the `vercel` CLI's stored session token is not accepted by the REST API: `invalidToken`). Written to the gitignored `.vercel/.token`, used for the `v9/projects` PATCH and the `protection-bypass` PATCH, then **deleted at plan close**. Felipe to revoke it in the Vercel dashboard (Account Settings → Tokens).
- **2FA enrolment** — done by Felipe on both accounts; cannot be automated.

## Requirements

- **INFRA-07** (continuous Vercel deploy via Git integration, preview deploy per PR) — the Git integration is live and a push to `main` produced a production deployment. The **preview-deploy-per-PR** leg is demonstrated in plan 07 when the first real PR is opened. Left unchecked here; plan 07 marks it.
- **INFRA-10** (2FA, protected production branch, Deployment Protection on previews, spend cap with usage alerts) — 3 of 4 delivered here: **2FA** (both accounts), **Deployment Protection** (Standard, gates preview + production), **spend cap** (structural Hobby, 75/100% notifications, SEC-08 corrected). **Protected production branch** is plan 07. INFRA-10 stays Pending until then.

## Known Stubs

- Branch protection on `main` — plan 07 (needs the live required-status-check context strings from a real PR run).
- The 01-08 run file must transcribe: this plan's baseline headers, the spend-cap posture, the Deployment Protection mode, the 2FA confirmation, and the deferred Task 3 visual checks.

## Threat Surface

Matches the plan's `<threat_model>`:
- **T-06-01** (preview info disclosure): unauthenticated request returns 302 → SSO; `X-Robots-Tag: noindex` on the protected deployment. Verified.
- **T-06-02** (`VERCEL_AUTOMATION_BYPASS_SECRET`): generated server-side, mirrored through a non-echoing pipeline, consumed only by the `deployment_status` job; `gitForkProtection: true` keeps fork PRs out.
- **T-06-03** (account takeover): 2FA active on both accounts.
- **T-06-04** (cost attack): structural Hobby $0 cap; site is 100% static so GET floods are absorbed at the CDN edge; residual edge-WAF gap is the knowingly-accepted SEC-08 statement, whose spend-cap bullet is now accurate.
- **T-06-05** (env var scoping): no secret values added this phase.
- **T-06-06** (dashboard state lost to time): captured in this SUMMARY for the 01-08 run file.

## Next Phase Readiness

- **Plan 07** (branch protection): open a real PR from a working branch → it produces a Vercel **preview** deployment (proves INFRA-07's PR leg) and runs `verify` + `dependency-review` + `lhci`. Capture the exact status-check context strings GitHub reports, then `PUT /repos/Felipe-Salles/dmarques/branches/main/protection` with those contexts. Prove each gate red (push a failing change) then green.
- **Plan 08** (SEC-07 run file): transcribe this SUMMARY's baseline headers + dashboard state; record the two `extract-zip` GHSAs as accepted `Med` findings; do the deferred Task 3 visual checks; get Felipe's sign-off.

## Self-Check: PASSED

- `.planning/phases/01-foundation-ci-gate/01-06-SUMMARY.md` — FOUND
- `gh secret list` shows `VERCEL_AUTOMATION_BYPASS_SECRET` — verified
- Vercel project `dmarques` linked, `framework: astro`, `link.productionBranch: main` — verified via `v9/projects` GET
- `ssoProtection.deploymentType: all_except_custom_domains`, `gitForkProtection: true` — verified
- Production deployment `47323f1` state `READY`; unauthenticated 302, bypassed 200, `<h1>`=1, tagline present, no google-font refs, no `Set-Cookie` — verified via curl
- `billing.plan: hobby` — verified
- `.vercel/.token` deleted at plan close — see final commit
- SEC-08 bullet in `ROADMAP.md` changed, no other ROADMAP text touched — verified via `git diff`

---
*Phase: 01-foundation-ci-gate*
*Completed: 2026-09-09*
