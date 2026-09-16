import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceSimulationTime } from '../public/simulation.mjs';

test('pausing preserves the current orbital phase', () => {
  assert.equal(advanceSimulationTime(123.45, 1 / 60, 0), 123.45);
});

test('changing speed advances from the current phase without a reset', () => {
  const before = 123.45;
  const after = advanceSimulationTime(before, 1 / 60, 4);
  assert.ok(Math.abs(after - before - 1 / 60) < 1e-10);
});

test('simulation speed is consistent at 30, 60, and 144 frames per second', () => {
  for (const fps of [30, 60, 144]) {
    let time = 0;
    for (let frame = 0; frame < fps; frame++) {
      time = advanceSimulationTime(time, 1 / fps, 1);
    }
    assert.ok(Math.abs(time - 0.25) < 1e-10);
  }
});

test('a suspended tab does not advance by the entire inactive duration', () => {
  assert.equal(advanceSimulationTime(1, 120, 1), 1.0125);
  assert.equal(advanceSimulationTime(1, -1, 1), 1);
});
