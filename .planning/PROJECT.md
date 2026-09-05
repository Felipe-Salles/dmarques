# Dmarques — Site institucional

## What This Is

Landing page one-page em Astro para a **Dmarques Soluções Web**, agência de
desenvolvimento web de Felipe Salles (Ibitinga, SP) que faz sites institucionais,
sistemas sob medida, soluções web e automações. O site é a vitrine e o canal de
captação de orçamentos da agência: apresenta os serviços, o método de trabalho e
o fundador, e converte visitantes em contato via formulário e WhatsApp.

## Core Value

Um visitante entende em segundos o que a Dmarques faz, confia na agência e pede
um orçamento — com um site que carrega rápido e nunca sai do ar.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Site Astro estático publicado na Vercel, com as 9 seções do design (Hero
  Bleed, Serviços, Como trabalhamos, Diferenciais, Sobre, Contato, FAQ, CTA
  final, Rodapé)
- [ ] Hero variante "03 Bleed" fielmente reproduzido (nav, headline, CTAs
  "Começar um projeto" / WhatsApp, canvas de partículas, render 3D sangrando na
  borda, card de depoimento em glass)
- [ ] Efeitos visuais do design reproduzidos: reveal ao rolar (fade + translateY
  com stagger), glow que segue o cursor, float/pulse, hover nos cards e botões
- [ ] Orçamento de performance mantido: Lighthouse ≥ 95 em Performance/SEO/Best
  Practices/Accessibility, `prefers-reduced-motion` respeitado, sem JavaScript
  que bloqueie a renderização, animações só em `transform`/`opacity`, canvas de
  partículas pausado fora da viewport
- [ ] Formulário "Pedir orçamento" funcional: endpoint Astro na Vercel envia via
  API do Resend, com validação server-side, honeypot e rate-limiting
- [ ] Conteúdo (serviços, passos do processo, diferenciais, FAQ, textos) em Astro
  Content Collections / Markdown — 100% estático, sem CMS
- [ ] SEO técnico: meta tags, Open Graph/Twitter cards, `sitemap.xml`,
  `robots.txt`, JSON-LD `LocalBusiness`
- [ ] Analytics sem cookies (Vercel Analytics ou Plausible/Umami) — sem dado
  pessoal, sem banner obrigatório
- [ ] Conformidade LGPD: página de Política de Privacidade (o formulário coleta
  nome e WhatsApp) e aviso de uso de dados no formulário
- [ ] Seção de portfólio / cases (pode iniciar com 1–2 exemplos ou placeholders)
- [ ] Segurança revisada a cada fase: Content-Security-Policy e cabeçalhos de
  segurança (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy),
  superfície de dependências mínima, sem segredos no cliente, deploy imutável na
  Vercel

### Out of Scope

- CMS / painel administrativo — conteúdo em Markdown é suficiente para a v1 e
  elimina uma superfície de ataque inteira
- Cloudflare (WAF, rate-limiting de borda, mitigação de DDoS/flood, Turnstile no
  formulário) — planejado para o **milestone 2**
- Múltiplas páginas / blog / rotas além da landing e da Política de Privacidade
- Área de cliente, login, autenticação — a agência não tem produto logado
- Internacionalização — site só em português (pt-BR)
- Armazenar leads em banco de dados — na v1 o formulário só envia e-mail
- E-commerce / pagamentos online

## Context

- **Design pronto:** `arquivos de design/Dmarques Landing.dc.html` é um canvas do
  Claude Design com 3 variantes de hero (01 Split, 02 Centro, 03 Bleed). A v1 usa
  a **03 Bleed**. Os arquivos `image-slot.js` e `support.js` são runtime do
  editor de design, não código de produção.
- **Tokens de design:** fundo `#0A0A12` / `#05050A`, acento `#6C4CFF`, acento
  claro `#9A85FF`, fundos claros `#F2F3F6` / `#F7F8FA`. Fontes: **Outfit**
  (títulos, 300–800) e **DM Sans** (corpo), via Google Fonts.
- **Contato real:** WhatsApp (16) 99611-1785 → `wa.me/5516996111785`; e-mail
  `felipe.salles1@hotmail.com`; Instagram `@felipe.salles1`; Ibitinga, SP.
- **Padrões de animação já prototipados no design:** IntersectionObserver com
  `rootMargin: 0px 0px -8% 0px` e fallback por timeout; glow via `pointermove` +
  `requestAnimationFrame`; canvas de partículas com `devicePixelRatio` limitado a
  2 e contagem de pontos proporcional à área.
- **Agência nova:** o próprio site comunica "agência nova, método definido" — o
  portfólio pode começar enxuto.
- **Segurança é requisito de primeira classe** por pedido explícito do cliente:
  "ninguém pode atacar, derrubar ou alterar o site". Revisão de segurança
  obrigatória ao fim de cada fase.

## Constraints

- **Tech stack**: Astro (site estático / SSG) — escolha do cliente. Sem framework
  de UI pesado; usar ilhas só onde houver interatividade real (formulário,
  canvas, glow).
- **Hospedagem**: Vercel na v1. O build precisa sair como estático + uma função
  serverless para o endpoint do formulário.
- **Performance**: Lighthouse ≥ 95 em todas as categorias; JS de terceiros
  mínimo; fontes com `display=swap` e preconnect; imagens otimizadas
  (`astro:assets`).
- **Segurança**: cobrir os princípios básicos (confidencialidade, integridade,
  disponibilidade) a cada fase; CSP restritiva; nenhum segredo no bundle do
  cliente; dependências auditadas (`npm audit` limpo).
- **Acessibilidade**: `prefers-reduced-motion`, contraste AA, navegação por
  teclado, HTML semântico.
- **Idioma**: pt-BR apenas.
- **LGPD**: coleta mínima de dados no formulário, com base legal e política
  publicada.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro em modo estático (SSG) | Pedido do cliente; HTML pré-renderado é o mais rápido e a menor superfície de ataque | — Pending |
| Hero "03 Bleed" | Escolha explícita do cliente entre as 3 variantes do design | — Pending |
| Conteúdo em Markdown / Content Collections, sem CMS | Elimina painel administrativo como vetor de ataque; build 100% estático | — Pending |
| Formulário via endpoint Astro na Vercel + Resend | Gratuito (3.000/mês), segredo fica no servidor, controle total de validação/rate-limit | — Pending |
| Hospedagem na Vercel na v1 | Decisão do cliente; deploy imutável, HTTPS e headers automáticos | — Pending |
| Cloudflare adiado para o milestone 2 | WAF, rate-limiting de borda e mitigação de DDoS/flood entram numa segunda etapa | — Pending |
| Revisão de segurança ao fim de cada fase (`/gsd:secure-phase`) | Requisito explícito do cliente | — Pending |
| Analytics sem cookies | Evita banner de consentimento e reduz exposição de dados pessoais (LGPD) | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

**Milestone 2 (planejado):** colocar Cloudflare na frente do site — WAF, regras
de rate-limiting, mitigação de DDoS/flood de requisições e Turnstile (captcha) no
formulário de orçamento.

---
*Last updated: 2026-09-05 after initialization*
