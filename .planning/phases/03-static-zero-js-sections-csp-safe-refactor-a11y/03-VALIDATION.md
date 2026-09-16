---
phase: 3
slug: static-zero-js-sections-csp-safe-refactor-a11y
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-09-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (no Jest/Vitest/Playwright in this repo) — validation is gate-script + build-assertion based |
| **Config file** | `.github/workflows/ci.yml` (orchestrates `astro check` → `pnpm build` → `pnpm audit` → `js-weight-check.sh` → `security-check.sh --ci`), `lighthouserc.json` |
| **Quick run command** | `pnpm build && bash scripts/security-check.sh --ci` (skips the Lighthouse network round-trip; runs checks 1-5 locally) |
| **Full suite command** | full `security-check.sh --ci` against a live `PREVIEW_URL` (checks 6-7, headers + Lighthouse) — requires a Vercel preview deployment |
| **Estimated runtime** | ~30s quick / ~3-5min full (Lighthouse network round-trip) |

---

## Sampling Rate

- **After every task commit:** `pnpm build` (catches `MissingSharp`, broken markup, missing content-collection fields) + local `security-check.sh --ci` checks 1-5
- **After every plan wave:** full `security-check.sh --ci` against the phase's Vercel preview URL (checks 6-7: header baseline + Lighthouse gate)
- **Before `/gsd:verify-work`:** Lighthouse mobile ≥95 all four categories on the real preview (PERF-01); manual contrast-solver run confirming every changed token clears its target ratio; manual `curl -I` 404 check; manual keyboard-only nav pass
- **Max feedback latency:** ~30s (build-based checks after each task)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-00-01 | 00 | 0 | (prereq) | — | N/A | build | `pnpm build` (must fail loudly with MissingSharp BEFORE this task, pass AFTER) | ✅ exists | ⬜ pending |
| 03-XX-XX | — | — | SITE-04 | — | No `style=""` anywhere in `src/` | grep-gate | `bash scripts/security-check.sh --ci` (check 2) | ✅ exists | ⬜ pending |
| 03-XX-XX | — | — | SITE-09 / PERF-05 | — | Images processed at build only, AVIF/WebP present | build assertion | `pnpm build` + manual inspect of `.vercel/output/static/_astro/*.avif`/`*.webp` | ✅ build gate exists; manual inspection needed | ⬜ pending |
| 03-XX-XX | — | — | A11Y-06 | — | WCAG AA contrast (4.5:1 body / 3:1 large text) | computed, not automated | Contrast-solver script run against final token values before commit | ❌ Wave 0 gap | ⬜ pending |
| 03-XX-XX | — | — | A11Y-03 | — | Focus ring ≥3:1 on dark and light sections | computed, not automated | Same contrast-solver script, run against composited `--focus-ring` value | ❌ Wave 0 gap | ⬜ pending |
| 03-XX-XX | — | — | SITE-08 | — | Branded 404 actually served by Vercel (not a generic host 404) | manual/live check | `curl -I https://<preview>/this-does-not-exist` after deploy | ❌ Wave 0 gap | ⬜ pending |
| 03-XX-XX | — | — | SITE-06 / A11Y-04 | — | Mobile nav keyboard-operable, no focus trap | manual | Tab-through test with keyboard only, no mouse | ❌ Wave 0 gap (inherently manual) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task IDs are placeholders — the planner assigns real plan/task numbers; this map's Requirement/Test Type/Command columns are the binding contract.*

---

## Wave 0 Requirements

- [ ] **`sharp` devDependency addition** — `pnpm add -D sharp@0.35.4` (pinned to the version already resolved transitively in `pnpm-lock.yaml`). Must land as the phase's first task: `astro:assets` `<Image>`/`<Picture>` throw `MissingSharp` under this repo's strict pnpm layout without it, and every later image-based task's build verification depends on this being fixed first.
- [ ] **Contrast-solver script** (ad hoc, not committed to the repo per D-13 — "calculate and apply", no approval-table tooling required) — computes minimum alpha of white against `#0A0A12` / `#05050A` / the `#0A0A12→#0D1B2A` gradient for 4.5:1 (body) and 3:1 (large text/UI), and validates `#6C4CFF` / `--focus-ring` against the same targets. Run manually before committing any token change in `tokens.css`.
- [ ] **Manual 404-on-Vercel verification step** — no existing script checks this; add as a documented manual step (`curl -I` against the phase's preview URL) rather than a CI gate, since it requires a live deployment.

*Existing infrastructure (`security-check.sh`, `js-weight-check.sh`, `lighthouserc.json`, CI pipeline) covers checks 1-5 and the Lighthouse gate; the three items above are the only gaps.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WCAG AA contrast on every recalculated color token | A11Y-06 | No automated contrast-ratio check exists in this repo's CI; contrast math must be verified against final hex/alpha values before commit | Run the contrast-solver script against `tokens.css` for every background × text-color pair changed in this phase; confirm ≥4.5:1 (body) / ≥3:1 (large text, UI, focus ring) |
| Focus ring contrast ≥3:1 on dark AND light sections | A11Y-03 | Same reason — contrast math, not a build assertion | Same contrast-solver script, run against the composited `--focus-ring` value on both a dark-section and a light-section background |
| Branded `/404` actually served by Vercel (not a platform default) | SITE-08 | Requires a live Vercel preview deployment; cannot be asserted at build time | `curl -I https://<preview-url>/this-does-not-exist` after deploy; confirm response body is the branded page, not a Vercel platform 404 |
| Mobile nav keyboard operability, no focus trap | SITE-06 / A11Y-04 | Native `<details>` behavior is well-established but the specific implementation (icon `<summary>`, CTA outside the disclosure) should still be spot-checked by a human | Tab through the entire header (skip link → logo → nav disclosure → CTA) using keyboard only, no mouse; confirm focus never gets stuck and the disclosure opens/closes via Enter/Space on `<summary>` |
| Whole page visible with JavaScript disabled | ANIM-02 | Requires disabling JS in a real browser, not a build assertion | Disable JavaScript in DevTools, reload the page, confirm every section is fully visible (no `opacity:0` elements stuck hidden) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (sharp dependency, contrast-solver, manual 404 check)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (quick path)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
