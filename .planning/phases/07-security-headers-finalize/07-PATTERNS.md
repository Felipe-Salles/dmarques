# Phase 7: Security Headers Finalize - Pattern Map

**Mapped:** 2026-10-19
**Files analyzed:** 20 (new and modified)
**Analogs found:** 19 / 20

Project rule that applies to every excerpt below: zero comments in versioned files (JS, MJS, JSON, YAML, Astro, sh). User-facing strings and docs in pt-BR. Script output follows the repo style (no accents in console strings, `PASS`/`FAIL` prefixes).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/js-ready.ts` | utility (constant) | transform | `src/lib/business.ts` (exported constants) | role-match |
| `src/lib/js-ready.test.mjs` | test | transform | `src/lib/seo.test.mjs` | exact |
| `src/layouts/BaseLayout.astro` (edit) | component (layout) | request-response | itself, lines 56-62 and 63 (`set:html`) | exact |
| `astro.config.mjs` (edit) | config | build | itself (66 lines) | exact |
| `vercel.json` (edit, currently `{}`) | config | request-response | none in repo (use RESEARCH Pattern 4) | no analog |
| `package.json` (edit `build` script) | config | batch | itself, `scripts` block | exact |
| `scripts/finalize-headers.mjs` | utility (post-build) | batch / file-I/O | `scripts/verify/static-server.mjs` (fs + `STATIC_DIR` resolution) and `scripts/generate-og.mjs` | role-match |
| `src/lib/finalize-headers.pure.mjs` (+ `finalize-headers.test.mjs`) | utility + test | transform | `src/lib/request-guards.ts` + `request-guards.test.mjs` | role-match |
| `scripts/verify/headers.mjs` | utility (rule loader) | transform / file-I/O | `scripts/verify/static-server.mjs` (exports `resolveStaticDir`) | role-match |
| `scripts/verify/header-gates.mjs` | test (gate) | request-response | `scripts/verify/form-gates.mjs` (local + `--live`) and `seo-gates.mjs` (checks map) | exact |
| `scripts/verify/static-server.mjs` (edit) | utility (test server) | request-response | itself, line 138 `res.writeHead` | exact |
| `scripts/verify/browser-gates.mjs` (edit) | test (gate) | event-driven | itself, `withPage` + `checks` map | exact |
| `scripts/verify/form-gates.mjs` (edit) | test (gate) | request-response | itself, `newContext`, `liveContext` | exact |
| `scripts/security-check.sh` (edit) | test (gate) | batch | itself (verifs 3, 6, 8) | exact |
| `src/pages/500.astro` | component (page) | request-response | `src/pages/404.astro` | exact |
| `src/pages/api/orcamento.ts` (edit) | controller | request-response | itself, lines 7-15 | exact |
| `.github/workflows/headers.yml` | config (CI) | event-driven | `.github/workflows/lighthouse.yml` | exact |
| `.github/workflows/ci.yml` (edit) | config (CI) | batch | itself | exact |
| `docs/seguranca-headers.md` | docs | n/a | `docs/waf-rate-limit.md`, `docs/operacao-formulario.md` | role-match |
| `.planning/security/runs/phase-07.md` | docs | n/a | `.planning/security/runs/phase-06.md` | exact |

## Pattern Assignments

### `src/lib/js-ready.ts` (utility, transform)

**Analog:** `src/lib/business.ts` (plain exported constants, `.ts` imported with explicit `.ts` extension everywhere, e.g. `from './business.ts'`).

Replace the body currently at `src/layouts/BaseLayout.astro` lines 56-62 with a single-line string constant (RESEARCH Pattern 1):
```ts
export const JS_READY =
  "var d=document.documentElement;d.classList.add('js-ready');setTimeout(function(){if(!d.classList.contains('fx'))d.classList.remove('js-ready')},3000);";
```
Note: Biome/Prettier must not reflow it; keep as a string literal. Biome formatting uses single quotes by default in this repo, so Biome may rewrite the outer quotes. The hash is derived from the constant at runtime, so this is safe.

### `src/lib/js-ready.test.mjs` (test, transform)

**Analog:** `src/lib/seo.test.mjs` (lines 1-18, 20-28). Test glob is `src/**/*.test.mjs`, so tests live next to the module and import `.ts` directly (Node strips types).
```js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JS_READY } from './js-ready.ts';

test('descricao em portugues sem acentos no nome do teste', () => {
  assert.equal(typeof JS_READY, 'string');
});
```
Tests to write: hash of `JS_READY` is stable (sha256 base64 pinned); when `.vercel/output/static/index.html` exists, it contains `JS_READY` byte-for-byte and the CSP value contains the hash (skip when no build, follow how other tests handle absent build).

### `src/layouts/BaseLayout.astro` (edit)

**Analog:** itself. Replace lines 56-62:
```astro
<script is:inline>
  var d = document.documentElement;
  ...
</script>
```
with the frontmatter import plus `<script is:inline set:html={JS_READY}></script>`. Existing `set:html` precedent on line 63:
```astro
{jsonLd && <script type="application/ld+json" set:html={serializeJsonLd(jsonLd)} />}
```
Imports in this layout use `../lib/x.ts` with extension (same as `serializeJsonLd`).

### `astro.config.mjs` (config)

**Analog:** itself. Current shape (lines 1-19): `defineConfig({ site, output: 'static', adapter: vercel(), integrations: [...], build: { inlineStylesheets: 'never' }, env, fonts })`. Add keys in the same flat style, with no comments:
```js
import { createHash } from 'node:crypto';
import { JS_READY } from './src/lib/js-ready.ts';
adapter: vercel({ staticHeaders: true }),
security: { csp: { scriptDirective: { hashes: [jsReadyHash] }, directives: [ ... ] } },
vite: { build: { sourcemap: false } },
```
Existing import order: third-party first (`@astrojs/sitemap`, `@astrojs/vercel`, `astro/config`); put `node:` import first (Biome organizeImports sorts `node:` before packages). Fallback if `.ts` import in config fails: rename to `src/lib/js-ready.mjs` (A10). Directive list per RESEARCH Pattern 2 (no `script-src`/`style-src` in `directives`).

### `vercel.json` (config)

**No analog** (file is `{}`). Use RESEARCH Pattern 4 verbatim; prefer the single `/(.*)` block with CORP `same-site` unless the exclusion regex is proven on preview. Sources must be plain regex (no `:param`), because `scripts/verify/headers.mjs` compiles them with `new RegExp('^' + source + '$')`. Pure JSON, no comments.

### `package.json` (edit)

**Analog:** itself, `scripts` block lines 10-23. Change:
```json
"build": "astro build && node scripts/finalize-headers.mjs",
```
and add a script following the `verify:*` naming:
```json
"verify:headers": "node scripts/verify/header-gates.mjs",
```
`pnpm test` glob stays `src/**/*.test.mjs`, so the pure finalize module and its test must live under `src/` (decision for planner: `src/lib/finalize-headers.pure.mjs`, imported by `scripts/finalize-headers.mjs`).

### `scripts/finalize-headers.mjs` (utility, file-I/O)

**Analog:** `scripts/verify/static-server.mjs` for cwd-relative path resolution and `node:` imports (lines 1-5, 73-82):
```js
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

export function resolveStaticDir() {
  if (process.env.STATIC_DIR) return resolve(process.env.STATIC_DIR);
  const primary = join(ROOT, '.vercel', 'output', 'static');
  if (existsSync(primary)) return primary;
  return join(ROOT, 'dist');
}
```
Conventions to copy: `import process from 'node:process'` explicit, `ROOT = process.cwd()`, console output without accents, exit codes via `process.exit(1)` on failure. Logic body per RESEARCH Pattern 3 (read `.vercel/output/config.json`, assert 1 distinct CSP, drop per-page routes, insert `{ src: '/(.*)', headers, continue: true }` before `{ handle: 'filesystem' }`, `CSP_MODE` env with a code-constant default, fail when no CSP route). Keep pure functions (`collectCsp`, `reshapeRoutes`, `headerNameFor(mode)`) in the `.pure.mjs` module.

### `src/lib/finalize-headers.pure.mjs` and `finalize-headers.test.mjs`

**Analog:** `src/lib/request-guards.ts` (pure exported functions, early-return style, no side effects) and `src/lib/request-guards.test.mjs` for test layout (`node:test` + `node:assert/strict`, Portuguese names). Tests: single distinct CSP passes, two distinct throws, mode `report-only` renames key, `enforce` keeps `content-security-policy`, global route inserted immediately before `handle: filesystem`, `upgrade-insecure-requests` appended, missing CSP route throws.

### `scripts/verify/headers.mjs` (utility, transform)

**Analog:** `scripts/verify/static-server.mjs` export style (named exports, no default). Body is RESEARCH "Header rule loader" (`loadRules`, `headersFor`). Add `export` of a `isRegexCompatible(source)` helper used by a test asserting every `vercel.json` source compiles. Lowercase all header keys (HTTP headers from `res.writeHead` are case-insensitive; gates compare lowercase).

### `scripts/verify/header-gates.mjs` (gate, request-response)

**Analog:** `scripts/verify/form-gates.mjs` for the dual mode (local server vs `--live`), and `seo-gates.mjs` / `browser-gates.mjs` for the `checks` map runner.

Dual-mode skeleton (form-gates.mjs lines 25-27, 765-817):
```js
const args = process.argv.slice(2);
const live = args.includes('--live');
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
```
```js
if (live) {
  const preview = process.env.PREVIEW_URL;
  if (!preview) {
    console.log('FAIL: modo --live exige a variavel PREVIEW_URL');
    process.exit(2);
  }
  base = preview.replace(/\/+$/, '');
} else {
  if (!existsSync(STATIC_DIR)) {
    console.log('FAIL: build ausente');
    process.exit(1);
  }
  ({ server, base } = await startStaticServer());
}
```
Runner loop to copy (form-gates.mjs lines 788-817): `--list`, `--check=a,b`, try/catch around each check producing `erro: ...`, `PASS: name` / `FAIL: name - a | b`, final `RESUMO: N PASS / M FAIL`, `process.exit(fail > 0 ? 1 : 0)`. Each check returns an array of failure strings (empty = pass). Add `--expect report-only|enforce` parsed like `--check=` (`args.find((a) => a.startsWith('--expect='))`). Live fetches use `fetch(url, { headers: bypass ? { 'x-vercel-protection-bypass': bypass } : {}, redirect: 'manual' })`; keep API probes to at most 2-3 requests (WAF `api-flood`, Pitfall 7), using `ALL` -> 405 with `Allow: POST` (see `src/pages/api/orcamento.ts` line 17). Paths: `/`, `/obrigado/`, `/nao-existe`, `/_astro/<hash>.js` (discover from index.html), `/og-image.jpg`, `/api/orcamento`. Offline mode needs no browser; skip `launchBrowser`. Source-tree checks (no `.map`, no `sourceMappingURL`, no `http-equiv` CSP meta) use the `walk`/`read` helpers pattern from `seo-gates.mjs` lines 25-53.

### `scripts/verify/static-server.mjs` (edit)

**Analog:** itself. Single insertion point, line 138:
```js
const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
res.writeHead(status, { 'content-type': type });
```
becomes `res.writeHead(status, { 'content-type': type, ...headersFor(rules, pathname) })` with `rules` loaded once in `startStaticServer` from `.vercel/output/config.json` (sibling of `STATIC_DIR`) and `vercel.json` when present, behind an option `{ withHeaders }` defaulting on only if config exists. Strip the single token `upgrade-insecure-requests` in the emulator. Note `/404` handling: the 404 branch (lines 128-136) already uses the pathname of the request, so the global `/(.*)` rule matches unknown URLs. Keep existing exports (`STATIC_DIR`, `startStaticServer`, `launchBrowser`, `resolveStaticDir`) unchanged because browser/form/aurora gates import them.

### `scripts/verify/browser-gates.mjs` (edit)

**Analog:** itself. Add a check named `csp` to the `checks` object using `withPage` (lines 67-75) and the two-mode context pattern already used at lines 144-172 (`reducedMotion: 'reduce'`):
```js
async function withPage(ctx, base, route, fn) {
  const page = await ctx.newPage();
  try {
    await page.goto(base + route, { waitUntil: 'load' });
    return await fn(page);
  } finally {
    await page.close();
  }
}
```
Violation harness requires `page.addInitScript` BEFORE `goto`, so the new check must create the page itself (cannot reuse `withPage` as is) or extend `withPage` with an optional `init` callback. Use `scrollThrough(page)` (lines 5-12) before reading `window.__csp`. Iterate the existing `ROUTES` array (lines 15-22) in `reducedMotion: 'no-preference'` and `'reduce'`. Failure format: `${route} [${mode}]: ${violation}`. Register under `checks`, auto-picked up by the runner (lines 366-411), and `--check=csp` works already.

### `scripts/verify/form-gates.mjs` (edit)

**Analog:** itself. Reuse `newContext` (lines 31-37), `mockApi` (39-53) and the `json(...)` helper; add `addInitScript` listener on the pages used by the JS-submit and no-JS native POST checks, then assert `window.__csp` is empty after navigation to `/obrigado`. For `--live`, add the same listener inside `liveChecks.cookiesZero`/`terceiros` style checks using `liveContext(browser)` (lines 702-707), which already injects the bypass header. Add `va.vercel-scripts.com` assertion into `liveChecks.terceiros` (already collects off-origin requests).

### `scripts/security-check.sh` (edit)

**Analog:** itself. Helper trio and counters (lines 170-176) must be reused:
```bash
pass() { echo "PASS: $1"; pass_count=$((pass_count + 1)); }
fail() { echo "FAIL: $1"; fail_count=$((fail_count + 1)); }
skip() { echo "SKIP: $1"; skip_count=$((skip_count + 1)); }
```
- Verif 3 (lines 205-235): the inline-script counter `total_inline_script` will change when js-ready stays inline; keep the count informational, add the cross-origin scan as a new numbered verif (9) using the same `html_files` loop and `grep -oiE` style.
- Verif 6 (lines 255-265) is the baseline `curl -sI` printer (comment text says "assercoes valem a partir da Fase 7", but code has none): convert to assertions. Reuse `curl -sI -H "x-vercel-protection-bypass: $BYPASS" "$PREVIEW_URL"` and add `grep -qi` checks per header, `fail`/`pass` accordingly, still `skip` when `PREVIEW_URL` empty.
- New verifs follow verif 8 (lines 281-287) pattern:
```bash
console_hits=$(grep -rnE 'console\.' --include='*.ts' src/lib src/pages/api 2>/dev/null)
if [ -n "$console_hits" ]; then
  fail "verificacao 8 - console.* no codigo do servidor (LGPD-04)"
  echo "$console_hits" | head -n 20
else
  pass "verificacao 8 - nenhum console.* no codigo do servidor"
fi
```
New ones: 9 no `.map` / `sourceMappingURL` under `$STATIC_DIR` and `.vercel/output/functions`; 10 no `ClientRouter|astro:transitions` in `src/`; 11 no cross-origin loads in built HTML; 12 no `http-equiv="content-security-policy"` in built HTML; 13 error pages leak nothing. Keep the summary lines (289-293) last. Messages are pt-BR without accents, prefixed `verificacao N - `. Remember: no comments in the `.sh`.

### `src/pages/500.astro` (page, request-response)

**Analog:** `src/pages/404.astro` (exact; read in full). Copy the whole structure:
```astro
---
import Aurora from '../components/Aurora.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
import { SECONDARY_TITLE_SUFFIX } from '../lib/business.ts';
---

<BaseLayout title={`Página não encontrada${SECONDARY_TITLE_SUFFIX}`} description="..." noindex>
  <main id="conteudo">
    <section class="intro">
      <Aurora variant="small" />
      <div class="wrap content-block">
        <h1 class="h2">Página não encontrada</h1>
        <p class="lead">O endereço que você tentou acessar não existe.</p>
        <div class="actions">
          <a href="/" class="btn btn-ghost">Voltar ao início</a>
          <a href="/#contato" class="btn btn-primary">Pedir orçamento</a>
        </div>
      </div>
    </section>
  </main>
</BaseLayout>
```
plus the scoped `<style>` block (lines 49+ of the file: `.intro`, `.content-block`, `h1, p`, `.actions`), which is auto-hashed by `security.csp`. Change title/description/copy to a generic pt-BR server-error message ("Algo deu errado", no error object access, no stack). Also add the new route to the `ROUTES` lists in `browser-gates.mjs` (lines 15-22) and `seo-gates.mjs` (lines 59-66) and to the sitemap filter in `astro.config.mjs` (line 13, currently excludes `/obrigado` and `/erro-envio`; 404 is excluded by Astro already, add `/500`). The existing seo-gates `ROUTES` map will otherwise ignore it; `noindex` is passed through the layout prop. Related page for copy tone: `src/pages/erro-envio/[motivo].astro` (not read; planner should open it for `falha` wording).

### `src/pages/api/orcamento.ts` (controller, request-response)

**Analog:** itself (lines 7-19 as shown):
```ts
export const POST: APIRoute = async (context) => {
  let ip: string | undefined;
  try {
    ip = context.clientAddress;
  } catch {
    ip = undefined;
  }
  return handleSubmission(context.request, createDeps(getSecret, ip, import.meta.env.DEV));
};

export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
```
Edit: wrap the final `return handleSubmission(...)` (and `createDeps`) in try/catch returning the generic failure the handler already produces. Reuse the redirect/JSON helpers rather than inventing new ones: `bare`, `seeOther`, `json` live in `src/lib/submit.ts` (not read; planner must open it to copy the exact `/erro-envio/falha` 303 construction and the Accept-based JSON-vs-redirect decision). `console.*` is banned (security-check verif 8), so the catch block must not log. Test with `src/lib/submit.test.mjs` conventions.

### `.github/workflows/headers.yml` (CI, event-driven)

**Analog:** `.github/workflows/lighthouse.yml` (exact). Copy trigger, permissions, job gating and the bypass preflight:
```yaml
name: headers
on:
  deployment_status:
  workflow_dispatch:
permissions:
  contents: read
jobs:
  headers-preview:
    if: github.event.deployment_status.state == 'success' && contains(github.event.deployment_status.environment, 'Preview')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: Verify protection-bypass
        env:
          BYPASS: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
          TARGET: ${{ github.event.deployment_status.target_url }}
        run: |
          code=$(curl -sS -o /dev/null -w '%{http_code}' -H "x-vercel-protection-bypass: $BYPASS" "$TARGET/")
          echo "bypass header HTTP status: $code"
          test "$code" = "200"
```
Production job gate (lighthouse.yml line 397): `github.event_name == 'workflow_dispatch' || (github.event.deployment_status.state == 'success' && contains(github.event.deployment_status.environment, 'Production'))`, target `https://agenciadmarques.com.br/`. Setup steps for Node come from `ci.yml` lines 425-431 (`actions/checkout@v7`, `pnpm/action-setup@v6`, `actions/setup-node@v7` with `node-version: 24`, `cache: pnpm`, `pnpm install --frozen-lockfile`). Run `node scripts/verify/header-gates.mjs --live --expect report-only|enforce` with `PREVIEW_URL` and `VERCEL_AUTOMATION_BYPASS_SECRET` env. Action versions used in repo: `actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6`. No YAML comments.

### `.github/workflows/ci.yml` (edit)

**Analog:** itself. Insert after `- run: pnpm build` (line 435) and before the Playwright install order matters only for browser gates:
```yaml
      - run: node scripts/verify/header-gates.mjs
```
Place it next to `aurora-gates`/`seo-gates` (lines 436-437). `STATIC_DIR` env is already set at job level.

### `docs/seguranca-headers.md` and `.planning/security/runs/phase-07.md`

**Analogs:** `docs/waf-rate-limit.md` / `docs/operacao-formulario.md` for the docs tone (pt-BR); `.planning/security/runs/phase-06.md` for the run file: header block (Fase, Data, Commit revisado, URL revisada, Gabarito respondido `.planning/security/SECURITY-CHECKLIST.md`, Como foi gerado), then verbatim `security-check.sh --ci` output in a fenced block, then probe outputs, then per-checklist-item judgement. Must also close finding P06-003 (HSTS-only baseline). Docs content list is in RESEARCH (header table, CSP decisions, SRI rule, View Transitions decision, HSTS preload notes).

## Shared Patterns

### Gate runner (checks map, PASS/FAIL, RESUMO, exit code)
**Source:** `scripts/verify/form-gates.mjs` lines 788-817 (also `browser-gates.mjs` 366-411, `seo-gates.mjs` end).
**Apply to:** `header-gates.mjs`, new checks in `browser-gates.mjs`/`form-gates.mjs`.
Each check is `async ({ browser, base }) => string[]`; empty array means pass; unexpected exceptions become `erro: <first line>`; `--list` and `--check=` flags supported; final `RESUMO: N PASS / M FAIL`.

### Static dir and server reuse
**Source:** `scripts/verify/static-server.mjs` exports `STATIC_DIR`, `startStaticServer`, `launchBrowser`.
**Apply to:** every Playwright-based or offline header check; do not re-implement.

### Vercel preview bypass for live checks
**Source:** `scripts/verify/form-gates.mjs` lines 26-27 and 702-707; `.github/workflows/lighthouse.yml` lines 379-384; `security-check.sh` lines 259-263.
**Apply to:** `header-gates.mjs --live`, `headers.yml`, `security-check.sh` verif 6, Playwright violation runs on preview.
Header name `x-vercel-protection-bypass`, secret `VERCEL_AUTOMATION_BYPASS_SECRET`.

### Zero-violation listener
**Source:** RESEARCH Pattern 5 (no repo analog).
**Apply to:** `browser-gates.mjs`, `form-gates.mjs`. Install via `page.addInitScript` before `goto`; assert `window.__csp.length === 0`.

### Unit test style
**Source:** `src/lib/seo.test.mjs` lines 1-28, `src/lib/request-guards.test.mjs`.
**Apply to:** `js-ready.test.mjs`, `finalize-headers.test.mjs`, any header-rule test. `node:test` + `node:assert/strict`, Portuguese test titles, imports of `.ts` with extension.

### Server code hygiene
**Source:** `security-check.sh` verif 8 (lines 281-287).
**Apply to:** `src/pages/api/orcamento.ts` try/catch and any new file under `src/lib` or `src/pages/api`: no `console.*`.

### Inline style/script discipline
**Source:** `security-check.sh` verifs 2-3 (no `style=` attributes; only Fonts API `<style>` inline).
**Apply to:** `500.astro` and any edit to `BaseLayout.astro`; `style=` attributes in `src/` fail the build gate, and CSP has no `style-src-attr` allowance.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `vercel.json` | config | request-response | Currently `{}`; no headers config exists. Use RESEARCH Pattern 4 |
| Violation listener (`securitypolicyviolation`) | test harness | event-driven | No existing CSP instrumentation; use RESEARCH Pattern 5 |
| `.vercel/output/config.json` mutation logic | build step | file-I/O | No repo script rewrites build output; logic from RESEARCH Pattern 3 (only fs/path conventions come from `static-server.mjs`) |

## Metadata

**Analog search scope:** `scripts/`, `scripts/verify/`, `src/lib/`, `src/pages/`, `src/layouts/BaseLayout.astro`, `.github/workflows/`, `docs/`, `.planning/security/`, root configs.
**Files scanned:** about 30 (large gate files read via targeted ranges).
**Not read, planner should open before editing:** `src/lib/submit.ts` (response helpers), `src/pages/erro-envio/[motivo].astro` (error copy), `lighthouserc*.json`.
**Pattern extraction date:** 2026-10-19
