---
phase: 05-form-backend-enhancement-lgpd
plan: 11
subsystem: provisioning
tags: [provisioning, resend, dns, upstash, vercel-env, manual]
requires:
  - phase: 05-08
    provides: endpoint e deps do formulario
  - phase: 05-09
    provides: rota unica /api/orcamento
provides:
  - Dominio agenciadmarques.com.br verificado no Resend (sa-east-1) com DKIM e CNAMEs de envio
  - Upstash Redis (Free, Sao Paulo) conectado a Production e Preview
  - Env vars RESEND_API_KEY, RATE_LIMIT_SALT, KV_REST_API_URL, KV_REST_API_TOKEN em Production e Preview
  - mail-tester 10/10
  - docs/operacao-formulario.md com DNS real, Estado atual e nota de build no Windows
affects: [05-12, 05-13, 05-14]
tech-stack:
  added: []
  patterns: [provisionamento manual com checkpoints human-action]
key-files:
  created: []
  modified:
    - docs/operacao-formulario.md
key-decisions:
  - "Setup manual do dominio no Resend, sem Auto configure/Domain Connect"
  - "Manter o _dmarc p=quarantine pre-existente da GoDaddy em vez de criar p=none"
  - "Usar o par KV_REST_API_* injetado pelo Marketplace; deps.ts ja o aceita"
requirements-completed: [SEC-09]
duration: orquestrada com Felipe
completed: 2026-10-15
---

# Phase 5 Plan 11: Provisionamento Resend, DNS e Upstash Summary

Dominio de envio verificado no Resend (sa-east-1) com DKIM + 2 CNAMEs, DMARC quarantine da GoDaddy mantido, Upstash Free em Sao Paulo e quatro env vars em Production/Preview; mail-tester 10/10.

## Execucao

- Task 1 (Resend) e Task 2 (Upstash): checkpoints human-action concluidos por Felipe com o orquestrador.
- Task 3: env vars confirmadas com `vercel env ls`, `RATE_LIMIT_SALT` gerado (32 bytes base64url) e gravado como Sensitive, mail-tester executado (Resend aceitou o envio, nota 10/10), DNS reverificado e docs atualizados.

## Verificacao de DNS (resolvedor 8.8.8.8, 2026-10-15)

| Consulta | Resultado |
|----------|-----------|
| TXT resend._domainkey | DKIM publicado (`p=MIGf...`, chave publica) |
| CNAME send | `send.forge.rmta.net` |
| CNAME rsend | `rsend-sae1.forge.rmta.net` |
| TXT _dmarc | `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;` |
| MX raiz | 0 `smtp.secureserver.net`, 10 `mailstore1.secureserver.net` (intacto) |
| TXT raiz | `v=spf1 include:secureserver.net -all` (intacto) |

## Deviations from Plan

**1. [Rule 3 - Bloqueio] Formato dos registros do Resend difere do plano**
- O Resend atual pede TXT DKIM + CNAME `send` + CNAME `rsend`, nao MX/TXT SPF `send`. Os alvos publicam SPF proprio.
- Registros criados conforme o painel; docs corrigidos.

**2. [Rule 1 - Divergencia] DMARC ja existia**
- A GoDaddy ja publicava `_dmarc` com `p=quarantine`. Criar `p=none` geraria dois registros e invalidaria ambos. Mantido o existente (estagio final, alinhamento relaxado cobre o DKIM do dominio).

**3. [Ambiente] Modo de Desenvolvedor do Windows**
- `pnpm build` passou a falhar com EPERM ao criar symlink no hook do `@astrojs/vercel`. Ligado o Modo de Desenvolvedor; documentado em docs/operacao-formulario.md.

**4. Nomes das variaveis Upstash**
- O Marketplace injetou `KV_REST_API_URL` e `KV_REST_API_TOKEN`; ja aceitos por `deps.ts`, sem mudanca de codigo.

## Notas

- Apos o envio do mail-tester, o Node imprime `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` ao sair (bug do libuv no Windows); nao afeta o envio.
- FORM-11 (WAF) nao foi tocado; pertence ao plano 05-13.
- `state.record-metric` e `state.add-decision` ignorados conforme instrucao.

## Known Stubs

Nenhum.

## Self-Check: PASSED
