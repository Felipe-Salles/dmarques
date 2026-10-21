---
phase: 07-security-headers-finalize
fixed_at: 2026-10-21T00:00:00Z
review_path: .planning/phases/07-security-headers-finalize/07-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 4
skipped: 1
status: partial
---

# Fase 07: Relatório de Correções do Code Review

**Corrigido em:** 2026-10-21
**Revisão de origem:** .planning/phases/07-security-headers-finalize/07-REVIEW.md
**Iteração:** 1

**Resumo:**
- Achados no escopo: 5
- Corrigidos: 4
- Ignorados: 1

## Issues Corrigidas

### WR-01: Gate `artefatos` passa sem build

**Arquivos modificados:** `scripts/verify/header-gates.mjs`
**Commit:** 1b8e4c1
**Correção aplicada:** `artefatos` agora retorna `build ausente` quando `STATIC_DIR` não existe.

### WR-02: Skip por WAF faz os gates de header passarem sem avaliar nada

**Arquivos modificados:** `scripts/verify/header-gates.mjs`
**Commit:** 1b8e4c1
**Correção aplicada:** `perPath` falha quando não há resultados ou quando todos foram marcados como `skip`. Corrigido no mesmo commit do WR-01 por tocar o mesmo arquivo.

### WR-03: Arquivos da fase violam o Biome e o CI não roda lint

**Arquivos modificados:** `scripts/verify/browser-gates.mjs`, `scripts/verify/form-gates.mjs`, `scripts/verify/static-server.mjs`, `scripts/verify/header-gates.mjs`, `.github/workflows/ci.yml`
**Commit:** ba45233 (a parte do `useOptionalChain` em `header-gates.mjs` entrou no commit 1b8e4c1)
**Correção aplicada:** `biome check --write` nos arquivos da fase (imports ordenados, linhas longas). Foi adicionado ao job `verify` um passo `biome check` escopado aos arquivos da fase, e não `pnpm lint`. O lint do repositório inteiro falha por violações preexistentes fora da fase (`scripts/capture-site.mjs`, `scripts/generate-og.mjs`, `scripts/verify/aurora-gates.mjs`, `scripts/verify/form-card-height.mjs`, `src/lib/request-guards.test.mjs`, `src/styles/base.css`, CSS de sketches). **Requer atenção humana:** o passo escopado cobre uma lista fixa de arquivos, então arquivos novos precisam ser adicionados a ela.

### WR-04: Actions por tag mutável e segredo enviado a URL vinda do payload do evento

**Arquivos modificados:** `.github/workflows/ci.yml`, `.github/workflows/headers.yml`
**Commit:** 6d9293a
**Correção aplicada:** `actions/checkout`, `pnpm/action-setup`, `actions/setup-node` e `dependency-review-action` fixadas em SHA de commit. Foi criado o passo `Validate deployment host` (id `target`), que exige `https://*.vercel.app` e caracteres válidos no host antes de qualquer uso do segredo de bypass. O passo `Header gates` (que roda com `!cancelled()`) só executa se esse passo teve sucesso. Não foi possível determinar o prefixo do projeto, então a validação cobre apenas o sufixo `.vercel.app`. `lighthouse.yml` não estava no escopo do review e continua com tags (`actions/checkout@v7`, `treosh/lighthouse-ci-action@v12`).

## Issues Ignoradas

### WR-05: HSTS com `includeSubDomains; preload` por 2 anos

**Arquivo:** `vercel.json:8`
**Motivo:** o Felipe decidiu nesta fase manter o header como entregue e adiar a submissão ao preload (registrado como P07-003 em `.planning/security/runs/phase-07.md`). `vercel.json` não foi alterado.
**Issue original:** `includeSubDomains; preload` por 2 anos obriga HTTPS em todos os subdomínios e é praticamente irreversível após a submissão.

## Verificação

- `pnpm build`: ok
- `pnpm test`: 160/160 passam
- `node scripts/verify/header-gates.mjs`: 6 PASS / 0 FAIL
- Branch `docs/phase-07-close` enviada com `git push`.

---

_Corrigido em: 2026-10-21_
_Corretor: Claude (gsd-code-fixer)_
_Iteração: 1_
