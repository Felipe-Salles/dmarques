# Phase 4: Progressive-Enhancement Effects - Research

**Researched:** 2026-09-16
**Domain:** Vanilla-JS progressive enhancement (scroll reveal, cursor glow, canvas particles) on a static Astro 7 site, gated by `security.csp` and a strict Lighthouse mobile budget
**Confidence:** HIGH (mechanics of Astro script processing, CSP hashing, IO/rAF/Page-Visibility patterns) / MEDIUM (browser feature-detection edge cases, Lighthouse TBT headroom for the O(n²) canvas)

## Summary

Phase 4 adds exactly one new client-side surface to an otherwise zero-JS static
site: a tiny synchronous inline script that flips `.js-ready` on `<html>`, and
one bundled `<script type="module">` (reveal IntersectionObserver + pointer
glow + particle canvas) loaded from `BaseLayout.astro`. All three behaviors
already have their CSS half shipped by Phase 3 (`[data-reveal]` states,
`.hero-canvas`/`.hero-glow` elements, `dmFloat`/`dmPulse` + the blanket
reduced-motion rule in `base.css`) — this phase is pure JS, no markup or CSS
changes to what Phase 3 shipped.

The two technical risks worth planning around are (1) Astro's default
`<script>` processing (auto `type="module"`, auto-bundled or auto-inlined,
auto-hashed by `security.csp`) versus the one script that must NOT be
processed that way — the `.js-ready` toggle, which needs `is:inline` to stay
a parser-blocking classic script and avoid a flash of visible-then-hidden
reveal content — and (2) the particle canvas's O(n²) pairwise-distance
connection-line loop (up to 90 points → ~4,005 pair checks/frame) running
immediately on page load inside the Lighthouse mobile 4×-CPU-throttle trace
window, which is the single biggest lever against the TBT < 200 ms success
criterion. Every other gray area (IO + Page Visibility pause ordering,
`navigator.connection`/`hardwareConcurrency` feature detection,
`prefers-reduced-motion` gating) has a well-established, low-risk pattern.

**Primary recommendation:** Author the `.js-ready` toggle as
`<script is:inline>` (2 lines, no import, no processing) placed anywhere in
`BaseLayout.astro`'s `<head>`; author the reveal/glow/canvas logic as a plain
(non-`is:inline`) module script that imports from a new `src/scripts/`
directory so Astro bundles/hashes it automatically and `astro check`/Biome
can lint it; extract the particle point-count and reduction-trigger formulas
into pure, framework-free functions so they can be unit-tested with Node's
built-in test runner (zero new dependency) before ever touching a canvas.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** The cursor glow follows the pointer across the **whole page**
  (matches the original design source: `position: fixed`, ~640px circle,
  `window.addEventListener('pointermove', ...)`), not scoped to the hero.
  Requires adding a new DOM element — nothing like it exists yet.
- **D-02:** The new global glow element **coexists** with the existing static
  `.hero-glow` — both render inside the hero simultaneously. `.hero-glow` is
  **not removed or modified**.
- **D-03:** The global glow element lives in **`BaseLayout.astro`**, rendering
  on every page (landing, `/obrigado`, `/politica-de-privacidade`, `/404`).
- **D-04:** The glow keeps `mix-blend-mode: screen` **unconditionally**,
  including over light sections. No special-cased opacity/blend adjustment.
- **D-05:** Under `prefers-reduced-motion: reduce`, the glow is **fully
  disabled** — does not render at all.
- **D-06:** Normal case keeps the exact point-count formula
  `n = round(min(90, max(28, (w * h) / 11000)))`; only the DPR cap changes
  from `min(2, devicePixelRatio)` to **`min(1.5, devicePixelRatio)`**.
- **D-07:** "Few cores" is defined as **`navigator.hardwareConcurrency <= 4`**.
- **D-08:** When any reduction trigger applies (small viewport, `<=4` cores,
  or `navigator.connection?.saveData`), **halve** the normal-case point count.
- **D-09:** Under `prefers-reduced-motion: reduce`, the canvas renders a
  **single static frame** (points placed and drawn once, no rAF loop) rather
  than staying empty.
- **D-10:** Reveal, glow, and canvas are driven by **one bundled Astro module
  script** — not separate scripts or islands per effect. ANIM-04's
  `client:visible` is interpreted as **behavior** (an internal
  IntersectionObserver pausing/resuming the canvas's own rAF loop), not the
  literal Astro directive, because no UI framework integration is installed.
- **D-11:** The `.js-ready` toggle is a **separate, tiny, synchronous inline
  `<script>` in `BaseLayout.astro`'s `<head>`** —
  `document.documentElement.classList.add('js-ready')` and nothing else. Kept
  out of the bundled module script deliberately, so it can run before first
  paint without waiting on module loading/parsing.

### Claude's Discretion

- Exact glow circle sizing/blur/gradient stops beyond the ~640px design
  reference.
- Whether the bundled module script is a plain `<script>` module tag at the
  end of `<body>` or an Astro `<script>` block co-located with a component —
  as long as it stays a single bundle.
- Exact small-viewport breakpoint for the D-08 reduction trigger.
- Whether `navigator.connection` feature-detection guards are written
  defensively (the API is optional/Chromium-only).
- Precise glow circle removal/attachment timing relative to
  `componentDidMount`-style lifecycle equivalents (no framework lifecycle
  here — plain `DOMContentLoaded`/module top-level timing is fine).

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope. No scope-creep items surfaced.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ANIM-01 | Reveal ao rolar via único IntersectionObserver, unobserve após disparo, fallback timeout ~2.6s | IO pattern + timeout fallback documented below (Code Examples, Pattern 1); reuses `[data-reveal]` markup already shipped |
| ANIM-03 | Glow que segue o cursor via `pointermove` + rAF, `pointer-events:none`, `aria-hidden`, só `pointer:fine` sem reduced-motion | rAF-throttled pointermove pattern (Pattern 2) + `matchMedia('(pointer: fine)')` gating documented below |
| ANIM-04 | Canvas de partículas island `client:visible`-equivalent, `aria-hidden`, pausado por IO + `document.hidden` | IO + Page Visibility dual-gate pattern (Pattern 3) resolves the exact pause/resume ordering gray area |
| ANIM-05 | Canvas respeita reduced-motion (frame estático), limita DPR ~1.5, reduz pontos em viewport pequena/poucos núcleos/data-saver | Feature-detection caveats for `hardwareConcurrency`/`navigator.connection` (Common Pitfalls) directly inform D-07/D-08 implementation |
| ANIM-06 | `dmFloat`/`dmPulse` com `animation:none` sob reduced-motion | Already covered by Phase 3's blanket `@media (prefers-reduced-motion: reduce)` rule in `base.css` (lines 97-109) — Phase 4 adds no new keyframe consumers, verify nothing added by this phase reintroduces animated properties outside that guard |
| ANIM-09 | Nenhuma animação anima propriedades de layout; sem parallax/scroll-jacking/preloader | Verified: `transform`/`opacity` only in reveal + glow; canvas draws are `canvas` 2D paints (not layout-triggering); no scroll listeners anywhere in this phase's design |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Scroll-reveal IntersectionObserver | Browser / Client | Build-time (Astro bundling) | Pure runtime DOM behavior; Astro only bundles/hashes the script at build time, it does not execute server-side |
| Cursor glow (`pointermove` + rAF) | Browser / Client | — | Purely a client interaction; no server or build-time state |
| Particle canvas + its internal pause/resume IO | Browser / Client | — | `<canvas>` 2D rendering and rAF loop are inherently client-only |
| `.js-ready` synchronous toggle | Browser / Client | Build-time (Astro `is:inline` emission) | Must execute pre-paint in the browser; Astro's only role is emitting it byte-for-byte via `is:inline` |
| CSP-hashability of the bundled script | Build-time (Astro compiler) | Browser / Client (CSP enforcement, Phase 7) | The hash is computed at build time; it is only *enforced* client-side once Phase 7 turns on `security.csp` |

## Standard Stack

This phase introduces **zero new npm packages**. It is pure vanilla
TypeScript/JavaScript authored inside `src/scripts/`, consumed by
`<script>` tags in `.astro` files, per `CLAUDE.md`'s explicit prescription
("no animation library ... The design already ships a correct
IntersectionObserver reveal, a rAF-throttled cursor glow, and a DPR-capped
canvas particle network"). `js-weight-check.sh`'s dependency-name regex
(`react|vue|svelte|framer-motion|motion|gsap|aos|lenis|...`) already fails
the build if any of those land in `package.json` — treat that gate as a hard
constraint, not a suggestion.

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| — (none) | — | — | No runtime library is appropriate for ~150 lines of IO/rAF/canvas code; see CLAUDE.md's "Alternatives Considered" table (Motion/GSAP/AOS/Lenis all rejected with byte-cost rationale) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js built-in `node:test` + `node:assert` | bundled with Node `24.14.0` (already installed, confirmed via `node --version`) | Unit-test the pure particle-count/reduction-trigger formulas without adding a devDependency | Recommended for Wave 0 of this phase — see Validation Architecture |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled vanilla `<script>` module | `motion` (`animate`/`inView` cherry-picked, ~4-5 KB) | CLAUDE.md's own "sanctioned escape hatch" — only justified if a future phase needs spring physics or orchestrated sequences, not for this phase's three effects |
| Node's built-in `node:test` for pure-function checks | `vitest` | Would be the more ergonomic choice if the project already had a JS unit-test story, but adding a first devDependency + config file for ~2 pure functions contradicts the project's minimal-deps posture; revisit if Phase 5's form island needs richer testing |

**Installation:** None required.

**Version verification:** N/A — no packages added. `astro@7.3.1`,
`@astrojs/vercel@11.0.10` (already pinned in `package.json`, confirmed via
`Read` of `package.json`) are unaffected by this phase.

## Package Legitimacy Audit

**Not applicable** — this phase installs zero external packages. No
`slopcheck`/registry verification was run because there is nothing to
verify. If a future revision of this phase's plan introduces any dependency
(even a "just this once" utility), the Package Legitimacy Gate protocol
must be run before it ships, and CLAUDE.md's explicit "what NOT to use"
table should be re-checked first.

## Architecture Patterns

### System Architecture Diagram

```
Build time (Astro, Vite)
  BaseLayout.astro
    <script is:inline>  ──byte-for-byte──▶  emitted verbatim in <head>,
      (.js-ready toggle)                     first thing the browser can execute
    <script>             ──import──▶ src/scripts/effects.ts
      (bundled module)                       │
                                              ▼
                                  Vite bundles + Astro auto-hashes
                                  (or auto-inlines if small enough)
                                              │
                                              ▼
                          <script type="module" src="/_astro/xxxx.js">
                          (or inlined <script type="module"> with a
                           security.csp-computed sha256 hash, once
                           Phase 7 turns CSP on)

Runtime (browser, after first paint)
  DOMContentLoaded / module top-level
       │
       ├─▶ reveal: IntersectionObserver.observe(all [data-reveal])
       │      on intersect → add .is-revealed, unobserve(el)
       │      + setTimeout(2600ms) → revealAll() fallback
       │
       ├─▶ glow: if matchMedia('(pointer: fine)').matches
       │         && matchMedia('(prefers-reduced-motion: no-preference)').matches
       │      → create/append glow div, window.addEventListener('pointermove', throttled-by-rAF)
       │      else: never create the element (D-05)
       │
       └─▶ canvas: if prefers-reduced-motion: reduce
                 → seed once, draw one static frame, no rAF, no IO needed
               else
                 → seed(), attach ResizeObserver(seed)
                 → attach IntersectionObserver(canvas) + visibilitychange listener
                      both feed one syncLoop() that starts/stops a single rAF id
```

### Recommended Project Structure

```
src/
├── layouts/
│   └── BaseLayout.astro       # <script is:inline> toggle + glow div + <script> import of effects.ts
├── scripts/
│   ├── effects.ts             # entry: wires reveal + glow + canvas, imports the two modules below
│   ├── reveal.ts              # IntersectionObserver + timeout fallback (pure DOM side-effects)
│   ├── particles.ts           # canvas seed/tick/pause-resume + the two pure formula functions
│   └── particles.pure.ts      # (optional split) computePointCount(w,h), shouldReduceParticles(...) — zero DOM, unit-testable
└── components/
    └── HeroBleed.astro        # unchanged markup; .hero-canvas / .hero-glow already exist
```

Splitting the pure math (`particles.pure.ts`) from the DOM-touching code
(`particles.ts`) is what makes Node's built-in test runner useful here —
the formulas can be imported and asserted without a DOM or a browser.

### Pattern 1: Reveal — single IntersectionObserver with unobserve + timeout fallback

**What:** One `IntersectionObserver` instance observes every `[data-reveal]`
element; on intersect, add `.is-revealed` and immediately `unobserve` that
element (never fires twice, no per-element listeners). A `setTimeout` set at
module-load time reveals everything unconditionally after ~2.6 s, covering
browsers where IO silently fails or an element is positioned such that it
never crosses the `rootMargin` threshold (e.g. a very short page, a
hidden-then-shown tab).

**When to use:** Exactly ANIM-01's wording; this is already locked by
ROADMAP success criterion 1, not a design choice.

**Example:**
```javascript
// Source: pattern verified against design source's own observe() method
// (arquivos de design/Dmarques Landing.dc.html lines ~478-609) — logic
// carried forward, DC-editor lifecycle wrapper removed.
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-revealed'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
  setTimeout(() => {
    els.forEach((el) => el.classList.add('is-revealed'));
    io.disconnect();
  }, 2600);
}
```
Note this targets `.is-revealed` (the class Phase 3's CSS already keys off
in `base.css` line 67), not inline `style.opacity`/`style.transform` the way
the DC-editor reference script did — the class toggle is what the shipped
CSS expects and keeps the JS free of inline style writes (relevant to
`security-check.sh` verification 2, which greps `style="` in `src/`, though
that check only scans source files, not runtime-mutated DOM — still, class
toggling is the correct idiomatic approach here regardless).

### Pattern 2: Cursor glow — rAF-throttled pointermove, gated by two media features

**What:** A single `pointermove` listener (registered only if
`matchMedia('(pointer: fine)').matches && matchMedia('(prefers-reduced-motion: no-preference)').matches`)
schedules at most one `requestAnimationFrame` write per frame via a
pending-flag guard — this is the standard rAF-throttle idiom, not a custom
debounce library.

**When to use:** ANIM-03, D-01 through D-05.

**Example:**
```javascript
// Source: pattern verified against design source's componentDidMount
// (arquivos de design/Dmarques Landing.dc.html lines ~478-609)
function initGlow() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!fine || !motionOk) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);

  let pending = false;
  window.addEventListener(
    'pointermove',
    (event) => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      });
    },
    { passive: true },
  );
}
```
Because the listener is only ever attached when `pointer: fine` matches,
this naturally costs nothing under Lighthouse's mobile emulation (which
reports `pointer: coarse`) — no explicit Lighthouse-specific branching
needed.

### Pattern 3: Particle canvas — dual-gate pause/resume (IntersectionObserver + Page Visibility API)

**What:** Two independent boolean flags — one owned by an
`IntersectionObserver` watching the canvas element, one owned by a
`visibilitychange` listener on `document` — both feed a single
`syncLoop()` function that starts or stops exactly one `requestAnimationFrame`
id. This is the standard, current (2026) idiom for pausing canvas/WebGL
animation loops off-screen or in a backgrounded tab; MDN and every major
canvas-performance guide document IO for "off-screen" and Page Visibility
for "backgrounded tab" as two separate, complementary signals — neither
API subsumes the other (a tab can be visible but the canvas scrolled out of
view, or the canvas on-screen but the tab backgrounded).

**When to use:** ANIM-04's pause requirement.

**Example:**
```javascript
// Source: pattern synthesized from MDN IntersectionObserver + Page
// Visibility API docs (standard combinator, not library-specific)
function attachPauseControls(canvas, tick) {
  let inView = false;
  let pageVisible = !document.hidden;
  let rafId = null;

  function syncLoop() {
    const shouldRun = inView && pageVisible;
    if (shouldRun && rafId === null) {
      rafId = requestAnimationFrame(function loop() {
        tick();
        rafId = requestAnimationFrame(loop);
      });
    } else if (!shouldRun && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
      syncLoop();
    },
    { threshold: 0 },
  ).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    syncLoop();
  });

  syncLoop();
}
```
**Ordering pitfall avoided:** both handlers call the same `syncLoop()`
rather than each independently starting/stopping the loop — this prevents
the classic double-`requestAnimationFrame` bug where the IO callback starts
a loop that the visibility handler (running a moment later with stale state)
also starts, leaving two concurrent tick loops.

### Anti-Patterns to Avoid

- **Two independent start/stop code paths for the same rAF loop:** always
  route both the IO callback and the `visibilitychange` handler through one
  `syncLoop()` gate, never call `requestAnimationFrame`/`cancelAnimationFrame`
  directly from either handler.
- **Checking `prefers-reduced-motion` inside the animation loop itself:**
  check it once at initialization to decide whether to start the loop at
  all (single static frame per D-09) — do not add a per-frame `matchMedia`
  call, which is wasted work every single frame.
- **Using `<script type="module">` (Astro's default) for the `.js-ready`
  toggle:** module scripts are deferred by the HTML spec, which reintroduces
  exactly the flash-of-visible-content D-11 exists to prevent. Must be
  `is:inline` (see Common Pitfalls).
- **Writing `style.opacity`/`style.transform` directly from JS for the
  reveal effect** (as the DC-editor reference script does): the shipped CSS
  in `base.css` already keys off a `.is-revealed` class — toggle the class,
  don't reintroduce inline style mutation that duplicates what CSS already
  owns.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Detecting `prefers-reduced-motion` | A custom polyfill or manual `UAParser`-style sniff | `window.matchMedia('(prefers-reduced-motion: reduce)').matches` | Native, zero-cost, universally supported; sniffing is both larger and less reliable |
| Detecting pointer capability | JS touch-event heuristics (`'ontouchstart' in window`, etc. — notoriously unreliable on hybrid devices) | `window.matchMedia('(pointer: fine)').matches` | The CSS Media Queries Level 4 `pointer` feature is designed exactly for this and is what ANIM-03 specifies |
| Throttling a high-frequency event to frame rate | A generic debounce/throttle utility (own or from a library) | The `pending` boolean + single `requestAnimationFrame` idiom shown in Pattern 2 | It's 6 lines, matches exactly what the animation loop needs (frame-aligned, not time-aligned), and a generic time-based debounce would introduce visible lag on the cursor glow |
| Spatial partitioning for the particle connection lines | A quadtree/grid-bucket implementation to speed up nearest-neighbor checks | The plain O(n²) nested loop already in the design source | D-06 locks the exact formula and point-count ceiling (90); at n≤90 the O(n²) cost (~4,005 pair checks) is small enough that a spatial index adds code/complexity without a measurable win — see Common Pitfalls for where the real cost is (frequency/timing, not the algorithm's asymptotic class) |

**Key insight:** every "don't hand-roll" temptation in this phase points
toward *removing* code, not adding a library — the risk profile here is
over-engineering (polyfills, generic utilities, spatial indices) for a
problem size (≤90 points, 3 effects, one page) where the naive approach is
already correct and fast enough.

## Common Pitfalls

### Pitfall 1: `.js-ready` toggle authored as a normal (non-`is:inline`) Astro `<script>`

**What goes wrong:** Astro's default `<script>` processing in `.astro`
files auto-converts the tag to `type="module"` and may bundle/relocate it.
Module scripts are deferred by the HTML spec (they execute after the
document is parsed, similar to `defer`) — so `.js-ready` would be added
*after* the browser has already painted the un-hidden `[data-reveal]`
elements, causing a visible flash before they snap to their hidden
pre-reveal state (opposite of the intended "always visible without JS,
gently hidden-then-revealed with JS" contract in ANIM-02).

**Why it happens:** Astro's script-processing pipeline (import resolution,
TypeScript, bundling) is opt-out, not opt-in — plain `<script>` gets the
full treatment unless explicitly told not to.

**How to avoid:** Author this one script as `<script is:inline>` per
Astro's own escape hatch — "rendered into the HTML exactly as written," no
processing, no deferral change. [CITED: docs.astro.build/en/guides/client-side-scripts]

**Warning signs:** A brief flash where reveal sections are momentarily
fully visible then jump to their pre-reveal hidden state on load, especially
visible on slow connections or low-end devices where module parsing takes
longer.

### Pitfall 2: Particle canvas rAF loop starting inside the Lighthouse trace window

**What goes wrong:** The hero (and its canvas) is above the fold, so the
canvas's `IntersectionObserver` reports `isIntersecting: true` immediately
on load — the rAF loop starts right away, during exactly the window
Lighthouse measures for Total Blocking Time. The connection-line
pairwise-distance loop is O(n²); at the D-06 ceiling of 90 points that's
~4,005 distance checks *per frame*, every frame, indefinitely — under
Lighthouse's mobile 4× CPU throttle this is the single largest scripting
cost this phase introduces.

**Why it happens:** ANIM-04's "pause when off-screen" only helps once the
user scrolls the hero away — it does nothing to reduce the cost while the
hero is the first thing on screen, which is also the Lighthouse measurement
window.

**How to avoid:** This is exactly why D-06/D-07/D-08's DPR cap (1.5) and
halving triggers exist — lean on them fully rather than treating them as
optional. Additionally: confirm the tick function does the minimum possible
work per frame (avoid allocating new arrays/objects inside `tick()`, reuse
the same `pts` array in place as the design source already does). If CI
Lighthouse TBT is still tight after implementation, the next lever (not
currently in scope per D-06's lock) would be lowering the 90-point ceiling
itself — flag this as an Open Question for the planner rather than silently
deviating from the locked formula.

**Warning signs:** `total-blocking-time` assertion in `lighthouserc.json`
(currently gated at `< 200 ms`, already enforced in CI) regresses after this
phase's PR; Chrome DevTools Performance panel shows long tasks concentrated
in the canvas's `tick()` function during the first 2-3 seconds after load.

### Pitfall 3: `navigator.connection` accessed without optional chaining

**What goes wrong:** `navigator.connection` is `undefined` in Firefox and
Safari (Network Information API is Chromium-only, not Baseline). Writing
`navigator.connection.saveData` throws a `TypeError` in those browsers,
which — depending on where it's called from — could break the entire
bundled script's execution (since a single uncaught synchronous error can
abort the rest of a `<script>` block's top-level code).

**Why it happens:** The API's naming (`navigator.connection`) reads like a
guaranteed-present property; it is not part of any browser's baseline
feature set. [CITED: developer.mozilla.org/en-US/docs/Web/API/Navigator/connection]

**How to avoid:** Always `navigator.connection?.saveData === true` (optional
chaining, explicit `=== true` comparison since the property can also be
`undefined` on supporting browsers that haven't opted into Data Saver).

**Warning signs:** Any Firefox/Safari user report of the particle canvas or
entire effects bundle silently not initializing at all (broken reveal +
glow + canvas simultaneously, since one throw in shared top-level module
code can prevent the rest of the module's side effects from running).

### Pitfall 4: Treating `navigator.hardwareConcurrency <= 4` as a precise core count

**What goes wrong:** iOS Safari clamps `hardwareConcurrency` to a maximum of
2 (all iOS devices, regardless of actual core count) for fingerprinting
resistance, and Firefox with `privacy.resistFingerprinting` enabled pins it
to exactly 2 as well. This means **every iOS Safari visitor** — including
those on the newest, most powerful iPhones — will always trip D-07's `<=4`
reduction trigger. [CITED: multiple corroborating sources — testmuai.com,
support.mozilla.org, blog.send.win; MEDIUM confidence, no single official
spec source states the exact clamp values, but three independent
descriptions agree]

**Why it happens:** Both vendors deliberately reduce the precision of this
API as an anti-fingerprinting measure; the API was never a reliable proxy
for "true" hardware capability, only ever a coarse hint.

**How to avoid:** Nothing to "fix" here — D-07 already defines the
threshold as a behavior contract (`<=4` → treat as low-power), not a
scientific measurement. Document this as expected: iOS Safari visitors
always get the halved particle count. This is arguably the *correct*
outcome for battery/thermal reasons on mobile Safari regardless of the
"real" chip, so no compensating logic is needed — just don't be surprised
when it shows up in manual testing on an iPhone.

**Warning signs:** None — this is expected behavior, not a bug. Flagging it
here so the planner doesn't file it as a defect during manual verification.

### Pitfall 5: CSP hash mismatch anxiety (a non-issue for this phase)

**What goes wrong:** A common worry when authoring new inline/module
scripts on an Astro project that has CSP in its future is "will this break
`security.csp` hashing." For this phase specifically, it does not, because
`security.csp` is not yet enabled (Phase 7 scope) — but it's worth
confirming now so the plan doesn't over-engineer around a non-problem.

**Why it happens:** Astro's `security.csp` computes hashes automatically at
build time for every inline script/style Astro itself processes or
generates — this is fully automatic and requires no manual hash management
as long as the script content is static (no `eval`, no
`document.write`-constructed script tags, no inline `onclick=` attributes).
[CITED: docs.astro.build/en/guides/security (fetched 2026-09-16); corroborated
by astro.build/blog/astro-6 and github.com/withastro/astro PR #13923]
Externally-referenced scripts (`<script type="module" src="/_astro/xxx.js">`)
don't need a hash at all under a `script-src 'self'` policy — they're
same-origin resource loads, not inline content.

**How to avoid:** Just don't do the things CSP always disallows regardless
of hashing (no `eval`/`Function()`, no inline event-handler attributes, no
dynamically-assembled `<script>` tags) — this phase's design already avoids
all three. No special CSP-anticipation work is needed in Phase 4 beyond
that baseline hygiene.

**Warning signs:** N/A for this phase; would resurface as a Phase 7 concern
only if this phase's code violated the baseline hygiene above.

## Code Examples

See Architecture Patterns above (Pattern 1-3) — each includes a complete,
copy-adjustable example already annotated with its source basis. Two
additional small idioms worth calling out explicitly:

### Reduced-motion gate for the whole bundle (single check, not per-effect)

```javascript
// Source: standard matchMedia idiom, MDN
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;
```
Call this once at the top of the bundled module's entry point and branch
each effect's initialization on it (glow: skip entirely per D-05; canvas:
draw one static frame per D-09; reveal: CSS already handles this via the
`@media (prefers-reduced-motion: no-preference)` wrapper around
`html.js-ready [data-reveal]` in `base.css`, so the reveal JS itself does
not need to branch on this at all — it can always run the IO/timeout logic
unconditionally, since the CSS makes it a no-op visually under
reduced-motion).

### Reduction-trigger predicate as a pure, testable function

```typescript
// Source: derived from D-06/D-07/D-08, written pure for unit testing
export function shouldReduceParticles(input: {
  viewportWidth: number;
  smallViewportBreakpoint: number;
  hardwareConcurrency: number | undefined;
  saveData: boolean | undefined;
}): boolean {
  const smallViewport = input.viewportWidth < input.smallViewportBreakpoint;
  const fewCores =
    typeof input.hardwareConcurrency === 'number' &&
    input.hardwareConcurrency <= 4;
  return smallViewport || fewCores || input.saveData === true;
}

export function computePointCount(width: number, height: number): number {
  return Math.round(Math.min(90, Math.max(28, (width * height) / 11000)));
}
```
This split is what makes the Validation Architecture section's Wave 0 gap
actionable — both functions take primitives in, return primitives out, no
DOM/canvas/browser API required to test them.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `experimental.csp` config flag | Stable `security.csp` config key | Astro 6.0 | Any tutorial referencing `experimental.csp` is stale; this project is already on Astro 7.3.1 so only the stable key applies |
| Manual `scroll` event + `getBoundingClientRect()` polling for reveal-on-scroll | `IntersectionObserver` | Broadly since ~2019, universally supported now | Already the locked approach (ANIM-01); no action needed, just confirming this is not a dated pattern |
| Pausing canvas animation only via `document.hidden` | Pausing via `document.hidden` **and** `IntersectionObserver` together | Standard practice for years now, not a recent shift | Confirms Pattern 3's dual-gate approach is current best practice, not over-engineering |

**Deprecated/outdated:** Nothing else in this phase's scope has shifted
recently — IO, rAF, Page Visibility, matchMedia, and the Network Information
API are all long-stable Web Platform features with no pending spec churn
that would affect this implementation.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `hardwareConcurrency` clamp values (iOS Safari max 2, Firefox `resistFingerprinting` pinned to 2) are current as of late 2026 | Common Pitfalls, Pitfall 4 | Low — even if exact clamp numbers drift, the underlying behavior (privacy-motivated clamping making `<=4` trip more often than "true" core count) is a multi-year, well-established trend unlikely to reverse; D-07's threshold is a behavior contract regardless of the underlying number |
| A2 | Astro's automatic inline-vs-external decision for the bundled module script ("small enough" heuristic) has no documented byte threshold in the fetched docs | Architecture Patterns, System Architecture Diagram | Low — either outcome (inlined+hashed, or externalized+`'self'`-covered) is CSP-safe per Pitfall 5; the uncertainty doesn't affect this phase's plan, only which exact `<script>` tag shape appears in the built HTML |

**If this table is empty:** N/A — two low-risk items logged above; neither
blocks planning or requires a `checkpoint:human-verify` gate.

## Open Questions

1. **Will the locked 90-point ceiling (D-06) hold the TBT < 200 ms budget on
   real mobile hardware, or will Phase 4's Lighthouse run reveal a need to
   revisit the ceiling itself?**
   - What we know: DPR cap is already being lowered (2 → 1.5) and halving
     triggers exist for low-power devices; the O(n²) connection-line cost at
     n=90 is a few thousand operations per frame, which is small in absolute
     terms but is happening every single animation frame indefinitely on
     visitors with `hardwareConcurrency > 4` and no small-viewport/data-saver
     trigger (i.e., mid-to-high-end Android and all desktop).
   - What's unclear: Whether Lighthouse's synthetic mobile trace (which the
     project's `lighthouserc.json` already runs with `cpuSlowdownMultiplier: 4`
     against a real deployed preview) will show TBT comfortably under 200 ms
     or right at the edge, since this can't be predicted without measuring
     against actual built output.
   - Recommendation: Plan should include, as a verification step, running
     the existing `pnpm exec lhci autorun` / `scripts/security-check.sh --ci`
     against a preview deploy that has this phase's code, and treat "TBT
     regression beyond budget" as a signal to revisit tick-function
     micro-optimizations (avoid function-call overhead, avoid `Math.hypot`
     — `Math.sqrt(dx*dx+dy*dy)` is measurably cheaper — inside the O(n²)
     loop) before ever proposing to break the D-06 formula lock.

2. **Exact small-viewport breakpoint for D-08 (Claude's Discretion item).**
   - What we know: the project has exactly one existing breakpoint
     convention, `860px` (`tokens.css` line 118, `SiteHeader.astro` line
     219), used for the desktop-nav switch.
   - What's unclear: whether "small viewport" for particle-density purposes
     should reuse that same 860px threshold or use a narrower one (e.g. a
     phone-only ~480-600px threshold), since the nav breakpoint answers a
     different question (does this look like a phone/tablet layout) than
     the particle question (is this device likely to be
     GPU/CPU-constrained).
   - Recommendation: Reuse the existing `860px` breakpoint
     (`window.innerWidth < 860` or `matchMedia('(max-width: 859px)')`) for
     consistency with the rest of the codebase's single-breakpoint
     convention, unless the planner has a specific reason to diverge —
     this avoids introducing a second, undocumented breakpoint value into
     the project.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build tooling, `node --test` for Wave 0 unit tests | Yes | v24.14.0 | — |
| pnpm | Build/dev commands | Yes | 11.15.1 | — |
| `IntersectionObserver` (browser) | ANIM-01, ANIM-04 | Yes — Baseline, all evergreen browsers | — | Explicit `'IntersectionObserver' in window` guard already in Pattern 1 falls back to reveal-all |
| `ResizeObserver` (browser) | Canvas resize handling | Yes — Baseline, all evergreen browsers | — | — |
| Page Visibility API (`document.hidden`) | ANIM-04 | Yes — Baseline, universal | — | — |
| CSS Media Queries Level 4 `pointer`/`hover` | ANIM-03 | Yes — Baseline, all evergreen browsers | — | — |
| `prefers-reduced-motion` media feature | ANIM-03, ANIM-05, ANIM-06 | Yes — Baseline, universal | — | — |
| Network Information API (`navigator.connection`) | D-08's data-saver trigger | Chromium only (Chrome/Edge/Samsung Internet); absent in Firefox/Safari | — | `navigator.connection?.saveData === true` optional-chain guard degrades gracefully to `false`/not-triggered on unsupported browsers (documented in Pitfall 3) |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** Network Information API — absent on
Firefox/Safari, but the feature it gates (one of three OR'd reduction
triggers) degrades to simply not firing on those browsers, which is
already an acceptable, documented outcome (not a functional gap).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None currently installed. Recommended: Node's built-in `node:test` runner (ships with Node 24.14.0, already installed — zero new dependency) for the two pure functions only |
| Config file | none — `node --test` needs no config for a plain `.test.mjs`/`.test.ts` file |
| Quick run command | `node --test src/scripts/particles.pure.test.mjs` (or `.test.ts` if run through a loader; plain `.mjs` avoids needing one) |
| Full suite command | `node --test src/scripts/**/*.test.mjs` (or a single test dir if the plan colocates all Wave-0 tests there) |

Everything else in this phase (IO/rAF/canvas DOM behavior, the actual
visual glow/reveal, reduced-motion appearance) is **not** unit-testable
without a browser and is correctly left to the existing Lighthouse CI gate
plus manual DevTools verification called out explicitly in ROADMAP success
criterion 5 ("DevTools shows no scripting activity while the hero is
scrolled away").

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANIM-01 | Reveal fires once per element, fallback reveals all at ~2.6s | manual (DevTools: throttle CPU, scroll, observe `.is-revealed` classes; verify fallback by blocking IO support) | — | N/A — no framework for DOM/IO behavior in this project |
| ANIM-03 | Glow only attaches under `pointer:fine` + no-reduced-motion | manual (toggle `prefers-reduced-motion` in DevTools Rendering tab; test on a touch-emulated device profile) | — | N/A |
| ANIM-04 | Canvas rAF stops when scrolled away and when tab hidden | manual (DevTools Performance panel: record while scrolling hero off-screen, confirm no scripting; switch tabs, confirm no CPU activity) | — | N/A |
| ANIM-05 | Point count formula + halving triggers | unit | `node --test src/scripts/particles.pure.test.mjs` | Wave 0 gap — must be written |
| ANIM-05 | DPR capped at 1.5, static frame under reduced-motion | manual (DevTools: force `prefers-reduced-motion: reduce`, confirm canvas shows one frame with no scripting activity afterward) | — | N/A |
| ANIM-06 | `dmFloat`/`dmPulse` stop under reduced-motion | manual (already covered by Phase 3's CSS; smoke-check no regression) | — | N/A |
| ANIM-09 | No layout-triggering animated properties | automated (existing) | `pnpm exec lhci autorun` (CLS assertion `< 0.05` already in `lighthouserc.json`) | Exists |
| (cross-cutting) | JS weight budget | automated (existing) | `bash scripts/js-weight-check.sh` | Exists |
| (cross-cutting) | Lighthouse mobile ≥95 all categories, TBT <200ms | automated (existing) | `bash scripts/security-check.sh --ci` (runs `lhci autorun` internally as check 7) | Exists |

### Sampling Rate

- **Per task commit:** `pnpm build && bash scripts/js-weight-check.sh` (fast,
  local, catches JS-weight regressions immediately) plus
  `node --test src/scripts/particles.pure.test.mjs` once that file exists.
- **Per wave merge:** Full manual DevTools pass (reveal, glow, canvas pause,
  reduced-motion) against a local `astro preview` build.
- **Phase gate:** `bash scripts/security-check.sh --ci` against the deployed
  preview (runs `pnpm audit`, style/CSS/script inline greps, secret scan,
  Function count, and the full Lighthouse gate) before `/gsd:verify-work`.

### Wave 0 Gaps

- [ ] `src/scripts/particles.pure.ts` — extract `computePointCount` and
  `shouldReduceParticles` as pure functions (see Code Examples)
- [ ] `src/scripts/particles.pure.test.mjs` (or `.test.ts`) — covers ANIM-05's
  formula + all three reduction triggers (small viewport, `<=4` cores,
  `saveData`) individually and combined
- [ ] No framework install needed — `node --test` ships with the already-
  installed Node 24.14.0

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | Phase has no auth surface |
| V3 Session Management | No | No session/cookie state introduced |
| V4 Access Control | No | No access-controlled resource introduced |
| V5 Input Validation | No | No user input is processed by this phase (pointer coordinates and viewport dimensions are read-only browser state, not user-supplied data crossing a trust boundary) |
| V6 Cryptography | No | Not applicable |
| V11 (Business Logic / Client-side) | Yes | Keep all script content static and non-`eval`-based so Phase 7's `security.csp` (`script-src 'self'`, no `unsafe-inline`/`unsafe-eval`) needs zero rework — see Pitfall 5 |
| V14 Configuration | Yes | `.js-ready` must be `is:inline` and the bundled script must NOT be, per Pitfall 1 — a configuration/authoring detail, not a runtime vulnerability, but it is the mechanism by which this phase stays compatible with the CSP posture SEC-01/SEC-02 will enforce in Phase 7 |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Inline event handler attributes (`onclick=`, `onmouseover=`) reintroduced by a future contributor "for convenience" | Tampering (defeats future CSP) | `addEventListener` exclusively, as already done throughout this phase's patterns; SEC-02 (Phase 7) will hard-block `unsafe-inline` in `script-src` |
| Dynamically constructing `<script>` content or using `new Function()`/`eval()` for "clever" particle-color parsing (the design source's own regex-based hex-to-rgb parser is a borderline example, kept as a pure string-parsing function, never passed to `eval`) | Elevation of Privilege (if ever fed untrusted input) | Not applicable here — the accent color is a build-time CSS token (`--color-accent`), not user input; still, keep the parsing function free of `eval`/`Function` for CSP-readiness |

### SEC-07 mapping for this phase

The project's SEC-07 checklist (`scripts/security-check.sh`) runs 7
mechanical checks at the end of every phase. This phase interacts with:

- **Check 2** (`grep style="` in `src/`): this phase writes to
  `element.style.transform`/`element.style.opacity` from **JavaScript at
  runtime** — the grep only scans `src/*.astro`/`*.ts`/`*.js` **source
  files** for the literal string `style="`, so runtime `el.style.x = ...`
  assignments in a `.ts` file do not trip this check (they aren't the
  string `style="`). No action needed, but worth the planner's awareness:
  this check does not (and is not designed to) catch runtime inline-style
  mutation, only authored `style=""` attributes.
- **Check 3** (inline `<style>`/`@font-face` count in built HTML): unaffected
  by this phase (JS-only change).
- **Check 7** (Lighthouse gate): directly affected — see Pitfall 2 and Open
  Question 1. This is the check most likely to surface a real regression
  from this phase.

No new SEC-07 findings are anticipated from this phase's design as
researched; the planner should still run the checklist at phase close per
the existing project convention.

## Sources

### Primary (HIGH confidence)

- `docs.astro.build/en/guides/client-side-scripts/` — fetched 2026-09-16.
  Confirms default Astro `<script>` processing (auto `type="module"`,
  auto-bundle-or-inline-by-size) versus `is:inline`'s exact-as-written,
  unprocessed behavior.
- `docs.astro.build/en/guides/security/` — fetched 2026-09-16 (via
  WebFetch after the direct `/reference/configuration-reference/` fetch
  gave an incomplete answer). Confirms `security.csp` auto-hashing,
  meta-tag delivery on static pages vs header delivery on on-demand pages,
  and the `algorithm`/`directives`/`styleDirective`/`scriptDirective` API
  surface.
- `.planning/phases/04-progressive-enhancement-effects/04-CONTEXT.md` — all
  locked decisions D-01 through D-11, canonical refs, and the design source
  line references.
- `arquivos de design/Dmarques Landing.dc.html` (read directly, lines 1-40,
  170-200, 470-615) — the DC-editor reference implementation: exact glow
  div markup/styles, exact `particles(cv)` formula and resize/seed logic,
  exact `observe()` IO logic and 2600ms fallback timer.
- `src/layouts/BaseLayout.astro`, `src/components/HeroBleed.astro`,
  `src/styles/base.css`, `src/styles/tokens.css` (read directly) — confirm
  exact current state of what Phase 3 shipped that this phase attaches to
  (`.hero-canvas`/`.hero-glow` elements, `.js-ready`-gated CSS, z-index and
  color tokens, existing 860px breakpoint convention).
- `scripts/security-check.sh`, `scripts/js-weight-check.sh`,
  `lighthouserc.json`, `.planning/security/SECURITY-CHECKLIST.md` (read
  directly) — exact SEC-07/PERF-01 mechanical gates this phase must not
  regress.
- `package.json` (read directly) — confirms zero test framework installed,
  Node `>=22.12.0` engine requirement, Node 24.14.0 / pnpm 11.15.1 actually
  installed in this environment.

### Secondary (MEDIUM confidence)

- WebSearch, "Astro security.csp static pages meta tag vs SSR header stable
  Astro 6 7" — corroborates the primary-source finding on meta-vs-header CSP
  delivery via `astro.build/blog/astro-6/` and GitHub PR #13923
  (`withastro/astro`).
- WebSearch, "navigator.hardwareConcurrency browser support Safari Firefox
  fingerprinting clamped value 2026" — iOS Safari clamp-to-2 and Firefox
  `resistFingerprinting` clamp-to-2 figures, corroborated across
  testmuai.com, support.mozilla.org, and blog.send.win independently.
- WebSearch, "navigator.connection saveData Network Information API browser
  support Safari Firefox 2026 MDN" — confirms Chromium-only support, "not
  Baseline" status.
- WebSearch, "requestAnimationFrame pointermove IntersectionObserver
  Lighthouse mobile TBT best practices pitfalls 2026" — general
  corroboration that JS animation work during page load directly drives
  TBT on throttled mobile traces, and that a single self-throttling rAF
  loop is preferable to any queuing alternative.

### Tertiary (LOW confidence)

- None — all findings above were either read directly from this
  repository's own files (highest possible confidence, ground truth) or
  cross-verified against at least one official/primary source plus
  WebSearch corroboration.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — this phase adds no packages; the "stack" is fully
  specified by CLAUDE.md and the project's own already-committed CI gates.
- Architecture: HIGH — IO/rAF/Page-Visibility/matchMedia patterns are
  long-stable Web Platform primitives with no ambiguity; Astro's script
  processing/CSP mechanics were confirmed against current official docs.
- Pitfalls: MEDIUM-HIGH — the CSP and `is:inline` mechanics are HIGH
  confidence (official docs); the exact magnitude of the O(n²) canvas cost
  under real Lighthouse throttling (Pitfall 2 / Open Question 1) is
  reasoned from first principles and general Lighthouse/TBT knowledge, not
  measured against this phase's actual built output (which does not exist
  yet) — flagged explicitly as an Open Question rather than asserted as
  fact.

**Research date:** 2026-09-16
**Valid until:** 30 days (stable web-platform APIs + a project whose stack
is already locked; re-verify only if Astro is upgraded past 7.3.x or if
Phase 4's Lighthouse results contradict Pitfall 2's prediction)
