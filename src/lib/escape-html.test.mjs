import assert from 'node:assert/strict';
import { test } from 'node:test';
import { escapeHtml } from './escape-html.ts';

test('escapeHtml escapa os cinco caracteres', () => {
  assert.equal(
    escapeHtml('<b>"x" & \'y\'</b>'),
    '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;',
  );
});

test('escapeHtml nao escapa duas vezes e preserva texto comum', () => {
  assert.equal(escapeHtml('&lt;'), '&amp;lt;');
  assert.equal(escapeHtml('Olá, mundo'), 'Olá, mundo');
  assert.equal(escapeHtml(''), '');
});
