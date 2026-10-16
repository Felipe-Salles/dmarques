---
phase: 05-form-backend-enhancement-lgpd
plan: 05
subsystem: security
tags: [security, rate-limit, upstash, tdd, lgpd]
requires: [05-02]
provides:
  - "request-guards: MAX_BODY_BYTES, isFormUrlEncoded, isAllowedOrigin, readBodyCapped, wantsJson"
  - "rate-limit: RATE, hashIp, createLimiters, createMemoryLimiters, createRateGate"
affects: [05-09]
tech-stack:
  added: []
  patterns: ["guardas puras e injetaveis testaveis com node --test", "fail-closed em timeout/excecao do Redis"]
key-files:
  created:
    - src/lib/request-guards.ts
    - src/lib/request-guards.test.mjs
    - src/lib/rate-limit.ts
    - src/lib/rate-limit.test.mjs
key-decisions:
  - "Chave do IP e HMAC-SHA256 com salt secreto, 22 chars base64url, IPv6 truncado em /64"
  - "Ordem ip -> hora -> dia com curto-circuito para IP bloqueado nao gastar cota global"
requirements-completed: [FORM-08, FORM-10, LGPD-04]
duration: 12min
completed: 2026-10-15
---

# Phase 05 Plan 05: Guardas de requisicao e rate limit Summary

Guardas baratas (urlencoded, Origin, teto de 16 KB por leitura limitada do stream) e rate limit em tres camadas (3 por IP em 10 min, 20/h e 50/dia globais) com IP so em HMAC e falha fechada.

## Commits
- aa466ed: test(05-05): guardas de requisicao
- d833909: feat(05-05): guardas de requisicao
- 5c937fd: test(05-05): rate limit em tres camadas
- 208d60d: feat(05-05): rate limit duravel com IP pseudonimizado

## Verificacao
`node --test src/lib/*.test.mjs`: 72 testes, 0 falhas (inclui "Content-Length mentindo", timeout e excecao). `pnpm check`: 0 erros. `analytics: false` presente, sem `console.*`, sem comentarios.

## Alinhamento com a Politica de Privacidade (T-05-07)
A politica (05-03) declara hash de IP com expiracao de 24h. Na implementacao, so a chave por IP (`rl:ip`) contem o hash, e o Upstash a expira com a janela de 10 min (a janela deslizante mantem no maximo ~2 janelas, cerca de 20 min), portanto dentro das 24h declaradas. As chaves de hora e dia usam o identificador `global`, sem IP. `analytics: false` evita que o Upstash grave identificadores. O TTL e herdado da biblioteca `@upstash/ratelimit`; o plano 05-09/05-12 deve confirmar no Redis real.

## Deviations from Plan
Ajuste apenas no teste: o stream do caso "Content-Length grande sem ler" usa `highWaterMark: 0`, porque o `ReadableStream` chama `pull` de forma antecipada e invalidaria a asserção. Sem mudanca no codigo de producao.

## Notas de execucao
`state.record-metric` e `state.add-decision` nao foram executados (instrucao do orquestrador: falham, nao bloquear).

## Self-Check: PASSED
