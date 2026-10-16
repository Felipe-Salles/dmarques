---
phase: 05-form-backend-enhancement-lgpd
plan: 08
subsystem: ops
tags: [ops, runbook, waf, email-deliverability, residual-risk]
requires: [05-02]
provides:
  - docs/waf-rate-limit.md (regra WAF em /api/* e runbook de flood)
  - docs/operacao-formulario.md (env vars, DNS Resend, Upstash, expurgo de 6 meses)
  - scripts/mail-tester.mjs (envio de teste SEC-09)
  - declaracao SEC-08 atualizada no ROADMAP
affects: [05-11, 05-12, 05-14]
key-files:
  created:
    - docs/waf-rate-limit.md
    - docs/operacao-formulario.md
    - scripts/mail-tester.mjs
  modified:
    - .planning/ROADMAP.md
key-decisions:
  - "Documentacao operacional versionada para os checkpoints manuais"
  - "Script de teste le a chave so de process.env e imprime apenas error.name em falha"
requirements-completed: [FORM-11, SEC-08, SEC-09, LGPD-07]
completed: 2026-10-15
---

# Phase 5 Plan 08: Runbooks operacionais e SEC-08 Summary

Runbooks de WAF/flood e de operacao do formulario, script de teste de entregabilidade que nunca imprime a chave e declaracao de risco residual SEC-08 com os controles reais.

## Tasks

| Task | Descricao | Commit |
|------|-----------|--------|
| 1 | docs/waf-rate-limit.md e docs/operacao-formulario.md | 958547a |
| 2 | scripts/mail-tester.mjs e secao SEC-08 do ROADMAP | 0cc4ef9 |

## Verificacao

- `node scripts/mail-tester.mjs` sem argumentos: imprime a linha de uso e sai com codigo 1.
- `biome check scripts/mail-tester.mjs`: limpo; sem comentarios no arquivo.
- Docs contem todas as strings exigidas; nenhuma chave `re_...` nos docs.
- ROADMAP: bullets existentes preservados; adicionados valores reais, limite de 1 regra WAF no Hobby, risco Fair Use e referencia a `docs/waf-rate-limit.md`.

## Deviations from Plan

None - plan executed exactly as written.

## Notas

- `state.record-metric` e `state.add-decision` ficaram de fora conforme orientacao (falhas conhecidas).
- O envio real ao mail-tester nao foi executado aqui (exige chave e checkpoint 05-11/05-12).

## Self-Check: PASSED
