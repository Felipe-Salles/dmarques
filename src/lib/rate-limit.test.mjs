import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMemoryLimiters, createRateGate, hashIp, RATE } from './rate-limit.ts';

function fake(name, calls, outcome) {
  return {
    async limit(id) {
      calls.push([name, id]);
      if (outcome instanceof Error) throw outcome;
      return outcome;
    },
  };
}

const OK = { success: true, reset: 0 };

test('RATE expoe as constantes de D-11', () => {
  assert.equal(RATE.ipMax, 3);
  assert.equal(RATE.ipWindow, '10 m');
  assert.equal(RATE.hourMax, 20);
  assert.equal(RATE.hourWindow, '1 h');
  assert.equal(RATE.dayMax, 50);
  assert.equal(RATE.dayWindow, '1 d');
});

test('hashIp e deterministico, curto e nao contem o IP', () => {
  const a = hashIp('203.0.113.7', 's1');
  assert.equal(a, hashIp('203.0.113.7', 's1'));
  assert.equal(a.length, 22);
  assert.match(a, /^[A-Za-z0-9_-]{22}$/);
  assert.equal(a.includes('203.0.113.7'), false);
  assert.notEqual(a, hashIp('203.0.113.7', 's2'));
});

test('hashIp agrupa IPv6 no mesmo /64', () => {
  assert.equal(hashIp('2001:db8:1:2:aaaa::1', 's'), hashIp('2001:db8:1:2:bbbb::9', 's'));
  assert.notEqual(hashIp('2001:db8:1:3:aaaa::1', 's'), hashIp('2001:db8:1:2:aaaa::1', 's'));
});

test('hashIp aceita IP ausente', () => {
  assert.equal(hashIp(undefined, 's'), hashIp(undefined, 's'));
});

test('gate libera na ordem ip, hora, dia com identificadores corretos', async () => {
  const calls = [];
  const gate = createRateGate(
    { ip: fake('ip', calls, OK), hour: fake('hour', calls, OK), day: fake('day', calls, OK) },
    'salt',
  );
  assert.deepEqual(await gate('203.0.113.7'), { kind: 'ok' });
  assert.deepEqual(
    calls.map((c) => c[0]),
    ['ip', 'hour', 'day'],
  );
  assert.equal(calls[0][1], hashIp('203.0.113.7', 'salt'));
  assert.notEqual(calls[0][1], '203.0.113.7');
  assert.equal(calls[1][1], 'global');
  assert.equal(calls[2][1], 'global');
});

test('ip bloqueado curto-circuita e calcula retryAfter', async () => {
  const calls = [];
  const gate = createRateGate(
    {
      ip: fake('ip', calls, { success: false, reset: 1030000 }),
      hour: fake('hour', calls, OK),
      day: fake('day', calls, OK),
    },
    'salt',
    () => 1000000,
  );
  assert.deepEqual(await gate('203.0.113.7'), { kind: 'limited', retryAfter: 30 });
  assert.deepEqual(
    calls.map((c) => c[0]),
    ['ip'],
  );
});

test('hora bloqueada nao chama dia', async () => {
  const calls = [];
  const gate = createRateGate(
    {
      ip: fake('ip', calls, OK),
      hour: fake('hour', calls, { success: false, reset: 5000 }),
      day: fake('day', calls, OK),
    },
    'salt',
    () => 0,
  );
  const r = await gate('203.0.113.7');
  assert.equal(r.kind, 'limited');
  assert.deepEqual(
    calls.map((c) => c[0]),
    ['ip', 'hour'],
  );
});

test('dia bloqueado devolve limited', async () => {
  const calls = [];
  const gate = createRateGate(
    {
      ip: fake('ip', calls, OK),
      hour: fake('hour', calls, OK),
      day: fake('day', calls, { success: false, reset: 9000 }),
    },
    'salt',
    () => 0,
  );
  assert.deepEqual(await gate('203.0.113.7'), { kind: 'limited', retryAfter: 9 });
});

test('timeout do Redis falha fechado', async () => {
  const calls = [];
  const gate = createRateGate(
    {
      ip: fake('ip', calls, { success: true, reset: 0, reason: 'timeout' }),
      hour: fake('hour', calls, OK),
      day: fake('day', calls, OK),
    },
    'salt',
  );
  assert.deepEqual(await gate('203.0.113.7'), { kind: 'error' });
});

test('excecao do limitador falha fechado', async () => {
  const gate = createRateGate(
    {
      ip: fake('ip', [], new Error('redis fora')),
      hour: fake('hour', [], OK),
      day: fake('day', [], OK),
    },
    'salt',
  );
  assert.deepEqual(await gate('203.0.113.7'), { kind: 'error' });
});

test('retryAfter minimo e 1', async () => {
  const gate = createRateGate(
    {
      ip: fake('ip', [], { success: false, reset: 100 }),
      hour: fake('hour', [], OK),
      day: fake('day', [], OK),
    },
    'salt',
    () => 99999,
  );
  assert.deepEqual(await gate('203.0.113.7'), { kind: 'limited', retryAfter: 1 });
});

test('limitadores em memoria bloqueiam a quarta chamada', async () => {
  const { ip } = createMemoryLimiters();
  const results = [];
  for (let i = 0; i < 4; i++) results.push((await ip.limit('abc')).success);
  assert.deepEqual(results, [true, true, true, false]);
  assert.equal((await ip.limit('outro')).success, true);
});
