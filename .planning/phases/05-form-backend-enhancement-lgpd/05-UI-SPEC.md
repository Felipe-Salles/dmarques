---
phase: 05
slug: form-backend-enhancement-lgpd
status: draft
shadcn_initialized: false
preset: none
created: 2026-10-15
---

# Fase 05 — Contrato de Design de UI (Formulário, /obrigado, Política de Privacidade)

> Contrato visual e de interação. Gerado por gsd-ui-researcher, verificado por gsd-ui-checker.

## Regra de fonte de verdade (LOCKED)

Nenhum token novo. Tudo reutiliza `src/styles/tokens.css`, o contrato `04.1-UI-SPEC.md` e a skill `sketch-findings-dmarques`. Esta fase apenas **liga** estados que a 04.1 deixou prontos em CSS (`.field.err`, `.msg`, `.form.sending`, `.form.done`, `.success`, `.spinner`, `.sr-only` live region) e adiciona: erro de envio, 429, link de fallback WhatsApp, páginas `/obrigado` e `/politica-de-privacidade` completas, link WhatsApp nos cards de serviço. Em conflito, CONTEXT.md (05) vence a 04.1 (anotado onde ocorre).

Resolução de conflitos de copy com a 04.1:

| Item | 04.1 | CONTEXT 05 | Vale |
|------|------|-----------|------|
| Título do sucesso | "Pedido recebido." | D-19 "✓ Pedido enviado. Respondemos no mesmo dia útil." | **CONTEXT 05**: título "Pedido enviado." + sub "Respondemos no mesmo dia útil." |
| Aviso LGPD | "Usamos seus dados só para responder este pedido. Política de privacidade" | D-22 "Usamos seus dados só para responder a este pedido. Veja a Política de Privacidade." | **CONTEXT 05** |
| Nota de contato | "Preencha WhatsApp ou e-mail." | Fase 3 "Preencha WhatsApp ou e-mail" | Manter como está |
| "Enviar outro pedido" | existe no painel de sucesso | D-19: evitar reenvio duplicado | **Remover** o botão do painel; ficam só o WhatsApp e o texto (o formulário não volta na mesma sessão) |

---

## Design System

| Propriedade | Valor |
|-------------|-------|
| Tool | none (Astro estático; sem shadcn) |
| Preset | não aplicável |
| Component library | none (`.astro` + CSS escopado) |
| Icon library | SVG inline traçado, `aria-hidden="true"` (WhatsApp: path de `ContactSection.astro`) |
| Font | Sora 600 (títulos), Inter Tight 400/500/600 (texto), JetBrains Mono 400 (dados) |

---

## Spacing Scale

Tokens existentes `--space-1..--space-24` (4/8/12/16/24/32/48/64/96). Nenhum novo.

| Uso nesta fase | Valor |
|----------------|-------|
| Gap vertical do `.form-body` | 18px (literal 04.1, mantido) |
| Gap interno do `.field` | 8px (`--space-2`) |
| Mensagem de erro sob o campo | herda gap 8px do `.field`, sem margem extra |
| Painel de erro/429 (`.alert`) | padding `12px 14px` (mesmo do `.pending` atual), radius 12px, gap 12px entre texto e botão |
| Painel de sucesso | gap 14px (04.1), `padding` do `.form` |
| Política: gap entre seções H2 | `--space-12` (48px); H2→parágrafo `--space-3`; parágrafo→parágrafo `--space-4` |
| Política: coluna de leitura | `max-width: 70ch` (já em `politica-de-privacidade.astro`), padding lateral do `.wrap` |

Exceções: alvos de toque ≥44px (links do aviso LGPD, links da política dentro de listas ganham `padding-block` para atingir 44px apenas na navegação do índice; links inline em parágrafo estão isentos por WCAG 2.5.8 inline exception). Botão WhatsApp de fallback `min-height:48px`.

---

## Typography

Reutiliza a escala 04.1. Pesos: 400, 500, 600.

| Papel | Tamanho | Peso | Line-height | Onde |
|-------|---------|------|-------------|------|
| H1 de página secundária | `.h2` = `clamp(1.9rem,4.2cqi,3rem)` Sora | 600 | 1.08 | `/obrigado`, `/politica-de-privacidade` |
| H2 da política | `--text-xl` 1.375rem Sora | 600 | 1.2 | títulos de seção legal |
| H3 da política (se houver) | `--text-lg` 1.125rem Sora | 600 | 1.3 | subitens |
| Corpo da política | `--text-base` 1rem Inter Tight | 400 | 1.7 (`--leading-body` 1.6 aceito; 1.7 só na política para leitura longa) | parágrafos e listas, `max-width:70ch` |
| Resumo (1 frase no topo) | `.lead` `clamp(1rem,1.6cqi,1.125rem)` | 400 | 1.6 | abaixo do H1, cor muted |
| Data de atualização | `--text-sm` mono JetBrains Mono | 400 | 1.5 | "Última atualização: 15 de outubro de 2026" |
| Mensagem de erro de campo | `--text-sm` | 400 | 1.5 | `.msg` |
| Aviso LGPD | `--text-sm` | 400 | 1.5 | `.legal` |
| Botão | `--text-base` (submit) / `--text-sm` (demais) | 600 | — | |
| Link WhatsApp no card de serviço | `--text-sm` | 500 | 1.5 | discreto |

---

## Color

Sem cores novas.

| Papel | Valor | Uso nesta fase |
|-------|-------|----------------|
| Dominante 60% | `--color-bg` `#070A14` | fundo das páginas /obrigado e /politica |
| Secundário 30% | `--color-surface` (vidro), `--color-border` | card do form, divisores entre seções da política, índice |
| Acento ciano `#00C8FF` | foco de campo (borda + ring 3px), focus ring global, sublinhado de links na política (`text-decoration-color`), `::selection` | **Nunca** em texto corrido de erro |
| Ember `#FF6A3D` | ícone do botão WhatsApp de fallback (1 por tela), borda do `.alert` de 429/erro de envio (`rgba(255,106,61,.45)`) e fundo `rgba(255,106,61,.06)` (reuso literal de `.pending`) | Nada além disso |
| Destrutivo/erro | borda do campo `--color-danger` `#FF5D6C`; texto da mensagem `#FF8F9A` (≈7:1 sobre `#070A14`) | só campos inválidos e `.msg-contato` |
| Sucesso | `--color-success` `#3DDC97`, fundo `rgba(61,220,151,.12)`, borda `.35` | só o ✓ do painel de sucesso |

Regra de acessibilidade de cor: todo erro tem **texto visível + `aria-invalid`**; cor nunca é o único indicador. Prefixo visual opcional "Atenção:" não é necessário porque a mensagem aparece em linha própria sob o campo com ícone? Decisão: **sem ícone**, a presença do texto na cor de erro mais a borda vermelha mais `aria-describedby` cobre WCAG 1.4.1.

Acento reservado a: foco, links da política, `::selection`. Ember reservado a: ícone WhatsApp e alerta de fallback.

---

## Formulário — máquina de estados (JS enhancer)

Estados no elemento `form#form-orcamento` via classes/atributos (sem `style=""`): `idle` (padrão), `.sending`, `.done`, `.err-contato` (existente), `.failed` (novo: erro de servidor/rede), `.limited` (novo: 429). Visibilidade só por classes e `hidden`.

### Sem JS (baseline)

- `<form method="post" action="/api/orcamento">` navega nativamente; sucesso = 303 para `/obrigado`; erro = página de erro (ver abaixo). Atributos `required`/`type="email"` nativos fazem a validação do navegador.
- O parágrafo `#form-pendente` ("O envio ... ainda está sendo ativado") e o `preventDefault` atual em `src/scripts/form.ts` são **removidos**.
- `.msg` permanece `display:none` sem JS (validação nativa assume).

### Idle -> validação por campo

| Regra | Contrato |
|-------|----------|
| Quando validar | no `blur` **apenas se o campo tem valor** (campo vazio opcional não erra); no `submit` valida todos. Após aparecer erro, revalida no `input` para limpar assim que ficar válido |
| Marcação | no input: `aria-invalid="true"` e `aria-describedby="erro-{campo}"` (acrescentar ao id existente de nota, ex.: WhatsApp e e-mail mantêm `contato-nota-obrigatorio`); `.field` ganha `.err` |
| Remoção | ao corrigir: remove `aria-invalid`, remove `.err`, restaura `aria-describedby` original |
| Mensagem | `<span class="msg" id="erro-*">` já no HTML, sempre no DOM; alternância só por CSS (`.err`/`[aria-invalid]`). **Não** usar `role="alert"` por campo (evita anúncio duplicado); o resumo é feito pela região live |
| Regra cruzada | WhatsApp **ou** e-mail: no submit, se ambos vazios, `form.err-contato` mostra `#erro-contato` e marca os dois inputs `aria-invalid="true"` |
| Formatação WhatsApp (D-20) | sem máscara viva. No `blur`, se parseável (10-11 dígitos após remover +55/0), reescreve como `(16) 99611-1785` (11 dígitos) ou `(16) 9611-1785` (10). Se não parseável, mostra erro |
| Foco no primeiro erro | no submit com erros: `focus()` no primeiro input inválido na ordem do DOM (para `.msg-contato`, foco no input de WhatsApp); `scrollIntoView({block:'center'})` com `behavior:'auto'` se reduced-motion |
| Anúncio | `#form-status` (`aria-live="polite"`, sr-only, sempre renderizado): "Há N campos para corrigir." (singular: "Há 1 campo para corrigir.") |

Mensagens de erro (pt-BR, "problema + exemplo"):

| Campo | Copy |
|-------|------|
| Nome | Informe seu nome para sabermos com quem falamos. |
| WhatsApp | Use DDD + número, ex.: (16) 99611-1785. |
| E-mail | Use um e-mail completo, ex.: nome@empresa.com.br. |
| Contato (WhatsApp ou e-mail) | Preencha WhatsApp ou e-mail para podermos responder. |
| Mensagem (acima de 1000) | A mensagem passou de 1000 caracteres. Resuma em poucas linhas. |

### Enviando (`.sending`)

- Botão submit: `disabled` + `aria-disabled="true"`, `opacity:.8`, `cursor:progress`, spinner 16px visível (CSS 04.1). O rótulo muda para "Enviando…" (o texto do botão é trocado via `textContent` do nó de texto; spinner `aria-hidden`).
- Campos permanecem editáveis? **Não**: `fieldset`-like via `inert` no `.form-body` exceto o botão não é necessário; manter simples: apenas o botão desabilitado + guarda `if (sending) return` no handler. Os inputs ficam `readonly` durante o envio (evita edição divergente do payload).
- Live: "Enviando pedido…".
- Timeout do fetch: 15 s -> trata como falha de rede (`.failed`).
- `prefers-reduced-motion`: spinner mantém rotação (indicador essencial de progresso, conforme 04.1 `.spinner{animation:none}` só para animações não essenciais); alternativa: sob reduced-motion o spinner fica estático e o rótulo "Enviando…" carrega o significado. **Decisão:** sob reduced-motion, spinner sem animação e rótulo "Enviando…" visível.

### Sucesso (`.done`) — D-19

- Substitui `.form-body` pelo `.success` no mesmo card (CSS existente `.form.done`).
- Conteúdo: ✓ 48px (traço desenhado em 0.5s, estático sob reduced-motion), `<h3 tabindex="-1" id="ok-title">Pedido enviado.</h3>`, `<p class="sub">Respondemos no mesmo dia útil pelo contato que você informou.</p>`, botão `.btn.btn-ghost` WhatsApp "Falar agora no WhatsApp" (link com texto pré-preenchido genérico, ver seção WhatsApp).
- Foco: `ok-title.focus()` após remover `.form-body` do fluxo; live: "Pedido enviado. Respondemos no mesmo dia útil."
- O botão "Enviar outro pedido" é removido (anti-reenvio).
- Botão de WhatsApp aqui não usa ember cheio: é `.btn-ghost` com ícone ember (1 ember por tela já ocupado pelo canal WhatsApp; ícone idêntico, aceito).

### Erro de servidor/rede (`.failed`)

- `form` ganha `.failed`; aparece `<div class="alert" id="form-erro" role="group" aria-labelledby="form-erro-t">` **acima do botão submit**, dentro de `.form-body`, com `hidden` removido. Campos e botão voltam ao estado editável (preserva o que o usuário digitou).
- Copy: título (negrito 600, `--text-sm`) "Não conseguimos enviar agora." + texto "Seus dados continuam aqui. Tente de novo em instantes ou fale com a gente pelo WhatsApp." + link `.btn.btn-ghost` "Chamar no WhatsApp" (href com nome + tipo de projeto digitados, D-21; `target="_blank" rel="noopener noreferrer"`).
- Foco: move para o título do alerta (`tabindex="-1"`); live: "Não conseguimos enviar o pedido. Tente de novo ou use o WhatsApp."
- Submit volta a "Enviar pedido de orçamento"; o usuário pode reenviar.

### Limite (429) (`.limited`) — D-12

- Mesmo componente `.alert`, variante por texto, `id="form-limite"`.
- Copy: título "Recebemos muitos pedidos em pouco tempo." + texto "Para não perder o seu, fale com a gente direto pelo WhatsApp. Respondemos no mesmo dia útil." + botão "Chamar no WhatsApp" (link com nome + tipo).
- Submit permanece habilitado após 429? **Não**: fica desabilitado por 60 s ou até recarregar (evita martelar o endpoint); rótulo "Tente novamente em alguns minutos"; é reabilitado após o intervalo `Retry-After` (se presente) ou 60 s. Live: "Muitos envios em pouco tempo. Use o WhatsApp."

### Honeypot e tempo mínimo

Campo honeypot: `<div class="hp" aria-hidden="true">` com `input name="empresa-site" tabindex="-1" autocomplete="off"`, posicionado fora da tela por **classe** (`position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden`), nunca `display:none` (bots detectam) e nunca `style=""`. Campo oculto `rendered-at` preenchido pelo servidor (assinado) — sem impacto visual.

---

## Aviso de uso de dados (LGPD-03) — D-22

- Posição: logo abaixo do botão submit, dentro de `.form-body`, `<p class="legal">`.
- Copy exata: "Usamos seus dados só para responder a este pedido. Veja a <a href="/politica-de-privacidade">Política de Privacidade</a>."
- Sem checkbox, sem bloqueio. Link: `--color-text`, sublinhado offset 4px, `min-height:44px` (CSS existente). Aviso presente também no estado `.failed`/`.limited` (continua no DOM).
- Remover `margin-left:.3em` quando o link quebrar de linha não for necessário; manter.

---

## WhatsApp deep-links (FORM-13, D-21)

| Local | Texto pré-preenchido (antes do `encodeURIComponent`) |
|-------|------------------------------------------------------|
| Hero, Contato (canal), footer | "Olá! Vim pelo site da Dmarques e quero pedir um orçamento." |
| Card de serviço | "Olá! Vim pelo site e quero falar sobre {título do serviço}." |
| Fallback do form (erro/429/sucesso) | "Olá! Sou {nome}. Vim pelo site e quero falar sobre {tipo de projeto}." — se nome vazio: "Olá! Vim pelo site e quero pedir um orçamento."; se tipo vazio, omite a frase do tipo |

Base: `https://wa.me/5516996111785?text=...`. Sempre `target="_blank" rel="noopener noreferrer"`. O JS monta o href do fallback via `URL`/`encodeURIComponent` e atribui com `setAttribute('href', ...)` (sem `style=""`).

### Link WhatsApp no card de serviço (`ServicesSection.astro`)

- `<a class="svc-wa" ...>Falar sobre isso no WhatsApp</a>` dentro do item de serviço, após o parágrafo.
- Visual: `--text-sm`, peso 500, cor `--color-text-muted`, sublinhado `text-underline-offset:4px`, seta pequena `↗` SVG 14px; `min-height:44px` via `display:inline-flex; align-items:center`.
- Hover/focus-visible: cor `--color-text`, `text-decoration-color: var(--aurora-cyan)`, seta avança 2px (transform, 0.2s). Todo `:hover` tem o `:focus-visible` correspondente.
- Nome acessível: texto visível já contém "Falar sobre isso no WhatsApp"; acrescentar `aria-label="Falar sobre {serviço} no WhatsApp"` para diferenciar entre os 4 links.
- Não usa ember (o ember da tela já é do canal WhatsApp/botão flutuante); sem borda de botão para manter discrição.

---

## /obrigado (alvo sem JS)

Estrutura atual mantida (`BaseLayout`, `Aurora variant="small"`, `.intro`, `.content-block` centrado, `max-width:40rem`).

| Elemento | Contrato |
|----------|----------|
| `<title>` / meta | "Pedido enviado — Dmarques"; `noindex` (Fase 6 aplica, aqui apenas não linkar de lugar nenhum) |
| H1 `.h2` | "Pedido enviado." (foco programático não necessário: é navegação de página, foco começa no topo; `<main id="conteudo" tabindex="-1">` recebe foco via skip link existente) |
| Lead | "Recebemos o seu pedido. Respondemos no mesmo dia útil, pelo contato que você informou." |
| Ações | Primário: `.btn.btn-primary` "Falar agora no WhatsApp" (genérico, ícone ember); secundário `.btn.btn-ghost` "Voltar ao início" |
| Lista "o que acontece depois" | Não repetir; opcional. Decisão: **omitir** (mantém a página enxuta) |
| Acesso direto | Se alguém abrir `/obrigado` sem enviar, o conteúdo é o mesmo (página estática; sem alegação de dados do usuário) |

## Erro sem JS (alvo de falha) — sugestão de rota `/erro-envio` (discricionário, ver CONTEXT)

Mesma composição de `/obrigado`. Variantes por query-string **fixa e allow-listada** (`?motivo=limite|invalido|falha`, valor desconhecido cai em `falha`); nunca ecoar entrada do usuário.

| Motivo | H1 | Lead | Ações |
|--------|----|------|-------|
| `limite` | Recebemos muitos pedidos em pouco tempo. | Para não perder o seu, fale com a gente direto pelo WhatsApp. Respondemos no mesmo dia útil. | WhatsApp (primário) + "Voltar ao formulário" (ghost, `/#contato`) |
| `invalido` | Faltou preencher algo. | Volte ao formulário e confira nome e um contato (WhatsApp ou e-mail). | "Voltar ao formulário" (primário) + WhatsApp (ghost) |
| `falha` | Não conseguimos enviar agora. | Tente de novo em instantes ou fale com a gente pelo WhatsApp. | WhatsApp (primário) + "Voltar ao formulário" (ghost) |

`<title>`: "Não foi possível enviar — Dmarques". `Aurora variant="small"`, mesmos estilos. Só um ember por tela (ícone WhatsApp do botão primário).

---

## /politica-de-privacidade (leitura longa)

Substitui o shell da Fase 3. Herda `BaseLayout` (header + footer), `Aurora variant="small"` no topo. **Cabeçalho centrado** como hoje; **corpo alinhado à esquerda** (texto legal centralizado é ilegível).

### Layout

| Elemento | Contrato |
|----------|----------|
| Container | `.wrap` + coluna única `max-width:70ch`, centrada na página (`margin-inline:auto`) |
| Cabeçalho | H1 `.h2` "Política de Privacidade"; resumo de 1 frase em `.lead` (D-18); data "Última atualização: {data}" em mono `--text-sm` muted; sem botão "Voltar" no topo (header já tem logo/nav) |
| Resumo (1 frase) | "Pedimos só o necessário para responder ao seu orçamento, guardamos por 6 meses e não vendemos nem compartilhamos seus dados para marketing." |
| Índice | `<nav aria-label="Nesta página">` com `<ol>` de links âncora para cada H2 (ordem LGPD-02), vidro **não** (superfície simples: `border:1px solid var(--color-border); border-radius:var(--radius-md); padding:16px 20px; background:rgba(255,255,255,.02)`). Em ≥900px permanece no fluxo (não sticky) para manter simplicidade e zero JS |
| Seções | `<section id="..." aria-labelledby>` com H2; separador `border-top:1px solid var(--color-border)` + `padding-top: var(--space-8)` entre seções; `scroll-margin-top: 96px` (header 84px sticky) |
| Texto | parágrafos `--text-base`/1.7; `ul` com marcador padrão (`padding-left:1.25em`, `li + li {margin-top:8px}`); tabela de operadores como `<table>` semântica (ver abaixo) |
| Links | `--color-text`, sublinhado ciano offset 4px (regra já existente em `.content-block :global(a:not(.btn))`) |
| Rodapé da página | `.btn.btn-ghost` "Voltar ao início" no final do documento |
| Movimento | **nenhum** (sem reveal, sem animações de entrada); sob `.js-ready` o conteúdo já é visível |

Seções H2 (ordem, mapeando LGPD-02; texto jurídico final é responsabilidade do Felipe/planner, aqui só o contrato visual e títulos):

1. Quem somos (controlador: Felipe Salles, nome fantasia Dmarques, Ibitinga/SP, contato `contato@agenciadmarques.com.br`)
2. Quais dados coletamos (nome, WhatsApp, e-mail, tipo de projeto, mensagem; dados técnicos mínimos de acesso)
3. Para que usamos e por qual base legal (Art. 7º V e IX)
4. Com quem compartilhamos (operadores: Vercel, Resend, Upstash, GoDaddy) + transferência internacional (EUA)
5. Por quanto tempo guardamos (6 meses para quem não virou cliente)
6. Cookies e análise de acesso (nenhum cookie de rastreamento; Vercel Web Analytics sem cookies)
7. Segurança
8. Seus direitos (Art. 18) e como exercê-los (prazo de resposta de até 15 dias)
9. Encarregado e canal de contato (dispensa conforme Resolução CD/ANPD nº 2/2022)
10. Mudanças nesta política

### Tabela de operadores

`<table>` com `<caption class="sr-only">Operadores de dados</caption>`, colunas "Quem", "Para quê", "Onde". `th scope="col"`/`scope="row"`. Estilo: `width:100%; border-collapse:collapse; font-size: var(--text-sm)`; células `padding:12px 8px`, `border-bottom:1px solid var(--color-border)`, `th` peso 600 cor `--color-text`, `td` cor muted. Em ≤560px (container `site`) a tabela vira lista empilhada: cada `tr` display block com `td::before{content:attr(data-label)}` (data-label vem do atributo HTML, sem `style=""`), ou, mais simples e aceito, `overflow-x:auto` em wrapper `div` com `tabindex="0"` e `role="region" aria-label="Operadores de dados"`. **Decisão:** wrapper rolável com `role="region"`, `tabindex="0"` e `aria-label`.

---

## Responsivo

| Largura | Comportamento |
|---------|---------------|
| ≤900px (container `site`) | contato em 1 coluna (já existe); `.alert` ocupa largura total do card |
| ≤560px | botão WhatsApp de fallback `width:100%`; índice da política mantém lista simples; tabela rola horizontalmente |
| Teclado virtual (mobile) | `scroll-margin-top:96px` nos campos para evitar que o header sticky cubra o primeiro erro focado |

---

## Movimento e reduced-motion

| Momento | Contrato |
|---------|----------|
| Aparição de `.msg` e `.alert` | **Sem animação** (display toggle). Sem shake |
| Spinner | 0.7s linear infinite, só em `.sending`; sob reduced-motion: estático + rótulo "Enviando…" |
| ✓ do sucesso | `draw` 0.5s (04.1); sob reduced-motion traço completo |
| Troca form -> sucesso | instantânea (display); nenhuma transição de altura |
| Hover/focus em `.svc-wa` | `transform` ≤0.2s; sob reduced-motion sem deslocamento da seta, apenas cor |
| Páginas /obrigado, /erro-envio e política | sem animação de entrada |

Transições permitidas: transform, opacity, box-shadow, border-color, color, ≤300ms (padrão do repo).

---

## Restrições CSP / performance

- Zero `style=""` adicionado pelo JS; estados só por classes, atributos `hidden`, `aria-*`, `data-*`. Honeypot oculto por classe.
- `href` do fallback via `setAttribute`; texto via `textContent` (nunca `innerHTML`).
- O enhancer é um único módulo `src/scripts/form.ts` já empacotado em `effects.ts`; orçamento total <20 KB (D-24). Sem biblioteca de validação no cliente; regras espelham o schema compartilhado (`src/lib/form-schema.ts`).
- Nenhuma origem de terceiros. Analytics não dispara em interação do formulário.
- Lighthouse ≥95: a política é HTML estático, sem imagens; `Aurora variant="small"` estática.

---

## Copywriting Contract

| Elemento | Copy |
|----------|------|
| CTA primário (título do form) | Pedir orçamento |
| Submit | Enviar pedido de orçamento |
| Submit enviando | Enviando… |
| Submit após 429 | Tente novamente em alguns minutos |
| Sucesso (título) | Pedido enviado. |
| Sucesso (corpo) | Respondemos no mesmo dia útil pelo contato que você informou. |
| Sucesso (ação) | Falar agora no WhatsApp |
| Estado vazio | Não aplicável (formulário sempre vazio no início; a política não é lista) |
| Erro de servidor/rede | Não conseguimos enviar agora. Seus dados continuam aqui. Tente de novo em instantes ou fale com a gente pelo WhatsApp. |
| Erro 429 | Recebemos muitos pedidos em pouco tempo. Para não perder o seu, fale com a gente direto pelo WhatsApp. Respondemos no mesmo dia útil. |
| Erros de campo | ver tabela de validação acima |
| Resumo live | "Há N campos para corrigir." / "Enviando pedido…" / "Pedido enviado. Respondemos no mesmo dia útil." |
| Aviso LGPD | Usamos seus dados só para responder a este pedido. Veja a Política de Privacidade. |
| Link de serviço | Falar sobre isso no WhatsApp |
| Ações destrutivas | Nenhuma nesta fase. Sem confirmação necessária |
| Proibido | termos técnicos (Resend, Upstash, 429, rate limit) fora da política; "eu"; métricas inventadas |

Voz: "nós", linguagem leiga. Na política, o controlador é pessoa física (D-14), então a seção "Quem somos" nomeia Felipe Salles; o restante da política usa "nós" e explica sigla na primeira ocorrência (LGPD, ANPD).

---

## Acessibilidade (checklist verificável)

- [ ] Todo erro de campo: texto + borda + `aria-invalid="true"` + `aria-describedby` apontando para o `.msg`.
- [ ] `#form-status` sempre no DOM, `aria-live="polite"`, `.sr-only`; atualizado limpando antes de definir texto.
- [ ] Foco no primeiro campo inválido no submit; foco em `#ok-title` no sucesso; foco no título do `.alert` em falha/429.
- [ ] Botão desabilitado em voo com `aria-disabled` e guarda no handler.
- [ ] Contraste: `#FF8F9A` sobre vidro escuro ≥4.5:1; muted `#9AA3B2` ~7.8:1; ring ciano 2px offset 3px.
- [ ] Alvos ≥44px (botão WhatsApp 48px, link LGPD 44px, `.svc-wa` 44px).
- [ ] Política: um H1, H2 sequenciais, `nav` com `aria-label`, tabela com `caption`/`scope`, `lang="pt-BR"`.
- [ ] Honeypot `aria-hidden` + `tabindex="-1"`, fora do fluxo de leitura.
- [ ] Zero `style=""`; `prefers-reduced-motion` respeitado.

---

## Decisões de design tomadas por defeito (sem pergunta ao usuário)

| # | Decisão | Motivo |
|---|---------|--------|
| 1 | Remover "Enviar outro pedido" | D-19 (anti-duplicidade) |
| 2 | Rota sem JS `/erro-envio?motivo=` com allow-list | CONTEXT discricionário; evita redirect para URL do cliente |
| 3 | Inputs `readonly` + botão `disabled` durante envio | impede edição divergente; mantém foco acessível |
| 4 | Submit desabilitado 60 s após 429 | evita martelar endpoint |
| 5 | Erro sem ícone, mas com texto + borda + ARIA | contraste e WCAG 1.4.1 já cobertos |
| 6 | Índice da política não sticky, sem JS | simplicidade, Lighthouse, zero JS |
| 7 | Tabela de operadores com wrapper rolável | evita reflow complexo em mobile |
| 8 | Link de serviço sem ember | ember já usado por tela |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | nenhum (não inicializado) | não aplicável |
| Terceiros | nenhum | não aplicável |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
