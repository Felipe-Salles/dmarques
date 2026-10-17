---
phase: 05
slug: form-backend-enhancement-lgpd
status: verified
threats_open: 0
asvs_level: 1
created: 2026-10-17
---

# Fase 05 — Segurança

> Contrato de segurança da fase: registro de ameaças, riscos aceitos e trilha de auditoria.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Navegador para `POST /api/orcamento` | Entrada não confiável (form urlencoded, com ou sem JS) | Nome, canal, WhatsApp ou e-mail, tipo de projeto, mensagem, honeypot, `elapsed-ms` |
| Function para Upstash Redis | Estado de rate limit | IP pseudonimizado (HMAC) e contadores globais, com TTL |
| Function para Resend | Envio do lead ao fundador | Dados do lead; `from`/`to` fixos no servidor |
| Cliente para servidor, segredos | Segredos só no ambiente da Function | `RESEND_API_KEY`, `RATE_LIMIT_SALT`, tokens Upstash |
| Internet para borda Vercel (WAF) | Flood em `/api/*` | Requisições HTTP |
| DNS do domínio (GoDaddy) | Autenticação de e-mail de envio | DKIM, CNAMEs de envio, DMARC |
| Páginas estáticas para links externos | Deep-links `wa.me` | Texto pré-preenchido |

---

## Threat Register

Total: 60 entradas (T-05-01 a T-05-58, mais T-05-SC e T-05-29b, que é o T-05-29 duplicado do plano 05-08). Resultado: 60 closed, 0 open.

| Threat ID | Category | Component | Disposition | Mitigation / Evidência | Status |
|-----------|----------|-----------|-------------|------------------------|--------|
| T-05-01 | Tampering | stripControl / EMAIL_RE | mitigate | `src/lib/form-schema.ts:29-44` remove C0, DEL, U+2028/2029; `:14-15` EMAIL_RE exclui `<>,;"()[]\` e espaço; `mail.ts:20-28` reaplica no subject; teste `mail.test.mjs:24` | closed |
| T-05-02 | Tampering | escapeHtml | mitigate | `src/lib/escape-html.ts:1-11` escapa `& < > " '`; `escape-html.test.mjs` | closed |
| T-05-03 | Tampering | buildWaUrl | mitigate | `src/lib/whatsapp.ts:3` número constante, `:7-9` `encodeURIComponent(text)` | closed |
| T-05-04 | DoS | normalizePhone / regex | accept | Risco aceito AR-05-01; regexes lineares em `form-schema.ts:14-15,50-59`, teto de corpo 16 KB `request-guards.ts:1` | closed |
| T-05-SC | Tampering | pnpm add (resend, zod, @upstash/*) | mitigate | Checkpoint humano em `05-02-SUMMARY.md:30` (repositórios oficiais, sem postinstall, "Aprovado"); versões exatas em `package.json`; lockfile versionado; `ci.yml` usa `--frozen-lockfile`, `pnpm audit --audit-level=high` e `dependency-review` (fail-on high) | closed |
| T-05-05 | Info Disclosure | astro.config.mjs env.schema | mitigate | `astro.config.mjs:13-19` todos `context: 'server', access: 'secret'`; `security-check.sh:85` varre a saída estática pelos nomes | closed |
| T-05-06 | DoS | build sem env no CI | mitigate | `astro.config.mjs:14-19` opcionais; `deps.ts:26-28,33` ausência vira falha fechada. Nota: `RESEND_API_KEY` (`:13`) não é `optional`, mas o job `verify` do CI faz `pnpm build` e passa (run SEC-07, checks do PR #5), então o efeito pretendido se mantém | closed |
| T-05-07 | Repudiation | texto da política vs. comportamento | accept (D-29) | Objeto removido: `src/pages` não tem `/politica-de-privacidade` (só 404, index, obrigado, erro-envio, api). Coberto por P05-007 em `.planning/security/runs/phase-05.md` | closed |
| T-05-08 | Info Disclosure | dados do controlador na política | accept (D-29) | Página removida; grep em `src/` sem política nem CPF. P05-007 | closed |
| T-05-09 | Tampering | página da política | accept (D-29) | Página inexistente (superfície eliminada). P05-007 | closed |
| T-05-10 | Tampering | parseSubmission | mitigate | `form-schema.server.ts:24-56` Zod com enums fechados (`:30,41`), limites de tamanho, `z.object` descarta chaves desconhecidas; `:68-69` devolve só paths | closed |
| T-05-11 | Tampering | subjectFor / replyTo | mitigate | `form-schema.server.ts:63-64` descarta o campo do canal não escolhido antes do parse; `mail.ts:20-28` stripControl no subject; `:55-58` replyTo só no canal e-mail, validado por EMAIL_RE (`server.ts:39`) | closed |
| T-05-12 | Tampering | buildEmail HTML | mitigate | `mail.ts:35,39,51,61,67,74,79` `escapeHtml` em todo valor, inclusive href; sem imagens remotas (`mail.test.mjs:79`) | closed |
| T-05-13 | Spoofing | from/to | mitigate | `submit.ts:93` usa só `deps.mailFrom/mailTo`; `deps.ts:56-64` vêm de config do servidor; `submit.test.mjs:201` | closed |
| T-05-14 | Info Disclosure | mensagens de erro do Zod | mitigate | `form-schema.server.ts:68` só `issue.path[0]`; `submit.ts:64` resposta com `fields` apenas | closed |
| T-05-15 | DoS | readBodyCapped | mitigate | `request-guards.ts:22-48` rejeita Content-Length grande sem ler, cap no stream com `reader.cancel()`; testes `request-guards.test.mjs:88-109` | closed |
| T-05-16 | CSRF | isAllowedOrigin / isFormUrlEncoded | mitigate | `submit.ts:77-78` 415 e 403 antes de tudo; `request-guards.ts:3-20` Origin obrigatória em allow-list (`deps.ts:12-15`) ou mesma origem | closed |
| T-05-17 | DoS | createRateGate | mitigate | `rate-limit.ts:5-12` 3/10 min, 20/h, 50/dia; `:86-90` ordem ip, hora, dia; `:44-98` testes em `rate-limit.test.mjs` | closed |
| T-05-18 | Bypass | timeout do Upstash | mitigate | `rate-limit.ts:93` `reason === 'timeout'` vira `error`, `:102-104` exceção vira `error`; `submit.ts:91` responde falha; `deps.ts:28` sem credenciais, `error` | closed |
| T-05-19 | Info Disclosure | chaves no Redis | mitigate | `rate-limit.ts:24-30` HMAC-SHA256 com salt, /64 no IPv6; `:34` `analytics: false`; `security-check.sh:126` bloqueia `console.*` | closed |
| T-05-20 | Spoofing | IP do cliente | accept | Risco aceito AR-05-02; `src/pages/api/orcamento.ts:11` usa `clientAddress` do adapter | closed |
| T-05-21 | Tampering | /erro-envio/[motivo] | mitigate | `src/pages/erro-envio/[motivo].astro:6-12` três valores fixos, sem leitura de query nem eco | closed |
| T-05-22 | Tampering | links wa.me | mitigate | 12 `target="_blank"` e 12 `rel="noopener noreferrer"` em `src/` (ContactSection, HeroBleed, ServicesSection:74-75, SiteFooter:33,46-47, obrigado:24-25, erro-envio:55-56,69) | closed |
| T-05-23 | Info Disclosure | indexação de estado | mitigate | `BaseLayout.astro:24` `<meta name="robots" content="noindex">`; `obrigado.astro:10` e `[motivo].astro:40` passam `noindex` | closed |
| T-05-24 | DOM XSS | form.ts | mitigate | grep sem `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval` em `src/`; `form.ts:156-161` só `setAttribute('href', buildWaUrl(...))`; textContent em `:59-64` | closed |
| T-05-25 | Info Disclosure | analytics na interação | mitigate | `form.ts:1-12` não importa analytics; `@vercel/analytics` só em `BaseLayout.astro:3,45` (pageview); `form-gates.mjs:737` gate `terceiros` | closed |
| T-05-26 | DoS | duplo envio | mitigate | `form.ts:52,269` guarda `sending`; `:163-177` submit disabled; `:188-211` bloqueio por Retry-After (padrão 60 s); `:213-219` painel de sucesso | closed |
| T-05-27 | Tampering | validação do cliente | accept | Risco aceito AR-05-03; servidor revalida (`submit.ts:86`, `form-schema.server.ts:24-56`) | closed |
| T-05-28 | Bot | honeypot | mitigate | `ContactSection.astro:129-139` `aria-hidden`, `tabindex="-1"`, `autocomplete="off"`; `:562` `.hp` fora da tela; `submit.ts:47-48,84` descarta | closed |
| T-05-29 | Tampering | `canal` / campo oculto | mitigate | `form-schema.server.ts:30` enum de canal, `:63-64` descarta campo do outro canal; `form.ts:92-101` campo inativo `disabled` | closed |
| T-05-29b | Info Disclosure | scripts/mail-tester.mjs (plano 05-08) | mitigate | `mail-tester.mjs:5` chave só de `process.env`; nunca impressa, falha imprime só `error.name` (`:34`); `.gitignore:7,10` `.env*` ignorado, nenhum `.env*` versionado | closed |
| T-05-30 | Spoofing | DNS do domínio | mitigate | `05-11-SUMMARY.md` tabela de DNS: DKIM `resend._domainkey`, CNAMEs `send`/`rsend` (publicam SPF próprio), MX e SPF da raiz intactos. DMARC já em `p=quarantine`, desvio aceito P05-006 | closed |
| T-05-31 | DoS | flood sem edge L3/L7 | accept | Risco residual SEC-08 em `.planning/ROADMAP.md:20-32`; runbook `docs/waf-rate-limit.md`; P05-004 | closed |
| T-05-32 | Repudiation | regra WAF manual | mitigate | `docs/waf-rate-limit.md` passo a passo versionado; evidência da regra e da rajada em `runs/phase-05.md` ("WAF api-flood") | closed |
| T-05-33 | Open redirect | Location | mitigate | `submit.ts:17-22,28-33` `Location` só de `REASON_PATH`; teste `submit.test.mjs:219` | closed |
| T-05-34 | Info Disclosure | respostas de erro | mitigate | `submit.ts:96-98` catch genérico; `deps.ts:45-47` sem vazar exceção; zero `console.*`; teste `submit.test.mjs:189` | closed |
| T-05-35 | Bot | honeypot/timing | mitigate + accept | Honeypot e timing em `submit.ts:46-55,84`; omitir `elapsed-ms` contorna o timing, aceito por Felipe (D-27), P05-001 em `runs/phase-05.md`; testes `submit.test.mjs:92-115` | closed |
| T-05-36 | DoS | ordem das guardas | mitigate | `submit.ts:77-84` 415/403/413/bot antes de Zod (`:86`), Redis (`:89`) e Resend (`:94`) | closed |
| T-05-37 | Elevation | ausência de segredos | mitigate | `deps.ts:28` sem Upstash/salt devolve `error`; `:33` sem `RESEND_API_KEY` devolve `false` | closed |
| T-05-38 | Info Disclosure | segredos no bundle | mitigate | Só `src/pages/api/orcamento.ts:1` importa `astro:env/server` (grep); `security-check.sh:85` verificação 4 passa no run SEC-07 | closed |
| T-05-39 | Abuse (relay) | destino do e-mail | mitigate | `deps.ts:56-64`, `submit.ts:93`; teste `submit.test.mjs:201` | closed |
| T-05-40 | Info Disclosure | logs do servidor | mitigate | `security-check.sh:126-132` verificação 8; executada no `ci.yml`; PASS no run SEC-07 | closed |
| T-05-41 | Info Disclosure | segredos na saída estática | mitigate | `security-check.sh:85` com os nomes novos (`RESEND_API_KEY`, `RATE_LIMIT_SALT`, `UPSTASH_REDIS_REST`, `KV_REST_API`, `CONTACT_EMAIL`, `re_...`) | closed |
| T-05-42 | Elevation | contagem de Functions | mitigate | `security-check.sh:93-98` exige exatamente 1; PASS no run SEC-07 | closed |
| T-05-43 | Info Disclosure | bypass secret | mitigate | `form-gates.mjs:27,705` lido do ambiente e enviado só em `extraHTTPHeaders`; `security-check.sh:13,105,117` só em header curl; nunca impresso | closed |
| T-05-44 | Repudiation | regressão LGPD-05/06 | mitigate | `ci.yml` roda `form-gates.mjs`; gates `cookiesZero` e `terceiros` (`form-gates.mjs:710-760`); modo `--live` PASS no run SEC-07 | closed |
| T-05-45 | Info Disclosure | RESEND_API_KEY / RATE_LIMIT_SALT | mitigate | `docs/operacao-formulario.md` (Estado atual): variáveis Sensitive, conta Resend separada; `05-11-SUMMARY.md` salt de 32 bytes gravado como Sensitive; `.gitignore:7`. Restrição da chave a "Sending access" está só atestada no checkpoint humano (`05-11-PLAN.md:83,87`), sem evidência de código | closed |
| T-05-46 | Spoofing | domínio de envio | mitigate | DKIM e CNAMEs verificados (`05-11-SUMMARY.md`), DMARC quarantine pré-existente (P05-006), mail-tester 10/10 (maior ou igual a 8) | closed |
| T-05-47 | DoS | MX da caixa existente | mitigate | `05-11-SUMMARY.md`: MX e TXT SPF da raiz "intacto" por nslookup; instrução em `docs/operacao-formulario.md` | closed |
| T-05-48 | Info Disclosure | tracking do Resend | mitigate | Instrução em `docs/operacao-formulario.md` (passo 6) e confirmação exigida no checkpoint de `05-11-PLAN.md:87`, concluído por Felipe. Não há registro explícito do estado em summary ou run (ver Observações) | closed |
| T-05-49 | Info Disclosure | bypass secret (05-12) | mitigate | Mesmas evidências de T-05-43 (`form-gates.mjs:27,705`) | closed |
| T-05-50 | Info Disclosure | logs da Function | mitigate | `runs/phase-05.md` ("Logs da Function (LGPD-04)"): `vercel logs` e runtime-logs sem registros após as sondas; `security-check.sh:126` | closed |
| T-05-51 | Repudiation | comportamento real vs. política | accept (D-29) | Política e bloco "Como usamos seus dados" removidos (grep em `src/` sem ocorrência); P05-007. Zero cookies provado por gate `cookiesZero` e DevTools (`05-12-SUMMARY.md:86`) | closed |
| T-05-52 | DoS | WAF /api/* | mitigate (desvio) | `docs/waf-rate-limit.md:11-15` regra `api-flood` ativa, 10 req/60 s/IP, ação Deny 403 (429 exige Pro); rajada `405 x10` e depois `403` (`X-Vercel-Mitigated: deny`); desvio registrado em P05-004 e no run | closed |
| T-05-53 | DoS | falso positivo em humanos | mitigate | Limite 10/min contra 3/10 min do app; regra criada primeiro em modo Log e testada (`05-13-SUMMARY.md:34-35`) antes do Deny | closed |
| T-05-54 | DoS | contadores por região / 1 regra | accept | P05-004 em `runs/phase-05.md`; `docs/waf-rate-limit.md:3` | closed |
| T-05-55 | Repudiation | fechamento da fase | mitigate | `.planning/security/runs/phase-05.md` versionado com saída verbatim, checks do PR e sign-off de Felipe (2026-10-16) | closed |
| T-05-56 | Elevation | merge com High aberto | mitigate | `runs/phase-05.md`: "Nenhum achado High em aberto" e merge só após aprovação explícita | closed |
| T-05-57 | DoS / legal | plano Hobby comercial | transfer/accept | Decisão de Felipe registrada em P05-003 (prazo 2026-12-31) | closed |
| T-05-58 | Info Disclosure | LGPD-01 (política fora do release) | accept (D-29) | Política removida por decisão do titular; P05-007 | closed |

*Status: open · closed*
*Disposition: mitigate (implementação exigida) · accept (risco documentado) · transfer (terceiro)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-05-01 | T-05-04 | Regexes lineares e entradas limitadas por LIMITS e pelo corpo de 16 KB | Plano 05-01 (fechamento aprovado por Felipe) | 2026-10-16 |
| AR-05-02 | T-05-20 | IP vem de `clientAddress` (Vercel sobrescreve x-forwarded-for); rotação de IP coberta pelos tetos globais | Plano 05-05 (idem) | 2026-10-16 |
| AR-05-03 | T-05-27 | Validação do cliente é só conveniência; servidor é a fonte da verdade | Plano 05-07 (idem) | 2026-10-16 |
| P05-001 | T-05-35 | Timing mínimo não vale sem JS e omitir `elapsed-ms` o contorna (D-27); compensado por honeypot, Origin, corpo, Upstash e WAF | Felipe Salles | 2026-10-15 |
| P05-003 | T-05-57 | Vercel Hobby mantido apesar do uso comercial; reavaliar Pro antes de divulgar o domínio, prazo 2026-12-31 | Felipe Salles | 2026-10-16 |
| P05-004 | T-05-31, T-05-52, T-05-54 | Contadores do WAF por região, 1 regra no Hobby, ação 429 indisponível (Deny 403); SEC-08 aceito para v1 | Felipe Salles | 2026-10-16 |
| P05-005 | T-05-45, T-05-48 | Resend retém cópia técnica do e-mail pelo período do plano | Felipe Salles | 2026-10-16 |
| P05-006 | T-05-30, T-05-46 | DMARC já em `p=quarantine` (GoDaddy); `p=none` duplicaria o registro | Felipe Salles | 2026-10-16 |
| P05-007 | T-05-07, T-05-08, T-05-09, T-05-51, T-05-58 | D-29: política e aviso detalhado removidos por decisão do titular; art. 9º da LGPD sem texto publicado; reavaliar se o tráfego crescer ou se coletar mais dados | Felipe Salles | 2026-10-16 |
| P05-008 | (informativo) | Dependabot pré-existente (`extract-zip`, `smol-toml`, etc.), não vem desta fase; prazo 2026-12-31 | Felipe Salles | 2026-10-16 |

*Accepted risks do not resurface in future audit runs.*

---

## Observações da auditoria

- Nenhum Threat Flag novo: os SUMMARYs 05-01, 05-04 e 05-06 declaram "Nenhum"; os demais não têm a seção. Sem `unregistered_flag`.
- Evidências operacionais (DNS, Resend, env na Vercel, WAF, logs) foram verificadas apenas por documentação e summaries, como determinado; nenhum serviço externo foi consultado.
- T-05-48 e a restrição "Sending access" da chave (T-05-45) dependem de atestado humano do checkpoint 05-11. Recomendação não bloqueante: registrar no painel do Resend a confirmação de open/click tracking desligado e do escopo da chave.
- `RESEND_API_KEY` é obrigatória no schema de `astro.config.mjs:13` (os planos previam opcional); o build do CI passa, sem impacto.
- T-05-52 e a regra de WAF: ação Deny 403 no lugar do 429 planejado. O formulário trata o 403 de borda como falha genérica com WhatsApp (`docs/waf-rate-limit.md`).

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-17 | 60 | 60 | 0 | gsd-security-auditor (Claude) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-17
