---
phase: 01
slug: foundation-ci-gate
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-05
approved: 2026-09-08
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: `01-RESEARCH.md` § "Validation Architecture" (L770-L820).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no application logic in Phase 1. Gate harness = GitHub Actions + `@lhci/cli` + `scripts/js-weight-check.sh` + `scripts/security-check.sh` |
| **Config file** | `lighthouserc.json`, `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml` — none exist yet; created by plans 01-04 (`lighthouserc.json`, both workflows) and 01-03 (both scripts) |
| **Quick run command** | `pnpm astro sync && pnpm astro check && pnpm build && bash scripts/js-weight-check.sh "$STATIC_DIR"` |
| **Full suite command** | the quick run + `pnpm audit --audit-level=high` + `bash scripts/security-check.sh --ci` + `lhci autorun` (or the preview-URL `lighthouse.yml` job) |
| **Estimated runtime** | quick ~90 seconds · full suite ~8 minutes (3 Lighthouse runs dominate) |

`STATIC_DIR` is resolved once in plan 01-02 Task 3 and recorded in `01-02-SUMMARY.md`. Every script and workflow reads it from a single place; the documented default while it is unresolved is `.vercel/output/static`.

---

## Sampling Rate

- **Per task commit:** `pnpm astro check && pnpm build && bash scripts/js-weight-check.sh "$STATIC_DIR"`
- **Per PR (CI):** full `ci.yml` — check, build, audit, dependency-review, js-weight, security-check — plus `lighthouse.yml` against the preview
- **Phase gate:** every row of the Per-Task Verification Map green + `security-check.sh --ci` PASS + `.planning/security/runs/phase-01.md` carrying no open High finding, before `/gsd:verify-work`
- **Max feedback latency:** ~90 seconds (quick run)

---

## Per-Task Verification Map

One row per `type="auto"` task across plans 01-01 … 01-08. "Signal Row" cites the `01-RESEARCH.md` § "Phase Requirements → Signal Map" row (L787-L800) the task proves. "Threat Ref" cites the plan's `<threat_model>` entry the task implements a mitigation for, or `—`.

| Task ID | Plan | Wave | Requirement | Signal Row | Threat Ref | Test Type | Automated Signal | Harness | Status |
|---------|------|------|-------------|------------|------------|-----------|------------------|---------|--------|
| 01-01-01 | 01 | 1 | INFRA-01 | INFRA-01 | T-01-01 / T-01-SC | dep-assert | `node -e` — every pinned package present, no denylisted framework/animation package | ✅ node | ⬜ pending |
| 01-01-02 | 01 | 1 | INFRA-01, INFRA-03, INFRA-05, INFRA-06 | INFRA-01, INFRA-03, INFRA-05, INFRA-06 | T-01-02 / T-01-03 / T-01-04 / T-01-05 | config-assert | `node --input-type=module` — config imports; `output==='static'`, `inlineStylesheets==='never'`, 2 fonts, `RESEND_API_KEY` in `env.schema` | ✅ node | ⬜ pending |
| 01-01-03 | 01 | 1 | INFRA-02 | INFRA-02 | T-01-01 | config-assert | `node -e` — `biome.json`/`.prettierrc` parse, `vercel.json` is `{}`, `packageManager` + `engines.node` + `astro sync` in `check`, five `.gitignore` entries | ✅ node | ⬜ pending |
| 01-02-01 | 02 | 2 | INFRA-04 | INFRA-04 | — | config-assert | `node -e` — `tokens.css` has exactly one block, no `/*`, no `--font-display`/`--font-body` redefinition, composes `--font-heading`, carries the required token keys | ✅ node | ⬜ pending |
| 01-02-02 | 02 | 2 | INFRA-03, INFRA-04, PERF-04 | INFRA-03, INFRA-04, PERF-04 | T-02-02 / T-02-03 / T-02-05 | type-check | `pnpm run check` (runs `astro sync` first — Pitfall 5) | ✅ pnpm (wave 1) | ⬜ pending |
| 01-02-03 | 02 | 2 | INFRA-01, INFRA-02, INFRA-03, INFRA-05, INFRA-06, PERF-04 | INFRA-01, INFRA-02, INFRA-03, INFRA-05, INFRA-06, PERF-04 | T-02-01 / T-02-04 / T-02-06 | build-assert | `pnpm build` + `index.html` exists, zero Google-Fonts/secret matches, zero inline `<style>`, exactly 2 font preloads | ✅ pnpm + grep | ⬜ pending |
| 01-03-01 | 03 | 3 | PERF-03 | PERF-03 | T-03-03 | script-gate | `bash -n` + `bash scripts/js-weight-check.sh "${STATIC_DIR:-.vercel/output/static}"` exits 0 under 20480 gz bytes | ✅ bash | ⬜ pending |
| 01-03-02 | 03 | 3 | SEC-07, INFRA-06 | SEC-07, INFRA-06 | T-03-01 / T-03-02 / T-03-04 / T-03-06 | script-gate | `bash -n` + `bash scripts/security-check.sh --ci` exits 0 with 7 PASS/FAIL/SKIP lines and no FAIL | ✅ bash | ⬜ pending |
| 01-03-03 | 03 | 3 | SEC-07 | SEC-07 | T-03-05 | doc-assert | `grep -qF 'Nenhuma fase fecha com achado High em aberto.'` + exactly 7 numbered items + the D-12 findings header row | ✅ grep | ⬜ pending |
| 01-04-01 | 04 | 3 | INFRA-09, PERF-01, PERF-02 | INFRA-09 / PERF-01, PERF-02 | — | config-assert | `node -e` — no `preset`, four categories at `minScore` 0.95, `total-blocking-time` 200; plus the INP-deferral note recorded in the SUMMARY | ✅ node | ⬜ pending |
| 01-04-02 | 04 | 3 | INFRA-08, PERF-03 | INFRA-08, PERF-03 | T-04-02 / T-04-03 / T-04-04 / T-04-05 | ci-gate | `pnpm dlx js-yaml` parses `ci.yml`; contains `security-check.sh --ci`, `--frozen-lockfile`; zero comment lines | ✅ node | ⬜ pending |
| 01-04-03 | 04 | 3 | INFRA-09, PERF-01 | INFRA-09 / PERF-01 | T-04-01 / T-04-06 | ci-gate | `pnpm dlx js-yaml` parses `lighthouse.yml`; carries `x-vercel-protection-bypass`; no `pull_request_target`; zero comment lines | ✅ node | ⬜ pending |
| 01-05-03 | 05 | 4 | INFRA-08, INFRA-10 | INFRA-08, INFRA-10 | T-05-01 / T-05-03 | api-assert | `HEAD == main`, `gh repo view` visibility `PUBLIC`, zero build artefacts in `git ls-files`, `ci.yml` readable via the contents API | ✅ git + gh | ⬜ pending |
| 01-07-01a | 07 | 6 | INFRA-08 | INFRA-08 | T-07-03 | ci-gate | `gh pr checks --json name,state --jq` reports the `verify` check `FAILURE` for each of the three deliberate failures; merge blocked | ✅ gh | ⬜ pending |
| 01-07-01b | 07 | 6 | INFRA-07, INFRA-09, PERF-01, PERF-02, PERF-03 | INFRA-07, INFRA-09 / PERF-01, PERF-02, PERF-03 | T-07-02 / T-07-04 | ci-gate | `gh pr checks <n> --required` all green; no `check_runs[] \| select(.conclusion != "success")`; no `style="` in `src/` | ✅ gh | ⬜ pending |
| 01-07-02 | 07 | 6 | INFRA-08, INFRA-10 | INFRA-08, INFRA-10 | T-07-01 / T-07-05 | api-assert | `gh api …/branches/main/protection` — `strict==true`, force-push/deletions false, linear history true | ✅ gh | ⬜ pending |
| 01-07-03 | 07 | 6 | INFRA-07 | INFRA-07 | T-07-06 | api-assert | PR state `MERGED` and the Production deployment SHA equals `git rev-parse origin/main` | ✅ gh | ⬜ pending |
| 01-08-01 | 08 | 7 | SEC-07, INFRA-10 | SEC-07 | T-08-01 / T-08-03 / T-08-05 | doc-assert | `phase-01.md` exists, zero `High` + `Open`/`Aberto` finding rows, D-12 header row present, the verbatim PERF-02 INP-deferral sentence present, no `re_[A-Za-z0-9]{20,}` match | ✅ grep | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### Verbatim automated commands

Transcribed from each task's `<verify><automated>` block. These are the exact strings executed; the table above is the index.

```
01-01-01  node -e "const p=require('./package.json');const d={...p.dependencies,...p.devDependencies};const need=['astro','@astrojs/vercel','@vercel/analytics','@astrojs/check','typescript','@biomejs/biome','prettier','prettier-plugin-astro','@lhci/cli','@fontsource-variable/outfit','@fontsource/dm-sans'];const bad=Object.keys(d).filter(k=>/^(react|react-dom|preact|vue|svelte|@angular\/|solid-js|framer-motion|motion|gsap|aos|lenis|locomotive-scroll|nprogress|@bprogress\/)/.test(k));if(bad.length||need.some(k=>!d[k]))process.exit(1)"

01-01-02  node --input-type=module -e "const m=await import('./astro.config.mjs');const c=m.default;if(c.output!=='static')process.exit(1);if(c.build.inlineStylesheets!=='never')process.exit(1);if(c.fonts.length!==2)process.exit(1);if(!c.env.schema.RESEND_API_KEY)process.exit(1)"

01-01-03  node -e "const fs=require('fs');JSON.parse(fs.readFileSync('biome.json','utf8'));JSON.parse(fs.readFileSync('.prettierrc','utf8'));if(fs.readFileSync('vercel.json','utf8').replace(/\s/g,'')!=='{}')process.exit(1);const p=require('./package.json');if(!p.packageManager||!p.engines?.node||!/astro sync/.test(p.scripts.check))process.exit(1);const gi=fs.readFileSync('.gitignore','utf8');for(const e of ['node_modules/','dist/','.vercel/','.astro/','.lighthouseci/'])if(!gi.split(/\r?\n/).includes(e))process.exit(1)"

01-02-01  node -e "const fs=require('fs');const t=fs.readFileSync('src/styles/tokens.css','utf8');const b=fs.readFileSync('src/styles/base.css','utf8');if(t.includes('/*')||b.includes('/*'))process.exit(1);if((t.match(/\{/g)||[]).length!==1)process.exit(1);if(/--font-display\s*:/.test(t)||/--font-body\s*:/.test(t))process.exit(1);if(!t.includes('--font-heading: var(--font-display)'))process.exit(1);for(const k of ['--color-bg','--color-accent','--color-text-strong','--space-gutter','--radius-lg','--focus-ring','--ease-out'])if(!t.includes(k+':'))process.exit(1)"

01-02-02  pnpm run check

01-02-03  pnpm build && test -f "${STATIC_DIR:-.vercel/output/static}/index.html" && ! grep -rIqE 'fonts\.(googleapis|gstatic)\.com|RESEND_API_KEY|re_[A-Za-z0-9]{20,}' "${STATIC_DIR:-.vercel/output/static}" && test "$(grep -c '<style' "${STATIC_DIR:-.vercel/output/static}/index.html")" -eq 0 && test "$(grep -oE '<link[^>]*rel="preload"[^>]*>' "${STATIC_DIR:-.vercel/output/static}/index.html" | grep -c 'as="font"')" -eq 2

01-03-01  bash -n scripts/js-weight-check.sh && bash scripts/js-weight-check.sh "${STATIC_DIR:-.vercel/output/static}"

01-03-02  bash -n scripts/security-check.sh && bash scripts/security-check.sh --ci

01-03-03  test -f .planning/security/SECURITY-CHECKLIST.md && grep -qF 'Nenhuma fase fecha com achado High em aberto.' .planning/security/SECURITY-CHECKLIST.md && test "$(grep -cE '^[0-9]+\.' .planning/security/SECURITY-CHECKLIST.md)" -eq 7 && grep -qF '| ID | Description | Severity | Status | Action | Target date | Owner |' .planning/security/SECURITY-CHECKLIST.md

01-04-01  node -e "const c=JSON.parse(require('fs').readFileSync('lighthouserc.json','utf8')).ci;const a=c.assert.assertions;if(c.collect.settings.preset)process.exit(1);for(const k of ['categories:performance','categories:seo','categories:best-practices','categories:accessibility'])if(a[k][1].minScore!==0.95)process.exit(1);if(a['total-blocking-time'][1].maxNumericValue!==200)process.exit(1)" && grep -qF 'INP is not lab-assertable in Lighthouse' .planning/phases/01-foundation-ci-gate/01-04-SUMMARY.md

01-04-02  pnpm dlx js-yaml .github/workflows/ci.yml > /dev/null && grep -q 'scripts/security-check.sh --ci' .github/workflows/ci.yml && grep -q 'pnpm install --frozen-lockfile' .github/workflows/ci.yml && test "$(grep -cE '^\s*#' .github/workflows/ci.yml)" -eq 0

01-04-03  pnpm dlx js-yaml .github/workflows/lighthouse.yml > /dev/null && grep -q 'x-vercel-protection-bypass' .github/workflows/lighthouse.yml && ! grep -q 'pull_request_target' .github/workflows/lighthouse.yml && test "$(grep -cE '^\s*#' .github/workflows/lighthouse.yml)" -eq 0

01-05-03  test "$(git rev-parse --abbrev-ref HEAD)" = "main" && test "$(gh repo view --json visibility --jq .visibility)" = "PUBLIC" && test "$(git ls-files | grep -cE '^(node_modules|dist|\.vercel|\.astro|\.lighthouseci)/')" -eq 0 && gh api "repos/{owner}/{repo}/contents/.github/workflows/ci.yml" --jq .name

01-07-01a gh pr checks "$PR_NUMBER" --json name,state --jq '.[] | select(.name | test("verify")) | .state' | grep -qE 'FAILURE|ERROR'

01-07-01b gh pr checks "$PR_NUMBER" --required && ! grep -rn 'style="' src/ && test -z "$(gh api "repos/{owner}/{repo}/commits/$(git rev-parse HEAD)/check-runs" --jq '.check_runs[] | select(.conclusion != "success") | .name')"

01-07-02  gh api repos/{owner}/{repo}/branches/main/protection --jq 'if .required_status_checks.strict == true and .allow_force_pushes.enabled == false and .allow_deletions.enabled == false and .required_linear_history.enabled == true then "ok" else halt_error(1) end'

01-07-03  test "$(gh pr view "$PR_NUMBER" --json state --jq .state)" = "MERGED" && test "$(gh api "repos/{owner}/{repo}/deployments?environment=Production" --jq '.[0].sha')" = "$(git rev-parse origin/main)"

01-08-01  test -f .planning/security/runs/phase-01.md && test "$(grep -E '^\| P01-[0-9]{3} \|' .planning/security/runs/phase-01.md | grep -icE '\| *High *\| *(Open|Aberto) *\|')" -eq 0 && grep -qF '| ID | Description | Severity | Status | Action | Target date | Owner |' .planning/security/runs/phase-01.md && grep -qF 'INP is not lab-assertable in Lighthouse' .planning/security/runs/phase-01.md && ! grep -qE 're_[A-Za-z0-9]{20,}' .planning/security/runs/phase-01.md
```

---

## Wave 0 Requirements

Transcribed from `01-RESEARCH.md` § "Wave 0 Gaps" (L810-L819). Phase 1 is greenfield: the "test harness" and the deliverable are the same artifacts, so Wave 0 is the artifact-creation list rather than a test-scaffold list. No task's `<verify><automated>` is `MISSING`.

- [ ] `astro.config.mjs`, `package.json` (scripts, `engines`, `packageManager`), `tsconfig.json`, `biome.json`, `.prettierrc`, expanded `.gitignore` — plan 01-01
- [ ] `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/styles/tokens.css` — plan 01-02
- [ ] `vercel.json` (`{}`) — plan 01-01
- [ ] `lighthouserc.json` — plan 01-04
- [ ] `scripts/js-weight-check.sh`, `scripts/security-check.sh` (both `chmod +x`, comment-free per D-04) — plan 01-03
- [ ] `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml` — plan 01-04
- [ ] `.planning/security/SECURITY-CHECKLIST.md` (plan 01-03), `.planning/security/runs/phase-01.md` (plan 01-08)
- [ ] Determine `STATIC_DIR` (Open Question 1) and thread it through both scripts + workflows — plan 01-02 Task 3
- [ ] One throwaway PR to capture exact required-status-check context names (Open Question 4) — plan 01-07 Task 1b
- [ ] Framework install: none (no test framework needed)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Approval of repository creation, PUBLIC visibility, `master`→`main` rename and the first push (01-05 Task 1, `checkpoint:decision`) | INFRA-08, INFRA-10 | Irreversible and world-readable the moment it happens; D-03 requires Felipe's explicit word before each irreversible action | Present the three options with the recommended default (`approve-high`, repo name `dmarques`). Felipe replies with repository name, "approved", and `high` or `moderate`. Record verbatim in `01-05-SUMMARY.md`; run nothing irreversible before the reply |
| Granting the `gh` token the `workflow` scope (01-05 Task 2, `checkpoint:human-action`) | INFRA-08 | Browser OAuth consent on Felipe's own GitHub account; no CLI/API path exists for Claude | Show `gh auth status` proving `workflow` is absent → Felipe runs `gh auth refresh -s workflow -h github.com` and completes browser consent → re-run `gh auth status 2>&1 \| grep -q "workflow"` (exits 0) before Task 3 |
| Spend-cap mechanism decision: Hobby structural cap vs Vercel Pro Spend Management (01-06 Task 1, `checkpoint:decision`) | INFRA-10 | A billing commitment and a re-statement of an accepted residual risk (SEC-08); only Felipe can decide | Present the three options with the Assumption A1 evidence that Spend Management is Pro-only. Felipe replies `hobby-structural` / `upgrade-pro` / `hobby-now-pro-at-launch` plus the amount. Then edit only the spend-cap bullet inside `## Residual Risk Statement (SEC-08)` in `.planning/ROADMAP.md` |
| Vercel project link and hardening — 2FA, Astro preset, production branch `main`, no domain attached, Deployment Protection, Protection Bypass secret, env-var scoping, spend cap (01-06 Task 2, `checkpoint:human-action`) | INFRA-07, INFRA-10 | Vercel dashboard only, under Felipe's login; none of it is reconstructible from git and Claude has no Vercel credentials | Walk the ten-item checklist one item at a time; Felipe reports each outcome. Item 7 is his own `gh secret set VERCEL_AUTOMATION_BYPASS_SECRET` prompt — the value never enters the chat. Partial automated confirmation afterwards: `gh secret list \| grep -q VERCEL_AUTOMATION_BYPASS_SECRET` and `gh api "repos/{owner}/{repo}/deployments" --jq '.[0].environment'` |
| Preview protection + bypass behaviour, fonts same-origin, zero cookies, no fallback-font layout shift (01-06 Task 3, `checkpoint:human-verify`) | INFRA-07, INFRA-10, PERF-04 | Needs a real browser with DevTools (Network font filter, Application → Cookies) and a secret held outside the repository | Claude runs curl steps 1-3 from the environment: unauthenticated `curl -sI "$PREVIEW_URL"` → 401/SSO redirect; with `x-vercel-protection-bypass` → 200 and `grep -c '<h1'` → `1` plus the pt-BR tagline. Felipe runs the DevTools steps 4-6. Capture the step-2 header block as the Phase 1 baseline |
| Capturing the exact required-status-check context strings from a live PR (01-07 Task 1b, Phase C) | INFRA-08 | The strings do not exist until a real PR has run; they are not derivable from `ci.yml`/`lighthouse.yml` job ids (Open Question 4) | On the green PR run `gh pr checks <n>`, `gh api "repos/{owner}/{repo}/commits/<sha>/status" --jq '.statuses[].context'` and `gh api "repos/{owner}/{repo}/commits/<sha>/check-runs" --jq '.check_runs[].name'`. Copy the strings verbatim into `01-07-SUMMARY.md`; Task 2 writes them into the branch-protection payload unedited |
| Phase 1 security sign-off (01-08 Task 2, `checkpoint:human-verify`) | SEC-07, INFRA-10 | Human judgement on whether the judgement-item answers are honest rather than rubber-stamped, and on the five ROADMAP success criteria | Felipe reads `.planning/security/runs/phase-01.md` end to end, confirms every findings row has severity/owner/target date and none is High + Open, cross-checks the five ROADMAP criteria against the cited evidence, then replies "aprovado". Sign-off line appended: `tail -5 .planning/security/runs/phase-01.md \| grep -qi 'Felipe Salles'` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (none — no task's `<automated>` is `MISSING`)
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter
- [ ] `wave_0_complete` — remains `false` until plans 01-01 … 01-04 land the harness artifacts

**Approval:** approved 2026-09-08
