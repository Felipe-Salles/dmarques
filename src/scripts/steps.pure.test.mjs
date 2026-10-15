import assert from 'node:assert/strict';
import { test } from 'node:test';
import { litSteps, stepProgress } from './steps.pure.ts';

test('stepProgress inicio: 850/1000 e 0', () => {
  assert.equal(stepProgress(850, 1000), 0);
});

test('stepProgress fim: 300/1000 e 1', () => {
  assert.equal(stepProgress(300, 1000), 1);
});

test('stepProgress meio: 575/1000 e 0.5', () => {
  assert.ok(Math.abs(stepProgress(575, 1000) - 0.5) < 1e-9);
});

test('stepProgress abaixo da viewport clampa em 0', () => {
  assert.equal(stepProgress(1200, 1000), 0);
});

test('stepProgress acima da viewport clampa em 1', () => {
  assert.equal(stepProgress(-500, 1000), 1);
});

test('stepProgress viewport zero retorna 1', () => {
  assert.equal(stepProgress(100, 0), 1);
});

test('litSteps zero', () => {
  assert.equal(litSteps(0, 4), 0);
});

test('litSteps primeiro passo', () => {
  assert.equal(litSteps(0.01, 4), 1);
});

test('litSteps logo antes da fronteira', () => {
  assert.equal(litSteps(0.333, 4), 1);
});

test('litSteps logo apos a fronteira', () => {
  assert.equal(litSteps(0.334, 4), 2);
});

test('litSteps dois terços', () => {
  assert.equal(litSteps(2 / 3, 4), 3);
});

test('litSteps completo', () => {
  assert.equal(litSteps(1, 4), 4);
});

test('litSteps acima de 1 clampa em n', () => {
  assert.equal(litSteps(1.5, 4), 4);
});

test('litSteps etapa unica', () => {
  assert.equal(litSteps(0.5, 1), 1);
});
