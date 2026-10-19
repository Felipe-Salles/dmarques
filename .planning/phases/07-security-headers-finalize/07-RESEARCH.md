# Phase 7: Security Headers Finalize - Research

**Researched:** 2026-10-19
**Domain:** HTTP security headers + hashed CSP on Astro 7.3.8 / @astrojs/vercel 11.0.14 (static + 1 function) on Vercel
**Confidence:** HIGH on the CSP mechanism (reproduced locally); MEDIUM on Vercel platform merge behaviour (must be proven on a preview deploy in the first task)

## User Constraints (from CONTEXT.md)

No `07-CONTEXT.md` exists (phase directory was empty). Constraints come from ROADMAP, REQUIREMENTS, CLAUDE.md and memory:

- Zero code comments in any versioned file (JS, MJS, JSON, YAML, Astro, CSS, sh).
- All user-facing text in pt-BR. Docs and run files in this repo are pt-BR; planning artifacts may be en.
- Lighthouse mobile >= 95 in all four categories (PERF-01) must still pass at the end.
- Zero third-party assets in v1; no new runtime dependencies expected for this phase.
- Merge to main only with user approval; work on a branch with Vercel preview.
- DNS stays on GoDaddy; never change nameservers.
- Cloudflare / Turnstile are Milestone 2 (CF-06 will add `challenges.cloudflare.com` later). Out of scope.

## Project Constraints (from CLAUDE.md)

- Static Astro + `@astrojs/vercel` adapter, `output: 'static'`, exactly one Function (`/api/orcamento`).
- CSP restrictive, no secrets in client bundle, `pnpm audit` clean.
- No `'unsafe-inline'` / `'unsafe-eval'` in `script-src`.
- Edits go through a GSD workflow (this research feeds `/gsd:plan-phase`).
- Skill `sketch-findings-dmarques` is design-only; not relevant to this phase.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | Security headers in `vercel.json` on all responses | `vercel.json` `headers` block (section "Header set"); probe on preview that it reaches HTML, assets, 404 and the API function |
| SEC-02 | CSP as header, strict directives | `security.csp` + `adapter staticHeaders: true` (no `<meta>` emitted, verified) + post-build finalize script for global header route and `upgrade-insecure-requests` |
| SEC-03 | Report-Only first, zero violations, then enforce | Finalize script `CSP_MODE`; Playwright `securitypolicyviolation` harness against header-emulating static server and against preview |
| SEC-04 | Sourcemaps off, error pages leak nothing | `vite.build.sourcemap: false`, `.map` gate, `500.astro`, API handler already generic |
| SEC-05 | Zero third-party assets, SRI rule documented | Built HTML scanned: only same-origin loads; `docs/seguranca-headers.md` SRI rule |
| SEC-06 | securityheaders.com >= A + `curl -I` CI check | `scripts/verify/header-gates.mjs` (offline + `--live`), CI job on preview and production |
| SEC-10 | No Astro View Transitions (decision recorded) | `ClientRouter` / `astro:transitions` not present (grep); record decision + add grep gate |
| SEC-07 | Final checklist run, no open High | Extend `scripts/security-check.sh` (verifs 3, 6 and new ones), new `runs/phase-07.md`, close P06-003 |
| PERF-01 | Lighthouse mobile >= 95 | Headers add no bytes of significance; existing LHCI workflow re-run on preview |
</phase_requirements>

## Summary

The hard problem (header-delivered, hashed CSP for prerendered pages) is solved by existing machinery in the installed versions. `@astrojs/vercel` 11.0.14 has `staticHeaders: true`; with `security.csp` enabled Astro stops emitting the `<meta http-equiv>` (confirmed: 0 occurrences in built HTML) and the adapter writes one `content-security-policy` header route per prerendered page into `.vercel/output/config.json`. I built the site with that configuration in a scratch run: every page got an identical CSP containing 6 script hashes and 4 style hashes, `'self'`, and the custom directives I passed. [VERIFIED: local build + `node_modules/@astrojs/vercel/dist/index.js` lines 369-375, 495-508]

Two defects must be handled. (1) The inline `<script is:inline>` in `src/layouts/BaseLayout.astro` (the `js-ready` toggle) is NOT auto-hashed by Astro; a Playwright run against the built output with the generated CSP enforced produced exactly one violation class (`script-src-elem inline`, that script on 3 pages x 2 motion modes). Everything else passed: JSON-LD data block, bundled module script, the Vercel Analytics inline module snippet (hashed), `element.style.setProperty` from `scroll.ts`/`tilt.ts`/`title-light.ts`, WebGL/aurora, self-hosted fonts, `grain.svg`. (2) The adapter's per-page routes are exact-path (`/`, `/404`, `/obrigado`, `/erro-envio/...`), have no `continue: true`, and do not cover unknown URLs served as `404.html` via the catch-all, trailing-slash variants, nor the API function. A tiny post-build script that replaces them with one global `/(.*)` route (`continue: true`) fixes coverage, lets `upgrade-insecure-requests` be added, and is also the Report-Only switch (Astro has no Report-Only mode; the script renames the header key).

All other headers go in `vercel.json` (literal reading of SEC-01). CI verification uses a header-emulating local server (no third-party report endpoint) plus a `curl -I`-style `--live` check against preview (bypass header) and production.

**Primary recommendation:** `security.csp` (custom directives + the js-ready hash from a single-source constant) + `staticHeaders: true` + `scripts/finalize-headers.mjs` chained after `astro build` + `vercel.json` headers + a shared header-rule loader used by both the local static server and a new `header-gates.mjs`. Prove Vercel merges `vercel.json` headers with the adapter output on a preview before building anything else.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Non-CSP security headers (HSTS, XCTO, XFO, Referrer, Permissions, COOP, CORP) | CDN / Static (vercel.json at the edge) | API (same rules reach the Function response) | Must cover static assets and prerendered HTML, which no Astro middleware can touch on a static build |
| CSP header | CDN / Static (Build Output `config.json` route) | Build step (hash computation) | Only the build knows script/style hashes; edge emits it |
| Report-Only vs enforce switch | Build step (finalize script) | — | Astro cannot emit Report-Only; header name is rewritten at build |
| Violation detection | CI / Playwright (browser) | — | No report endpoint (zero third-party; no PII logging) |
| Sourcemap suppression | Build config (Vite) | CI gate | Static artifact property |
| Error pages (404/500) | Frontend static pages | API (generic JSON/303) | Prerendered, no runtime diagnostics |
| Regression check of headers | CI (curl/fetch against preview/prod) | Local emulation | SEC-06 |

## Standard Stack

No new runtime or dev dependencies. Everything uses what is installed.

### Core
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| astro | 7.3.8 (installed) | `security.csp` (hash computation, `directives`, `scriptDirective.hashes`) | Stable since Astro 6; auto-hashes bundled and Astro-processed inline scripts/styles [VERIFIED: local build] |
| @astrojs/vercel | 11.0.14 (installed) | `staticHeaders: true` writes CSP routes to `.vercel/output/config.json`; suppresses `<meta>` | [VERIFIED: dist/index.js, node_modules d.ts, docs.astro.build/en/guides/integrations-guide/vercel] |
| playwright | 1.64.1 (installed) | `securitypolicyviolation` listener harness, live header + CSP checks | Already used by `browser-gates.mjs` / `form-gates.mjs` |
| node:test | built-in | Unit tests for finalize/rule-matching pure functions (`pnpm test` glob `src/**/*.test.mjs`) | Existing convention |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Auto-hashes (`script-src 'self' 'sha256-...'`) | Zero inline scripts, `script-src 'self'` literally | Would need `build.assetsInlineLimit: 0`, a static `public/js-ready.js` render-blocking classic script, and Fonts API `<style>` blocks cannot be externalized. Hash sources contain no `unsafe-inline`; treat as meeting SEC-02 (see Assumption A1) |
| Finalize script mutating `.vercel/output/config.json` | `vercel.json` generated at build | Vercel reads `vercel.json` before/independent of the build; a build-time write is unreliable. Mutating Build Output is deterministic |
| Local header emulator | `vercel dev` / `vercel build --prebuilt` | Heavier, needs auth. Emulator reads the same files that ship |

## Package Legitimacy Audit

No packages are installed in this phase. Packages removed: none. Flagged: none. (Nothing to slopcheck.)

## Architecture Patterns

### System Architecture Diagram

```
astro.config.mjs
  security.csp { directives, scriptDirective.hashes:[hash(JS_READY)] }
  adapter vercel({ staticHeaders: true })
  vite.build.sourcemap = false
        |
        v
`astro build`  --->  dist/client (HTML, no <meta> CSP)
        |            .vercel/output/config.json  (per-page CSP routes, hashes included)
        v
scripts/finalize-headers.mjs   (CSP_MODE: report-only | enforce)
  1. collect all adapter CSP values; assert exactly 1 distinct value
  2. drop per-page CSP routes
  3. add upgrade-insecure-requests
  4. insert { src:"/(.*)", headers:{ <csp-header-name>: value }, continue:true } before "filesystem"
        |
        v
Vercel deploy: vercel.json headers (HSTS, XCTO, XFO, Referrer, Permissions, COOP, CORP)
               + config.json CSP route  ==>  every response (HTML, assets, 404.html, /api/orcamento)

Local/CI: scripts/verify/headers.mjs (loads config.json routes + vercel.json sources)
   -> static-server.mjs emits identical headers
   -> browser-gates / form-gates attach securitypolicyviolation listener => zero-violation assert
   -> header-gates.mjs (offline matrix, and --live <url> with bypass header)
```

### Recommended Project Structure
```
astro.config.mjs                    security.csp + staticHeaders + sourcemap false
vercel.json                         headers (non-CSP)
src/lib/js-ready.ts                 JS_READY constant (single source for inline body + hash)
src/layouts/BaseLayout.astro        <script is:inline set:html={JS_READY}>
src/pages/500.astro                 prerendered, noindex, generic copy
scripts/finalize-headers.mjs        post-build, CSP_MODE switch
scripts/finalize-headers.pure.mjs   pure functions (testable), + src or scripts test file matching the test glob
scripts/verify/headers.mjs          shared rule loader (route regex + vercel.json source regex)
scripts/verify/header-gates.mjs     offline matrix + --live
scripts/verify/static-server.mjs    option withHeaders (default on when config present)
docs/seguranca-headers.md           header table, CSP decisions, SRI rule, View Transitions decision, HSTS preload notes
package.json                        "build": "astro build && node scripts/finalize-headers.mjs"
```
Note: the `pnpm test` glob is `src/**/*.test.mjs`; either keep the pure module under `src/lib/` or extend the glob.

### Pattern 1: Single-source inline script + hash (fixes the one real violation)
**What:** Keep the js-ready script inline (it must run before first paint to gate reveal states) but declare its text once and derive both the markup and the CSP hash from it.
```js
// src/lib/js-ready.ts
export const JS_READY =
  "var d=document.documentElement;d.classList.add('js-ready');setTimeout(function(){if(!d.classList.contains('fx'))d.classList.remove('js-ready')},3000);";
```
```astro
---
import { JS_READY } from '../lib/js-ready.ts';
---
<script is:inline set:html={JS_READY}></script>
```
```js
// astro.config.mjs
import { createHash } from 'node:crypto';
import { JS_READY } from './src/lib/js-ready.ts';
const jsReadyHash = `sha256-${createHash('sha256').update(JS_READY).digest('base64')}`;
// security: { csp: { scriptDirective: { hashes: [jsReadyHash] }, directives: [...] } }
```
`set:html` emits the string byte-for-byte, so the hash is stable. A unit test must assert `hash(JS_READY)` appears in the built CSP and that the built HTML contains the exact text. [VERIFIED: violation reproduced; `scriptDirective.hashes` documented in astro config d.ts]. Caveat: confirm `astro.config.mjs` can import a `.ts` module in this repo (Astro loads config through Vite, so it should; if not, use `src/lib/js-ready.mjs`).

### Pattern 2: CSP value to ship
```
default-src 'self'; script-src 'self' <hashes>; style-src 'self' <hashes>;
img-src 'self'; font-src 'self'; connect-src 'self'; frame-src 'none'; worker-src 'none';
object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```
Astro appends `script-src`/`style-src` itself; pass the rest in `security.csp.directives` (the config schema forbids `script-src`/`style-src` there and allows `upgrade-insecure-requests`, so it can be added directly, but the Report-Only header ignores it with a console note, which is harmless). `img-src 'self'` without `data:`: no `data:` URL exists in built CSS/HTML (grep); Playwright proves it, add `data:` only if a violation appears. [VERIFIED: grep of built CSS; local probe]

### Pattern 3: finalize-headers.mjs behaviour
- Read `.vercel/output/config.json`; collect `routes[*].headers["content-security-policy"]`.
- Fail the build if the distinct set size != 1 (each page currently yields the same value; if a future page adds a unique inline script this fails loudly instead of shipping a broken CSP). Possible later refinement: union.
- Mode: `process.env.CSP_MODE` if set, else the constant default in the script (`report-only` in the wave that ships the preview; flipped to `enforce` in the promotion wave). Header key: `content-security-policy-report-only` vs `content-security-policy`.
- Remove adapter per-page CSP routes, insert `{ "src": "/(.*)", "headers": { ... }, "continue": true }` immediately before `{ "handle": "filesystem" }` (same position the adapter uses, so it also precedes the `_render` dest routes and the 404 catch-all).
- Exit non-zero if config.json missing or has no CSP route (guards against `staticHeaders` silently regressing).

### Pattern 4: vercel.json header set
```json
{
  "headers": [
    {
      "source": "/((?!og-image\\.jpg$|favicon\\.ico$|favicon-32x32\\.png$|apple-touch-icon\\.png$).*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
      ]
    },
    {
      "source": "/(og-image\\.jpg|favicon\\.ico|favicon-32x32\\.png|apple-touch-icon\\.png)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    }
  ]
}
```
Rationale and decisions:
- HSTS and XCTO must also be on the second block, because the first excludes those paths. Simpler alternative the planner may prefer: a single `/(.*)` block with CORP `same-site`, accepting slightly weaker CORP and no exclusion regex. Both satisfy "COOP/CORP". Choose the single block unless the exclusion regex is proven on preview; keep the two-block form only if share-image fetching by a browser-side consumer is a real need (crawlers fetch server-side and are not subject to CORP). [ASSUMED: social crawlers (WhatsApp/LinkedIn/Facebook/X) are unaffected by CORP as it is enforced only by browsers on `no-cors` cross-origin subresource loads]
- Vercel's default custom-domain HSTS is `max-age=63072000` (no `includeSubDomains`/`preload`); `*.vercel.app` default already includes both. Docs say the header can be modified via project response headers; whether a `vercel.json` entry fully replaces the platform default on a custom domain is not stated, so assert the final `curl -I` value on production. [CITED: vercel.com/docs/security/encryption (via search result summary)]
- Permissions-Policy drops `interest-cohort` if the planner wants a minimal, non-deprecated list; it is harmless.
- `X-Frame-Options: DENY` is legacy; keep (criterion) alongside CSP `frame-ancestors 'none'`.
- Do not put CSP in `vercel.json`: hashes are build-generated.
- All JSON, no comments, so the zero-comment rule is trivially satisfied.

### Pattern 5: Zero-violation harness
```js
await page.addInitScript(() => {
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', (e) => {
    window.__csp.push(`${e.violatedDirective} ${e.blockedURI} ${e.effectiveDirective}`);
  });
});
```
Run on every route in `ROUTES` (browser-gates) in both `reducedMotion` modes after scrolling the whole page, and in `form-gates` for (a) JS-enhanced submit via mocked `fetch` (`page.route` fulfils after the CSP check, so a `connect-src` violation still surfaces), (b) no-JS native POST with 303 to `/obrigado` (`form-action 'self'`, redirect target same-origin). In Report-Only the same event fires with `disposition: "report"`; assert `window.__csp.length === 0` in both modes. For the real preview, pass the bypass secret via `extraHTTPHeaders` (as `form-gates --live` already does).

### Anti-Patterns to Avoid
- Shipping a hash computed from formatted source text (Prettier/Biome reflow changes it): always derive it from the exported constant.
- Putting `'unsafe-inline'` anywhere to "make it work": per Astro docs it suppresses hashes on that directive entirely. [CITED: astro config reference, `security.csp` limitations]
- Using `<meta http-equiv>` CSP: cannot carry `frame-ancestors`, Report-Only or `sandbox`; also already absent with `staticHeaders`.
- A third-party report endpoint (violates zero-third-party; also LGPD).
- Hand-editing hashes into `vercel.json`: drifts on every JS change.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Script/style hashing | A regex over dist HTML computing hashes | Astro `security.csp` | It already hashes bundled, Astro-inlined and Fonts API `<style>` content at the right stage; only the `is:inline` script needs a manual hash |
| Per-route CSP routes for Vercel | Own Build Output writer from scratch | Adapter `staticHeaders: true` as the hash source, finalize script only reshapes | Keeps hashes tied to what Astro actually rendered |
| Violation collection | A report-uri service/endpoint | Browser `securitypolicyviolation` event in Playwright | No third party, no PII |
| Header grading | Re-implementing securityheaders.com | Own assertions mirroring its A criteria + manual/optional scan | Grader API needs a key |

**Key insight:** the only custom code worth writing is glue: reshape routes, emulate headers locally, assert.

## Runtime State Inventory

Not a rename/refactor phase. Not applicable. (Operational state to be aware of: Vercel project env vars, if `CSP_MODE` is set per environment instead of in code; and the browser HSTS preload list, which is external, slow to revert and submitted manually at hstspreload.org.)

## Common Pitfalls

### Pitfall 1: `is:inline` script blocked after enforcing
**What goes wrong:** `js-ready` never added; with `fx` absent the reveal-gated content stays in its no-JS state or the reverse. **Why:** Astro does not hash `is:inline` content. **Avoid:** Pattern 1. **Detect:** `script-src-elem inline` violation (reproduced).

### Pitfall 2: Adapter CSP routes miss URLs
**What goes wrong:** unknown URLs (`/nao-existe`, served from `404.html` through the catch-all), `/obrigado/` and the API response get no CSP. **Why:** routes are exact-path and lack `continue: true` (verified in `config.json` and adapter source). **Avoid:** global route from the finalize script; assert via `header-gates` on `/nao-existe`, `/obrigado/`, `/api/orcamento` (HEAD or POST-less 405), `/_astro/*.js`.

### Pitfall 3: Report-Only that still enforces
**What goes wrong:** both a `<meta>` CSP and a Report-Only header present, so "Report-Only" phase actually blocks. **Why:** `<meta>` enforces. **Avoid:** `staticHeaders: true` (meta absent; keep a gate: no `http-equiv="content-security-policy"` in dist HTML).

### Pitfall 4: Directives ignored in Report-Only
`upgrade-insecure-requests` (and `sandbox`) are not honored in Report-Only; do not read their absence as a bug, and re-test them after promotion. [ASSUMED: per CSP spec behaviour; verify with a `curl` + browser console on preview]

### Pitfall 5: Vercel does not merge `vercel.json` headers with the adapter's Build Output
**What goes wrong:** production still has only HSTS (P06-003). **Why:** unverified platform behaviour for framework builds that emit `.vercel/output`. **Avoid:** first plan task = tiny preview probe (add one `vercel.json` header, deploy, `curl -I` with bypass). **Fallback:** the finalize script injects the same non-CSP header set into `config.json` as a second `continue: true` route, reading them from `vercel.json` so there is still one source of truth.

### Pitfall 6: Vercel toolbar on previews
`vercel.live` script/iframe is injected for logged-in team members on previews and will show CSP violations in a human's console (the Lighthouse workflow already blocks `*vercel.live*`). **Avoid:** judge zero-violation on the Playwright run with the bypass header (no toolbar), not on a signed-in browser; note it in the run file. Production has no toolbar.

### Pitfall 7: WAF `api-flood` (10 req/60 s/IP, Deny 403) vs header probes
CI header checks against `/api/orcamento` must stay at most 2-3 requests per run and ideally use a method the handler answers cheaply (`ALL` returns 405 with `Allow: POST`). Check that the 405/403 deny page also carries the headers (a WAF Deny at the edge may NOT carry route headers). Do not assert headers on a 403 produced by the WAF.

### Pitfall 8: HSTS `includeSubDomains` + preload
Known subdomains: `www` (Vercel, https ok), `send`/`rsend`/`resend._domainkey` (mail DNS only, no HTTP), MX/`_dmarc` (DNS only). No known http-only subdomain, but this is from memory notes, not a zone export. Preloading is effectively permanent; the header can ship with `preload`, but the hstspreload.org submission is a separate human decision (checkpoint). [ASSUMED: no other http-only host under agenciadmarques.com.br; ask Felipe / export GoDaddy zone]

### Pitfall 9: COOP `same-origin`
Only affects windows we open or that open us; outbound links to wa.me / Instagram do not need an opener. No popup/OAuth flow exists. Low risk; verify the WhatsApp links open normally (they use `noopener` semantics anyway).

### Pitfall 10: `astro dev` has no CSP
Docs: not supported in dev. All CSP checks run on build + preview/emulator.

## Code Examples

### Header rule loader (shared by static server and gates)
```js
// scripts/verify/headers.mjs (sketch, no comments in the real file)
import { readFileSync } from 'node:fs';

export function loadRules(configPath, vercelJsonPath) {
  const cfg = JSON.parse(readFileSync(configPath, 'utf8'));
  const vj = JSON.parse(readFileSync(vercelJsonPath, 'utf8'));
  const fromConfig = cfg.routes
    .filter((r) => r.headers && !r.dest && r.src)
    .map((r) => ({ re: new RegExp(r.src), headers: r.headers }));
  const fromVercel = (vj.headers ?? []).map((h) => ({
    re: new RegExp(`^${h.source}$`),
    headers: Object.fromEntries(h.headers.map((x) => [x.key.toLowerCase(), x.value])),
  }));
  return [...fromConfig, ...fromVercel];
}

export function headersFor(rules, pathname) {
  return Object.assign({}, ...rules.filter((r) => r.re.test(pathname)).map((r) => r.headers));
}
```
Constraint: `vercel.json` sources must be plain regex-compatible (no `:param` / `*` path-to-regexp tokens); a test asserts that. Adapter `src` values like `^/_astro(?:/(.*))$` are regex already; the `/(.*)` form of the global route is regex-valid.

### Wiring into the existing static server
Wrap `res.writeHead(status, {'content-type': type, ...headersFor(rules, pathname)})`. Keep `upgrade-insecure-requests` out of the emulated enforcing header on `http://127.0.0.1` runs only if it interferes (it upgrades subresources to https and would break the local run); strip that single token in the emulator and assert its presence separately in `header-gates` offline. [ASSUMED: Chromium treats 127.0.0.1 as potentially trustworthy and does not upgrade, but do not depend on it; strip in emulator]

### header-gates assertions (offline matrix and `--live`)
For paths `/`, `/obrigado/`, `/nao-existe`, `/_astro/<hash>.js`, `/og-image.jpg`, `/api/orcamento`:
- `strict-transport-security` matches `max-age=(\d+)` >= 31536000 and contains `includeSubDomains` and `preload` (on `--live` against `*.vercel.app` previews Vercel itself already sends the same).
- `x-content-type-options: nosniff`; `x-frame-options: DENY`; `referrer-policy: strict-origin-when-cross-origin`; `permissions-policy` contains `camera=()`, `microphone=()`, `geolocation=()`; `cross-origin-opener-policy: same-origin`; `cross-origin-resource-policy` present.
- CSP (either header name per mode; in `enforce` mode only `content-security-policy` and no Report-Only): contains `default-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`; `script-src`/`style-src` contain `'self'` and no `unsafe-inline`/`unsafe-eval` anywhere; no `http-equiv` CSP meta in dist HTML.
- No `x-powered-by`; no `.map` file under static or functions; no `sourceMappingURL` in `.js`/`.css`.
`--live` takes `PREVIEW_URL`/prod URL and the `x-vercel-protection-bypass` header (secret `VERCEL_AUTOMATION_BYPASS_SECRET`, already a repo secret).

### SEC-04 pieces
- `astro.config.mjs`: `vite: { build: { sourcemap: false } }` (explicit; default currently yields no `.map` in `.vercel/output`, verified by `find`).
- `src/pages/500.astro`: prerendered, `noindex`, text like the existing `erro-envio/falha` page, no error object access.
- API route: already returns generic bodies (`bare`, `seeOther`, `json` helpers; `console.*` banned in server code by security-check verif 8). Add a top-level `try/catch` in `src/pages/api/orcamento.ts` around `createDeps`/`handleSubmission` returning the same generic 500/`303 /erro-envio/falha` so an unexpected throw never reaches Vercel's default `FUNCTION_INVOCATION_FAILED` page. [ASSUMED: current `POST` has no outer try/catch (read from source; `handleSubmission` may catch internally; confirm in planning)]. Add a gate that fetches `/404`, `/erro-envio/falha` and (when built) 500 and asserts the body has no `stack`, `at `, `node_modules`, `F:\`, `/var/task`, or `Error:` strings.

### SEC-10 decision
No `ClientRouter`, `astro:transitions` or `transition:*` directives in `src` (grep returned no hits; the `transition:` hits are CSS properties). Record in `PROJECT.md` Key Decisions and `docs/seguranca-headers.md`: "no Astro View Transitions in v1: CSP unsupported with `ClientRouter` per Astro docs, and it breaks listeners on second navigation". Add a grep to `security-check.sh` failing on `ClientRouter|astro:transitions`. [CITED: Astro `security.csp` limitations list]

### SRI rule (SEC-05) to document
"Any future external asset (script, stylesheet, font) must: (1) be justified in the phase notes, (2) carry `integrity="sha384-..."` and `crossorigin="anonymous"` with a pinned versioned URL, (3) have its exact origin added to only the relevant CSP directive via `security.csp` `resources`, never `*`, (4) update the Privacy Policy operator list, (5) add a SEC-07 judgement line. Prefer self-hosting." Plus a `security-check.sh` mechanical item: built HTML contains no `src=`/`href=` to an absolute `http(s)` origin other than the canonical site and the explicit allow-list (`wa.me`, `instagram.com` are navigation links, not loads: restrict the scan to `<script src>`, `<link rel=stylesheet|preload|modulepreload href>`, `<img src>`, `<iframe src>`, `@import`/`url(http` in CSS). Verified today: the only absolute URLs in `index.html` are canonical/OG/JSON-LD, `wa.me`, Instagram, `share.google` (anchors) and text inside the Analytics snippet (`va.vercel-scripts.com`, `pagespeed.web.dev`, `vercel.com/docs`), which are string literals, not loads.

### Analytics note
`@vercel/analytics/astro` inlines a small module snippet (hashed by Astro: verified) that injects `/_vercel/insights/script.js` (same origin, `script-src 'self'`) and posts to `/_vercel/insights/*` (`connect-src 'self'`). The `va.vercel-scripts.com/v1/script.debug.js` string exists in the snippet but is only used in development mode; the Playwright run should assert no request to that host. `/_vercel/insights/script.js` returns 404 on the local static server (not a violation). No Speed Insights package is installed.

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `experimental.csp` / `experimentalStaticHeaders` | stable `security.csp` + adapter `staticHeaders` | Header-based hashed CSP for prerendered pages |
| `<meta http-equiv>` CSP | Response header | Enables `frame-ancestors`, Report-Only |
| Nonce CSP | Hash CSP | Static pages cannot use per-request nonces |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Hash sources in `script-src`/`style-src` satisfy the roadmap wording "script-src 'self' and style-src 'self' (no unsafe-inline)" | Alternatives | If the user wants literally `'self'` only, the Analytics snippet, js-ready and Fonts API styles need externalizing (not possible for Fonts API `<style>`) |
| A2 | Vercel merges `vercel.json` `headers` with adapter-generated Build Output on git-integrated builds | Pitfall 5 | SEC-01 delivery needs the fallback (finalize script injects them) |
| A3 | Adapter's route entries without `continue: true` still behave as header-only matches on Vercel | Pitfall 2 | Moot once replaced by the finalize script's `continue: true` route |
| A4 | Social crawlers / WhatsApp / LinkedIn previews are unaffected by CORP | Pattern 4 | Broken share cards; mitigated by the og-image exclusion or `same-site` |
| A5 | No http-only subdomains under agenciadmarques.com.br | Pitfall 8 | `includeSubDomains` would break them; ask Felipe to export the GoDaddy zone |
| A6 | `upgrade-insecure-requests` ignored in Report-Only | Pitfall 4 | Minor; test after promotion |
| A7 | Astro will use a prerendered `src/pages/500.astro` for errors from the API endpoint | SEC-04 | The API still needs the explicit try/catch; do not rely on `500.astro` for the Function |
| A8 | securityheaders.com grade cannot be fetched keylessly in CI (API needs `x-api-key`) | SEC-06 | If a keyless path exists, a non-blocking job could automate it. Manual scan recorded in the run file is the plan |
| A9 | Vercel's WAF Deny 403 does not carry route headers | Pitfall 7 | Header assert on API may flake if probing too fast |
| A10 | `astro.config.mjs` can import a `.ts` module | Pattern 1 | Use `.mjs` constant instead |

## Open Questions (RESOLVED)

1. **Does `vercel.json` `headers` reach the Function response and the 404 catch-all together with the adapter routes?**
   - Known: official docs say `vercel.json` is the place for custom response headers; nothing authoritative about merging with adapter Build Output.
   - Recommendation: Wave 0/1 probe on a preview; fall back to script injection.
   - RESOLVED: settled by the 07-01 Task 3 preview probe (PROBE_RESULT), with the injection fallback in 07-02.
2. **Report-Only default location (code constant vs Vercel env var).** Recommend code constant flipped in a dedicated promotion commit for an auditable trail; env override `CSP_MODE` allowed for emergencies (instant rollback by env change + redeploy).
   - RESOLVED: code constant DEFAULT_CSP_MODE flipped in the 07-05 promotion commit; CSP_MODE env override kept.
3. **HSTS preload submission:** human step at hstspreload.org after production shows the final header; needs Felipe's decision and the subdomain check (A5).
   - RESOLVED: handled as the blocking human checkpoint in 07-07 Task 2.
4. **Unknown-URL 404 on Vercel returns `404.html` with `status: 404`:** confirm the global route applies on that path in the preview probe.
   - RESOLVED: asserted by header-gates --live on /nao-existe in the 07-01 Task 3 probe; fallback in 07-02.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, scripts | yes | v22+ (engines >=22.18) | — |
| pnpm | scripts | yes | 11.15.1 | — |
| Playwright Chromium | violation harness | yes (used by existing gates) | 1.64.1 | `channel: 'chrome'` fallback in `launchBrowser` |
| Vercel preview + bypass secret | live header/CSP check | yes (repo secret exists) | — | local emulator only (weaker) |
| curl | `security-check.sh` verif 6 | yes (git-bash/CI ubuntu) | — | Node `fetch` |
| securityheaders.com | A grade | external, manual | — | own assertions + manual scan on production |

Windows note: running two builds concurrently or leaving a process with cwd inside `.vercel/output/static` causes `EBUSY` in the adapter's cleanup; and the adapter's `nft` step fails when `node_modules` is a junction (seen only in my scratch copy). Not a repo problem.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | node:test (unit) + Playwright scripts (integration) |
| Config file | none; `package.json` `"test": "node --test \"src/**/*.test.mjs\""` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm build && node scripts/verify/header-gates.mjs && node scripts/verify/browser-gates.mjs && node scripts/verify/form-gates.mjs && bash scripts/security-check.sh --ci` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | All non-CSP headers present on `/`, `/nao-existe`, asset, API | integration (offline matrix + live) | `node scripts/verify/header-gates.mjs` / `--live $URL` | Wave 0 |
| SEC-02 | Header CSP with required directives, no unsafe-*, no meta | integration | `node scripts/verify/header-gates.mjs` | Wave 0 |
| SEC-02 | finalize reshapes routes, 1 distinct CSP, mode switch | unit | `pnpm test` (finalize pure test) | Wave 0 |
| SEC-02 | js-ready hash in CSP equals hash of emitted inline body | unit + integration | `pnpm test`, header-gates | Wave 0 |
| SEC-03 | Zero `securitypolicyviolation` on all routes, both motion modes | Playwright | `node scripts/verify/browser-gates.mjs` | edit existing |
| SEC-03 | Zero violations on JS submit and no-JS native POST | Playwright | `node scripts/verify/form-gates.mjs` (+ `--live`) | edit existing |
| SEC-03 | Preview in Report-Only; production/preview promoted to enforce | integration | `header-gates --live --expect report-only|enforce` | Wave 0 |
| SEC-04 | No `.map` files, no `sourceMappingURL`; error pages free of diagnostics | integration | `security-check.sh` new verifs | edit |
| SEC-05 | Built HTML loads no cross-origin asset; SRI rule doc exists | integration | `security-check.sh` new verif | edit |
| SEC-06 | `curl -I` regression in CI on preview and prod | CI | new workflow job | Wave 0 |
| SEC-10 | No `ClientRouter` / `astro:transitions` | grep gate | `security-check.sh` new verif | edit |
| SEC-07 | Final checklist run | manual+script | `bash scripts/security-check.sh --ci` then `runs/phase-07.md` | Wave 0 |
| PERF-01 | Lighthouse mobile >= 95 | CI | existing `lighthouse.yml` on preview | exists |

### Sampling Rate
- **Per task commit:** `pnpm test` plus `node scripts/verify/header-gates.mjs` (offline) after `pnpm build`.
- **Per wave merge:** full suite above.
- **Phase gate:** full suite green, preview Report-Only run clean, promotion run clean, Lighthouse green, before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `scripts/verify/headers.mjs` (rule loader) and `header-gates.mjs`
- [ ] finalize pure module + test file matching the `pnpm test` glob
- [ ] `src/lib/js-ready.ts` + test asserting hash stability
- [ ] Preview probe for A2/A3/Open Question 4 (before locking the architecture)
- [ ] CI job (new workflow `headers.yml` on `deployment_status` success for Preview and Production, with bypass header for preview)
- [ ] `docs/seguranca-headers.md`, `.planning/security/runs/phase-07.md`

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | no auth surface |
| V3 Session Management | no | no cookies set by site |
| V4 Access Control | no | — |
| V5 Input Validation | partial | existing Zod server validation (Phase 5); CSP `form-action 'self'` is defense in depth |
| V6 Cryptography | no | HSTS/TLS provided by Vercel; SRI hashes only if external assets are ever added |
| V14 Configuration | yes | security headers, CSP, sourcemaps off, generic error pages |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS / injected script | Tampering | CSP hashed `script-src 'self'`, no unsafe-inline |
| Clickjacking | Tampering | `frame-ancestors 'none'` + `X-Frame-Options: DENY` |
| MIME sniffing | Tampering | `nosniff` |
| TLS downgrade / SSL strip | Spoofing | HSTS includeSubDomains + preload, `upgrade-insecure-requests` |
| Form hijack / base tag injection | Tampering | `form-action 'self'`, `base-uri 'none'` |
| Info disclosure via errors / source maps | Info disclosure | no `.map`, generic error pages, no `console.*` on server |
| Cross-origin data leaks / Spectre-class | Info disclosure | COOP `same-origin`, CORP |
| Malicious future third-party script | Tampering | zero-third-party rule + SRI rule + CSP origin allow-list |

## Sources

### Primary (HIGH confidence)
- Local reproduction: scratch config with `security.csp` + `staticHeaders: true` built in `F:\Projetos\dmarques`; inspected `.vercel/output/config.json`, built HTML (0 `http-equiv`; 3 `<style>`, `<script>` inline x1, module inline x1, ld+json x1 on `/`), and a Playwright run enforcing the generated CSP (single violation class: the `is:inline` script).
- `node_modules/@astrojs/vercel/dist/index.js` (route generation, no `continue`), `index.d.ts` (`staticHeaders`), `node_modules/astro/dist/core/csp/config.d.ts` (allowed directives, hash/resource kinds), `node_modules/astro/dist/types/public/config.d.ts` (`security.csp` doc, limitations).
- https://docs.astro.build/en/guides/integrations-guide/vercel/ - `staticHeaders` description (CSP in Vercel config instead of `<meta>`).

### Secondary (MEDIUM confidence)
- https://vercel.com/docs/security/encryption and https://vercel.com/docs/headers/response-headers (via search summaries) - default HSTS values, headers configurable in project.
- https://securityheaders.com/api/docs/ (via search summary) - grade is in API JSON, API requires `x-api-key`.

### Tertiary (LOW confidence)
- CSP behaviour of `upgrade-insecure-requests` in Report-Only; CORP behaviour for crawlers (training knowledge, see A4/A6).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - nothing new; behaviour reproduced locally.
- Architecture: MEDIUM-HIGH - local mechanism proven; Vercel platform merge/ordering behaviour not yet proven on a deploy.
- Pitfalls: HIGH for CSP/inline findings, MEDIUM for platform ones.

**Research date:** 2026-10-19
**Valid until:** 2026-11-18 (Astro/adapter minor bumps can change `staticHeaders` output; re-run the finalize assertion on upgrade)
