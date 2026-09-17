# Phase 4: Progressive-Enhancement Effects - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-17
**Phase:** 4-progressive-enhancement-effects
**Areas discussed:** Escopo do glow do cursor, Densidade das partículas, Canvas sob reduced-motion, Script único vs. por efeito

---

## Escopo do glow do cursor

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Glow acompanha o cursor pela página inteira ou fica restrito ao hero? | Página inteira (fiel ao design) | Círculo fixo ~640px, position:fixed, segue window.pointermove em qualquer seção; requer novo elemento global | ✓ |
| | Somente no hero | Reaproveita o .hero-glow existente, movendo-o só sobre a área do hero | |

**User's choice:** Página inteira (fiel ao design)
**Notes:** Nada disso existe ainda no HTML — a Fase 3 só criou um `.hero-glow` estático, decorativo, sem seguir o cursor.

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Glow global convive com .hero-glow estático, ou o substitui? | Conviver (manter ambos) | .hero-glow estático continua no hero; glow global fica por cima em toda a página, inclusive sobre o hero | ✓ |
| | Substituir (remover .hero-glow) | Glow global vira o único glow, remove o estático | |

**User's choice:** Conviver (manter ambos)

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Onde o elemento global de glow fica no markup? | BaseLayout (todo o site) | Aparece em toda página que usa o layout | ✓ |
| | Só na home | Só aparece na landing | |

**User's choice:** BaseLayout (todo o site)

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Como tratar mix-blend-mode:screen sobre seções claras? | Manter screen sempre | Fiel ao design, mesmo que fique sutil/lavado sobre fundo claro | ✓ |
| | Reduzir opacidade em seções claras | Ajuste extra por seção clara | |
| | Você decide (Claude) | Deixa como decisão técnica | |

**User's choice:** Manter screen sempre

---

## Densidade das partículas

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Quão vistoso o canvas em telas normais? | Mesma fórmula do design (recomendado) | min(90, max(28, área/11000)) pontos; só o DPR cai de 2 para ~1.5 | ✓ |
| | Reduzir também a contagem base | Diminui teto/piso de pontos além do DPR | |

**User's choice:** Mesma fórmula de contagem do design (recomendado)

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Critério de "poucos núcleos" para navigator.hardwareConcurrency? | ≤4 núcleos = reduzido (recomendado) | Limiar comum para dispositivo médio | ✓ |
| | ≤2 núcleos = reduzido | Mais conservador | |
| | Você decide (Claude) | Deixa a decisão técnica | |

**User's choice:** ≤4 núcleos = reduzido (recomendado)

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Quanto cortar no modo reduzido? | Pela metade (~50%) | Reduz a contagem calculada pela metade | ✓ |
| | Fixo e baixo (ex: 20 pontos) | Ignora a fórmula, usa número fixo | |
| | Você decide (Claude) | Deixa a decisão técnica | |

**User's choice:** Pela metade (~50%)

---

## Canvas sob reduced-motion

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Frame estático ou nada sob reduced-motion? | Frame estático (recomendado) | Desenha pontos uma vez, sem rAF | ✓ |
| | Nada (canvas vazio) | Não desenha nada | |

**User's choice:** Frame estático (recomendado)

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Glow global também desativado sob reduced-motion? | Desativado (não renderiza) | Não aparece, nem parado | ✓ |
| | Visível mas parado (posição fixa) | Fica visível num ponto fixo | |

**User's choice:** Desativado (não renderiza)

---

## Script único vs. por efeito

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Como tratar ANIM-04 "client:visible" sem framework de UI? | Um só script, canvas com IO próprio (recomendado) | Único módulo Astro bundlado; client:visible interpretado como comportamento (pausa/retoma via IO), não a diretiva literal | ✓ |
| | Canvas como ilha real separada | Introduz framework só para isso, contradiz CLAUDE.md | |

**User's choice:** Um só script, canvas com IO próprio (recomendado)

| Question | Option | Description | Selected |
|---|--------|-------------|----------|
| Onde vive o toggle .js-ready? | Script inline síncrono no `<head>` (recomendado) | Roda antes do primeiro paint, separado do módulo bundlado maior | ✓ |
| | Dentro do módulo bundlado único | Risco de flash se o módulo carregar depois do primeiro paint | |

**User's choice:** Script inline síncrono no `<head>` (recomendado)

---

## Claude's Discretion

- Exact glow circle sizing/blur/gradient stops beyond the ~640px design reference.
- Whether the bundled module script is a plain `<script>` module tag at the end of `<body>` or co-located with a component.
- Exact small-viewport breakpoint for the density-reduction trigger.
- Whether `navigator.connection` feature-detection is written defensively.
- Precise script lifecycle/timing details (no framework lifecycle exists here).

## Deferred Ideas

None — discussion stayed within phase scope.
