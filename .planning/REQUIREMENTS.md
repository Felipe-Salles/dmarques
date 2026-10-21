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

- [x] **CONTENT-01**: Conteúdo de serviços, processo, diferenciais e FAQ (D-02: FAQ removida na 04.1) em Astro
  Content Collections (YAML), validado por schema Zod no build — FAQ (D-02) superseded na
  Fase 04.1 (D-02): a coleção `faq` foi removida.
- [x] **CONTENT-02**: Cases de portfólio em Content Collection (Markdown) com capa
  via helper `image()`, estrutura problema → solução → resultado
- [x] **CONTENT-03**: 1 case real (`projeto próprio`) + exemplos rotulados
  `exemplo de escopo` (enum `'projeto próprio' | 'exemplo de escopo'`, D-07 da Fase 04.1)
- [x] **CONTENT-04** (D-02 superseded): FAQ é fonte única — o mesmo conteúdo alimenta a seção visível
  e o JSON-LD `FAQPage` — superseded na Fase 04.1 (D-02): seção FAQ e coleção
  `faq` removidas; os claims migraram para Contato e Método. (D-02)
- [x] **CONTENT-05**: O enum "tipo de projeto" do conteúdo é a mesma allow-list
  usada na validação do formulário

### Seções da Página (SITE)

- [x] **SITE-01**: Landing one-page com as 9 seções do design, em ordem: Hero
  (03 Bleed), Serviços, Como trabalhamos, Diferenciais, Sobre, Contato, FAQ (D-02), CTA
  final, Rodapé — FAQ, Diferenciais (seção) e CTA final superseded na Fase 04.1 (D-02)
  (D-02/D-04/D-05).
- [x] **SITE-02**: Hero "03 Bleed" reproduzido fielmente — nav, headline, dois
  CTAs ("Começar um projeto" e WhatsApp), área do render 3D sangrando na borda,
  card de depoimento em glass
- [x] **SITE-03**: Todas as seções renderizam com zero JavaScript de cliente
  (markup `.astro` puro consumindo as collections)
- [x] **SITE-04**: Nenhum atributo `style=""` de autor no código-fonte —
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

- [x] **ANIM-01**: Reveal ao rolar — `opacity` + `translateY` com stagger, via um
  único IntersectionObserver, elemento deixa de ser observado após disparar, com
  fallback por timeout (~2,6 s)
- [x] **ANIM-02**: Estado inicial oculto do reveal só se aplica com classe
  `.js-ready` no `<html>` E `prefers-reduced-motion: no-preference` — sem JS ou
  com erro de JS, a página fica 100% visível
- [x] **ANIM-03**: Glow que segue o cursor — gradiente radial fixo via
  `pointermove` + `requestAnimationFrame`, `pointer-events:none`, `aria-hidden`,
  só com `pointer:fine` e sem reduced-motion — superseded na Fase 04.1 (D-12): glow de cursor e canvas de partículas removidos; a aurora estática é a única fonte de luz (AUR-11/AUR-13).
- [x] **ANIM-04**: Canvas de partículas como componente island (`client:visible`),
  `aria-hidden="true"`, pausado por IntersectionObserver quando fora da viewport
  e em `document.hidden` — superseded na Fase 04.1 (D-12): glow de cursor e canvas de partículas removidos; a aurora estática é a única fonte de luz (AUR-11/AUR-13).
- [x] **ANIM-05**: Canvas de partículas respeita `prefers-reduced-motion`
  (renderiza um frame estático ou não renderiza), limita DPR a ~1,5 e reduz a
  contagem de pontos em viewport pequena / dispositivos de poucos núcleos /
  data-saver — superseded na Fase 04.1 (D-12): glow de cursor e canvas de partículas removidos; a aurora estática é a única fonte de luz (AUR-11/AUR-13).
- [x] **ANIM-06**: Keyframes `dmFloat` e `dmPulse` com `animation: none` sob
  reduced-motion; elementos legíveis sem a animação
- [x] **ANIM-07**: Cada estado `:hover` tem um `:focus-visible` equivalente;
  transições só em `transform`/`opacity`/`box-shadow`/`border-color`, ≤ 300 ms
- [x] **ANIM-08**: `scroll-behavior: smooth` vira `auto` sob reduced-motion
- [x] **ANIM-09**: Nenhuma animação anima propriedades que causam layout; sem
  parallax/scroll-jacking; sem preloader/splash

### Formulário de Orçamento (FORM)

- [x] **FORM-01**: Formulário "Pedir orçamento" com campos Nome, canal preferido
  (WhatsApp ou E-mail) com um campo de contato, Tipo de projeto e Mensagem; o
  contato do canal escolhido é obrigatório
  - Nota (Fase 5 D-28, Felipe 2026-10-15): seletor "Prefiro contato por"
    (WhatsApp | E-mail, WhatsApp por padrão) acima de um único campo de contato
    visível; funciona sem JS com rádios `canal` + CSS `:has()`.
- [x] **FORM-02**: `<form method="POST" action="/api/orcamento">` funciona sem
  JavaScript — envio nativo redireciona (303) para `/obrigado`
- [x] **FORM-03**: Island de progressive enhancement faz `fetch` com
  `preventDefault`, mostra estados idle / enviando / sucesso / erro inline,
  preserva o que foi digitado em caso de erro e desabilita o submit durante o
  envio
- [x] **FORM-04**: Validação server-side com Zod (nome 2–80 chars, canal ∈
  {whatsapp, email} obrigatório e o contato do canal escolhido bem-formado, tipo
  ∈ enum, mensagem ≤ 2000 chars) — servidor é a fonte da verdade
  - Nota (Fase 5 D-28): o campo do canal não escolhido é descartado e nunca usado.
- [x] **FORM-05**: Validação client-side inline (no blur / no submit, nunca a cada
  tecla) espelhando o schema, sem bloquear o submit
  - Corrigido em 2026-10-21: o erro local não impede o POST; a resposta do servidor
    decide o resultado. Regra de `input`/bloqueio do plano 05-07 substituída pela
    correção registrada em `debug/resolved/form-05-submit-contract.md`.
- [x] **FORM-06**: Mensagens de erro e status acessíveis — texto (não só cor),
  `aria-invalid`, `aria-describedby` ligando campo→erro, região `aria-live`,
  foco movido para o primeiro erro; sucesso e falha anunciados
- [x] **FORM-07**: Honeypot oculto (descartado, nunca enviado nem armazenado) +
  verificação de tempo de submissão (rejeita < ~3 s ou > ~24 h, tempo decorrido medido no cliente), ambos no servidor
  - Nota (Fase 5 D-27, Felipe 2026-10-15): o tempo é o decorrido medido no cliente
    (`elapsed-ms`), sem comparar relógios; teto alargado para 24 h para não perder
    lead de aba aberta; sem JS o campo não existe e o timing não se aplica (risco
    aceito; honeypot e rate limits seguem valendo).
- [x] **FORM-08**: Rate limiting no endpoint — por IP (janela deslizante) mais um
  teto global horário e um teto diário rígido; resposta 429 com mensagem amigável
- [x] **FORM-09**: E-mail enviado via Resend com `from`/`to`/`subject` fixos no
  servidor (nunca escolhidos pelo cliente), todo campo interpolado é
  HTML-escapado, CR/LF removidos de campos usados em subject/endereço, e sempre
  há corpo `text` além do HTML
- [x] **FORM-10**: Endpoint retorna erros genéricos (sem stack trace), não faz
  redirect para URL fornecida pelo cliente, e limita o tamanho do corpo da
  requisição
- [x] **FORM-11**: Regra de rate-limit no Vercel WAF aplicada a `/api/*`
- [x] **FORM-12**: Estado de erro do formulário oferece o WhatsApp como caminho
  alternativo
- [x] **FORM-13**: Deep-links de WhatsApp com `?text=` pré-preenchido por ponto de
  entrada (hero genérico; cards de serviço mencionam o serviço), URL-encoded,
  `rel="noopener"`
  - Exceção registrada (decisão de Felipe, 2026-10-15, Fase 5 D-26): na Fase 5 os
    pontos de entrada são Contato, Footer (inclusive o botão flutuante) e cards de
    serviço; o hero fica sem CTA de WhatsApp.

### LGPD & Privacidade (LGPD)

- [ ] **LGPD-01**: ~~Página `/politica-de-privacidade`~~ Removido por decisão do
  Felipe (D-29, 2026-10-16): não há página de política nem aviso detalhado no site
- [ ] **LGPD-02**: ~~Conteúdo completo da política (controlador, dados, finalidades,
  bases legais, operadores, retenção, direitos, ANPD)~~ Removido por decisão do
  Felipe (D-29); risco registrado: transparência do art. 9º da LGPD não é publicada
- [x] **LGPD-03**: Frase curta de uso de dados visível sob o botão de envio, sem
  link (D-29; padrão notice-only, sem checkbox)
- [x] **LGPD-04**: IP, user-agent e timestamp usados apenas durante a requisição
  (rate-limit e timing), nunca persistidos ou logados
- [x] **LGPD-05**: Nenhum script de analytics/marketing dispara na interação com o
  formulário
- [x] **LGPD-06**: Analytics sem cookies verificado no DevTools (zero cookies,
  sem ID persistente) antes do lançamento
- [x] **LGPD-07**: Base legal e prazo de retenção documentados no repositório
  (mantido internamente em PROJECT.md); a parte "refletidos no aviso do formulário"
  foi removida por decisão do Felipe (D-29)

### SEO & Descoberta (SEO)

- [x] **SEO-01**: `<title>`, meta description (~150 chars, cita Ibitinga, sites,
  sistemas, automação) e `<link rel="canonical">` absoluto por página
- [x] **SEO-02**: `<html lang="pt-BR">`
- [x] **SEO-03**: Open Graph + Twitter Card completos e imagem de compartilhamento
  1200×630 estática (< 300 KB) desenhada, servida de `public/`
- [x] **SEO-04**: `sitemap.xml` (via `@astrojs/sitemap`) e `robots.txt` (libera
  tudo, aponta o sitemap)
- [x] **SEO-05**: Conjunto de favicons + `apple-touch-icon` + `theme-color`
  (#070A14)
- [x] **SEO-06**: JSON-LD com `@type: ["ProfessionalService","LocalBusiness"]` —
  nome, descrição, url, telefone E.164, e-mail, `areaServed`, `address`
  (localidade, `addressRegion: "SP"`, `addressCountry: "BR"`), `sameAs`
  (Instagram), `image`/`logo`, `founder` (Person)
- [ ] ~~**SEO-07**: JSON-LD `FAQPage` (D-02) gerado da mesma fonte da FAQ visível, validado
  no Google Rich Results Test~~ Removido na Fase 04.1 (D-02): o Google só aceita
  FAQPage para FAQ visível, e a FAQ saiu do site. (D-02)
- [x] **SEO-08**: NAP (nome, endereço, telefone) idêntico entre rodapé e JSON-LD

### Acessibilidade (A11Y)

- [x] **A11Y-01**: Skip link ("Pular para o conteúdo") como primeiro elemento
  focável, visível ao receber foco, apontando para `<main id>`
- [x] **A11Y-02**: Landmarks semânticos (`header`/`nav`/`main`/`footer`), um único
  `<h1>`, hierarquia de headings correta
- [x] **A11Y-03**: `:focus-visible` visível em todo elemento interativo, com
  contraste ≥ 3:1 tanto nas seções escuras quanto nas claras
- [x] **A11Y-04**: Tudo que é interativo é operável por teclado, sem armadilha de
  foco (inclui nav mobile)
- [x] **A11Y-05**: Texto alternativo real no retrato do fundador; render do hero,
  canvas e glow marcados como decorativos (`alt=""` / `aria-hidden`)
- [x] **A11Y-06**: Contraste de texto ≥ WCAG AA — tokens de branco translúcido de
  baixa opacidade elevados ao mínimo necessário (com aprovação de design)
- [x] **A11Y-07**: Todas as animações respeitam `prefers-reduced-motion`, com um
  caminho reduzido que ainda pareça acabado (fades limpos, não "sem movimento")

### Segurança (SEC)

- [x] **SEC-01**: Cabeçalhos de segurança em `vercel.json` cobrindo todas as
  respostas: HSTS (com preload), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  (nega câmera/mic/geo), `X-Frame-Options: DENY` / `frame-ancestors 'none'`,
  COOP/CORP
- [x] **SEC-02**: Content-Security-Policy entregue como header (não `<meta>`),
  `default-src 'self'`, `script-src 'self'` sem `unsafe-inline`/`unsafe-eval`,
  `style-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`,
  `frame-ancestors 'none'`, `upgrade-insecure-requests`
- [x] **SEC-03**: CSP publicada primeiro como `Content-Security-Policy-Report-Only`
  no preview, confirmada sem violações no load e no submit do formulário, então
  promovida para enforcing
- [x] **SEC-04**: `build.sourcemap` desativado em produção; páginas de erro
  customizadas sem informação de diagnóstico
- [x] **SEC-05**: v1 carrega zero assets de terceiros (fontes self-hosted,
  analytics same-origin); qualquer asset externo futuro exige SRI (regra
  documentada)
- [x] **SEC-06**: `securityheaders.com` nota ≥ A e verificação `curl -I` dos
  cabeçalhos no CI como checagem de regressão
- [x] **SEC-07**: Checklist de revisão de segurança versionado em `.planning/`,
  executado ao fim de cada fase (`pnpm audit` limpo, grep por nova superfície
  inline, `curl -I` dos headers, varredura de segredos em `dist/`, verificação de
  "uma única Function", gate do Lighthouse, achados registrados com
  severidade/responsável/prazo); nenhuma fase fecha com achado High em aberto
- [x] **SEC-08**: Declaração de risco residual escrita no ROADMAP — v1 não tem
  proteção de borda L3/L7 (DDoS/WAF), adiada para o milestone 2 (Cloudflare) —
  com os controles compensatórios da v1 listados (site 100% estático, rate-limit
  durável e global em `/api`, regra WAF da Vercel em `/api/*`, spend cap com
  alertas, DNS com TTL baixo para cutover rápido, runbook de flood)
- [x] **SEC-09**: SPF, DKIM e DMARC (`p=none` → quarantine) configurados para o
  domínio de envio no Resend; nota mail-tester ≥ 8 antes do formulário ir ao ar
- [x] **SEC-10**: Sem Astro View Transitions na v1 (decisão registrada) para não
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

## Redesign Aurora (AUR)

- [x] **AUR-01**: Tokens migram para a paleta Aurora (`#070A14`, aurora `#00C8FF/#3A5BFF/#0E1E5B`, ember só como marcador, textos AA); nenhum `#6C4CFF`/`rgba(108,76,255` em `src/`
- [x] **AUR-02**: Fonts API self-host Sora 600, Inter Tight 400/500/600, JetBrains Mono 400; Outfit/DM Sans removidos; preload só Sora 600 + Inter Tight 400; nenhuma origem de fonte de terceiros
- [x] **AUR-03**: Lockup (símbolo+logotipo) em header e footer; favicon/apple-touch coerentes com o fundo novo
- [x] **AUR-04**: Estrutura/ordem da home: header → hero → serviços → projetos → método → sobre → contato → footer; FAQ, Diferenciais (seção) e CtaFinal removidos (D-02)
- [x] **AUR-05**: Hero centrado com aurora estática (3 radial-gradients, sem `filter:blur`), H1 em `.accent`, CTAs e linha de prova com link PageSpeed
- [x] **AUR-06**: Serviços (lista tipográfica com hairlines, intro sticky), Método (linha de luz, ol), Sobre (foto real 4:5 + diferenciais 2 col) conforme sketch
- [x] **AUR-07**: Seção Projetos: bento 6 col, 1 caso real + exemplos rotulados "Exemplo de escopo" + card-convite; mocks HTML/CSS sem métricas inventadas; schema `cases` com união discriminada
- [x] **AUR-08**: Contato: "o que acontece depois", canais (e-mail, WhatsApp, Instagram), formulário de vidro com 5 campos, chips radio, todos os estados em CSS, live region sr-only, sem JS de form
- [x] **AUR-09**: Header sticky com vidro ao rolar, nav ativa por IO, menu `<details>`, WhatsApp flutuante ≤900px, footer conforme sketch
- [x] **AUR-10**: Copy em "nós", CTA único "Pedir orçamento", linguagem leiga, apenas claims já publicados; conteúdo em Collections; zero termos LCP/TBT/CLS/CSP no HTML construído
- [x] **AUR-11**: Motion "a luz acende" hand-rolled (CSS+IO+1 scroll rAF): aurora acende, H1 palavra a palavra, reveals distintos por seção, linha do método por scroll, foto por clip-path, mocks/browser só rodam visíveis; sem lib, sem scroll-jacking
- [x] **AUR-12**: Tudo visível sem JS e com falha de JS; `prefers-reduced-motion` reduz a fades curtos; aurora estática; loops desligados
- [x] **AUR-13**: Canvas de partículas, glow de cursor e `.hero-glow` removidos (ANIM-03/04/05 reescritos); `pnpm test` passa sem `particles.pure.test.mjs`
- [x] **AUR-14**: Lighthouse mobile ≥95 nas 4 categorias, LCP ≤2,5 s, TBT <200 ms, CLS <0,05; JS da rota ≤20 KB gz
- [x] **AUR-15**: Sem overflow horizontal em 360–1440 px; tap targets ≥44 px (botões/inputs ≥48); foco visível; gate `style=` e `security-check.sh --ci` verdes
- [x] **AUR-16**: Páginas `/obrigado`, `/404`, `/politica-de-privacidade` com header/footer/tokens/aurora estática pequena, sem motion da home
- [x] **AUR-17**: REQUIREMENTS/ROADMAP atualizados: SEO-07 e CONTENT-04 removidos/reescritos (Fase 6 sem FAQPage), CONTENT-03 com novo enum, ANIM-03/04/05 reescritos (D-02)
- [x] **AUR-18**: `/impeccable polish` e checklist SEC-07 executados sem High aberto antes do fechamento

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
| CONTENT-04 | Phase 2 | Superseded (04.1 D-02) |
| CONTENT-05 | Phase 2 | Complete |
| SITE-01 | Phase 3 | Complete |
| SITE-02 | Phase 3 | Complete |
| SITE-03 | Phase 3 | Complete |
| SITE-04 | Phase 3 | Complete |
| SITE-05 | Phase 3 | Complete |
| SITE-06 | Phase 3 | Complete |
| SITE-07 | Phase 3 | Complete |
| SITE-08 | Phase 3 | Complete |
| SITE-09 | Phase 3 | Complete |
| ANIM-01 | Phase 4 | Complete |
| ANIM-02 | Phase 3 | Complete |
| ANIM-03 | Phase 4 | Superseded (04.1 D-12) |
| ANIM-04 | Phase 4 | Superseded (04.1 D-12) |
| ANIM-05 | Phase 4 | Superseded (04.1 D-12) |
| ANIM-06 | Phase 4 | Complete |
| ANIM-07 | Phase 3 | Complete |
| ANIM-08 | Phase 3 | Complete |
| ANIM-09 | Phase 4 | Complete |
| FORM-01 | Phase 5 | Complete |
| FORM-02 | Phase 5 | Complete |
| FORM-03 | Phase 5 | Complete |
| FORM-04 | Phase 5 | Complete |
| FORM-05 | Phase 5 | Complete (correção e regressão de navegador, 2026-10-21) |
| FORM-06 | Phase 5 | Complete |
| FORM-07 | Phase 5 | Complete |
| FORM-08 | Phase 5 | Complete |
| FORM-09 | Phase 5 | Complete |
| FORM-10 | Phase 5 | Complete |
| FORM-11 | Phase 5 | Complete |
| FORM-12 | Phase 5 | Complete |
| FORM-13 | Phase 5 | Complete |
| LGPD-01 | Phase 5 | Removido por decisão do Felipe (D-29) |
| LGPD-02 | Phase 5 | Removido por decisão do Felipe (D-29) |
| LGPD-03 | Phase 5 | Complete |
| LGPD-04 | Phase 5 | Complete |
| LGPD-05 | Phase 5 | Complete |
| LGPD-06 | Phase 5 | Complete |
| LGPD-07 | Phase 5 | Complete (escopo interno); publicação removida por D-29 |
| SEO-01 | Phase 6 | Complete |
| SEO-02 | Phase 3 | Complete |
| SEO-03 | Phase 6 | Complete |
| SEO-04 | Phase 6 | Complete |
| SEO-05 | Phase 6 | Complete |
| SEO-06 | Phase 6 | Complete |
| SEO-07 | Phase 6 | Dropped (04.1 D-02) |
| SEO-08 | Phase 6 | Complete |
| A11Y-01 | Phase 3 | Complete |
| A11Y-02 | Phase 3 | Complete |
| A11Y-03 | Phase 3 | Complete |
| A11Y-04 | Phase 3 | Complete |
| A11Y-05 | Phase 3 | Complete |
| A11Y-06 | Phase 3 | Complete |
| A11Y-07 | Phase 3 | Complete |
| SEC-01 | Phase 7 | Complete |
| SEC-02 | Phase 7 | Complete |
| SEC-03 | Phase 7 | Complete |
| SEC-04 | Phase 7 | Complete |
| SEC-05 | Phase 7 | Complete |
| SEC-06 | Phase 7 | Complete |
| SEC-07 | Phase 1 (runs every phase) | Complete |
| SEC-08 | Phase 5 (statement written in ROADMAP.md) | Complete |
| SEC-09 | Phase 5 | Complete |
| SEC-10 | Phase 7 | Complete |
| PERF-01 | Phase 1 (gate runs every phase) | Complete |
| PERF-02 | Phase 1 | Complete |
| PERF-03 | Phase 1 | Complete |
| PERF-04 | Phase 1 | Complete |
| PERF-05 | Phase 3 | Complete |
| AUR-01 | Phase 04.1 | Complete |
| AUR-02 | Phase 04.1 | Complete |
| AUR-03 | Phase 04.1 | Complete |
| AUR-04 | Phase 04.1 | Complete |
| AUR-05 | Phase 04.1 | Complete |
| AUR-06 | Phase 04.1 | Complete |
| AUR-07 | Phase 04.1 | Complete |
| AUR-08 | Phase 04.1 | Complete |
| AUR-09 | Phase 04.1 | Complete |
| AUR-10 | Phase 04.1 | Complete |
| AUR-11 | Phase 04.1 | Complete |
| AUR-12 | Phase 04.1 | Complete |
| AUR-13 | Phase 04.1 | Complete |
| AUR-14 | Phase 04.1 | Complete |
| AUR-15 | Phase 04.1 | Complete |
| AUR-16 | Phase 04.1 | Complete |
| AUR-17 | Phase 04.1 | Complete |
| AUR-18 | Phase 04.1 | Complete |

**Coverage:**
- v1 requirements: 94 total (76 originais + 18 AUR da Fase 04.1), contados nos
  IDs definidos e na tabela de rastreabilidade em 2026-10-21
- Mapped to phases: 94 / 94 ✓
- Escopo ativo: 87; sete removidos/substituídos (SEO-07, CONTENT-04,
  ANIM-03/04/05 e LGPD-01/02). LGPD-07 permanece ativo somente no escopo interno.
- SEO-07 descartado; CONTENT-04, ANIM-03, ANIM-04 e ANIM-05 superseded pela Fase
  04.1 (D-02/D-12)
- Unmapped: 0 ✓
- Cross-cutting: SEC-07 and PERF-01 have Phase 1 as their home but execute at
  every phase boundary — each phase's success criteria require both to pass.

---
*Requirements defined: 2026-09-05*
*Last updated: 2026-10-21 after FORM-05 correction (server-authoritative submit and blur validation); LGPD-07 internal scope verified; requirement count corrected*
