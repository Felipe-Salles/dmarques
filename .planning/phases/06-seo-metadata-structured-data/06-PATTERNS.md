# Phase 6: SEO / Metadata / Structured Data - Pattern Map

**Mapped:** 2026-10-17
**Files analyzed:** 17 (novos e modificados)
**Analogs found:** 16 / 17

**Regra global (D-17):** zero comentários em qualquer arquivo versionado (código, testes, scripts, YAML de workflow, JSON). Os excertos abaixo já não têm comentários; não adicionar.

## File Classification

| Arquivo novo/modificado | Role | Data Flow | Analog mais próximo | Qualidade |
|---|---|---|---|---|
| `src/lib/business.ts` (novo) | utility/config | transform | `src/lib/whatsapp.ts` | exact |
| `src/lib/json-ld.ts` (novo) | utility | transform | `src/lib/whatsapp.ts` (funções puras) | role-match |
| `src/lib/seo.test.mjs` (novo) | test | transform | `src/lib/whatsapp.test.mjs` | exact |
| `src/layouts/BaseLayout.astro` (mod.) | layout | request-response (SSG) | ele mesmo (props `title`/`description`/`noindex`) | exact |
| `src/components/SiteFooter.astro` (mod.) | component | request-response (SSG) | ele mesmo (linhas 33-34, 39) | exact |
| `src/pages/index.astro` (mod.) | page | request-response (SSG) | `src/pages/obrigado.astro` (passa props ao layout) | role-match |
| `src/pages/404.astro` (mod.) | page | request-response | ele mesmo | exact |
| `src/pages/obrigado.astro` (mod.) | page | request-response | ele mesmo | exact |
| `src/pages/erro-envio/[motivo].astro` (mod.) | page | request-response | ele mesmo | exact |
| `astro.config.mjs` (mod.) | config | batch | ele mesmo | exact |
| `package.json` (mod.) | config | - | ele mesmo (scripts `verify:*`, pins exatos) | exact |
| `public/robots.txt` (novo) | config | static | `public/` (arquivos estáticos) | sem código |
| `public/og-image.jpg` (gerado) | asset | file-I/O | `src/content/cases/dmarques-capture.webp` (gerado por script) | role-match |
| `scripts/generate-og.mjs` (novo) | utility/script | file-I/O | `scripts/capture-site.mjs` | exact |
| `scripts/verify/seo-gates.mjs` (novo) | test/gate | batch (lê dist) | `scripts/verify/aurora-gates.mjs` | exact |
| `lighthouserc.json` (mod.) + `lighthouserc.production.json` (novo) | config | - | `lighthouserc.json` | exact |
| `.github/workflows/lighthouse.yml` (mod.) | config/CI | event-driven | ele mesmo | exact |
| `.planning/security/runs/phase-06.md` (novo) | doc | - | `.planning/security/runs/phase-05.md` | exact |

## Pattern Assignments

### `src/lib/business.ts` (utility, transform)

**Analog:** `src/lib/whatsapp.ts`

**Fonte única do telefone** (`whatsapp.ts` linha 3):
```typescript
export const WHATSAPP_NUMBER = '5516996111785';
```
**Convenções:** imports relativos com extensão `.ts` (`import { stripControl } from './form-schema.ts';`), `export const` e `export function` tipadas, aspas simples, sem default export. `business.ts` deve importar só `WHATSAPP_NUMBER` de `./whatsapp.ts` (sem ciclo; `whatsapp.ts` não importa `business`). Padrão a copiar (de RESEARCH Pattern 1):
```typescript
import { WHATSAPP_NUMBER } from './whatsapp.ts';

export const BUSINESS = {
  name: 'Dmarques Desenvolvimento Web',
  shortName: 'Dmarques',
  url: 'https://agenciadmarques.com.br/',
  email: 'contato@agenciadmarques.com.br',
  locality: 'Ibitinga',
  region: 'SP',
  country: 'BR',
} as const;

export const phoneE164 = `+${WHATSAPP_NUMBER}`;

export function phoneDisplay(): string {
  const d = WHATSAPP_NUMBER.slice(2);
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
```
Acrescentar também `areaServed` (6 cidades), `hours`, `sameAs` e `founder` como constantes exportadas. Atenção: `whatsapp.test.mjs` já trava `WHATSAPP_NUMBER === '5516996111785'`; não alterar.

---

### `src/lib/json-ld.ts` (utility, transform)

**Analog:** funções puras de `src/lib/whatsapp.ts` (linhas 7-22), testáveis via `node --test` com import direto `.ts`.

Padrão: função pura `buildLocalBusinessJsonLd(...)` que devolve objeto simples (sem JSON string); o escape fica no layout. `@type: ['ProfessionalService','LocalBusiness']`, `@id: https://agenciadmarques.com.br/#organization`, sem `priceRange`, sem CNPJ, sem `streetAddress`, `founder` só com `name`. Forma completa do objeto em RESEARCH.md Pattern 2. Receber `logo`/`image` como argumentos de URL absoluta (o layout resolve `getImage` + `Astro.site`), mantendo o módulo livre de `astro:assets` para ser testável.

---

### `src/lib/seo.test.mjs` (test, transform)

**Analog:** `src/lib/whatsapp.test.mjs`

**Imports e estrutura** (linhas 1-14):
```javascript
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildWaUrl,
  WHATSAPP_NUMBER,
} from './whatsapp.ts';

test('constantes do WhatsApp', () => {
  assert.equal(WHATSAPP_NUMBER, '5516996111785');
});
```
Descrições de teste em pt-BR sem acento problemático, `assert/strict`. Casos: `phoneE164` casa `^\+[1-9]\d{10,14}$`; `phoneDisplay() === '(16) 99611-1785'`; dígitos do display com prefixo `55` iguais aos do E.164; `@type` exato; 6 `City`; `sameAs` contém Instagram; `founder.name`; ausência de `priceRange`; descrição da home entre 120 e 160 caracteres contendo Ibitinga/sites/sistemas/automações. O glob `src/**/*.test.mjs` já cobre o arquivo novo.

---

### `src/layouts/BaseLayout.astro` (layout, SSG)

**Analog:** ele mesmo. Props atuais (linhas 10-14) e head (linhas 20-30):
```astro
const {
  title = 'Dmarques — Soluções Web',
  description = 'Criamos sites, ...',
  noindex = false,
} = Astro.props;
```
```astro
<title>{title}</title>
<meta name="description" content={description} />
{noindex && <meta name="robots" content="noindex" />}
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<Font cssVariable="--font-display" preload={[{ weight: 600, style: 'normal' }]} />
```
**Mudanças:**
- Defaults de `title`/`description` passam a D-14/D-15 (a home `index.astro` não passa props e depende deles).
- Novas props: `ogImage`, `jsonLd`. Canonical: `const canonical = noindex ? undefined : new URL(Astro.url.pathname, Astro.site).href;` (usar `Astro.site`, nunca `Astro.url` para o host).
- Seguir o padrão condicional já usado em `{noindex && ...}` para canonical e JSON-LD.
- Inserir após o `<link rel="apple-touch-icon">`: `theme-color #070A14`, `og:*` (type website, locale pt_BR, site_name, title, description, url, image absoluto, width 1200, height 630, alt, type image/jpeg), `twitter:*` (summary_large_image).
- JSON-LD (só na home), `<` escapado, sem concatenação (D-19):
```astro
---
const json = jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : null;
---
{json && <script type="application/ld+json" set:html={json} />}
```
- Não usar `is:inline` no ld+json sem verificar o HTML buildado (A1); o script do tema já usa `<script is:inline>` (linha 31), mantê-lo intacto. Não adicionar JS de runtime.

---

### `src/components/SiteFooter.astro` (component, SSG)

**Analog:** ele mesmo.

**Imports atuais** (linhas 2-6): `Image` de `astro:assets`, logos de `../assets/brand/`, `import { GENERIC_WA_TEXT, buildWaUrl } from '../lib/whatsapp.ts';`

**Trechos a trocar** (linhas 33-34 e 39):
```astro
<a href={buildWaUrl(GENERIC_WA_TEXT)} target="_blank" rel="noopener noreferrer">(16) 99611-1785</a>
<a href="mailto:contato@agenciadmarques.com.br">contato@agenciadmarques.com.br</a>
...
<p class="foot-copy">© {year} Dmarques Soluções Web</p>
```
Para: `{phoneDisplay()}`, `href={`mailto:${BUSINESS.email}`}` / `{BUSINESS.email}`, `© {year} {BUSINESS.name}`, importando de `../lib/business.ts` (mesmo estilo de import com extensão `.ts`). Não adicionar horário (D-06). A linha 16 do `aria-label` já usa o nome oficial; pode passar a `${BUSINESS.name}`, opcional. O texto "Ibitinga · SP" na linha 20 permanece.

---

### `src/pages/index.astro`, `404.astro`, `obrigado.astro`, `erro-envio/[motivo].astro` (pages)

**Analog:** `src/pages/obrigado.astro` (linhas 6-10) para passar props:
```astro
<BaseLayout
  title="Pedido enviado — Dmarques"
  description="Recebemos o seu pedido de orçamento. Respondemos no mesmo dia útil."
  noindex
>
```
- `index.astro` (hoje `<BaseLayout>` sem props): passar `jsonLd={buildLocalBusinessJsonLd(...)}` e opcionalmente `title`/`description` explícitos vindos de uma constante única.
- `404.astro` linha 6: `title="Página não encontrada — Dmarques"`. Sem canonical (página 404).
- `erro-envio/[motivo].astro` linhas 38-39: `title="Não foi possível enviar — Dmarques"`; mantém `noindex`.
- Separador: D-14 trava `|` na home; RESEARCH recomenda `|` nas secundárias ("Pedido enviado | Dmarques"). Decidir um separador único e atualizar os três títulos secundários. Verificar se algum gate/teste (grep por "— Dmarques" em `scripts/verify/*`) depende do texto atual antes de mudar.

---

### `astro.config.mjs` (config)

**Analog:** ele mesmo (`site: 'https://agenciadmarques.com.br'` já definido, linha 5; `integrations` ainda não existe).
```javascript
import vercel from '@astrojs/vercel';
import { defineConfig, envField, fontProviders } from 'astro/config';
```
Adicionar `import sitemap from '@astrojs/sitemap';` na mesma ordem de imports e `integrations: [sitemap({ filter })]` junto de `adapter: vercel()`. Filtro tolerante a barra final:
```javascript
sitemap({
  filter: (page) => {
    const { pathname } = new URL(page);
    return !pathname.startsWith('/obrigado') && !pathname.startsWith('/erro-envio');
  },
}),
```
Não tocar em `security.csp` (Fase 7). Fonts API inalterada.

---

### `package.json` (config)

**Analog:** ele mesmo. Pins exatos em `dependencies` (`"astro": "7.3.8"`): adicionar `"@astrojs/sitemap": "3.7.4"` sem `^`. Scripts seguem `verify:<nome>` → `node scripts/verify/<arquivo>.mjs`; adicionar `"verify:seo": "node scripts/verify/seo-gates.mjs"` e `"og:generate": "node scripts/generate-og.mjs"`. Rodar `pnpm audit` limpo.

---

### `scripts/generate-og.mjs` (script, file-I/O)

**Analog:** `scripts/capture-site.mjs`

**Imports e constantes** (linhas 1-12):
```javascript
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import sharp from 'sharp';
import { STATIC_DIR, launchBrowser, startStaticServer } from './verify/static-server.mjs';

const OUT = join(process.cwd(), 'src', 'content', 'cases', 'dmarques-capture.webp');
const TMP = join(tmpdir(), `dmarques-capture-${process.pid}.png`);
```
**Guarda de build** (linhas 14-17):
```javascript
if (!existsSync(STATIC_DIR)) {
  console.error('build ausente: rode pnpm build antes');
  process.exit(1);
}
```
**Núcleo** (linhas 19-42): `startStaticServer()` -> `launchBrowser()` -> `browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' })` -> `page.goto` -> `await page.evaluate(() => document.fonts.ready)` -> `page.screenshot` -> `sharp(TMP)...toFile(OUT)` -> `finally { await browser.close(); close(); await rm(TMP, { force: true }); }`. Mensagens de log em pt-BR sem acento (`fonte`, `saida`).

**Adaptações:** viewport 1200x630, `deviceScaleFactor: 1`; saída `public/og-image.jpg` via `sharp(TMP).jpeg({ quality: 82, mozjpeg: true })`, reduzindo a qualidade em passos (82 -> 70) até `< 300 * 1024`, e abortando com `process.exit(1)` se as dimensões não forem 1200x630. Template HTML servido/injetado com as `@font-face` extraídas do HTML buildado (Sora 600, Inter Tight) para usar os mesmos woff2 de produção; logos como data URI de `src/assets/brand/simbolo.png` e `logotipo.png`. Aurora: copiar os três `radial-gradient` de `src/components/Aurora.astro` (linhas 17-34) sobre `#070a14`, sem o grain. Texto exato: "Software sob medida, com acabamento de produto." (acento como `Words accentFrom={4}`), conteúdo no quadrado central ~630px. Atenção: `STATIC_DIR` resolve `.vercel/output/static` e depois `dist`; confirmar onde o build (`@astrojs/vercel`) realmente escreve antes de ler `index.html`. Nunca rodar em CI nem no build.

---

### `scripts/verify/seo-gates.mjs` (gate, batch)

**Analog:** `scripts/verify/aurora-gates.mjs`

**Resolução do diretório estático e leitura** (linhas 1-25, 56-62):
```javascript
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

function resolveStaticDir() {
  if (process.env.STATIC_DIR) return resolve(process.env.STATIC_DIR);
  const primary = join(ROOT, '.vercel', 'output', 'static');
  if (existsSync(primary)) return primary;
  const fallback = join(ROOT, 'dist');
  if (existsSync(fallback)) return fallback;
  return null;
}
const STATIC_DIR = resolveStaticDir();
```
```javascript
const ROUTES = {
  '/': ['index.html'],
  '/404': ['404.html'],
  '/obrigado': ['obrigado/index.html', 'obrigado.html'],
};
function readPage(route) { ... }
function needBuild() { return STATIC_DIR ? null : ['build ausente']; }
function needPage(route) { ... }
```
**Estrutura de checks:** objeto `const checks = { nome() { ...; return fails; } }` onde cada check devolve array de falhas (vazio = ok); `needBuild()`/`needPage()` retornam o array de falha precoce. Copiar o mesmo runner (final do arquivo, lido apenas até a linha 140 aqui; ler o trecho final de `aurora-gates.mjs` ao implementar para replicar saída e `process.exit`). Helpers úteis já presentes: `read`, `rel`, `lineOf`, `visibleText`, `collapse`.

Checks sugeridos: `head-home` (title, description 120-160, canonical absoluto), `noindex-sem-canonical`, `og-twitter`, `og-image` (sharp metadata 1200x630, < 300 KB), `sitemap` (apenas `/`; sem `/obrigado`, `/erro-envio`, `/404`), `robots`, `theme-color-icones`, `json-ld` (parse + E.164), `nap` (dígitos do telefone e e-mail do footer vs JSON-LD no HTML buildado). Adicionar rotas `erro-envio/*` ao `ROUTES`. Importante: os sitemaps aparecem na raiz do `STATIC_DIR`.

---

### `lighthouserc.json` + `lighthouserc.production.json` (config)

**Analog:** `lighthouserc.json` (linhas 16-27):
```json
"assert": {
  "assertions": {
    "categories:performance": ["error", { "minScore": 0.95 }],
    "categories:seo": ["warn", { "minScore": 0.95 }],
    "categories:best-practices": ["error", { "minScore": 0.95 }],
    "categories:accessibility": ["error", { "minScore": 0.95 }],
    ...
  }
}
```
- Preview (`lighthouserc.json`): remover `categories:seo` e incluir asserts por auditoria SEO em `error` (`document-title`, `meta-description`, `http-status-code`, `link-text`, `crawlable-anchors`, `robots-txt`, `image-alt`, `canonical`, `hreflang`, `viewport`, `font-size`, `tap-targets` com `minScore: 1`) e `"is-crawlable": "off"`. O workflow injeta `extraHeaders` via `jq` sobre este arquivo, então manter a estrutura `.ci.collect.settings`.
- Produção (`lighthouserc.production.json`): cópia com `categories:seo` em `["error", { "minScore": 0.95 }]`, sem `extraHeaders`.

---

### `.github/workflows/lighthouse.yml` (CI, event-driven)

**Analog:** ele mesmo.
```yaml
on:
  deployment_status:
jobs:
  lhci:
    if: github.event.deployment_status.state == 'success' && contains(github.event.deployment_status.environment, 'Preview')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: ${{ github.event.deployment_status.target_url }}
          configPath: ${{ runner.temp }}/lighthouserc.ci.json
          uploadArtifacts: false
```
Novo job `lhci-production` com `if: ... contains(github.event.deployment_status.environment, 'Production')`, `urls: https://agenciadmarques.com.br/`, `configPath: lighthouserc.production.json`, sem passo de bypass. Reaproveitar o passo "Report failing Lighthouse audits" (`if: failure()`, loop `jq`) literalmente. Não alterar o `if` do job de preview. Sem comentários no YAML.

---

### `.planning/security/runs/phase-06.md` (doc)

**Analog:** `.planning/security/runs/phase-05.md` (mesmo diretório contém phase-01..05). Ler o phase-05 na hora de escrever e acrescentar os itens da RESEARCH (JSON-LD sem dado de request, sitemap exclui noindex, `@astrojs/sitemap` só build-time). Rodar `bash scripts/security-check.sh`.

## Shared Patterns

### Fonte única de NAP
**Fonte:** `src/lib/business.ts` (novo), derivada de `WHATSAPP_NUMBER` (`src/lib/whatsapp.ts:3`).
**Aplicar a:** `SiteFooter.astro`, `json-ld.ts`, `BaseLayout.astro` (`og:site_name`), títulos de páginas.
Nenhum literal de telefone, e-mail ou nome fora de `business.ts` (SEO-08). O gate de dist compara o HTML buildado.

### Props do layout como fonte única de título/descrição
**Fonte:** `BaseLayout.astro` linhas 10-14. `og:title`, `og:description` e `twitter:*` reutilizam as mesmas variáveis `title`/`description` (D-16). Páginas `noindex` passam `noindex` e não recebem canonical.

### Emissão de dados em HTML sem concatenação
**Aplicar a:** JSON-LD. `JSON.stringify` + `.replace(/</g, '\\u003c')` + `set:html`; nunca montar a string à mão (D-19, P02-004).

### Scripts de Node
**Fonte:** `scripts/capture-site.mjs` e `scripts/verify/*.mjs`: ESM, `import process from 'node:process'`, helpers de `./verify/static-server.mjs`, falha com `console.error(...)` + `process.exit(1)`, mensagens em pt-BR.

### Convenções de repositório
Pins exatos de dependências; `pnpm audit` limpo; aspas simples; sem comentários; respostas ao usuário em pt-BR; nada de CSP nesta fase (Fase 7); sem `<meta name="keywords">`; sem `Disallow` para páginas noindex em `robots.txt`.

## No Analog Found

| Arquivo | Role | Data Flow | Motivo |
|---|---|---|---|
| `public/robots.txt` | config estática | static | Conteúdo literal; usar o texto da RESEARCH Pattern 4 (Allow all + `Sitemap: https://agenciadmarques.com.br/sitemap-index.xml`) |

Também sem analog de integração: nenhuma integração Astro existe hoje em `astro.config.mjs`; seguir a doc do `@astrojs/sitemap` (RESEARCH Pattern 4). Para `public/og-image.jpg` o analog é apenas de processo (artefato versionado gerado por script, como `dmarques-capture.webp`).

## Metadata

**Escopo de busca de analogs:** `src/lib`, `src/layouts`, `src/components`, `src/pages`, `scripts`, `scripts/verify`, `public`, `.github/workflows`, `lighthouserc.json`, `astro.config.mjs`, `package.json`
**Arquivos lidos:** 14
**Pendência para o planner:** conferir o diretório real de saída do build (`dist/client` segundo a RESEARCH vs. `dist` / `.vercel/output/static` segundo `static-server.mjs`) antes de fixar caminhos em `seo-gates.mjs` e `generate-og.mjs`; ler o trecho final de `aurora-gates.mjs` (após a linha 140) para copiar o runner.
**Data da extração:** 2026-10-17
