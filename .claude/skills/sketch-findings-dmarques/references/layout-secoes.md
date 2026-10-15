# Layout e seções

## Design Decisions

Ordem da página: header → hero → serviços → projetos → método → sobre → contato → footer.
Regra geral: **nada de estrutura de template**. Sem eyebrow/kicker acima de títulos, sem faixa de
métricas no hero, sem 4 cards iguais de ícone+texto, sem o mesmo cabeçalho de seção repetido.

- **Header:** sticky; transparente no topo, vira vidro (`rgba(7,10,20,.72)` + blur 16px + borda) após
  24px de rolagem e encolhe de 84 para 68px. Logo = símbolo + logotipo (no mobile ≤560px ambos a 26px).
  Nav por âncora com estado de seção ativa (IntersectionObserver). CTA "Pedir orçamento" (ghost). Mobile:
  botão de menu 44×44 abre lista de links de 48px.
- **Hero (variante A):** centrado sob a aurora. H1 "Software sob medida, com acabamento de produto."
  (segunda parte em `.accent`), lead, CTAs "Pedir orçamento" (primário claro, seta ember) + "Ver projetos"
  (ghost). Abaixo, **linha de prova** com borda superior: "Nosso próprio site abre em ~1,5 s no celular ·
  Nota 95+ no Google PageSpeed · Zero cookies de rastreamento · Confira você mesmo ↗" (link PageSpeed).
- **Serviços:** grid 0.8fr/1.2fr — intro fixa (sticky) à esquerda com H2 + lead; à direita **lista
  tipográfica** (`ul`) com linhas separadas por hairline, ícone SVG traçado ciano, H3 grande, descrição.
  Hover desloca a linha 10px. Mobile: uma coluna.
- **Projetos (bento 6 colunas):** card destaque real (span 4×2) "No ar · projeto próprio" com o site
  rodando em moldura de navegador + resultados em linguagem leiga; 2 cards "Exemplo de escopo"
  (span 2) e 1 largo (span 4) com mocks de **conteúdo realista** (agenda, site de clínica, pedidos
  processados); card-convite tracejado em ember "O próximo pode ser o seu." (span 2) com CTA.
  Tilt leve no hover (≤4.5°, só `pointer: fine` sem reduced-motion). Mobile: 1 coluna.
- **Método:** cabeçalho 1.35fr/1fr (H2 + lead); `ol` de 4 etapas numa **linha de luz** horizontal
  (ember → ciano → azul); números mono nos nós (a sequência carrega informação). Mobile: linha vertical.
- **Sobre:** foto real 4:5 colorida com nome/cargo sobre degradê inferior; H2 "Você fala com quem
  escreve o código."; texto em "nós" apresentando o Felipe; diferenciais em lista 2 colunas com hairline.
- **Contato:** H2 "Vamos construir algo sólido juntos."; lead; **"o que acontece depois"** em 3 passos
  (baseados no FAQ); canais WhatsApp (ícone ember) e e-mail `contato@agenciadmarques.com.br` com seta SVG;
  formulário de vidro à direita. Aurora invertida atrás, contida pela seção.
- **WhatsApp flutuante** (sticky no fim do fluxo, `bottom:16px`) só em ≤900px.
- **Footer:** logo + frase + Ibitinga · SP; colunas Navegação e Contato (links 44px); Instagram
  `@agenciadmarques`.

## CSS Patterns

```css
.site{container:site/inline-size;overflow:clip}
.wrap{width:min(1200px,100%);margin:0 auto;padding:0 clamp(16px,4cqi,40px)}
.section{padding:clamp(88px,12cqi,144px) 0 0}
.services-wrap{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(32px,6cqi,96px)}
.services-intro{position:sticky;top:32px}
.bento{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:minmax(180px,auto);gap:16px}
.c-feat{grid-column:span 4;grid-row:span 2}.c-a,.c-b,.c-you{grid-column:span 2}.c-c{grid-column:span 4}
@container site (max-width:900px){.services-wrap,.about,.contact-grid{grid-template-columns:1fr}.bento{grid-template-columns:1fr 1fr}}
@container site (max-width:560px){.bento{grid-template-columns:1fr}}
```

Usar `overflow: clip` (não `hidden`) no wrapper para não quebrar `position: sticky`.

## HTML Structures

```html
<p class="proof"><span>Nosso próprio site abre em <b>~1,5 s</b> no celular</span>…<a href="https://pagespeed.web.dev/">Confira você mesmo …</a></p>
<ul class="svc-list"><li class="svc"><svg aria-hidden="true">…</svg><h3>Sites institucionais</h3><p>…</p></li></ul>
<ol class="steps"><li class="step"><span class="knot" aria-hidden="true">01</span><div><h3>Diagnóstico</h3><p>…</p></div></li></ol>
```

## What to Avoid

- Variantes B (split com navegador) e C (imersiva com headline gigante + trilho horizontal) — descartadas.
- **Hero fixado / scrollytelling** (modo cinemático com auroras cruzando em X) — testado e **rejeitado
  pelo Felipe**; não reapresentar.
- Selo "Agenda aberta em <mês>" (fica desatualizado), cards com métricas inventadas, seta para lugar nenhum.
- Tap targets < 44px; logotipo escondido no mobile.

## Origin

Synthesized from sketches: 001 (variante A, rodadas 2–4)
Source files available in: sources/001-aurora-landing/
