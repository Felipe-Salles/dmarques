# Fase 3: Static Zero-JS Sections + CSP-safe Refactor + A11y - Mapa de Padrões

**Mapeado em:** 2026-09-16
**Arquivos analisados:** 17 (10 componentes novos, 4 páginas, 2 arquivos de config/estilo editados, 1 dependência de build)
**Analogs encontrados:** 4 / 17 (com correspondência direta no repositório) — os demais reutilizam o único padrão de página existente (`index.astro` + `BaseLayout.astro`) ou não têm analog no código e devem seguir os Code Examples já validados em `03-RESEARCH.md`/`03-UI-SPEC.md`.

**Nota de contexto do projeto:** este é um repositório em estágio inicial (Fases 1-2 só produziram `index.astro` placeholder, `BaseLayout.astro`, tokens/base CSS e as content collections). Não existe `src/components/` ainda. Por isso a maioria dos arquivos desta fase é "greenfield" — o "analog" mais próximo é o único padrão de página `.astro` já existente no repo, complementado pelos Code Examples verificados empiricamente em `03-RESEARCH.md` (que já rodaram contra este `astro@7.3.1` real). Nenhum comentário deve ser adicionado a nenhum arquivo versionado (regra de projeto, D-04 da Fase 1, ainda vigente).

---

## File Classification

| Arquivo novo/editado | Role | Data Flow | Analog mais próximo | Qualidade do match |
|---|---|---|---|---|
| `src/components/SiteHeader.astro` | component | static markup + native disclosure (event-driven via `<details>`, zero JS) | `src/pages/index.astro` (estrutura de frontmatter + `<style>` escopado) | role-parcial (único `.astro` existente) |
| `src/components/HeroBleed.astro` | component | static markup + file-I/O (imagem via `astro:assets`) | `src/pages/index.astro` + `src/content/cases/dmarques.md` (uso de `image()`/cover no schema) | role-parcial |
| `src/components/ServicesSection.astro` | component | CRUD-read (`getCollection` → transform → render) | `src/content/index.ts` (`getServices`) + `src/content.config.ts` (schema `services`) | exact (fonte de dados) / role-parcial (markup) |
| `src/components/ProcessSection.astro` | component | CRUD-read | `src/content/index.ts` (`getProcess`) + `src/content.config.ts` (schema `process`, campo `numero`) | exact (fonte de dados) |
| `src/components/DifferentiatorsSection.astro` | component | CRUD-read + transform (derivar `01`-`04` de `order`) | `src/content/index.ts` (`getDifferentiators`) + `src/content.config.ts` (schema `differentiators`, sem `numero`) | exact (fonte de dados) |
| `src/components/AboutSection.astro` | component | static markup + file-I/O (imagem) | `src/content/cases/dmarques.md` (padrão de imagem+alt em frontmatter) | role-parcial |
| `src/components/ContactSection.astro` | component | static form markup (request-response, sem `action`/`method`) | `src/content/project-types.ts` (fonte do `<select>`) | exact (fonte de dados) / sem analog de form no código |
| `src/components/FaqSection.astro` | component | CRUD-read | `src/content/index.ts` (`getFaq`) + `src/content.config.ts` (schema `faq`) | exact (fonte de dados) |
| `src/components/CtaFinal.astro` | component | static markup | `src/pages/index.astro` | role-parcial |
| `src/components/SiteFooter.astro` | component | static markup | `src/pages/index.astro` | role-parcial |
| `src/pages/index.astro` (editado) | route/page | composição (transform — monta os 9 componentes em ordem) | ele mesmo (estado atual é o "antes" do refactor) | exact |
| `src/pages/obrigado.astro` | route/page | static request-response | `src/pages/index.astro` + `src/layouts/BaseLayout.astro` | exact |
| `src/pages/politica-de-privacidade.astro` | route/page | static request-response (shell) | `src/pages/index.astro` + `src/layouts/BaseLayout.astro` | exact |
| `src/pages/404.astro` | route/page | static request-response (rota especial do Astro) | `src/pages/index.astro` + `src/layouts/BaseLayout.astro` | exact |
| `src/styles/tokens.css` (editado) | config (design tokens) | build-time CSS resolution | ele mesmo (edição in-place) | exact |
| `src/assets/hero-render-placeholder.webp` / `founder-portrait-placeholder.webp` | asset (file-I/O) | build-time (Sharp) | `src/content/cases/dmarques-cover.webp` (precedente de placeholder vetorial Fase 2) | role-match (mesmo padrão, diretório diferente) |
| `package.json` (editado — `sharp@0.35.4` devDependency) | config | n/a | ele mesmo (edição in-place) | exact |

---

## Pattern Assignments

### Padrão compartilhado: estrutura base de arquivo `.astro` (aplica-se a TODOS os componentes e páginas novos)

**Analog:** `src/pages/index.astro` (único arquivo `.astro` de página/seção existente hoje no repo)

**Estrutura completa (arquivo tem 53 linhas, lido integralmente):**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout>
  <main id="conteudo">
    <div class="stack">
      <h1>Dmarques — Soluções Web</h1>
      <p>...</p>
    </div>
  </main>
</BaseLayout>

<style>
  main {
    min-height: 100svh;
    display: grid;
    place-items: center;
    padding: var(--space-16) var(--space-gutter);
    text-align: center;
  }

  h1 {
    font-family: var(--font-heading);
    font-weight: var(--font-weight-bold);
    font-size: clamp(2rem, 1.4rem + 3vw, 3rem);
    line-height: var(--leading-tight);
    letter-spacing: var(--tracking-tight);
    color: var(--color-text-strong);
    text-wrap: balance;
  }
</style>
```

**O que copiar deste padrão para cada novo arquivo:**
- Frontmatter (`---`) só com imports — zero lógica de negócio nesta fase (dados vêm de `getCollection` já pronto na Fase 2).
- `<main id="conteudo">` é o id fixo reaproveitado pelo skip-link (A11Y-01) — não recriar com outro id em nenhuma página nova.
- `<style>` escopado por arquivo, 100% `var(--token)` — nunca hex literal, nunca `style=""` (grava o gate SITE-04/`security-check.sh` verificação 2).
- `text-wrap: balance`/`pretty` já é o padrão do projeto para títulos/parágrafos longos — reaproveitar nos H1/H2 de cada seção.
- **Zero comentários** em qualquer bloco (`---`, HTML, `<style>`) — regra de projeto vigente desde a Fase 1.

**Confirmado empiricamente (03-RESEARCH.md):** com `build.inlineStylesheets: 'never'`, não importa quantos componentes `.astro` novos existirem — todos os `<style>` escopados são concatenados em **um único CSS externo por página** no build (`/_astro/index.[hash].css`). Não há necessidade de se preocupar com "muitos arquivos pequenos" gerando CSS inline.

---

### `src/layouts/BaseLayout.astro` — reutilizado sem alteração estrutural

**Arquivo completo (24 linhas, já lido integralmente):**
```astro
---
import { Font } from 'astro:assets';
import Analytics from '@vercel/analytics/astro';
import '../styles/tokens.css';
import '../styles/base.css';

const { title = 'Dmarques — Soluções Web' } = Astro.props;
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <Font cssVariable="--font-display" preload={[{ weight: 700, style: 'normal' }]} />
    <Font cssVariable="--font-body" preload={[{ weight: 400, style: 'normal' }]} />
  </head>
  <body>
    <slot />
    <Analytics />
  </body>
</html>
```
`<html lang="pt-BR">` já satisfaz SEO-02 — nenhuma mudança necessária aqui. Toda página nova (`obrigado.astro`, `politica-de-privacidade.astro`, `404.astro`) passa `title` via prop, igual ao padrão já existente. O skip-link (A11Y-01) e o `<header>`/`<footer>` globais entram dentro do `<slot />` de `index.astro` (não em `BaseLayout.astro`), pois só `index.astro` compõe o header/nav completo — as páginas utilitárias (`obrigado`, `política`, `404`) usam apenas `<main id="conteudo">` sem header/footer completo, conforme os Code Examples de `03-RESEARCH.md`.

---

### `src/pages/obrigado.astro`, `src/pages/politica-de-privacidade.astro`, `src/pages/404.astro`

**Analog:** `src/pages/index.astro` + `src/layouts/BaseLayout.astro` (mesmo role exato: página estática, request-response, sem prerender especial)

**Padrão a copiar (extraído de `03-RESEARCH.md` § Code Examples, já verificado contra este `astro@7.3.1`):**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Pedido enviado — Dmarques">
  <main id="conteudo">
    <h1>Recebemos seu pedido</h1>
    <p>Respondemos no mesmo dia útil. Enquanto isso, fale com a gente no WhatsApp se preferir.</p>
    <a href="/">Voltar para a home</a>
  </main>
</BaseLayout>
```
Nenhum `export const prerender` é necessário — `output: 'static'` já prerenderiza tudo por padrão (só o futuro `/api/orcamento` da Fase 5 precisará de `prerender = false`).

**Copy exato de cada rota (Copywriting Contract, `03-UI-SPEC.md`):**
- `/obrigado`: H1 "Recebemos seu pedido" · corpo "Respondemos no mesmo dia útil. Enquanto isso, fale com a gente no WhatsApp se preferir." · link "Voltar para a home"
- `/politica-de-privacidade`: H1 "Política de Privacidade" · corpo "Esta página será publicada com o conteúdo completo no lançamento do formulário." (shell apenas — D-12)
- `/404`: H1 "Página não encontrada" · corpo "O endereço que você tentou acessar não existe." · link "Voltar para a home"

**Erro/edge case a evitar:** `/404.astro` builda corretamente para `dist/404.html`, mas há histórico (não confirmado para esta versão do adapter) de o Vercel servir seu 404 genérico em vez do customizado — a verificação mecânica (`pnpm build`) não é suficiente; é necessário `curl -I` contra o preview real após o deploy (Pitfall 6 do `03-RESEARCH.md`).

---

### `src/components/ServicesSection.astro`, `ProcessSection.astro`, `DifferentiatorsSection.astro`, `FaqSection.astro` (padrão CRUD-read / content-collection)

**Analog:** `src/content/index.ts` (getters já implementados) + `src/content.config.ts` (schemas Zod)

**Imports pattern (`src/content/index.ts`, arquivo completo, 11 linhas):**
```typescript
import { getCollection } from 'astro:content';

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) =>
  a.data.order - b.data.order;

export const getServices = async () => (await getCollection('services')).sort(byOrder);
export const getProcess = async () => (await getCollection('process')).sort(byOrder);
export const getDifferentiators = async () =>
  (await getCollection('differentiators')).sort(byOrder);
export const getFaq = async () => (await getCollection('faq')).sort(byOrder);
export const getCases = async () => getCollection('cases');
```

**Como cada seção deve consumir isso no frontmatter (exemplo `ServicesSection.astro`):**
```astro
---
import { getServices } from '../content';
const services = await getServices();
---
<section id="servicos">
  <h2>Tecnologia sob medida...</h2>
  {services.map((item) => (
    <article data-reveal="1">
      <h3>{item.data.titulo}</h3>
      <p>{item.data.descricao}</p>
    </article>
  ))}
</section>
```

**Schema de referência por coleção (`src/content.config.ts`, campos exatos disponíveis):**
- `services`: `order`, `titulo`, `descricao`, `icon` (enum `sites`/`sistemas`/`solucoes-web`/`automacoes` — mapear para SVG inline por ícone, nunca pacote npm de ícones per UI-SPEC)
- `process`: `order`, `numero` (string `"01"`-regex), `titulo`, `descricao`
- `differentiators`: `order`, `titulo`, `descricao` — **sem campo `numero`** (Pitfall 8 do RESEARCH): derivar com `String(item.data.order).padStart(2, '0')`, nunca hardcode
- `faq`: `order`, `pergunta`, `resposta` (texto plano, sem Markdown — feed direto do JSON-LD da Fase 6)

**Exemplo de arquivo YAML de conteúdo (`src/content/differentiators/atendimento-direto.yaml`, arquivo completo):**
```yaml
order: 1
titulo: Atendimento direto, sem intermediários
descricao: Você fala com quem desenvolve, do orçamento ao suporte.
```

**Erro a evitar:** nenhuma seção deve hand-authorar cópia repetida (título/descrição de cards) — todo texto repetido já existe nas collections da Fase 2; a Fase 3 só consome via `getCollection()`, nunca duplica string literal.

---

### `src/components/ContactSection.astro` (form markup, D-07..D-11)

**Analog de dados:** `src/content/project-types.ts` (fonte das opções do `<select>`, arquivo completo, 17 linhas):
```typescript
export const PROJECT_TYPE_VALUES = [
  'site-institucional',
  'sistema-sob-medida',
  'ecommerce-plataforma',
  'automacao',
  'nao-sei',
] as const;

export const PROJECT_TYPES = [
  { value: 'site-institucional', label: 'Site institucional' },
  { value: 'sistema-sob-medida', label: 'Sistema web sob medida' },
  { value: 'ecommerce-plataforma', label: 'E-commerce ou plataforma' },
  { value: 'automacao', label: 'Automação de processo' },
  { value: 'nao-sei', label: 'Ainda não sei' },
] as const satisfies ReadonlyArray<{ value: ProjectType; label: string }>;
```

**Não existe form análogo no código atual** — nenhum `<form>` foi escrito ainda no repositório. O design source (`arquivos de design/Dmarques Landing.dc.html`, linhas 361-385) mostra apenas **3 campos** com sintaxe de editor inválida (`onSubmit="{{ onSubmit }}"`, `style-focus="..."`, `{{ submitLabel }}`) — **nunca copiar essa sintaxe literalmente** (Pitfall 5 do RESEARCH). Traduzir cada `style="..."`/`style-focus="..."` para classe + `<style>`/`:focus-visible`, remover `onSubmit`, adicionar os 2 campos novos (E-mail, Mensagem) e usar o label estático `{{ submitLabel }}` → texto fixo `"Enviar pedido de orçamento"`.

**Contrato de campos exato (5 campos, `03-UI-SPEC.md` § Contact Form Field Contract):**
```astro
<form>
  <label for="nome">Nome</label>
  <input type="text" id="nome" name="nome" required />

  <label for="whatsapp">WhatsApp</label>
  <input type="tel" id="whatsapp" name="whatsapp" />
  <span class="form-note">Preencha ao menos um: WhatsApp ou e-mail.</span>

  <label for="email">E-mail</label>
  <input type="email" id="email" name="email" />

  <label for="tipo-projeto">Tipo de projeto</label>
  <select id="tipo-projeto" name="tipo-projeto" required>
    {PROJECT_TYPES.map((t) => <option value={t.value}>{t.label}</option>)}
  </select>

  <label for="mensagem">Mensagem</label>
  <textarea id="mensagem" name="mensagem" rows="4" placeholder="Conte um pouco sobre o seu projeto"></textarea>

  <button type="submit">Enviar pedido de orçamento</button>
</form>
```
Sem `action`/`method` no `<form>` (D-11 — endpoint é Fase 5). `id`/`name`/`for` reais em todo campo (requisito próprio desta fase, não da Fase 5).

---

### `src/components/SiteHeader.astro` (nav + `<details>` mobile, D-04/D-05/D-06)

**Sem analog no código** (nenhum header/nav foi escrito ainda). Usar o padrão já verificado em `03-RESEARCH.md` Pattern 2 e travado em `03-UI-SPEC.md` § Mobile Navigation Contract:

```astro
<details class="nav-toggle">
  <summary aria-label="Abrir menu de navegação">
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
  </summary>
  <nav class="nav-panel">
    <a href="#servicos">Serviços</a>
    <a href="#processo">Como trabalhamos</a>
    <a href="#sobre">Sobre</a>
    <a href="#contato">Contato</a>
  </nav>
</details>
<a href="#contato" class="cta-pill">Pedir orçamento</a>

<style>
  .nav-toggle > summary {
    list-style: none;
    cursor: pointer;
  }
  .nav-toggle > summary::-webkit-details-marker {
    display: none;
  }
  .nav-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
</style>
```
**As duas regras de remoção do marcador são obrigatórias juntas** (`list-style: none` + `::-webkit-details-marker { display: none }`) — uma sozinha não é suficiente entre browsers.

**Pitfall crítico de layout (Pitfall 4 do RESEARCH):** o header/`<details>` **nunca** pode ser descendente de um wrapper com `overflow:hidden`/`overflow-x:clip` compartilhado com o resto da página — isso corta visualmente o painel expandido mesmo com `z-index` correto. O design source aplica esse `overflow-x:clip` no wrapper raiz da página inteira (linha 28, fora do range lido) — **não reproduzir esse wrapper global**; escopar `overflow:hidden` só aos containers que realmente precisam (imagem do hero, canvas, glow do CTA final).

**Trecho de referência do design (linhas 149-160, NUNCA copiar `style=""` literal, só a intenção visual):**
```html
<div style="max-width:1320px;margin:0 auto;padding:0 clamp(20px,4vw,56px);display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap">
  <div style="display:flex;align-items:center;gap:11px">
    <div style="width:32px;height:32px;border-radius:10px;border:1px solid rgba(108,76,255,.6)...">D</div>
    <span>Dmarques <span style="color:rgba(255,255,255,.4)">Soluções Web</span></span>
  </div>
  <nav>
    <a href="#servicos" style-hover="color:#fff">Serviços</a>
    ...
    <a href="#contato" style-hover="background:#6C4CFF;border-color:#6C4CFF">Pedir orçamento</a>
  </nav>
</div>
```
Traduzir cada `style-hover` para `:hover, :focus-visible` no `<style>` do componente (ANIM-07 — todo `:hover` precisa do par `:focus-visible`).

---

### `src/components/HeroBleed.astro`, `AboutSection.astro` (imagens via `astro:assets`)

**Sem analog de componente `<Picture>`/`<Image>` no código** — só existe o precedente de imagem em frontmatter de content collection (`cover: image()` no schema `cases`, `src/content.config.ts` linha 53, e o arquivo `src/content/cases/dmarques-cover.webp` já rasterizado). Reaproveitar a mesma disciplina de placeholder (formas vetoriais, sem `<text>`, <300KB), mas via `<Picture>`/`<Image>` desta vez (não via script `createRequire` avulso da Fase 2, que não serve para componentes).

**Pré-requisito bloqueante (Pitfall 1, crítico):** `pnpm add -D sharp@0.35.4` deve ser a **primeira tarefa** da fase — sem isso, `astro build` falha com `MissingSharp` assim que qualquer `.astro` usar `<Image>`/`<Picture>` com asset local.

**Padrão verificado (Code Example, `03-RESEARCH.md` Pattern 5, testado neste repo):**
```astro
---
import { Picture } from 'astro:assets';
import heroRender from '../assets/hero-render-placeholder.webp';
---
<Picture
  src={heroRender}
  alt=""
  aria-hidden="true"
  formats={['avif', 'webp']}
  priority
  width={960}
  height={720}
/>
```
Produz (build output verificado):
```html
<picture>
  <source srcset="/_astro/hero-render-placeholder.[hash].avif" type="image/avif">
  <source srcset="/_astro/hero-render-placeholder.[hash].webp" type="image/webp">
  <img src="/_astro/hero-render-placeholder.[hash].webp" alt="" aria-hidden="true"
       loading="eager" decoding="sync" fetchpriority="high" width="960" height="720">
</picture>
```

**Portrait (alt real, D-02, sem `priority`):**
```astro
<Picture
  src={founderPortrait}
  alt="Felipe Salles, fundador da Dmarques"
  formats={['avif', 'webp']}
  width={480}
  height={600}
/>
```

---

### `src/components/CtaFinal.astro`, `SiteFooter.astro` (markup estático puro)

**Sem analog de componente no código** — seguir o mesmo padrão de `<style>` escopado + tokens de `index.astro`, traduzindo o design source linha a linha (Rodapé, linhas 444-473) sem copiar `style=""` literal. O watermark "DMARQUES" translúcido (`rgba(255,255,255,.045)`) é puramente decorativo e permanece `aria-hidden="true"` — não entra na auditoria de contraste (não é texto para leitura, per Specifics do CONTEXT.md).

---

### `src/styles/tokens.css` (editado — correções de contraste D-13/D-14 + `--nav-height`)

**Analog:** o próprio arquivo, edição in-place (112 linhas, já lido integralmente).

**Tokens a alterar exatamente (valores computados e travados em `03-UI-SPEC.md` § Contrast remediation):**
```css
/* antes */
--color-text-faint: rgba(255, 255, 255, 0.45);
--focus-ring: 0 0 0 3px rgba(108, 76, 255, 0.5);

/* depois */
--color-text-faint: rgba(255, 255, 255, 0.47);
--focus-ring: 0 0 0 3px var(--color-accent);
```
Adicionar `--nav-height` (novo token, valor placeholder `84px` até o header real ser medido — não esquecer de revisitar):
```css
--nav-height: 84px;
```
**Usos específicos de `#6C4CFF` como texto pequeno** (eyebrows) devem trocar para `var(--color-accent-light)` no ponto de uso, **não** alterando o token `--color-accent` base (D-14) — isso é uma mudança de classe/seletor no componente, não no arquivo de tokens.

**Script de verificação (rodar manualmente antes de commitar qualquer edição de cor, `03-RESEARCH.md` § Code Examples — não existe gate de CI para isto ainda):**
```javascript
function minAlphaForRatio(fgHex, bgHex, target) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const ratio = contrastRatio(compositeOver(mid, fgHex, bgHex), hexToRgb(bgHex));
    if (ratio >= target) hi = mid; else lo = mid;
  }
  return hi;
}
```

---

### `package.json` (editado — nova devDependency `sharp@0.35.4`)

**Analog:** o próprio arquivo (31 linhas, já lido integralmente). Padrão de versionamento do projeto: pins exatos, sem `^`/`~` nas dependências diretas (`"astro": "7.3.1"`, `"@astrojs/vercel": "11.0.10"`).

```json
"devDependencies": {
  "@astrojs/check": "~0.9",
  "@biomejs/biome": "2.5.12",
  "@lhci/cli": "0.15.1",
  "prettier": "3.9.6",
  "prettier-plugin-astro": "0.14.1",
  "sharp": "0.35.4",
  "typescript": "5.9.3"
}
```
Confirmar antes com `pnpm why sharp` que `0.35.4` é exatamente a versão já resolvida transitivamente por `astro` no `pnpm-lock.yaml` — não introduzir uma segunda versão na árvore.

---

## Shared Patterns

### Zero comentários no código (regra de projeto, todo arquivo versionado)
**Fonte:** `.planning/phases/01-foundation-ci-gate/01-CONTEXT.md` D-04 + memória do usuário (`no-code-comments.md`)
**Aplica-se a:** todos os 17 arquivos desta fase, sem exceção — `.astro`, `.css`, `.md` frontmatter (o corpo de prosa em Markdown não é "código").

### `inlineStylesheets: 'never'` já resolve a organização de CSS automaticamente
**Fonte:** `astro.config.mjs` (config existente) + verificação empírica em `03-RESEARCH.md`
**Aplica-se a:** todos os componentes novos — não é preciso se preocupar em consolidar `<style>` blocks manualmente; o Vite/Astro já funde tudo em um CSS externo por página.

### `:hover` sempre pareado com `:focus-visible` (ANIM-07)
**Fonte:** `03-RESEARCH.md` Pattern 1 + `03-UI-SPEC.md` § Interaction States Contract
**Aplica-se a:** todo elemento interativo em `SiteHeader`, `HeroBleed`, `ContactSection`, `SiteFooter`, `CtaFinal`.
```css
.nav-link {
  color: var(--color-text-muted);
  transition: color var(--dur-fast) var(--ease-standard);
}
.nav-link:hover,
.nav-link:focus-visible {
  color: var(--color-text-strong);
}
```

### Reveal markup inerte (ANIM-02) — CSS-only, sem JS nesta fase
**Fonte:** `03-RESEARCH.md` Pattern 3 / `03-UI-SPEC.md` § Reveal Markup Contract
**Aplica-se a:** `ServicesSection`, `ProcessSection`, `DifferentiatorsSection`, `AboutSection`, `ContactSection`, `FaqSection`, `CtaFinal` (todo elemento marcado `data-reveal="1"` no design source).
```css
[data-reveal] {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: no-preference) {
  html.js-ready [data-reveal] {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity var(--dur-reveal) var(--ease-out), transform var(--dur-reveal) var(--ease-out);
  }
  html.js-ready [data-reveal].is-revealed {
    opacity: 1;
    transform: none;
  }
}
```
Nomes de classe (`js-ready`, `is-revealed`) são fixos — a Fase 4 vai se conectar exatamente a eles.

### `scroll-margin-top` + `scroll-behavior` reduced-motion aware (SITE-05/ANIM-08)
**Fonte:** `03-RESEARCH.md` Pattern 4 / `03-UI-SPEC.md`
**Aplica-se a:** CSS global (provavelmente `base.css` ou um novo bloco em `index.astro`).
```css
html { scroll-behavior: smooth; }
:is(#servicos, #processo, #sobre, #contato) { scroll-margin-top: var(--nav-height, 84px); }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

### Skip link (A11Y-01)
**Fonte:** `03-RESEARCH.md` § Code Examples
**Aplica-se a:** apenas `index.astro` (única página com header completo) — usa o `#conteudo` já existente em `<main id="conteudo">`.
```astro
<a href="#conteudo" class="skip-link">Pular para o conteúdo</a>
<style>
  .skip-link {
    position: absolute;
    top: -100%;
    left: var(--space-4);
    z-index: var(--z-skiplink);
    padding: var(--space-3) var(--space-5);
    background: var(--color-accent);
    color: var(--color-text-on-accent);
    border-radius: var(--radius-md);
    transition: top var(--dur-fast) var(--ease-standard);
  }
  .skip-link:focus-visible { top: var(--space-4); }
</style>
```

### Nunca transplantar sintaxe do design source (Pitfall 5)
**Fonte:** `03-RESEARCH.md` Pitfall 5
**Aplica-se a:** todo componente que usa `arquivos de design/Dmarques Landing.dc.html` como referência visual. Atributos a **sempre remover**: `onClick="{{ ... }}"`, `onSubmit="{{ ... }}"`, `ref="{{ ... }}"`, `<image-slot>`, `<sc-if>`. Verificação manual sugerida: `grep -rn 'onClick\|onSubmit\|{{' src/`.

---

## No Analog Found

| Arquivo | Role | Data Flow | Motivo |
|---|---|---|---|
| `src/components/SiteHeader.astro` | component | event-driven (`<details>` nativo) | Nenhum header/nav foi escrito ainda no repo. Usar Pattern 2 de `03-RESEARCH.md` + Mobile Navigation Contract de `03-UI-SPEC.md`. |
| `src/components/ContactSection.astro` | component | request-response (form estático) | Nenhum `<form>` existe no código. Usar o Contact Form Field Contract de `03-UI-SPEC.md`. |
| `src/components/HeroBleed.astro`, `AboutSection.astro` | component | file-I/O (imagem) | Nenhum uso de `<Picture>`/`<Image>` de `astro:assets` existe ainda no código (bloqueado até `sharp` virar devDependency explícita — Pitfall 1). Usar Pattern 5 de `03-RESEARCH.md`. |
| `src/components/CtaFinal.astro`, `SiteFooter.astro` | component | static markup | Nenhum componente de seção existe ainda; seguir a estrutura genérica de `index.astro` + tokens. |
| Script de geração dos placeholders (`hero-render-placeholder.webp`, `founder-portrait-placeholder.webp`) | utility (não versionado) | file-I/O / batch (build-time, one-off) | O script Node que gerou `dmarques-cover.webp` na Fase 2 foi um script avulso, removido do repo após uso (não commitado) — não há arquivo para copiar; reproduzir a mesma técnica (`createRequire` para resolver o `sharp` do pnpm, formas vetoriais rasterizadas) descrita textualmente em `02-CONTEXT.md`. |

---

## Metadata

**Escopo de busca de analogs:** `src/` (todo o diretório), `.planning/phases/01-*` e `.planning/phases/02-*` (precedentes de decisão), `arquivos de design/Dmarques Landing.dc.html` (fonte visual, referência apenas — nunca copiar literalmente), `scripts/security-check.sh` (gate mecânico que esta fase deve continuar passando).
**Arquivos escaneados:** `src/pages/index.astro`, `src/layouts/BaseLayout.astro`, `src/styles/tokens.css`, `src/styles/base.css`, `src/content.config.ts`, `src/content/index.ts`, `src/content/project-types.ts`, `src/content/services/automacoes.yaml`, `src/content/process/01-diagnostico.yaml`, `src/content/differentiators/atendimento-direto.yaml`, `src/content/faq/ainda-nao-sei.yaml`, `src/content/cases/dmarques.md`, `package.json`, `scripts/security-check.sh`, trechos do design source (linhas 147-195 Hero, 332-387 Contato, 444-473 Rodapé).
**Data de extração dos padrões:** 2026-09-16
