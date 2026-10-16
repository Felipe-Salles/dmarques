---
phase: 05-form-backend-enhancement-lgpd
plan: 10
subsystem: verification
tags: [verification, e2e, playwright, ci, security-gate]
requires:
  - phase: 05-07
    provides: formulario, seletor de canal, paginas de erro, gate de altura do card
  - phase: 05-09
    provides: rota unica /api/orcamento e exatamente 1 Function
provides:
  - scripts/verify/form-gates.mjs com 15 checks locais mockados e 2 checks --live
  - security-check.sh com verificacao 5 exata, verificacao 4 ampliada e verificacao 8
  - CI executando form-gates e form-card-height em todo PR
affects: [05-11, 05-12]
tech-stack:
  added: []
  patterns: [gates Playwright com page.route mockando a API, modo --live por PREVIEW_URL]
key-files:
  created:
    - scripts/verify/form-gates.mjs
  modified:
    - scripts/security-check.sh
    - .planning/security/SECURITY-CHECKLIST.md
    - scripts/verify/browser-gates.mjs
    - .github/workflows/ci.yml
    - package.json
key-decisions:
  - "Hosts do antivirus Kaspersky (injecao local de script) sao ignorados nos gates de rede"
  - "Check obsoleto form de browser-gates removido; form-gates o substitui"
requirements-completed: [FORM-02, FORM-03, FORM-06, FORM-12, FORM-13, LGPD-01, LGPD-02, LGPD-03, LGPD-05]
duration: 55min
completed: 2026-10-15
---

# Phase 5 Plan 10: Gates automatizados do formulario, security-check e CI Summary

`form-gates.mjs` roda 15 checks Playwright contra o build estatico com `/api/orcamento` mockado (POST nativo sem JS, validacao inline, sucesso, falha, 429, 400, rede, deep-links, politica, aviso LGPD, paginas de erro e os 4 checks do seletor de canal D-28), mais um modo `--live` (`cookiesZero`, `terceiros`) que exige `PREVIEW_URL`.

## Commits
- ef0cbc0 test(05-10): gates Playwright do formulario, politica e modo live
- 477cfcf chore(05-10): endurece security-check, CI e browser-gates

## Verificacao
- `node scripts/verify/form-gates.mjs`: 15 PASS / 0 FAIL.
- `bash scripts/security-check.sh --ci`: 6 PASS / 0 FAIL / 2 SKIP (verificacoes 6 e 7 sem PREVIEW_URL); verificacao 5 = 1 Function, verificacao 8 PASS.
- `node scripts/verify/browser-gates.mjs`: 9 PASS (inclui as 3 rotas `/erro-envio/*`).
- `node scripts/verify/form-card-height.mjs`: 6 PASS.
- `node scripts/verify/form-gates.mjs --live` sem `PREVIEW_URL`: sai com 2 e mensagem pedindo `PREVIEW_URL`.

## Provas de sensibilidade (feitas e revertidas)
- Regra `:has()` do seletor de canal neutralizada em `ContactSection.astro`: `canalPadrao` ("#email visivel por padrao") e `canalTrocaSemJs` falharam.
- Link do rodape com `?x=1` sem `text=`: `deepLinks` falhou em todas as rotas.
- `console.log(1)` em `src/lib/submit.ts`: verificacao 8 falhou apontando a linha.
- Fontes de volta ao estado original; build refeito e `git status` limpo.

## Deviations from Plan

**1. [Rule 3 - Bloqueio] browser-gates.mjs reprovava no CI**
- `targets` falhava no input honeypot `.hp` (209x32, fora da tela) e o check `form` usava fluxo antigo (`#email` oculto, `#form-pendente`). Ambos bloqueariam o CI.
- Fix: `.hp` ignorado em `targets`; check `form` removido (coberto por form-gates).
- Commit: 477cfcf

**2. [Ambiente] Kaspersky injeta requisicoes no Chromium local**
- `redeSemAnalytics` e `terceiros` ignoram `*.kaspersky-labs.com` via `IGNORED_HOSTS`; no CI Linux nao ha efeito.

## Issues (fora de escopo)
- UX: com a mensagem de erro de um campo exibida e o foco nele, o clique em "Enviar" pode nao disparar o submit porque o blur remove a mensagem e desloca o botao entre mousedown e mouseup. O gate `erro400` usa Enter no campo para o reenvio. Vale revisar em 05-11 (checkpoint manual).
- Biome acusa ordem de imports pre-existente em `browser-gates.mjs`.
- `--live` implementado, nao executado (sem preview/segredos ate 05-11/05-12); LGPD-06 so fica satisfeito apos rodar o modo live, por isso nao foi marcado como concluido.
- `state.record-metric` e `state.add-decision` nao foram usados/falharam conforme aviso.

## Known Stubs
Nenhum.

## Self-Check: PASSED
Arquivos e commits ef0cbc0, 477cfcf confirmados via `git show --stat`.
