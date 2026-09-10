---
phase: 01-foundation-ci-gate
verified: 2026-09-10T00:00:00Z
status: passed
score: 5/5 must-haves verified  (3 human-confirmation items resolved 2026-09-10: bypass secret rotated, 2FA attested, spend cap documented — see 01-HUMAN-UAT.md status: resolved)
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: n/a
  gaps_closed: []
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Confirm VERCEL_AUTOMATION_BYPASS_SECRET was rotated after finding P01-008"
    expected: "A fresh Protection-Bypass-for-Automation secret is generated in the Vercel project and re-mirrored to the GitHub Actions repo secret; the previously-exposed value no longer works against protected deployments"
    why_human: "The prior value was written unredacted into downloadable public GitHub Actions artifacts (lighthouse.yml ran with uploadArtifacts:true before commit 8ddcce5, ~90-day retention). The code fix (uploadArtifacts:false) is verified in the workflow, but P01-008's residual action 'rotacao pendente' cannot be confirmed from the codebase."
  - test: "Confirm 2FA is enabled on both the GitHub (Felipe-Salles) and Vercel (felipe-salles-projects) accounts"
    expected: "Both accounts require a second factor at login"
    why_human: "Account-level 2FA state is not exposed to the OAuth token (gh api user --jq .two_factor_authentication returns null); only the account owner can confirm. Documented as confirmed by Felipe 2026-09-09 in 01-06-SUMMARY.md, not independently re-verifiable."
  - test: "Confirm the Vercel spend posture: Hobby plan, no payment method on file, usage alerts active at 75% / 100%"
    expected: "Project pauses at the free-tier ceiling rather than incurring a bill; usage notifications are enabled"
    why_human: "Vercel billing/notification settings are dashboard-only state. Documented as 'hobby-structural' in ROADMAP.md SEC-08 and 01-06-SUMMARY.md (explicitly weaker than Pro Spend Management), accepted as finding P01-005."
---

# Phase 1: Foundation & CI Gate Verification Report

**Phase Goal:** The project scaffold, deploy pipeline, and quality/security gates exist so every later phase ships against a live preview URL with perf and security numbers enforced.
**Verified:** 2026-09-10
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 | `pnpm dev` / `pnpm build` produce static output with `output: 'static'` + `@astrojs/vercel`, ≤1 serverless-function boundary reserved for the form, `astro check` passes | ✓ VERIFIED | `package.json` scripts `dev`/`build`/`check`; `astro.config.mjs` `output: 'static'` + `adapter: vercel()`; `pnpm run check` run now → 0 errors / 0 warnings / 0 hints; `.vercel/output/static/index.html` built; `.vercel/output/functions` absent → `security-check.sh` verificacao 5 = "Functions = 0 (no maximo 1)". Function count 0 is the correct Phase 1 assertion (Phase 5 adds exactly 1). |
| 2 | Every push → Vercel preview deploy; merge to protected `main` → production deploy; account/repo hardened (2FA, protected branch, Deployment Protection, scoped secrets, spend cap + alerts) | ✓ VERIFIED (2 items routed to human confirmation) | PR #1 `statusCheckRollup`: `Vercel` status SUCCESS with preview `targetUrl`, `Vercel Preview Comments` SUCCESS; merge commit `8eef802`; `gh run list` shows production `deployment_status` events on `main`. `gh api .../branches/main/protection` readback now: `strict:true`, contexts `["verify","dependency-review","lhci"]`, `allow_force_pushes:false`, `allow_deletions:false`, `required_linear_history:true`, `approvals:0`, `enforce_admins:false`. Deployment Protection `all_except_custom_domains` + `X-Robots-Tag: noindex` confirmed in `phase-01.md` header baseline. `RESEND_API_KEY` declared `context:'server', access:'secret'` in `astro.config.mjs`. 2FA + spend-cap = human confirmation items (dashboard-only state, signed off by Felipe 2026-09-09). |
| 3 | CI blocks merge on failing `astro check`, build, `pnpm audit`, Dependency Review, JS-weight budget (<20 KB, no UI framework / no animation lib), or Lighthouse mobile <95 in the four categories, with Web Vitals budgets asserted | ✓ VERIFIED (SEO gate + INP clause consciously deferred, documented) | `.github/workflows/ci.yml` `verify` job runs sync/check/build/`pnpm audit --audit-level=high`/`js-weight-check.sh`/`security-check.sh --ci`; `dependency-review` job `fail-on-severity: high`. Branch protection makes `verify`+`dependency-review`+`lhci` required. `01-07-SUMMARY.md` proves 3 deliberate failures (ts error, `gsap` dep, `style=` attr) each turned `verify` red for the exact step and were reverted; clean PR #1 went green on all three. `lighthouserc.json`: performance/best-practices/accessibility `error` ≥0.95, LCP `error` 2500, CLS `error` 0.05, TBT `error` 200, script:size `error` 20480. CI lhci median: Perf 1.00 / A11y 1.00 / BP 0.96 / LCP 1543ms / CLS 0 / TBT 0ms. **SEO asserted as `warn` (not `error`) for Phase 1** — documented decision (WR-06 wont_fix, P01-004 accepted): protected preview `noindex` structurally fails `is-crawlable`; meta/robots are Phase 6 scope; Phase 6 restores `error` against production. **INP clause deferred** to field monitoring (P01-003) — verbatim deferral sentence present in `01-04`/`01-07` SUMMARYs and `phase-01.md`. |
| 4 | Outfit + DM Sans self-hosted (zero Google Fonts requests) with metrics-adjusted fallbacks and `preload` on the two critical files; server secrets in `astro:env` secret schema; CI grep of build output for secret names and `re_` returns nothing | ✓ VERIFIED | `astro.config.mjs` `fonts[]` via `fontProviders.fontsource()`, `display:'swap'`, `optimizedFallbacks:true`, `fallbacks:['system-ui','sans-serif']`. Built `index.html`: exactly 2 `<link rel="preload" ... as="font" type="font/woff2">`; 6 `.woff2` served from `/_astro/fonts/`; `grep fonts.(googleapis|gstatic).com` → none. `grep -E 'RESEND_API_KEY|re_[A-Za-z0-9_-]{20,}'` over `.vercel/output/static` (html + css) → none; `security-check.sh` verificacao 4 = PASS. |
| 5 | Design tokens in one CSS custom-properties file consumed by all components; `build.inlineStylesheets` is `never`; `BaseLayout.astro` and an empty `vercel.json` exist; SEC-07 checklist artifact exists in `.planning/` with its first run passing and no open High finding | ✓ VERIFIED | `src/styles/tokens.css` — single `:root` block, ~112 lines of `--color/--font/--space/--radius/--shadow/--z/--dur` custom properties; imported by `BaseLayout.astro`; consumed by `base.css` and `index.astro` (`var(--space-16)`, `var(--color-text-strong)`, …). `astro.config.mjs` `build.inlineStylesheets: 'never'`; built HTML has external `<link rel="stylesheet" href="/_astro/index.BKGq4XlZ.css">`, no inline page/token CSS (only Fonts-API `@font-face` blocks, permitted). `vercel.json` = `{}`. `.planning/security/SECURITY-CHECKLIST.md` (hard rule + 7 mechanical items + D-12 findings schema) and `.planning/security/runs/phase-01.md` (dated, signed off by Felipe 2026-09-10, verbatim script output, findings table P01-001…P01-010) both present. No finding is `High` AND `Open` (P01-008 was High, status `Corrigido` commit `8ddcce5` same day). |

**Score:** 5/5 truths verified

### Deferred Items

Items not fully met in Phase 1 but explicitly documented, accepted, and assigned to a later milestone phase.

| # | Item | Addressed In | Evidence |
| --- | ---- | ------------ | -------- |
| 1 | Lighthouse SEO category enforced as `error` ≥0.95 (currently `warn` in `lighthouserc.json`) | Phase 6 (SEO / Metadata / Structured Data) | 01-07 key-decision + `phase-01.md` P01-004 (accepted): protected preview injects `X-Robots-Tag: noindex` → `is-crawlable` structurally fails; meta description / `robots.txt` are Phase 6 scope. Phase 6 restores `categories:seo` to `["error", {minScore:0.95}]` against the indexable production domain. |
| 2 | PERF-02 field INP <200 ms | Post-launch field monitoring (Vercel Analytics) | `phase-01.md` P01-003 + verbatim deferral sentence in 01-04/01-07 SUMMARYs: "INP is not lab-assertable in Lighthouse; total-blocking-time <=200 ms is the asserted lab proxy; field INP <200 ms is monitored via Vercel Analytics post-launch." TBT median 0 ms proves TBT, not INP; INP is never reported as met on the TBT number. |
| 3 | Durable/global rate-limiting, Vercel WAF `/api/*` rule, edge DDoS protection | Phase 5 (form) / Milestone 2 (Cloudflare) | ROADMAP SEC-08 residual-risk statement; no `/api` route exists in Phase 1. |
| 4 | Spend cap upgraded to a configurable USD cap / tunable auto-pause ("form off, site up") | Milestone 2 | `phase-01.md` P01-005 (accepted): `hobby-structural` cap ($0 structural, no payment method, 75/100% alerts) is documented in ROADMAP SEC-08 as explicitly weaker than Pro Spend Management. |

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `package.json` | Pinned deps, dev/build scripts, engines + packageManager pins | ✓ VERIFIED | `astro 7.3.1`, `@astrojs/vercel 11.0.10`, `@vercel/analytics 2.0.1`; `"packageManager": "pnpm@11.15.1"`; `engines.node >=22.12.0`; scripts `dev`/`build`/`sync`/`check`/`format`/`lint`. Unused `@fontsource*` packages removed (WR-08 fixed). |
| `astro.config.mjs` | static output, vercel adapter, inlineStylesheets never, env secret schema, two font families | ✓ VERIFIED | All present; `styles:['normal']` only (WR-07 italic removed). |
| `vercel.json` | Empty placeholder required by success criterion 5 | ✓ VERIFIED | Contents = `{}`. |
| `.gitignore` | Build artifact exclusions | ✓ VERIFIED | `node_modules/`, `dist/`, `.vercel/`, `.astro/`, `.lighthouseci/`, `.env*`. (IN-04: `.env*` also ignores a future `.env.example` — open Info.) |
| `biome.json` / `.prettierrc` | Lint/format scoped to ts/js/json/css; Astro-only formatting | ✓ VERIFIED | `biome.json` excludes `**/*.astro` (WR-05 open: `.astro` `<script>` regions get no lint). `.prettierrc` present. |
| `src/styles/tokens.css` | Single design-token contract | ✓ VERIFIED | `--color-bg: #0a0a12` + full token set, one `:root`. |
| `src/styles/base.css` | Reset + element base rules | ✓ VERIFIED | box-sizing reset, body tokens, margin reset. |
| `src/layouts/BaseLayout.astro` | `lang="pt-BR"` shell, two Font preloads, token/base imports, analytics include | ✓ VERIFIED | `<html lang="pt-BR">`, two `<Font>` with `preload`, imports `tokens.css` then `base.css`, `<Analytics />` from `@vercel/analytics/astro`. |
| `src/pages/index.astro` | Minimal placeholder, one `<h1>` + Core Value tagline | ✓ VERIFIED | One `<main id="conteudo">`, one `<h1>`, Core Value paragraph in pt-BR, scoped `<style>` using tokens (emitted external per `inlineStylesheets:'never'`). |
| `scripts/js-weight-check.sh` | Gzipped landing-route JS budget + dependency denylist | ✓ VERIFIED | `BUDGET_BYTES=20480`; now measures inline `<script>` bytes (CR-01/P01-009 fixed) and hard-fails on unresolved external script. Run now: 1302 B gz, exit 0. Denylist gap WR-13 still open (misses `@astrojs/react|vue|svelte`, `alpinejs`, `htmx.org`, `lit`, …). |
| `scripts/security-check.sh` | 7 mechanical SEC-07 checks, `--ci` flag | ✓ VERIFIED | Run now (`--ci`): 5 PASS / 0 FAIL / 2 SKIP (6-7 need `PREVIEW_URL`), exit 0. Checks 2/3/4 hardened (WR-02/03/04, P01-010). |
| `.planning/security/SECURITY-CHECKLIST.md` | SEC-07 gabarito | ✓ VERIFIED | Hard rule "Nenhuma fase fecha com achado High em aberto.", 7 items mapped to script check numbers, D-12 findings table schema. |
| `.planning/security/runs/phase-01.md` | Dated SEC-07 run with script stdout, judgement answers, findings table, dashboard state, INP-deferral note | ✓ VERIFIED | 631 lines; verbatim `--ci` output, judgement answers, P01-001…P01-010 table, Vercel/GitHub dashboard state, PERF-02 sentence, Felipe sign-off 2026-09-10. |
| `.github/workflows/ci.yml` | Blocking PR job + dependency-review job | ✓ VERIFIED | `verify` job (sync/check/build/audit/js-weight/security-check) + `dependency-review` job `fail-on-severity: high`. |
| `.github/workflows/lighthouse.yml` | `deployment_status`-triggered Lighthouse against preview with bypass header | ✓ VERIFIED | curl HTTP-200 bypass pre-check, `jq`-injected `extraHeaders`, `treosh/lighthouse-ci-action@v12`, `uploadArtifacts: false` (CR-03/P01-008 fixed). |
| `.git/config` origin remote | Public GitHub repo, `main` default | ✓ VERIFIED | `origin https://github.com/Felipe-Salles/dmarques.git`; local branch `main`; no `master`. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| `astro.config.mjs` | `@astrojs/vercel` | `adapter: vercel()` | ✓ WIRED | Import line 1 + `adapter: vercel()` line 7. Build emits `.vercel/output/`. |
| `astro.config.mjs` | `astro:env` server/secret contract | `envField.string({context:'server',access:'secret'})` | ✓ WIRED | `RESEND_API_KEY` in `env.schema`; not present in client build output. |
| `astro.config.mjs` | Fonts API fontsource provider | `fontProviders.fontsource()` | ✓ WIRED | Two `fonts[]` entries; 6 self-hosted `.woff2` in build. |
| `BaseLayout.astro` | `tokens.css` (before `base.css`) | frontmatter import | ✓ WIRED | Line 4 then line 5. |
| `BaseLayout.astro` | `astro:assets` `<Font>` | two `<Font cssVariable=…>` with `preload` | ✓ WIRED | Lines 16-17; 2 `<link rel="preload">` in built HTML. |
| `index.astro` | `BaseLayout.astro` | layout import + wrap | ✓ WIRED | Import line 2, `<BaseLayout>` wrap. |
| `BaseLayout.astro` | `@vercel/analytics` | bundled module script | ✓ WIRED | `<Analytics />`; built HTML carries the 2817 B inline analytics loader (1302 B gz). |
| `ci.yml` | `scripts/js-weight-check.sh` | run step | ✓ WIRED | `bash scripts/js-weight-check.sh "$STATIC_DIR"`. |
| `ci.yml` | `scripts/security-check.sh` | run step `--ci` | ✓ WIRED | `bash scripts/security-check.sh --ci`. |
| `lighthouse.yml` | `lighthouserc.json` | `configPath` input | ✓ WIRED | `jq` transforms it into `$RUNNER_TEMP/lighthouserc.ci.json`, passed as `configPath`. |
| `lighthouse.yml` | `secrets.VERCEL_AUTOMATION_BYPASS_SECRET` | env → curl + `jq` header | ✓ WIRED | Mirrored secret confirmed present (`gh secret list` per 01-06); PR #1 `lhci` logged `bypass header HTTP status: 200`. |
| `SECURITY-CHECKLIST.md` | `security-check.sh` | each item names its check number | ✓ WIRED | Items 1-7 reference "verificacao N". |
| `phase-01.md` | `SECURITY-CHECKLIST.md` | answers every gabarito item by number | ✓ WIRED | "Itens mecânicos do gabarito (respondidos por número)". |
| branch protection contexts | check names GitHub reports | `gh pr checks` on live PR | ✓ WIRED | `["verify","dependency-review","lhci"]` captured verbatim from PR #1 check-runs; readback matches. |
| merge to `main` | Vercel production deployment | Vercel Git integration | ✓ WIRED | Merge `8eef802` → production `deployment_status` event (01-07 addendum + `gh run list`). |

### Data-Flow Trace (Level 4)

Not applicable — Phase 1 ships a static placeholder page and gate tooling; no dynamic data-rendering components. The one dynamic dependency (`@vercel/analytics`) is a same-origin beacon include with no rendered data.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Type-check passes | `pnpm run check` | `Result (4 files): 0 errors, 0 warnings, 0 hints` | ✓ PASS |
| Build produced static output | `find .vercel/output` | `static/index.html` + `_astro/index.BKGq4XlZ.css` + 6 `_astro/fonts/*.woff2`; no `functions/` | ✓ PASS |
| JS-weight gate enforces | `bash scripts/js-weight-check.sh .vercel/output/static` | inline script 1302 B gz; total 1302 B < 20480; denylist PASS; exit 0 | ✓ PASS |
| SEC-07 mechanical checks | `bash scripts/security-check.sh --ci` | `5 PASS / 0 FAIL / 2 SKIP`, exit 0 (6-7 SKIP: need `PREVIEW_URL`) | ✓ PASS |
| No Google Fonts in build | `grep fonts.(googleapis\|gstatic).com .vercel/output/static/index.html` | no match | ✓ PASS |
| No secret name/value in client build | `grep -E 'RESEND_API_KEY\|re_[A-Za-z0-9_-]{20,}' static/**` | no match | ✓ PASS |
| Branch protection live on `main` | `gh api .../branches/main/protection` | strict, 3 required contexts, no force-push, no deletion, linear | ✓ PASS |
| CI green on merged PR #1 | `gh pr view 1 --json statusCheckRollup` | `verify`, `dependency-review`, `lhci`, `Vercel` all SUCCESS | ✓ PASS |
| Lighthouse authoritative (CI) | PR #1 lhci run 34495905588 | Perf 1.00 / A11y 1.00 / BP 0.96 / SEO 0.45(warn); LCP 1543ms / CLS 0 / TBT 0ms | ✓ PASS |

### Probe Execution

No conventional `scripts/*/tests/probe-*.sh` probes declared for this phase. The phase's own gate scripts (`js-weight-check.sh`, `security-check.sh --ci`) were executed in-process — see Behavioral Spot-Checks above (both exit 0).

### Requirements Coverage

Every requirement ID declared in the eight PLAN `requirements` frontmatters was cross-referenced against `.planning/REQUIREMENTS.md`. Union of plan-declared IDs = {INFRA-01..10, PERF-01..04, SEC-07} = exactly the 15 phase requirement IDs. No orphaned requirement (REQUIREMENTS.md maps no additional ID to Phase 1). No plan declares an out-of-phase ID.

| Requirement | Source Plan(s) | Description | Status | Evidence |
| ----------- | -------------- | ----------- | ------ | -------- |
| INFRA-01 | 01-01 | Astro 7 `output:'static'` + `@astrojs/vercel`, prerendered HTML except form endpoint | ✓ SATISFIED | `astro.config.mjs`; build → static HTML, 0 functions |
| INFRA-02 | 01-01, 01-02 | `pnpm dev` / `pnpm build` one-command run + prod build | ✓ SATISFIED | `package.json` scripts; build output present; `pnpm run check` passes |
| INFRA-03 | 01-01, 01-02 | Outfit + DM Sans self-hosted, no Google Fonts in prod | ✓ SATISFIED | Fonts API config; 6 self-hosted woff2; zero googleapis/gstatic refs |
| INFRA-04 | 01-02 | Design tokens as CSS custom properties in one file, consumed by all | ✓ SATISFIED | `src/styles/tokens.css` single `:root`; consumed by base.css + index.astro |
| INFRA-05 | 01-01, 01-02 | `build.inlineStylesheets:'never'` — all CSS external | ✓ SATISFIED | config set; built HTML uses external `<link rel="stylesheet">`, no inline page CSS |
| INFRA-06 | 01-01, 01-03 | Server secrets via `astro:env` (`server`/`secret`); `RESEND_API_KEY` never in client bundle | ✓ SATISFIED | `env.schema` in config; `security-check.sh` verificacao 4 PASS |
| INFRA-07 | 01-06, 01-07 | Vercel continuous deploy via Git integration, preview per PR | ✓ SATISFIED | 01-06 Git integration; PR #1 `Vercel` preview status SUCCESS; production deploy on merge |
| INFRA-08 | 01-04, 01-05, 01-07 | CI runs `astro check`, build, `pnpm audit`, Dependency Review; blocks merge on failure | ✓ SATISFIED | `ci.yml` + branch protection required contexts; 01-07 deliberate-failure proof |
| INFRA-09 | 01-04, 01-07 | Lighthouse CI (mobile preset, 4x CPU, Slow 4G) ≥95 in 4 categories vs preview | ✓ SATISFIED (SEO gate deferred to Phase 6, documented) | `lighthouserc.json` throttling + assertions; `lighthouse.yml` vs preview URL; CI median Perf/A11y/BP pass |
| INFRA-10 | 01-05, 01-06, 01-07, 01-08 | Vercel/repo hardened — 2FA, protected prod branch, Deployment Protection, scoped secrets, spend cap + alerts | ✓ SATISFIED (2FA + spend-cap = human confirmation; branch protection + Deployment Protection verified) | `gh api` branch protection readback; 01-06 Deployment Protection API readback; ROADMAP SEC-08 spend-cap statement; Felipe sign-off |
| PERF-01 | 01-04, 01-07 | Lighthouse ≥95 four categories, measured in CI each PR | ✓ SATISFIED (SEO deferred) | CI lhci job; PR #1 median Perf 1.00 / A11y 1.00 / BP 0.96 |
| PERF-02 | 01-04, 01-07 | Web Vitals: LCP<2.5s, CLS<0.05, TBT<200ms, INP<200ms | ✓ SATISFIED for LCP/CLS/TBT; INP clause consciously deferred (P01-003, documented, not reported as met) | `lighthouserc.json` LCP/CLS/TBT `error` budgets; CI LCP 1543ms / CLS 0 / TBT 0ms |
| PERF-03 | 01-03, 01-04, 01-07 | Landing-route JS <20 KB budget in CI; no UI framework / animation lib | ✓ SATISFIED | `js-weight-check.sh` (1302 B gz measured, inline scripts now counted); denylist proven to block `gsap` in 01-07. WR-13: denylist has coverage gaps (WARNING). |
| PERF-04 | 01-02 | `font-display: swap` + metrics-adjusted fallbacks; two critical files `preload` | ✓ SATISFIED | config `display:'swap'`, `optimizedFallbacks:true`; exactly 2 `<link rel="preload" as="font">` in built HTML |
| SEC-07 | 01-03, 01-08 | Versioned security-review checklist in `.planning/`, run every phase, first run passing, no open High | ✓ SATISFIED | `SECURITY-CHECKLIST.md` + `runs/phase-01.md` signed off; no `High`+`Open` finding |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `.github/workflows/*.yml`, `package.json` | actions `@v7`/`@v6`, `pnpm@11.15.1` | Toolchain/action tags ahead of known releases (WR-01/WR-12) | ℹ️ Info | Marked wont_fix — `verify`/`dependency-review`/`lhci` are all green on GitHub, so every tag resolves today. Supply-chain SHA-pinning deferred. |
| `scripts/js-weight-check.sh` | 79 | Denylist regex misses `@astrojs/react\|vue\|svelte\|preact\|solid`, `alpinejs`, `htmx.org`, `lit`, `petite-vue`, `@hotwired/stimulus` (WR-13) | ⚠️ Warning | "No UI framework" enforcement has holes; the 20 KB byte budget (1302 B actual) is the effective backstop. Tracked to Phase 2+. |
| `biome.json` | 15 | `!**/*.astro` — Biome never lints `.astro` (WR-05) | ⚠️ Warning | `.astro` `<script>` logic (Phase 4) would get zero lint / no `noConsole` / no comment-rule enforcement. Open, tracked to Phase 2+. |
| `.github/workflows/ci.yml` | 6-7, 33-35 | `dependency-review` lacks `pull-requests: write` for `comment-summary-in-pr` (WR-10) | ℹ️ Info | Severity gate still works via exit code; only the PR comment silently fails to post. Open. |
| `.github/workflows/lighthouse.yml` | 9 | `contains(..., 'Preview')` case-sensitive substring (WR-11) | ℹ️ Info | If Vercel changes the environment string the Lighthouse job silently skips. Open; A7 held empirically on PR #1. |
| `.gitignore` | 7 | `.env*` also ignores a future `.env.example` (IN-04) | ℹ️ Info | Phase 5 onboarding nicety. Open. |
| n/a | n/a | Debt markers (`TODO`/`FIXME`/`XXX`/`HACK`) in phase-modified source/config files | none | Grep of `astro.config.mjs`, `*.css`, `*.astro`, `scripts/*.sh`, workflow YAML, `package.json` → no debt-marker comments. D-04 comment-free assertion holds. |

No blocker anti-patterns. No unreferenced `TBD`/`FIXME`/`XXX` in phase files.

### Human Verification Required

#### 1. Bypass-secret rotation (finding P01-008 residual)

**Test:** Confirm `VERCEL_AUTOMATION_BYPASS_SECRET` was rotated in the Vercel project and re-mirrored to the GitHub Actions repo secret after 2026-09-10.
**Expected:** A new 32-char automation-bypass secret is active; the previously-exposed value no longer bypasses Deployment Protection.
**Why human:** `lighthouse.yml` ran with `uploadArtifacts: true` before commit `8ddcce5`, writing the unredacted secret into downloadable public GitHub Actions artifacts (~90-day retention). The workflow fix is verified in code, but P01-008's residual action ("rotacao pendente") is not observable from the codebase. Until rotated, anyone who pulled those artifacts can reach protected preview/production deployments.

#### 2. Account 2FA

**Test:** Verify 2FA is enforced on the `Felipe-Salles` GitHub account and the `felipe-salles-projects` Vercel account.
**Expected:** Both require a second factor at login.
**Why human:** Not exposed to the OAuth token (`gh api user --jq .two_factor_authentication` → null). Documented as confirmed by Felipe 2026-09-09 (01-06-SUMMARY.md); no independent re-check possible.

#### 3. Spend cap and usage alerts

**Test:** Verify the Vercel project is on Hobby with no payment method and usage notifications are enabled at 75% / 100%.
**Expected:** Spend is structurally capped at $0 (project pauses at free-tier ceiling); alerts fire.
**Why human:** Dashboard-only billing state. Documented as `hobby-structural` in ROADMAP SEC-08 and accepted as P01-005 (explicitly weaker than Pro Spend Management).

### Gaps Summary

No blocking gaps. All five ROADMAP success criteria are achieved and independently re-verified against the codebase, the built output, the live GitHub branch-protection API, and the merged proof PR #1:

- Scaffold: Astro 7 static + Vercel adapter, `pnpm dev`/`build`, `astro check` clean, 0 functions (≤1 correct for Phase 1).
- Deploy pipeline: Git-integration preview deploys, production on merge, branch protection with three required checks, linear history, no force-push/deletion.
- Quality/security gates: `ci.yml` blocks on check/build/audit/dependency-review/JS-weight/Lighthouse; proven to block (3 deliberate failures) and pass (PR #1 green); `lighthouserc.json` enforces Perf/A11y/BP ≥95 + LCP/CLS/TBT/script-size budgets.
- Fonts self-hosted, zero Google Fonts, two preloads, metrics fallbacks; `RESEND_API_KEY` in `astro:env` secret schema, build output secret-clean.
- One design-token file, `inlineStylesheets: 'never'`, `BaseLayout.astro` + empty `vercel.json`, SEC-07 checklist + dated signed-off run with no open High finding.

Two scope items inside criterion 3 are **consciously deferred and documented**, not gaps: the Lighthouse SEO gate is `warn` (not `error`) in Phase 1 and is restored to `error` against production in Phase 6 (P01-004); the PERF-02 field-INP clause is deferred to post-launch Vercel Analytics monitoring and is explicitly never reported as met on the TBT number (P01-003).

Status is **human_needed** solely because three INFRA-10 / SEC-07 items are external-service / account state that cannot be verified from the repository — most importantly the pending rotation of a Deployment-Protection bypass secret that was briefly exposed in public CI artifacts (P01-008). These were human-executed and signed off by Felipe during the phase; this report asks for explicit confirmation that the bypass-secret rotation is complete before the exposure window (~90 days from 2026-09-10) is relied upon.

---

_Verified: 2026-09-10_
_Verifier: Claude (gsd-verifier)_
