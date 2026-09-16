// Clamp long frames so returning to a suspended tab does not jump the orbits.
export function advanceSimulationTime(time, deltaSeconds, speed) {
  return time + Math.min(Math.max(deltaSeconds, 0), 0.05) * speed * 0.25;
}
