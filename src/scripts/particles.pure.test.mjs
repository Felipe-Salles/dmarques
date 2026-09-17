import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computePointCount, shouldReduceParticles } from './particles.pure.ts';

test('computePointCount piso: 100x100 clamps to 28', () => {
  assert.equal(computePointCount(100, 100), 28);
});

test('computePointCount teto: 4000x4000 clamps to 90', () => {
  assert.equal(computePointCount(4000, 4000), 90);
});

test('computePointCount faixa central', () => {
  assert.equal(computePointCount(1200, 500), 55);
  assert.equal(computePointCount(800, 600), 44);
});

test('computePointCount fronteira exata do piso: 700x440', () => {
  assert.equal(computePointCount(700, 440), 28);
});

test('computePointCount fronteira exata do teto: 1100x900', () => {
  assert.equal(computePointCount(1100, 900), 90);
});

test('shouldReduceParticles linha de base sem gatilho', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 1440,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: 8,
      saveData: false,
    }),
    false,
  );
});

test('shouldReduceParticles viewport pequena isolada', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 500,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: 8,
      saveData: false,
    }),
    true,
  );
});

test('shouldReduceParticles fronteira do viewport: 860 nao dispara', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 860,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: 8,
      saveData: false,
    }),
    false,
  );
});

test('shouldReduceParticles poucos nucleos isolado', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 1440,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: 4,
      saveData: false,
    }),
    true,
  );
});

test('shouldReduceParticles nucleos suficientes', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 1440,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: 5,
      saveData: false,
    }),
    false,
  );
});

test('shouldReduceParticles nucleos ausentes', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 1440,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: undefined,
      saveData: false,
    }),
    false,
  );
});

test('shouldReduceParticles data-saver isolado', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 1440,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: 8,
      saveData: true,
    }),
    true,
  );
});

test('shouldReduceParticles data-saver ausente', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 1440,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: 8,
      saveData: undefined,
    }),
    false,
  );
});

test('shouldReduceParticles tres gatilhos combinados', () => {
  assert.equal(
    shouldReduceParticles({
      viewportWidth: 390,
      smallViewportBreakpoint: 860,
      hardwareConcurrency: 2,
      saveData: true,
    }),
    true,
  );
});
