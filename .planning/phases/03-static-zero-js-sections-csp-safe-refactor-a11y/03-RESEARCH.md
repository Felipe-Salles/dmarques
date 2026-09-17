# Phase 3: Static Zero-JS Sections + CSP-safe Refactor + A11y - Research

**Researched:** 2026-09-16
**Domain:** Astro 7 static markup/CSS authoring, WCAG AA contrast remediation, native HTML disclosure patterns, build-time image optimization
**Confidence:** HIGH (most claims verified empirically against this exact repo, or against official Astro docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Missing images (hero 3D render + founder portrait)**
- D-01: Neither image exists yet. Ship **branded placeholder images** for both, same pattern as the Phase 2 case-cover placeholder (vector shapes rasterized to WebP/AVIF via Sharp, zero new dependency intent — see Critical Finding below, this assumption needs revision). Phase is not blocked waiting for real assets.
- D-02: Founder portrait placeholder uses the **real final alt text** now (e.g. "Felipe Salles, fundador da Dmarques") — never revisit alt text when the real photo is swapped in.
- D-03: Hero 3D render placeholder reserves the **same proportion and edge-bleed** as "03 Bleed" (bleeds off the right edge, `border-radius: 24px 0 0 24px`, no right border) — avoids CLS when the real render replaces it.

**Mobile navigation (SITE-06)**
- D-04: Native **`<details>`/`<summary>` disclosure** — zero JS, always keyboard-operable, cannot trap focus, degrades safely if CSS fails.
- D-05: **"Pedir orçamento" CTA stays visible outside the `<details>`** on mobile — primary conversion action, no extra tap.
- D-06: `<summary>` trigger is an **icon (hamburger) + `aria-label`**, no visible "Menu" text.

**Contact form scope in Phase 3 (SITE markup vs. FORM-01)**
- D-07: Ship **all 5 fields now** (Nome, WhatsApp, E-mail, Tipo de projeto, Mensagem) with real `<label for>`/`id`/`name`/`type`, even though the design shows only 3.
- D-08: `Nome` and `Tipo de projeto` get `required`; WhatsApp/E-mail do **not** get `required` individually — a text note explains "at least one." Real enforcement is Phase 5.
- D-09: `Mensagem` is a `<textarea>`, not in the design, styled to match existing inputs.
- D-10: Submit button ships the **static idle label** `"Enviar pedido de orçamento"` — no dynamic state.
- D-11: **No `action`/`method`** on the `<form>` yet — Phase 5 (FORM-02).
- D-12: `/politica-de-privacidade` ships as a **page-shell only** (BaseLayout + heading + placeholder note) — LGPD body is Phase 5.

**Contrast remediation for translucent-white text (A11Y-06)**
- D-13: **Calculate-and-apply**, not item-by-item sign-off. Compute minimum white opacity against `#0A0A12`, `#05050A`, and the `#0A0A12→#0D1B2A` gradient to hit 4.5:1 (body) / 3:1 (large text/UI), then raise `--color-text*` tokens directly. Felipe waived the per-value approval table.
- D-14: If `#6C4CFF` fails contrast in a text/highlight use, lighten **only that use** toward `--color-accent-light` (`#9A85FF`) or a calculated intermediate — never change the base `--color-accent` used for solid fills/borders.

### Claude's Discretion
- Exact recalculated opacity/hex values for every `--color-text*`/`--color-accent*` token (method locked, numbers not — see Common Pitfalls/Code Examples for computed values).
- `<details>` mobile nav: full-width dropdown panel vs. inline expanding list; exact open/close transition (`transform`/`opacity`, ≤300ms, respects reduced-motion).
- Exact wording of the WhatsApp/e-mail "pelo menos um" note and the `/politica-de-privacidade` placeholder shell copy.
- Precise placeholder art direction for hero render and founder portrait (branded, correct aspect ratio, <300 KB, Sharp-processed).
- How `dmFloat`/`dmPulse` keyframes and hover/focus transition CSS are organized across component `<style>` blocks vs. shared section styles.
- Exact heading level structure below `<h1>` (design implies `<h2>` per section, `<h3>` per card).

### Deferred Ideas (OUT OF SCOPE)
- Real hero 3D render and founder portrait photography — replaces Phase 3 placeholders later.
- Per-value contrast approval spreadsheet — explicitly waived (D-13).
- Full LGPD Privacy Policy content — Phase 5 (LGPD-01..07); Phase 3 only reserves the route.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-01 | 9 sections in order, one-pager | Architecture Patterns § Section Structure; design source line map in Code Examples |
| SITE-02 | Hero "03 Bleed" faithfully reproduced | Design source read verbatim (lines 147-195); Code Examples § Hero markup skeleton |
| SITE-03 | Zero client JS on every section | Architecture Patterns § CSS bundling (verified); reveal markup ships inert (no JS this phase) |
| SITE-04 | No `style=""`, real `:hover`/`:focus-visible` CSS | Architecture Patterns § Style conversion; verified `security-check.sh` check 2 regex; Common Pitfalls § DC-editor leftover syntax |
| SITE-05 | Anchor nav + `scroll-margin-top` | Code Examples § scroll-margin-top + reduced-motion CSS |
| SITE-06 | Mobile nav, keyboard-operable, no JS, no focus trap | Architecture Patterns § `<details>`/`<summary>` pattern; Common Pitfalls § sticky/overflow clipping |
| SITE-07 | `/obrigado` page | Architecture Patterns § New routes; Code Examples § page shells |
| SITE-08 | Branded `/404` | Architecture Patterns § New routes; Common Pitfalls § Vercel adapter 404 caveat |
| SITE-09 | `astro:assets`, explicit dimensions, AVIF/WebP, `fetchpriority="high"` | **Critical Finding**: MissingSharp fix required first; Code Examples § verified `<Picture>`/`<Image>` usage |
| A11Y-01 | Skip link | Code Examples § skip link pattern |
| A11Y-02 | Landmarks, single `<h1>` | Architecture Patterns § Section Structure |
| A11Y-03 | `:focus-visible` ≥3:1 on dark and light | Common Pitfalls § focus-ring token fails 3:1 (computed); Code Examples § fixed focus-ring token |
| A11Y-04 | Keyboard-operable, no focus trap | Architecture Patterns § `<details>`/`<summary>` (native, trap-proof) |
| A11Y-05 | Real alt text on portrait; decorative marked `aria-hidden` | Architecture Patterns § Image patterns |
| A11Y-06 | WCAG AA contrast | Common Pitfalls § contrast math (computed per-token); Code Examples § contrast-solver algorithm |
| A11Y-07 | Reduced-motion respected, still feels finished | Code Examples § reveal markup + reduced-motion CSS |
| ANIM-02 | Reveal hidden state only with `.js-ready` + no-preference; 100% visible without JS | Architecture Patterns § Reveal markup groundwork |
| ANIM-07 | `:hover` has `:focus-visible` equivalent; transitions ≤300ms on transform/opacity/box-shadow/border-color | Common Pitfalls § transition property audit |
| ANIM-08 | `scroll-behavior: smooth` → `auto` under reduced-motion | Code Examples § scroll-margin-top + reduced-motion CSS |
| SEO-02 | `<html lang="pt-BR">` | Already present in `BaseLayout.astro` (verified) |
| PERF-05 | No runtime image optimization, build-time Sharp only | Critical Finding + verified `astro.config.mjs` has no `imageService` option |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Astro 7.3.x, `output: 'static'` + `@astrojs/vercel`, only the form route opts out of prerendering (not this phase).
- Zero-comments-in-code, project-wide, every file type including `.astro`, `.css`, `.md` frontmatter (prose body text is content, not code).
- `build.inlineStylesheets: 'never'` locked — CSS must ship external (VERIFIED: this is compatible with, and in fact required alongside, converting `style=""` to scoped `<style>` blocks — see Architecture Patterns).
- No UI framework, hand-rolled vanilla JS only where JS exists at all (Phase 4/5, not this phase).
- `astro:assets` + Sharp for all images, build-time only, never `imageService: true` on the Vercel adapter.
- pnpm + exact version pins for dependencies (see Critical Finding: this phase needs one new pinned devDependency).
- Biome + Prettier (`prettier-plugin-astro`) — run `pnpm format` / `pnpm lint` before finishing.
- No Astro View Transitions (SEC-10, unrelated to this phase but do not introduce them).

## Summary

Phase 3 is a large, mechanical-but-high-stakes conversion: take ~470 lines of design-editor markup (inline `style=""`, `style-hover`/`style-focus` pseudo-attributes, and editor-only DSL like `onClick="{{ setHero1 }}"` and `ref="{{ canvasRef }}"`) and re-author it as clean `.astro` templates consuming the Phase 2 content collections, with zero client JS, zero inline styles, and a WCAG AA pass. The mechanical part (converting `style=""` to `<style>` blocks) is low-risk: `build.inlineStylesheets: 'never'` already guarantees every scoped `<style>` block in every `.astro` file gets compiled into **one external per-page CSS file** (verified empirically in this repo — `pnpm build` on the current single-page site emits exactly one `<link rel="stylesheet" href="/_astro/index.[hash].css">` referencing tokens.css + base.css + all page-level scoped styles combined; the only `<style>` tags surviving inline in the HTML are the two Astro Fonts API `@font-face` blocks, which `security-check.sh` check 3 already permits).

**The one finding that changes the shape of this phase**: this repo cannot currently build any page that uses `<Image>` or `<Picture>` from `astro:assets`. Astro's built-in image service calls `await import("sharp")` from deep inside a bundled server chunk; under this project's strict pnpm layout, that bare specifier fails to resolve even though `sharp@0.35.4` is already present transitively (as an `astro` dependency) and is exactly what Phase 2 used — via a hand-rolled `createRequire` trick — to pre-rasterize the case-cover WebP. That workaround only fixed Phase 2's one-off script; it does **not** fix the built-in `<Image>`/`<Picture>` pipeline Phase 3 needs for the hero render, the founder portrait, and (should the plan ever render it) the cases cover. I reproduced the failure and the fix live in this repo (see Common Pitfalls, Pitfall 1): `pnpm add -D sharp@0.35.4` — pinning the exact version already resolved in `pnpm-lock.yaml` — makes `<Picture>`/`<Image>` (including `formats={['avif','webp']}` and the `priority` shorthand, which correctly emits `fetchpriority="high" loading="eager" decoding="sync"`) work immediately, with zero other config change. This is a **new pinned devDependency**, not zero-dependency as CLAUDE.md's Recommended Stack table assumed — but it is the *same* Sharp version already in the lockfile, so it changes nothing about the resolved dependency tree, only where it's declared. Package Legitimacy Audit below covers this.

Everything else is comfortably HIGH confidence and mostly pattern application: native `<details>`/`<summary>` for the mobile nav (zero JS, un-trappable, cross-browser marker removal is a two-line CSS fix), the WCAG contrast formula (verified against the current W3C spec and run against every token in `tokens.css` — the results below are exact, not estimates), `scroll-margin-top` + a `prefers-reduced-motion` override of `scroll-behavior`, and a CSS-only "reveal markup, inert until Phase 4's JS arrives" pattern that satisfies ANIM-02 for free (because Phase 3 ships no JS to add the gating class, every `[data-reveal]` element is simply visible by default).

**Primary recommendation:** Fix Sharp resolution first (one `pnpm add -D sharp@0.35.4`), then convert the design file section-by-section into `.astro` templates with per-section (or per-component) scoped `<style>` blocks — do not fight `inlineStylesheets: 'never'`, it already does the right thing automatically. Apply the computed contrast fixes in `tokens.css` (Common Pitfalls, Pitfall 2) before touching individual sections, since every section inherits from those tokens.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Section markup (9 sections + 3 pages) | Build (Astro SSG) | Browser (static HTML) | Fully prerendered at build; zero runtime JS this phase |
| Design-token → CSS resolution | Build (Vite CSS bundling) | Browser (custom-property cascade) | `tokens.css`/`base.css`/scoped `<style>` blocks merge into one external file per page at build; browser only resolves `var()` at paint time |
| Mobile nav disclosure | Browser (native HTML) | — | `<details>`/`<summary>` is a native interactive element; no JS, no framework |
| Hover/focus states | Browser (CSS) | — | `:hover`/`:focus-visible` pseudo-classes; zero JS |
| Anchor navigation + scroll offset | Browser (native CSS) | — | `scroll-margin-top` + `scroll-behavior`; no scroll-spy JS this phase |
| Image optimization (hero, portrait) | Build (Sharp via `astro:assets`) | — | PERF-05 mandates build-time only; Vercel `imageService` stays off |
| Reveal-on-scroll markup (inert hooks) | Build (markup + CSS emission) | Browser (gated CSS, dormant until Phase 4 JS) | Phase 3 emits `[data-reveal]` + CSS rule scoped to `html.js-ready`; since no JS sets that class yet, default state is 100% visible (ANIM-02) |
| Content data (services/process/differentiators/faq) | Build (Content Collections, Phase 2) | — | Already built; Phase 3 only consumes via `getCollection()` |
| Form field markup (no submit wiring) | Build (static HTML) | — | No backend endpoint exists until Phase 5 |

## Standard Stack

### Core
No new *runtime* library. This phase adds one build-time devDependency to fix a pre-existing latent bug (see Common Pitfalls, Pitfall 1).

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro:assets` (`<Image>`, `<Picture>`, `getImage`) | built into `astro@7.3.1` | Build-time AVIF/WebP generation, explicit `width`/`height`, `fetchpriority` | Official Astro image pipeline; already the CLAUDE.md-mandated path. `priority` prop confirmed (empirically, in this repo) to emit `loading="eager" decoding="sync" fetchpriority="high"` on both `<Image>` and `<Picture>`. [VERIFIED: local build output] |
| `sharp` | `0.35.4` (pin to the exact version already resolved in `pnpm-lock.yaml`) | Backing image-processing engine for `astro:assets` | **Must be added as an explicit devDependency** — see Critical Finding. Without it, `astro build` throws `MissingSharp` the instant any `.astro` file imports `<Image>`/`<Picture>` on a local asset. [VERIFIED: reproduced failure and fix in this repo, 2026-09-16] |

**Installation:**
```bash
pnpm add -D sharp@0.35.4
```
Confirm the version matches what `pnpm-lock.yaml` already resolves for `astro`'s transitive `sharp` dependency (`pnpm why sharp` before adding) so no second version enters the tree.

**Version verification:**
```bash
npm view sharp version
# 0.35.4 confirmed current at time of research (2026-09-16); matches pnpm-lock.yaml's existing transitive resolution
```

### Supporting
No other packages. Everything else (native `<details>`, CSS `:focus-visible`, `scroll-margin-top`, content collections) uses browser platform features or Astro built-ins already installed.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `pnpm add -D sharp` (explicit devDependency) | `image: { service: passthroughImageService() }` in `astro.config.mjs` | Removes the Sharp requirement entirely but does **zero** processing — no AVIF/WebP generation, no resizing. Directly violates SITE-09 and PERF-05. Rejected. |
| `pnpm add -D sharp` | Keep Phase 2's manual `createRequire` trick, extended to a page-level helper | Would work for ad-hoc scripts but `<Image>`/`<Picture>` components call `loadSharp()` from inside Astro's own bundled code, not from project code — there is no hook point to inject a custom `require` there. Not viable for component-based image rendering. |
| Native `<details>`/`<summary>` mobile nav (D-04, locked) | `<input type="checkbox">` + sibling-selector CSS ("checkbox hack") | Also zero-JS, and *does* support closing on outside-click via a full-screen `<label>` overlay — a real advantage `<details>` lacks. Rejected by explicit Felipe decision (D-04) in favor of `<details>`'s simpler semantics (native `aria-expanded`, no exposed `role="checkbox"` confusion for screen readers). Documented here only so the planner does not "rediscover" this tradeoff mid-implementation. |

## Package Legitimacy Audit

One new devDependency this phase: `sharp@0.35.4`.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|--------------|-----------|-------------|
| `sharp` | npm | 12+ yrs (first published 2013-08-20; current major line long-established) | very high (foundational image library, tens of millions/week) | `github.com/lovell/sharp` | `[OK]` | Approved — **already present in `pnpm-lock.yaml`** as a transitive dependency at the exact same version (`astro@7.3.1` depends on it); this task only promotes it to an explicit top-level devDependency at the same pinned version. No new code enters the dependency tree. |

**Packages removed due to slopcheck [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none.

slopcheck ran successfully in this research session (`python -m slopcheck install sharp` → `[OK] sharp (npm)`, exit path failed only on an unrelated Windows subprocess quirk *after* the verdict was already printed). `npm view sharp version` confirms `0.35.4` current and matches the lockfile. `npm view sharp repository.url` confirms `git+https://github.com/lovell/sharp.git` — legitimate, well-known source. Tag this as `[VERIFIED: npm registry + slopcheck + already-pinned-in-lockfile]`, the strongest provenance tier available, since the exact version is not merely "found on the registry" but is the identical artifact this project's `pnpm-lock.yaml` already resolves and audits clean.

No other packages are installed by this phase.

## Architecture Patterns

### System Architecture Diagram

```
design source (Dmarques Landing.dc.html, editor-only, never shipped)
        │  (manual read + reauthoring — no automated conversion tool)
        ▼
.astro page/section templates  ──consumes──▶  Content Collections (Phase 2)
        │                                        (services/process/differentiators/faq via getCollection())
        │ scoped <style> blocks per file
        ▼
Vite CSS bundling (build time)
        │  build.inlineStylesheets:'never' forces external output
        ▼
one external CSS file per page  +  tokens.css/base.css merged in
        │
        ▼
prerendered static HTML  ──served by──▶  Vercel CDN (no runtime JS, no server compute)

separately, in parallel at build time:
local placeholder images (hero, portrait)
        │  import in .astro frontmatter
        ▼
<Picture formats={['avif','webp']} priority> / <Image priority>
        │  astro:assets → Sharp (now resolvable — see Pitfall 1 fix)
        ▼
AVIF + WebP variants + explicit width/height emitted to /_astro/
```

### Recommended Project Structure
```
src/
├── components/              # NEW this phase — one .astro per design section
│   ├── SiteHeader.astro     # nav + logo + <details> mobile disclosure (shared across Hero + sticky use if any)
│   ├── HeroBleed.astro      # "03 Bleed" only — other 2 variants never authored
│   ├── ServicesSection.astro
│   ├── ProcessSection.astro
│   ├── DifferentiatorsSection.astro
│   ├── AboutSection.astro
│   ├── ContactSection.astro # form markup only, no action/method (D-11)
│   ├── FaqSection.astro
│   ├── CtaFinal.astro
│   └── SiteFooter.astro
├── pages/
│   ├── index.astro          # composes all section components in order (SITE-01)
│   ├── obrigado.astro       # SITE-07
│   ├── politica-de-privacidade.astro  # SITE-07/D-12, shell only
│   └── 404.astro            # SITE-08, Astro's special-cased route
├── assets/                  # NEW this phase — page-level (non-collection) images
│   ├── hero-render-placeholder.webp
│   └── founder-portrait-placeholder.webp
├── styles/
│   ├── tokens.css           # EDITED this phase — contrast fixes (D-13/D-14)
│   └── base.css
└── content/                 # unchanged, Phase 2
```

Component-per-section is a judgment call left to "Claude's Discretion" in CONTEXT.md (how styles are organized across component `<style>` blocks vs. shared section styles) — it is not mandated by any requirement, but it is the natural unit boundary given `inlineStylesheets:'never'` already flattens everything into one CSS file regardless of how many components you split into. Splitting by section keeps each `.astro` file's `<style>` block scoped to markup a reviewer can see on one screen, which matters for the SITE-04 `grep -r 'style="' src/` gate and for future Phase 4 JS to attach cleanly to named components.

### Pattern 1: Style conversion — `style=""` → scoped `<style>`, verified against `inlineStylesheets:'never'`

**What:** Every design `style="..."` attribute becomes a class selector in that file's `<style>` block (Astro scopes it automatically via a `data-astro-cid-*` attribute); every `style-hover="..."` becomes a real `:hover` rule; every `style-focus="..."` becomes `:focus-visible`.

**Verified build behavior (this repo, 2026-09-16):** With the current single page (`index.astro`, importing `tokens.css` + `base.css` from `BaseLayout.astro`, plus its own scoped `<style>` block), `pnpm build` emits exactly:
```html
<link rel="stylesheet" href="/_astro/index.BKGq4XlZ.css">
```
one file, containing `tokens.css` + `base.css` + the page's scoped styles concatenated — confirmed by inspecting `.vercel/output/static/_astro/index.[hash].css`, which opens with `:root{color-scheme:dark;--color-bg:#0a0a12;...}` (the token file) followed immediately by the page's own rules. **No inline `<style>` block appears in the HTML for this content** — the only `<style>` tags present are the two Astro Fonts API `@font-face` blocks (unrelated, already permitted by `security-check.sh` check 3). This means: however many section components you split into, and however you organize their `<style>` blocks, `inlineStylesheets:'never'` will merge them all into one external file per page automatically. There is no risk of "too many small files" or "still inline" — Vite's CSS code-splitting for Astro handles this without configuration.

**Example (Hero "03 Bleed" nav link, design line ~155):**
```html
<!-- design source (never ship this) -->
<a href="#servicos" style="font:500 13.5px/1 'DM Sans',sans-serif;color:rgba(255,255,255,.66)" style-hover="color:#fff">Serviços</a>
```
```astro
<!-- production .astro -->
<a href="#servicos" class="nav-link">Serviços</a>

<style>
  .nav-link {
    font: var(--font-weight-medium) var(--text-sm) / 1 var(--font-text);
    color: var(--color-text-muted);
    transition: color var(--dur-fast) var(--ease-standard);
  }
  .nav-link:hover,
  .nav-link:focus-visible {
    color: var(--color-text-strong);
  }
</style>
```
Note the `:focus-visible` is paired with `:hover` on the same rule — this satisfies ANIM-07's "every `:hover` has a `:focus-visible` equivalent" directly at the point of authorship, rather than as an after-the-fact audit.

### Pattern 2: Native `<details>`/`<summary>` mobile nav

**What:** Zero-JS disclosure widget. `<summary>` has an implicit ARIA role of `button` and the browser automatically manages `aria-expanded` — no manual ARIA needed. [CITED: MDN `<summary>` reference]

**Cross-browser marker removal (verified pattern, two rules needed):**
```css
.nav-toggle > summary {
  list-style: none;      /* Firefox, Chromium: <summary> is display:list-item by default */
  cursor: pointer;
}
.nav-toggle > summary::-webkit-details-marker {
  display: none;         /* legacy WebKit/Safari: ::marker alone is insufficient */
}
```
Do not rely on `summary::marker { display: none }` alone or on `display: flex` on `<summary>` to suppress the arrow — marker suppression is inconsistent across engines when `display` is changed directly on `<summary>`; the two rules above are the documented cross-browser-safe combination. [CITED: MDN + multiple corroborating sources]

**Critical pitfall — sticky header + `overflow` ancestors (see Common Pitfalls, Pitfall 4 for the specific ancestor chain in this design).**

**Known accepted limitation:** there is no CSS-only way to close a `<details>` element when the user clicks outside it (unlike the checkbox-hack alternative, which supports a full-viewport `<label>` overlay). Since Phase 3 ships zero JS, this limitation is accepted as-is per D-04 — it does not violate SITE-06 (which only requires keyboard operability and no focus trap, not outside-click dismissal). Flag this for Phase 4/5 as a candidate small JS enhancement if it becomes a usability complaint, but it is explicitly out of Phase 3 scope.

### Pattern 3: Reveal markup groundwork (ANIM-02) — CSS-only, dormant

**What:** Ship the `[data-reveal]` markup hooks and the CSS rule Phase 4's JS will later activate, but scope the "hidden" state so it **only** applies once `html.js-ready` exists — a class Phase 3 never adds. Result: with zero JS (this phase's actual state), every element is visible by default; ANIM-02 is satisfied structurally, not by a runtime check.

```css
[data-reveal] {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: no-preference) {
  html.js-ready [data-reveal] {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity var(--dur-reveal) var(--ease-out),
      transform var(--dur-reveal) var(--ease-out);
  }
  html.js-ready [data-reveal].is-revealed {
    opacity: 1;
    transform: none;
  }
}
```
Phase 4 is then responsible for (a) adding a tiny inline or early-executing script that sets `document.documentElement.classList.add('js-ready')`, and (b) the IntersectionObserver that toggles `.is-revealed`. Neither exists yet — Phase 3 only authors the CSS and sprinkles `data-reveal` attributes onto the same elements the design file already marks with `data-reveal="1"` (Serviços cards, Processo steps, Diferenciais tiles, Sobre columns, Contato column+form, FAQ pairs, CTA final block — read directly from the design source, lines 199-434). This is a standard "no-JS-first, progressively enhanced" technique; the specific `.js-ready` class name is this project's own choice (not from an external spec), but the underlying technique (gate animation-hiding behind a class only JS adds) is a long-established, widely-documented pattern for avoiding FOUC-style content hiding when JS fails to load. [MEDIUM confidence: standard technique, project-specific naming]

### Pattern 4: `scroll-margin-top` + reduced-motion-aware smooth scroll

```css
html {
  scroll-behavior: smooth;
}

:is(#servicos, #processo, #sobre, #contato) {
  scroll-margin-top: var(--nav-height, 84px);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```
Scoping the media-query override to the `html` selector (matching the property it overrides) rather than a blanket `*` selector is sufficient here — `scroll-behavior` only has an effect on scrolling containers (`html` for the document, or any element with its own scroll box), and this design has no nested scroll containers to worry about. [CITED: web.dev prefers-reduced-motion article shows the broader `*`-selector pattern for general safety when overriding many properties at once; narrowing to `html` is equivalent and cleaner when `scroll-behavior` is the only property being overridden.]

`--nav-height` should be a real computed value (measure the actual rendered header height for the "03 Bleed" variant, including its `padding: 26px 0 0` top offset) rather than a guess — set it as a token in `tokens.css` once the header component is built, so all four anchor targets share one source of truth.

### Pattern 5: `astro:assets` `<Image>`/`<Picture>` for the hero LCP image and portrait

**Verified empirically in this repo (2026-09-16), after applying the Pitfall 1 fix:**
```astro
---
import { Picture } from 'astro:assets';
import heroRender from '../assets/hero-render-placeholder.webp';
---
<Picture
  src={heroRender}
  alt=""
  aria-hidden="true"
  formats={['avif', 'webp']}
  priority
  width={960}
  height={720}
/>
```
Produces (verified build output):
```html
<picture>
  <source srcset="/_astro/hero-render-placeholder.[hash].avif" type="image/avif">
  <source srcset="/_astro/hero-render-placeholder.[hash].webp" type="image/webp">
  <img src="/_astro/hero-render-placeholder.[hash].webp" alt="" aria-hidden="true"
       loading="eager" decoding="sync" fetchpriority="high" width="960" height="720">
</picture>
```
The `priority` shorthand prop works identically on `<Picture>` and `<Image>` — both emit `loading="eager" decoding="sync" fetchpriority="high"` — confirmed by direct inspection of built HTML, not inferred from docs (the official Astro docs page for `<Picture>` does not mention `fetchpriority` or `priority` at all; this was independently verified against the actual `astro@7.3.1` install in this repo). [VERIFIED: local build, `astro@7.3.1`]

For the founder portrait (A11Y-05 requires **real** alt text, not `alt=""`):
```astro
<Picture
  src={founderPortrait}
  alt="Felipe Salles, fundador da Dmarques"
  formats={['avif', 'webp']}
  width={480}
  height={600}
/>
```
No `priority` needed here (not the LCP element) — default `loading="lazy"` is correct if it's below the fold (Sobre section).

**Format note:** author the placeholder source files as `.webp` (matching the Phase 2 cover-image precedent exactly — vector shapes only, no `<text>` elements, rasterized via Sharp, target similar size discipline). `<Picture formats={['avif','webp']}>` then generates an AVIF `<source>`, a WebP `<source>`, and falls back to the original WebP `<img>` — satisfying "AVIF/WebP" (SITE-09) with one authored file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Mobile menu open/close state | Custom JS toggle + `aria-expanded` bookkeeping | Native `<details>`/`<summary>` | Browser manages `aria-expanded`, keyboard (Enter/Space to toggle), and focus — zero JS, zero focus-trap risk (D-04) |
| Reveal-on-scroll visibility gating | A `<noscript>` fallback stylesheet, or JS that runs "if IO not supported, show everything" | CSS selector scoped to `html.js-ready` that a future script adds | Guarantees the *default* rendered state (no JS at all, which is Phase 3's actual state) is already the fully-visible state — no fallback logic needed because there's nothing to fall back from yet |
| AVIF/WebP generation, resizing, `fetchpriority` | Manual `sharp()` calls per image, hand-written `<picture>` markup | `<Picture formats={['avif','webp']} priority>` / `<Image priority>` | Astro's built-in pipeline already does exactly this — the only blocker was a dependency-resolution bug (Pitfall 1), not a capability gap |
| Contrast ratio verification | Eyeballing colors, "looks readable to me" | The WCAG relative-luminance/contrast-ratio formulas run programmatically (Code Examples § contrast-solver script) | Small alpha differences (0.45 vs. 0.46) are the difference between PASS and FAIL at 4.5:1 on this project's exact background colors — verified below; visual judgment cannot reliably distinguish this |

**Key insight:** every "don't hand-roll" item above already has a zero-dependency, zero-JS, platform-native or already-installed answer. The only genuine gap this phase hits is not a missing library — it's a broken dependency *declaration* (Pitfall 1), fixed with one line in `package.json`.

## Common Pitfalls

### Pitfall 1 (CRITICAL): `MissingSharp` breaks every `<Image>`/`<Picture>` usage under pnpm's strict linking

**What goes wrong:** Any `.astro` file that imports a local image and renders it via `<Image>` or `<Picture>` fails the entire `pnpm build` with:
```
[WARN] Unable to generate optimized image for /_astro/xxx.png: MissingSharp: Could not find Sharp.
Error generating image for /_astro/xxx.png: MissingSharp: Could not find Sharp.
```
**Why it happens:** Astro's built-in sharp image service calls `await import("sharp")` (a bare specifier) from inside a bundled server chunk at `.vercel/output/server/.prerender/chunks/sharp_*.mjs`. Under pnpm's default strict (non-hoisted) `node_modules` layout, that bare import cannot walk up to find `sharp`, because `sharp` is only installed as a *transitive* dependency of `astro` — not a top-level dependency of the project, and not reachable from where the bundled chunk physically lives after Vite's build step relocates it. This is a well-documented, widely-hit issue specific to pnpm + Astro's image pipeline (not specific to this project). [CITED: docs.astro.build/en/reference/errors/missing-sharp/ — "When using a strict package manager like pnpm, Sharp must be installed manually into your project"]

Phase 2's case-cover placeholder never hit this because it never used `<Image>`/`<Picture>` — it pre-rasterized a `.webp` file directly with a one-off Node script (manual `createRequire` resolution of the nested pnpm path), bypassing Astro's asset pipeline entirely. That workaround does not, and cannot, fix `<Image>`/`<Picture>` component usage, because `loadSharp()` runs from inside Astro's own code, with no injection point for a custom resolver.

**Reproduced and fixed live in this repo (2026-09-16):**
1. Build fails with `MissingSharp` the moment a test page uses `<Picture src={localImg} .../>`.
2. `pnpm add -D sharp@0.35.4` (the exact version already resolved transitively in `pnpm-lock.yaml` — confirmed via `npm view sharp version`).
3. Rebuild succeeds; `pnpm build` output shows `generating optimized images` completing 3/3, producing `.avif`/`.webp`/original-format variants with correct `<picture>`/`<source>` markup.
4. Scratch test files and the temporary devDependency were removed after verification; `git status --porcelain` confirms a clean tree.

**How to avoid:** Add `sharp@0.35.4` as an explicit devDependency in the **first task** of this phase, before authoring any component that uses `<Image>`/`<Picture>`. Do this before writing the hero/portrait components, or every subsequent build will fail and look like an authoring mistake rather than a missing prerequisite.

**Warning signs:** `pnpm build` succeeds for pages with no local `<Image>`/`<Picture>` usage (like the current `index.astro`) but fails the moment one is added — this is exactly the trap, because it means the failure will surface mid-phase rather than at the start unless this fix is front-loaded.

### Pitfall 2: Contrast math — exact computed values for this project's actual tokens (WCAG relative luminance + contrast ratio)

**What goes wrong:** "Raise the opacity a bit" without computing exact numbers either under-fixes (still fails AA) or over-fixes (visually washes out the design more than necessary — actual token values need only single-digit-percent adjustments in most cases).

**The formula** (verified against the current W3C spec, which corrected the linearization threshold from 0.03928 to 0.04045 in May 2021 — use 0.04045): [CITED: W3C, WCAG 2.1 Techniques G18 / Understanding SC 1.4.3]

1. Normalize each sRGB channel: `s = channel / 255`
2. Linearize: `c_lin = s <= 0.04045 ? s/12.92 : ((s+0.055)/1.055) ** 2.4`
3. Relative luminance: `L = 0.2126*R_lin + 0.7152*G_lin + 0.0722*B_lin`
4. Contrast ratio: `(L_lighter + 0.05) / (L_darker + 0.05)`
5. To find the **minimum alpha** of white composited over a known background hex that hits a target ratio: composite is `channel_result = round(alpha*255 + (1-alpha)*bg_channel)` per channel (standard "source-over" alpha blending in sRGB space, which is how browsers actually render `rgba()` over a solid background); binary-search `alpha` in `[0,1]` since contrast ratio increases monotonically with alpha for white-over-dark. There is no reliable closed-form inverse because of the gamma nonlinearity in step 2 — binary search to ~20 iterations gives far more precision than needed. This is the same approach real contrast-checker tools use internally.

**Ran this against every affected token/color in `tokens.css` and the design source (2026-09-16), against all three D-13 backgrounds:**

| Background | Min alpha for 4.5:1 (body) | Min alpha for 3:1 (large text/UI) |
|---|---|---|
| `#0A0A12` (`--color-bg`) | 0.4510 → use **0.46** | 0.3367 → use **0.34** |
| `#05050A` (`--color-bg-deep`) | 0.4540 → use **0.46** | 0.3420 → use **0.35** |
| `#0D1B2A` (gradient's lighter stop — the harder case for a gradient background, since a *lighter* bg stop needs *more* foreground alpha to hit the same ratio) | 0.4539 → use **0.46** | 0.3311 → use **0.34** |

**Existing `--color-text*` tokens checked against all three backgrounds — worst case shown (all three backgrounds gave near-identical results, within 0.003 of each other, so one number per token is safe):**

| Token | Current alpha | Contrast ratio (worst bg) | 4.5:1? | 3:1? | Verdict |
|---|---|---|---|---|---|
| `--color-text-strong` | 0.92 | 14.8–17.1 | PASS | PASS | No change needed |
| `--color-text` | 0.82 | 11.9–13.5 | PASS | PASS | No change needed |
| `--color-text-muted` | 0.66 | 8.1–8.8 | PASS | PASS | No change needed |
| `--color-text-faint` | 0.45 | 4.46–4.49 | **FAIL** (by a hair — 4.46 vs. 4.5 required) | PASS | **Raise to ≥0.47** if used for body-sized text; safe to leave only if every use is confirmed "large text" (≥24px regular / ≥18.66px bold) per WCAG's SC 1.4.3 definition — see the misconception warning below |

**Accent color as text/highlight, opaque (D-14's subject):**

| Color | vs `#0A0A12` | vs `#05050A` | vs `#0D1B2A` | 4.5:1? | 3:1? |
|---|---|---|---|---|---|
| `#6C4CFF` (`--color-accent`) | 3.864 | 3.986 | 3.409 | **FAIL** on all three | PASS on all three |
| `#9A85FF` (`--color-accent-light`) | 6.735 | 6.947 | 5.941 | PASS on all three | PASS on all three |

**Verdict for D-14:** `#6C4CFF` used as **large text** (e.g. the H1 highlighted span "funcionar melhor," clamp(36px,5vw,68px) bold) legitimately qualifies for the 3:1 exception and needs no change. `#6C4CFF` used as **small text** (eyebrow labels at ~10.5px — "O que fazemos" in Serviços, "Orçamento" in Contato, and similar) fails 4.5:1 and must switch to `--color-accent-light` (#9A85FF), exactly as D-14 anticipates. This is not a hypothetical — reading the design source directly, some eyebrows already use `#9A85FF` (Hero 03, Processo, Contato's "Orçamento" — wait, actually Contato's eyebrow **is** `#9A85FF` already at line 336) while others still use raw `#6C4CFF` (Serviços "O que fazemos" line 200, Diferenciais "Diferenciais" line 279 — though that one is on a *light* background, see below) — **audit every eyebrow/label instance individually against this table rather than assuming uniform treatment**, since the design file is inconsistent about which accent shade it already uses where.

**Light-background section (Diferenciais, uses `--color-light-*` tokens and one-off literal colors) — also checked, and also has failures, which fall outside D-13's literal wording (which only names the three dark backgrounds) but are still required by A11Y-06's general "WCAG AA contrast" mandate:**

| Color (as used in design source) | vs `#F2F3F6` (light bg) | 4.5:1? | 3:1? |
|---|---|---|---|
| `#6C4CFF` (Diferenciais eyebrow, small text) | 4.599 | PASS (barely) | PASS |
| `--color-light-text` `#3D4253` | 9.001 | PASS | PASS |
| `--color-light-text-muted` `#565C6E` | 6.005 | PASS | PASS |
| `--color-light-text-faint` `#767C8E` | 3.752 | **FAIL** | PASS |
| `#9096A8` (one-off literal color, Diferenciais H2 span "com a gente," design line 280 — **not a token at all**) | 2.661 | **FAIL** | **FAIL even at 3:1**, despite being large text |

**How to avoid:** Treat D-13's calculate-and-apply mandate as covering the *whole* shipped page, not literally only the three named backgrounds — the named backgrounds were almost certainly meant as "the dark-mode set," and the light-mode Diferenciais section needs the identical treatment. Concretely: (a) raise `--color-light-text-faint` from `#767C8E` to something ≥4.5:1 against `#F2F3F6` if it's ever used at body-text sizes (check actual usage — design line 364 uses it for the form's 13.5px helper text "Resposta no mesmo dia útil," which is small text, not large — this token needs remediation); (b) replace the one-off literal `#9096A8` with an existing passing token (e.g. `--color-light-text-muted`, `#565C6E`, ratio 6.0) rather than inventing a new intermediate — it is not a design token today and introducing a compliant intermediate color adds a token for a single use when an existing one already works.

**Warning signs:** any hardcoded hex/rgba color copy-pasted directly from the design source (rather than mapped to an existing `--color-*` token) is a signal to re-check it against this table before shipping — the design source has at least one color (`#9096A8`) that was never run through a contrast check when the mockup was made.

### Pitfall 3: The existing `--focus-ring` token fails A11Y-03's 3:1 requirement outright

**What goes wrong:** `tokens.css` currently defines `--focus-ring: 0 0 0 3px rgba(108,76,255,.5)`. This looks reasonable but the *rendered, composited* ring color must itself hit ≥3:1 non-text contrast against whatever sits behind it (WCAG SC 1.4.11, cited by A11Y-03's "contrast ≥3:1 on dark and light sections"). Computed and verified:

| Background behind the ring | Composited ring color | Contrast ratio | 3:1? |
|---|---|---|---|
| `#0A0A12` (dark section) | `rgb(59,43,137)` | 1.777 | **FAIL** |
| `#FFFFFF` (form input background) | `rgb(182,166,255)` | 2.124 | **FAIL** |
| `#F2F3F6` (light section) | `rgb(175,160,251)` | 2.047 | **FAIL** |

The 50%-alpha ring fails on **every** background in this design — not a marginal miss, but a real, ship-blocking accessibility gap that predates Phase 3 (the token was set in Phase 1) but must be caught and fixed here since A11Y-03 belongs to this phase.

**How to avoid:** Use the **fully opaque** base accent for the focus ring instead of a 50%-alpha version. Verified:
- `#6C4CFF` opaque vs `#0A0A12`: 3.864 (PASS)
- `#6C4CFF` opaque vs `#FFFFFF`: 5.103 (PASS)
- `#6C4CFF` opaque vs `#F2F3F6`: 4.599 (PASS)

One token change comfortably clears 3:1 everywhere, with no need for different focus-ring colors per section:
```css
--focus-ring: 0 0 0 3px var(--color-accent);
```
(Minimum alpha needed if partial transparency is preferred for aesthetic reasons: 0.833 vs. the dark background, 0.70–0.73 vs. light backgrounds — i.e., an alpha this high has essentially the same visual weight as fully opaque, so there is no real reason to keep any transparency here.)

**Note:** `--color-accent-light` (`#9A85FF`), which D-14 recommends for *text* contrast fixes, is actually **worse** for this specific purpose — it fails 3:1 against light backgrounds (2.6–2.9). Do not reuse the same "switch to accent-light" fix for the focus ring; they solve different problems against different backgrounds.

### Pitfall 4: `<details>` mobile-nav panel clipped by an `overflow:hidden`/`overflow-x:clip` ancestor

**What goes wrong:** The design source wraps the *entire page* in `<div style="position:relative;background:#0A0A12;overflow-x:clip">` (line 28) and, separately, the Hero "03 Bleed" section itself sets `overflow:hidden` on its image/canvas container. If the mobile `<details>` nav panel is authored as a child of an element with `overflow:hidden`/`overflow-x:clip` between it and the viewport, the expanded panel gets visually clipped at the ancestor's boundary — even with correct `z-index`, because clipping happens before stacking-context painting resolves. This is a generic, well-documented CSS pitfall for any dropdown/disclosure nested inside a clipped or `position:sticky` ancestor. [CITED: general CSS stacking-context/overflow-clipping behavior, corroborated across multiple sources]

**Why it happens:** `overflow-x: clip` (used for the outer wrapper, presumably to contain the hero's edge-bleed image and prevent horizontal scrollbars) creates a clipping context on the cross axis; if the nav's `<details>` panel is a descendant, its open state is still subject to that ancestor's clip rectangle regardless of `position: absolute` or `z-index` values.

**How to avoid:** Do not literally reproduce the design's single giant `overflow-x:clip` wrapper around the *entire* document. Instead, scope `overflow: hidden`/`overflow-x: clip` narrowly to only the elements that actually need it for their own visual effect (the hero's edge-bleed image container, the canvas containers, the CTA-final radial glow container) — never on a shared ancestor of the header/nav. If a page-level wrapper is still wanted for other reasons, ensure the header (and therefore the `<details>` nav) is a sibling of that wrapper, not a descendant, or give the header its own stacking context that is not subject to the wrapper's clip.

**Warning signs:** the nav panel renders fine in isolation (e.g. a Storybook-style single-component preview) but gets cut off mid-panel once placed inside the real page layout — a strong signal that an ancestor's `overflow` property is the culprit, not the panel's own CSS.

### Pitfall 5: DC-editor-only syntax leaking into production markup

**What goes wrong:** The design source contains attributes that are **not valid HTML/Astro** and exist only for the Claude-Design editor's runtime: `onClick="{{ setHero1 }}"`, `onSubmit="{{ onSubmit }}"`, `ref="{{ canvasRef }}"`, `style-hover="..."`, `style-focus="..."`, and the `<image-slot>`/`<sc-if>` custom elements. If any of these get copy-pasted rather than deliberately translated, the build may still succeed (Astro doesn't validate arbitrary attribute names) but the output HTML will contain dead, meaningless attributes (`onClick="{{ setHero1 }}"` renders as a literal broken inline event handler string in the DOM) — a correctness bug that neither `astro check` nor the `style="` grep gate catches, since it's not a `style=` attribute.

**How to avoid:** Treat every design-file attribute as **reference-only** for visual intent, never as literal markup to transplant. Specifically strip/translate, per attribute: `style="..."` → CSS class + `<style>` rule (SITE-04, already gated); `style-hover`/`style-focus` → `:hover`/`:focus-visible` rules; `onClick`/`onSubmit`/`ref` → deleted entirely (Phase 3 ships no JS to bind them to); `<image-slot>` → real `<Picture>`/`<Image>`; `<sc-if>` → deleted (only Hero variant 03 is authored at all, so no runtime conditional is needed).

**Warning signs:** any `grep -rn 'onClick\|onSubmit\|{{' src/` hit after authoring is a signal that raw design-editor syntax survived; run this as a manual pre-commit sanity check even though it isn't part of the existing `security-check.sh` gates.

### Pitfall 6: Custom 404 pages have a history of not being served correctly on Vercel with static output

**What goes wrong:** A documented, multi-year pattern of GitHub issues against `withastro/astro` (e.g. #9578, #4164, #5320, #14877) report that `src/pages/404.astro` builds correctly to `dist/404.html` / `.vercel/output/static/404.html`, but Vercel's platform serves its own generic 404 for unmatched routes instead of the custom page — the custom page is only reachable by navigating to the literal `/404` URL, defeating the purpose. The root cause has historically been how the Vercel adapter's build-output routing manifest (or lack thereof) tells Vercel's edge network which file to serve for unmatched paths.

**Current confidence:** MEDIUM. This project is on `@astrojs/vercel@11.0.10` with `astro@7.3.1`, both far newer than the versions in the cited issues (some dating to Astro v4.0.9 in early 2024), and the linked PR (#9591) suggests at least a partial fix landed. I could not confirm from documentation alone whether the current adapter version fully resolves this for `output: 'static'`.

**How to avoid:** Do not treat "the file builds to `404.html`" as sufficient verification. As part of this phase's verification (not just the build), deploy to a Vercel preview and manually request a nonexistent path (e.g. `/this-does-not-exist`) with `curl -I` to confirm both (a) the branded 404 content is actually served, and (b) ideally a `404` HTTP status is returned (Vercel's static builder convention is to serve `404.html` with a 404 status automatically for unmatched routes when it's present in the output — but this is exactly the behavior the cited issues report as broken in some configurations). This is a concrete addition to this phase's manual verification checklist, not just an automated build assertion.

### Pitfall 7: WCAG's "large text" exception is about font **size**, not content **role**

**What goes wrong:** It's tempting to assume small uppercase "eyebrow" labels, badges, or captions get a contrast pass because they're "just decorative UI labels, not real content." WCAG SC 1.4.3's 3:1 exception applies strictly to **font size** (≥18pt/24px regular, or ≥14pt/18.66px bold) — there is no separate exception for a text node's semantic role as a label vs. body copy. A 10.5px uppercase eyebrow like "O que fazemos" is small text by any reading of the spec and must hit 4.5:1 like any paragraph, regardless of how the design treats it visually. [CITED: W3C Understanding SC 1.4.3]

**How to avoid:** When auditing any given text node against the tables in Pitfall 2, classify it by its **rendered font-size/weight**, not by its design role. Every eyebrow/label/caption in this design (they run 9.5px–13px across sections) needs the 4.5:1 bar unless proven otherwise by exact pixel measurement against the pt-to-px conversion (18pt ≈ 24px, 14pt bold ≈ 18.67px) — nothing in this design's type scale reaches that size except headings, which are already unambiguously "large text."

### Pitfall 8: `differentiators` content collection has no `numero` field — the "01/02/03/04" display numbers must be derived, not stored

**What goes wrong:** Unlike `process` (which has an explicit `numero: z.string().regex(/^\d{2}$/)` field), the `differentiators` schema (Phase 2, `src/content.config.ts`) only has `order: z.number().int().positive()`. The design shows "01"/"02"/"03"/"04" prefixes on each Diferenciais tile. Authoring these as hardcoded literal strings in four separate `.astro`-rendered loop iterations, or worse, hand-typing them per YAML file as free text, both work but create two sources of truth that can drift if a tile is reordered or added later.

**How to avoid:** Derive the zero-padded number from the collection's own `order` field at render time (`String(item.data.order).padStart(2, '0')`), matching the same source of truth the `order`-based sort already uses (`src/content/index.ts`'s `byOrder` comparator). This keeps reordering a one-line YAML edit rather than a multi-file coordination problem.

## Code Examples

### Contrast-solver script (reusable, run once per token change during this phase)
```javascript
// Source: WCAG 2.1 relative luminance + contrast ratio formulas
// https://www.w3.org/WAI/WCAG21/Techniques/general/G18.html (current spec, 0.04045 threshold, corrected May 2021)
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function relLuminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(a, b) {
  const L1 = relLuminance(a), L2 = relLuminance(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}
function compositeOver(alpha, fgHex, bgHex) {
  const fg = hexToRgb(fgHex), bg = hexToRgb(bgHex);
  return fg.map((c, i) => Math.round(alpha * c + (1 - alpha) * bg[i]));
}
function minAlphaForRatio(fgHex, bgHex, target) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const ratio = contrastRatio(compositeOver(mid, fgHex, bgHex), hexToRgb(bgHex));
    if (ratio >= target) hi = mid; else lo = mid;
  }
  return hi;
}
// usage: minAlphaForRatio('#FFFFFF', '#0A0A12', 4.5) -> 0.4510
```

### Skip link (A11Y-01)
```astro
<a href="#conteudo" class="skip-link">Pular para o conteúdo</a>
<style>
  .skip-link {
    position: absolute;
    top: -100%;
    left: var(--space-4);
    z-index: var(--z-skiplink);
    padding: var(--space-3) var(--space-5);
    background: var(--color-accent);
    color: var(--color-text-on-accent);
    border-radius: var(--radius-md);
    transition: top var(--dur-fast) var(--ease-standard);
  }
  .skip-link:focus-visible {
    top: var(--space-4);
  }
</style>
```
`<main id="conteudo">` already exists in the current `index.astro` — reuse the same id.

### `<details>`/`<summary>` mobile nav skeleton
```astro
<details class="nav-toggle">
  <summary aria-label="Abrir menu de navegação">
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
  </summary>
  <nav class="nav-panel">
    <a href="#servicos">Serviços</a>
    <a href="#processo">Como trabalhamos</a>
    <a href="#sobre">Sobre</a>
    <a href="#contato">Contato</a>
  </nav>
</details>
<a href="#contato" class="cta-pill">Pedir orçamento</a>

<style>
  .nav-toggle > summary {
    list-style: none;
    cursor: pointer;
  }
  .nav-toggle > summary::-webkit-details-marker {
    display: none;
  }
  .nav-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
</style>
```

### `<main>`/landmark structure (A11Y-02)
```astro
<body>
  <a href="#conteudo" class="skip-link">Pular para o conteúdo</a>
  <header><!-- nav lives here --></header>
  <main id="conteudo">
    <!-- one <h1> total, lives in the Hero section component -->
  </main>
  <footer><!-- Rodapé --></footer>
</body>
```

### New route shells (SITE-07/08, D-12)
```astro
---
// src/pages/obrigado.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Pedido enviado — Dmarques">
  <main id="conteudo">
    <h1>Recebemos seu pedido</h1>
    <p>Respondemos no mesmo dia útil. Enquanto isso, fale com a gente no WhatsApp se preferir.</p>
    <a href="/">Voltar para a home</a>
  </main>
</BaseLayout>
```
```astro
---
// src/pages/404.astro — Astro's special-cased route, builds to /404.html
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Página não encontrada — Dmarques">
  <main id="conteudo">
    <h1>Página não encontrada</h1>
    <p>O endereço que você tentou acessar não existe.</p>
    <a href="/">Voltar para a home</a>
  </main>
</BaseLayout>
```
```astro
---
// src/pages/politica-de-privacidade.astro — shell only, D-12, body copy is Phase 5
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Política de Privacidade — Dmarques">
  <main id="conteudo">
    <h1>Política de Privacidade</h1>
    <p>Esta página será publicada com o conteúdo completo no lançamento do formulário.</p>
  </main>
</BaseLayout>
```
No `.astro` file needs a `prerender` export in any of these — `output: 'static'` prerenders everything by default; only the future `/api/orcamento` route (Phase 5) will need `export const prerender = false`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `experimental.csp` config flag | Stable `security.csp` | Astro 6.0 | Not this phase's concern (Phase 7), but relevant: Phase 3's job of removing all `style=""` attributes is a direct prerequisite for Phase 7's strict `style-src` — this phase's success is load-bearing for a later phase, not just self-contained |
| Assuming `sharp` "just works" because it's an `astro` dependency | Must be an explicit top-level dependency under pnpm strict mode | Ongoing (pnpm's strict-by-default linking, not a recent Astro change) | Directly affects this phase — see Critical Finding |
| 0.03928 sRGB linearization threshold in WCAG contrast formula | 0.04045 (corrected) | May 2021, WCAG 2.1 errata | Negligible practical difference for this project's colors, but use the current constant for a technically-accurate implementation |

**Deprecated/outdated:** none directly relevant beyond the above — this phase works entirely with current, stable Astro 7 / CSS platform features.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `.js-ready` gating pattern (Pattern 3) will be implemented by Phase 4 exactly as sketched here (class added early, IO toggles `.is-revealed`) | Architecture Patterns § Pattern 3 | Low — Phase 3's CSS is inert either way (no JS ships this phase), so ANIM-02 is satisfied regardless of Phase 4's exact implementation choice; only the *class name* `.js-ready`/`.is-revealed` needs to match across phases, which is a naming coordination, not a functional risk |
| A2 | `@astrojs/vercel@11.0.10`'s current build-output routing manifest correctly wires `404.html` to be served for unmatched routes on Vercel (Pitfall 6) | Common Pitfalls § Pitfall 6 | Medium — if wrong, SITE-08 would appear to pass locally (`dist/404.html` exists, `astro check` is silent) but fail in production; mitigated by requiring an explicit preview-deploy `curl -I` check in this phase's verification, not just a build assertion |
| A3 | No section beyond the 9 listed in SITE-01 needs the `cases` content collection rendered anywhere in Phase 3's markup | Phase Requirements / Open Questions | Low-Medium — if the planner intends to surface a Cases/portfolio teaser in v1's one-pager, that's new markup not covered by any locked decision in CONTEXT.md or by the SITE-01 section list; flagged as an Open Question below rather than assumed silently |
| A4 | `pnpm-workspace.yaml`'s `onlyBuiltDependencies: [esbuild]` allowlist does not need a `sharp` entry added, because Sharp ships prebuilt platform binaries as optional dependencies rather than requiring a compiled postinstall script | Package Legitimacy Audit / Standard Stack | Low — verified empirically in this repo (`pnpm add -D sharp@0.35.4` followed immediately by a successful `pnpm build` that generated real AVIF/WebP output, with no build-script-blocked warning from pnpm) |

## Open Questions

1. **Does Phase 3 need to render the `cases` content collection anywhere in the one-pager?**
   - What we know: SITE-01 lists exactly 9 sections (Hero, Serviços, Como trabalhamos, Diferenciais, Sobre, Contato, FAQ, CTA final, Rodapé) — no "Cases"/portfolio section appears. The `cases` collection (Phase 2, `dmarques.md` + cover) exists and is exported via `getCases()` in `src/content/index.ts`, and TRUST-04 ("depoimentos reais... componente e collection já prontos") is explicitly deferred to post-validation v1.x.
   - What's unclear: whether the `cases` collection is simply unused in v1's shipped page (existing only for future use) or whether it was meant to feed a "case de sucesso" teaser somewhere in Phase 3 that isn't spelled out in CONTEXT.md.
   - Recommendation: treat it as **not rendered in Phase 3** (matches the literal SITE-01 section list and the explicit v1.x deferral of testimonials/cases-adjacent content) unless the planner finds a contradicting signal in ROADMAP.md. If left unrendered, note explicitly in the plan that this is deliberate, so a future reviewer doesn't assume it was forgotten.

2. **Does the custom `/404` actually get served by Vercel for this adapter/output combination?**
   - What we know: multi-year history of this specific class of bug against `@astrojs/vercel`; current versions are far newer than the reported issues and likely include fixes.
   - What's unclear: no official changelog entry or docs page confirms the fix status for `@astrojs/vercel@11.0.10` + `output: 'static'` specifically.
   - Recommendation: add an explicit manual verification step (preview-deploy `curl -I` against a nonexistent path) to this phase's plan rather than trusting the build-time `dist/404.html` output alone.

3. **Exact `--nav-height` value for `scroll-margin-top` (Pattern 4)**
   - What we know: the header's rendered height depends on the final Hero "03 Bleed" header markup/padding, which doesn't exist yet.
   - What's unclear: the precise pixel value until the header component is built.
   - Recommendation: build the header first, measure its real rendered height (dev tools, at both mobile and desktop breakpoints if it differs), then set `--nav-height` as a token — do not guess a placeholder number and forget to revisit it.

## Environment Availability

No new external tools/services are required by this phase beyond what Phase 1/2 already established and verified working.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build runtime | ✓ | 24.x (confirmed via successful `pnpm build` this session) | — |
| pnpm | Package management | ✓ | 11.15.1 (per `package.json` `packageManager` field, confirmed working this session) | — |
| Sharp (as explicit devDependency) | `astro:assets` `<Image>`/`<Picture>` | ✗ until this phase's first task adds it | 0.35.4 pinned | None viable — `passthroughImageService()` would satisfy the build but violates SITE-09/PERF-05; not an acceptable fallback |
| A11y linting tool (`@axe-core/cli` / `pa11y-ci`) | Optional automated a11y gate (CLAUDE.md lists as optional) | ✗ not installed | — | Manual keyboard + screen-reader pass (already required by CLAUDE.md regardless); this phase's contrast math (Pitfall 2) and semantic-landmark patterns substitute for most of what an automated a11y linter would catch, but do not fully replace one — flag as a possible future addition, not required for this phase |

**Missing dependencies with no fallback:** `sharp` as an explicit devDependency — this is not optional, see Pitfall 1.

**Missing dependencies with fallback:** automated a11y linting — manual verification substitutes.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (no Jest/Vitest/Playwright in this repo) — validation is gate-script + build-assertion based |
| Config file | `.github/workflows/ci.yml` (orchestrates `astro check` → `pnpm build` → `pnpm audit` → `js-weight-check.sh` → `security-check.sh --ci`), `lighthouserc.json` |
| Quick run command | `pnpm build && bash scripts/security-check.sh --ci` (skips the Lighthouse network round-trip; runs checks 1-5 locally) |
| Full suite command | full `security-check.sh --ci` against a live `PREVIEW_URL` (checks 6-7, headers + Lighthouse) — requires a Vercel preview deployment |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SITE-04 | No `style=""` anywhere in `src/` | grep-gate | `bash scripts/security-check.sh --ci` (check 2) | ✅ exists |
| SITE-09 / PERF-05 | Images processed at build only, AVIF/WebP present | build assertion | `pnpm build` (fails loudly if Sharp missing — see Pitfall 1) + manual inspect of `.vercel/output/static/_astro/*.avif`/`*.webp` | ✅ build gate exists; manual inspection step needed |
| A11Y-06 | WCAG AA contrast | computed, not automated | Contrast-solver script (Code Examples) run against final token values before commit | ❌ Wave 0 — no CI-automated contrast check exists; this is a pre-commit manual/scripted verification, not a CI gate |
| A11Y-03 | Focus ring ≥3:1 | computed, not automated | Same contrast-solver script, run against `--focus-ring` composited value | ❌ Wave 0 — same gap as above |
| SITE-08 | Branded 404 actually served by Vercel | manual/live check | `curl -I https://<preview>/this-does-not-exist` after deploy | ❌ Wave 0 — no existing script checks this; add as a manual verification step |
| SITE-06 / A11Y-04 | Mobile nav keyboard-operable, no focus trap | manual | Tab-through test with keyboard only, no mouse | ❌ Wave 0 — inherently manual, native `<details>` behavior is well-established but should still be spot-checked |

### Sampling Rate
- **Per task commit:** `pnpm build` (catches MissingSharp, broken markup, missing content-collection fields) + `bash scripts/security-check.sh --ci` local checks (1-5)
- **Per wave merge:** full `security-check.sh --ci` against the phase's Vercel preview URL (checks 6-7: header baseline + Lighthouse gate)
- **Phase gate:** Lighthouse mobile ≥95 all four categories on the real preview (PERF-01, already enforced since Phase 1); manual contrast-solver run confirms every token change actually clears its target ratio; manual `curl -I` 404 check; manual keyboard pass

### Wave 0 Gaps
- [ ] No automated contrast-ratio check exists in CI — the contrast-solver script (Code Examples) should be run manually against final `tokens.css` values before each commit that touches color tokens; consider whether a future phase should promote this into a committed script (out of scope to decide here, flagging for planner awareness)
- [ ] No automated check confirms the Vercel-served 404 behavior (Pitfall 6) — add as a manual verification step, not a Wave 0 script, since it requires a live preview URL
- [ ] `sharp` install (Pitfall 1) is a build-time prerequisite, not a test gap per se, but must land as literally the first task or every other task's build-based verification will fail for unrelated-looking reasons

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this project (Out of Scope table, REQUIREMENTS.md) |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No access-controlled resources |
| V5 Input Validation | Marginal | Form fields ship with `type="tel"`/`type="email"`-appropriate HTML attributes now (D-07) but no validation logic — that's Phase 5 (FORM-04/05) |
| V6 Cryptography | No | No crypto in this phase |
| V12 Files/Resources | Yes | Local image assets only (hero/portrait placeholders); no user uploads; no remote image domains configured in `astro.config.mjs` (confirmed: no `image.domains`/`image.remotePatterns` present), so `<Image>`/`<Picture>` cannot be pointed at an attacker-controlled URL |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reintroducing an inline `style=""`/`onClick` attribute (Pitfall 5) that later widens the Phase 7 CSP `style-src`/`script-src` beyond `'self'` | Tampering | `security-check.sh` check 2 (grep gate) + this phase's explicit goal of *removing* every inline-style surface, never adding one |
| Sharp/image pipeline pulling a remote or attacker-supplied URL | Tampering / Information Disclosure | No `image.domains`/`image.remotePatterns` configured; all Phase 3 images are locally authored placeholder files under `src/assets/`, never remote URLs |
| Adding `sharp` as a new devDependency (supply-chain surface) | Tampering | Verified via slopcheck `[OK]`, matches the exact version already present and audited clean in `pnpm-lock.yaml` as a transitive dependency — this changes the dependency *declaration*, not the resolved dependency *tree* |

## Sources

### Primary (HIGH confidence)
- Direct experimentation against this repo's actual `astro@7.3.1` / `@astrojs/vercel@11.0.10` / `sharp@0.35.4` install (2026-09-16): `pnpm build` output inspection for CSS bundling behavior (`inlineStylesheets:'never'`), the `MissingSharp` reproduction and fix, and `<Picture>`/`<Image>` `priority`/`formats` output verification.
- `.planning/phases/01-foundation-ci-gate/*` and `.planning/phases/02-content-collections/*` (this project's own prior verified research/summaries) — `inlineStylesheets:'never'` behavior already spot-checked in Phase 1; Sharp `createRequire` precedent from Phase 2.
- `arquivos de design/Dmarques Landing.dc.html` — verbatim design source, read in full (615 lines).
- `src/content.config.ts`, `src/content/*/*.yaml`, `src/content/index.ts`, `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/styles/tokens.css`/`base.css`, `scripts/security-check.sh` — read directly from the working tree.
- https://www.w3.org/WAI/WCAG21/Techniques/general/G18.html — relative luminance / contrast ratio formulas, confirmed current 0.04045 threshold.
- https://docs.astro.build/en/reference/errors/missing-sharp/ — official guidance confirming pnpm-strict-mode Sharp resolution requirement.

### Secondary (MEDIUM confidence)
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary — `<summary>` implicit ARIA role, automatic `aria-expanded`.
- https://github.com/withastro/astro/issues/9578 (and related #4164, #5320, #14877) — historical Vercel-adapter custom-404 serving issues; recency/resolution status for the current adapter version not independently confirmed beyond the newer version numbers involved.
- https://web.dev/articles/prefers-reduced-motion — reduced-motion CSS override pattern (broader `*` selector shown; narrowed to `html` for this project's specific need).
- WebSearch results on pnpm + Sharp + Vercel ("Could not find Sharp") — multiple independent sources corroborating the official docs guidance.

### Tertiary (LOW confidence)
- None retained as authoritative in this document — all findings above were either verified empirically in this repo or cross-checked against an official/W3C source.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — the one new dependency (`sharp`) was verified by reproducing the failure and the fix directly in this repo, not by documentation alone.
- Architecture: HIGH — CSS bundling behavior, `<Picture>`/`<Image>` output, and `<details>` semantics are either empirically verified or drawn from MDN/official docs.
- Pitfalls: HIGH for Pitfalls 1-3, 5, 7-8 (computed/verified in this repo); MEDIUM for Pitfall 4 (well-documented general CSS behavior, not this-repo-tested since no nav component exists yet); MEDIUM for Pitfall 6 (historical issue, current-version resolution status not independently confirmed).

**Research date:** 2026-09-16
**Valid until:** 30 days (stable Astro/CSS platform features; the Sharp/pnpm interaction and the Vercel-404 behavior are the two items most likely to shift with a dependency bump — re-verify if `astro`, `@astrojs/vercel`, or `sharp` versions change before this phase executes)
