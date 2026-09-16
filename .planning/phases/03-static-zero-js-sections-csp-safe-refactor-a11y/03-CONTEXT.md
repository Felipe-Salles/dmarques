# Phase 3: Static Zero-JS Sections + CSP-safe Refactor + A11y - Context

**Gathered:** 2026-09-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 turns the design's editor markup (`arquivos de design/Dmarques Landing.dc.html`)
into a shippable, fully static, zero-client-JS one-pager: the 9 design sections
(Hero "03 Bleed", Serviços, Como trabalhamos, Diferenciais, Sobre, Contato, FAQ,
CTA final, Rodapé) plus `/politica-de-privacidade`, `/obrigado`, and a branded
`/404`. Every design `style="..."` attribute becomes token-based CSS; hover/focus
states become real `:hover`/`:focus-visible` CSS; accessibility (skip link,
landmarks, single `<h1>`, keyboard operability, alt text, AA contrast) is fixed
in the same pass.

**In scope (SITE-01..09, A11Y-01..07, ANIM-02/07/08, SEO-02, PERF-05):**
- All 9 sections rendered from the Phase 2 content collections, zero client JS.
- Hero "03 Bleed" only (the other 2 hero variants in the design file are not
  shipped — editor-only alternatives).
- `grep -r 'style="' src/` returns nothing.
- Anchor nav with `scroll-margin-top`; mobile nav keyboard-operable without a
  JS framework or focus trap.
- `/obrigado`, `/politica-de-privacidade` (page shell only — LGPD body copy is
  Phase 5), `/404`.
- Skip link, semantic landmarks, `<html lang="pt-BR">`, real `<label for>`/
  `id`/`name` on form fields, focus rings ≥3:1, real alt text on the founder
  portrait, decorative hero/canvas/glow marked `aria-hidden`, WCAG AA contrast.
- Images via `astro:assets`, explicit dimensions, AVIF/WebP, hero LCP image
  `fetchpriority="high"`, build-time Sharp only (no runtime optimization).
- Reveal markup gated on `.js-ready` + `prefers-reduced-motion: no-preference`
  (ANIM-02) and `scroll-behavior: auto` under reduced-motion (ANIM-08) — CSS/
  markup groundwork only, the IntersectionObserver JS itself is Phase 4.

**Not in scope:**
- The particle canvas, cursor glow, and scroll-reveal *JavaScript* (Phase 4) —
  Phase 3 only ships the CSS states and hidden-by-default markup they'll drive.
- Form endpoint, `action`/`method`, server validation, progressive-enhancement
  `fetch`, honeypot, rate-limiting (Phase 5) — Phase 3 ships only the static
  field markup (see D-10..D-12 below).
- Privacy Policy body copy / legal basis wording (Phase 5, LGPD-01..07).
- SEO metadata beyond `<html lang="pt-BR">` — title, OG/Twitter, sitemap,
  JSON-LD, favicons (Phase 6).
- Strict CSP / security headers (Phase 7) — this phase's job is just to leave
  zero inline `style=""` and zero inline `onClick`-style handlers behind so
  Phase 7 can lock a strict `style-src`/`script-src` later.

</domain>

<decisions>
## Implementation Decisions

### Missing images (hero 3D render + founder portrait)
- **D-01:** Neither the hero 3D render nor Felipe's portrait exist as real
  files yet. Phase 3 ships **branded placeholder images** for both — same
  pattern as the Phase 2 case-cover placeholder (vector shapes rasterized to
  WebP/AVIF via the Sharp already bundled in `astro@7.3.1`, zero new
  dependency). The phase is **not blocked** waiting for real assets.
- **D-02:** The founder portrait placeholder uses the **real final alt text**
  now (`"Felipe Salles, fundador da Dmarques"` or similar) rather than an
  empty/decorative alt — A11Y-05 requires real alt text on the portrait, and
  writing it now means swapping the image file later never touches the alt.
- **D-03:** The hero 3D render placeholder reserves the **same proportion and
  edge-bleed** as the "03 Bleed" design (image bleeding off the right edge,
  `border-radius: 24px 0 0 24px`, no right border) — avoids CLS and layout
  changes when the real render is dropped in later; only the image file swaps.

### Mobile navigation (SITE-06)
- **D-04:** Mobile nav uses a native **`<details>`/`<summary>` disclosure** —
  zero JS, always keyboard-operable, cannot produce a focus trap, degrades
  safely if CSS fails. Rejected: horizontal scroll row (cramped with 4 links +
  CTA) and plain flex-wrap (visually noisy on narrow viewports). This closes
  the open decision flagged in STATE.md.
- **D-05:** The **"Pedir orçamento" CTA stays visible outside the `<details>`**
  on mobile, not nested inside the collapsed menu — it's the primary
  conversion action and shouldn't cost an extra tap to reach.
- **D-06:** The `<summary>` trigger is an **icon (hamburger) + `aria-label`**,
  no visible "Menu" text — matches the design's minimal wordmark-only header
  aesthetic. The icon must still pass the A11Y-04 keyboard-operable bar and
  A11Y-03 focus-visible contrast requirements like any other interactive
  element.

### Contact form scope in Phase 3 (SITE markup vs. FORM-01)
- **D-07:** The design's Contato section only has 3 fields (Nome, WhatsApp,
  Tipo de projeto), but FORM-01 (Phase 5) requires 5 (adds E-mail and
  Mensagem). Phase 3 **ships all 5 fields now** with real `<label for>`/`id`/
  `name`/`type` — satisfies this phase's own success criterion #3 ("real
  `<label for>`/`id`/`name` on form fields") and means Phase 5 only adds
  `action`/`method`/validation/JS, never touches field markup or re-triggers
  an A11y pass on new fields.
- **D-08:** FORM-01's "at least one of WhatsApp/e-mail required" rule is
  **not encoded as HTML `required`** on either field individually (that would
  force both). Instead: `Nome` and `Tipo de projeto` get `required`; WhatsApp
  and E-mail stay without `required`, with a small text note near the two
  fields ("Preencha WhatsApp ou e-mail") communicating the rule. The real
  enforcement (client + server) is Phase 5's job.
- **D-09:** The Mensagem field is a `<textarea>` — not present in the design,
  added to match FORM-01's field list; styled consistently with the other
  form inputs using existing design tokens (border/radius/focus treatment).
- **D-10:** The submit button ships the **static idle-state label** from the
  design, `"Enviar pedido de orçamento"` — the design's dynamic
  `{{ submitLabel }}` (idle ⇄ "Pedido enviado ✓") is Phase 5's progressive-
  enhancement behavior; Phase 3 has no JS to drive a state change.
- **D-11:** No `action`/`method` attribute is added to the `<form>` in Phase 3
  — that's `/api/orcamento` wiring, explicitly Phase 5 scope (FORM-02).
- **D-12:** `/politica-de-privacidade` ships in Phase 3 as a **page shell
  only** (BaseLayout + heading + placeholder note) so the route and nav link
  resolve; the actual LGPD body content is Phase 5 (LGPD-01..02), which must
  ship in the same release as the live form per LGPD-01's "same release" rule
  — Phase 3 merely reserves the URL.

### Contrast remediation for translucent-white text (A11Y-06)
- **D-13:** Approach is **calculate-and-apply, not item-by-item sign-off**:
  Claude computes the minimum opacity of white needed against each real dark
  background used in the design (`#0A0A12`, `#05050A`, the `#0A0A12→#0D1B2A`
  gradient) to hit **4.5:1 for body text** and **3:1 for large text/UI
  labels/eyebrows**, then raises the affected `--color-text*` tokens directly.
  Felipe explicitly waived the literal per-value approval table A11Y-06's
  wording suggests — sign-off happens by reviewing the shipped result, not a
  pre-approval spreadsheet.
- **D-14:** If the accent color `#6C4CFF` fails 3:1/4.5:1 against a given
  background in its text/highlight uses (H1 highlighted word, eyebrow labels,
  links), **lighten only those specific uses** toward the already-existing
  `--color-accent-light` (`#9A85FF`) or a calculated intermediate tone —
  don't change the base `--color-accent` used for solid-fill buttons/borders,
  keeping brand identity intact everywhere contrast isn't actually failing.

### Claude's Discretion
Planner / researcher decide, unless a real trade-off surfaces for Felipe:
- Exact recalculated opacity/hex values for every `--color-text*` /
  `--color-accent*` token affected by D-13/D-14 (the calculation method is
  locked; the specific numbers are not).
- Whether the `<details>` mobile nav uses a full-width dropdown panel or an
  inline expanding list, and its exact open/close transition (must stay
  `transform`/`opacity`, ≤300ms, and respect reduced-motion).
- Exact wording of the WhatsApp/e-mail "pelo menos um" note (D-08) and the
  `/politica-de-privacidade` placeholder shell copy (D-12).
- Precise placeholder art direction for the hero render and founder portrait
  (branded, correct aspect ratio, `<300 KB`, Sharp-processed) — follow the
  Phase 2 case-cover placeholder precedent.
- How the `dmFloat`/`dmPulse` keyframes and hover/focus transition CSS are
  organized across component `<style>` blocks vs. shared section styles.
- Exact heading level structure below `<h1>` (the design already implies
  `<h2>` per section, `<h3>` per card — confirm against real content lengths).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements & scope
- `.planning/ROADMAP.md` § "Phase 3: Static Zero-JS Sections + CSP-safe
  Refactor + A11y" — goal + 5 success criteria (the exact bar this phase must
  clear).
- `.planning/REQUIREMENTS.md` § "Seções da Página (SITE)" (SITE-01..09),
  § "Acessibilidade (A11Y)" (A11Y-01..07), § "Animações & Movimento (ANIM)"
  ANIM-02/07/08, § "SEO & Descoberta (SEO)" SEO-02, § "Performance (PERF)"
  PERF-05 — the exact wording each decision above must satisfy.
- `.planning/REQUIREMENTS.md` § "Formulário de Orçamento (FORM)" FORM-01/02/04
  — the 5-field spec and "at least one of WhatsApp/e-mail" rule Phase 3's
  static form markup must anticipate (D-07..D-11), even though the endpoint
  itself is Phase 5.
- `.planning/REQUIREMENTS.md` § "LGPD & Privacidade (LGPD)" LGPD-01 — the
  "same release as the form" rule explaining why Phase 3 only reserves the
  `/politica-de-privacidade` URL (D-12) rather than writing its body.

### Design source
- `arquivos de design/Dmarques Landing.dc.html` — the verbatim visual/markup
  source. Hero "03 Bleed" is lines ~147–195 (the only hero variant shipped);
  Serviços ~197–234; Como trabalhamos ~236–274; Diferenciais ~276–306; Sobre
  ~308–330; Contato ~332–387 (3-field form to expand per D-07..D-10); FAQ
  ~389–430; CTA final ~432–442; Rodapé ~444–473. The `<script type="text/x-dc">`
  block (~477–613) is the design-editor's React-like runtime (reveal IO,
  particle canvas, glow, hero-variant switcher) — **read for behavior
  reference only** (rootMargin, DPR cap, etc. feed Phase 4), never ship it.
  `image-slot.js` / `support.js` are design-editor tooling, never production
  code.

### Project conventions & prior decisions
- `.planning/phases/01-foundation-ci-gate/01-CONTEXT.md` — D-04 (zero
  comments, project-wide), design tokens (`#0A0A12`/`#05050A` bg, `#6C4CFF`
  accent, Outfit/DM Sans), `dmFloat`/`dmPulse` keyframe names.
- `.planning/phases/02-content-collections/02-CONTEXT.md` — D-08 (branded
  placeholder-image precedent this phase's D-01 reuses), collection shapes
  Phase 3 consumes (`services`, `process`, `differentiators`, `faq`, `cases`
  via `getCollection()`), the icon-name enum contract (D-03 there) Phase 3's
  service cards must map to SVGs, D-12 (hero/bio/contact/footer prose is
  Phase-3-only `.astro` markup, not a collection).
- `.planning/security/SECURITY-CHECKLIST.md` + `.planning/security/runs/` —
  the SEC-07 ritual this phase's success criterion 5 requires (no new inline
  `style=""`/`<script>` surface — this phase actively *removes* the existing
  inline-style surface).
- `CLAUDE.md` § "Technology Stack" — Astro 7.3.x, `astro:assets` + Sharp for
  images, no UI framework, hand-rolled vanilla JS only (relevant to Phase 4,
  not this phase, but constrains what "zero-JS" markup here must anticipate).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/layouts/BaseLayout.astro` — `<html lang="pt-BR">`, Font component,
  Analytics, `<slot />`. Phase 3 sections render inside this layout; the
  placeholder `<main>` body in `src/pages/index.astro` is fully replaced.
- `src/styles/tokens.css` — full design-token set already covers colors,
  fonts, spacing, radii, shadows, z-index, durations/easings needed for every
  section. Contrast fixes (D-13/D-14) are edits to this file, not new files.
- `src/styles/base.css` — box-sizing reset, body defaults; extend rather than
  duplicate.
- `src/content/*` (Phase 2) — `services`, `process`, `differentiators`, `faq`,
  `cases` collections + `project-types.ts` enum + `src/content/index.ts`
  barrel are the data source for every repeating section; Phase 3 does not
  hand-author repeated copy.

### Established Patterns
- Zero comments in any versioned file (Phase 1 D-04, applies here too).
- `build.inlineStylesheets: 'never'` already set — CSS must ship as external
  files, which the `style="..."` → token-CSS conversion this phase performs
  aligns with directly.
- Phase 2 precedent for placeholder images: generate from vector shapes only,
  rasterize via the Sharp already bundled in `astro@7.3.1` (no new dependency),
  keep under budget size — reused here for D-01.

### Integration Points
- Phase 4 attaches the particle-canvas island, cursor-glow script, and
  IntersectionObserver reveal to the exact markup/classes Phase 3 leaves
  behind (`[data-reveal]`-equivalent hooks, the canvas element, the glow
  layer) — Phase 3's job is to leave those attachment points in place, inert.
- Phase 5 attaches `action`/`method`, validation, and progressive enhancement
  to the 5-field form markup Phase 3 ships (D-07..D-11), and writes the LGPD
  body into the page shell Phase 3 reserves at `/politica-de-privacidade`
  (D-12).
- Phase 6 fills in `<title>`/meta/OG/JSON-LD around the sections Phase 3
  renders; Phase 7 locks CSP against the exact script/style surface Phase 3
  (and 4) leave behind.

</code_context>

<specifics>
## Specific Ideas

- Hero "03 Bleed" is the only hero variant shipped — the design file's 01
  Split / 02 Centro variants and the hero-switcher UI (`{{ setHero1/2/3 }}`)
  are editor-only, never rendered in production.
- The `<details>`/`<summary>` mobile nav CTA-outside-menu pattern (D-04/D-05)
  mirrors how the desktop nav already treats "Pedir orçamento" as visually
  distinct (pill button) from the plain text links.
- Contrast fixes should lean on the already-existing `--color-accent-light`
  (#9A85FF) token before inventing new intermediate tones (D-14).
- The giant translucent "DMARQUES" footer watermark (`rgba(255,255,255,.045)`)
  is purely decorative and stays `aria-hidden` — not subject to the AA
  contrast pass (it's not text meant to be read).

</specifics>

<deferred>
## Deferred Ideas

- **Real hero 3D render and founder portrait photography** — replaces the
  Phase 3 branded placeholders whenever Felipe supplies them (post-Phase-3 or
  post-launch, same pattern as the Phase 2 case-cover placeholder swap).
- **Per-value contrast approval spreadsheet** — considered (A11Y-06's literal
  wording), explicitly waived by Felipe in favor of reviewing the shipped
  result (D-13).
- **Full LGPD Privacy Policy content** — belongs to Phase 5 (LGPD-01..07);
  Phase 3 only reserves the route (D-12).

None of the above expand Phase 3 scope — discussion stayed within the phase.

</deferred>

---

*Phase: 3-static-zero-js-sections-csp-safe-refactor-a11y*
*Context gathered: 2026-09-15*
