---
phase: 02-content-collections
reviewed: 2026-09-15T18:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - src/content.config.ts
  - src/content/cases/dmarques-cover.webp
  - src/content/cases/dmarques.md
  - src/content/differentiators/atendimento-direto.yaml
  - src/content/differentiators/codigo-limpo.yaml
  - src/content/differentiators/prazos-realistas.yaml
  - src/content/differentiators/suporte-pos-entrega.yaml
  - src/content/faq/ainda-nao-sei.yaml
  - src/content/faq/manutencao.yaml
  - src/content/faq/pagamento.yaml
  - src/content/faq/prazo-projeto.yaml
  - src/content/index.ts
  - src/content/process/01-diagnostico.yaml
  - src/content/process/02-planejamento-e-design.yaml
  - src/content/process/03-desenvolvimento.yaml
  - src/content/process/04-entrega-e-suporte.yaml
  - src/content/project-types.ts
  - src/content/services/automacoes.yaml
  - src/content/services/sistemas-sob-medida.yaml
  - src/content/services/sites-institucionais.yaml
  - src/content/services/solucoes-web.yaml
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-09-15T18:00:00Z
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

Reviewed the content collections layer: `content.config.ts` schema definitions, the
`getX()` accessor helpers in `content/index.ts`, `project-types.ts`, and all YAML/Markdown
content entries for `services`, `process`, `differentiators`, `faq`, and `cases`. Ran
`pnpm astro sync` to confirm every entry validates against its Zod schema — it does, with
no type errors. Schemas correctly use `z.strictObject` (rejecting unknown keys), sensible
min/max bounds, and `astro/zod` re-export per project conventions.

The main defect found is a real inconsistency: every collection except `cases` sorts its
entries by the authored `order` field before returning them, but `getCases` does not,
even though the `cases` schema defines and requires an `order` field. This is currently
invisible (only one case exists) but will silently misorder content the moment a second
case entry is added, since `glob()` loader iteration order is not a `order`-value
guarantee. No critical/security issues were found in this content-only layer.

## Warnings

### WR-01: `getCases` ignores the `order` field it requires authors to set

**File:** `src/content/index.ts:11`
**Issue:** Every other accessor (`getServices`, `getProcess`, `getDifferentiators`,
`getFaq`) sorts its collection with the shared `byOrder` comparator before returning it.
`getCases` does not:
```ts
export const getCases = async () => getCollection('cases');
```
The `cases` schema in `content.config.ts:58` defines `order: z.number().int().nonnegative()`
as a required field, so content authors are told to set it, but nothing ever reads it back.
With a single case entry this is invisible. As soon as a second `cases/*.md` file is added,
display order will depend on whatever order the `glob()` loader happens to enumerate
filesystem entries in (not guaranteed to track the `order` field), producing an unintended
render order with no error or warning anywhere in the pipeline.
**Fix:**
```ts
export const getCases = async () => (await getCollection('cases')).sort(byOrder);
```

### WR-02: `numero` and `order` in `process` entries are two independent sources of truth with no cross-check

**File:** `src/content/process/01-diagnostico.yaml:1-2` (pattern repeats in `02-`, `03-`, `04-planejamento-e-design.yaml` etc.)
**Issue:** Each process step hand-authors both `order: N` (int) and `numero: "0N"` (zero-padded
string), e.g.:
```yaml
order: 1
numero: "01"
```
The schema (`content.config.ts:20-25`) validates each field independently (`order` is a
positive int, `numero` matches `/^\d{2}$/`) but never verifies they agree. Today all four
files happen to be consistent, but nothing prevents someone from bumping `order` to
reorder steps while forgetting to update the displayed `numero` label, silently shipping a
step badge ("03") that doesn't match its actual position in the rendered sequence.
**Fix:** Either derive the displayed number from `order` at render time (drop `numero` from
the schema/content entirely, format `String(order).padStart(2, '0')` in the component), or
add a schema-level `.refine()` cross-field check:
```ts
schema: z.strictObject({
  order: z.number().int().positive(),
  numero: z.string().regex(/^\d{2}$/),
  titulo: z.string().min(3).max(60),
  descricao: z.string().min(20).max(200),
}).refine((v) => v.numero === String(v.order).padStart(2, '0'), {
  message: 'numero deve corresponder a order (padStart 2)',
  path: ['numero'],
});
```

## Info

### IN-01: No cross-entry uniqueness check on `order` within a collection

**File:** `src/content.config.ts:11,21,31,40`
**Issue:** `order` is validated per-document (`positive()` / `nonnegative()` int) but Zod
schemas run per-entry, so nothing catches two YAML files in the same collection
accidentally sharing the same `order` value. A collision would silently produce an
unstable/arbitrary tie order rather than a build failure. All current content happens to
use unique, contiguous values (1-4 for services/process/differentiators/faq), so this is
latent rather than active.
**Fix:** Optional — add a small build-time check (e.g. in a test or a `postcss`-style
sync script) that asserts `order` values are unique per collection, or accept the
convention risk as documented in project conventions.

### IN-02: `order` numbering convention is inconsistent between `cases` (0-based) and all other collections (1-based)

**File:** `src/content.config.ts:11` vs `src/content.config.ts:58`
**Issue:** `services`/`process`/`differentiators`/`faq` require `order` to be `positive()`
(minimum 1), while `cases` requires only `nonnegative()` (minimum 0). This is a harmless
but avoidable inconsistency that could confuse a future content author copying the pattern
from one collection to another.
**Fix:** Pick one convention (recommend 1-based, matching the majority) and apply it to
`cases` too, or leave a short comment explaining why `cases` differs.

### IN-03: `SERVICE_ICONS` is a private, unexported literal tuple

**File:** `src/content.config.ts:6`
**Issue:** `const SERVICE_ICONS = ['sites', 'sistemas', 'solucoes-web', 'automacoes'] as const;`
is defined and used only to validate the `icon` field in the `services` schema. If any
future UI component needs to map an `icon` string to an actual icon/SVG component (which is
the obvious next step for a "services" section), it will need its own literal list of the
same four strings, with no shared source of truth and no compile-time guarantee the two
lists stay in sync.
**Fix:** Export `SERVICE_ICONS` (and/or a derived `ServiceIcon` type) from
`content.config.ts` or move it next to `project-types.ts` so icon-consuming components can
import the same literal list instead of re-declaring it.

---

_Reviewed: 2026-09-15T18:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
