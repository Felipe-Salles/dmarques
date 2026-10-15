# Conteúdo, voz e formulário

## Design Decisions

- **Voz "nós" (agência)** em todo o site — decisão do Felipe. O Sobre apresenta o fundador em terceira
  pessoa ("A dmarques é conduzida por Felipe Salles…") e mantém "Você fala com quem escreve o código."
- **CTA único:** "Pedir orçamento" (header, hero, card-convite, título do formulário). Secundário: "Ver projetos".
  Submit: "Enviar pedido de orçamento".
- **Linguagem leiga, fatos verificáveis:** "~1,5 s para abrir no celular", "95+ no Google PageSpeed",
  "zero cookies de rastreamento" (dados do case real: LCP ~1,5s, Lighthouse ≥95, analytics sem cookies).
  Termos LCP/TBT/CLS/CSP ficam só na página do case.
- **Prova honesta:** só 1 case real ("No ar · projeto próprio"); demais são "Exemplo de escopo", sem
  métricas inventadas. Card-convite fecha o bento.
- **Claims só a partir de fatos publicados** (FAQ/case): "Nada é cobrado antes de você aprovar o plano",
  "Escopo e prazo saem fechados na proposta, depois do diagnóstico", "Respondemos no mesmo dia útil".
  Não inventar preço, prazo ou garantias novas.
- **Dados reais:** e-mail `contato@agenciadmarques.com.br`; WhatsApp (16) 99611-1785; Instagram
  `@agenciadmarques`; domínio `agenciadmarques.com.br`; foto `src/assets/founder/felipe-salles.png`.
- **"O que acontece depois"** no contato: 1) respondemos pelo WhatsApp no mesmo dia útil; 2) fazemos o
  diagnóstico; 3) você recebe a proposta com escopo e prazo fechados.

## Formulário (padrão validado no sketch)

- Campos: Nome (obrigatório), WhatsApp (obrigatório, máscara `(DD) 9XXXX-XXXX`), Tipo de projeto
  (chips opcionais, **nada pré-selecionado**, clicar de novo desmarca), Mensagem (opcional).
  A Fase 5 define o schema final (inclui e-mail e regra "WhatsApp ou e-mail").
- Labels visíveis (não só placeholder); `(opcional)` explícito; inputs ≥48px; chips ≥44px.
- Validação no blur (só se preenchido) e no submit; erro com texto + `aria-invalid` + `aria-describedby`;
  foco no primeiro erro; região `aria-live` sempre renderizada (sr-only) anunciando "Há N campos para corrigir",
  "Enviando pedido…", "Pedido recebido…".
- Estados: idle → enviando (botão desabilitado + spinner) → sucesso (formulário **escondido**, ✓ desenhado,
  foco no título "Pedido recebido.", "Enviar outro pedido" que reseta campos, chips e erros).
- Aviso LGPD junto ao botão: "Usamos seus dados só para responder este pedido. Política de privacidade".
- Mensagens de erro humanas com exemplo: "Use DDD + número, ex.: (16) 99611-1785."

## What to Avoid

- Mistura de "eu" e "nós"; 4 rótulos diferentes para o mesmo CTA.
- Jargão técnico para o público leigo; métricas sem link.
- Chip pré-selecionado; sucesso que deixa o formulário visível; live region com `display:none`.
- E-mail pessoal (@hotmail) e Instagram pessoal.

## Origin

Synthesized from sketches: 001 (rodada 2 — polish Impeccable; dados reais aplicados em 2026-10-15)
Source files available in: sources/001-aurora-landing/
