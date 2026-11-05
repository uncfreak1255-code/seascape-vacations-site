const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOwnerLeadContact } = require('../../netlify/functions/_owner-lead-contacts');
const { OWNER_LEAD_FORM_NAME, OWNER_LEAD_STORE_NAME } = require('../../netlify/functions/_owner-lead-metrics');
const { HEADERS, planImport } = require('../owner-intelligence/mapping');
const { COMMERCIAL_HEADERS, trackerHeaders } = require('../owner-intelligence/schema');
const { readSource, batchForPlan, applyPlan } = require('../owner-intelligence/sync');
const { now, contact, reviews, policy, fakeProvider } = require('./owner-intelligence-test-provider');
const fields = { referrer: '', utm_source: '', utm_medium: '', utm_campaign: '' };
const capture = data => buildOwnerLeadContact({ form_name: OWNER_LEAD_FORM_NAME, id: 'synthetic-1',
  created_at: contact().createdAt, data: {name:'Synthetic Owner',email:'owner@example.invalid',property_address:'Synthetic Property A',...data} });
const sourceFor = async (f, touch, blobTouch) => {
  const provider = async (url, options) => {
    const r = await f.fetchImpl(url, options); const data = await r.json();
    if (url.includes('/forms/synthetic-form/submissions') && data.length) Object.assign(data[0].data, touch);
    return {ok:true,json:async()=>data};
  };
  const storeFactory = ({name}) => ({get:async()=>name===OWNER_LEAD_STORE_NAME ? {receipts:[]} :
    blobTouch ? {totalContacts:1,contacts:[contact({firstTouch:blobTouch})]} : null});
  return {source:await readSource(f.env,provider,storeFactory),provider,storeFactory};
};

test('original first touch survives contact capture; absent and explicitly blank touches stay distinct', () => {
  assert.deepEqual(capture({...fields,referrer:'https://www.google.com/search?q=private',utm_source:'Google',utm_medium:'Organic',utm_campaign:'owner-review'}).firstTouch,
    {...fields,referrer:'www.google.com',utm_source:'google',utm_medium:'organic',utm_campaign:'owner-review'});
  assert.equal(Object.hasOwn(capture({}), 'firstTouch'), false);
  assert.deepEqual(capture(fields).firstTouch, fields);
});

test('attribution keeps only safe host and bounded non-contact campaign tokens', () => {
  for (const referrer of ['javascript:alert(1)','https://secret:password@google.com/','https://seascape-vacations.com/owner?email=private','https://www.seascape-vacations.com/path'])
    assert.equal(capture({...fields,referrer}).firstTouch.referrer,'');
  for (const bad of ['owner@example.invalid','%6fwner%40example.invalid','+1 (941) 555-0123','=IMPORTDATA("private")','x'.repeat(101),{source:'google'},'google\nprivate'])
    assert.equal(capture({...fields,utm_source:bad}).firstTouch.utm_source,'');
  assert.deepEqual(capture({...fields,referrer:'https://www.perplexity.ai/path?email=owner@example.invalid#private'}).firstTouch,
    {...fields,referrer:'www.perplexity.ai'});
});

test('only supported original origins populate Came from; form, delivery and generic referrals cannot supply it', () => {
  const cases = [
    [{referrer:'www.google.com'},'Google'],[{utm_source:'google',utm_medium:'cpc'},'Google'],
    [{referrer:'https://chatgpt.com/?private=discard'},'AI answer'],[{utm_source:'perplexity'},'AI answer'],
    [{referrer:'claude.ai'},'AI answer'],[{referrer:'google.com.evil.invalid'},''],
    [{utm_source:'google.evil'},''],[{utm_source:'newsletter',referrer:'google.com'},''],
    [{utm_source:'google',referrer:'perplexity.ai'},''],[{utm_source:'gretter',utm_medium:'referral'},''],
    [{utm_source:'website form'},''],[{referrer:'outlook.office.com'},''],[{},'']
  ];
  for (const [touch,expected] of cases) {
    const c=capture({...fields,...touch});
    const rows=[[...HEADERS,'Came from']];
    const plan=planImport({contacts:[c],rows,reviews,now});
    assert.equal(plan.append[0].at(-1),expected,JSON.stringify(touch));
  }
});

test('a rejected nonempty original source cannot fall back to a recognized referrer', () => {
  for(const bad of ['website form','partner/newsletter','owner@example.invalid','google\nprivate',{source:'google'}]) {
    const c=capture({...fields,referrer:'www.google.com',utm_source:bad});
    const p=planImport({contacts:[c],rows:[[...HEADERS,'Came from']],reviews,now});
    assert.equal(p.append[0].at(-1),'');
    assert.equal(c.firstTouch.sourceRejected,true);
    assert.equal(c.firstTouch.utm_source,'');
  }
});

test('original Forms including a blank first touch override later blob attribution; source hash tracks changes',async()=>{
  const f=fakeProvider();
  const blank=await sourceFor(f,fields,{...fields,utm_source:'google'});
  assert.deepEqual(blank.source.contacts[0].firstTouch,fields);
  const google=await sourceFor(f,{...fields,utm_source:'google'});
  assert.notEqual(blank.source.sourceHash,google.source.sourceHash);
  assert.deepEqual(google.source.contacts[0].firstTouch,{...fields,utm_source:'google'});
});

test('six accepted layouts preserve dispositions/operator cells through source, full readback and replay',async()=>{
  for(const base of [HEADERS.slice(0,16),HEADERS,[...HEADERS,...COMMERCIAL_HEADERS]]) for(const sourceColumn of [false,true]) {
    const headers=sourceColumn?[...base,'Came from']:base.slice();
    const existing=Array(headers.length).fill('');existing[0]='synthetic-declined';existing[8]='Declined';existing[10]='Preserve dated follow-up';existing[15]='2026-08-08';
    if(sourceColumn)existing[headers.length-1]='Gretter referral';
    const f=fakeProvider({initialRows:[headers,existing]});
    const {source,provider,storeFactory}=await sourceFor(f,{...fields,referrer:'www.google.com'});
    const before=structuredClone(f.data.rows);
    const p=planImport({contacts:source.contacts,rows:f.data.rows,reviews,now});
    assert.equal(p.append[0][8],'Intake incomplete');
    if(sourceColumn) assert.equal(p.append[0].at(-1),'Google');
    const tracker={rows:before,sheet:{sheetId:1,gridProperties:{rowCount:1000}}};
    const requests=batchForPlan(p,tracker);assert.equal(requests.at(-1).updateCells.range.startRowIndex,2);
    assert.equal((await applyPlan({plan:p,tracker,source,policy,env:f.env,now,fetchImpl:provider,storeFactory})).imported,1);
    assert.deepEqual(f.data.rows[0],trackerHeaders(headers));assert.deepEqual(f.data.rows[1],existing);
    const replay=planImport({contacts:source.contacts,rows:f.data.rows,reviews,now});
    assert.equal(replay.append.length,0);assert.equal(replay.alreadyImported,1);assert.equal(f.data.writes,1);
  }
});

test('changed original attribution after preview invalidates the batch before writing',async()=>{
  const f=fakeProvider();const old=await sourceFor(f,fields);const changed=await sourceFor(f,{...fields,utm_source:'google'});
  const p=planImport({contacts:old.source.contacts,rows:f.data.rows,reviews,now});
  await assert.rejects(applyPlan({plan:p,tracker:{rows:structuredClone(f.data.rows)},source:old.source,policy,env:f.env,now,
    fetchImpl:changed.provider,storeFactory:changed.storeFactory}),/changed_repreview/);
  assert.equal(f.data.writes,0);
});
