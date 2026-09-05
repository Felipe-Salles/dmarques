# Feature Research

**Domain:** One-page marketing/landing site for a solo web-development agency (Dmarques, Ibitinga/SP, Brazil) — brochure + lead capture, Astro SSG, fixed dark visual design
**Researched:** 2026-09-05
**Confidence:** HIGH for conversion/SEO/accessibility patterns (multiple current sources + official specs); MEDIUM for LGPD legal-basis nuances (verify final privacy-policy wording with a Brazilian data-protection reference or lawyer)

---

## Context From Design + PROJECT.md

The visual design is locked: 9 sections (Hero "03 Bleed", Serviços, Como trabalhamos, Diferenciais, Sobre, Contato, FAQ, CTA final, Rodapé). This research is about **capabilities behind the sections**, not layout.

What the design already gives us (do not re-litigate):

- Anchor nav (`#servicos`, `#processo`, `#sobre`, `#contato`) + `scroll-behavior:smooth`
- Two conversion paths: `#contato` form and `wa.me/5516996111785` WhatsApp deep-link (appears 4x)
- Response-time promise already in copy: *"Resposta no mesmo dia útil."*
- Founder photo + real name + personal story (Sobre)
- Named 4-step method (Diagnóstico → Planejamento → Desenvolvimento → Entrega)
- 4 explicit commitments (Diferenciais) framed as *"não dependem de tempo de mercado"* — deliberate new-agency positioning
- FAQ with 4 objection-handling Q&As (prazo, manutenção, pagamento, "não sei o que preciso")
- Founder quote card (NOT a client testimonial — honest for a new agency)
- Real contact block: WhatsApp, e-mail, cidade/UF; Instagram `@felipe.salles1`
- Motion prototyped: scroll reveal (fade + `translateY(20px)` with stagger), cursor-follow glow (`pointermove` + rAF), particle `<canvas>` (dpr capped at 2, point count ∝ area), `dmFloat`/`dmPulse` keyframes, card/button hover states
- Form fields in the mockup: **Nome** (text), **WhatsApp** (tel), **Tipo de projeto** (select, 5 options). No e-mail field, no message field, no consent UI, no honeypot — all to be decided here.
- Design-editor runtime files (`support.js`, `image-slot.js`) are NOT production code.
- Contact e-mail in the mockup is `...@hotmail.com` — a known trust liability (see differentiators).

---

## Feature Landscape

### Table Stakes (Users / Google / the Law Expect These)

Missing any of these makes the site feel amateur, hurts ranking, or creates legal exposure.

| # | Feature | Why Expected | Complexity | Notes |
|---|---------|--------------|------------|-------|
| T1 | **Working quote form → founder inbox** | The site's stated purpose is lead capture. A form that only fakes success (as the mockup does) is a broken product. | MEDIUM | Astro API route on Vercel → Resend API. Secret server-side only. Return JSON; progressively enhance from a real `<form method="POST">`. |
| T2 | **Server-side validation** on every field | Client validation is bypassable; garbage/malicious payloads otherwise reach the inbox. | LOW | Validate: nome (2–80 chars), phone OR email present and well-formed, tipo ∈ allowed set, message ≤ 2000 chars. Reject with field-level errors. Use a tiny schema lib (zod/valibot) shared client+server. |
| T3 | **Client-side inline validation** (on blur / on submit, never per-keystroke) | Users expect immediate, specific feedback before a round-trip. | LOW | Mirror the server schema. Do not block submit on JS — server is the source of truth. |
| T4 | **Accessible error + status messaging** | WCAG 3.3.1/3.3.3; color-blind and screen-reader users must perceive errors. | MEDIUM | Text errors (not color-only), `aria-invalid="true"`, `aria-describedby` linking field→error, errors in an `aria-live="polite"` region (or an error summary with in-page links), move focus to first error. Success + failure both announced. |
| T5 | **Form submission states**: idle / submitting / success / error | Users must know it worked; a label swap on the button (mockup) is not enough. | LOW–MEDIUM | Disable submit while pending; on success replace form with a confirmation ("Recebido. Retorno no mesmo dia útil.") and set focus to it; on error keep all entered data + show a retry path (and the WhatsApp fallback). |
| T6 | **Spam protection: honeypot + submission-timing check** | An unprotected public form fills the inbox within days. | LOW | Hidden `input` (off-screen, `autocomplete="off"`, `tabindex="-1"`, `aria-hidden`) — reject if filled. Signed/HMAC timestamp planted at render; reject if submitted < ~3s or > ~2h later. Both server-side. |
| T7 | **Rate limiting on the endpoint** | Prevents flood/abuse of the Resend quota and the inbox (client requirement: "ninguém pode derrubar"). | LOW–MEDIUM | Per-IP token bucket (e.g. 5/min, 20/hour). On Vercel: Upstash Redis or a lightweight in-memory limiter per region. Return 429 with a friendly message. |
| T8 | **WhatsApp deep-link** `wa.me/5516996111785` | In Brazil, WhatsApp is the default B2B first contact — not a nice-to-have. | LOW | Already in design. Add `?text=` pre-fill ("Olá, vim pelo site e quero um orçamento para…") — see D-tier. `rel="noopener"`, opens new tab. |
| T9 | **`tel:` and `mailto:` links** | Expected on any local service site; lets mobile users call/e-mail in one tap. | LOW | Already in footer/contact. Keep phone in `+55 16 99611-1785` E.164 for `tel:`. |
| T10 | **Response-time promise** stated near every CTA | Sets expectations; single biggest perceived-risk reducer for "will this person even reply?". | LOW | Already in design ("mesmo dia útil"). Keep it truthful; repeat it in the form success message. |
| T11 | **Privacy Policy page** (`/politica-de-privacidade`) in pt-BR | LGPD Art. 9 — the form collects nome + telefone (personal data). A footer link to a real policy is a baseline expectation and a trust signal. | MEDIUM | Static Astro route. Content spec in the LGPD section below. Link from footer AND from the form. Include "última atualização" date. |
| T12 | **LGPD data-use notice on the form** | LGPD transparency (Art. 9): the user must know what's collected, why, and where the policy is — *before* submitting. | LOW | One line under the submit button: "Ao enviar, você concorda com o uso dos seus dados para retorno do contato, conforme a [Política de Privacidade]." (Checkbox vs. notice-only — see LGPD section.) |
| T13 | **`<title>`, meta description, canonical** in pt-BR | Basic SEO; wrong/missing = poor SERP presentation. | LOW | One page → one canonical (absolute HTTPS URL, no trailing junk). Description ~150 chars, mentions "Ibitinga", "sites", "sistemas", "automação". |
| T14 | **Open Graph + Twitter Card tags + share image** | Links shared on WhatsApp/Instagram/LinkedIn render as blank/ugly without them — directly hurts the referral channel this business depends on. | LOW–MEDIUM | `og:title/description/url/type=website/locale=pt_BR`, `og:image` (1200×630 PNG, designed, < 300 KB), `twitter:card=summary_large_image`. Generate the image once (static asset) — do NOT add a runtime OG-image service. |
| T15 | **`<html lang="pt-BR">`** | Screen readers pick the right voice; Google confirms language. | LOW | Trivial, often forgotten. |
| T16 | **`sitemap.xml` + `robots.txt`** | Crawlability baseline. | LOW | `@astrojs/sitemap`. `robots.txt` allows all, points to sitemap, and (optionally) blocks the form endpoint path. |
| T17 | **JSON-LD structured data** — `LocalBusiness` + `ProfessionalService` (as a `@type` array) | Local service business: feeds Google's local pack, Maps, and AI answers; complements a Google Business Profile. | LOW–MEDIUM | One JSON-LD block: `name`, `@type:["ProfessionalService","LocalBusiness"]`, `description`, `url`, `telephone` (+55…), `email`, `areaServed` (Ibitinga + região / SP), `address` (at least `addressLocality`, `addressRegion:"SP"`, `addressCountry:"BR"`), `sameAs:[instagram]`, `image`/`logo`, `priceRange` optional, `founder` (Person). Keep NAP identical to the Google Business Profile. |
| T18 | **`FAQPage` JSON-LD** for the FAQ section | The design already has 4 real Q&As; marking them up is near-free eligibility for FAQ rich results / AI citation. | LOW | Generate from the same content source as the visible FAQ (single source of truth). Only mark up genuinely visible Q&As. |
| T19 | **Favicon set + `theme-color` + web app manifest basics** | A missing favicon reads as "unfinished". Dark `theme-color` matches the design. | LOW | SVG favicon + 180px apple-touch-icon + `theme-color:#0A0A12`. |
| T20 | **Section anchor nav with fixed-header offset** | Clicking "Serviços" must land with the heading visible, not hidden under a sticky bar. | LOW | `scroll-margin-top` on each `section[id]`. Respect reduced motion (see A7). |
| T21 | **Mobile navigation** | The design's nav has 4 links + a CTA that wrap awkwardly on small screens. | LOW–MEDIUM | Simplest robust option: keep links visible as a wrapped/scrollable row, OR a `<details>`-based disclosure menu (no JS framework). Must be keyboard-operable and not trap focus. |
| T22 | **Keyboard operability of everything interactive** | WCAG 2.1.1. Nav links, form, both CTAs, mobile menu. | LOW | Native elements (`<a>`, `<button>`, `<input>`, `<select>`) get this free — the risk is custom JS widgets and the mobile menu. |
| T23 | **Visible focus indicator on all interactive elements** | WCAG 2.4.7 / 2.4.11 (2.2). The design defines `:focus` only for inputs (faint 3px shadow) and NOTHING for links/buttons. | LOW | Global `:focus-visible` outline (2px, ≥ 3:1 contrast vs. both dark and light section backgrounds — e.g. `#9A85FF` outline + offset). Strengthen the input focus ring to meet non-text contrast. |
| T24 | **Skip link** ("Pular para o conteúdo") | WCAG 2.4.1; lets keyboard users bypass the nav. | LOW | First focusable element; visually hidden until focused; targets `<main id="conteudo">`. |
| T25 | **Semantic landmarks + heading order** | Screen-reader navigation; the mockup uses `<div>` for the header and `<br>` inside the hero `<h1>`. | LOW | `<header><nav>`, `<main>`, `<footer>`; one `<h1>`; `<h2>` per section; `<h3>` for cards. Replace `<br>` in `<h1>` with CSS line control or keep but ensure it reads naturally. |
| T26 | **Alt text / decorative marking for images** | WCAG 1.1.1. Founder portrait needs a real description; the hero 3D render is decorative. | LOW | Founder: `alt="Felipe Salles, fundador da Dmarques"`. Hero render + particle canvas + glow: `alt=""` / `aria-hidden="true"`. Use `astro:assets` for sizing (prevents CLS). |
| T27 | **Color contrast ≥ WCAG AA** | Constraint in PROJECT.md. Several design tokens fail: `rgba(255,255,255,.42/.45/.5)` eyebrow/label text on `#0A0A12`, `#767C8E` form hints on `#F7F8FA`, `#8A8FA3` on `#F2F3F6`. | LOW–MEDIUM | Raise the lowest-opacity *text* to ≥ 4.5:1 (≈ `rgba(255,255,255,.66)` min on the dark bg for body-size; large/bold can go to 3:1). Decorative giant "DMARQUES" watermark at `.045` is fine (not text content). |
| T28 | **`prefers-reduced-motion` honored by every animation** | Constraint in PROJECT.md + WCAG 2.3.3. See the Motion ↔ Accessibility table. | MEDIUM | Single `@media (prefers-reduced-motion: reduce)` block + a JS guard for canvas/glow. |
| T29 | **No-JS / JS-failure fallback for revealed content** | The mockup sets `opacity:0` inline — if the reveal JS never runs, the whole page is invisible. Catastrophic for SEO crawl perception and resilience. | LOW | Reveal-from-hidden only inside `@media (prefers-reduced-motion: no-preference)` AND gated by a `js`/`.js-ready` class on `<html>`. Default (no JS) = fully visible. |
| T30 | **404 page** | Mistyped/old links; a raw host 404 looks broken. | LOW | Branded `src/pages/404.astro` with a link home. |
| T31 | **Cookieless analytics, disclosed in the policy** | PROJECT decision. Lets you skip a consent banner *and* stay LGPD-transparent. | LOW | Vercel Web Analytics or Plausible/Umami. No cookies, no cross-site ID. Must still be named in the Privacy Policy. |
| T32 | **Security headers + CSP** | Explicit client requirement. | MEDIUM | HSTS, `X-Content-Type-Options:nosniff`, `Referrer-Policy:strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera/mic/geo), restrictive `Content-Security-Policy` (self + Google Fonts hosts, or self-host fonts to tighten further), `frame-ancestors 'none'`. Set via `vercel.json` / middleware. |

---

### Differentiators (Competitive Advantage — most BR agency/freelancer sites skip these)

Aligned with the Core Value: *"entende em segundos, confia, pede orçamento — carrega rápido e nunca sai do ar."*

| # | Feature | Value Proposition | Complexity | Notes |
|---|---------|-------------------|------------|-------|
| D1 | **The site as its own proof of work** | New agency, no portfolio → the site itself demonstrates speed, polish, accessibility. Say it out loud: a small line near the footer / About — "Este site: Lighthouse 100, sem cookies, acessível." | LOW | Cheap credibility. Back it with a real Lighthouse/PageSpeed link. Only claim what you actually hit. |
| D2 | **Pre-filled WhatsApp message per entry point** | Removes the "what do I even say" friction; gives the founder context before replying. | LOW | `?text=` varies by button: hero = generic; a service card = "…orçamento para {Sistema web sob medida}". URL-encode. |
| D3 | **Scroll-spy: active section highlighted in nav** | Orientation on a long one-pager; feels considered. | LOW | `IntersectionObserver` toggling `aria-current="true"` + a style. Pure enhancement; degrades to plain anchors. |
| D4 | **Portfolio / cases with problem → solution → outcome structure** | Even 1–2 real (or personal/demo) projects told as a story beat a wall of logos. Objection-killer for "can they actually do it?". | MEDIUM | Start with: 1 real client OR the founder's own tools/automations OR a public demo build. Label honestly ("projeto próprio", "demo"). Content in a Content Collection so cases are added without redeplo又 code changes. |
| D5 | **Real testimonials (as they arrive)** | The design's quote card is the founder's — swap/append a genuine client quote after the first delivery. | LOW | Structure now (component + collection), populate later. Never fabricate — LGPD image/voice rules + trust risk. |
| D6 | **Domain e-mail** (`felipe@dmarques.com.br` or similar) everywhere instead of `@hotmail.com` | Documented credibility signal; a hotmail address on a dev agency site actively undermines the "we do professional web" pitch. | LOW | Needs the domain + an e-mail forwarding/mailbox. Update design copy, `mailto:`, JSON-LD, privacy policy, Resend "reply-to". |
| D7 | **CNPJ / MEI + razão social in the footer** | Brazil-specific trust marker; signals a real, findable, taxable entity. | LOW | One line in the footer. Also strengthens the JSON-LD / policy "controlador" identification. |
| D8 | **Google Business Profile, linked + NAP-consistent** | The dominant local-SEO surface; the JSON-LD (T17) should mirror it exactly. | LOW (site side) | Profile creation is off-site work; the site just needs matching NAP + a link. Enables reviews later. |
| D9 | **Transparent pricing model in copy** | The FAQ already explains staged payment ("nada cobrado antes de aprovar"). Making pricing *approach* explicit (not numbers) is rare and disarming. | LOW | Already partly in design — keep and reinforce. |
| D10 | **Self-hosted fonts (Outfit + DM Sans)** | Faster (no 3rd-party connection/handshake), tighter CSP, and avoids handing every visitor's IP to Google Fonts — a minor but real privacy/LGPD plus. | LOW | `@fontsource` or local `woff2` + `font-display:swap` + `preload` the 2 critical weights. Removes two `preconnect`s from the design. |
| D11 | **Accessibility to AA as a stated value** | Most competitor agency sites fail basic contrast/focus/reduced-motion. Meeting it *and* being a web agency is a marketing asset ("fazemos acessível porque sabemos fazer"). | MEDIUM | This is mostly the T22–T29 work, reframed as a selling point on the site. |
| D12 | **Prefers-reduced-motion as a first-class path, not a kill-switch** | Instead of "motion off", give reduced-motion users instant, clean fades/opacity so the page still feels finished. | LOW | Design decision in the CSS. |
| D13 | **"Reply is from the person who builds it"** stated at the form + CTA | Directly answers the top anxiety about agencies (handoff to juniors/sales). Copy already hints at it in the final CTA. | LOW | Copy-only. High leverage for a solo shop. |
| D14 | **Structured data richness** (Organization/Person/BreadcrumbList + FAQ + LocalBusiness) | Better AI-answer and rich-result eligibility than the ~0 structured data most small agency sites ship. | LOW–MEDIUM | Keep it accurate and minimal; over-marking invites manual actions. |

---

### Anti-Features (Commonly Requested / Tempting, Deliberately NOT Built)

| # | Feature | Surface Appeal | Why Problematic Here | Instead |
|---|---------|----------------|----------------------|---------|
| X1 | **Autoplay / background video** | "Cinematic hero" | Kills Lighthouse (LCP, TBT), burns mobile data, distracts from the CTA, needs `prefers-reduced-motion` handling anyway. The particle canvas already provides motion. | Keep the static hero render + lightweight canvas. If video ever needed: click-to-play poster, muted, `preload="none"`. |
| X2 | **Image carousel / slider** for services or cases | "Show more in less space" | Notoriously low engagement past slide 1, CLS risk, poor keyboard/SR support, extra JS. | The design's responsive card grid. Cases = a vertical list of stories (D4). |
| X3 | **Live-chat widget** (Intercom / Drift / Tawk / crisp) | "Instant answers, looks active" | 3rd-party JS bloat + a CSP hole + a new personal-data processor (LGPD) + it implies staffed real-time support a solo founder can't provide. WhatsApp already is the live channel. | The existing WhatsApp deep-link with pre-filled text (D2) + the "same business day" promise. |
| X4 | **Newsletter modal / exit-intent popup** | "Capture the ones who don't convert" | There is no newsletter. Interrupts reading, tanks bounce/engagement metrics, annoys, adds consent/LGPD surface. | A single clear form + the sticky-ish CTA. Add an email list only if content marketing (v2) ever ships. |
| X5 | **Cookie-consent banner / cookie wall** | "Everyone has one; looks compliant" | The site sets no non-essential cookies (cookieless analytics, no ad tech). A banner for nothing adds friction, JS, and *implies* tracking that isn't happening. LGPD/ePrivacy don't require a banner when no device storage is accessed. | Disclose analytics + the form data flow in the Privacy Policy (T11). No banner. |
| X6 | **Google reCAPTCHA (v2/v3)** | "Standard bot protection" | Conversion drag, accessibility friction, sends user data to Google (LGPD international-transfer + third-party concern), heavy script. | v1: honeypot + timing + rate limit + server validation (T6/T7). M2: Cloudflare Turnstile (already planned) — privacy-friendlier, near-invisible. |
| X7 | **Preloader / intro animation / splash** | "Premium feel" | Adds artificial delay to a site whose entire pitch is speed. Directly contradicts Core Value. | Ship fast HTML; let the reveal-on-scroll (with instant no-JS fallback) be the only entrance motion. |
| X8 | **Custom cursor that hides the native pointer** | "Designery" | Usability + accessibility harm, breaks on touch, fights the OS. (The design's cursor *glow* is fine — it's additive, `pointer-events:none`, and the real cursor stays.) | Keep the additive glow only; gate it to fine-pointer + no-reduced-motion. |
| X9 | **Parallax / scroll-jacking / scroll-hijack sections** | "Storytelling scroll" | Motion sickness (2.3.3), unpredictable scrollbar, janky on mobile, breaks anchor nav and "find on page". | Normal scroll + the subtle `translateY` reveal already designed. |
| X10 | **Fake urgency / countdowns / "3 vagas restantes" / "X pessoas vendo agora"** | "Boost conversions" | Dishonest, erodes the exact trust a new agency must build, and savvy B2B buyers see through it. | Real scarcity if any ("agenda de setembro"), otherwise the honest "início rápido" line already in the design. |
| X11 | **Stock-photo "our team" / fake office shots** | "Look bigger" | Contradicts the solo-founder positioning that the design leans into; reverse-image search embarrasses. | The real founder portrait + first-person copy (already designed). |
| X12 | **CMS / admin panel** | "Edit content later" | Out of scope per PROJECT.md; whole new attack surface; Markdown/Content Collections cover it. | Content Collections + git. |
| X13 | **Multi-step wizard form** for the quote | "Higher completion on long forms" | Overkill for 3–4 fields; adds JS state, more failure modes, worse for keyboard/SR. | Single short form (see form spec). Multi-step only pays off past ~8 fields. |
| X14 | **Storing leads in a database (v1)** | "CRM-ready" | Out of scope; adds a data store to secure and an LGPD retention obligation. | Resend e-mail only in v1 (PROJECT decision). Add storage in v1.x only if volume demands. |
| X15 | **Client login / portal** | "Professional" | No logged-in product exists; auth = major attack surface. Out of scope. | E-mail + WhatsApp updates during projects. |
| X16 | **AI chatbot** | "Modern, answers 24/7" | Hallucination risk on pricing/scope, 3rd-party JS + data processor, maintenance. | The FAQ section (already covers the top 4 questions) + WhatsApp. |
| X17 | **i18n / English version** | "Look international" | Explicitly out of scope; doubles content maintenance for a São Paulo-interior local business. | pt-BR only. |
| X18 | **Blog on launch** | "SEO" | Content cadence a solo founder rarely sustains; empty/stale blog hurts more than helps. Breaks the one-page constraint. | Defer to v2 when there's a real publishing commitment. |

---

## Feature Dependencies

```
PRIVACY POLICY PAGE (T11)
    └──blocks──> QUOTE FORM GO-LIVE (T1)        [LGPD: no data collection before a published policy]

QUOTE FORM (T1)
    ├──requires──> SERVER VALIDATION (T2)
    ├──requires──> SPAM: honeypot + timing (T6)
    ├──requires──> RATE LIMITING (T7)
    ├──requires──> FORM STATES idle/submit/success/error (T5)
    │                   └──requires──> ACCESSIBLE STATUS/ERROR MESSAGING (T4)
    ├──requires──> LGPD NOTICE + POLICY LINK (T12 → T11)
    ├──requires──> Resend API key (server env var, not in client bundle)
    └──enhanced-by──> WhatsApp fallback shown in the error state (T8)

M2: CLOUDFLARE TURNSTILE ──replaces/augments──> honeypot+timing (T6)   [planned milestone 2]
    └──requires──> Cloudflare in front of the site (M2)

prefers-reduced-motion MEDIA QUERY + JS GUARD (T28)
    └──gates──> scroll reveal (T29), cursor glow, particle canvas, dmFloat/dmPulse, smooth-scroll (A7)

JS-READY CLASS ON <html> (T29)
    └──gates──> reveal-from-opacity:0     [no JS / JS error ⇒ content stays visible]

SEMANTIC LANDMARKS + <main id> (T25)
    └──required-by──> SKIP LINK (T24)

FOCUS-VISIBLE STYLES (T23) + KEYBOARD OPERABILITY (T22)
    └──required-by──> the "acessível" claim (D11) and mobile menu (T21)

JSON-LD LocalBusiness/ProfessionalService (T17)
    ├──needs──> consistent NAP  ──shared-with──> Google Business Profile (D8), footer CNPJ block (D7)
    └──sibling──> FAQPage JSON-LD (T18) ──single-source──> visible FAQ content

OG/Twitter tags (T14) ──requires──> designed 1200×630 share image (static asset)

Self-hosted fonts (D10) ──simplifies──> CSP (T32)  [fewer external hosts to allow-list]

Scroll-spy active nav (D3) ──enhances──> anchor nav (T20); ──degrades-to──> plain anchors

Portfolio/cases collection (D4) ──shares infra──> testimonials component (D5), FAQ collection (T18)
```

### Dependency Notes

- **Privacy Policy blocks the form:** Under LGPD Art. 9 the data subject must have access to clear information about the processing. Ship the policy in the same release as the live form, not "later".
- **T28 gates all motion:** Build the reduced-motion path first, then layer motion on top — cheaper than retrofitting.
- **T29 (JS-ready gate) is non-negotiable:** The mockup's inline `opacity:0` will hide the entire page if the island script fails. Default state must be visible.
- **Turnstile depends on M2:** Don't wire Turnstile in v1 — it needs the Cloudflare layer. Honeypot+timing+rate-limit is the v1 answer and is genuinely adequate for this traffic level.
- **JSON-LD ↔ Google Business Profile ↔ footer identity** must all state the same name, phone, locality — inconsistent NAP actively hurts local ranking.

---

## LGPD Specifics (Form + Privacy Policy)

**Confidence: MEDIUM** — the mechanics are well established; the exact legal-basis wording and whether to use a consent checkbox should be confirmed against a current Brazilian data-protection reference. Sources below are practitioner guides, not the statute.

### Data to collect (minimization — LGPD Art. 6, III)

| Field | Collect? | Rationale |
|-------|----------|-----------|
| Nome | Yes, required | Needed to address the reply. |
| WhatsApp (tel) | Required *if* e-mail not given | Primary contact channel in BR. |
| E-mail | Optional (recommend adding the field) | Fallback contact; some B2B users prefer it. Require **at least one** of phone/e-mail. |
| Tipo de projeto (select) | Optional | Qualification; not personal data. Keep the 5 options from the design. |
| Mensagem / detalhes (textarea) | Optional, recommend adding | Lets the lead self-qualify; reduces back-and-forth. Cap length. |
| Anything else (company, budget, address, CPF/CNPJ) | **No** | Not needed to start a conversation. Ask later, off-site. |
| Honeypot field | Yes (hidden) | Not stored, not personal data — discard on receipt. |
| Derived/technical (IP, user-agent, timestamp) | Only transiently, for rate-limit + timing check | Do not log/store beyond the request. Disclose in the policy that they're processed for security. |

### Legal basis (LGPD Art. 7)

- **Primary:** Art. 7, V — *procedimentos preliminares relacionados a contrato* (pre-contractual steps taken at the data subject's request). The user is asking for a quote → this fits cleanly and avoids a consent checkbox.
- **Secondary/supporting:** Art. 7, IX — *legítimo interesse* for replying and for basic anti-spam security processing.
- **Consent (Art. 7, I)** is the fallback if you prefer it, but then the checkbox must be **unchecked by default** and separate from other actions.
- **Recommendation:** rely on pre-contractual measures + legitimate interest; show a **notice + policy link** (T12), **no checkbox** (less friction, still compliant). Document this basis choice in the repo and in the policy. Revisit if a lawyer advises otherwise.

### Where submissions go / data flow to disclose

1. Browser → Astro API route on **Vercel** (serverless function, region likely US East) → **Resend** API → founder's mailbox.
2. **Resend acts as operator/suboperador** (LGPD Art. 39) — name it in the policy.
3. **International transfer** (Art. 33): Vercel + Resend process data outside Brazil. Disclose it; basis = necessary for the pre-contractual procedure / legitimate interest. (M2 note: Cloudflare adds another processor — update the policy then.)
4. **No database in v1** — data lives only as e-mail in the founder's inbox. State a retention practice (e.g. "mensagens de contato são mantidas enquanto durar a negociação e por até 12 meses depois, salvo obrigação legal" — pick a real number and honor it).

### Privacy Policy page — required content (pt-BR)

- **Identificação do controlador:** Dmarques Soluções Web / Felipe Salles, CNPJ/MEI (D7), cidade/UF, e-mail de contato.
- **Encarregado (DPO):** for an operation this size the controller can act as encarregado — give a contact e-mail for privacy requests.
- **Quais dados são coletados:** nome, telefone e/ou e-mail, tipo de projeto, mensagem (formulário); dados técnicos transitórios (IP, user-agent, horário) para segurança; métricas agregadas e anônimas de acesso (analytics sem cookies — name the tool).
- **Finalidades:** responder à solicitação de orçamento/contato; conduzir procedimentos pré-contratuais; segurança e prevenção a spam/fraude; medição agregada de audiência.
- **Bases legais:** Art. 7, V (procedimentos preliminares); Art. 7, IX (legítimo interesse) — mapped to each finalidade.
- **Compartilhamento e operadores:** Vercel (hospedagem/função), Resend (envio de e-mail), [analytics tool]. Link to their policies if practical.
- **Transferência internacional:** sim, EUA; base e salvaguardas.
- **Retenção:** prazo real para as mensagens; analytics = agregado, sem retenção de dado pessoal.
- **Direitos do titular (Art. 18):** confirmação, acesso, correção, anonimização/eliminação, portabilidade, informação sobre compartilhamento, revogação — e **como exercê-los** (o e-mail).
- **Cookies:** declarar que o site **não usa cookies** de rastreamento; apenas o essencial, se houver.
- **Decisões automatizadas:** não há.
- **Reclamação à ANPD.**
- **Data da última atualização** + como mudanças serão comunicadas.

### Form-side LGPD implementation checklist

- [ ] Visible notice + link to `/politica-de-privacidade` adjacent to submit (T12).
- [ ] Honeypot value discarded, never emailed/stored.
- [ ] IP/user-agent used only in-request for rate-limit + timing; not persisted.
- [ ] Resend "reply-to" = the founder's (domain) e-mail; e-mail body contains only the fields the user submitted.
- [ ] No third-party analytics/marketing script fires on the form.
- [ ] Success message tells the user what happens next and the response-time promise.
- [ ] Decide + document: checkbox vs. notice-only (recommendation: notice-only).

---

## Motion ↔ Accessibility Pairing (every effect + its counterpart)

PROJECT.md requires `prefers-reduced-motion` respected and animations only on `transform`/`opacity`. Each design effect below gets an explicit accessibility counterpart. **All are gated by `@media (prefers-reduced-motion: reduce)` and, where JS-driven, an in-JS `matchMedia('(prefers-reduced-motion: reduce)')` check.**

| # | Design motion effect | Purpose | Accessibility / resilience counterpart |
|---|----------------------|---------|-----------------------------------------|
| A1 | **Scroll reveal** — `opacity 0→1` + `translateY(20px)→0`, staggered per card (`IntersectionObserver`, `rootMargin: 0 0 -8% 0`) | Draw the eye down the page | Reduced-motion: elements start visible, no transform, optional 0.01s opacity only. **No-JS / JS-error: fully visible by default** (T29 — reveal-from-hidden only when `.js-ready` AND `no-preference`). Keep the existing 2600 ms JS timeout fallback. Never `display:none` the content. |
| A2 | **Cursor-follow glow** — fixed radial gradient tracking `pointermove` via rAF | Ambient "alive" feel | `pointer-events:none` (already). Gate to `@media (pointer:fine) and (prefers-reduced-motion:no-preference)` — hidden on touch and for reduced-motion. `aria-hidden`, not focusable, never conveys information. Must not affect layout or scroll. |
| A3 | **Particle `<canvas>`** — animated dots + link lines, dpr≤2, count ∝ area | Hero visual texture | `aria-hidden="true"`, `alt` n/a (decorative). **Pause via `IntersectionObserver` when offscreen** (PROJECT requirement) and on `document.hidden`. Reduced-motion: render one static frame or skip entirely (show the gradient behind it). `particles:false` prop already exists — wire it to the media query. No pointer/keyboard interaction. |
| A4 | **`dmFloat`** — infinite 9s `translateY` bob on the hero frame | Subtle depth | Reduced-motion: `animation:none` (element rests at translateY(0)). Purely decorative container. |
| A5 | **`dmPulse`** — infinite 7s opacity pulse on the CTA glow | Emphasis on final CTA | Reduced-motion: `animation:none`, fixed mid opacity. The CTA button itself must be legible without the pulse. |
| A6 | **Hover states** — card border/`box-shadow`, button bg, link underline color | Affordance / feedback | Add matching **`:focus-visible`** styles for every hover (T23) — keyboard users must get the same signal. Hover must never be the *only* way to reveal content or actions. Transitions on `transform`/`opacity`/`box-shadow`/`border-color` only; keep ≤ 300 ms. Reduced-motion: keep the end state, drop the transition. |
| A7 | **`scroll-behavior:smooth`** (root) + anchor nav | Pleasant section jumps | `@media (prefers-reduced-motion: reduce){ html{ scroll-behavior:auto } }`. Pair with `scroll-margin-top` (T20) so the target heading isn't hidden by the header (WCAG 2.4.11). Focus should move to the targeted section for SR/keyboard users. |
| A8 | **Nav CTA / button transitions** (`.2s`–`.25s` bg + shadow) | Polish | Same as A6: honor reduced-motion by removing the transition, keep the hover/focus end state. |
| — | **Cross-cutting** | | Skip link (T24) is the first focusable node. `:focus-visible` outline contrasts on BOTH `#0A0A12` and `#F2F3F6` sections. Respect `forced-colors`/Windows High Contrast (don't rely on `box-shadow`-only focus). No effect may trap focus or intercept scroll. |

---

## MVP Definition

### Launch With (v1) — matches PROJECT.md "Active"

- [ ] **9 sections, static Astro** (Hero 03 Bleed faithfully reproduced) — the product
- [ ] **Content in Content Collections / Markdown** — serviços, processo, diferenciais, FAQ, cases (single source of truth; feeds visible UI + JSON-LD)
- [ ] **Quote form** (T1–T7, T12): Nome, telefone/e-mail (≥1 required), tipo de projeto, mensagem (optional); client + server validation; honeypot + timing; rate limit; idle/submitting/success/error states; accessible errors; LGPD notice + policy link; Resend delivery
- [ ] **Privacy Policy page** (T11) in pt-BR — ships with the form
- [ ] **WhatsApp deep-links** with per-entry `?text=` pre-fill (T8, D2)
- [ ] **Response-time promise** visible at CTAs + in the success message (T10)
- [ ] **SEO baseline**: title/description/canonical, OG + Twitter + share image, `lang="pt-BR"`, sitemap, robots, favicon set, `theme-color` (T13–T16, T19)
- [ ] **Structured data**: `LocalBusiness`+`ProfessionalService` array + `FAQPage` (+ `Person` for founder) (T17, T18)
- [ ] **Anchor nav** with `scroll-margin-top` + mobile nav solution (T20, T21)
- [ ] **Accessibility baseline**: skip link, semantic landmarks, one `<h1>`, `:focus-visible` everywhere, keyboard operability, alt text, AA contrast fixes, `prefers-reduced-motion` for all motion, no-JS visible fallback (T22–T29)
- [ ] **Motion**: scroll reveal, cursor glow, particle canvas (offscreen pause), float/pulse, hover+focus states — all with the A1–A8 counterparts
- [ ] **Cookieless analytics**, disclosed in the policy (T31)
- [ ] **Security headers + CSP** (T32)
- [ ] **Portfolio/cases section** — 1–2 real or honestly-labeled entries, story-structured (D4)
- [ ] **404 page** (T30)

### Add After Validation (v1.x)

- [ ] **Cloudflare + Turnstile on the form** — trigger: spam gets through honeypot+timing, OR M2 begins (already planned)
- [ ] **Real client testimonials** — trigger: first delivered project (structure now, populate then) (D5)
- [ ] **Domain e-mail everywhere** — trigger: domain + mailbox set up (do this early — cheap, high trust) (D6)
- [ ] **CNPJ/MEI in footer + Google Business Profile** — trigger: entity formalized / profile approved (D7, D8)
- [ ] **More case studies** — trigger: each completed project
- [ ] **"Site as proof" performance callout with live PageSpeed link** — trigger: Lighthouse ≥ 95 confirmed in prod (D1)
- [ ] **Lead storage / lightweight CRM** — trigger: form volume high enough that inbox management breaks down (revisit LGPD retention) (relaxes X14)
- [ ] **WhatsApp / CTA click tracking** as analytics events — trigger: need to compare the two conversion paths

### Future Consideration (v2+)

- [ ] **Blog / content marketing** — defer until there's a real publishing commitment (X18)
- [ ] **Online scheduling for the "Diagnóstico" call** (Cal.com-style, self-hosted or embedded) — defer until inbound volume justifies it
- [ ] **Case-study detail pages** — defer; breaks the one-page model, only worth it with several deep cases
- [ ] **Client portal / project status pages** — defer; currently out of scope (X15)
- [ ] **English version** — explicitly out of scope (X17)

---

## Feature Prioritization Matrix

| Feature | User / Business Value | Implementation Cost | Priority |
|---------|----------------------|---------------------|----------|
| Working quote form → inbox (T1) | HIGH | MEDIUM | P1 |
| Server-side validation (T2) | HIGH (integrity/security) | LOW | P1 |
| Accessible error/status messaging (T4) | MEDIUM | MEDIUM | P1 |
| Form states idle/submit/success/error (T5) | HIGH | LOW–MEDIUM | P1 |
| Honeypot + timing spam guard (T6) | HIGH (inbox survival) | LOW | P1 |
| Rate limiting (T7) | MEDIUM–HIGH (abuse/availability) | LOW–MEDIUM | P1 |
| Privacy Policy page (T11) | HIGH (legal) | MEDIUM | P1 |
| LGPD notice on form (T12) | HIGH (legal) | LOW | P1 |
| WhatsApp deep-link + pre-fill (T8/D2) | HIGH (BR channel) | LOW | P1 |
| Title/meta/canonical/OG + share image (T13–T14) | HIGH (referral rendering) | LOW–MEDIUM | P1 |
| lang, sitemap, robots, favicon (T15–T16, T19) | MEDIUM | LOW | P1 |
| LocalBusiness/ProfessionalService + FAQ JSON-LD (T17–T18) | HIGH (local + AI discovery) | LOW–MEDIUM | P1 |
| Skip link + landmarks + heading order (T24–T25) | MEDIUM | LOW | P1 |
| `:focus-visible` everywhere (T23) | MEDIUM | LOW | P1 |
| AA contrast fixes (T27) | MEDIUM | LOW–MEDIUM | P1 |
| `prefers-reduced-motion` for all motion (T28) | MEDIUM | MEDIUM | P1 |
| No-JS visible fallback for reveal (T29) | HIGH (resilience/SEO) | LOW | P1 |
| Anchor offset + mobile nav (T20–T21) | MEDIUM–HIGH | LOW–MEDIUM | P1 |
| Security headers + CSP (T32) | HIGH (client requirement) | MEDIUM | P1 |
| Cookieless analytics (T31) | MEDIUM | LOW | P1 |
| Portfolio/cases (1–2) (D4) | HIGH (trust, new agency) | MEDIUM | P1–P2 |
| 404 page (T30) | LOW | LOW | P2 |
| Scroll-spy active nav (D3) | MEDIUM | LOW | P2 |
| Domain e-mail (D6) | MEDIUM–HIGH (trust) | LOW | P2 (do early) |
| Self-hosted fonts (D10) | MEDIUM (perf + privacy + CSP) | LOW | P2 |
| CNPJ/MEI footer + GBP (D7–D8) | HIGH (local trust/SEO) | LOW (site side) | P2 |
| "Site as proof" perf callout (D1) | MEDIUM | LOW | P2 |
| Real testimonials (D5) | HIGH | LOW (infra now) | P2 (content later) |
| Turnstile on form | MEDIUM | LOW–MEDIUM | P2 (M2) |
| Lead storage / CRM | LOW (until volume) | MEDIUM | P3 |
| Blog | MEDIUM (long-term SEO) | HIGH (ongoing) | P3 |
| Scheduling widget | MEDIUM | MEDIUM | P3 |

**Priority key:** P1 = must ship in v1 · P2 = soon after / low-cost add · P3 = defer to v2+

---

## Competitor / Reference Feature Analysis

No specific local competitors were catalogued; the columns below are *archetypes* commonly seen in this segment (confidence: MEDIUM for the archetype descriptions, HIGH for "our approach" which follows from the sourced best practices).

| Feature | Typical BR small-agency site | DIY freelancer site (Wix/Squarespace/template) | Dmarques approach |
|---------|-----------------------------|----------------------------------------------|-------------------|
| First contact | Contact form + WhatsApp floating button (often a heavy 3rd-party widget) | Contact form only, sometimes just a `mailto:` | Short form + WhatsApp deep-link with pre-filled context; no floating widget |
| Form length | 5–8 fields (nome, e-mail, telefone, empresa, assunto, mensagem, orçamento) | 3–4 fields | 3–4 visible fields; ≥1 of phone/e-mail; message optional |
| Spam protection | Google reCAPTCHA badge | None (inbox fills up) | Honeypot + timing + rate limit; Turnstile in M2 |
| Social proof | Client logo wall (often placeholder/borrowed) | None | Story-structured cases (1–2, honestly labeled) + founder story + method; real testimonials appended as earned |
| LGPD | Cookie banner (often for cookies they don't need) + thin/boilerplate policy | Nothing, or platform-generic policy | No banner (cookieless) + a real, specific pt-BR policy tied to the actual data flow |
| Structured data | Rarely any | None | LocalBusiness + ProfessionalService + FAQPage + Person |
| Performance | jQuery + slider libs + chat widget + web fonts from CDN; Lighthouse 40–70 | Platform bloat; Lighthouse 30–60 | Astro SSG, self-hosted fonts, one small canvas; target Lighthouse ≥ 95 all categories |
| Motion | Autoplay video hero, parallax, carousels | Template defaults | Subtle reveal + ambient canvas/glow, every effect with a reduced-motion + no-JS counterpart |
| Accessibility | Fails contrast/focus/reduced-motion | Fails | AA contrast, visible focus, keyboard, skip link, reduced-motion — and says so as a selling point |
| Local SEO | Address in footer text only | Often no address | Consistent NAP across footer + JSON-LD + Google Business Profile |

---

## Sources

Best practices / conversion:
- [Landingi — Landing Page Best Practices That Convert (2026)](https://landingi.com/landing-page/41-best-practices/)
- [Branded Agency — High-Converting Landing Pages 2025–2026](https://www.brandedagency.com/blog/high-converting-landing-pages)
- [WPForms — Landing Page Best Practices Proven to Convert](https://wpforms.com/best-landing-page-best-practices-that-convert/)
- [LandingPageFlow — The Perfect Contact Form Landing Page](https://www.landingpageflow.com/post/perfect-contact-form-landing-page)

Trust for new freelancers / agencies:
- [Bidsketch — How to Build Credibility As a Freelancer](https://www.bidsketch.com/blog/everything-else/build-credibility/)
- [Viktor Shmatko — Why Most Freelance Websites Fail to Build Trust](https://viktorshmatko.com/blog/why-most-freelance-websites-fail-to-build-trust)
- [listallexperts — The Freelancer Website Checklist](https://listallexperts.com/en/guides/freelancer-website-checklist)
- [completegreet — The Complete Guide to Building Trust on Your Website](https://completegreet.com/blog/the-complete-guide-to-building-trust-on-your-website/)

Spam protection:
- [Splitforms — Stop Contact Form Spam (5 methods compared)](https://splitforms.com/blog/stop-contact-form-spam)
- [Splitforms — Contact Form Without CAPTCHA That Still Stops Spam](https://splitforms.com/blog/contact-form-without-captcha)
- [Formester — How to Prevent Form Spam: 8 Techniques](https://formester.com/blog/how-to-protect-user-data-and-prevent-spam-in-web-forms/)
- [FORMLOVA — Honeypot vs CAPTCHA (reCAPTCHA, Turnstile, hCaptcha)](https://formlova.com/en/blog/contact-form-captcha-comparison-en)
- [3ZeroDigital — Honeypot vs reCAPTCHA vs Cloudflare Turnstile (2025)](https://www.3zerodigital.com/blog/how-to-protect-your-forms-from-spam-bots-honeypot-vs-google-recaptcha-vs-cloudflare-turnstile-2025-comparison/)

Accessible forms / motion:
- [W3C WAI — Forms Tutorial: User Notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [UXPin — Accessible Form Validation: Best Practices](https://www.uxpin.com/studio/blog/accessible-form-validation-best-practices/)
- [Reform — Accessible Form Error Messaging: Best Practices](https://www.reform.app/blog/accessible-form-error-messaging-best-practices)
- [TheWCAG — Accessible Forms Example (WCAG 2.2)](https://www.thewcag.com/examples/forms)

SEO / structured data:
- [Schema App — How-to Guide for LocalBusiness Schema Markup](https://www.schemaapp.com/schema-markup/how-to-do-schema-markup-for-local-business/)
- [dev.to — Schema Markup JSON-LD for Local Businesses: Practical Guide](https://dev.to/sabrielagency/schema-markup-json-ld-for-local-businesses-a-practical-implementation-guide-2n25)
- [Unhead — LocalBusiness Schema JSON-LD Guide & Examples](https://unhead.unjs.io/docs/schema-org/api/schema/local-business)

Cookieless analytics / cookie banner:
- [cookiebeam — Do Plausible & Fathom Need Cookie Consent? (2026)](https://cookiebeam.com/guides/plausible-fathom-cookieless-analytics-consent-2026)
- [analytics-alternatives — When You Don't Need a Cookie Banner: 5 Cases (2026)](https://analytics-alternatives.com/when-you-dont-need-cookie-banner-5-cases/)
- [opensource-analytics — Legitimate Interest Analytics: Lawful Basis Explained](https://opensource-analytics.com/legitimate-interest-vs-consent-analytics/)

LGPD (practitioner guides — verify final policy wording against a primary source):
- [Serpro — Como elaborar uma política de privacidade aderente à LGPD](https://www.serpro.gov.br/lgpd/noticias/2019/elabora-politica-privacidade-aderente-lgpd-dados-pessoais)
- [FullSaaS — LGPD no formulário de contato: quais cuidados sua empresa precisa ter](https://fullsaas.com.br/post/lgpd-no-formulario-de-contato-quais-cuidados-sua-empresa-precisa-ter)
- [Cayman — Como adaptar o meu site à LGPD (guia completo)](https://www.cayman.com.br/postagem/1/como-adaptar-o-meu-site-a-lei-geral-de-protecao-de-dados)

Internal:
- `.planning/PROJECT.md`
- `arquivos de design/Dmarques Landing.dc.html` (locked design + prototyped motion)

---
*Feature research for: solo web-agency one-page marketing/lead-capture site (Astro SSG, pt-BR, LGPD)*
*Researched: 2026-09-05*
