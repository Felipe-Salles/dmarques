# Revisão de segurança SEC-07 — Fase 06 — SEO, metadados e dados estruturados

## Cabeçalho

- **Fase:** `Fase 06 — SEO, metadata & structured data`
- **Data da execução:** 2026-10-17
- **Commit revisado (HEAD de main após o merge do PR #6):** `71b7f7036243e03deb060f2d8ce84a528f3ecd36` — `Fase 6: SEO, metadados e dados estruturados (#6)`
- **URL revisada:** `https://agenciadmarques.com.br/` (produção)
- **Gabarito respondido:** `.planning/security/SECURITY-CHECKLIST.md` (não modificado)
- **Como foi gerado:** `pnpm build` e `bash scripts/security-check.sh --ci` rodados localmente no HEAD acima; sondas `curl` na produção; Lighthouse de produção pelo job `lhci-production` do GitHub Actions.

## Saída completa e verbatim de `scripts/security-check.sh --ci` (build local)

```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 18  |  blocos @font-face: 60  |  <script> inline sem src: 13
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 1 (exatamente 1)
SKIP: verificacao 6 - PREVIEW_URL nao definido; inspecao curl -I de cabecalhos adiada
SKIP: verificacao 7 - nenhuma URL de preview disponivel; gate do Lighthouse adiado
PASS: verificacao 8 - nenhum console.* no codigo do servidor
== resumo: 6 PASS / 0 FAIL / 2 SKIP ==
```

Código de saída: **0**. As verificações 6 e 7 ficaram em SKIP localmente; o Lighthouse é provado pelo CI (preview e produção) e os cabeçalhos pelas sondas abaixo. O `<script> inline` passou de 12 para 13 pelo bloco `application/ld+json` desta fase.

## Checks do PR #6 (autoritativos)

```
verify                  pass  1m59s
dependency-review       pass
lhci                    pass  57s
Vercel                  pass
Vercel Preview Comments pass
lhci-production         skipping (só roda em deploy de produção)
```

Primeiro run do `lhci` de preview (39072489611) falhou só em `robots-txt`: o Lighthouse busca `robots.txt` sem `extraHeaders` e recebeu a página de login da Vercel Authentication. Correção no commit `ec2e1fa` (`x-vercel-set-bypass-cookie: true` em `.github/workflows/lighthouse.yml`); rerun 39073329485 passou.

## Evidências (produção, 2026-10-17T22:07Z)

- **Home:** `HTTP/1.1 200 OK`, `Content-Type: text/html; charset=utf-8`, `Strict-Transport-Security: max-age=63072000`. `curl -sI ... | grep -ci x-robots-tag` imprime `0`.
- **robots.txt:** 200.
  ```
  User-agent: *
  Allow: /

  Sitemap: https://agenciadmarques.com.br/sitemap-index.xml
  ```
- **sitemap-index.xml:** 200, `Content-Type: application/xml`, 193 B.
- **sitemap-0.xml:** 200, `Content-Type: application/xml`, 387 B. Únicos `<loc>`: `https://agenciadmarques.com.br/`.
- **og-image.jpg:** 200, `Content-Type: image/jpeg`, `Content-Length: 31018` (menor que 307200).
- **Canonical:** `<link rel="canonical" href="https://agenciadmarques.com.br/">`.
- **og:image:** `<meta property="og:image" content="https://agenciadmarques.com.br/og-image.jpg">`.
- **Lighthouse de produção:** run `39073723615` (https://github.com/Felipe-Salles/dmarques/actions/runs/39073723615), job `lhci-production` concluído com sucesso em 47 s, 3 execuções. As asserções de `lighthouserc.production.json` estão em nível `error`: `categories:performance`, `categories:seo`, `categories:best-practices` e `categories:accessibility` com `minScore` 0.95, mais LCP <= 2500 ms, CLS <= 0.05, TBT <= 200 ms e `resource-summary:script:size` <= 20480 B. Todas passaram, logo as quatro categorias são >= 0.95. Os números exatos não ficam disponíveis (`uploadArtifacts: false`, P03-006).
- **Peso de JS da landing:** `6115 B` gzip de 20480 B (era 5501 B na Fase 5; +614 B vêm dos módulos de SEO/estrutura da fase, sem biblioteca nova).
- **Rich Results Test (plano 06-07, JSON-LD extraído do HTML construído):** "2 itens válidos detectados" — Empresas locais (LocalBusiness) e Organização, 0 erros.
- **Rich Results na URL de produção e card de compartilhamento (LinkedIn Post Inspector, WhatsApp):** pendentes da verificação humana da Tarefa 3; resultado será anexado aqui.

## Itens mecânicos do gabarito

1. **Audit limpo:** PASS. `pnpm audit` reporta 10 (8 moderate, 2 high ignoradas, as `extract-zip` allowlisted desde a Fase 1). Nenhuma high nova.
2. **Sem `style=` em `src/`:** PASS.
3. **CSS/JS inline:** PASS; só `@font-face` da Fonts API inline.
4. **Segredos fora do bundle:** PASS.
5. **Functions <= 1:** PASS, exatamente 1 (`/api/orcamento`).
6. **Cabeçalhos:** nenhuma alteração em `vercel.json` nesta fase; sem regressão. Sonda da home na produção retorna HSTS e nenhum `X-Robots-Tag`.
7. **Lighthouse >= 95:** PASS em produção (run 39073723615) e no preview (run 39073329485).
8. **Sem `console.*` no servidor:** PASS.

## Itens de julgamento

- **Dependência nova justificada?** Sim: `@astrojs/sitemap` 3.7.4 (ver item c).
- **Asset de terceiros novo?** Não. Nenhuma origem nova; a imagem `og-image.jpg` é servida do próprio domínio.
- **Segredo novo?** Não.
- **Achados com responsável e prazo, sem High aberto?** Sim, tabela abaixo.

## Itens específicos da fase

- **(a) JSON-LD:** montado apenas a partir de constantes de `src/lib/business.ts`, sem nenhum campo derivado de requisição, e serializado com `<` escapado, de modo que o conteúdo não consegue fechar o bloco `<script>`.
- **(b) Sitemap e robots:** o sitemap lista somente `/`, excluindo `/obrigado`, `/erro-envio/*` e `/404`; `/api/orcamento` nunca é listado. O `robots.txt` não tem nenhum `Disallow`, portanto não enumera caminhos internos (T-06-21).
- **(c) `@astrojs/sitemap` 3.7.4:** roda só em build, versão exata fixada, legitimidade do pacote verificada por humano no plano 06-04, `pnpm audit` sem nova high, peso de JS do cliente dentro do orçamento (6115 B de 20480 B) e nenhuma dependência de runtime.
- **(d) `generate-og.mjs`:** ferramenta apenas de desenvolvimento, sem nenhuma requisição a terceiros, não executada no CI nem no build; o `og-image.jpg` é um arquivo versionado.
- **(e) CSP:** inalterada (a CSP estrita é da Fase 7). O bloco `application/ld+json` é dado não executável e não cai em `script-src`.

## Desvios registrados

- Falha inicial do `lhci` de preview em `robots-txt` por Deployment Protection, corrigida com o cookie de bypass (commit `ec2e1fa`). O fallback de canonical não foi necessário.
- Canonical em páginas `noindex`: `/obrigado`, `/erro-envio/*` e `/404` omitem o canonical de propósito; o critério 1 do ROADMAP vale para toda página indexável.

## Tabela de achados (esquema D-12)

Convenção de ID: `P06-NNN`. Responsável padrão: `Felipe Salles`.

| ID | Description | Severity | Status | Action | Target date | Owner |
|----|-------------|----------|--------|--------|-------------|-------|
| P06-001 | Lighthouse do preview busca `robots.txt` sem cabeçalhos e depende do cookie de bypass da Deployment Protection; o segredo de bypass fica no CI. | Low | Fechado | Commit `ec2e1fa` e run 39073329485 verde. | 2026-10-17 | Felipe Salles |
| P06-002 | Lighthouse de produção sem números exatos (`uploadArtifacts: false`); só se sabe que as quatro categorias estão >= 0.95. | Low | Aberto | Avaliar `uploadArtifacts: true` numa fase de observabilidade (mesmo item que P03-006). | 2026-12-31 | Felipe Salles |
| P06-003 | A resposta da home na produção mostra apenas HSTS entre os cabeçalhos de segurança no `curl -I`; revisar a cobertura completa de `vercel.json` na Fase 7 junto com a CSP. | Low | Aberto | Auditar cabeçalhos na Fase 7. | Fase 7 | Felipe Salles |
| P05-008 (carregado) | Dependabot em `main`: `extract-zip` (2 high, dev via lhci, ignoradas), `smol-toml`, `sprintf-js`, `ip-address`, `uuid` (moderate). Pré-existentes. | Med | Aberto | Atualizar quando astro e `@lhci/cli` permitirem. | 2026-12-31 | Felipe Salles |
| P05-003 (carregado) | Vercel Hobby em uso comercial; reavaliar Pro antes de divulgar o domínio. | Med | Aceito | Reavaliar a migração. | 2026-12-31 | Felipe Salles |

**Nenhum achado High em aberto.**

## Linha de fechamento — regra dura

Nenhuma linha é `High` e `Aberto`. Verificações mecânicas 1 a 5 e 8 passam; 6 sem regressão; 7 passa em produção. O fechamento depende ainda da confirmação humana da Tarefa 3 (Rich Results na URL de produção, LinkedIn Post Inspector e WhatsApp).
