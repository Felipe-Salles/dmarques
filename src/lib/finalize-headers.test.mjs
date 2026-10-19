import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  collectCsp,
  DEFAULT_CSP_MODE,
  headerNameFor,
  reshapeRoutes,
  withUpgrade,
} from './finalize-headers.pure.mjs';

const CSP = "default-src 'self'; script-src 'self' 'sha256-abc'; style-src 'self' 'sha256-def'";

function fixture(csp = CSP) {
  return [
    {
      src: '^/_astro/(.*)$',
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    { src: '^/$', headers: { 'content-security-policy': csp } },
    { src: '^/404$', headers: { 'content-security-policy': csp } },
    { src: '^/obrigado$', headers: { 'content-security-policy': csp } },
    { handle: 'filesystem' },
    { src: '^/_render$', dest: '_render' },
    { src: '/(.*)', status: 404, dest: '/404' },
  ];
}

test('modo padrao e enforce', () => {
  assert.equal(DEFAULT_CSP_MODE, 'enforce');
});

test('headerNameFor mapeia os modos e rejeita invalido', () => {
  assert.equal(headerNameFor('report-only'), 'content-security-policy-report-only');
  assert.equal(headerNameFor('enforce'), 'content-security-policy');
  assert.throws(() => headerNameFor('outro'));
});

test('collectCsp devolve o valor unico', () => {
  assert.equal(collectCsp(fixture()), CSP);
});

test('collectCsp falha sem rota CSP', () => {
  assert.throws(() => collectCsp([{ handle: 'filesystem' }]), /nenhuma rota CSP/);
});

test('collectCsp falha com CSP divergente', () => {
  const routes = fixture();
  routes[2] = { src: '^/404$', headers: { 'content-security-policy': `${CSP}; x` } };
  assert.throws(() => collectCsp(routes), /CSP divergente entre paginas/);
});

test('withUpgrade em enforce acrescenta uma unica vez', () => {
  const once = withUpgrade(CSP, 'enforce');
  assert.equal(once, `${CSP}; upgrade-insecure-requests`);
  assert.equal(withUpgrade(once, 'enforce'), once);
});

test('withUpgrade em report-only remove upgrade-insecure-requests', () => {
  assert.equal(withUpgrade(CSP, 'report-only'), CSP);
  assert.equal(withUpgrade(`${CSP}; upgrade-insecure-requests`, 'report-only'), CSP);
});

test('reshapeRoutes insere rota global antes do filesystem', () => {
  const input = fixture();
  const out = reshapeRoutes(input, 'report-only');
  const index = out.findIndex((r) => r.handle === 'filesystem');
  assert.deepEqual(out[index - 1], {
    src: '/(.*)',
    headers: { 'content-security-policy-report-only': CSP },
    continue: true,
  });
  assert.equal(out.filter((r) => r.headers?.['content-security-policy']).length, 0);
  assert.equal(out.length, input.length - 3 + 1);
});

test('reshapeRoutes preserva a ordem das demais rotas', () => {
  const out = reshapeRoutes(fixture(), 'enforce');
  assert.deepEqual(
    out.map((r) => r.src ?? r.handle),
    ['^/_astro/(.*)$', '/(.*)', 'filesystem', '^/_render$', '/(.*)'],
  );
  assert.ok(out[1].headers['content-security-policy'].endsWith('upgrade-insecure-requests'));
});

test('reshapeRoutes nao muta a entrada', () => {
  const input = fixture();
  const copy = structuredClone(input);
  reshapeRoutes(input, 'report-only');
  assert.deepEqual(input, copy);
});

test('reshapeRoutes falha sem handle filesystem', () => {
  assert.throws(() =>
    reshapeRoutes(
      fixture().filter((r) => r.handle !== 'filesystem'),
      'enforce',
    ),
  );
});

test('reshapeRoutes falha ao rodar de novo sobre rotas ja reformatadas', () => {
  const once = reshapeRoutes(fixture(), 'report-only');
  assert.throws(() => reshapeRoutes(once, 'report-only'), /nenhuma rota CSP/);
});
