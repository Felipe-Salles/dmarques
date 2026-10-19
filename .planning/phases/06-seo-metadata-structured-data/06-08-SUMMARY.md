---
phase: 06-seo-metadata-structured-data
plan: 08
subsystem: seo
tags: [release, production, lighthouse, sec-07, rich-results]
requires: [06-07]
provides:
  - Phase 6 live on https://agenciadmarques.com.br/ (PR #6 squash-merged)
  - Production probes and lhci-production green
  - SEC-07 run for Phase 6 with no open High
  - Human validation of Rich Results, LinkedIn Post Inspector and WhatsApp card
affects: [07]
key-files:
  modified: [.planning/security/runs/phase-06.md, .github/workflows/lighthouse.yml]
key-decisions:
  - "Preview Lighthouse uses x-vercel-set-bypass-cookie so the robots.txt audit does not hit the Vercel login page (commit ec2e1fa)"
  - "Canonical fallback in lighthouserc.json was not needed"
requirements-completed: [SEO-03, SEO-04, SEO-06]
duration: n/a
completed: 2026-10-17
---

# Phase 6 Plan 08: Production release, production gates and SEC-07 Summary

Phase 6 shipped to production through PR #6 (squash commit 71b7f7036243e03deb060f2d8ce84a528f3ecd36), production probes and the production Lighthouse job passed, the SEC-07 run was written with no open High, and Felipe approved the live Rich Results test and the share card.

## Tasks

| Task | Name | Result |
|------|------|--------|
| 1 | Phase PR and merge approval | PR #6 https://github.com/Felipe-Salles/dmarques/pull/6 squash-merged 2026-10-17T22:06:21Z as 71b7f7036243e03deb060f2d8ce84a528f3ecd36 after Felipe's "pode mergear". Pre-merge checks: verify, dependency-review, lhci, Vercel all pass. |
| 2 | Production checks, production Lighthouse, SEC-07 | Commit cdc5b31. Probes all 200; lhci-production run 39073723615 success. |
| 3 | Rich Results on production and social card (checkpoint, resolved) | Felipe verified the Rich Results Test on the live URL, the LinkedIn Post Inspector card and the WhatsApp preview; reply "aprovado" on 2026-10-17. |

## Evidence

- Production: home 200 without X-Robots-Tag; robots.txt allow-all with Sitemap line; sitemap-index.xml and sitemap-0.xml 200 (only the home listed); og-image.jpg 200, image/jpeg, 31018 B.
- lhci-production run 39073723615: all four categories >= 0.95 at error level plus LCP, CLS, TBT and script-size budgets. Exact scores are unavailable because `uploadArtifacts` is off (P03-006, tracked as P06-002).
- `security-check.sh --ci`: 6 PASS / 0 FAIL / 2 SKIP.
- JS weight of the landing: 6115 B gzip of 20480 B.

## Deviations from Plan

### Preview Lighthouse deviation

**1. [Rule 3 - Blocking] Preview lhci failed on robots-txt**
- **Found during:** Task 1
- **Issue:** First run 39072489611 failed only on `robots-txt`: Lighthouse fetches robots.txt without `extraHeaders`, so Vercel Authentication served its login page.
- **Fix:** Felipe chose to add `"x-vercel-set-bypass-cookie": "true"` to extraHeaders. Commit ec2e1fa; rerun 39073329485 passed.
- **Canonical fallback:** NOT needed (canonical stayed enabled in lighthouserc.json).

### Desvio registrado: canonical em páginas noindex

Carried from 06-06: the noindex pages `/obrigado`, `/erro-envio/*` and `/404` intentionally omit the canonical. ROADMAP criterion 1 holds for every indexable page.

## Findings

- P06-001 (Low, closed): preview Lighthouse bypass cookie, commit ec2e1fa.
- P06-002 (Low, open): production Lighthouse has no exact scores; evaluate `uploadArtifacts` in an observability phase.
- P06-003 (Low, open): production home only sends HSTS among security headers in `curl -I`; deferred to the Phase 7 header audit.
- No High open.

## Known Stubs

None.

## Self-Check: PASSED

- .planning/security/runs/phase-06.md present with Task 3 outcome appended
- Commits ec2e1fa and cdc5b31 and merge commit 71b7f70 referenced from the session record
