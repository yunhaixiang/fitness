const assert = require('node:assert/strict');
const test = require('node:test');

global.window = {};
const { schedule } = require('../assets/cooking-scheduler.js');

test('two pans can heat together while their active work is staggered', () => {
  const tasks = [
    { id: 'mushroom', group: 'small-wok', before: [] },
    { id: 'ground', group: 'large-wok', before: [] },
    { id: 'finish', group: 'finish', before: ['mushroom', 'ground'] }
  ];
  const result = schedule({ tasks, minutes: { mushroom: 7, ground: 7, finish: 1 },
    done: [], running: {}, ready: true, stirEvery: 3, now: 1000000 });
  assert.ok(result);
  assert.ok(result.starts.ground < result.ends.mushroom);
  assert.equal(result.starts.finish, Math.max(result.ends.mushroom, result.ends.ground));
  assert.equal(result.minutes, 12);
});

test('replanning reserves the next hands-on stir of an active pan', () => {
  const now = 1000000;
  const tasks = [
    { id: 'ground', group: 'large-wok', before: [] },
    { id: 'rice', group: 'rice', before: [] },
    { id: 'finish', group: 'finish', before: ['ground', 'rice'] }
  ];
  const result = schedule({ tasks, minutes: { ground: 15, rice: 50, finish: 1 },
    done: [], running: { ground: { startedAt: now - 180000, stirredAt: now - 180000, minutes: 15 } },
    ready: true, stirEvery: 3, now });
  assert.ok(result.starts.rice >= 1);
  assert.ok(result.starts.finish >= result.ends.rice);
});

test('the final egg stage reserves continuous attention', () => {
  const now = 1000000;
  const tasks = [
    { id: 'ground', group: 'large-wok', before: [] },
    { id: 'rice', group: 'rice', before: [] }
  ];
  const result = schedule({ tasks, minutes: { ground: 15, rice: 50 }, done: [],
    running: { ground: { startedAt: now - 720000, minutes: 15 } },
    ready: true, now });
  assert.ok(result.starts.rice >= 3);
});

test('completed prerequisites release the next task on replanning', () => {
  const tasks = [
    { id: 'oven-heat', group: 'oven', before: [] },
    { id: 'chicken', group: 'oven', before: ['oven-heat', 'ready'] }
  ];
  const result = schedule({ tasks, minutes: { 'oven-heat': 15, chicken: 27 },
    done: ['oven-heat'], running: {}, ready: true });
  assert.equal(result.starts.chicken, 0);
});
