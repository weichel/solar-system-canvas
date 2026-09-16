// Move with the body before easing the relative viewing offset. Easing the
// world-space target instead leaves fast-moving planets outside the frame.
export function stepFocusCamera(camera, previousBody, body, flightOffset, delta) {
  const blend = 1 - Math.exp(-5 * delta);
  const position = {};
  for (const axis of ['x', 'y', 'z']) {
    const offset = camera[axis] - previousBody[axis];
    position[axis] = body[axis] + (flightOffset
      ? offset + (flightOffset[axis] - offset) * blend
      : offset);
  }
  return { position, target: { x: body.x, y: body.y, z: body.z } };
}
