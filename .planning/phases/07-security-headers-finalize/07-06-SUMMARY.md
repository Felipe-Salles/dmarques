---
phase: 07-security-headers-finalize
plan: 06
subsystem: infra
tags: [vercel, csp, hsts, headers, lighthouse, release]
requires:
  - phase: 07-05
    provides: CSP enforcing verificada no preview
provides:
  - PR #9 integrado em main com aprovacao explicita
  - Evidencia de cabecalhos e CSP enforcing em producao
affects: [07-07]
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified: []
key-decisions:
  - "Merge squash do PR #9 feito pelo executor apos aprovacao explicita de Felipe"
requirements-completed: [SEC-01, SEC-06, PERF-01]
duration: 20min
completed: 2026-10-19
---

# Fase 7 Plano 06: Merge e verificacao em producao Summary

**PR #9 integrado em main (squash) e producao em agenciadmarques.com.br servindo o conjunto completo de cabecalhos, CSP enforcing e HSTS com includeSubDomains e preload.**

PRODUCTION_HEADERS: ok

## Aprovacao

Resposta de Felipe no checkpoint (opcao merge-by-claude, "Aprovado, pode fazer o merge"): "Pode fazer o merge".

## Evidencias

- PR: #9 https://github.com/Felipe-Salles/dmarques/pull/9 (Task 1: verify, dependency-review, headers-preview, lhci e Vercel verdes)
- Evidencia anterior: Report-Only https://github.com/Felipe-Salles/dmarques/actions/runs/39260825312 ; enforcing https://github.com/Felipe-Salles/dmarques/actions/runs/39261830281
- MERGE_SHA: 98a0dbfe96fc4c37c8f0b11378652e81207022e0
- headers.yml, job headers-production: success https://github.com/Felipe-Salles/dmarques/actions/runs/39268752469
- lighthouse.yml, job lhci-production: success https://github.com/Felipe-Salles/dmarques/actions/runs/39268752412 (assertions de >= 0.95 nas quatro categorias aprovadas; o log do action nao imprime as notas individuais)
- ci (push): success, run 39268692781

### header-gates live (producao, --expect=enforce)

```
INFO: / 200 strict-transport-security,x-content-type-options,x-frame-options,referrer-policy,permissions-policy,cross-origin-opener-policy,cross-origin-resource-policy,content-security-policy
INFO: /obrigado 200 (mesmo conjunto)
INFO: /obrigado/ 200 (mesmo conjunto)
INFO: /nao-existe 404 (mesmo conjunto)
INFO: /_astro/BaseLayout.astro_astro_type_script_index_0_lang.PZFz1lWi.js 200 (mesmo conjunto)
INFO: /og-image.jpg 200 (mesmo conjunto)
INFO: /api/orcamento 405 (mesmo conjunto)
PASS: naoCsp / csp / poweredBy / status / jsReady / artefatos
RESUMO: 6 PASS / 0 FAIL (live)
```

### curl -I apex

```
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' <7 hashes sha256>; style-src 'self' <4 hashes sha256>; upgrade-insecure-requests
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Server: Vercel
```

Sem Content-Security-Policy-Report-Only. HSTS da apex contem includeSubDomains e preload (nenhuma sobrescrita da Vercel).

### curl -I www

```
HTTP/1.1 308 Permanent Redirect
Location: https://agenciadmarques.com.br/
Strict-Transport-Security: max-age=63072000
```

www redireciona 308 para a apex; o redirect carrega HSTS apenas com max-age (sem includeSubDomains/preload). Isso e comportamento padrao da Vercel no redirect de dominio e nao afeta a apex, que e a origem de preload. Registrado para a decisao de preload em 07-07.

## Desvios do plano

### form-gates live nao executaveis nesta maquina

`form-gates.mjs --live --check=cspCarga,cookiesZero,terceiros` falhou nas tres verificacoes com `page.goto: Timeout 30000ms` (duas execucoes). Diagnostico: o gate usa `waitUntil: 'networkidle'`; o Kaspersky local injeta scripts (`gc.kis.v2.scr.kaspersky-labs.com`) que mantem a rede ativa, entao o navegador nunca fica ocioso. Reproduzido com uma sonda isolada: `waitUntil: 'load'` carrega a pagina, `networkidle` estoura o tempo. E uma limitacao do ambiente local, nao da producao; nada foi alterado em producao. A cobertura equivalente em producao vem de headers-production e lhci-production (verdes) e do header-gates live (0 FAIL). Os mesmos gates rodam limpos no CI (07-04/07-05). Pendencia opcional: repetir em maquina sem antivirus injetando scripts.

**Total de desvios:** 1 (limitacao de ambiente, sem impacto em producao).

## Roteiro de rollback (inalterado)

CSP_MODE=report-only no ambiente do projeto Vercel + redeploy, ou reverter o merge 98a0dbf.

## Caminho dos docs pos-merge

Os docs de fases recentes (#7) entraram via PR; esta branch (phase-07-security-headers) foi resetada para origin/main e recebe os docs, sem novo PR (07-07 adiciona mais).

## Self-Check: PASSED
