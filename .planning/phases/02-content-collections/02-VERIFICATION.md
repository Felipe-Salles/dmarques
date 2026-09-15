---
phase: 02-content-collections
verified: 2026-09-15T21:02:54Z
status: passed
score: 12/12 must-haves verified
overrides_applied: 0
---

# Phase 2: Content Collections Verification Report

**Phase Goal:** All site copy and portfolio cases live as typed, build-validated content collections with no CMS and no admin surface.
**Verified:** 2026-09-15T21:02:54Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `services`/`process`/`differentiators`/`faq` are YAML validated by strict Zod schemas at build; a bad key or missing field fails `pnpm build` | VERIFIED | Independently re-ran both negative probes (not trusting SUMMARY claims): appending `bogus_key: true` to `src/content/faq/prazo-projeto.yaml` produced `[InvalidContentEntryDataError] faq → prazo-projeto ... Unrecognized key: "bogus_key"` with non-zero exit; deleting `order:` from `src/content/services/solucoes-web.yaml` produced `[InvalidContentEntryDataError] services → solucoes-web ... order: Required` with non-zero exit. Tree reverted cleanly (`git status --porcelain src/` empty), clean `pnpm build` exits 0. `src/content.config.ts` uses `z.strictObject` on all 4 schemas, no `.default()`/`.optional()` anywhere. |
| 2 | Portfolio `cases` are Markdown with `image()` covers in problema → solução → resultado structure; 1-2 honestly-labeled entries published | VERIFIED | `src/content/cases/dmarques.md` exists with `cover: ./dmarques-cover.webp` resolved via schema-as-function `({ image }) => z.strictObject({ cover: image(), ... })`; `problema`/`solucao`/`resultado` are required `>-` folded fields; `rotulo: projeto próprio` (honest label, no fictional demo entry — exactly 1 case, matching D-07). `pnpm build` succeeds with the image processed (WebP 1600x1000, 8468 bytes, verified with `file`/`wc -c`). |
| 3 | `faq` is the single source feeding both the visible FAQ section and the `FAQPage` JSON-LD; the "tipo de projeto" enum is defined once and reused as the quote-form allow-list | VERIFIED (mechanism) | `grep -rn "getCollection(" src/` shows exactly one `getCollection('faq')` call site (`src/content/index.ts`), the only mechanism through which FAQ data can be read — Phase 3 (FAQ section) and Phase 6 (JSON-LD) do not exist yet in the codebase, so actual dual-consumption is necessarily deferred to those phases; the single-read-path architecture that guarantees it is in place now. `src/content/project-types.ts` exports `PROJECT_TYPE_VALUES` as an import-nothing module; `src/content.config.ts` imports it once (`z.enum(PROJECT_TYPE_VALUES)` for `cases.tipo`) proving build-time reuse. Phase 5 (the quote form) does not exist yet — its consumption of the same tuple is deferred to that phase by design. |
| 4 | The SEC-07 checklist run for this phase passes with no open High finding (no new inline surface, `pnpm audit` clean, every added dependency justified) | VERIFIED | Independently re-ran `bash scripts/security-check.sh --ci` — output matches `.planning/security/runs/phase-02.md` verbatim: `== resumo: 5 PASS / 0 FAIL / 2 SKIP ==`, exit 0. Findings table has 4 rows (`P02-001`..`P02-004`), all `Med`/`Low`, none `High`. `git diff --stat` on `package.json`/`pnpm-lock.yaml` since Phase 1 close is empty (no dependency added). Felipe's dated sign-off block is present at the end of the run file ("Revisão de segurança da Fase 2 aprovada por Felipe Salles em 2026-09-15"). |

**Score:** 4/4 ROADMAP success criteria verified

### Supplementary Plan-Level Must-Haves (Decisions D-01..D-12)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 5 | D-01: one-file-per-entry YAML via `glob()`, not a single array file | VERIFIED | 16 individual `.yaml` files across `src/content/{services,process,differentiators,faq}/`; `content.config.ts` uses `glob({ base: ..., pattern: '**/*.yaml' })` per collection |
| 6 | D-04: `services` stays decoupled from the `tipo` enum | VERIFIED | `services` schema fields are `order, titulo, descricao, icon` only — no `tipo` field |
| 7 | D-05/D-06: enum lives in one import-nothing module with the five locked slug/label pairs | VERIFIED | `src/content/project-types.ts` has zero imports (`grep "^import\|from '"` prints nothing); exact 5 pairs match the design-locked values (`site-institucional`/"Site institucional" etc.) |
| 8 | D-08: cover required via `image()`, never `.optional()` | VERIFIED | `cover: image()` with no `.optional()` in `content.config.ts`; `grep "image().optional()"` prints nothing |
| 9 | D-09: case entry has three required frontmatter strings (problema/solucao/resultado) plus optional Markdown body | VERIFIED | All three fields required (`.min(40).max(600)`, no `.optional()`); two-paragraph Markdown body present below frontmatter |
| 10 | D-10: copy transcribed verbatim from the design file | VERIFIED | Spot-checked all 16 YAML entries against the plan's `<content_source>` table — byte-identical text for services/process/differentiators/faq |
| 11 | D-11: faq pergunta/resposta are plain-text folded scalars, never Markdown | VERIFIED | All 4 `resposta:` values use `>-` folded scalars; no Markdown syntax (headers, links, emphasis) present |
| 12 | D-12: only the five ROADMAP-named collections exist (no hero/bio/contact-block/footer) | VERIFIED | `export const collections = { services, process, differentiators, faq, cases }` — exactly 5; `find src/content -type f` shows no other collection directories |

**Score:** 8/8 supplementary must-haves verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/content/project-types.ts` | PROJECT_TYPE_VALUES/ProjectType/PROJECT_TYPES, imports nothing | VERIFIED | 3 exports present, zero imports, all 5 locked slugs present |
| `src/content.config.ts` | 5 `defineCollection` calls, `z.strictObject` on all, `collections` export | VERIFIED | `grep -c "z.strictObject"` = 5; `export const collections = { services, process, differentiators, faq, cases }` present |
| `src/content/index.ts` | 5 typed accessors, single `getCollection('faq')` call | VERIFIED | `getServices/getProcess/getDifferentiators/getFaq/getCases` all exported; single faq read path confirmed |
| `src/content/cases/dmarques.md` | single v1 case, `rotulo: projeto próprio`, problema/solucao/resultado | VERIFIED | Present, matches `<case_copy>` verbatim |
| `src/content/cases/dmarques-cover.webp` | 1600x1000 WebP under 150KB | VERIFIED | Confirmed via `file` (WebP, 1600x1000) and `wc -c` (8468 bytes) |
| 16 YAML entries (services/process/differentiators/faq) | verbatim design copy, strict schema compliance | VERIFIED | All 16 present, content matches design tables, `pnpm build` accepts them |
| `.planning/security/runs/phase-02.md` | SEC-07 record, no open High, Felipe's sign-off | VERIFIED | Present, 187 lines, findings table has no High row, sign-off block present with name+date |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/content.config.ts` | `src/content/services` | `glob({ base: './src/content/services' ... })` | WIRED | Confirmed literal string match in file |
| `src/content.config.ts` | `astro/zod` | `import { z } from 'astro/zod'` | WIRED | Confirmed, not the deprecated `astro:content` re-export |
| `src/content/project-types.ts` | Phase 5 (future) serverless route | plain TS module, zero `astro:*` imports | WIRED (ready) | Module imports nothing, loadable from any context; actual Phase 5 consumption necessarily not yet present (future phase) |
| `src/content/cases/dmarques.md` | `src/content/cases/dmarques-cover.webp` | `image()` relative path resolution | WIRED | `cover: ./dmarques-cover.webp`, `pnpm build` resolves and processes the asset with no "Could not find requested image" error |
| `src/content.config.ts` | `src/content/project-types.ts` | `PROJECT_TYPE_VALUES` import feeding `z.enum` | WIRED | `import { PROJECT_TYPE_VALUES } from './content/project-types';` and `tipo: z.enum(PROJECT_TYPE_VALUES)` both present |
| `src/content/index.ts` | `astro:content` | `getCollection` | WIRED | Single `getCollection('faq')` call site confirmed via repo-wide grep |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Unknown key fails build | append `bogus_key: true`, run `pnpm build` | Non-zero exit, `InvalidContentEntryDataError ... Unrecognized key: "bogus_key"` | PASS |
| Missing required field fails build | remove `order:`, run `pnpm build` | Non-zero exit, `InvalidContentEntryDataError ... order: Required` | PASS |
| Clean build succeeds | `pnpm build` on reverted tree | Exit 0, `1 page(s) built` | PASS |
| Type/schema check clean | `pnpm run check` | `astro sync && astro check` — 0 errors, 0 warnings, 0 hints | PASS |
| SEC-07 script | `bash scripts/security-check.sh --ci` | `== resumo: 5 PASS / 0 FAIL / 2 SKIP ==`, exit 0 | PASS |
| No dependency added | `git diff --stat 09db3f7..HEAD -- package.json pnpm-lock.yaml` | Empty output | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|--------------|--------|----------|
| CONTENT-01 | 02-01 | Serviços/processo/diferenciais/FAQ em Content Collections YAML validadas por Zod | SATISFIED | Strict schemas + verified negative-test evidence |
| CONTENT-02 | 02-02 | Cases de portfólio em Markdown com `image()` e estrutura problema→solução→resultado | SATISFIED | `dmarques.md` + schema-as-function `image()` |
| CONTENT-03 | 02-02, 02-04 | 1-2 entradas honestamente rotuladas publicadas na v1 | SATISFIED | 1 entry, `rotulo: projeto próprio`, Felipe-approved |
| CONTENT-04 | 02-01, 02-02 | FAQ é fonte única para seção visível e JSON-LD | SATISFIED (mechanism) | Single `getFaq()`/`getCollection('faq')` read path; actual dual-consumers are Phase 3/6 scope |
| CONTENT-05 | 02-01, 02-02 | Enum "tipo de projeto" definido uma vez e reusado pelo formulário | SATISFIED (mechanism) | Single import-nothing module, reused once already by `cases.tipo`; Phase 5 form consumption is that phase's scope |

No orphaned requirements — all 5 CONTENT-* IDs declared across the 4 plans' frontmatter match the 5 IDs REQUIREMENTS.md maps to Phase 2, and REQUIREMENTS.md marks all 5 complete.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/content/index.ts:11` | `getCases` does not sort by `order` (unlike the other 4 accessors) | Info | Latent risk flagged by 02-REVIEW.md (WR-01): invisible today with a single case entry, but matches the plan's explicit design ("a single v1 entry makes sorting noise" — 02-02-PLAN.md L229) rather than a defect against this phase's must-haves. Not a gap for Phase 2 closure; worth fixing before a second case entry ships. |

No TODO/FIXME/TBD/XXX/HACK/placeholder markers found in any file created or modified by this phase (comment-scan false positives were glob pattern strings `**/*.yaml` and the Portuguese word "Todo", not actual code comments or debt markers). Zero comments confirmed in `.ts` files per D-13.

### Human Verification Required

None. Both `checkpoint:human-verify` tasks in 02-04-PLAN.md were already executed and recorded: Felipe approved the case cover/copy and signed off the SEC-07 run, both decisions dated 2026-09-15 and present verbatim in `02-04-SUMMARY.md` and appended to `.planning/security/runs/phase-02.md`.

### Gaps Summary

No gaps. All 4 ROADMAP success criteria and all 8 supplementary decision-level must-haves (D-01, D-04, D-05, D-06, D-08, D-09, D-10, D-11, D-12) were independently re-verified against the live codebase rather than trusting SUMMARY.md claims — negative-test probes were re-run from scratch, the SEC-07 script was re-executed, and every artifact/key-link was grepped directly. The one code-review warning (WR-01, `getCases` unsorted) is a forward-looking design note explicitly anticipated by the plan text, not a violation of this phase's must-haves, and is recorded as Info rather than a blocker.

---

_Verified: 2026-09-15T21:02:54Z_
_Verifier: Claude (gsd-verifier)_
