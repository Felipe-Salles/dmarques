export const MAX_BODY_BYTES = 16384;

export function isFormUrlEncoded(request: Request): boolean {
  const type = request.headers.get('content-type');
  if (!type) return false;
  return type.toLowerCase().startsWith('application/x-www-form-urlencoded');
}

export function isAllowedOrigin(request: Request, allowed: readonly string[]): boolean {
  try {
    const origin = request.headers.get('origin');
    if (!origin || origin === 'null') return false;
    if (allowed.includes(origin)) return true;
    if (origin === new URL(request.url).origin) return true;
    const host = request.headers.get('host');
    return Boolean(host) && origin === `https://${host}`;
  } catch {
    return false;
  }
}

export async function readBodyCapped(request: Request, maxBytes: number): Promise<string | null> {
  const declared = request.headers.get('content-length');
  if (declared !== null && /^\d+$/.test(declared.trim()) && Number(declared) > maxBytes) {
    return null;
  }
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8').decode(merged);
}

export function wantsJson(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('application/json');
}
