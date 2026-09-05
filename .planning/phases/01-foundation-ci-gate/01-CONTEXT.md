# Phase 1: Foundation & CI Gate - Context

**Gathered:** 2026-09-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the project skeleton that builds and deploys, plus every quality
and security gate that later phases run against:

- Astro 7 static scaffold (`output: 'static'`) + `@astrojs/vercel` adapter, with
  exactly one serverless-function boundary reserved (not yet implemented) for the
  future `/api/orcamento` form endpoint.
- `pnpm dev` / `pnpm build` working; `astro check` passing.
- Self-hosted Outfit + DM Sans via the Astro Fonts API (Fontsource provider);
  Google Fonts CDN and its two `preconnect`s removed; metrics-adjusted fallbacks;
  `preload` on the two critical font files.
- One design-token CSS custom-properties file consumed by all components;
  `build.inlineStylesheets: 'never'`.
- `BaseLayout.astro` rendering a **minimal placeholder** page (`<main>` with an
  `<h1>` and the Core Value tagline) — enough to deploy and score Lighthouse.
- Empty `vercel.json`.
- Server secrets declared in the `astro:env` secret schema (`RESEND_API_KEY` and
  any other server secrets); CI grep of `dist/` for secret names and `re_` returns
  nothing.
- Vercel Web Analytics wired into `BaseLayout` from this phase.
- GitHub repo (public) + Vercel project: Git-integration preview deploy on every
  push/PR, production branch `main` deploys live, account hardening (2FA,
  protected production branch, Deployment Protection on previews, scoped secret
  env vars, hard spend cap + usage alerts).
- CI pipeline blocking merge on: `astro check`, build, `pnpm audit`, GitHub
  Dependency Review, landing-route JS-weight budget (<20 KB, no UI framework / no
  animation library), Lighthouse mobile (preset mobile, 4x CPU, Slow 4G) <95 in
  Performance / SEO / Best Practices / Accessibility, and Web Vitals budgets
  (LCP <2.5 s, CLS <0.05, TBT <200 ms, INP <200 ms).
- The SEC-07 security-review checklist artifact (template + per-phase run) with
  `scripts/security-check.sh`; first run passes with no open High finding.

**Not in this phase:** the 9 design sections (Phase 3), content collections
(Phase 2), form markup or endpoint logic (Phase 5), the strict CSP and full
security-header set (Phase 7), SEO metadata / structured data / favicons / OG
image (Phase 6), the progressive-enhancement effects (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Git host & repository
- **D-01:** Git host is **GitHub**. Repo is **public** — on the free plan this is
  what makes branch protection and GitHub Dependency Review available without
  GitHub Pro/Advanced Security. No secrets live in the code (all server secrets
  are Vercel env vars).
- **D-02:** Production branch is **`main`**. Rename the local `master` → `main`
  before the first push. All GSD/roadmap references already assume `main`.
- **D-03:** Claude creates the remote repo via the `gh` CLI (authenticated on this
  machine as GitHub account **`Felipe-Salles`**), pushes, and walks Felipe through
  the Vercel-dashboard steps (project link, env vars, Deployment Protection, spend
  cap) — those require his login. Claude asks for approval before each
  irreversible action (repo creation, first push, branch rename).
- **D-04 (project-wide convention):** **Zero comments in any version-controlled
  file** — `.astro`, `.ts`, `.js`, `.mjs`, `.css`, `.json`, YAML, CI workflows,
  `vercel.json`, everything. Code must be self-explanatory through naming.
  Rationale / long-form docs go in `.planning/` or the README, never inline. This
  applies to every phase, not just Phase 1.

### Analytics
- **D-05:** Analytics ships **in Phase 1**, included in `BaseLayout`, so the CI
  JS-weight budget and Lighthouse gate measure the real production script from the
  first deploy (no later regression surprise).
- **D-06:** Tool is **Vercel Web Analytics** (`@vercel/analytics` 2.x): cookieless,
  same-origin beacon (`/_vercel/insights/*`), no new CSP origin, no consent
  banner. Use the Astro component/script include, not the adapter's legacy
  `webAnalytics` option.
- **D-07:** **No** Vercel Speed Insights in Phase 1 — revisit post-launch if
  ongoing field telemetry is wanted.

### Phase 1 deployable content
- **D-08:** The root page at the end of Phase 1 is a **minimal placeholder**:
  `BaseLayout` + `<main>` containing an `<h1>` and the Core Value tagline, already
  using the design tokens, self-hosted fonts, and the dark background
  (`#0A0A12`). Phase 3 replaces the `<main>` body with the real sections. No
  skeleton header/nav/footer and no "coming soon" holding page.
- **D-09:** The real domain stays **closed to the public** during Phases 1–7 —
  only the Deployment-Protection-gated preview URL is used while building; the
  domain is pointed at the site only when v1 is approved. So the minimal
  placeholder is never seen by a client or indexed by Google.

### SEC-07 security checklist artifact
- **D-10:** **Template + per-phase run** layout: one versioned gabarito at
  `.planning/security/SECURITY-CHECKLIST.md`; each phase gets a dated run file at
  `.planning/security/runs/phase-NN.md` with items checked and findings recorded.
  Repo-only (no external surface).
- **D-11:** Mechanical checks are a single script, **`scripts/security-check.sh`**,
  that runs `pnpm audit`, grep for new inline surface (`style="`, inline
  `<script>`/`<style>`), `curl -I` header inspection, `dist/` secret scan
  (secret names + `re_`), single-Function count, and the Lighthouse gate —
  printing PASS/FAIL. **CI runs the same script** so it is a real gate. The phase
  run file appends the script output and answers the judgement-only items by hand
  (e.g. "every new dependency justified in the phase notes?").
- **D-12:** Findings are a **table with a fixed owner**: ID, description, severity
  (Low/Med/High), status, action, target date. Owner defaults to **Felipe
  Salles** (solo project). The hard rule "no phase closes with an open High
  finding" sits at the top of the gabarito.
- **D-13:** The Phase 1 gabarito implements **exactly the SEC-07 item list from
  REQUIREMENTS.md**. Later phases append phase-specific items (Phase 5: email
  field escaping + CR/LF strip + rate-limit behaviour; Phase 7: CSP directives +
  `securityheaders.com` grade).

### Claude's Discretion
Planner / researcher decide, unless they surface a real trade-off for Felipe:
- Exact pinned versions (follow the CLAUDE.md Technology Stack table).
- Whether Lighthouse CI runs against the live Vercel preview URL or a local
  `astro preview` server in the CI job (note: Deployment Protection on previews
  can block an external Lighthouse runner — factor this in).
- Scope/shape of the design-token file beyond the confirmed palette + font
  families + `font-display` + fallback metrics (spacing scale, radii, shadows,
  type scale, z-index, light/dark section tokens).
- `pnpm` vs `npm` — CLAUDE.md and the roadmap success criteria say `pnpm` (commit
  `pnpm-lock.yaml`); treat as the default unless Felipe asks otherwise.
- CI provider mechanics (GitHub Actions assumed), job matrix, caching.
- The exact spend-cap amount and env-var grouping (confirm the number with Felipe
  during execution).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stack & prescriptive guidance
- `CLAUDE.md` § "Technology Stack" / "TL;DR (prescriptive)" / "Recommended Stack"
  / "Installation" / "The two tensions" / "What NOT to Use" / "Version
  Compatibility" — near-locked stack: Astro 7.3.x, `@astrojs/vercel` 11.x,
  `output: 'static'`, Astro Fonts API + Fontsource, Vercel Web Analytics 2.x,
  Biome 2.x + Prettier (`prettier-plugin-astro`), `@lhci/cli`, pnpm 9.x, Node
  24.x on Vercel. Pinned versions and rejected alternatives are listed there.
- `CLAUDE.md` § "Project" / "Constraints" — Core Value, tech/hosting/perf/
  security/a11y/i18n/LGPD constraints.

### Project planning docs
- `.planning/PROJECT.md` — what the site is, active requirements, out-of-scope
  list, Context (design tokens, real contact info, animation patterns), Key
  Decisions table.
- `.planning/REQUIREMENTS.md` § "Infraestrutura & Build (INFRA)" (INFRA-01..10),
  § "Performance (PERF)" (PERF-01..04), § "Segurança (SEC)" SEC-07 — the exact
  wording Phase 1 must satisfy; SEC-07 item list feeds the checklist gabarito.
- `.planning/ROADMAP.md` § "Phase 1: Foundation & CI Gate" — goal + 5 success
  criteria; § "Residual Risk Statement (SEC-08)" for context on why the gates are
  front-loaded.
- `.planning/STATE.md` § "Accumulated Context" / "Open Decisions To Resolve
  Before Their Phase" — carries the analytics pick and Phase 5 rate-limiter
  decision.

### Design reference
- `arquivos de design/Dmarques Landing.dc.html` — the design source. Tokens: bg
  `#0A0A12` / `#05050A`, accent `#6C4CFF`, light accent `#9A85FF`, light bg
  `#F2F3F6` / `#F7F8FA`; fonts Outfit (300–800) + DM Sans; keyframes `dmFloat` /
  `dmPulse`. **`image-slot.js` and `support.js` are design-editor runtime, not
  production code** — do not ship them. The file's inline styles and Google Fonts
  `<link>` are what Phase 3 / Phase 1 respectively remove.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield. No `src/`, no `package.json`, no `astro.config.*` yet. Only
  `CLAUDE.md`, `.planning/`, and `arquivos de design/` exist.

### Established Patterns
- None in code yet. The CLAUDE.md Technology Stack section is the de-facto pattern
  source for this phase.

### Integration Points
- The single reserved serverless-function boundary is where Phase 5's
  `/api/orcamento` (`export const prerender = false`) will attach — Phase 1 only
  reserves it (adapter configured, no route file).
- `astro:env` secret schema is the contract Phase 5 consumes for `RESEND_API_KEY`
  and any Upstash keys.
- The design-token CSS file is the contract Phase 3 consumes when converting the
  design's inline styles.

### Environment facts (verified 2026-09-05)
- Git repo exists locally, branch `master`, **no remote configured**.
- `gh` CLI 2.96.0 authenticated as GitHub account `Felipe-Salles`; token scopes
  `gist, read:org, repo`. **Missing the `workflow` scope** — pushing
  `.github/workflows/*` files will fail until the token is re-scoped
  (`gh auth refresh -s workflow`).
- Branch protection via API on a **public** repo is available on the free plan;
  it would not be on a private free repo.
- Domain `agenciadmarques.com.br` is registered; DNS is at **GoDaddy**.
- **Domain mismatch:** CLAUDE.md and REQUIREMENTS.md TRUST-01 mention
  `dmarques.com.br` / `felipe@dmarques.com.br` as a hypothesis. The real domain
  is `agenciadmarques.com.br`. Downstream phases (canonical URLs, OG tags,
  JSON-LD `url`/`sameAs`, `site` in `astro.config`, Resend sending domain) must
  use `agenciadmarques.com.br`.

</code_context>

<specifics>
## Specific Ideas

- Minimal placeholder page = `<h1>` + the Core Value line ("Um visitante entende
  em segundos o que a Dmarques faz, confia na agência e pede um orçamento — com
  um site que carrega rápido e nunca sai do ar."), dark background, self-hosted
  fonts, tokens applied. Deliberately no nav/header/footer.
- Security checklist gabarito opens with the hard rule "nenhuma fase fecha com
  achado High em aberto".
- `scripts/security-check.sh` is shared between local runs and CI — one source of
  truth for the mechanical checks.

</specifics>

<deferred>
## Deferred Ideas

- **Skeleton header/nav/footer shells** — considered for the Phase 1 page,
  deferred to Phase 3 where the real sections and NAP land.
- **"Em breve" holding page** — only worth it if the domain were public during
  development; it is not (D-09), so skipped.
- **Vercel Speed Insights** — considered for Phase 1, deferred to post-launch
  (optional field CWV telemetry).
- **DNS TTL lowering / Resend sending-domain SPF·DKIM·DMARC** on
  `agenciadmarques.com.br` — belongs to Phase 5 (SEC-08 / SEC-09), noted here so
  the domain fact is not lost.
- **Domain cutover (point `agenciadmarques.com.br` at Vercel)** — happens at v1
  approval, after Phase 7.
- **Re-scope the `gh` token with `workflow`** — a setup prerequisite, handled
  during execution, not a scope change to the phase.

</deferred>

---

*Phase: 1-foundation-ci-gate*
*Context gathered: 2026-09-05*
