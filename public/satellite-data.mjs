import { json2satrec, twoline2satrec, propagate } from './vendor/satellite-6.0.1.mjs';

export const EARTH_RADIUS_KM = 6371;
export const MAX_AGE_MS = 7 * 86400000;

export function epochTime(epoch) {
  if (typeof epoch !== 'string') return NaN;
  return Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(epoch) ? epoch : epoch + 'Z');
}

export function parseOmm(data, now = Date.now()) {
  if (!Array.isArray(data)) throw new Error('Expected an OMM array');
  const entries = [];
  for (const row of data) {
    const epoch = epochTime(row?.EPOCH);
    const fields = ['MEAN_MOTION', 'ECCENTRICITY', 'INCLINATION', 'RA_OF_ASC_NODE', 'ARG_OF_PERICENTER', 'MEAN_ANOMALY', 'BSTAR', 'MEAN_MOTION_DOT', 'MEAN_MOTION_DDOT'];
    if (!Number.isFinite(epoch) || Math.abs(now - epoch) > MAX_AGE_MS ||
        !fields.every(key => row[key] !== null && row[key] !== '' && Number.isFinite(Number(row[key]))) ||
        Number(row.MEAN_MOTION) <= 0 || Number(row.ECCENTRICITY) < 0 || Number(row.ECCENTRICITY) >= 1) continue;
    try {
      const record = json2satrec(row);
      if (record.error || !Number.isFinite(record.jdsatepoch)) continue;
      entries.push({ name: row.OBJECT_NAME || String(row.NORAD_CAT_ID), epoch, record });
    } catch { /* An invalid record must not discard the rest of the catalog. */ }
  }
  return entries;
}

// Preserve the original app's samples only as an explicitly requested historical
// demonstration, propagated at their own epochs, never as current tracking data.
export function historicalDemo() {
  const samples = [
    ['ISS (ZARYA)', '1 25544U 98067A   24068.51243056  .00016717  00000+0  30058-3 0  9997', '2 25544  51.6411 328.9123 0004821  44.8856  81.6048 15.50083316442077'],
    ['Hubble', '1 20580U 90037B   24069.18363889  .00000835  00000+0  34765-4 0  9991', '2 20580  28.4692 241.9508 0002835 351.7538   8.3094 15.09218887414325'],
    ['NOAA 15', '1 25338U 98030A   24069.54847222  .00000068  00000+0  62082-4 0  9992', '2 25338  98.7399  68.1140 0011207  93.9260 266.3159 14.25903459353893'],
  ];
  return samples.map(([name, line1, line2]) => {
    const record = twoline2satrec(line1, line2);
    return { name, record, epoch: (record.jdsatepoch - 2440587.5) * 86400000 };
  });
}

export function satellitePosition(entry, now, radius, demoElapsed = null) {
  if (demoElapsed === null && Math.abs(now - entry.epoch) > MAX_AGE_MS) return null;
  const date = new Date(demoElapsed === null ? now : entry.epoch + demoElapsed);
  try {
    const p = propagate(entry.record, date)?.position;
    if (!p || ![p.x, p.y, p.z].every(Number.isFinite)) return null;
    const altitude = Math.hypot(p.x, p.y, p.z) - EARTH_RADIUS_KM;
    if (altitude < 160 || altitude > 60000) return null;
    const scale = radius / EARTH_RADIUS_KM;
    // Right-handed equatorial ECI -> Y-up display basis; fixed tilt is applied
    // by the scene's independent satellite frame, not Earth's animated mesh.
    return { x: p.x * scale, y: p.z * scale, z: -p.y * scale };
  } catch { return null; }
}
