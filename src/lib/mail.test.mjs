import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildEmail, subjectFor } from './mail.ts';

const addr = {
  from: 'Site Dmarques <contato@agenciadmarques.com.br>',
  to: 'contato@agenciadmarques.com.br',
};

test('assunto com rotulo do enum e canal', () => {
  assert.equal(
    subjectFor('João', 'whatsapp', 'site-institucional'),
    'Novo orçamento: João — Site institucional (WhatsApp)',
  );
  assert.equal(subjectFor('João', 'email', undefined), 'Novo orçamento: João (E-mail)');
});

test('assunto trunca nome em 60 caracteres', () => {
  const s = subjectFor('A'.repeat(100), 'whatsapp', 'automacao');
  assert.ok(s.includes(`${'A'.repeat(60)} `));
  assert.ok(!s.includes('A'.repeat(61)));
});

test('assunto sem CR/LF', () => {
  const s = subjectFor('Ana\r\nBcc: x@y.z', 'email', undefined);
  assert.ok(!s.includes('\r'));
  assert.ok(!s.includes('\n'));
});

test('email: html escapado, text literal, reply-to e canal', () => {
  const m = buildEmail(
    { nome: '<b>Ana</b>', canal: 'email', email: 'ana@x.co', mensagem: '<script>alert(1)</script>' },
    addr,
  );
  assert.ok(m.html.includes('&lt;b&gt;Ana&lt;/b&gt;'));
  assert.ok(m.html.includes('&lt;script&gt;'));
  assert.ok(!m.html.includes('<script>'));
  assert.ok(m.text.includes('<b>Ana</b>'));
  assert.equal(m.replyTo, 'ana@x.co');
  assert.equal(m.from, addr.from);
  assert.equal(m.to, addr.to);
  assert.ok(m.html.includes('Contato preferido'));
  assert.ok(m.html.includes('E-mail'));
  assert.ok(m.text.includes('Contato preferido'));
  assert.ok(m.text.includes('E-mail'));
  assert.ok(!m.html.includes('wa.me'));
  assert.ok(m.html.includes('mailto:ana@x.co'));
});

test('whatsapp: link wa.me, sem reply-to e sem mailto', () => {
  const m = buildEmail({ nome: 'Ana', canal: 'whatsapp', whatsapp: '16996111785' }, addr);
  assert.equal(m.replyTo, undefined);
  assert.ok(m.html.includes('https://wa.me/5516996111785'));
  assert.ok(m.html.includes('(16) 99611-1785'));
  assert.ok(m.text.includes('https://wa.me/5516996111785'));
  assert.ok(m.html.includes('Contato preferido'));
  assert.ok(m.html.includes('WhatsApp'));
  assert.ok(m.text.includes('Contato preferido'));
  assert.ok(m.text.includes('WhatsApp'));
  assert.ok(!m.html.includes('mailto:'));
});

test('entrada defensiva: so o canal escolhido e usado', () => {
  const m = buildEmail(
    { nome: 'Ana', canal: 'whatsapp', whatsapp: '16996111785', email: 'ana@x.co' },
    addr,
  );
  assert.equal(m.replyTo, undefined);
  assert.ok(!m.html.includes('mailto:'));
  assert.ok(!m.html.includes('ana@x.co'));
  assert.ok(!m.text.includes('ana@x.co'));
});

test('html sem imagens nem urls remotas inseguras', () => {
  const m = buildEmail(
    { nome: 'Ana', canal: 'email', email: 'ana@x.co', tipoProjeto: 'automacao', mensagem: 'oi' },
    addr,
  );
  assert.ok(!m.html.includes('<img'));
  assert.ok(!m.html.includes('http://'));
  assert.ok(!m.html.includes('src='));
  assert.ok(m.html.includes('Automação de processo'));
  assert.ok(m.html.includes('<pre>'));
  assert.ok(!/style\s*=/.test(m.html));
});

test('subject do email montado usa o assunto sanitizado', () => {
  const m = buildEmail({ nome: 'Ana\r\nBcc: x', canal: 'email', email: 'ana@x.co' }, addr);
  assert.ok(!m.subject.includes('\n'));
  assert.ok(m.subject.startsWith('Novo orçamento: '));
});
