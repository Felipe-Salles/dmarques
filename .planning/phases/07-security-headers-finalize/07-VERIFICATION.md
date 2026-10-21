---
phase: 07-security-headers-finalize
verified: 2026-10-19T23:30:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
re_verification: false
---

# Fase 7: Security Headers Finalize — Relatório de Verificação

**Objetivo da fase:** Travar a Content-Security-Policy e o conjunto completo de cabeçalhos de segurança quando todas as origens de script/style/img/connect do site final são conhecidas.
**Verificado em:** 2026-10-19
**Status:** passed
**Reverificação:** Não, verificação inicial

## Alcance do objetivo

### Verdades observáveis (critérios de sucesso do ROADMAP)

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | `vercel.json` aplica HSTS com preload, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options DENY, COOP/CORP em todas as respostas, inclusive a API | VERIFICADO | `vercel.json` tem uma regra `source: /(.*)` com os 7 cabeçalhos. `curl -sI` na produção em `/`, `/nao-existe` (404), `/og-image.jpg` e `/api/orcamento` (405) devolve os 7 cabeçalhos mais CSP em todos. HSTS na apex: `max-age=63072000; includeSubDomains; preload`. |
| 2 | CSP por cabeçalho (não `<meta>`), `default-src 'self'`, `script-src`/`style-src` `'self'` sem unsafe-*, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests` | VERIFICADO | Produção serve `Content-Security-Policy` enforcing com todas as diretivas, 7 hashes em `script-src`, 4 em `style-src`, sem `unsafe-inline`/`unsafe-eval`. `DEFAULT_CSP_MODE = 'enforce'` em `src/lib/finalize-headers.pure.mjs`. `build` encadeia `scripts/finalize-headers.mjs`. A decisão de usar `'self'` mais hashes do Astro está documentada em `docs/seguranca-headers.md`. |
| 3 | CSP saiu primeiro como Report-Only no preview, sem violações no load e no submit, e só então foi promovida | VERIFICADO | Trilha registrada: run 39260825312 (Report-Only, `REPORT_ONLY_CLEAN: yes`), promoção em commit separado `8ae55f2`, run 39261830281 verde com `cspCarga` e `cspEnvio`. Confirmada nos SUMMARYs 07-04 e 07-05 e em `.planning/security/runs/phase-07.md`. Não reexecutei o preview; confio nos runs do GitHub e no estado final observado em produção. |
| 4 | Sourcemaps desligados, 404/500 sem diagnóstico, zero terceiros com regra de SRI documentada, sem View Transitions (decisão registrada), securityheaders.com >= A com regressão por `curl -I` no CI | VERIFICADO | `astro.config.mjs` tem `sourcemap: false`. Existem `src/pages/500.astro` e `404.astro`. `docs/seguranca-headers.md` tem a seção "Regra de SRI para assets externos futuros". `PROJECT.md` linhas 160-161 registram SEC-10 e a CSP por hash. `ci.yml` roda `header-gates.mjs` offline e `headers.yml` roda `--live` em deployments. Verificações 9 a 13 do `security-check.sh` passam. securityheaders.com A+ foi informada por Felipe (não verificável por mim). |
| 5 | Checklist SEC-07 final sem High aberto e Lighthouse mobile >= 95 nas quatro categorias | VERIFICADO | `.planning/security/runs/phase-07.md` tem a saída verbatim, tabela de achados sem High aberto e P06-003 fechado. `gh run view` confirma `success` para `lhci-production` (39268752412) e `headers-production` (39268752469), ambos no SHA `98a0dbf`. |

**Pontuação:** 5/5 verdades verificadas

### Sobre P07-001 (Lighthouse e form-gates --live reprovam só nesta máquina)

Aceitável, não é lacuna. As evidências do próprio log mostram a causa: o script `gc.kis.v2.scr.kaspersky-labs.com/.../main.js` (163 KB) responde por quase todos os 174,5 KB de script medidos. Sem ele a soma fica em cerca de 11,5 KB, abaixo do limite de 20 KB, e o resultado é coerente com os 6 KB medidos na Fase 6. O gate de produção roda em runner limpo e passou, com asserções em nível `error` (4 categorias >= 0,95, LCP, CLS, TBT e tamanho de script). O registro é honesto: a fase não afirma aprovação local. Ressalva: o job não imprime as notas individuais (P06-002, já aberto como Low).

### Artefatos

| Artefato | Esperado | Status |
|----------|----------|--------|
| `vercel.json` | Conjunto de cabeçalhos globais | VERIFICADO |
| `scripts/verify/header-gates.mjs` | Gate offline e `--live` | VERIFICADO, usado em `ci.yml` e `headers.yml` |
| `scripts/finalize-headers.mjs` e `src/lib/finalize-headers.pure.mjs` | Rota global de CSP e modo | VERIFICADO, ligado ao script `build` |
| `.github/workflows/headers.yml` | Gate de regressão em deployments | VERIFICADO, run de produção verde |
| `src/pages/500.astro` | Página 500 genérica | VERIFICADO |
| `docs/seguranca-headers.md` | Documentação pt-BR da política | VERIFICADO |
| `.planning/security/runs/phase-07.md` | Execução SEC-07 final | VERIFICADO |

### Cobertura de requisitos

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| SEC-01 | SATISFEITO | Cabeçalhos em `vercel.json`, vistos na produção em 4 caminhos |
| SEC-02 | SATISFEITO | CSP enforcing por cabeçalho, sem unsafe-* |
| SEC-03 | SATISFEITO | Trilha Report-Only para enforce nos runs 39260825312 e 39261830281 |
| SEC-04 | SATISFEITO | `sourcemap: false`, página 500, verificações 9 e 13 |
| SEC-05 | SATISFEITO | Verificação 11 (sem origem externa), regra de SRI documentada |
| SEC-06 | SATISFEITO | `curl -I` no CI e A+ informada por Felipe |
| SEC-10 | SATISFEITO | Verificação 10 e decisão em `PROJECT.md` |
| SEC-07 (transversal) | SATISFEITO | Execução da fase 7 sem High aberto |
| PERF-01 (transversal) | SATISFEITO | `lhci-production` verde |

Todos os IDs declarados nos PLANs (SEC-01 a SEC-07, SEC-10, PERF-01) existem em `REQUIREMENTS.md`, marcados `[x]`. Nenhum requisito órfão: o mapeamento da Fase 7 em `REQUIREMENTS.md` são exatamente SEC-01 a SEC-06 e SEC-10.

### Anti-padrões

Nenhum `TBD`, `FIXME` ou `XXX` nos arquivos principais da fase. Os 5 avisos de `07-REVIEW.md` (0 críticos) são consultivos e não bloqueiam o objetivo:

| Aviso | Gravidade | Impacto |
|-------|-----------|---------|
| WR-01 `artefatos` passa sem build | Aviso | Falso positivo possível só se `STATIC_DIR` estiver errado; no CI o build roda antes |
| WR-02 gate passa se o WAF bloquear tudo | Aviso | Risco de gate vazio; a checagem `status` ainda cobre `/` |
| WR-03 Biome não roda no CI | Aviso | Qualidade, não segurança |
| WR-04 actions por tag e segredo enviado a `target_url` sem validar host | Aviso | Endurecimento recomendado para a próxima fase de observabilidade |
| WR-05 HSTS `includeSubDomains; preload` | Aviso | Risco aceito por Felipe (P07-003, preload adiado) |

### Itens aceitos pelo dono e registrados

- Nota A+ do securityheaders.com e prévias sociais foram atestadas por Felipe, não por mim. Isso é uma checagem manual já concluída, não um item pendente.
- Preload do HSTS adiado por decisão de Felipe (P07-003, Low, Aceito). A apex já serve a diretiva `preload`, mas a submissão não foi feita.
- Abertos e não bloqueantes: P07-001 (Low), P06-002 (Low), P05-008 (Med), P05-003 (Med, Aceito). Nenhum High.

### Observação de estado

O PR #10 (docs de encerramento) está `OPEN`. A branch `main` local está desatualizada em relação ao remoto (`1d095aa`), mas a produção está no merge `98a0dbf`, confirmado pelo `headSha` dos runs.

## Resumo

O objetivo foi atingido. A produção serve o conjunto completo de cabeçalhos e uma CSP enforcing por hash em todos os caminhos testados, incluindo 404 e a API. A trilha Report-Only para enforce está documentada com runs verdes, e os gates de regressão estão ligados ao CI. A reprovação local do Lighthouse é explicada por injeção do antivírus e coberta pelo CI de produção, portanto não é lacuna.

---

_Verificado: 2026-10-19_
_Verificador: Claude (gsd-verifier)_
