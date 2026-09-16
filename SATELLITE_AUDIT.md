# Earth satellite audit — September 16, 2026

## Confirmed failures in the previous implementation

1. **Wrong API schema.** CelesTrak's `FORMAT=json` response contains OMM fields (`EPOCH`, `MEAN_MOTION`, etc.), not `TLE_LINE1` and `TLE_LINE2`. The old filter discarded successful JSON responses and needlessly requested TLE data next.
2. **Silent historical fallback.** On failure, the app used three March 2024 element sets without telling the user. It propagated those old elements at the current date; failed/decayed or implausible results could leave no visible markers.
3. **Incorrect reference frame.** Satellite points were children of Earth's tilted, decoratively spinning mesh. Inertial orbital positions consequently inherited an extra artificial daily rotation. The old Y-up mapping also reflected an axis instead of preserving handedness.
4. **Poor visibility and no guidance.** Enabling the checkbox did not focus Earth or show loading, count, epoch, error, or fallback status. Tiny markers were hard to see from the solar-system overview.
5. **Stale geometry on failure.** Failed propagation could leave a previous position in the buffer. Dynamic geometry did not explicitly update culling bounds.
6. **Unnecessary traffic.** Every page visit fetched the catalog before the layer was enabled, with sequential alternate-format requests after failures and no application cache.

A direct request to the active JSON feed during the audit returned HTTP 403. This is an upstream availability/access issue in addition to the application bugs. No repeated direct requests or alternate-format retries were made after that response. A successful app deployment alone must not be reported as proof that upstream live data is available.

## Implemented repair

- Pinned and vendored satellite.js 6.0.1 (MIT license included); use its OMM parser directly. Six-digit catalog identifiers do not require conversion to legacy TLE format.
- Added the fixed-source `/api/satellites` Vercel function. The browser requests its own origin. Success and failure envelopes are cached for two hours; concurrent requests within an instance are coalesced. There are no automatic fallback-format requests after errors.
- Return a catalog-wide sample of up to 4,000 records, retaining ISS when present, to limit browser work and response size. This is a sample, not a complete catalog visualization.
- Load only when enabled. Validate orbital elements and reject records more than seven days from the propagation time. Show epoch dates, plotted count, and upstream errors.
- Focus Earth when enabling satellites, and provide a View Earth button. Render enlarged, constant-pixel markers; invalid entries are omitted using the geometry draw range.
- Move the satellite frame with Earth every animation frame, but keep its equatorial tilt independent of the planet's decorative spin. Use right-handed `(x, z, -y)` coordinates.
- If live data is unavailable, render no current markers. The user may explicitly choose the historical demo: ISS, Hubble, and NOAA 15 are each propagated from their own March 2024 element epoch. It is clearly labeled and is not a synchronized historical sky reconstruction.
- The live layer uses wall-clock time independently of solar-system speed controls. The Earth surface map/rotation remains illustrative; do not use the scene to infer accurate overhead passes or ground tracks.

## Validation

`node --test tests/*.test.mjs` passes 16 tests, including actual OMM propagation, stale/malformed record rejection, six-digit IDs, historical epochs, failure exclusion, successful API sampling/cache, explicit HTTP 403 handling without retries, malformed responses, and method restrictions. Existing simulation/camera tests also pass.

Offline browser checks verify automatic Earth focus, a visible unavailable state, and the opt-in historical demo reporting three propagated markers, without console warnings or errors. Production feed availability must be checked after deployment.

## Sources and maintenance

- [CelesTrak GP formats](https://celestrak.org/NORAD/documentation/gp-data-formats.php): JSON uses OMM fields.
- [CelesTrak usage policy](https://celestrak.org/usage-policy.php): GP updates every two hours; stop and report non-200 responses.
- [satellite.js](https://github.com/shashwatak/satellite-js): OMM/TLE parsing and SGP4 propagation.
- Vendored module: `public/vendor/satellite-6.0.1.mjs`, fetched from the pinned jsDelivr package distribution. SHA-256: `988753903B9390DEF631093EAEC7E1143CC2C15D546F42C3CB1E3FC9BADEA90E`.

Run `node scripts/serve.mjs --offline` for local UI tests without contacting CelesTrak. Omit `--offline` to use the real cached gateway. The gateway's in-memory cache is instance-local; CDN caching reduces shared traffic but is not a globally durable ingestion store. For a larger audience, use a scheduled ingestion job and durable shared snapshot instead of on-demand upstream requests. The API takes no caller-supplied upstream URL or credentials.
