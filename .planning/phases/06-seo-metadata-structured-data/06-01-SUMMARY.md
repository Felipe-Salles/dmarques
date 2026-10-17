---
phase: 06-seo-metadata-structured-data
plan: 01
subsystem: seo
tags: [json-ld, schema-org, localbusiness, nap, node-test]

requires:
  - phase: 05
    provides: WHATSAPP_NUMBER and formatPhone
provides:
  - src/lib/business.ts single source of NAP, identity, home SEO copy, OG image metadata
  - src/lib/json-ld.ts buildLocalBusinessJsonLd and serializeJsonLd
affects: [06-seo-layout, 06-footer, 06-secondary-pages]

tech-stack:
  added: []
  patterns:
    - "Phone display and E.164 both derived from WHATSAPP_NUMBER"
    - "JSON-LD built as plain object and serialized only via JSON.stringify with script-safe escapes"

key-files:
  created: [src/lib/business.ts, src/lib/json-ld.ts, src/lib/seo.test.mjs]
  modified: []

key-decisions:
  - "Logo and image URLs are builder arguments so json-ld.ts stays free of astro:assets and testable under node --test"

requirements-completed: [SEO-01, SEO-06, SEO-08]

duration: 10min
completed: 2026-10-17
---

# Phase 6 Plan 01: Business identity and JSON-LD Summary

**Single-source business.ts (NAP, area, hours, home title/description, OG metadata) plus a pure LocalBusiness JSON-LD builder and a script-safe serializer, covered by 17 node:test cases.**

## Tasks

| Task | Name | Commit |
|------|------|--------|
| 1 | Failing tests (RED) | e04a5f4 |
| 2 | business.ts and json-ld.ts (GREEN) | 3a7c994 |

## Verification

- `pnpm test`: 129 pass, 0 fail
- `pnpm astro check`: 0 errors; biome check clean on the three files
- No comments, no priceRange/streetAddress/taxID, no phone digits typed in business.ts or json-ld.ts

## Deviations from Plan

None - plan executed as written. A transient tooling issue wrote raw U+2028/U+2029 characters into the serializer regexes; replaced with the escaped regex forms before the GREEN commit.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED
