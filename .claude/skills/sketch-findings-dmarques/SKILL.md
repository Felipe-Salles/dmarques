---
name: sketch-findings-dmarques
description: Validated design decisions, CSS patterns, and visual direction ("Aurora técnica") from sketch experiments for the dmarques site. Auto-loaded during UI implementation on dmarques — especially the Aurora redesign phase.
---

<context>
## Project: dmarques

Landing page da Dmarques Soluções Web (agência de desenvolvimento web de Felipe Salles, Ibitinga · SP).
O visitante precisa ver os projetos, entender o método e pedir orçamento (formulário + WhatsApp).

Direção escolhida pelo Felipe: **Direção 6 — "Atmosfera / Aurora técnica"**. Um ambiente escuro com
profundidade e luz, como olhar para dentro de uma tela premium: aurora estática nas cores da logo nova,
um único ponto de calor por tela, vidro com granulação usado com parcimônia, projetos reais rodando em
molduras de navegador. Fuga deliberada do minimalismo, sem exagero: a riqueza vem de luz, profundidade
e prova de trabalho — não de decoração. Brief do cliente: elegante tech, premium, conceitual, **nada
genérico** (nem elementos, nem cores).

Referências: 6 propostas geradas com UI UX Pro Max (estilos Aurora UI + Bento Grid); paleta derivada da
logo nova (`src/assets/brand/`). Variante A ("Aurora central") venceu; polida com Impeccable
(critique 20/32 → polish) e animada com Impeccable animate.

Sketch sessions wrapped: 2026-10-15
</context>

<design_direction>
## Overall Direction

- **Palette:** fundo `#070A14`; aurora `#00C8FF → #3A5BFF → #0E1E5B`; ember `#FF6A3D` só como marcador
  de ação (1 por tela); texto `#F2F4F7` / muted `#9AA3B2` / faint `#828B9B`; bordas azuladas translúcidas.
- **Typography:** Sora (títulos, 600, tracking negativo) + Inter Tight (texto). Mono (JetBrains Mono)
  só para dados, números de etapa e URLs.
- **Layout:** hero centrado sob a aurora; serviços como lista tipográfica com intro fixa; bento de
  projetos honesto; método numa linha de luz; sobre com foto real colorida; contato com "o que acontece
  depois" + canais + formulário de vidro.
- **Motion:** tese "a aurora é a luz da página — ela acende e o conteúdo entra em foco conforme é
  iluminado". Hand-rolled (CSS + IntersectionObserver), sem bibliotecas, com fallback sem JS e
  reduced-motion.
- **Voz:** "nós" (agência), CTA único "Pedir orçamento", linguagem leiga, fatos verificáveis.
</design_direction>

<findings_index>
## Design Areas

| Area | Reference | Key Decision |
|------|-----------|--------------|
| Cor, luz e tipografia | references/cor-luz-tipografia.md | Aurora da logo como única fonte de luz; ember marca ação; Sora + Inter Tight |
| Layout e seções | references/layout-secoes.md | Sem template: cada seção com composição própria; bento honesto; sem eyebrows |
| Movimento | references/movimento.md | "A luz acende": hero acende, reveal em foco distinto por seção, método guiado pela rolagem |
| Conteúdo, voz e formulário | references/conteudo-voz-formulario.md | "nós", CTA único, prova verificável, form acessível com estados completos |

## Theme

The winning theme file is at `sources/themes/default.css` (`noite.css` = variação com aurora contida, não escolhida).

## Source Files

Original sketch HTML (com as 3 variantes; A é a vencedora e default) em `sources/001-aurora-landing/index.html`,
histórico de rodadas em `sources/001-aurora-landing/README.md`. Os caminhos `../../../src/assets/...` do
sketch apontam para os assets reais do repositório.
</findings_index>

<metadata>
## Processed Sketches

- 001-aurora-landing
</metadata>
