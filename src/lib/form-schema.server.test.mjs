import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateFields } from './form-schema.ts';
import { parseSubmission } from './form-schema.server.ts';

const base = { nome: 'Ana', canal: 'email', email: 'x@y.co' };

test('canal email valido', () => {
  const r = parseSubmission({ nome: 'Ana', canal: 'email', email: 'ana@empresa.com.br' });
  assert.equal(r.ok, true);
  assert.equal(r.data.canal, 'email');
  assert.equal(r.data.email, 'ana@empresa.com.br');
  assert.equal(r.data.whatsapp, undefined);
});

test('canal whatsapp valido normaliza digitos', () => {
  const r = parseSubmission({ nome: 'Ana', canal: 'whatsapp', whatsapp: '+55 (16) 99611-1785' });
  assert.equal(r.ok, true);
  assert.equal(r.data.canal, 'whatsapp');
  assert.equal(r.data.whatsapp, '16996111785');
  assert.equal(r.data.email, undefined);
});

test('email nao substitui whatsapp escolhido', () => {
  const r = parseSubmission({ nome: 'Ana', canal: 'whatsapp', whatsapp: '', email: 'ana@x.co' });
  assert.equal(r.ok, false);
  assert.ok(r.fields.includes('whatsapp'));
});

test('whatsapp nao substitui email escolhido', () => {
  const r = parseSubmission({
    nome: 'Ana',
    canal: 'email',
    email: '',
    whatsapp: '16996111785',
  });
  assert.equal(r.ok, false);
  assert.ok(r.fields.includes('email'));
});

test('campo do outro canal e descartado sem validar', () => {
  const r = parseSubmission({
    nome: 'Ana',
    canal: 'whatsapp',
    whatsapp: '16996111785',
    email: 'lixo<script>',
  });
  assert.equal(r.ok, true);
  assert.equal(r.data.email, undefined);
  const r2 = parseSubmission({ nome: 'Ana', canal: 'email', email: 'ana@x.co', whatsapp: '123' });
  assert.equal(r2.ok, true);
  assert.equal(r2.data.whatsapp, undefined);
});

test('canal ausente ou invalido', () => {
  const a = parseSubmission({ nome: 'Ana', whatsapp: '16996111785' });
  assert.equal(a.ok, false);
  assert.ok(a.fields.includes('canal'));
  const b = parseSubmission({ nome: 'Ana', canal: 'fax', email: 'ana@x.co' });
  assert.equal(b.ok, false);
  assert.ok(b.fields.includes('canal'));
});

test('nome fora dos limites', () => {
  const r = parseSubmission({ nome: 'A', canal: 'email', email: 'a@b.co' });
  assert.ok(r.fields.includes('nome'));
  const r2 = parseSubmission({ nome: 'A'.repeat(81), canal: 'email', email: 'a@b.co' });
  assert.ok(r2.fields.includes('nome'));
});

test('tipo de projeto fora do enum', () => {
  const bad = parseSubmission({ ...base, 'tipo-projeto': 'hackeado' });
  assert.ok(bad.fields.includes('tipo-projeto'));
  const good = parseSubmission({ ...base, 'tipo-projeto': 'automacao' });
  assert.equal(good.data.tipoProjeto, 'automacao');
});

test('mensagem acima do limite', () => {
  const r = parseSubmission({ ...base, mensagem: 'a'.repeat(1001) });
  assert.ok(r.fields.includes('mensagem'));
});

test('CR/LF removidos do nome e quebras normalizadas na mensagem', () => {
  const r = parseSubmission({ ...base, nome: 'Ana\r\nBcc: x' });
  assert.equal(r.ok, true);
  assert.ok(!r.data.nome.includes('\r'));
  assert.ok(!r.data.nome.includes('\n'));
  const m = parseSubmission({ ...base, mensagem: 'linha1\r\nlinha2' });
  assert.equal(m.data.mensagem, 'linha1\nlinha2');
});

test('chaves desconhecidas nao chegam ao resultado', () => {
  const r = parseSubmission({ ...base, 'empresa-site': 'spam', 'elapsed-ms': '123' });
  assert.equal(r.ok, true);
  assert.ok(!('empresa-site' in r.data));
  assert.ok(!('elapsed-ms' in r.data));
});

test('telefone com 23 caracteres e rejeitado', () => {
  const r = parseSubmission({ nome: 'Ana', canal: 'whatsapp', whatsapp: '+55 - (16) - 99611-1785' });
  assert.ok(r.fields.includes('whatsapp'));
});

test('email malformado e rejeitado', () => {
  const r = parseSubmission({ nome: 'Ana', canal: 'email', email: 'x@y.co<script>' });
  assert.ok(r.fields.includes('email'));
});

test('erros devolvem apenas nomes de campo', () => {
  const r = parseSubmission({ nome: 'A', canal: 'email', email: 'bad' });
  assert.equal(r.ok, false);
  for (const f of r.fields) assert.match(f, /^[a-z-]+$/);
});

const table = [
  { nome: 'Ana', canal: 'whatsapp', whatsapp: '16996111785' },
  { nome: 'Ana', canal: 'whatsapp', whatsapp: '+55 (16) 99611-1785' },
  { nome: 'Ana', canal: 'whatsapp', whatsapp: '', email: 'ana@x.co' },
  { nome: 'Ana', canal: 'whatsapp', whatsapp: '+55 - (16) - 99611-1785' },
  { nome: 'Ana', canal: 'whatsapp', whatsapp: '123' },
  { nome: 'A', canal: 'whatsapp', whatsapp: '16996111785' },
  { nome: 'Ana', canal: 'email', email: 'ana@x.co' },
  { nome: 'Ana', canal: 'email', email: 'ana@x' },
  { nome: 'Ana', canal: 'email', email: '' },
  { nome: 'Ana', canal: 'email', email: 'ana@x.co', whatsapp: '123' },
  { nome: 'Ana', canal: 'email', email: 'a<b>@x.co' },
  { nome: 'Ana', canal: 'email', email: 'ana@x.co', mensagem: 'a'.repeat(1001) },
  { nome: 'Ana', canal: 'email', email: 'ana@x.co', mensagem: 'a'.repeat(1000) },
  { nome: 'B'.repeat(81), canal: 'email', email: 'ana@x.co' },
  { nome: 'Ana', canal: 'whatsapp', whatsapp: '(06) 99611-1785' },
];

test('concordancia cliente e servidor', () => {
  assert.ok(table.length >= 14);
  for (const row of table) {
    assert.equal(
      validateFields(row).ok,
      parseSubmission(row).ok,
      `divergencia em ${JSON.stringify(row)}`,
    );
  }
});

test('divergencia intencional: canal ausente ou fax e erro no servidor e whatsapp no cliente', () => {
  for (const canal of [undefined, 'fax']) {
    const row = { nome: 'Ana', whatsapp: '16996111785', ...(canal ? { canal } : {}) };
    const r = parseSubmission(row);
    assert.equal(r.ok, false);
    assert.ok(r.fields.includes('canal'));
    assert.equal(validateFields(row).ok, true);
  }
});
