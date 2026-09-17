---
phase: 02-content-collections
plan: 01
subsystem: content
tags: [astro, content-collections, zod, yaml]

requires:
  - phase: 01-foundation
    provides: astro.config.mjs conventions, tsconfig strict mode, pnpm-lock.yaml baseline
provides:
  - src/content/project-types.ts (canonical tipo-de-projeto enum, import-nothing module)
  - Four Astro content collections (services, process, differentiators, faq) via src/content.config.ts
  - 16 verbatim YAML content entries backing those collections
affects: [phase-03-sections, phase-05-form, phase-06-seo]

tech-stack:
  added: []
  patterns:
    - "Content Layer collections declared in src/content.config.ts using glob() loaders + z.strictObject schemas (Astro 7)"
    - "Cross-cutting enums live in plain .ts modules under src/content/ that import nothing, so non-Astro contexts (serverless routes) can load them without triggering a collection scan"

key-files:
  created:
    - src/content/project-types.ts
    - src/content.config.ts
    - src/content/services/sites-institucionais.yaml
    - src/content/services/sistemas-sob-medida.yaml
    - src/content/services/solucoes-web.yaml
    - src/content/services/automacoes.yaml
    - src/content/process/01-diagnostico.yaml
    - src/content/process/02-planejamento-e-design.yaml
    - src/content/process/03-desenvolvimento.yaml
    - src/content/process/04-entrega-e-suporte.yaml
    - src/content/differentiators/atendimento-direto.yaml
    - src/content/differentiators/codigo-limpo.yaml
    - src/content/differentiators/prazos-realistas.yaml
    - src/content/differentiators/suporte-pos-entrega.yaml
    - src/content/faq/prazo-projeto.yaml
    - src/content/faq/manutencao.yaml
    - src/content/faq/pagamento.yaml
    - src/content/faq/ainda-nao-sei.yaml
  modified: []

key-decisions:
  - "Executed 02-01 without git worktree isolation: the isolated worktree's pnpm install stalled repeatedly on this Windows machine, so the orchestrator copied the executor's already-correct file output into the main checkout and finished verification/commits there."
  - "workflow.use_worktrees set to false in .planning/config.json for the remainder of phase 02 (each wave in this phase has exactly one plan, so worktree parallelism has no benefit here)."

patterns-established:
  - "z.strictObject on every collection schema, no .default()/.optional() fields, so a bad key or missing field fails pnpm build (CONTENT-01)."

requirements-completed: [CONTENT-01, CONTENT-04, CONTENT-05]

duration: ~85min (including worktree-install stall and recovery)
completed: 2026-09-15
---

# Phase 2 Plan 01: Content-type enum + four YAML collections Summary

**Canonical tipo-de-projeto enum module plus four strict-schema Astro content collections (services, process, differentiators, faq) backed by 16 verbatim YAML entries.**

## Performance

- **Duration:** ~85 min (includes a stalled git-worktree pnpm install that required orchestrator intervention)
- **Started:** 2026-09-15T19:04:26Z
- **Completed:** 2026-09-15T20:26:00Z
- **Tasks:** 3
- **Files modified:** 18 created

## Accomplishments
- `src/content/project-types.ts` exports the five locked `tipo de projeto` slug/label pairs (D-06) as an import-nothing module, ready for reuse by the Phase 5 form.
- Four Astro Content Layer collections (services, process, differentiators, faq) defined in `src/content.config.ts` with `z.strictObject` schemas — no optional/defaulted fields, so a bad key or missing field fails the build.
- 16 YAML entries authored verbatim from the design file across the four collections, each one file per entry.

## Task Commits

Each task was committed atomically:

1. **Task 1: Publish the canonical tipo-de-projeto enum module** - `0c91600` (feat)
2. **Task 2: Author the 16 YAML content entries verbatim from the design** - `d84320a` (feat)
3. **Task 3: Define the four collections with strict Zod schemas** - `e779978` (feat)

## Files Created/Modified
- `src/content/project-types.ts` - PROJECT_TYPE_VALUES / ProjectType / PROJECT_TYPES, imports nothing
- `src/content.config.ts` - four defineCollection calls with strict Zod schemas
- `src/content/services/*.yaml` (4), `src/content/process/*.yaml` (4), `src/content/differentiators/*.yaml` (4), `src/content/faq/*.yaml` (4) - verbatim content entries

## Decisions Made
- Abandoned worktree isolation for this plan (and the rest of phase 02) after the isolated worktree's `pnpm install` stalled twice over ~50 minutes on this Windows environment. The already-correct files the worktree executor had produced were copied into the main checkout, verified there (main checkout's `node_modules` was already installed from Phase 1), and committed task-by-task. `workflow.use_worktrees` was set to `false` via `gsd-sdk query config-set` so subsequent waves run sequentially on the main tree — acceptable here since every wave in phase 02 contains exactly one plan (no parallelism is lost).

## Deviations from Plan

None beyond the worktree-isolation change above — plan content and schemas executed exactly as specified.

## Issues Encountered
- Git worktree `pnpm install` on Windows repeatedly stalled/partially-linked (609 packages from the local pnpm store, multiple duplicate install processes contending on the store lock). Resolved by executing without worktree isolation for this phase.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `src/content.config.ts` and all four collections are in place with real, validated entries — plan 02-02 can add the `cases` collection alongside these without touching this file's existing collections.
- No blockers.

---
*Phase: 02-content-collections*
*Completed: 2026-09-15*
