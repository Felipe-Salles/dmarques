---
phase: 05-form-backend-enhancement-lgpd
plan: 06
subsystem: static-pages
tags: [static-pages, whatsapp, no-js]
requires: [05-01]
provides:
  - BaseLayout com prop noindex
  - /obrigado revisada
  - /erro-envio/{limite,invalido,falha} estaticas
  - link svc-wa nos cards de servico
  - wa.me com texto pre-preenchido no rodape e botao flutuante
affects: [05-07, 05-09]
key-files:
  created:
    - src/pages/erro-envio/[motivo].astro
  modified:
    - src/layouts/BaseLayout.astro
    - src/pages/obrigado.astro
    - src/components/ServicesSection.astro
    - src/components/SiteFooter.astro
key-decisions:
  - "Erro sem JS via segmento estatico em allow-list (getStaticPaths) em vez de ?motivo=, sem leitura de query nem eco de entrada"
  - "Seletores do .svc restritos a filho direto > svg para o icone do link nao herdar tamanho, stroke e reveal"
requirements-completed: [FORM-02, FORM-12, FORM-13]
duration: 10min
completed: 2026-10-16
---

# Phase 5 Plan 06: Destinos sem JS e deep-links de WhatsApp Summary

Paginas estaticas `noindex` de sucesso e de erro (limite, invalido, falha) com WhatsApp como alternativa, e links de WhatsApp pre-preenchidos nos cards de servico e no rodape.

## Tasks

| Task | Descricao | Commit |
|------|-----------|--------|
| 1 | BaseLayout noindex, /obrigado, /erro-envio/[motivo] | 3337b27 |
| 2 | svc-wa nos servicos e texto generico no rodape | 966bd03 |

## Verificacao

- `pnpm check`: 0 erros. `pnpm build`: 7 paginas.
- `erro-envio/` contem apenas limite, invalido e falha; as 3 paginas e `obrigado` tem `noindex` e `wa.me/5516996111785?text=`; a home nao tem noindex.
- 4 `class="svc-wa"` para 4 `<li class="svc`.
- `buildWaUrl(GENERIC_WA_TEXT)` aparece 2 vezes em SiteFooter; `grep hotmail src/` vazio.
- `browser-gates.mjs`: 10 PASS / 0 FAIL.
- Os 2 `wa.me/5516996111785"` sem texto restantes na home pertencem ao ContactSection (plano 05-07).

## Deviations from Plan

**1. [Rule 1 - Bug] Seletores do .svc alcancavam o svg do link**
- **Found during:** Task 2
- **Issue:** `.svc svg` (tamanho 30px, stroke ciano, grid-row, dasharray de reveal, translateX) tambem atingiria a seta do `.svc-wa`.
- **Fix:** seletores trocados para `.svc > svg` (inclui media de 560px e regras de reveal).
- **Commit:** 966bd03

Fora isso, executado como escrito. `/erro-envio/[motivo]` segue o desvio ja previsto no plano (segmento no lugar de `?motivo=`).

## Known Stubs

Nenhum.

## Threat Flags

Nenhum. T-05-21 (3 caminhos fixos), T-05-22 (`rel="noopener noreferrer"` em todos os `_blank`) e T-05-23 (noindex) mitigados.

## Notes

`state.record-metric` e `state.add-decision` nao foram executados (instrucao: falham; ignorados).

## Self-Check: PASSED

Arquivos existem; commits 3337b27 e 966bd03 presentes.
