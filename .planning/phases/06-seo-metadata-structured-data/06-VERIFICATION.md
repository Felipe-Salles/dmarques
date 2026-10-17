---
phase: 06-seo-metadata-structured-data
verified: 2026-10-17T19:30:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
---

# Phase 6: SEO / Metadata / Structured Data Verification Report

**Phase Goal:** The site is fully shareable and locally discoverable — complete metadata, social cards, and single-sourced structured data.
**Verified:** 2026-10-17
**Status:** passed
**Re-verification:** No — initial verification

## Observable Truths

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|---|---|---|
| 1 | Title, ~150-char description (Ibitinga/sites/sistemas/automações), absolute canonical, favicon set, apple-touch-icon, theme-color #070A14 | VERIFIED | Live curl of production: title "Sites, sistemas e automações em Ibitinga/SP \| Dmarques", description cites all four terms, canonical `https://agenciadmarques.com.br/`, favicon.ico + 32x32 png + apple-touch-icon, theme-color `#070A14`. Gates `head-home`, `secundarias`, `icones` PASS locally on a fresh build. |
| 2 | OG and Twitter Card complete, static 1200x630 image <300 KB in public/ | VERIFIED | `og:title/url/image` (absolute) and `twitter:card=summary_large_image` live; `public/og-image.jpg` is 31,018 bytes (local and production Content-Length); gates `og-twitter` and `og-image` (sharp dimensions check) PASS; production returns 200 for the image. Felipe approved the image and LinkedIn/WhatsApp previews. |
| 3 | sitemap.xml via @astrojs/sitemap and allow-all robots.txt pointing to it | VERIFIED | Build log: `sitemap-index.xml` created; production returns 200; live robots.txt is `User-agent: * / Allow: /` plus `Sitemap: https://agenciadmarques.com.br/sitemap-index.xml`. Gates `sitemap`, `robots` PASS. |
| 4 | JSON-LD ["ProfessionalService","LocalBusiness"] with founder Person, E.164 phone, areaServed, address SP/BR, sameAs Instagram, image/logo; passes Rich Results; NAP identical footer/JSON-LD | VERIFIED | Live JSON-LD contains every listed field (telephone `+5516996111785`, `addressRegion: SP`, `addressCountry: BR`, Instagram sameAs, image, logo, founder Person). Rich Results Test: 2 valid items, 0 errors (recorded evidence). Gates `json-ld`, `nap`, `marca` PASS. |
| 5 | Lighthouse mobile >=95 in all four categories; SEC-07 checklist with no open High | VERIFIED | lhci-production run 39073723615 success at error level (recorded; not re-run). SEC-07 evidence in `.planning/security/runs/phase-06.md`. Code review: 0 critical. |

**Score:** 5/5

## Behavioral Spot-Checks and Probes

| Check | Command | Result | Status |
|---|---|---|---|
| Build | `pnpm build` | Complete, sitemap-index emitted | PASS |
| SEO gates | `node scripts/verify/seo-gates.mjs` | 10 PASS / 0 FAIL | PASS |
| Tests | `pnpm test` | 129 pass / 0 fail | PASS |

## Requirements Coverage

| Requirement | Description | Status | Evidence |
|---|---|---|---|
| SEO-01 | title, description, canonical | SATISFIED | SC1 evidence |
| SEO-03 | OG + Twitter + share image | SATISFIED | SC2 evidence |
| SEO-04 | sitemap + robots | SATISFIED | SC3 evidence |
| SEO-05 | favicons, apple-touch-icon, theme-color | SATISFIED | SC1 evidence |
| SEO-06 | JSON-LD ProfessionalService/LocalBusiness | SATISFIED | SC4 evidence |
| SEO-08 | NAP identical footer/JSON-LD | SATISFIED | `nap` gate PASS |

Cross-reference: all six IDs are in ROADMAP Phase 6 and marked Complete in REQUIREMENTS.md. SEO-02 belongs to Phase 3. SEO-07 is dropped (04.1 D-02, FAQPage removed) and is not an orphan. No orphaned requirements.

## Anti-Patterns

No TBD/FIXME/XXX markers in src, scripts or public (the only grep hit is a binary image). Open review items, none blocking:

| Item | Severity | Note |
|---|---|---|
| WR-01 `process.exit` inside try in `scripts/generate-og.mjs` | Warning | Build-time tooling only; no effect on the shipped site |
| WR-02 font-loaded check in OG generator always passes | Warning | Image was human-approved |
| WR-03 SEO category is not asserted on preview | Warning | Deliberate (noindex on preview); compensated by 9 error-level audits and the production gate |
| WR-04 `og:url` on 404/noindex pages and implicit trailingSlash | Warning | Cosmetic; canonical on home is correct live |
| IN-01..IN-04 | Info | Hardening suggestions |

## Human Verification Required

None outstanding. Felipe approved the og-image, the live Rich Results URL test, LinkedIn Post Inspector and the WhatsApp preview on 2026-10-17.

## Gaps Summary

No gaps. The phase goal is achieved in the codebase and in production. The four review warnings are tooling or hardening follow-ups and can be handled in a later cleanup.

---

_Verified: 2026-10-17_
_Verifier: Claude (gsd-verifier)_
