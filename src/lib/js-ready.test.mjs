import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JS_READY } from './js-ready.ts';

const PINNED_HASH = 'tuIU1AzinXXFwvirj5zOPmWp+jY3/gZn/LNq1H5E3BY=';
const INDEX = '.vercel/output/static/index.html';
const CONFIG = '.vercel/output/config.json';

test('script js-ready nao contem quebra de linha', () => {
  assert.equal(/[\r\n]/.test(JS_READY), false);
});

test('script js-ready adiciona a classe e remove apos 3000 ms sem fx', () => {
  assert.ok(JS_READY.includes("classList.add('js-ready')"));
  assert.ok(JS_READY.includes("classList.contains('fx')"));
  assert.ok(JS_READY.includes("classList.remove('js-ready')"));
  assert.ok(JS_READY.endsWith(',3000);'));
});

test('hash sha256 do script js-ready bate com o valor fixado', () => {
  const hash = createHash('sha256').update(JS_READY).digest('base64');
  assert.equal(hash, PINNED_HASH);
});

test('index.html construido contem o script byte a byte', (t) => {
  if (!existsSync(INDEX)) return t.skip('build ausente');
  assert.ok(readFileSync(INDEX, 'utf8').includes(`<script>${JS_READY}</script>`));
});

test('cabecalho CSP da config contem o hash do script js-ready', (t) => {
  if (!existsSync(CONFIG)) return t.skip('build ausente');
  const routes = JSON.parse(readFileSync(CONFIG, 'utf8')).routes ?? [];
  const values = routes
    .map(
      (r) =>
        r.headers?.['content-security-policy'] ??
        r.headers?.['content-security-policy-report-only'],
    )
    .filter(Boolean);
  if (values.length === 0) return t.skip('sem rota CSP');
  const hash = createHash('sha256').update(JS_READY).digest('base64');
  for (const value of values) assert.ok(value.includes(`'sha256-${hash}'`));
});
