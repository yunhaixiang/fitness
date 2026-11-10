// Synthetic fixtures; these are not the owner's measurements.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {measurement, tokenHash, saveSQL, readRecords, dailySteps} from '../cloudflare/measurements.mjs';
import ingest from '../cloudflare/ingest.mjs';
import viewer, {trackingHandler} from '../cloudflare/viewer.mjs';

const now = new Date('2026-11-09T20:00:00Z');
const sample = {weight_kg: 64.5, body_fat_percent: 24.6, measured_at: '2026-11-09T08:30:00-05:00', body_fat_measured_at: '2026-11-09T08:30:01-05:00'};
const owner = 'owner@example.com';
const ctx = email => ({access: {getIdentity: async () => ({email})}});
function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../cloudflare/migrations/0001_measurements.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../cloudflare/migrations/0002_daily_steps.sql', import.meta.url), 'utf8'));
  sql.exec(readFileSync(new URL('../cloudflare/migrations/0003_private_profile.sql', import.meta.url), 'utf8'));
  return {sql, async batch(statements) {
    sql.exec('BEGIN');
    try { const results = []; for (const statement of statements) results.push(await statement.run()); sql.exec('COMMIT'); return results; }
    catch (error) { sql.exec('ROLLBACK'); throw error; }
  }, prepare(query) {
    const statement = sql.prepare(query);
    const bound = args => ({
      first: async () => statement.get(...args) || null,
      all: async () => ({results: statement.all(...args)}),
      run: async () => ({meta: {changes: Number(statement.run(...args).changes)}}),
    });
    return {...bound([]), bind: (...args) => bound(args)};
  }};
}
function env() {return {DB: database(), OWNER_EMAIL: owner, VIEWER_EMAILS: `${owner},doctor@example.com`, INGEST_URL: 'https://ingest.example/measurements'};}
async function put(db, changes = {}) {
  const r = measurement({...sample, ...changes}, now);
  return db.prepare(saveSQL).bind(r.date, r.weight, r.bf, r.measuredAt, r.bodyFatMeasuredAt).run();
}
const upload = (token, body = {...sample, measured_at: '2020-01-01T08:30:00-05:00', body_fat_measured_at: '2020-01-01T08:30:00-05:00'}, headers = {}) => new Request('https://ingest.example/measurements', {method: 'POST', headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...headers}, body: JSON.stringify(body)});
const createToken = () => new Request('https://viewer.example/api/sync-token', {method: 'POST', headers: {Origin: 'https://viewer.example', 'X-Fitness-Action': 'create-sync-token'}});

test('unit validation rejects fractional percent, nonfinite values, missing values and bad timestamps', () => {
  for (const change of [{body_fat_percent: .246}, {weight_kg: NaN}, {weight_kg: true}, {weight_kg: ''}, {weight_kg: '64kg'}, {measured_at: '2026-11-09'}, {measured_at: '2030-01-01T00:00:00Z'}, {body_fat_measured_at: '2026-11-08T08:30:00-05:00'}]) {
    assert.throws(() => measurement({...sample, ...change}, now));
  }
});
test('dates follow the actual Toronto sample day, not UTC or upload day', () => {
  assert.equal(measurement({...sample, measured_at: '2026-11-09T01:30:00Z', body_fat_measured_at: '2026-11-09T01:30:00Z'}, now).date, '2026-11-08');
});
test('retries do not duplicate; older same-day samples do not replace newer ones', async () => {
  const db = database();
  await put(db); await put(db);
  assert.equal(db.sql.prepare('SELECT count(*) n FROM measurements').get().n, 1);
  await put(db, {weight_kg: 65, measured_at: '2026-11-09T07:00:00-05:00', body_fat_measured_at: '2026-11-09T07:00:00-05:00'});
  assert.equal((await readRecords(db)).currentBody.weight, 64.5);
  await put(db, {weight_kg: 64, measured_at: '2026-11-09T09:00:00-05:00', body_fat_measured_at: '2026-11-09T09:00:00-05:00'});
  assert.equal((await readRecords(db)).currentBody.weight, 64);
});
test('backfilling preserves the newest current reading and keeps daily history', async () => {
  const db = database(); await put(db);
  await put(db, {weight_kg: 65, measured_at: '2026-11-08T08:30:00-05:00', body_fat_measured_at: '2026-11-08T08:30:00-05:00'});
  assert.equal(db.sql.prepare('SELECT count(*) n FROM measurements').get().n, 2);
  assert.equal((await readRecords(db)).currentBody.weight, 64.5);
});
test('viewer fails closed without trusted Access context; spoofed email headers do not work', async () => {
  const e = env();
  for (const context of [{}, ctx('stranger@example.com')]) {
    const r = await viewer.fetch(new Request('https://viewer.example/api/records', {headers: {'Cf-Access-Authenticated-User-Email': owner}}), e, context);
    assert.equal(r.status, 403);
  }
  assert.equal((await viewer.fetch(new Request('https://viewer.example/api/records'), {...e, VIEWER_EMAILS: ''}, ctx(owner))).status, 403);
});
test('whitelisted viewer can read records but cannot issue upload credentials', async () => {
  const e = env(); await put(e.DB);
  const r = await viewer.fetch(new Request('https://viewer.example/api/records'), e, ctx('doctor@example.com'));
  assert.equal(r.status, 200); assert.equal((await r.json()).currentBody.weight, 64.5);
  assert.equal(r.headers.get('Cache-Control'), 'private, no-store');
  assert.equal((await viewer.fetch(createToken(), e, ctx('doctor@example.com'))).status, 403);
});
test('owner token generation requires same-origin request and returns only a write credential', async () => {
  const e = env();
  const bad = new Request('https://viewer.example/api/sync-token', {method: 'POST', headers: {Origin: 'https://evil.example', 'X-Fitness-Action': 'create-sync-token'}});
  assert.equal((await viewer.fetch(bad, e, ctx(owner))).status, 403);
  const r = await viewer.fetch(createToken(), e, ctx(owner)); assert.equal(r.status, 200);
  const {token} = await r.json(); assert.equal(token.length, 43);
  assert.equal(e.DB.sql.prepare('SELECT token_hash FROM sync_tokens').get().token_hash, await tokenHash(token));
  assert.notEqual(e.DB.sql.prepare('SELECT token_hash FROM sync_tokens').get().token_hash, token);
  assert.equal((await ingest.fetch(upload(token), e)).status, 200);
  assert.equal((await ingest.fetch(new Request('https://ingest.example/measurements', {headers: {Authorization: `Bearer ${token}`}}), e)).status, 405);
  assert.equal((await viewer.fetch(new Request('https://viewer.example/api/records', {headers: {Authorization: `Bearer ${token}`}}), e, {})).status, 403);
  await viewer.fetch(createToken(), e, ctx(owner));
  assert.equal((await ingest.fetch(upload(token), e)).status, 401);
});
test('upload requires a valid token and bounded JSON; invalid requests leave database unchanged', async () => {
  const e = env(); const {token} = await (await viewer.fetch(createToken(), e, ctx(owner))).json();
  assert.equal((await ingest.fetch(upload('x'.repeat(43)), e)).status, 401);
  assert.equal((await ingest.fetch(upload(token, sample, {'Content-Type': 'text/plain'}), e)).status, 415);
  assert.equal((await ingest.fetch(upload(token, {...sample, extra: 'x'.repeat(3000)}), e)).status, 413);
  assert.equal((await ingest.fetch(upload(token, {...sample, body_fat_percent: .246}), e)).status, 400);
  assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM measurements').get().n, 0);
});
test('missing Access setup never exposes static content', async () => {
  const r = await viewer.fetch(new Request('https://viewer.example/fitness/'), env(), {});
  assert.equal(r.status, 403);
});

test('private HTML replaces body data, preserves cheat meals and escapes script delimiters', () => {
  const privateRecords = {body: [{weight: 75}], currentBody: {weight: 75}, cheatMeals: []};
  const handler = trackingHandler(privateRecords);
  let finish, result, removals = 0;
  handler.element({onEndTag(fn) {finish = fn;}});
  const original = JSON.stringify({body: [{weight: 90}], currentBody: {weight: 90}, cheatMeals: [{note: '</script><script>bad</script>'}]});
  for (const text of [original.slice(0, 20), original.slice(20)]) handler.text({text, remove() {removals++;}});
  finish({before(text) {result = text;}});
  assert.equal(removals, 2);
  assert.equal(result.includes('</script>'), false);
  assert.equal(JSON.parse(result).currentBody.weight, 75);
  assert.equal(JSON.parse(result).cheatMeals[0].note, '</script><script>bad</script>');
});

test('optional steps reject incomplete, fractional, invalid or future totals', () => {
  assert.equal(dailySteps(sample, now), null);
  const steps = {steps_count: 0, steps_date: '2026-11-08', steps_collected_at: '2026-11-09T08:35:00-05:00'};
  assert.equal(dailySteps(steps, now).steps, 0);
  for (const change of [{steps_count: -1}, {steps_count: 2.5}, {steps_count: true}, {steps_count: ''}, {steps_date:'2026-02-30'}, {steps_date:'2026-11-10'}, {steps_collected_at:'2026-11-09'}, {steps_collected_at:'2030-01-01T00:00:00Z'}]) assert.throws(() => dailySteps({...steps,...change},now));
  assert.throws(() => dailySteps({steps_count: 10},now));
});
test('one upload saves independent daily steps, retries never add totals and stale snapshots cannot overwrite', async () => {
  const e = env(); const {token} = await (await viewer.fetch(createToken(), e, ctx(owner))).json();
  const body = {...sample, measured_at:'2020-01-02T08:30:00-05:00', body_fat_measured_at:'2020-01-02T08:30:00-05:00', steps_count:8000, steps_date:'2020-01-01', steps_collected_at:'2020-01-02T08:35:00-05:00'};
  const response = await ingest.fetch(upload(token,body),e);
  assert.equal(response.status,200); assert.equal((await response.json()).steps_saved,true);
  assert.equal((await (await ingest.fetch(upload(token,body),e)).json()).steps_saved,false);
  await ingest.fetch(upload(token,{...body,steps_count:2000,steps_collected_at:'2020-01-02T08:00:00-05:00'}),e);
  assert.equal(e.DB.sql.prepare('SELECT steps FROM daily_steps').get().steps,8000);
  await ingest.fetch(upload(token,{...body,steps_count:7500,steps_collected_at:'2020-01-02T09:00:00-05:00'}),e);
  assert.equal(e.DB.sql.prepare('SELECT steps FROM daily_steps').get().steps,7500);
  assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM daily_steps').get().n,1);
  const invalid = await ingest.fetch(upload(token,{...body,weight_kg:90,steps_count:-1}),e);
  assert.equal(invalid.status,400);
  assert.equal(e.DB.sql.prepare('SELECT weight FROM measurements').get().weight,64.5);
});
test('private records include step history while unauthenticated readers remain blocked', async () => {
  const e = env(); const date = new Date().toISOString().slice(0,10);
  e.DB.sql.prepare('INSERT INTO daily_steps VALUES (?, ?, ?)').run(date,4321,new Date().toISOString());
  const records = await readRecords(e.DB);
  assert.equal(records.steps[0].steps,4321);
  assert.equal((await viewer.fetch(new Request('https://viewer.example/api/records'),e,{})).status,403);
});


test('private asset service is never fetched before authorization', async () => {
  let calls = 0;
  const e = {...env(), ASSETS: {async fetch(request) {
    calls++;
    assert.equal(new URL(request.url).pathname, '/fitness/assets/site.css');
    return new Response('body{}', {headers: {'Content-Type': 'text/css', ETag: 'static-tag'}});
  }}};
  const req = new Request('https://viewer.example/fitness/assets/site.css');
  assert.equal((await viewer.fetch(req,e,{})).status,403);
  assert.equal((await viewer.fetch(req,e,ctx('stranger@example.com'))).status,403);
  assert.equal(calls,0);
  const result = await viewer.fetch(req,e,ctx(owner));
  assert.equal(result.status,200);
  assert.equal(await result.text(),'body{}');
  assert.equal(result.headers.get('Cache-Control'),'private, no-store');
  assert.equal(result.headers.get('ETag'),null);
  assert.equal(calls,1);
});
test('asset redirects stay on the private site; missing binding fails closed', async () => {
  const req = new Request('https://viewer.example/fitness/diet');
  const e = {...env(), ASSETS: {async fetch() {return new Response(null,{status:307,headers:{Location:'/fitness/diet/'}});}}};
  const response = await viewer.fetch(req,e,ctx(owner));
  assert.equal(response.status,307);
  assert.equal(response.headers.get('Location'),'https://viewer.example/fitness/diet/');
  e.ASSETS.fetch = async () => new Response(null,{status:302,headers:{Location:'https://elsewhere.example/fitness/'}});
  assert.equal((await viewer.fetch(req,e,ctx(owner))).status,502);
  assert.equal((await viewer.fetch(req,env(),ctx(owner))).status,503);
});
test('deployment always runs authenticated Worker before serving assets', () => {
  const config = JSON.parse(readFileSync(new URL('../cloudflare/wrangler.viewer.jsonc',import.meta.url),'utf8'));
  // Assets on the entry Worker strip ctx.access behind Cloudflare's internal router.
  assert.equal(config.assets,undefined);
  assert.deepEqual(config.services,[{binding:'ASSETS',service:'fitness-assets'}]);
  const assets = JSON.parse(readFileSync(new URL('../cloudflare/wrangler.assets.jsonc',import.meta.url),'utf8'));
  assert.equal(assets.workers_dev,false);
  assert.equal(assets.preview_urls,false);
  assert.equal(assets.routes,undefined);
  assert.equal(config.preview_urls,false);
  assert.equal(assets.assets.directory,'../_site');
  assert.equal(readFileSync(new URL('../cloudflare/viewer.mjs',import.meta.url),'utf8').includes('github.io'),false);
});

test('profile is database-only and shares the authenticated records boundary', async () => {
  const e = env();
  assert.deepEqual((await readRecords(e.DB)).profile, {});
  e.DB.sql.exec('INSERT INTO private_profile (id, height_cm) VALUES (1, 182)');
  const request = () => new Request('https://viewer.example/api/records');
  assert.equal((await viewer.fetch(request(), e, {})).status, 403);
  assert.equal((await viewer.fetch(request(), e, ctx('stranger@example.com'))).status, 403);
  const response = await viewer.fetch(request(), e, ctx(owner));
  assert.deepEqual((await response.json()).profile, {heightCm:182});
});
