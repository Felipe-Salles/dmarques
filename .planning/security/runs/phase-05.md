# Revisão de segurança SEC-07 — Fase 05 — Backend do formulário e LGPD

## Cabeçalho

- **Fase:** `Fase 05 — Form backend, enhancement e LGPD`
- **Data da execução:** 2026-10-16
- **Commit revisado (HEAD do PR #5):** `920892f9fbe4e1f0969b527f847ece7b24def5b3` — `docs(05-13): regra WAF api-flood ativa com Deny 403 e rajada comprovada`
- **Preview revisado:** `https://dmarques-git-phases-05-form-backe-423def-felipe-salles-projects.vercel.app` (PR #5, deploy READY)
- **Gabarito respondido:** `.planning/security/SECURITY-CHECKLIST.md` (não modificado)
- **Como foi gerado:** `pnpm build` e `bash scripts/security-check.sh --ci` rodados localmente no HEAD acima; checks do PR via `gh pr checks 5`; evidências de preview, WAF e logs vindas dos planos 05-10 a 05-13.

## Saída completa e verbatim de `scripts/security-check.sh --ci` (build local)

```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 18  |  blocos @font-face: 60  |  <script> inline sem src: 12
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 1 (exatamente 1)
SKIP: verificacao 6 - PREVIEW_URL nao definido; inspecao curl -I de cabecalhos adiada
SKIP: verificacao 7 - nenhuma URL de preview disponivel; gate do Lighthouse adiado
PASS: verificacao 8 - nenhum console.* no codigo do servidor
== resumo: 6 PASS / 0 FAIL / 2 SKIP ==
```

Código de saída: **0**. As verificações 6 e 7 ficam para o CI (lhci) pela contaminação conhecida do Lighthouse local.

## Checks do PR #5 (autoritativos)

```
Vercel                  pass  (Deployment has completed)
Vercel Preview Comments pass
dependency-review       pass  7s
lhci                    pass  1m6s
verify                  pass  1m52s
```

`verify` executa `form-gates.mjs` (15 PASS), `browser-gates.mjs` (9 PASS) e `aurora-gates.mjs` (13 PASS). O `lhci` não reportou falha em Performance, Accessibility, Best Practices nem nas asserções de LCP, CLS, TBT e peso de script; SEO segue `warn` até a Fase 6 (preview com `noindex` sob Deployment Protection).

### Peso de JS da landing (`js-weight-check.sh`)

```
JS da rota da landing (gzip): 5501 B  orcamento: 20480 B
PASS: nenhum framework de UI / biblioteca de animacao nas dependencias
PASS: peso de JS dentro do orcamento
```

## Evidências

- **Sondas no preview (05-12, 2026-10-16T02:42Z):** GET 405; POST JSON 415; Origin `https://evil.example` 403; corpo de 20000 B 413; honeypot 303 `/obrigado`; só `nome=A` 303 `/erro-envio/invalido`. Nenhuma consumiu o rate limit.
- **`form-gates --live` no preview:** `cookiesZero` PASS, `terceiros` PASS, 2 PASS / 0 FAIL (LGPD-05/06). Felipe confirmou zero cookies/storage no DevTools.
- **Logs da Function (LGPD-04):** `vercel logs` e API de runtime-logs sem registros; nenhum `console.*` em `src/pages/api` e `src/lib` (verificação 8). Sem IP, user-agent ou dados do lead em log.
- **Rate limit Upstash:** instância Free em São Paulo; IP pseudonimizado com `RATE_LIMIT_SALT` (Sensitive), conforme 05-11 e `src/lib/submit.ts`.
- **WAF `api-flood` (05-13, FORM-11):** regra ativa, path starts with `/api/`, janela fixa 60 s, limite 10, chave IP, ação Deny. Rajada: 10 x 405 e depois 403 com `X-Vercel-Mitigated: deny`, sem invocar a Function. Desvio: 403 em vez de 429, porque o 429 exige Pro (decisão do Felipe: seguir no Hobby).
- **E-mail (SEC-09):** domínio de envio verificado no Resend (sa-east-1) com DKIM; DMARC `p=quarantine` pré-existente da GoDaddy mantido (criar `p=none` duplicaria o registro); mail-tester 10/10 (05-11).
- **Teste ponta a ponta do Felipe no preview:** aprovado em 2026-10-16.

## Itens mecânicos do gabarito

1. **Audit limpo:** PASS. `pnpm audit` reporta 10 (8 moderate, 2 high ignoradas — as `extract-zip` allowlisted desde a Fase 1). Nenhuma high nova.
2. **Sem `style=` em `src/`:** PASS.
3. **CSS/JS inline e cabeçalhos:** PASS (verificações 2 e 3); só `@font-face` da Fonts API inline. Cabeçalhos sem alteração de configuração; CSP estrita completa é da Fase 7.
4. **Segredos fora do bundle:** PASS (verificação 4). `RESEND_API_KEY` e credenciais Upstash só no ambiente da Function.
5. **Functions <= 1:** PASS, exatamente 1 (`/api/orcamento`).
6. **Cabeçalhos do preview:** sem regressão (nenhuma mudança em `vercel.json`).
7. **Lighthouse >= 95:** PASS via `lhci` do CI.
8. **Sem `console.*` no servidor:** PASS.

## Itens de julgamento

- **Dependência nova justificada?** Sim: `resend`, `zod`, `@upstash/ratelimit` e `@upstash/redis` conforme a stack do projeto, usadas só na Function.
- **Asset de terceiros novo?** Não. O gate live `terceiros` prova a ausência.
- **Segredo novo?** Sim, esperado: chave do Resend e token do Upstash, apenas em variáveis de ambiente da Vercel, nunca no cliente (verificação 4).
- **Achados com responsável e prazo, sem High aberto?** Sim, tabela abaixo.

## Risco residual aceito por decisão do Felipe (D-29): LGPD-01, LGPD-02 e LGPD-07

Por decisão explícita do Felipe em 2026-10-16, a página de Política de Privacidade e qualquer aviso detalhado foram removidos; resta apenas a frase "Usamos seus dados só para responder a este pedido." no formulário. LGPD-01, LGPD-02 e LGPD-07 constam como "Removido por decisão do Felipe (D-29)". O risco residual é que a transparência do art. 9º da LGPD (controlador, finalidade, base legal, retenção, operadores, direitos do art. 18) não está publicada no site. É decisão do titular do projeto, registrada como risco aceito (P05-007), não como achado High a corrigir.

## Tabela de achados (esquema D-12)

Convenção de ID: `P05-NNN`. Responsável padrão: `Felipe Salles`.

| ID | Description | Severity | Status | Action | Target date | Owner |
|----|-------------|----------|--------|--------|-------------|-------|
| P05-001 | O timing mínimo não se aplica ao POST sem JS, e omitir `elapsed-ms` contorna a checagem. Aceito em 2026-10-15 (D-27); compensado por honeypot, checagem de Origin, limites de corpo, rate limit Upstash e WAF. | Med | Aceito | Nenhuma; já aceito. | Sem prazo fixo | Felipe Salles |
| P05-002 | FORM-13: sem CTA de WhatsApp no hero, por decisão do Felipe em 2026-10-15 (D-26). Informativo, não é achado de segurança. | Low | Aceito | Nenhuma. | Sem prazo fixo | Felipe Salles |
| P05-003 | Vercel Hobby é restrito a uso não comercial pelas Fair Use Guidelines; o site capta orçamentos. Felipe decidiu em 2026-10-16 manter o Hobby (teto de gasto US$ 0 estrutural; Deny 403 funciona no Hobby; Pro não desejado agora). | Med | Aceito | Reavaliar a migração para Pro antes de divulgar o domínio próprio. | 2026-12-31 | Felipe Salles |
| P05-004 | Contadores do WAF são por região e o Hobby permite 1 regra; ação 429 indisponível (usa-se Deny 403). | Low | Aceito | Revisitar com a camada Cloudflare (Milestone 2). | Milestone 2 | Felipe Salles |
| P05-005 | Resend retém cópia técnica do e-mail pelo período do plano. | Low | Aceito | Revisar a retenção no painel do Resend. | 2026-12-31 | Felipe Salles |
| P05-006 | DMARC já está em `p=quarantine` (GoDaddy), com alinhamento relaxado; a evolução prevista a partir de `p=none` não se aplica. Relatórios `rua` vão para a GoDaddy. | Low | Aceito | Avaliar `p=reject` após observar relatórios. | 2026-12-31 | Felipe Salles |
| P05-007 | Política de Privacidade e aviso detalhado removidos por D-29; art. 9º da LGPD sem texto publicado. Decisão explícita do titular. | Med | Aceito | Reavaliar se o site passar a receber tráfego em escala ou a coletar mais dados. | Sem prazo fixo | Felipe Salles |
| P05-008 | Dependabot em `main`: `extract-zip` (2 high, dev via lhci, já na lista de ignorados), `smol-toml` 1.8.0 (moderate, só em build via astro; correção 1.9.0), `sprintf-js`, `ip-address`, `uuid` (moderate, dev). Pré-existentes, não vêm desta fase. | Med | Aberto | Atualizar `smol-toml` para 1.9.0 quando o astro permitir; demais quando `@lhci/cli` atualizar. | 2026-12-31 | Felipe Salles |
| P03-006 (carregado) | `uploadArtifacts: false` no lhci: números exatos não auditáveis. | Low | Aberto | Avaliar `uploadArtifacts: true` numa fase de observabilidade. | 2026-12-31 | Felipe Salles |
| P041-002 (carregado) | Botão de envio sem handler até a Fase 5. | Low | Fechado | Endpoint `/api/orcamento` ligado nesta fase. | 2026-10-16 | Felipe Salles |

**Nenhum achado High em aberto.**

## Linha de fechamento — regra dura

A Fase 05 satisfaz a regra dura do gabarito: nenhuma linha é `High` e `Aberto`. Verificações mecânicas 1 a 5 e 8 passam; 6 sem regressão; 7 passa no `lhci` do PR #5.

## Sign-off

Aprovado por Felipe Salles em 2026-10-16: fechamento da Fase 5 aprovado, plano Hobby mantido (P05-003) e merge do PR #5 autorizado (`gh pr merge 5 --squash`).
