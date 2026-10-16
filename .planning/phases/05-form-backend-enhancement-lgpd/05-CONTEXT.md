# Phase 5: Form Backend + Enhancement + LGPD - Context

**Gathered:** 2026-09-24
**Status:** Ready for planning

<domain>
## Phase Boundary

The quote form, whose markup already exists in `src/components/ContactSection.astro`
with all 5 fields since Phase 3, now works end to end and delivers to the
founder's inbox. It must work without JavaScript (native POST, 303 to
`/obrigado`) and with JavaScript (fetch enhancer with inline states). Delivery
runs through Resend, behind layered abuse defenses: Zod, honeypot, submit
timing, durable rate limits, body-size cap, Origin allow-list, and a Vercel WAF
rule. The full Privacy Policy page, the inline data-use notice, and the
per-entry WhatsApp deep-links ship in the same release. Requirements: FORM-01..13,
LGPD-01..07, SEC-08, SEC-09. SEO metadata (Phase 6) and CSP/headers (Phase 7)
are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Email delivery & domain
- **D-01:** Domain mailbox `contato@agenciadmarques.com.br` was created at
  GoDaddy, which is also the domain registrar and DNS host. The GoDaddy plan
  allows only one mailbox.
- **D-02:** Resend `from` = `contato@agenciadmarques.com.br` and `to` =
  `contato@agenciadmarques.com.br`. Both are hard-coded server-side, or come
  from server-only env vars; the client never chooses them. Display name
  suggestion: "Site Dmarques".
- **D-03:** `reply-to` = the lead's e-mail, only when the lead provided one that
  passes Zod validation, with CR/LF stripped. When the lead gave only WhatsApp,
  the email body carries a ready-to-click `wa.me` link built from the normalized
  number.
- **D-04:** Create a **new, separate Resend account** for Dmarques. The founder
  already uses Resend on another project, and the free tier allows 1 verified
  domain. A separate account isolates keys, quota, and sender reputation. Use a
  send-only, domain-restricted API key and store it in `RESEND_API_KEY`, which is
  already declared in the `astro:env` secret schema.
- **D-05:** DNS records for Resend (DKIM `resend._domainkey`, the `send.`
  subdomain MX/SPF for the return-path, and DMARC `p=none`, moving to
  `quarantine` later) are added in the GoDaddy DNS panel **without altering the
  existing GoDaddy mailbox MX/SPF records**. This is a guided manual checkpoint
  for Felipe. Mail-tester ≥ 8 is required before go-live (SEC-09).
- **D-06:** Subject line includes the sanitized lead name and the project-type
  label, e.g. `Novo orçamento: João — Site institucional`. The name is CR/LF
  stripped and length-truncated; the label comes from the `PROJECT_TYPES` enum,
  never from raw input.
- **D-07:** **No auto-reply/confirmation email to the lead.** Only the
  on-page success panel and `/obrigado`. This prevents the form from being
  abused to send email to arbitrary addresses and halves Resend quota use.
- **D-08:** Email HTML is simple and clean: a field table with clickable
  `wa.me` and `mailto:` links, no remote images, no branded template. There is
  always an equivalent `text` body (FORM-09).
- **D-09:** Replace `felipe.salles1@hotmail.com` with
  `contato@agenciadmarques.com.br` **across the site in this phase**, in
  `ContactSection.astro` and `SiteFooter.astro`. This pulls TRUST-01 forward
  for the e-mail part. The Privacy Policy also uses `contato@`.

### Rate limiting & abuse limits
- **D-10:** Durable store = **Upstash Redis (free tier) provisioned via the
  Vercel Marketplace**, using `@upstash/ratelimit` and `@upstash/redis`. Keys use
  a hashed IP with a short TTL; raw IP is never stored or logged (LGPD-04).
  Upstash must be listed as an operator in the Privacy Policy.
- **D-11:** Limits: **3 submissions per IP per 10 min (sliding window)**,
  **20/hour global**, **50/day global hard cap**. The daily cap stays well below
  Resend free's 100/day. Values live in named constants so they can be tuned.
- **D-12:** When any limit trips, respond 429 with a friendly pt-BR message and
  a **WhatsApp button** as the alternative path, so the lead is not lost. With
  JS it appears inline in the form card. Without JS, show an error page with the
  same message and button.
- **D-13:** Vercel WAF rate-limit rule on `/api/*` is **looser than the
  app-level limit** (≈10 req/min/IP, then block/deny). It is flood-only; fine
  limiting stays in Upstash. It is configured manually in the Vercel dashboard
  and documented in the repo (FORM-11).

### Privacy Policy (LGPD)
- **D-14:** Controller = **Felipe Salles, pessoa física, trade name
  "Dmarques"**, Ibitinga/SP, no CPF published. Contact is `contato@`. Update to
  razão social + CNPJ when TRUST-02 lands.
- **D-15:** **Retention: 6 months** for quote-request emails from leads who did
  not become clients; after that they are deleted from the mailbox. Data of
  leads who become clients is governed by the contract. This is recorded as a
  Key Decision in `.planning/PROJECT.md` and reflected in the policy (LGPD-07).
  Legal bases are Art. 7º V + IX, locked by requirements.
- **D-16:** Encarregado: cite the small-processing-agent exemption
  (Resolução CD/ANPD nº 2/2022) with no formal DPO. The communication channel
  for data subjects is `contato@agenciadmarques.com.br`, with a stated response
  window of up to 15 days.
- **D-17:** Operators listed: Vercel (hosting + analytics), Resend (email
  delivery), Upstash (rate-limit counters, hashed IP, short TTL), GoDaddy
  (mailbox where requests are stored). International transfer (USA) is
  disclosed.
- **D-18:** Format is plain-language pt-BR with a one-sentence summary at the top,
  then short H2 sections with an index covering every LGPD-02 item, and a
  last-updated date. Legal review is Felipe's responsibility. The page replaces
  the Phase 3 shell at `src/pages/politica-de-privacidade.astro`.

### Form UX states
- **D-19:** With JS, on success **replace the form with a success panel**
  inside the same card: "✓ Pedido enviado. Respondemos no mesmo dia útil." plus
  a WhatsApp button. Focus moves to the panel and the `aria-live` region
  announces it. This prevents duplicate resubmission.
- **D-20:** WhatsApp field has **no live mask**. It accepts any format; on
  blur it formats to `(16) 99611-1785` when parseable. The server normalizes to
  digits (strips +55 / leading 0) and validates 10–11 BR digits.
- **D-21:** FORM-13: add a discreet **"Falar sobre isso no WhatsApp"** link to
  each service card, prefilled with e.g. "Olá! Vim pelo site e quero falar sobre
  {serviço}." Existing WhatsApp links (Contato, footer incl. floating button) get a
  generic prefilled text; the hero has none and gets none (see D-26). The form's error and rate-limit fallback link carries
  what the user typed (name + project type). All texts are URL-encoded with
  `rel="noopener"`.
- **D-22:** LGPD-03 notice is one short line next to the submit button:
  "Usamos seus dados só para responder a este pedido. Veja a Política de
  Privacidade." It links to `/politica-de-privacidade` and has no checkbox.

### Project-wide conventions carried forward
- **D-23:** Zero comments in any version-controlled file (Phase 1 D-04).
- **D-24:** No UI framework. The enhancer is a plain module `<script>`
  (CLAUDE.md), and it must fit the <20 KB landing JS budget alongside the
  Phase 4 effects bundle (currently ~2.6 KB).
- **D-25:** `PROJECT_TYPES` / `PROJECT_TYPE_VALUES` from
  `src/content/project-types.ts` is the single allow-list for the `<select>`
  and the server `z.enum` (Phase 2 D-05).

### Decisions recorded after plan check (Felipe, 2026-10-15)
- **D-26:** FORM-13 hero exception: **no WhatsApp CTA in the hero this
  phase**. FORM-13 entry points are Contato (`ContactSection.astro`), Footer
  (`SiteFooter.astro`, column link and floating button) and the service cards.
  The exception is recorded in REQUIREMENTS.md (FORM-13 note) and ROADMAP.md
  (Phase 5). Not asked again at the 05-14 checkpoint.
- **D-27:** Submit timing uses the **elapsed time measured on the client**
  (`elapsed-ms` = `performance.now()` at submit minus the mark taken at enhancer
  init), never a comparison between client and server clocks. Server rejects
  (silent fake success) when present and non-numeric, negative, under 3 s or
  over 24 h (ceiling widened from ~2 h so a tab left open does not lose a lead).
  Felipe **accepts the risk** that omitting `elapsed-ms` (the no-JS path, or a
  bot that drops the field) bypasses the timing check; honeypot, Origin check
  and the three rate-limit layers still apply. Recorded in the 05-14 SEC-07 run
  as an already-accepted risk, not asked again.

### Decision recorded after plan revision (Felipe, 2026-10-15)
- **D-28:** The quote form does **not** show WhatsApp and E-mail as two
  separate fields (the extra field makes the card taller and out of proportion
  with the sketch). Instead:
  - A channel selector "Prefiro contato por" with two pills **WhatsApp | E-mail**
    (WhatsApp checked by default) sits above a **single** visible contact field.
  - The visible field follows the chosen channel. WhatsApp: `type=tel`,
    `inputmode=tel`, `autocomplete=tel`, placeholder "(16) 99999-9999". E-mail:
    `type=email`, `inputmode=email`, `autocomplete=email`, placeholder
    "voce@empresa.com.br".
  - Works without JavaScript (FORM-02): real radio inputs `name="canal"`
    (`whatsapp`/`email`) styled like the `ProjectTypeChips` pills, plus two
    inputs in the DOM (`name="whatsapp"`, `name="email"`). CSS `:has()` shows
    only the one matching the checked radio. Without JS the hidden one is
    submitted (usually empty). With JS the enhancer also sets `disabled` on the
    hidden one (so it is neither validated nor submitted) and keeps focus/ARIA
    on the visible one. Neither contact input carries `required`.
  - The helper line "Preencha WhatsApp ou e-mail." and the cross-field
    "WhatsApp ou e-mail" error are removed (supersedes the Phase 3 rule).
  - Server (Zod): `canal` is a required enum (`whatsapp` | `email`). Only the
    chosen channel's field is required and validated; the other is discarded
    before validation and never used. `replyTo` only when canal = email; the
    `wa.me` link in the email body only when canal = whatsapp (refines D-03).
    Subject and body show the chosen channel (refines D-06).
  - Client validation mirrors the same rule; a missing/unknown `canal` is a
    server error, while the client resolves it to the default `whatsapp`.
  - Errors in pt-BR, accessible: `aria-invalid`/`aria-describedby` on the
    visible field; the selector is a `fieldset` with legend "Prefiro contato por".
  - Accepted no-JS degradations: (a) browsers without `:has()` show both fields
    (still submits, server uses only the chosen channel); (b) without JS, if
    the visitor types a malformed e-mail and then switches to WhatsApp, native
    validation of the hidden `type=email` field can block the submit (rare;
    with JS the hidden field is `disabled` and skipped).
  - LGPD minimization improves: the policy lists name + the chosen contact
    (WhatsApp OR e-mail) + type + message.
  - Card height must stay proportional to the sketch (one contact field, like
    the sketch): form card height at 1440px ≤ sketch + 40px.

### Decision recorded during live validation (Felipe, 2026-10-16)
- **D-29:** The `/politica-de-privacidade` page is **removed** (supersedes the
  Privacy Policy decisions above, D-18 included). Rationale: decisão do Felipe;
  transparência do art. 9º mantida via bloco no formulário. A native `<details>`
  "Como usamos seus dados" under the form's LGPD notice states controller,
  purpose, legal basis (art. 7º, V), retention, processors and rights. The
  footer link was removed too; the footer now ends with a divider and the
  centered copyright.

### Claude's Discretion
- Response to honeypot/timing rejections: silently return a fake success
  (200 / 303 to `/obrigado`) so bots get no signal. No email is sent.
- How the submit timestamp is carried: resolved by D-27 (client-measured
  elapsed time in `elapsed-ms`, no clock comparison).
- Exact pt-BR copy for validation errors, the generic server error, and the
  429 message, all in the site's friendly tone.
- The no-JS error path shape (dedicated `/erro-envio`-style page vs.
  re-rendered response), as long as it never redirects to a client-supplied URL.
- Code layout (e.g. `src/pages/api/orcamento.ts`, `src/lib/form-schema.ts`
  shared by client and server, `src/scripts/form.ts` enhancer), body-size cap
  value, and Origin allow-list implementation.
- Whether `from`/`to` are constants or server-only `astro:env` vars
  (`CONTACT_EMAIL`). Env vars are preferred so the address can change without a
  code edit.
- Whether the Privacy Policy content lives in a Markdown content entry or
  directly in the `.astro` page.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` §"Phase 5: Form Backend + Enhancement + LGPD": goal and 5 success criteria
- `.planning/ROADMAP.md` §"Residual Risk Statement (SEC-08)": compensating controls this phase must make true (durable + global + daily caps, WAF rule, Hobby plan $0 cap)
- `.planning/REQUIREMENTS.md`: FORM-01..13, LGPD-01..07, SEC-08, SEC-09 (exact acceptance wording)
- `.planning/PROJECT.md`: Key Decisions table, where the D-15 retention/legal-basis decision must be recorded
- `CLAUDE.md`: stack prescription (resend 6.x, zod 4.x, @upstash/ratelimit 2.x, @upstash/redis 1.x, `prerender = false` on the form route only)

### Prior phase decisions
- `.planning/phases/02-content-collections/02-CONTEXT.md`: D-04..D-06, the project-type enum and slugs
- `.planning/phases/03-static-zero-js-sections-csp-safe-refactor-a11y/03-CONTEXT.md`: D-07..D-12, form markup scope, the "Preencha WhatsApp ou e-mail" rule, policy page shell
- `.planning/phases/04-progressive-enhancement-effects/04-CONTEXT.md`: D-10/D-11, single bundled module script and `.js-ready` pattern

### Security ritual
- `.planning/` SEC-07 security-review checklist (created in Phase 1): must pass with no open High at phase end

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ContactSection.astro`: form with all 5 fields (`nome`, `whatsapp`, `email`, `tipo-projeto`, `mensagem`), labels, and the `contato-nota-obrigatorio` note (D-28 replaces the two contact fields and the note with the `canal` selector + one visible contact field). It has no `action`/`method` yet. The submit label is "Enviar pedido de orçamento".
- `src/content/project-types.ts`: `PROJECT_TYPE_VALUES` (for `z.enum`) and `PROJECT_TYPES` (value/label).
- `src/pages/obrigado.astro`: exists as the no-JS success target.
- `src/pages/politica-de-privacidade.astro`: Phase 3 placeholder shell, to be replaced with full content.
- `astro.config.mjs`: `env.schema.RESEND_API_KEY` is already a server secret. `site` is `https://agenciadmarques.com.br`.
- `src/scripts/effects.ts` and related files: the existing bundled module-script pattern and a `node --test` test setup (`pnpm test` runs `src/scripts/*.test.mjs`).

### Established Patterns
- Design tokens in `src/styles/tokens.css`, including the light form-card tokens (`--color-light-*`) and `--focus-ring`. Error and success styling should reuse them.
- Every `:hover` has a matching `:focus-visible`. Transitions are limited to transform, opacity, box-shadow, and border-color, at ≤300 ms.
- No author `style=""` attributes (SITE-04). Visibility is toggled via classes and the `hidden` attribute.
- `vercel.json` is currently `{}`.

### Integration Points
- New on-demand route `src/pages/api/orcamento.ts` with `export const prerender = false`. It must be the single serverless Function.
- `src/components/ServicesSection.astro`: service cards get the D-21 WhatsApp link.
- WhatsApp links in `ContactSection.astro` and `SiteFooter.astro` get the prefilled `?text=`. `HeroBleed.astro` gets no WhatsApp CTA (D-26); `CtaFinal.astro` no longer exists.
- `SiteFooter.astro` and `ContactSection.astro` switch the hotmail address to `contato@` (D-09).
- `BaseLayout.astro` renders `@vercel/analytics`. Verify it fires nothing on form interaction and sets zero cookies (LGPD-05/06).
- New env vars: Upstash REST URL/token (Marketplace-injected) and optionally `CONTACT_EMAIL`, all server-only.

</code_context>

<specifics>
## Specific Ideas

- Example email subject: `Novo orçamento: João — Site institucional`.
- Success panel copy: "✓ Pedido enviado. Respondemos no mesmo dia útil." plus a WhatsApp button.
- Service-card WhatsApp text: "Olá! Vim pelo site e quero falar sobre {serviço}."
- Data-use notice: "Usamos seus dados só para responder a este pedido. Veja a Política de Privacidade."
- Manual checkpoints Felipe must perform: create the separate Resend account, add the DNS records in GoDaddy, provision Upstash via the Vercel Marketplace, create the WAF rule in the Vercel dashboard, and run mail-tester.

</specifics>

<deferred>
## Deferred Ideas

- Auto-reply confirmation email to the lead: rejected for v1 (abuse vector, quota). Could revisit after Turnstile (CF-04, Milestone 2).
- Branded HTML email template: not needed for internal notifications.
- CNPJ/razão social in the policy and footer: TRUST-02.

</deferred>

---

*Phase: 05-form-backend-enhancement-lgpd*
*Context gathered: 2026-09-24*
