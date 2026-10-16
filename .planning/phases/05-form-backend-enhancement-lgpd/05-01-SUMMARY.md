---
phase: 05-form-backend-enhancement-lgpd
plan: 01
subsystem: form
tags: [form, validation, whatsapp, pure-module]
requires: []
provides:
  - src/lib/form-schema.ts (constantes, canal, normalizePhone, validateFields)
  - src/lib/whatsapp.ts (buildWaUrl, serviceWaText, fallbackWaText)
  - src/lib/escape-html.ts (escapeHtml)
affects: [05-02, 05-04, 05-05, 05-07]
tech-stack:
  added: []
  patterns: [modulo puro testavel por node --test com type-stripping]
key-files:
  created:
    - src/lib/form-schema.ts
    - src/lib/form-schema.test.mjs
    - src/lib/whatsapp.ts
    - src/lib/whatsapp.test.mjs
    - src/lib/escape-html.ts
    - src/lib/escape-html.test.mjs
  modified: []
key-decisions:
  - "Controle de caracteres sem regex: loop por code point, para satisfazer o lint noControlCharactersInRegex do Biome sem comentarios de supressao (D-23)"
  - "Zero inicial so e removido quando o numero tem 12 ou mais digitos, para que DDD iniciado em 0 seja rejeitado"
requirements-completed: [FORM-04, FORM-05, FORM-09, FORM-13]
duration: 15min
completed: 2026-10-16
---

# Phase 5 Plan 01: Modulos puros do formulario Summary

Tres modulos puros (form-schema, whatsapp, escape-html) compartilhados por cliente e servidor, com validacao por canal (D-28), normalizacao de telefone BR e deep-link unico de WhatsApp, cobertos por 23 testes.

## Tasks

| Task | Descricao | Commits |
|------|-----------|---------|
| 1 | form-schema.ts (RED -> GREEN) | 77c4076 (test), a8e6a78 (feat) |
| 2 | whatsapp.ts e escape-html.ts (RED -> GREEN) | 0bff2b3 (test), 2cfeefd (feat) |

## Deviations from Plan

**1. [Rule 1 - Bug] normalizePhone aceitava DDD iniciado em 0**
- **Found during:** Task 1 (GREEN)
- **Issue:** remover zeros a esquerda sempre transformava `(06) 99611-1785` em `6996111785`, valido; o behavior exige null.
- **Fix:** zeros a esquerda so sao removidos com 12 ou mais digitos (`016996111785` continua valido).
- **Commit:** a8e6a78

**2. [Rule 3 - Blocking] Lint Biome noControlCharactersInRegex**
- **Found during:** verificacao final
- **Issue:** regex com `\u0000-\u001f` falha no `biome check`; suprimir exigiria comentario, proibido por D-23.
- **Fix:** `stripControl` e `cleanMultiline` passaram a usar loop por code point.
- **Commit:** 2cfeefd

Fora isso, o plano foi executado como escrito. Os arquivos `.ts` foram formatados e tiveram imports ordenados via `biome check --write`.

## Known Stubs

Nenhum.

## Threat Flags

Nenhum. Mitigacoes T-05-01 a T-05-03 cobertas por testes (CR/LF removidos, EMAIL_RE bloqueia `<>,;"()[]\` e espaco, escapeHtml dos 5 caracteres, encodeURIComponent no link).

## Self-Check: PASSED

Seis arquivos em src/lib existem; commits 77c4076, a8e6a78, 0bff2b3 e 2cfeefd presentes; `node --test src/lib/*.test.mjs` com 23 testes verdes.
