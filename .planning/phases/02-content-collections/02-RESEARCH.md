# Phase 2: Content Collections - Research

**Researched:** 2026-09-10
**Domain:** Astro 7 Content Layer (build-time typed content, Zod v4 schemas, `glob()` loader, `image()` helper)
**Confidence:** HIGH (API mechanics verified against the installed `node_modules/astro@7.3.1` source; a few path-resolution details are MEDIUM — docs + training, not executed)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `services`, `process`, `differentiators`, `faq` use **one file per entry**
  (`src/content/<collection>/<slug>.yaml`) via Astro's `glob()` loader — consistent with
  `cases` (one Markdown file per case). Not a single array data file.
- **D-02:** Display order is an **explicit required `order` field** (integer) in each Zod
  schema. The consuming section sorts by `order`. Order does not depend on filename.
  `pnpm build` fails if `order` is missing.
- **D-03:** The per-service SVG icon is referenced by an **`icon` key typed as a named enum**
  in the `services` schema (e.g. `icon: sistemas`). The actual SVG markup lives in the Phase 3
  component, which maps icon name → SVG. The build validates `icon` against the allowed
  icon-name list.
- **D-04:** Canonical enum = **the 5 form options** from the design's `<select>` (keeps
  "Ainda não sei"). The `services` collection stays **decoupled** from this enum: it keeps its
  own 4 editorial items and does not need a 1:1 mapping to the enum.
- **D-05:** The enum lives in **a single TypeScript module under `src/content/`**
  (e.g. `src/content/project-types.ts`) exporting an `as const` array of `{ value, label }`
  objects. Phase 2 schemas build their `z.enum(...)` from the `value`s; Phase 5 imports the
  *same* array for the `<select>` options and for server-side validation. No runtime
  collection load required for the form.
- **D-06:** Confirmed slug values → pt-BR labels:
  - `site-institucional` → "Site institucional"
  - `sistema-sob-medida` → "Sistema web sob medida"
  - `ecommerce-plataforma` → "E-commerce ou plataforma"
  - `automacao` → "Automação de processo"
  - `nao-sei` → "Ainda não sei"
- **D-07:** v1 ships **one case**: the Dmarques site itself, honestly labeled
  **"projeto próprio"**, with real metrics as the result. No fictional demo in v1.
- **D-08:** Commit a **branded placeholder image now** at the correct aspect ratio under
  `src/content/cases/`, and keep **`cover` REQUIRED** in the schema (`image()`, not
  `.optional()`). Swapping in the real screenshot is a post-Phase-3 item.
- **D-09:** Case structure = **three frontmatter string fields**: `problema`, `solucao`,
  `resultado`, each Zod-validated for presence and sensible min/max length. An **optional**
  free Markdown body carries extra detail.
- **D-10:** Services / process / differentiators / FAQ text is transcribed **verbatim from
  the design file** — no editorial changes in this phase. No new FAQ questions added in v1.
- **D-11:** FAQ `pergunta` and `resposta` are stored as **plain-text strings, no Markdown**.
- **D-12:** Only the 5 ROADMAP-named collections are created. Hero, Felipe's bio, contact
  block, footer are **single-use prose written directly in `.astro` in Phase 3** — not
  collections.
- **D-13 (from Phase 1 D-04):** **Zero comments in any version-controlled file** — including
  YAML content files, the Zod schema/config file, and the `project-types.ts` module.

### Claude's Discretion

- Exact collection config mechanism for Astro 7 (`src/content.config.ts` vs
  `src/content/config.ts`), and `glob()` / `file()` loader wiring.
- Exact slug strings for each entry file, the `order` numbering, and the icon-name enum
  values — follow the design's labels.
- Precise Zod min/max lengths for text fields, and whether headings/short-labels get their
  own fields vs. one `titulo` + `descricao`.
- The concrete copy of the Dmarques-site case's `problema` / `solucao` / `resultado` — draft
  from PROJECT.md Core Value + Phase 1 metrics; surface the draft to Felipe during execution.
- Format, dimensions, and art of the placeholder cover image (branded, correct aspect ratio,
  `< 300 KB`, processed by `astro:assets`).
- Whether a light "content index" barrel/helper is added for Phase 3/6 consumers.

### Deferred Ideas (OUT OF SCOPE)

- Real screenshot for the Dmarques-site case cover (post-Phase-3).
- A fictional "demo" case.
- Extra FAQ questions ("Atende fora de Ibitinga?", "Quais tecnologias?").
- `sobre` / `founder` data collection.
- `resultado` as structured `{label, valor}` metric list.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONTENT-01 | Serviços, processo, diferenciais e FAQ em Astro Content Collections (YAML), validado por schema Zod no build | `glob()` loader over one YAML file per entry + `z.strictObject(...)` schema in `src/content.config.ts`; validation runs during `astro sync` (part of `astro check` and `pnpm build`). Pattern + code example below. |
| CONTENT-02 | Cases de portfólio em Content Collection (Markdown) com capa via helper `image()`, estrutura problema → solução → resultado | `glob()` loader over `**/*.md`; schema-as-function `({ image }) => z.strictObject({ cover: image(), problema, solucao, resultado, ... })`; body rendered later via `render(entry)`. Image co-located in `src/content/cases/`, referenced as `./file.webp`. |
| CONTENT-03 | 1–2 entradas de case reais ou honestamente rotuladas publicadas na v1 | D-07: exactly one entry, `rotulo: "projeto próprio"`. Placeholder cover committed now (D-08). |
| CONTENT-04 | FAQ é fonte única — mesmo conteúdo alimenta seção visível e JSON-LD `FAQPage` | `faq` collection stores plain-text `pergunta`/`resposta` (D-11) → serializes directly to `FAQPage` JSON-LD (Phase 6) with no strip/convert step. `getCollection('faq')` is the single read path for both consumers. |
| CONTENT-05 | O enum "tipo de projeto" do conteúdo é a mesma allow-list usada na validação do formulário | Single module `src/content/project-types.ts` exports `PROJECT_TYPE_VALUES` (`as const` tuple) + `PROJECT_TYPES` (`{value,label}` list). Schemas call `z.enum(PROJECT_TYPE_VALUES)`; Phase 5 imports the same tuple. No collection load for the form. |
</phase_requirements>

## Summary

Phase 2 is a pure build-time content-modeling phase. Everything it needs already ships inside
`astro@7.3.1` — **no new dependency is added or justified**. The work is: create
`src/content.config.ts`, author five collections on disk (four YAML, one Markdown), write
strict Zod v4 schemas, and publish one `project-types.ts` module that both the schemas and the
Phase 5 form will import.

The single most important currency fact: **Astro 7 upgraded the bundled Zod to v4**
(`astro@7.3.1` depends on `zod: ^4.5.4`; `astro/zod` and the `z` re-exported by `astro:content`
both resolve to `zod/v4`). Almost every Astro-content tutorial online predates this and shows
Zod 3 idioms. Two concrete consequences: (1) prefer `z.strictObject({...})` over the now
**deprecated** `.strict()` method; (2) `z.enum(myArrayAsConst)` accepts a readonly string
array directly (Zod 4), which is exactly what D-05 needs.

Second currency fact: the `z` re-export from `astro:content` carries a
`// TODO: remove in Astro 8` marker in the installed source
(`node_modules/astro/templates/content/module.mjs`). It works today, but the future-proof
import is `import { z } from 'astro/zod'`.

The legacy `src/content/config.ts` + `type: 'content'` + `entry.render()` API is superseded by
`src/content.config.ts` + `loader:` (the "Content Layer" API) + the standalone
`render(entry)` function. Use the new form throughout.

**Primary recommendation:** One `src/content.config.ts` with five `defineCollection` calls,
each using `glob({ base: './src/content/<name>', pattern: '**/*.yaml' | '**/*.md' })` and a
`z.strictObject(...)` schema (schema-as-function only for `cases`, which needs `image()`).
Derive both the icon enum and the project-type enum from `as const` arrays. Add a thin
`src/content/index.ts` barrel exposing sorted, typed accessors for Phase 3/6. Validation is
`astro check` + `pnpm build` — both already gate CI.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Parse + validate YAML/MD entries against schema | Build-time (Astro Content Layer / `astro sync`) | — | Content Layer runs at sync/build; a schema failure aborts `pnpm build`. No runtime cost. |
| Store the "tipo de projeto" allow-list | Plain TS module (`src/content/project-types.ts`) | Build-time schema + Phase 5 server route | Must be importable by non-Astro code (the form endpoint) without triggering a collection load. |
| Map `icon` name → SVG markup | Phase 3 `.astro` component | Build-time schema (validates the name) | Keeps SVG out of content; schema only guarantees the name is in the allowed set. |
| Expose sorted, typed content to sections | Build-time (`getCollection` + a `src/content/index.ts` barrel) | Phase 3/6 consumers | `getCollection` is unordered; sorting by `order` (D-02) belongs in one shared helper, not in every section. |
| Render case Markdown body | Build-time (`render(entry)` in a Phase 3 `.astro`) | — | Body is optional (D-09); rendered only where the case is displayed. |
| Optimize the case cover image | Build-time (`astro:assets` + Sharp) | — | PERF-05: no runtime image optimization. `image()` feeds the asset pipeline at build. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | `7.3.1` (installed, pinned) | Content Layer: `defineCollection`, `getCollection`, `getEntry`, `render`, `reference` (from `astro:content`); `glob`, `file` (from `astro/loaders`) | Already the project framework. Content Layer is the built-in, first-class content system. [VERIFIED: node_modules/astro/package.json + templates/content/module.mjs] |
| Zod v4 | bundled via `astro` (`zod: ^4.5.4`) | Schema definition + build-time validation | Ships inside `astro:content` / `astro/zod`. No separate install. [VERIFIED: node_modules/astro/package.json dependencies.zod = "^4.5.4"; node_modules/astro/dist/zod.js re-exports `zod/v4`] |
| `astro:assets` + Sharp | Sharp `0.35.x` (bundled with astro) | Build-time processing of the case `cover` referenced by `image()` | Built in; PERF-05 mandates build-time only. [CITED: CLAUDE.md Technology Stack] |

### Supporting

None. No YAML parser, no validation library, no CMS adapter, no image library is added — all
are internal to `astro@7.3.1`.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `glob()` one-file-per-entry (D-01) | `file()` loader over one `services.yaml` array | Fewer files, but D-01 explicitly locks one-file-per-entry for consistency with `cases`. `file()` stays unused. |
| `image()` schema helper for the cover | `z.string()` path + manual `<img>` in Phase 3 | Loses build-time existence check, dimension metadata, and `astro:assets` optimization. D-08 locks `image()`. |
| `src/content.config.ts` | legacy `src/content/config.ts` | Legacy path still resolves in Astro 7 but is the pre-Content-Layer location; new docs use `src/content.config.ts`. Use the current one. |
| Barrel `src/content/index.ts` | Call `getCollection` + sort in every section | Discretionary (CONTEXT). A barrel centralizes the `order` sort (D-02) and the FAQ single-source guarantee (CONTENT-04). Recommended. |

**Installation:**

```bash
# Nothing to install. All APIs are inside astro@7.3.1.
# Sanity check the bundled Zod major:
node -e "import('astro/zod').then(m => console.log('zod', m.z?.core?.version ?? 'v4 (zod/v4)'))"
```

**Version verification (performed this session):**

- `astro` — `7.3.1`, present in `node_modules` and pinned in `package.json`. [VERIFIED: local]
- bundled `zod` — `astro@7.3.1` → `dependencies.zod: "^4.5.4"`; `node_modules/astro/dist/zod.js`
  is `export * from "zod/v4"`. [VERIFIED: local source]
- `astro/loaders` exports exactly `{ glob, file }`. [VERIFIED:
  node_modules/astro/dist/content/loaders/index.d.ts]
- `astro:content` virtual module exports `defineCollection`, `getCollection`, `getEntry`,
  `render`, `getEntries`, `reference`, and (deprecated) `z`. [VERIFIED:
  node_modules/astro/templates/content/module.mjs]

## Package Legitimacy Audit

**Not applicable — Phase 2 installs zero external packages.** Every API used
(`defineCollection`, `glob`, `file`, `z`, `image()`, `getCollection`, `render`, `reference`)
is an internal export of the already-installed, already-audited `astro@7.3.1`. The bundled
`zod@^4.5.4` is a transitive dependency of `astro` that was already present and audited when
Phase 1 committed `pnpm-lock.yaml`.

slopcheck / registry verification: N/A (no install). SEC-07 "every added dependency justified"
item is satisfied by "none added".

## Architecture Patterns

### System Architecture Diagram

```
  Author (Felipe / Claude)
        │  writes .yaml / .md on disk
        ▼
  src/content/
   ├── services/*.yaml          ┐
   ├── process/*.yaml           │
   ├── differentiators/*.yaml   │  matched by glob({ base, pattern })
   ├── faq/*.yaml               │
   └── cases/
        ├── dmarques.md         ┘
        └── dmarques-cover.webp   ← referenced as ./dmarques-cover.webp by image()
        │
        ▼
  src/content.config.ts
   defineCollection({ loader: glob(...), schema: z.strictObject(...) })
   schema pulls: iconEnum (as const)  ┐
                 z.enum(PROJECT_TYPE_VALUES) ─ from src/content/project-types.ts
        │
        ▼
  astro sync  ──►  validates every entry against its schema
        │            │  unknown key / missing field / bad enum  ──►  BUILD FAILS
        │            ▼
        │      .astro/ generated types  (CollectionEntry<'faq'> etc.)
        ▼
  Consumers (later phases, build-time only):
   ├── src/content/index.ts  (barrel: getCollection + sort by order)
   ├── Phase 3 sections      → getCollection('services'|'process'|...), render(caseEntry)
   ├── Phase 6 FAQPage JSON-LD → getCollection('faq')  (same source as visible FAQ)
   └── Phase 5 /api/orcamento → import { PROJECT_TYPE_VALUES } from src/content/project-types
                                (plain module import, NO astro:content load)
```

### Recommended Project Structure

```
src/
├── content.config.ts                 # all 5 defineCollection calls + export const collections
├── content/
│   ├── project-types.ts              # PROJECT_TYPE_VALUES (as const) + PROJECT_TYPES [{value,label}]
│   ├── index.ts                      # optional barrel: getServices(), getFaq(), getCases()... sorted
│   ├── services/
│   │   ├── sites-institucionais.yaml
│   │   ├── sistemas-sob-medida.yaml
│   │   ├── solucoes-web.yaml
│   │   └── automacoes.yaml
│   ├── process/
│   │   ├── 01-diagnostico.yaml
│   │   ├── 02-planejamento-e-design.yaml
│   │   ├── 03-desenvolvimento.yaml
│   │   └── 04-entrega-e-suporte.yaml
│   ├── differentiators/
│   │   ├── atendimento-direto.yaml
│   │   ├── codigo-limpo.yaml
│   │   ├── prazos-realistas.yaml
│   │   └── suporte-pos-entrega.yaml
│   ├── faq/
│   │   ├── prazo-projeto.yaml
│   │   ├── manutencao.yaml
│   │   ├── pagamento.yaml
│   │   └── ainda-nao-sei.yaml
│   └── cases/
│       ├── dmarques.md
│       └── dmarques-cover.webp       # committed placeholder (D-08), co-located
```

Slug strings, `order` numbering, and icon-name values are Claude's discretion (CONTEXT) —
the tree above is a concrete proposal that follows the design labels.

### Pattern 1: `src/content.config.ts` shape (Content Layer API)

**What:** One config file, five collections, `glob()` loader per collection, `z.strictObject`
schema. Schema is a plain object except `cases`, which is a function to receive `image`.
**When to use:** All of Phase 2.
**Example:**

```typescript
// Source: docs.astro.build/en/guides/content-collections + verified against
// node_modules/astro/dist/content/{config,loaders/glob}.d.ts
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PROJECT_TYPE_VALUES } from './content/project-types';

const SERVICE_ICONS = ['sites', 'sistemas', 'solucoes-web', 'automacoes'] as const;

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.yaml' }),
  schema: z.strictObject({
    order: z.number().int().nonnegative(),
    titulo: z.string().min(3).max(60),
    descricao: z.string().min(20).max(180),
    icon: z.enum(SERVICE_ICONS),
    destaque: z.boolean().default(false),
  }),
});

const process = defineCollection({
  loader: glob({ base: './src/content/process', pattern: '**/*.yaml' }),
  schema: z.strictObject({
    order: z.number().int().positive(),
    numero: z.string().regex(/^\d{2}$/),
    titulo: z.string().min(3).max(60),
    descricao: z.string().min(20).max(200),
  }),
});

const differentiators = defineCollection({
  loader: glob({ base: './src/content/differentiators', pattern: '**/*.yaml' }),
  schema: z.strictObject({
    order: z.number().int().positive(),
    titulo: z.string().min(3).max(80),
    descricao: z.string().min(10).max(160),
  }),
});

const faq = defineCollection({
  loader: glob({ base: './src/content/faq', pattern: '**/*.yaml' }),
  schema: z.strictObject({
    order: z.number().int().positive(),
    pergunta: z.string().min(8).max(160),
    resposta: z.string().min(20).max(600),
  }),
});

const cases = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.strictObject({
      titulo: z.string().min(3).max(80),
      rotulo: z.enum(['projeto próprio', 'demo']),
      tipo: z.enum(PROJECT_TYPE_VALUES),
      cover: image(),
      coverAlt: z.string().min(5).max(160),
      problema: z.string().min(40).max(600),
      solucao: z.string().min(40).max(600),
      resultado: z.string().min(40).max(600),
      order: z.number().int().nonnegative().default(0),
    }),
});

export const collections = { services, process, differentiators, faq, cases };
```

Notes:
- `z.strictObject` — a YAML file with a key not in the schema fails `astro sync` → fails
  `pnpm build` and `astro check`. This is the CONTENT-01 "bad key fails the build" mechanism.
  [VERIFIED: Zod v4 `z.strictObject` throws on unknown keys — zod.dev/v4]
- Schema-as-function `({ image }) => ...` is **only** needed where `image()` is used. The
  `cases` schema uses it; the four YAML schemas do not. [VERIFIED:
  node_modules/astro/dist/content/config.d.ts `SchemaContext = { image: ImageFunction }`]
- `import { z } from 'astro/zod'` is used instead of `from 'astro:content'` because the
  installed source marks the `astro:content` `z` re-export `// TODO: remove in Astro 8`.
  Both work in 7.3.1. [VERIFIED: node_modules/astro/templates/content/module.mjs]
- `reference()` is imported but unused in v1 (no cross-collection links yet) — drop it if the
  planner prefers a minimal import; it is the idiomatic tool if a future case links a service.

### Pattern 2: the single "tipo de projeto" module (D-05, CONTENT-05)

**What:** One `as const` tuple of values is the source of truth; the `{value,label}` list is
tied to it with `satisfies` so a typo in either half is a type error. Both the Zod enum and
the Phase 5 `<select>` consume it. No `astro:content` import — safe to load from a serverless
route.
**Example:**

```typescript
// src/content/project-types.ts
export const PROJECT_TYPE_VALUES = [
  'site-institucional',
  'sistema-sob-medida',
  'ecommerce-plataforma',
  'automacao',
  'nao-sei',
] as const;

export type ProjectType = (typeof PROJECT_TYPE_VALUES)[number];

export const PROJECT_TYPES = [
  { value: 'site-institucional', label: 'Site institucional' },
  { value: 'sistema-sob-medida', label: 'Sistema web sob medida' },
  { value: 'ecommerce-plataforma', label: 'E-commerce ou plataforma' },
  { value: 'automacao', label: 'Automação de processo' },
  { value: 'nao-sei', label: 'Ainda não sei' },
] as const satisfies ReadonlyArray<{ value: ProjectType; label: string }>;
```

Then in a schema: `tipo: z.enum(PROJECT_TYPE_VALUES)` (Zod 4 accepts the readonly tuple
directly). In Phase 5: `import { PROJECT_TYPES, PROJECT_TYPE_VALUES } from
'../content/project-types'` for `<option>` rendering and for
`z.enum(PROJECT_TYPE_VALUES)` server-side. [VERIFIED: Zod v4 `z.enum(constArray)` — zod.dev/v4]

**Placement caveat (answers an Open Question in CONTEXT):** putting a `.ts` file at
`src/content/project-types.ts` is safe in Astro 7. Collections are defined explicitly in
`src/content.config.ts`; Astro 7 does **not** implicitly turn every `src/content/`
subdirectory into a collection (that was pre-Astro-5 behavior, now behind `legacy.collections`).
The file is also outside every collection's `base` and matches no `*.yaml` / `*.md` pattern,
so no loader will pick it up. [ASSUMED — behavior consistent with Astro 5+ Content Layer docs;
not executed this session. Low risk: worst case, move to `src/lib/project-types.ts`.]

### Pattern 3: consumption barrel (discretionary, recommended)

**What:** One helper module that does the `order` sort (D-02) once and gives Phase 3/6 typed,
ready-to-map arrays. Keeps CONTENT-04's "single source" literally single.
**Example:**

```typescript
// src/content/index.ts
import { getCollection } from 'astro:content';

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) =>
  a.data.order - b.data.order;

export const getServices = async () => (await getCollection('services')).sort(byOrder);
export const getProcess = async () => (await getCollection('process')).sort(byOrder);
export const getDifferentiators = async () =>
  (await getCollection('differentiators')).sort(byOrder);
export const getFaq = async () => (await getCollection('faq')).sort(byOrder);
export const getCases = async () => getCollection('cases');
```

`getCollection('faq')` here is the one read path feeding both the visible FAQ (Phase 3) and
the `FAQPage` JSON-LD (Phase 6) — CONTENT-04 / SEO-07.

### Pattern 4: rendering the case Markdown body (Phase 3, shown for planning context)

```astro
---
// Source: node_modules/astro/templates/content/module.mjs (render is a named export)
import { getEntry, render } from 'astro:content';
const entry = await getEntry('cases', 'dmarques');
const { Content } = await render(entry);
---
<article>
  <h3>{entry.data.titulo}</h3>
  <p>{entry.data.problema}</p>
  <p>{entry.data.solucao}</p>
  <p>{entry.data.resultado}</p>
  <Content />
</article>
```

`entry.render()` (the method form) is **removed** — use `render(entry)`.

### Anti-Patterns to Avoid

- **`z.object(...).strict()`** — deprecated in Zod v4. Use `z.strictObject(...)`. `.strict()`
  still works in 7.3.1 but will warn / eventually break.
- **`import { z } from 'astro:content'`** — works now, marked for removal in Astro 8. Use
  `astro/zod`.
- **`type: 'content'` / `type: 'data'` in `defineCollection`** — the pre-Content-Layer API.
  With a `loader`, type is inferred; do not set it.
- **Putting the case cover in `public/`** — `image()` requires an importable asset under
  `src/`; `public/` files are copied verbatim and cannot be processed by `astro:assets`
  (breaks PERF-05 intent and the `image()` schema).
- **SVG for the case cover placeholder** — `image()` accepts `svg` as a format, but Sharp
  does not rasterize/optimize SVG; use `.webp` or `.png` so `astro:assets` actually
  processes it and the AVIF/WebP + dimensions requirement (SITE-09, Phase 3) is met.
- **Storing FAQ answers as Markdown** — D-11 locks plain text; Markdown would force a
  strip/convert step before the `FAQPage` JSON-LD (which requires plain text).
- **Sorting by filename** — D-02: sort by the `order` field only.
- **Adding a comment to any YAML / TS file** — D-13.
- **Duplicating the project-type list** in Phase 5 — CONTENT-05 requires the single module.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Load + parse many YAML files into typed objects | A `fs.readdir` + `yaml.parse` + manual typing loop | `glob()` loader in `defineCollection` | Handles discovery, parsing, ID generation, HMR, caching, and type generation. [VERIFIED: astro/loaders] |
| Fail the build on a bad content key | A custom "lint content" script | `z.strictObject` in the schema | Unknown key throws during `astro sync`; already gated by `astro check` + `pnpm build` in CI. |
| Validate the case cover exists + get its dimensions | Manual `fs.existsSync` + image-size lib | `image()` schema helper | Resolves the path relative to the entry, imports it as an `astro:assets` asset, provides `{src,width,height,format}`. |
| Generate TS types for content shapes | Hand-written `interface Service {…}` | Astro's generated `.astro/` types (`CollectionEntry<'services'>`) | Regenerated on every `astro sync`; always matches the schema. |
| Keep the form enum and the schema enum in sync | Two hand-maintained lists | One `as const` tuple + `satisfies` (Pattern 2) | Compile-time guarantee they never drift (CONTENT-05). |
| Sort sections consistently | `order` sort copy-pasted into each `.astro` | One barrel helper (Pattern 3) | Single place to change; matches D-02. |

**Key insight:** Astro's Content Layer already *is* the "typed, build-validated, no-CMS"
solution this phase asks for. Every line of bespoke content-loading code is a line that
duplicates something `astro@7.3.1` does better and keeps in sync with the generated types.

## Runtime State Inventory

Not applicable — Phase 2 is greenfield content creation, not a rename/refactor/migration.
There is no existing `src/content/`, no datastore, no deployed content to migrate. Verified:
`src/` currently holds only `layouts/BaseLayout.astro`, `pages/index.astro`,
`styles/tokens.css`, `styles/base.css` (confirmed via directory listing this session).

## Common Pitfalls

### Pitfall 1: Following a Zod-3-era Astro tutorial

**What goes wrong:** Copy `.strict()`, `invalid_type_error`, `required_error`,
`z.enum(['a','b'])`-only idioms, or `import { z } from 'astro:content'` from a 2023–2025
tutorial; subtle deprecation warnings, or behavior differences in error messages and coercion.
**Why it happens:** Astro 7 (2026) is the first major to bundle Zod 4; the docs corpus lags.
**How to avoid:** Use `z.strictObject`, `error:` (not `message:`/`invalid_type_error`),
`z.enum(constArray)`, `import { z } from 'astro/zod'`. Cross-check any schema idiom against
zod.dev/v4, not older blog posts.
**Warning signs:** `astro check` prints deprecation notices; `z.coerce.*` field behaves
differently on a missing key (Zod 4: missing key on a `z.coerce` field now errors unless
`.default()` is set).

### Pitfall 2: `image()` used without the schema-as-function form

**What goes wrong:** `schema: z.strictObject({ cover: image() })` — `image` is undefined,
`ReferenceError` at config load.
**Why it happens:** `image` is only provided when the schema is a function:
`schema: ({ image }) => z.strictObject({ cover: image() })`.
**How to avoid:** Only the `cases` collection needs the function form. Keep the four YAML
schemas as plain objects.
**Warning signs:** Build error referencing `image` in `content.config.ts`.

### Pitfall 3: cover image path not resolving

**What goes wrong:** `cover: /images/x.webp` or `cover: dmarques-cover.webp` (no `./`) fails
with "image not found".
**Why it happens:** `image()` resolves the string **relative to the entry file** and needs a
relative path (`./dmarques-cover.webp` for a co-located file, or `../_assets/x.webp`).
Absolute-looking paths and `public/` paths are not importable assets.
**How to avoid:** Co-locate `dmarques-cover.webp` next to `dmarques.md` in
`src/content/cases/` and write `cover: ./dmarques-cover.webp`. [MEDIUM confidence on exact
resolution semantics with the `glob()` loader — documented for the Content Layer, not
executed this session.]
**Warning signs:** `pnpm build` error "Could not find requested image".

### Pitfall 4: placeholder cover blows the 300 KB / PERF budget

**What goes wrong:** A 4000 px PNG placeholder ships as a multi-MB source asset; even after
`astro:assets` the source is committed and bloats the repo, and a poorly sized export can
exceed the `< 300 KB` guidance (SEO-03 uses 1200×630 < 300 KB as the house rule).
**Why it happens:** "Branded placeholder" gets exported at print resolution.
**How to avoid:** Export the placeholder at display size — propose **1600×1000 (16:10)** or
**1200×750**, `.webp`, quality ~80, target **< 150 KB**. `astro:assets` will still emit
responsive AVIF/WebP from it in Phase 3.
**Warning signs:** `git add` shows a >500 KB image; Lighthouse "Properly size images" flags
the case card in Phase 3.

### Pitfall 5: `astro check` passes but `pnpm build` wasn't run

**What goes wrong:** Schema validation of *content* happens during `astro sync` (which
`astro check` triggers via the `check` script: `astro sync && astro check`) — but a
contributor running only `tsc`/Biome sees green.
**Why it happens:** Content validation is a sync/build step, not a lint step.
**How to avoid:** The phase's "done" check is `pnpm run check` **and** `pnpm build` locally;
CI already runs both. Add a deliberate negative check (below) once.
**Warning signs:** none locally — CI would catch it, but that wastes a round-trip.

### Pitfall 6: empty collection directory

**What goes wrong:** A `glob()` collection whose directory has zero matching files can emit a
"collection does not exist" / "no entries" warning and `getCollection` returns `[]`,
surfacing only in Phase 3.
**Why it happens:** Authoring the config before the YAML files exist.
**How to avoid:** Land at least one real entry per collection in the same plan/wave as the
schema. All four YAML collections have 4 design-sourced entries; `cases` has 1.
**Warning signs:** `astro sync` warns "The collection X does not have any entries".

### Pitfall 7: `id` collisions / unexpected slugs

**What goes wrong:** Two files produce the same entry `id`, or the `id` isn't what Phase 6
expects for anchors/links.
**Why it happens:** `glob()` derives `id` from the file path (slugified, sans extension).
`process/01-diagnostico.yaml` → `id` `01-diagnostico`.
**How to avoid:** Pick deliberate filenames; rely on the `order` field (D-02) for ordering,
not the `id`. If a clean `id` matters, name the file cleanly rather than post-processing.
**Warning signs:** `astro sync` error "Duplicate id".

## Code Examples

### Example content entries (verbatim from the design file, D-10)

```yaml
# src/content/services/sites-institucionais.yaml   (no comments in the real file — D-13)
order: 1
titulo: Sites institucionais
descricao: Presença digital rápida, responsiva e pronta para ser encontrada no Google.
icon: sites
```

```yaml
# src/content/process/01-diagnostico.yaml
order: 1
numero: "01"
titulo: Diagnóstico
descricao: Entendemos o problema, o processo atual e o que precisa existir.
```

```yaml
# src/content/faq/prazo-projeto.yaml
order: 1
pergunta: Quanto tempo leva um projeto?
resposta: >-
  Site institucional fica pronto em 2 a 3 semanas. Sistemas sob medida variam com o
  escopo — o prazo sai fechado na proposta, depois do diagnóstico.
```

```markdown
<!-- src/content/cases/dmarques.md  (no HTML comment in the real file — D-13) -->
---
titulo: O site da própria Dmarques
rotulo: projeto próprio
tipo: site-institucional
cover: ./dmarques-cover.webp
coverAlt: Prévia da landing page da Dmarques em fundo escuro com detalhe roxo
problema: >-
  Uma agência nova precisa provar competência técnica antes do primeiro cliente,
  num site que carregue rápido e não saia do ar.
solucao: >-
  Landing one-page em Astro, 100% estática e imutável na CDN da Vercel, com uma
  única função serverless para o formulário e CSP estrita.
resultado: >-
  Lighthouse mobile ≥95 em Performance, Acessibilidade, Best Practices e SEO;
  LCP ~1,5 s, CLS 0, TBT 0 ms; analytics sem cookies; zero dependência de terceiros.
order: 0
---
```

The `problema`/`solucao`/`resultado` copy above is a **draft** to be surfaced to Felipe
during execution (CONTEXT discretion item).

### The four design-sourced FAQ pairs (D-10, plain text — D-11)

1. **Quanto tempo leva um projeto?** — "Site institucional fica pronto em 2 a 3 semanas.
   Sistemas sob medida variam com o escopo — o prazo sai fechado na proposta, depois do
   diagnóstico."
2. **Vocês fazem manutenção depois?** — "Sim. Todo projeto sai com período de acompanhamento
   incluído, e você pode seguir num plano mensal de manutenção e melhorias."
3. **Como funciona o pagamento?** — "Dividido por etapas: uma parte na aprovação do escopo, o
   restante na entrega. Nada é cobrado antes de você aprovar o plano."
4. **E se eu ainda não sei o que preciso?** — "Acontece sempre. O diagnóstico existe para
   isso: mapeamos o processo e mostramos o caminho mais simples antes de qualquer orçamento."

### Design-sourced copy tables

Services (design lines ~197–234):

| order | titulo | descricao |
|---|---|---|
| 1 | Sites institucionais | Presença digital rápida, responsiva e pronta para ser encontrada no Google. |
| 2 | Sistemas web sob medida | Painéis, cadastros e ferramentas internas desenhados para o seu processo. |
| 3 | Soluções web | E-commerce, plataformas e integrações que sustentam a operação inteira. |
| 4 | Automações | Rotinas manuais viram fluxos automáticos, com registro e menos erro humano. |

Process (design lines ~236–274):

| order | numero | titulo | descricao |
|---|---|---|---|
| 1 | 01 | Diagnóstico | Entendemos o problema, o processo atual e o que precisa existir. |
| 2 | 02 | Planejamento e design | Escopo, prazo e telas aprovados antes de escrever a primeira linha de código. |
| 3 | 03 | Desenvolvimento | Construção em etapas visíveis, com espaço para ajuste durante o caminho. |
| 4 | 04 | Entrega e suporte | Publicação, treinamento e acompanhamento depois que o projeto entra no ar. |

Differentiators (design lines ~276–306):

| order | titulo | descricao |
|---|---|---|
| 1 | Atendimento direto, sem intermediários | Você fala com quem desenvolve, do orçamento ao suporte. |
| 2 | Código limpo e documentado | Seu projeto continua evoluindo com qualquer equipe depois. |
| 3 | Prazos realistas e cumpridos | Só prometemos data que cabe no cronograma. |
| 4 | Suporte pós-entrega | Acompanhamento ativo nas primeiras semanas de uso. |

"Tipo de projeto" `<select>` (design lines ~376–382): Site institucional · Sistema web sob
medida · E-commerce ou plataforma · Automação de processo · Ainda não sei → mapped to slugs
by D-06.

### Negative test (run once, proves CONTENT-01 criterion)

```bash
# Temporarily add a bogus key to one YAML entry, confirm the build rejects it.
printf '\nbogus_key: true\n' >> src/content/faq/prazo-projeto.yaml
pnpm build   # expect: non-zero exit, "Unrecognized key(s) in object: 'bogus_key'"
git checkout -- src/content/faq/prazo-projeto.yaml
```

## State of the Art

| Old Approach | Current Approach (Astro 7.3.1) | When Changed | Impact |
|--------------|-------------------------------|--------------|--------|
| `src/content/config.ts` | `src/content.config.ts` | Astro 5 (Content Layer) | Config lives at `src/` root; old path still resolves but is legacy. |
| `defineCollection({ type: 'content' \| 'data', schema })` | `defineCollection({ loader: glob()/file(), schema })` | Astro 5 | `type` is inferred from the loader; folders are no longer implicit collections. |
| `entry.render()` method | `import { render } from 'astro:content'; render(entry)` | Astro 5 | Method removed; standalone function. |
| `entry.slug` | `entry.id` (slug-style id from the loader) | Astro 5 | `getEntryBySlug` / `getDataEntryById` are deprecated stubs. |
| Zod 3 bundled in `astro:content` | **Zod 4** (`zod/v4`), `astro@7.3.1` → `zod: ^4.5.4` | Astro 7 (2026) | `z.strictObject` over `.strict()`; `error:` over `message:`; `z.enum(constArray)` supported; `z.coerce` missing-key now errors. |
| `import { z } from 'astro:content'` | `import { z } from 'astro/zod'` | deprecation live in 7.3.1 | Source marks the `astro:content` `z` re-export `// TODO: remove in Astro 8`. |
| `image()` always available in schema | `image()` only in schema-as-function `({ image }) => …` | Astro 3+ (unchanged, still a gotcha) | Keep non-image schemas as plain objects. |

**Deprecated/outdated — do not use:**
- `.strict()` / `.strip()` / `.passthrough()` methods (Zod 4 deprecates in favor of
  `z.strictObject` / `z.object` / `z.looseObject`).
- `invalid_type_error`, `required_error`, `message` param (Zod 4 → unified `error`).
- `type: 'content'` / `type: 'data'`, `entry.render()`, `getEntryBySlug`, `getDataEntryById`.
- `legacy.collections` behavior (implicit `src/content/*` collections) — off by default.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A `.ts` module at `src/content/project-types.ts` is not picked up as a collection by Astro 7 (no implicit directory scan with Content Layer). | Pattern 2 | Low. If wrong, `astro sync` errors on an unparseable "collection"; fix by moving the file to `src/lib/`. Locked path is D-05 ("under `src/content/`"), so verify early in the plan. |
| A2 | `image()` with the `glob()` loader resolves a `./file` path relative to the Markdown entry's own directory. | Pattern 1 / Pitfall 3 | Low–Med. Documented for Content Layer; not executed here. If the resolution base differs, adjust the `cover:` path or move the asset; no schema change. |
| A3 | An unknown YAML key under `z.strictObject` aborts `pnpm build` (not just a warning). | Pattern 1 / CONTENT-01 | Low. Zod `strictObject` throws; Astro surfaces content-schema throws as build errors. The one-time negative test in Code Examples confirms it during execution. |
| A4 | `.webp` placeholder source under `src/content/cases/` is processed by `astro:assets`/Sharp at build with no runtime component (PERF-05 safe). | Pitfall 4 | Low. Standard `astro:assets` behavior; the actual `<Image>` wiring is Phase 3, so any surprise surfaces there. |
| A5 | `astro check` (project script = `astro sync && astro check`) plus `pnpm build` in CI is sufficient automated validation for this phase; no test framework needed. | Validation Architecture | Low. If the team later wants a unit-level guard, add the negative-test shell snippet to `scripts/`. |

## Open Questions (RESOLVED)

1. **Field granularity for `services` / `differentiators`** — one `titulo` + `descricao`
   pair (proposed) vs. splitting out a short label / eyebrow.
   - What we know: the design has exactly a heading + one sentence per card; CONTEXT leaves
     precise fields to discretion.
   - Recommendation: ship `titulo` + `descricao` only; add fields later (cheap YAML edit).
   - **RESOLVED:** `titulo` + `descricao` only, no eyebrow/short-label field — see 02-01-PLAN.md
     Task 3 (schema fields) and Task 2 (`&lt;content_source&gt;` copy tables).

2. **`cases.tipo` — include it at all in v1?** The schema example adds `tipo:
   z.enum(PROJECT_TYPE_VALUES)` to exercise CONTENT-05's "defined once, reused" from both
   ends. D-04 says `services` stays decoupled from the enum, but says nothing about `cases`.
   - What we know: only one case in v1 (`site-institucional`); it is harmless and demonstrates
     the shared enum.
   - Recommendation: keep `tipo` on `cases` (cheap, proves reuse). Drop if Felipe/planner
     see it as scope creep — CONTENT-05 is still satisfied by the schema-side
     `z.enum(PROJECT_TYPE_VALUES)` import alone.
   - **RESOLVED:** kept — see 02-02-PLAN.md Task 2 (`tipo: z.enum(PROJECT_TYPE_VALUES)` in the
     `cases` schema, `tipo: site-institucional` in the entry).

3. **Placeholder cover art** — dimensions/format are discretionary. Proposed 1600×1000 `.webp`
   < 150 KB, branded (dark `#0A0A12` bg, `#6C4CFF` accent, "D" mark). Needs Felipe's eye
   during execution, and a `coverAlt` string.
   - **RESOLVED:** proposal adopted as specified — see 02-02-PLAN.md Task 1 (generation spec)
     and 02-04-PLAN.md Task 1 (Felipe's approval checkpoint for the art and `coverAlt`).

4. **Barrel (`src/content/index.ts`) — adopt?** Recommended (Pattern 3) for the `order` sort
   and the literal single-source of `faq`. Discretionary per CONTEXT.
   - **RESOLVED:** adopted — see 02-02-PLAN.md Task 3 (`getServices`/`getProcess`/
     `getDifferentiators`/`getFaq`/`getCases` accessors, `byOrder` comparator).

## Environment Availability

Skipped — Phase 2 has no external runtime dependencies. All tooling
(`astro`, `pnpm`, Node ≥22.12, Sharp) is installed and exercised by Phase 1's passing CI.
No database, service, or CLI is introduced.

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — section included.
> This project has **no unit-test framework** (no vitest/jest/`tests/` — confirmed this
> session) and Phase 2 should not add one (no-new-deps grain, CLAUDE.md). The build itself is
> the validator: Zod schemas + `astro sync` turn every requirement into a build-time assertion.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None (no vitest/jest). Validation = `astro sync` schema check + `astro check` + `pnpm build`. |
| Config file | none — see Wave 0 |
| Quick run command | `pnpm run check` (`astro sync && astro check`) |
| Full suite command | `pnpm build` (runs sync + full static build; CI also runs `pnpm audit`, `scripts/security-check.sh --ci`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONTENT-01 | 4 YAML collections load; strict schema; missing/extra key fails build | build assertion | `pnpm build` (and the one-time negative test in Code Examples) | ❌ Wave 0 (`src/content.config.ts` + entries) |
| CONTENT-01 | Types generated & typecheck clean | static check | `pnpm run check` | ❌ Wave 0 |
| CONTENT-02 | `cases` Markdown loads; `image()` cover resolves; problema/solucao/resultado required | build assertion | `pnpm build` | ❌ Wave 0 (`src/content/cases/dmarques.md` + `.webp`) |
| CONTENT-03 | Exactly one honestly-labeled case published (`rotulo` enum) | build assertion + grep | `pnpm build`; `grep -rl 'rotulo:' src/content/cases` | ❌ Wave 0 |
| CONTENT-04 | `faq` is the sole source; plain-text; consumable by JSON-LD later | build assertion | `pnpm build`; `getCollection('faq')` compiles in a throwaway/consumer | ❌ Wave 0 (`src/content/faq/*.yaml` + barrel) |
| CONTENT-05 | `project-types.ts` is the single enum; schema `z.enum` + Phase 5 import same tuple; no `astro:content` import in the module | static check + grep | `pnpm run check`; `grep -L "astro:content" src/content/project-types.ts` | ❌ Wave 0 (`src/content/project-types.ts`) |
| SEC-07 | No new inline surface, `pnpm audit` clean, no new dep | script | `bash scripts/security-check.sh --ci` | ✅ (`scripts/security-check.sh` from Phase 1) |

### Sampling Rate

- **Per task commit:** `pnpm run check` (fast; catches schema/type breakage).
- **Per wave merge:** `pnpm build` + `bash scripts/security-check.sh --ci`.
- **Phase gate:** `pnpm build` green, `astro check` 0 errors, `scripts/security-check.sh --ci`
  PASS, SEC-07 run file for phase-02 has no open High, before `/gsd:verify-work`.

### Wave 0 Gaps

- [ ] `src/content.config.ts` — the five `defineCollection` calls (covers CONTENT-01/02).
- [ ] `src/content/project-types.ts` — shared enum module (covers CONTENT-05).
- [ ] `src/content/services/*.yaml` ×4, `process/*.yaml` ×4, `differentiators/*.yaml` ×4,
      `faq/*.yaml` ×4 — design-verbatim entries (covers CONTENT-01/04).
- [ ] `src/content/cases/dmarques.md` + `src/content/cases/dmarques-cover.webp` placeholder
      (covers CONTENT-02/03).
- [ ] `src/content/index.ts` — optional barrel with the `order` sort (covers CONTENT-04
      single-source cleanliness).
- [ ] One-time negative test (add bogus key → `pnpm build` fails → revert) recorded in the
      phase SUMMARY as evidence for CONTENT-01 success criterion 1.
- [ ] No test-framework install — intentional; validation is `astro check` + `pnpm build`
      (already CI-gated).

## Security Domain

> `security_enforcement` is not set to `false` in config → treated as enabled. Phase 2's own
> success criterion 4 is a SEC-07 run with no open High. This phase adds **no** dependency,
> **no** inline `<script>`/`<style>`, **no** `style="` attribute, **no** secret, **no**
> serverless function, and **no** third-party asset — the mechanical SEC-07 surface is
> unchanged from Phase 1.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Encoding/Sanitization | partial (deferred to Phase 3/6 render) | Content is plain text/Markdown authored in-repo by the maintainer; no user input. Phase 3 must HTML-escape when rendering `problema/solucao/resultado`, and Phase 6 must JSON-encode `faq` strings into the `FAQPage` script. Not a Phase 2 control, but flagged for downstream. |
| V5 Validation | yes | `z.strictObject` schemas — build fails on malformed/unknown content. This is the phase's core control. |
| V14 Config / Build | yes | No new dep (supply-chain surface unchanged); `pnpm audit` stays clean; `pnpm-lock.yaml` unchanged except lockfile-neutral. `scripts/security-check.sh` check 1 + judgement item "every new dependency justified" → answer "none added". |
| V2 Auth / V3 Session / V4 Access Control / V6 Crypto | no | No auth, session, endpoint, or crypto in this phase. |

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed/typo'd content silently shipping (wrong key, missing field) | Tampering / Denial (broken section) | `z.strictObject` — hard build failure; CI blocks merge. |
| Stored-XSS latent in content, exploded at render time (Phase 3/6) | Tampering | Phase 2 keeps FAQ as plain text (D-11) and case fields as plain strings so downstream escaping is trivial and total; no Markdown/HTML in the JSON-LD-bound fields. Note carried to Phase 3/6. |
| Supply-chain: a new transitive dep entering via a content/loader lib | Tampering / Elevation | None added — Content Layer is internal to `astro@7.3.1`. SEC-07 judgement item answered "none". |
| Secret leakage via a content file | Info Disclosure | Content is public copy only; `scripts/security-check.sh` check 4 scans `dist/` for secret names + `re_…` and must stay empty. |
| `image()` pulling a remote/untrusted image | Tampering | Cover is a committed local `.webp` under `src/`; no remote image domains configured. |

### SEC-07 phase-02 run (what the plan must produce)

`.planning/security/runs/phase-02.md` — attach `bash scripts/security-check.sh --ci` output
(expect checks 1–5 PASS/*as-Phase-1*, check 6 baseline, check 7 = Lighthouse gate via CI),
answer the four judgement items (dependency justified? → **none added**; third-party asset? →
**none**; new secret? → **none**; minor findings owned? → n/a), and record findings as
`P02-00x` with none left High/Open.

## Sources

### Primary (HIGH confidence)

- **Installed source** `node_modules/astro@7.3.1`:
  - `package.json` → `dependencies.zod: "^4.5.4"`, `tinyglobby: "^0.2.15"`.
  - `dist/zod.js` / `dist/zod.d.ts` → `export * from "zod/v4"`.
  - `dist/content/config.d.ts` → `defineCollection` signature, `SchemaContext = { image }`,
    `ImageFunction` returning `z.ZodObject<{src,width,height,format}>`, `zod/v4` type imports.
  - `dist/content/loaders/{index,glob,file}.d.ts` → `glob({ pattern, base, generateId,
    retainBody, deferRender })`, `file(fileName, { parser })`.
  - `templates/content/module.mjs` → `astro:content` exports (`defineCollection`,
    `getCollection`, `getEntry`, `render`, `getEntries`, `reference`), and
    `export { z } from 'astro/zod'` marked `// TODO: remove in Astro 8`.
  - `dist/content/runtime.js` → `import * as z from "zod/v4"`.
- **docs.astro.build/en/guides/content-collections/** — config file at `src/content.config.ts`;
  `glob()`/`file()` loader examples; `getCollection`/`getEntry`; `reference()`; "Zod 4"
  via `astro/zod`. (fetched 2026-09-10)
- **docs.astro.build/en/guides/images/#images-in-content-collections** — `schema: ({ image })
  => z.object({ cover: image() })`; `cover: "./file.jpeg"` resolves relative to the entry
  folder. (fetched 2026-09-10)
- **zod.dev/v4 (changelog + api)** — `.strict()` deprecated → `z.strictObject()`;
  `z.enum(constArray)` supported; unified `error` param; `z.coerce` missing-key now errors.
  (fetched 2026-09-10)

### Secondary (MEDIUM confidence)

- CLAUDE.md § Technology Stack — Astro 7.3.x prescriptive stack, `astro:assets` + Sharp
  build-time only, "no new dependency expected for schemas, `z` ships in `astro:content`".
- `arquivos de design/Dmarques Landing.dc.html` lines ~197–430 — verbatim copy source for
  services / process / differentiators / FAQ / the `<select>`.

### Tertiary (LOW confidence)

- Training knowledge of Content Layer `image()` path-resolution nuances with the `glob()`
  loader (A2) — consistent across Astro 5–7 docs but not executed this session.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every API verified against the installed `astro@7.3.1` source; zero
  new packages to vet.
- Architecture / patterns: HIGH for config shape, loader wiring, enum module, `render()`,
  strict-schema build failure; MEDIUM for `image()` path resolution under `glob()` (A2) and
  the `src/content/*.ts` non-collection assumption (A1).
- Pitfalls: HIGH — driven by the verified Zod 3→4 shift and the deprecation markers in source.
- Security: HIGH — phase adds no dependency/inline/secret/function; SEC-07 surface unchanged.

**Research date:** 2026-09-10
**Valid until:** 2026-10-10 (stable; re-check if `astro` minor bumps past 7.3.x or Astro 8
enters beta — the `z`-from-`astro:content` removal lands in 8).
