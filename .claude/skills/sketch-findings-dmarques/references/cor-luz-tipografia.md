# Cor, luz e tipografia

## Design Decisions

- **Fundo escuro `#070A14`** com granulação sutil (SVG `feTurbulence`, opacidade 0.07, `mix-blend-mode: overlay`)
  para evitar aspecto plástico. Superfície elevada `#0B1020`.
- **Aurora = única fonte de luz**, nas cores da logo: ciano `#00C8FF`, azul `#3A5BFF`, índigo `#0E1E5B`.
  Aparece só no hero e (invertida) atrás do contato — a página abre e fecha na luz. Feita com
  `radial-gradient` estáticos **sem `filter: blur`** (mais leve no mobile). Opacidade via `--aurora-opacity`.
- **Ember `#FF6A3D` = marcador de ação**, um por tela: seta do CTA principal do hero, card "O próximo pode
  ser o seu", etapa 01 do método ("Nada é cobrado antes de você aprovar o plano"), ícone do canal WhatsApp.
  Nunca decorativo, nunca em selo de status.
- **Destaque de título em cor sólida** `#00C8FF` (classe `.accent`), nunca gradiente em texto.
- **Texto:** `#F2F4F7`; muted `#9AA3B2` (~7.8:1); faint `#828B9B` (≥4.5:1, AA). Placeholders `#8F98A8`.
- **Bordas:** `rgba(148,170,255,.12)` e strong `.24` — azuladas, não cinza.
- **Vidro** (backdrop-filter blur 18px + saturate 140%) só onde tem função: formulário de contato e
  header ao rolar. Máximo 2–3 superfícies.
- **Sombras neutras** com offset e blur (`0 30px 80px -30px rgba(0,0,0,.75)`); nunca glow colorido.
- **Tipografia:** Sora 600 nos títulos (`letter-spacing -0.03em`, display até ~4.6rem, `text-wrap: balance`);
  Inter Tight 400–600 no texto (lead 1–1.125rem, line-height 1.6, measure ≤56ch). Mono só para dados/URLs.
- **Superfícies do navegador temáticas:** `::selection` ciano com texto escuro, `caret-color` ciano,
  `scrollbar-color`, focus ring `2px solid #00C8FF` com offset 3px.
- **Foto do fundador colorida** (`src/assets/founder/felipe-salles.png`) — a luz azul do ambiente casa
  com a aurora; `object-position: 50% 20%`.

## CSS Patterns

```css
:root{--color-bg:#070a14;--aurora-cyan:#00c8ff;--aurora-blue:#3a5bff;--aurora-indigo:#0e1e5b;--color-ember:#ff6a3d;--color-text:#f2f4f7;--color-text-muted:#9aa3b2;--color-text-faint:#828b9b;--color-border:rgba(148,170,255,.12);--color-border-strong:rgba(148,170,255,.24);--font-display:'Sora';--font-sans:'Inter Tight'}
.aurora{position:absolute;pointer-events:none;z-index:-1;left:-15%;right:-15%;top:-30%;height:1100px;opacity:var(--aurora-opacity);background:
  radial-gradient(34% 38% at 30% 42%,rgba(0,200,255,.42),rgba(0,200,255,.14) 45%,transparent 72%),
  radial-gradient(40% 46% at 70% 34%,rgba(58,91,255,.5),rgba(14,30,91,.32) 50%,transparent 74%),
  radial-gradient(26% 30% at 50% 58%,rgba(14,30,91,.85),transparent 72%)}
::selection{background:#00c8ff;color:#070a14}
:focus-visible{outline:2px solid #00c8ff;outline-offset:3px;border-radius:6px}
```

No Astro: fontes via Fonts API (Fontsource) self-hosted — Sora e Inter Tight substituem Outfit e DM Sans.

## What to Avoid

- Violeta `#6C4CFF` do site atual (briga com a logo ciano/azul).
- Gradiente em texto, glow colorido em botões/ícones, halos com `filter: blur` grandes.
- Preto+dourado "de luxo", cores primárias puras, neon, paletas genéricas de banco de dados.
- Tema "Noite" (aurora contida) — testado, não escolhido.
- Texto em gradiente, pulso decorativo em ponto de status.

## Origin

Synthesized from sketches: 001 (variante A, rodadas 2–3)
Source files available in: sources/001-aurora-landing/
