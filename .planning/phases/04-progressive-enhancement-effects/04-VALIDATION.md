---
phase: 04
slug: progressive-enhancement-effects
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-16
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None currently installed. Node's built-in `node:test` runner (ships with Node 24.14.0, already installed — zero new dependency) for the two pure particle functions only |
| **Config file** | none — `node --test` needs no config for a plain `.test.mjs` file |
| **Quick run command** | `node --test src/scripts/particles.pure.test.mjs` |
| **Full suite command** | `node --test src/scripts/**/*.test.mjs` |
| **Estimated runtime** | ~1 second |

Everything else in this phase (IO/rAF/canvas DOM behavior, the actual visual
glow/reveal, reduced-motion appearance) is not unit-testable without a
browser and is left to the existing Lighthouse CI gate plus manual DevTools
verification called out explicitly in ROADMAP success criterion 5.

---

## Sampling Rate

- **After every task commit:** `pnpm build && bash scripts/js-weight-check.sh` (plus `node --test src/scripts/particles.pure.test.mjs` once that file exists)
- **After every plan wave:** Full manual DevTools pass (reveal, glow, canvas pause, reduced-motion) against a local `astro preview` build
- **Before `/gsd:verify-work`:** `bash scripts/security-check.sh --ci` against the deployed preview (runs `pnpm audit`, style/CSS/script inline greps, secret scan, Function count, and the full Lighthouse gate) must be green
- **Max feedback latency:** ~5 seconds (build + weight check); Lighthouse gate latency is whatever `security-check.sh --ci` already takes

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-T1 | 01 | 1 | ANIM-05 | T-04-01 / T-04-02 (V11) | `computePointCount`/`shouldReduceParticles` puras, sem `eval`/DOM/conteúdo dinâmico de script | unit | `node --test "src/scripts/*.test.mjs"` | ❌ W0 → criado por este task | ⬜ pending |
| 04-01-T2 | 01 | 1 | ANIM-05 | T-04-SC | Nenhuma dependência nova; `pnpm-lock.yaml` inalterado; gate ligado ao CI | automated | `pnpm test` (+ passo `pnpm test` no job `verify`) | ✅ após 04-01-T1 | ⬜ pending |
| 04-02-T1 | 02 | 2 | ANIM-01, ANIM-03 | T-04-06 / T-04-08 (V11) | Apenas `addEventListener`; sem `innerHTML`/`eval`/`document.write`; `pointermove` passivo com throttle single-flight | automated (source assertions) | `pnpm check && pnpm test` + greps de contrato do plano | ✅ | ⬜ pending |
| 04-02-T2 | 02 | 2 | ANIM-01, ANIM-03, ANIM-09 | T-04-04 / T-04-05 / T-04-07 / T-04-09 (V14) | `.js-ready` permanece `is:inline` sem `type=`; bundle permanece não-inline; overlay com `pointer-events:none` + `aria-hidden`; sem `eval`/`new Function` no HTML construído | automated | `pnpm build && bash scripts/js-weight-check.sh` + asserções Node sobre `index.html` | ✅ | ⬜ pending |
| 04-03-T1 | 03 | 3 | ANIM-04, ANIM-05 | T-04-10 / T-04-11 / T-04-12 / T-04-14 | Um único `syncLoop` governa o rAF; `connection?.saveData` protegido; parsing de token sem `eval` | automated (source assertions) | `pnpm check && pnpm test` + contagens grep (`cancelAnimationFrame`=1, `Array.from`=1, `matchMedia`=1, `toFixed`=0) | ✅ | ⬜ pending |
| 04-03-T2 | 03 | 3 | ANIM-04, ANIM-09 | T-04-SC | Bundle único; nenhum handler inline no HTML construído | automated | `pnpm build && bash scripts/js-weight-check.sh && bash scripts/security-check.sh` | ✅ | ⬜ pending |
| 04-04-T1 | 04 | 4 | ANIM-01, ANIM-03, ANIM-04, ANIM-05, ANIM-06 | T-04-18 | Loop realmente para fora da viewport e com aba oculta; glow não renderiza sob reduced-motion / ponteiro grosso; DPR efetivo = 1.5 | instrumented (CDP) + automated | Chrome headless via CDP (receita 03-08): `Performance.getMetrics` delta de `ScriptDuration`, `Emulation.setEmulatedMedia`, `getImageData`; mais `pnpm test && pnpm check && pnpm build && bash scripts/js-weight-check.sh` | ✅ (script de scratchpad, não commitado) | ⬜ pending |
| 04-04-T2 | 04 | 4 | ANIM-09 + cross-cutting / SEC-07 | T-04-16 / T-04-17 / T-04-19 / T-04-SC | Lighthouse mobile >=95, TBT <200ms, CLS <0,05 contra preview real; execução SEC-07 versionada sem High em aberto | automated (existing) | `bash scripts/security-check.sh --ci` com `PREVIEW_URL` (roda `lhci` como verificação 7) + job `lhci` do CI | ✅ | ⬜ pending |
| 04-04-T3 | 04 | 4 | ANIM-06 + aceite de fase | T-04-16 | Sem regressão de `dmFloat`/`dmPulse` sob reduced-motion; assinatura humana registrada | manual (checkpoint blocking) | — (10 itens de verificação guiada no plano 04-04) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs atribuídos pelo planner em 2026-09-17 contra os planos 04-01 a 04-04. A ligação requisito-para-teste do mapa original foi preservada integralmente; as linhas marcadas antes como `manual` para ANIM-01/03/04/05 foram promovidas a `instrumented (CDP)` em 04-04-T1, seguindo a receita de medição já usada no plano 03-08.*

---

## Wave 0 Requirements

- [ ] `src/scripts/particles.pure.ts` — extract `computePointCount` (ANIM-05 formula: `n = round(min(90, max(28, (w*h)/11000)))`) and `shouldReduceParticles` (small viewport OR `hardwareConcurrency <= 4` OR `navigator.connection?.saveData`) as pure, testable functions
- [ ] `src/scripts/particles.pure.test.mjs` — covers the point-count formula plus all three reduction triggers individually and combined
- [ ] No framework install needed — `node --test` ships with the already-installed Node 24.14.0

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| Scroll reveal fire-once + fallback | ANIM-01 | DOM/IO behavior, no test framework wired to a browser in this project | DevTools: throttle CPU 6x, scroll page, confirm each `[data-reveal]` element gets `.is-revealed` exactly once; separately, block/disable IntersectionObserver support and confirm the ~2.6s timeout reveals everything |
| Cursor glow gating | ANIM-03 | Requires real pointer + media-query emulation | DevTools Rendering tab: force `prefers-reduced-motion: reduce` → glow must not render at all; on a touch-emulated (no `pointer:fine`) profile → glow must not attach |
| Canvas pause on scroll/tab-hidden | ANIM-04 | Requires Performance panel timeline inspection | Record a Performance trace while scrolling the hero off-screen — confirm no scripting activity; switch tabs and confirm rAF loop stops (Page Visibility) |
| Canvas DPR cap + reduced-motion static frame | ANIM-05 | Visual/canvas pixel inspection | Force `prefers-reduced-motion: reduce` in DevTools, reload, confirm a single static frame renders with zero scripting activity afterward |
| `dmFloat`/`dmPulse` reduced-motion regression check | ANIM-06 | Already covered by Phase 3 CSS; visual smoke-check only | Toggle reduced-motion, visually confirm no residual motion on floating/pulsing elements |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (particles.pure.ts/test.mjs)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s for the automated build/weight-check loop
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending (plans written 2026-09-17)
