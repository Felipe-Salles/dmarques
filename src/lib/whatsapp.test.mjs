import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  GENERIC_WA_TEXT,
  WHATSAPP_NUMBER,
  buildWaUrl,
  fallbackWaText,
  serviceWaText,
} from './whatsapp.ts';

test('constantes do WhatsApp', () => {
  assert.equal(WHATSAPP_NUMBER, '5516996111785');
  assert.equal(GENERIC_WA_TEXT, 'Olá! Vim pelo site da Dmarques e quero pedir um orçamento.');
});

test('buildWaUrl codifica o texto', () => {
  const text = 'Olá! Sou Ana & cia';
  assert.equal(buildWaUrl(text), `https://wa.me/5516996111785?text=${encodeURIComponent(text)}`);
  assert.ok(!buildWaUrl(text).includes('&cia'));
});

test('serviceWaText', () => {
  assert.equal(
    serviceWaText('Sites institucionais'),
    'Olá! Vim pelo site e quero falar sobre Sites institucionais.',
  );
});

test('fallbackWaText com nome e tipo', () => {
  assert.equal(
    fallbackWaText('Ana', 'Site institucional'),
    'Olá! Sou Ana. Vim pelo site e quero falar sobre Site institucional.',
  );
});

test('fallbackWaText so nome', () => {
  assert.equal(
    fallbackWaText('Ana', undefined),
    'Olá! Sou Ana. Vim pelo site e quero pedir um orçamento.',
  );
});

test('fallbackWaText so tipo', () => {
  assert.equal(
    fallbackWaText(undefined, 'Automação de processo'),
    'Olá! Vim pelo site e quero falar sobre Automação de processo.',
  );
});

test('fallbackWaText vazio', () => {
  assert.equal(fallbackWaText('', ''), 'Olá! Vim pelo site e quero pedir um orçamento.');
  assert.ok(!fallbackWaText('', '').includes('Dmarques'));
});

test('fallbackWaText limpa e trunca o nome', () => {
  const out = fallbackWaText(`Ana\r\n${'x'.repeat(200)}`, undefined);
  assert.ok(!/[\r\n]/.test(out));
  const nome = out.slice('Olá! Sou '.length, out.indexOf('. Vim'));
  assert.equal(nome.length, 80);
});
