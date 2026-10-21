---
phase: 07
slug: security-headers-finalize
status: verified
threats_open: 0
asvs_level: 1
created: 2026-10-21
register_authored_at_plan_time: true
---

# Fase 07 — Verificação de segurança

Verificação das 34 ameaças dos sete PLANs da fase, sobre o código em `5f31b8bed5fcfe587f0d10e79fbda9122681686e`: 32 mitigações verificadas e 2 riscos existentes consolidados, sem ameaça aberta no escopo. Nenhuma alteração de implementação.

`asvs_level: 1` é a referência do template, sem certificar todos os controles ASVS. A chave `workflow.security_enforcement` está ausente; aplicado o padrão `true` do workflow.

## Fronteiras de confiança

| Fronteira | Descrição | Dados |
|-----------|-----------|-------|
| Internet → Vercel → navegador | Políticas globais para HTML, assets, 404 e API | Conteúdo público e cabeçalhos |
| Navegador → API | Corpo não confiável e respostas de erro | Dados pessoais mínimos |
| Build → saída pública | Hashes e rotas determinam a política | HTML/CSS/JS; sem segredos ou sourcemaps |
| GitHub Actions → preview | Sondas com bypass | Segredo via env/cabeçalho |
| Branch → main/produção | Publicação com aprovação | Código e política |
| Domínio → lista de preload | Estado externo de reversão lenta | Domínio e exigência de HTTPS |

## Registro de ameaças

IDs, categorias e disposições dos PLANs preservados; componentes resumidos em português. `closed` significa mitigação encontrada ou risco documentado, sem garantir ausência absoluta de risco.

| Threat ID | Category | Component | Disposition | Mitigation / evidência | Status |
|-----------|----------|-----------|-------------|-----------------------|--------|
| T-07-01 | Spoofing | Downgrade TLS | mitigate | `vercel.json`: HSTS global; gate live atual. Limite da primeira visita em T-07-34. | closed |
| T-07-02 | Tampering | Clickjacking | mitigate | `vercel.json`: DENY; `astro.config.mjs`: frame-ancestors none. | closed |
| T-07-03 | Tampering | MIME sniffing | mitigate | nosniff global, inclusive asset JS no gate live. | closed |
| T-07-04 | Information disclosure | Vazamentos entre origens | mitigate | COOP same-origin, CORP same-site e Referrer-Policy restritiva; gate live. | closed |
| T-07-05 | Information disclosure | Segredo de bypass no CI | mitigate | `headers.yml`: segredo via env, host validado antes do uso; gate não imprime cabeçalhos de requisição. | closed |
| T-07-06 | Denial of service | Sonda bloqueada pela WAF | accept | R-07-01; GET único à API, AVISO em bloqueio; perPath reprova conjunto totalmente ignorado. | closed |
| T-07-07 | Tampering | Plataforma não aplica cabeçalhos | mitigate | SUMMARY 07-01: PROBE_RESULT merge-ok; gate live atual confirma cabeçalhos. | closed |
| T-07-08 | Tampering | Script inline injetado | mitigate | Config com hashes; `headers.mjs` rejeita unsafe-inline/unsafe-eval; gate live. | closed |
| T-07-09 | Tampering | Sequestro de base/formulário | mitigate | CSP: base-uri none, form-action self, object-src none. | closed |
| T-07-10 | Tampering | Clickjacking | mitigate | frame-ancestors none por cabeçalho global. | closed |
| T-07-11 | Denial of service | Hash incorreto | mitigate | JS_READY compartilhado pelo layout/config, teste de hash; collectCsp rejeita divergência. Report-Only em 07-04, promoção em 07-05. | closed |
| T-07-12 | Information disclosure | Sourcemaps públicos | mitigate | Config sourcemap false; gate artefatos e verificação 9 de security-check.sh. | closed |
| T-07-13 | Tampering | CSP ausente em 404/API | mitigate | reshapeRoutes: /(.*) com continue antes de filesystem; erro sem CSP/sem filesystem; gate live. | closed |
| T-07-14 | Information disclosure | Diagnóstico de falha da Function | mitigate | orcamento.ts: catch externo com return await; failureResponse genérica; testes de falha aprovados. | closed |
| T-07-15 | Information disclosure | Stack/caminhos em páginas de erro | mitigate | 404.astro, 500.astro e erro-envio/[motivo].astro: conteúdo genérico; verificação 13. | closed |
| T-07-16 | Information disclosure | Sourcemaps | mitigate | Verificação 9 e gate artefatos inspecionam arquivos estáticos e Functions. | closed |
| T-07-17 | Tampering | Asset externo comprometido | mitigate | Verificação 11 bloqueia cargas externas; SRI documentado em docs/seguranca-headers.md. | closed |
| T-07-18 | Tampering | View Transitions quebram listeners/CSP | mitigate | Verificação 10 bloqueia ClientRouter/transitions; decisão SEC-10 documentada. | closed |
| T-07-19 | Tampering | Meta CSP interfere em Report-Only | mitigate | Verificação 12 e gate artefatos bloqueiam meta CSP. | closed |
| T-07-20 | Denial of service | CSP bloqueia funcionalidade | mitigate | SUMMARY 07-04: REPORT_ONLY_CLEAN yes; browser/form-gates e csp-recorder cobrem carga/envio. | closed |
| T-07-21 | Information disclosure | Relatório enviado a terceiro | mitigate | Config sem report-uri/report-to; recorder restrito ao harness. | closed |
| T-07-22 | Information disclosure | Bypass nos logs | mitigate | Segredo via env; recorder registra diretiva/URI/origem/linha, sem cabeçalhos de requisição. | closed |
| T-07-23 | Denial of service | Teste envia e-mail ou aciona WAF | mitigate | live cspEnvio preenche honeypot e exige um POST; isBot retorna antes de rateLimit/send. Job de produção executa apenas carga. | closed |
| T-07-24 | Tampering | CSP enfraquecida para silenciar violação | mitigate | checkCsp rejeita unsafe-inline/unsafe-eval; política atual e gate live confirmam ausência. | closed |
| T-07-25 | Denial of service | Regressão ao promover CSP | mitigate | SUMMARYs 07-04/05: promoção após Report-Only limpo; rollback CSP_MODE e redeploy documentado. | closed |
| T-07-26 | Tampering | Injeção após promoção | mitigate | DEFAULT_CSP_MODE enforce; withUpgrade; CSP por hash observada no gate live. | closed |
| T-07-27 | Repudiation | Mudança sem trilha | mitigate | SUMMARY 07-05: promoção 8ae55f2, correção 3297832; run e decisão documentados. | closed |
| T-07-28 | Tampering | Futuro asset sem integridade | mitigate | SRI sha384/URL fixa documentado; verificação 11 bloqueia origens externas hoje. | closed |
| T-07-29 | Elevation of privilege | Publicação sem aprovação | mitigate | SUMMARY 07-06 registra aprovação explícita de Felipe para PR #9 e merge 98a0dbf. | closed |
| T-07-30 | Spoofing | HSTS da apex enfraquecido | mitigate | Gate live atual valida HSTS completo na apex; ressalva do redirect www no run SEC-07. | closed |
| T-07-31 | Denial of service | Regressão em produção | mitigate | Runs históricos headers/lhci-production verdes; rollback documentado; cabeçalhos revalidados. | closed |
| T-07-32 | Denial of service | Preload bloqueia subdomínio HTTP | mitigate | SUMMARY 07-07: Felipe escolheu defer; nenhuma submissão nesta auditoria. includeSubDomains permanece ativo. | closed |
| T-07-33 | Repudiation | Postura sem registro | mitigate | Run SEC-07 com saída verbatim, ressalvas, A+ atestado e URLs; este relatório consolida ameaças. | closed |
| T-07-34 | Spoofing | Downgrade na primeira visita | accept | R-07-02; decisão defer de Felipe em SUMMARY 07-07 e P07-003. | closed |

## Riscos aceitos

| Risk ID | Threat Ref | Justificativa e limite | Aceito por / origem | Data |
|---------|------------|------------------------|---------------------|------|
| R-07-01 | T-07-06 | GET único pode receber bloqueio WAF tratado como AVISO. Resposta ignorada não é validada. Gate falha se todas forem ignoradas; nenhuma foi nesta execução. | Disposição accept existente no 07-01-PLAN.md; consolidada sem nova aceitação | 2026-10-19 |
| R-07-02 | T-07-34 | Sem preload, primeira visita pode sofrer downgrade antes de aprender HSTS. Reavaliar com marco 2/Cloudflare até 2026-12-31; conferir subdomínios antes de submeter. Adiar submissão não remove includeSubDomains do cabeçalho atual. | Felipe Salles: defer, SUMMARY 07-07 e P07-003 | 2026-10-19 |

## Evidências e limites

- `pnpm test` em 2026-10-21: 160 aprovados, zero falhas.
- `pnpm build`: aprovado; finalizador em enforce substituiu 7 rotas CSP por uma global. Gate offline: 6 PASS / 0 FAIL, incluindo inspeção de sourcemaps e ausência de meta CSP no build atual.
- `security-check.sh --ci` via Git Bash: 11 PASS / 0 FAIL / 2 SKIP. Verificações 6 (curl) e 7 (Lighthouse) não executadas por ausência de PREVIEW_URL; cabeçalhos cobertos pelo gate live separado. A aprovação do item 1 depende das exclusões de advisories detalhadas abaixo.
- Gate live enforcing em produção: 6 PASS / 0 FAIL; sete caminhos, sem AVISO/WAF: home, obrigado com/sem barra, 404, JS, imagem OG e API GET 405. O check artefatos não inspeciona arquivos no modo live; depende do gate offline.
- `gh run view` reconfirmou success dos runs históricos 39268752469 (headers) e 39268752412 (Lighthouse), ambos em 98a0dbfe96fc4c37c8f0b11378652e81207022e0. Não representam nova execução ou Lighthouse no HEAD atual.
- Report-Only/promoção: SUMMARYs 07-04/05, runs 39260825312 e 39261830281. A+ e prévias sociais são atestados anteriores de Felipe, sem nova medição.
- Nenhum SUMMARY contém seção literal Threat Flags. Desvios e pendências foram consultados: P07-001 (Kaspersky local), P06-002 (notas Lighthouse), P05-008 (dependências) e P05-003 (plano Vercel) continuam no acompanhamento existente, sem nova aceitação ou encerramento por este relatório.
- `pnpm audit --audit-level=high` retornou exit 0, mas informou 8 moderate e 2 high ignoradas na configuração existente. Isso não é audit limpo; P05-008 permanece. Fechar estas 34 ameaças não certifica toda a cadeia de dependências.
- Correções WR-01/02/04 conferidas: falha sem build, falha para conjunto totalmente ignorado pela WAF e validação do host antes do bypass em headers.yml. O host permite sufixo vercel.app, sem restringir ao projeto; limite existente em REVIEW-FIX. Escopo restrito às ameaças planejadas.

## Trilha de auditoria

| Data | Ameaças | Fechadas | Abertas | Executor |
|------|---------|----------|---------|----------|
| 2026-10-21 | 34 | 34 | 0 | Codex, gsd-secure-phase 7 |

Classificação após conferir controles e evidências. Aplicado o atalho do passo 3: registro criado no planejamento e zero ameaças abertas; sem nova aceitação ou auditor delegado.

## Fechamento

- [x] Todas as ameaças possuem disposição.
- [x] Riscos aceitos registrados com sua origem.
- [x] threats_open: 0 confirmado no escopo da fase.
- [x] status: verified definido.

Verificação técnica concluída em 2026-10-21. Aprovação de merge deste relatório permanece com Felipe.
