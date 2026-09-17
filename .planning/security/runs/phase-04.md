# Revisão de segurança SEC-07 — Fase 4 — Progressive-Enhancement Effects

## Cabeçalho

- **Fase:** `Fase 4 — Progressive-Enhancement Effects`
- **Data da execução:** 2026-09-17
- **Commit revisado (HEAD do PR):** `c9543ef620777046ced539d4bacb659b37e532f4` — `docs(04-03): complete particle canvas and pause gate plan`
- **URL de preview revisada:** `https://dmarques-b5802k9dz-felipe-salles-projects.vercel.app` (PR #3, READY)
- **Gabarito respondido:** `.planning/security/SECURITY-CHECKLIST.md` (não modificado por esta execução)
- **Como foi gerado:** PR #3 aberto contra `main` a partir de `phases/04-progressive-enhancement-effects` (consolida os planos 04-01 a 04-03, nunca antes enviados a `origin`) → deploy de preview da Vercel READY → verificação instrumentada via Chrome DevTools Protocol (Task 1, seis medições A–F) → `bash scripts/security-check.sh --ci` rodado duas vezes (sem `PREVIEW_URL`, no build local; com `PREVIEW_URL` + `VERCEL_AUTOMATION_BYPASS_SECRET`, contra o preview real) → job `lhci` do GitHub Actions consultado via `gh run view --log`.

## Medições instrumentadas (Task 1, CDP) — resumo

Executadas via Chrome headless (`--remote-debugging-port`) dirigido por um script Node de scratchpad (nunca commitado), usando o `WebSocket` nativo do Node, exatamente como o plano 03-08 fez. Números completos no `04-04-SUMMARY.md`.

| Medição | Resultado |
|---|---|
| A — `.js-ready` + reveal | `js-ready` presente; 0 revelados no load (explicado — ver SUMMARY); 26/26 revelados aos 3s (fallback provado) |
| B — gate do glow | `display: block` (desktop); `display: none` + `transform` inalterado após eventos sintéticos (reduced-motion e touch) |
| C — pausa do canvas | baseline 12,25 ms; fora da tela 1,78 ms (14,5%); aba oculta 0,88 ms (7,2%) — ambos abaixo do teto de 20% |
| D — frame estático reduced-motion | amostra central do canvas soma 43.447 (desenhou); delta de 2,13 ms (parou) |
| E — cap de DPR | `canvas.width / rect.width` = exatamente `1.5` com `deviceScaleFactor: 3` |
| F — regressão de keyframes | `src/styles/base.css` e `src/components/HeroBleed.astro` inalterados desde a Fase 3; nenhum `dmFloat`/`dmPulse` fora do guarda-chuva em `src/scripts/`/`src/layouts/` |

## Saída completa e verbatim de `scripts/security-check.sh --ci`

### Execução 1 — build local, sem `PREVIEW_URL` (paridade com o build de cada plano)

```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 8  |  blocos @font-face: 48  |  <script> inline sem src: 12
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 0 (no maximo 1)
SKIP: verificacao 6 - PREVIEW_URL nao definido; inspecao curl -I de cabecalhos adiada
SKIP: verificacao 7 - nenhuma URL de preview disponivel; gate do Lighthouse adiado
== resumo: 5 PASS / 0 FAIL / 2 SKIP ==
```

Código de saída: **0**.

### Execução 2 — contra o preview real, com `PREVIEW_URL` + `VERCEL_AUTOMATION_BYPASS_SECRET`

```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 8  |  blocos @font-face: 48  |  <script> inline sem src: 12
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 0 (no maximo 1)
  cabecalhos de https://dmarques-b5802k9dz-felipe-salles-projects.vercel.app:
    HTTP/1.1 200 OK
    Accept-Ranges: bytes
    Access-Control-Allow-Origin: *
    Age: 52
    Cache-Control: public, max-age=0, must-revalidate
    Content-Disposition: inline
    Content-Length: 34315
    Content-Type: text/html; charset=utf-8
    Date: Thu, 17 Sep 2026 15:12:55 GMT
    Etag: "0d5563ea49d66e24ce01f3113ec218c4"
    Last-Modified: Thu, 17 Sep 2026 15:12:03 GMT
    Server: Vercel
    Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
    X-Robots-Tag: noindex
    X-Vercel-Cache: HIT
    X-Vercel-Id: gru1::95kpl-1789657975825-7ad706be97e8
PASS: verificacao 6 - cabecalhos do preview registrados (baseline da Fase 1; assercoes valem a partir da Fase 7)
✅  .lighthouseci/ directory writable
✅  Configuration file found
✅  Chrome installation found
Healthcheck passed!

Running Lighthouse 3 time(s) on https://dmarques-b5802k9dz-felipe-salles-projects.vercel.app
Run #1...done.
Run #2...done.
Run #3...done.
Done running Lighthouse!

Checking assertions against 1 URL(s), 3 total run(s)

4 result(s) for https://dmarques-b5802k9dz-felipe-salles-projects.vercel.app/ :

  ×  categories.performance failure for minScore assertion
        expected: >=0.95
           found: 0.9
      all values: 0.87, 0.9, 0.88

  ×  largest-contentful-paint failure for maxNumericValue assertion
        expected: <=2500
           found: 3064.0420000000004
      all values: 3253.069, 3064.0420000000004, 3084.237

  ×  resource-summary.script.size failure for maxNumericValue assertion
        expected: <=20480
           found: 165217
      all values: 165219, 165217, 165217

  ⚠️  categories.seo warning for minScore assertion
        expected: >=0.95
           found: 0.5
      all values: 0.5, 0.5, 0.5

Assertion failed. Exiting with status code 1.
assert command failed. Exiting with status code 1.
FAIL: verificacao 7 - gate do Lighthouse reprovado
== resumo: 6 PASS / 1 FAIL / 0 SKIP ==
```

Código de saída: **1**, só por causa da verificação 7 local.

**Nota sobre a verificação 7 local — o mesmo falso-negativo já documentado nas Fases 1 e 3.** A execução local do Lighthouse nesta máquina (Windows, mesma máquina de `phase-01.md`/`phase-03.md`) sofre a mesma interferência conhecida de antivírus/`chrome-launcher` que injeta script no Chrome headless controlado. Evidência: `bash scripts/js-weight-check.sh` (mede o peso real do build, sem navegador) reporta **2645 B gzip** de `<script>` — dentro do orçamento de 20480 B, com **17835 B de folga (87%)** — enquanto o Lighthouse local mediu **165217 B** de `resource-summary.script.size`, uma discrepância de ~62x que só pode vir de script injetado pelo host, não pelo site. O número (165217 B) é quase idêntico ao artefato já registrado em `phase-03.md` (165156–165157 B) rodado na mesma máquina, confirmando que é o mesmo processo de host interferindo, não uma regressão desta fase. Performance 0,87–0,90 e LCP ~3,1s locais são consequência do mesmo script injetado inflando o peso e o tempo de execução da página. Como nas Fases 1 e 3, **o gate autoritativo é o job `lhci` do GitHub Actions**, não a execução local.

### Job `lhci` do PR #3 (GitHub Actions, autoritativo)

`gh pr checks 3` reporta `lhci` como **pass** (53s). O log (`gh run view 35237626518 --log`) mostra:

```
Checking assertions against 1 URL(s), 3 total run(s)

1 result(s) for https://dmarques-b5802k9dz-felipe-salles-projects.vercel.app/ :

  ⚠️  categories.seo warning for minScore assertion
        expected: >=0.95
           found: 0.5
      all values: 0.5, 0.5, 0.5

All results processed!
```

Nenhuma falha (`×`) é reportada — nem para `categories.performance`, `categories.accessibility`, `categories.best-practices`, `largest-contentful-paint`, `cumulative-layout-shift`, `total-blocking-time` nem `resource-summary:script:size` — apenas o warning esperado de SEO. `lighthouserc.json` configura todas essas sete asserções como `error` (limiares: Performance/Accessibility/Best Practices `>=0.95`, LCP `<=2500ms`, **CLS `<=0.05`**, **TBT `<=200ms`**, script `<=20480B`); a ausência de qualquer `×` nessas sete linhas é a prova de que todas passaram no gate autoritativo, incluindo TBT e CLS explicitamente exigidos por esta fase.

**Limitação herdada, não introduzida por esta fase (`P03-006`):** `lighthouserc.json` roda com `uploadArtifacts: false` (decisão da Fase 1), então os relatórios brutos não ficam anexados ao run — os quatro números exatos por categoria e os valores numéricos de LCP/CLS/TBT do job `lhci` não são recuperáveis depois que o job termina, apenas o resultado passa/falha (`error`) ou aviso (`warn`) de cada assertion configurada. `P03-006` permanece **Aberto**, carregado adiante sem mudança.

O warning de SEO (0.5) é o mesmo comportamento estrutural documentado nas Fases 1 e 3: o preview sob Deployment Protection responde `X-Robots-Tag: noindex`, o que derruba `is-crawlable` independente do conteúdo da página. `categories.seo` permanece `warn` em `lighthouserc.json` até a Fase 6.

## Itens mecânicos do gabarito (respondidos por número)

### Item 1 — `pnpm audit` limpo em `--audit-level=high`

**PASS:** verificação 1, ambas as execuções, código de saída 0. Esta fase instala **ZERO** pacotes — `pnpm-lock.yaml` está byte-a-byte inalterado desde `origin/main` (confirmado via `git diff origin/main -- pnpm-lock.yaml`, sem saída); a única mudança em `package.json` foi a linha do script `test` (plano 04-01), que não adiciona nenhuma dependência.

`pnpm audit --audit-level=high` reporta **5 vulnerabilidades: 3 moderate + 2 high (2 ignoradas)**. As 2 `high` são as duas advisories `extract-zip` já allowlisted em `pnpm-workspace.yaml` desde a Fase 1 (`P01-001`/`P01-002`, carregadas como `P03-001`/`P03-002` na Fase 3) — árvore inalterada, nenhuma reabertura. As 3 `moderate` são **novas nesta fase**: publicadas contra pacotes transitivos dev/CI-only de `@lhci/cli` (não fazem parte do bundle do cliente) — registradas na tabela abaixo (`P04-001`, `P04-002`, `P04-003`), nunca ignoradas em silêncio, e não derrubam o limiar `--audit-level=high` do gate.

### Item 2/3 — grep por nova superfície inline

**PASS:** verificação 2 — `nenhum atributo style= em src/`. O único caso de escrita de estilo desta fase é `glow.ts` fazendo `glow.style.transform = ...` **em runtime**, dentro de um `requestAnimationFrame`, nunca um atributo `style="` de autoria estática — o grep da verificação 2 procura literalmente `style="` em arquivos-fonte e corretamente não encontra nada, porque essa é uma mutação de propriedade DOM em JavaScript, não um atributo HTML. Confirmado por `grep -rn 'style=' src/scripts/ src/layouts/BaseLayout.astro` não retornar a linha da atribuição em `glow.ts` (ela usa `.style.transform =`, sem aspas de atributo). Verificação 3 — os 8 blocos `<style>` inline no HTML construído continuam sendo os `@font-face` da Astro Fonts API mais o bloco escopado do `.cursor-glow` em `BaseLayout.astro` (CSS de componente escopado do Astro, externalizado pelo `build.inlineStylesheets: 'never'` do projeto — não é CSS de página/token/bundle inline, que é o único caso que reprovaria a verificação).

### Superfície NOVA de script — primeira fase com JavaScript no projeto

O HTML construído (`grep -oE '<script[^>]*>' .vercel/output/static/index.html`) contém **3** tags `<script>`; **2** são de autoria desta fase (a terceira, `<script type="module">` do beacon `@vercel/analytics`, já existe desde a Fase 1 e não foi tocada):

1. **`<script is:inline>`** (sem `type=`) em `BaseLayout.astro`, conteúdo de instrução única: `document.documentElement.classList.add('js-ready')`. Estático, sem `import`, sem interpolação de template Astro, auto-hasheável pela `security.csp` da Fase 7 sem `unsafe-inline`. Deliberadamente síncrono e separado do bundle (D-11 do `04-CONTEXT.md`) para nunca deixar o conteúdo aparecer-e-sumir antes do primeiro paint.
2. **`<script type="module">`** que importa `../scripts/effects.ts` — o bundle único (reveal + glow + partículas) processado pelo Vite/Astro como recurso same-origin, coberto por `script-src 'self'` sem `unsafe-inline`.

Evidência de ausência de construções perigosas no HTML construído:

```
grep -o 'eval(' .vercel/output/static/index.html          -> nenhuma ocorrência
grep -o 'new Function(' .vercel/output/static/index.html  -> nenhuma ocorrência
grep -oE '\son[a-z]+="' .vercel/output/static/index.html  -> nenhuma ocorrência (atributo de handler inline)
```

### Item 3 — inspeção `curl -I` dos cabeçalhos do preview implantado

**PASS:** verificação 6, execução 2. Cabeçalhos capturados verbatim acima, idênticos em forma aos das Fases 1 e 3 (`Strict-Transport-Security` presente; `X-Robots-Tag: noindex` presente, esperado sob Deployment Protection). Ainda uma baseline de regressão, não uma asserção de conformidade — a CSP estrita e o conjunto completo de headers são escopo da Fase 7.

### Item 4 — varredura de segredos na saída de build

**PASS:** verificação 4, ambas as execuções. Nenhuma entrada `astro:env` nova nesta fase; nenhum segredo introduzido.

### Item 5 — contagem de Functions serverless `<= 1`

**PASS:** verificação 5, ambas as execuções — 0 Functions. A Fase 5 continua sendo a única que leva a contagem a exatamente 1 (`/api/orcamento`).

### Item 6 — gate do Lighthouse: mobile `>= 95` nas quatro categorias, TBT < 200ms, CLS < 0,05

**PASS (via job `lhci` do CI, autoritativo):** Performance, Accessibility, Best Practices, LCP, **CLS** e **TBT** não geraram nenhuma falha de assertion no job `lhci` do PR #3 (todas configuradas como `error` em `lighthouserc.json`) — apenas o warning esperado de SEO (0,5, estrutural sob Deployment Protection, `warn` desde a Fase 1). A execução **local** da verificação 7 falhou (Performance 0,87–0,90, LCP ~3,1s, script 165217 B), artefato conhecido desta máquina já documentado nas Fases 1 e 3 (antivírus/`chrome-launcher` injetando script no Chrome headless), refutado por `js-weight-check.sh` medir 2645 B reais de JS no build. Números numéricos exatos de TBT/CLS do job `lhci` não são recuperáveis (`uploadArtifacts: false`, `P03-006` já aberto) — a prova de conformidade é a ausência de falha de assertion `error`, não um valor numérico copiado do relatório.

Complementarmente, a Task 1 desta fase mediu por CDP, contra o build local, que o `ScriptDuration` cai para 14,5% (fora da tela) e 7,2% (aba oculta) da linha de base de 3s com o hero visível — evidência independente de que o loop do canvas realmente para, reduzindo o risco de que o TBT medido pelo `lhci` inclua trabalho de partículas fora da janela relevante.

### Item 7 — achados registrados com severidade / responsável / prazo; nenhum achado High em aberto

**PASS (julgamento):** ver tabela abaixo. Nenhuma linha `High` **e** `Aberto`.

## Itens de julgamento (respondidos à mão)

### Toda dependência nova está justificada nas notas da fase?

**Não há dependência nova.** Esta fase (planos 04-01 a 04-03) instala zero pacotes; `pnpm-lock.yaml` inalterado desde `origin/main`. Confirmado nos três `04-0N-SUMMARY.md` (`tech-stack.added: []` em todos).

### Todo asset de terceiros novo é self-hosted ou tem integridade verificável e justificativa documentada?

**Nenhum asset novo.** Esta fase não adiciona imagem, fonte ou recurso de terceiros — apenas comportamento JavaScript sobre markup/CSS já existente.

### Todo segredo novo foi declarado em `astro:env` com `access: 'secret'` e comprovadamente fica fora do bundle do cliente?

**Nenhum segredo novo.** Verificação 4 confirma ausência de qualquer padrão de segredo na saída servida ao cliente.

### Cada achado de severidade menor tem responsável e prazo, e nenhum achado High permanece em aberto no fechamento da fase?

Sim — ver tabela abaixo. Todas as linhas novas têm responsável `Felipe Salles`, prazo e ação. Nenhuma é `High`.

## Decisão de arquitetura registrada (não é achado de segurança)

**Token `--z-cursor-glow: 20`** (plano 04-02), divergindo da sugestão original de `04-PATTERNS.md` de reaproveitar `--z-glow: 5`. Toda seção já entregue na Fase 3 é `position: relative` com fundo opaco em `z-index: var(--z-section)` (10) — um glow em 5 renderizaria invisível, abaixo de todo o conteúdo. `--z-cursor-glow: 20` é o menor valor acima de `--z-section` e abaixo de `--z-nav` (50). Registrado aqui para a Fase 7 conhecer a pilha de `z-index` final antes de escrever a CSP e qualquer regra de layout dependente de empilhamento.

## Riscos aceitos desta fase (threat models 04-01 a 04-03)

- **T-04-03** (plano 04-01) — hints do browser (`navigator.hardwareConcurrency`, `navigator.connection.saveData`) são propositalmente imprecisos/fingerprinting-resistant; iOS Safari e Firefox com `resistFingerprinting` fixam `hardwareConcurrency` em 2, o que sempre dispara a redução de partículas (D-07/D-08). **Todo visitante de iPhone recebe metade das partículas** — comportamento esperado (RESEARCH Pitfall 4), não defeito. Tratados como contrato de comportamento, nunca como decisão de segurança.
- **T-04-13** (plano 04-03) — mesma limitação de `hardwareConcurrency`/`navigator.connection`, aqui sob a ótica de disclosure: a fase apenas **lê** esses hints para dimensionar trabalho local, nunca os transmite (não há rede nesta fase).
- **T-04-15** (plano 04-03) — `ResizeObserver` dispara `seed()` sem debounce. `seed()` é O(n) com `n <= 90` e só realoca o array de pontos; uma rajada de resize custa microssegundos. Debounce seria complexidade sem ganho mensurável.

Riscos aceitos triviais (sem residual mensurável, não tabelados): T-04-01/T-04-02/T-04-SC (planos 04-01/04-02/04-03) — todos `mitigate`, cobertos por grep de aceite automatizado nos próprios planos, sem julgamento humano residual.

## Fechamento do achado herdado — SEO / `X-Robots-Tag`

Sem mudança: `categories.seo` continua `warn` em `lighthouserc.json` até a Fase 6, pela mesma razão estrutural documentada em `phase-01.md`/`phase-03.md` (Deployment Protection → `X-Robots-Tag: noindex` → `is-crawlable` reprovado, independente do conteúdo).

## Tabela de achados (esquema D-12)

Convenção de ID: `P04-NNN`. Vocabulário de severidade: `Low` / `Med` / `High`. Responsável padrão: `Felipe Salles`.

| ID | Description | Severity | Status | Action | Target date | Owner |
|----|-------------|----------|--------|--------|-------------|-------|
| P04-001 | Advisory `GHSA-w5hq-g745-h8pq` em `uuid` (<11.1.1) — buffer bounds check ausente em v3/v5/v6 quando `buf` é fornecido. Transitivo dev/CI-only via `@lhci/cli > uuid`. Nova nesta fase (árvore do `@lhci/cli` avançou desde a Fase 3); não afeta o bundle do cliente. | Med | Aceito | Revisitar quando `@lhci/cli` atualizar sua dependência de `uuid` para `>=11.1.1` ou o caminho transitivo for removido. | 2026-12-31 | Felipe Salles |
| P04-002 | Advisory `GHSA-x5fp-wj9c-mxmx` em `qs` (`>=6.14.2 <=6.15.3`) — bypass de `array-limit` via chave com vírgula entre colchetes. Transitivo dev/CI-only via `@lhci/cli > express > body-parser > qs` e `@lhci/cli > express > qs`. Nova nesta fase. | Med | Aceito | Revisitar quando `@lhci/cli`/`express` atualizarem `qs` para `>=6.16.0` ou o caminho transitivo for removido. | 2026-12-31 | Felipe Salles |
| P04-003 | Advisory `GHSA-4mjr-xmp4-gh2g` em `qs` (`>=2.2.5 <6.16.0`) — Denial of Service via `isBuffer` controlado pelo atacante. Mesmo caminho transitivo de P04-002, mesma dependência `qs`, resolvida junto quando `qs>=6.16.0` publicar. | Med | Aceito | Igual a P04-002 — mesma atualização resolve ambas. | 2026-12-31 | Felipe Salles |
| P04-004 | T-04-03/T-04-13 — `navigator.hardwareConcurrency` fixado em 2 pelo iOS Safari e por navegadores com `resistFingerprinting` (Firefox), disparando a redução de 50% na contagem de partículas para todo visitante de iPhone, independente da capacidade real do aparelho. | Low | Aceito | Nenhuma ação — comportamento esperado e documentado (D-07/D-08, RESEARCH Pitfall 4); reavaliar apenas se virar reclamação real de usuário sobre densidade visual em iOS. | Sem prazo fixo | Felipe Salles |
| P04-005 | T-04-15 — `ResizeObserver` chama `seed()` sem debounce em `particles.ts`; uma rajada de eventos de resize recalcula pontos repetidamente. Custo médio por chamada é O(n<=90), na ordem de microssegundos. | Low | Aceito | Nenhuma ação planejada para v1 — debounce seria complexidade sem ganho mensurável; revisitar se um teste real de resize-rajada em dispositivo de baixo custo mostrar jank. | Sem prazo fixo | Felipe Salles |
| P04-006 | Medição A (Task 1) mostrou 0 elementos `[data-reveal].is-revealed` imediatamente após o load em viewport 1440x900 — o primeiro elemento com `data-reveal` (`.services-intro`) começa a 846,78px em uma viewport de 900px, e o `rootMargin: '0px 0px -8%'` do IntersectionObserver (locked, ANIM-01) desloca a borda efetiva do root para 828px, então nada intersecta antes do usuário rolar. Comportamento correto do mecanismo já travado pelo ROADMAP, não um defeito — mas diverge da premissa textual do plano 04-04 de que algo ficaria visível "acima da dobra" no load. | Low | Aceito | Nenhuma ação de código — documentar para planners futuros que "revelado no load" depende da altura real da viewport/hero e não deve ser tratado como regressão se vier 0 em telas comuns. | Sem prazo fixo | Felipe Salles |
| P03-001 (carregado) | Advisory `GHSA-jmr9-qjv8-65gv` em `extract-zip` (<=2.0.1). Allowlisted em `pnpm-workspace.yaml`. Árvore inalterada nesta fase. | Med | Aceito | Revisitar quando `extract-zip >=2.0.2` publicar ou o caminho transitivo for removido. | 2026-11-30 | Felipe Salles |
| P03-002 (carregado) | Advisory `GHSA-7pqw-9j4j-h8q3` em `extract-zip`, mesmo caminho transitivo. | Med | Aceito | Igual a P03-001. | 2026-11-30 | Felipe Salles |
| P03-003 (carregado) | T-03-09 — disclosure `<details>`/`<summary>` do menu mobile não fecha ao clicar fora do painel. | Low | Aceito | Reavaliar como enhancement JS apenas se virar reclamação real de usuário — esta fase adicionou JS ao projeto mas não tocou o menu mobile; permanece candidato natural para uma fase futura. | 2026-12-31 | Felipe Salles |
| P03-004 (carregado) | T-03-18 — e-mail e telefone do fundador em texto claro no HTML do rodapé. | Low | Aceito | TRUST-01 já é item pós-validação; nenhuma ofuscação adicional planejada para v1. | 2026-12-31 | Felipe Salles |
| P03-005 (carregado) | T-03-10 — `alt` do retrato do fundador descreve a pessoa real sobre um placeholder vetorial. | Low | Aceito | Resolve automaticamente quando o arquivo placeholder for substituído pela foto real. | Sem prazo fixo (aguarda ativo) | Felipe Salles |
| P03-006 (carregado) | `lighthouserc.json` com `uploadArtifacts: false` — números exatos por categoria e LCP/CLS/TBT do job `lhci` não ficam disponíveis para auditoria após o run, apenas passa/falha por assertion. Esta fase depende explicitamente desse mesmo comportamento para provar TBT/CLS (ver Item 6 acima). | Low | Aberto | Avaliar `uploadArtifacts: true` numa fase futura de observabilidade/CI — a necessidade ficou mais concreta nesta fase (primeiro TBT/CLS reais do projeto), mas nenhuma mudança de config foi feita aqui (fora de escopo do plano 04-04). | 2026-12-31 | Felipe Salles |
| P02-003 (carregado) | Campos da collection `cases` ainda não renderizados por nenhum componente. | Low | Aberto | Aplicar interpolação escapada quando uma fase futura decidir renderizar `cases`. | Sem prazo fixo | Felipe Salles |

Nenhuma linha está `High` **e** `Aberto`. Sete linhas `Med` (duas extract-zip herdadas + três novas `uuid`/`qs` desta fase, todas dev/CI-only via `@lhci/cli`, nunca no bundle do cliente); as demais são `Low`.

## Linha de fechamento — regra dura

A Fase 4 **satisfaz** a regra dura do gabarito ("Nenhuma fase fecha com achado High em aberto."): das treze linhas registradas (seis novas + sete carregadas), nenhuma é `High`. As verificações mecânicas 1 a 6 passam em ambas as execuções (local e contra o preview); a verificação 7 passa no gate autoritativo (`lhci` do CI, incluindo TBT e CLS explícitos como asserções `error` sem falha) e falha apenas na execução local por um artefato de ambiente já documentado nas Fases 1 e 3, refutado por medição independente (`js-weight-check.sh` e a Task 1 deste plano). `pnpm audit --audit-level=high` limpo (3 moderate novas registradas e aceitas, 2 high já allowlisted); nenhum segredo novo; nenhum domínio de terceiro novo; contagem de Functions ainda 0; as seis medições instrumentadas da Task 1 provam por medição — não por leitura de código — que o loop do canvas para fora da viewport e com a aba oculta, que o glow não renderiza sob reduced-motion/ponteiro grosso, e que o DPR efetivo nunca passa de 1,5.

## Sign-off

Pendente — checkpoint de aceite (Task 3 do plano 04-04) ainda não apresentado ao Felipe. Esta seção será atualizada com a transcrição literal da resposta dele assim que o checkpoint for respondido, conforme o mesmo formato usado em `phase-03.md`.

**Declaração provisória:** nenhum achado `High` em aberto (tabela acima). Fase 4 permanece **aberta** até a assinatura humana da Task 3.
