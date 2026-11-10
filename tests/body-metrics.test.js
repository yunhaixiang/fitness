const test = require('node:test');
const assert = require('node:assert/strict');
const { resolve } = require('../assets/body-metrics.js');

test('undated current measurements work without inventing a dated record', () => {
  const current = { weight: 76.5, bf: 31.2 };
  assert.deepEqual(resolve(current), current);
  assert.deepEqual(resolve(), { weight: null, bf: null });
  assert.deepEqual(current, { weight: 76.5, bf: 31.2 });
});
test('latest valid weight and body fat are selected independently', () => {
  const records = [
    {date:'2026-11-06', weight:77, bf:32},
    {date:'2026-11-08', weight:76.5, bf:''},
    {date:'2026-11-09', weight:null, bf:200}
  ];
  assert.deepEqual(resolve({}, records), {weight:76.5, bf:32});
  assert.equal(records[0].date, '2026-11-06');
});
test('repository corrections override duplicate legacy IDs and newer legacy dates still display', () => {
  const published = [{id:'one',date:'2026-11-06',weight:76.5,bf:31.2}];
  const legacy = [{id:'one',date:'2026-11-06',weight:99,bf:50}, {id:'two',date:'2026-11-07',weight:76.4}];
  assert.deepEqual(resolve({}, published, legacy), {weight:76.4,bf:31.2});
  assert.equal(legacy[0].weight, 99);
});

test('shared current measurements take precedence over stale browser history', () => {
  const current = {weight:76.5, bf:31.2};
  const old = [{date:'2026-11-08',weight:79,bf:21}];
  assert.deepEqual(resolve(current, [], old), current);
  assert.deepEqual(resolve(current, [], []), current);
  assert.deepEqual(resolve({weight:76.5}, [], old), {weight:76.5,bf:21});
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
