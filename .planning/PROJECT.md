# Dmarques — Site institucional

## What This Is

Landing page one-page em Astro para a **Dmarques Soluções Web**, agência de
desenvolvimento web de Felipe Salles (Ibitinga, SP) que faz sites institucionais,
sistemas sob medida, soluções web e automações. O site é a vitrine e o canal de
captação de orçamentos da agência: apresenta os serviços, o método de trabalho e
o fundador, e converte visitantes em contato via formulário e WhatsApp.

O nome oficial do negócio (Google Business Profile, JSON-LD, copyright do rodapé,
og:site_name e títulos de páginas secundárias) é **Dmarques Desenvolvimento Web**
(Fase 6, D-01).

## Core Value

Um visitante entende em segundos o que a Dmarques faz, confia na agência e pede
um orçamento — com um site que carrega rápido e nunca sai do ar.

## Requirements

### Validated

- **Fase 1 (Foundation & CI Gate) — 2026-09-10.** Scaffold Astro 7 estático + adapter
  Vercel, fontes self-hosted (Outfit/DM Sans, zero Google Fonts), design tokens em um
  CSS, `BaseLayout` pt-BR + página placeholder. Pipeline de CI bloqueante no repo
  público `Felipe-Salles/dmarques` (`astro check` + build + `pnpm audit` + Dependency
  Review + gate de peso de JS <20 KB + Lighthouse mobile ≥95 em Perf/A11y/Best
  Practices contra a preview da Vercel), branch protection em `main`, Deployment
  Protection + bypass secret, e o ritual SEC-07 (checklist versionada + run datado por
  fase, sem achado High em aberto). Todo INFRA-*, PERF-01..04 e SEC-07 da Fase 1
  contabilizados (INP de campo e SEO ≥95 vs produção conscientemente adiados para
  monitoramento pós-launch e Fase 6).
- **Fase 4 (Progressive-Enhancement Effects) — 2026-09-17.** Reveal ao rolar
  (IntersectionObserver + fallback 2600ms), glow do cursor (dual-gated a
  `pointer:fine` + `prefers-reduced-motion:no-preference`) e canvas de partículas do
  hero animado com pausa dupla (fora-de-tela via IntersectionObserver + aba oculta
  via `visibilitychange`), DPR travado em 1.5, tudo guardado por
  `prefers-reduced-motion`. Provado por medição instrumentada via CDP (não leitura de
  código): pausa do loop cai para 14,5%/7,2% do baseline, reduced-motion desenha um
  frame e para. Lighthouse mobile ≥0.95 em Performance/Accessibility/Best Practices
  contra o preview real (TBT/CLS dentro do teto), JS bundle 2645B (orçamento
  20480B). SEC-07 sem achado High, aprovado explicitamente por Felipe. ANIM-01,
  ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-09 validados. (float/pulse e hover nos
  cards/botões já existiam como CSS puro desde a Fase 3 — não fazem parte do escopo
  desta fase.)
- **Fase 6 (SEO, metadados e dados estruturados) — 2026-10-17.** Head de SEO completo
  (title, description, canonical absoluto, Open Graph, Twitter `summary_large_image`,
  ícones, theme-color), imagem de compartilhamento 1200×630 (31 KB), `sitemap.xml`
  via `@astrojs/sitemap` só com a home, `robots.txt` e JSON-LD
  `ProfessionalService`/`LocalBusiness` gerado de `src/lib/business.ts`, a fonte única
  de NAP que alimenta também o rodapé e o contato. Gate `seo-gates.mjs` (10 checks) no
  CI; Lighthouse de preview com 9 auditorias de SEO em nível error e job de produção
  exigindo ≥0.95 nas quatro categorias (passou). Rich Results 0 erros no código e na
  URL real, card do LinkedIn e prévia do WhatsApp aprovados por Felipe. PR #6.
  SEO-01, SEO-03, SEO-04, SEO-05, SEO-06, SEO-08 validados.

### Active

- [ ] Site Astro estático publicado na Vercel, com as 9 seções do design (Hero
  Bleed, Serviços, Como trabalhamos, Diferenciais, Sobre, Contato, FAQ, CTA
  final, Rodapé)
- [ ] Hero variante "03 Bleed" fielmente reproduzido (nav, headline, CTAs
  "Começar um projeto" / WhatsApp, canvas de partículas, render 3D sangrando na
  borda, card de depoimento em glass)
- [ ] Orçamento de performance mantido: Lighthouse ≥ 95 em Performance/SEO/Best
  Practices/Accessibility, `prefers-reduced-motion` respeitado, sem JavaScript
  que bloqueie a renderização, animações só em `transform`/`opacity`, canvas de
  partículas pausado fora da viewport
- [ ] Formulário "Pedir orçamento" funcional: endpoint Astro na Vercel envia via
  API do Resend, com validação server-side, honeypot e rate-limiting
- [ ] Conteúdo (serviços, passos do processo, diferenciais, FAQ, textos) em Astro
  Content Collections / Markdown — 100% estático, sem CMS
- [x] SEO técnico: meta tags, Open Graph/Twitter cards, `sitemap.xml`,
  `robots.txt`, JSON-LD `LocalBusiness` (Fase 6)
- [ ] Analytics sem cookies (Vercel Analytics ou Plausible/Umami) — sem dado
  pessoal, sem banner obrigatório
- [ ] Conformidade LGPD: coleta mínima; política e aviso detalhado removidos (D-29),
  resta só a frase curta de uso de dados sob o botão
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
- **LGPD**: coleta mínima de dados no formulário, com base legal registrada
  internamente; política e aviso detalhado removidos por decisão do Felipe (D-29).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro em modo estático (SSG) | Pedido do cliente; HTML pré-renderado é o mais rápido e a menor superfície de ataque | — Pending |
| Hero "03 Bleed" | Escolha explícita do cliente entre as 3 variantes do design | ⚠️ Substituído (2026-10-15) pela direção Aurora técnica — hero centrado sob a aurora (Fase 04.1) |
| Conteúdo em Markdown / Content Collections, sem CMS | Elimina painel administrativo como vetor de ataque; build 100% estático | — Pending |
| Formulário via endpoint Astro na Vercel + Resend | Gratuito (3.000/mês), segredo fica no servidor, controle total de validação/rate-limit | — Pending |
| Hospedagem na Vercel na v1 | Decisão do cliente; deploy imutável, HTTPS e headers automáticos | — Pending |
| Cloudflare adiado para o milestone 2 | WAF, rate-limiting de borda e mitigação de DDoS/flood entram numa segunda etapa | — Pending |
| Revisão de segurança ao fim de cada fase (`/gsd:secure-phase`) | Requisito explícito do cliente | — Pending |
| Analytics sem cookies | Evita banner de consentimento e reduz exposição de dados pessoais (LGPD) | — Pending |
| Logo nova (símbolo + logotipo) e favicon derivado do símbolo | Identidade visual entregue pelo Felipe; lockup aplicado via astro:assets | ✓ Aplicado 2026-10-14 (quick 261014-gfb) |
| Contato real: contato@agenciadmarques.com.br, @agenciadmarques, foto real do fundador | Substitui e-mail/Instagram pessoais e placeholder — confiança na hora da conversão | ✓ Aplicado 2026-10-15 (quick 261015-2fr / 261015-2ks) |
| Direção visual "Aurora técnica" (sketch 001, variante A) | Escolhida pelo Felipe entre 6 propostas: elegante tech, premium, nada genérico; paleta da logo (#070A14, aurora #00C8FF→#3A5BFF→#0E1E5B, ember #FF6A3D só como ação), Sora + Inter Tight; polida com Impeccable | — Pending (Fase 04.1) |
| Voz "nós" e CTA único "Pedir orçamento" | Consistência; linguagem leiga e só claims já publicados (FAQ/case) | — Pending (Fase 04.1) |
| D-29: sem página de política de privacidade e sem aviso detalhado no formulário | Felipe decidiu remover a Política de Privacidade e não exibir aviso de privacidade detalhado no formulário; permanece só a frase curta sob o botão. Risco registrado: transparência do art. 9º da LGPD (controlador, finalidade, base legal, retenção, operadores, direitos) deixa de ser publicada no site. | Aplicado 2026-10-16 (05-12, revisado) |
| Movimento "a luz acende" hand-rolled (CSS + IntersectionObserver) | Reveal ao rolar distinto por seção sem biblioteca; fallback sem JS e reduced-motion; canvas de partículas aposentado | — Pending (Fase 04.1) |
| Sem hero fixado / scrollytelling (modo cinemático) | Testado no sketch e rejeitado pelo Felipe | ✓ Decidido 2026-10-15 |
| Redesign como Fase 04.1, antes da Fase 5 | Formulário é ligado ao backend já no markup novo (evita retrabalho) | ✓ Decidido 2026-10-15 |
| NAP em fonte única (`src/lib/business.ts`) | Nome, telefone, e-mail e cidade alimentam JSON-LD, rodapé e contato a partir de um só módulo; `seo-gates.mjs` no CI bloqueia regressões | ✓ Aplicado (Fase 6) |
| LGPD: bases legais Art. 7º V (pedido de orçamento) + IX (antiabuso e medição agregada); retenção de 6 meses para pedidos de quem não virou cliente; sem encarregado formal (Res. CD/ANPD nº 2/2022) | Decisão do fundador (Fase 5, D-15/D-16); coleta mínima; expurgo manual mensal da caixa GoDaddy documentado em docs/operacao-formulario.md | ✓ Decidido (2026-09-24) — refletido em /politica-de-privacidade |

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
*Last updated: 2026-10-17 after Phase 6 completion*
