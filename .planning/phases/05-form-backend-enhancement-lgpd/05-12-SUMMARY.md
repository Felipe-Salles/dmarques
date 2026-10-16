---
phase: 05-form-backend-enhancement-lgpd
plan: 12
subsystem: live-verification
tags: [preview, e2e, live-verification, lgpd]
requires:
  - phase: 05-10
    provides: gates, CI e security-check endurecidos
  - phase: 05-11
    provides: Resend, DNS e Upstash provisionados
provides:
  - Sondas do endpoint no preview com os 6 codigos esperados
  - Gates live cookiesZero e terceiros em PASS
  - Logs da Function sem PII (LGPD-04)
  - Aprovacao ponta a ponta do Felipe no preview (2026-10-16)
  - D-29: pagina de politica removida, aviso de privacidade no formulario
affects: [05-13, 05-14]
tech-stack:
  added: []
  patterns: [details nativo sem JS para aviso de privacidade]
key-files:
  created: []
  modified:
    - src/components/ContactSection.astro
    - src/components/SiteFooter.astro
    - scripts/verify/form-gates.mjs
    - scripts/verify/browser-gates.mjs
    - scripts/verify/aurora-gates.mjs
    - .planning/PROJECT.md
    - .planning/REQUIREMENTS.md
    - .planning/phases/05-form-backend-enhancement-lgpd/05-CONTEXT.md
    - CLAUDE.md
    - docs/operacao-formulario.md
key-decisions:
  - "D-29 (Felipe, 2026-10-16): remover /politica-de-privacidade; transparencia do art. 9o mantida via details 'Como usamos seus dados' no formulario"
requirements-completed: [FORM-01, FORM-02, FORM-03, FORM-08, FORM-09, FORM-10, LGPD-04, LGPD-05, LGPD-06]
completed: 2026-10-16
---

# Phase 5 Plan 12: Validacao no preview Summary

Preview do PR #5 aprovado nas sondas, nos gates live, na inspecao de logs e no teste ponta a ponta do Felipe; no passo 8 ele decidiu remover a pagina de politica (D-29).

## Task 1: sondas, gates live e logs

PR: https://github.com/Felipe-Salles/dmarques/pull/5 (branch phases/05-form-backend-enhancement-lgpd, 45 commits sobre main)
Checks na primeira execucao: verify pass (2m4s), dependency-review pass, lhci pass, Vercel pass.
Preview: https://dmarques-git-phases-05-form-backe-423def-felipe-salles-projects.vercel.app
Deployment: dpl_2uWW3nYG5ddfPfgQZG2Fyw3xivAi

### Sondas (2026-10-16T02:42:24Z a 02:42:27Z UTC)

| Sonda | Esperado | Obtido |
|-------|----------|--------|
| GET | 405 | 405 |
| POST application/json | 415 | 415 |
| POST urlencoded, Origin https://evil.example | 403 | 403 |
| POST urlencoded 20000 bytes | 413 | 413 |
| POST honeypot (empresa-site=x) | 303 /obrigado | 303 /obrigado |
| POST so nome=A | 303 /erro-envio/invalido | 303 /erro-envio/invalido |

### Rate limit

Em src/lib/submit.ts a chamada deps.rateLimit vem depois de 415, 403, 413, honeypot/tempo e validacao. Nenhuma das 6 sondas chegou nela: 0 tokens consumidos do limite de 3/IP em 10 min. Nenhum e-mail enviado; Felipe teve a cota inteira.

### Gates live

PASS: cookiesZero
PASS: terceiros
RESUMO: 2 PASS / 0 FAIL (live), exit 0

### Logs da Function (LGPD-04)

- vercel logs --deployment (janela 1h): 0 registros.
- API runtime-logs do deployment: sem linhas.
- grep em src/pages/api e src/lib: nenhum console.* nem logger.

Conclusao: nenhuma linha com IP, user-agent ou dados do lead. Ressalva: o log vazio tambem pode refletir a ausencia de log de requisicao no CLI; a ausencia de console.* no codigo confirma.

### Segredo de bypass

Nao estava no .env.local nem no ambiente. Foi lido da configuracao protectionBypass do projeto via API da Vercel, usado so em header e nunca impresso. Arquivos temporarios apagados.

## Task 2: teste ponta a ponta do Felipe

Felipe executou o roteiro de 8 passos no preview e respondeu "aprovado" (2026-10-16). Com isso LGPD-06 (zero cookies/storage no DevTools, corroborado pelo gate live cookiesZero) ficou provado.

Resultado do passo 8: ao revisar a pagina de politica, Felipe decidiu removê-la (D-29). A transparencia do art. 9o passa a ser atendida por um bloco nativo no formulario.

## D-29: implementacao

- src/pages/politica-de-privacidade.astro removida; nenhum link restante (ContactSection e SiteFooter).
- ContactSection: abaixo do aviso "Usamos seus dados so para responder a este pedido." entra `<details class="privacy">` com summary "Como usamos seus dados" (fechado por padrao, funciona sem JS). Conteudo vindo da politica removida: controlador, finalidade, base legal (art. 7o, V; IX para protecao contra abuso), dados e IP pseudonimizado ate 24h, retencao de 6 meses, operadores (Vercel, Resend sa-east-1, Upstash Sao Paulo, GoDaddy) e direitos (art. 18, contato@, 15 dias). Sem inline style; summary com area de toque de 45px via padding/margem negativa; focus-visible com outline ciano.
- Gate de altura do card: 752.8px (limite 756px) com o details fechado.
- SiteFooter: removido "Ibitinga · SP" do canto direito (a mencao no paragrafo da marca fica); hairline `--color-border` e "© {ano} Dmarques Soluções Web" centralizado abaixo. Conferido em 1440 e 375.
- Gates: form-gates troca `politica` por `privacidadeNoForm` (details existe, fechado, abre sem JS, contem contato@ e "art. 7", sem links para a politica, rota ausente do build e 404); browser-gates e aurora-gates deixam de visitar a rota. Contagens: form-gates 15 PASS, browser-gates 9 PASS, aurora-gates 13 PASS.
- Docs: Key Decision D-29 em PROJECT.md e 05-CONTEXT.md; LGPD-01/02/03/07 reescritos como modificados por D-29; LGPD-06 marcado completo; linha de LGPD no CLAUDE.md e nota de operacao ajustadas.

Observacao de honestidade: o bloco compacto nao traz reclamacao a ANPD, "ausencia de cookies" como secao, "sem decisoes automatizadas" nem data de atualizacao; LGPD-02 foi reescrito para refletir isso.

## Deviations from Plan

### D-29 (decisao do usuario, nao desvio automatico)
Escopo ampliado por decisao do Felipe: remocao da pagina, ajustes de rodape, gates e docs, descritos acima.

### Auto-fixed Issues

**1. [Rule 1 - Bug] Links de e-mail dentro de `li` reprovavam o gate de alvo de toque**
- **Found during:** D-29
- **Fix:** conteudo do details usa `<p>` (links inline em texto sao isentos) em vez de lista.
- **Commit:** d0f328a

**2. [Rule 1 - Bug] Card passou do limite de 756px**
- **Fix:** summary compacto com area de toque via padding e margem negativa; 786.8px para 752.8px.
- **Commit:** d0f328a

## Commits

- d0f328a feat(05-12): remove pagina de politica e adiciona aviso de privacidade no formulario (D-29)
- 4154876 style(05-12): rodape com divisor e copyright centralizado abaixo
- e92b409 test(05-12): gates trocam a checagem da politica pelo details de privacidade
- 2d88268 docs(05-12): registra D-29 e ajusta LGPD-01/02/03/07 e CLAUDE.md

## Revisão D-29 (2026-10-16)

Felipe revisou a decisão: o bloco `<details>` "Como usamos seus dados" foi removido do formulário e permanece só a frase curta "Usamos seus dados só para responder a este pedido.", sem link. A política segue removida. LGPD-01, LGPD-02 e LGPD-07 (parte publicada) constam como removidos por decisão do Felipe; o risco é a transparência do art. 9º da LGPD deixar de ser publicada no site.

## Self-Check: PASSED
