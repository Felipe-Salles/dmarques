---
phase: 05-form-backend-enhancement-lgpd
plan: 02
subsystem: dependencies
tags: [dependencies, env, config]
requires: []
provides:
  - resend, zod, @upstash/ratelimit, @upstash/redis instalados com versao exata
  - schema astro:env com seis segredos opcionais
  - script test recursivo em src/**
affects: [05-04, 05-05, 05-08, 05-09]
tech-stack:
  added: [resend@6.33.0, zod@4.6.7, "@upstash/ratelimit@2.2.0", "@upstash/redis@1.39.0"]
key-files:
  modified: [package.json, pnpm-lock.yaml, astro.config.mjs]
key-decisions:
  - Os dois pares de nomes do Upstash (UPSTASH_REDIS_REST_* e KV_REST_API_*) sao declarados porque a integracao do Marketplace pode injetar qualquer um
  - Novos segredos sao optional para o build nao quebrar sem env; o codigo trata ausencia como falha fechada
requirements-completed: [FORM-04, FORM-08, FORM-09]
duration: 10min
completed: 2026-10-15
---

# Phase 05 Plan 02: Dependencias e segredos do backend do formulario Summary

Quatro dependencias do backend fixadas em versao exata e seis segredos opcionais declarados como server secret no astro:env.

## Tarefas

1. Task 1 (checkpoint de legitimidade): resolvida pelo orquestrador. `npm view` confirmou resend@6.33.0 (github.com/resend/resend-node), zod@4.6.7 (github.com/colinhacks/zod), @upstash/ratelimit@2.2.0 (github.com/upstash/ratelimit-js, peer @upstash/redis ^1.38.2) e @upstash/redis@1.39.0 (github.com/upstash/redis-js). Nenhum tem postinstall, preinstall ou install; o peer @react-email/render do resend e opcional. Felipe respondeu "Aprovado".
2. Task 2: instalacao, glob de teste `src/**/*.test.mjs` e schema astro:env ampliado. Commit 96a7adc.

## Verificacao

`pnpm audit --audit-level=high`, `pnpm check`, `pnpm test` e `pnpm build` saem com codigo 0. `optional: true` aparece 6 vezes e `access: 'secret'` 7 vezes em astro.config.mjs.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED
