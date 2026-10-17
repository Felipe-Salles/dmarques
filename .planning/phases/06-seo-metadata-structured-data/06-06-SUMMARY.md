---
phase: 06-seo-metadata-structured-data
plan: 06
subsystem: seo
tags: [head, canonical, open-graph, json-ld, footer]
requires: [06-01, 06-02, 06-05]
provides:
  - Complete SEO head in BaseLayout (canonical, OG, Twitter, theme-color)
  - Home JSON-LD emitted inline at build time
  - Footer and contact NAP read from business.ts
affects: [06-08]
key-files:
  modified: [src/layouts/BaseLayout.astro, src/pages/index.astro, src/pages/404.astro, src/pages/obrigado.astro, "src/pages/erro-envio/[motivo].astro", src/components/SiteFooter.astro, src/components/ContactSection.astro]
key-decisions:
  - "Canonical, og:url and image URLs are built from Astro.site, never the request host"
  - "JSON-LD only on the home page, serialized with serializeJsonLd; emitted inline without needing is:inline"
requirements-completed: [SEO-01, SEO-03, SEO-05, SEO-06, SEO-08]
duration: 10min
completed: 2026-10-17
---

# Phase 6 Plan 06: SEO head, JSON-LD and NAP wiring Summary

BaseLayout now emits canonical, og:*, twitter:*, theme-color and the home-only LocalBusiness JSON-LD; footer and contact read phone and e-mail from `business.ts`; secondary titles use `<Page> | Dmarques Desenvolvimento Web`.

## Tasks

| Task | Name | Commit |
|------|------|--------|
| 1 | BaseLayout head + home metadata and JSON-LD | c395d0b |
| 2 | Footer/contact NAP and secondary titles | bc6dea2 |

## Verification

- `pnpm build` ok; `seo-gates.mjs`: 10 PASS / 0 FAIL
- `aurora-gates.mjs`: 13 PASS; `browser-gates.mjs`: 9 PASS; `form-gates.mjs`: 15 PASS
- `pnpm test`: 129 pass, 0 fail; `astro check`: 0 errors; js-weight-check PASS
- JSON-LD appears once in index.html as `<script type="application/ld+json">` inline, absent from /obrigado
- `grep "Soluções Web" src/` empty; 404 title and noindex confirmed in built HTML
- CSP: no CSP meta is present in the built output yet (Phase 7 owns CSP); the JSON-LD block is a non-executable data block and did not affect any hashing gate.

## Desvio registrado: canonical em páginas noindex

ROADMAP criterion 1 says every page has an absolute canonical. By design /obrigado, /erro-envio/* and /404 carry `noindex` and NO canonical (RESEARCH Pitfall 8: a canonical on a noindex page sends conflicting signals to crawlers). Every indexable page (today only `/`) has the absolute canonical built from Astro.site. Carry this note into 06-08-SUMMARY and the phase verification.

## Deviations from Plan

None. The `pnpm exec playwright install chromium` step was unnecessary (already installed). The pre-existing biome formatting error in astro.config.mjs was left untouched.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED
