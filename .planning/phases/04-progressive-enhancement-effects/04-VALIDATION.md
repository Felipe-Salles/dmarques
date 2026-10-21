---
phase: 04
slug: progressive-enhancement-effects
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-09-16
updated: 2026-10-21
---

# Fase 04 - Validacao Nyquist reconciliada

## Escopo vigente e historico

ANIM-03/04/05 e as implementacoes particles/glow foram removidos por 04.1 D-12. Teste particles.pure ausente e aposicao intencional do escopo, nao lacuna. O runner e CI permanecem, com steps.pure.test e a suite recursiva. Reveal/fallback/reduced/mocks/tilt sao cobertos no browser atual; a aurora WebGL posterior tem fallback e nao e retorno das particulas. 04-04-SUMMARY registra instrumentacao CDP original e aprovado do Felipe, sem pendencias. Nao recriar canvas de particulas ou glow para satisfazer comandos historicos.

## Infraestrutura e evidencias compartilhadas

Estado A do workflow: VALIDATION existia e a fase tem PLAN/SUMMARY e VERIFICATION. Foram lidos os planos e resumos para mapear tarefas, IDs, arquivos e comandos; infraestrutura atual e estados historicos foram cruzados. Nao foram encontradas lacunas novas de comportamento sem verificacao: os itens aparentes eram registros pendentes, checkpoints ja resolvidos ou componentes intencionalmente substituidos. Aplicado o caminho do passo 3 diretamente ao passo 6, sem gerar testes redundantes nem modificar implementacao.

Comandos atuais: `pnpm check`, `pnpm test`, `pnpm build`, `node scripts/verify/aurora-gates.mjs`, `node scripts/verify/browser-gates.mjs`, `node scripts/verify/form-gates.mjs`, `node scripts/verify/seo-gates.mjs`, `node scripts/verify/header-gates.mjs`, `bash scripts/security-check.sh --ci` e `bash scripts/js-weight-check.sh .vercel/output/static`. O Bash local e `C:/Program Files/Git/bin/bash.exe`.

Na implementacao 77a4716/HEAD documental 0941164: check/build aprovados, Aurora 13/13, browser 10/10, form mockado 16/16, SEO 10/10, headers offline 6/6, seguranca 11 PASS/2 SKIP e JS 9.146 B gzip. CI verify/dependency-review/LHCI/headers-preview do PR #13 passou em 0941164: runs 39677407399, 39677452014 e 39677452042. A suite de modulos roda pelo CI; nao foi repetida por alteracao apenas documental.

Headers e Lighthouse de producao atuais nao foram sondados de novo. A evidencia historica de producao fica em 07-VERIFICATION e runs ali identificados; preview noindex usa auditorias SEO individuais. O audit passa com limiar high e exclusoes antigas; nao significa ausencia de advisories. INP de campo, estado de conta e checkpoints manuais nao sao certificados por mocks ou TBT.


## Requisito para verificacao

| ID | Estado | Teste / evidencia |
|---|---|---|
| ANIM-01 | COVERED | Reveal por IO/fire-once e fallback vigente; browser-gates reveal/fallback; tempos atualizados por s8u. |
| ANIM-03 | SUPERSEDED/EXCLUDED | Decisao expressa em REQUIREMENTS; nao e teste faltante |
| ANIM-04 | SUPERSEDED/EXCLUDED | Decisao expressa em REQUIREMENTS; nao e teste faltante |
| ANIM-05 | SUPERSEDED/EXCLUDED | Decisao expressa em REQUIREMENTS; nao e teste faltante |
| ANIM-06 | COVERED | Reduced-motion cobre efeitos atuais; browser-gates reduced; dmFloat/dmPulse antigos removidos. |
| ANIM-09 | COVERED | Gates de browser, budgets JS/LHCI e SEC-07; nao reativa glow/particulas removidos. |

## Mapa dos planos e tarefas

Tn indica ordem do task no XML do plano; o nome original e preservado. A coluna IDs identifica o contrato do PLAN; a matriz acima individualiza a evidencia de cada requisito. Checkpoints nao sao reescritos como testes automaticos novos.

| Tarefa | Plano | Onda | IDs do PLAN | Comportamento / nome original | Estado |
|---|---|---|---|---|---|
| 04-01-T1 | 04-01-PLAN | 1 | ANIM-05 | Task 1: Funções puras do canvas + suíte node:test | HISTORICAL/SUPERSEDED: D-12 |
| 04-01-T2 | 04-01-PLAN | 1 | ANIM-05 | Task 2: Script `test` no package.json e gate no CI | HISTORICAL/SUPERSEDED: D-12 |
| 04-02-T1 | 04-02-PLAN | 2 | ANIM-01, ANIM-03, ANIM-06, ANIM-09 | Task 1: reveal.ts e glow.ts | HISTORICAL/SUPERSEDED: D-12 |
| 04-02-T2 | 04-02-PLAN | 2 | ANIM-01, ANIM-03, ANIM-06, ANIM-09 | Task 2: effects.ts + as três adições no BaseLayout + token de empilhamento | COVERED: gate atual + evidencia SUMMARY |
| 04-03-T1 | 04-03-PLAN | 3 | ANIM-04, ANIM-05, ANIM-09 | Task 1: particles.ts — seed, tick, gate duplo de pausa e frame estático | HISTORICAL/SUPERSEDED: D-12 |
| 04-03-T2 | 04-03-PLAN | 3 | ANIM-04, ANIM-05, ANIM-09 | Task 2: ligar initParticles no bundle e medir o resultado | HISTORICAL/SUPERSEDED: D-12 |
| 04-04-T1 | 04-04-PLAN | 4 | ANIM-01, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-09 | Task 1: Verificação instrumentada dos três efeitos via Chrome DevTools Protocol | HISTORICAL/SUPERSEDED: D-12 |
| 04-04-T2 | 04-04-PLAN | 4 | ANIM-01, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-09 | Task 2: Preview real, gate do Lighthouse e arquivo de execução SEC-07 | COVERED: gate atual + evidencia SUMMARY |
| 04-04-T3 | 04-04-PLAN | 4 | ANIM-01, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-09 | Task 3: Aceite do Felipe — movimento, reduced-motion e sensação geral | HISTORICAL: checkpoint registrado |

## Onda 0 e verificacoes manuais

- [x] Infraestrutura exigida existe ou foi substituida por decisao identificada acima.
- [x] Testes/gates executados depois do build finalizado.
- [x] Checkpoints manuais historicos tem fonte identificada; nenhum aceite novo foi atribuido ao Felipe.
- [x] Comandos sem watch mode; nao houve alteracao de implementacao nesta reconciliacao.

As metas antigas de latencia local (<5/25/30/90/120 s) nao foram certificadas: build atual levou 3m13s e CI verify 2m5s. Registrar como desvio de feedback, sem declarar cumprimento por trocar uma flag. Conformidade Nyquist aqui descreve cobertura/rastreabilidade do escopo dos planos e checkpoints, nao elimina divida operacional, substitui revisao humana ou promete ausencia de falhas.

## Validation Audit 2026-10-21

| Metrica | Quantidade |
|---|---|
| PLANs lidos | 4 |
| Tarefas mapeadas | 9 |
| IDs de origem | 6 |
| IDs ativos cobertos | 3 |
| Lacunas novas de verificacao | 0 |
| Testes permanentes novos | 0 |
| Registros de estrategia corrigidos | 1 |

**Fechamento:** cobertura reconciliada. Nao e nova assinatura humana nem reatestado de contas/DNS/servicos. A auditoria do milestone preserva todos esses limites.
