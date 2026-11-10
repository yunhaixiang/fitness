// Synthetic fixtures; these are not the owner's measurements.
const test = require('node:test');
const assert = require('node:assert/strict');
const { resolve } = require('../assets/body-metrics.js');

test('undated current measurements work without inventing a dated record', () => {
  const current = { weight: 64.5, bf: 24.6 };
  assert.deepEqual(resolve(current), current);
  assert.deepEqual(resolve(), { weight: null, bf: null });
  assert.deepEqual(current, { weight: 64.5, bf: 24.6 });
});
test('latest valid weight and body fat are selected independently', () => {
  const records = [
    {date:'2026-11-06', weight:65, bf:26},
    {date:'2026-11-08', weight:64.5, bf:''},
    {date:'2026-11-09', weight:null, bf:200}
  ];
  assert.deepEqual(resolve({}, records), {weight:64.5, bf:26});
  assert.equal(records[0].date, '2026-11-06');
});
test('repository corrections override duplicate legacy IDs and newer legacy dates still display', () => {
  const published = [{id:'one',date:'2026-11-06',weight:64.5,bf:24.6}];
  const legacy = [{id:'one',date:'2026-11-06',weight:99,bf:50}, {id:'two',date:'2026-11-07',weight:64.4}];
  assert.deepEqual(resolve({}, published, legacy), {weight:64.4,bf:24.6});
  assert.equal(legacy[0].weight, 99);
});

test('shared current measurements take precedence over stale browser history', () => {
  const current = {weight:64.5, bf:24.6};
  const old = [{date:'2026-11-08',weight:67,bf:22}];
  assert.deepEqual(resolve(current, [], old), current);
  assert.deepEqual(resolve(current, [], []), current);
  assert.deepEqual(resolve({weight:64.5}, [], old), {weight:64.5,bf:22});
});


test('public pages leave health records blank even with old browser measurements', () => {
  const fs = require('node:fs');
  const vm = require('node:vm');
  const published = require('../_data/tracking_records.json');
  assert.deepEqual(published.body, []);
  assert.deepEqual(published.steps, []);
  assert.deepEqual(published.currentBody, {});
  const nodes = ['weight','bf'].map(key=>({dataset:{bodyValue:key},textContent:''}));
  const context = {window:{},localStorage:{getItem:()=>JSON.stringify({body:[{date:'2099-01-01',weight:90,bf:30}]})},document:{getElementById:()=>({textContent:JSON.stringify(published)}),querySelectorAll:()=>nodes}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../assets/body-metrics.js'),'utf8'),context);
  assert.deepEqual(nodes.map(node=>node.textContent),['—','—']);
});

test('strength uses private current weight without a personal fallback or legacy storage', () => {
  const fs = require('node:fs');
  const source = fs.readFileSync(require.resolve('../assets/strength-volume.js'),'utf8');
  const layout = fs.readFileSync(require.resolve('../_layouts/default.html'),'utf8');
  assert.ok(source.includes('window.fitnessBodyMetrics'));
  assert.ok(!source.includes('localStorage'));
  assert.ok(source.includes(': NaN'));
  assert.ok(source.includes("Number.isFinite(value)"));
  assert.ok(layout.indexOf('/assets/body-metrics.js') < layout.indexOf('/assets/strength-volume.js'));
  assert.ok(!Object.hasOwn(require('../_data/cardio_plans.json'), 'weightKg'));
});
