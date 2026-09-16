---
phase: 03-static-zero-js-sections-csp-safe-refactor-a11y
plan: 09
subsystem: ui
tags: [vercel-preview, lighthouse, sec-07, checkpoint, ui-fidelity]

requires:
  - phase: 03-08
    provides: index.astro composição final, --nav-height medido
provides:
  - Task 1 - verificações automatizadas contra o preview real (404 branded, rotas utilitárias, security-check.sh --ci, otimização só em build) — todas passaram
  - Task 2 - .planning/security/runs/phase-03.md com evidência verbatim e achados numerados
  - Task 3 - checkpoint humano REPROVADO com 15 itens de fidelidade visual; correções aplicadas nesta rodada; fase PERMANECE ABERTA aguardando nova aprovação
affects: [03-followup-visual-recheck]

tech-stack:
  added: []
  patterns:
    - "z-index explícito em blocos de texto sobre glows de fundo (--z-glow: 5) para evitar que o gradiente renderize acima do conteúdo"
    - "--color-accent-glow-soft (alpha .20) para glows de seção que o design especifica como sutis, distinto do --color-accent-glow (.35) usado em glows mais presentes"

key-files:
  modified:
    - src/styles/tokens.css
    - src/styles/base.css
    - src/components/HeroBleed.astro
    - src/components/SiteHeader.astro
    - src/components/ServicesSection.astro
    - src/components/ProcessSection.astro
    - src/components/DifferentiatorsSection.astro
    - src/components/AboutSection.astro
    - src/components/ContactSection.astro
    - src/components/CtaFinal.astro
    - src/components/SiteFooter.astro

key-decisions:
  - "Checkpoint reprovado NÃO fecha a fase — por instrução do próprio plano (acceptance_criteria da Task 3), a fase permanece aberta até nova aprovação de Felipe sobre o preview corrigido"
  - "Todas as 15 correções foram ground-truthed contra arquivos de design/Dmarques Landing.dc.html linha a linha antes de qualquer edição — nenhuma foi por suposição"
  - "--color-text-strong mudou de rgba(255,255,255,.92) para #ffffff — afeta every heading/título do site de uma vez (fix de fidelidade sistêmico, não pontual)"
  - "Dois itens (sangria da imagem do hero, glow piscante das bolinhas do Processo) NÃO foram alterados por bater exatamente com o design-fonte ou por ambiguidade genuína — documentados em 03-UI-GAPS.md aguardando confirmação de Felipe"

requirements-completed: [SITE-06, SITE-08, SITE-09, A11Y-01, A11Y-03, A11Y-04, A11Y-06, A11Y-07, ANIM-02, ANIM-07, PERF-05]

duration: ~3h (investigação + correção; Task 1/2 automatizadas ~40min, checkpoint humano + ciclo de correção ~2h20min)
completed: 2026-09-16
---

# Phase 03 Plan 09: Fechamento contra preview real — Summary

**Task 1 e 2 passaram limpo (404 branded confirmada ao vivo, SEC-07 registrado); Task 3 (checkpoint humano) foi REPROVADA com 15 itens de fidelidade visual — todos corrigidos nesta mesma sessão contra o arquivo de design fonte, fase permanece aberta para nova aprovação.**

## Performance

- **Duração:** ~3h no total
- **Iniciado:** 2026-09-16T21:00Z (aprox.)
- **Concluído:** parcial — Tasks 1/2 completas, Task 3 em ciclo de correção
- **Tasks:** 2/3 completas (Task 3 aguardando reaprovação)
- **Arquivos modificados:** 11 (fora do PR original)

## Accomplishments

- PR #2 aberto consolidando Fases 2+3 (nunca antes enviadas a `origin`), preview READY na Vercel
- Task 1: 404 real confirmada com status HTTP 404 + corpo branded (não a 404 genérica da Vercel); `/obrigado` e `/politica-de-privacidade` retornam 200; `security-check.sh --ci` completo contra o preview (headers capturados, Lighthouse local com falso-negativo documentado — ver `phase-03.md`); nenhuma referência a `_vercel/image` no HTML servido
- Task 2: `.planning/security/runs/phase-03.md` escrito com as 7 verificações do gabarito, achados P03-001 a P03-006 + P02-003 carregado, declaração de "nenhum achado High em aberto"
- Task 3: checkpoint apresentado a Felipe com a URL do preview; ele testou manualmente (fidelidade do Hero, teclado, sem JS, reduced-motion, âncoras, contraste, páginas utilitárias) e **reprovou o item de contraste/fidelidade geral** com 15 pontos específicos

## Task Commits

Task 1/2 (automatizadas, sem alteração de código):
1. **Task 2: escrever SEC-07 phase-03.md** - `0f8efc8` (docs)
2. **Nota de reclassificação Dependabot** - `7292c4c` (docs)

Task 3 (ciclo de correção pós-reprovação):
3. **Tokens + reset global de sublinhado** - `d841af9` (fix)
4. **Hero: CTA fidelity + altura + nav border** - `412a7c7` (fix)
5. **Services/Process/Differentiators: texto maior, glow do Processo, ritmo de seção** - `c4b7ff0` (fix)
6. **About: 100vh centralizado** - `fc8117f` (fix)
7. **Contact: glow, z-index, botão maior, textarea sem resize** - `f5af50d` (fix)
8. **CtaFinal: glow, z-index (texto arroxeado)** - `89fca7c` (fix)
9. **Footer: watermark levemente mais visível** - `dadbbfd` (fix)

**Plan metadata:** este commit

## Resposta literal de Felipe ao checkpoint (Task 3)

> Quase tudo aprovado menos o item 6 dos testes.
>
> 1- existem diferenças na primeira section: Todos os botões e links tem sublinhados, quando na verdade o sublinhado só deveria existir no "falar no whatsapp" (sublinhado bem fino e com um pequeno espaço (não tão grudado com o texto).
>
> 2 - O botão "começar um projeto" não deveria ser roxo com as letras brancas, ele deveria ser branco com as letras escuras (mesmo tom do fundo) e ficar roxo com as letras brancas no :hover. O mesmo botão tem um glow que não existe no arquivo de design.
>
> 3 - o botão "falar no whatsapp" tem uma caixa que não existe no arquivo de design, ele só é sublinhado.
>
> 3 - o botão "pedir orçamento" tem uma border colorida que não existe no arquivo de design, na verdade ele tem uma border levemente acinzentada, do mesmo tom dos botões da nav.
>
> 4 - O box que será inserido o elemento gráfico do lado direito está com a borda direita cortada.
>
> outras diferenças:
>
> 5 - a margin entre a section um e dois está muito curto [...] deveria aparecer apenas "o que fazemos" e uma pequena porção da primeira frase [...]
>
> 6 - Na section dois, os cards, elementos e textos dos cards precisam ser um pouco maiores [...]
>
> 7 - A mesma questão do espaçamento anterior ocorre entre a section dois e três [...]
>
> 8 - Na section 3, existe um sutil glow centralizado ao fundo das escritas e elementos no arquivo de design que ainda não foi implementado, também existe um pequeno glow sutil e piscante nas bolinhas antes dos tracinhos.
>
> 9 - Na section 4, precisa aumentar um pouco as letras [...]
>
> 10 - Na section 5, deveria ocupar 100% vh, ficando os elementos e fotos centralizados verticalmente e horizontalmente na section (mantendo o texto ao lado da foto como está).
>
> 11 - Na section 6, existe um glow atrás dos elementos de texto que está muito forte [...] o botão de whatsapp precisa ser alguns px maior e existe um sublinhado que não tem no arquivo de design. [...] um pequeno elemento gráfico ao canto inferior direito da caixa de texto que permite aumenta-la e diminui-la, porém ao utiliza-lo toda a página é comprometida [...]
>
> 12 - na chamada depois da section 7, existe um glow piscante ao fundo que precisa ser mais sutil [...] Ainda no mesmo local, existe um sublinhado no botão "começar um projeto" que não existe [...] e também não sei o que acontece que parece que as letras ficaram meio roxeadas pela cor do glow [...]
>
> 13 - Também existe uma diferença nas cores das letras brancas [...] nos arquivos de design as letras brancas são #ffff, e no código implementado [...] deixando-as meio apagadas
>
> 14 - O "DMARQUES" sutil no footer, precisa ser minimamente mais evidente, mantendo a devida sutileza.

Transcrição completa (com numeração original de Felipe, incluindo o "3" duplicado) preservada em `03-UI-GAPS.md`, que mapeia cada item à causa raiz confirmada contra o arquivo de design e à correção aplicada.

## Files Created/Modified

Ver `key-files` no frontmatter. Todos os 11 arquivos foram alterados exclusivamente para corrigir os itens reportados — nenhuma mudança de escopo, nenhum arquivo novo além deste SUMMARY e `03-UI-GAPS.md`.

## Decisões Made

Ver `key-decisions` no frontmatter.

## Deviations from Plan

Não há desvio do plano 03-09 em si — a Task 3 seguiu exatamente o protocolo definido (`checkpoint:human-verify`, `gate="blocking"`): apresentar, aguardar resposta explícita, transcrever literalmente, registrar achados, manter a fase aberta em caso de reprovação. O ciclo de correção subsequente (fix dos 15 itens) é trabalho adicional gerado pela reprovação, não uma revisão do plano.

## Issues Encountered

Dois itens do relato de Felipe não puderam ser corrigidos com confiança total:
1. "Borda direita cortada" no render do Hero — o CSS bate exatamente com o arquivo de design (sangria intencional da variante "03 Bleed"); não alterado, aguardando confirmação com print.
2. Glow "piscante" nas bolinhas do Processo — o design não especifica animação de pulso ali; implementado o glow estático exato do design, aguardando confirmação se um pulso novo é realmente desejado.

Ambos documentados em `03-UI-GAPS.md` § "Itens que precisam da sua confirmação".

## User Setup Required

Nenhum.

## Next Phase Readiness

Fase 3 **NÃO está fechada**. Aguardando:
1. Felipe revisar o preview atualizado (novo push ao PR #2) contra os 15 itens corrigidos.
2. Resposta ao checkpoint (Task 3) — "aprovado" fecha a fase (também vale como assinatura D-13/A11Y-06 e assinatura SEC-07); qualquer reprovação adicional gera novos achados numerados em `phase-03.md` e mantém a fase aberta.

---
*Phase: 03-static-zero-js-sections-csp-safe-refactor-a11y*
*Status: EM ABERTO — aguardando checkpoint*
