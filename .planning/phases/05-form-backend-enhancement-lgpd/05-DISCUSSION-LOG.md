# Phase 5: Form Backend + Enhancement + LGPD - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-24
**Phase:** 05-form-backend-enhancement-lgpd
**Areas discussed:** E-mail e domínio, Rate limit e limites, Conteúdo da política LGPD, UX dos estados do form

---

## E-mail e domínio

Felipe first asked why the site needs a sender address at all ("não é o cliente
que envia e-mail para mim?"). We clarified that the site sends the notification,
the lead's address can't be the `from` (spoofing breaks SPF/DKIM), and replying
goes to the lead via reply-to. Felipe then created a domain mailbox at GoDaddy
and asked for a naming suggestion.

| Option | Description | Selected |
|--------|-------------|----------|
| contato@agenciadmarques.com.br | Generic public address; site, footer, JSON-LD, policy | ✓ |
| felipe@agenciadmarques.com.br | Reinforces founder-direct service | |

| Option (from) | Description | Selected |
|--------|-------------|----------|
| orcamento@ | No mailbox needed, easy to filter | |
| contato@ | Same as recipient | ✓ |

**Notes:** Felipe's GoDaddy plan allows only one mailbox, so he chose contato@.

| Option (reply-to) | Description | Selected |
|--------|-------------|----------|
| Yes, lead email | One-click reply | ✓ |
| No | Copy manually | |

| Option (replace hotmail on site) | Description | Selected |
|--------|-------------|----------|
| Yes, now | Pulls TRUST-01 forward | ✓ |
| Later | With TRUST-01 | |

| Option (Resend) | Description | Selected |
|--------|-------------|----------|
| Separate account for Dmarques | Isolates keys, quota, reputation | ✓ |
| Same account | Only if paid / free slot | |
| Unknown | Check first | |

**Notes:** Felipe uses Resend on another project, and the free tier allows 1 domain.

| Option (subject) | Description | Selected |
|--------|-------------|----------|
| Name + type | Sanitized, for inbox triage | ✓ |
| Fixed | No client data | |

| Option (auto-reply) | Description | Selected |
|--------|-------------|----------|
| No | Success screen only | ✓ |
| Yes | Confirmation email to lead | |

| Option (HTML) | Description | Selected |
|--------|-------------|----------|
| Simple and clean | Field table + links + text body | ✓ |
| Branded | Brand colors/header | |

---

## Rate limit e limites

| Option | Description | Selected |
|--------|-------------|----------|
| Upstash Redis via Vercel Marketplace | Durable, per SEC-08 | ✓ |
| In-memory | Not durable | |

| Option (limits) | Description | Selected |
|--------|-------------|----------|
| 3/IP/10min · 20/h · 50/day | Well under Resend 100/day | ✓ |
| 5/IP/10min · 30/h · 80/day | Looser | |
| Claude decides | | |

| Option (on limit) | Description | Selected |
|--------|-------------|----------|
| Friendly message + WhatsApp button | Lead not lost | ✓ |
| "Try later" only | | |

| Option (WAF) | Description | Selected |
|--------|-------------|----------|
| Looser than app (~10 req/min/IP) | Flood-only | ✓ |
| Claude decides | | |

---

## Conteúdo da política LGPD

| Option (controller) | Description | Selected |
|--------|-------------|----------|
| Felipe Salles, pessoa física, "Dmarques" | No CPF published | ✓ |
| Existing CNPJ/MEI | | |

| Option (retention) | Description | Selected |
|--------|-------------|----------|
| 12 months | | |
| 6 months | | ✓ |
| 24 months | | |

| Option (encarregado) | Description | Selected |
|--------|-------------|----------|
| Channel = contato@, cite exemption | Res. CD/ANPD 2/2022 | ✓ |
| Felipe as encarregado | | |

| Option (format) | Description | Selected |
|--------|-------------|----------|
| Plain language, short sections + index | | ✓ |
| Formal legal text | | |

---

## UX dos estados do form

| Option (success with JS) | Description | Selected |
|--------|-------------|----------|
| Replace form with success panel | Prevents resubmit | ✓ |
| Keep form, clear, change button | Design's original | |
| Redirect to /obrigado | | |

| Option (phone) | Description | Selected |
|--------|-------------|----------|
| No mask, format on blur | Server normalizes | ✓ |
| Live mask | | |

| Option (WhatsApp prefill) | Description | Selected |
|--------|-------------|----------|
| Add link to each service card | Full FORM-13 | ✓ |
| Generic text on existing links only | | |

| Option (LGPD notice) | Description | Selected |
|--------|-------------|----------|
| Short one-liner | | ✓ |
| Claude drafts | | |

---

## Claude's Discretion

- Fake-success response for honeypot/timing rejections
- Timestamp carrying/signing mechanism
- Error copy, no-JS error path shape, code layout, body-size cap, Origin allow-list
- from/to as constants vs server-only env vars
- Policy content in Markdown entry vs .astro

## Deferred Ideas

- Auto-reply to lead (revisit after Turnstile, M2)
- Branded email template
- CNPJ in policy/footer (TRUST-02)
