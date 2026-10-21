---
phase: 05
slug: form-backend-enhancement-lgpd
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-15
updated: 2026-10-21
---

# Fase 05 — Estratégia de validação reconciliada

Contrato atualizado pela quick 261021-of0 e pelo debug form-05-submit-contract. A regressão de FORM-05 passou após corrigir o enhancer: o gate verifica o contrato vigente. Cobertura Nyquist reconciliada nos 14 planos, com checkpoints históricos e limites de ambiente discriminados.

## Infraestrutura e comandos

| Propriedade | Valor |
|---|---|
| Framework | node:test e gates Playwright existentes no repositório |
| Testes | `pnpm test` — glob `src/**/*.test.mjs` |
| Build | `pnpm build` — inclui finalização dos headers |
| UI local | `node scripts/verify/form-gates.mjs` — API mockada |
| Altura e canal visível | `node scripts/verify/form-card-height.mjs` |
| Segurança | `bash scripts/security-check.sh --ci` |
| Peso de JS | `bash scripts/js-weight-check.sh .vercel/output/static` |
| Ambiente Windows | Bash via `C:/Program Files/Git/bin/bash.exe`; não está no PATH do PowerShell |

Build novo deve preceder gates que leem `.vercel/output`. Em PowerShell, executar cada comando separadamente; em Bash, `&&` pode compor a sequência. O comando histórico completo permanece em 05-10-SUMMARY.

## Mapa de verificação por requisito

| Requisito | Comportamento | Cobertura / arquivo existente | Estado |
|---|---|---|---|
| FORM-01 | Seletor de canal e contato obrigatório escolhido | form-schema.server.test.mjs; form-gates canalPadrao/canalTrocaJs/canalTrocaSemJs/canalEnviaSoEscolhido; form-card-height | GREEN |
| FORM-02 | POST nativo e 303 | submit.test.mjs; form-gates semJsPostNativo | GREEN, resposta mockada no navegador |
| FORM-03 | Estados, preservação e bloqueio em trânsito | form-gates sucesso/falha/limite/erro400 | GREEN |
| FORM-04 | Schema Zod, enum, limites e descarte do outro canal | form-schema.test.mjs; form-schema.server.test.mjs | GREEN |
| FORM-05 | Blur/submit, sem validação por tecla ou bloqueio por erro local | form-gates validacaoInline: POST inválido, 400, digitação sem limpar erro, blur e reenvio | GREEN: falhou antes da correção e passou depois do build novo |
| FORM-06 | Erros associados, foco e anúncios | form-gates validacaoInline/erro400/sucesso/falha/limite | GREEN no comportamento atual |
| FORM-07 | Honeypot e timing de 3 s–24 h antes de envio | submit.test.mjs; D-27 para campo ausente | GREEN |
| FORM-08 | Limites IP/hora/dia e fail-closed | rate-limit.test.mjs; submit.test.mjs; deps.ts | GREEN em testes com dependências injetadas; provisionamento histórico 05-11 |
| FORM-09 | Template server-only, escape e texto alternativo | mail.test.mjs; submit.test.mjs; D-06/D-28 | GREEN |
| FORM-10 | Tipo/Origin/corpo, redirects fixos e falhas genéricas | request-guards.test.mjs; submit.test.mjs | GREEN |
| FORM-11 | WAF api-flood ativo e bloqueio na borda | 05-13-SUMMARY; phase-05.md | HISTORICAL: leitura de config e rajada em 2026-10-16, 403 Deny aprovado |
| FORM-12 | WhatsApp alternativo em falha/limite | form-gates falha/limite/paginasErro | GREEN |
| FORM-13 | URLs codificadas e rel em todos os pontos aprovados | whatsapp.test.mjs; form-gates deepLinks; D-26 | GREEN |
| LGPD-01/02 | Política e aviso detalhado | D-29 revisada em 05-12/PROJECT; gate privacidadeNoForm | EXCLUDED; não há tarefa de restaurar política |
| LGPD-03 | Frase curta sem link/checkbox | form-gates privacidadeNoForm/avisoLgpd | GREEN |
| LGPD-04 | Sem logs da aplicação ou persistência de IP bruto | rate-limit.test.mjs; security-check 8; inspeção de submit/deps | GREEN no código; logs externos históricos 05-12 |
| LGPD-05 | Sem evento de analytics ao interagir | form-gates redeSemAnalytics; inspeção de form.ts | GREEN |
| LGPD-06 | Sem cookies/identificador persistente | 05-12-SUMMARY, aprovação e gates live em 2026-10-16 | HISTORICAL; nova checagem externa não executada |
| LGPD-07 | Base legal interna e retenção de 6 meses | PROJECT Key Decision D-15/D-16; docs/operacao-formulario.md | GREEN; publicação excluída por D-29 |
| SEC-08 | Risco residual e runbook | ROADMAP e docs/waf-rate-limit.md; 05-14-SUMMARY | GREEN documental |
| SEC-09 | DNS de envio e mail-tester >=8 | 05-11-SUMMARY; phase-05.md | HISTORICAL: 10/10 em 2026-10-15; DNS não alterado/reconsultado |
| SEC-07 | Ritual sem High aberto | phase-05.md; security-check atual | GREEN com skips explícitos de preview/Lighthouse |
| PERF | Budget JS e Lighthouse | js-weight-check atual; runs históricos em 07-VERIFICATION | GREEN no budget local; Lighthouse histórico, sem nova nota |

## Rastreabilidade dos 14 planos

| Plano | Cobertura |
|---|---|
| 05-01 | Constantes, normalização, escape e WhatsApp; testes puros |
| 05-02 | Dependências pinadas, glob de teste e segredos server-only em Astro |
| 05-03 | Base/retenção internas verificadas; página e revisão publicada substituídas por D-29 |
| 05-04 | Zod e mail com testes; concordância cliente/servidor mantida |
| 05-05 | Guardas, HMAC e três camadas de limites; testes com fakes |
| 05-06 | Destinos estáticos e deep-links; gates de páginas |
| 05-07 | Markup, canal, enhancer e altura; conflito FORM-05 corrigido conforme REQUIREMENTS |
| 05-08 | Runbooks, retenção e declaração SEC-08 |
| 05-09 | Handler e dependências; testes e exatamente uma Function no build |
| 05-10 | Gates de formulário/altura e ligação em ci.yml |
| 05-11 | Provisionamento, DNS e mail-tester históricos com checkpoint cumprido |
| 05-12 | Sondas, inspeção de logs, cookies e teste real aprovados por Felipe em 2026-10-16; revisão D-29 vigente |
| 05-13 | Config ativa e prova WAF históricas; exceção 403 Deny |
| 05-14 | SEC-07, aceite de riscos, merge e produção históricos |

## Onda 0

- [x] Módulos e testes de form-schema, form-schema.server, submit, mail, request-guards, rate-limit e WhatsApp existem.
- [x] form-gates.mjs, form-card-height.mjs e static-server.mjs existem e estão ligados ao CI.
- [x] Glob recursivo de testes e quatro dependências previstas existem.
- [x] Gate de segurança verifica uma Function, segredos e ausência de console no servidor.
- [x] Não há necessidade de criar testes que somente espelhem a implementação nesta tarefa documental.

## Limites e fechamento da regressão

O gate validacaoInline agora exige POST mesmo com valores inválidos, 400 vindo do servidor, manutenção de aria-invalid enquanto digita, limpeza no blur e reenvio válido. O comportamento anterior falhou por POST ausente e revalidação por input nos dois campos testados (nome e WhatsApp). Não foi criada uma suíte paralela: a verificação existente foi corrigida para exigir o requisito.

Nenhum teste desta tarefa enviou leads ou e-mails reais. Disponibilidade e TTL efetivo do Redis, configuração WAF e DNS não foram reatestados. Os checkpoints históricos continuam como evidência identificada por data, não como testes atuais.

A meta histórica de feedback completo em menos de 120 s não foi certificada: o build local atual levou cerca de três minutos. Não foram usados comandos em watch mode.

**Fechamento:** cobertura completa no escopo dos planos; FORM-05 corrigido. Estado detalhado e resultados em 05-VERIFICATION.md. Nenhuma nova aprovação humana foi presumida. Conformidade Nyquist descreve cobertura de verificação, não reatesta estado externo nem elimina riscos aceitos.

## Resultados locais em 2026-10-21

Após correção: check com zero erros/warnings e um hint (76 arquivos). Testes: 160 PASS. Biome dos dois arquivos alterados: PASS. Build: exit 0. Formulário: 16 PASS. Altura: 6 PASS. Segurança: 11 PASS e dois SKIP de preview/Lighthouse. JS: 9.146 bytes gzip. Gates de artefatos executados somente após build/finalização de headers. Skips e API mockada explicitados no relatório. A meta de latência <120 s é desvio local registrado, sem alterar a cobertura funcional dos planos.
