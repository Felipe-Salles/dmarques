---
phase: 2
slug: content-collections
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-10
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (no vitest/jest/`tests/` — confirmed). Validation = `astro sync` schema check + `astro check` + `pnpm build`. No test framework is added this phase (no-new-deps grain, CLAUDE.md). |
| **Config file** | none — the five `defineCollection` calls in `src/content.config.ts` are the schema contract |
| **Quick run command** | `pnpm run check` (`astro sync && astro check`) |
| **Full suite command** | `pnpm build` (sync + full static build; CI also runs `pnpm audit` and `bash scripts/security-check.sh --ci`) |
| **Estimated runtime** | ~10–25 s local (`pnpm run check`); ~30–60 s `pnpm build` |

---

## Sampling Rate

- **After every task commit:** Run `pnpm run check` (fast; catches schema/type breakage)
- **After every plan wave:** Run `pnpm build` + `bash scripts/security-check.sh --ci`
- **Before `/gsd:verify-work`:** `pnpm build` green, `astro check` 0 errors, `security-check.sh --ci` PASS, SEC-07 phase-02 run file with no open High
- **Max feedback latency:** ~25 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 01 | 1 | CONTENT-05 | T-02-01 | `project-types.ts` imports nothing; five locked slugs present | static check + grep | `pnpm run check` | ❌ W0 (`src/content/project-types.ts`) | ⬜ pending |
| 02-01-T2 | 01 | 1 | CONTENT-01, CONTENT-04 | T-02-01 | 16 verbatim entries on disk, `order` present, zero comments | build assertion + grep | `pnpm run check` | ❌ W0 (16 `*.yaml` entries) | ⬜ pending |
| 02-01-T3 | 01 | 1 | CONTENT-01 | T-02-01 / T-02-02 | `z.strictObject` on all four schemas; bad key/missing field fails build | build assertion | `pnpm run check && pnpm build` | ❌ W0 (`src/content.config.ts`) | ⬜ pending |
| 02-02-T1 | 02 | 2 | CONTENT-02 | T-02-06 / T-02-10 | Placeholder cover is WebP, 1600×1000, <150 KB, under `src/` | script (Sharp metadata check) | see 02-02-PLAN.md Task 1 `&lt;automated&gt;` | ❌ W0 (`dmarques-cover.webp`) | ⬜ pending |
| 02-02-T2 | 02 | 2 | CONTENT-02, CONTENT-03, CONTENT-05 | T-02-06 / T-02-07 / T-02-08 / T-02-09 | `cases` schema-as-function w/ required `image()`; `tipo` built from `PROJECT_TYPE_VALUES`; exactly one honestly-labeled case | build assertion + grep | `pnpm run check && pnpm build` | ❌ W0 (`dmarques.md` + `cases` collection) | ⬜ pending |
| 02-02-T3 | 02 | 2 | CONTENT-04 | — | `getFaq()` is the sole read path; `order` sort centralized | build assertion + grep | `pnpm run check && pnpm build` | ❌ W0 (`src/content/index.ts`) | ⬜ pending |
| 02-03-T1 | 03 | 3 | CONTENT-01 | T-02-11 / T-02-12 | Unknown key AND missing `order` each provably fail `pnpm build`; tree reverts clean | build assertion (negative test) | see 02-03-PLAN.md Task 1 `&lt;automated&gt;` | ✅ (probes target existing entries) | ⬜ pending |
| 02-03-T2 | 03 | 3 | SEC-07 | T-02-13 / T-02-14 / T-02-15 / T-02-16 / T-02-SC | No new inline surface, `pnpm audit` clean, no new dependency, no High left Open | script | `pnpm build && bash scripts/security-check.sh --ci` | ✅ (`scripts/security-check.sh`, Phase 1) | ⬜ pending |
| 02-04-T1 | 04 | 4 | CONTENT-02, CONTENT-03 | T-02-17 | Felipe approves cover art, `coverAlt`, and case copy | human-check | manual | n/a | ⬜ pending |
| 02-04-T2 | 04 | 4 | SEC-07 | T-02-19 / T-02-20 | Felipe signs off SEC-07 run; no High left Open | human-check | manual | n/a | ⬜ pending |
| 02-04-T3 | 04 | 4 | CONTENT-02, CONTENT-03, SEC-07 | T-02-18 / T-02-19 / T-02-SC | Approved edits applied; build/check/security-check still green; sign-off appended | build assertion + grep | `pnpm run check && pnpm build && bash scripts/security-check.sh --ci` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task IDs are the concrete plan/task references from 02-01-PLAN.md..02-04-PLAN.md; every CONTENT-0x row maps to at least one planned task.*

---

## Wave 0 Requirements

- [ ] `src/content.config.ts` — the five `defineCollection` calls with strict Zod schemas (covers CONTENT-01 / CONTENT-02)
- [ ] `src/content/project-types.ts` — shared `as const` enum module, no `astro:content` import (covers CONTENT-05)
- [ ] `src/content/services/*.yaml` ×4, `process/*.yaml` ×4, `differentiators/*.yaml` ×4, `faq/*.yaml` ×4 — design-verbatim entries (covers CONTENT-01 / CONTENT-04)
- [ ] `src/content/cases/<slug>.md` + co-located placeholder cover `.webp` (covers CONTENT-02 / CONTENT-03)
- [ ] `src/content/index.ts` — optional barrel with the `order` sort helper (covers CONTENT-04 single-source cleanliness)
- [ ] One-time negative test (add bogus key → `pnpm build` fails → revert) recorded in the phase SUMMARY as evidence for CONTENT-01 success criterion 1
- [ ] No test-framework install — intentional; validation is `astro check` + `pnpm build` (already CI-gated)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bogus/extra key fails `pnpm build` | CONTENT-01 (success criterion 1) | Negative assertion — cannot live as a committed passing test without a framework; run once then revert | Add an unknown key to one `services/*.yaml`, run `pnpm build`, confirm non-zero exit + strict-schema error, revert the edit, record the output snippet in SUMMARY |
| Copy is verbatim from the design file | CONTENT-01 | Requires human diff against `arquivos de design/Dmarques Landing.dc.html` | Compare each `titulo`/`descricao`/`pergunta`/`resposta` against the design lines cited in CONTEXT.md canonical refs |
| Placeholder cover art is acceptable + `coverAlt` copy | CONTENT-02 | Subjective (branding) | Felipe reviews the generated placeholder and approves the alt-text string during execution |
| Dmarques-site case `problema`/`solucao`/`resultado` draft | CONTENT-02 | Editorial judgement | Surface the draft (built from PROJECT.md Core Value + Phase 1 metrics) to Felipe during execution |
| SEC-07 phase-02 checklist run has no open High | SEC-07 | Checklist ritual signed off by a human | Run the SEC-07 checklist, file `.planning/security/runs/` entry for phase-02 |

---

## Validation Sign-Off

- [x] Every planned task has an `<automated>` verify command (`pnpm run check` or `pnpm build`) or a Wave 0 dependency — the two `checkpoint:human-verify` tasks in 02-04 carry `<human-check>` instead, by design
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all MISSING references (config file, enum module, entries, cover image)
- [x] No watch-mode flags in any command
- [x] Feedback latency < 25s (the 02-03-T1 negative-test chain runs several full `pnpm build`s and is the one exception, accepted per plan-checker WARNING — see 02-03-PLAN.md Task 1)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-10 (gsd-plan-checker VERIFICATION PASSED after targeted fix)
