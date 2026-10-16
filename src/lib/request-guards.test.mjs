import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isAllowedOrigin,
  isFormUrlEncoded,
  MAX_BODY_BYTES,
  readBodyCapped,
  wantsJson,
} from './request-guards.ts';

const ALLOWED = ['https://agenciadmarques.com.br', 'https://www.agenciadmarques.com.br'];
const URL_BASE = 'https://agenciadmarques.com.br/api/orcamento';

function req(headers = {}, body, url = URL_BASE) {
  return new Request(url, { method: 'POST', headers, body, duplex: 'half' });
}

function chunked(total, size) {
  let sent = 0;
  return new ReadableStream({
    pull(controller) {
      if (sent >= total) {
        controller.close();
        return;
      }
      const n = Math.min(size, total - sent);
      sent += n;
      controller.enqueue(new Uint8Array(n).fill(97));
    },
  });
}

test('MAX_BODY_BYTES e 16 KB', () => {
  assert.equal(MAX_BODY_BYTES, 16384);
});

test('isFormUrlEncoded aceita urlencoded com e sem charset', () => {
  assert.equal(isFormUrlEncoded(req({ 'content-type': 'application/x-www-form-urlencoded' })), true);
  assert.equal(
    isFormUrlEncoded(req({ 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' })),
    true,
  );
});

test('isFormUrlEncoded rejeita outros tipos e ausencia', () => {
  assert.equal(isFormUrlEncoded(req({ 'content-type': 'application/json' })), false);
  assert.equal(isFormUrlEncoded(req({ 'content-type': 'multipart/form-data; boundary=x' })), false);
  assert.equal(isFormUrlEncoded(new Request(URL_BASE, { method: 'POST' })), false);
});

test('isAllowedOrigin aceita lista permitida', () => {
  assert.equal(isAllowedOrigin(req({ origin: 'https://agenciadmarques.com.br' }), ALLOWED), true);
  assert.equal(isAllowedOrigin(req({ origin: 'https://www.agenciadmarques.com.br' }), ALLOWED), true);
});

test('isAllowedOrigin rejeita estranha, ausente e null', () => {
  assert.equal(isAllowedOrigin(req({ origin: 'https://evil.example' }), ALLOWED), false);
  assert.equal(isAllowedOrigin(req({}), ALLOWED), false);
  assert.equal(isAllowedOrigin(req({ origin: 'null' }), ALLOWED), false);
  assert.equal(isAllowedOrigin(req({ origin: '' }), ALLOWED), false);
});

test('isAllowedOrigin aceita mesma origem da URL e do Host', () => {
  const previewUrl = 'https://dmarques-abc.vercel.app/api/orcamento';
  assert.equal(
    isAllowedOrigin(req({ origin: 'https://dmarques-abc.vercel.app' }, undefined, previewUrl), ALLOWED),
    true,
  );
  assert.equal(
    isAllowedOrigin(
      req({ origin: 'https://host-x.vercel.app', host: 'host-x.vercel.app' }, undefined, 'http://internal/api'),
      ALLOWED,
    ),
    true,
  );
});

test('readBodyCapped devolve corpo pequeno', async () => {
  const body = 'a'.repeat(100);
  assert.equal(await readBodyCapped(req({}, body), MAX_BODY_BYTES), body);
});

test('readBodyCapped decodifica UTF-8 com acentos', async () => {
  const body = 'nome=Jos%C3%A9&msg=ação não é coração';
  assert.equal(await readBodyCapped(req({}, body), MAX_BODY_BYTES), body);
});

test('readBodyCapped rejeita stream acima do teto sem Content-Length', async () => {
  assert.equal(await readBodyCapped(req({}, chunked(20000, 1000)), MAX_BODY_BYTES), null);
});

test('readBodyCapped rejeita Content-Length grande sem ler o stream', async () => {
  let pulled = false;
  const stream = new ReadableStream({
    pull(controller) {
      pulled = true;
      controller.enqueue(new Uint8Array(10));
      controller.close();
    },
  });
  const r = req({ 'content-length': '999999' }, stream);
  assert.equal(await readBodyCapped(r, MAX_BODY_BYTES), null);
  assert.equal(pulled, false);
});

test('readBodyCapped rejeita Content-Length mentindo', async () => {
  const r = req({ 'content-length': '10' }, chunked(20000, 1000));
  assert.equal(await readBodyCapped(r, MAX_BODY_BYTES), null);
});

test('readBodyCapped devolve vazio sem corpo', async () => {
  assert.equal(await readBodyCapped(new Request(URL_BASE, { method: 'POST' }), MAX_BODY_BYTES), '');
});

test('wantsJson le o cabecalho Accept', () => {
  assert.equal(wantsJson(req({ accept: 'application/json' })), true);
  assert.equal(wantsJson(req({ accept: 'text/html,application/xhtml+xml' })), false);
  assert.equal(wantsJson(req({})), false);
});
