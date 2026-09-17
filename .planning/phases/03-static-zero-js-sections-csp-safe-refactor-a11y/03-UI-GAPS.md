# Fase 3 — Gaps de fidelidade visual (checkpoint 03-09 Task 3)

**Origem:** reprovação do checkpoint humano (Task 3 de `03-09-PLAN.md`) contra o preview
`https://dmarques-git-phases-02-03-content-8d3beb-felipe-salles-projects.vercel.app` (PR #2).
**Data:** 2026-09-16.
**Metodologia:** cada item foi confirmado contra `arquivos de design/Dmarques Landing.dc.html`
(variante "03 Bleed", linhas 147-473) e contra o código real dos componentes antes de qualquer
correção — nenhuma correção foi feita por suposição.

## Itens corrigidos nesta rodada

| # | Seção | Relato do Felipe | Causa raiz confirmada | Correção | Commit |
|---|-------|-------------------|------------------------|----------|--------|
| 1 | Hero | Todos os botões/links sublinhados; só "Falar no WhatsApp" deveria ter | `base.css` nunca resetava `text-decoration` em `<a>` — todo link herdava o sublinhado padrão do navegador | `a { text-decoration: none }` global em `base.css` | `d841af9` |
| 2 | Hero | "Começar um projeto" deveria ser branco/texto escuro em repouso e roxo/branco no hover; tinha um glow que não existe no design | `.cta-primary` tinha as cores invertidas (`background: var(--color-accent)` em repouso) e `box-shadow: var(--shadow-accent)` sempre ativo — design da variante "03 Bleed" não tem nenhum box-shadow nesse botão | Cores trocadas (branco/`--color-bg` em repouso, `--color-accent`/branco no hover); `box-shadow` removido | `412a7c7` |
| 3 | Hero | "Falar no WhatsApp" tinha uma caixa que não existe no design; deveria ser só sublinhado | `.cta-secondary` usava `border` (todos os lados) + `background: transparent`, criando uma caixa vazia | Trocado por `border-bottom` + `padding-bottom: 4px` (sublinhado fino com respiro), igual ao design | `412a7c7` |
| 4 | Header/Nav | "Pedir orçamento" com borda colorida; deveria ser acinzentada, tom dos botões da nav | `.cta-pill` usava `border-color: var(--color-accent-border)` (roxo) em vez do neutro usado nos outros botões secundários | Trocado para `var(--color-border-strong)` | `412a7c7` |
| 5 | Hero → Serviços | Ao carregar a página já dá para ler o H2 de Serviços; deveria aparecer só "O que fazemos" e uma lasca da primeira frase | Hero não tinha altura mínima — ocupava só o espaço do seu próprio conteúdo, empurrando pouco a seção seguinte | `.hero-bleed` ganhou `min-height: calc(100svh - var(--nav-height))` + centralização vertical | `412a7c7` |
| 6 | Serviços | Cards com texto pequeno demais | Título/descrição usavam `--text-lg`(18px)/`--text-sm`(14px), abaixo do que você pediu | Subidos para `--text-xl`(22px)/`--text-base`(16px) | `c4b7ff0` |
| 7 | Serviços → Processo | Espaço entre as seções muito curto | Nenhum espaçamento extra entre as duas, só o padding padrão de seção | `margin-top: var(--space-12)` (48px) adicionado em `.process` | `c4b7ff0` |
| 8 | Processo | Glow sutil centralizado atrás do texto não implementado; glow das bolinhas parecia errado | Nenhum `div` de glow de fundo existia na seção (design tem um radial-gradient cobrindo toda a seção); o glow da bolinha usava `--shadow-accent` (sombra de botão, deslocada 12px, blur 40px) em vez de um glow centrado apertado | Adicionado `.process-glow` (radial-gradient igual ao design) + novo token `--shadow-dot-glow: 0 0 18px rgba(108,76,255,.9)` aplicado à bolinha | `c4b7ff0` |
| 9 | Diferenciais | Texto dos cards pequeno demais | Mesmo padrão do item 6 (`--text-lg`/`--text-sm`) | Subidos para `--text-xl`/`--text-base` | `c4b7ff0` |
| 10 | Sobre | Deveria ocupar 100% da viewport, conteúdo centralizado vertical e horizontalmente (mantendo texto ao lado da foto) | Seção só tinha o padding padrão, sem altura mínima | `.about` ganhou `min-height: 100svh` + centralização vertical; grid interno mantido como estava | `fc8117f` |
| 11 | Contato | Glow atrás do texto muito forte | `.contact-glow` usava `--color-accent-glow` (alpha .35); design usa .20 | Novo token `--color-accent-glow-soft` (alpha .20) aplicado | `f5af50d` |
| 12 | Contato | Botão do WhatsApp precisa ser um pouco maior; tinha sublinhado que não deveria | Padding/fonte um pouco abaixo do desejado; sublinhado = mesmo bug global do item 1 | Padding/fonte aumentados (`--space-5 --space-8` / `--text-base`); sublinhado resolvido pelo reset global | `f5af50d` |
| 13 | Contato | Redimensionar a caixa de mensagem quebra a página inteira | `textarea { resize: vertical }` permitia arrastar a alça de redimensionamento sem nenhuma contenção de largura no formulário, esticando o layout | `resize: none` — a alça de redimensionar foi removida | `f5af50d` |
| 14 | CTA final | Glow piscante muito forte, corte perceptível nas bordas da seção | `.cta-final-glow` usava `--color-accent-glow-strong` (alpha .55); design usa .26 — opacidade alta demais faz o gradiente ainda estar bem visível quando é cortado pela borda da seção | Trocado para `--color-accent-glow-soft` (alpha .20) — a cauda do gradiente já está bem próxima de transparente antes de atingir a borda | `89fca7c` |
| 15 | CTA final | Texto parecia "arroxeado", como se o glow estivesse por cima | `.cta-final-block` não tinha `z-index` (fica em `auto`/0), enquanto `.cta-final-glow` tinha `z-index: var(--z-glow)` (5) — o glow renderizava ACIMA do texto, tingindo-o. Mesmo bug latente corrigido preventivamente em `.contact-inner`/`.process-inner`, que tinham a mesma estrutura embora não citados no relato | `z-index: 6` adicionado ao bloco de texto (acima do `--z-glow: 5`) nas três seções | `89fca7c` / `c4b7ff0` / `f5af50d` |
| 16 | Rodapé | "DMARQUES" muito sutil, precisa de um pouco mais de presença mantendo a sutileza | `--color-surface` (alpha .045) era exatamente o valor do design, mas você pediu mais presença que o próprio design | Opacidade pontual subida para `.065` (só neste elemento, token global não tocado) | `dadbbfd` |
| — | Global | Letras brancas "meio apagadas" em vez de brancas puras | `--color-text-strong` (usado em todo H1/H2/H3/card-title/wordmark) valia `rgba(255,255,255,.92)`; o design usa `#fff` puro para esses papéis em todas as seções | Token alterado para `#ffffff` — corrige automaticamente todos os headings/títulos do site de uma vez | `d841af9` |

## Itens que precisam da sua confirmação (não corrigidos por incerteza genuína)

### Item "borda direita cortada" no render do Hero

Comparei `.hero-render` pixel a pixel contra o design (`top/bottom/left` em `clamp()`, `right:0`,
`border-radius: 24px 0 0 24px`, `border-right: 0`) — o código bate exatamente com o arquivo de
design. Essa é a sangria intencional ("03 Bleed"): a imagem propositalmente não tem borda/moldura
do lado direito, para parecer que continua além do quadro. Pode ser que o que você viu seja esse
efeito pretendido, ou pode ser algo específico do placeholder vetorial (que não tem o mesmo
tratamento visual de um render real bleeding). **Não alterei nada aqui** — se depois de ver a nova
build isso ainda parecer errado, me manda um print apontando exatamente onde.

### Glow "piscante" nas bolinhas do Processo

Implementei o glow das bolinhas exatamente como está no arquivo de design — um glow fixo (não
pulsante) de `0 0 18px rgba(108,76,255,.9)`. O arquivo de design não tem nenhuma animação de pulso
nessas bolinhas especificamente (só o glow de fundo do CTA final pulsa, via `dmPulse`). Se você
realmente quer que as bolinhas pulsem, é uma adição nova além do design-fonte — me confirma antes
de eu adicionar uma animação (precisa respeitar o orçamento do ANIM-07 e o guard de
`prefers-reduced-motion`).

## Retrabalho pós-primeira-rodada

| # | Seção | Relato do Felipe | Causa raiz confirmada | Correção | Commit |
|---|-------|-------------------|------------------------|----------|--------|
| 17 | Hero → Serviços | 100vh criou espaço vazio demais acima e abaixo do conteúdo do Hero; a fatia da Seção 2 nem aparecia | `min-height: calc(100svh - var(--nav-height))` + `display:flex;align-items:center` centralizava o conteúdo, criando gaps simétricos e, em telas comuns, cobrindo o viewport inteiro | Removida a centralização forçada; depois de confirmar por medição real (CDP/Chrome headless) que `min-height` não tinha nenhum efeito (altura real do Hero é ditada pela coluna da imagem, 560px fixo, não pelo min-height), reduzido `padding-block-start` do grid de `clamp(2.75rem,6vw,5rem)` para `clamp(1.5rem,3vw,2.75rem)` — essa é a alavanca que realmente controla a altura visível | `7a00aa6`, `0f7ad27`, `e0b5f01` |
| 18 | Processo | Glow ainda muito forte, corte perceptível | `--color-accent-glow` (alpha .35) usado por engano; design usa .16, não .20 (o valor que eu tinha usado para Contato/CTA final) | Novo token `--color-accent-glow-faint` (alpha .16) exato do design, aplicado só no Processo | `7a00aa6` |
| 19 | Diferenciais | Parágrafo de intro ficou minúsculo comparado às descrições dos cards | Efeito colateral do item 9 desta mesma rodada de correção: aumentei `.differentiators-tile p` para `--text-base` mas esqueci `.differentiators-intro p`, que ficou em `--text-sm` | `.differentiators-intro p` também subido para `--text-base` | `7a00aa6` |

**Nota de processo:** a partir do item 17, montei uma verificação visual real (Chrome headless
via CDP, sem dependência nova no projeto — só uma ferramenta de sessão) para medir posições
exatas em pixel em vez de calibrar por estimativa. Isso evitou pelo menos uma terceira rodada
de tentativa-e-erro no ajuste do Hero.

## Requisitos afetados (referência, não uma nova cobertura de requisitos — apenas correções pontuais dentro de A11Y-06/SITE-02/ANIM-07 já cobertos por 03-01..03-08)

Nenhum requisito novo. Este documento existe para rastreabilidade do ciclo de correção pós-checkpoint,
não para redefinir escopo da fase.
