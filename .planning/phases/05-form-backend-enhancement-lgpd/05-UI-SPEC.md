---
phase: 05
slug: form-backend-enhancement-lgpd
status: approved
shadcn_initialized: false
preset: none
created: 2026-10-15
reviewed_at: 2026-10-15
---

# Fase 05 — Contrato de Design de UI (Formulário, /obrigado, Política de Privacidade)

> Contrato visual e de interação. Gerado por gsd-ui-researcher, verificado por gsd-ui-checker.

## Regra de fonte de verdade (LOCKED)

Reutiliza `src/styles/tokens.css`, o contrato `04.1-UI-SPEC.md` e a skill `sketch-findings-dmarques`. **Único token novo:** `--color-danger-text: #ff8f9a` (texto de erro; hoje é literal em `ContactSection.astro`, passa a token em `tokens.css` e substitui o literal). Esta fase liga estados que a 04.1 deixou prontos em CSS (`.field.err`, `.msg`, `.form.sending`, `.form.done`, `.success`, `.spinner`, live region sr-only) e adiciona: erro de envio, 429, link de fallback WhatsApp, páginas `/obrigado`, `/erro-envio` e `/politica-de-privacidade` completas, link WhatsApp nos cards de serviço. Em conflito, CONTEXT.md (05) vence a 04.1.

Resolução de conflitos de copy com a 04.1:

| Item | 04.1 | CONTEXT 05 | Vale |
|------|------|-----------|------|
| Título do sucesso | "Pedido recebido." | D-19 "Pedido enviado. Respondemos no mesmo dia útil." | **CONTEXT 05**: título "Pedido enviado." + sub "Respondemos no mesmo dia útil pelo contato que você informou." |
| Aviso LGPD | "Usamos seus dados só para responder este pedido. Política de privacidade" | D-22 | **CONTEXT 05** |
| "Enviar outro pedido" | existe no painel de sucesso | D-19: evitar reenvio duplicado | **Removido** |

Nota para o planner (D-09): o e-mail `contato@agenciadmarques.com.br` já aparece em `ContactSection.astro`; a troca de `felipe.salles1@hotmail.com` para `contato@agenciadmarques.com.br` deve ser verificada e concluída em `ContactSection.astro` e `SiteFooter.astro` (grep por `hotmail` deve retornar zero em `src/`).

---

## Design System

| Propriedade | Valor |
|-------------|-------|
| Tool | none (Astro estático; sem shadcn) |
| Preset | não aplicável |
| Component library | none (`.astro` + CSS escopado) |
| Icon library | SVG inline traçado, `aria-hidden="true"` (WhatsApp: path de `ContactSection.astro`) |
| Font | Sora 600 (títulos), Inter Tight 400/600 (texto), JetBrains Mono 400 (só data da política) |

---

## Spacing Scale

Tokens existentes `--space-1..--space-24` (4/8/12/16/24/32/48/64/96).

| Uso nesta fase | Valor |
|----------------|-------|
| Gap vertical do `.form-body` | 16px (`--space-4`); **alterar** o 18px atual |
| Gap interno do `.field` | 8px (`--space-2`) |
| Gap do painel de sucesso | 16px (`--space-4`); **alterar** o 14px atual |
| Padding do `.alert` | `12px 16px` (`--space-3` vertical, `--space-4` horizontal); **alterar** o `12px 14px` atual |
| Gap interno do `.alert` | 12px (`--space-3`) |
| Política: seção -> seção | `--space-12` (48px); H2 -> parágrafo `--space-3`; parágrafo -> parágrafo `--space-4`; itens de lista 8px |
| Política: coluna | `max-width: 70ch`, padding lateral do `.wrap` |
| Tabela de operadores | célula `12px 8px` |

Exceções (com justificativa):

| Valor | Onde | Justificativa |
|-------|------|---------------|
| 12px vertical no `.alert` e nas células da tabela | `.alert`, `td/th` | 12px é múltiplo de 4 e é `--space-3`; escolhido porque o alerta é um bloco compacto dentro do card (16px completos faria o alerta competir com o botão) |
| 1px de largura/altura | honeypot `.hp` | elemento fora da tela, não visual |
| 44px / 48px / 52px | alvos de toque | WCAG 2.5.8 e botão submit 52px do contrato 04.1 (peso visual do CTA único) |
| 96px `scroll-margin-top` | âncoras da política | altura do header sticky (84px) + 12px de respiro |

---

## Typography

**Escopo da restrição:** as superfícies **novas desta fase** (estados do formulário, aviso LGPD, `/obrigado`, `/erro-envio`, `/politica-de-privacidade`, link de serviço) usam apenas **4 tamanhos** e **2 pesos**. A escala global da 04.1 (`--text-xs..--text-display`) continua intacta no resto do site; esta fase simplesmente não usa `--text-lg`, `--text-xs` nem `--text-2xl+` nessas superfícies.

| Papel | Tamanho | Peso | Line-height | Onde |
|-------|---------|------|-------------|------|
| H1 de página secundária | `.h2` = `clamp(1.9rem,4.2cqi,3rem)` Sora | 600 | 1.08 | `/obrigado`, `/erro-envio`, `/politica-de-privacidade` |
| Heading (xl) | `--text-xl` 1.375rem Sora | 600 | 1.2 | H2 da política; título do form (`.form h3`) e do sucesso (`#ok-title`) |
| Body / lead | `--text-base` 1rem Inter Tight | 400 | 1.6 (política: 1.7) | parágrafos, lead das páginas secundárias (cor muted, `max-width:56ch`), listas, botão submit (600) |
| Small | `--text-sm` 0.875rem Inter Tight | 400 (600 em botões e títulos de alerta) | 1.5 | `.msg`, `.legal`, `.note`, `.alert`, `.btn` secundários, `.svc-wa`, tabela, data da política (JetBrains Mono 400) |

Pesos declarados: **400 e 600**. H3 da política não existe (subitens viram listas ou parágrafos em negrito 600).

---

## Color

| Papel | Valor | Uso nesta fase |
|-------|-------|----------------|
| Dominante 60% | `--color-bg` `#070A14` | fundo das páginas e dos campos |
| Secundário 30% | `--color-surface` (vidro), `--color-border` | card do form, divisores da política, índice |
| Acento ciano `#00C8FF` | foco de campo (borda + ring 3px), focus ring global, sublinhado de links da política, `::selection` | nunca em texto corrido |
| Ember `#FF6A3D` | ícone do botão WhatsApp de fallback; borda `rgba(255,106,61,.45)` e fundo `rgba(255,106,61,.06)` do `.alert` | nada além disso |
| Erro | borda do campo `--color-danger` `#FF5D6C`; texto `--color-danger-text` `#FF8F9A` (≈7:1 sobre `#070A14`) | só campos inválidos |
| Sucesso | `--color-success` `#3DDC97`, fundo `rgba(61,220,151,.12)`, borda `.35` | só o ✓ do painel de sucesso |

Sem ícone no erro: texto na cor de erro + borda + `aria-invalid` + `aria-describedby` cobrem WCAG 1.4.1.

Acento reservado a: foco, links da política, `::selection`. Ember reservado a: ícone WhatsApp e `.alert`.

---

## Ponto focal por tela

| Tela / estado | Ponto focal |
|---------------|-------------|
| Formulário idle | título "Pedir orçamento" + botão submit 52px (único elemento de alto contraste) |
| Formulário com erros | primeiro campo inválido (recebe foco; borda `--color-danger`) |
| Formulário enviando | botão com spinner |
| Sucesso | ✓ 48px + título "Pedido enviado." (recebe foco) |
| Alert de falha/429 | título do alert (recebe foco) e o botão "Chamar no WhatsApp" logo abaixo |
| `/obrigado` | H1 "Pedido enviado." sob a aurora; ação primária "Falar agora no WhatsApp" |
| `/erro-envio` | H1 do motivo; ação primária conforme tabela (WhatsApp ou voltar ao formulário) |
| `/politica-de-privacidade` | H1 + resumo de 1 frase; depois o índice como entrada de navegação |

---

## Formulário — máquina de estados (JS enhancer)

Estados no `form#form-orcamento` via classes/atributos (sem `style=""`): idle (padrão), `.sending`, `.done`, `.failed` (novo), `.limited` (novo). `.err-contato` e `#erro-contato` deixam de existir (D-28). Visibilidade só por classes, `hidden` e `:has()` do seletor de canal.

### Seletor de canal (D-28)

Substitui os dois campos WhatsApp + E-mail e a nota "Preencha WhatsApp ou e-mail." (removida).

| Item | Contrato |
|------|----------|
| Estrutura | `<fieldset class="field canal">` com `<legend>Prefiro contato por</legend>` e dois rádios reais `name="canal"` (`value="whatsapp"` com `checked`, `value="email"`), com o mesmo visual de pílula do `ProjectTypeChips` (componente compartilhado `ChipGroup.astro`) |
| Layout | legenda e pílulas na mesma linha (legenda flutuada, pílulas 44px), quebrando em telas estreitas; o campo de contato vem logo abaixo |
| Campo WhatsApp | `<div class="field contato contato-wa">`, `input#whatsapp name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="(16) 99999-9999"`, rótulo "WhatsApp" |
| Campo E-mail | `<div class="field contato contato-email">`, `input#email name="email" type="email" inputmode="email" autocomplete="email" maxlength="120" placeholder="voce@empresa.com.br"`, rótulo "E-mail" |
| Rótulo do campo | `<label class="sr-only">` (nome acessível "WhatsApp"/"E-mail"); a pílula marcada é o rótulo visível. Mantém a altura do card proporcional ao sketch |
| Alternância sem JS | CSS `.form:has(input[name='canal'][value='whatsapp']:checked) .contato-email` e `.form:has(input[name='canal'][value='email']:checked) .contato-wa` com `display:none`. Nenhum dos dois inputs tem `required` |
| Alternância com JS | no `change` do rádio e no init: o campo oculto recebe `disabled` (não valida, não é enviado) e perde `aria-invalid`/`.err`; o visível fica habilitado. O foco permanece no rádio (setas continuam navegando no grupo); o próximo Tab chega ao campo visível |
| Fallback | navegador sem `:has()` mostra os dois campos (aceito, D-28); sem JS o campo oculto vai vazio e o servidor o descarta |
| Altura | card do formulário a 1440px ≤ altura do `#quoteForm` do sketch + 40px (gate `scripts/verify/form-card-height.mjs`) |

### Sem JS (baseline)

- `<form method="post" action="/api/orcamento">` navega nativamente; sucesso = 303 para `/obrigado`; falha = `/erro-envio?motivo=...`. `required` nativo vale só no nome; os campos de contato não têm `required` (o servidor exige o do canal escolhido).
- O parágrafo `#form-pendente` e o `preventDefault` atual em `src/scripts/form.ts` são **removidos**.
- `.msg` permanece `display:none` sem JS.

### Validação por campo

| Regra | Contrato |
|-------|----------|
| Quando validar | `blur` apenas se o campo tem valor; no `submit` valida todos; depois do primeiro erro, revalida no `input` |
| Marcação | input visível com `aria-invalid="true"` e `aria-describedby` incluindo `erro-{campo}`; `.field` ganha `.err`. O campo do canal oculto nunca é marcado |
| Remoção | ao corrigir: remove `aria-invalid` e `.err`; restaura `aria-describedby` original |
| Mensagem | `<span class="msg" id="erro-*">` sempre no DOM; alternância só por CSS. Sem `role="alert"` por campo (o resumo vai pela região live) |
| Regra de canal (D-28) | só o campo do canal marcado é obrigatório e validado (WhatsApp normalizável ou e-mail completo); o outro é ignorado. Canal ausente/desconhecido no cliente vira `whatsapp` |
| Formatação WhatsApp (D-20) | sem máscara viva; no `blur`, se parseável (10-11 dígitos após remover +55/0), reescreve como `(16) 99611-1785` ou `(16) 9611-1785`; senão mostra erro |
| Foco | no submit com erros, `focus()` no primeiro input inválido na ordem do DOM (nome, campo de contato visível, mensagem); `scrollIntoView({block:'center', behavior:'auto'})` |
| Anúncio | `#form-status` (`aria-live="polite"`, sr-only, sempre renderizado): "Há N campos para corrigir." / "Há 1 campo para corrigir." |

Mensagens de erro:

| Campo | Copy |
|-------|------|
| Nome | Informe seu nome para sabermos com quem falamos. |
| WhatsApp (vazio ou inválido, canal WhatsApp) | Informe seu WhatsApp com DDD, ex.: (16) 99611-1785. |
| E-mail (vazio ou inválido, canal E-mail) | Informe um e-mail completo, ex.: nome@empresa.com.br. |
| Mensagem (>1000) | A mensagem passou de 1000 caracteres. Resuma em poucas linhas. |

### Enviando (`.sending`)

- Botão: `disabled` + `aria-disabled="true"`, `opacity:.8`, `cursor:progress`, spinner 16px visível; texto "Enviando…".
- Inputs ficam `readonly`; handler tem guarda `if (sending) return`.
- Spinner gira a 0.7s linear; sob `prefers-reduced-motion` fica estático e o texto "Enviando…" carrega o significado.
- Live: "Enviando pedido…". Timeout do fetch de 15 s trata como falha de rede (`.failed`).

### Sucesso (`.done`) — D-19

- `.form-body` some, `.success` aparece no mesmo card (CSS 04.1).
- Conteúdo: ✓ 48px (traço desenhado em 0.5s; completo sob reduced-motion), `<h3 tabindex="-1" id="ok-title">Pedido enviado.</h3>`, `<p class="sub">Respondemos no mesmo dia útil pelo contato que você informou.</p>`, `.btn.btn-ghost` "Falar agora no WhatsApp" (ícone ember).
- Foco em `#ok-title`; live: "Pedido enviado. Respondemos no mesmo dia útil."

### Falha de servidor/rede (`.failed`)

- `<div class="alert" id="form-erro" role="group" aria-labelledby="form-erro-t">` acima do submit, dentro de `.form-body`; `hidden` removido. Campos voltam editáveis e mantêm o que foi digitado.
- Título (600, `--text-sm`, `tabindex="-1"`): "Não conseguimos enviar agora." Texto: "Seus dados continuam aqui. Tente de novo em instantes ou fale com a gente pelo WhatsApp." Ação: `.btn.btn-ghost` "Chamar no WhatsApp" (href com nome + tipo digitados).
- Foco no título do alert; live: "Não conseguimos enviar o pedido. Tente de novo ou use o WhatsApp."

### Limite (429) (`.limited`) — D-12

- Mesmo componente `.alert`, `id="form-limite"`.
- Título: "Recebemos muitos pedidos em pouco tempo." Texto: "Para não perder o seu, fale com a gente direto pelo WhatsApp. Respondemos no mesmo dia útil." Ação: "Chamar no WhatsApp".
- Submit desabilitado por 60 s (ou `Retry-After` se presente) com rótulo "Tente novamente em alguns minutos"; depois volta ao rótulo normal. Live: "Muitos envios em pouco tempo. Use o WhatsApp."

### Honeypot

`<div class="hp" aria-hidden="true">` com `input name="empresa-site" tabindex="-1" autocomplete="off"`, escondido por **classe** (`position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden`), nunca `display:none`, nunca `style=""`. Campo oculto `elapsed-ms` (vazio no HTML; o enhancer grava o tempo decorrido medido com `performance.now()` no submit, D-27).

---

## Aviso de uso de dados (LGPD-03) — D-22

- Logo abaixo do submit, dentro de `.form-body`, `<p class="legal">` (`--text-sm`, muted, line-height 1.5).
- Copy exata: "Usamos seus dados só para responder a este pedido. Veja a <a href="/politica-de-privacidade">Política de Privacidade</a>."
- Sem checkbox. Link em `--color-text`, sublinhado offset 4px, `min-height:44px`. Permanece visível em `.failed`/`.limited`.

---

## WhatsApp deep-links (FORM-13, D-21)

| Local | Texto pré-preenchido (antes de `encodeURIComponent`) |
|-------|------------------------------------------------------|
| Contato (`ContactSection.astro`), footer (`SiteFooter.astro`, coluna e botão flutuante). Hero fica sem CTA de WhatsApp (D-26, Felipe 2026-10-15) | "Olá! Vim pelo site da Dmarques e quero pedir um orçamento." |
| `CtaFinal.astro` | mesmo texto genérico. Observação: a 04.1 removeu `CtaFinal.astro` (CTX D-05); se o arquivo não existir mais, o requisito D-21 para ele fica sem objeto, e o planner confirma por grep |
| Card de serviço (`ServicesSection.astro`) | "Olá! Vim pelo site e quero falar sobre {título do serviço}." |
| Fallback do form (falha, 429, sucesso) | "Olá! Sou {nome}. Vim pelo site e quero falar sobre {tipo de projeto}." Sem nome: "Olá! Vim pelo site e quero pedir um orçamento."; sem tipo: omite a frase do tipo |

Base `https://wa.me/5516996111785?text=...`, sempre `target="_blank" rel="noopener noreferrer"`. O JS monta o href via `encodeURIComponent` e `setAttribute('href', ...)`.

### Link no card de serviço

- `<a class="svc-wa">Falar sobre isso no WhatsApp</a>` após o parágrafo do serviço, com `aria-label="Falar sobre isso no WhatsApp — {serviço}"` (o nome acessível começa pelo texto visível, label-in-name).
- `--text-sm`, **peso 400**, cor `--color-text-muted`, sublinhado offset 4px, seta SVG 14px; `display:inline-flex; align-items:center; min-height:44px`.
- Hover e `:focus-visible`: cor `--color-text`, `text-decoration-color: var(--aurora-cyan)`, seta avança 2px (transform 0.2s; sem deslocamento sob reduced-motion).
- Sem ember.

---

## /obrigado (alvo sem JS)

Estrutura atual mantida (`BaseLayout`, `Aurora variant="small"`, `.intro`, `.content-block` centrado, `max-width:40rem`).

| Elemento | Contrato |
|----------|----------|
| `<title>` | "Pedido enviado — Dmarques" |
| H1 `.h2` | "Pedido enviado." |
| Lead (`--text-base`) | "Recebemos o seu pedido. Respondemos no mesmo dia útil, pelo contato que você informou." |
| Ações | primário `.btn.btn-primary` "Falar agora no WhatsApp"; secundário `.btn.btn-ghost` "Voltar ao início" |

## /erro-envio (alvo de falha sem JS)

Mesma composição de `/obrigado`. `?motivo=limite|invalido|falha` em allow-list; valor desconhecido cai em `falha`; nunca ecoar entrada do usuário. `<title>`: "Não foi possível enviar — Dmarques".

| Motivo | H1 | Lead | Ações |
|--------|----|------|-------|
| `limite` | Recebemos muitos pedidos em pouco tempo. | Para não perder o seu, fale com a gente direto pelo WhatsApp. Respondemos no mesmo dia útil. | WhatsApp (primário) + "Voltar ao formulário" (ghost, `/#contato`) |
| `invalido` | Faltou preencher algo. | Volte ao formulário e confira seu nome e o contato do canal escolhido (WhatsApp ou e-mail). | "Voltar ao formulário" (primário) + WhatsApp (ghost) |
| `falha` | Não conseguimos enviar agora. | Tente de novo em instantes ou fale com a gente pelo WhatsApp. | WhatsApp (primário) + "Voltar ao formulário" (ghost) |

---

## /politica-de-privacidade (leitura longa)

Substitui o shell da Fase 3. `BaseLayout`, `Aurora variant="small"` no topo. Cabeçalho centrado; corpo alinhado à esquerda.

| Elemento | Contrato |
|----------|----------|
| Container | `.wrap` + coluna única `max-width:70ch`, `margin-inline:auto` |
| Cabeçalho | H1 `.h2` "Política de Privacidade"; resumo de 1 frase em `--text-base` muted; data "Última atualização: {data}" em mono `--text-sm` muted |
| Resumo | "Pedimos só o necessário para responder ao seu orçamento, guardamos por 6 meses e não vendemos nem compartilhamos seus dados para marketing." |
| Índice | `<nav aria-label="Nesta página">` com `<ol>` de âncoras para cada H2; caixa `border:1px solid var(--color-border); border-radius:var(--radius-md); padding:16px 24px; background:rgba(255,255,255,.02)`; links com `min-height:44px`; não sticky |
| Seções | `<section id aria-labelledby>` com H2 (`--text-xl`); separador `border-top:1px solid var(--color-border)` + `padding-top: var(--space-8)`; `scroll-margin-top:96px` |
| Texto | `--text-base`/1.7; `ul` com `padding-left:1.25em`; subitens em negrito 600, sem H3 |
| Links | `--color-text`, sublinhado ciano offset 4px (regra existente) |
| Fim | `.btn.btn-ghost` "Voltar ao início" |
| Movimento | nenhum |

H2 (ordem LGPD-02): 1 Quem somos (controlador Felipe Salles, nome fantasia Dmarques, Ibitinga/SP, `contato@agenciadmarques.com.br`); 2 Quais dados coletamos; 3 Para que usamos e base legal (Art. 7º V e IX); 4 Com quem compartilhamos (Vercel, Resend, Upstash, GoDaddy; transferência internacional EUA); 5 Por quanto tempo guardamos (6 meses); 6 Cookies e análise de acesso (nenhum cookie de rastreamento); 7 Segurança; 8 Seus direitos (Art. 18) e prazo de até 15 dias; 9 Encarregado e canal de contato (Resolução CD/ANPD nº 2/2022); 10 Mudanças nesta política.

Tabela de operadores: `<table>` com `<caption class="sr-only">Operadores de dados</caption>`, colunas "Quem", "Para quê", "Onde", `th scope`. `width:100%; border-collapse:collapse; --text-sm`; `th` 600 `--color-text`; `td` muted; `border-bottom:1px solid var(--color-border)`. Envolvida em `div role="region" aria-label="Operadores de dados" tabindex="0"` com `overflow-x:auto`.

---

## Responsivo

| Largura | Comportamento |
|---------|---------------|
| ≤900px (container `site`) | contato em 1 coluna; `.alert` ocupa largura total do card |
| ≤560px | botão WhatsApp de fallback `width:100%`; tabela rola horizontalmente |
| Teclado virtual | `scroll-margin-top:96px` nos campos para o header sticky não cobrir o erro focado |

---

## Movimento e reduced-motion

| Momento | Contrato |
|---------|----------|
| `.msg` e `.alert` | sem animação (display toggle); sem shake |
| Spinner | 0.7s linear em `.sending`; estático sob reduced-motion |
| ✓ do sucesso | `draw` 0.5s; completo sob reduced-motion |
| Troca form -> sucesso | instantânea |
| `.svc-wa` | transform ≤0.2s; só cor sob reduced-motion |
| Páginas /obrigado, /erro-envio, política | sem animação de entrada |

Transições permitidas: transform, opacity, box-shadow, border-color, color, ≤300ms.

---

## Restrições CSP / performance

- Zero `style=""` pelo JS; estados via classes, `hidden`, `aria-*`, `data-*`.
- `href` via `setAttribute`; texto via `textContent` (nunca `innerHTML`).
- `src/scripts/form.ts` entra no bundle único; orçamento total <20 KB (D-24). Sem biblioteca de validação; regras espelham `src/lib/form-schema.ts`.
- Nenhuma origem de terceiros; analytics não dispara em interação do formulário.
- Política em HTML estático sem imagens.

---

## Copywriting Contract

| Elemento | Copy |
|----------|------|
| CTA primário (título do form) | Pedir orçamento |
| Seletor de canal (D-28) | legenda "Prefiro contato por"; pílulas "WhatsApp" e "E-mail" |
| Submit | Enviar pedido de orçamento |
| Submit enviando | Enviando… |
| Submit após 429 | Tente novamente em alguns minutos |
| Sucesso (título) | Pedido enviado. |
| Sucesso (corpo) | Respondemos no mesmo dia útil pelo contato que você informou. |
| Sucesso (ação) | Falar agora no WhatsApp |
| Estado vazio | Não aplicável (form começa vazio; a política não é lista) |
| Erro de servidor/rede | Não conseguimos enviar agora. Seus dados continuam aqui. Tente de novo em instantes ou fale com a gente pelo WhatsApp. |
| Erro 429 | Recebemos muitos pedidos em pouco tempo. Para não perder o seu, fale com a gente direto pelo WhatsApp. Respondemos no mesmo dia útil. |
| Erros de campo | tabela de validação acima |
| Live | "Há N campos para corrigir." / "Enviando pedido…" / "Pedido enviado. Respondemos no mesmo dia útil." |
| Aviso LGPD | Usamos seus dados só para responder a este pedido. Veja a Política de Privacidade. |
| Link de serviço | Falar sobre isso no WhatsApp |
| Ações destrutivas | Nenhuma nesta fase; sem confirmação |
| Proibido | termos técnicos (Resend, Upstash, 429, rate limit) fora da política; "eu"; métricas inventadas |

Voz "nós". Na política, "Quem somos" nomeia Felipe Salles como controlador (D-14); siglas (LGPD, ANPD) explicadas na primeira ocorrência.

---

## Acessibilidade (checklist verificável)

- [ ] Todo erro de campo: texto + borda + `aria-invalid="true"` + `aria-describedby` (no campo de contato visível).
- [ ] Seletor de canal (D-28): `fieldset` + `legend` "Prefiro contato por", rádios nativos navegáveis por setas, foco visível na pílula, campo oculto `disabled` com JS.
- [ ] `#form-status` sempre no DOM, `aria-live="polite"`, sr-only; limpar antes de definir texto.
- [ ] Foco: primeiro campo inválido; `#ok-title` no sucesso; título do alert em falha/429.
- [ ] Botão desabilitado em voo com `aria-disabled` e guarda no handler.
- [ ] Contraste: `--color-danger-text` ≥4.5:1; muted ~7.8:1; ring ciano 2px offset 3px.
- [ ] Alvos ≥44px.
- [ ] Política: um H1, H2 sequenciais, `nav` com `aria-label`, tabela com `caption`/`scope`.
- [ ] Honeypot `aria-hidden` + `tabindex="-1"`.
- [ ] Zero `style=""`; `prefers-reduced-motion` respeitado.

---

## Decisões de design tomadas por defeito

| # | Decisão | Motivo |
|---|---------|--------|
| 1 | Remover "Enviar outro pedido" | D-19 |
| 2 | Rota `/erro-envio?motivo=` com allow-list | evita redirect para URL do cliente |
| 3 | Inputs `readonly` + botão `disabled` em voo | evita edição divergente |
| 4 | Submit desabilitado 60 s após 429 | evita martelar o endpoint |
| 5 | Índice da política sem sticky e sem JS | simplicidade e Lighthouse |
| 6 | Tabela em wrapper rolável | evita reflow complexo no mobile |
| 7 | Link de serviço sem ember | ember já usado na tela |
| 8 | Rótulo do campo de contato só para leitor de tela; a pílula marcada é o rótulo visível | D-28: manter a altura do card proporcional ao sketch (≤ +40px a 1440px) |
| 9 | Sem mover o foco ao trocar de canal | preserva a navegação por setas no grupo de rádios |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | nenhum (não inicializado) | não aplicável |
| Terceiros | nenhum | não aplicável |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-10-15
