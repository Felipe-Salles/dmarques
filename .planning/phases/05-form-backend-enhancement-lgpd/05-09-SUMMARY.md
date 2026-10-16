---
phase: 05-form-backend-enhancement-lgpd
plan: 09
subsystem: api
tags: [api, endpoint, serverless, tdd, resend, upstash]
requires:
  - phase: 05-04
    provides: parseSubmission, buildEmail
  - phase: 05-05
    provides: guards de requisicao e rate gate
provides:
  - handleSubmission puro com dependencias injetadas
  - createDeps com Upstash, Resend e fallback de dev
  - rota unica on-demand POST /api/orcamento
affects: [05-10, 05-11]
tech-stack:
  added: []
  patterns: [handler puro com Deps injetadas, virtual module astro:env so na rota]
key-files:
  created:
    - src/lib/submit.ts
    - src/lib/submit.test.mjs
    - src/lib/deps.ts
    - src/pages/api/orcamento.ts
  modified: []
key-decisions:
  - "Ordem das guardas: 415, 403, 413, bot, Zod, rate limit, envio"
  - "Sem Upstash configurado em producao o rate gate falha fechado"
requirements-completed: [FORM-02, FORM-07, FORM-08, FORM-09, FORM-10, LGPD-04]
duration: 25min
completed: 2026-10-15
---

# Phase 5 Plan 09: Handler do formulario e rota unica Summary

Handler puro `handleSubmission` (23 testes) com destinos fixos em `REASON_PATH`, `createDeps` ligando Upstash/Resend (fail-closed sem configuracao) e a rota `src/pages/api/orcamento.ts` como unica superficie `prerender = false`.

## Commits
- cfd1f63 test(05-09): handler do formulario (RED)
- 03f3ff4 feat(05-09): handler puro do formulario (GREEN)
- 52ce6fc feat(05-09): deps de producao e rota unica /api/orcamento

## Verificacao
- `node --test src/lib/submit.test.mjs`: 23 pass; `pnpm test`: 112 pass; `pnpm check`: 0 erros.
- Dev (porta 4322, RESEND_API_KEY ficticia): POST JSON -> 415, GET -> 405.
- `dist/client` contem `obrigado`, `erro-envio/falha` e `politica-de-privacidade` como HTML; `.vercel/output/functions` tem so `_render.func`.
- Greps: sem `console.*`, sem `astro:env` em `src/lib`, sem comentarios, `Location` aparece uma vez em submit.ts.

## Deviations from Plan

**1. [Ambiente] `pnpm build` termina com erro EPERM no Windows**
- O hook `astro:build:done` do `@astrojs/vercel` falha ao criar symlink para `node_modules/resend` (`EPERM ... symlink`), por falta de privilegio de symlink no Windows (exit 3221226505). A compilacao e o prerender concluem; falha apenas o empacotamento da Function.
- Nao e defeito do codigo; deve passar em CI Linux/Vercel ou com Modo Desenvolvedor habilitado. A contagem de exatamente 1 Function e as paginas em `.vercel/output/static` foram verificadas parcialmente (via `dist/client` e `functions/_render.func`), nao pelo build completo. Recomenda-se rodar o build em Linux/Vercel antes de concluir 05-10.

**2. [Formatacao]** Biome reordenou imports em deps.ts, submit.ts e orcamento.ts (incluido no commit 52ce6fc).

## Issues
- `RESEND_API_KEY` e obrigatorio no schema de env, entao `pnpm dev` exige essa variavel (usei valor ficticio). Existia um dev server antigo que foi encerrado.

## Known Stubs
Nenhum.

## Self-Check: PASSED
Arquivos e commits cfd1f63, 03f3ff4, 52ce6fc confirmados.
