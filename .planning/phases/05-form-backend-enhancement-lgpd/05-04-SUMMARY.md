---
phase: 05-form-backend-enhancement-lgpd
plan: 04
subsystem: form
tags: [zod, validation, email, tdd]
requires: [05-01, 05-02]
provides:
  - src/lib/form-schema.server.ts (submissionSchema, parseSubmission, tipo Submission)
  - src/lib/mail.ts (subjectFor, buildEmail, tipo OutgoingEmail)
affects: [05-05, 05-08, 05-09]
tech-stack:
  added: []
key-files:
  created:
    - src/lib/form-schema.server.ts
    - src/lib/form-schema.server.test.mjs
    - src/lib/mail.ts
    - src/lib/mail.test.mjs
key-decisions:
  - "O campo do canal nao escolhido e removido antes do safeParse, entao nunca e validado nem chega ao e-mail (D-28)"
  - "Erros do servidor devolvem apenas o primeiro segmento do path de cada issue, nunca mensagens do Zod"
  - "A divergencia cliente/servidor para canal ausente ou invalido e intencional e coberta por teste proprio"
requirements-completed: [FORM-01, FORM-04, FORM-05, FORM-09]
duration: 15min
completed: 2026-10-15
---

# Phase 05 Plan 04: Validacao Zod e montagem do e-mail Summary

Validacao autoritativa do servidor com Zod 4 reutilizando EMAIL_RE, LIMITS e normalizePhone do cliente, e montagem do e-mail de notificacao com HTML escapado, corpo text, assunto sem CR/LF e reply-to condicionado ao canal e-mail.

## Tarefas

| Task | Descricao | Commits |
|------|-----------|---------|
| 1 | form-schema.server.ts (RED -> GREEN) | 1926361 (test), a5526a2 (feat) |
| 2 | mail.ts (RED -> GREEN) | f89a84b (test), c040d30 (feat) |

## Verificacao

`node --test src/lib/*.test.mjs`: 47 testes verdes (16 do schema, incluindo a tabela de concordancia com 15 linhas, e 7 do e-mail). `pnpm check` com 0 erros e `scripts/security-check.sh` com 5 PASS, 0 FAIL. `escapeHtml(` aparece 7 vezes em mail.ts; nao ha atributos `style` nem comentarios.

## Deviations from Plan

None - plan executed exactly as written. Os arquivos foram formatados com `biome check --write`.

## Known Stubs

Nenhum.

## Threat Flags

Nenhum. T-05-10 a T-05-14 cobertos por testes.

## Observacao

`state.record-metric` nao foi usado para evitar o erro conhecido.

## Self-Check: PASSED
