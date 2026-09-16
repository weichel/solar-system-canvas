import test from 'node:test';
import assert from 'node:assert/strict';
import { stepFocusCamera } from '../public/focus-camera.mjs';

test('moving planets remain the exact aim point throughout the approach', () => {
  let camera = { x: 0, y: 850, z: 2100 };
  let previousBody = { x: 100, y: 0, z: 0 };
  const flightOffset = { x: -4, y: 2, z: 0 };
  for (let frame = 0; frame < 240; frame++) {
    const body = { x: 100 * Math.cos(frame / 10), y: 0, z: 100 * Math.sin(frame / 10) };
    const result = stepFocusCamera(camera, previousBody, body, flightOffset, 1 / 60);
    assert.deepEqual(result.target, body);
    camera = result.position;
    previousBody = body;
  }
  assert.ok(Math.hypot(camera.x - previousBody.x + 4, camera.y - 2, camera.z - previousBody.z) < 0.01);
});

test('manual zoom offset is preserved while following a moving body', () => {
  const result = stepFocusCamera(
    { x: 10, y: 5, z: 20 }, { x: 10, y: 0, z: 0 },
    { x: 12, y: 1, z: -3 }, null, 1 / 60,
  );
  assert.deepEqual(result.position, { x: 12, y: 6, z: 17 });
  assert.deepEqual(result.target, { x: 12, y: 1, z: -3 });
});
