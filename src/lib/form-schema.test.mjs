import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CHANNEL_FIELD,
  CHANNEL_LABELS,
  CHANNELS,
  cleanMultiline,
  DEFAULT_CHANNEL,
  ELAPSED_FIELD,
  EMAIL_RE,
  formatPhone,
  HONEYPOT_FIELD,
  LIMITS,
  normalizePhone,
  resolveChannel,
  stripControl,
  TIMING,
  validateFields,
} from './form-schema.ts';

test('constantes compartilhadas', () => {
  assert.equal(LIMITS.nameMin, 2);
  assert.equal(LIMITS.nameMax, 80);
  assert.equal(LIMITS.phoneRawMax, 20);
  assert.equal(LIMITS.emailMax, 120);
  assert.equal(LIMITS.messageMax, 1000);
  assert.equal(HONEYPOT_FIELD, 'empresa-site');
  assert.equal(ELAPSED_FIELD, 'elapsed-ms');
  assert.equal(TIMING.minMs, 3000);
  assert.equal(TIMING.maxMs, 86400000);
  assert.equal(CHANNEL_FIELD, 'canal');
  assert.deepEqual([...CHANNELS], ['whatsapp', 'email']);
  assert.equal(DEFAULT_CHANNEL, 'whatsapp');
  assert.equal(CHANNEL_LABELS.whatsapp, 'WhatsApp');
  assert.equal(CHANNEL_LABELS.email, 'E-mail');
});

test('normalizePhone aceita formatos BR', () => {
  assert.equal(normalizePhone('(16) 99611-1785'), '16996111785');
  assert.equal(normalizePhone('+55 16 99611-1785'), '16996111785');
  assert.equal(normalizePhone('5516996111785'), '16996111785');
  assert.equal(normalizePhone('016996111785'), '16996111785');
  assert.equal(normalizePhone('(16) 3342-1234'), '1633421234');
  assert.equal(normalizePhone('1699611178'), '1699611178');
});

test('normalizePhone rejeita entradas invalidas', () => {
  assert.equal(normalizePhone('12345'), null);
  assert.equal(normalizePhone('(16) 89611-1785'), null);
  assert.equal(normalizePhone('(06) 99611-1785'), null);
  assert.equal(normalizePhone(''), null);
});

test('formatPhone formata celular e fixo', () => {
  assert.equal(formatPhone('16996111785'), '(16) 99611-1785');
  assert.equal(formatPhone('1633421234'), '(16) 3342-1234');
  assert.equal(formatPhone('123'), '123');
});

test('resolveChannel cai em whatsapp', () => {
  assert.equal(resolveChannel('whatsapp'), 'whatsapp');
  assert.equal(resolveChannel('email'), 'email');
  assert.equal(resolveChannel(undefined), 'whatsapp');
  assert.equal(resolveChannel(''), 'whatsapp');
  assert.equal(resolveChannel('fax'), 'whatsapp');
});

test('stripControl remove CR, LF e separadores unicode', () => {
  const out = stripControl('Ana\r\nBcc: x');
  assert.equal(out, 'Ana  Bcc: x');
  assert.ok(!/[\r\n]/.test(out));
  assert.equal(stripControl('a b c'), 'a b c');
  assert.equal(stripControl('  oi  '), 'oi');
});

test('cleanMultiline preserva quebra de linha', () => {
  assert.equal(cleanMultiline('a\r\nb'), 'a\nb');
  assert.equal(cleanMultiline('a\rb'), 'a\nb');
  assert.equal(cleanMultiline('a\u0000b\u0007c\nd'), 'abc\nd');
  assert.equal(cleanMultiline('a b'), 'ab');
});

test('EMAIL_RE valida e bloqueia injecao', () => {
  assert.ok(EMAIL_RE.test('x@y.com.br'));
  assert.ok(!EMAIL_RE.test('a@b'));
  assert.ok(!EMAIL_RE.test('a b@c.com'));
  assert.ok(!EMAIL_RE.test('a@b.com,c@d.com'));
  assert.ok(!EMAIL_RE.test('a@b.com;c@d.com'));
  assert.ok(!EMAIL_RE.test('<a@b.com>'));
  assert.ok(!EMAIL_RE.test('a@@b.com'));
  assert.ok(!EMAIL_RE.test('"a"@b.com'));
});

test('validateFields nome', () => {
  assert.deepEqual(validateFields({ nome: 'A', whatsapp: '(16) 99611-1785' }).errors, ['nome']);
  assert.deepEqual(validateFields({ nome: 'a'.repeat(81), whatsapp: '(16) 99611-1785' }).errors, [
    'nome',
  ]);
  assert.equal(
    validateFields({ nome: 'Ana', canal: 'whatsapp', whatsapp: '(16) 99611-1785' }).ok,
    true,
  );
});

test('validateFields canal whatsapp ignora e-mail', () => {
  assert.deepEqual(
    validateFields({ nome: 'Ana', canal: 'whatsapp', whatsapp: '', email: 'x@y.com.br' }).errors,
    ['whatsapp'],
  );
  assert.deepEqual(validateFields({ nome: 'Ana', canal: 'whatsapp', whatsapp: '123' }).errors, [
    'whatsapp',
  ]);
  assert.deepEqual(
    validateFields({ nome: 'Ana', canal: 'whatsapp', whatsapp: '+55 - (16) - 99611-1785' }).errors,
    ['whatsapp'],
  );
  assert.equal(
    validateFields({ nome: 'Ana', canal: 'whatsapp', whatsapp: '(16) 99611-1785', email: 'lixo' })
      .ok,
    true,
  );
});

test('validateFields canal email ignora WhatsApp', () => {
  assert.equal(validateFields({ nome: 'Ana', canal: 'email', email: 'x@y.com.br' }).ok, true);
  assert.deepEqual(
    validateFields({ nome: 'Ana', canal: 'email', email: '', whatsapp: '(16) 99611-1785' }).errors,
    ['email'],
  );
  assert.deepEqual(validateFields({ nome: 'Ana', canal: 'email', email: 'a@b' }).errors, ['email']);
  assert.equal(
    validateFields({ nome: 'Ana', canal: 'email', email: 'x@y.com.br', whatsapp: '123' }).ok,
    true,
  );
  assert.deepEqual(
    validateFields({ nome: 'Ana', canal: 'email', email: `${'a'.repeat(115)}@y.com.br` }).errors,
    ['email'],
  );
});

test('validateFields canal ausente ou desconhecido vira whatsapp', () => {
  assert.equal(validateFields({ nome: 'Ana', whatsapp: '(16) 99611-1785' }).ok, true);
  assert.deepEqual(validateFields({ nome: 'Ana', canal: 'fax', email: 'x@y.com.br' }).errors, [
    'whatsapp',
  ]);
});

test('validateFields mensagem e ordem dos erros', () => {
  assert.deepEqual(
    validateFields({ nome: 'Ana', whatsapp: '(16) 99611-1785', mensagem: 'm'.repeat(1001) }).errors,
    ['mensagem'],
  );
  assert.equal(
    validateFields({ nome: 'Ana', whatsapp: '(16) 99611-1785', mensagem: 'm'.repeat(1000) }).ok,
    true,
  );
  assert.deepEqual(
    validateFields({ nome: 'A', whatsapp: '1', mensagem: 'm'.repeat(1001) }).errors,
    ['nome', 'whatsapp', 'mensagem'],
  );
  const all = validateFields({
    nome: '',
    canal: 'email',
    email: '',
    mensagem: 'm'.repeat(2000),
  }).errors;
  assert.ok(!all.includes('contato'));
});
