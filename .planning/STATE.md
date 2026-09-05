# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-05)

**Core value:** Um visitante entende em segundos o que a Dmarques faz, confia na agência e pede um orçamento — com um site que carrega rápido e nunca sai do ar.
**Current focus:** Phase 1 — Foundation & CI Gate

## Current Position

Phase: 1 of 7 (Foundation & CI Gate)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-09-05 — Roadmap created (7 phases, 83/83 requirements mapped)

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Relevant to current work:

- Astro static (SSG) + `@astrojs/vercel`; only `/api/orcamento` opts out of prerendering.
- Content in Markdown / Content Collections, no CMS.
- Form via Astro endpoint + Resend; secrets server-only via `astro:env`.
- Cloudflare (WAF / edge rate-limiting / DDoS / Turnstile) deferred to Milestone 2 — v1 residual-risk statement recorded in ROADMAP.md (SEC-08).
- Security review at the end of every phase via a versioned checklist artifact in `.planning/` (SEC-07); no phase closes with an open High finding.
- Lighthouse mobile >=95 (all four categories) enforced in CI from Phase 1 (PERF-01 / INFRA-09).

### Open Decisions To Resolve Before Their Phase

- **Phase 5 (form):** Upstash rate-limiter dependency vs. strict minimal-deps fallback (in-memory Map + honeypot + Vercel WAF rule).
- **Phase 5 (form):** Resend sending domain / DNS control confirmed; SPF/DKIM/DMARC is a launch gate.
- **Phase 5 (LGPD):** legal basis wording (Art. 7 V pre-contractual + legitimate interest, notice-only) and retention period (e.g. 12–24 months) — founder/legal decision, blocks policy finalization.
- **Phase 1 / Phase 5:** analytics final pick (Vercel Web Analytics recommended) verified cookieless in DevTools.
- **Phase 3:** mobile nav pattern (wrapped row vs. `<details>` disclosure) once nav item count is final.
- **Phase 4:** CSS scroll-driven `animation-timeline: view()` layer + IO fallback vs. single IO island.

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Milestone 2 | Cloudflare layer (CF-01..06) — WAF, edge rate-limiting, DDoS L3/L7, Turnstile | Planned | Project start |

## Session Continuity

Last session: 2026-09-05
Stopped at: ROADMAP.md and STATE.md created; REQUIREMENTS.md traceability updated
Resume file: None
