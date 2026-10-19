---
phase: 07-security-headers-finalize
plan: 04
subsystem: security
tags: [csp, report-only, playwright, ci, preview]
requires: [07-02, 07-03]
provides:
  - scripts/verify/csp-recorder.mjs (attachCspRecorder)
  - static-server.mjs com emulacao dos cabecalhos de config.json e vercel.json
  - check csp em browser-gates (rotas x dois modos de movimento)
  - cspEnvio local e cspCarga/cspEnvio ao vivo em form-gates
  - headers.yml com form-gates na preview e subset de carga na producao
affects: [07-05, 07-06, 07-07]
tech-stack:
  added: []
  patterns: [exposeFunction para sobreviver a navegacoes, servidor estatico emulando cabecalhos de deploy]
key-files:
  created:
    - scripts/verify/csp-recorder.mjs
  modified:
    - scripts/verify/static-server.mjs
    - scripts/verify/browser-gates.mjs
    - scripts/verify/form-gates.mjs
    - .github/workflows/headers.yml
key-decisions:
  - "upgrade-insecure-requests removido apenas no servidor local (http), nunca no deploy"
  - "Envio ao vivo usa honeypot preenchido e um unico POST para nao enviar e-mail nem acionar a WAF"
requirements-completed: [SEC-03, SEC-02, SEC-05]
duration: 25min
completed: 2026-10-19
---

# Phase 7 Plan 04: Report-Only sem violacoes Summary

Gates locais passam a rodar sob a CSP Report-Only real, sem violacoes em nenhuma rota nem no envio (JS e POST nativo); a preview real confirmou o mesmo via CI.

## Tasks

| Task | Commit | Resultado |
|------|--------|-----------|
| 1 recorder, servidor com cabecalhos, check csp | b453f73 | browser-gates 10 PASS; controle negativo (hash do js-ready removido) gerou FAIL com script-src-elem |
| 2 form-gates csp + headers.yml | 51118ed | form-gates local 16 PASS; `--live --list` lista 4 checks |
| 3 preview Report-Only | 51118ed (push) | headers e lighthouse success |

## Report-Only preview run

- SHA: 51118ed06d99154cb6a917480715c82c692628db
- Preview URL: https://dmarques-kdldc3isj-felipe-salles-projects.vercel.app
- Run headers: https://github.com/Felipe-Salles/dmarques/actions/runs/39260825312 (success; headers-production skipped)
- Run lighthouse: https://github.com/Felipe-Salles/dmarques/actions/runs/39260825198 (success; asserts dos limites >= 95 passaram, o log nao imprime notas numericas)
- Run ci: ci.yml dispara apenas em pull_request e push em main, entao nao rodou para este push; a suite local identica foi executada com exit 0 (pnpm test 160 pass, astro check 0 erros, header-gates 6 PASS, aurora 13 PASS, seo 10 PASS, browser-gates 10 PASS, form-gates 16 PASS, form-card-height, audit high, js-weight-check, security-check 11 PASS / 0 FAIL / 2 SKIP)
- Cabecalho CSP observado em `/`: content-security-policy-report-only (e nenhum content-security-policy)
- Preview ao vivo: PASS: cookiesZero, PASS: terceiros (sem va.vercel-scripts.com), PASS: cspCarga, PASS: cspEnvio, header-gates 6 PASS
- O check `csp` (todas as rotas, dois modos de movimento) roda localmente sob o mesmo cabecalho; o CI ao vivo cobre `/`, `/nao-existe`, `/obrigado` e o envio

REPORT_ONLY_CLEAN: yes

## Deviations from Plan

None - plan executed exactly as written. Observacao: a saida dos runners usa `PASS csp` (sem dois-pontos) em browser-gates, formato preexistente do arquivo; form-gates usa `PASS: nome`.

## Issues Encountered

Nenhum.

## Known Stubs

None.

## Self-Check: PASSED
