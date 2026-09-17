# Phase 2: Content Collections - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-10
**Phase:** 2-content-collections
**Areas discussed:** Collection shape & ordering, "Tipo de projeto" enum, Portfolio cases, Copy: design verbatim vs. revise

---

## Collection shape & ordering

| Option | Description | Selected |
|--------|-------------|----------|
| Um arquivo por item | `src/content/<collection>/<slug>.yaml` via `glob()` loader; small isolated entries, clean diffs; consistent with Markdown cases | ✓ |
| Um arquivo por collection | `services.yaml` holding an array via `file()` loader; fewer files, whole list at once | |
| Você decide | — | |

**User's choice:** Um arquivo por item

| Option | Description | Selected |
|--------|-------------|----------|
| Campo `order` no schema | `order: 1/2/3…` required by Zod; section sorts by it; rename-free reordering | ✓ |
| Prefixo no nome do arquivo | `01-diagnostico.yaml`; alphabetical order; no extra field but rename to reorder | |
| Você decide | — | |

**User's choice:** Campo `order` no schema

| Option | Description | Selected |
|--------|-------------|----------|
| Chave `icon` com nome | YAML stores `icon: sistemas` (enum slug); Phase 3 maps name→SVG; build validates | ✓ |
| Sem ícone na collection | Phase 3 binds SVG to service slug in the component | |
| Você decide | — | |

**User's choice:** Chave `icon` com nome

**Notes:** Applies to services / process / differentiators / faq. Cases (Markdown) already follow one-file-per-entry.

---

## "Tipo de projeto" enum

| Option | Description | Selected |
|--------|-------------|----------|
| As 5 opções do formulário | Keep the design `<select>`: site-institucional, sistema-sob-medida, ecommerce-plataforma, automacao, nao-sei; services stay decoupled | ✓ |
| Alinhar serviços e enum | Single taxonomy of 4 (+ "ainda não sei" only in form); rename "Soluções web"; card↔option 1:1 | |
| Você decide | — | |

**User's choice:** As 5 opções do formulário

| Option | Description | Selected |
|--------|-------------|----------|
| Módulo TS em src/content/ | `project-types.ts` exports `as const` array of {value, label}; schemas use `z.enum`; Phase 5 imports same array | ✓ |
| Collection 'projectTypes' | One data file per option; Zod enum derived from collection; Phase 5 loads the collection | |
| Você decide | — | |

**User's choice:** Módulo TS em src/content/

| Option | Description | Selected |
|--------|-------------|----------|
| Proposta abaixo | site-institucional / sistema-sob-medida / ecommerce-plataforma / automacao / nao-sei with pt-BR labels | ✓ |
| Quero ajustar | User supplies changes in text | |

**User's choice:** Proposta abaixo

---

## Portfolio cases

| Option | Description | Selected |
|--------|-------------|----------|
| Só o site da Dmarques | 1 case: the site itself ("projeto próprio"), real metrics, real screenshot cover | ✓ |
| Site próprio + 1 demo | 2 cases: Dmarques site + 1 honestly-labeled "demo" | |
| Tenho um projeto real de cliente | User provides a real project in text | |

**User's choice:** Só o site da Dmarques

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder commitado agora | Branded placeholder image at right aspect ratio; `cover` stays required; swap for real screenshot later | ✓ |
| cover opcional no schema | `image().optional()` for v1 | |
| Você decide | — | |

**User's choice:** Placeholder commitado agora

| Option | Description | Selected |
|--------|-------------|----------|
| 3 campos no frontmatter | `problema` / `solucao` / `resultado` strings, Zod-validated; optional Markdown body | ✓ |
| Só corpo Markdown | Minimal frontmatter; author writes `## Problema` etc. in the body | |
| 3 campos + métricas | As option 1 but `resultado` is a `{label, valor}` list | |

**User's choice:** 3 campos no frontmatter

---

## Copy: design verbatim vs. revise

| Option | Description | Selected |
|--------|-------------|----------|
| Usar do design, verbatim | Transcribe the 4 services, 4 steps, 4 differentiators, 4 FAQ exactly as in the `.dc.html` | ✓ |
| Quero revisar antes | User supplies edits in text before it becomes content | |
| Verbatim + acrescentar FAQ | Design copy as-is plus 1–2 new FAQ questions | |

**User's choice:** Usar do design, verbatim

| Option | Description | Selected |
|--------|-------------|----------|
| Markup fixo na Fase 3 | Only services/process/differentiators/faq/cases become collections; hero/bio/contato/rodapé are single-use `.astro` markup | ✓ |
| Bio do Felipe também vira collection | Add a `sobre`/`founder` data file (bio, role, @instagram), reusable by Phase 6 Person JSON-LD | |
| Você decide | — | |

**User's choice:** Markup fixo na Fase 3

| Option | Description | Selected |
|--------|-------------|----------|
| Texto puro (string) | `pergunta`/`resposta` plain strings, no Markdown; serializes straight to JSON-LD | ✓ |
| Markdown na resposta | `resposta` in Markdown; Phase 6 strips to plain text before JSON-LD | |
| Você decide | — | |

**User's choice:** Texto puro (string)

---

## Claude's Discretion

- Astro 7 content config file mechanism and `glob()` / `file()` loader wiring.
- Exact entry slug filenames, `order` numbering, and icon-name enum values (follow the design's labels).
- Precise Zod min/max lengths and whether short-label vs. description get separate fields.
- The concrete `problema` / `solucao` / `resultado` copy for the Dmarques-site case (draft from Core Value + Phase 1 metrics; surface to Felipe during execution).
- Placeholder cover image format, dimensions, and art (`< 300 KB`, through `astro:assets`).
- Whether a light content index/barrel helper is added for Phase 3/6 consumers.

## Deferred Ideas

- Real screenshot to replace the case placeholder cover (post-Phase-3 / post-launch).
- A fictional "demo" case for the "sistema" category.
- Extra FAQ questions ("Atende fora de Ibitinga?", "Quais tecnologias?").
- A `sobre` / `founder` data collection for reuse by Phase 6 Person JSON-LD.
- `resultado` as a structured `{label, valor}` metric list.
