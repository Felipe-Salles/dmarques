import { getSecret } from 'astro:env/server';
import type { APIRoute } from 'astro';
import { createDeps } from '../../lib/deps.ts';
import { handleSubmission } from '../../lib/submit.ts';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  let ip: string | undefined;
  try {
    ip = context.clientAddress;
  } catch {
    ip = undefined;
  }
  return handleSubmission(context.request, createDeps(getSecret, ip, import.meta.env.DEV));
};

export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
