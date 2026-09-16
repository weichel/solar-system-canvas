// Fixed-source, same-origin gateway: no user-provided URLs and no credentials.
// Cache for the provider's two-hour GP update interval; never retry on failure.
const SOURCE = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=JSON';
const TTL = 2 * 60 * 60 * 1000;
let cached = null;
let pending = null;

async function getCatalog() {
  if (cached && Date.now() - cached.at < TTL) return cached.body;
  if (pending) return pending;
  pending = (async () => {
    let body;
    try {
      const response = await fetch(SOURCE, { signal: AbortSignal.timeout(12000), redirect: 'error' });
      if (response.status !== 200) throw new Error(`Provider returned HTTP ${response.status}`);
      const records = await response.json();
      if (!Array.isArray(records) || !records.some(row => row?.EPOCH && row?.MEAN_MOTION)) {
        throw new Error('Provider returned an unexpected data format');
      }
      const sample = records.length <= 4000 ? records : Array.from({length:4000},(_,i)=>records[Math.floor(i*records.length/4000)]);
      const iss=records.find(row=>Number(row.NORAD_CAT_ID)===25544);
      if(iss && !sample.some(row=>Number(row.NORAD_CAT_ID)===25544))sample[sample.length-1]=iss;
      body = { status: 'ok', source: 'CelesTrak active catalog (OMM)', fetchedAt: new Date().toISOString(), total:records.length, records:sample };
    } catch (error) {
      const message = /^Provider returned/.test(error.message) ? error.message : 'Provider request failed or timed out';
      body = { status: 'unavailable', source: 'CelesTrak', message, records: [], fetchedAt: new Date().toISOString() };
    }
    cached = { at: Date.now(), body };
    return body;
  })();
  try { return await pending; } finally { pending = null; }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.statusCode = 405;
    return res.end();
  }
  const body = await getCatalog();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=7200');
  // HTTP 200 describes a valid gateway response; body.status explicitly reports
  // upstream availability, including cached failures to prevent retry storms.
  res.statusCode = 200;
  res.end(JSON.stringify(body));
};
