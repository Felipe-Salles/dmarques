# Revisão de segurança SEC-07 — Fase 2 — Content Collections

## Cabeçalho

- **Fase:** `Fase 2 — Content Collections`
- **Data da execução:** 2026-09-15
- **Commit revisado (HEAD de `main`):** `088e3ead323e56049f18e5049f575e0dbde9c805` — `docs(02-02): complete plan 02-content-collections/02-02`
- **URL de preview revisada:** nenhum preview de fase 2 ainda publicado
- **Gabarito respondido:** `.planning/security/SECURITY-CHECKLIST.md` (não modificado por esta execução)
- **Como foi gerado:** `pnpm install --frozen-lockfile` (lockfile resolvido sem alteração, `Already up to date`) → `pnpm build` (`output: "static"`, adaptador `@astrojs/vercel`, 1 página, 0 Functions) → `bash scripts/security-check.sh --ci`, todos no HEAD `088e3ea`, a partir da raiz do repo.

A Fase 2 não altera nenhuma página construída nem adiciona rota — ela adiciona apenas dados de
conteúdo (Content Collections) consumidos por fases futuras (3 e 6). Não há preview da Vercel
específico para o HEAD de fase 2 ainda publicado; as verificações 6 e 7 do script (baseline de
cabeçalhos e gate do Lighthouse contra preview) ficam `SKIP` sem `PREVIEW_URL`, exatamente como
esperado pela interface documentada no plano.

## Saída completa e verbatim de `scripts/security-check.sh --ci`

Nenhum valor de segredo aparece na saída — o script nunca ecoa `VERCEL_AUTOMATION_BYPASS_SECRET`;
não há nenhuma ocorrência do padrão `re_[A-Za-z0-9_-]{20,}`. Código de saída do processo: **0**
(resumo `5 PASS / 0 FAIL / 2 SKIP`).

```
== SEC-07 verificacoes mecanicas ==
modo: ci
STATIC_DIR: .vercel/output/static
PASS: verificacao 1 - pnpm audit --audit-level=high sem advisories high/critical
PASS: verificacao 2 - nenhum atributo style= em src/
  <style> inline: 2  |  blocos @font-face: 12  |  <script> inline sem src: 1
PASS: verificacao 3 - apenas blocos @font-face da Fonts API inline; nenhum CSS de pagina/token/bundle inline
PASS: verificacao 4 - nenhum nome ou valor de segredo na saida servida ao cliente
PASS: verificacao 5 - contagem de Functions = 0 (no maximo 1)
SKIP: verificacao 6 - PREVIEW_URL nao definido; inspecao curl -I de cabecalhos adiada
SKIP: verificacao 7 - nenhuma URL de preview disponivel; gate do Lighthouse adiado
== resumo: 5 PASS / 0 FAIL / 2 SKIP ==
```

## Itens mecânicos do gabarito (respondidos por número)

### Item 1 — `pnpm audit` limpo em `--audit-level=high`

**PASS:** verificação 1 do script, código de saída 0. A árvore resolvida é idêntica à da Fase 1
— nenhum pacote foi adicionado, removido ou atualizado (`pnpm install --frozen-lockfile` confirma
o lockfile inalterado: `Already up to date`). Os dois advisories `extract-zip` dev/CI-only já
aceitos na Fase 1 (`GHSA-jmr9-qjv8-65gv`, `GHSA-7pqw-9j4j-h8q3`) continuam allowlisted em
`pnpm-workspace.yaml` `auditConfig.ignoreGhsas` e são carregados adiante na tabela de achados
abaixo (`P02-001`, `P02-002`) — nunca ignorados em silêncio.

### Item 2 — grep por nova superfície inline: atributos `style="` em `src/`

**PASS:** verificação 2 do script — `nenhum atributo style= em src/`. Os arquivos que a Fase 2
adiciona são `src/content.config.ts`, `src/content/index.ts`, `src/content/project-types.ts` e
entradas de conteúdo `.yaml`/`.md` — nenhum é um componente `.astro`/`.tsx` com marcação, então
não há superfície `style=` nova possível nesta fase.

### Item 2/3 — blocos `<script>` / `<style>` inline no HTML construído

**PASS:** verificação 3 do script — `apenas blocos @font-face da Fonts API inline; nenhum CSS de
pagina/token/bundle inline`. A página construída (`index.astro`, ainda o placeholder da Fase 1)
não foi tocada por esta fase; a contagem de blocos `@font-face` (12, contra 16 na execução da
Fase 1) reflete apenas a árvore de fontes já registrada, não uma regressão introduzida aqui — a
verificação 3 continua PASS porque nenhum CSS de página/token/bundle foi inlinado.

### Item 3 — inspeção `curl -I` dos cabeçalhos do preview implantado

**SKIP:** verificação 6 do script — sem `PREVIEW_URL` definido (nenhum deploy de preview para o
HEAD de fase 2 foi publicado). Compensação: a linha de base de cabeçalhos já está registrada
contra o preview da Fase 1 em `.planning/security/runs/phase-01.md`; as asserções de cabeçalho só
passam a valer na Fase 7, então este `SKIP` não bloqueia o fechamento da Fase 2.

### Item 4 — varredura de segredos na saída de build

**PASS:** verificação 4 do script — `nenhum nome ou valor de segredo na saida servida ao cliente`.
A Fase 2 não declara nenhuma entrada `astro:env` nova; todo o conteúdo publicado (serviços,
processo, diferenciais, FAQ, o case) é texto institucional público, sem segredo.

### Item 5 — contagem de Functions serverless `<= 1`

**PASS:** verificação 5 do script — `contagem de Functions = 0 (no maximo 1)`. Igual à Fase 1: a
Fase 2 não adiciona nenhuma rota `/api/*`; a Fase 5 continua sendo a única fase que leva a
contagem a exatamente 1.

### Item 6 — gate do Lighthouse: mobile `>= 95` nas quatro categorias

**SKIP:** verificação 7 do script — sem `PREVIEW_URL`, o gate do Lighthouse fica adiado. O
gate autoritativo de performance continua sendo o job `lhci` do CI (GitHub Actions,
`lighthouse.yml`), que roda contra o preview real da Vercel disparado por `deployment_status` a
cada PR. A Fase 2 não altera nenhuma página renderizada (apenas dados de conteúdo ainda não
consumidos por nenhum componente), então não há expectativa de regressão de Lighthouse a medir
nesta fase; a medição volta a ser relevante a partir da Fase 3, quando o conteúdo passa a ser
renderizado nas seções visíveis.

### Item 7 — achados registrados com severidade / responsável / prazo; nenhum achado High em aberto

**PASS (julgamento):** o script produz o resumo `5 PASS / 0 FAIL / 2 SKIP` que alimenta a
triagem; a tabela de achados abaixo (esquema D-12) tem quatro linhas, cada uma com ID, descrição,
severidade (`Med`/`Low`), status, ação, prazo e responsável `Felipe Salles`. **Nenhuma linha é
`High`**, portanto nenhuma está `High` + em aberto. A regra dura do gabarito ("Nenhuma fase fecha
com achado High em aberto.") está satisfeita.

## Itens de julgamento (respondidos à mão)

### Toda dependência nova está justificada nas notas da fase?

**Nenhuma dependência adicionada.** `package.json` e `pnpm-lock.yaml` estão byte-idênticos ao
HEAD de fechamento da Fase 1:

```
$ git diff --stat 09db3f7..HEAD -- package.json pnpm-lock.yaml
(saída vazia — nenhum arquivo alterado)
```

Toda API usada pela Fase 2 (`defineCollection`, `glob`, `z`, `image()`, `getCollection`) é um
export interno do já auditado `astro@7.3.1` (`astro:content`, `astro/loaders`, `astro/zod`), cujo
`zod@^4.5.4` empacotado já havia entrado em `pnpm-lock.yaml` na Fase 1. A geração da imagem de
capa placeholder (`02-02`) reutilizou o Sharp já empacotado dentro de `astro@7.3.1`, resolvido via
`node_modules/.pnpm` + `createRequire` — zero pacote novo instalado, confirmado por
`git diff --stat` acima e pelo `pnpm install --frozen-lockfile` bem-sucedido nesta execução.

### Todo asset de terceiros novo é self-hosted ou tem integridade verificável e justificativa documentada?

**Nenhum.** O único asset novo é `src/content/cases/dmarques-cover.webp` (1600×1000, ~8.5 KB),
gerado localmente a partir de formas vetoriais (sem glifos de texto) e processado em build por
`astro:assets`/Sharp. Nenhum domínio de imagem remoto está configurado; a imagem é servida
same-origin a partir do build estático.

### Todo segredo novo foi declarado em `astro:env` com `access: 'secret'` e comprovadamente fica fora do bundle do cliente?

**Nenhum segredo novo.** A Fase 2 não declara nenhuma entrada `astro:env`. A verificação 4 do
script (varredura por nome de variável e pelo padrão `re_[A-Za-z0-9_-]{20,}` em
`.vercel/output/static`) não encontra nenhuma ocorrência.

### Cada achado de severidade menor tem responsável e prazo, e nenhum achado High permanece em aberto no fechamento da fase?

Sim — ver a tabela abaixo. Todas as quatro linhas têm responsável `Felipe Salles`, prazo e ação.
Nenhuma é `High`.

## Notas latentes de renderização carregadas para fases futuras

Estas duas notas do domínio de segurança da Fase 2 (`02-RESEARCH.md` § "Security Domain",
padrão V1 Encoding/Sanitization) não são um risco desta fase — a Fase 2 mantém todo campo
vinculado a JSON-LD como texto plano (D-11/D-09) — mas são um requisito de corretude para as
fases que efetivamente renderizam esse conteúdo:

- **Fase 3** deve fazer HTML-escape de `problema` / `solucao` / `resultado` (campos do case) ao
  renderizar, já que são strings de texto plano interpoladas em HTML.
- **Fase 6** deve fazer JSON-encode das strings de `faq` (`pergunta`/`resposta`) ao montar o
  script `FAQPage` (JSON-LD), para evitar quebra de sintaxe do script por caracteres especiais.

Ambas registradas como achados `Low` na tabela abaixo (`P02-003`, `P02-004`), com responsável e
fase-alvo — não bloqueiam o fechamento da Fase 2 porque nenhuma delas é exercida por código desta
fase.

## Tabela de achados (esquema D-12)

Convenção de ID: `P02-NNN`. Vocabulário de severidade: `Low` / `Med` / `High`. Responsável
padrão: `Felipe Salles`.

| ID | Description | Severity | Status | Action | Target date | Owner |
|----|-------------|----------|--------|--------|-------------|-------|
| P02-001 | Advisory `GHSA-jmr9-qjv8-65gv` em `extract-zip` (<=2.0.1), transitivo dev/CI-only via `@lhci/cli` > `lighthouse` > `puppeteer-core` > `@puppeteer/browsers`; sem release corrigido publicado no npm. Allowlisted em `pnpm-workspace.yaml` `auditConfig.ignoreGhsas`. Carregado de `P01-001`, árvore de dependências inalterada nesta fase. | Med | Aceito | Revisitar quando `extract-zip >=2.0.2` ou um `@puppeteer/browsers` corrigido publicar; ou pinar/remover o caminho transitivo. `lhci` nunca vai ao cliente e roda só em CI. | 2026-11-30 | Felipe Salles |
| P02-002 | Advisory `GHSA-7pqw-9j4j-h8q3` em `extract-zip` (<=2.0.1), mesmo caminho transitivo dev/CI-only. Allowlisted junto com P02-001. Carregado de `P01-002`, árvore de dependências inalterada nesta fase. | Med | Aceito | Igual a P02-001 — revisitar no fim do Milestone 1 ou quando um fix publicar. | 2026-11-30 | Felipe Salles |
| P02-003 | Campos do case (`problema`/`solucao`/`resultado`) são texto plano vindo de Content Collections; ao renderizar na Fase 3, precisam de HTML-escape (padrão de interpolação segura, sem `set:html`) para não abrir XSS armazenado se o conteúdo mudar no futuro. | Low | Aberto | Renderizar `problema`/`solucao`/`resultado` via interpolação de texto padrão do Astro (auto-escaping), nunca via `set:html`, na Fase 3. | 2026-09-30 | Felipe Salles |
| P02-004 | Strings de `faq` (`pergunta`/`resposta`) precisam ser JSON-encoded corretamente ao montar o script `FAQPage` (JSON-LD) na Fase 6, para não quebrar a sintaxe do `<script type="application/ld+json">` com aspas/caracteres especiais do texto. | Low | Aberto | Usar `JSON.stringify` (nunca concatenação de string) ao montar o payload `FAQPage` a partir de `getFaq()` na Fase 6. | 2026-10-31 | Felipe Salles |

Nenhuma linha está `High` **e** `Aberto`. As duas linhas `Med` são as mesmas advisories
dev/CI-only já aceitas na Fase 1 (árvore de dependências não mudou); as duas linhas `Low` são
notas de corretude de renderização para fases futuras, sem exposição nesta fase.

## Linha de fechamento — regra dura

A Fase 2 **satisfaz** a regra dura do gabarito ("Nenhuma fase fecha com achado High em aberto."):
das quatro linhas registradas, nenhuma é `High`. As verificações mecânicas 1 a 5 passam
(`5 PASS / 0 FAIL / 2 SKIP`, exit 0); as verificações 6 e 7 ficam `SKIP` porque nenhum preview de
fase 2 foi publicado — consistente com a interface documentada no plano
(`== resumo: 5 PASS / 0 FAIL / 2 SKIP ==` era o resultado esperado sem `PREVIEW_URL`). Nenhuma
dependência, asset de terceiros ou segredo novo foi introduzido; `package.json` e
`pnpm-lock.yaml` permanecem byte-idênticos ao fechamento da Fase 1.
