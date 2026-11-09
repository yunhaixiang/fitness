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
