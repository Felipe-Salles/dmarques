---
phase: 01-foundation-ci-gate
plan: 03
subsystem: ci-gate
tags: [bash, ci-gate, perf-budget, sec-07, security-check, js-weight, gitattributes]

requires:
  - "01-01: package.json dependency set + astro.config.mjs (RESEND_API_KEY env schema, output static, vercel adapter)"
  - "01-02: STATIC_DIR = .vercel/output/static; Astro Fonts API injects inline <style> @font-face blocks; analytics ships one inline <script type=module>"
provides:
  - "scripts/js-weight-check.sh — deterministic gzipped landing-route JS budget (BUDGET_BYTES=20480) + UI/animation dependency denylist"
  - "scripts/security-check.sh — seven mechanical SEC-07 checks, --ci flag, PASS/FAIL/SKIP lines, exit 0 iff no FAIL"
  - ".planning/security/SECURITY-CHECKLIST.md — versioned SEC-07 gabarito: hard rule + 7 items mapped to script checks + D-12 findings table schema"
  - ".gitattributes — *.sh pinned eol=lf so the gate runs identically on Windows and CI ubuntu"
  - "Invocation contract for plan 04: bash scripts/js-weight-check.sh \"$STATIC_DIR\"  and  bash scripts/security-check.sh --ci"
affects: [ci-workflows-plan, phase-1-security-run, every-later-phase-security-review, every-later-phase-perf-gate]

tech-stack:
  added: []
  patterns:
    - "Both gate scripts are bash, comment-free apart from the shebang (D-04), and run identically by a human and by CI (D-11)"
    - "js-weight-check.sh: explicit dir arg is strict (missing index.html -> exit 1); bare invocation resolves ${STATIC_DIR:-.vercel/output/static} then falls back to .vercel/output/static / dist"
    - "security-check.sh: set -uo pipefail (never -e) so every check runs and results aggregate into a failure counter"
    - "Inline-surface check (check 3) permits Fonts API @font-face blocks and only reports their count; it FAILs solely on page/token/bundle CSS appearing inline (per 01-02 deviation 2 + upstream note)"
    - "Secret scan uses the tight re_[A-Za-z0-9]{20,} regex (Pitfall 4) + literal env-var names, over STATIC_DIR and .vercel/output; only filenames are ever printed, never match content"
    - "Function count asserts <= 1 with `-gt 1` (never `== 1`) so Phase 1's correct count of 0 passes (Pitfall 1)"

key-files:
  created:
    - "scripts/js-weight-check.sh"
    - "scripts/security-check.sh"
    - ".planning/security/SECURITY-CHECKLIST.md"
    - ".gitattributes"
    - ".planning/phases/01-foundation-ci-gate/deferred-items.md"
  modified: []

key-decisions:
  - "js-weight-check.sh: an explicitly-passed output dir is honoured strictly (exit 1 if it lacks index.html); the .vercel/output/static -> dist fallback applies only to the default/env-resolved path. This reconciles the plan's two acceptance criteria (explicit \"$STATIC_DIR\" must pass; explicit /nonexistent-dir must fail) which the plan's single generic fallback wording could not satisfy together while .vercel/output/static exists."
  - "security-check.sh check 3 implemented per the upstream note / 01-02 deviation 2, NOT the plan's literal 'FAIL if any inline <style> block is present'. The mandated Astro Fonts API always injects inline @font-face <style> blocks, so the literal wording would make the script exit non-zero on a correct Phase 1 build and contradict the plan's own success criterion. Check 3 strips @font-face{...} and :root{--font-*} blocks and all tags, and FAILs only if page/token/bundle CSS remains."
  - "Added .gitattributes (one file beyond the plan's files_modified). core.autocrlf=true on this Windows checkout would deliver CRLF scripts/*.sh on a fresh clone, breaking `#!/usr/bin/env bash` locally while CI (Linux) stayed LF -> the gate would drift. `*.sh text eol=lf` prevents this and directly serves the must_haves truth 'the same script is used by a human locally and by CI, so the gate cannot drift'."
  - "pnpm audit --audit-level=high currently returns 4 pre-existing HIGH advisories from the 01-01 dependency tree (transitive). security-check.sh check 1 correctly FAILs on them; the script is faithful to spec. Not fixed here: pre-existing (SCOPE BOUNDARY), needs dependency-tree edits (Rule 4), and unfixable anyway while `extract-zip` has no patched release. Logged to deferred-items.md and STATE.md blockers for Felipe to triage in the phase-01 security run (SEC-07 'no open High' rule)."

requirements-completed: [PERF-03, INFRA-06]

duration: 25min
completed: 2026-09-08
---

# Phase 1 Plan 03: Gate Scripts & SEC-07 Gabarito Summary

**Two comment-free bash gates — a deterministic gzipped landing-route JS budget with a UI/animation dependency denylist, and the shared seven-check mechanical SEC-07 script (one script for humans and CI) — plus the versioned SEC-07 gabarito they answer to, with `.sh` line endings pinned to LF so the gate cannot drift between Windows and CI.**

## Invocation contract (for plan 04)

```
bash scripts/js-weight-check.sh "$STATIC_DIR"
```
- `$1` (optional): output dir. If given, it is used strictly — missing `index.html` -> exit 1.
- If `$1` omitted: resolves `${STATIC_DIR:-.vercel/output/static}`, then falls back to `.vercel/output/static` / `dist`.
- Reads `STATIC_DIR` from the environment when `$1` is absent.
- Exit 0 = under 20480 B gzip AND no denylisted dependency. Non-zero otherwise.
- CI may call it with or without the arg; RESEARCH Pattern 3 `ci.yml` uses no arg, the plan interface uses `"$STATIC_DIR"` — both work.

```
bash scripts/security-check.sh --ci
```
- `--ci`: non-interactive, machine-parseable (prints `modo: ci`). Without it, same checks, human header.
- Reads from the environment (all optional): `STATIC_DIR` (default `.vercel/output/static`), `PREVIEW_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET`.
- Checks 6 (`curl -I` headers) and 7 (Lighthouse) `SKIP` with a printed reason when `PREVIEW_URL` is unset.
- Emits one `PASS:` / `FAIL:` / `SKIP:` line per check (7 total) + a `== resumo: N PASS / N FAIL / N SKIP ==` line.
- Exit 0 iff zero `FAIL` (SKIPs allowed).
- Never prints a secret value; check 4 prints matching filenames only.

## Performance

- **Duration:** ~25 min
- **Tasks:** 3
- **Files:** 5 created (2 scripts, 1 gabarito, `.gitattributes`, `deferred-items.md`), 0 modified
- **Commits:** 4 task/support commits + this metadata commit

## Accomplishments

- **`scripts/js-weight-check.sh`** - `#!/usr/bin/env bash` + `set -euo pipefail`; `BUDGET_BYTES=20480`. Extracts every `<script src>` path ending in `.js` and every `<link rel="modulepreload" href>` path from `$OUT_DIR/index.html`, resolves each against `$OUT_DIR`, skips paths absent on disk, gzips each and sums the bytes, prints one line per file plus the total-vs-budget line, exits non-zero over budget. Then a single `node -e` denylist over merged `dependencies` + `devDependencies` keys against `^(react|react-dom|preact|vue|svelte|@angular\/|solid-js|framer-motion|motion|gsap|aos|lenis|locomotive-scroll|nprogress|@bprogress\/)` - exits non-zero listing any match. The deliberately-broken `grep -Eqidrecursive` placeholder and the unused `DENY=` var from RESEARCH Pattern 5 are omitted. Empty-array-safe (`${ARR[@]+"${ARR[@]}"}`, `|| true` on extraction pipes). Comment-free apart from the shebang. `chmod +x`.
- **`scripts/security-check.sh`** — `#!/usr/bin/env bash` + `set -uo pipefail` (no `-e`). Accepts `--ci`. Reads `STATIC_DIR` / `PREVIEW_URL` / `VERCEL_AUTOMATION_BYPASS_SECRET` via `${VAR:-}` (safe under `set -u`). Seven checks, each `pass`/`fail`/`skip` helper bumping its counter:
  1. `pnpm audit --audit-level=high` — non-zero -> FAIL, prints the severity-summary lines only.
  2. `grep -rn 'style="' src/` — any hit -> FAIL; `SKIP` if `src/` absent.
  3. inline-surface: counts `<style` opens, `@font-face` blocks and inline `<script>` without `src` across `"$STATIC_DIR"/**/*.html`, reports them, and FAILs only if a `<style>` block still holds non-`@font-face`, non-`:root{--font-*}` content after tag/whitespace stripping.
  4. secret scan: `grep -rIlE 'RESEND_API_KEY|re_[A-Za-z0-9]{20,}'` over `$STATIC_DIR` + `.vercel/output`, `sort -u`, prints filenames only -> FAIL on any hit.
  5. `find .vercel/output/functions -maxdepth 1 -name '*.func' | wc -l` -> FAIL only when `-gt 1`.
  6. `curl -sI -H "x-vercel-protection-bypass: …" "$PREVIEW_URL"` — prints indented headers, always PASS in Phase 1; `SKIP` (with reason) when `PREVIEW_URL` unset; bypass secret never echoed.
  7. `pnpm exec lhci autorun --collect.url=… --config=./lighthouserc.json` when `PREVIEW_URL` set — non-zero -> FAIL; else `SKIP`.
  Ends with the resumo line; `exit 0` iff `fail_count == 0`. Comment-free apart from the shebang. `chmod +x`.
- **`.planning/security/SECURITY-CHECKLIST.md`** — pt-BR gabarito. Opens (line 3, inside a blockquote) with **`Nenhuma fase fecha com achado High em aberto.`** Exactly seven numbered mechanical items, each naming its `scripts/security-check.sh` check number and tagged Mecânico / Julgamento; no Phase 5 / Phase 7 items pulled forward. "Itens de julgamento" section (dependency justification + third-party asset hygiene + secret hygiene + open-High gate). D-12 findings table with the exact header `| ID | Description | Severity | Status | Action | Target date | Owner |`, ID convention `P<NN>-NNN`, severity `Low`/`Med`/`High`, default owner `Felipe Salles`. "Como executar" points at `bash scripts/security-check.sh --ci` and `.planning/security/runs/phase-NN.md`. The run file is intentionally NOT created here (plan 08 owns it).
- **`.gitattributes`** — `* text=auto eol=lf`, `*.sh text eol=lf`, `woff2`/image types `binary`. Ran `git add --renormalize .`; `git ls-files --eol` confirms `scripts/*.sh` are `i/lf w/lf attr/text eol=lf`.

## Verification evidence

| Check | Result |
|-------|--------|
| `bash -n` both scripts | pass |
| `test -x` both scripts | pass |
| comment-free (`grep -vE '^#!' \| grep -cE '^\s*#'`) | `0` / `0` |
| `grep -q 'BUDGET_BYTES=20480'` | pass |
| broken `grep -Eqidrecursive` placeholder removed | absent (rc 1) |
| `js-weight-check.sh ".vercel/output/static"` | exit 0, prints `PASS`, gzip total `0 B` < 20480 |
| `js-weight-check.sh /nonexistent-dir` | exit 1, clear message |
| `js-weight-check.sh` with temp `"gsap"` devDep | exit 1, prints `gsap`; reverted -> exit 0 |
| `security-check.sh` grep asserts (`audit-level=high`, `re_[A-Za-z0-9]{20,}`, `-gt 1`, no `(-eq 1\|== 1).*func`) | all pass |
| `security-check.sh --ci` prefixed-line count | `7` (checks 2/3/4/5 PASS, 6/7 SKIP, 1 FAIL) |
| `security-check.sh --ci` contains `SKIP:` | yes (2) |
| `security-check.sh --ci` echoes a `re_[A-Za-z0-9]{20,}` string | no (rc 1) |
| planted `RESEND_API_KEY` file under `$STATIC_DIR` | check 4 -> FAIL + exit 1; removed -> check 4 PASS |
| gabarito: hard rule present + in `head -20` | yes |
| gabarito: `grep -cE '^[0-9]+\.'` | `7` |
| gabarito: exact findings-table header present | yes |
| gabarito: `grep -c 'security-check.sh'` | `10` (>= 7) |
| gabarito: `grep -qE 'CSP\|securityheaders\.com\|CR/LF'` | absent (rc 1) |
| `.planning/security/runs/phase-01.md` | absent (rc 1) — plan 08 owns it |

`security-check.sh --ci` exits **1** on the current tree — see Deviations; this is check 1 correctly firing on 4 pre-existing HIGH advisories, not a script defect. Checks 2–5 PASS, 6–7 SKIP.

## Deviations from Plan

### Auto-fixed / adjusted

**1. [Rule 3 - Blocking] `js-weight-check.sh` output-dir resolution: strict for an explicit arg, fallback only for the default**
- **Found during:** Task 1 acceptance (`… /nonexistent-dir` must exit non-zero) vs. the plan's fallback wording ("if that path has no `index.html`, fall back to `.vercel/output/static` / `dist`").
- **Issue:** With `.vercel/output/static` present, a single generic fallback makes `js-weight-check.sh /nonexistent-dir` silently succeed against the fallback — failing that acceptance criterion while satisfying the other (`… "$STATIC_DIR"` exits 0).
- **Fix:** An explicitly-passed `$1` is honoured strictly (missing `index.html` -> `exit 1` with a message saying the dir was given explicitly). The `${STATIC_DIR:-.vercel/output/static}` -> `.vercel/output/static` -> `dist` fallback applies only when no arg is passed. Both acceptance criteria now hold; CI's no-arg call still gets the fallback.
- **Files:** `scripts/js-weight-check.sh`. **Commit:** `f9da4b4`.

**2. [Rule 1 - Spec/reality conflict] `security-check.sh` check 3 permits Fonts API `@font-face` blocks instead of failing on any inline `<style>`**
- **Found during:** Task 2 (running `--ci` against the real `.vercel/output/static`).
- **Issue:** The plan's Task 2 check-3 text says "FAIL if any inline `<style>` block is present", but the mandated Astro Fonts API (01-01 stack decision) always injects inline `<style>` `@font-face` blocks — the real build has 2, holding 16 `@font-face` rules. The literal wording makes `security-check.sh` exit non-zero on a correct Phase 1 build, contradicting the plan's own success criterion "both scripts … exit 0 against the clean Phase 1 tree" and Task 2 acceptance "`--ci` exits 0 … no `FAIL:` line". The `<upstream_note>` in the execution prompt and 01-02 deviation 2 both instruct this exact adjustment.
- **Fix:** Check 3 strips `@font-face{…}` and `:root{--font-…}` blocks and all tags from each inline `<style>` span; it FAILs only if page/token/bundle CSS remains (e.g. `--color-*`, `.stack`, `data-astro-cid`, `@media`). It reports the `<style>` / `@font-face` / inline-`<script>` counts either way. Verified: PASS on the current build, and a synthetic inlined `:root{--color-…}` would FAIL.
- **Files:** `scripts/security-check.sh`. **Commit:** `a3b564b`.

**3. [Rule 3 - Blocking] Added `.gitattributes` to pin `*.sh` to LF**
- **Found during:** Task 1 commit (`git` warned "LF will be replaced by CRLF"; `core.autocrlf=true` on this checkout).
- **Issue:** Without `.gitattributes`, a fresh Windows clone would check out `scripts/*.sh` with CRLF, breaking `#!/usr/bin/env bash` for local runs, while CI (Linux) keeps LF — the human gate and the CI gate would diverge, violating the must_haves truth about the gate not drifting.
- **Fix:** New `.gitattributes` (`* text=auto eol=lf`, `*.sh text eol=lf`, binary types marked); `git add --renormalize .`. One file beyond the plan's `files_modified` list — same category as 01-01's `pnpm-workspace.yaml` and 01-02's `.prettierrc` tuning.
- **Files:** `.gitattributes`. **Commit:** `7e033f8`.

### Documented, not fixed (out of scope / needs owner decision)

**4. [SCOPE BOUNDARY + Rule 4] `pnpm audit --audit-level=high` fails on 4 pre-existing HIGH advisories**
- **Found during:** Task 2 verification.
- **Condition:** The 01-01 dependency tree carries 4 transitive HIGH advisories: `path-to-regexp` (via `@astrojs/vercel` > `@vercel/routing-utils`), `tmp` and `extract-zip` ×2 (via `@lhci/cli` > … > `puppeteer-core`). `security-check.sh` check 1 correctly FAILs; the script itself is faithful to spec.
- **Why not fixed here:** pre-existing (not caused by 01-03's changes); resolution requires `pnpm` overrides / dependency-tree edits that touch 01-01's committed contract and the production adapter path (Rule 4 — architectural, needs Felipe); and a fully clean `--audit-level=high` is impossible today because `extract-zip` has no patched release (`2.0.1` is latest; advisory's "Patched >=2.0.2" does not exist).
- **Logged:** `.planning/phases/01-foundation-ci-gate/deferred-items.md` (D1, with the full advisory table and a 3-step owner action) and STATE.md blockers.
- **Impact on Phase 1:** The SEC-07 "no phase closes with an open High finding" rule means these must be triaged (overrides for `path-to-regexp`/`tmp`; `extract-zip` recorded as Med with a target date or the transitive path pinned) in `.planning/security/runs/phase-01.md` (plan 08) before Phase 1 closes. Plan 04 must also decide whether the CI `pnpm audit` step / `security-check.sh` check 1 may be red on `main` until then.

**Total:** 3 auto-fixed/adjusted (Rules 1/3), 1 documented pre-existing condition requiring an owner decision.

## Known Stubs

- `.planning/security/SECURITY-CHECKLIST.md` findings table ships with a single example row `P00-000` explicitly labelled "substituir por achados reais no arquivo de execução da fase". Intentional — the gabarito is a template; real findings live in the per-phase run files (plan 08 authors `phase-01.md`).
- `security-check.sh` checks 6 and 7 are `SKIP` stubs until a preview URL exists (Vercel project link + `VERCEL_AUTOMATION_BYPASS_SECRET`, plans 04–05). The header assertions in check 6 are deliberately deferred to Phase 7 (baseline only in Phase 1, per the gabarito).

## Threat Surface

Matches the plan's `<threat_model>`; no new security-relevant surface introduced by these files.
- T-03-01 (bypass-secret disclosure): check 6 passes `$VERCEL_AUTOMATION_BYPASS_SECRET` only as a `curl` header from `${VAR:-}`; it is never echoed. `security-check.sh --ci` output greps clean for `re_[A-Za-z0-9]{20,}`.
- T-03-02 (secret in built assets): check 4 uses the tight regex + literal env-var names over `$STATIC_DIR` and `.vercel/output`; prints filenames only.
- T-03-03 (dependency creep): `js-weight-check.sh` denylist blocks UI-framework / animation-lib keys; `security-check.sh` check 1 runs `pnpm audit --audit-level=high`.
- T-03-04 (extra function): check 5 asserts `<= 1` via `-gt 1`.
- T-03-05 (review record): the gabarito mandates the D-12 findings table + the hard "no open High" rule.
- T-03-06 (gate drift): one script for humans and CI (D-11), now with `.gitattributes` LF pinning so line endings cannot diverge either.

### Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: dependency-advisory | package.json (01-01 tree) | 4 pre-existing HIGH advisories (`path-to-regexp`, `tmp`, `extract-zip` ×2) now surfaced by `security-check.sh` check 1; one has no upstream fix. Owner triage required before Phase 1 close — see `deferred-items.md` D1. |

## Next Phase Readiness

- Plan 04 can wire `.github/workflows/ci.yml` to `bash scripts/js-weight-check.sh "$STATIC_DIR"` and `bash scripts/security-check.sh --ci` verbatim — the invocation contract above is exact.
- Plan 04 / plan 08 must resolve deferred item D1 (the 4 HIGH advisories) or explicitly accept a red `pnpm audit` gate on `main` until the dependency triage lands.
- `.planning/security/SECURITY-CHECKLIST.md` is ready; plan 08 appends the first `.planning/security/runs/phase-01.md` from a real `--ci` run and records D1 in the findings table.
- Branch is still `master` (rename to `main` owned by plan 01-05).

## Self-Check: PASSED

- `scripts/js-weight-check.sh` - FOUND
- `scripts/security-check.sh` - FOUND
- `.planning/security/SECURITY-CHECKLIST.md` - FOUND
- `.gitattributes` - FOUND
- `.planning/phases/01-foundation-ci-gate/deferred-items.md` - FOUND
- Commit `f9da4b4` (js-weight-check.sh) - FOUND
- Commit `7e033f8` (.gitattributes) - FOUND
- Commit `a3b564b` (security-check.sh) - FOUND
- Commit `9c76b56` (SECURITY-CHECKLIST.md) - FOUND

---
*Phase: 01-foundation-ci-gate*
*Completed: 2026-09-08*
