---
phase: 01-foundation-ci-gate
plan: 08
subsystem: security
tags: [sec-07, security-review, run-file, findings-table, lighthouse-ci, perf-02-inp-deferral, out-of-git-state, spend-cap]

requires:
  - phase: "01-04"
    provides: "PERF-02 INP-deferral sentence (verbatim); lighthouserc.json assertions; ci.yml / lighthouse.yml gate"
  - phase: "01-06"
    provides: "Vercel project + Deployment Protection + bypass secret + spend-cap decision + baseline response headers"
  - phase: "01-07"
    provides: "branch-protection readback; CI lhci green numbers (Perf 1.00 / A11y 1.00 / BP 0.96, LCP 1543 / CLS 0 / TBT 0); admin-bypass finding; SEO warn decision"
  - phase: "01-03"
    provides: "SECURITY-CHECKLIST.md gabarito (7 mechanical items + D-12 schema + hard rule); scripts/security-check.sh"
provides:
  - ".planning/security/runs/phase-01.md — dated SEC-07 Phase 1 run: verbatim security-check.sh --ci stdout (6 PASS / 1 FAIL / 0 SKIP), all 7 gabarito items answered by number, judgement items, out-of-git config record, D-12 findings table (7 rows, none High), closing hard-rule line"
  - "The run-file format every later phase (.planning/security/runs/phase-NN.md) follows"
  - "7 recorded findings P01-001..P01-007 (2 Med accepted, 5 Low); deferred field-INP finding = P01-003"
affects: [phase-1-closure-pending-signoff, every-later-phase-security-review]

tech-stack:
  added: []
  patterns:
    - "SEC-07 run file: verbatim --ci stdout in a fenced block + numbered answers to each gabarito item + judgement answers + out-of-git state record + D-12 findings table; gabarito (SECURITY-CHECKLIST.md) never modified by a run"
    - "A mechanical check that fails only for a non-representative host reason (antivirus script injection + Windows chrome-launcher EPERM) is recorded honestly as a documented deviation, with the authoritative CI lhci green result cited alongside — the local exit-1 does not block phase closure"

key-files:
  created:
    - ".planning/security/runs/phase-01.md"
  modified:
    - ".planning/STATE.md"
    - ".planning/ROADMAP.md"

key-decisions:
  - "Local security-check.sh --ci exits 1 (6 PASS / 1 FAIL / 0 SKIP) on this machine: check 7 (Lighthouse) aborts on Run #2 with Windows chrome-launcher EPERM tempdir-cleanup + taskkill noise, and the host antivirus injects ~160 KB of script inflating resource-summary:script:size. Recorded as finding P01-006. The authoritative Lighthouse gate is the CI lhci job (green: Perf 1.00 / A11y 1.00 / BP 0.96, LCP 1543 ms / CLS 0 / TBT 0 ms). scripts/security-check.sh NOT modified (its check-7 header injection was already fixed by the orchestrator in 41f29a8)."
  - "7 findings recorded (D-12 schema), none High: P01-001/P01-002 (Med, Aceito) the two unfixable dev/CI-only extract-zip advisories GHSA-jmr9-qjv8-65gv / GHSA-7pqw-9j4j-h8q3; P01-003 (Low, Aberto) deferred field-INP monitoring via Vercel Analytics; P01-004 (Low, Aceito) SEO 0.45 warn-not-error on the protected preview, Phase 6 restores error; P01-005 (Low, Aceito) hobby-structural spend cap weaker than SEC-08's original wording; P01-006 (Low, Aberto) security-check.sh check 7 host-AV unreliability; P01-007 (Low, Aberto) provisional low-opacity text tokens for A11Y-06 in Phase 3."
  - "PERF-02 INP-deferral sentence copied verbatim into the run file on its own line; the ROADMAP success-criterion-3 INP clause is recorded as consciously deferred to field monitoring, never reported met on the TBT number (finding P01-003)."
  - "Task 2 (Phase 1 security sign-off, checkpoint:human-verify gate=blocking) is PENDING — no sign-off line appended to the run file; the orchestrator appends it after Felipe types 'aprovado'. Phase 1 is NOT closed by this plan."

patterns-established:
  - "Pattern 1: the phase security run file transcribes all dashboard-only state (Vercel project, Deployment Protection, bypass-secret NAME only, env-var scoping, spend-cap posture, 2FA, branch-protection readback) as the record of truth"
  - "Pattern 2: findings carry ID / description / severity / status / action / realistic target date / owner Felipe Salles; no phase closes with a High + Open row"

requirements-completed: []

duration: 50min
completed: 2026-09-10
---

# Phase 1 Plan 08: SEC-07 Phase-01 Run File Summary

**The dated SEC-07 Phase 1 security review now exists at `.planning/security/runs/phase-01.md`: the verbatim `security-check.sh --ci` stdout (6 PASS / 1 FAIL / 0 SKIP, exit 1 — check 7 fails only for host antivirus + Windows chrome-launcher reasons while the authoritative CI `lhci` gate is green at Perf 1.00 / A11y 1.00 / BP 0.96, LCP 1543 ms / CLS 0 / TBT 0 ms), every one of the seven gabarito items answered by number with evidence, the PERF-02 INP-deferral sentence recorded verbatim on its own line, the judgement items answered, the out-of-git Vercel/GitHub configuration recorded, and a D-12 findings table of seven rows (two Med accepted, five Low) with no High + Open row. Task 2 (Felipe's sign-off) is pending; Phase 1 is not yet closed.**

## Task 1 — the run file

`bash scripts/security-check.sh --ci` was run at `main` HEAD `41f29a8` after `pnpm install --frozen-lockfile` + `pnpm build` (static output, 0 Functions), against `PREVIEW_URL=https://dmarques-ilhz2ktfk-felipe-salles-projects.vercel.app` with the bypass secret exported from the environment (never written to any file).

Result: **6 PASS / 1 FAIL / 0 SKIP, exit 1.**

- Checks 1-6 PASS: `pnpm audit --audit-level=high` clean; no `style=` in `src/`; only Fonts API `@font-face` inline in built HTML (`<style> inline: 2`, `@font-face: 16`, `<script> inline sem src: 1` — the `@vercel/analytics` bootstrap); no secret names / `re_` keys in `.vercel/output`; Function count 0 (`<= 1` correct); baseline preview headers recorded.
- Check 7 FAIL — **local, non-representative**: Run #1 completed, Run #2 aborted with `Runtime error encountered: EPERM, Permission denied: ...\Temp\lighthouse.64181773` (chrome-launcher tempdir cleanup) plus `taskkill stderr ERRO: o processo "44324" nao foi encontrado`. Same host-AV / Windows-tooling issue the orchestrator hit. When the machine completes 3 runs the antivirus injects ~160 KB of script, blowing `resource-summary:script:size`. `scripts/security-check.sh` was NOT modified.
- Authoritative Lighthouse gate = CI `lhci` job, runs `34495905588` (`ce808d8`) and `34496962391` (`885bd46`), both green with only the SEO warning: Performance 1.00, Accessibility 1.00, Best Practices 0.96, SEO 0.45 (warn), LCP 1543 ms, CLS 0, TBT 0 ms; `resource-summary:script:size` passed in CI; `js-weight-check.sh` reports 0 B first-party JS.

The run file contains: dated header (phase, run date 2026-09-10, reviewed commit `41f29a827f5d0baf67079935d8601f60be34ded1`, preview URL); the full verbatim `--ci` stdout in a fenced block (no secret values — asserted no `re_[A-Za-z0-9]{20,}` match and the 32-char bypass value is absent); all seven gabarito items answered by number (item 3 = baseline headers + "assertions from Phase 7"; item 5 = Function count 0, `<= 1` correct; item 6 = the four Lighthouse category scores + LCP/CLS/TBT from CI + the verbatim PERF-02 sentence on its own line); the judgement items (every Phase 1 dependency justified one-line from the Standard Stack; the one documented exception — `lighthouse.yml` rewrite + `security-check.sh` check-7 header fix as CI-correctness fixes, not Phase 5/6/7 scope pull-forward); the "Estado de configuração fora do git" section; the D-12 findings table; the closing hard-rule line.

## Findings opened (D-12 schema, none High)

| ID | Severity | Status | Target date | Summary |
|----|----------|--------|-------------|---------|
| P01-001 | Med | Aceito | 2026-11-30 | `GHSA-jmr9-qjv8-65gv` — `extract-zip` <=2.0.1, dev/CI-only via `@lhci/cli` > `@puppeteer/browsers`; no published fix; allowlisted in `pnpm-workspace.yaml`. Revisit when `extract-zip >=2.0.2` / fixed `@puppeteer/browsers` publishes (end of Milestone 1). |
| P01-002 | Med | Aceito | 2026-11-30 | `GHSA-7pqw-9j4j-h8q3` — same `extract-zip` path, same no-fix, same allowlist. |
| P01-003 | Low | Aberto | 2026-12-31 | **Deferred field-INP monitoring (PERF-02).** No lab INP audit in Lighthouse; TBT `<=200 ms` is the proxy (CI median 0 ms). ROADMAP criterion-3 INP clause deferred to field. Action: verify field INP `<200 ms` via Vercel Analytics post-launch. |
| P01-004 | Low | Aceito | 2026-11-30 | SEO 0.45 on the protected preview (`X-Robots-Tag: noindex` fails `is-crawlable`; no meta description / `robots.txt` yet). `lighthouserc.json` `categories:seo` is `warn` in Phase 1; Phase 6 restores `error` against the indexable production domain. |
| P01-005 | Low | Aceito | 2027-01-31 | `hobby-structural` spend cap is weaker than SEC-08's original wording (no configurable USD cap, no tunable auto-pause, no "form off / site up"). SEC-08 bullet in ROADMAP already corrected. Revisit at Milestone 2 / before domain cutover. |
| P01-006 | Low | Aberto | 2026-12-15 | `security-check.sh --ci` check 7 unreliable on the dev host (antivirus script injection + Windows chrome-launcher `EPERM`). Action: make check 7 CI-only or document the host-AV caveat; target Phase 7. |
| P01-007 | Low | Aberto | 2026-10-15 | Provisional low-opacity (translucent-white) text tokens flagged for A11Y-06 in Phase 3. Action: verify WCAG AA contrast when the tokens are finalized in Phase 3, with design sign-off. |

No row is `High`. No row is `High` + `Aberto`. Owner on every row: `Felipe Salles`.

## Deviations from Plan

- **Task 1 check 7 exits non-zero locally (documented, not a plan deviation in substance).** The plan's acceptance criterion "`bash scripts/security-check.sh --ci` exits 0" and "`grep -c '^SKIP:'` outputs 0" — the SKIP criterion holds (0 SKIPs; checks 6 and 7 both ran), but the exit-0 criterion does not on this machine. This is expected per the executor briefing: host antivirus (Kaspersky) + Windows `chrome-launcher`/`taskkill` tooling breaks Run #2 of the local Lighthouse. The run file records both the local FAIL (with the AV-injection + SEO-noindex explanation) and the authoritative CI `lhci` green result. `scripts/security-check.sh` was NOT modified (its check-7 header injection was already fixed by the orchestrator in commit `41f29a8`; the residual local failure is host pollution, not a script bug). Recorded as finding P01-006.

## Task 2 — PENDING

Task 2 (`checkpoint:human-verify`, `gate="blocking"`) — Phase 1 security sign-off — has **not** been executed. No sign-off line was appended to the run file. The orchestrator walks Felipe through the run file section by section and through the five ROADMAP Phase 1 success criteria (stating the INP deferral out loud), then appends a sign-off line with his name and the date once he types "aprovado". `gsd-sdk query phase.complete` was NOT run — Phase 1 closes only after that sign-off.

## Conventions Felipe asked to change before Phase 2

None recorded — Task 2 (where such requests would surface) is pending.

## Self-Check: PASSED

- `.planning/security/runs/phase-01.md` — FOUND
- `grep -c 'PASS:'` = 13 (>= 7)
- `grep -qF '| ID | Description | Severity | Status | Action | Target date | Owner |'` — OK
- `grep -cE '^\| P01-[0-9]{3} \|'` = 7 (>= 1)
- High + Open rows = 0
- `grep -qF 'INP is not lab-assertable in Lighthouse'` — OK
- `grep -qF 'field INP <200 ms is monitored via Vercel Analytics post-launch (PERF-02 compensating control).'` — OK
- `grep -qi 'Felipe Salles'` — OK
- `grep -qE 'Deployment Protection'` — OK
- `grep -qE 'spend|Spend'` — OK
- `grep -qE 're_[A-Za-z0-9]{20,}'` — no match (no secret value recorded); bypass literal absent
- `git diff --quiet .planning/security/SECURITY-CHECKLIST.md` — clean (gabarito untouched)
- `pnpm run check` — 0 errors

---
*Phase: 01-foundation-ci-gate*
*Completed: 2026-09-10 (Task 1 only; Task 2 sign-off pending)*
