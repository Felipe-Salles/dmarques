import { getSecret } from 'astro:env/server';
import type { APIRoute } from 'astro';
import { createDeps } from '../../lib/deps.ts';
import { failureResponse, handleSubmission } from '../../lib/submit.ts';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    let ip: string | undefined;
    try {
      ip = context.clientAddress;
    } catch {
      ip = undefined;
    }
    return await handleSubmission(context.request, createDeps(getSecret, ip, import.meta.env.DEV));
  } catch {
    return failureResponse(context.request);
  }
};

export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
