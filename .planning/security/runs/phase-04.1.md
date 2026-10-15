# Revisão de segurança SEC-07 — Fase 04.1 — Redesign Aurora técnica

## Cabeçalho

- **Fase:** `Fase 04.1 — Redesign Aurora técnica`
- **Data da execução:** 2026-10-15
- **Commit revisado (HEAD do PR #3 no momento dos checks):** `4d8e3dbc720b84cdc6ca93b6eb4e1cf7db5d2e3e` — `ci(04.1-11): gates aurora e browser no job verify`
- **Preview revisado:** `https://dmarques-30rezos0l-felipe-salles-projects.vercel.app` (PR #3, deploy READY)
- **Gabarito respondido:** `.planning/security/SECURITY-CHECKLIST.md` (não modificado)
- **Como foi gerado:** branch `phases/04-progressive-enhancement-effects` enviada a `origin` e PR #3 reaproveitado; jobs `verify`, `dependency-review` e `lhci` do GitHub Actions consultados com `gh pr checks 3` e `gh run view --log`; `bash scripts/security-check.sh --ci` rodado localmente sobre o build do mesmo commit.

## Saída completa e verbatim de `scripts/security-check.sh --ci` (build local)

```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 12  |  blocos @font-face: 40  |  <script> inline sem src: 12
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 0 (no maximo 1)
SKIP: verificacao 6 - PREVIEW_URL nao definido; inspecao curl -I de cabecalhos adiada
SKIP: verificacao 7 - nenhuma URL de preview disponivel; gate do Lighthouse adiado
== resumo: 5 PASS / 0 FAIL / 2 SKIP ==
```

Código de saída: **0**. As verificações 6 e 7 não foram executadas localmente: o Lighthouse local desta máquina é contaminado por injeção de script do antivírus (mesmo falso-negativo documentado em `phase-01.md`, `phase-03.md` e `phase-04.md`), e o gate autoritativo é o job `lhci` contra o preview, abaixo. O mesmo script roda no job `verify` do CI, que está verde.

## Checks do PR #3 (autoritativos)

```
lhci                pass  1m0s
verify              pass  1m38s
dependency-review   pass  9s
Vercel              pass  (Deployment has completed)
```

`verify` agora executa também `aurora-gates.mjs` (13 PASS / 0 FAIL localmente) e `browser-gates.mjs` (8 PASS / 0 FAIL localmente), com `playwright install --with-deps chromium`.

### Job `lhci` (run 38710413676) — trecho verbatim

```
Running Lighthouse 3 time(s) on https://dmarques-30rezos0l-felipe-salles-projects.vercel.app
...
  ⚠️  categories.seo warning for minScore assertion
        expected: >=0.95
           found: 0.58
      all values: 0.58, 0.58, 0.58
```

Nenhuma falha (`×`) em `categories.performance`, `categories.accessibility`, `categories.best-practices`, `largest-contentful-paint` (<= 2500 ms), `cumulative-layout-shift` (< 0,05), `total-blocking-time` (< 200 ms) nem `resource-summary:script:size` (<= 20480 B), todas `error` em `lighthouserc.json`, que não foi tocado nesta fase (último commit que o alterou: `8eef8027`, anterior à Fase 04.1). Como `uploadArtifacts` segue `false` (`P03-006`), os valores numéricos exatos dessas categorias não são recuperáveis; a prova é a ausência de falha em asserção `error`.

O SEO (0,58, subiu dos 0,45–0,5 das fases anteriores após a inclusão da `meta description`) permanece `warn`: o preview sob Deployment Protection responde `X-Robots-Tag: noindex`, o que reprova `is-crawlable` independente do conteúdo. Volta a `error` na Fase 6 contra o site indexável.

## Itens mecânicos do gabarito

### Item 1 — `pnpm audit --audit-level=high` limpo

**PASS.** Verificação 1, código 0. `pnpm audit` reporta 10 vulnerabilidades: 8 moderate e 2 high ignoradas (as duas `extract-zip` já allowlisted desde a Fase 1, `P03-001`/`P03-002`). Nenhuma high ou critical nova. A única dependência nova da fase é `playwright@1.64.1` (devDependency, `T-04.1-SC`).

### Item 2/3 — superfície inline

**PASS.** Verificação 2: nenhum `style=` em `src/`. Valores dinâmicos (`--p`, `--rx`, `--ry`, `--sx`) vão só por `style.setProperty` (CSSOM) em `scroll.ts` e `tilt.ts`, nunca por `setAttribute('style')`. Verificação 3: os blocos `<style>` inline são apenas `@font-face` da Fonts API; CSS de página segue externalizado. Zero `set:html`, `innerHTML`, `eval` ou `new Function` em `src/`.

### Item 3 (cabeçalhos) — `curl -I` do preview

**Coberto pela fase anterior, sem regressão de configuração.** Esta fase não alterou `vercel.json` nem o adapter; os cabeçalhos do preview permanecem os registrados em `phase-04.md` (`Strict-Transport-Security` presente e `X-Robots-Tag: noindex` de Deployment Protection). A CSP estrita e o conjunto completo de cabeçalhos são escopo da Fase 7.

### Item 4 — segredos

**PASS.** Verificação 4. Nenhuma entrada `astro:env` nova; nenhum segredo introduzido.

### Item 5 — Functions serverless <= 1

**PASS.** Verificação 5: 0 Functions. A Fase 5 leva a contagem a 1 (`/api/orcamento`).

### Item 6 — Lighthouse mobile >= 95, TBT < 200 ms, CLS < 0,05

**PASS via `lhci` do CI** (ver acima). Execução local não é considerada, pela contaminação conhecida.

### Item 7 — achados com severidade, responsável e prazo; nenhum High aberto

**PASS.** Ver tabela. **Nenhum achado High em aberto.**

## Itens de julgamento

- **Dependência nova justificada?** Sim: `playwright@1.64.1` como devDependency, aprovada pelo usuário na sessão (plano 04.1-01), versão exata, fora de `onlyBuiltDependencies`, usada só em scripts de verificação e no job `verify`. Nada entra no bundle do cliente.
- **Asset de terceiros novo?** Não. Fontes Sora, Inter Tight e JetBrains Mono são self-host via Fonts API; o grão é arquivo same-origin; a captura do site é WebP gerado no repositório. A foto do fundador já era pública (quick 261015-2fr).
- **Segredo novo?** Não.
- **Achados menores com responsável e prazo, sem High aberto no fechamento?** Sim, tabela abaixo.

## Cobertura do threat model da fase (T-04.1-xx)

| Ameaça | Disposição | Resultado |
|--------|-----------|-----------|
| T-04.1-SC supply chain do `playwright` | mitigado | versão exata no lockfile, aprovada pelo usuário, só devDependency, audit sem high novo |
| T-04.1-01 servidor `node:http` dos gates | mitigado | escuta só em `127.0.0.1`, porta efêmera, bloqueio de path traversal por prefixo de raiz (agora em `static-server.mjs`) |
| T-04.1-02 mudança de escopo (SEO-07, ANIM) | aceito | versionado no git com referência a D-02/D-12 |
| T-04.1-03, -07, -16, -23 XSS | mitigado | texto só por expressão Astro; sem `set:html`/`innerHTML`; gate estático |
| T-04.1-04, -14, -17, -08, -25 CSP (`style-src-attr`) | mitigado | zero `style=`; CSSOM `setProperty` apenas; verificação 2 verde |
| T-04.1-05 terceiros em fontes | mitigado | gate `fonts` reprova googleapis/gstatic |
| T-04.1-06 conteúdo invisível sem JS | mitigado | estado oculto só sob `html.js-ready` + no-preference; failsafe de 3 s; gates `nojs`, `reveal`, `fallback` verdes |
| T-04.1-09 CPU/bateria | mitigado | listener passivo com rAF; loops CSS pausados por IntersectionObserver |
| T-04.1-10, -33 schema de conteúdo | mitigado | `z.strictObject`; testes negativos |
| T-04.1-11, -24, -32 claims enganosos | mitigado | exemplos rotulados "exemplo de escopo", sem métricas; greps de jargão/prazo/preço no `aurora-gates` |
| T-04.1-12 conteúdo público | aceito | sem dados de cliente real |
| T-04.1-13, -21 tabnabbing | mitigado | `rel="noopener noreferrer"`; gate `blank` |
| T-04.1-15 favicon | aceito | script de geração fora do repositório |
| T-04.1-18 EXIF da foto | aceito | Sharp remove metadados; imagem já pública |
| T-04.1-19, -20 LGPD / entrada | mitigado | coleta mínima, aviso e link da política; validação server-side é da Fase 5 |
| T-04.1-22 submit sem handler | aceito | sem `action`, não envia dado algum até a Fase 5 ligar o endpoint |
| T-04.1-26 regressão de gates | mitigado | nenhum gate afrouxado; `security-check.sh` e `js-weight-check.sh` rodam verdes |
| T-04.1-27 capturas de polish | mitigado | ficaram no scratchpad |
| T-04.1-28 supply chain no CI | mitigado | `permissions: contents: read`; versão do playwright pelo lockfile; sem segredo exposto ao step |
| T-04.1-29 captura do site | mitigado | home pública, reduced-motion, `#projetos` oculto; PNG intermediário em `os.tmpdir()` removido ao final; só o WebP é versionado |
| T-04.1-30 enfraquecer gates do CI | mitigado | `lighthouserc.json` intocado; required checks `verify`, `dependency-review`, `lhci` mantidos |
| T-04.1-31 fechamento da fase | mitigado | este arquivo; aceite visual via `/gsd-verify-work` |

Correção incluída nesta fase por achado do lhci/polish: a `<meta name="description">` estava ausente (auditoria `meta-description` falhava). Foi adicionada em `BaseLayout.astro` com texto por página; as páginas 404, obrigado e política passam descrição própria.

## Tabela de achados (esquema D-12)

Convenção de ID: `P041-NNN`. Severidade: `Low` / `Med` / `High`. Responsável padrão: `Felipe Salles`.

| ID | Description | Severity | Status | Action | Target date | Owner |
|----|-------------|----------|--------|--------|-------------|-------|
| P041-001 | `<meta name="description">` ausente em todas as páginas até o plano 04.1-11 (SEO 0,91 local, auditoria `meta-description`). | Low | Fechado | Adicionada em `BaseLayout.astro` com prop `description` e texto por página. | 2026-10-15 | Felipe Salles |
| P041-002 | T-04.1-22 — botão de envio do formulário sem handler/`action` até a Fase 5. O submit nativo apenas recarrega a página, sem enviar dados. | Low | Aceito | A Fase 5 liga o endpoint `/api/orcamento` com validação Zod, honeypot e rate limit. | Fase 5 | Felipe Salles |
| P041-003 | T-04.1-SC — `playwright@1.64.1` como devDependency nova (gates de browser e captura). Baixa o Chromium no CI. | Low | Aceito | Manter versão exata; revisar a cada atualização de lockfile; `pnpm audit` no CI cobre. | Sem prazo fixo | Felipe Salles |
| P041-004 | `pnpm audit` reporta 8 moderate (transitivas dev/CI-only, mesma família `uuid`/`qs`/`@lhci/cli` de `P04-001..003`). Nenhuma high nova. | Med | Aceito | Revisitar quando `@lhci/cli` atualizar as dependências transitivas. | 2026-12-31 | Felipe Salles |
| P041-005 | Cases de exemplo ("exemplo de escopo") são ilustrativos; risco de leitura como cliente real. Mitigado por rótulo obrigatório e ausência de métricas. | Low | Aceito | Substituir por casos reais quando houver autorização de clientes. | Sem prazo fixo | Felipe Salles |
| P03-001 (carregado) | Advisory `GHSA-jmr9-qjv8-65gv` em `extract-zip`, allowlisted. | Med | Aceito | Revisitar quando `extract-zip >= 2.0.2` publicar. | 2026-11-30 | Felipe Salles |
| P03-002 (carregado) | Advisory `GHSA-7pqw-9j4j-h8q3` em `extract-zip`. | Med | Aceito | Igual a P03-001. | 2026-11-30 | Felipe Salles |
| P03-006 (carregado) | `lighthouserc.json` com `uploadArtifacts: false`: números exatos do lhci não ficam auditáveis. Esta fase depende do passa/falha. | Low | Aberto | Avaliar `uploadArtifacts: true` numa fase futura de observabilidade. | 2026-12-31 | Felipe Salles |
| P02-003 (carregado) | Campos da collection `cases` agora renderizados por `ProjectsSection` com expressão escapada, sem `set:html`; o item deixa de ser risco. | Low | Fechado | Interpolação escapada aplicada. | 2026-10-15 | Felipe Salles |

**Nenhum achado High em aberto.** Duas linhas `Med` (extract-zip herdadas) e uma `Med` nova (audit moderate dev/CI-only), todas aceitas e fora do bundle do cliente.

## Linha de fechamento — regra dura

A Fase 04.1 satisfaz a regra dura do gabarito: nenhuma linha é `High` e `Aberto`. As verificações mecânicas 1 a 5 passam; a 6 não regrediu (nenhuma mudança de cabeçalhos); a 7 passa no gate autoritativo (`lhci` do PR #3) com o único aviso estrutural de SEO sob Deployment Protection.

## Sign-off

**Pendente:** assinatura do Felipe. Por decisão do usuário não há checkpoint bloqueante nesta fase; o aceite visual acontece via `/gsd-verify-work` e auditoria Impeccable.
