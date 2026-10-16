---
phase: 05-form-backend-enhancement-lgpd
plan: 07
subsystem: form-client
tags: [form, progressive-enhancement, a11y, client]
requires: [05-01]
provides:
  - ChipGroup compartilhado (rados reais)
  - seletor de canal D-28 com um unico campo de contato visivel
  - enhancer form.ts com estados idle/enviando/sucesso/falha/limite
  - gate scripts/verify/form-card-height.mjs
affects: [05-09, 05-10]
key-files:
  created:
    - src/components/ChipGroup.astro
    - scripts/verify/form-card-height.mjs
  modified:
    - src/components/ProjectTypeChips.astro
    - src/components/ContactSection.astro
    - src/styles/tokens.css
    - src/scripts/form.ts
key-decisions:
  - "Troca de canal sem JS so por CSS :has() com :global() nos rados do ChipGroup"
  - "Pilulas compactas (padding 9px, gap 6px) e line-height 1.25 em rotulos para o card ficar a +34.8px do sketch"
  - "Link da politica com padding-block 12px e margin-block -12px: alvo de 44px sem inflar a linha"
requirements-completed: [FORM-01, FORM-02, FORM-03, FORM-05, FORM-06, FORM-07, FORM-12, FORM-13, LGPD-03, LGPD-05]
completed: 2026-10-15
---

# Phase 5 Plan 07: Formulario no cliente Summary

Formulario com seletor "Prefiro contato por" (WhatsApp | E-mail), POST nativo sem JS e enhancer sem biblioteca com validacao inline acessivel, estados de envio e alerta com WhatsApp em falha ou limite.

## Tasks

| Task | Descricao | Commit |
|------|-----------|--------|
| 1 | ChipGroup, seletor de canal, markup/CSS do card, token `--color-danger-text` | 4b72a49 |
| 2 | Reescrita de `src/scripts/form.ts` | 3d23424 |
| 3 | Gate de altura do card e compactacao do CSS | 9220f78 |

## Verificacao

- `pnpm check` 0 erros; `pnpm test` 89 pass; `pnpm build` ok; `security-check.sh --ci` 5 PASS / 0 FAIL / 2 SKIP (sem PREVIEW_URL).
- Peso de JS da landing: 5455 B gzip (orcamento 20480 B).
- Gate de altura a 1440px: sketch `#quoteForm` 716.0px, limite 756.0px; site 750.8px nos tres estados (JS/WhatsApp, sem JS, JS/E-mail); exatamente um campo de contato visivel em cada.
- Prova de sensibilidade: sem as regras `:has()` o card foi a 818.4px e a sanidade de visibilidade falhou; regras restauradas.
- Links `wa.me` sem `?text=` na home: o do canal WhatsApp da ContactSection agora usa `buildWaUrl(GENERIC_WA_TEXT)`; os alertas e o painel de sucesso tambem.

## Deviations from Plan

**1. [Rule 1 - Bug] Altura do card acima do limite**
- Found during: Task 3 (854.9px contra limite de 756px)
- Fix: chips 9px/6px de padding/gap (cinco pilulas passam de 3 para 2 linhas), `line-height: 1.25` em h3, sub, labels e legends, link da politica sem inflar a linha. Alvos de toque de 44px e inputs de 48px preservados.
- Files: ChipGroup.astro, ContactSection.astro
- Commit: 9220f78

**2. Gate com linhas extras:** alem das 3 linhas PASS de altura, o script imprime 3 PASS de sanidade de visibilidade.

## Notas

- `state.record-metric` e `state.add-decision` nao foram executados (instrucao do orquestrador: falham; ver STATE.md).
- Testes e2e com rota mockada ficam para o 05-10.

## Known Stubs

Nenhum.

## Self-Check: PASSED

Arquivos e commits 4b72a49, 3d23424, 9220f78 confirmados no git.
