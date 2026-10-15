# Phase 4: Progressive-Enhancement Effects - Pattern Map

**Mapped:** 2026-09-17
**Files analyzed:** 7 (6 new, 1 modified)
**Analogs found:** 2 exact (in-repo) / 5 no-in-repo-analog (use adapted RESEARCH.md patterns + design source formulas)

## Important Context for the Planner

This is a **greenfield JS phase in an otherwise zero-JS codebase.** `src/` currently
contains **zero** `<script>` tags and **zero** `.ts`/`.js` script files (confirmed via
grep across `src/`). There is therefore no in-repo controller/service/component analog
for the five new script files — the only prior art is:

1. **`04-RESEARCH.md`'s Pattern 1/2/3 code examples** — already adapted to this
   project's conventions (class-toggle not inline-style, `is:inline` for the
   pre-paint toggle). Treat these as the primary analog for structure/idiom.
2. **The design source** `arquivos de design/Dmarques Landing.dc.html` (lines
   478–609) — the exact formulas (point count, DPR cap, velocity/radius,
   connection-line threshold/alpha, hex→rgb parsing) must be carried forward
   **verbatim as math**, but the DC-editor's `class Component extends DCLogic`
   runtime wrapper, `this.state`, `this._raf`/`this._io` instance fields, and its
   `el.style.opacity`/`el.style.transform` reveal-mutation must **not** be copied
   — CONTEXT.md and UI-SPEC.md both explicitly forbid copying it verbatim.
3. **`src/layouts/BaseLayout.astro`** and **`src/components/HeroBleed.astro`** —
   real in-repo files this phase edits/attaches to. These are the two **exact**
   analogs in this map (existing file being extended, and existing element
   markup/CSS-token conventions to mirror for the new glow div's styling).

Do not invent a "closest existing controller" for the script files where none
exists — flag them in "No Analog Found" and point the planner at the adapted
RESEARCH.md pattern instead, per this agent's own instructions.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/layouts/BaseLayout.astro` (modified) | layout/provider | request-response (SSG render) | itself (existing file, read in full below) | exact |
| `src/scripts/effects.ts` (new) | utility (entry/orchestrator) | event-driven | RESEARCH.md Architecture Diagram + Patterns 1-3 (adapted) | no-in-repo-analog |
| `src/scripts/reveal.ts` (new) | utility (DOM behavior) | event-driven | RESEARCH.md Pattern 1 (adapted from design source `observe()`) | no-in-repo-analog |
| `src/scripts/glow.ts` (new) | utility (DOM behavior) | event-driven | RESEARCH.md Pattern 2 (adapted from design source `componentDidMount`'s `_onMove`) | no-in-repo-analog |
| `src/scripts/particles.ts` (new) | utility (canvas/DOM behavior) | streaming (rAF loop) + event-driven (IO/visibility gates) | RESEARCH.md Pattern 3 + design source `particles(cv)` (formulas only) | no-in-repo-analog |
| `src/scripts/particles.pure.ts` (new) | utility (pure functions) | transform | RESEARCH.md "Reduction-trigger predicate" code example | no-in-repo-analog |
| `src/scripts/particles.pure.test.mjs` (new) | test | batch | none (no test framework/file exists anywhere in repo) — use Node's built-in `node:test` idiom from RESEARCH.md Validation Architecture | no-in-repo-analog |

## Pattern Assignments

### `src/layouts/BaseLayout.astro` (modified — layout, request-response)

**Analog:** itself, current state (full file, 23 lines) — read directly:

```astro
---
import { Font } from 'astro:assets';
import Analytics from '@vercel/analytics/astro';
import '../styles/tokens.css';
import '../styles/base.css';

const { title = 'Dmarques — Soluções Web' } = Astro.props;
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <Font cssVariable="--font-display" preload={[{ weight: 700, style: 'normal' }]} />
    <Font cssVariable="--font-body" preload={[{ weight: 400, style: 'normal' }]} />
  </head>
  <body>
    <slot />
    <Analytics />
  </body>
</html>
```

**What to add (per D-01–D-05, D-11, and UI-SPEC §5):**

1. In `<head>`, immediately after the `<Font>` tags (or anywhere in `<head>` —
   position within `<head>` doesn't matter, only that it's before `</body>` content
   paints, which `<head>` placement guarantees):
   ```astro
   <script is:inline>
     document.documentElement.classList.add('js-ready');
   </script>
   ```
   This is the exact pattern named in D-11 and RESEARCH.md Pitfall 1 — `is:inline`
   is mandatory here, a plain `<script>` would be auto-converted to a deferred
   `type="module"` and reintroduce the flash-of-content bug.

2. In `<body>`, add the new global glow div **before** `<slot />` or after it —
   either order is safe since it's `position: fixed` and `z-index`-layered, not
   flow-affecting. Mirror `HeroBleed.astro`'s existing convention of an
   `aria-hidden="true"` decorative element with a scoped `<style>` block for its
   static CSS (see `HeroBleed.astro` excerpt below) — do **not** author
   `style="..."` inline on the element itself (SITE-04 / UI-SPEC §2 CSS authoring
   constraint):
   ```astro
   <div class="cursor-glow" aria-hidden="true"></div>
   ```
   ```css
   <style>
     .cursor-glow {
       position: fixed;
       top: 0;
       left: 0;
       width: 640px;
       height: 640px;
       margin: -320px 0 0 -320px;
       border-radius: 50%;
       background: radial-gradient(
         circle,
         rgba(108, 76, 255, 0.28) 0%,
         rgba(108, 76, 255, 0.1) 38%,
         rgba(108, 76, 255, 0) 68%
       );
       pointer-events: none;
       z-index: 5;
       mix-blend-mode: screen;
       will-change: transform;
     }

     @media (prefers-reduced-motion: reduce) {
       .cursor-glow {
         display: none;
       }
     }
   </style>
   ```
   Note: the three gradient stops/alphas are lifted verbatim from the design
   source (line 30) per D-01/D-04 — do **not** substitute `--color-accent-glow`
   or any other existing token, their alpha values differ (see Color excerpt
   below). The `@media (prefers-reduced-motion: reduce) { display: none }` rule
   is a CSS-level belt-and-suspenders for D-05; the JS in `glow.ts` must still
   gate creation of any *positional* behavior on the same media query (D-05 says
   "does not render at all", so JS should also skip appending the element under
   reduced-motion rather than relying on CSS alone — see `glow.ts` pattern below).

3. Before `</body>`, add the single bundled module script:
   ```astro
   <script>
     import '../scripts/effects.ts';
   </script>
   ```
   Astro's default (non-`is:inline`) `<script>` processing auto-adds
   `type="module"`, bundles/hashes it — exactly what D-10 requires. Do not add
   `is:inline` here; do not split this into multiple `<script>` tags.

**z-index token to reuse for the glow:** `--z-glow: 5` (`tokens.css` line 105) —
the design source hardcodes `z-index:5`; the UI-SPEC's exact-stops instruction
means hand-authoring `z-index: 5` (matching the token's value) is acceptable
here since the token itself already equals 5 — using `var(--z-glow)` instead of
the literal `5` is preferred for consistency with `HeroBleed.astro`'s own usage
(`z-index: var(--z-canvas)` / `var(--z-glow)`, see below) and does not violate
any locked value.

---

### `src/components/HeroBleed.astro` (read-only reference, NOT modified)

**Why it's here:** this is the analog for (a) how a decorative `aria-hidden`
element's static styles are authored as a scoped `<style>` class rather than
inline `style=""`, and (b) the z-index token names the canvas/glow scripts must
respect.

**Existing element markup** (lines 65-67):
```astro
<canvas class="hero-canvas" aria-hidden="true"></canvas>
<div class="hero-glow" aria-hidden="true"></div>
```

**Existing scoped-style pattern for those two elements** (lines 216-237):
```css
.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: var(--z-canvas);
}

.hero-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(55% 50% at 65% 45%, var(--color-accent-glow) 0%, transparent 70%);
  pointer-events: none;
  z-index: var(--z-glow);
}
```
`particles.ts` attaches to `document.querySelector('.hero-canvas')` (or an
equivalent query) — no new canvas element, no changes to this file. `glow.ts`
creates a **different** element (`.cursor-glow` in `BaseLayout.astro`, D-02) —
never touches `.hero-glow`.

---

### `src/styles/base.css` (read-only reference, NOT modified)

**Why it's here:** this is what `reveal.ts` must plug into without altering.

**`[data-reveal]` + `.js-ready` gate** (lines 53-71):
```css
[data-reveal] {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: no-preference) {
  html.js-ready [data-reveal] {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity var(--dur-reveal) var(--ease-out),
      transform var(--dur-reveal) var(--ease-out);
  }

  html.js-ready [data-reveal].is-revealed {
    opacity: 1;
    transform: none;
  }
}
```
`reveal.ts` must only ever do `element.classList.add('is-revealed')` — this CSS
already owns the visual transition. Never write `element.style.opacity`/
`element.style.transform` from `reveal.ts` (that's the DC-editor's pattern,
explicitly forbidden by RESEARCH.md's Anti-Patterns and UI-SPEC §1).

**Blanket reduced-motion rule** (lines 97-109) — already stops `dmFloat`/
`dmPulse` and zeroes all transition/animation durations project-wide; Phase 4
adds no new consumer of these keyframes and must not reintroduce animated
properties outside this guard.

---

### `src/styles/tokens.css` (read-only reference, NOT modified)

**Accent color tokens** (lines 14-22) — `--color-accent: #6c4cff;` is the
single source of truth the particle/glow scripts must read via
`getComputedStyle(document.documentElement).getPropertyValue('--color-accent')`
and decompose to RGB themselves (UI-SPEC §Color "token-authoring instruction")
— **never hardcode `#6C4CFF` or `108,76,255` in the new `.ts` files.**

**Z-index tokens** (lines 103-108):
```css
--z-below: -1;
--z-canvas: 0;
--z-glow: 5;
--z-section: 10;
--z-nav: 50;
--z-skiplink: 100;
```

**Existing breakpoint convention** (lines 118-122, also `SiteHeader.astro` line
219) — the only breakpoint value in the whole project:
```css
@media (min-width: 860px) {
  :root {
    --nav-height: 68px;
  }
}
```
UI-SPEC §3 locks reuse of this exact `860` value (`window.innerWidth < 860`) for
`particles.pure.ts`'s small-viewport reduction trigger — do not introduce a
second, unrelated breakpoint number.

---

### `src/scripts/reveal.ts` (new — utility, event-driven)

**Analog:** RESEARCH.md Pattern 1 (already adapted from design source
`observe()`/`revealAll()`, lines 488-538 of the design source, with the
inline-style mutation replaced by class toggling per UI-SPEC §1):

```typescript
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
Export this as `initReveal` (or run it as the module's side effect, matching
whatever `effects.ts` entry pattern the planner picks) — exact `rootMargin`/
`threshold`/`2600` values are locked (ROADMAP success criterion 1), do not
parametrize or "improve" them.

**Design-source values this must match exactly** (`Dmarques Landing.dc.html`
lines 520-538): `rootMargin: '0px 0px -8% 0px'`, `threshold: 0.08`, fallback
`setTimeout(..., 2600)` — confirmed identical to RESEARCH.md's Pattern 1.

---

### `src/scripts/glow.ts` (new — utility, event-driven)

**Analog:** RESEARCH.md Pattern 2 (adapted from design source
`componentDidMount`'s `_onMove` handler, lines 490-499 + the glow div markup at
line 30):

```typescript
function initGlow() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!fine || !motionOk) return;

  const glow = document.querySelector<HTMLElement>('.cursor-glow');
  if (!glow) return;

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
Difference from the RESEARCH.md example: this version **queries** the
`.cursor-glow` element already rendered by `BaseLayout.astro` (D-01/D-03) rather
than `document.createElement` + `appendChild`, since the element's static CSS
(gradient/size/blend-mode) is authored in `BaseLayout.astro`'s scoped `<style>`
block (SITE-04 constraint — see BaseLayout.astro pattern above), not built by
JS. If `!fine || !motionOk`, the function returns without ever touching the
element — matching D-05's "not even parked at a fixed position."

Design-source styling this element already carries (line 30, verbatim,
already placed in `BaseLayout.astro` per the pattern above): 640×640px,
`margin:-320px 0 0 -320px`, the three-stop radial gradient, `mix-blend-mode:
screen`, `pointer-events:none`, `will-change:transform`.

---

### `src/scripts/particles.ts` (new — utility, streaming + event-driven)

**Analog:** RESEARCH.md Pattern 3 (dual-gate pause/resume, standard MDN idiom)
combined with the design source's `particles(cv)` method (lines 540-588) for
the exact seed/tick formulas — **do not copy the DC-editor's `this._raf`/
`this._io`/`this._ro` instance-field style; do not copy its `el.style.opacity`
reveal call (irrelevant to this file); do carry forward its math verbatim.**

**Pause/resume dual-gate** (RESEARCH.md Pattern 3, verified against MDN
IntersectionObserver + Page Visibility docs):
```javascript
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
**Critical anti-pattern to avoid** (RESEARCH.md Anti-Patterns): both the IO
callback and the `visibilitychange` handler must call the same `syncLoop()` —
never let either one call `requestAnimationFrame`/`cancelAnimationFrame`
directly, or two concurrent tick loops can start.

**Design-source seed/tick formulas to carry forward verbatim as math**
(`Dmarques Landing.dc.html` lines 540-588), with the two locked deltas from
D-06 (`min(1.5, devicePixelRatio)` not `min(2, ...)`) and D-08 (halve `n` when
`shouldReduceParticles(...)` from `particles.pure.ts` is true):

```javascript
const dpr = Math.min(2, window.devicePixelRatio || 1);
let w = 0, h = 0, pts = [];
const seed = () => {
  const r = cv.getBoundingClientRect();
  w = Math.max(1, r.width); h = Math.max(1, r.height);
  cv.width = w * dpr; cv.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.round(Math.min(90, Math.max(28, (w * h) / 11000)));
  pts = Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
    r: Math.random() * 1.5 + 0.5
  }));
};
const tick = () => {
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
      if (d < 108) {
        ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.16 * (1 - d / 108)).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
    ctx.fillStyle = i % 4 === 0 ? 'rgba(' + rgb + ',.75)' : 'rgba(255,255,255,.30)';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
  }
};
```
Per RESEARCH.md Pitfall 2, prefer `Math.sqrt(dx*dx+dy*dy)` over `Math.hypot`
inside the O(n²) loop if TBT is tight (`Math.hypot` is measurably slower) —
this is a discretionary micro-optimization, not a locked requirement.

**Hex→RGB parsing** (design source lines 548-551, adapt to read
`--color-accent` instead of a `props.accentColor`, per UI-SPEC's
token-authoring instruction — never `eval`, keep as a pure string-parsing
function):
```javascript
const rgb = (() => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(accent);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].join(',') : '108,76,255';
})();
```

**Reduced-motion fallback (D-09):** check `matchMedia('(prefers-reduced-motion:
reduce)').matches` once at init; if true, call `seed()` + one `tick()`-equivalent
static draw and **skip** `attachPauseControls`/`ResizeObserver` entirely (no
loop exists to pause).

**Resize handling** (design source lines 565-566, unchanged):
```javascript
this._ro = new ResizeObserver(seed);
this._ro.observe(cv);
```
(rewritten without the `this._ro` instance field — use a local `const ro =
new ResizeObserver(seed); ro.observe(cv);` in the module-scoped/function-scoped
style the rest of this phase's files use, consistent with `reveal.ts`/`glow.ts`
having no class-based state either).

---

### `src/scripts/particles.pure.ts` (new — utility, transform)

**Analog:** RESEARCH.md's "Reduction-trigger predicate as a pure, testable
function" code example — copy near-verbatim, this is already written for this
exact project:

```typescript
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
Callers in `particles.ts` supply `smallViewportBreakpoint: 860` (the existing
project breakpoint, per UI-SPEC §3), `hardwareConcurrency:
navigator.hardwareConcurrency`, `saveData: navigator.connection?.saveData`
(optional-chained per RESEARCH.md Pitfall 3 — never
`navigator.connection.saveData` unguarded). When `shouldReduceParticles(...)`
is `true`, `particles.ts` must halve the result of `computePointCount(w, h)`
(D-08) — the halving itself lives in `particles.ts`, not in these pure
functions (keeps `computePointCount` a 1:1 match with the locked formula).

---

### `src/scripts/particles.pure.test.mjs` (new — test, batch)

**Analog:** none in-repo (zero test files/framework exist anywhere in this
project). Use RESEARCH.md's Validation Architecture section verbatim as the
pattern — Node's built-in `node:test` + `node:assert`, zero new dependency:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePointCount, shouldReduceParticles } from './particles.pure.ts';

test('computePointCount clamps to [28, 90]', () => {
  assert.equal(computePointCount(100, 100), 28);
  assert.equal(computePointCount(4000, 4000), 90);
});

test('shouldReduceParticles trips on small viewport', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 500,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: 8,
      saveData: false,
    }),
    true,
  );
});
```
Run via `node --test src/scripts/particles.pure.test.mjs` (RESEARCH.md's
documented command) — if `.ts` import from a plain `.mjs` file requires a
loader in this Node/TS setup, the planner should verify at implementation time
whether a `.test.ts` run through `tsx`/`ts-node` (adds a devDependency — avoid
per RESEARCH.md's minimal-deps posture) or restructuring `particles.pure.ts`'s
export to also be importable path-extension-free is simpler; flag as an
implementation-time decision, not a pattern deviation.

---

## Shared Patterns

### Reduced-motion gate (cross-cutting, all three effects)
**Source:** RESEARCH.md "Reduced-motion gate for the whole bundle" idiom, MDN
`matchMedia` standard.
**Apply to:** `effects.ts` entry point (check once, branch per-effect) —
```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;
```
`reveal.ts` never needs to branch on this (CSS already makes it a no-op).
`glow.ts` checks the inverse (`no-preference`) itself via its own `matchMedia`
call inside `initGlow()` (don't thread a shared boolean through — each effect
does its own gate check per the Pattern 2/3 examples above, this shared
snippet is for `effects.ts`'s canvas branch specifically: static frame vs.
full loop).

### Class-toggle only, never inline style writes from JS (reveal + all effects)
**Source:** `src/styles/base.css` lines 53-71 (the CSS this constrains),
RESEARCH.md Anti-Patterns.
**Apply to:** `reveal.ts` exclusively uses `classList.add('is-revealed')`.
`glow.ts`'s `element.style.transform = ...` is the **one sanctioned exception**
(a per-frame positional write CSS cannot express) — confirmed non-issue for
`scripts/security-check.sh` check 2 (only greps authored `style="` in source
files, not runtime `.style.x =` assignments) per RESEARCH.md's SEC-07 mapping.

### `--color-accent` token, never a hardcoded hex
**Source:** `src/styles/tokens.css` line 14; UI-SPEC §Color token-authoring
instruction.
**Apply to:** `particles.ts` (canvas fill/stroke colors) — read via
`getComputedStyle(document.documentElement).getPropertyValue('--color-accent')`
and reuse the design source's hex→rgb regex parser shown above. `glow.ts`
never needs this — the glow's gradient color is baked into `BaseLayout.astro`'s
scoped CSS (static, not computed at runtime), also as `rgba(108, 76, 255,
...)` per D-04's literal-value lock (the UI-SPEC explicitly says do not
substitute `--color-accent-glow`, so this one CSS declaration is an
intentional, locked exception to "always use the token" — do not "fix" it into
a `var()` reference).

### Zero comments in every new file
**Source:** Phase 1 D-04 (project-wide), restated in `04-CONTEXT.md` and
`04-UI-SPEC.md` §5.
**Apply to:** all six new files listed above, no exceptions.

### `is:inline` vs. default `<script>` processing
**Source:** `docs.astro.build/en/guides/client-side-scripts/` (cited in
RESEARCH.md Pitfall 1); no in-repo prior example since this is the first
`<script>` tag in the project.
**Apply to:** `BaseLayout.astro` only — the `.js-ready` toggle **must** be
`is:inline`; the `effects.ts` import script **must not** be (needs Astro's
default bundling/hashing).

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/scripts/effects.ts` | utility (entry) | event-driven | No `.ts`/`.js` script file exists anywhere in `src/` today — this is the first. Use RESEARCH.md's Architecture Diagram (System Architecture Diagram section) as the wiring reference: import `reveal.ts`, `glow.ts`, `particles.ts`, call each effect's `init*()` guarded by the reduced-motion check. |
| `src/scripts/reveal.ts` | utility | event-driven | Same as above; RESEARCH.md Pattern 1 is the adapted substitute analog. |
| `src/scripts/glow.ts` | utility | event-driven | Same as above; RESEARCH.md Pattern 2 is the adapted substitute analog. |
| `src/scripts/particles.ts` | utility | streaming + event-driven | Same as above; RESEARCH.md Pattern 3 + design source formulas (behavior/math reference only, never copy the DC-editor runtime wrapper) are the substitute analogs. |
| `src/scripts/particles.pure.ts` | utility (pure) | transform | Same as above; RESEARCH.md's own inline code example is the substitute analog (it was written directly for this file). |
| `src/scripts/particles.pure.test.mjs` | test | batch | No test file or test framework exists anywhere in the repo (confirmed via `package.json` — no `vitest`/`jest`/`node:test` script entry). RESEARCH.md's Validation Architecture section is the substitute analog. |

## Metadata

**Analog search scope:** `src/` (full tree — components, layouts, styles,
pages, content), `package.json`, `astro.config.mjs`, `biome.json`,
`tsconfig.json`, `arquivos de design/Dmarques Landing.dc.html` (design
reference, lines 1-40, 476-609), `.planning/phases/04-*/04-{CONTEXT,RESEARCH,UI-SPEC}.md`.
**Files scanned:** 20 `src/` files (all `.astro`/`.css`/`.ts` files in the
project) + the design source HTML + phase planning docs.
**Pattern extraction date:** 2026-09-17
