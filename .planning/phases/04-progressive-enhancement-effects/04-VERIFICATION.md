---
phase: 04-progressive-enhancement-effects
verified: 2026-09-17T15:58:31Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
---

# Phase 4: Progressive-Enhancement Effects Verification Report

**Phase Goal:** The design's motion behaviors are layered on as small hand-rolled vanilla islands that degrade cleanly and never regress performance or accessibility.
**Verified:** 2026-09-17T15:58:31Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Scroll reveal runs from a single `IntersectionObserver` (`rootMargin: 0px 0px -8% 0px`, `threshold: 0.08`) that unobserves each element after firing, with a ~2.6s fallback | VERIFIED | `src/scripts/reveal.ts` contains exactly these literals; live CDP Measurement A (04-04-SUMMARY.md) showed 0/26 revealed at load (viewport-height explained, not a bug — filed `P04-006`) and 26/26 at 3s, proving the fallback. Code inspected directly, matches plan verbatim. |
| 2 | Cursor glow follows the pointer via `pointermove` + `requestAnimationFrame`, is `aria-hidden` + `pointer-events:none`, activates only on `pointer:fine` with `prefers-reduced-motion:no-preference` | VERIFIED (see WARNING below) | `src/scripts/glow.ts` and `BaseLayout.astro`'s `.cursor-glow` div/style inspected directly — dual gate, single listener, `pointer-events:none`, `aria-hidden="true"` all present. CDP Measurement B confirmed `display:block` on desktop and `display:none` + frozen `transform` under reduced-motion and coarse-pointer. **Independent code review (`04-REVIEW.md` WR-01) found a real bug**: the rAF throttle paints the *first* pointer position of each pending batch, not the latest — fast mouse movement lags visibly behind the true cursor. Glow does follow the cursor (truth holds), but with a measurable, unfixed fidelity defect. |
| 3 | Particle canvas pauses via IntersectionObserver off-screen and on `document.hidden`, caps DPR at ~1.5, scales point count to viewport/cores/data-saver, renders a static frame under reduced-motion | VERIFIED (see WARNING below) | `src/scripts/particles.ts` inspected directly — `syncLoop()` is the sole `rAF`/`cancelAnimationFrame` caller fed by IO(`threshold:0`) + `visibilitychange`; DPR `Math.min(1.5, ...)`; `shouldReduceParticles` halves point count; `matchMedia('(prefers-reduced-motion: reduce)')` branch seeds+ticks once and returns before registering any observer/loop. CDP Measurements C/D/E independently proved: pause deltas 14.5%/7.2% of baseline (both <20% ceiling), reduced-motion canvas drew (pixel sum 43,447) and stopped (2.13ms delta), DPR ratio exactly 1.5 at `deviceScaleFactor:3`. ROADMAP's literal "`client:visible` island" wording is explicitly reinterpreted as *behavior* (pause/resume via IO), documented and cross-referenced across `04-CONTEXT.md`, `04-RESEARCH.md`, `04-UI-SPEC.md`, and `04-DISCUSSION-LOG.md` — the project has no UI framework, so a literal Astro `client:*` directive is inapplicable. **`04-REVIEW.md` WR-02** found a real gap: the reduced-motion branch never registers a `ResizeObserver`, so a resize or orientation change after load leaves the canvas backing store stretched/cropped relative to its CSS box for reduced-motion users specifically. |
| 4 | Under reduced-motion all reveal/glow/canvas/`dmFloat`/`dmPulse` motion stops, page still looks finished; no layout-triggering animated properties; no parallax/scroll-jacking/preloader | VERIFIED | `base.css`'s `@media (prefers-reduced-motion: reduce)` global override (`animation-duration:.01ms!important` etc.) is untouched since Phase 3 (`git diff --quiet HEAD -- src/styles/base.css src/components/HeroBleed.astro` confirmed clean). `reveal.ts`/`glow.ts`/`particles.ts` write only `classList`/`canvas` pixels/one `style.transform` (glow, the one sanctioned runtime style write) — no width/height/top/left animation. Zero `dmFloat`/`dmPulse` consumers added in `src/scripts/`/`src/layouts/` (grep confirmed live). No parallax/scroll-jack/preloader code present anywhere in the diff. |
| 5 | Lighthouse mobile ≥0.95 in all four categories, TBT<200ms, CLS<0.05; DevTools shows no script activity with hero off-screen; SEC-07 passes with no open High finding | VERIFIED | Independently re-confirmed via `gh pr view 3` and `gh run view <lhci run> --log`: CI job `lhci` on PR #3 is `SUCCESS`, with the only assertion result being the pre-existing `categories.seo` **warning** (structural, `X-Robots-Tag: noindex` under Deployment Protection, deferred to Phase 6 per `lighthouserc.json`) — zero `error`-level assertion failures across `categories:performance/accessibility/best-practices` (all gated `>=0.95`), `largest-contentful-paint` (`<=2500`), `cumulative-layout-shift` (`<=0.05`), `total-blocking-time` (`<=200`), `resource-summary:script:size` (`<=20480`). Local `bash scripts/js-weight-check.sh` re-run live: 2645B gzip / 20480B budget (87% headroom). `.planning/security/runs/phase-04.md` exists, all 7 SEC-07 gabarito items answered with evidence, findings table `P04-001..006` + carried-forward items, explicit "nenhum achado High em aberto" declaration, and a Sign-off section with Felipe's verbatim "aprovado" transcribed in `04-04-SUMMARY.md`. |

**Score:** 5/5 truths verified (2 carry a documented non-blocking WARNING each — see Anti-Patterns Found)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/scripts/particles.pure.ts` | `computePointCount`/`shouldReduceParticles`, DOM-free | VERIFIED | 14 lines, exactly 2 named exports, no `document`/`window`/`navigator`, formula matches literal `Math.round(Math.min(90, Math.max(28, (width * height) / 11000)))` |
| `src/scripts/particles.pure.test.mjs` | node:test suite, 12+ cases | VERIFIED | Live run: `node --test "src/scripts/*.test.mjs"` → 14/14 pass, 0 fail |
| `package.json` scripts.test | `node --test "src/scripts/*.test.mjs"` | VERIFIED | Confirmed exact value; no new dependency added |
| `.github/workflows/ci.yml` | `pnpm test` step between `astro check` and `build` | VERIFIED | Confirmed at lines 22-24 of `ci.yml` in exact required order |
| `src/scripts/reveal.ts` | `initReveal` — single IO, unobserve, 2600ms fallback | VERIFIED | Direct read matches plan verbatim; no `.style.opacity`/`.style.transform`; no comments |
| `src/scripts/glow.ts` | `initGlow` — dual-gated, rAF-throttled `pointermove` | VERIFIED (WARNING: stale-coordinate bug, WR-01) | Direct read confirms gate order, `querySelector('.cursor-glow')`, single listener, `{passive:true}` |
| `src/scripts/effects.ts` | Single bundle entry, 3 imports, 3 calls | VERIFIED | `initReveal(); initGlow(); initParticles();` — exactly 3 imports, no try/catch, no DOMContentLoaded |
| `src/layouts/BaseLayout.astro` | 2 `<script>` (is:inline toggle + module), `.cursor-glow` div/style | VERIFIED | Built HTML independently inspected: 1st `<script>` has no `type=` attribute and content is exactly `document.documentElement.classList.add('js-ready')`; `.cursor-glow` div present with `aria-hidden="true"`; no `style="` attribute anywhere in the file |
| `src/styles/tokens.css` | `--z-cursor-glow: 20` between `--z-section`/`--z-nav` | VERIFIED | Confirmed at line 107, `--z-glow: 5` unchanged |
| `src/scripts/particles.ts` | `initParticles` — seed/tick/dual-pause/reduced-motion branch | VERIFIED (WARNING: no resize handling under reduced-motion, WR-02) | Direct read confirms `Math.min(1.5,...)`, `computePointCount`/`shouldReduceParticles` import, `connection?.saveData` optional-chained, `Math.sqrt` (not `Math.hypot`), `globalAlpha`, exactly 1 `cancelAnimationFrame`, 1 `matchMedia`, 1 `Array.from` |
| `.planning/security/runs/phase-04.md` | SEC-07 execution file, 7 gabarito items, findings table | VERIFIED | Exists, all items present with evidence, `P04-001..006` findings + carried-forward findings, Sign-off section present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `src/scripts/particles.pure.test.mjs` | `src/scripts/particles.pure.ts` | relative `.ts` import | WIRED | `import { ... } from './particles.pure.ts'` confirmed; live test run passes |
| `.github/workflows/ci.yml` | `package.json` test script | `pnpm test` step | WIRED | Confirmed in file, positioned correctly |
| `src/layouts/BaseLayout.astro` | `src/scripts/effects.ts` | `<script>import '../scripts/effects.ts';</script>` | WIRED | Confirmed in source; built HTML contains the bundled module script |
| `src/scripts/reveal.ts` | `src/styles/base.css` | `classList.add('is-revealed')` | WIRED | CSS rule `html.js-ready [data-reveal].is-revealed` present in `base.css`, unmodified since Phase 3 |
| `src/scripts/glow.ts` | `src/layouts/BaseLayout.astro` | `querySelector('.cursor-glow')` | WIRED | Element rendered by layout, targeted (not created) by script; CDP-confirmed transform writes land on it |
| `src/scripts/particles.ts` | `src/scripts/particles.pure.ts` | `computePointCount`/`shouldReduceParticles` import | WIRED | Confirmed in source |
| `src/scripts/particles.ts` | `src/components/HeroBleed.astro` | `querySelector('.hero-canvas')` | WIRED | Element exists in `HeroBleed.astro`, untouched since Phase 3; canvas confirmed animating via CDP measurements |
| `src/scripts/particles.ts` | `src/styles/tokens.css` | `getComputedStyle` reading `--color-accent` | WIRED | Regex hex-to-rgb parser confirmed in source, no hardcoded `6c4cff` literal |
| `src/scripts/effects.ts` | `src/scripts/particles.ts` | `initParticles` import/call | WIRED | Confirmed as third import/call in `effects.ts` |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Pure-function test suite passes | `node --test "src/scripts/*.test.mjs"` | 14/14 pass, 0 fail | PASS |
| Astro type-check clean | `pnpm check` | 0 errors, 0 warnings, 0 hints | PASS |
| Production build succeeds | `pnpm build` | Completed, 4 pages built | PASS |
| JS weight within budget | `bash scripts/js-weight-check.sh` | 2645B gzip / 20480B budget | PASS |
| Local SEC-07 mechanical checks | `bash scripts/security-check.sh` | 5 PASS / 0 FAIL / 2 SKIP (preview-dependent) | PASS |
| Built HTML has correct script-tag shape | node inline script parsing `.vercel/output/static/index.html` | 3 `<script>` tags: is:inline (no `type=`) `js-ready` toggle, Vercel Analytics module, `effects.ts` bundle module; zero `eval(`/`new Function(` | PASS |
| CI `lhci` job on PR #3 | `gh pr view 3 --json statusCheckRollup` + `gh run view <id> --log` | `lhci`: SUCCESS; only `categories.seo` warning, zero `error`-level assertion failures | PASS |
| CI `verify`/`dependency-review` jobs | `gh pr view 3 --json statusCheckRollup` | Both SUCCESS | PASS |

### Probe Execution

SKIPPED — no `scripts/*/tests/probe-*.sh` conventional probes exist in this project and none are declared in the phase's PLAN/SUMMARY files.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ANIM-01 | 04-02 | Reveal on scroll, single IO, unobserve, 2.6s fallback | SATISFIED | `reveal.ts` inspected directly; CDP Measurement A |
| ANIM-03 | 04-02 | Cursor glow, gated by pointer:fine + reduced-motion | SATISFIED | `glow.ts`/`BaseLayout.astro` inspected; CDP Measurement B (WR-01 lag bug noted as non-blocking) |
| ANIM-04 | 04-03 | Canvas island-equivalent, `aria-hidden`, IO+visibility pause | SATISFIED | `particles.ts` inspected; CDP Measurement C; "island" reinterpreted as documented behavior (no UI framework in project) |
| ANIM-05 | 04-01, 04-03 | Reduced-motion static frame, DPR cap 1.5, point-count scaling | SATISFIED | `particles.pure.ts`/`particles.ts` inspected; CDP Measurements D/E; 14/14 unit tests pass |
| ANIM-06 | 04-02 | `dmFloat`/`dmPulse` unaffected, reduced-motion umbrella intact | SATISFIED | `base.css` unmodified since Phase 3 (git diff clean); no new keyframe consumers |
| ANIM-09 | 04-02, 04-03 | No layout-property animation, no parallax/scroll-jack/preloader | SATISFIED | Code inspected — only `classList`/canvas pixels/`transform` are touched at runtime |

No orphaned requirements: REQUIREMENTS.md maps exactly ANIM-01, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-09 to Phase 4, matching the declared set across all 4 plans' frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/scripts/glow.ts` | 9-23 | Stale-pointer rAF throttle: paints the first `pointermove` event's coordinates of a pending batch, not the latest, causing visible lag during fast mouse movement (`04-REVIEW.md` WR-01) | Warning | Cursor glow still follows the pointer (truth holds), but with a real, unfixed fidelity bug. Recommend a fast-follow fix (capture `lastX`/`lastY` on every event, read them inside the rAF callback). |
| `src/scripts/particles.ts` | 87-92 | Reduced-motion branch returns before registering any `ResizeObserver`; a post-load resize/orientation-change leaves the canvas backing store stretched relative to its CSS box (`04-REVIEW.md` WR-02) | Warning | Only manifests for reduced-motion users who resize/rotate after initial load — the initially measured static-frame proof (CDP Measurement D) is unaffected. Recommend registering a `ResizeObserver` inside the reduced-motion branch too. |
| `.github/workflows/ci.yml` | dependency-review job | Missing `pull-requests: write` permission for `comment-summary-in-pr: on-failure` (`04-REVIEW.md` WR-03) | Warning | Inherited from prior phases, not introduced by Phase 4's edits; the PR-comment feature would silently fail to post on a real high-severity finding. Not a Phase 4 must-have. |
| `.github/workflows/ci.yml` | 25 | `pnpm audit --audit-level=high` is weaker than CLAUDE.md's "audit limpo" wording (`04-REVIEW.md` WR-04) | Warning | Pre-existing gate from Phase 1, not modified by Phase 4. Documented as a CLAUDE.md/CI wording mismatch, not a Phase 4 regression. |
| `package.json` / `src/scripts/particles.pure.test.mjs` | engines.node vs `.ts` import | `engines.node >=22.12.0` doesn't guarantee unflagged native TS type-stripping used by the test script (`04-REVIEW.md` WR-05) | Warning | CI (Node 24) is unaffected; only a contributor running the documented minimum Node version locally would hit this. Pre-existing engine declaration from Phase 1, not a Phase 4 regression. |

No `TBD`/`FIXME`/`XXX` debt markers found in any file modified by this phase. No comments (`//`, `/*`) in any of the 6 new/modified `.ts`/`.mjs` files (project convention, confirmed by live grep). No `console.log`, no empty stub implementations, no hardcoded-empty-data patterns.

### Human Verification Required

None outstanding. Felipe already completed the phase's blocking human checkpoint (`04-04-PLAN.md` Task 3) and responded **"aprovado"** with no reservations across all 10 checklist items (glow behavior, glow-parked-off-screen-on-load, reveal, no-flash-on-load, hero canvas, dual-pause resume, reduced-motion, no-JS fallback, mobile, and the SEC-07 file itself). This response is transcribed verbatim in `04-04-SUMMARY.md` and appended as the Sign-off section of `.planning/security/runs/phase-04.md`.

**Recommended (non-blocking) follow-up for a future quick-fix or Phase 5+ cleanup pass:** WR-01 (glow lag) and WR-02 (reduced-motion canvas resize) from `04-REVIEW.md` are real, unfixed bugs. They do not invalidate any ROADMAP Success Criterion or must-have truth as measured, and Felipe's sign-off did not surface them (they are subtle/edge-case), but they should be tracked rather than forgotten.

### Gaps Summary

No blocking gaps found. All 5 ROADMAP Success Criteria for Phase 4 are independently verified against the live codebase — not merely SUMMARY.md claims:
- All artifacts exist, are substantive (no stubs/placeholders), and are wired end-to-end.
- Live re-execution of `node --test`, `pnpm check`, `pnpm build`, `js-weight-check.sh`, and `security-check.sh` all pass in this session, matching the phase's own claimed results.
- CI status (`verify`, `lhci`, `dependency-review`) independently re-queried via `gh pr view`/`gh run view --log` on PR #3, confirming the `lhci` gate passed with zero error-level assertion failures (only the expected, pre-existing `categories.seo` warning).
- Built HTML directly inspected for the two new `<script>` tags' exact shape (CSP-Phase-7-readiness) and absence of `eval(`/`new Function(`/inline handlers.
- SEC-07 execution file exists, fully answered, with no open High finding, and carries Felipe's verbatim "aprovado" sign-off.
- The ROADMAP's literal "`client:visible` island" wording for ANIM-04 is a pre-existing, explicitly documented reinterpretation (project has no UI framework) cross-referenced across four planning artifacts — not an unaddressed deviation.

Two non-blocking code-review findings (WR-01 glow-lag, WR-02 reduced-motion-resize) are real bugs worth a fast-follow but do not fail any must-have truth as specified and measured for this phase.

---

_Verified: 2026-09-17T15:58:31Z_
_Verifier: Claude (gsd-verifier)_
