---
phase: 04-progressive-enhancement-effects
reviewed: 2026-09-17T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - .github/workflows/ci.yml
  - src/layouts/BaseLayout.astro
  - src/scripts/effects.ts
  - src/scripts/glow.ts
  - src/scripts/particles.pure.test.mjs
  - src/scripts/particles.pure.ts
  - src/scripts/particles.ts
  - src/scripts/reveal.ts
  - src/styles/tokens.css
findings:
  critical: 0
  warning: 5
  info: 3
  total: 8
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-09-17T00:00:00Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Reviewed the progressive-enhancement effects (reveal, cursor glow, particle canvas), the shared bootstrap script, layout wiring, design tokens, and CI pipeline. No critical/security defects were found — the hand-rolled animation code is generally careful about `prefers-reduced-motion`, pointer type, and pause-when-offscreen behavior, matching the project's stated approach. However, there is a real logic bug in the cursor-glow throttle (stale pointer coordinates), a resize/orientation-change gap in the particle canvas's reduced-motion path, a CI permissions gap that will make `dependency-review-action`'s PR-comment feature silently fail, an audit gate that is weaker than the project's own "audit limpo" requirement, and a Node engine/native-TS-import mismatch between `package.json` `engines` and what the test script actually needs to run outside CI. None of these are exploitable security holes, but several are provable functional defects that should be fixed.

## Warnings

### WR-01: Cursor glow uses stale pointer coordinates, not the latest ones, at each animation frame

**File:** `src/scripts/glow.ts:9-23`
**Issue:** The throttle pattern captures `x`/`y` from the *first* `pointermove` event of a pending batch and drops the coordinates of every subsequent event that arrives before the scheduled `requestAnimationFrame` fires (they return early via `if (pending) return;` without updating anything). The rAF callback then paints the position from that first, now-stale event rather than the most recent pointer position. During fast mouse movement this makes the glow visibly lag one or more events behind the real cursor, rather than smoothly tracking it as intended.
**Fix:** Keep the latest coordinates in outer-scoped variables that are updated on every event, and read them inside the rAF callback:
```ts
export function initGlow(): void {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (!fine || !motionOk) return;

  const glow = document.querySelector<HTMLElement>('.cursor-glow');
  if (!glow) return;

  let pending = false;
  let lastX = 0;
  let lastY = 0;
  window.addEventListener(
    'pointermove',
    (event) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        glow.style.transform = `translate3d(${lastX}px, ${lastY}px, 0)`;
      });
    },
    { passive: true },
  );
}
```

### WR-02: Particle canvas never resizes/re-seeds when `prefers-reduced-motion: reduce` is set

**File:** `src/scripts/particles.ts:87-92`
**Issue:** When reduced motion is preferred, the function seeds once, ticks once, and returns *before* registering the `IntersectionObserver`, the `visibilitychange` listener, and — critically — the `ResizeObserver`. `cv.width`/`cv.height` are fixed at whatever `getBoundingClientRect()` returned at load. If the viewport is later resized (browser window resize, or a mobile device rotation), the canvas backing store keeps its original pixel dimensions while its CSS box changes, producing a stretched/cropped static render for exactly the users who opted into the accessibility-friendly reduced-motion path.
**Fix:** Still register a `ResizeObserver` (or at minimum a debounced `resize`/`orientationchange` listener) that calls `seed()` + `tick()` again even in the reduced-motion branch, e.g.:
```ts
if (reduceMotion) {
  seed();
  tick();
  const ro = new ResizeObserver(() => {
    seed();
    tick();
  });
  ro.observe(cv);
  return;
}
```

### WR-03: `dependency-review` CI job requests a PR comment but lacks the permission to post it

**File:** `.github/workflows/ci.yml:6-7, 28-36`
**Issue:** The workflow declares `permissions: contents: read` at the top level and the `dependency-review` job adds no job-level override. `dependency-review-action`'s `comment-summary-in-pr: on-failure` option requires `pull-requests: write` to post/update the PR comment. With only `contents: read` inherited, the comment step will fail (or silently no-op depending on action version) whenever a high-severity dependency is actually found — exactly the failure case this feature exists to surface clearly.
**Fix:** Add job-level permissions for the dependency-review job:
```yaml
  dependency-review:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v7
      - uses: actions/dependency-review-action@v5.0.0
        with:
          fail-on-severity: high
          comment-summary-in-pr: on-failure
```

### WR-04: `pnpm audit --audit-level=high` is weaker than the project's stated "audit limpo" requirement

**File:** `.github/workflows/ci.yml:25`
**Issue:** `CLAUDE.md` states the security constraint as "dependências auditadas (`npm audit` limpo)" — i.e. a clean audit, not just "no high/critical findings." The CI gate only fails on `high` severity, so `moderate` and `low` severity advisories (which `pnpm audit` would otherwise report) pass CI silently, contradicting the documented requirement and letting known vulnerabilities accumulate unnoticed.
**Fix:** Either tighten the gate (`--audit-level=moderate` or no flag, i.e. any finding fails) or, if `high` is an intentional accepted risk threshold, update `CLAUDE.md`'s constraint text to match reality so the two don't silently diverge.

### WR-05: Test script depends on native TypeScript stripping that isn't guaranteed at the documented minimum Node version

**File:** `package.json:8, 15`; `src/scripts/particles.pure.test.mjs:3`
**Issue:** `engines.node` declares `>=22.12.0`, and the tech-stack doc in `CLAUDE.md` repeats "Minimum Node 22.12 (Astro 7 engine requirement)". The test script (`node --test "src/scripts/*.test.mjs"`) imports `./particles.pure.ts` directly with a `.ts` extension, relying on Node's native TypeScript type-stripping. That feature is not unflagged/on-by-default at Node 22.12 — it requires either the `--experimental-strip-types` flag or a newer Node line where it ships enabled by default. CI happens to use Node 24 (`ci.yml:18`) so it passes there, but any contributor following the documented minimum-supported Node version (22.12) to run `pnpm test` locally will get an import failure, not the tests.
**Fix:** Either bump `engines.node` to the actual minimum version that supports unflagged `.ts` imports in `node --test` and keep it in sync with `CLAUDE.md`, or add `NODE_OPTIONS=--experimental-strip-types` to the `test` script so behavior is consistent across supported Node versions:
```json
"test": "node --experimental-strip-types --test \"src/scripts/*.test.mjs\""
```

## Info

### IN-01: Small-viewport breakpoint (`860`) is duplicated with no shared source of truth

**File:** `src/scripts/particles.ts:42`; `src/styles/tokens.css:119`
**Issue:** The `860` breakpoint used to decide `smallViewportBreakpoint` for particle reduction is hardcoded in `particles.ts` and independently duplicated as the `@media (min-width: 860px)` breakpoint in `tokens.css`. If the design breakpoint changes in one place, the other silently drifts out of sync.
**Fix:** Extract the value to a single constant/CSS custom property read at runtime (e.g. expose it via a data attribute or a shared TS constant imported by both the CSS build step and `particles.ts`), or at minimum add a comment in both files cross-referencing the other.

### IN-02: Magic number `6.2832` used instead of `Math.PI * 2`

**File:** `src/scripts/particles.ts:82`
**Issue:** `ctx.arc(p.x, p.y, p.r, 0, 6.2832)` hardcodes a truncated approximation of 2π (`Math.PI * 2 ≈ 6.283185307179586`) instead of computing it, hurting readability and introducing (imperceptible but unnecessary) imprecision.
**Fix:** `ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);`

### IN-03: `prefers-reduced-motion` / `pointer: fine` checks in `initGlow` are evaluated once and never re-checked

**File:** `src/scripts/glow.ts:2-4`
**Issue:** `initGlow` reads `matchMedia(...).matches` only at script-init time. If a user changes their OS-level reduced-motion setting, or switches input devices, after the page has loaded, the `pointermove` listener's behavior (attached or not) won't update to reflect it — although the CSS media query on `.cursor-glow` will still hide the element visually, so this is wasted computation rather than a visible bug.
**Fix:** Optionally add `MediaQueryList` `change` listeners for both queries to add/remove the `pointermove` listener dynamically, if this edge case matters for the target audience; otherwise document it as an accepted limitation.

---

_Reviewed: 2026-09-17T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
