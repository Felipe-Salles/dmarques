import assert from 'node:assert/strict';
import { test } from 'node:test';
import { failureResponse, handleSubmission } from './submit.ts';

const ORIGIN = 'https://agenciadmarques.com.br';
const VALID = { nome: 'Ana', canal: 'whatsapp', whatsapp: '16996111785' };
const ALLOWED_LOCATIONS = new Set([
  '/obrigado',
  '/erro-envio/invalido',
  '/erro-envio/limite',
  '/erro-envio/falha',
]);
const seenLocations = [];

function req(fields = VALID, opts = {}) {
  const body = opts.body ?? new URLSearchParams(fields).toString();
  const headers = {
    origin: opts.origin ?? ORIGIN,
    'content-type': opts.contentType ?? 'application/x-www-form-urlencoded',
  };
  if (opts.accept) headers.accept = opts.accept;
  return new Request('https://agenciadmarques.com.br/api/orcamento', {
    method: 'POST',
    headers,
    body,
  });
}

function deps(overrides = {}) {
  const state = { sent: [], rate: 0 };
  const base = {
    allowedOrigins: [ORIGIN],
    maxBytes: 16384,
    clientIp: '1.2.3.4',
    rateLimit: async () => {
      state.rate += 1;
      return { kind: 'ok' };
    },
    send: async (email) => {
      state.sent.push(email);
      return true;
    },
    mailFrom: 'Site Dmarques <contato@agenciadmarques.com.br>',
    mailTo: 'contato@agenciadmarques.com.br',
  };
  return { d: { ...base, ...overrides }, state };
}

async function run(request, overrides) {
  const { d, state } = deps(overrides);
  const res = await handleSubmission(request, d);
  const loc = res.headers.get('location');
  if (loc) seenLocations.push(loc);
  return { res, state };
}

const JSON_ACCEPT = { accept: 'application/json' };

test('valido sem JS redireciona para obrigado', async () => {
  const { res, state } = await run(req());
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/obrigado');
  assert.equal(state.sent.length, 1);
  assert.ok(res.headers.get('cache-control').includes('no-store'));
});

test('valido com Accept JSON devolve 200', async () => {
  const { res } = await run(req(VALID, JSON_ACCEPT));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
});

test('content-type json devolve 415', async () => {
  const { res, state } = await run(req(VALID, { contentType: 'application/json' }));
  assert.equal(res.status, 415);
  assert.equal(state.sent.length, 0);
});

test('origin invalida devolve 403', async () => {
  const { res, state } = await run(req(VALID, { origin: 'https://evil.example' }));
  assert.equal(res.status, 403);
  assert.equal(state.sent.length, 0);
  assert.equal(state.rate, 0);
});

test('corpo grande devolve 413', async () => {
  const { res, state } = await run(req(VALID, { body: `nome=${'a'.repeat(20000)}` }));
  assert.equal(res.status, 413);
  assert.equal(state.rate, 0);
});

test('honeypot preenchido simula sucesso sem enviar', async () => {
  const fields = { ...VALID, 'empresa-site': 'spam' };
  const a = await run(req(fields));
  assert.equal(a.res.status, 303);
  assert.equal(a.res.headers.get('location'), '/obrigado');
  assert.equal(a.state.sent.length, 0);
  assert.equal(a.state.rate, 0);
  const b = await run(req(fields, JSON_ACCEPT));
  assert.equal(b.res.status, 200);
  assert.deepEqual(await b.res.json(), { ok: true });
  assert.equal(b.state.sent.length, 0);
});

for (const value of ['1000', '90000000', 'abc', '-5']) {
  test(`elapsed-ms ${value} simula sucesso sem enviar`, async () => {
    const { res, state } = await run(req({ ...VALID, 'elapsed-ms': value }));
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/obrigado');
    assert.equal(state.sent.length, 0);
  });
}

for (const value of ['10000', '7300000']) {
  test(`elapsed-ms ${value} segue e envia`, async () => {
    const { res, state } = await run(req({ ...VALID, 'elapsed-ms': value }));
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/obrigado');
    assert.equal(state.sent.length, 1);
  });
}

test('invalido sem JS redireciona', async () => {
  const bad = { nome: 'Ana', canal: 'whatsapp' };
  const { res, state } = await run(req(bad));
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/erro-envio/invalido');
  assert.equal(state.rate, 0);
  assert.equal(state.sent.length, 0);
});

test('invalido com JSON devolve 400 com fields', async () => {
  const { res, state } = await run(req({ nome: 'Ana', canal: 'whatsapp' }, JSON_ACCEPT));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.equal(body.code, 'invalid');
  assert.ok(body.fields.includes('whatsapp'));
  assert.equal(state.rate, 0);
  assert.equal(state.sent.length, 0);
});

test('canal ausente devolve 400 com campo canal', async () => {
  const { res } = await run(req({ nome: 'Ana', whatsapp: '16996111785' }, JSON_ACCEPT));
  assert.equal(res.status, 400);
  assert.ok((await res.json()).fields.includes('canal'));
});

test('canal email ignora whatsapp e usa replyTo', async () => {
  const fields = { nome: 'Ana', canal: 'email', email: 'ana@exemplo.com', whatsapp: '123' };
  const { res, state } = await run(req(fields));
  assert.equal(res.status, 303);
  assert.equal(state.sent.length, 1);
  assert.equal(state.sent[0].replyTo, 'ana@exemplo.com');
  assert.ok(!state.sent[0].text.includes('wa.me'));
  assert.ok(!state.sent[0].html.includes('wa.me'));
});

test('limite atingido', async () => {
  const rateLimit = async () => ({ kind: 'limited', retryAfter: 42 });
  const a = await run(req(), { rateLimit });
  assert.equal(a.res.status, 303);
  assert.equal(a.res.headers.get('location'), '/erro-envio/limite');
  assert.equal(a.state.sent.length, 0);
  const b = await run(req(VALID, JSON_ACCEPT), { rateLimit });
  assert.equal(b.res.status, 429);
  assert.equal(b.res.headers.get('retry-after'), '42');
  assert.equal(b.state.sent.length, 0);
});

test('falha de redis', async () => {
  const rateLimit = async () => ({ kind: 'error' });
  const a = await run(req(), { rateLimit });
  assert.equal(a.res.headers.get('location'), '/erro-envio/falha');
  assert.equal(a.state.sent.length, 0);
  const b = await run(req(VALID, JSON_ACCEPT), { rateLimit });
  assert.equal(b.res.status, 502);
});

test('send false', async () => {
  const send = async () => false;
  const a = await run(req(), { send });
  assert.equal(a.res.status, 303);
  assert.equal(a.res.headers.get('location'), '/erro-envio/falha');
  const b = await run(req(VALID, JSON_ACCEPT), { send });
  assert.equal(b.res.status, 502);
});

test('send lanca sem vazar stack', async () => {
  const send = async () => {
    throw new Error('segredo interno');
  };
  const { res } = await run(req(VALID, JSON_ACCEPT), { send });
  assert.equal(res.status, 502);
  const text = await res.text();
  assert.ok(!text.includes('Error'));
  assert.ok(!text.includes('at '));
  assert.ok(!text.includes('segredo'));
});

test('from e to vem so de deps', async () => {
  const fields = { ...VALID, to: 'x@evil.example', from: 'y@evil.example' };
  const { state } = await run(req(fields));
  assert.equal(state.sent.length, 1);
  assert.equal(state.sent[0].from, 'Site Dmarques <contato@agenciadmarques.com.br>');
  assert.equal(state.sent[0].to, 'contato@agenciadmarques.com.br');
});

test('Vary Accept em todas as respostas', async () => {
  const cases = [
    await run(req()),
    await run(req(VALID, { contentType: 'application/json' })),
    await run(req(VALID, { origin: 'https://evil.example' })),
    await run(req(VALID, JSON_ACCEPT)),
  ];
  for (const { res } of cases) assert.equal(res.headers.get('vary'), 'Accept');
});

test('nenhum Location fora da tabela fixa', () => {
  assert.ok(seenLocations.length > 0);
  for (const loc of seenLocations) assert.ok(ALLOWED_LOCATIONS.has(loc), loc);
});

test('failureResponse sem JSON redireciona para falha', async () => {
  const res = failureResponse(req());
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/erro-envio/falha');
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(res.headers.get('vary'), 'Accept');
  assert.equal(await res.text(), '');
});

test('failureResponse com Accept JSON devolve 502 generico', async () => {
  const res = failureResponse(req(VALID, JSON_ACCEPT));
  assert.equal(res.status, 502);
  assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.deepEqual(await res.json(), { ok: false, code: 'failed' });
});

for (const elapsed of ['1000', '90000000', 'abc', '-5']) {
  test(`invalid payload with elapsed ${elapsed} reports validation errors`, async () => {
    const fields = { ...VALID, nome: '', 'elapsed-ms': elapsed };
    const json = await run(req(fields, JSON_ACCEPT));
    assert.equal(json.res.status, 400);
    const body = await json.res.json();
    assert.equal(body.code, 'invalid');
    assert.ok(body.fields.includes('nome'));
    assert.equal(json.state.sent.length, 0);
    assert.equal(json.state.rate, 0);
    const native = await run(req(fields));
    assert.equal(native.res.status, 303);
    assert.equal(native.res.headers.get('location'), '/erro-envio/invalido');
    assert.equal(native.state.sent.length, 0);
    assert.equal(native.state.rate, 0);
  });
}

test('invalid honeypot payload still silently drops before validation', async () => {
  const fields = { nome: '', 'empresa-site': 'spam', 'elapsed-ms': '1000' };
  const { res, state } = await run(req(fields, JSON_ACCEPT));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(state.sent.length, 0);
  assert.equal(state.rate, 0);
});
