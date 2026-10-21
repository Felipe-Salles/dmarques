---
phase: 05-form-backend-enhancement-lgpd
verified: 2026-10-21
status: gaps_found
score: 19/20 requisitos ativos satisfeitos; FORM-05 divergente
overrides_applied: 0
requirements_satisfied: [FORM-01, FORM-02, FORM-03, FORM-04, FORM-06, FORM-07, FORM-08, FORM-09, FORM-10, FORM-11, FORM-12, FORM-13, LGPD-03, LGPD-04, LGPD-05, LGPD-06, LGPD-07, SEC-08, SEC-09]
requirements_unsatisfied: [FORM-05]
requirements_excluded: [LGPD-01, LGPD-02]
gaps:
  - id: FORM-05
    status: unsatisfied
    evidence: REQUIREMENTS proíbe validação por tecla e bloqueio do submit; form.ts implementa ambos conforme o plano 05-07.
    action: Reconciliar o contrato via correção do comportamento ou decisão explícita de revisão do requisito.
---

# Fase 05 — Verificação retroativa

**Objetivo:** formulário de orçamento funcional com e sem JavaScript, envio ao fundador e defesas contra abuso, considerando as decisões D-26, D-27, D-28 e D-29.

**Resultado:** `gaps_found`. A ausência do relatório foi resolvida. Existe uma divergência entre o requisito FORM-05 e o plano implementado; não há evidência de aprovação explícita que substitua sua redação. Os 19 demais requisitos ativos têm evidência de implementação, testes ou atestação histórica, conforme discriminado abaixo.

## Escopo e fontes

Foram lidos os 14 SUMMARYs e os contratos relevantes de 05-CONTEXT, REQUIREMENTS e ROADMAP; conferidos os módulos do formulário, a rota, os testes, os gates, a configuração Astro, o workflow de CI, PROJECT, o run SEC-07 da fase e os documentos operacionais.

A verificação usa o código de `b20622b`, sem mudança funcional nesta tarefa. Evidência atual local e evidência histórica externa são separadas. Não houve envio real de e-mail, criação de lead, rajada contra produção, escrita no Redis nem alteração de DNS, WAF ou ambiente.

## Critérios de sucesso

| Critério | Resultado | Evidência |
|---|---|---|
| POST nativo e enhancement acessível com preservação de dados e WhatsApp alternativo | Verificado, com divergência FORM-05 | ContactSection, form.ts, submit.ts, páginas estáticas e gates mockados; histórico 05-12 confirma aceite ponta a ponta |
| Validação autoritativa e defesas em camadas, e-mail seguro e WAF | Verificado | Zod, guardas de 16 KB/Origin, honeypot/timing, Upstash, montagem do e-mail e testes; WAF externo comprovado em 05-13 |
| Política e aviso publicados no mesmo release | Substituído por D-29 | Decisão revisada de 2026-10-16 remove política e aviso detalhado; frase curta permanece; base e retenção internas existem |
| Ausência de PII bruta em logs/persistência e analytics sem cookies/eventos de formulário | Verificado no escopo aprovado | Código sem logger/console no servidor, HMAC no rate limit, nenhum evento de analytics no enhancer; atestação e gates live de 05-12 |
| Gates de qualidade e SEC-07 sem High aberto | Evidência histórica e verificação local atual | Run phase-05 e CI do PR #5; evidência final de produção em 07-VERIFICATION; resultados locais abaixo |

## Cobertura de requisitos

| Requisito | Planos de origem | Status | Evidência |
|---|---|---|---|
| FORM-01 | 05-04, 05-07, 05-12 | SATISFIED | ContactSection usa nome, seletor canal, contato, tipo e mensagem; ChipGroup e CSS `:has()` funcionam sem JS; schema exige somente o contato escolhido |
| FORM-02 | 05-06, 05-09, 05-10, 05-12 | SATISFIED | `method="post" action="/api/orcamento"`; submit.ts retorna 303 `/obrigado`; testes do handler e gate semJsPostNativo com API mockada |
| FORM-03 | 05-07, 05-10, 05-12 | SATISFIED | initForm faz fetch, controla sending/done/failed/limited, desabilita submit e preserva entradas; gates sucesso, erro400, falha, limite e rede |
| FORM-04 | 05-01, 05-02, 05-04 | SATISFIED | submissionSchema Zod compartilha LIMITS/EMAIL_RE/normalizePhone e PROJECT_TYPE_VALUES; remove contato do canal não escolhido antes do parse; testes de limites e concordância |
| FORM-05 | 05-01, 05-04, 05-07 | UNSATISFIED | form.ts:261 registra input após attempted; :271 retorna antes do fetch se houver erro. Plano 05-07 exige isso, mas REQUIREMENTS diz “nunca a cada tecla” e “sem bloquear o submit” |
| FORM-06 | 05-07, 05-10 | SATISFIED | markError/clearError associam aria-invalid/describedby, reportInvalid move foco e anuncia contagem; status e alertas acessíveis cobertos nos gates |
| FORM-07 | 05-07, 05-09 | SATISFIED | isBot descarta honeypot e elapsed inválido/fora de 3 s–24 h antes de rate limit/envio; testes verificam zero envios. Campo ausente tolerado por D-27 |
| FORM-08 | 05-02, 05-05, 05-09, 05-12 | SATISFIED | Upstash: 3/IP/10 min, 20/h e 50/dia; 429/Retry-After; timeout/exceção falham fechado. Testes com dependências injetadas; provisionamento histórico 05-11 |
| FORM-09 | 05-01, 05-02, 05-04, 05-09, 05-12 | SATISFIED | Endereços vêm de configuração server-only; assunto montado no servidor conforme D-06/D-28; escapeHtml, stripControl, texto alternativo e replyTo condicional testados; Resend ligado em deps.ts |
| FORM-10 | 05-05, 05-09 | SATISFIED | readBodyCapped limita bytes declarados e stream; REASON_PATH tem quatro destinos fixos; respostas genéricas e falhas sem stack testadas, incluindo failureResponse |
| FORM-11 | 05-08, 05-13, 05-14 | SATISFIED | 05-13 registra config ativa api-flood e 10 respostas 405 seguidas de 403 com X-Vercel-Mitigated deny; Deny no Hobby é exceção aprovada, não 429 do app |
| FORM-12 | 05-06, 05-07, 05-10 | SATISFIED | Alertas de falha/limite e destinos estáticos oferecem WhatsApp; refreshWaLinks usa nome/tipo sanitizados; gates de falha, limite e páginas |
| FORM-13 | 05-01, 05-06, 05-07, 05-10 | SATISFIED | buildWaUrl usa encodeURIComponent; deepLinks cobre Contato/rodapé/flutuante/serviços e rel. Hero excluído por D-26 |
| LGPD-01 | 05-03, 05-10 | EXCLUDED | Política removida por D-29; não reabrir o escopo original |
| LGPD-02 | 05-03, 05-10 | EXCLUDED | Aviso detalhado removido por D-29; risco de transparência registrado e aceito |
| LGPD-03 | 05-07, 05-10 | SATISFIED | Frase curta sob o botão, sem link/checkbox; gate privacidadeNoForm verifica escopo final D-29 |
| LGPD-04 | 05-05, 05-09, 05-12 | SATISFIED | Sem console/logger em src/lib ou API; IP bruto só é passado ao HMAC; rate keys contêm pseudônimo e globais não contêm IP. Logs do preview sem registros em 05-12 |
| LGPD-05 | 05-07, 05-10, 05-12 | SATISFIED | form.ts não chama track/va nem usa storage; redeSemAnalytics observa a interação local; gates live históricos corroboram a ausência de terceiros |
| LGPD-06 | 05-12 | SATISFIED | Felipe aprovou inspeção Cookies/Storage no DevTools em 2026-10-16; cookiesZero e terceiros passaram no preview. Não foi repetida nova inspeção externa nesta tarefa |
| LGPD-07 | 05-03, 05-08 | SATISFIED | PROJECT registra bases Art. 7º V/IX e retenção de 6 meses; docs/operacao-formulario.md descreve expurgo mensal. Somente a publicação foi removida por D-29 |
| SEC-08 | 05-08, 05-14 | SATISFIED | ROADMAP descreve risco residual e controles compensatórios; docs/waf-rate-limit.md tem runbook; decisões sobre Hobby e Cloudflare M2 preservadas |
| SEC-09 | 05-08, 05-11, 05-14 | SATISFIED | 05-11 documenta DKIM, CNAMEs Resend, SPF/MX preservados e DMARC quarantine; mail-tester 10/10 em 2026-10-15, acima do mínimo 8 |

Todos os 22 IDs da Fase 05 estão presentes na tabela: 20 ativos e dois excluídos. Os 20 ativos constam em `requirements-completed` dos SUMMARYs. A declaração anterior de conclusão de FORM-05 não prevalece sobre a divergência constatada.

## Integração rastreada

`ContactSection` → `effects.initForm` → `fetch(form.action)` → `POST /api/orcamento` → `handleSubmission` → guardas/bot → Zod → rate gate → `buildEmail` → Resend → JSON ou 303 → feedback ou página estática.

`prerender = false` está restrito à API. `astro:env/server` aparece na rota, não no enhancer. Tokens/markup permanecem estáticos. Email de destino não vem do lead; não há auto-resposta ao visitante (D-07).

## Limites e reconciliação de documentos

- FORM-04: o limite implementado é 1000, mais restritivo que o teto ≤2000. O plano 05-01 escolheu 1000 explicitamente para corresponder ao markup/UI-SPEC; não foi tratado como violação desse teto.
- FORM-09: “subject fixo” significa template controlado no servidor; D-06 aprova nome/tipo sanitizados no assunto e D-28 inclui canal. Não existe assunto arbitrário fornecido pelo cliente.
- LGPD-04: o requisito refere-se a IP bruto, user-agent e timestamp pessoais. A persistência de HMAC por janela de rate limit é a implementação aprovada em 05-05; pseudonimização não equivale a ausência de qualquer identificador. TTL efetivo do Redis não foi reconsultado nesta tarefa.
- 05-12 preserva o histórico intermediário com `<details>`; sua seção final “Revisão D-29” e PROJECT são o escopo vigente, sem aviso detalhado.
- Logs vazios não provam ausência de metadados retidos pelo provedor. O relatório atesta ausência de logging de PII no código da aplicação e preserva as ressalvas de 05-12 e P05-005.
- Gates locais com page.route exercitam a UI e o POST nativo com resposta mockada; não comprovam nova entrega real de e-mail nem disponibilidade atual de Redis/WAF/DNS.
- Performance de produção é evidência histórica dos runs aprovados em 07-VERIFICATION. INP de campo e injeção local do antivírus continuam com os limites registrados.

## Lacuna para fechamento

**FORM-05:** reconciliar REQUIREMENTS e plano 05-07. A correção pode ajustar o cliente ao requisito atual; manter o comportamento implementado exige decisão explícita sobre a revisão do requisito. O gate `validacaoInline` atualmente exige zero requisições no formulário inválido e retirada do erro durante o preenchimento; precisará acompanhar uma eventual correção do contrato. Não foi feita alteração funcional nesta tarefa documental.

Riscos já aceitos (D-27/D-29, Hobby, WAF Deny, Cloudflare M2 e dependências allowlisted) não foram convertidos em novos bloqueios.

## Resultados atuais — 2026-10-21

| Comando | Resultado | Limite da evidência |
|---|---|---|
| `pnpm test` | 160 PASS, zero FAIL/SKIP | Suíte de módulos; dependências externas injetadas |
| `pnpm build` | Exit 0, sete páginas, finalizador CSP enforce | Aviso genérico Shiki/CSP; gate posterior não encontrou style= no código |
| `node scripts/verify/form-gates.mjs` | 16 PASS, zero FAIL | API mockada; inclui POST nativo, estados, canal, WhatsApp, analytics e CSP |
| `node scripts/verify/form-card-height.mjs` | 6 PASS, zero FAIL | Card 752,8 px nos três estados contra limite de 756 px; um contato visível |
| `bash scripts/security-check.sh --ci` | 11 PASS, zero FAIL, 2 SKIP | Preview e Lighthouse não executados; exatamente uma Function, sem segredos na saída |
| `bash scripts/js-weight-check.sh .vercel/output/static` | PASS: 9.177 bytes gzip / 20.480 | Inclui bundle e scripts inline da landing |
| `pnpm check` | Exit 0: 76 arquivos, zero erros, zero warnings, um hint | Hint existente no script JSON-LD de BaseLayout; execução local levou cerca de seis minutos |

O PASS do audit embutido no gate usa o limiar high e exclusões existentes. Não certifica zero advisories: a auditoria do milestone registra oito moderate e duas high ignoradas. Não houve alteração de dependências.

O CI do HEAD de entrada `b20622b` está aprovado no PR #13: job verify do run 39671154609, lhci do run 39671210940 e headers-preview do run 39671210912. Esses resultados cobrem a implementação inalterada e são identificados como evidência anterior ao commit documental desta tarefa.
