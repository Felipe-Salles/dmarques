# Phase 5: Form Backend + Enhancement + LGPD - Pattern Map

**Mapped:** 2026-10-15
**Files analyzed:** 31 (novos e modificados)
**Analogs found:** 21 / 31 (10 sem analog no repo; usar trechos do 05-RESEARCH.md)

Regra transversal: nenhum comentario em nenhum arquivo versionado (D-23). Todos os trechos abaixo ja estao sem comentarios. Imports de `.ts` locais usam extensao `.ts` (padrao de `src/scripts/effects.ts`).

## File Classification

| Arquivo novo/modificado | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/pages/api/orcamento.ts` | route (API) | request-response | nenhum no repo (RESEARCH Pattern 1) | no-analog |
| `src/lib/submit.ts` | service | request-response | `src/scripts/steps.pure.ts` (modulo puro testavel) | partial |
| `src/lib/request-guards.ts` | utility | request-response | `src/scripts/steps.pure.ts` | partial |
| `src/lib/form-schema.ts` (puro, sem Zod) | utility | transform | `src/scripts/steps.pure.ts` | role-match |
| `src/lib/form-schema.server.ts` (Zod) | model | transform | `src/content/project-types.ts` + `src/content.config.ts` | partial |
| `src/lib/rate-limit.ts` | service | request-response (Redis) | nenhum | no-analog |
| `src/lib/deps.ts` | config/provider | request-response | nenhum (toca `astro:env/server`) | no-analog |
| `src/lib/mail.ts` | utility | transform | `src/scripts/steps.pure.ts` | partial |
| `src/lib/escape-html.ts` | utility | transform | `src/scripts/steps.pure.ts` | partial |
| `src/lib/whatsapp.ts` | utility | transform | `src/scripts/steps.pure.ts` | partial |
| `src/lib/*.test.mjs` (5 arquivos) | test | unit | `src/scripts/steps.pure.test.mjs` | exact |
| `src/scripts/form.ts` (reescrita) | component (enhancer) | event-driven | `src/scripts/form.ts` atual + `src/scripts/effects.ts` | exact |
| `src/components/ContactSection.astro` (mod) | component | request-response | si mesmo | exact |
| `src/components/ServicesSection.astro` (mod, `.svc-wa`) | component | transform | si mesmo + `.channel` em ContactSection | exact |
| `src/components/SiteFooter.astro` (mod, `?text=`) | component | transform | si mesmo | exact |
| `src/components/HeroBleed.astro` | component | - | sem link WhatsApp (Open Question 3: nao inventar) | n/a |
| `src/pages/obrigado.astro` (mod) | page | static | si mesmo | exact |
| `src/pages/erro-envio/[motivo].astro` | page | static (getStaticPaths) | `src/pages/obrigado.astro` | role-match |
| `src/pages/politica-de-privacidade.astro` (reescrita) | page | static | si mesmo (shell) | exact |
| `src/styles/tokens.css` (mod, `--color-danger-text`) | config | - | linha `--color-danger` | exact |
| `astro.config.mjs` (mod, env schema) | config | - | bloco `env.schema` atual | exact |
| `package.json` (mod: deps, glob do `test`) | config | - | si mesmo | exact |
| `scripts/security-check.sh` (mod) | script | batch | si mesmo | exact |
| `scripts/verify/form-gates.mjs` | test (e2e) | request-response | `scripts/verify/browser-gates.mjs` + `static-server.mjs` | exact |
| `scripts/mail-tester.mjs` | script | request-response | nenhum | no-analog |
| `docs/waf-rate-limit.md` | docs | - | nenhum | no-analog |
| `.planning/PROJECT.md` (Key Decision 6 meses) | docs | - | tabela Key Decisions existente | n/a |
| `vercel.json` | config | - | `{}` hoje; fase 5 nao altera (headers sao Fase 7) | n/a |

## Pattern Assignments

### `src/lib/form-schema.ts`, `request-guards.ts`, `mail.ts`, `escape-html.ts`, `whatsapp.ts` (utility, transform)

**Analog:** `src/scripts/steps.pure.ts` (arquivo todo, 11 linhas). Funcoes puras exportadas, tipagem em linha, sem imports de Astro, executavel por `node --test` via type-stripping.

```typescript
export function stepProgress(rectTop: number, vh: number): number {
  if (vh <= 0) return 1;
  const p = (vh * 0.85 - rectTop) / (vh * 0.55);
  return Math.min(1, Math.max(0, p));
}
```

Restricoes herdadas (RESEARCH Pattern 2): sem `enum`, sem parameter properties, imports com extensao `.ts`, nunca importar `astro:env/server` dentro de `src/lib/*` (so `pages/api/orcamento.ts` e `deps.ts`).

Constante compartilhada para o select/enum (D-25), de `src/content/project-types.ts` linhas 1-17:

```typescript
export const PROJECT_TYPE_VALUES = [
  'site-institucional',
  'sistema-sob-medida',
  'ecommerce-plataforma',
  'automacao',
  'nao-sei',
] as const;
export type ProjectType = (typeof PROJECT_TYPE_VALUES)[number];
export const PROJECT_TYPES = [
  { value: 'site-institucional', label: 'Site institucional' },
  ...
] as const satisfies ReadonlyArray<{ value: ProjectType; label: string }>;
```

`mail.ts` busca o rotulo do assunto em `PROJECT_TYPES.find(t => t.value === ...)`, nunca da entrada crua (D-06). Corpo de `form-schema.ts`, `submit.ts`, `mail.ts`, `escape-html.ts` e `rate-limit.ts`: copiar dos blocos Pattern 2, 3, 5 e "Ordem do handler" do `05-RESEARCH.md`.

---

### `src/lib/form-schema.server.ts` (model, transform)

**Analog parcial:** `src/content/project-types.ts` (allow-list) e `src/content.config.ts` (uso de Zod no repo). Importar `PROJECT_TYPE_VALUES` com caminho relativo, como em `ProjectTypeChips.astro` linha 2 (`'../content/project-types'`); em `src/lib/` usar `'../content/project-types.ts'` (extensao, porque e testado em Node). Corpo: RESEARCH Pattern 2.

---

### `src/lib/*.test.mjs` (test, unit)

**Analog:** `src/scripts/steps.pure.test.mjs` (linhas 1-8)

```javascript
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { litSteps, stepProgress } from './steps.pure.ts';

test('stepProgress inicio: 850/1000 e 0', () => {
  assert.equal(stepProgress(850, 1000), 0);
});
```

Convencoes: `node:assert/strict`, `test` de `node:test`, import direto do `.ts`, nomes de teste em pt-BR sem acentos de codigo. Ajustar `package.json` script `test` de `"src/scripts/*.test.mjs"` para `"src/**/*.test.mjs"` (linha 15). Lembrar de sintaxe de teste do RESEARCH ("Teste Node sem Astro") com `deps` injetadas.

---

### `src/pages/api/orcamento.ts` (route, request-response)

**Sem analog no repo** (nao existe nenhuma rota em `src/pages/api`). Usar RESEARCH Pattern 1. Unica rota com `export const prerender = false` (CLAUDE.md). Apenas wiring: `getSecret` de `astro:env/server`, chamar `handleSubmission(request, createDeps(...))`. `ALL` devolve 405 com `Allow: POST`.

---

### `astro.config.mjs` (config)

**Analog:** o proprio arquivo, linhas 11-15

```javascript
env: {
  schema: {
    RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
  },
},
```

Adicionar, no mesmo formato, `RATE_LIMIT_SALT` (secret) e os dois pares Upstash (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) com `optional: true`, e `CONTACT_EMAIL` se for env. Manter `output: 'static'` e `adapter: vercel()`. Nao tocar em `fonts`.

---

### `src/scripts/form.ts` (enhancer, event-driven)

**Analog:** `src/scripts/form.ts` atual (padrao de modulo) e `src/scripts/effects.ts` (ponto de entrada unico, linhas 1-13).

Estrutura a manter:

```typescript
export function initForm(): void {
  const form = document.querySelector<HTMLFormElement>('#form-orcamento');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('#form-status');
  ...
}
```

Entrada: `effects.ts` ja chama `initForm()` na linha 9; nao criar novo `<script>`, manter o bundle unico (D-24, orcamento 20480 B de `scripts/js-weight-check.sh` linha 4). Remover `pending`, `event.preventDefault()` incondicional e o texto provisorio (linhas 4-14).

Padrao de live region a copiar (limpar antes de definir):

```typescript
status.textContent = '';
status.textContent = 'texto';
```

Regras do UI-SPEC/RESEARCH Pattern 4: `form.noValidate = true` no init, corpo `URLSearchParams`, `Accept: application/json`, `AbortController` 15 s, `rendered-at` com `Date.now()`, `textContent` e `setAttribute('href', ...)` apenas, zero `style`/`innerHTML`. Importa so `form-schema.ts` e `whatsapp.ts`. Classes de estado: `.sending`, `.done`, `.failed`, `.limited`, `.err-contato` e `.field.err`.

---

### `src/components/ContactSection.astro` (modificacao)

**Analog:** si mesmo. Pontos exatos:

- Form ja tem `method="post" action="/api/orcamento"` (linhas 110-117), nao reinserir.
- Remover `<p class="pending" id="form-pendente" hidden>` (linhas 178-186) e o CSS `.pending` (476-491).
- Adicionar honeypot `<div class="hp" aria-hidden="true">` com `input name="empresa-site" tabindex="-1" autocomplete="off"` e `input type="hidden" name="rendered-at"` (valor vazio) dentro de `.form-body`; CSS `.hp` por classe (RESEARCH/UI-SPEC), nunca `style=""`.
- Aviso LGPD (linhas 187-190): trocar copy para "Usamos seus dados só para responder a este pedido. Veja a Política de Privacidade." (D-22); a regra `.legal a` (500-508) ja existe.
- Painel de sucesso (192-208): titulo "Pedido enviado.", remover o botao "Enviar outro pedido", adicionar `.btn.btn-ghost` WhatsApp.
- Adicionar `<div class="alert" id="form-erro" role="group" aria-labelledby="form-erro-t" hidden>` e `id="form-limite"` (CSS reaproveita a caixa de `.pending`, linhas 476-485, com padding `12px 16px`).
- `.msg` color literal `#ff8f9a` (linha 441) vira `var(--color-danger-text)`.
- `.form-body` gap 18px -> 16px (linha 356); `.success` gap 14px -> 16px (linha 514).
- Link WhatsApp do canal (linhas 24-29): `href` com `?text=` via helper (ou literal URL-encoded) mantendo `target="_blank" rel="noopener noreferrer"`.
- Estados `err`, `sending`, `done` e `.msg` ja existem em CSS (430-474, 537-547); so ligar por JS.

Markup de erro de campo existente a respeitar para `aria-describedby` (linhas 135-148): `<span class="msg" id="erro-whatsapp">` e inputs com `aria-describedby="contato-nota-obrigatorio"`.

---

### `src/components/ServicesSection.astro` (modificacao, FORM-13 / D-21)

**Analog:** o item de lista (linhas 53-83) e o estilo de link de `.channel` em ContactSection. Dentro de `<li class=\`svc i${i}\`>` apos `<p>{item.data.descricao}</p>` (linha 81) adicionar:

```astro
<a class="svc-wa" href={buildWaUrl(`Olá! Vim pelo site e quero falar sobre ${item.data.titulo}.`)} target="_blank" rel="noopener noreferrer" aria-label={`Falar sobre ${item.data.titulo} no WhatsApp`}>Falar sobre isso no WhatsApp</a>
```

Atencao ao grid: `.svc` e `grid-template-columns: 44px 1fr` com `svg` em `grid-row: 1 / span 2` (linhas 141-153); o link precisa ir para a coluna 2 (`grid-column: 2`). Estilo: `--text-sm`, peso 400, `min-height: 44px`, hover e `:focus-visible` pareados. A transicao do `.svc` (linhas 173-186, translateX nos filhos `h3`, `p`, `svg`) nao inclui `a`; o link nao deve ganhar `transform` proprio fora do permitido. Importar o helper: `import { buildWaUrl } from '../lib/whatsapp.ts';` (o frontmatter atual usa `'../content'`, sem extensao, ambos funcionam em Astro).

---

### `src/components/SiteFooter.astro` (modificacao)

**Analog:** si mesmo. Dois links `wa.me` sem `?text=`: linha 31 (`https://wa.me/5516996111785`) e linha 51 (botao flutuante). Trocar por `buildWaUrl(textoGenerico)` mantendo `target`/`rel`. `hotmail` ja nao existe em `src/` (grep retornou zero; D-09 ja cumprido), so confirmar.

---

### `src/pages/obrigado.astro` e `src/pages/erro-envio/[motivo].astro` (page, static)

**Analog:** `src/pages/obrigado.astro` (arquivo todo, 50 linhas)

```astro
---
import Aurora from '../components/Aurora.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Pedido enviado — Dmarques" description="...">
  <main id="conteudo">
    <section class="intro">
      <Aurora variant="small" />
      <div class="wrap content-block">
        <h1 class="h2">...</h1>
        <p class="lead">...</p>
        <div class="actions">
          <a href="/" class="btn btn-ghost">Voltar ao início</a>
        </div>
      </div>
    </section>
  </main>
</BaseLayout>
```

CSS escopado (`.intro`, `.content-block`, `.actions`, linhas 23-50) e copiado integralmente para `erro-envio/[motivo].astro`. Em `erro-envio/`, os imports sobem um nivel: `'../../components/Aurora.astro'`, `'../../layouts/BaseLayout.astro'`. Adicionar `getStaticPaths` retornando `limite|invalido|falha` (RESEARCH Pattern 6) e `<meta name="robots" content="noindex">` (verificar como `BaseLayout.astro` aceita `head`/slot antes de planejar). Desvio consciente do UI-SPEC (`?motivo=`): rota por segmento, porque a pagina e estatica.

Copy: `/obrigado` conforme UI-SPEC (H1 "Pedido enviado.", acoes "Falar agora no WhatsApp" primaria + "Voltar ao início" ghost).

---

### `src/pages/politica-de-privacidade.astro` (reescrita)

**Analog:** o shell atual. Manter frontmatter e `BaseLayout` (linhas 1-7), `Aurora variant="small"`, e a regra de links (linhas 42-47):

```css
.content-block :global(a:not(.btn)) {
  color: var(--color-text);
  text-decoration: underline;
  text-decoration-color: var(--aurora-cyan);
  text-underline-offset: 4px;
}
```

Mudancas: `.content-block` ja usa `max-width: 70ch` (linha 30); cabecalho centrado, corpo alinhado a esquerda (`text-align: left` nas secoes); 10 `<section id aria-labelledby>` com H2 (UI-SPEC), `<nav aria-label="Nesta página">` com `<ol>`, tabela de operadores com `<caption class="sr-only">` em `div role="region" tabindex="0"`. Data "Última atualizacao" como constante no frontmatter. `.sr-only` ja existe (usada em `#form-status`); confirmar em `src/styles/base.css`. Politica direto em `.astro`, sem collection.

---

### `src/styles/tokens.css` (mod)

Adicionar ao lado de `--color-danger: #ff5d6c;` (linha 22) a linha `--color-danger-text: #ff8f9a;`. Substituir o literal em `ContactSection.astro` linha 441.

---

### `scripts/verify/form-gates.mjs` (test e2e)

**Analog:** `scripts/verify/browser-gates.mjs` + `static-server.mjs`.

Imports e bootstrap (browser-gates linhas 1-3, 62-70):

```javascript
import { existsSync } from 'node:fs';
import process from 'node:process';
import { STATIC_DIR, launchBrowser, startStaticServer } from './static-server.mjs';

async function withPage(ctx, base, route, fn) {
  const page = await ctx.newPage();
  try {
    await page.goto(base + route, { waitUntil: 'load' });
    return await fn(page);
  } finally {
    await page.close();
  }
}
```

Estrutura de `const checks = { async nome({ browser, base }) { ...; return fails; } }` (linha 72 em diante): cada check devolve array de falhas. O servidor estatico nao serve `/api/orcamento`: mockar com `page.route('**/api/orcamento', ...)`. `static-server.mjs` ja resolve `erro-envio/falha` via `${target}.html` / `index.html` (linhas 33-42). Adicionar `/erro-envio/limite|invalido|falha` em `ROUTES` de `browser-gates.mjs` (linha 15). Para LGPD-06 usar o snippet de cookies zero do RESEARCH contra `PREVIEW_URL`.

---

### `scripts/security-check.sh` (mod)

**Analog:** si mesmo. Padrao de checagem `pass`/`fail`/`skip` (linhas 19-21) e verificacao 5 (linhas 93-98):

```bash
func_count=$(find .vercel/output/functions -maxdepth 1 -name '*.func' 2>/dev/null | wc -l | tr -d ' ')
if [ "$func_count" -gt 1 ]; then
  fail "verificacao 5 - contagem de Functions = $func_count (esperado no maximo 1)"
```

Trocar para `-ne 1` (exatamente 1). Novas verificacoes no mesmo formato: grep de `console\.` em `src/pages/api` e `src/lib`; varredura de `UPSTASH|KV_REST|RATE_LIMIT_SALT` em `STATIC_DIR` (estender a regex da verificacao 4, linha 85: `re_[A-Za-z0-9_-]{20,}|RESEND_API_KEY`). A verificacao 2 (linha 39) ja proibe `style=` em `src/` com `.ts`: vale para `form.ts`.

---

### `package.json` (mod)

Dependencias exatas, sem `^` (padrao da linhas 21-25): `resend@6.33.0`, `zod@4.6.7`, `@upstash/ratelimit@2.2.0`, `@upstash/redis@1.39.0`. `scripts/js-weight-check.sh` (linha 79) ja barra frameworks de UI; nenhuma das quatro cai na regex. Script `verify:forms` seguindo `verify:gates`/`verify:browser` (linhas 18-19).

## Shared Patterns

### Zero comentarios e zero `style=`
**Fonte:** memoria do usuario; `scripts/security-check.sh` verificacao 2 (linha 39).
**Aplicar a:** todos os arquivos novos. Documentacao do WAF e do expurgo vai em `docs/*.md`.

### Classes e `hidden` em vez de estilo inline
**Fonte:** `src/components/ContactSection.astro` linhas 430-447, 537-547 (`.form.done`, `.form.sending`, `.form.err-contato`).
**Aplicar a:** `form.ts` e qualquer novo estado de UI.

### Tokens e hover/focus pareados
**Fonte:** `ContactSection.astro` linhas 284-288 (`.channel:hover, .channel:focus-visible`).
**Aplicar a:** `.svc-wa`, `.alert`, links da politica.

### Cabecalho de pagina secundaria (Aurora small + `.intro` + `.content-block` + `.actions`)
**Fonte:** `src/pages/obrigado.astro`.
**Aplicar a:** `erro-envio/[motivo].astro`, politica.

### Importacao de `.ts` com extensao, modulos puros testaveis
**Fonte:** `src/scripts/effects.ts` linhas 1-5; `steps.pure.test.mjs` linha 3.
**Aplicar a:** todos os `src/lib/*.ts`.

### Allow-list unica de tipo de projeto
**Fonte:** `src/content/project-types.ts` (D-25).
**Aplicar a:** `form-schema.server.ts`, `mail.ts`, `form.ts` (rotulo no link de fallback).

### Orcamento de JS
**Fonte:** `scripts/js-weight-check.sh` (20480 B gzip, soma do script externo + modulepreloads + inline em `index.html`).
**Aplicar a:** `form.ts`: nao importar Zod nem `resend`; so `form-schema.ts` e `whatsapp.ts`.

### WhatsApp
**Fonte:** numero `5516996111785` em `ContactSection.astro` linha 26 e `SiteFooter.astro` linhas 31, 51.
**Aplicar a:** `src/lib/whatsapp.ts` exporta `WHATSAPP_NUMBER` e `buildWaUrl(text)` com `encodeURIComponent`; todos os componentes consomem o helper.

## No Analog Found

| Arquivo | Role | Data Flow | Motivo |
|---|---|---|---|
| `src/pages/api/orcamento.ts` | route | request-response | nenhuma rota on-demand existe; usar RESEARCH Pattern 1 |
| `src/lib/rate-limit.ts` | service | Redis REST | sem cliente externo no repo; RESEARCH Pattern 3 |
| `src/lib/deps.ts` | provider | injecao | sem uso de `astro:env/server` ainda; so aqui e na rota |
| `src/lib/submit.ts` | service | request-response | handler novo; RESEARCH "Ordem do handler" |
| `src/lib/mail.ts` / `escape-html.ts` | utility | transform | RESEARCH Pattern 5 |
| `scripts/mail-tester.mjs` | script | request-response | RESEARCH Environment Availability |
| `docs/waf-rate-limit.md` | docs | - | diretorio `docs/` nao existe |

## Observacoes para o planner (divergencias entre specs e repo)

- D-09: `hotmail` ja nao aparece em `src/`; a tarefa e verificar com grep e remover `#form-pendente`.
- `HeroBleed.astro` nao tem link WhatsApp e `CtaFinal.astro` nao existe: nao inventar (Open Question 3). Links reais: `ContactSection.astro` linha 26, `SiteFooter.astro` linhas 31 e 51.
- `ContactSection.astro` ja tem `action="/api/orcamento"` e `method="post"`; falta honeypot, `rendered-at`, alertas e copy.
- Aviso do UI-SPEC sobre `?motivo=` esta superado pelo RESEARCH Pattern 6 (rota por segmento estatico).
- `package.json` script `test` so cobre `src/scripts/`; precisa de glob recursivo para os testes de `src/lib/`.

## Metadata

**Analog search scope:** `src/` (components, pages, scripts, content, styles), `scripts/`, config na raiz
**Files scanned:** 16 lidos integral ou parcialmente + `git ls-files` (≈90 arquivos listados)
**Pattern extraction date:** 2026-10-15
