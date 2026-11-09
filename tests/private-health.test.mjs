import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {measurement, tokenHash, saveSQL, readRecords} from '../cloudflare/measurements.mjs';
import ingest from '../cloudflare/ingest.mjs';
import viewer, {trackingHandler} from '../cloudflare/viewer.mjs';

const now = new Date('2026-11-09T20:00:00Z');
const sample = {weight_kg: 76.5, body_fat_percent: 31.2, measured_at: '2026-11-09T08:30:00-05:00', body_fat_measured_at: '2026-11-09T08:30:01-05:00'};
const owner = 'owner@example.com';
const ctx = email => ({access: {getIdentity: async () => ({email})}});
function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../cloudflare/migrations/0001_measurements.sql', import.meta.url), 'utf8'));
  return {sql, prepare(query) {
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
  for (const change of [{body_fat_percent: .312}, {weight_kg: NaN}, {weight_kg: true}, {weight_kg: ''}, {weight_kg: '76kg'}, {measured_at: '2026-11-09'}, {measured_at: '2030-01-01T00:00:00Z'}, {body_fat_measured_at: '2026-11-08T08:30:00-05:00'}]) {
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
  await put(db, {weight_kg: 77, measured_at: '2026-11-09T07:00:00-05:00', body_fat_measured_at: '2026-11-09T07:00:00-05:00'});
  assert.equal((await readRecords(db)).currentBody.weight, 76.5);
  await put(db, {weight_kg: 76, measured_at: '2026-11-09T09:00:00-05:00', body_fat_measured_at: '2026-11-09T09:00:00-05:00'});
  assert.equal((await readRecords(db)).currentBody.weight, 76);
});
test('backfilling preserves the newest current reading and keeps daily history', async () => {
  const db = database(); await put(db);
  await put(db, {weight_kg: 77, measured_at: '2026-11-08T08:30:00-05:00', body_fat_measured_at: '2026-11-08T08:30:00-05:00'});
  assert.equal(db.sql.prepare('SELECT count(*) n FROM measurements').get().n, 2);
  assert.equal((await readRecords(db)).currentBody.weight, 76.5);
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
  assert.equal(r.status, 200); assert.equal((await r.json()).currentBody.weight, 76.5);
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
  assert.equal((await ingest.fetch(upload(token, {...sample, body_fat_percent: .312}), e)).status, 400);
  assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM measurements').get().n, 0);
});
test('missing Access setup never fetches the public origin or exposes static content', async () => {
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
