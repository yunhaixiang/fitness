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
 assert.deepEqual(after, ['prep-rice','rice']);
});
test('hot air fryer takes priority and long rice chain comes before short vegetables', () => {
 assert.equal(derive(nodes,['cold-first','prep-salmon','air-heat-start','air-heat']).recommended, 'salmon');
 const ready = derive(nodes,['cold-first','prep-rice']).available.map(n=>n.id);
 assert.ok(ready.indexOf('rice') < ready.indexOf('mushroom'));
});
test('legacy progress keeps the selected batch without merging two sessions', () => {
 const state = readState(JSON.stringify({half:'second',first:['prep-rice'],second:['prep-salmon'],secondRunning:['air-heat']}));
 assert.deepEqual(state,{version:3,done:['prep-salmon']});
 assert.deepEqual(readState(JSON.stringify(state)),state);
 assert.deepEqual(readState('{broken'),{version:3,done:[]});
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
 assert.deepEqual(state,{version:3,done:['prep-salmon','air-heat-start']});
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
 const partial = ['prep-chicken','oven-heat-start','oven-heat','chicken','egg-water','eggs'];
 const available = derive(nodes,partial).available.map(n=>n.id);
 assert.ok(available.includes('wrap'));
 assert.ok(available.includes('peas-carrots'));
 assert.ok(!available.includes('refrigerate'));
 const foodDone = nodes.filter(n=>!['peas-carrots','refrigerate','clean'].includes(n.id)).map(n=>n.id);
 assert.ok(!derive(nodes,foodDone).available.some(n=>n.id==='refrigerate'));
 const plated = toggle(nodes,foodDone,'first','peas-carrots',true);
 assert.deepEqual(derive(nodes,plated).available.map(n=>n.id),['refrigerate']);
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
