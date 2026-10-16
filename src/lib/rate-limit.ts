import { createHmac } from 'node:crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const RATE = {
  ipMax: 3,
  ipWindow: '10 m',
  hourMax: 20,
  hourWindow: '1 h',
  dayMax: 50,
  dayWindow: '1 d',
} as const;

export type LimitOutcome = { success: boolean; reset: number; reason?: string };
export type Limiter = { limit(identifier: string): Promise<LimitOutcome> };
export type Limiters = { ip: Limiter; hour: Limiter; day: Limiter };
export type RateResult =
  | { kind: 'ok' }
  | { kind: 'limited'; retryAfter: number }
  | { kind: 'error' };

const REDIS_TIMEOUT_MS = 3000;

export function hashIp(ip: string | undefined, salt: string): string {
  let key = ip && ip.length > 0 ? ip : 'unknown';
  if (key.split(':').length > 3) {
    key = key.split(':').slice(0, 4).join(':');
  }
  return createHmac('sha256', salt).update(key).digest('base64url').slice(0, 22);
}

export function createLimiters(url: string, token: string): Limiters {
  const redis = new Redis({ url, token });
  const base = { redis, analytics: false, timeout: REDIS_TIMEOUT_MS };
  return {
    ip: new Ratelimit({
      ...base,
      limiter: Ratelimit.slidingWindow(RATE.ipMax, RATE.ipWindow),
      prefix: 'rl:ip',
    }),
    hour: new Ratelimit({
      ...base,
      limiter: Ratelimit.slidingWindow(RATE.hourMax, RATE.hourWindow),
      prefix: 'rl:h',
    }),
    day: new Ratelimit({
      ...base,
      limiter: Ratelimit.fixedWindow(RATE.dayMax, RATE.dayWindow),
      prefix: 'rl:d',
    }),
  };
}

function memoryLimiter(max: number, windowMs: number): Limiter {
  const hits = new Map<string, number[]>();
  return {
    async limit(identifier) {
      const now = Date.now();
      const recent = (hits.get(identifier) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= max) {
        hits.set(identifier, recent);
        return { success: false, reset: recent[0] + windowMs };
      }
      recent.push(now);
      hits.set(identifier, recent);
      return { success: true, reset: recent[0] + windowMs };
    },
  };
}

export function createMemoryLimiters(): Limiters {
  return {
    ip: memoryLimiter(RATE.ipMax, 600000),
    hour: memoryLimiter(RATE.hourMax, 3600000),
    day: memoryLimiter(RATE.dayMax, 86400000),
  };
}

export function createRateGate(
  limiters: Limiters,
  salt: string,
  now: () => number = Date.now,
): (ip: string | undefined) => Promise<RateResult> {
  return async (ip) => {
    try {
      const steps: Array<[Limiter, string]> = [
        [limiters.ip, hashIp(ip, salt)],
        [limiters.hour, 'global'],
        [limiters.day, 'global'],
      ];
      for (const [limiter, id] of steps) {
        const outcome = await limiter.limit(id);
        if (outcome.reason === 'timeout') return { kind: 'error' };
        if (!outcome.success) {
          return {
            kind: 'limited',
            retryAfter: Math.max(1, Math.ceil((outcome.reset - now()) / 1000)),
          };
        }
      }
      return { kind: 'ok' };
    } catch {
      return { kind: 'error' };
    }
  };
}
