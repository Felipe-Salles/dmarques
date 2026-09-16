# Phase 3: Static Zero-JS Sections + CSP-safe Refactor + A11y - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-15
**Phase:** 3-static-zero-js-sections-csp-safe-refactor-a11y
**Areas discussed:** Imagens ausentes (render 3D + retrato), Nav mobile, Escopo do formulário nesta fase, Contraste do texto translúcido

---

## Imagens ausentes (render 3D + retrato)

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder de marca | Mesmo padrão da Fase 2 (cover do case): imagem vetorial de marca via Sharp, processada por astro:assets, dimensões reais e AVIF/WebP | ✓ |
| Bloquear a fase até ter as imagens reais | Fase 3 pausada em checkpoint humano até Felipe fornecer os arquivos reais | |
| CSS-only para o hero, retrato com placeholder | Painel do hero vira efeito puramente CSS/gradiente, sem depender de arquivo de imagem | |

**User's choice:** Placeholder de marca (recomendado)

| Option | Description | Selected |
|--------|-------------|----------|
| Alt real desde já | Usar o texto final do alt agora, evita esquecer de atualizar depois | ✓ |
| Alt vazio até ter a foto real | Marca a imagem como puramente decorativa enquanto for placeholder | |

**User's choice:** Alt real desde já

| Option | Description | Selected |
|--------|-------------|----------|
| Mesma proporção/sangria do design | Evita CLS e retrabalho de layout quando a arte real substituir o placeholder | ✓ |
| Placeholder mais simples, ajustar depois | Mais rápido agora, risco de mudar dimensões/CLS depois | |

**User's choice:** Mesma proporção/sangria do design

**Notes:** Nenhuma imagem real (render 3D nem retrato) existe hoje no repositório; reutiliza o padrão de placeholder de marca já usado no cover do case da Fase 2.

---

## Nav mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Disclosure `<details>`/`<summary>` | Nativo do HTML, zero JS, sempre acessível por teclado, sem risco de focus trap | ✓ |
| Linha rolável (scroll horizontal) | Mesmos links do desktop em barra com overflow-x:auto | |
| Flex-wrap simples (como o design) | Links quebram linha naturalmente, sem padrão de menu | |

**User's choice:** Disclosure `<details>`/`<summary>`

| Option | Description | Selected |
|--------|-------------|----------|
| CTA sempre visível fora do menu | Botão de ação principal acessível sem abrir o `<details>` | ✓ |
| CTA dentro do `<details>` com os outros links | Todos os itens agrupados dentro do menu recolhido | |

**User's choice:** CTA sempre visível fora do menu

| Option | Description | Selected |
|--------|-------------|----------|
| Ícone + aria-label | Ícone hamburguer com aria-label="Menu", combina com estética minimalista | ✓ |
| Texto "Menu" visível | Label textual explícito | |

**User's choice:** Ícone + aria-label

**Notes:** Fecha a decisão em aberto já registrada em STATE.md ("mobile nav pattern... once nav item count is final").

---

## Escopo do formulário nesta fase

| Option | Description | Selected |
|--------|-------------|----------|
| 5 campos completos já na Fase 3 | label/id/name reais para Nome, WhatsApp, E-mail, Tipo de projeto e Mensagem | ✓ |
| Só os 3 campos do design agora | Fiel ao design; E-mail e Mensagem entram na Fase 5 | |

**User's choice:** 5 campos completos já na Fase 3

| Option | Description | Selected |
|--------|-------------|----------|
| Nenhum required isolado + nota de texto | Nome e Tipo de projeto `required`; WhatsApp/E-mail sem `required`, nota visual avisando a regra | ✓ |
| Marcar os dois como required no HTML | Contradiz a regra "pelo menos um" | |

**User's choice:** Nenhum required isolado + nota de texto

**Notes:** Texto do botão de submit fixado como "Enviar pedido de orçamento" (estado idle do design) por decisão direta — não havia uma segunda alternativa real a apresentar, já que a troca dinâmica de label é comportamento de Fase 5. Nenhum `action`/`method` é adicionado ao `<form>` nesta fase. `/politica-de-privacidade` ganha apenas o shell da página (rota reservada), corpo LGPD é Fase 5.

---

## Contraste do texto translúcido

| Option | Description | Selected |
|--------|-------------|----------|
| Recalcular opacidades mínimas por AA e aplicar direto | Claude calcula e ajusta os tokens de cor para bater 4.5:1/3:1, sem tabela de aprovação item-a-item | ✓ |
| Claude propõe uma tabela de antes/depois para eu aprovar | Checkpoint humano com tabela completa antes de aplicar | |

**User's choice:** Recalcular opacidades mínimas por AA e aplicar direto

| Option | Description | Selected |
|--------|-------------|----------|
| Clarear só onde necessário, mantendo a marca | Usar --color-accent-light (#9A85FF) ou tom intermediário calculado nos poucos casos que falharem | ✓ |
| Não mexer na cor do acento, só no branco translúcido | Aceita risco de #6C4CFF ficar abaixo de AA em destaques pontuais | |

**User's choice:** Clarear só onde necessário, mantendo a marca

**Notes:** Felipe dispensou explicitamente a aprovação item-a-item que a redação literal de A11Y-06 ("com aprovação de design") sugeriria — o sign-off acontece revisando o resultado publicado, não uma planilha prévia.

---

## Claude's Discretion

- Valores exatos de opacidade/hex recalculados para cada token `--color-text*`/`--color-accent*` afetado.
- Estilo visual exato do painel `<details>` mobile (dropdown full-width vs. lista inline expansível) e sua transição (transform/opacity, ≤300ms, respeitando reduced-motion).
- Redação exata da nota "pelo menos um" (WhatsApp ou e-mail) e do texto placeholder do shell de `/politica-de-privacidade`.
- Direção de arte exata dos placeholders (render hero e retrato) — seguindo o precedente do cover de case da Fase 2.
- Organização do CSS de keyframes/transições entre blocos `<style>` de componentes vs. estilos de seção compartilhados.
- Estrutura exata de níveis de heading abaixo do `<h1>`.

## Deferred Ideas

- Render 3D e fotografia real do fundador — substituem os placeholders da Fase 3 quando Felipe fornecer os arquivos.
- Planilha de aprovação de contraste item-a-item — considerada, dispensada por Felipe em favor da revisão do resultado final.
- Conteúdo completo da Política de Privacidade — pertence à Fase 5 (LGPD-01..07); Fase 3 só reserva a rota.
