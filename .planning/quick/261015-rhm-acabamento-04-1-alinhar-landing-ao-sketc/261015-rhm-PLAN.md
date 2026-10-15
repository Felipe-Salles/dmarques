---
phase: quick-261015-rhm
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - public/grain.svg
  - src/styles/base.css
  - src/components/Aurora.astro
  - src/components/HeroBleed.astro
  - src/components/ServicesSection.astro
  - src/components/ProjectsSection.astro
  - src/components/ProcessSection.astro
  - src/components/AboutSection.astro
  - src/components/ContactSection.astro
  - src/components/SiteFooter.astro
  - scripts/verify/aurora-gates.mjs
autonomous: true
requirements: [QUICK-04.1-ACABAMENTO]

must_haves:
  truths:
    - "A textura grain cobre a página inteira numa única camada, sem faixa com borda reta no fim do Hero nem no topo do Contato, e a aurora do hero se dissolve sem degrau"
    - "Serviços, Projetos, Como trabalhamos e Sobre têm padding-top clamp(88px,12cqi,144px) e padding-bottom 0; Contato tem top e bottom clamp(88px,12cqi,144px)"
    - "A linha acima da faixa de prova do hero é um gradiente que some nas pontas e continua animando a entrada (scaleX)"
    - "Os 4 ícones de Serviços são os SVGs do sketch, com 30px, e a tipografia/espaçamento da lista bate com o sketch"
    - "O card 'O site da própria Dmarques' tem um botão redondo com flecha no canto superior direito que gira -45deg e inverte as cores no hover do card; é link acessível com aria-label e alvo de 44px"
    - "O título de Como trabalhamos quebra em 2 linhas a 1440px e as etapas têm o tamanho e espaçamento do sketch"
    - "Sobre não tem mais o link @agenciadmarques; o rodapé não tem 'Feito por gente, para gente.' nem o Instagram; o Instagram continua no Contato"
    - "O canal WhatsApp do Contato mostra '(16) 99611-1785 · resposta mais rápida' e os canais têm o tamanho do sketch; o formulário não muda"
  artifacts:
    - path: "src/styles/base.css"
      provides: "camada única de grain em .site::after"
      contains: ".site::after"
    - path: "public/grain.svg"
      provides: "ruído same-origin igual ao do sketch"
      contains: "feTurbulence"
    - path: "src/components/ProjectsSection.astro"
      provides: "botão .arrow no card destacado"
      contains: "class=\"arrow\""
    - path: "scripts/verify/aurora-gates.mjs"
      provides: "gate contact exige instagram no Contato e ausência no footer"
      contains: "instagram.com/agenciadmarques"
  key_links:
    - from: "src/styles/base.css"
      to: "public/grain.svg"
      via: "background-image url(/grain.svg) em .site::after"
      pattern: "url\\(/grain\\.svg\\)"
    - from: "src/components/Aurora.astro"
      to: ".grain"
      via: "remoção do div.grain por seção"
      pattern: "class=\"grain\""
---

<objective>
Acabamento visual da Fase 04.1: alinhar a landing ao sketch `.planning/sketches/001-aurora-landing/index.html` (variante A; ignorar `#variant-nav`, `#sketch-tools` e regras `.v-b`/`.v-c`) nos 9 itens que o Felipe apontou depois de comparar com Playwright.

Purpose: a landing implementada tem que ficar visualmente igual ao sketch aprovado (direção "Aurora técnica").
Output: componentes Astro e CSS ajustados, `public/grain.svg` trocado, gate `contact` atualizado, capturas lado a lado (não versionadas) confirmando os 9 itens.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@.claude/skills/sketch-findings-dmarques/SKILL.md

Fonte da verdade visual (ler só as faixas citadas, o arquivo tem 907 linhas):
- `.planning/sketches/001-aurora-landing/index.html` linhas 33-34 (`.site`, `.site::after` grain), 41 (`.section` padding), 152-160 (serviços), 162-173 (`.proj-head`, `.card .arrow`), 197-206 (`.method-head`, `.steps`, `.step`), 220 (`.contact` padding), 227-234 (`.channel`), 287-288 e 380 (hover `.go` e reduced-motion), 305-311 (`.proof::before`), 383-420 (responsivo 900/560), markup 498-537 (serviços e card destacado), 617-628 (método), 662-673 (canais).

Regras do usuário (inegociáveis):
- ZERO comentários em qualquer arquivo versionado (inclusive CSS, Astro, mjs, svg).
- Copy em pt-BR.
- Nenhum `style=""` inline (CSP: `style-src-attr` não é liberado). Onde o sketch usa `style="--d:..."` ou `style="font-size:..."`, usar as classes já existentes (`d200`, `i0`...) ou regras no `<style>` do componente.
- Manter os guards de `prefers-reduced-motion` (toda transform/animação nova fica dentro de `@media (prefers-reduced-motion: no-preference)` ou é neutralizada em `reduce`).
- Orçamento de JS < 20 KB (este plano não adiciona JS).
- NÃO mexer no formulário de Contato (campos, validação, `src/scripts/form.ts`, markup de `<form>`): a Fase 5 vai reescrevê-lo.

<interfaces>
Estado atual relevante (extraído do código):

src/components/Aurora.astro: renderiza `<div class="aurora aurora--{variant}">` e, para `hero`/`contact`, também `<div class="grain" aria-hidden="true">` com CSS `.grain{position:absolute;inset:0;z-index:-1;background:url(/grain.svg);opacity:var(--grain-opacity)}`. Variants usadas: hero (HeroBleed), contact (ContactSection), small (404, obrigado, politica-de-privacidade).

src/styles/base.css (l. 91-96): `.site{container:site / inline-size;overflow:clip;position:relative;min-height:100svh}`. `.site` é o wrapper do BaseLayout em TODAS as páginas.

public/grain.svg hoje: feTurbulence baseFrequency 0.8, numOctaves 2, feColorMatrix saturate 0 (cinza opaco). Token `--grain-opacity: 0.07` em src/styles/tokens.css (igual ao sketch).

Sketch grain (decodificado da data-URI da linha 34):
svg 160x160; filter id n; feTurbulence type fractalNoise baseFrequency .85 numOctaves 3 stitchTiles stitch; feColorMatrix values "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 0"; rect 100% x 100% filter url(#n). Aplicado com mix-blend-mode:overlay, z-index 50, pointer-events none, opacity var(--grain-opacity).

Paddings atuais: ServicesSection `.services` 144clamp/96clamp (l. 92-93); ProjectsSection `.projects` só padding-bottom clamp(56px,8cqi,96px) (l. 144); ProcessSection `.process` clamp(56px,8cqi,96px)/clamp(88px,12cqi,144px) (l. 37-38); AboutSection `.about` idem (l. 67-68); ContactSection `.contact` só padding-bottom clamp(88px,12cqi,144px) (l. 219). Não existe regra global `.section`.

HeroBleed `.proof::before` (l. 109-116): `background: var(--color-border)`, `transform-origin:center`; a animação de entrada scaleX existe em outro bloco (manter intacta).

ServicesSection: `iconShapes: Record<icon, IconShape[]>` com IconShape = rect | path | circle, renderizado com `pathLength="1"` em cada forma (a animação de desenho usa `stroke-dasharray:1; stroke-dashoffset:1→0` nas l. 224-252 e browser-gates verifica `.svc svg *` stroke-dashoffset). Chaves de ícone: sites, sistemas, solucoes-web, automacoes (enum em src/content.config.ts).

ProjectsSection: card destacado `article.card.c-feat.tilt.i0 > .card-meta > div(tag, h3, p)`; `featuredData.url` = "agenciadmarques.com.br" (src/content/cases/dmarques.md). `.proj-head` hoje é flex column gap 12 e o `<p>` tem classe `lead`.

ContactSection: canais `a.channel.wa.i3` (WhatsApp, span "(16) 99611-1785"), `a.channel.i4` (e-mail), `a.channel.i5` (Instagram). CSS `.channel` (l. 271-330) já copia as regras do sketch.

aurora-gates.mjs `contact()` (l. 249-269): exige no section#contato os needles e-mail, wa.me e instagram; e exige `instagram.com/agenciadmarques` dentro do `<footer>` (l. 263-266).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Grain em camada única, linha de prova em gradiente e ritmo vertical das seções</name>
  <files>public/grain.svg, src/styles/base.css, src/components/Aurora.astro, src/components/HeroBleed.astro, src/components/ServicesSection.astro, src/components/ProjectsSection.astro, src/components/ProcessSection.astro, src/components/AboutSection.astro, src/components/ContactSection.astro</files>
  <action>
Item 1 (grain): substituir o conteúdo de `public/grain.svg` pelo SVG do sketch decodificado (ver interfaces: baseFrequency .85, numOctaves 3, stitchTiles stitch, feColorMatrix "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 0", rect 100%), sem comentários, mantendo xmlns e width/height 160. Em `src/styles/base.css`, adicionar `isolation: isolate` ao `.site` e criar `.site::after` com content vazio, position absolute, inset 0, pointer-events none, z-index 50, opacity var(--grain-opacity), background-image url(/grain.svg) (same-origin por causa da CSP, nunca data-URI) e mix-blend-mode overlay — exatamente o sketch linha 34. Em `src/components/Aurora.astro`, remover a linha que renderiza `div.grain` e a regra `.grain` do `<style>` (o grain passa a valer em todas as páginas via `.site`, como no sketch). Depois de buildar, conferir no navegador que a aurora do hero não tem borda reta na base (no sketch ela se dissolve); se houver degrau causado por algum overflow/recorte do `.hero` ou por fundo opaco da seção seguinte, corrigir para que a aurora se dissolva (não adicionar overflow hidden ao hero).

Item 3 (linha da prova): em `HeroBleed.astro` `.proof::before`, trocar `background: var(--color-border)` por `linear-gradient(90deg, transparent, var(--color-border-strong) 20%, var(--color-border-strong) 80%, transparent)` (sketch l. 308). Não tocar nas regras de animação scaleX existentes nem no transform-origin.

Item 2 (ritmo): padding-top `clamp(88px, 12cqi, 144px)` e padding-bottom `0` em `.services` (ServicesSection l. 92-93), `.projects` (ProjectsSection l. 144, acrescentar padding-top), `.process` (ProcessSection l. 37-38) e `.about` (AboutSection l. 67-68). Em `.contact` (ContactSection l. 215-220) acrescentar padding-top `clamp(88px, 12cqi, 144px)` mantendo padding-bottom igual. Não alterar mais nada desses blocos nesta task. Zero comentários.
  </action>
  <verify>
    <automated>cd /f/Projetos/dmarques && pnpm build && grep -c "site::after" src/styles/base.css && test "$(grep -c 'class="grain"\|\.grain' src/components/Aurora.astro)" = "0" && grep -q "baseFrequency=\".85\"\|baseFrequency='.85'" public/grain.svg && grep -q "color-border-strong) 20%" src/components/HeroBleed.astro && pnpm verify:gates</automated>
  </verify>
  <done>Build passa; `.grain` não existe mais em Aurora.astro; `.site::after` usa `/grain.svg`; `.proof::before` usa o gradiente; os 5 blocos de seção têm os paddings-alvo; `pnpm verify:gates` passa (o gate contact ainda exige Instagram no footer, que só sai na Task 2).</done>
</task>

<task type="auto">
  <name>Task 2: Conteúdo por seção (Serviços, Projetos, Método, Sobre, Contato, Rodapé) e gate de Instagram</name>
  <files>src/components/ServicesSection.astro, src/components/ProjectsSection.astro, src/components/ProcessSection.astro, src/components/AboutSection.astro, src/components/ContactSection.astro, src/components/SiteFooter.astro, scripts/verify/aurora-gates.mjs</files>
  <action>
Item 4 (Serviços): trocar o conteúdo de `iconShapes` pelos SVGs do sketch (l. 506-522), em viewBox 0 0 48 48 — sites: rect x5 y9 w38 h28 rx4 + path "M5 16h38M17 43h14M24 37v6"; sistemas: rect x5 y7 w38 h34 rx4 + path "M5 15h38M15 15v26M21 23h16M21 29h12M21 35h14"; solucoes-web: circles (12,24,r6), (36,12,r6), (36,36,r6) + path "M17.5 21.5l13-7M17.5 26.5l13 7"; automacoes: path "M8 14h20a6 6 0 010 12H20a6 6 0 000 12h20" + path "M36 34l4 4-4 4M12 10l-4 4 4 4". Manter o tipo IconShape, o mapeamento por `item.data.icon` e o `pathLength="1"` em cada forma (a animação de desenho e o browser-gate dependem disso). No `<svg>`: viewBox "0 0 48 48", stroke-width 1.6, remover stroke-linecap/linejoin (o sketch não usa). CSS: `.svc svg` width/height 30px, grid-row span 2, margin-top 4px; `.svc` mantém grid 44px 1fr, gap 6px 20px, padding 28px 0; `.svc h3` font-size clamp(1.3rem,2.4cqi,1.75rem), weight 600, letter-spacing -0.02em, sem line-height próprio (remover o 1.15, herda como no sketch); `.svc p` font-size var(--text-base), line-height 1.55, max-width 52ch. No `@container site (max-width: 560px)`: `.svc` grid 36px 1fr e padding 22px 0, `.svc svg` 26px (sketch l. 418-419). Manter o hover translateX existente.

Item 5 (Projetos): `.proj-head` vira `display:flex; justify-content:space-between; align-items:end; gap:24px; flex-wrap:wrap; margin-bottom:40px`, com h2 e p envolvidos num `<div>` como no sketch (l. 528-533); o `<p>` perde a classe `lead` (mantém `d200` e `data-r="fade"`) e recebe regra `.proj-head p{margin:12px 0 0;font-size:var(--text-sm);color:var(--color-text-muted)}`; remover a regra antiga que zera a margem do p. No card destacado, acrescentar dentro de `.card-meta`, depois do `<div>` de texto, um `<a class="arrow" href={`https://${featuredData.url}`} aria-label="Ver o site da Dmarques no ar">` contendo svg 16x16 viewBox 0 0 24 24, fill none, stroke currentColor, stroke-width 2, aria-hidden, path "M5 12h14M13 6l6 6-6 6" (sketch l. 537). CSS: `.card .arrow` width/height 44px, flex none, border-radius 50%, border 1px solid var(--color-border-strong), display grid, place-items center, color var(--color-text), transition background-color .2s, color .2s, transform .2s; `.card:hover .arrow, .card .arrow:focus-visible` background var(--color-text) e color #070a14; o `transform: rotate(-45deg)` desse estado fica dentro de `@media (prefers-reduced-motion: no-preference)` (sob reduce só a troca de cor). Garantir foco visível (outline herdado do base). Mesmo destino do card, sem target _blank.

Item 6 (Como trabalhamos): `.process-head` grid 1.35fr 1fr, gap 32px, align-items end, margin-bottom 56px (sketch l. 197); no container 900px: grid 1fr, gap 16px, margin-bottom 40px. `.step`: gap 12px e padding-right 12px; `.step h3`: margin 12px 0 0, font-size var(--text-lg), weight 600, remover line-height 1.2 e letter-spacing próprios para herdar como o sketch; `.step p`: margin 0, font-size var(--text-sm), line-height 1.6; `.step p.here`: font-size var(--text-xs), color ember, margin-top 2px. No container 560px: `.step h3` margin 8px 0 4px (sketch l. 413). Não tocar nas regras de animação `.lit`/`--p`. Meta: título em 2 linhas a 1440px (confirmar na Task 3; se ainda quebrar em 3, investigar a largura efetiva da coluna em vez de mudar o font-size).

Item 7 (Sobre): remover o `<a class="about-link">` (l. 53-58) e as regras `.about-link` do `<style>`.

Item 8 (Contato): no canal WhatsApp trocar o span por "(16) 99611-1785 · resposta mais rápida". Manter os três canais (Instagram continua aqui). Com Playwright, medir `getBoundingClientRect` de `.channel`, `.channel .ic`, `.channel b`, `.channel div span` e `.channel .go` no sketch (file://) e no site a 1440 e 390; corrigir qualquer diferença > 2px no CSS dos canais (min-height 64px, padding 12px 16px, gap 14px, ic 40px, radius var(--radius-md), b text-sm 600, span text-xs) — inclusive coluna `.contact-copy`/`.contact-grid` se for a causa. NÃO tocar em nada dentro de `<form>`, nem nas regras `.form*`, `.field*`, `.glass`, nem em src/scripts/form.ts.

Item 9 (Rodapé + gate): em `SiteFooter.astro` remover a frase "Feito por gente, para gente." do parágrafo da marca (fica "Sites, sistemas, soluções web e automações sob medida. Ibitinga · SP.") e remover o link do Instagram da coluna Contato (l. 31-36). Em `scripts/verify/aurora-gates.mjs` `contact()`: manter os três needles no section#contato e inverter a checagem do footer — falhar com a mensagem 'footer contem instagram.com/agenciadmarques' se o `<footer>` incluir o needle (footer ausente continua falhando como 'footer ausente'). Zero comentários em todos os arquivos.
  </action>
  <verify>
    <automated>cd /f/Projetos/dmarques && pnpm build && pnpm verify:gates && pnpm verify:browser && test "$(grep -c 'about-link' src/components/AboutSection.astro)" = "0" && test "$(grep -c 'Feito por gente\|instagram' src/components/SiteFooter.astro)" = "0" && grep -q "resposta mais rápida" src/components/ContactSection.astro && grep -q 'class="arrow"' src/components/ProjectsSection.astro && git diff --quiet -- src/scripts/form.ts</automated>
  </verify>
  <done>Gates estáticos e de navegador passam; ícones do sketch renderizam com animação de desenho intacta; botão `.arrow` presente e acessível; Sobre sem link Instagram; rodapé sem a frase e sem Instagram; gate exige Instagram só no Contato; WhatsApp com o sub-texto; formulário intocado.</done>
</task>

<task type="auto">
  <name>Task 3: Verificação completa e comparação lado a lado com o sketch (1440 e 390)</name>
  <files>.planning/quick/261015-rhm-acabamento-04-1-alinhar-landing-ao-sketc/shots/ (não versionado)</files>
  <action>
Rodar em sequência: `pnpm build`, `pnpm verify:gates`, `pnpm verify:browser`, `bash scripts/js-weight-check.sh`, `pnpm lint` e `pnpm check`. Corrigir qualquer falha nos arquivos das Tasks 1-2.

Comparação visual: escrever um script Playwright descartável no scratchpad da sessão (fora do repo), reutilizando `launchBrowser`/`startStaticServer` de `scripts/verify/static-server.mjs` via import absoluto, para: (a) servir o build e abrir `/`; (b) abrir o sketch por `file://` em `.planning/sketches/001-aurora-landing/index.html` (variante A é a default; esconder `#variant-nav` e `#sketch-tools` via addStyleTag); (c) em viewports 1440x900 e 390x844, com `reducedMotion: 'reduce'` e após `document.fonts.ready`, capturar cada seção (hero, #servicos, #projetos, processo/#metodo, #sobre, #contato, footer) dos dois lados como PNG em `.planning/quick/261015-rhm-acabamento-04-1-alinhar-landing-ao-sketc/shots/` com nomes `{secao}-{largura}-{site|sketch}.png`; (d) medir e imprimir: paddings top/bottom computados das 5 seções; existência de exatamente um pseudo grain (`getComputedStyle(.site,'::after').backgroundImage` contém grain.svg) e zero `.grain`; background de `.proof::before`; tamanho de `.svc svg`; número de linhas do h2 de processo a 1440 (altura / line-height) = 2; caixa do `.arrow` ≥ 44x44 e sua cor/transform após `hover()` no card (sem reduce); bounding boxes dos `.channel` site vs sketch. Ler os PNGs (ferramenta Read) e confirmar os 9 itens um a um, incluindo ausência de degrau no fim do hero e no topo do contato. Ajustar o que divergir e repetir. Não commitar PNGs nem o script: adicionar `shots/` ao commit NÃO; garantir que `git status` final não liste PNGs (se necessário, apagar a pasta shots antes do commit depois de relatar).
  </action>
  <verify>
    <automated>cd /f/Projetos/dmarques && pnpm build && pnpm verify:gates && pnpm verify:browser && bash scripts/js-weight-check.sh && pnpm lint && test -z "$(git status --porcelain | grep -i '\.png$')"</automated>
  </verify>
  <done>Todos os comandos passam; o relatório de medições mostra os 9 itens conformes a 1440 e 390; as capturas lado a lado foram inspecionadas e não há PNG no git.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| navegador → assets estáticos | o grain e o link novo são servidos/abertos sob a CSP existente |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-rhm-01 | Tampering | `.site::after` background | mitigate | usar `/grain.svg` same-origin (img-src 'self'); nunca data-URI, que exigiria afrouxar a CSP |
| T-rhm-02 | Tampering | estilos novos | mitigate | nenhum `style=""` inline; tudo em `<style>` hasheado pelo `security.csp`; gates checam CSP |
| T-rhm-03 | Spoofing | link `.arrow` | accept | aponta para o próprio domínio `https://agenciadmarques.com.br`, sem target _blank |
| T-rhm-04 | Information Disclosure | formulário | mitigate | form e form.ts intocados nesta tarefa (`git diff --quiet -- src/scripts/form.ts`) |
</threat_model>

<verification>
`pnpm build`, `pnpm verify:gates`, `pnpm verify:browser`, `bash scripts/js-weight-check.sh`, `pnpm lint` passam; capturas Playwright lado a lado (1440 e 390) inspecionadas para os 9 itens; zero comentários adicionados (`git diff | grep -E '^\+.*(<!--|/\*|^\+\s*//)'` vazio).
</verification>

<success_criteria>
Os 9 itens pedidos pelo Felipe batem com o sketch na variante A, em desktop e mobile, sem regressão de gates, CSP, reduced-motion ou orçamento de JS, e sem tocar no formulário.
</success_criteria>

<output>
Create `.planning/quick/261015-rhm-acabamento-04-1-alinhar-landing-ao-sketc/261015-rhm-SUMMARY.md` when done
</output>
