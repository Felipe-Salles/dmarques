# Phase 2: Content Collections - Context

**Gathered:** 2026-09-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 moves all *structured, repeated* site copy out of markup and into typed
Astro Content Collections validated by Zod at build time. No CMS, no admin
surface. A bad key or missing field must fail `pnpm build`.

**In scope (CONTENT-01..05):**
- Five collections authored on disk:
  - `services`, `process`, `differentiators`, `faq` — YAML, one file per entry,
    strict Zod schemas (`.strict()` — unknown key fails the build).
  - `cases` — Markdown, `image()` cover, `problema`/`solucao`/`resultado`
    frontmatter structure.
- A single canonical "tipo de projeto" enum, defined once and consumed by both
  the Phase 2 schemas and the Phase 5 quote form.
- `faq` authored so it is the single source that later feeds *both* the visible
  FAQ section (Phase 3) and the `FAQPage` JSON-LD (Phase 6).
- Content transcribed verbatim from the design file
  (`arquivos de design/Dmarques Landing.dc.html`): 4 services, 4 process steps,
  4 differentiators, 4 FAQ pairs.
- One `cases` entry published: the Dmarques site itself, labeled
  "projeto próprio".
- SEC-07 checklist run for the phase passes (no new inline surface, `pnpm audit`
  clean, any new dependency justified — none expected; `z` ships in
  `astro:content`).

**Not in scope:**
- Rendering any of the 9 sections (Phase 3).
- The `FAQPage` / `LocalBusiness` JSON-LD output itself (Phase 6).
- The form endpoint, server-side validation code, or `<select>` markup (Phase 5)
  — Phase 2 only publishes the enum they will import.
- One-off prose that is not a repeated list — hero, "Sobre / Quem faz" (Felipe's
  bio), the contact block, and the footer stay as Phase 3 `.astro` markup, not
  collections.
- Swapping the case placeholder cover for a real site screenshot (deferred —
  see below).

</domain>

<decisions>
## Implementation Decisions

### Collection shape & ordering
- **D-01:** `services`, `process`, `differentiators`, `faq` use **one file per
  entry** (`src/content/<collection>/<slug>.yaml`) via Astro's `glob()` loader —
  consistent with `cases` (one Markdown file per case). Not a single array data
  file.
- **D-02:** Display order is an **explicit required `order` field** (integer) in
  each Zod schema. The consuming section sorts by `order`. Order does not depend
  on filename. `pnpm build` fails if `order` is missing.
- **D-03:** The per-service SVG icon is referenced by an **`icon` key typed as a
  named enum** in the `services` schema (e.g. `icon: sistemas`). The actual SVG
  markup lives in the Phase 3 component, which maps icon name → SVG. The build
  validates `icon` against the allowed icon-name list.

### "Tipo de projeto" enum (CONTENT-05)
- **D-04:** Canonical enum = **the 5 form options** from the design's `<select>`
  (keeps "Ainda não sei" — valuable for capturing an undecided lead). The
  `services` collection stays **decoupled** from this enum: it keeps its own 4
  editorial items and does not need a 1:1 mapping to the enum.
- **D-05:** The enum lives in **a single TypeScript module under `src/content/`**
  (e.g. `src/content/project-types.ts`) exporting an `as const` array of
  `{ value, label }` objects. Phase 2 schemas build their `z.enum(...)` from the
  `value`s; Phase 5 imports the *same* array for the `<select>` options and for
  server-side validation. No runtime collection load required for the form.
- **D-06:** Confirmed slug values → pt-BR labels:
  - `site-institucional` → "Site institucional"
  - `sistema-sob-medida` → "Sistema web sob medida"
  - `ecommerce-plataforma` → "E-commerce ou plataforma"
  - `automacao` → "Automação de processo"
  - `nao-sei` → "Ainda não sei"

### Portfolio cases (CONTENT-02, CONTENT-03)
- **D-07:** v1 ships **one case**: the Dmarques site itself, honestly labeled
  **"projeto próprio"**, with real metrics as the result (Lighthouse score, zero
  cookies, 100% static). No fictional demo in v1.
- **D-08:** The real site screenshot will not exist until Phase 3+, but `image()`
  needs the file at build. So: **commit a branded placeholder image now** at the
  correct aspect ratio under `src/content/cases/`, and keep **`cover` REQUIRED**
  in the schema (`image()`, not `.optional()`). Swapping in the real screenshot
  is a post-Phase-3 item.
- **D-09:** Case structure = **three frontmatter string fields**: `problema`,
  `solucao`, `resultado`, each Zod-validated for presence and sensible
  min/max length. An **optional** free Markdown body carries extra detail. Phase 3
  renders the three blocks consistently across cases.

### Copy source
- **D-10:** Services / process / differentiators / FAQ text is transcribed
  **verbatim from the design file** — no editorial changes in this phase. Later
  edits are just YAML changes, cheap at any time. No new FAQ questions added in
  v1.
- **D-11:** FAQ `pergunta` and `resposta` are stored as **plain-text strings, no
  Markdown**. This serializes directly to the Phase 6 `FAQPage` JSON-LD (which
  requires plain text) and to the design's chat-bubble layout, with no
  strip/convert step. The design's 4 answers are already plain prose.
- **D-12:** Scope boundary confirmed: only the 5 ROADMAP-named collections are
  created. Hero, Felipe's bio ("Sobre / Quem faz"), the contact block, and the
  footer are **single-use prose written directly in `.astro` in Phase 3** — not
  collections.

### Project-wide conventions carried forward
- **D-13 (from Phase 1 D-04):** **Zero comments in any version-controlled file** —
  including YAML content files, the Zod schema/config file, and the
  `project-types.ts` module. Naming carries meaning; rationale lives in
  `.planning/`.

### Claude's Discretion
Planner / researcher decide, unless a real trade-off surfaces for Felipe:
- Exact collection config mechanism for Astro 7 (`src/content.config.ts` vs
  `src/content/config.ts`), and `glob()` / `file()` loader wiring.
- Exact slug strings for each entry file (e.g. `sites-institucionais.yaml`),
  the `order` numbering, and the icon-name enum values — follow the design's
  labels.
- Precise Zod min/max lengths for text fields, and whether headings/short-labels
  get their own fields vs. one `titulo` + `descricao`.
- The concrete copy of the Dmarques-site case's `problema` / `solucao` /
  `resultado` (draft from PROJECT.md Core Value + the Phase 1 metrics: Lighthouse
  mobile ≥95 all four categories, LCP ~1.5 s, CLS 0, cookieless analytics, 100%
  static immutable HTML) — surface the draft to Felipe during execution.
- Format, dimensions, and art of the placeholder cover image (branded, correct
  aspect ratio, `< 300 KB`, processed by `astro:assets`).
- Whether a light "content index" barrel/helper is added for Phase 3/6 consumers.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements & scope
- `.planning/ROADMAP.md` § "Phase 2: Content Collections" — goal + 4 success
  criteria (the exact bar this phase must clear).
- `.planning/REQUIREMENTS.md` § "Conteúdo (CONTENT)" — CONTENT-01..05, the exact
  wording each decision above must satisfy.
- `.planning/REQUIREMENTS.md` § "SEO & Descoberta (SEO)" SEO-07 (FAQPage
  single-sourced from the `faq` collection) and § "Formulário de Orçamento
  (FORM)" FORM-04 (project-type must match the content enum) — the two downstream
  consumers of Phase 2 output.

### Content source
- `arquivos de design/Dmarques Landing.dc.html` — the verbatim source for
  services (4 cards, lines ~197–234), process (4 steps, ~236–274),
  differentiators (4 items, ~276–306), FAQ (4 Q&A pairs, ~389–430), and the
  "Tipo de projeto" `<select>` (5 options, ~376–382). `image-slot.js` /
  `support.js` are design-editor runtime — never ship them.

### Project conventions & prior decisions
- `.planning/phases/01-foundation-ci-gate/01-CONTEXT.md` — D-04 (zero comments,
  project-wide), the near-locked stack, and the domain fact
  (`agenciadmarques.com.br`; contact e-mail is still `felipe.salles1@hotmail.com`
  until the v1.x TRUST-01 swap).
- `.planning/security/SECURITY-CHECKLIST.md` + `.planning/security/runs/` — the
  SEC-07 ritual this phase's success criterion 4 requires.
- `CLAUDE.md` § "Technology Stack" — Astro 7.3.x, `astro:content` provides `z`;
  no new dependency expected for schemas.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet for content. `src/` currently holds only `layouts/BaseLayout.astro`,
  `pages/index.astro` (Phase 1 placeholder), `styles/tokens.css`,
  `styles/base.css`. No `src/content/`, no content config file.

### Established Patterns
- `astro.config.mjs` already defines `env.schema` and the Fonts API config —
  the content config is a *separate* file (`src/content.config.ts` in Astro 7),
  not added to `astro.config.mjs`.
- Phase 1 convention: exact version pins, `pnpm`, `pnpm-lock.yaml` committed,
  Biome + Prettier (`prettier-plugin-astro`) formatting, zero comments.
- `astro:assets` + Sharp at build time is the locked image path (PERF-05) — the
  case cover placeholder must go through it.

### Integration Points
- **Phase 3** imports `services` / `process` / `differentiators` / `faq` /
  `cases` via `getCollection()` and renders them; it also consumes the icon-name
  enum to pick SVGs.
- **Phase 5** imports the `project-types.ts` module for the `<select>` options
  and the Zod `z.enum` in server-side validation.
- **Phase 6** imports the `faq` collection to emit `FAQPage` JSON-LD (plain-text
  strings, no conversion).

</code_context>

<specifics>
## Specific Ideas

- The single v1 case IS the Dmarques site — result block should lean on the real
  Phase 1 numbers (Lighthouse mobile ≥95 across Performance / Accessibility /
  Best Practices / SEO, LCP ~1.5 s, CLS 0, TBT 0 ms, cookieless analytics, 100%
  static immutable HTML on Vercel's CDN).
- "projeto próprio" is the honest label for that case (mirrors the
  REQUIREMENTS.md "projeto próprio" / "demo" wording).
- Process steps are inherently ordered 01–04 in the design (Diagnóstico →
  Planejamento e design → Desenvolvimento → Entrega e suporte) — `order` maps
  straight to those numbers.
- The design's services↔form-select mismatch is intentional going forward: 4
  editorial service cards, 5 form enum options, no forced 1:1.

</specifics>

<deferred>
## Deferred Ideas

- **Real screenshot for the Dmarques-site case cover** — replaces the committed
  placeholder once Phase 3 renders the real sections (or post-launch). Tracked
  so the placeholder is not forgotten.
- **A fictional "demo" case** (e.g. an internal panel / example store to show the
  "sistema" category) — considered for v1, deferred; v1 ships only the
  "projeto próprio" case.
- **Extra FAQ questions** ("Atende fora de Ibitinga?", "Quais tecnologias?") —
  considered, not added in v1; verbatim design copy only.
- **`sobre` / `founder` data collection** (bio, role, @instagram, reusable by the
  Phase 6 `Person` JSON-LD) — considered; v1 keeps the bio as Phase 3 markup.
- **`resultado` as structured `{label, valor}` metric list** — considered for a
  numbers badge; v1 uses a plain string field, revisit if more metric-heavy
  cases are added.

None of the above expand Phase 2 scope — discussion stayed within the phase.

</deferred>

---

*Phase: 2-content-collections*
*Context gathered: 2026-09-10*
