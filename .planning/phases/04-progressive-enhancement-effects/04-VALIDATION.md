---
phase: 04
slug: progressive-enhancement-effects
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-16
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None currently installed. Node's built-in `node:test` runner (ships with Node 24.14.0, already installed — zero new dependency) for the two pure particle functions only |
| **Config file** | none — `node --test` needs no config for a plain `.test.mjs` file |
| **Quick run command** | `node --test src/scripts/particles.pure.test.mjs` |
| **Full suite command** | `node --test src/scripts/**/*.test.mjs` |
| **Estimated runtime** | ~1 second |

Everything else in this phase (IO/rAF/canvas DOM behavior, the actual visual
glow/reveal, reduced-motion appearance) is not unit-testable without a
browser and is left to the existing Lighthouse CI gate plus manual DevTools
verification called out explicitly in ROADMAP success criterion 5.

---

## Sampling Rate

- **After every task commit:** `pnpm build && bash scripts/js-weight-check.sh` (plus `node --test src/scripts/particles.pure.test.mjs` once that file exists)
- **After every plan wave:** Full manual DevTools pass (reveal, glow, canvas pause, reduced-motion) against a local `astro preview` build
- **Before `/gsd:verify-work`:** `bash scripts/security-check.sh --ci` against the deployed preview (runs `pnpm audit`, style/CSS/script inline greps, secret scan, Function count, and the full Lighthouse gate) must be green
- **Max feedback latency:** ~5 seconds (build + weight check); Lighthouse gate latency is whatever `security-check.sh --ci` already takes

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 0 | ANIM-05 | V11/V14 | `computePointCount`/`shouldReduceParticles` never `eval`/dynamic script content | unit | `node --test src/scripts/particles.pure.test.mjs` | ❌ W0 | ⬜ pending |
| 04-0x-xx | TBD | 1 | ANIM-01 | — | Reveal fires once per element; ~2.6s fallback reveals all | manual | DevTools: throttle CPU, scroll, verify `.is-revealed`; block IO support to verify fallback | N/A | ⬜ pending |
| 04-0x-xx | TBD | 1 | ANIM-03 | V11 | Glow attaches only on `pointer:fine` + no-reduced-motion; disabled entirely under reduced-motion | manual | DevTools: toggle `prefers-reduced-motion` (Rendering tab) + touch-emulated profile | N/A | ⬜ pending |
| 04-0x-xx | TBD | 1 | ANIM-04 | — | Canvas rAF stops when scrolled off-screen and when tab hidden | manual | DevTools Performance panel: record while scrolling hero away; switch tabs, confirm no CPU activity | N/A | ⬜ pending |
| 04-0x-xx | TBD | 1 | ANIM-05 | — | DPR capped at 1.5; single static frame under reduced-motion | manual | DevTools: force `prefers-reduced-motion: reduce`, confirm one static frame, no scripting after | N/A | ⬜ pending |
| 04-0x-xx | TBD | 1 | ANIM-06 | — | `dmFloat`/`dmPulse` stop under reduced-motion (Phase 3 CSS, smoke-check only) | manual | Visual smoke-check, no regression | N/A | ⬜ pending |
| 04-0x-xx | TBD | 1 | ANIM-09 | — | No layout-triggering animated properties; CLS stays <0.05 | automated (existing) | `pnpm exec lhci autorun` (CLS assertion in `lighthouserc.json`) | ✅ | ⬜ pending |
| 04-0x-xx | TBD | Phase gate | cross-cutting | V14 | JS weight budget not regressed | automated (existing) | `bash scripts/js-weight-check.sh` | ✅ | ⬜ pending |
| 04-0x-xx | TBD | Phase gate | cross-cutting / SEC-07 | — | Lighthouse mobile ≥95 all categories, TBT <200ms | automated (existing) | `bash scripts/security-check.sh --ci` (runs `lhci autorun` as check 7) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs above are placeholders — the planner assigns real plan/task IDs; this map's requirement-to-test binding must be preserved when plans are written.*

---

## Wave 0 Requirements

- [ ] `src/scripts/particles.pure.ts` — extract `computePointCount` (ANIM-05 formula: `n = round(min(90, max(28, (w*h)/11000)))`) and `shouldReduceParticles` (small viewport OR `hardwareConcurrency <= 4` OR `navigator.connection?.saveData`) as pure, testable functions
- [ ] `src/scripts/particles.pure.test.mjs` — covers the point-count formula plus all three reduction triggers individually and combined
- [ ] No framework install needed — `node --test` ships with the already-installed Node 24.14.0

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| Scroll reveal fire-once + fallback | ANIM-01 | DOM/IO behavior, no test framework wired to a browser in this project | DevTools: throttle CPU 6x, scroll page, confirm each `[data-reveal]` element gets `.is-revealed` exactly once; separately, block/disable IntersectionObserver support and confirm the ~2.6s timeout reveals everything |
| Cursor glow gating | ANIM-03 | Requires real pointer + media-query emulation | DevTools Rendering tab: force `prefers-reduced-motion: reduce` → glow must not render at all; on a touch-emulated (no `pointer:fine`) profile → glow must not attach |
| Canvas pause on scroll/tab-hidden | ANIM-04 | Requires Performance panel timeline inspection | Record a Performance trace while scrolling the hero off-screen — confirm no scripting activity; switch tabs and confirm rAF loop stops (Page Visibility) |
| Canvas DPR cap + reduced-motion static frame | ANIM-05 | Visual/canvas pixel inspection | Force `prefers-reduced-motion: reduce` in DevTools, reload, confirm a single static frame renders with zero scripting activity afterward |
| `dmFloat`/`dmPulse` reduced-motion regression check | ANIM-06 | Already covered by Phase 3 CSS; visual smoke-check only | Toggle reduced-motion, visually confirm no residual motion on floating/pulsing elements |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (particles.pure.ts/test.mjs)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s for the automated build/weight-check loop
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
