import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOmm, epochTime, historicalDemo, satellitePosition } from '../public/satellite-data.mjs';
// Published satellite.js OMM example, tested at its epoch, not at today's date.
const omm = { OBJECT_NAME:'HELIOS 2A', OBJECT_ID:'2004-049A', EPOCH:'2025-03-26T05:19:34.116960', MEAN_MOTION:15.00555103, ECCENTRICITY:0.000583, INCLINATION:98.3164, RA_OF_ASC_NODE:103.8411, ARG_OF_PERICENTER:20.5667, MEAN_ANOMALY:339.5789, EPHEMERIS_TYPE:0, CLASSIFICATION_TYPE:'U', NORAD_CAT_ID:28492, ELEMENT_SET_NO:999, REV_AT_EPOCH:8655, BSTAR:0.00048021, MEAN_MOTION_DOT:0.00005995, MEAN_MOTION_DDOT:0 };
const now = Date.parse('2025-03-26T05:19:34.116Z');

test('CelesTrak OMM fields produce a valid orbit without TLE_LINE fields', () => {
  const entries = parseOmm([omm], now);
  assert.equal(entries.length, 1);
  const p = satellitePosition(entries[0], now, 1);
  assert.ok(p && Math.hypot(p.x,p.y,p.z) > 1 && Math.hypot(p.x,p.y,p.z) < 1.3);
});
test('OMM timestamps without a zone are interpreted as UTC', () => {
  assert.equal(epochTime(omm.EPOCH), now);
});
test('stale and malformed records cannot become current markers', () => {
  assert.equal(parseOmm([omm], now + 8*86400000).length,0);
  assert.equal(parseOmm([{}, {...omm, ECCENTRICITY:2}, {...omm, BSTAR:null}, omm], now).length,1);
  assert.equal(satellitePosition(parseOmm([omm],now)[0], now+8*86400000,1),null);
});
test('six-digit catalog identifiers work without legacy TLE conversion', () => {
  assert.equal(parseOmm([{...omm,NORAD_CAT_ID:100001}],now).length,1);
});
test('historical demo propagates at sample epochs, never silently at present time', () => {
  const entries=historicalDemo();
  assert.equal(entries.length,3);
  for(const entry of entries){
    assert.ok(satellitePosition(entry,Date.parse('2026-09-16'),1,0));
    assert.equal(satellitePosition(entry,Date.parse('2026-09-16'),1),null);
  }
});
test('failed propagation returns no marker', () => {
  assert.equal(satellitePosition({epoch:now,record:{}},now,1),null);
});
