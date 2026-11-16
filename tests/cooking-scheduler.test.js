const assert = require('node:assert/strict');
const test = require('node:test');

global.window = {};
const { schedule, attentionOffsets } = require('../assets/cooking-scheduler.js');

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
  assert.equal(result.minutes, 9);
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

test('ground chicken without an egg stage leaves gaps between stirs', () => {
  const now = 1000000;
  const tasks = [
    { id: 'ground', group: 'large-wok', before: [] },
    { id: 'rice', group: 'rice', before: [] }
  ];
  const result = schedule({ tasks, minutes: { ground: 15, rice: 50 }, done: [],
    running: { ground: { startedAt: now - 720000, minutes: 15 } },
    ready: true, now });
  assert.ok(result.starts.rice < 3);
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

test('hands-on seasoning fits inside oven preheat', () => {
  const tasks = [
    { id: 'oven-heat', group: 'oven', before: [] },
    { id: 'prep-oven', group: 'prep', before: [] },
    { id: 'chicken', group: 'oven', before: ['oven-heat', 'prep-oven'] }
  ];
  const result = schedule({ tasks, minutes: { 'oven-heat': 15, 'prep-oven': 10, chicken: 27 },
    done: [], running: {}, ready: true });
  assert.ok(result);
  assert.ok(result.starts['prep-oven'] < result.ends['oven-heat']);
  assert.equal(result.starts.chicken, Math.max(result.ends['oven-heat'], result.ends['prep-oven']));
  assert.deepEqual(attentionOffsets(tasks[1], 3, 3), [0, 1, 2]);
});

test('boiling has no predicted duration and releases the pot only when confirmed', () => {
  const tasks = [
    { id: 'egg-water', group: 'pots', before: [], manual: true },
    { id: 'prep-pots', group: 'prep', before: [] },
    { id: 'eggs', group: 'pots', before: ['egg-water', 'prep-pots'] },
    { id: 'rice', group: 'rice', before: [] }
  ];
  const minutes = { 'prep-pots': 2, eggs: 8, rice: 50 };
  const waiting = schedule({ tasks, minutes, done: [],
    running: { 'egg-water': { startedAt: Date.now() - 120000 } }, ready: true });
  assert.ok(waiting);
  assert.equal(waiting.partial, true);
  assert.equal(waiting.starts.eggs, undefined);
  assert.ok(Number.isFinite(waiting.starts.rice));

  const boiled = schedule({ tasks, minutes, done: ['egg-water'], running: {}, ready: true });
  assert.equal(boiled.partial, false);
  assert.ok(Number.isFinite(boiled.starts.eggs));
  assert.ok(boiled.starts.eggs >= boiled.ends['prep-pots']);
});

test('air fryer preheats after salmon prep and cooking starts without a cooling gap', () => {
  const tasks = [
    { id: 'prep-salmon', group: 'prep', before: [] },
    { id: 'air-heat', group: 'air', before: ['prep-salmon'] },
    { id: 'salmon', group: 'air', before: ['prep-salmon', 'air-heat'] },
    { id: 'ground', group: 'large-wok', before: [] }
  ];
  const now = 1000000;
  for (const running of [{}, { ground: { startedAt: now, minutes: 15 } }]) {
    const result = schedule({ tasks, minutes: { 'prep-salmon': 4, 'air-heat': 4, salmon: 8, ground: 15 },
      done: [], running, ready: true, now });
    assert.ok(result);
    assert.ok(result.starts['air-heat'] >= result.ends['prep-salmon']);
    assert.equal(result.starts.salmon, result.ends['air-heat']);
    if (running.ground) assert.ok(result.starts.salmon < 11 || result.starts.salmon >= 15);
  }
});

test('split preparation unlocks loading only for its own food', () => {
 const fs=require('node:fs');const {derive}=require('../assets/cooking-progress');
 const nodes=JSON.parse(fs.readFileSync(require.resolve('../assets/cooking-flow.js'),'utf8').match(/const nodes = (\[[\s\S]*?\n  \]);/)[1]);
 const view=derive(nodes,['oven-heat-start','oven-heat','prep-chicken']);
 assert.ok(view.available.some(n=>n.id==='chicken-start'));
 assert.ok(!view.available.some(n=>['chicken','potato-start','ribs-start'].includes(n.id)));
});

test('active preparation occupies the cook until finished', () => {
  const now = 1000000;
  const tasks = [
    { id: 'prep-chicken', group: 'prep', before: [] },
    { id: 'rice', group: 'rice', before: [] }
  ];
  const result = schedule({ tasks, minutes: { 'prep-chicken': 4, rice: 50 }, done: [],
    running: { 'prep-chicken': { startedAt: now, minutes: 4 } }, ready: true, now });
  assert.ok(result.starts.rice >= 4);
});

test('saved grouped preparation expands without clearing cooking progress', () => {
  const fs = require('node:fs'), vm = require('node:vm');
  const flow = fs.readFileSync(require.resolve('../assets/cooking-flow.js'), 'utf8');
  const guide = fs.readFileSync(require.resolve('../assets/cooking-guide.js'), 'utf8');
  const nodes = vm.runInNewContext(flow.match(/const nodes = (\[[\s\S]*?\n  \]);/)[1]);
  const saved = { version: 2, selected: 'first', batches: { first: { ready: true,
    done: ['prep-oven', 'prep-pots', 'prep-veg', 'prep-ground', 'oven-heat'],
    running: { chicken: { startedAt: 1000000, minutes: 27 } } } } };
  const context = { document: { getElementById: () => ({}) },
    window: { fitnessCookingFlow: { nodes } },
    localStorage: { getItem: () => JSON.stringify(saved) } };
  vm.runInNewContext(guide.split('  let state = readState();')[0] + 'window.result = readState();})();', context);
  const result = context.window.result;
  assert.equal(result.version, 3);
  assert.ok(result.batches.first.done.includes('prep-chicken'));
  assert.ok(result.batches.first.done.includes('prep-potato'));
  assert.ok(!result.batches.first.done.includes('prep-beaten-eggs'));
  assert.ok(result.batches.first.done.includes('prep-peas-carrots'));
  assert.ok(!result.batches.first.done.includes('prep-oven'));
  assert.equal(result.batches.first.running.chicken.startedAt, 1000000);
});


test('refrigeration waits for food and cleanup runs last', () => {
  const fs = require('node:fs'), vm = require('node:vm');
  const flow = fs.readFileSync(require.resolve('../assets/cooking-flow.js'), 'utf8');
  const nodes = vm.runInNewContext(flow.match(/const nodes = (\[[\s\S]*?\n  \]);/)[1]);
  const minutes = Object.fromEntries(nodes.map(n => [n.id, n.minutes]));
  const tasks = nodes.filter(n => n.manual || Object.hasOwn(minutes, n.id));
  assert.equal(nodes.find(n => n.id === 'fish-start').before[0], 'air-heat');
  const done = tasks.filter(t => !['shrimp', 'ribs', 'fish', 'refrigerate', 'clean'].includes(t.id)).map(t => t.id);
  const result = schedule({ tasks, minutes, done, running: {}, ready: true });
  assert.ok(result);
  assert.ok(result.starts.refrigerate >= result.ends.shrimp);
  assert.ok(result.starts.refrigerate >= result.ends.ribs);
  assert.ok(result.starts.refrigerate >= result.ends.fish);
  assert.equal(nodes.find(n=>n.id==='clean').before[0], 'refrigerate');
  assert.ok(result.starts.clean >= result.ends.refrigerate);
  assert.equal(nodes.find(n=>n.id==='eggs').resource, 'pot-1');
  assert.equal(nodes.find(n=>n.id==='dumplings').resource, 'pot-2');
  assert.equal(nodes.find(n=>n.id==='pasta').resource, 'pot-1');
  assert.ok(!nodes.some(n=>n.id==='noodles'));
});


test('preheating can lead directly to haddock while salmon is still unprepared', () => {
 const tasks = [
   {id:'prep-salmon',group:'prep',before:[]},
   {id:'air-heat',group:'air',before:[]},
   {id:'salmon',group:'air',before:['air-heat','prep-salmon']},
   {id:'haddock',group:'air',before:['air-heat']}
 ];
 const now=1000000;
 const result=schedule({tasks,minutes:{'prep-salmon':10,'air-heat':4,salmon:8,haddock:20},
 done:[],running:{'air-heat':{startedAt:now,minutes:4}},ready:true,now});
 assert.ok(result);
 assert.equal(result.starts.haddock,4);
 assert.ok(result.starts.salmon>=result.ends.haddock);
});
