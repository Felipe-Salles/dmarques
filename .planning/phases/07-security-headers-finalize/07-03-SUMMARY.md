---
phase: 07-security-headers-finalize
plan: 03
subsystem: security
tags: [error-pages, sourcemaps, sri, view-transitions, ci-gates]
requires: []
provides:
  - src/pages/500.astro (pagina 500 generica, noindex)
  - failureResponse exportado de src/lib/submit.ts
  - catch externo em src/pages/api/orcamento.ts
  - security-check.sh verificacoes 6 (assertiva) e 9-13
affects: [07-04, 07-05, 07-06, 07-07]
tech-stack:
  added: []
  patterns: [helper de falha compartilhado entre respond e catch externo, gate mecanico por grep/perl sobre saida construida]
key-files:
  created:
    - src/pages/500.astro
  modified:
    - scripts/verify/seo-gates.mjs
    - src/lib/submit.ts
    - src/lib/submit.test.mjs
    - src/pages/api/orcamento.ts
    - scripts/security-check.sh
    - .planning/security/SECURITY-CHECKLIST.md
key-decisions:
  - "failureResponse e failedJson unicos: respond('failed') e o catch externo nao divergem"
  - "Sitemap ja exclui /500 sem alterar astro.config.mjs"
requirements-completed: [SEC-04, SEC-05, SEC-10]
duration: 20min
completed: 2026-10-19
---

# Phase 7 Plan 03: 500 generica, catch externo da Function e gates 9-13 Summary

Pagina /500 generica e noindex, Function do formulario sem caminho de throw que exponha pagina de diagnostico da plataforma, e security-check.sh agora bloqueia sourcemaps, View Transitions, cargas externas, meta CSP e vazamentos em paginas de erro, alem de asserir cabecalhos via curl -I quando ha PREVIEW_URL.

## Tasks

| Task | Commit | Resultado |
|------|--------|-----------|
| 1 Pagina 500 + seo-gates | 4ddd976 | seo-gates 10 PASS / 0 FAIL; /500 fora do sitemap |
| 2 failureResponse + catch externo (TDD) | cfb21c1 | 143 testes passando; astro check 0 erros |
| 3 security-check verifs 6, 9-13 + checklist | e57e360 | 11 PASS / 0 FAIL / 2 SKIP; mutacao da verif 11 reprovou como esperado |

## Deviations from Plan

None - plan executed exactly as written. O RED do Task 2 foi confirmado (export ausente) antes da implementacao. Unico ajuste de execucao: o escape das expressoes perl no script foi reescrito (aspas simples via `\047`) apos um erro de sintaxe na primeira geracao; sem efeito no resultado.

## Issues Encountered

`biome check` aponta problemas preexistentes em arquivos nao tocados (generate-og.mjs, base.css, aurora-gates.mjs etc.); fora do escopo.

## Known Stubs

None.

## Self-Check: PASSED
