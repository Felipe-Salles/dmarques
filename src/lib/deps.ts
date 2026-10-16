import { Resend } from 'resend';
import type { OutgoingEmail } from './mail.ts';
import {
  createLimiters,
  createMemoryLimiters,
  createRateGate,
  type RateResult,
} from './rate-limit.ts';
import { MAX_BODY_BYTES } from './request-guards.ts';
import type { Deps } from './submit.ts';

export const ALLOWED_ORIGINS = [
  'https://agenciadmarques.com.br',
  'https://www.agenciadmarques.com.br',
] as const;

const DEFAULT_CONTACT = 'contato@agenciadmarques.com.br';

function buildRateLimit(
  getSecret: (key: string) => string | undefined,
  dev: boolean,
): (ip: string | undefined) => Promise<RateResult> {
  const url = getSecret('UPSTASH_REDIS_REST_URL') ?? getSecret('KV_REST_API_URL');
  const token = getSecret('UPSTASH_REDIS_REST_TOKEN') ?? getSecret('KV_REST_API_TOKEN');
  const salt = getSecret('RATE_LIMIT_SALT');
  if (url && token && salt) return createRateGate(createLimiters(url, token), salt);
  if (dev) return createRateGate(createMemoryLimiters(), 'dev-salt');
  return async () => ({ kind: 'error' });
}

function buildSend(key: string | undefined): (email: OutgoingEmail) => Promise<boolean> {
  return async (email) => {
    if (!key) return false;
    try {
      const { from, to, subject, html, text, replyTo } = email;
      const result = await new Resend(key).emails.send({
        from,
        to,
        subject,
        html,
        text,
        ...(replyTo ? { replyTo } : {}),
      });
      return !result.error;
    } catch {
      return false;
    }
  };
}

export function createDeps(
  getSecret: (key: string) => string | undefined,
  clientIp: string | undefined,
  dev: boolean,
): Deps {
  const contact = getSecret('CONTACT_EMAIL') || DEFAULT_CONTACT;
  return {
    allowedOrigins: ALLOWED_ORIGINS,
    maxBytes: MAX_BODY_BYTES,
    clientIp,
    rateLimit: buildRateLimit(getSecret, dev),
    send: buildSend(getSecret('RESEND_API_KEY')),
    mailFrom: `Site Dmarques <${contact}>`,
    mailTo: contact,
  };
}
