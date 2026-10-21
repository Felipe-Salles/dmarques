---
phase: 03
slug: static-zero-js-sections-csp-safe-refactor-a11y
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-09-16
updated: 2026-10-21
---

# Fase 03 - Validacao Nyquist reconciliada

## Escopo vigente e historico

Hero Bleed, FAQ, CtaFinal, secao clara de diferenciais e politica sao escopos posteriormente substituidos por Aurora/D-29; nao criar regressao para exigir componentes aposentados. SITE/A11Y mantem os comportamentos semanticos, responsivos, estaticos e de teclado no sistema vigente. O solver de contraste era temporario por D-13, nao uma dependencia ausente a instalar. 03-09 transcreve aprovado e fecha design/SEC-07; a quick p0m recalcula contrastes de tokens atuais e exercita menu/skip e tres tamanhos. Sharp esta explicito e as imagens sao geradas no build. Nao afirmar teste humano de leitor de tela novo.

## Infraestrutura e evidencias compartilhadas

Estado A do workflow: VALIDATION existia e a fase tem PLAN/SUMMARY e VERIFICATION. Foram lidos os planos e resumos para mapear tarefas, IDs, arquivos e comandos; infraestrutura atual e estados historicos foram cruzados. Nao foram encontradas lacunas novas de comportamento sem verificacao: os itens aparentes eram registros pendentes, checkpoints ja resolvidos ou componentes intencionalmente substituidos. Aplicado o caminho do passo 3 diretamente ao passo 6, sem gerar testes redundantes nem modificar implementacao.

Comandos atuais: `pnpm check`, `pnpm test`, `pnpm build`, `node scripts/verify/aurora-gates.mjs`, `node scripts/verify/browser-gates.mjs`, `node scripts/verify/form-gates.mjs`, `node scripts/verify/seo-gates.mjs`, `node scripts/verify/header-gates.mjs`, `bash scripts/security-check.sh --ci` e `bash scripts/js-weight-check.sh .vercel/output/static`. O Bash local e `C:/Program Files/Git/bin/bash.exe`.

Na implementacao 77a4716/HEAD documental 0941164: check/build aprovados, Aurora 13/13, browser 10/10, form mockado 16/16, SEO 10/10, headers offline 6/6, seguranca 11 PASS/2 SKIP e JS 9.146 B gzip. CI verify/dependency-review/LHCI/headers-preview do PR #13 passou em 0941164: runs 39677407399, 39677452014 e 39677452042. A suite de modulos roda pelo CI; nao foi repetida por alteracao apenas documental.

Headers e Lighthouse de producao atuais nao foram sondados de novo. A evidencia historica de producao fica em 07-VERIFICATION e runs ali identificados; preview noindex usa auditorias SEO individuais. O audit passa com limiar high e exclusoes antigas; nao significa ausencia de advisories. INP de campo, estado de conta e checkpoints manuais nao sao certificados por mocks ou TBT.


## Requisito para verificacao

| ID | Estado | Teste / evidencia |
|---|---|---|
| SITE-01 | COVERED | Composicao estatica segue Aurora apos D-02; structure gate e inspecao atual. |
| SITE-02 | COVERED | Hero legado substituido pela Aurora e PR #8; HTML estatico, CTAs e fallback CSS verificados. |
| SITE-03 | COVERED | Collections/getters abastecem secoes; build/schema e structure/cta/contact. |
| SITE-04 | COVERED | Sem atributo style=; security-check 2, CSP e estilos externos. |
| SITE-05 | COVERED | Anchors/scroll e reduced-motion; browser-gates reduced/reveal e nav atual. |
| SITE-06 | COVERED | Menu nativo details, CTA externo e teclado; inspecao Enter/Tab/Enter e gate targets. |
| SITE-07 | COVERED | Obrigado e destinos estaticos; politica removida por D-29. secondary e form-gates. |
| SITE-08 | COVERED | 404 branded atual em build e csp/headers; Vercel historico em 03-09/07 e headers-preview atual. |
| SITE-09 | COVERED | Sharp e imagens em build com dimensoes/formats; build atual e PERF-05. |
| ANIM-02 | COVERED | HTML visivel sem JS; browser-gates nojs/fallback. |
| ANIM-07 | COVERED | Hover/foco CSS e estados preservados; contratos source/gates e inspecao vigente. |
| ANIM-08 | COVERED | Sem scroll-jacking/parallax/preloader; anchors nativas e reduced/fallback; hero fixado rejeitado no sketch. |
| SEO-02 | COVERED | html lang pt-BR em BaseLayout e paginas construidas. |
| A11Y-01 | COVERED | Skip primeiro foco visivel; hash #conteudo e proximo Tab no main, confirmado por browser e CLI na quick p0m. |
| A11Y-02 | COVERED | Landmarks/H1/lang pt-BR e headings semanticos; render, snapshot e SEO/Lighthouse. |
| A11Y-03 | COVERED | Focus-visible ciano; calculo atual 9,33:1 no menu, teclado e aceite historico 03-09. |
| A11Y-04 | COVERED | Menu, CTA e canais/chips operaveis; inspecao teclado e form-gates. |
| A11Y-05 | COVERED | Retrato carregado com alt real e decoracoes escondidas; inspecao e artefatos atuais. |
| A11Y-06 | COVERED | Aceite historico D-13/03-09, paleta Aurora posterior e contraste calculado no polish; Lighthouse de acessibilidade verde. |
| A11Y-07 | COVERED | browser-gates reduced/nojs/fallback; loops none sob reduce em tres tamanhos. |
| PERF-05 | COVERED | Imagem em build Sharp, sem otimizacao de runtime; config e output aprovados. |

## Mapa dos planos e tarefas

Tn indica ordem do task no XML do plano; o nome original e preservado. A coluna IDs identifica o contrato do PLAN; a matriz acima individualiza a evidencia de cada requisito. Checkpoints nao sao reescritos como testes automaticos novos.

| Tarefa | Plano | Onda | IDs do PLAN | Comportamento / nome original | Estado |
|---|---|---|---|---|---|
| 03-01-T1 | 03-01-PLAN | 1 | SITE-09, PERF-05 | Task 1: Promover sharp a devDependency explícita pinada | COVERED: gate atual + evidencia SUMMARY |
| 03-01-T2 | 03-01-PLAN | 1 | SITE-09, PERF-05 | Task 2: Gerar os dois assets placeholder branded via Sharp | COVERED: gate atual + evidencia SUMMARY |
| 03-02-T1 | 03-02-PLAN | 1 | A11Y-03, A11Y-06, A11Y-07, ANIM-02, ANIM-07, ANIM-08, SITE-05 | Task 1: Criar o verificador de contraste WCAG (scaffold Wave 0) | COVERED: gate atual + evidencia SUMMARY |
| 03-02-T2 | 03-02-PLAN | 1 | A11Y-03, A11Y-06, A11Y-07, ANIM-02, ANIM-07, ANIM-08, SITE-05 | Task 2: Aplicar as correcoes de contraste e adicionar --nav-height em tokens.css | COVERED: gate atual + evidencia SUMMARY |
| 03-02-T3 | 03-02-PLAN | 1 | A11Y-03, A11Y-06, A11Y-07, ANIM-02, ANIM-07, ANIM-08, SITE-05 | Task 3: Escrever os contratos globais em base.css (foco, scroll, reveal, keyframes) | COVERED: gate atual + evidencia SUMMARY |
| 03-03-T1 | 03-03-PLAN | 2 | SITE-06, SITE-07, SITE-08, A11Y-01, A11Y-02, A11Y-04, A11Y-07, ANIM-07, SEO-02 | Task 1: SiteHeader.astro — skip link, nav desktop, disclosure mobile e CTA | COVERED: gate atual + evidencia SUMMARY |
| 03-03-T2 | 03-03-PLAN | 2 | SITE-06, SITE-07, SITE-08, A11Y-01, A11Y-02, A11Y-04, A11Y-07, ANIM-07, SEO-02 | Task 2: As três rotas utilitárias (/obrigado, /politica-de-privacidade, /404) | COVERED: gate atual + evidencia SUMMARY |
| 03-04-T1 | 03-04-PLAN | 2 | SITE-02, SITE-09, A11Y-02, A11Y-05, ANIM-02, ANIM-07, PERF-05 | Task 1: HeroBleed.astro — o Hero "03 Bleed" fiel, zero JS | COVERED: gate atual + evidencia SUMMARY |
| 03-04-T2 | 03-04-PLAN | 2 | SITE-02, SITE-09, A11Y-02, A11Y-05, ANIM-02, ANIM-07, PERF-05 | Task 2: AboutSection.astro — retrato do fundador com alt real e bio | COVERED: gate atual + evidencia SUMMARY |
| 03-05-T1 | 03-05-PLAN | 2 | SITE-01, SITE-03, SITE-04, A11Y-02, A11Y-06, ANIM-02, ANIM-07 | Task 1: ServicesSection.astro — 4 cards vindos da collection, com mapa de ícones | COVERED: gate atual + evidencia SUMMARY |
| 03-05-T2 | 03-05-PLAN | 2 | SITE-01, SITE-03, SITE-04, A11Y-02, A11Y-06, ANIM-02, ANIM-07 | Task 2: ProcessSection.astro — 4 etapas numeradas vindas da collection | COVERED: gate atual + evidencia SUMMARY |
| 03-06-T1 | 03-06-PLAN | 2 | SITE-01, SITE-03, SITE-04, A11Y-02, A11Y-06, ANIM-02, ANIM-07 | Task 1: DifferentiatorsSection.astro — grade clara com numeração derivada e contraste corrigido | COVERED: gate atual + evidencia SUMMARY |
| 03-06-T2 | 03-06-PLAN | 2 | SITE-01, SITE-03, SITE-04, A11Y-02, A11Y-06, ANIM-02, ANIM-07 | Task 2: FaqSection.astro — 4 pares pergunta/resposta como fonte única | COVERED: gate atual + evidencia SUMMARY |
| 03-07-T1 | 03-07-PLAN | 2 | SITE-01, SITE-03, SITE-04, A11Y-02, A11Y-04, A11Y-06, ANIM-02, ANIM-07 | Task 1: ContactSection.astro — coluna de argumentos + formulário estático de 5 campos | COVERED: gate atual + evidencia SUMMARY |
| 03-07-T2 | 03-07-PLAN | 2 | SITE-01, SITE-03, SITE-04, A11Y-02, A11Y-04, A11Y-06, ANIM-02, ANIM-07 | Task 2: CtaFinal.astro — bloco de chamada final | COVERED: gate atual + evidencia SUMMARY |
| 03-07-T3 | 03-07-PLAN | 2 | SITE-01, SITE-03, SITE-04, A11Y-02, A11Y-04, A11Y-06, ANIM-02, ANIM-07 | Task 3: SiteFooter.astro — navegação, contato, NAP e watermark decorativo | COVERED: gate atual + evidencia SUMMARY |
| 03-08-T1 | 03-08-PLAN | 3 | SITE-01, SITE-03, SITE-04, SITE-05, A11Y-01, A11Y-02, A11Y-04, ANIM-02, ANIM-07, SEO-02, PERF-05 | Task 1: Compor index.astro com as 9 seções na ordem de SITE-01 | COVERED: gate atual + evidencia SUMMARY |
| 03-08-T2 | 03-08-PLAN | 3 | SITE-01, SITE-03, SITE-04, SITE-05, A11Y-01, A11Y-02, A11Y-04, ANIM-02, ANIM-07, SEO-02, PERF-05 | Task 2: Medir a altura real do cabeçalho e fixar --nav-height | COVERED: gate atual + evidencia SUMMARY |
| 03-08-T3 | 03-08-PLAN | 3 | SITE-01, SITE-03, SITE-04, SITE-05, A11Y-01, A11Y-02, A11Y-04, ANIM-02, ANIM-07, SEO-02, PERF-05 | Task 3: Rodar a bateria completa de gates locais da fase | COVERED: gate atual + evidencia SUMMARY |
| 03-09-T1 | 03-09-PLAN | 4 | SITE-06, SITE-08, SITE-09, A11Y-01, A11Y-03, A11Y-04, A11Y-06, A11Y-07, ANIM-02, ANIM-07, PERF-05 | Task 1: Verificações automatizadas contra o preview real da fase | COVERED: gate atual + evidencia SUMMARY |
| 03-09-T2 | 03-09-PLAN | 4 | SITE-06, SITE-08, SITE-09, A11Y-01, A11Y-03, A11Y-04, A11Y-06, A11Y-07, ANIM-02, ANIM-07, PERF-05 | Task 2: Escrever o arquivo de execução SEC-07 da fase 3 | COVERED: gate atual + evidencia SUMMARY |
| 03-09-T3 | 03-09-PLAN | 4 | SITE-06, SITE-08, SITE-09, A11Y-01, A11Y-03, A11Y-04, A11Y-06, A11Y-07, ANIM-02, ANIM-07, PERF-05 | Task 3: Aceite do Felipe — teclado, sem JS, contraste e fidelidade visual | HISTORICAL: checkpoint registrado |

## Onda 0 e verificacoes manuais

- [x] Infraestrutura exigida existe ou foi substituida por decisao identificada acima.
- [x] Testes/gates executados depois do build finalizado.
- [x] Checkpoints manuais historicos tem fonte identificada; nenhum aceite novo foi atribuido ao Felipe.
- [x] Comandos sem watch mode; nao houve alteracao de implementacao nesta reconciliacao.

As metas antigas de latencia local (<5/25/30/90/120 s) nao foram certificadas: build atual levou 3m13s e CI verify 2m5s. Registrar como desvio de feedback, sem declarar cumprimento por trocar uma flag. Conformidade Nyquist aqui descreve cobertura/rastreabilidade do escopo dos planos e checkpoints, nao elimina divida operacional, substitui revisao humana ou promete ausencia de falhas.

## Validation Audit 2026-10-21

| Metrica | Quantidade |
|---|---|
| PLANs lidos | 9 |
| Tarefas mapeadas | 22 |
| IDs de origem | 21 |
| IDs ativos cobertos | 21 |
| Lacunas novas de verificacao | 0 |
| Testes permanentes novos | 0 |
| Registros de estrategia corrigidos | 1 |

**Fechamento:** cobertura reconciliada. Nao e nova assinatura humana nem reatestado de contas/DNS/servicos. A auditoria do milestone preserva todos esses limites.
