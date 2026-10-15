---
phase: 05
slug: form-backend-enhancement-lgpd
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-15
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node --test` (nativo, Node 24) + Playwright 1.64.1 para gates de navegador |
| **Config file** | nenhum — script `test` em `package.json` (glob `src/**/*.test.mjs`) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm check && pnpm test && pnpm build && node scripts/verify/form-gates.mjs && bash scripts/security-check.sh --ci` |
| **Estimated runtime** | ~5 s (quick) / ~120 s (full) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green + SEC-07 sem High + 1 envio real ponta a ponta em preview
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists | Status |
|--------|----------|-----------|-------------------|-------------|--------|
| FORM-04 | nome 2–80, contato obrigatório, enum, msg ≤1000 | unit | `node --test src/lib/form-schema.test.mjs` | ❌ W0 | ⬜ pending |
| FORM-05 | cliente e servidor concordam (mesma tabela de casos) | unit | `node --test src/lib/form-schema.test.mjs` | ❌ W0 | ⬜ pending |
| FORM-07 | honeypot e elapsed-ms fora de 3 s/24 h → sucesso falso, 0 envios; ausente tolerado (D-27) | unit | `node --test src/lib/submit.test.mjs` | ❌ W0 | ⬜ pending |
| FORM-08 | ordem ip→hora→dia, fail-closed, `reason:'timeout'` | unit (fakes) | `node --test src/lib/submit.test.mjs` | ❌ W0 | ⬜ pending |
| FORM-09 | escape HTML, CR/LF no assunto, `text` presente, replyTo condicional | unit | `node --test src/lib/mail.test.mjs` | ❌ W0 | ⬜ pending |
| FORM-10 | 415, 403, 413, erro genérico, `Location` só de tabela | unit | `node --test src/lib/request-guards.test.mjs` | ❌ W0 | ⬜ pending |
| FORM-02 | POST nativo → `/obrigado` (JS desligado) | e2e mock | `node scripts/verify/form-gates.mjs` | ❌ W0 | ⬜ pending |
| FORM-03/06/12 | estados, aria, foco, submit desabilitado, alerta WhatsApp | e2e (`page.route`) | `node scripts/verify/form-gates.mjs` | ❌ W0 | ⬜ pending |
| FORM-13 | todo `wa.me` com `text=` codificado e `rel` | e2e/grep build | `node scripts/verify/form-gates.mjs` | ❌ W0 | ⬜ pending |
| FORM-11 | regra WAF existe | manual | — | n/a | ⬜ pending |
| LGPD-01/02/03 | política com as seções exigidas, aviso ao lado do submit | e2e/grep HTML | `node scripts/verify/form-gates.mjs` | ❌ W0 | ⬜ pending |
| LGPD-04 | sem `console.*`, sem IP cru em chaves | grep + unit | `bash scripts/security-check.sh --ci` | ❌ W0 | ⬜ pending |
| LGPD-05/06 | zero cookies/storage; sem request de terceiros | e2e preview | `PREVIEW_URL=... node scripts/verify/form-gates.mjs --live` | ❌ W0 | ⬜ pending |
| LGPD-07 | Key Decision em `PROJECT.md` | grep | `grep -n "6 meses" .planning/PROJECT.md` | ❌ W0 | ⬜ pending |
| SEC-08 | declaração de risco residual no ROADMAP | grep | `grep -n "SEC-08" .planning/ROADMAP.md` | ✅ | ⬜ pending |
| SEC-09 | SPF/DKIM/DMARC + mail-tester ≥ 8 | manual | `dig TXT _dmarc.agenciadmarques.com.br` | n/a | ⬜ pending |
| PERF | Lighthouse mobile ≥ 95, JS < 20 KB | CI | `bash scripts/js-weight-check.sh` + `lhci` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/form-schema.test.mjs`, `submit.test.mjs`, `mail.test.mjs`, `request-guards.test.mjs`, `rate-limit.test.mjs`
- [ ] `scripts/verify/form-gates.mjs` (reaproveita `static-server.mjs`)
- [ ] Ajustar glob do script `test` em `package.json`
- [ ] Novos itens em `scripts/security-check.sh`: Functions `== 1`; grep de `console\.` em `src/pages/api` e `src/lib`; varredura de `UPSTASH|KV_REST|RATE_LIMIT_SALT` no build estático
- [ ] Instalação de `resend`, `zod`, `@upstash/ratelimit`, `@upstash/redis`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Regra WAF de rate limit em `/api/*` | FORM-11 | Configuração no painel Vercel | Criar regra (Log → ação), registrar em `runs/phase-05.md` |
| SPF/DKIM/DMARC + mail-tester ≥ 8 | SEC-09 | DNS externo (GoDaddy) + serviço externo | Verificar domínio no Resend, enviar teste ao mail-tester, capturar nota |
| Envio real ponta a ponta em preview | FORM-01 | Depende de secrets reais e inbox | Enviar pelo preview com e sem JS e confirmar e-mail recebido |
| Analytics zero cookies em DevTools | LGPD-05 | Verificação em navegador no deploy real | Abrir preview, Application → Cookies/Storage vazios |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
