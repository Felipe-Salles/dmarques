---
phase: 07-security-headers-finalize
plan: 05
subsystem: security
tags: [csp, enforce, docs, sri, preview]
requires: [07-04]
provides:
  - CSP enforcing por padrao (DEFAULT_CSP_MODE = 'enforce')
  - docs/seguranca-headers.md (registro de decisoes)
  - Decisoes SEC-10 e CSP por hash no PROJECT.md
affects: [07-06, 07-07]
key-files:
  created:
    - docs/seguranca-headers.md
  modified:
    - src/lib/finalize-headers.pure.mjs
    - src/lib/finalize-headers.test.mjs
    - .github/workflows/headers.yml
    - .planning/PROJECT.md
key-decisions:
  - "CSP promovida para enforcing em commit proprio apos REPORT_ONLY_CLEAN: yes"
  - "headers.yml passa a esperar enforce na preview e na producao"
requirements-completed: [SEC-03, SEC-02, SEC-05, SEC-10]
duration: 20min
completed: 2026-10-19
---

# Phase 7 Plan 05: Promocao da CSP para enforcing Summary

CSP enforcing (com upgrade-insecure-requests) provada limpa na preview por headers.yml e Lighthouse, com o registro de decisoes em docs/seguranca-headers.md.

## Tasks

| Task | Commit | Resultado |
|------|--------|-----------|
| 1 promocao | 8ae55f2 | pnpm test 160 pass; header-gates, browser-gates 10, form-gates 16, aurora 13, form-card-height e security-check 11 PASS / 0 FAIL |
| 1 correcao do workflow | 3297832 | headers.yml esperava report-only fixo |
| 2 docs e PROJECT.md | 9080377 | seguranca-headers.md e duas linhas de Key Decisions |

## Preview enforcing

- SHA validado: 329783244d4125b9bcb3d93aa7519b1749b0caf1
- Preview URL: https://dmarques-2ls5bowws-felipe-salles-projects.vercel.app
- Run headers: https://github.com/Felipe-Salles/dmarques/actions/runs/39261830281 (success; header-gates live 6 PASS, form-gates live 4 PASS incluindo cspCarga e cspEnvio)
- Run lighthouse: https://github.com/Felipe-Salles/dmarques/actions/runs/39261830288 (success, limites >= 95)
- Cabecalho em `/` (hashes omitidos): `content-security-policy: default-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' <hashes>; style-src 'self' <hashes>; upgrade-insecure-requests`, sem `content-security-policy-report-only`.

## Deviations from Plan

**1. [Rule 3 - Blocking] headers.yml com --expect=report-only fixo**
- **Found during:** Task 1 (primeiro run do SHA 8ae55f2, headers-preview falhou: csp esperava report-only)
- **Issue:** o plano supunha que o CI seguiria DEFAULT_CSP_MODE, mas os dois passos live do workflow passavam a flag explicitamente. O cabecalho real ja era enforcing.
- **Fix:** trocado para `--expect=enforce` nas linhas dos jobs preview e production.
- **Files modified:** .github/workflows/headers.yml
- **Commit:** 3297832

## Issues Encountered

Primeiro run de headers (39261567172) falhou pelo motivo acima; o segundo passou. O job headers-production fica para o deploy da 07-06.

## Known Stubs

None.

## Self-Check: PASSED
