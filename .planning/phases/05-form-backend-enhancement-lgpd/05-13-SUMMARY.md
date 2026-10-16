---
phase: 05-form-backend-enhancement-lgpd
plan: 13
subsystem: edge-protection
tags: [vercel-firewall, rate-limit, waf, live-verification]
requires:
  - phase: 05-08
    provides: runbook de WAF e flood
  - phase: 05-12
    provides: preview aprovado ponta a ponta
provides:
  - Regra api-flood ativa no Vercel Firewall (10 req/60 s/IP em /api/, acao Deny)
  - Prova de bloqueio na borda no preview (403 com X-Vercel-Mitigated deny)
affects: [05-14]
tech-stack:
  added: []
  patterns: [rate limit de borda complementar ao limiter Upstash do app]
key-files:
  created: []
  modified:
    - docs/waf-rate-limit.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
requirements-completed: [FORM-11]
completed: 2026-10-16
---

# Phase 5 Plan 13: Regra WAF api-flood Summary

Regra de rate limit `api-flood` ativa no Vercel Firewall do projeto dmarques, bloqueando na borda (403, Deny) o que passar de 10 requisicoes por 60 s por IP em `/api/*`, comprovada por rajada real no preview.

## O que foi feito

- Task 1: Felipe criou a regra `api-flood` no painel e publicou em modo Log.
- Task 2: rajada em Log (04:06:06 a 04:06:12 UTC) contra `/api/orcamento` do preview, 12 GETs com header de bypass: `405 x12`. Nenhum evento visivel em Firewall, Traffic (provavel atraso ou filtro do painel, nao confirmado).
- A acao foi trocada para Deny. Config ativa lida de forma somente leitura via `vercel api /v1/security/firewall/config/active`: nome `api-flood`, active true, condicao path starts with `/api/`, rateLimit fixed_window, janela 60 s, limite 10, chave ip, acao deny.
- Rajada apos a troca (04:15:48 UTC, janela zerada com 61 s de espera): `405` x10 e depois `403` x2. A requisicao seguinte na janela devolveu `HTTP/1.1 403 Forbidden`, `Server: Vercel`, `X-Vercel-Mitigated: deny`, `X-Vercel-Id: gru1::...`. O bloqueio ocorre na borda, sem invocar a Function. A regra vale para deploys de preview.
- O segredo de bypass foi lido da config `protectionBypass` do projeto, nunca impresso, e o arquivo temporario foi apagado.

## Deviations from Plan

**1. [Desvio de plano] 403 via Deny em vez de 429**
- O criterio de aceite pedia ao menos um 429. A acao "Too Many Requests (429)" exige upgrade do plano Hobby, que Felipe nao quer agora. Foi usada a acao Deny, disponivel no Hobby.
- O efeito anti-flood e equivalente: a requisicao excedente e barrada na borda antes da Function. Muda so o codigo de status (403) e o header `X-Vercel-Mitigated: deny`.
- Nenhum evento apareceu no painel Traffic durante a rajada em Log; a prova do bloqueio vem das respostas HTTP e da config ativa lida pela API.

## Comportamento do cliente em 403 de borda

Verificado em `src/scripts/form.ts`: o handler do `fetch` trata 200 (sucesso), 429 (estado `limit`, lido de `Retry-After`) e 400 (campos invalidos); qualquer outro status, incluindo 403, cai em `fail()`. `fail()` mostra o alerta `#form-erro` com o link do WhatsApp (`refreshWaLinks`) e anuncia "Nao conseguimos enviar o pedido. Tente de novo ou use o WhatsApp.". O caminho 429 (`limit`, bloqueio do botao) so e acionado pelo limiter do app (Upstash), nao pelo WAF. Nao ha quebra, entao nenhuma mudanca de codigo foi feita.

## Issues Encountered

Nenhum evento da regra foi visto no painel durante a rajada em Log; nao confirmado se por atraso ou filtro. Nao bloqueia, pois o Deny foi provado por resposta HTTP.

## Self-Check: PASSED
