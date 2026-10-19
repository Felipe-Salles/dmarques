import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  CSP_HEADER_NAMES,
  checkCsp,
  checkNonCspHeaders,
  compileRules,
  headersFor,
  isRegexCompatible,
} from '../../scripts/verify/headers.mjs';

const vercelJson = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8'));

const FULL = {
  'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-site',
};

const CSP =
  "default-src 'self'; script-src 'self' 'sha256-abc'; style-src 'self' 'sha256-def'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

test('compileRules mantem so rotas de config com headers e src e sem dest', () => {
  const rules = compileRules(
    [
      { src: '^/a$', headers: { 'X-A': '1' }, continue: true },
      { src: '^/b$', dest: '/x', headers: { 'X-B': '1' } },
      { handle: 'filesystem' },
      { src: '^/c$' },
    ],
    [],
  );
  assert.equal(rules.length, 1);
  assert.deepEqual(rules[0].headers, { 'x-a': '1' });
});

test('compileRules compila entradas do vercel.json com ancoras e chaves minusculas', () => {
  const rules = compileRules([], [{ source: '/(.*)', headers: [{ key: 'X-Teste', value: 'v' }] }]);
  assert.equal(rules.length, 1);
  assert.equal(rules[0].re.test('/qualquer/coisa'), true);
  assert.deepEqual(rules[0].headers, { 'x-teste': 'v' });
});

test('headersFor mescla regras na ordem e a ultima vence na mesma chave', () => {
  const rules = compileRules(
    [{ src: '^/nao-existe$', headers: { 'X-A': '1', 'X-B': '1' } }],
    [{ source: '/(.*)', headers: [{ key: 'X-B', value: '2' }] }],
  );
  assert.deepEqual(headersFor(rules, '/nao-existe'), { 'x-a': '1', 'x-b': '2' });
  assert.deepEqual(headersFor(rules, '/outra'), { 'x-b': '2' });
});

test('isRegexCompatible aceita regex e rejeita tokens de path-to-regexp', () => {
  assert.equal(isRegexCompatible('/(.*)'), true);
  assert.equal(isRegexCompatible('/:path*'), false);
  assert.equal(isRegexCompatible('/a/*'), false);
  assert.equal(isRegexCompatible('/(['), false);
});

test('todas as sources do vercel.json real sao compativeis com regex', () => {
  assert.ok(Array.isArray(vercelJson.headers));
  for (const entry of vercelJson.headers) {
    assert.equal(isRegexCompatible(entry.source), true, entry.source);
  }
});

test('vercel.json real passa em checkNonCspHeaders', () => {
  const rules = compileRules([], vercelJson.headers);
  assert.deepEqual(checkNonCspHeaders(headersFor(rules, '/nao-existe')), []);
});

test('checkNonCspHeaders passa com o conjunto completo', () => {
  assert.deepEqual(checkNonCspHeaders(FULL), []);
});

test('checkNonCspHeaders aponta cada cabecalho ausente ou errado', () => {
  for (const key of Object.keys(FULL)) {
    const copy = { ...FULL };
    delete copy[key];
    const out = checkNonCspHeaders(copy);
    assert.equal(out.length >= 1, true, key);
    assert.equal(
      out.some((f) => f.includes(key)),
      true,
      key,
    );
  }
  assert.equal(
    checkNonCspHeaders({ ...FULL, 'strict-transport-security': 'max-age=100' }).length >= 1,
    true,
  );
  assert.equal(
    checkNonCspHeaders({
      ...FULL,
      'strict-transport-security': 'max-age=63072000; includeSubDomains',
    }).length >= 1,
    true,
  );
  assert.equal(checkNonCspHeaders({ ...FULL, 'x-frame-options': 'SAMEORIGIN' }).length >= 1, true);
  assert.equal(
    checkNonCspHeaders({ ...FULL, 'permissions-policy': 'camera=()' }).length >= 1,
    true,
  );
});

test('checkCsp none falha quando qualquer CSP esta presente', () => {
  assert.deepEqual(checkCsp({}, 'none'), []);
  assert.equal(checkCsp({ 'content-security-policy': CSP }, 'none').length >= 1, true);
  assert.equal(checkCsp({ 'content-security-policy-report-only': CSP }, 'none').length >= 1, true);
});

test('checkCsp report-only exige o cabecalho report-only e proibe o de enforcement', () => {
  const ro = CSP_HEADER_NAMES['report-only'];
  assert.deepEqual(checkCsp({ [ro]: CSP }, 'report-only'), []);
  assert.equal(checkCsp({}, 'report-only').length >= 1, true);
  assert.equal(
    checkCsp({ [ro]: CSP, 'content-security-policy': CSP }, 'report-only').length >= 1,
    true,
  );
});

test('checkCsp enforce exige enforcement, sem report-only e com upgrade-insecure-requests', () => {
  assert.deepEqual(checkCsp({ 'content-security-policy': CSP }, 'enforce'), []);
  assert.equal(checkCsp({}, 'enforce').length >= 1, true);
  assert.equal(
    checkCsp(
      { 'content-security-policy': CSP, 'content-security-policy-report-only': CSP },
      'enforce',
    ).length >= 1,
    true,
  );
  assert.equal(
    checkCsp(
      { 'content-security-policy': CSP.replace('; upgrade-insecure-requests', '') },
      'enforce',
    ).length >= 1,
    true,
  );
});

test('checkCsp valida diretivas obrigatorias e proibe unsafe-inline e unsafe-eval', () => {
  const ro = CSP_HEADER_NAMES['report-only'];
  for (const part of [
    "default-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ]) {
    assert.equal(
      checkCsp({ [ro]: CSP.replace(part, 'x-y') }, 'report-only').length >= 1,
      true,
      part,
    );
  }
  assert.equal(
    checkCsp(
      { [ro]: CSP.replace("script-src 'self'", "script-src 'unsafe-inline'") },
      'report-only',
    ).length >= 1,
    true,
  );
  assert.equal(checkCsp({ [ro]: `${CSP}; x 'unsafe-eval'` }, 'report-only').length >= 1, true);
  assert.equal(
    checkCsp({ [ro]: CSP.replace("style-src 'self'", "style-src 'none'") }, 'report-only').length >=
      1,
    true,
  );
});
