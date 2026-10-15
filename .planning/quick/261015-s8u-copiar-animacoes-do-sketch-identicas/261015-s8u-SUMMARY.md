---
status: complete
phase: quick-261015-s8u
plan: 01
commits: [23623b2, bd9914f, parity-script]
---

# Quick 261015-s8u: animações do sketch copiadas de forma idêntica

Aurora de 3 pontos (0 / +2.5%,-1.5% / -2%,+1%), transitions .lit/.in e tempos/atrasos/deslocamentos do sketch reproduzidos no site, com prova numérica por Playwright.

## Commits
- 23623b2 aurora e entrada do hero (hero.ts, Aurora.astro, HeroBleed.astro, motion.css, effects.ts)
- bd9914f reveal, etapas e seções (reveal.ts, tilt.ts, scroll.ts, steps.pure.ts + testes, Services/Projects/Process/About/Contact)
- commit do parity.mjs (versionado conforme o plano)

## Paridade (parity.mjs, sai 0)
Aurora do hero, site × sketch (translate px):
| t | site | sketch |
|---|------|--------|
| 3 s | 0.0, -0.0 | 0.0, -0.0 |
| 12 s | 40.8, -16.2 | 40.3, -16.0 |
| 26 s | -32.1, 10.6 | -32.7, 10.8 |

Todas as ~50 comparações de transition/animation (duration, delay, easing) deram OK: palavras, lead, CTAs, proof (li e linha), aurora hero (transition + drift 22s/2.4s/alternate), serviços (h3/p/linha/ícone), cards, sweep, scroller, knot, step div, retrato/img/figcaption, diffs, next, channel, form, aurora do contato. Reduce: aurora sem animação, contato scaleY(-1), nada com opacity<1 ou filter.

Equivalências documentadas (previstas no plano): `translate` no lugar de `transform` em h3/p dos serviços; `color` no lugar de `opacity` no Método (decisão 04.1).

## Gates
- pnpm build, test (17 passam), check, verify:gates (13/13), verify:browser (10/10): verdes
- js-weight-check: 3085 B gzip (orçamento 20480 B)
- pnpm lint: 7 errors / 3 warnings (igual ao baseline)
- Sem `style=""` novo, sem comentários

## Lighthouse mobile (lhci collect, servidor estático local, 3 execuções, throttling simulado do lighthouserc)
| | Perf | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| antes (b2bd9c9) | 84-85 | 100 | 79 | 100 | ~3.65 s | 0 | 0 |
| depois | 86 | 100 | 79 | 100 | ~3.56 s | 0 | 0 |

**Performance está abaixo de 95 (86) e LCP acima de 2.5 s, tanto antes quanto depois.** A mudança não piorou (levemente melhor). Esta medição é num servidor estático local sem cabeçalhos/compressão da Vercel (Best Practices 79 também vem do ambiente), então não é comparável ao gate de CI na Vercel; vale reconferir contra o deploy de preview.

## Decisões
- `photoIO` observa o próprio `.about-media` (pai do `.portrait`), equivalente ao `el.parentElement` do sketch.
- Delays dos cards por classes `.d110/.d220`; `.svc` revela individualmente (`data-r="svc"` no li, `line` no ul).

## Desvios
Nenhum relevante. Prettier tocou SiteFooter/SiteHeader/Words; revertidos, fora do escopo.

## Self-Check: PASSED
