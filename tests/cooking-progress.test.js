const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { derive, toggle, readState } = require('../assets/cooking-progress');
const flow = fs.readFileSync(require.resolve('../assets/cooking-flow.js'), 'utf8');
const nodes = JSON.parse(flow.match(/const nodes = (\[[\s\S]*?\n  \]);/)[1]);
test('both batches start with preparation and heating, without a thawing gate', () => {
 const first = derive(nodes, [], 'first');
 const second = derive(nodes, [], 'second');
 assert.deepEqual(first.available.map(n => n.id), second.available.map(n => n.id));
 assert.ok(first.available.some(n => n.id === 'oven-heat-start'));
 assert.ok(first.available.some(n => n.id === 'prep-rice'));
 assert.ok(!first.available.some(n => n.id === 'chicken'));
 assert.ok(!nodes.some(n => ['ready','cold-first','cold-second'].includes(n.id)));
});
test('old freeze and thaw marks are ignored without losing real cooking progress', () => {
 const state = derive(nodes, ['cold-first','cold-second','prep-rice','rice']);
 assert.deepEqual(state.done, ['prep-rice','rice']);
});
test('blocked tasks cannot be checked and independent tasks stay available', () => {
 assert.deepEqual(toggle(nodes, [], 'first', 'chicken', true), []);
 const done = ['prep-chicken', 'oven-heat-start', 'oven-heat'];
 assert.ok(derive(nodes, done).available.some(n => n.id === 'chicken'));
 const after = toggle(nodes, done, 'first', 'chicken', true);
 assert.ok(derive(nodes, after).available.some(n => n.id === 'prep-rice'));
});
test('undoing prep clears downstream marks without clearing unrelated progress', () => {
 const done = ['cold-first','prep-rice','rice','prep-salmon','air-heat-start','air-heat','salmon','haddock'];
 const after = toggle(nodes, done, 'first', 'prep-salmon', false);
 assert.deepEqual(after, ['prep-rice','rice','air-heat-start','air-heat','haddock']);
});
test('hot air fryer takes priority and long rice chain comes before short vegetables', () => {
 assert.equal(derive(nodes,['cold-first','prep-salmon','air-heat-start','air-heat']).recommended, 'salmon');
 const ready = derive(nodes,['cold-first','prep-rice']).available.map(n=>n.id);
 assert.ok(ready.indexOf('rice') < ready.indexOf('mushroom'));
});
test('legacy progress keeps the selected batch without merging two sessions', () => {
 const state = readState(JSON.stringify({half:'second',first:['prep-rice'],second:['prep-salmon'],secondRunning:['air-heat']}));
 assert.deepEqual(state,{version:4,done:['prep-salmon']});
 assert.deepEqual(readState(JSON.stringify(state)),state);
 assert.deepEqual(readState('{broken'),{version:4,done:[]});
 assert.deepEqual(readState('{"first":[{},null,5,"rice"]}').done,['rice']);
 assert.deepEqual(readState(JSON.stringify({version:2,done:[],running:[],first:['rice']})).done,[]);
});
test('all current tasks can complete', () => {
 const done = nodes.map(n => n.id);
 const state = derive(nodes,done);
 assert.equal(state.done.length,state.total); assert.equal(state.recommended,null);
 assert.equal(state.available.length,0);
});

test('legacy running state never marks work complete or blocks ready tasks', () => {
 const state = readState(JSON.stringify({version:2,done:['prep-salmon','air-heat-start'],running:['air-heat']}));
 assert.deepEqual(state,{version:4,done:['prep-salmon','air-heat-start']});
 const view = derive(nodes,state.done);
 assert.ok(view.available.some(n=>n.id==='air-heat'));
 assert.ok(view.available.some(n=>n.id==='oven-heat-start'));
 assert.ok(!view.available.some(n=>n.id==='salmon'));
 const done = toggle(nodes,state.done,'first','air-heat',true);
 assert.equal(derive(nodes,done).recommended,'salmon');
 assert.deepEqual(readState(JSON.stringify({version:3,done})).done,done);
});

for (const [kind, prep, food] of [['oven', 'prep-chicken', 'chicken'], ['air', 'prep-salmon', 'salmon']]) {
 test(`${kind}: starting preheat leaves preparation available and requires separate confirmation`, () => {
  let done = [prep];
  done = toggle(nodes, done, 'first', `${kind}-heat-start`, true);
  const heating = derive(nodes, done);
  assert.ok(heating.available.some(n => n.id === `${kind}-heat`));
  assert.ok(heating.available.some(n => n.id === 'prep-potato'));
  assert.ok(!heating.available.some(n => n.id === food));
  assert.notEqual(heating.recommended, `${kind}-heat`);
  done = toggle(nodes, done, 'first', `${kind}-heat`, true);
  assert.ok(derive(nodes, done).available.some(n => n.id === food));
  const undone = toggle(nodes, done, 'first', `${kind}-heat-start`, false);
  assert.ok(!undone.includes(`${kind}-heat`));
 });
}
test('saved preheat completion survives the split into two steps', () => {
 const state = readState(JSON.stringify({first:['cold-first','oven-heat','prep-chicken','chicken'],second:[]}));
 assert.ok(derive(nodes,state.done).done.includes('chicken'));
});


test('finish tasks can assemble food early, but refrigeration waits for every meal', () => {
 const partial = ['prep-wrap','peel-eggs','prep-bread','prep-chicken','oven-heat-start','oven-heat','chicken','egg-water','eggs'];
 const available = derive(nodes,partial).available.map(n=>n.id);
 assert.ok(available.includes('wrap'));
 assert.ok(available.includes('peas-carrots'));
 assert.ok(!available.includes('refrigerate'));
 const foodDone = nodes.filter(n=>!['peas-carrots','refrigerate','clean'].includes(n.id)).map(n=>n.id);
 assert.ok(!derive(nodes,foodDone).available.some(n=>n.id==='refrigerate'));
 const plated = toggle(nodes,foodDone,'first','peas-carrots',true);
 assert.deepEqual(new Set(derive(nodes,plated).available.map(n=>n.id)),new Set(['refrigerate']));
 const chilled = toggle(nodes,plated,'first','refrigerate',true);
 assert.deepEqual(derive(nodes,chilled).available.map(n=>n.id),['clean']);
});
test('splitting finish preserves completed meals and migrates completed cleanup', () => {
 const oldDone = nodes.filter(n=>!['peas-carrots','refrigerate','clean'].includes(n.id)).map(n=>n.id);
 const migrated = readState(JSON.stringify({version:3,done:[...oldDone,'finish']}));
 assert.equal(derive(nodes,migrated.done).done.length,nodes.length);
 const partial = readState(JSON.stringify({version:3,done:['prep-rice','rice']}));
 assert.deepEqual(derive(nodes,partial.done).done,['prep-rice','rice']);
});


test('bread can be laid out immediately while assembly waits for cooked food', () => {
 assert.ok(derive(nodes,[]).available.some(n=>n.id==='prep-bread'));
 const prepared = toggle(nodes,[],'first','prep-bread',true);
 assert.ok(prepared.includes('prep-bread'));
 assert.ok(!derive(nodes,prepared).available.some(n=>['wrap','sandwich'].includes(n.id)));
 const cooked = ['prep-chicken','oven-heat-start','oven-heat','chicken','egg-water','eggs'];
 assert.ok(!derive(nodes,cooked).available.some(n=>n.id==='wrap'));
 assert.ok(derive(nodes,[...cooked,'prep-bread','prep-wrap','peel-eggs']).available.some(n=>n.id==='wrap'));
 const migrated = readState(JSON.stringify({version:3,done:[...cooked,'wrap']}));
 assert.ok(derive(nodes,migrated.done).done.includes('wrap'));
 assert.ok(migrated.done.includes('prep-bread'));
});


test('preparation is independent and both assemblies unlock without waiting for each other', () => {
 const initial = derive(nodes,[]).available.map(n=>n.id);
 for (const id of ['prep-zucchini','prep-noodle-sauce']) assert.ok(initial.includes(id));
 const bread = toggle(nodes,[],'first','prep-bread',true);
 for (const id of ['prep-wrap','prep-sandwich']) assert.ok(derive(nodes,bread).available.some(n=>n.id===id));
 const ready = ['prep-bread','prep-wrap','prep-sandwich','prep-chicken','oven-heat-start','oven-heat','chicken','egg-water','eggs','peel-eggs'];
 for (const id of ['wrap','sandwich']) assert.ok(derive(nodes,ready).available.some(n=>n.id===id));
 const withSandwich = toggle(nodes,ready,'first','sandwich',true);
 assert.ok(withSandwich.includes('sandwich'));
 assert.ok(!withSandwich.includes('wrap'));
});
test('lifting eggs releases the pot while peeling stays separate across reloads', () => {
 const done = ['egg-water','eggs'];
 const available = derive(nodes,done).available.map(n=>n.id);
 assert.ok(available.includes('dumplings'));
 assert.ok(available.includes('peel-eggs'));
 const current = readState(JSON.stringify({version:4,done}));
 assert.ok(!current.done.includes('peel-eggs'));
 const old = readState(JSON.stringify({version:3,done}));
 assert.ok(old.done.includes('peel-eggs'));
 const beforeSplit = nodes.filter(n=>!['prep-wrap','prep-sandwich','prep-zucchini','prep-noodle-sauce','peel-eggs'].includes(n.id)).map(n=>n.id);
 assert.equal(derive(nodes,readState(JSON.stringify({version:3,done:beforeSplit})).done).done.length,nodes.length);
});


test('optional cooking order never gates ready tasks or clears independent progress', () => {
 const initial = derive(nodes,[]).available.map(n=>n.id);
 assert.ok(initial.includes('air-heat-start'));
 assert.ok(initial.includes('curry'));
 assert.ok(derive(nodes,['prep-zucchini']).available.some(n=>n.id==='ground'));
 assert.ok(derive(nodes,['prep-zucchini','ground']).available.some(n=>n.id==='spinach'));
 const hot = ['air-heat-start','air-heat'];
 assert.ok(derive(nodes,hot).available.some(n=>n.id==='haddock'));
 assert.ok(!derive(nodes,hot).available.some(n=>n.id==='salmon'));
 const firstFish = toggle(nodes,hot,'first','haddock',true);
 assert.ok(firstFish.includes('haddock'));
 assert.ok(derive(nodes,[...firstFish,'prep-salmon']).available.some(n=>n.id==='salmon'));
 const water = ['pasta-water'];
 for (const id of ['pasta','noodles']) assert.ok(derive(nodes,water).available.some(n=>n.id===id));
 const noodlesFirst = toggle(nodes,water,'first','noodles',true);
 assert.ok(derive(nodes,[...noodlesFirst,'prep-noodle-sauce']).available.some(n=>n.id==='season-noodles'));
 assert.ok(derive(nodes,noodlesFirst).available.some(n=>n.id==='pasta'));
 const all = nodes.map(n=>n.id);
 for (const [undo,keep] of [['salmon','haddock'],['pasta','noodles'],['mushroom','curry'],['curry','season-noodles'],['spinach','ground']]) {
   const after = toggle(nodes,all,'first',undo,false);
   assert.ok(after.includes(keep), `${undo} must not invalidate ${keep}`);
 }
 assert.ok(!initial.includes('refrigerate'));
});
