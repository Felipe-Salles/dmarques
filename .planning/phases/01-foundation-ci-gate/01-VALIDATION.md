---
phase: 01
slug: foundation-ci-gate
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-09-05
updated: 2026-10-21
---

# Fase 01 - Validacao Nyquist reconciliada

## Escopo vigente e historico

Fontes antigas, vercel.json vazio, zero Functions e categorias SEO de preview eram estados transitorios. O contrato vigente usa fontes Aurora, headers/CSP finais, exatamente uma Function e jobs de preview/producao separados. Nao exigir que HEAD seja main nem criar/mesclar um PR de prova novo para repetir a simulacao destrutiva: 01-07 preserva as tres falhas controladas e os checks bloqueantes. Protecao da main foi consultada agora: strict true, verify/dependency-review/lhci requeridos, force-push/delecao falsos e historico linear true. 01-HUMAN-UAT tem status resolved, tres testes passados; a rotacao/2FA/spend sao evidencias historicas identificadas, nao mudancas de conta novas.

## Infraestrutura e evidencias compartilhadas

Estado A do workflow: VALIDATION existia e a fase tem PLAN/SUMMARY e VERIFICATION. Foram lidos os planos e resumos para mapear tarefas, IDs, arquivos e comandos; infraestrutura atual e estados historicos foram cruzados. Nao foram encontradas lacunas novas de comportamento sem verificacao: os itens aparentes eram registros pendentes, checkpoints ja resolvidos ou componentes intencionalmente substituidos. Aplicado o caminho do passo 3 diretamente ao passo 6, sem gerar testes redundantes nem modificar implementacao.

Comandos atuais: `pnpm check`, `pnpm test`, `pnpm build`, `node scripts/verify/aurora-gates.mjs`, `node scripts/verify/browser-gates.mjs`, `node scripts/verify/form-gates.mjs`, `node scripts/verify/seo-gates.mjs`, `node scripts/verify/header-gates.mjs`, `bash scripts/security-check.sh --ci` e `bash scripts/js-weight-check.sh .vercel/output/static`. O Bash local e `C:/Program Files/Git/bin/bash.exe`.

Na implementacao 77a4716/HEAD documental 0941164: check/build aprovados, Aurora 13/13, browser 10/10, form mockado 16/16, SEO 10/10, headers offline 6/6, seguranca 11 PASS/2 SKIP e JS 9.146 B gzip. CI verify/dependency-review/LHCI/headers-preview do PR #13 passou em 0941164: runs 39677407399, 39677452014 e 39677452042. A suite de modulos roda pelo CI; nao foi repetida por alteracao apenas documental.

Headers e Lighthouse de producao atuais nao foram sondados de novo. A evidencia historica de producao fica em 07-VERIFICATION e runs ali identificados; preview noindex usa auditorias SEO individuais. O audit passa com limiar high e exclusoes antigas; nao significa ausencia de advisories. INP de campo, estado de conta e checkpoints manuais nao sao certificados por mocks ou TBT.


## Requisito para verificacao

| ID | Estado | Teste / evidencia |
|---|---|---|
| INFRA-01 | COVERED | Astro static, uma Function e saida HTML; build/security-check 5. |
| INFRA-02 | COVERED | Scripts dev/check/build presentes; check/build atuais aprovados. |
| INFRA-03 | COVERED | Fontes self-host, families atuais Aurora; fonts gate e sem terceiros. |
| INFRA-04 | COVERED | Tokens unicos consumidos; aurora-gates tokens e render atual. |
| INFRA-05 | COVERED | inlineStylesheets never; security-check 3 aceita somente Fonts API. |
| INFRA-06 | COVERED | Segredos server-only e varredura do cliente; security-check 4. |
| INFRA-07 | COVERED | Deploy Vercel e preview por PR; deployment do PR #13 aprovado. |
| INFRA-08 | COVERED | CI de check/build/test/audit/review; verify e dependency-review atuais aprovados; provas de falha historicas 01-07. |
| INFRA-09 | COVERED | Lighthouse de preview e producao separados, assert error e budgets; lhci atual aprovado. |
| INFRA-10 | COVERED | Protecao da main reconsultada em 2026-10-21; 2FA/bypass/spend sao checkpoints historicos 01-HUMAN-UAT resolvido. |
| SEC-07 | COVERED | Checklist/run por fase e security-check atual 11 PASS/2 SKIP; sem novo High aberto, audit com allowlist existente. |
| PERF-01 | COVERED | lhci do PR #13 verde; categorias de producao em error; ultima producao aprovada em 07-VERIFICATION. |
| PERF-02 | COVERED | Budgets LCP/CLS/TBT do LHCI; INP de campo explicitamente adiado, nao inferido do TBT. |
| PERF-03 | COVERED | js-weight-check: 9.146 B gzip, abaixo de 20.480 e sem framework/lib de animacao. |
| PERF-04 | COVERED | Fonts API, dois preloads e display swap; fonts gate/build. |

## Mapa dos planos e tarefas

Tn indica ordem do task no XML do plano; o nome original e preservado. A coluna IDs identifica o contrato do PLAN; a matriz acima individualiza a evidencia de cada requisito. Checkpoints nao sao reescritos como testes automaticos novos.

| Tarefa | Plano | Onda | IDs do PLAN | Comportamento / nome original | Estado |
|---|---|---|---|---|---|
| 01-01-T1 | 01-01-PLAN | 1 | INFRA-01, INFRA-02, INFRA-03, INFRA-05, INFRA-06 | Task 1: Scaffold the Astro project and install the pinned dependency set | COVERED: gate atual + evidencia SUMMARY |
| 01-01-T2 | 01-01-PLAN | 1 | INFRA-01, INFRA-02, INFRA-03, INFRA-05, INFRA-06 | Task 2: Author astro.config.mjs | COVERED: gate atual + evidencia SUMMARY |
| 01-01-T3 | 01-01-PLAN | 1 | INFRA-01, INFRA-02, INFRA-03, INFRA-05, INFRA-06 | Task 3: Author the root config files and package.json scripts | COVERED: gate atual + evidencia SUMMARY |
| 01-02-T1 | 01-02-PLAN | 2 | INFRA-02, INFRA-03, INFRA-04, INFRA-05, PERF-04 | Task 1: Author tokens.css and base.css | COVERED: gate atual + evidencia SUMMARY |
| 01-02-T2 | 01-02-PLAN | 2 | INFRA-02, INFRA-03, INFRA-04, INFRA-05, PERF-04 | Task 2: Author BaseLayout.astro and the placeholder index page | COVERED: gate atual + evidencia SUMMARY |
| 01-02-T3 | 01-02-PLAN | 2 | INFRA-02, INFRA-03, INFRA-04, INFRA-05, PERF-04 | Task 3: Build, resolve and export STATIC_DIR, and assert the phase-1 output signals | COVERED: gate atual + evidencia SUMMARY |
| 01-03-T1 | 01-03-PLAN | 3 | PERF-03, INFRA-06, SEC-07 | Task 1: Author scripts/js-weight-check.sh | COVERED: gate atual + evidencia SUMMARY |
| 01-03-T2 | 01-03-PLAN | 3 | PERF-03, INFRA-06, SEC-07 | Task 2: Author scripts/security-check.sh | COVERED: gate atual + evidencia SUMMARY |
| 01-03-T3 | 01-03-PLAN | 3 | PERF-03, INFRA-06, SEC-07 | Task 3: Author the SEC-07 security checklist gabarito | COVERED: gate atual + evidencia SUMMARY |
| 01-04-T1 | 01-04-PLAN | 3 | INFRA-08, INFRA-09, PERF-01, PERF-02, PERF-03 | Task 1: Author lighthouserc.json and record the PERF-02 INP deferral | COVERED: gate atual + evidencia SUMMARY |
| 01-04-T2 | 01-04-PLAN | 3 | INFRA-08, INFRA-09, PERF-01, PERF-02, PERF-03 | Task 2: Author .github/workflows/ci.yml | COVERED: gate atual + evidencia SUMMARY |
| 01-04-T3 | 01-04-PLAN | 3 | INFRA-08, INFRA-09, PERF-01, PERF-02, PERF-03 | Task 3: Author .github/workflows/lighthouse.yml | COVERED: gate atual + evidencia SUMMARY |
| 01-05-T1 | 01-05-PLAN | 4 | INFRA-08, INFRA-10 | Task 1: Approve repository creation and confirm the audit severity threshold | HISTORICAL: checkpoint registrado |
| 01-05-T2 | 01-05-PLAN | 4 | INFRA-08, INFRA-10 | Task 2: Grant the gh token the workflow scope | HISTORICAL: checkpoint registrado |
| 01-05-T3 | 01-05-PLAN | 4 | INFRA-08, INFRA-10 | Task 3: Rename the branch, create the remote, and push | COVERED: gate atual + evidencia SUMMARY |
| 01-06-T1 | 01-06-PLAN | 5 | INFRA-07, INFRA-10 | Task 1: Decide the spend-cap mechanism (Hobby structural cap vs Vercel Pro) | HISTORICAL: checkpoint registrado |
| 01-06-T2 | 01-06-PLAN | 5 | INFRA-07, INFRA-10 | Task 2: Link and harden the Vercel project | HISTORICAL: checkpoint registrado |
| 01-06-T3 | 01-06-PLAN | 5 | INFRA-07, INFRA-10 | Task 3: Verify preview protection and bypass behaviour end to end | HISTORICAL: checkpoint registrado |
| 01-07-T1 | 01-07-PLAN | 6 | INFRA-07, INFRA-08, INFRA-09, INFRA-10, PERF-01, PERF-02, PERF-03 | Task 1a: Prove the gates BLOCK | COVERED: gate atual + evidencia SUMMARY |
| 01-07-T2 | 01-07-PLAN | 6 | INFRA-07, INFRA-08, INFRA-09, INFRA-10, PERF-01, PERF-02, PERF-03 | Task 1b: Prove the gates PASS, capture the check contexts, and read the Lighthouse numbers | COVERED: gate atual + evidencia SUMMARY |
| 01-07-T3 | 01-07-PLAN | 6 | INFRA-07, INFRA-08, INFRA-09, INFRA-10, PERF-01, PERF-02, PERF-03 | Task 2: Apply and verify branch protection on main | COVERED: gate atual + evidencia SUMMARY |
| 01-07-T4 | 01-07-PLAN | 6 | INFRA-07, INFRA-08, INFRA-09, INFRA-10, PERF-01, PERF-02, PERF-03 | Task 3: Merge the proof pull request and confirm the production deployment | COVERED: gate atual + evidencia SUMMARY |
| 01-08-T1 | 01-08-PLAN | 7 | SEC-07, INFRA-10 | Task 1: Run the full security check against the preview and author the phase-01 run file | COVERED: gate atual + evidencia SUMMARY |
| 01-08-T2 | 01-08-PLAN | 7 | SEC-07, INFRA-10 | Task 2: Phase 1 security sign-off | HISTORICAL: checkpoint registrado |

## Onda 0 e verificacoes manuais

- [x] Infraestrutura exigida existe ou foi substituida por decisao identificada acima.
- [x] Testes/gates executados depois do build finalizado.
- [x] Checkpoints manuais historicos tem fonte identificada; nenhum aceite novo foi atribuido ao Felipe.
- [x] Comandos sem watch mode; nao houve alteracao de implementacao nesta reconciliacao.

As metas antigas de latencia local (<5/25/30/90/120 s) nao foram certificadas: build atual levou 3m13s e CI verify 2m5s. Registrar como desvio de feedback, sem declarar cumprimento por trocar uma flag. Conformidade Nyquist aqui descreve cobertura/rastreabilidade do escopo dos planos e checkpoints, nao elimina divida operacional, substitui revisao humana ou promete ausencia de falhas.

## Validation Audit 2026-10-21

| Metrica | Quantidade |
|---|---|
| PLANs lidos | 8 |
| Tarefas mapeadas | 24 |
| IDs de origem | 15 |
| IDs ativos cobertos | 15 |
| Lacunas novas de verificacao | 0 |
| Testes permanentes novos | 0 |
| Registros de estrategia corrigidos | 1 |

**Fechamento:** cobertura reconciliada. Nao e nova assinatura humana nem reatestado de contas/DNS/servicos. A auditoria do milestone preserva todos esses limites.
