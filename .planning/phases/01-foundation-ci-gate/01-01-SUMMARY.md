---
phase: 01-foundation-ci-gate
plan: 01
subsystem: infra
tags: [astro, vercel, pnpm, biome, prettier, fontsource, astro-env, typescript]

requires: []
provides:
  - "Astro 7 static project skeleton that installs with `pnpm install --frozen-lockfile` and syncs with `pnpm run check`"
  - "astro.config.mjs: output static + bare vercel() adapter + build.inlineStylesheets 'never' + RESEND_API_KEY server-secret schema + self-hosted Outfit/DM Sans font config"
  - "Pinned dependency set (astro 7.3.1, @astrojs/vercel 11.0.10, @vercel/analytics 2.0.1) with committed pnpm-lock.yaml"
  - "Root tooling config: biome.json, .prettierrc, .nvmrc, vercel.json ({}), expanded .gitignore"
  - "One-command scripts: dev, build, sync, check, format, lint"
  - "pnpm-workspace.yaml allowlist for the esbuild native postinstall"
affects: [styles-tokens-plan, placeholder-page-plan, gate-scripts-plan, ci-workflows-plan, phase-5-form, phase-7-csp]

tech-stack:
  added:
    - "astro@7.3.1"
    - "@astrojs/vercel@11.0.10"
    - "@vercel/analytics@2.0.1"
    - "@astrojs/check@0.9.10"
    - "typescript@5.9.3"
    - "@fontsource-variable/outfit@5.3.0"
    - "@fontsource/dm-sans@5.3.0"
    - "@biomejs/biome@2.5.12"
    - "prettier@3.9.6"
    - "prettier-plugin-astro@0.14.1"
    - "@lhci/cli@0.15.1"
  patterns:
    - "Exact version pins (no ^/~) except @astrojs/check@~0.9; lockfile committed; CI installs --frozen-lockfile"
    - "D-04 zero-comment convention applied to every config file"
    - "astro:env secret schema is the Phase 5 contract; declared with no value, validateSecrets left default false"
    - "Fonts self-hosted via the fontsource provider; cssVariable --font-display / --font-body injected for tokens.css to compose on"
    - "Biome owns ts/js/mjs/json/css; Prettier scoped to *.astro only"

key-files:
  created:
    - "package.json"
    - "pnpm-lock.yaml"
    - "pnpm-workspace.yaml"
    - "tsconfig.json"
    - "astro.config.mjs"
    - "vercel.json"
    - "biome.json"
    - ".prettierrc"
    - ".nvmrc"
  modified:
    - ".gitignore"

key-decisions:
  - "All pins resolved unchanged on the npm registry; no version deviations. @astrojs/check@~0.9 resolved to 0.9.10."
  - "pnpm-workspace.yaml added (not in plan files list) to allow the esbuild postinstall - pnpm 11 blocks build scripts by default and astro sync/check/build fail with ERR_PNPM_IGNORED_BUILDS otherwise."
  - "Biome configured with javascript.formatter.quoteStyle single and an `arquivos de design` exclusion so `biome check .` passes without altering the plan-mandated single-quote style in astro.config.mjs."
  - "sirv-cli deliberately not installed - the blocking Lighthouse gate runs against the real Vercel preview URL; the local static-server fallback can be run ad hoc via `pnpm dlx sirv-cli`."

patterns-established:
  - "Pattern 1: every version-controlled config file is comment-free (D-04)"
  - "Pattern 2: dependency pins are exact and lockfile-enforced (T-01-01 mitigation)"
  - "Pattern 3: server secrets declared in astro:env schema, never valued in-repo (T-01-02 mitigation)"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03, INFRA-05, INFRA-06]

duration: 30min
completed: 2026-09-08
---

# Phase 1 Plan 01: Project Skeleton & Root Config Summary

**Astro 7 static-to-Vercel skeleton with pinned deps, a bare vercel() adapter, external-only CSS, an astro:env RESEND_API_KEY server-secret schema, self-hosted Outfit/DM Sans, and Biome/Prettier/nvmrc/vercel.json root config.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-09-08 (resumed after an earlier quota interruption mid-Task-1)
- **Completed:** 2026-09-08T22:12:40Z
- **Tasks:** 3
- **Files modified:** 10 (9 created, 1 modified)

## Accomplishments

- `package.json` with the exact pinned stack, `pnpm-lock.yaml` committed, `node_modules/` populated; `pnpm install --frozen-lockfile` reproduces the tree cleanly.
- `astro.config.mjs`: `output: 'static'`, `adapter: vercel()` (no `webAnalytics`, no `imageService`), `build.inlineStylesheets: 'never'`, `RESEND_API_KEY` declared `context: 'server', access: 'secret'`, two `fontProviders.fontsource()` families with the UI-SPEC weight sets (Outfit 400/500/600/700, DM Sans 400/500 + italic), `display: 'swap'`, `optimizedFallbacks: true`. Loads without error; no `security`/CSP block; comment-free.
- Root config: `vercel.json` is exactly `{}`, `.gitignore` now excludes `node_modules/`, `dist/`, `.vercel/`, `.astro/`, `.lighthouseci/` (lockfile stays tracked), `biome.json` (Biome 2.5, formatter+linter, scoped to ts/js/mjs/json/css), `.prettierrc` (prettier-plugin-astro scoped to `*.astro`), `.nvmrc` = `24`.
- `package.json` scripts: `dev`, `build`, `sync`, `check` (`astro sync && astro check`), `format`, `lint`.
- `pnpm run check` exits 0 (only "Missing pages directory" warnings until plan 02 adds `src/`; zero config type errors).
- `pnpm exec biome check .` exits 0.

## Task Commits

1. **Task 1: Scaffold Astro project and install pinned dependency set** - `8fef040` (chore)
2. **Task 2: Author astro.config.mjs** - `8510d4b` (feat)
3. **Task 3: Author root config files and package.json scripts** - `6d70406` (chore)

## Files Created/Modified

- `package.json` - pinned deps, engines `>=22.12.0`, `packageManager: pnpm@11.15.1`, `private: true`, six one-command scripts
- `pnpm-lock.yaml` - committed lockfile
- `pnpm-workspace.yaml` - `onlyBuiltDependencies` / `allowBuilds` allowlist for the esbuild postinstall
- `tsconfig.json` - extends `astro/tsconfigs/strict`, keeps `.astro/types.d.ts` include
- `astro.config.mjs` - static output, vercel adapter, external CSS, env secret schema, self-hosted fonts
- `vercel.json` - `{}` placeholder (Phase 7 adds security headers)
- `biome.json` - Biome 2.5 lint/format config (ts/js/mjs/json/css; excludes `.astro` and `arquivos de design`; single-quote JS)
- `.prettierrc` - `prettier-plugin-astro`, `overrides` scoping Prettier to `*.astro`
- `.nvmrc` - `24`
- `.gitignore` - appended five build-artifact paths

## Installed Versions (exact)

| Package | Pin requested | Installed | Deviation |
|---------|---------------|-----------|-----------|
| astro | 7.3.1 | 7.3.1 | none (7.3.2 available, not taken) |
| @astrojs/vercel | 11.0.10 | 11.0.10 | none |
| @vercel/analytics | 2.0.1 | 2.0.1 | none |
| @astrojs/check | ~0.9 | 0.9.10 | none (range allowed by plan) |
| typescript | 5.x | 5.9.3 | none |
| @fontsource-variable/outfit | 5.3.0 | 5.3.0 | none |
| @fontsource/dm-sans | 5.3.0 | 5.3.0 | none |
| @biomejs/biome | 2.5.12 | 2.5.12 | none |
| prettier | latest | 3.9.6 | none |
| prettier-plugin-astro | 0.14.1 | 0.14.1 | none |
| @lhci/cli | 0.15.1 | 0.15.1 | none |

`packageManager` pinned to `pnpm@11.15.1` (matches local `pnpm --version`).

All pins were re-verified against the npm registry before install (`pnpm view <pkg> version`); every one resolved unchanged.

## Decisions Made

- **No version deviations.** Every pin resolved on the registry as-is.
- **`sirv-cli` omitted** (as the plan directs): the blocking Lighthouse gate targets the real Vercel preview URL, so a committed local static-server dependency is unnecessary; `pnpm dlx sirv-cli` covers ad hoc local runs.
- **`resend`, `zod`, `@astrojs/sitemap`, `@upstash/*`, `unlighthouse` not installed** - all deferred to their owning phases.
- No denylisted UI framework or animation library is present.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `pnpm-workspace.yaml` to allow the esbuild native postinstall**
- **Found during:** Task 1 (dependency install / `astro sync`)
- **Issue:** pnpm 11 blocks lifecycle build scripts by default. `esbuild@0.28.2` (transitive via Vite/Astro) landed in `ignoredBuilds`, and `astro sync` / `astro check` / `astro build` run an internal deps-status check that invokes `pnpm install` and exits non-zero with `ERR_PNPM_IGNORED_BUILDS`. The `pnpm` field in `package.json` is no longer read by pnpm 11, so the allowlist had to live in `pnpm-workspace.yaml`.
- **Fix:** Created `pnpm-workspace.yaml` with `onlyBuiltDependencies: [esbuild]`; ran `pnpm approve-builds --all` to execute the postinstall (pnpm then also recorded `allowBuilds: { esbuild: true }` in the same file). esbuild's postinstall is a legitimate native-binary step for a first-party build tool (same category as the `sharp` postinstall the threat model already accepts).
- **Files modified:** `pnpm-workspace.yaml` (new)
- **Verification:** `pnpm install --frozen-lockfile` exits 0; `pnpm run check` (`astro sync && astro check`) exits 0.
- **Committed in:** `8fef040` (Task 1 commit)

**2. [Rule 3 - Blocking] Reordered the two imports in `astro.config.mjs`**
- **Found during:** Task 3 (`biome check .` acceptance criterion)
- **Issue:** Biome's `assist/source/organizeImports` requires alphabetically sorted import sources, so `import vercel from '@astrojs/vercel'` must precede `import { ... } from 'astro/config'`. The RESEARCH Pattern 1 sample had them in the reverse order. `biome check .` (Task 3 acceptance) failed.
- **Fix:** Swapped the two import lines. No Task 2 acceptance criterion checks import order; all Task 2 greps and the config-load verify still pass.
- **Files modified:** `astro.config.mjs`
- **Verification:** `pnpm exec biome check .` exits 0; Task 2 automated verify (`c.output === 'static'`, `c.build.inlineStylesheets === 'never'`, `c.fonts.length === 2`, `c.env.schema.RESEND_API_KEY`) still passes; comment-free grep still passes.
- **Committed in:** `6d70406` (Task 3 commit)

**3. [Rule 3 - Blocking] Biome config tuned to pass on the plan-mandated code style**
- **Found during:** Task 3 (`biome check .` acceptance criterion)
- **Issue:** Default Biome wanted double quotes in `astro.config.mjs`, but Task 2's committed acceptance criteria mandate single quotes (`grep -q "output: 'static'"`, etc.). Biome also lints `arquivos de design/*.js` (design-editor runtime, not production code) via `**/*.js`, and `linter.rules.recommended` + `!**/dir/**` folder-ignore syntax are deprecated in Biome 2.5.
- **Fix:** `biome.json` set `javascript.formatter.quoteStyle: "single"`, excluded `arquivos de design` and the build-artifact folders with the 2.2+ `!**/dir` syntax, and dropped the deprecated `linter.rules.recommended` block (recommended rules are on by default).
- **Files modified:** `biome.json`
- **Verification:** `pnpm exec biome check .` exits 0 across all 6 tracked config files.
- **Committed in:** `6d70406` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 3 - blocking). One new file (`pnpm-workspace.yaml`) beyond the plan's `files_modified` list.
**Impact on plan:** All three were prerequisites for the plan's own verification (`pnpm run check`) and Task 3's `biome check .` acceptance to pass. No scope creep, no functional change to the shipped config surface.

## Issues Encountered

- `astro check` also scans `arquivos de design/support.js` (via `tsconfig.json` `include: ["**/*"]`) and prints 2 TS hints (`ts(80006)`). Exit code is still 0 and these are design-editor files, not production code. Left as-is because the plan says `tsconfig.json` takes no manual edits beyond the scaffold output. A later plan may add an `exclude` if the noise matters.

## Known Stubs

- `vercel.json` is `{}` by design (plan success criterion 5). Security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors) are owned by Phase 7. Not a data stub.

## User Setup Required

None - no external service configuration required in this plan. (`RESEND_API_KEY` value and Vercel/GitHub dashboard hardening belong to later plans in this phase and Phase 5.)

## Next Phase Readiness

- The project installs, `astro sync` generates virtual types, and `astro check` passes with zero errors - ready for plan 02 to author `src/styles/tokens.css`, `src/styles/base.css`, `BaseLayout.astro`, and `src/pages/index.astro` against the injected `--font-display` / `--font-body` variables.
- `build.inlineStylesheets: 'never'` and the `RESEND_API_KEY` schema are in place for the plan-03 gate scripts and Phase 5.
- Branch is still `master` (rename to `main` is owned by plan 01-05).
- No `src/pages` yet, so `pnpm build` is intentionally not runnable until plan 02.

## Self-Check: PASSED

All 9 created config files exist on disk; the SUMMARY exists; all three task commits (`8fef040`, `8510d4b`, `6d70406`) are present in git history.

---
*Phase: 01-foundation-ci-gate*
*Completed: 2026-09-08*
