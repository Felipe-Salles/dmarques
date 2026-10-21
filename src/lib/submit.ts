import { parseSubmission } from './form-schema.server.ts';
import { ELAPSED_FIELD, HONEYPOT_FIELD, TIMING } from './form-schema.ts';
import { buildEmail, type OutgoingEmail } from './mail.ts';
import type { RateResult } from './rate-limit.ts';
import { isAllowedOrigin, isFormUrlEncoded, readBodyCapped, wantsJson } from './request-guards.ts';

export type Deps = {
  allowedOrigins: readonly string[];
  maxBytes: number;
  clientIp: string | undefined;
  rateLimit: (ip: string | undefined) => Promise<RateResult>;
  send: (email: OutgoingEmail) => Promise<boolean>;
  mailFrom: string;
  mailTo: string;
};

export const REASON_PATH = {
  ok: '/obrigado',
  invalid: '/erro-envio/invalido',
  limited: '/erro-envio/limite',
  failed: '/erro-envio/falha',
} as const;

type Kind = keyof typeof REASON_PATH;

const BASE_HEADERS = { 'Cache-Control': 'no-store', Vary: 'Accept' } as const;

function seeOther(kind: Kind): Response {
  return new Response(null, {
    status: 303,
    headers: { ...BASE_HEADERS, Location: REASON_PATH[kind] },
  });
}

function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...BASE_HEADERS, 'Content-Type': 'application/json; charset=utf-8', ...extra },
  });
}

function bare(status: number): Response {
  return new Response(null, { status, headers: { ...BASE_HEADERS } });
}

const failedJson = (): Response => json(502, { ok: false, code: 'failed' });

export function failureResponse(request: Request): Response {
  return wantsJson(request) ? failedJson() : seeOther('failed');
}

function hasInvalidTiming(form: Record<string, string>): boolean {
  const elapsed = form[ELAPSED_FIELD];
  if (typeof elapsed === 'string' && elapsed.trim() !== '') {
    const ms = Number(elapsed);
    if (!Number.isFinite(ms) || ms < 0 || ms < TIMING.minMs || ms > TIMING.maxMs) return true;
  }
  return false;
}

export async function handleSubmission(request: Request, deps: Deps): Promise<Response> {
  const asJson = wantsJson(request);

  const respond = (kind: Kind, extra?: { fields?: string[]; retryAfter?: number }): Response => {
    if (!asJson) return seeOther(kind);
    if (kind === 'ok') return json(200, { ok: true });
    if (kind === 'invalid') {
      return json(400, { ok: false, code: 'invalid', fields: extra?.fields ?? [] });
    }
    if (kind === 'limited') {
      return json(
        429,
        { ok: false, code: 'limited' },
        { 'Retry-After': String(extra?.retryAfter ?? 60) },
      );
    }
    return failedJson();
  };

  try {
    if (!isFormUrlEncoded(request)) return bare(415);
    if (!isAllowedOrigin(request, deps.allowedOrigins)) return bare(403);

    const raw = await readBodyCapped(request, deps.maxBytes);
    if (raw === null) return bare(413);

    const form = Object.fromEntries(new URLSearchParams(raw));
    if (form[HONEYPOT_FIELD]?.trim()) return respond('ok');

    const parsed = parseSubmission(form);
    if (!parsed.ok) return respond('invalid', { fields: parsed.fields });
    if (hasInvalidTiming(form)) return respond('ok');

    const rate = await deps.rateLimit(deps.clientIp);
    if (rate.kind === 'limited') return respond('limited', { retryAfter: rate.retryAfter });
    if (rate.kind === 'error') return respond('failed');

    const email = buildEmail(parsed.data, { from: deps.mailFrom, to: deps.mailTo });
    const sent = await deps.send(email);
    return respond(sent ? 'ok' : 'failed');
  } catch {
    return respond('failed');
  }
}
