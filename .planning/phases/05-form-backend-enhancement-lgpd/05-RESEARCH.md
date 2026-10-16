# Phase 5: Form Backend + Enhancement + LGPD - Research

**Researched:** 2026-10-15
**Domain:** endpoint de formulário em Astro 7 + Vercel Function (Resend, Zod, Upstash), progressive enhancement sem framework, política de privacidade LGPD
**Confidence:** MEDIUM-HIGH (stack e APIs verificados; texto jurídico e nomes de env do Marketplace marcados `[ASSUMED]`)

> **Superado (2026-10-15):** toda menção a `rendered-at` (timestamp absoluto) e ao teto de ~2 h neste documento foi substituída por `elapsed-ms` (tempo decorrido medido no cliente, janela 3 s–24 h) — ver D-27 no CONTEXT e os planos 05-01, 05-07 e 05-09, que prevalecem.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Caixa de e-mail `contato@agenciadmarques.com.br` criada na GoDaddy, que também é registrador e DNS. O plano GoDaddy permite só uma caixa.
- **D-02:** Resend `from` = `contato@agenciadmarques.com.br` e `to` = `contato@agenciadmarques.com.br`. Ambos fixos no servidor, ou vindos de env vars só do servidor; o cliente nunca escolhe. Nome de exibição sugerido: "Site Dmarques".
- **D-03:** `reply-to` = e-mail do lead, só quando ele informou um que passa na validação Zod, com CR/LF removidos. Quando o lead deu só WhatsApp, o corpo do e-mail traz um link `wa.me` pronto, montado com o número normalizado.
- **D-04:** Criar uma **conta Resend nova e separada** para a Dmarques (free tier = 1 domínio verificado). Chave de API só de envio, restrita ao domínio, em `RESEND_API_KEY` (já declarada no schema `astro:env` como secret).
- **D-05:** Registros DNS do Resend (DKIM `resend._domainkey`, MX/SPF do subdomínio `send.` para o return-path, DMARC `p=none` evoluindo para `quarantine`) adicionados no painel DNS da GoDaddy **sem alterar os MX/SPF existentes da caixa GoDaddy**. Checkpoint manual guiado para o Felipe. Mail-tester >= 8 antes do go-live (SEC-09).
- **D-06:** Assunto inclui o nome do lead sanitizado e o rótulo do tipo de projeto, ex.: `Novo orçamento: João — Site institucional`. Nome sem CR/LF e truncado; o rótulo vem do enum `PROJECT_TYPES`, nunca da entrada crua.
- **D-07:** **Sem auto-resposta/confirmação por e-mail ao lead.** Só o painel de sucesso na página e `/obrigado`.
- **D-08:** HTML do e-mail simples: tabela de campos com links clicáveis `wa.me` e `mailto:`, sem imagens remotas, sem template de marca. Sempre há corpo `text` equivalente (FORM-09).
- **D-09:** Trocar `felipe.salles1@hotmail.com` por `contato@agenciadmarques.com.br` **no site inteiro nesta fase**, em `ContactSection.astro` e `SiteFooter.astro`. A Política também usa `contato@`.
- **D-10:** Armazenamento durável = **Upstash Redis (free tier) provisionado pelo Vercel Marketplace**, com `@upstash/ratelimit` e `@upstash/redis`. Chaves usam IP com hash e TTL curto; IP cru nunca é armazenado nem logado (LGPD-04). Upstash listado como operador na Política.
- **D-11:** Limites: **3 envios por IP por 10 min (janela deslizante)**, **20/hora global**, **50/dia global (teto rígido)**. Valores em constantes nomeadas.
- **D-12:** Quando qualquer limite dispara, responder 429 com mensagem amigável em pt-BR e um **botão de WhatsApp** como caminho alternativo. Com JS aparece inline no card; sem JS, página de erro com a mesma mensagem e botão.
- **D-13:** Regra de rate-limit no Vercel WAF em `/api/*` **mais frouxa que o limite do app** (~10 req/min/IP, depois block/deny). Só anti-flood; o limite fino fica no Upstash. Configurada manualmente no dashboard e documentada no repo (FORM-11).
- **D-14:** Controlador = **Felipe Salles, pessoa física, nome fantasia "Dmarques"**, Ibitinga/SP, sem CPF publicado. Contato `contato@`. Atualizar para razão social + CNPJ quando TRUST-02 chegar.
- **D-15:** **Retenção: 6 meses** para e-mails de pedido de orçamento de leads que não viraram clientes; depois são apagados da caixa. Dados de leads que viram clientes seguem o contrato. Registrar como Key Decision em `.planning/PROJECT.md` e refletir na política (LGPD-07). Bases legais Art. 7º V + IX, travadas pelos requisitos.
- **D-16:** Encarregado: citar a dispensa para agente de tratamento de pequeno porte (Resolução CD/ANPD nº 2/2022), sem DPO formal. Canal para titulares: `contato@agenciadmarques.com.br`, resposta em até 15 dias.
- **D-17:** Operadores listados: Vercel (hospedagem + analytics), Resend (entrega de e-mail), Upstash (contadores de rate-limit, IP com hash, TTL curto), GoDaddy (caixa onde os pedidos ficam). Transferência internacional (EUA) divulgada.
- **D-18:** Formato em pt-BR simples, resumo de uma frase no topo, H2 curtos com índice cobrindo todo item do LGPD-02, e data de última atualização. Revisão jurídica é responsabilidade do Felipe. Substitui o shell da Fase 3 em `src/pages/politica-de-privacidade.astro`.
- **D-19:** Com JS, no sucesso **trocar o formulário por um painel de sucesso** no mesmo card: "✓ Pedido enviado. Respondemos no mesmo dia útil." + botão WhatsApp. Foco vai ao painel e a região `aria-live` anuncia. Evita reenvio duplicado.
- **D-20:** Campo WhatsApp **sem máscara viva**. Aceita qualquer formato; no blur formata para `(16) 99611-1785` quando parseável. O servidor normaliza para dígitos (remove +55 / 0 inicial) e valida 10–11 dígitos BR.
- **D-21:** FORM-13: link discreto **"Falar sobre isso no WhatsApp"** em cada card de serviço, com texto pré-preenchido "Olá! Vim pelo site e quero falar sobre {serviço}." Links WhatsApp existentes (hero, Contato, CTA final, footer) ganham texto genérico. O link de fallback de erro/429 carrega o que o usuário digitou (nome + tipo). Textos com URL-encode e `rel="noopener"`.
- **D-22:** Aviso LGPD-03 é uma linha curta ao lado do botão: "Usamos seus dados só para responder a este pedido. Veja a Política de Privacidade." Linka `/politica-de-privacidade`, sem checkbox.
- **D-23:** Zero comentários em qualquer arquivo versionado (Fase 1 D-04).
- **D-24:** Sem framework de UI. O enhancer é um `<script>` de módulo simples e precisa caber no orçamento de <20 KB de JS da landing junto do bundle de efeitos da Fase 4 (~2,6 KB hoje).
- **D-25:** `PROJECT_TYPES` / `PROJECT_TYPE_VALUES` de `src/content/project-types.ts` é a única allow-list para o `<select>` e o `z.enum` do servidor.

### Claude's Discretion

- Resposta a rejeições de honeypot/timing: devolver sucesso falso silenciosamente (200 / 303 para `/obrigado`) para que bots não recebam sinal. Nenhum e-mail é enviado.
- Como o timestamp de envio é carregado: campo rendered-at, assinado/HMAC se o pesquisador recomendar. Janela 3 s–2 h por FORM-07.
- Copy exata em pt-BR para erros de validação, erro genérico de servidor e mensagem 429, no tom amigável do site.
- Formato do caminho de erro sem JS (página dedicada tipo `/erro-envio` vs. resposta re-renderizada), desde que nunca redirecione para URL fornecida pelo cliente.
- Layout de código (ex.: `src/pages/api/orcamento.ts`, `src/lib/form-schema.ts` compartilhado, `src/scripts/form.ts` enhancer), valor do teto de corpo e implementação da allow-list de Origin.
- Se `from`/`to` são constantes ou vars `astro:env` só de servidor (`CONTACT_EMAIL`). Vars de ambiente preferidas.
- Se o conteúdo da Política vive numa entrada Markdown ou direto na página `.astro`.

### Deferred Ideas (OUT OF SCOPE)

- Auto-resposta de confirmação ao lead: rejeitada para a v1. Pode voltar após Turnstile (CF-04, Milestone 2).
- Template HTML de marca no e-mail: desnecessário para notificação interna.
- CNPJ/razão social na política e no footer: TRUST-02.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FORM-01 | Campos Nome, canal preferido (WhatsApp ou E-mail) com um campo de contato, Tipo de projeto, Mensagem (D-28, substitui "ao menos um entre WhatsApp e e-mail") | Seletor `canal` + CSS `:has()` no 05-07; `superRefine` exige só o contato do canal escolhido (05-04) |
| FORM-02 | POST nativo sem JS, 303 para `/obrigado` | `Response` 303 manual; `/obrigado` estático (Pattern 1) |
| FORM-03 | Enhancer com fetch e estados, preserva entrada, desabilita submit | `form.ts` reescrito, `Accept: application/json`, urlencoded (Pattern 4) |
| FORM-04 | Zod server-side (nome 2–80, contato, enum, mensagem) | `form-schema.server.ts` com constantes compartilhadas (Pattern 2) |
| FORM-05 | Validação cliente espelhando schema, blur/submit | Módulo puro `form-schema.ts` sem Zod, usado por cliente e servidor |
| FORM-06 | Erros acessíveis, aria-*, live region, foco | Contrato do UI-SPEC; checklist em Validation Architecture |
| FORM-07 | Honeypot + janela de tempo 3 s–2 h | Pitfall 1: página estática não consegue timestamp do servidor; campo `rendered-at` setado por JS, ausente tolerado |
| FORM-08 | Rate limit por IP + global/hora + teto diário, 429 | `@upstash/ratelimit` com 3 instâncias, fail-closed (Pattern 3) |
| FORM-09 | Resend com from/to/subject fixos, escape, CR/LF, corpo text | `mail.ts` + `escape-html.ts` (Pattern 5) |
| FORM-10 | Erros genéricos, sem redirect de cliente, teto de corpo | Leitura limitada do stream, 303 só para caminhos fixos (Pattern 1) |
| FORM-11 | Regra WAF em `/api/*` | Hobby: 1 regra de rate limit, janela 10 s–10 min, runbook em `docs/` (seção WAF) |
| FORM-12 | Erro oferece WhatsApp | `.alert` + `buildWaUrl` com nome e tipo (Pattern 4) |
| FORM-13 | Deep-links WhatsApp com `?text=` | Helper único `src/lib/whatsapp.ts`; hero não tem link WhatsApp hoje (Open Question 3) |
| LGPD-01 | Política publicada no mesmo release | Página `.astro` direta, estática (Pattern 6) |
| LGPD-02 | Conteúdo mínimo da política | Mapa de 10 H2 do UI-SPEC + notas jurídicas (Pattern 6) |
| LGPD-03 | Aviso ao lado do submit, sem checkbox | Já em `ContactSection.astro`, ajustar copy para D-22 |
| LGPD-04 | IP/UA/timestamp nunca persistidos nem logados | IP com HMAC, `analytics: false`, zero `console.*`, grep no SEC-07 |
| LGPD-05 | Nenhum analytics na interação do form | `@vercel/analytics` só faz pageview; `form.ts` não chama `track`; teste Playwright |
| LGPD-06 | Analytics sem cookies verificado | Verificação em preview/prod: `context.cookies()` vazio + storage vazio |
| LGPD-07 | Base legal e retenção como Key Decision | Registrar em `PROJECT.md`; runbook de expurgo de 6 meses |
| SEC-08 | Declaração de risco residual no ROADMAP | Já existe no ROADMAP; fase deve torná-la verdadeira e atualizar com o achado do Hobby (Open Question 1) |
| SEC-09 | SPF/DKIM/DMARC e mail-tester >= 8 | Checkpoint DNS GoDaddy + script de envio de teste (seção Environment) |
</phase_requirements>

## Summary

O formulário já tem o markup completo (`ContactSection.astro`), CSS dos estados da 04.1, `/obrigado` e o shell da política. O trabalho real é: (1) uma única rota on-demand `src/pages/api/orcamento.ts` com `prerender = false`, que sai como a única Vercel Function; (2) um enhancer `form.ts` que substitui o `preventDefault` provisório; (3) a política completa; (4) checkpoints manuais (Resend, DNS GoDaddy, Upstash, WAF, mail-tester). Nenhuma das três dependências (`resend`, `zod`, `@upstash/*`) está instalada hoje.

Quatro descobertas mudam o plano em relação ao CONTEXT/UI-SPEC: (a) como o site é estático, **a página não consegue receber um `rendered-at` do servidor** nem ler `?motivo=` em `/erro-envio`; o timestamp precisa ser definido por JS e `/erro-envio` deve virar três páginas estáticas por caminho; (b) o **Vercel Hobby permite só 1 regra de rate limit no WAF** (janela 10 s–10 min) e, pelas Fair Use Guidelines, **Hobby é restrito a uso não comercial** — risco real para um site de agência (Open Question 1); (c) o handler deve ser uma função pura com dependências injetadas, senão `astro:env/server` impede `node --test`; (d) o aviso/spec do UI-SPEC pede `replace` de links WhatsApp no hero e no CtaFinal, mas **nenhum dos dois tem link WhatsApp** (hero) ou existe (CtaFinal).

**Primary recommendation:** `POST /api/orcamento` aceita só `application/x-www-form-urlencoded` (assim `security.checkOrigin` do Astro também protege), roda guardas baratas primeiro (tamanho, Origin, honeypot/tempo → sucesso falso), depois Zod, depois os três limites do Upstash em sequência fail-closed, depois Resend; responde 303 para caminhos fixos ou JSON conforme `Accept`. Toda a lógica vive em `src/lib/submit.ts` com dependências injetadas e testes `node --test`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Renderizar formulário, política, /obrigado, /erro-envio/* | CDN / Static | — | HTML pré-renderizado; zero custo e zero função |
| Validação inline, estados, formatação do WhatsApp | Browser / Client | — | Conveniência; servidor é fonte da verdade (FORM-04) |
| Validação autoritativa, honeypot, timing | API / Backend (Vercel Function) | — | Nunca confiar no cliente |
| Rate limiting fino (IP/global/dia) | API / Backend | Database / Storage (Upstash) | Função serverless é stateless; contador precisa de estado externo |
| Rate limiting anti-flood | CDN / Edge (Vercel WAF) | — | Barra antes de invocar a função |
| Envio de e-mail | API / Backend | Resend (externo) | Chave de API só no servidor |
| Retenção de 6 meses dos pedidos | Humano (caixa GoDaddy) | — | Dados ficam só na caixa; expurgo é processo manual |
| Analytics sem cookies | CDN / Vercel (`/_vercel/insights`) | Browser | Mesma origem, sem interação de formulário |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `resend` | 6.33.0 (modificado 2026-10-14) | Enviar o e-mail do pedido | Travado em CLAUDE.md/D-04 `[VERIFIED: npm view]` |
| `zod` | 4.6.7 | Validação server-side | Travado em CLAUDE.md `[VERIFIED: npm view]` |
| `@upstash/ratelimit` | 2.2.0 | Janela deslizante / fixa sem estado local | Travado em D-10, projetado para serverless `[VERIFIED: npm view]` |
| `@upstash/redis` | 1.39.0 | Cliente REST (peer `^1.38.2` do ratelimit) | Par obrigatório do ratelimit `[VERIFIED: npm view]` |

Já instalados e reutilizados: `astro` 7.3.8, `@astrojs/vercel` 11.0.14, `@vercel/analytics` 2.0.1, `playwright` 1.64.1 (devDep, para os gates do form). Versões do repo são fixadas exatas; fixar as quatro novas igualmente.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod só no servidor + módulo puro no cliente | Zod no cliente | Zod no bundle estoura o orçamento e contradiz UI-SPEC "sem biblioteca de validação" |
| Upstash Redis | `Map` em memória | Não é durável entre instâncias; só como fallback de dev |
| Resend | SMTP GoDaddy | Plano de caixa única, sem API; descartado em D-02/D-04 |

**Installation:**
```bash
pnpm add --save-exact resend@6.33.0 zod@4.6.7 @upstash/ratelimit@2.2.0 @upstash/redis@1.39.0
```

**Version verification:** `npm view` executado em 2026-10-15 retornou as versões acima; `scripts.postinstall` vazio nas quatro.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| resend | npm | n/v | n/v | github.com/resend/resend-node | indisponível | `[ASSUMED]` mecânico; **prescrito pelo usuário** em CLAUDE.md/D-04 |
| zod | npm | n/v | n/v | github.com/colinhacks/zod | indisponível | `[ASSUMED]` mecânico; prescrito em CLAUDE.md |
| @upstash/ratelimit | npm | n/v | n/v | github.com/upstash/ratelimit-js | indisponível | `[ASSUMED]` mecânico; prescrito em D-10 |
| @upstash/redis | npm | n/v | n/v | github.com/upstash/redis-js | indisponível | `[ASSUMED]` mecânico; prescrito em D-10 |

`slopcheck` não pôde ser instalado neste ambiente (`command -v slopcheck` vazio). `npm view` confirmou existência, repositórios oficiais e ausência de `postinstall`. Como os quatro nomes foram escolhidos pelo usuário em decisões travadas e vêm de documentação oficial dos fornecedores, o risco de slopsquatting é baixo; mesmo assim, pelo protocolo, ficam `[ASSUMED]`: o planner pode cumprir o gate com **uma única** tarefa `checkpoint:human-verify` antes do `pnpm add` (conferir os quatro nomes/repos em npmjs.com).

**Packages removed due to slopcheck [SLOP]:** nenhum
**Packages flagged [SUS]:** nenhum

## Architecture Patterns

### System Architecture Diagram

```
Navegador
  |
  |-- GET / , /obrigado , /erro-envio/{limite|invalido|falha} , /politica-de-privacidade
  |        --> Vercel CDN (HTML estatico, sem funcao)
  |
  |-- POST /api/orcamento  (urlencoded; Accept: text/html sem JS | application/json com JS)
           |
           v
     [Vercel WAF: 1 regra, ~10 req/min/IP]  --excedeu--> 429 do edge
           |
           v
     Vercel Function (unica) -> src/pages/api/orcamento.ts -> handleSubmission(deps)
           |
           |-- 1 Content-Type != urlencoded ............ 415
           |-- 2 Origin ausente/nao permitida ........... 403
           |-- 3 corpo > cap (Content-Length e stream) .. 413
           |-- 4 honeypot preenchido OU rendered-at fora de 3s-2h
           |        --> sucesso falso (303 /obrigado ou 200 {ok:true}); nenhum e-mail
           |-- 5 Zod (nome, contato, enum, mensagem) .... invalid
           |-- 6 Upstash: por-IP(hash) -> global/hora -> global/dia
           |        --excedeu--> limited ;  Redis fora/timeout --> failed (fail-closed)
           |-- 7 Resend.send({from,to,subject,html,text,replyTo?})
           |        --error--> failed
           v
     ok -> sem JS: 303 /obrigado | com JS: 200 {"ok":true}
     invalid/limited/failed -> sem JS: 303 /erro-envio/<motivo> | com JS: 400/429/502 JSON
```

### Recommended Project Structure
```
src/
├── pages/
│   ├── api/orcamento.ts            # prerender=false, so wiring (env, Redis, Resend)
│   ├── erro-envio/[motivo].astro   # getStaticPaths: limite | invalido | falha
│   ├── obrigado.astro              # ajustar copy
│   └── politica-de-privacidade.astro
├── lib/
│   ├── form-schema.ts              # PURO, sem Zod: constantes, normalizePhone, EMAIL_RE, validateFields
│   ├── form-schema.server.ts       # Zod 4 usando as constantes acima
│   ├── submit.ts                   # handleSubmission(request, deps) -> Response, testavel
│   ├── request-guards.ts           # readBodyCapped, checkOrigin, wantsJson
│   ├── rate-limit.ts               # fabrica dos 3 limitadores + hashIp
│   ├── mail.ts                     # buildEmail(data) -> {subject,html,text,replyTo}
│   ├── escape-html.ts
│   └── whatsapp.ts                 # WHATSAPP_NUMBER, buildWaUrl(text)
├── scripts/form.ts                 # enhancer (importa so form-schema.ts e whatsapp.ts)
docs/waf-rate-limit.md              # runbook FORM-11 (nao e comentario de codigo)
scripts/verify/form-gates.mjs       # Playwright com page.route
```

### Pattern 1: Rota on-demand com respostas por `Accept`
**What:** única rota dinâmica; sem JS recebe 303 para caminhos fixos, com JS recebe JSON.
**When to use:** sempre neste endpoint.
```typescript
import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { handleSubmission } from '../../lib/submit.ts';
import { createDeps } from '../../lib/deps.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) =>
  handleSubmission(request, createDeps(getSecret, clientAddress));

export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { Allow: 'POST' } });
```
```typescript
const SEE_OTHER = (path: string) =>
  new Response(null, { status: 303, headers: { Location: path, 'Cache-Control': 'no-store' } });

const REASON_PATH = { limited: '/erro-envio/limite', invalid: '/erro-envio/invalido', failed: '/erro-envio/falha' } as const;
```
`Location` só recebe valores desta tabela fixa. [CITED: docs.astro.build/en/guides/endpoints] (POST/ALL, `prerender = false` em `static`).

### Pattern 2: Schema em duas camadas com constantes compartilhadas
`form-schema.ts` (puro, entra no bundle) exporta `LIMITS`, `EMAIL_RE`, `normalizePhone`, `stripControl`, e uma `validateFields(input)` que devolve `{ ok, errors: {campo: codigo} }`. `form-schema.server.ts` monta o Zod 4 com `z.enum(PROJECT_TYPE_VALUES)` (D-25), `z.string().regex(EMAIL_RE)` (mesma regex do cliente, não `z.email()`, para não haver divergência) e `superRefine` para "WhatsApp ou e-mail". Superado pelo D-28: `canal` é `z.enum(CHANNELS)` obrigatório e o `superRefine` exige só o contato do canal escolhido; o exemplo abaixo com `path: ['contato']` não vale mais (ver 05-04).
```typescript
import { z } from 'zod';
import { PROJECT_TYPE_VALUES } from '../content/project-types.ts';
import { EMAIL_RE, LIMITS, normalizePhone, stripControl } from './form-schema.ts';

export const submissionSchema = z
  .object({
    nome: z.string().transform(stripControl).pipe(z.string().min(LIMITS.nameMin).max(LIMITS.nameMax)),
    whatsapp: z.string().max(LIMITS.phoneRaw).optional(),
    email: z.string().trim().max(LIMITS.emailMax).regex(EMAIL_RE).optional().or(z.literal('')),
    'tipo-projeto': z.enum(PROJECT_TYPE_VALUES).optional(),
    mensagem: z.string().max(LIMITS.messageMax).optional(),
  })
  .superRefine((v, ctx) => {
    const phone = v.whatsapp ? normalizePhone(v.whatsapp) : null;
    if (v.whatsapp && !phone) ctx.addIssue({ code: 'custom', path: ['whatsapp'], message: 'phone' });
    if (!phone && !v.email) ctx.addIssue({ code: 'custom', path: ['contato'], message: 'contact' });
  });
```
Notas: converter `''` em `undefined` antes do parse (formulários enviam campos vazios); `LIMITS.messageMax = 1000` (igual ao `maxlength` do textarea e à copy do UI-SPEC; satisfaz FORM-04 "≤ 2000"). Usar `error.issues[].path` para devolver só nomes de campo, nunca mensagens do Zod. Node 22.18+/24 executa `.ts` com type-stripping (padrão do repo, `steps.pure.test.mjs`): sem `enum`, sem parameter properties, imports com extensão `.ts`.

### Pattern 3: Três limitadores do Upstash, em sequência, fail-closed
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createHmac } from 'node:crypto';

export const RATE = { ipMax: 3, ipWindow: '10 m', hourMax: 20, hourWindow: '1 h', dayMax: 50, dayWindow: '1 d' } as const;

export function createLimiters(url: string, token: string) {
  const redis = new Redis({ url, token });
  const base = { redis, analytics: false, timeout: 3000 };
  return {
    ip: new Ratelimit({ ...base, prefix: 'rl:ip', limiter: Ratelimit.slidingWindow(RATE.ipMax, RATE.ipWindow) }),
    hour: new Ratelimit({ ...base, prefix: 'rl:h', limiter: Ratelimit.slidingWindow(RATE.hourMax, RATE.hourWindow) }),
    day: new Ratelimit({ ...base, prefix: 'rl:d', limiter: Ratelimit.fixedWindow(RATE.dayMax, RATE.dayWindow) }),
  };
}

export function hashIp(ip: string | undefined, salt: string) {
  const key = ip ? ip.split(':').length > 2 ? ip.split(':').slice(0, 4).join(':') : ip : 'unknown';
  return createHmac('sha256', salt).update(key).digest('base64url').slice(0, 22);
}
```
Regras: (1) chamar `ip` → `hour` → `day` em sequência, parando no primeiro bloqueio, para que um IP bloqueado não gaste a cota global; (2) tratar `success === false` **ou** `reason === 'timeout'` como bloqueio/falha — o `timeout` documentado (default 5 s) devolve `success: true` e abre a porta (fail-open) `[CITED: upstash.com/docs/redis/sdks/ratelimit-ts/features]`; (3) `try/catch` em volta de tudo: erro do Redis vira `failed` (fail-closed), o lead cai no alerta com WhatsApp; (4) `analytics: false` (padrão) — com `true` o Upstash grava identificador por hora; (5) IPv6 truncado em /64 evita rotação trivial de endereço; (6) o salt é um novo secret `RATE_LIMIT_SALT` (HMAC pseudonimiza; IPv4 com SHA simples é reversível por força bruta), e **o hash continua sendo dado pessoal pseudonimizado**, por isso a política cita Upstash; (7) `Retry-After` no 429 (segundos até `reset`). Que o TTL de chave acompanha a janela é comportamento interno `[ASSUMED]`; conferir no Upstash Data Browser após o primeiro teste que as chaves `rl:*` têm TTL.

### Pattern 4: Enhancer `form.ts` (sem biblioteca)
- `form.noValidate = true` ao inicializar (as mensagens custom do UI-SPEC substituem os balões nativos); sem JS, `required`/`type=email` nativos continuam valendo.
- Corpo: `new URLSearchParams()` preenchido por `FormData` (somente strings) → `Content-Type: application/x-www-form-urlencoded` e `Accept: application/json`; `AbortController` de 15 s; guarda `if (sending) return`.
- `rendered-at`: `input[type=hidden][name=rendered-at]` no markup com valor vazio; o script grava `Date.now()` no `init`.
- Respostas: 200 → `.done`; 400 → marca campos citados em `errors`; 429 → `.limited` + bloqueio de 60 s ou `Retry-After`; outros/rede/timeout → `.failed`.
- Radios não têm `readonly`: em voo, usar `disabled` só nos radios e `readonly` nos demais; `FormData` já foi lido antes.
- WhatsApp no blur: `normalizePhone` do módulo puro e `format()` para `(DD) 9XXXX-XXXX`.
- Texto sempre por `textContent`, `href` por `setAttribute`, zero `style` (SITE-04 e verificação 2 do `security-check.sh`).
- Regra de orçamento: `scripts/js-weight-check.sh` já falha acima de 20480 B; o form tende a +2–3 KB sobre os ~2,6 KB atuais.

### Pattern 5: E-mail
```typescript
const CONTROL = /[\u0000-\u001f\u007f\u2028\u2029]+/g;
export const stripControl = (s: string) => s.replace(CONTROL, ' ').trim();
export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function subjectFor(name: string, label: string) {
  return `Novo orçamento: ${stripControl(name).slice(0, 60)} — ${label}`;
}
```
`resend.emails.send({ from, to, subject, html, text, replyTo })` devolve `{ data, error }` e **não lança** em erro de API: checar `error` `[CITED: resend.com/docs/send-with-nodejs]`. A mensagem do lead entra no HTML com `escapeHtml` e `white-space: pre-wrap` no `<td>` (CSS inline em e-mail é inevitável e é e-mail, não página; não é superfície CSP). Link `wa.me` só com dígitos normalizados; `mailto:` com o e-mail já validado pela regex que exclui `<>,;"` e espaços. Desligar *open/click tracking* do domínio no painel Resend (privacidade e entregabilidade). Não registrar `error.message` em log; no máximo um código fixo (`orcamento:send_failed`).

### Pattern 6: Política e páginas estáticas
- Política direto em `.astro` (sem content collection: um único documento, sem reuso); data "Última atualização" como constante no frontmatter.
- `/erro-envio/[motivo].astro` com `getStaticPaths` retornando `limite|invalido|falha` + `<meta name="robots" content="noindex">`. **Desvio do UI-SPEC** (que usa `?motivo=`): uma página `prerender` não enxerga a query string no build e o fallback via JS quebraria o caso sem JS. O `/erro-envio` sem segmento pode ter um `index.astro` redirecionando para `falha`, ou não existir.
- `/obrigado` também recebe `noindex`.

### Anti-Patterns to Avoid
- **`Astro.redirect`/`context.redirect` com destino vindo do cliente:** proibido (FORM-10); só a tabela fixa.
- **`console.log(request)`/`clientAddress`:** viola LGPD-04.
- **Rate limit antes das guardas baratas:** gasta comandos do Redis (free tier ~10K/dia) com lixo; honeypot/tamanho/Origin vêm primeiro.
- **Importar `astro:env/server` dentro de `src/lib/*`:** quebra `node --test`; só `pages/api/orcamento.ts` e `deps.ts` tocam o virtual module.
- **`style=""` ou `innerHTML` no enhancer:** quebra SITE-04 e a futura CSP da Fase 7.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Janela deslizante / fixa distribuída | Contadores próprios em Redis | `@upstash/ratelimit` | Script Lua atômico, TTL, cache efêmero |
| Envio de e-mail | `fetch` à API REST ou SMTP | `resend` | Tipagem, tratamento de erro, `idempotencyKey` |
| Validação de payload | `if`/regex espalhado no handler | Zod 4 (servidor) | Uma fonte de verdade para tipos e enum |
| HMAC | Hash caseiro | `node:crypto` `createHmac` | Nativo, sem dependência |
| CSRF/Origin básico | Parser próprio de cabeçalho | `security.checkOrigin` do Astro (padrão `true`) + checagem de Origin própria | Já cobre POST urlencoded/multipart/text `[CITED: docs.astro.build/en/reference/configuration-reference]` |
| Analytics | Contador próprio | `@vercel/analytics` já instalado | Sem cookies |

**Key insight:** o endpoint é pequeno, mas cada etapa tem uma armadilha de segurança; usar as bibliotecas para estado/serialização e escrever à mão apenas a ordem das guardas.

## Runtime State Inventory

Não é fase de rename/refactor/migração; porém há troca de string em arquivos.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Nenhum — verificado: sem banco; Upstash começa vazio | — |
| Live service config | Nenhum — Resend/Upstash/WAF ainda não existem | criar (checkpoints manuais) |
| OS-registered state | Nenhum | — |
| Secrets/env vars | `RESEND_API_KEY` declarada, sem valor em `.env.local` (só `VERCEL_OIDC_TOKEN`) | adicionar valores na Vercel (Production + Preview) e em `.env.local` |
| Build artifacts | `dist/` presente | rebuild |

Verificado por grep: `hotmail` retorna **zero** ocorrências em `src/` — **D-09 já está feito** (mailto e texto usam `contato@`). A tarefa é só confirmar por grep e remover o parágrafo `#form-pendente` com o texto provisório.

## Common Pitfalls

### Pitfall 1: `rendered-at` do servidor é impossível em página estática
**What goes wrong:** UI-SPEC diz "vem do servidor", mas `/` é HTML pré-renderizado e cacheado; um valor do build expira em 2 h.
**How to avoid:** o JS grava `Date.now()` ao carregar. Servidor: se presente e numérico, exige `3 s <= agora - t <= 2 h` (rejeita futuro/NaN); **se ausente (caminho sem JS), aceita** — senão o POST nativo quebraria. Consequência honesta: o timing não barra bot que posta direto omitindo o campo; quem barra são honeypot, Origin, Zod, limites e WAF. HMAC não agrega valor aqui (nada para assinar sem emissão no servidor). Registrar no SEC-07 como risco aceito. `[ASSUMED]` que o usuário aceita esta limitação (Open Question 2).
**Warning signs:** testes de timing que só funcionam com o campo presente.

### Pitfall 2: `checkOrigin` do Astro não cobre `application/json`
A proteção embutida só atua com `content-type` ausente/urlencoded/multipart/text `[CITED]`. Por isso o enhancer envia **urlencoded** e o servidor rejeita (415) qualquer outro tipo. Origin própria: exigir cabeçalho `Origin` igual a `https://agenciadmarques.com.br`, `https://www.agenciadmarques.com.br` ou à origem da própria requisição (previews `*.vercel.app`). Ausência de `Origin` → 403 (navegadores atuais sempre enviam em POST) `[ASSUMED]` baixo risco de falso positivo.

### Pitfall 3: Teto de corpo precisa ser aplicado no stream
`Content-Length` pode faltar (chunked) ou mentir. Ler `request.body` com `getReader()` acumulando bytes e abortar ao passar do cap. O limite da plataforma (4,5 MB) não substitui isso. Cap recomendado: **16 KB** (mensagem de 1000 caracteres acentuados percent-encoded chega a ~9 KB).

### Pitfall 4: Hobby e WAF
Regra de rate limit no Hobby: **1 por projeto**, janela mínima 10 s e máxima 10 min, algoritmo fixed window, chave IP, ações Log/Deny/Challenge/429 padrão; contadores são **por região** `[CITED: vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting, atualizado 2026-08-28]`. Regra sugerida: caminho começa com `/api/` → 10 requisições / 60 s / IP → ação padrão 429 (ou Deny). Começar em **Log** por um dia e depois ligar a ação. Guardar o passo a passo em `docs/waf-rate-limit.md` (FORM-11) e print/descrição no `runs/phase-05.md`.

### Pitfall 5: Hobby é uso não comercial (risco jurídico/operacional)
Fair Use Guidelines: "Hobby teams are restricted to non-commercial personal use only"; anunciar serviço/ receber pagamento pelo site é uso comercial `[CITED: vercel.com/docs/limits/fair-use-guidelines, 2026-09-14]`. O ROADMAP (SEC-08) assume Hobby sem cartão como teto de gasto de US$ 0. Sinalizar ao fundador (Open Question 1). Não bloqueia o código.

### Pitfall 6: Auto-envio e entregabilidade
`from` e `to` são o mesmo endereço, e a caixa receptora é GoDaddy: provedores podem tratar "mesmo domínio vindo de IP externo" como suspeito. DKIM alinha ao domínio e SPF alinha via subdomínio `send.`, então DMARC passa. **Testar cedo** que chega na caixa de entrada, não em spam. Em `_dmarc`, **não** colocar `rua=` para a única caixa existente (relatórios agregados inundariam a caixa); usar `v=DMARC1; p=none;` e evoluir para `quarantine` depois de semanas limpas `[ASSUMED]`.

### Pitfall 7: Registros DNS da GoDaddy
Adicionar apenas: TXT `resend._domainkey` (DKIM), MX `send` (return-path) e TXT `send` (SPF `include:amazonses.com`), TXT `_dmarc`. Não tocar MX/SPF da raiz. Valores exatos vêm do painel Resend (variam por região) `[ASSUMED]` quanto aos nomes de host. TTL baixo (SEC-08).

### Pitfall 8: Env vars do Marketplace
A integração Upstash do Vercel Marketplace injeta `KV_REST_API_URL`/`KV_REST_API_TOKEN` e/ou `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`; fontes de terceiros divergem `[ASSUMED]`. Declarar no schema `astro:env` os dois pares como `optional: true`, ler com `getSecret(a) ?? getSecret(b)`, e no checkpoint Felipe confirma os nomes reais no dashboard. Sem URL/token em produção → `failed` (fail-closed); em dev (`import.meta.env.DEV`) usar um limitador em memória.

### Pitfall 9: Resend guarda o conteúdo
O painel do Resend mantém logs e corpo dos e-mails por um período que depende do plano `[ASSUMED]` (verificar no painel). Isso é retenção adicional de dado pessoal: a política deve dizer que o Resend retém cópia técnica pelo período definido por ele. Idem GoDaddy (6 meses, manual). Criar lembrete recorrente (mensal) para expurgar a caixa; documentar no runbook.

### Pitfall 10: Preview protegido e CI
Deployment Protection bloqueia POST e `lhci` em previews sem o header `x-vercel-protection-bypass` (já tratado em `security-check.sh`). Testes de API em preview precisam do bypass. Chaves de Resend em Preview enviam e-mail real: usar o mesmo domínio e aceitar, ou escopar a chave só a Production e testar em produção com o fluxo guiado.

### Pitfall 11: Honeypot e autofill
Nome `empresa-site` com `autocomplete="off"` é improvável de ser preenchido por gerenciadores de senha; mesmo assim, o sucesso falso para um humano autopreenchido perderia o lead. Risco baixo; manter o nome incomum.

### Pitfall 12: Contagem de Functions
`security-check.sh` verificação 5 hoje aceita `<= 1`. Apertar para `== 1` nesta fase. As páginas `/obrigado`, `/erro-envio/*` e `/politica-de-privacidade` precisam continuar `prerender` (padrão do modo `static`), ou viram mais rotas dentro da mesma função e quebram a premissa de CDN.

## Code Examples

### Ordem do handler (esqueleto)
```typescript
export async function handleSubmission(request: Request, deps: Deps): Promise<Response> {
  const json = request.headers.get('accept')?.includes('application/json') ?? false;
  const respond = (kind: Kind) => (json ? jsonFor(kind) : SEE_OTHER(PATH[kind]));
  try {
    if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) return status(415);
    if (!isAllowedOrigin(request, deps.allowedOrigins)) return status(403);
    const raw = await readBodyCapped(request, deps.maxBytes);
    if (raw === null) return status(413);
    const form = Object.fromEntries(new URLSearchParams(raw));
    if (isBotOrOutOfWindow(form, deps.now())) return respond('ok');
    const parsed = submissionSchema.safeParse(normalizeEmpty(form));
    if (!parsed.success) return respond('invalid');
    const gate = await deps.limit(deps.clientIp);
    if (gate === 'limited') return respond('limited');
    if (gate === 'error') return respond('failed');
    const sent = await deps.send(buildEmail(parsed.data));
    return respond(sent ? 'ok' : 'failed');
  } catch {
    return respond('failed');
  }
}
```
`jsonFor('limited')` = 429 + `Retry-After`; `invalid` = 400 `{ok:false,code:'invalid',fields:[...]}`; `failed` = 502; todos com `Cache-Control: no-store`. `Vary: Accept`.

### Teste Node sem Astro
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { handleSubmission } from './submit.ts';

test('honeypot preenchido devolve sucesso falso e nao envia', async () => {
  let sent = 0;
  const res = await handleSubmission(req({ 'empresa-site': 'x', nome: 'Ana', email: 'a@b.co' }), deps({ send: async () => (sent++, true) }));
  assert.equal(res.status, 303);
  assert.equal(sent, 0);
});
```

### Cookies zero (LGPD-06)
```javascript
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto(`${PREVIEW_URL}/`, { waitUntil: 'networkidle' });
assert.deepEqual(await ctx.cookies(), []);
assert.equal(await page.evaluate(() => document.cookie + localStorage.length + sessionStorage.length), '00');
```
Rodar contra preview/produção: `/_vercel/insights/*` só existe na Vercel, não no servidor estático local.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `output: 'hybrid'` | `static` + `prerender = false` por rota | Astro 5 | Já aplicado |
| Vercel KV | Upstash Redis via Marketplace | dez/2024 | Nomes de env legados `KV_*` ainda aparecem |
| `experimental.csp` | `security.csp` estável | Astro 6 | Fase 7 |

**Deprecated/outdated:** `@vercel/kv`; passar `webAnalytics` no adapter (v2 usa componente, já feito em `BaseLayout.astro`).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Pacotes `resend`, `zod`, `@upstash/*` legítimos (slopcheck indisponível) | Package Legitimacy | Baixo; nomes prescritos pelo usuário |
| A2 | Usuário aceita timing sem HMAC, tolerando `rendered-at` ausente | Pitfall 1 | Médio: se exigir timing estrito, no-JS precisa de outro desenho |
| A3 | Rejeitar POST sem `Origin` não bloqueia humanos | Pitfall 2 | Baixo |
| A4 | Nomes de env do Upstash/Marketplace (`KV_*` e/ou `UPSTASH_*`) | Pitfall 8 | Baixo: leitura com fallback |
| A5 | TTL das chaves `rl:*` acompanha a janela | Pattern 3 | Médio (LGPD-04 "TTL curto"); validar no Data Browser |
| A6 | Retenção de logs do Resend depende do plano | Pitfall 9 | Médio: afeta texto da política |
| A7 | Texto legal: Art. 7º V e IX, Art. 18, prazo de 15 dias (Art. 19), Art. 33 (transferência), Res. CD/ANPD 2/2022 aplica a pessoa natural | Pattern 6 / Política | Alto se errado; revisão jurídica do Felipe (D-18) |
| A8 | Hosts DNS exatos do Resend (`resend._domainkey`, `send`, `_dmarc`) | Pitfall 7 | Baixo: o painel mostra os valores |
| A9 | `_dmarc` sem `rua` até haver caixa para relatórios | Pitfall 6 | Baixo |
| A10 | Servidor `astro:env` secret com `optional: true` não falha o build do CI sem env | Environment | Baixo: `RESEND_API_KEY` já é declarada e o CI builda sem ela |

## Open Questions (RESOLVED)

1. **Hobby e uso comercial** — RESOLVED: decisão do Felipe no checkpoint 05-14 Task 2 (Hobby aceito ou Pro), com o SEC-08 atualizado no 05-08 e reescrito no 05-14 Task 3.
   - Sabemos: Fair Use do Vercel restringe Hobby a uso não comercial (anunciar serviço conta); SEC-08 depende de Hobby sem cartão.
   - Incerto: tolerância prática da Vercel e se o fundador migrará para Pro.
   - Recomendação: o planner inclui uma nota de risco no `runs/phase-05.md` e no ROADMAP (SEC-08) e pergunta ao Felipe; Pro também habilita mais regras de WAF e Spend Management. Não bloqueia o código.
2. **Timing sem JS** — RESOLVED: risco aceito pelo Felipe em 2026-10-15 (05-CONTEXT D-27); o timing passa a usar `elapsed-ms` medido no cliente (sem comparar relógios), em vez do `rendered-at` descrito nas seções acima; os planos 05-01/05-07/05-09 prevalecem.
   - Recomendação: seguir Pitfall 1 e registrar limitação como risco aceito no SEC-07.
3. **FORM-13 no hero / CtaFinal** — RESOLVED: sem CTA de WhatsApp no hero nesta fase, exceção registrada em REQUIREMENTS.md e ROADMAP.md (05-CONTEXT D-26, Felipe 2026-10-15).
   - Fato: `HeroBleed.astro` só tem `#contato` e `#projetos` (sem WhatsApp); `CtaFinal.astro` não existe. Links WhatsApp reais: canal em `ContactSection.astro`, coluna de contato e botão flutuante em `SiteFooter.astro`.
   - Recomendação: aplicar `?text=` genérico aos três existentes e novos nos cards de serviço; **não** inventar link no hero. Confirmar com Felipe se quer um CTA WhatsApp no hero.
4. **Região do Upstash** — RESOLVED: escolhida pelo Felipe no checkpoint 05-11 Task 2 e conferida contra a política no 05-12 Task 2.
   - Escolher região no Marketplace (preferir `sa-east-1`/São Paulo se disponível `[ASSUMED]`) reduz latência e a menção de transferência internacional para os contadores; a transferência (EUA) segue válida por Vercel/Resend.
5. **Mensagem 1000 vs 2000** — RESOLVED: 1000, fixado em `LIMITS.messageMax` no 05-01.
   - Usar 1000 (alinhado ao `maxlength` e ao UI-SPEC); satisfaz FORM-04.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build/test | ✓ | 24.14.0 | — |
| pnpm | install | ✓ (packageManager 11.15.1) | — | — |
| Playwright | gates do form | ✓ devDep 1.64.1 | — | — |
| slopcheck | gate de pacotes | ✗ | — | checkpoint humano único |
| ctx7 CLI | docs | ✗ | — | WebFetch em docs oficiais (usado) |
| Conta Resend (nova) + chave | FORM-09, SEC-09 | ✗ (manual) | — | bloqueia go-live |
| DNS GoDaddy (DKIM/SPF/DMARC) | SEC-09 | ✗ (manual) | — | bloqueia go-live |
| Upstash via Marketplace | FORM-08 | ✗ (manual) | — | in-memory só em dev |
| Regra WAF no dashboard | FORM-11 | ✗ (manual) | — | bloqueia fechamento da fase |
| mail-tester.com | SEC-09 | ✗ (manual) | — | — |

**Missing dependencies with no fallback:** os quatro itens manuais acima; planejar como `checkpoint:human-action` guiados, em ordem: Resend + domínio → DNS → Upstash → env vars na Vercel → deploy preview → teste fim a fim → mail-tester → WAF (Log, depois ação).
**Mail-tester:** como `to` é fixo no servidor, o teste exige um script avulso `scripts/mail-tester.mjs` (lê `RESEND_API_KEY` do ambiente, envia um e-mail de exemplo ao endereço de teste, sem segredos no repo) ou envio pelo painel do Resend.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node --test` (nativo, Node 24) + Playwright 1.64.1 para gates de navegador |
| Config file | nenhum; script `test` em `package.json` |
| Quick run command | `pnpm test` (alterar glob para `"src/**/*.test.mjs"`) |
| Full suite command | `pnpm check && pnpm test && pnpm build && node scripts/verify/form-gates.mjs && bash scripts/security-check.sh --ci` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-04 | nome 2–80, contato obrigatório, enum, msg ≤1000 | unit | `node --test src/lib/form-schema.test.mjs` | ❌ Wave 0 |
| FORM-05 | cliente e servidor concordam (mesmos casos em tabela) | unit | `node --test src/lib/form-schema.test.mjs` | ❌ Wave 0 |
| FORM-07 | honeypot e janela 3 s/2 h → sucesso falso, 0 envios | unit | `node --test src/lib/submit.test.mjs` | ❌ Wave 0 |
| FORM-08 | ordem ip→hora→dia, fail-closed, `reason:'timeout'` | unit com fakes | `node --test src/lib/submit.test.mjs` | ❌ Wave 0 |
| FORM-09 | escape HTML, CR/LF no assunto, `text` presente, replyTo condicional | unit | `node --test src/lib/mail.test.mjs` | ❌ Wave 0 |
| FORM-10 | 415, 403, 413 (com e sem Content-Length), erro genérico, `Location` só de tabela | unit | `node --test src/lib/request-guards.test.mjs` | ❌ Wave 0 |
| FORM-02 | POST nativo → `/obrigado` (JS desligado) | e2e mock | `node scripts/verify/form-gates.mjs` | ❌ Wave 0 |
| FORM-03/06/12 | estados, aria, foco, submit desabilitado, alerta WhatsApp | e2e (`page.route`) | `node scripts/verify/form-gates.mjs` | ❌ Wave 0 |
| FORM-13 | todo `wa.me` com `text=` codificado e `rel` | e2e/grep no build | `node scripts/verify/form-gates.mjs` | ❌ Wave 0 |
| FORM-11 | regra WAF existe | manual (screenshot/descrição em `runs/phase-05.md`) | — | n/a |
| LGPD-01/02/03 | política tem as 10 seções, aviso ao lado do submit | e2e/grep no HTML | `node scripts/verify/form-gates.mjs` | ❌ Wave 0 |
| LGPD-04 | sem `console.*`, sem IP cru em chaves, `analytics:false` | grep + unit (`hashIp`) | `bash scripts/security-check.sh --ci` (novo item) | ❌ Wave 0 |
| LGPD-05/06 | zero cookies/storage; sem request de terceiros | e2e contra preview | `PREVIEW_URL=... node scripts/verify/form-gates.mjs --live` | ❌ Wave 0 |
| LGPD-07 | Key Decision em `PROJECT.md` | grep | `grep -n "6 meses" .planning/PROJECT.md` | ❌ Wave 0 |
| SEC-08 | declaração no ROADMAP atualizada | grep | `grep -n "SEC-08" .planning/ROADMAP.md` | ✅ (verificar) |
| SEC-09 | SPF/DKIM/DMARC + nota >= 8 | manual | `dig TXT _dmarc.agenciadmarques.com.br` + captura do mail-tester | n/a |
| PERF | Lighthouse mobile >= 95, JS < 20 KB | CI | `bash scripts/js-weight-check.sh`, `lhci` | ✅ |

### Sampling Rate
- **Per task commit:** `pnpm test` (< 5 s)
- **Per wave merge:** suíte completa acima
- **Phase gate:** suíte verde + SEC-07 sem High + 1 envio real de ponta a ponta em preview

### Wave 0 Gaps
- [ ] `src/lib/form-schema.test.mjs`, `submit.test.mjs`, `mail.test.mjs`, `request-guards.test.mjs`, `rate-limit.test.mjs`
- [ ] `scripts/verify/form-gates.mjs` (reaproveita `static-server.mjs`)
- [ ] Ajustar glob do script `test` em `package.json`
- [ ] Itens novos em `scripts/security-check.sh`: Functions `== 1`; grep de `console\.` em `src/pages/api` e `src/lib`; varredura de `UPSTASH|KV_REST|RATE_LIMIT_SALT` em `STATIC_DIR`
- [ ] Instalação das quatro dependências

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | não | — |
| V3 Session Management | não (zero cookies) | — |
| V4 Access Control | sim (Origin, endpoint único) | Origin allow-list + `checkOrigin` |
| V5 Input Validation | sim | Zod 4 server-side + escape + strip de controle |
| V6 Cryptography | sim | `node:crypto` HMAC (IP); nunca hash caseiro |
| V7 Error Handling/Logging | sim | erros genéricos, zero PII em log |
| V13 API | sim | só POST urlencoded, 405/415/413, teto de corpo |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Spam/flood do formulário | DoS | WAF (edge) + Upstash (IP/hora/dia) + honeypot |
| Abuso para enviar e-mail a terceiros | Spoofing/Abuse | `from`/`to` fixos, sem auto-resposta (D-07) |
| Injeção em HTML do e-mail | Tampering | `escapeHtml` em todo campo interpolado |
| Injeção de cabeçalho (assunto/reply-to) | Tampering | strip CR/LF/controle, regex de e-mail estrita |
| CSRF cross-site | Tampering | urlencoded-only + `checkOrigin` + Origin própria |
| Open redirect | Tampering | `Location` só de tabela fixa |
| Vazamento de segredo no bundle | Info disclosure | `astro:env` secret + varredura de `dist/` |
| Esgotamento de cota Resend (100/dia) | DoS | teto diário 50 < 100 |
| PII em log/Redis | Info disclosure | HMAC do IP, `analytics:false`, sem `console.*` |

## Sources

### Primary (HIGH confidence)
- https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting (2026-08-28) — limites Hobby, janela, ações, contadores por região
- https://vercel.com/docs/limits/fair-use-guidelines (2026-09-14) — Hobby não comercial
- https://vercel.com/docs/headers/request-headers — `x-forwarded-for` sobrescrito pela Vercel (anti-spoof); `x-real-ip` idêntico
- https://vercel.com/docs/analytics/privacy-policy (2026-06-26) — sem cookies de terceiros, visitante por hash, descarte em 24 h
- https://docs.astro.build/en/reference/configuration-reference/ — `security.checkOrigin`
- https://docs.astro.build/en/guides/endpoints/ — POST/ALL, `prerender = false`
- https://docs.astro.build/en/reference/modules/astro-env/ — `getSecret`
- https://resend.com/docs/send-with-nodejs — `{data,error}`, `replyTo`, `idempotencyKey`
- https://upstash.com/docs/redis/sdks/ratelimit-ts/features e `/algorithms` — `timeout`, `analytics`, `prefix`, `ephemeralCache`
- Código local: `node_modules/@astrojs/vercel/dist/serverless/entrypoint.js` (`clientAddress` = primeiro IP válido do `x-forwarded-for`)
- `npm view` (2026-10-15) das quatro dependências

### Secondary (MEDIUM confidence)
- Resultados de busca sobre nomes de env do Marketplace Upstash (terceiros) — ver A4

### Tertiary (LOW confidence)
- Conhecimento de treinamento sobre LGPD (Arts. 7, 18, 19, 33; Res. CD/ANPD 2/2022), DNS do Resend, retenção do Resend — `[ASSUMED]`, requer revisão do Felipe

## Project Constraints (from CLAUDE.md)

- Astro 7 estático + `@astrojs/vercel`; apenas a rota do formulário on-demand (uma Function). `output: 'static'`.
- Sem framework de UI; ilhas só onde há interatividade; JS da landing < 20 KB; Lighthouse >= 95.
- Segredos fora do bundle; `npm audit`/`pnpm audit` limpo; CSP restritiva fica para a Fase 7 (não quebrar: `connect-src 'self'`, sem inline, sem `style=""`).
- LGPD: coleta mínima, base legal, política publicada.
- Idioma pt-BR; acessibilidade (reduced-motion, AA, teclado, HTML semântico).
- Memória do usuário: **zero comentários** em qualquer arquivo versionado (os trechos acima não têm comentários; manter nos planos). Documentação do WAF vai em `docs/*.md`, que não é comentário de código.
- Fluxo GSD: edições só via comandos GSD.
- Skill `sketch-findings-dmarques` (direção "Aurora técnica"): estilos novos reutilizam tokens existentes; único token novo `--color-danger-text` (UI-SPEC).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versões verificadas no registro; escolhas travadas pelo usuário
- Architecture: HIGH — baseada no código existente, no adapter instalado e em docs oficiais
- Pitfalls: MEDIUM-HIGH — Hobby/WAF e Fair Use citados; deliverability e nomes de env são `[ASSUMED]`
- Texto jurídico da política: LOW-MEDIUM — exige revisão humana (D-18)

**Research date:** 2026-10-15
**Valid until:** 2026-11-14 (limites do plano Hobby e dos free tiers mudam com frequência)
