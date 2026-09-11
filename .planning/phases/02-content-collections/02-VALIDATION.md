---
phase: 2
slug: content-collections
status: draft
nyquist_compliant: false
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
| 2-01-xx | 01 | 1 | CONTENT-01 | — | N/A (build-time only, no runtime surface) | build assertion | `pnpm build` | ❌ W0 (`src/content.config.ts` + entries) | ⬜ pending |
| 2-01-xx | 01 | 1 | CONTENT-01 | — | Types generated & typecheck clean | static check | `pnpm run check` | ❌ W0 | ⬜ pending |
| 2-01-xx | 01 | 1 | CONTENT-02 | — | `cases` Markdown loads; `image()` cover resolves; problema/solucao/resultado required | build assertion | `pnpm build` | ❌ W0 (`src/content/cases/*.md` + co-located `.webp`) | ⬜ pending |
| 2-01-xx | 01 | 1 | CONTENT-03 | — | Exactly one honestly-labeled case (`rotulo`/label enum) published | build assertion + grep | `pnpm build`; `grep -rl 'rotulo:' src/content/cases` | ❌ W0 | ⬜ pending |
| 2-01-xx | 01 | 1 | CONTENT-04 | — | `faq` is the sole source; plain-text strings; consumable by later `FAQPage` JSON-LD | build assertion | `pnpm build`; `getCollection('faq')` compiles in consumer | ❌ W0 (`src/content/faq/*.yaml` + barrel) | ⬜ pending |
| 2-01-xx | 01 | 1 | CONTENT-05 | — | `project-types.ts` is the single enum; schema `z.enum` + Phase 5 import the same tuple; module does NOT import `astro:content` | static check + grep | `pnpm run check`; `grep -L "astro:content" src/content/project-types.ts` | ❌ W0 (`src/content/project-types.ts`) | ⬜ pending |
| 2-01-xx | 01 | 1 | SEC-07 | — | No new inline surface, `pnpm audit` clean, no new dependency | script | `bash scripts/security-check.sh --ci` | ✅ (`scripts/security-check.sh`, Phase 1) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task IDs are placeholders — the planner assigns concrete IDs; every CONTENT-0x row must map to at least one planned task.*

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

- [ ] Every planned task has an `<automated>` verify command (`pnpm run check` or `pnpm build`) or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Wave 0 covers all MISSING references (config file, enum module, entries, cover image)
- [ ] No watch-mode flags in any command
- [ ] Feedback latency < 25s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
