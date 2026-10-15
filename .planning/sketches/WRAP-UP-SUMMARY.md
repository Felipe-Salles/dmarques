# Sketch Wrap-Up Summary

**Date:** 2026-10-15
**Sketches processed:** 1
**Design areas:** Cor, luz e tipografia · Layout e seções · Movimento · Conteúdo, voz e formulário
**Skill output:** `./.claude/skills/sketch-findings-dmarques/`

## Included Sketches
| # | Name | Winner | Design Area |
|---|------|--------|-------------|
| 001 | aurora-landing | A — Aurora central (polida, rodada 3 de movimento) | todas as 4 áreas |

## Excluded Sketches
| # | Name | Reason |
|---|------|--------|
| 001-B | Split com navegador | Variante não escolhida (fica só como alternativa descartada) |
| 001-C | Imersiva | Variante não escolhida |
| 001 r4 | Modo cinemático (hero fixado, auroras em X) | Testado e rejeitado pelo Felipe; revertido |

## Design Direction
"Aurora técnica": ambiente escuro com profundidade e luz. A aurora nas cores da logo nova é a única
fonte de luz da página — acende no hero e no contato; ember laranja marca apenas ações; Sora + Inter
Tight; seções com composição própria (sem eyebrows, sem faixa de métricas, sem cards iguais); prova de
trabalho honesta; voz "nós"; movimento "a luz acende, o conteúdo entra em foco".

## Key Decisions
- **Palette:** #070A14 · aurora #00C8FF → #3A5BFF → #0E1E5B · ember #FF6A3D (1 por tela, só ação) ·
  texto #F2F4F7 / #9AA3B2 / #828B9B (AA) · bordas azuladas translúcidas; violeta #6C4CFF sai.
- **Typography:** Sora 600 (títulos, tracking negativo, balance) + Inter Tight (texto); mono só para dados/URLs.
- **Layout:** header sticky que vira vidro; hero centrado + linha de prova verificável; serviços em lista
  tipográfica; bento 6 colunas com 1 case real + exemplos de escopo + card-convite; método numa linha de
  luz; sobre com foto real colorida; contato com "o que acontece depois", canais e formulário de vidro;
  WhatsApp flutuante no mobile.
- **Interaction/motion:** aurora acende + título palavra a palavra em foco; reveals distintos por seção;
  linha do método guiada pela rolagem; foto por clip-path; sites nos mocks rodam só quando visíveis;
  hand-rolled, sem lib, fallback sem JS, reduced-motion; sem scroll-jacking/hero fixado.
- **Content:** "nós", CTA único "Pedir orçamento", linguagem leiga, só claims já publicados;
  contato@agenciadmarques.com.br, @agenciadmarques, (16) 99611-1785.
- **Form:** labels visíveis, chips sem pré-seleção, aria-invalid/describedby, aria-live, estados
  idle/enviando/sucesso completos, aviso LGPD junto ao botão.

## Next
Fase 04.1 "Redesign Aurora técnica" inserida no ROADMAP antes da Fase 5 → `/gsd-plan-phase 04.1`.
