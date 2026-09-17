# Phase 4: Progressive-Enhancement Effects - Context

**Gathered:** 2026-09-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 layers the design's motion behaviors — scroll reveal, cursor glow, and
particle canvas — onto the fully static, zero-JS site shipped in Phase 3, as
small hand-rolled vanilla-JS islands that degrade cleanly under
`prefers-reduced-motion` and never regress the Lighthouse mobile ≥95 gate or
accessibility.

**In scope (ANIM-01, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-09):**
- Scroll reveal JS: a single `IntersectionObserver` (`rootMargin: 0px 0px -8%
  0px`, `threshold: 0.08`) that unobserves each `[data-reveal]` element after
  it fires, plus a ~2.6 s timeout fallback that reveals everything. This
  mechanism is **already locked** by ROADMAP.md's Phase 4 success criterion 1
  — not a live gray area (see "Carrying Forward" below).
- Cursor glow: a new page-wide fixed circle that follows `pointermove` via
  `requestAnimationFrame`, `aria-hidden`, `pointer-events: none`, active only
  on `pointer: fine` + no reduced-motion.
- Particle canvas: `<canvas class="hero-canvas">` (already in the DOM from
  Phase 3) driven by a `devicePixelRatio`-capped, point-count-scaled particle
  system, paused via IntersectionObserver when off-screen and on
  `document.hidden`.
- The `.js-ready` class toggle on `<html>` that Phase 3's CSS already gates
  reveal visibility on (ANIM-02, done in Phase 3) — Phase 4 supplies the
  script that actually sets it.
- Reduced-motion behavior for all of the above, plus `dmFloat`/`dmPulse`
  (already covered by Phase 3's blanket reduced-motion rule in `base.css`).

**Not in scope:**
- Any change to the reveal/glow/canvas CSS states, tokens, or `[data-reveal]`
  markup Phase 3 already shipped — Phase 4 only adds the JS that drives them.
- Form JS, validation, progressive enhancement (Phase 5).
- SEO/meta, CSP/security headers (Phase 6, Phase 7) — though this phase's new
  inline `<script>` and the bundled module script must stay CSP-hashable
  (`security.csp` auto-hashes them; no `unsafe-inline` needed) so Phase 7
  isn't blocked.
- New visual embellishments not in the design or requirements (e.g. applying
  `dmFloat` somewhere new) — out of scope unless it re-surfaces later.

</domain>

<decisions>
## Implementation Decisions

### Cursor glow — scope, markup, and blend behavior
- **D-01:** The cursor glow follows the pointer across the **whole page**
  (matches the original design source: `position: fixed`, ~640px circle,
  `window.addEventListener('pointermove', ...)`), not scoped to the hero.
  This requires **adding a new DOM element** — nothing like it exists yet;
  the only glow-related element currently shipped is the static, non-moving
  `.hero-glow` inside `HeroBleed.astro`.
- **D-02:** The new global glow element **coexists** with the existing static
  `.hero-glow` — both render inside the hero simultaneously (the moving
  page-wide glow layers on top of the static decorative one). `.hero-glow` is
  **not removed or modified**.
- **D-03:** The global glow element lives in **`BaseLayout.astro`**, so it
  renders on every page using the layout — landing, `/obrigado`,
  `/politica-de-privacidade`, `/404` — not just the home page.
- **D-04:** The glow keeps `mix-blend-mode: screen` from the design
  **unconditionally**, including over the light sections (Diferenciais,
  Contato). No special-cased opacity/blend adjustment for light backgrounds —
  if it reads as very subtle/washed-out there, that's accepted as faithful to
  the design rather than "fixed" with extra logic.
- **D-05:** Under `prefers-reduced-motion: reduce`, the glow is **fully
  disabled** — it does not render at all (not even parked at a fixed
  position). Matches ANIM-03's "only activates... with
  `prefers-reduced-motion: no-preference`".

### Particle canvas — density and scaling policy
- **D-06:** In the **normal case** (larger viewport, >4 cores, no
  data-saver), keep the **exact point-count formula from the design source**:
  `n = round(min(90, max(28, (w * h) / 11000)))`. Only the DPR cap changes —
  from the design's `min(2, devicePixelRatio)` down to **`min(1.5,
  devicePixelRatio)`** per ANIM-05. Visual density stays identical to the
  design in the common case; only pixel-ratio cost is trimmed.
- **D-07:** "Few cores" (ANIM-05's low-power-device trigger) is defined as
  **`navigator.hardwareConcurrency <= 4`**.
- **D-08:** When any reduction trigger applies (small viewport, `<=4` cores,
  or `navigator.connection?.saveData`), **halve** the point count computed by
  the normal-case formula (~50% cut), rather than switching to an unrelated
  fixed low number.

### Particle canvas — reduced-motion fallback
- **D-09:** Under `prefers-reduced-motion: reduce`, the canvas renders a
  **single static frame** — points are placed and drawn once, with no
  `requestAnimationFrame` loop — rather than staying empty. This matches
  ROADMAP.md's Phase 4 success criterion 4 ("the page still looks finished")
  more literally than an empty canvas would.

### Script architecture
- **D-10:** Reveal, glow, and canvas are driven by **one bundled Astro module
  script** (per `CLAUDE.md`'s existing prescription) — not separate scripts
  or islands per effect. ANIM-04's "loads as a `client:visible` island" is
  interpreted as **behavior**, not Astro's literal `client:visible` directive
  — the project has no UI framework integration to attach that directive to
  (`CLAUDE.md` explicitly rules out a UI framework for the form/effects). The
  canvas gets its own internal `IntersectionObserver` inside the single
  bundled script to start/stop its `requestAnimationFrame` loop when the hero
  scrolls off-screen or `document.hidden` fires — that IO is what satisfies
  ANIM-04's pause/resume requirement, not a framework client directive.
- **D-11:** The `.js-ready` class toggle on `<html>` is a **separate, tiny,
  synchronous inline `<script>` in `BaseLayout.astro`'s `<head>`** —
  `document.documentElement.classList.add('js-ready')` and nothing else. It
  is deliberately **not** part of the larger bundled module script, because
  that script loading/parsing after first paint would risk a flash of
  visible-then-hidden reveal content. The bundled module (reveal observer +
  glow + canvas) loads separately, after this inline toggle already ran.

### Claude's Discretion
Planner / researcher decide, unless a real trade-off surfaces for Felipe:
- Exact glow circle sizing/blur/gradient stops beyond the ~640px design
  reference (fine-tuning against the real Outfit/DM Sans layout).
- Whether the bundled module script is loaded via a plain `<script>` module
  tag at the end of `BaseLayout.astro`'s `<body>` or via an Astro
  `<script>` block co-located with a component — as long as it stays a
  single bundle per `CLAUDE.md`.
- Exact small-viewport breakpoint that counts as "small" for the D-08
  reduction trigger (alongside the `<=4`-core and data-saver triggers).
- Whether `navigator.connection` feature-detection guards are written
  defensively (the API is optional/Chromium-only) — implementation detail,
  not a behavior change.
- Precise glow circle removal/attachment timing relative to `componentDidMount`-
  style lifecycle equivalents (there's no framework lifecycle here — plain
  `DOMContentLoaded`/module top-level timing is fine).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements & scope
- `.planning/ROADMAP.md` § "Phase 4: Progressive-Enhancement Effects" — goal
  + 5 success criteria; success criterion 1 **already locks** the reveal
  mechanism to a single `IntersectionObserver` with the exact `rootMargin`/
  `threshold`/fallback values (do not revisit as a gray area).
- `.planning/REQUIREMENTS.md` § "Animações & Movimento (ANIM)" — ANIM-01,
  ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-09 (this phase's exact wording);
  ANIM-02, ANIM-07, ANIM-08 are already complete (Phase 3) and constrain what
  Phase 4's JS must plug into without altering.
- `CLAUDE.md` § "The two tensions, addressed head-on" → "Performance budget
  vs. animation richness" — the explicit instruction to keep the hand-rolled
  IO reveal / rAF glow / DPR-capped canvas, refactor the DC-editor `<script>`
  into **one bundled Astro module script**, and wrap every effect in a
  `prefers-reduced-motion` guard. This is the source of D-10.

### Design source (behavior reference — never ship verbatim)
- `arquivos de design/Dmarques Landing.dc.html`:
  - Lines ~28–30: the **global fixed cursor-glow div** (`ref="{{ glowRef }}"`,
    `position: fixed`, 640×640px, `mix-blend-mode: screen`) — the element
    D-01/D-02/D-04 are based on. Not currently shipped anywhere in `src/`.
  - Lines ~182–194: Hero "03 Bleed" visual block — the existing
    `.hero-canvas` / `.hero-glow` elements in `HeroBleed.astro` map to this.
  - Lines ~478–609 (`<script type="text/x-dc">`): the design-editor's
    reference implementation — `componentDidMount` (glow pointermove + rAF
    throttle, reveal fallback timer), `observe()` (the IO reveal logic),
    `particles(cv)` (DPR cap, point-count formula, resize handling). Read for
    exact behavior/formulas only, never copy the DC-editor runtime itself.

### Project conventions & prior decisions
- `.planning/phases/03-static-zero-js-sections-csp-safe-refactor-a11y/03-CONTEXT.md`
  — confirms what Phase 3 left in place for Phase 4 to attach to:
  `[data-reveal]` markup across every section, the `.js-ready`-gated CSS in
  `base.css`, the static `.hero-canvas`/`.hero-glow` elements in
  `HeroBleed.astro`, and that Phase 3 intentionally shipped **zero** JS for
  any of it.
- `.planning/phases/01-foundation-ci-gate/01-CONTEXT.md` — D-04 (zero
  comments, project-wide, applies to the new script(s) too).
- `.planning/STATE.md` § "Open Decisions To Resolve Before Their Phase" —
  the "CSS scroll-driven `animation-timeline: view()` layer + IO fallback vs.
  single IO island" line is **resolved by ROADMAP.md's Phase 4 success
  criterion 1** (single IO, no `animation-timeline`) — carried forward as
  already-decided, not re-litigated in this discussion.

### Existing code Phase 4 touches directly
- `src/styles/base.css` — `[data-reveal]` CSS states, `.js-ready` gate,
  `dmFloat`/`dmPulse` keyframes, the blanket reduced-motion rule (lines
  53–109). Phase 4 does not edit this file's rules, only supplies the JS
  that adds/removes `.js-ready` and `.is-revealed`.
- `src/components/HeroBleed.astro` — `.hero-canvas` and `.hero-glow`
  elements (lines 66–67) the canvas script and the *static* glow (kept
  per D-02) already exist in.
- `src/layouts/BaseLayout.astro` — where the new global glow div (D-03), the
  synchronous `.js-ready` inline script (D-11), and the bundled module script
  (D-10) all get added.
- `astro.config.mjs` — confirms no UI framework integration is installed
  (relevant to D-10's framework-free `client:visible` interpretation).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `[data-reveal]` attributes already present across every section component
  (`AboutSection`, `ServicesSection`, `FaqSection`, `ProcessSection`,
  `ContactSection`, `CtaFinal`, `DifferentiatorsSection`) — the reveal script
  just needs to query and observe `document.querySelectorAll('[data-reveal]')`,
  no markup changes needed.
- `.hero-canvas` and `.hero-glow` elements already exist in `HeroBleed.astro`
  with correct `aria-hidden` and positioning/z-index (`--z-canvas`,
  `--z-glow` tokens) — the canvas script attaches directly to
  `.hero-canvas`, no new canvas element needed.
- `--color-accent` (`#6C4CFF`) token already defined in `tokens.css` — reused
  as the particle fill/glow color instead of hardcoding a hex.

### Established Patterns
- Zero comments in any versioned file (Phase 1 D-04) applies to the new
  script(s).
- `build.inlineStylesheets: 'never'` doesn't affect JS, but the CSP posture
  (Phase 7) means the bundled module script and the small `.js-ready` inline
  script both need to stay plain `<script>`/`<script type="module">` content
  Astro's `security.csp` can hash — no `eval`, no dynamically-constructed
  script content.
- No UI framework is installed (`astro.config.mjs` has no React/Vue/Svelte
  integration) — confirms D-10's reading of "client:visible" as behavior,
  not the literal directive.

### Integration Points
- `src/layouts/BaseLayout.astro` is the single attachment point for both new
  scripts (inline `.js-ready` toggle + bundled module) and the new global
  glow div — it already renders on every page (`<slot />` wraps all page
  content), so nothing added there needs to be duplicated per-page.
- Phase 7 (CSP) will hash whatever inline/module script content this phase
  ships — keeping script count and structure stable now avoids CSP churn
  later.

</code_context>

<specifics>
## Specific Ideas

- The global cursor-glow div's exact styling (640×640px, `border-radius:
  50%`, `radial-gradient(circle, rgba(108,76,255,.28) 0%, rgba(108,76,255,.10)
  38%, rgba(108,76,255,0) 68%)`, `mix-blend-mode: screen`, `will-change:
  transform`) should be lifted directly from the design source (D-01/D-04) —
  not reinvented.
- The particle count formula, DPR handling, and resize-on-`ResizeObserver`
  approach should mirror the design source's `particles(cv)` method almost
  verbatim, with only the DPR cap (1.5 vs 2) and the halving-under-low-power
  logic (D-06/D-07/D-08) as deltas.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. No scope-creep items surfaced.

### Reviewed Todos (not folded)
None — `todo.match-phase` returned zero matches for Phase 4.

</deferred>

---

*Phase: 4-progressive-enhancement-effects*
*Context gathered: 2026-09-17*
