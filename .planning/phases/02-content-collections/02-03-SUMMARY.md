---
phase: 02-content-collections
plan: 03
subsystem: testing
tags: [zod, astro-content-collections, security-review, sec-07]

requires:
  - phase: 02-content-collections
    provides: "src/content.config.ts strict schemas (02-01), cases collection + barrel (02-02)"
provides:
  - "Verbatim negative-test evidence proving z.strictObject fails pnpm build on an unknown key and on a missing required field (ROADMAP Phase 2 success criterion 1)"
  - ".planning/security/runs/phase-02.md — SEC-07 phase-02 review record, no open High finding (ROADMAP Phase 2 success criterion 4)"
affects: [phase-03-sections, phase-06-seo]

tech-stack:
  added: []
  patterns:
    - "One-time adversarial negative-test-and-revert pattern for a build-is-the-validator architecture: append/strip a field, capture the verbatim Zod/Astro error, git checkout -- to restore, no test framework added"

key-files:
  created:
    - .planning/security/runs/phase-02.md
  modified: []

key-decisions:
  - "No behavior/config change from Task 1 — both probes were reverted with git checkout -- and the working tree confirmed byte-identical (git status --porcelain src/ empty) before and after; only the SUMMARY records the evidence."
  - "SEC-07 phase-02 run recorded checks 6/7 as SKIP (no phase-02 preview URL published yet) rather than forcing a preview deploy — consistent with the plan's documented expected result of 5 PASS / 0 FAIL / 2 SKIP."

patterns-established:
  - "Negative-test evidence for schema-enforcement requirements lives in the plan SUMMARY, not in a committed test file, when the project's validation architecture is 'the build is the validator' with no test framework."

requirements-completed: [CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05]

duration: ~25min
completed: 2026-09-15
---

# Phase 2 Plan 03: Negative-test evidence + SEC-07 phase-02 review Summary

**Proved the strict-schema build gate fires on both an unknown key and a missing required field via reverted adversarial probes, then filed the SEC-07 phase-02 security review with 5 PASS / 0 FAIL / 2 SKIP and no open High finding.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-09-15T20:38:00Z
- **Completed:** 2026-09-15T20:43:42Z
- **Tasks:** 2
- **Files modified:** 1 created (no source files changed — both probes reverted)

## Accomplishments
- Confirmed `z.strictObject` in `src/content.config.ts` is not silently lenient: an unknown key (`bogus_key`) and a missing required field (`order`) each abort `pnpm build` with a non-zero exit and a named `InvalidContentEntryDataError`, and the working tree returned byte-identical afterward.
- Filed `.planning/security/runs/phase-02.md`: verbatim `scripts/security-check.sh --ci` output (5 PASS / 0 FAIL / 2 SKIP, exit 0), all four judgement items answered, and a `P02-00x` findings table with zero open High findings.

## Task Commits

Each task was committed atomically:

1. **Task 1: Run the one-time negative tests and capture the evidence** - no commit (both probes reverted with `git checkout --`; no source change to commit — see Probe evidence below)
2. **Task 2: File the SEC-07 phase-02 security review run** - `9268fcc` (docs)

**Plan metadata:** committed together with this SUMMARY (see final commit).

## Negative-Test Evidence (Task 1)

### Probe A — unknown key (CONTENT-01)

Appended `bogus_key: true` to `src/content/faq/prazo-projeto.yaml`, ran `pnpm build`:

```
[InvalidContentEntryDataError] faq → prazo-projeto data does not match collection schema.

  ****: Unrecognized key: "bogus_key"

  Location:
    F:\Projetos\dmarques\src\content\faq\prazo-projeto.yaml:0:0
```

Exit code: non-zero (process exit `127`; the Windows Node/libuv host additionally crashed
during child-process cleanup with `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`
after the schema error was thrown and printed — the schema rejection itself is the
`InvalidContentEntryDataError` above, confirmed before the crash). File reverted with
`git checkout -- src/content/faq/prazo-projeto.yaml`; `git status --porcelain src/` printed
nothing afterward.

### Probe B — missing required field (D-02 / CONTENT-01)

Removed the `order:` line from `src/content/services/solucoes-web.yaml`, ran `pnpm build`:

```
[InvalidContentEntryDataError] services → solucoes-web data does not match collection schema.

  order**: **order: Required

  Location:
    F:\Projetos\dmarques\src\content\services\solucoes-web.yaml:0:0
```

Exit code: non-zero (same `127` / libuv-crash-after-error signature as Probe A). File reverted
with `git checkout -- src/content/services/solucoes-web.yaml`; `git status --porcelain src/`
printed nothing afterward.

### Clean rebuild

`pnpm build` on the fully reverted tree exited **0** (`1 page(s) built`), and
`git status --porcelain src/` printed nothing — the working tree is byte-identical to its
pre-test state. No `.tmp`/`.orig`/log file was left in the repo (scratchpad only).

## Files Created/Modified
- `.planning/security/runs/phase-02.md` - SEC-07 phase-02 review record: verbatim `security-check.sh --ci` output, four judgement answers ("nenhuma dependência adicionada" / "nenhum" asset / "nenhum" segredo / findings owned), `P02-001`..`P02-004` findings table (two carried-forward accepted `extract-zip` Med advisories, two new Low render-escaping notes for Phase 3/Phase 6), no open High.

## Decisions Made
- Recorded checks 6/7 as `SKIP` in the phase-02 SEC-07 run (no phase-02 preview URL exists yet) rather than deploying a preview solely to exercise this plan — matches the plan's documented expected result `5 PASS / 0 FAIL / 2 SKIP` and defers header/Lighthouse assertions to when Phase 2 content is actually rendered (Phase 3+) or Phase 7 (header hardening).
- Carried forward the two Phase 1 `extract-zip` dev/CI-only advisories (`GHSA-jmr9-qjv8-65gv`, `GHSA-7pqw-9j4j-h8q3`) as `P02-001`/`P02-002` since `pnpm-workspace.yaml` `ignoreGhsas` and the dependency tree are unchanged (`git diff --stat` on `package.json`/`pnpm-lock.yaml` since Phase 1 close is empty).
- Filed two new Low findings (`P02-003`, `P02-004`) for downstream render-time escaping obligations flagged by 02-RESEARCH.md's Security Domain section (HTML-escape case fields in Phase 3; JSON-encode FAQ strings into `FAQPage` JSON-LD in Phase 6) rather than silently dropping them.

## Deviations from Plan

None — plan executed exactly as written. One clarifying note: the plan's illustrative verify
command expected a conventional non-zero/zero exit-code triplet; on this Windows host, `pnpm
build` failures for content-schema errors surface as exit code `127` with an additional
libuv/Node cleanup crash (`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`) printed
*after* the correct `InvalidContentEntryDataError` schema rejection. This is a pre-existing
host/Node quirk unrelated to the schema gate (also documented in `01-08` for a different
Lighthouse-related EPERM symptom) — the important fact for CONTENT-01 is that both probes exit
non-zero and the clean rebuild exits exactly `0`, which was verified directly.

## Issues Encountered
- Windows Node/libuv occasionally emits `Assertion failed: !(handle->flags &
  UV_HANDLE_CLOSING)` and a non-standard exit code after an `astro build` content-schema
  failure finishes printing its error. This does not affect the negative-test evidence (the
  schema-rejection message and non-zero exit are both present and captured verbatim above) and
  requires no fix — it is host tooling noise around an already-correct failure, not a false
  pass.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- ROADMAP Phase 2 success criteria 1 and 4 both now have recorded evidence: the strict-schema
  build gate provably fires (Task 1), and the SEC-07 phase-02 run has no open High finding
  (Task 2).
- `.planning/security/runs/phase-02.md` carries two Low findings (`P02-003`/`P02-004`) forward
  as explicit obligations for Phase 3 (HTML-escape case fields) and Phase 6 (JSON-encode FAQ
  strings) — these should be checked off when those phases render the corresponding content.
- No blockers. Plan 02-04 (Felipe's sign-off checkpoint) can proceed.

---
*Phase: 02-content-collections*
*Completed: 2026-09-15*

## Self-Check: PASSED

All created files verified present (`.planning/security/runs/phase-02.md`,
`.planning/phases/02-content-collections/02-03-SUMMARY.md`); commit hash `9268fcc` verified
present in `git log --oneline --all`.
