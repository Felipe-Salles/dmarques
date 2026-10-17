---
phase: 06-seo-metadata-structured-data
plan: 05
subsystem: seo
tags: [og-image, playwright, sharp]
requires: [06-04]
provides:
  - scripts/generate-og.mjs regenerable share image generator
  - public/og-image.jpg 1200x630 JPEG, 31018 bytes
affects: [06-08]
tech-stack:
  added: []
  patterns: [HTML template screenshotted by headless Chromium with production self-hosted fonts, sharp mozjpeg compression loop]
key-files:
  created: [scripts/generate-og.mjs, public/og-image.jpg]
  modified: [package.json]
key-decisions:
  - "Fonts come from the Fonts API style block extracted from the built index.html, so the image uses the exact production Sora"
  - "Any request to a non-local origin is aborted in the page, so no third-party fetch happens"
requirements-completed: [SEO-03]
duration: 10min
completed: 2026-10-17
---

# Phase 6 Plan 05: Share image Summary

`pnpm og:generate` renders an HTML template (aurora glow, logo lockup, hero headline in Sora 600 with the accent in cyan) with headless Chromium and writes `public/og-image.jpg` via sharp mozjpeg.

## Tasks

1. Generator script and `og:generate` package script - commit c857060. Not wired into build or CI.
2. Image generation and validation - commit f2277f4.

## Verification

- `node --check` passes; no `https://` in the script; zero comment lines; `og:generate` absent from ci.yml.
- Image: 1200x630, JPEG, 31018 bytes (q82, first quality tried), well under 307200.
- After `pnpm build`, `.vercel/output/static/og-image.jpg` exists (31018 bytes).
- Visual check, full image: dark #070A14 background with a cyan/blue aurora glow centred behind the content; lockup (symbol + "dmarques / Desenvolvimento Web") on top; headline in four centred lines ("Software sob / medida, com / acabamento / de produto.") with the last two lines in cyan. No text beyond the headline.
- Visual check, central 630x630 crop (x 285..915): lockup and the whole headline fit inside with generous margins and stay legible, so the WhatsApp square crop keeps everything.

## Deviations from Plan

None - plan executed exactly as written. The first `pnpm build` ran before the image existed, so a second build was run to confirm the copy into the static output.

## Known Stubs

None.

## Self-Check: PASSED

Files scripts/generate-og.mjs and public/og-image.jpg exist; commits c857060 and f2277f4 exist.
