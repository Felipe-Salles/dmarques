---
phase: 07-security-headers-finalize
plan: 02
subsystem: security
tags: [csp, report-only, hashes, sourcemaps, vercel-build-output]
requires: [07-01, 07-03]
provides:
  - src/lib/js-ready.ts (JS_READY, fonte unica do script inline)
  - src/lib/finalize-headers.pure.mjs (reshapeRoutes, modo report-only por padrao)
  - scripts/finalize-headers.mjs encadeado em pnpm build
  - security.csp + staticHeaders + sourcemap false em astro.config.mjs
  - verificacao jsReady em header-gates (6 PASS)
affects: [07-04, 07-05, 07-06, 07-07]
tech-stack:
  added: []
  patterns: [hash sha256 derivado da mesma constante usada no markup, rota global /(.*) com continue antes do filesystem]
key-files:
  created:
    - src/lib/js-ready.ts
    - src/lib/js-ready.test.mjs
    - src/lib/finalize-headers.pure.mjs
    - src/lib/finalize-headers.test.mjs
    - scripts/finalize-headers.mjs
  modified:
    - src/layouts/BaseLayout.astro
    - astro.config.mjs
    - package.json
    - scripts/verify/header-gates.mjs
key-decisions:
  - "CSP entregue como Report-Only por padrao; CSP_MODE=enforce alterna e adiciona upgrade-insecure-requests apenas nesse modo"
  - "SEC-02 atendido por script-src 'self' mais hashes sha256 do Astro, sem unsafe-inline/unsafe-eval; 'self' puro e inviavel porque a Fonts API emite <style> inline"
  - "PROBE_RESULT do 07-01 foi merge-ok, entao injectHeaders nao foi criado"
requirements-completed: [SEC-02, SEC-03, SEC-04]
duration: 30min
completed: 2026-10-19
---

# Phase 7 Plan 02: Pipeline de CSP por cabecalho Summary

CSP estrita baseada em hashes, entregue por uma unica rota global `/(.*)` em Report-Only por padrao, com script js-ready de fonte unica, sourcemaps desligados e gate de regressao.

## Tasks

| Task | Commit | Resultado |
|------|--------|-----------|
| 1 JS_READY, layout e teste de hash fixado | b53568d | hash `tuIU1AzinXXFwvirj5zOPmWp+jY3/gZn/LNq1H5E3BY=` |
| 2 Modulo puro, testes e script de pos-build | 80a92e5 | build encadeado; falha alta sem rota CSP ou CSP divergente |
| 3 astro.config, header-gates | e3b516e | 6 PASS / 0 FAIL; enforce validado |

## CSP final (report-only)

Rota unica `/(.*)` com `continue: true`, cabecalho `content-security-policy-report-only`:

```
default-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' <7 hashes sha256>; style-src 'self' <4 hashes sha256>
```

Hashes: 7 de script (incluindo o do js-ready) e 4 de estilo. Sem meta CSP no HTML e sem arquivos .map.

## Verificacao

- pnpm test: 160 pass / 0 fail
- header-gates: 6 PASS (naoCsp, csp, poweredBy, status, jsReady, artefatos)
- `CSP_MODE=enforce pnpm build` + `--expect=enforce`: aprovado; build refeito em report-only
- astro check: 0 erros; security-check --ci: 11 PASS / 0 FAIL / 2 SKIP

## Deviations from Plan

None - plan executed exactly as written. Observacao: o commit da Task 1 foi feito com o teste de index.html falhando contra um build antigo (saida defasada, nao o codigo); passou apos o rebuild da Task 3.

## Issues Encountered

Nenhum.

## Known Stubs

None.

## Self-Check: PASSED
