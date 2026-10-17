---
phase: 6
slug: seo-metadata-structured-data
status: draft
nyquist_compliant: true
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
| 06-01-T1 | 06-01 | 1 | SEO-06, SEO-08 | T-06-01 | tests lock JSON-LD shape and escaping | unit (RED) | `node --test src/lib/seo.test.mjs` (expected to fail) | created by task | ⬜ pending |
| 06-01-T2 | 06-01 | 1 | SEO-01, SEO-06, SEO-08 | T-06-01, T-06-03 | JSON.stringify + `<` escape; NAP single source | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 06-02-T1 | 06-02 | 1 | SEO-01, SEO-03, SEO-05 | — | gate reads built HTML only | dist | `node scripts/verify/seo-gates.mjs --list` | ❌ W0 | ⬜ pending |
| 06-02-T2 | 06-02 | 1 | SEO-03, SEO-04, SEO-06, SEO-08 | T-06-04, T-06-05, T-06-06 | sitemap lists only `/`; no raw `<` in ld+json | dist | `node scripts/verify/seo-gates.mjs --list` | ❌ W0 | ⬜ pending |
| 06-03-T1 | 06-03 | 1 | SEO-01, SEO-04, SEO-05 | T-06-08 | per-audit SEO on preview, category on production | config | node assertion on `lighthouserc*.json` | ✅ | ⬜ pending |
| 06-03-T2 | 06-03 | 1 | SEO-01 | T-06-07 | production job uses no secret | config | node string check on `lighthouse.yml` | ✅ | ⬜ pending |
| 06-04-T1..T3 | 06-04 | 1 | SEO-04 | T-06-SC, T-06-09, T-06-10 | human legitimacy check before install; sitemap excludes noindex pages | dist | `pnpm build` + sitemap/robots node check + `pnpm audit --audit-level=high` | ❌ W0 | ⬜ pending |
| 06-05-T1..T2 | 06-05 | 2 | SEO-03 | T-06-11, T-06-13 | no third-party fetch; image < 300 KB | file | sharp metadata check on `public/og-image.jpg` | ❌ W0 | ⬜ pending |
| 06-06-T1 | 06-06 | 2 | SEO-01, SEO-03, SEO-05, SEO-06 | T-06-14, T-06-15 | canonical from `Astro.site`; escaped ld+json | dist | `node scripts/verify/seo-gates.mjs --check=head-home,og-twitter,icones,json-ld` | ❌ W0 | ⬜ pending |
| 06-06-T2 | 06-06 | 2 | SEO-01, SEO-08 | T-06-17 | NAP parity footer vs JSON-LD | dist | `seo-gates.mjs --check=head-home,secundarias,og-twitter,icones,json-ld,nap,marca` + aurora-gates + `pnpm test` | ❌ W0 | ⬜ pending |
| 06-07-T1 | 06-07 | 3 | SEO-01, SEO-03, SEO-04, SEO-05, SEO-06, SEO-08 | T-06-18 | seo-gates enforced in CI | dist + CI | full suite incl. `node scripts/verify/seo-gates.mjs` (10 PASS) | ❌ W0 | ⬜ pending |
| 06-07-T2 | 06-07 | 3 | SEO-03, SEO-06 | T-06-19 | — | manual | Rich Results Test (code snippet) + share image review | manual | ⬜ pending |
| 06-08-T1..T3 | 06-08 | 4 | SEO-03, SEO-04, SEO-06 | T-06-20, T-06-21, T-06-22 | merge only after human approval; SEC-07 run | production + manual | curl probes + `lhci-production` + Rich Results on URL | manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs/Plan/Wave filled by planner 2026-10-17.*

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

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [ ] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
