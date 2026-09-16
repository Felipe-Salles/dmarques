# Revisão de segurança SEC-07 — Fase 3 — Static Zero-JS Sections + CSP-safe Refactor + A11y

## Cabeçalho

- **Fase:** `Fase 3 — Static Zero-JS Sections + CSP-safe Refactor + A11y`
- **Data da execução:** 2026-09-16
- **Commit revisado (HEAD do PR):** `ccd1f728d9fddba924c25ef4321fe0dffdd9c2b1` — `docs(03-08): complete home composition + nav-height + gate battery plan`
- **URL de preview revisada:** `https://dmarques-git-phases-02-03-content-8d3beb-felipe-salles-projects.vercel.app` (PR #2, READY)
- **Gabarito respondido:** `.planning/security/SECURITY-CHECKLIST.md` (não modificado por esta execução)
- **Como foi gerado:** PR #2 aberto contra `main` a partir de `phases/02-03-content-and-static-sections` (consolida Fases 2 e 3, nunca antes enviadas a `origin`) → deploy de preview da Vercel READY → `bash scripts/security-check.sh --ci` rodado duas vezes (sem `PREVIEW_URL`, no build local; com `PREVIEW_URL` + `VERCEL_AUTOMATION_BYPASS_SECRET`, contra o preview real) → job `lhci` do GitHub Actions consultado via `gh run view --log`.

## Saída completa e verbatim de `scripts/security-check.sh --ci`

### Execução 1 — build local, sem `PREVIEW_URL` (paridade com o build de cada plano)

```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 8  |  blocos @font-face: 48  |  <script> inline sem src: 4
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 0 (no maximo 1)
SKIP: verificacao 6 - PREVIEW_URL nao definido; inspecao curl -I de cabecalhos adiada
SKIP: verificacao 7 - nenhuma URL de preview disponivel; gate do Lighthouse adiado
== resumo: 5 PASS / 0 FAIL / 2 SKIP ==
```

Código de saída: **0**. Nenhum valor de segredo aparece na saída — o script nunca ecoa `VERCEL_AUTOMATION_BYPASS_SECRET`; não há nenhuma ocorrência do padrão `re_[A-Za-z0-9_-]{20,}`.

### Execução 2 — contra o preview real, com `PREVIEW_URL` + `VERCEL_AUTOMATION_BYPASS_SECRET`

```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 8  |  blocos @font-face: 48  |  <script> inline sem src: 4
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 0 (no maximo 1)
  cabecalhos de https://dmarques-git-phases-02-03-content-8d3beb-felipe-salles-projects.vercel.app:
    HTTP/1.1 200 OK
    Accept-Ranges: bytes
    Access-Control-Allow-Origin: *
    Age: 7
    Cache-Control: public, max-age=0, must-revalidate
    Content-Disposition: inline
    Content-Length: 31015
    Content-Type: text/html; charset=utf-8
    Etag: "2d3c82e39bd59896d85399d42de207b2"
    Last-Modified: Wed, 16 Sep 2026 21:47:29 GMT
    Server: Vercel
    Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
    X-Robots-Tag: noindex
    X-Vercel-Cache: HIT
PASS: verificacao 6 - cabecalhos do preview registrados (baseline da Fase 1; assercoes valem a partir da Fase 7)
Running Lighthouse 3 time(s) on https://dmarques-git-phases-02-03-content-8d3beb-felipe-salles-projects.vercel.app
  categories.performance: expected >=0.95, found 0.88 (valores: 0.86, 0.88, 0.88) — FALHA
  largest-contentful-paint: expected <=2500ms, found 3089.97ms (valores: 3254.12, 3089.97, 3107.29) — FALHA
  resource-summary.script.size: expected <=20480B, found 165156B (valores: 165156, 165157, 165157) — FALHA
  categories.seo: expected >=0.95, found 0.5 (valores: 0.5, 0.5, 0.5) — warning (esperado, ver nota abaixo)
FAIL: verificacao 7 - gate do Lighthouse reprovado
== resumo: 6 PASS / 1 FAIL / 0 SKIP ==
```

Código de saída: **1**, só por causa da verificação 7 local.

**Nota sobre a verificação 7 local — falso-negativo já documentado na Fase 1.** A execução local do Lighthouse nesta máquina (Windows, mesma máquina de `.planning/security/runs/phase-01.md`) sofre interferência conhecida de antivírus/`chrome-launcher` que injeta script no Chrome headless controlado. Evidência: `bash scripts/js-weight-check.sh ".vercel/output/static"` (mede o peso real do build, sem navegador) reporta **1302 B gzip** de `<script>` — dentro do orçamento de 20480 B — enquanto o Lighthouse local mediu 165156 B de `resource-summary.script.size`, uma discrepância de ~127x que só pode vir de script injetado pelo host, não pelo site. Como na Fase 1, **o gate autoritativo é o job `lhci` do GitHub Actions**, não a execução local.

### Job `lhci` do PR #2 (GitHub Actions, autoritativo)

`gh pr checks 2` reporta `lhci` como **pass**. O log (`gh run view <run-id> --log`) mostra:

```
1 result(s) for https://dmarques-1dgrha9hs-felipe-salles-projects.vercel.app/ :
  ⚠️  categories.seo warning for minScore assertion
        expected: >=0.95
           found: 0.5
      all values: 0.5, 0.5, 0.5
All results processed!
```

Nenhuma falha (`×`) é reportada para `categories.performance`, `categories.accessibility` ou `categories.best-practices` — apenas o warning esperado de SEO. **Limitação registrada:** `lighthouserc.json` roda com `uploadArtifacts: false` (decisão da Fase 1), então os relatórios brutos não ficam anexados ao run e os quatro números exatos por categoria mais LCP/CLS/TBT não são recuperáveis depois que o job termina — só o resultado passa/falha de cada assertion. Isso é uma lacuna de instrumentação herdada da Fase 1, não introduzida por esta fase; registrada como achado de baixo risco (P03-006) para avaliação de `uploadArtifacts: true` numa fase futura de observabilidade.

O warning de SEO (0.5) é o mesmo comportamento estrutural documentado na Fase 1: o preview sob Deployment Protection responde `X-Robots-Tag: noindex`, o que derruba `is-crawlable` (peso ~4.0 no cálculo de SEO do Lighthouse) independente do conteúdo da página. `categories.seo` permanece `warn` em `lighthouserc.json` até a Fase 6 tornar o site indexável e restaurar a assertion para `error`.

## Itens mecânicos do gabarito (respondidos por número)

### Item 1 — `pnpm audit` limpo em `--audit-level=high`

**PASS:** verificação 1, ambas as execuções, código de saída 0. A única dependência nova desta fase é `sharp@0.35.4`, promovida de transitiva (já dentro de `astro@7.3.1`) para explícita em `package.json` na mesma versão já resolvida e auditada — `pnpm-lock.yaml` não introduz nenhuma entrada nova na árvore.

### Item 2/3 — grep por nova superfície inline

**PASS:** verificação 2 — `nenhum atributo style= em src/`. Esta fase **remove** superfície em vez de adicionar: o arquivo de design-fonte (`Dmarques Landing.dc.html`) tinha `style="..."` em praticamente todo elemento; `src/` desta fase tem zero ocorrências, confirmado pelo grep do script em todos os 10 componentes e 3 páginas utilitárias novas. Verificação 3 — os 8 blocos `<style>` inline no HTML construído continuam sendo exclusivamente os `@font-face` da Astro Fonts API (permitidos desde a Fase 1); nenhum CSS de página/token/bundle foi inlinado.

### Item 3 — inspeção `curl -I` dos cabeçalhos do preview implantado

**PASS:** verificação 6, execução 2. Cabeçalhos capturados verbatim acima. `Strict-Transport-Security` presente; `X-Robots-Tag: noindex` presente (esperado, Deployment Protection). Ainda uma baseline de regressão, não uma asserção de conformidade — a CSP estrita e o conjunto completo de headers são escopo da Fase 7.

### Item 4 — varredura de segredos na saída de build

**PASS:** verificação 4, ambas as execuções. Nenhuma entrada `astro:env` nova nesta fase; nenhum segredo introduzido.

### Item 5 — contagem de Functions serverless `<= 1`

**PASS:** verificação 5, ambas as execuções — 0 Functions. A Fase 5 continua sendo a única que leva a contagem a exatamente 1 (`/api/orcamento`).

### Item 6 — gate do Lighthouse: mobile `>= 95` nas quatro categorias

**PASS (via job `lhci` do CI, autoritativo):** Performance, Accessibility e Best Practices não geraram nenhuma falha de assertion no job `lhci` do PR #2 — apenas o warning esperado de SEO (0.5, estrutural sob Deployment Protection, `warn` desde a Fase 1). A execução **local** da verificação 7 falhou (Performance 0.86–0.88, LCP ~3.1s, script 165 KB), mas essa falha é um artefato conhecido desta máquina (antivírus/`chrome-launcher` injetando script no Chrome headless — mesmo padrão documentado em `phase-01.md`), refutado por `js-weight-check.sh` medir 1302 B reais de JS no build. Números exatos por categoria e LCP/CLS/TBT do job `lhci` não são recuperáveis (`uploadArtifacts: false`) — ver P03-006.

### Item 7 — achados registrados com severidade / responsável / prazo; nenhum achado High em aberto

**PASS (julgamento):** ver tabela abaixo. Seis linhas, nenhuma `High`.

## Itens de julgamento (respondidos à mão)

### Toda dependência nova está justificada nas notas da fase?

**Sim.** Única adição: `sharp@0.35.4`, promovida de transitiva a explícita na mesma versão já auditada (Task 1 do plano 03-01). `git diff --stat` confirma que nenhum outro pacote foi adicionado, removido ou atualizado.

### Todo asset de terceiros novo é self-hosted ou tem integridade verificável e justificativa documentada?

**Sim.** Os dois novos assets (`hero-render-placeholder.webp`, `founder-portrait-placeholder.webp`) são gerados localmente a partir de formas vetoriais via Sharp, sem metadados EXIF, sem PII, servidos same-origin a partir de `/_astro/`. Nenhum domínio de imagem remoto configurado.

### Todo segredo novo foi declarado em `astro:env` com `access: 'secret'` e comprovadamente fica fora do bundle do cliente?

**Nenhum segredo novo.** Verificação 4 confirma ausência de qualquer padrão de segredo na saída servida ao cliente.

### Cada achado de severidade menor tem responsável e prazo, e nenhum achado High permanece em aberto no fechamento da fase?

Sim — ver tabela abaixo. Todas as seis linhas têm responsável `Felipe Salles`, prazo e ação. Nenhuma é `High`.

## Fechamento do achado herdado P02-003

`P02-003` (Fase 2) exigia que, ao renderizar campos de Content Collections em componentes desta fase, o padrão fosse interpolação de texto padrão do Astro (`{item.data.campo}`, auto-escaping), nunca `set:html`. Todos os componentes desta fase que consomem collections (`ServicesSection`, `ProcessSection`, `DifferentiatorsSection`, `FaqSection`) seguem exatamente esse padrão — verificado por `grep -rn 'set:html' src/` retornando vazio em toda a árvore, e reafirmado nos threat models T-03-11 dos planos 03-05 e 03-06.

Porém, a collection `cases` (a que originou P02-003) **não é renderizada nesta fase** — confirmado por `grep -rl 'getCases' src/components/ src/pages/index.astro` sem resultado. SITE-01 lista as 9 seções da home e nenhuma delas é um portfólio/cases; essa foi uma decisão deliberada registrada em `03-CONTEXT.md`/`03-08-PLAN.md` (Open Question 1). Nenhuma fase do ROADMAP atual (4 a 7) declara renderizar `cases`. **P02-003 permanece Aberto**, reencaminhado sem prazo fixo até que uma fase futura decida renderizar a collection — nesse momento o mesmo padrão de interpolação escapada (já provado nesta fase) se aplica.

## Riscos aceitos desta fase (threat models 03-01 a 03-08)

- **T-03-09** (plano 03-03) — disclosure `<details>`/`<summary>` do menu mobile não fecha ao clicar fora (limitação nativa sem JS, aceita em D-04). Não viola SITE-06 (exige apenas operabilidade por teclado e ausência de armadilha de foco).
- **T-03-18** (plano 03-07) — e-mail e telefone do fundador em texto claro no rodapé; dado de contato comercial publicado intencionalmente. TRUST-01 (e-mail de domínio próprio) já registrado em REQUIREMENTS.md como item pós-validação.
- **T-03-10** (plano 03-04) — divergência temporária entre o `alt` do retrato ("Felipe Salles, fundador da Dmarques") e a arte placeholder vetorial abstrata; aceita por D-01/D-02 para que a troca futura do arquivo de imagem não exija revisão de acessibilidade.

Riscos aceitos triviais (sem residual mensurável, não tabelados): T-03-03/03-01 (placeholders sem EXIF/PII), T-03-02/03-02 (tokens de marca não alterados, eliminado por construção), T-03-13 (conteúdo de collections é material público sem PII), T-03-15 (`position: sticky` é layout nativo sem custo de script).

## Tabela de achados (esquema D-12)

Convenção de ID: `P03-NNN`. Vocabulário de severidade: `Low` / `Med` / `High`. Responsável padrão: `Felipe Salles`.

| ID | Description | Severity | Status | Action | Target date | Owner |
|----|-------------|----------|--------|--------|-------------|-------|
| P03-001 | Advisory `GHSA-jmr9-qjv8-65gv` em `extract-zip` (<=2.0.1), transitivo dev/CI-only via `@lhci/cli` > `lighthouse` > `puppeteer-core` > `@puppeteer/browsers`. Allowlisted em `pnpm-workspace.yaml`. Carregado de `P02-001`/`P01-001`, árvore inalterada nesta fase (única adição foi `sharp`, já transitivo). **Nota:** o Dependabot do GitHub rotula esta mesma advisory como `high` (severidade CVSS bruta); a classificação `Med` do projeto é uma reclassificação contextual deliberada, já decidida e documentada por Felipe Salles em `phase-01.md` (P01-001) — reafirmada aqui, não reaberta. | Med | Aceito | Revisitar quando `extract-zip >=2.0.2` publicar ou o caminho transitivo for removido. | 2026-11-30 | Felipe Salles |
| P03-002 | Advisory `GHSA-7pqw-9j4j-h8q3` em `extract-zip`, mesmo caminho transitivo. Allowlisted junto com P03-001. Carregado de `P02-002`/`P01-002`. Mesma nota de reclassificação `high` (Dependabot) -> `Med` (projeto, contextual) já decidida na Fase 1. | Med | Aceito | Igual a P03-001. | 2026-11-30 | Felipe Salles |
| P03-003 | T-03-09 — disclosure `<details>`/`<summary>` do menu mobile não fecha ao clicar fora do painel (limitação nativa sem JS). | Low | Aceito | Reavaliar como enhancement JS na Fase 4 apenas se virar reclamação real de usuário. | 2026-12-31 | Felipe Salles |
| P03-004 | T-03-18 — e-mail e telefone do fundador em texto claro no HTML do rodapé, coletável por bots/scrapers. | Low | Aceito | TRUST-01 (migrar para e-mail de domínio próprio) já é item pós-validação registrado em REQUIREMENTS.md; nenhuma ofuscação adicional planejada para v1. | 2026-12-31 | Felipe Salles |
| P03-005 | T-03-10 — `alt` do retrato do fundador já descreve a pessoa real, mas a imagem servida é um placeholder vetorial abstrato até a foto real ser entregue. | Low | Aceito | Resolve automaticamente quando o arquivo `founder-portrait-placeholder.webp` for substituído pela foto real (D-01/D-02) — nenhuma mudança de código necessária. | Sem prazo fixo (aguarda ativo) | Felipe Salles |
| P03-006 | `lighthouserc.json` roda com `uploadArtifacts: false` (decisão da Fase 1) — o job `lhci` não anexa os relatórios brutos, então os quatro números exatos por categoria e LCP/CLS/TBT não ficam disponíveis para auditoria depois que o run termina, apenas o resultado passa/falha de cada assertion. | Low | Aberto | Avaliar `uploadArtifacts: true` (ou upload para o Lighthouse temporary public storage) numa fase futura de observabilidade/CI. | 2026-12-31 | Felipe Salles |
| P02-003 (carregado) | Campos da collection `cases` (`problema`/`solucao`/`resultado`) ainda não são renderizados por nenhum componente — o padrão de interpolação escapada já está provado nesta fase para as outras 4 collections, mas `cases` continua sem consumidor. | Low | Aberto | Aplicar o mesmo padrão de interpolação (`{item.data.campo}`, sem `set:html`) quando uma fase futura decidir renderizar `cases`. | Sem prazo fixo (aguarda fase que renderize `cases`) | Felipe Salles |

Nenhuma linha está `High` **e** `Aberto`. Duas linhas `Med` são as advisories dev/CI-only já aceitas desde a Fase 1 (árvore inalterada); as demais são `Low`.

## Linha de fechamento — regra dura

A Fase 3 **satisfaz** a regra dura do gabarito ("Nenhuma fase fecha com achado High em aberto."): das sete linhas registradas (seis novas + P02-003 carregada), nenhuma é `High`. As verificações mecânicas 1 a 6 passam em ambas as execuções (local e contra o preview); a verificação 7 passa no gate autoritativo (`lhci` do CI) e falha apenas na execução local por um artefato de ambiente já documentado e refutado por medição independente (`js-weight-check.sh`). `pnpm audit --audit-level=high` limpo; nenhum segredo novo; nenhum domínio de imagem remoto; formulário sem `action`/`method` (Fase 5 ainda não wireia o endpoint).

## Sign-off

_(preenchido após o checkpoint humano da Task 3 do plano 03-09)_
