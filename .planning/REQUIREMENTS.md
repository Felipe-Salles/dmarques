# Requirements: Dmarques — Site institucional

**Defined:** 2026-09-05
**Core Value:** Um visitante entende em segundos o que a Dmarques faz, confia na
agência e pede um orçamento — com um site que carrega rápido e nunca sai do ar.

## v1 Requirements

### Infraestrutura & Build (INFRA)

- [x] **INFRA-01**: Projeto Astro 7 com `output: 'static'` e adapter
  `@astrojs/vercel`, gerando HTML pré-renderado para todas as páginas exceto o
  endpoint do formulário
- [x] **INFRA-02**: Desenvolvedor consegue rodar o site localmente com um comando
  (`pnpm dev`) e gerar build de produção com `pnpm build`
- [x] **INFRA-03**: Fontes Outfit e DM Sans self-hosted (Astro Fonts API /
  Fontsource) — nenhuma requisição a Google Fonts em produção
- [x] **INFRA-04**: Tokens de design (cores, fontes, raios, sombras) definidos
  como CSS custom properties em um único arquivo, consumidos por todos os
  componentes
- [x] **INFRA-05**: `build.inlineStylesheets: 'never'` — todo CSS sai como arquivo
  externo (pré-requisito da CSP estrita)
- [x] **INFRA-06**: Segredos de servidor declarados via `astro:env`
  (`context: 'server', access: 'secret'`); `RESEND_API_KEY` nunca presente no
  bundle do cliente
- [x] **INFRA-07**: Deploy contínuo na Vercel via integração Git, com preview
  deploy por pull request
- [x] **INFRA-08**: Pipeline de CI que roda `astro check`, build, `pnpm audit` e
  Dependency Review, bloqueando merge em caso de falha
- [x] **INFRA-09**: Lighthouse CI no CI (preset mobile, CPU 4x, Slow 4G) exigindo
  ≥ 95 em Performance, SEO, Best Practices e Accessibility contra o preview
- [x] **INFRA-10**: Conta/repо Vercel endurecidos — 2FA, branch de produção
  protegida, Deployment Protection nos previews, spend cap com alerta de uso

### Conteúdo (CONTENT)

- [x] **CONTENT-01**: Conteúdo de serviços, processo, diferenciais e FAQ em Astro
  Content Collections (YAML), validado por schema Zod no build
- [x] **CONTENT-02**: Cases de portfólio em Content Collection (Markdown) com capa
  via helper `image()`, estrutura problema → solução → resultado
- [x] **CONTENT-03**: 1–2 entradas de case reais ou honestamente rotuladas
  ("projeto próprio" / "demo") publicadas na v1
- [x] **CONTENT-04**: FAQ é fonte única — o mesmo conteúdo alimenta a seção visível
  e o JSON-LD `FAQPage`
- [x] **CONTENT-05**: O enum "tipo de projeto" do conteúdo é a mesma allow-list
  usada na validação do formulário

### Seções da Página (SITE)

- [ ] **SITE-01**: Landing one-page com as 9 seções do design, em ordem: Hero
  (03 Bleed), Serviços, Como trabalhamos, Diferenciais, Sobre, Contato, FAQ, CTA
  final, Rodapé
- [ ] **SITE-02**: Hero "03 Bleed" reproduzido fielmente — nav, headline, dois
  CTAs ("Começar um projeto" e WhatsApp), área do render 3D sangrando na borda,
  card de depoimento em glass
- [ ] **SITE-03**: Todas as seções renderizam com zero JavaScript de cliente
  (markup `.astro` puro consumindo as collections)
- [ ] **SITE-04**: Nenhum atributo `style=""` de autor no código-fonte —
  `grep -r 'style="' src/` não retorna nada; estados `:hover`/`:focus-visible`
  são CSS real, não atributos do editor de design
- [x] **SITE-05**: Navegação por âncora (#servicos, #processo, #sobre, #contato)
  com `scroll-margin-top` para o alvo não ficar sob o cabeçalho
- [x] **SITE-06**: Navegação mobile operável por teclado, sem framework JS
  (linha rolável ou disclosure `<details>`), sem prender foco
- [x] **SITE-07**: Página de agradecimento (`/obrigado`) para o fluxo do
  formulário sem JS
- [x] **SITE-08**: Página 404 com identidade visual e link para a home
- [x] **SITE-09**: Imagens via `astro:assets` com dimensões explícitas e formatos
  AVIF/WebP; imagem do hero com `fetchpriority="high"`

### Animações & Movimento (ANIM)

- [ ] **ANIM-01**: Reveal ao rolar — `opacity` + `translateY` com stagger, via um
  único IntersectionObserver, elemento deixa de ser observado após disparar, com
  fallback por timeout (~2,6 s)
- [x] **ANIM-02**: Estado inicial oculto do reveal só se aplica com classe
  `.js-ready` no `<html>` E `prefers-reduced-motion: no-preference` — sem JS ou
  com erro de JS, a página fica 100% visível
- [ ] **ANIM-03**: Glow que segue o cursor — gradiente radial fixo via
  `pointermove` + `requestAnimationFrame`, `pointer-events:none`, `aria-hidden`,
  só com `pointer:fine` e sem reduced-motion
- [ ] **ANIM-04**: Canvas de partículas como componente island (`client:visible`),
  `aria-hidden="true"`, pausado por IntersectionObserver quando fora da viewport
  e em `document.hidden`
- [ ] **ANIM-05**: Canvas de partículas respeita `prefers-reduced-motion`
  (renderiza um frame estático ou não renderiza), limita DPR a ~1,5 e reduz a
  contagem de pontos em viewport pequena / dispositivos de poucos núcleos /
  data-saver
- [ ] **ANIM-06**: Keyframes `dmFloat` e `dmPulse` com `animation: none` sob
  reduced-motion; elementos legíveis sem a animação
- [x] **ANIM-07**: Cada estado `:hover` tem um `:focus-visible` equivalente;
  transições só em `transform`/`opacity`/`box-shadow`/`border-color`, ≤ 300 ms
- [x] **ANIM-08**: `scroll-behavior: smooth` vira `auto` sob reduced-motion
- [ ] **ANIM-09**: Nenhuma animação anima propriedades que causam layout; sem
  parallax/scroll-jacking; sem preloader/splash

### Formulário de Orçamento (FORM)

- [ ] **FORM-01**: Formulário "Pedir orçamento" com campos Nome, WhatsApp,
  E-mail, Tipo de projeto e Mensagem; ao menos um entre WhatsApp e e-mail é
  obrigatório
- [ ] **FORM-02**: `<form method="POST" action="/api/orcamento">` funciona sem
  JavaScript — envio nativo redireciona (303) para `/obrigado`
- [ ] **FORM-03**: Island de progressive enhancement faz `fetch` com
  `preventDefault`, mostra estados idle / enviando / sucesso / erro inline,
  preserva o que foi digitado em caso de erro e desabilita o submit durante o
  envio
- [ ] **FORM-04**: Validação server-side com Zod (nome 2–80 chars, telefone ou
  e-mail bem-formados, tipo ∈ enum, mensagem ≤ 2000 chars) — servidor é a fonte
  da verdade
- [ ] **FORM-05**: Validação client-side inline (no blur / no submit, nunca a cada
  tecla) espelhando o schema, sem bloquear o submit
- [ ] **FORM-06**: Mensagens de erro e status acessíveis — texto (não só cor),
  `aria-invalid`, `aria-describedby` ligando campo→erro, região `aria-live`,
  foco movido para o primeiro erro; sucesso e falha anunciados
- [ ] **FORM-07**: Honeypot oculto (descartado, nunca enviado nem armazenado) +
  verificação de tempo de submissão (rejeita < ~3 s ou > ~2 h), ambos no servidor
- [ ] **FORM-08**: Rate limiting no endpoint — por IP (janela deslizante) mais um
  teto global horário e um teto diário rígido; resposta 429 com mensagem amigável
- [ ] **FORM-09**: E-mail enviado via Resend com `from`/`to`/`subject` fixos no
  servidor (nunca escolhidos pelo cliente), todo campo interpolado é
  HTML-escapado, CR/LF removidos de campos usados em subject/endereço, e sempre
  há corpo `text` além do HTML
- [ ] **FORM-10**: Endpoint retorna erros genéricos (sem stack trace), não faz
  redirect para URL fornecida pelo cliente, e limita o tamanho do corpo da
  requisição
- [ ] **FORM-11**: Regra de rate-limit no Vercel WAF aplicada a `/api/*`
- [ ] **FORM-12**: Estado de erro do formulário oferece o WhatsApp como caminho
  alternativo
- [ ] **FORM-13**: Deep-links de WhatsApp com `?text=` pré-preenchido por ponto de
  entrada (hero genérico; cards de serviço mencionam o serviço), URL-encoded,
  `rel="noopener"`

### LGPD & Privacidade (LGPD)

- [ ] **LGPD-01**: Página `/politica-de-privacidade` em pt-BR publicada **no mesmo
  release** do formulário ativo
- [ ] **LGPD-02**: Política cobre: identificação do controlador, encarregado/contato,
  dados coletados, finalidades, bases legais (Art. 7º V + IX), operadores
  (Vercel, Resend, ferramenta de analytics), transferência internacional (EUA),
  retenção, direitos do titular (Art. 18) e como exercê-los, ausência de cookies
  de rastreamento, inexistência de decisões automatizadas, reclamação à ANPD,
  data da última atualização
- [ ] **LGPD-03**: Aviso de uso de dados visível ao lado do botão de envio, com
  link para a Política de Privacidade (padrão notice-only, sem checkbox)
- [ ] **LGPD-04**: IP, user-agent e timestamp usados apenas durante a requisição
  (rate-limit e timing), nunca persistidos ou logados
- [ ] **LGPD-05**: Nenhum script de analytics/marketing dispara na interação com o
  formulário
- [ ] **LGPD-06**: Analytics sem cookies verificado no DevTools (zero cookies,
  sem ID persistente) antes do lançamento
- [ ] **LGPD-07**: Base legal e prazo de retenção documentados no repositório e
  refletidos na política (decisão do fundador registrada como Key Decision)

### SEO & Descoberta (SEO)

- [ ] **SEO-01**: `<title>`, meta description (~150 chars, cita Ibitinga, sites,
  sistemas, automação) e `<link rel="canonical">` absoluto por página
- [x] **SEO-02**: `<html lang="pt-BR">`
- [ ] **SEO-03**: Open Graph + Twitter Card completos e imagem de compartilhamento
  1200×630 estática (< 300 KB) desenhada, servida de `public/`
- [ ] **SEO-04**: `sitemap.xml` (via `@astrojs/sitemap`) e `robots.txt` (libera
  tudo, aponta o sitemap)
- [ ] **SEO-05**: Conjunto de favicons + `apple-touch-icon` + `theme-color`
  (#0A0A12)
- [ ] **SEO-06**: JSON-LD com `@type: ["ProfessionalService","LocalBusiness"]` —
  nome, descrição, url, telefone E.164, e-mail, `areaServed`, `address`
  (localidade, `addressRegion: "SP"`, `addressCountry: "BR"`), `sameAs`
  (Instagram), `image`/`logo`, `founder` (Person)
- [ ] **SEO-07**: JSON-LD `FAQPage` gerado da mesma fonte da FAQ visível, validado
  no Google Rich Results Test
- [ ] **SEO-08**: NAP (nome, endereço, telefone) idêntico entre rodapé e JSON-LD

### Acessibilidade (A11Y)

- [x] **A11Y-01**: Skip link ("Pular para o conteúdo") como primeiro elemento
  focável, visível ao receber foco, apontando para `<main id>`
- [x] **A11Y-02**: Landmarks semânticos (`header`/`nav`/`main`/`footer`), um único
  `<h1>`, hierarquia de headings correta
- [x] **A11Y-03**: `:focus-visible` visível em todo elemento interativo, com
  contraste ≥ 3:1 tanto nas seções escuras quanto nas claras
- [x] **A11Y-04**: Tudo que é interativo é operável por teclado, sem armadilha de
  foco (inclui nav mobile)
- [ ] **A11Y-05**: Texto alternativo real no retrato do fundador; render do hero,
  canvas e glow marcados como decorativos (`alt=""` / `aria-hidden`)
- [x] **A11Y-06**: Contraste de texto ≥ WCAG AA — tokens de branco translúcido de
  baixa opacidade elevados ao mínimo necessário (com aprovação de design)
- [x] **A11Y-07**: Todas as animações respeitam `prefers-reduced-motion`, com um
  caminho reduzido que ainda pareça acabado (fades limpos, não "sem movimento")

### Segurança (SEC)

- [ ] **SEC-01**: Cabeçalhos de segurança em `vercel.json` cobrindo todas as
  respostas: HSTS (com preload), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  (nega câmera/mic/geo), `X-Frame-Options: DENY` / `frame-ancestors 'none'`,
  COOP/CORP
- [ ] **SEC-02**: Content-Security-Policy entregue como header (não `<meta>`),
  `default-src 'self'`, `script-src 'self'` sem `unsafe-inline`/`unsafe-eval`,
  `style-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`,
  `frame-ancestors 'none'`, `upgrade-insecure-requests`
- [ ] **SEC-03**: CSP publicada primeiro como `Content-Security-Policy-Report-Only`
  no preview, confirmada sem violações no load e no submit do formulário, então
  promovida para enforcing
- [ ] **SEC-04**: `build.sourcemap` desativado em produção; páginas de erro
  customizadas sem informação de diagnóstico
- [ ] **SEC-05**: v1 carrega zero assets de terceiros (fontes self-hosted,
  analytics same-origin); qualquer asset externo futuro exige SRI (regra
  documentada)
- [ ] **SEC-06**: `securityheaders.com` nota ≥ A e verificação `curl -I` dos
  cabeçalhos no CI como checagem de regressão
- [ ] **SEC-07**: Checklist de revisão de segurança versionado em `.planning/`,
  executado ao fim de cada fase (`pnpm audit` limpo, grep por nova superfície
  inline, `curl -I` dos headers, varredura de segredos em `dist/`, verificação de
  "uma única Function", gate do Lighthouse, achados registrados com
  severidade/responsável/prazo); nenhuma fase fecha com achado High em aberto
- [ ] **SEC-08**: Declaração de risco residual escrita no ROADMAP — v1 não tem
  proteção de borda L3/L7 (DDoS/WAF), adiada para o milestone 2 (Cloudflare) —
  com os controles compensatórios da v1 listados (site 100% estático, rate-limit
  durável e global em `/api`, regra WAF da Vercel em `/api/*`, spend cap com
  alertas, DNS com TTL baixo para cutover rápido, runbook de flood)
- [ ] **SEC-09**: SPF, DKIM e DMARC (`p=none` → quarantine) configurados para o
  domínio de envio no Resend; nota mail-tester ≥ 8 antes do formulário ir ao ar
- [ ] **SEC-10**: Sem Astro View Transitions na v1 (decisão registrada) para não
  quebrar listeners de script na segunda navegação

### Performance (PERF)

- [x] **PERF-01**: Lighthouse ≥ 95 nas quatro categorias no preset mobile com CPU
  4x e Slow 4G, medido no CI a cada PR
- [x] **PERF-02**: Orçamentos de Web Vitals respeitados: LCP < 2,5 s, CLS < 0,05,
  TBT < 200 ms, INP < 200 ms
- [x] **PERF-03**: Peso de JavaScript na rota da landing < 20 KB (budget no CI);
  nenhum framework de UI, nenhuma biblioteca de animação
- [x] **PERF-04**: Fontes com `font-display: swap` e fallback com métricas
  ajustadas para não causar CLS; duas famílias/pesos críticos com `preload`
- [x] **PERF-05**: Nenhuma otimização de imagem em runtime (sem Vercel Image
  Optimization) — tudo processado no build com Sharp

## v2 Requirements

### Milestone 2 — Camada Cloudflare

- **CF-01**: Cloudflare na frente do site (DNS + proxy)
- **CF-02**: Regras de WAF e rate-limiting de borda contra flood de requisições
- **CF-03**: Mitigação de DDoS L3/L7 (encerra a declaração de risco residual da v1)
- **CF-04**: Cloudflare Turnstile no formulário de orçamento (substitui/reforça
  honeypot + timing)
- **CF-05**: Política de Privacidade atualizada incluindo a Cloudflare como
  operador
- **CF-06**: Delta de CSP para o Turnstile (`challenges.cloudflare.com`)

### Pós-validação (v1.x)

- **TRUST-01**: E-mail de domínio (`felipe@dmarques.com.br`) em todo o site,
  `mailto:`, JSON-LD, reply-to do Resend e política — substitui o `@hotmail.com`
- **TRUST-02**: CNPJ/MEI + razão social no rodapé
- **TRUST-03**: Google Business Profile criado e linkado, NAP idêntico ao JSON-LD
- **TRUST-04**: Depoimentos reais de clientes (componente e collection já prontos,
  populados após a primeira entrega)
- **TRUST-05**: Callout "este site: Lighthouse 100, sem cookies, acessível" com
  link real do PageSpeed
- **NAV-01**: Scroll-spy destacando a seção ativa na navegação (enhancement puro)
- **CRM-01**: Armazenamento de leads / mini-CRM (reavaliar retenção LGPD antes)
- **ANALYTICS-01**: Eventos de clique em WhatsApp/CTA para comparar os dois
  caminhos de conversão

## Out of Scope

| Feature | Reason |
|---------|--------|
| CMS / painel administrativo | Conteúdo em Markdown basta na v1; elimina uma superfície de ataque inteira |
| Banco de dados de leads (v1) | Fora de escopo; adiciona store para proteger e obrigação de retenção LGPD |
| Área de cliente / login / autenticação | A agência não tem produto logado; auth é grande superfície de ataque |
| i18n / versão em inglês | Negócio local; dobra a manutenção de conteúdo |
| Blog no lançamento | Cadência que um fundador solo raramente sustenta; quebra o one-page |
| Vídeo de fundo / autoplay no hero | Destrói o Lighthouse e contradiz o Core Value (velocidade) |
| Carrossel / slider | Baixo engajamento, risco de CLS, JS extra, ruim para teclado/leitor de tela |
| Widget de chat ao vivo (Intercom/Tawk/Crisp) | JS de terceiro + furo na CSP + novo operador LGPD; o WhatsApp já é o canal ao vivo |
| Banner de consentimento de cookies | O site não usa cookies não-essenciais; banner adiciona atrito e sugere rastreio inexistente |
| Google reCAPTCHA | Atrito de conversão, dados para o Google (transferência internacional LGPD); Turnstile no M2 resolve |
| Preloader / animação de intro / splash | Atraso artificial num site cujo argumento é velocidade |
| Cursor customizado que esconde o ponteiro nativo | Dano de usabilidade/acessibilidade; o glow aditivo do design fica |
| Parallax / scroll-jacking | Enjoo de movimento (WCAG 2.3.3), scroll imprevisível, quebra nav por âncora |
| Urgência falsa / contadores / "X vagas restantes" | Desonesto; corrói a confiança que uma agência nova precisa construir |
| Foto de "equipe" com banco de imagens | Contradiz o posicionamento de fundador solo do design |
| Formulário multi-etapas | Overkill para 3–5 campos; mais estado JS e mais modos de falha |
| Chatbot com IA | Risco de alucinação em preço/escopo; JS de terceiro + operador de dados |
| Agendamento online da call de Diagnóstico | Adiar até o volume de inbound justificar (v2+) |
| Páginas de detalhe por case | Quebra o modelo one-page; só vale com vários cases profundos |
| Astro View Transitions na v1 | Quebram listeners de script na segunda navegação (SEC-10) |

## Traceability

Mapped in ROADMAP.md (2026-09-05). Every v1 requirement is assigned to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| INFRA-06 | Phase 1 | Complete |
| INFRA-07 | Phase 1 | Complete |
| INFRA-08 | Phase 1 | Complete |
| INFRA-09 | Phase 1 | Complete |
| INFRA-10 | Phase 1 | Complete |
| CONTENT-01 | Phase 2 | Complete |
| CONTENT-02 | Phase 2 | Complete |
| CONTENT-03 | Phase 2 | Complete |
| CONTENT-04 | Phase 2 | Complete |
| CONTENT-05 | Phase 2 | Complete |
| SITE-01 | Phase 3 | Pending |
| SITE-02 | Phase 3 | Pending |
| SITE-03 | Phase 3 | Pending |
| SITE-04 | Phase 3 | Pending |
| SITE-05 | Phase 3 | Complete |
| SITE-06 | Phase 3 | Complete |
| SITE-07 | Phase 3 | Complete |
| SITE-08 | Phase 3 | Complete |
| SITE-09 | Phase 3 | Complete |
| ANIM-01 | Phase 4 | Pending |
| ANIM-02 | Phase 3 | Complete |
| ANIM-03 | Phase 4 | Pending |
| ANIM-04 | Phase 4 | Pending |
| ANIM-05 | Phase 4 | Pending |
| ANIM-06 | Phase 4 | Pending |
| ANIM-07 | Phase 3 | Complete |
| ANIM-08 | Phase 3 | Complete |
| ANIM-09 | Phase 4 | Pending |
| FORM-01 | Phase 5 | Pending |
| FORM-02 | Phase 5 | Pending |
| FORM-03 | Phase 5 | Pending |
| FORM-04 | Phase 5 | Pending |
| FORM-05 | Phase 5 | Pending |
| FORM-06 | Phase 5 | Pending |
| FORM-07 | Phase 5 | Pending |
| FORM-08 | Phase 5 | Pending |
| FORM-09 | Phase 5 | Pending |
| FORM-10 | Phase 5 | Pending |
| FORM-11 | Phase 5 | Pending |
| FORM-12 | Phase 5 | Pending |
| FORM-13 | Phase 5 | Pending |
| LGPD-01 | Phase 5 | Pending |
| LGPD-02 | Phase 5 | Pending |
| LGPD-03 | Phase 5 | Pending |
| LGPD-04 | Phase 5 | Pending |
| LGPD-05 | Phase 5 | Pending |
| LGPD-06 | Phase 5 | Pending |
| LGPD-07 | Phase 5 | Pending |
| SEO-01 | Phase 6 | Pending |
| SEO-02 | Phase 3 | Complete |
| SEO-03 | Phase 6 | Pending |
| SEO-04 | Phase 6 | Pending |
| SEO-05 | Phase 6 | Pending |
| SEO-06 | Phase 6 | Pending |
| SEO-07 | Phase 6 | Pending |
| SEO-08 | Phase 6 | Pending |
| A11Y-01 | Phase 3 | Complete |
| A11Y-02 | Phase 3 | Complete |
| A11Y-03 | Phase 3 | Complete |
| A11Y-04 | Phase 3 | Complete |
| A11Y-05 | Phase 3 | Pending |
| A11Y-06 | Phase 3 | Complete |
| A11Y-07 | Phase 3 | Complete |
| SEC-01 | Phase 7 | Pending |
| SEC-02 | Phase 7 | Pending |
| SEC-03 | Phase 7 | Pending |
| SEC-04 | Phase 7 | Pending |
| SEC-05 | Phase 7 | Pending |
| SEC-06 | Phase 7 | Pending |
| SEC-07 | Phase 1 (runs every phase) | Pending |
| SEC-08 | Phase 5 (statement written in ROADMAP.md) | Pending |
| SEC-09 | Phase 5 | Pending |
| SEC-10 | Phase 7 | Pending |
| PERF-01 | Phase 1 (gate runs every phase) | Complete |
| PERF-02 | Phase 1 | Complete |
| PERF-03 | Phase 1 | Complete |
| PERF-04 | Phase 1 | Complete |
| PERF-05 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 83 total (the earlier "78 total" was a miscount; 83 IDs are
  enumerated above)
- Mapped to phases: 83 / 83 ✓
- Unmapped: 0 ✓
- Cross-cutting: SEC-07 and PERF-01 have Phase 1 as their home but execute at
  every phase boundary — each phase's success criteria require both to pass.

---
*Requirements defined: 2026-09-05*
*Last updated: 2026-09-05 after roadmap creation (traceability mapped, count corrected 78 → 83)*
