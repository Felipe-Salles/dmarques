# Movimento

## Design Decisions

**Tese:** a aurora é a luz da página — ela acende e o conteúdo entra em foco conforme é iluminado.
Um momento autoral no hero + reveals distintos por seção (nunca a mesma entrada em tudo).

- **Hero (momento principal):** aurora acende do escuro (opacity 0→1 em 1.8s, scale .94→1 em 2.4s) e
  depois deriva lentamente (22s alternate, pausa fora da tela via IO). H1 entra **palavra a palavra**
  saindo de máscara (`overflow: clip` por palavra) e indo de `blur(8px)` a nítido (0.9s, stagger 55ms).
  Lead (+520ms), CTAs (+680ms) e linha de prova (+820ms; borda se desenha do centro, itens em sequência).
- **Títulos de seção:** mesma máscara palavra a palavra com foco.
- **Serviços:** hairlines desenham da esquerda (scaleX), ícones traçados (`stroke-dashoffset`), H3 e texto
  entram; itens escalonados 110ms.
- **Projetos:** cards sobem (translateY 28px + scale .985), escalonados por coluna; **faixa de luz**
  passa uma vez pelo vidro de cada navegador; os sites dentro das molduras **só rolam quando visíveis**
  (IO alterna `animation-play-state`), pausam no hover.
- **Método:** a linha de luz é **preenchida pela rolagem** (`--p` calculado no scroll com rAF) e cada
  etapa acende quando a luz chega (nó ganha cor, texto vai de .3 a 1). Linha vertical no mobile (scaleY).
- **Sobre:** foto revelada por `clip-path: inset(100% 0 0 0)` → `inset(0)` (1.3s) com zoom de
  assentamento (scale 1.12→1). Observar o **elemento pai** — elemento totalmente recortado não dispara IO.
- **Contato:** aurora inferior acende ao entrar; lista "o que acontece depois", canais e formulário entram.
- **Feedback:** seta dos botões avança 3px no hover; chips `scale(.96)` no toque; ✓ de sucesso desenhado.
- **Continuidade:** header vira vidro e encolhe ao rolar.
- **Easing:** `cubic-bezier(.16,1,.3,1)` para chegadas; sem bounce/elastic.

## Regras de implementação (Astro)

- Hand-rolled: CSS + IntersectionObserver + um listener de scroll passivo com rAF. **Sem GSAP/Motion/Lenis.**
- Gate `.js` no `<html>` (o site já usa `.js-ready`): sem JS tudo aparece. Fallback por timeout revela o
  que estiver na viewport.
- `prefers-reduced-motion`: sem transform/blur/clip; só fades curtos; aurora estática; linha do método
  cheia; faixa de luz e deriva desligadas.
- Só animar transform, opacity, filter, clip-path, stroke-dashoffset. Loops param fora da tela.
- Reaproveitar `src/scripts/reveal.ts`/`effects.ts` existentes como base; o cursor glow e o canvas de
  partículas da Fase 4 devem ser reavaliados (o canvas some no redesign; a aurora o substitui).

## CSS Patterns

```css
.w{display:inline-block;overflow:clip;overflow-clip-margin:.14em;vertical-align:top}
.js [data-r=words] .w > span{transform:translateY(105%);filter:blur(8px);opacity:0}
.js [data-r=words].in .w > span{transform:none;filter:blur(0);opacity:1;transition:transform .9s var(--ease-out),filter .9s var(--ease-out),opacity .6s var(--ease-out);transition-delay:calc(var(--d,0ms) + var(--i,0) * 55ms)}
.steps::before{transform:scaleX(var(--p,1));transform-origin:left}
.browser::after{background:linear-gradient(105deg,transparent 35%,rgba(127,216,255,.16) 48%,rgba(255,255,255,.08) 52%,transparent 65%);transform:translateX(-120%)}
.card.in .browser::after{animation:sweep 1.4s var(--ease-out) calc(var(--d,0ms) + 450ms) 1 both}
```

## What to Avoid

- **Modo cinemático / hero fixado com auroras cruzando em X** — testado e rejeitado pelo Felipe.
- Scroll-jacking de qualquer tipo; parallax; preloader/splash.
- A mesma fade-and-rise em todas as seções; glow pulsante decorativo.

## Origin

Synthesized from sketches: 001 (rodadas 3 e 4)
Source files available in: sources/001-aurora-landing/
