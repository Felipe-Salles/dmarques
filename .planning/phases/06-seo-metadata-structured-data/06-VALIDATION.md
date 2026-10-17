---
phase: 6
slug: seo-metadata-structured-data
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-17
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (`pnpm test` = `node --test "src/**/*.test.mjs"`) + dist-level scripts under `scripts/verify/` |
| **Config file** | none (package.json scripts) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm build && node scripts/verify/seo-gates.mjs && pnpm verify:gates && bash scripts/security-check.sh` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm build && node scripts/verify/seo-gates.mjs`
- **Before `/gsd:verify-work`:** Full suite must be green, Rich Results Test manual pass, production LHCI >= 0.95, SEC-07 run with no open High
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | SEO-01 | — | canonical absolute from `Astro.site`, omitted on noindex pages | dist | `node scripts/verify/seo-gates.mjs` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEO-03 | — | N/A | dist | `node scripts/verify/seo-gates.mjs` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEO-04 | — | sitemap excludes noindex pages | dist | `node scripts/verify/seo-gates.mjs` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEO-05 | — | N/A | dist | `node scripts/verify/seo-gates.mjs` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEO-06 | — | JSON-LD via JSON.stringify with `<` escaped | unit + dist | `pnpm test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SEO-08 | — | N/A | dist | `node scripts/verify/seo-gates.mjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Planner fills Task IDs/Plan/Wave.*

---

## Wave 0 Requirements

- [ ] `src/lib/seo.test.mjs` with `src/lib/business.ts` / `json-ld.ts` — SEO-06, SEO-08
- [ ] `scripts/verify/seo-gates.mjs` — SEO-01, SEO-03, SEO-04, SEO-05, SEO-08
- [ ] `lighthouserc.production.json` and workflow job — Lighthouse SEO gate
- [ ] `public/robots.txt`, `public/og-image.jpg` (generated)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google Rich Results Test passes | SEO-06 | no public API | Run https://search.google.com/test/rich-results against https://agenciadmarques.com.br/ after deploy |
| Share card renders on WhatsApp/LinkedIn | SEO-03 | third-party crawlers | Paste production URL in WhatsApp chat and LinkedIn Post Inspector |
| SEC-07 checklist run | SEC-07 | judgment items | `bash scripts/security-check.sh` + write `.planning/security/runs/phase-06.md` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
