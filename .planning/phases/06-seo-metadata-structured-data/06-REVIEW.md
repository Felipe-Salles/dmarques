---
phase: 06-seo-metadata-structured-data
depth: standard
status: issues_found
files_reviewed: 19
diff_base: 079f4fa
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
reviewed: 2026-10-17
---

# Phase 06 Code Review

Revisão padrão sobre o diff `079f4fa..HEAD` (19 arquivos de código, sem `.planning/`, lockfile e imagem). Nenhum bloqueador. Nenhum comentário novo no código (regra de zero comentários preservada). A revisão foi feita por leitura do diff; o build e os gates não foram reexecutados nesta etapa.

## Warnings

### WR-01: `process.exit(1)` dentro do `try` pula o `finally`
- **Arquivo:** `scripts/generate-og.mjs`, linhas 99, 108 e 114
- **Problema:** em falha de fonte, dimensão inválida ou imagem acima de 300 KB, o Chromium do Playwright, o servidor estático e o PNG temporário não são liberados.
- **Correção:** lançar `Error` dentro do `try` e definir `process.exitCode = 1` num handler externo.

### WR-02: a checagem de fonte carregada no gerador de OG sempre passa
- **Arquivo:** `scripts/generate-og.mjs`, linhas 91-97
- **Problema:** `document.fonts.check()` retorna `true` quando nenhuma face declarada corresponde à família. Se a Sora não carregar, a imagem sai com fonte de fallback e o script reporta sucesso.
- **Correção:** exigir uma face com `family === 'Sora'` (sem aspas) e `status === 'loaded'`.

### WR-03: o preview não verifica a nota da categoria SEO
- **Arquivos:** `lighthouserc.json`; `.github/workflows/lighthouse.yml`
- **Problema:** `categories:seo >= 0.95` só existe no `lhci-production`, que roda depois do deploy. Uma regressão numa auditoria de SEO fora da lista só aparece em produção.
- **Nota do orquestrador:** decisão deliberada do plano 06-03. O preview manda `X-Robots-Tag: noindex`, então `is-crawlable` falha por design e a categoria nunca chegaria a 0.95. A lista explícita de 9 auditorias em nível `error` é a compensação. Aceito; reavaliar se surgir um modo de rodar o preview sem noindex.

### WR-04: as tags sociais e o canonical não estão amarrados à página renderizada
- **Arquivos:** `src/layouts/BaseLayout.astro`, linhas 19-20 e 42; `astro.config.mjs`
- **Problema:**
  - O `og:url` da 404 aponta para `/404`.
  - O `og:url` aparece em páginas noindex, que não têm canonical.
  - O canonical da home depende dos defaults de `build.format` e `trailingSlash`.
- **Correção:** emitir `pageUrl` e `og:url` só quando `!noindex`, e fixar `trailingSlash` no config.

## Info

### IN-01: o gate de sitemap compara substrings
- **Arquivo:** `scripts/verify/seo-gates.mjs`, linha 341
- **Problema:** `includes('404')` sobre o XML inteiro pode gerar falso positivo.
- **Correção:** checar os `<loc>` extraídos.

### IN-02: o título da imagem OG não está ligado a `OG_IMAGE.alt`
- **Arquivos:** `scripts/generate-og.mjs`, linha 66; `src/lib/business.ts`, linha 56
- **Problema:** o texto do título e o alt podem divergir sem que nada perceba.
- **Correção:** exportar o título de `business.ts` e usar nos dois lugares.

### IN-03: import depois de código executável
- **Arquivo:** `src/pages/erro-envio/[motivo].astro`, linha 35
- **Problema:** destoa das demais páginas.
- **Correção:** mover o import para o topo.

### IN-04: constantes duplicadas no gate
- **Arquivo:** `scripts/verify/seo-gates.mjs`, linhas 19-21
- **Problema:** `ORIGIN`, `HOME_TITLE` e `OFFICIAL_NAME` estão redigitados.
- **Avaliação:** defensável como verificação independente de `business.ts`.
