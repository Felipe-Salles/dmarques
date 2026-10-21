---
phase: 7
slug: security-headers-finalize
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-19
updated: 2026-10-21
---

# Fase 7 — Estratégia de validação

Contrato auditado após a execução dos sete planos. Todos os requisitos possuem verificação automatizada; verificações humanas e evidências históricas são identificadas separadamente.

## Infraestrutura de testes

| Propriedade | Valor |
|------------|-------|
| Framework | node:test + gates Playwright/Chromium + Lighthouse CI |
| Configuração | package.json, ci.yml, headers.yml, lighthouse.yml, lighthouserc.json |
| Preparação | Terminar `pnpm build` antes dos testes que leem .vercel/output |
| Verificação rápida após build | `pnpm test` e `node scripts/verify/header-gates.mjs` |
| CSP no navegador | `node scripts/verify/browser-gates.mjs --check=csp` |
| CSP e formulário nativo | `node scripts/verify/form-gates.mjs --check=cspEnvio,semJsPostNativo` |
| Suíte completa | Após build: pnpm test, gates header/browser/form/form-card-height/aurora/seo, scripts/js-weight-check.sh e scripts/security-check.sh --ci |
| Produção | Definir PREVIEW_URL no ambiente e executar `node scripts/verify/header-gates.mjs --live --expect=enforce` |
| Shell | Comandos individuais em PowerShell; scripts .sh em Git Bash |
| Tempo observado | Build aproximadamente 3 minutos; unitários abaixo de 1 segundo; gate CSP abaixo de 1 minuto |

## Frequência de execução

- Após alterações: testes unitários e gates afetados.
- Após mudanças na CSP: build completo antes dos gates de cabeçalhos, navegador e formulário.
- Por PR: ci.yml executa testes, build, gates, auditoria e checklist.
- Por deployment: headers.yml valida preview/produção; lighthouse.yml aplica limites de desempenho.
- A estimativa original de 240 segundos para toda a suíte não foi remedida e não é uma garantia.

## Mapa de verificação por requisito

| Requisito | Comportamento | Teste / comando | Estado |
|-----------|---------------|-----------------|--------|
| SEC-01 | Cabeçalhos em HTML, 404, JS, imagem e API | header-rules.test.mjs; header-gates offline/live | COVERED: aprovados em 2026-10-21 |
| SEC-02 | Diretivas obrigatórias e ausência de unsafe-inline/unsafe-eval/meta CSP | header-rules.test.mjs; header-gates | COVERED: aprovados |
| SEC-02 | Rota global e alternância Report-Only/enforce | finalize-headers.test.mjs via pnpm test | COVERED: aprovado |
| SEC-02 | Script js-ready emitido e hash correspondente | js-ready.test.mjs; check jsReady | COVERED: aprovado sem skips após build |
| SEC-03 | Zero violações em todas as rotas e dois modos de movimento | browser-gates --check=csp | COVERED: 1 PASS / 0 FAIL |
| SEC-03 | CSP no envio JS/nativo e funcionamento sem JS | form-gates --check=cspEnvio,semJsPostNativo | COVERED: 2 PASS / 0 FAIL |
| SEC-03 | Report-Only antes da promoção | Gate live e SUMMARYs 07-04/05 | COVERED: runs históricos; enforce live revalidado |
| SEC-04 | Sem sourcemaps ou diagnóstico em erros | submit.test.mjs; header-gates artefatos; security-check 9/13; seo-gates | COVERED: aprovados |
| SEC-05 | Sem cargas externas; regra de SRI documentada | security-check 11; docs/seguranca-headers.md | COVERED: aprovado; SRI para recursos futuros |
| SEC-06 | curl e regressão em preview/produção | headers.yml; header-gates live | COVERED: workflow conferido, run histórico aprovado e live atual verde |
| SEC-10 | Ausência de ClientRouter/View Transitions | security-check 10; decisão em PROJECT.md | COVERED: aprovado |
| SEC-07 | Checklist final e registro de achados | security-check --ci; .planning/security/runs/phase-07.md | COVERED: 11 PASS / 0 FAIL / 2 SKIP, limites abaixo |
| PERF-01 | Lighthouse mobile >=95 nas quatro categorias | lighthouse.yml; lighthouserc.json | COVERED: run histórico aprovado; sem nova medição no HEAD |

O plano 07-04 exige JavaScript habilitado no contexto de POST nativo para registrar securitypolicyviolation. form.submit() contorna o enhancement e mantém form-action. O fluxo sem JS é exercitado separadamente por semJsPostNativo. Isso corresponde ao plano; não foi classificado como lacuna.

## Rastreabilidade por tarefa

| Tarefa | Onda | Requisitos | Verificação / evidência |
|--------|------|------------|-------------------------|
| 07-01-1 | 1 | SEC-01, SEC-06 | header-rules.test.mjs aprovado |
| 07-01-2 | 1 | SEC-01, SEC-06 | Build e header-gates offline aprovados |
| 07-01-3 | 1 | SEC-01, SEC-06 | SUMMARY 07-01: PROBE_RESULT merge-ok, run 39258569505 |
| 07-02-1 | 2 | SEC-02, SEC-03, SEC-04 | js-ready.test.mjs aprovado após build |
| 07-02-2 | 2 | SEC-02, SEC-03, SEC-04 | finalize-headers.test.mjs aprovado |
| 07-02-3 | 2 | SEC-02, SEC-03, SEC-04 | Build, headers e security-check aprovados com skips explícitos |
| 07-03-1 | 1 | SEC-04, SEC-05, SEC-10 | seo-gates: 10 PASS / 0 FAIL |
| 07-03-2 | 1 | SEC-04, SEC-05, SEC-10 | submit.test.mjs aprovado; astro check histórico no SUMMARY |
| 07-03-3 | 1 | SEC-04, SEC-05, SEC-10 | security-check 9–13 aprovados |
| 07-04-1 | 3 | SEC-03, SEC-02, SEC-05 | browser-gates csp aprovado; demais gates históricos no SUMMARY |
| 07-04-2 | 3 | SEC-03, SEC-02, SEC-05 | form-gates cspEnvio/semJsPostNativo aprovados |
| 07-04-3 | 3 | SEC-03, SEC-02, SEC-05 | SUMMARY: REPORT_ONLY_CLEAN yes, run 39260825312 |
| 07-05-1 | 4 | SEC-03, SEC-02, SEC-05, SEC-10 | Default enforce testado; build/gates aprovados; run histórico 39261830281 |
| 07-05-2 | 4 | SEC-03, SEC-02, SEC-05, SEC-10 | Docs de SRI e decisão SEC-10 conferidos |
| 07-06-1 | 5 | SEC-01, SEC-06, PERF-01 | PR #9 e checks registrados no SUMMARY |
| 07-06-2 | 5 | SEC-01, SEC-06, PERF-01 | Aprovação humana histórica; merge 98a0dbf |
| 07-06-3 | 5 | SEC-01, SEC-06, PERF-01 | Gate live atual aprovado; runs de produção reconfirmados |
| 07-07-1 | 6 | SEC-07, SEC-06, SEC-01, PERF-01 | Gate automatizado + A+/prévias atestados por Felipe |
| 07-07-2 | 6 | SEC-07, SEC-06, SEC-01, PERF-01 | Decisão humana defer registrada |
| 07-07-3 | 6 | SEC-07, SEC-06, SEC-01, PERF-01 | Run SEC-07 existe, sem High aberto; checklist atual com limites abaixo |

## Pré-requisitos da onda 0

- [x] Probe de preview registrado no SUMMARY 07-01.
- [x] headers.mjs e header-gates.mjs existem e passam.
- [x] Finalizador puro e testes existem e passam.
- [x] Script js-ready único e teste de hash aprovados após build.
- [x] headers.yml contém jobs preview com bypass e produção.
- [x] Documentação de cabeçalhos e run SEC-07 existem.

## Verificações humanas e externas

| Comportamento | Requisito | Motivo | Situação |
|---------------|-----------|--------|----------|
| securityheaders.com >=A | SEC-06 | Serviço externo | A+ atestado por Felipe em 2026-10-19; sem nova medição |
| Submissão ao preload HSTS | SEC-01 | Decisão humana e efeito externo | Adiada por Felipe; P07-003 aceito, reavaliar no marco 2 |
| Prévias sociais sob CORP/COOP | SEC-01 | Crawlers e caches externos | Atestadas por Felipe em 2026-10-19 |
| Aprovação de merge | Transversal | Regra do projeto | Aprovação do PR #9 histórica; esta auditoria não autoriza novo merge |
| Ausência de High aberto no registro | SEC-07 | Classificação exige revisão | Registro conferido; não equivale a audit de dependências limpo |

## Evidências e limites desta auditoria

- pnpm build: aprovado; finalizador enforce substituiu sete rotas CSP por uma global.
- pnpm test após build: 160 PASS, zero FAIL e zero SKIP.
- Header-gates offline: 6 PASS / 0 FAIL. poweredBy/status não fazem sondagem HTTP nesse modo.
- Header-gates live: 6 PASS / 0 FAIL em sete caminhos, sem WAF/AVISO; API GET 405. artefatos não inspeciona arquivos no modo live; a evidência vem do gate offline.
- SEO: 10 PASS / 0 FAIL. CSP navegador: 1 PASS / 0 FAIL. CSP formulário/nativo e sem JS: 2 PASS / 0 FAIL.
- security-check.sh --ci via Git Bash: 11 PASS / 0 FAIL / 2 SKIP. Itens 6/7 ignorados por PREVIEW_URL ausente; cabeçalhos têm sonda live separada, Lighthouse tem evidência histórica de CI.
- Runs reconfirmados por gh run view: [headers-production 39268752469](https://github.com/Felipe-Salles/dmarques/actions/runs/39268752469) e [lhci-production 39268752412](https://github.com/Felipe-Salles/dmarques/actions/runs/39268752412), ambos success em 98a0dbfe96fc4c37c8f0b11378652e81207022e0. Não são execuções novas no HEAD atual.
- P07-001 (Kaspersky afetando Lighthouse/form-gates live locais) permanece; sem novo Lighthouse nesta auditoria.
- O PASS do item 1 usa as exclusões de advisories existentes e não certifica audit limpo. P05-008 e demais pendências permanecem.
- Primeiras sondas locais iniciadas antes do término do build foram descartadas. Resultados locais acima vêm das repetições após o finalizador concluir.
- A suíte completa não foi repetida: executados os testes específicos da fase e consultadas evidências históricas dos demais gates.

## Auditoria de validação — 2026-10-21

| Métrica | Quantidade |
|---------|------------|
| Requisitos distintos mapeados | 9 |
| Tarefas mapeadas | 20 |
| Lacunas de testes no escopo dos planos | 0 |
| Testes novos necessários | 0 |
| Lacunas escaladas | 0 |
| Contrato de validação desatualizado corrigido | 1 |

Estado de entrada A: VALIDATION existente. Matriz, onda 0, comandos live e evidências atualizados. Sem lacunas de testes, aplicado o atalho do passo 3 para atualização direta; nenhum auditor delegado necessário.

## Fechamento

- [x] Todos os requisitos têm verificação automatizada identificada.
- [x] Tarefas e checkpoints humanos possuem evidências separadas.
- [x] Onda 0 concluída e referências existentes.
- [x] Comandos sem watch mode.
- [x] Testes repetidos após build, sem reaproveitar resultados preliminares inválidos.
- [x] Limites de ambiente, evidências históricas e pendências preservados.
- [x] nyquist_compliant: true confirmado no escopo dos planos.

Auditoria concluída em 2026-10-21. Conformidade Nyquist indica cobertura de verificação, sem encerrar riscos preexistentes ou certificar toda a segurança do projeto.
