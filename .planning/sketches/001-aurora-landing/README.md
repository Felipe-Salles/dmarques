---
sketch: 001
name: aurora-landing
question: "Como a direção 6 (Atmosfera / Aurora técnica) fica aplicada à landing inteira da dmarques — e qual composição de hero e de projetos funciona melhor?"
winner: "A"
tags: [landing, aurora, hero, bento, contato, direcao-6]
---

# Sketch 001: Aurora técnica — landing completa

## Design Question
A direção 6 escolhida por Felipe (fundo #070A14, aurora estática ciano→azul→índigo da logo,
ponto de calor #FF6A3D, vidro com granulação, bento com sites rodando em moldura de navegador,
Sora + Inter Tight) sustenta o site inteiro com sensação premium? Qual composição de hero e de
grid de projetos funciona melhor?

## How to View
start .planning/sketches/001-aurora-landing/index.html

Toolbar (canto inferior direito): tema Aurora / Noite (aurora contida) e larguras Phone / Tablet / Desktop
(o layout responde de verdade via container queries).

## Variants
- **A: Aurora central** — hero centrado sob a aurora, métricas logo abaixo, bento 6 colunas clássico.
- **B: Split com navegador** — texto à esquerda, site rodando num navegador à direita; bento com case próprio alto em destaque.
- **C: Imersiva** — headline gigante, aurora ampla, painel de vidro com o "padrão de entrega"; projetos em trilho horizontal com snap.

Comum às três: serviços em grade com linhas de 1px, método numa linha de luz ciano→azul,
sobre com diferenciais, contato com canais (WhatsApp/e-mail) + formulário de vidro funcional
(validação, máscara de WhatsApp, chips de tipo de projeto, loading e sucesso), footer.

## What to Look For
- A aurora transmite "premium tech" ou parece efeito? Compare com o tema Noite.
- O ponto de calor laranja (selo "Agenda aberta", tag "Projeto próprio") é um acento bom ou destoa?
- Os sites rodando dentro das molduras dão prova de trabalho melhor que imagens estáticas?
- Inclinação leve no hover dos cards (desktop): agrega ou distrai?
- No Phone: hero, bento e formulário continuam claros?

## Notas
- Só existe 1 case real (o site da dmarques); os outros 3 são **exemplos** rotulados como tal.
- Foto do fundador e capa são placeholders; a capa do case foi trocada por um mock em CSS nas cores da direção.
- Ajustes do hook de design: texto em gradiente → cor sólida, glows coloridos removidos, sombra neutra,
  contraste do texto fraco elevado para AA, pulso decorativo do selo removido.

## Rodada 2 — polish Impeccable na variante A (vencedora)

Crítica Impeccable (dual-agent): 20/32. Decisões do Felipe: atacar primeiro a cara de template,
manter só a aurora (sem motivo de costura), voz "nós" (agência), escopo completo.

- Template removido: sem eyebrows acima dos títulos, sem faixa de métricas no hero (virou linha de
  prova verificável com link para o PageSpeed), serviços como lista tipográfica com intro fixa,
  cabeçalhos de seção com composição própria, mono só para dados/URLs.
- Laranja (ember) passou a marcar ação: seta do CTA do hero, card "O próximo pode ser o seu",
  etapa 01 do método e o canal de WhatsApp.
- Projetos honestos: "No ar · projeto próprio" + "Exemplo de escopo", sem métricas inventadas;
  mocks com conteúdo realista no lugar de blocos cinza; card de convite com CTA.
- Linguagem leiga: "abre em ~1,5 s no celular", "nota 95+ no Google PageSpeed", "zero cookies
  de rastreamento" (dados do case real); CTA único "Pedir orçamento"; voz "nós" em todo o site.
- Contato: "o que acontece depois" em 3 passos (baseado no FAQ), WhatsApp fixo no mobile.
- Formulário: sucesso esconde o form, reset limpa chips, nada pré-selecionado, aria-invalid +
  aria-describedby, região aria-live, foco no título de sucesso.
- Acessibilidade/técnica: alvos de toque >= 44px, placeholders AA, tags 12px, ::selection,
  caret, scrollbar e focus ring temáticos, auroras sem filter:blur (mais leves), nav com seção ativa,
  nome dmarques visível no mobile.

Foto real (src/assets/founder/felipe-salles.png, colorida) e e-mail contato@agenciadmarques.com.br aplicados.
Pendente: captura real do site para o card em destaque.
