import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function freshHandler(){delete require.cache[require.resolve('../api/satellites.js')];return require('../api/satellites.js');}
async function request(handler,method='GET'){
  const headers={};let text='';
  const response={setHeader:(k,v)=>headers[k]=v,end:v=>text=v||''};
  await handler({method},response);
  return {status:response.statusCode,headers,body:text?JSON.parse(text):null};
}
test('successful OMM catalogs are sampled and cached without dropping ISS',async t=>{
  let calls=0;
  t.mock.method(globalThis,'fetch',async()=>{calls++;return {status:200,json:async()=>Array.from({length:5001},(_,i)=>({EPOCH:'2026-09-16T00:00:00',MEAN_MOTION:15,NORAD_CAT_ID:i===4999?25544:i+50000}))};});
  const handler=freshHandler();
  const [a,b]=await Promise.all([request(handler),request(handler)]);
  assert.equal(a.body.status,'ok');assert.equal(a.body.records.length,4000);
  assert.ok(a.body.records.some(r=>r.NORAD_CAT_ID===25544));
  assert.equal(b.body.total,5001);assert.equal(calls,1);
  assert.match(a.headers['Cache-Control'],/s-maxage=7200/);
});
test('upstream 403 is visible and does not trigger another format or retry',async t=>{
  let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return {status:403};});
  const handler=freshHandler();const first=await request(handler);await request(handler);
  assert.equal(first.body.status,'unavailable');assert.match(first.body.message,/403/);assert.equal(calls,1);
});
test('malformed upstream JSON is an explicit unavailable state',async t=>{
  t.mock.method(globalThis,'fetch',async()=>({status:200,json:async()=>({error:'bad data'})}));
  assert.equal((await request(freshHandler())).body.status,'unavailable');
});
test('non-GET requests cannot fetch the provider',async t=>{
  t.mock.method(globalThis,'fetch',()=>{throw Error('must not fetch');});
  assert.equal((await request(freshHandler(),'POST')).status,405);
});
