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

## Current State

v1.0 entregue em 2026-10-21 em https://agenciadmarques.com.br. A PR #13 foi mergeada na main como `9ab5e3a`; deploy concluído, HTTP 200 e CI/Lighthouse/headers pós-merge aprovados. O encerramento documental segue em PR própria.

Astro 7, TypeScript, CSS e scripts vanilla; arquitetura estática com uma Function para o formulário. Sem framework de UI pesado ou banco de leads. Fontes Sora, Inter Tight e JetBrains Mono hospedadas no próprio domínio; imagens via astro:assets. Suíte atual: 165 testes; JS da landing: 9.146 B gzip no último build medido. Auditoria `tech_debt`: 94/94 requisitos ativos, oito fases verificadas e Nyquist reconciliado nas oito fases.

## Requirements

### Validated

- ✓ Fundação Astro estática, uma Function Vercel, fontes self-hosted e CI bloqueante — v1.0.
- ✓ Conteúdo tipado em collections, sem CMS, com validação de build — v1.0.
- ✓ Landing Aurora técnica: serviços, projetos, método, fundador real, contato e navegação responsiva; voz nós e CTA Pedir orçamento — v1.0.
- ✓ Movimento progressivo, fallback sem JS/reduced-motion, teclado e contraste — v1.0.
- ✓ Formulário com POST nativo e fetch, validação server-side, Resend, Upstash, honeypot e filtro temporal — v1.0. Dados inválidos são validados antes do timing; honeypot permanece primeiro.
- ✓ Contato real, WhatsApp, analytics sem cookies e coleta mínima com base/retenção internas — v1.0; D-29 e seu risco preservados.
- ✓ Metadados, OG, sitemap, robots e JSON-LD com NAP único — v1.0.
- ✓ CSP enforcing por hash, headers, gates de segurança e Lighthouse de produção aprovados — v1.0; ressalvas de dependências e INP em BACKLOG.md.

Cobertura final: 101 IDs originais/estendidos; 94 ativos atendidos e sete removidos/substituídos por decisões registradas. Matriz integral em [v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md).

### Active

Nenhum requisito de implementação ativo após a v1.0. O próximo milestone requer definição de escopo; pendências existentes em [BACKLOG.md](BACKLOG.md).

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

- Direção publicada: Aurora técnica, hero centrado com efeito de luz progressivo e fallback CSS. O antigo hero Bleed, a rede de partículas e a paleta violeta foram substituídos; não restaurar como requisito pendente.
- Identidade e contato atuais: contato@agenciadmarques.com.br, Instagram @agenciadmarques, WhatsApp (16) 99611-1785, Ibitinga/SP e foto real do fundador.
- Projetos usam exemplos honestos, sem métricas inventadas; conteúdo principal permanece legível sem JS.
- Aprovações humanas/externalidades históricas estão identificadas nas verificações; mocks não comprovam envio real, DNS ou estado de contas.
- Histórico anterior ao fechamento em [v1.0-PROJECT.md](milestones/v1.0-PROJECT.md); 7.856 linhas sob src em Astro/TS/MJS/CSS/Markdown (inclui testes e conteúdo), não uma medida de código de produção isolado.

## Constraints

- **Tech stack**: Astro (site estático / SSG) — escolha do cliente. Sem framework
  de UI pesado; usar ilhas só onde houver interatividade real (formulário,
  canvas, glow).
- **Hospedagem**: Vercel na v1. O build precisa sair como estático + uma função
  serverless para o endpoint do formulário.
- **Performance**: Lighthouse ≥ 95 em todas as categorias; JS de terceiros
  mínimo; fontes self-hosted com `display=swap` e preload; imagens otimizadas
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
| Astro em modo estático (SSG) | Pedido do cliente; HTML pré-renderado é o mais rápido e a menor superfície de ataque | ✓ Validado na v1.0 |
| Hero "03 Bleed" | Escolha explícita do cliente entre as 3 variantes do design | ⚠️ Substituído (2026-10-15) pela direção Aurora técnica — hero centrado sob a aurora (Fase 04.1) |
| Conteúdo em Markdown / Content Collections, sem CMS | Elimina painel administrativo como vetor de ataque; build 100% estático | ✓ Validado na v1.0 |
| Formulário via endpoint Astro na Vercel + Resend | Gratuito (3.000/mês), segredo fica no servidor, controle total de validação/rate-limit | ✓ Validado na v1.0 |
| Hospedagem na Vercel na v1 | Decisão do cliente; deploy imutável, HTTPS e headers automáticos | ✓ Validado na v1.0 |
| Cloudflare adiado para o milestone 2 | WAF, rate-limiting de borda e mitigação de DDoS/flood entram numa segunda etapa | Planejado para o próximo ciclo; risco aceito na v1 |
| Revisão de segurança ao fim de cada fase (`/gsd:secure-phase`) | Requisito explícito do cliente | ✓ Validado na v1.0 |
| Analytics sem cookies | Evita banner de consentimento e reduz exposição de dados pessoais (LGPD) | ✓ Validado na v1.0 |
| Logo nova (símbolo + logotipo) e favicon derivado do símbolo | Identidade visual entregue pelo Felipe; lockup aplicado via astro:assets | ✓ Aplicado 2026-10-14 (quick 261014-gfb) |
| Contato real: contato@agenciadmarques.com.br, @agenciadmarques, foto real do fundador | Substitui e-mail/Instagram pessoais e placeholder — confiança na hora da conversão | ✓ Aplicado 2026-10-15 (quick 261015-2fr / 261015-2ks) |
| Direção visual "Aurora técnica" (sketch 001, variante A) | Escolhida pelo Felipe entre 6 propostas: elegante tech, premium, nada genérico; paleta da logo (#070A14, aurora #00C8FF→#3A5BFF→#0E1E5B, ember #FF6A3D só como ação), Sora + Inter Tight; polida com Impeccable | ✓ Validado na v1.0 |
| Voz "nós" e CTA único "Pedir orçamento" | Consistência; linguagem leiga e só claims já publicados (FAQ/case) | ✓ Validado na v1.0 |
| D-29: sem página de política de privacidade e sem aviso detalhado no formulário | Felipe decidiu remover a Política de Privacidade e não exibir aviso de privacidade detalhado no formulário; permanece só a frase curta sob o botão. Risco registrado: transparência do art. 9º da LGPD (controlador, finalidade, base legal, retenção, operadores, direitos) deixa de ser publicada no site. | Aplicado 2026-10-16 (05-12, revisado) |
| Movimento "a luz acende" hand-rolled (CSS + IntersectionObserver) | Reveal ao rolar distinto por seção sem biblioteca; fallback sem JS e reduced-motion; canvas de partículas aposentado | ✓ Validado na v1.0 |
| Sem hero fixado / scrollytelling (modo cinemático) | Testado no sketch e rejeitado pelo Felipe | ✓ Decidido 2026-10-15 |
| Redesign como Fase 04.1, antes da Fase 5 | Formulário é ligado ao backend já no markup novo (evita retrabalho) | ✓ Decidido 2026-10-15 |
| NAP em fonte única (`src/lib/business.ts`) | Nome, telefone, e-mail e cidade alimentam JSON-LD, rodapé e contato a partir de um só módulo; `seo-gates.mjs` no CI bloqueia regressões | ✓ Aplicado (Fase 6) |
| LGPD: bases legais Art. 7º V (pedido de orçamento) + IX (antiabuso e medição agregada); retenção de 6 meses para pedidos de quem não virou cliente; sem encarregado formal (Res. CD/ANPD nº 2/2022) | Decisão do fundador (Fase 5, D-15/D-16); coleta mínima; expurgo manual mensal da caixa GoDaddy documentado em docs/operacao-formulario.md | ✓ Decidido (2026-09-24) — registro interno preservado; publicação removida por D-29 |
| Sem Astro View Transitions na v1 (SEC-10) | CSP não é suportada com ClientRouter e os listeners quebram na segunda navegação | ✓ Registrado 2026-10 (Fase 7) |
| CSP por hash entregue como header, Report-Only antes de enforcing | script-src/style-src 'self' + hashes do Astro, sem unsafe-*; detalhes em docs/seguranca-headers.md | ✓ Aplicado (Fase 7) |

## Next Milestone Goals

Cloudflare permanece como intenção do milestone 2; escopo e versão ainda não definidos. Revisar o backlog e iniciar `$gsd-new-milestone` para decidir prioridades e requisitos. Não alterar DNS/nameservers sem preservar todos os registros exigidos em AGENTS.md.

## Evolution

O core value permanece válido. Novos requisitos e mudanças de decisões entram no próximo ciclo; fatos históricos não devem ser confundidos com o contrato vigente.

---
*Last updated: 2026-10-21 after v1.0 milestone closure*
