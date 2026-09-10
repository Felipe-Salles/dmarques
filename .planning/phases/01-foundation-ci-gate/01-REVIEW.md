---
phase: 01-foundation-ci-gate
reviewed: 2026-09-10T00:00:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - .gitattributes
  - .github/workflows/ci.yml
  - .github/workflows/lighthouse.yml
  - .gitignore
  - .nvmrc
  - .prettierrc
  - README.md
  - astro.config.mjs
  - biome.json
  - lighthouserc.json
  - package.json
  - pnpm-workspace.yaml
  - scripts/js-weight-check.sh
  - scripts/security-check.sh
  - src/layouts/BaseLayout.astro
  - src/pages/index.astro
  - src/styles/base.css
  - src/styles/tokens.css
  - tsconfig.json
  - vercel.json
findings:
  critical: 3
  warning: 13
  info: 7
  total: 23
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-09-10
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

Phase 1 ships the Astro 7 + Vercel scaffold, design tokens, a placeholder page, two
gate shell scripts, and two GitHub Actions workflows. The scaffold itself
(`astro.config.mjs`, tokens, `BaseLayout`, `index.astro`) is clean and builds to
static HTML as intended. The **enforcement mechanism is where the defects
concentrate**, exactly the area the phase brief asked to scrutinise:

- The JS-weight gate (`js-weight-check.sh`) **cannot see inline `<script>` blocks at
  all**. The current build already ships ~2.5 KB of uncounted inline JS (Vercel
  Analytics) and the gate reports `total=0 → PASS`. Lighthouse's
  `resource-summary:script:size` assertion has the same blind spot, so *no* layer
  measures inline JS.
- Two separate code paths persist the Vercel protection-bypass secret into
  Lighthouse output — one into a downloadable CI artifact, one into LHCI's default
  public storage.
- Several gate checks are string/line-fragile (`grep`-based CSS-inline detection,
  `style="` scan, secret-name scan) and will either false-PASS or false-FAIL in
  predictable near-future situations (multi-line style, Phase-5 form function).

No structural pre-pass (`<structural_findings>`) was supplied.

## Critical Issues

### CR-01: JS-weight gate ignores inline `<script>` — budget check passes vacuously

**File:** `scripts/js-weight-check.sh:32-49`
**Issue:** The script only collects scripts that have a `src="....js"` attribute
(line 35) plus `modulepreload` hrefs (line 40). The built landing page
(`.vercel/output/static/index.html`) contains **no external script** and one
**inline `<script type="module">`** (~2.5 KB, the `@vercel/analytics` loader). The
loop on line 43 iterates over an empty set, `total` stays `0`, and `0 -gt 20480`
is false, so the gate prints `PASS: peso de JS dentro do orcamento` while shipping
uncounted JS. Additionally, line 45 (`[ -f "$f" ] || continue`) silently skips any
referenced script whose path does not resolve, so even external JS is
under-counted without warning if Astro's output layout differs from the assumed
`"$OUT_DIR/${rel#/}"`.

This is the project's primary JS budget enforcement and it does not enforce.
Note that `lighthouserc.json`'s `resource-summary:script:size` also excludes
inline script bytes (Lighthouse attributes them to the `document` bucket), so
there is no compensating control.

**Fix:** Parse and measure inline `<script>` blocks too, and fail loudly when a
referenced external file cannot be found.
```bash
# after the SCRIPTS / MODULEPRELOADS loop, add inline <script> bytes:
inline_bytes=$(
  perl -0777 -ne 'while(/<script(?![^>]*\bsrc=)[^>]*>(.*?)<\/script>/gis){print $1}' "$INDEX" \
    | gzip -c | wc -c
)
echo "  <script> inline  ${inline_bytes} B gz"
total=$((total + inline_bytes))

# in the resolve loop, replace silent skip with a hard failure:
if [ ! -f "$f" ]; then
  echo "FAIL: script referenciado nao encontrado: $rel (resolvido para $f)"
  exit 1
fi
```
Also add an assertion: if `SCRIPTS`/`MODULEPRELOADS` were non-empty but zero files
were measured, exit non-zero.

### CR-02: `security-check.sh` uploads the Vercel bypass secret to LHCI public storage

**File:** `scripts/security-check.sh:117-129`
**Issue:** When `PREVIEW_URL` and `VERCEL_AUTOMATION_BYPASS_SECRET` are both set
(the mode the script documents for checks 6/7), line 122 injects the secret as
`--collect.settings.extraHeaders='{"x-vercel-protection-bypass":"<secret>"}'` and
line 124 runs `pnpm exec lhci autorun`. `lighthouserc.json` has **no `upload`
section**, and `lhci autorun`'s default upload target is
`temporary-public-storage` — a world-readable Google Cloud Storage bucket. The
uploaded Lighthouse report (`lhr-*.json`) contains `configSettings.extraHeaders`,
which is **not redacted**, so the bypass secret is published to a public URL. An
attacker with that token can reach protected preview deployments.

**Fix:** Never let `autorun` upload, and/or keep the secret out of persisted
config. Minimum:
```bash
lhci_args+=(--upload.target=filesystem --upload.outputDir="$RUNNER_TEMP/lhci")
# or run the phases explicitly: lhci collect ... && lhci assert ...  (no upload)
```
Add an `upload` block to `lighthouserc.json` pinning `target: "filesystem"` so a
bare `autorun` can never fall back to public storage.

### CR-03: `lighthouse.yml` persists the bypass secret into a downloadable CI artifact

**File:** `.github/workflows/lighthouse.yml:21-26`
**Issue:** Step "Verify protection-bypass..." writes
`lighthouserc.ci.json` with `.ci.collect.settings.extraHeaders` set to the bypass
secret (line 21). The `treosh/lighthouse-ci-action@v12` step then runs with
`uploadArtifacts: true` (line 26), which uploads the `.lighthouseci/` directory as
a workflow artifact. Every `lhr-*.json` in it carries
`configSettings.extraHeaders` verbatim, so `VERCEL_AUTOMATION_BYPASS_SECRET` is
downloadable by anyone with repo (or artifact-API) access for the retention
period. Secrets must never land in build artifacts.

**Fix:** Drop `uploadArtifacts: true` (or set it `false`), or pass the header via
the action's own input / an env indirection rather than baking it into a persisted
config file, and scrub `extraHeaders` from any report before upload:
```yaml
      - uses: treosh/lighthouse-ci-action@<pinned-sha>
        with:
          urls: ${{ github.event.deployment_status.target_url }}
          configPath: ${{ runner.temp }}/lighthouserc.ci.json
          uploadArtifacts: false
```

## Warnings

### WR-01: Toolchain / action versions are ahead of any known release

**File:** `.github/workflows/ci.yml:14-16,31-32`, `package.json:6`
**Issue:** `actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6`,
`actions/dependency-review-action@v5.0.0` are 1–3 major versions beyond the latest
published releases as of this review, while the same workflow pins a real
`treosh/lighthouse-ci-action@v12`. `package.json` pins
`"packageManager": "pnpm@11.15.1"` (pnpm is at 9.x; CLAUDE.md's stack says
"pnpm 9.x"). If any action tag or the Corepack `pnpm@11.15.1` spec fails to
resolve, the entire `ci` workflow errors before a single check runs — the phase's
whole deliverable becomes a no-op.
**Fix:** Verify each tag against the Marketplace / npm and pin to a resolvable
version (ideally a full commit SHA for the actions). Reconcile the pnpm major with
CLAUDE.md.

### WR-02: `security-check.sh` check 3 CSS-inline detection is line-based and greedy

**File:** `scripts/security-check.sh:68-81`
**Issue:** `grep -oE '<style[^>]*>.*</style>'` only matches when a full
`<style>…</style>` pair sits on one line. Astro's Fonts API blocks are currently
single-line so it works today, but: (a) any **multi-line** `<style>` content
(offending or not) is never matched → silent PASS; (b) with multiple `<style>`
blocks on one line the greedy `.*</style>` spans from the first `<style>` to the
last `</style>`, pulling intervening markup (`<link rel="preload">`) into the
buffer → risk of false FAIL. The whitelist `s/:root\{--font-[^}]*\}//g` is also
tightly coupled to the exact Fonts API emission shape.
**Fix:** Strip newlines first (`tr '\n' ' ' < "$hf" | grep -oE ...`) and match
non-greedily, or use a real HTML-aware extractor. Anchor the whitelist to
`@font-face` blocks and `:root` blocks containing only `--font-*` declarations,
tested after normalisation.

### WR-03: check 4 scans function bundles for the secret *name* → false CI failure in Phase 5

**File:** `scripts/security-check.sh:84-96`
**Issue:** `scan_targets` includes `.vercel/output` (superset of the static dir,
including `functions/`), and the pattern matches the literal `RESEND_API_KEY`. The
Phase-5 contact-form serverless function will legitimately contain that identifier
(`process.env.RESEND_API_KEY` / `getSecret('RESEND_API_KEY')`), so this check will
start failing CI on correct code. It conflates the secret's *name* with its
*value*.
**Fix:** Scan only client-shipped assets (`$STATIC_DIR`, excluding `functions/`)
and only for the value pattern (`re_[A-Za-z0-9_-]{20,}`). Drop `RESEND_API_KEY`
from the client-asset scan or restrict it to `$STATIC_DIR`.

### WR-04: check 2 `style="` scan is trivially bypassable and can false-positive

**File:** `scripts/security-check.sh:39`
**Issue:** `grep -rn 'style="' src/` misses `style='...'`, `style = "`, and
`:style=`; it also has no `-I` / `--include` filter, so it can match attribute
selectors inside `src/styles/*.css` (`[style="x"]`) or `style="` inside a JS
string literal in an `.astro` `<script>`, producing false FAILs, and will emit
"Binary file matches" noise once `src/` holds images.
**Fix:**
```bash
grep -rnI --include='*.astro' --include='*.ts' --include='*.tsx' \
  -E "style[[:space:]]*=[[:space:]]*[\"']" src/
```

### WR-05: Biome does not lint `.astro` files — the files that will hold all logic

**File:** `biome.json:15`
**Issue:** `"!**/*.astro"` removes every `.astro` file from Biome's scope, and
Prettier (`.prettierrc`) only *formats* them. CLAUDE.md states all interactive JS
will live in bundled `.astro` `<script>` modules. Those get zero lint coverage:
no unused-variable, no dead-code, no `noConsole`, no `no-comments` enforcement —
despite the project's "no code comments" rule.
**Fix:** Enable Biome's partial `.astro` support (lint `<script>`/`<style>`
regions) or add `eslint-plugin-astro` for `.astro` only, and turn on `noConsole`
/ comment rules in `linter.rules`.

### WR-06: `lighthouserc.json` downgrades SEO to `warn`, contradicting the ≥95 requirement

**File:** `lighthouserc.json:19`, `src/layouts/BaseLayout.astro:12-18`
**Issue:** CLAUDE.md requires "Lighthouse ≥ 95 em todas as categorias", but
`categories:seo` is `["warn", { "minScore": 0.95 }]` while performance,
best-practices, and accessibility are `error`. Combined with `BaseLayout` having
no `<meta name="description">`, no `<link rel="canonical">`, and no Open Graph
tags, SEO regressions will not block CI.
**Fix:** Promote `categories:seo` to `error`, and add a description/canonical (and
a `title`-driven `<meta property="og:title">`) to `BaseLayout`.

### WR-07: DM Sans italic is shipped but never used

**File:** `astro.config.mjs:32`
**Issue:** `styles: ['normal', 'italic']` for DM Sans produces two extra italic
`.woff2` files plus italic `@font-face` + fallback-metric rules in the inline
font CSS on every page (confirmed in the built `index.html`). Nothing in
`tokens.css` / `base.css` / `index.astro` uses italic. This works against the
"fontes minimais" / Lighthouse-perf constraint.
**Fix:** `styles: ['normal']` until an italic style is actually needed.

### WR-08: `@fontsource-variable/outfit` and `@fontsource/dm-sans` are unused dependencies

**File:** `package.json:26-27`
**Issue:** Fonts are resolved via `fontProviders.fontsource()` in
`astro.config.mjs`, which fetches metadata/files from the Fontsource API at build
time; it does not import the `@fontsource*` npm packages. Nothing else references
them. They are dead devDependencies that enlarge the tree `pnpm audit` /
`dependency-review` must cover (contra "keep the dependency tree small"). The
`-variable` package is also inconsistent with the static weight list `[400, 500,
600, 700]` in config.
**Fix:** Remove both, or document them explicitly as the staged Fonts-API
fallback and wire a real import path.

### WR-09: `tsconfig.json` type-checks build output and design assets

**File:** `tsconfig.json:3-4`
**Issue:** `"include": ["**/*"]` with only `"exclude": ["dist"]` means `astro
check` walks `.vercel/output/`, `.lighthouseci/`, and `arquivos de design/`.
Minified bundles under `.vercel/output/_astro/` can produce spurious parser/type
errors and slow checks.
**Fix:** `"exclude": ["dist", ".vercel", ".lighthouseci", "arquivos de design"]`.

### WR-10: `dependency-review` cannot post its summary — missing `pull-requests: write`

**File:** `.github/workflows/ci.yml:6-7,33-35`
**Issue:** Workflow-level `permissions:` grants only `contents: read`, but the
`dependency-review-action` step sets `comment-summary-in-pr: on-failure`, which
requires `pull-requests: write`. The comment will silently fail to post (action
logs a warning). The severity gate still works via exit code, but the intended
reviewer feedback is lost.
**Fix:** Add a job-scoped `permissions: { contents: read, pull-requests: write }`
to `dependency-review`, or drop `comment-summary-in-pr`.

### WR-11: Lighthouse gate silently no-ops if the deployment environment string differs

**File:** `.github/workflows/lighthouse.yml:9`
**Issue:** `contains(github.event.deployment_status.environment, 'Preview')` is a
case-sensitive substring test. If Vercel emits `preview` / `Preview – <project>`
/ a localized value, the job is skipped with no signal, so preview deploys ship
without ever running the Lighthouse gate. The trigger also depends on Vercel
creating GitHub Deployments at all.
**Fix:** Lowercase-compare
(`contains(fromJSON('["preview"]'), ...)` after `toLower`), or match on
`github.event.deployment_status.environment_url` presence, and add a scheduled
sanity check that the workflow actually ran for recent preview deploys.

### WR-12: Third-party and first-party Actions pinned by mutable tags

**File:** `.github/workflows/ci.yml:14,15,16,31,32`, `.github/workflows/lighthouse.yml:12,22`
**Issue:** Every `uses:` references a moving major tag (`@v7`, `@v6`, `@v12`).
The project's security posture ("dependências auditadas", "nenhum pode alterar o
site") calls for supply-chain pinning. A compromised or force-pushed tag would run
arbitrary code in CI with repo credentials.
**Fix:** Pin every action to a full-length commit SHA with a trailing version
comment, and enable Dependabot for `github-actions`.

### WR-13: `js-weight-check.sh` denylist gaps and cwd-relative `require`

**File:** `scripts/js-weight-check.sh:57`
**Issue:** The `node -e` denylist misses the Astro UI integrations
(`@astrojs/react|vue|svelte|preact|solid`), plus `alpinejs`, `htmx.org`, `lit`,
`petite-vue`, `stimulus` — all "frameworks de UI" the constraint forbids. It also
does `require("./package.json")`, resolved against the current working directory
rather than the script/repo root, so the check breaks if invoked from elsewhere.
**Fix:** Extend the regex (`@astrojs/(react|preact|vue|svelte|solid)|alpinejs|htmx\.org|lit|petite-vue|@hotwired/stimulus`)
and resolve the manifest relative to the script:
`require(require("path").join(__dirname,"..","package.json"))`.

## Info

### IN-01: `pnpm audit` runs twice in CI

**File:** `.github/workflows/ci.yml:24`, `scripts/security-check.sh:29`
**Issue:** `ci.yml` runs `pnpm audit --audit-level=high` as its own step, then
`security-check.sh --ci` runs it again (check 1). The second run is redundant and,
because a failing earlier step aborts the job, unreachable on the failure path.
**Fix:** Drop check 1 from the CI path (keep it for local runs), or remove the
standalone step.

### IN-02: `BaseLayout.astro` has no `Props` interface

**File:** `src/layouts/BaseLayout.astro:7`
**Issue:** `const { title = '…' } = Astro.props;` with no `interface Props` means
`title` is `any` under `astro/tsconfigs/strict`.
**Fix:** Declare `interface Props { title?: string }`.

### IN-03: Skip-link target exists with no skip link

**File:** `src/pages/index.astro:6`, `src/styles/tokens.css:104`
**Issue:** `<main id="conteudo">` is a skip-link anchor and `--z-skiplink: 100`
is defined, but no "pular para o conteúdo" link is rendered. Keyboard-navigation
accessibility requirement in CLAUDE.md.
**Fix:** Add a visually-hidden-until-focus skip link at the top of `<body>` in
`BaseLayout`.

### IN-04: `.gitignore` will also ignore a future `.env.example`

**File:** `.gitignore:7`
**Issue:** `.env*` matches `.env.example`. Phase 5 will want a committed example
file for onboarding.
**Fix:** Add `!.env.example` after the `.env*` line.

### IN-05: Stale `dist/` build present; script fallback may measure it

**File:** `scripts/js-weight-check.sh:15`
**Issue:** Both `dist/` and `.vercel/output/static/` contain full builds. The
Vercel adapter writes to `.vercel/output`; `dist/` is stale. The fallback branch
lists `dist` as a candidate, so if `.vercel/output/static` is ever absent the gate
silently measures a stale build.
**Fix:** `rm -rf dist` in the build script, or drop `dist` from the candidate
list.

### IN-06: `@astrojs/sitemap` not installed despite `site` being set

**File:** `astro.config.mjs:5`, `package.json:18-22`
**Issue:** `site` is configured and CLAUDE.md lists `@astrojs/sitemap@3.7.x`, but
no sitemap integration is present, so `sitemap.xml` is not generated. Likely
deferred, but worth tracking against the SEO requirement.
**Fix:** Add the integration in the phase that owns SEO, or note the deferral.

### IN-07: README command table omits `pnpm sync`

**File:** `README.md:24-31`
**Issue:** `package.json` defines a `sync` script that the table does not list.
Minor doc drift.
**Fix:** Add the row or fold it into the `check` description note.

---

_Reviewed: 2026-09-10_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
