---
phase: 07-security-headers-finalize
plan: 01
subsystem: security
tags: [headers, vercel, hsts, ci, probe]
requires: []
provides:
  - vercel.json com o conjunto de cabecalhos nao-CSP em /(.*)
  - scripts/verify/headers.mjs (carregador de regras e asserts puros)
  - scripts/verify/header-gates.mjs (offline e --live)
  - .github/workflows/headers.yml (Preview com bypass e Production)
affects: [07-02, 07-03, 07-04, 07-05, 07-06, 07-07]
tech-stack:
  added: []
  patterns: [gate runner PASS/FAIL/RESUMO, regras de cabecalho lidas de config.json e vercel.json]
key-files:
  created:
    - scripts/verify/headers.mjs
    - scripts/verify/header-gates.mjs
    - src/lib/header-rules.test.mjs
    - .github/workflows/headers.yml
  modified:
    - vercel.json
    - .github/workflows/ci.yml
    - package.json
key-decisions:
  - "Bloco unico /(.*) no vercel.json com CORP same-site (sem regex de exclusao)"
  - "Permissions-Policy sem interest-cohort (deprecated)"
  - "headers.yml roda o gate mesmo se o curl -I falhar (if not cancelled) para preservar as linhas INFO do probe"
requirements-completed: [SEC-01, SEC-06]
duration: 25min
completed: 2026-10-19
---

# Phase 7 Plan 01: Cabecalhos nao-CSP e probe de preview Summary

vercel.json entrega HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP e CORP em /(.*), com gate de regressao offline e --live e prova em preview real de que os cabecalhos chegam a HTML, 404, asset, imagem e Function.

## Tasks

| Task | Commit | Resultado |
|------|--------|-----------|
| 1 vercel.json + headers.mjs + testes (TDD) | 982cd60 | 141 testes passando |
| 2 header-gates.mjs + CI (ci.yml, headers.yml, verify:headers) | 6c80136 | offline RESUMO 5 PASS / 0 FAIL |
| 3 Probe em preview | (sem arquivos) | PROBE_RESULT abaixo |

## Probe

- SHA: 6c80136a01fcc173f200f2ae6930d35c088d2e01
- Run headers.yml: https://github.com/Felipe-Salles/dmarques/actions/runs/39258569505 (headers-preview success, headers-production skipped)
- Lighthouse (mesmo SHA): success

PROBE_RESULT: merge-ok

| Path | Status | Cabecalhos nao-CSP presentes |
|------|--------|------------------------------|
| / | 200 | os 7 |
| /obrigado | 200 | os 7 |
| /obrigado/ | 200 (sem redirect) | os 7 |
| /nao-existe | 404 | os 7 |
| /_astro/BaseLayout.astro_astro_type_script_index_0_lang.PZFz1lWi.js | 200 | os 7 |
| /og-image.jpg | 200 | os 7 |
| /api/orcamento | 405 | os 7 |

HSTS observado no preview *.vercel.app: `max-age=63072000; includeSubDomains; preload`. O curl -I cru confirmou os 7 cabecalhos. Nenhum CSP presente (esperado nesta fase). Sem AVISO de WAF. Conclusao: os headers do vercel.json coexistem com o Build Output do adaptador em todos os tipos de resposta; a injecao de fallback no 07-02 nao e necessaria para os cabecalhos nao-CSP.

## Deviations from Plan

None - plan executed exactly as written. Unica adicao: `if: ${{ !cancelled() }}` no passo do gate em headers.yml para que o probe registre as linhas INFO mesmo se o curl -I falhar.

## Issues Encountered

Nenhum. Aviso do push: GitHub aponta 6 vulnerabilidades Dependabot na branch default (preexistente, fora do escopo).

## Self-Check: PASSED
