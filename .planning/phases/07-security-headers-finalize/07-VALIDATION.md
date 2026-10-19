---
phase: 7
slug: security-headers-finalize
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-19
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (unit) + Playwright scripts (integration, Edge/Chromium) |
| **Config file** | none — `package.json` `"test": "node --test \"src/**/*.test.mjs\""` |
| **Quick run command** | `pnpm test && pnpm build && node scripts/verify/header-gates.mjs` |
| **Full suite command** | `pnpm build && node scripts/verify/header-gates.mjs && node scripts/verify/browser-gates.mjs && node scripts/verify/form-gates.mjs && node scripts/verify/form-card-height.mjs && node scripts/verify/aurora-gates.mjs && node scripts/verify/seo-gates.mjs && bash scripts/js-weight-check.sh && bash scripts/security-check.sh --ci` |
| **Estimated runtime** | ~240 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`, plus `pnpm build && node scripts/verify/header-gates.mjs` once header-gates exists
- **After every plan wave:** Run the full suite command
- **Before `/gsd:verify-work`:** Full suite green, preview Report-Only run clean, promotion run clean, Lighthouse CI green
- **Max feedback latency:** 240 seconds

---

## Per-Task Verification Map

| Req | Behavior | Test Type | Automated Command | File Exists | Status |
|-----|----------|-----------|-------------------|-------------|--------|
| SEC-01 | Non-CSP headers present on `/`, unknown URL (404), asset, API | integration | `node scripts/verify/header-gates.mjs` / `--live $URL` | ❌ W0 | ⬜ pending |
| SEC-02 | CSP delivered as header with required directives, no unsafe-*, no `<meta>` CSP | integration | `node scripts/verify/header-gates.mjs` | ❌ W0 | ⬜ pending |
| SEC-02 | finalize-headers reshapes adapter routes into one global CSP route, mode switch works | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| SEC-02 | js-ready inline hash in CSP equals hash of emitted body | unit + integration | `pnpm test`, header-gates | ❌ W0 | ⬜ pending |
| SEC-03 | Zero `securitypolicyviolation` events on all routes, both motion modes | Playwright | `node scripts/verify/browser-gates.mjs` | edit existing | ⬜ pending |
| SEC-03 | Zero violations on JS submit and no-JS native POST | Playwright | `node scripts/verify/form-gates.mjs` | edit existing | ⬜ pending |
| SEC-03 | Preview Report-Only, then promoted to enforcing | integration | `node scripts/verify/header-gates.mjs --live <url> --expect report-only|enforce` | ❌ W0 | ⬜ pending |
| SEC-04 | No `.map` files / `sourceMappingURL`; 404/500 leak no diagnostics | integration | `bash scripts/security-check.sh --ci` | edit existing | ⬜ pending |
| SEC-05 | Built HTML loads no cross-origin asset; SRI rule documented | integration | `bash scripts/security-check.sh --ci` | edit existing | ⬜ pending |
| SEC-06 | `curl -I` header regression in CI on preview and production | CI | new `headers.yml` workflow | ❌ W0 | ⬜ pending |
| SEC-10 | No `ClientRouter` / `astro:transitions` | grep gate | `bash scripts/security-check.sh --ci` | edit existing | ⬜ pending |
| SEC-07 | Final checklist run with no open High | script + manual | `bash scripts/security-check.sh --ci` + `.planning/security/runs/phase-07.md` | ❌ W0 | ⬜ pending |
| PERF-01 | Lighthouse mobile >= 95 all categories | CI | existing `lighthouse.yml` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Preview probe confirming `vercel.json` headers coexist with adapter `staticHeaders` routes (HTML, 404 catch-all, API function)
- [ ] `scripts/verify/headers.mjs` (shared header-rule loader) and `scripts/verify/header-gates.mjs`
- [ ] finalize-headers pure module + `*.test.mjs` under `src/`
- [ ] `src/lib/js-ready.ts` single-source inline script + hash stability test
- [ ] `.github/workflows/headers.yml` on `deployment_status` (Preview with bypass header, Production)
- [ ] `docs/seguranca-headers.md`, `.planning/security/runs/phase-07.md`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| securityheaders.com grade >= A | SEC-06 | No keyless API; CI asserts the same criteria via curl | Scan https://agenciadmarques.com.br on securityheaders.com after promotion, record grade in `runs/phase-07.md` |
| HSTS preload submission | SEC-01 | External human step at hstspreload.org | Confirm no http-only subdomains, submit, record status |
| Social previews still render (CORP/COOP) | SEC-01 | Third-party crawler caches | LinkedIn Post Inspector + WhatsApp share after promotion |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 240s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-19 (plan-checker; Wave 0 mapped to 07-01 and 07-02)
