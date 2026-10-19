---
phase: 07-security-headers-finalize
reviewed: 2026-10-19T00:00:00Z
depth: standard
files_reviewed: 25
files_reviewed_list:
  - .github/workflows/ci.yml
  - .github/workflows/headers.yml
  - astro.config.mjs
  - package.json
  - vercel.json
  - scripts/finalize-headers.mjs
  - scripts/security-check.sh
  - scripts/verify/browser-gates.mjs
  - scripts/verify/csp-recorder.mjs
  - scripts/verify/form-gates.mjs
  - scripts/verify/header-gates.mjs
  - scripts/verify/headers.mjs
  - scripts/verify/seo-gates.mjs
  - scripts/verify/static-server.mjs
  - src/layouts/BaseLayout.astro
  - src/lib/finalize-headers.pure.mjs
  - src/lib/finalize-headers.test.mjs
  - src/lib/header-rules.test.mjs
  - src/lib/js-ready.test.mjs
  - src/lib/js-ready.ts
  - src/lib/submit.test.mjs
  - src/lib/submit.ts
  - src/pages/500.astro
  - src/pages/api/orcamento.ts
  - docs/seguranca-headers.md
findings:
  critical: 0
  warning: 5
  info: 5
  total: 10
status: issues_found
---

# Fase 07: Relatório de Code Review

**Revisado em:** 2026-10-19
**Profundidade:** standard
**Arquivos revisados:** 25
**Status:** issues_found

## Resumo

A fase implementa CSP baseada em hash (Astro `security.csp` com `staticHeaders`), o pós-build `finalize-headers` (troca das rotas CSP por página por uma rota global, com modo `enforce` ou `report-only`), headers estáticos no `vercel.json`, a página 500 e os gates de verificação (`header-gates`, `form-gates`, `browser-gates`, `security-check.sh`) com workflows de CI.

A lógica central é sólida. `finalize-headers.pure.mjs` falha de forma explícita quando a CSP diverge entre páginas ou quando falta `handle: filesystem`. O hash do `JS_READY` é compartilhado entre `astro.config.mjs`, `BaseLayout.astro` e os gates, então não pode divergir. O `orcamento.ts` agora devolve `failureResponse` em vez de vazar uma exceção. O gate de envio ao vivo preenche o honeypot, então não dispara e-mail real. A suíte de testes passa (160/160).

Não encontrei vulnerabilidades nem bugs de runtime que bloqueiem. Os problemas são de robustez dos gates, que podem passar sem ter verificado nada, e de supply chain no CI. Nenhum comentário foi adicionado ao código: o único acerto do grep foi o padrão `*)` de um `case` em shell. A regra de zero comentários foi respeitada.

## Warnings

### WR-01: Gate `artefatos` passa sem build

**Arquivo:** `scripts/verify/header-gates.mjs:149-166` (e 205-206)
**Problema:** Quando o build está ausente, `collect` lança `build ausente` e todos os checks falham, exceto `artefatos`, que é excluído de propósito (`name !== 'artefatos'`). `walk()` devolve `[]` para um diretório inexistente, então `artefatos` imprime `PASS` sem ter inspecionado nada. Um `STATIC_DIR` errado ou um build vazio dá falso positivo para "sem sourcemap" e "sem meta CSP".
**Correção:**
```js
artefatos: async () => {
  if (live) return [];
  if (!existsSync(STATIC_DIR)) return ['build ausente'];
  ...
```

### WR-02: Skip por WAF faz os gates de header passarem sem avaliar nada

**Arquivo:** `scripts/verify/header-gates.mjs:77-81, 102-109`
**Problema:** Se uma resposta tem `x-vercel-mitigated`, o path é marcado `skip` e `perPath` o ignora. Se o WAF ou o Attack Challenge bloquear todas as requisições do runner, incluindo `/`, `naoCsp` e `csp` retornam `PASS` sem nenhum header avaliado. O check `status` só ignora `/api/orcamento`, então ele pegaria `/` parcialmente. Mas o gate de headers é o núcleo da fase e não deveria passar vazio.
**Correção:** Falhar quando nenhum resultado foi avaliado, ou quando o próprio `/` estiver mitigado:
```js
if (results.every((r) => r.skip)) return ['todas as respostas bloqueadas pelo WAF'];
```

### WR-03: Arquivos da fase violam o Biome e o CI não roda lint

**Arquivo:** `scripts/verify/browser-gates.mjs:4`, `scripts/verify/header-gates.mjs:142`, `.github/workflows/ci.yml`
**Problema:** `biome check` reporta `organizeImports` em `browser-gates.mjs` (o import de `csp-recorder.mjs` foi adicionado nesta fase) e `useOptionalChain` em `header-gates.mjs:142` (`!csp || !csp.includes(hash)`). O `ci.yml` não executa `pnpm lint` (nem `format`), então o gate de qualidade não existe e as violações entram sem aviso. Linhas longas em `form-gates.mjs` (474, 483) e `static-server.mjs` (56) também fogem do padrão do formatador.
**Correção:** Rodar `biome check --write` nos arquivos da fase e adicionar `- run: pnpm lint` ao job `verify`.

### WR-04: Actions por tag mutável e segredo enviado a URL vinda do payload do evento

**Arquivo:** `.github/workflows/headers.yml:12-18, 32`, `.github/workflows/ci.yml:14-16, 39-40`
**Problema:** Numa fase de hardening, todas as actions (`actions/checkout@v7`, `pnpm/action-setup@v6`, `actions/setup-node@v7`, `dependency-review-action@v5.0.0`) usam tags mutáveis em vez de SHA de commit. Além disso, `VERCEL_AUTOMATION_BYPASS_SECRET` é enviado via `curl -H` para `github.event.deployment_status.target_url` sem validar o host. Um `deployment_status` criado por quem tem permissão de escrita pode apontar a URL para um host qualquer e exfiltrar o segredo. Passar o valor por `env` evita injeção de shell, mas não valida o destino.
**Correção:** Fixar as actions por SHA e validar o host antes de usar o segredo:
```bash
case "$TARGET" in https://*.vercel.app) ;; *) echo "host inesperado"; exit 1 ;; esac
```

### WR-05: HSTS com `includeSubDomains; preload` por 2 anos em domínio com outros serviços

**Arquivo:** `vercel.json:8`
**Problema:** `max-age=63072000; includeSubDomains; preload` obriga HTTPS em todos os subdomínios. O domínio tem DNS na GoDaddy com e-mail e Resend (ver memória do projeto), e qualquer subdomínio futuro só servido por HTTP ficará inacessível nos navegadores que já viram o header. Com `preload` a decisão passa a ser praticamente irreversível se o domínio for submetido à lista. O `security-check.sh` e o `checkNonCspHeaders` exigem `preload`, o que consolida a escolha.
**Correção:** Confirmar que não há subdomínio HTTP-only. Se houver dúvida, subir primeiro com `max-age` menor e sem `preload`, e promover depois. Se a escolha for deliberada, registrá-la em `docs/seguranca-headers.md`.

## Info

### IN-01: Lógica de rota CSP duplicada e chamada redundante em `finalize-headers.mjs`

**Arquivo:** `scripts/finalize-headers.mjs:19-22`
**Problema:** `Object.keys(r.headers ?? {}).join() === 'content-security-policy'` reimplementa `isCspRoute`, que não é exportada. A chamada isolada a `collectCsp(config.routes)` é redundante, porque `reshapeRoutes` já a executa.
**Correção:** Exportar `isCspRoute` (ou uma função `countCspRoutes`) e remover a chamada redundante.

### IN-02: Verificação 13 pode não emitir resultado

**Arquivo:** `scripts/security-check.sh:216-237`
**Problema:** Se nenhuma das páginas for encontrada, `v13_checked` fica em 0 e não há PASS nem FAIL (só SKIPs parciais). O resumo fica com contagem inconsistente, e o caso "build vazio" passa despercebido.
**Correção:** Adicionar `else skip "verificacao 13 - nenhuma pagina de erro encontrada"`.

### IN-03: Regex de segredo sem fronteira e `curl` sem timeout

**Arquivo:** `scripts/security-check.sh:85, 104-106`
**Problema:** `re_[A-Za-z0-9_-]{20,}` casa dentro de qualquer identificador, como `pre_algo_muito_longo...`, e pode gerar falso positivo em JS minificado. Os `curl -sI` não têm `--max-time` nem `--fail`, então um preview travado prende o job até o timeout do runner.
**Correção:** Usar `(^|[^A-Za-z0-9_])re_[A-Za-z0-9]{20,}` e `curl --max-time 15 -sI`.

### IN-04: `pnpm audit` executado duas vezes no CI e dependência implícita do script de build na Vercel

**Arquivo:** `.github/workflows/ci.yml:32, 34`; `vercel.json`
**Problema:** `pnpm audit --audit-level=high` roda no passo 32 e de novo na verificação 1 do `security-check.sh --ci`. Separadamente, `finalize-headers` só é executado se a Vercel usar o script `build` do `package.json`. Nenhum `buildCommand` está declarado, então uma mudança no projeto da Vercel desligaria a CSP sem erro de build. Nesse caso o gate ao vivo pegaria depois do deploy, não antes.
**Correção:** Remover o passo duplicado. Declarar `"buildCommand": "pnpm build"` no `vercel.json`.

### IN-05: `locate` do servidor estático pode sair da raiz via `${target}.html`

**Arquivo:** `scripts/verify/static-server.mjs:38`
**Problema:** Quando `target === root`, o candidato `${target}.html` aponta para `<root>.html`, fora do diretório servido. Só é alcançado se `index.html` não existir, por isso é inofensivo em um servidor de verificação local. Vale corrigir por higiene.
**Correção:** Gerar o candidato `.html` apenas quando `target !== root`.

---

_Revisado em: 2026-10-19_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidade: standard_
