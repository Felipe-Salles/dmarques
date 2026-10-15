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

test('litSteps(0, 4) = 0', () => {
  assert.equal(litSteps(0, 4), 0);
});

test('litSteps(0.01, 4) = 0', () => {
  assert.equal(litSteps(0.01, 4), 0);
});

test('litSteps(0.02, 4) = 1', () => {
  assert.equal(litSteps(0.02, 4), 1);
});

test('litSteps(0.26, 4) = 1', () => {
  assert.equal(litSteps(0.26, 4), 1);
});

test('litSteps(0.28, 4) = 2', () => {
  assert.equal(litSteps(0.28, 4), 2);
});

test('litSteps(0.53, 4) = 3', () => {
  assert.equal(litSteps(0.53, 4), 3);
});

test('litSteps(0.78, 4) = 4', () => {
  assert.equal(litSteps(0.78, 4), 4);
});

test('litSteps(0.999, 4) = 4', () => {
  assert.equal(litSteps(0.999, 4), 4);
});

test('litSteps(1.5, 4) = 4', () => {
  assert.equal(litSteps(1.5, 4), 4);
});

test('litSteps(0.01, 1) = 0', () => {
  assert.equal(litSteps(0.01, 1), 0);
});

test('litSteps(0.5, 1) = 1', () => {
  assert.equal(litSteps(0.5, 1), 1);
});
