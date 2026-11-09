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
test('progress survives serialization, halves are independent, and damaged storage is safe', () => {
 const state = readState(JSON.stringify({half:'second',first:['cold-first','prep-rice'],second:['cold-second']}));
 assert.equal(state.half,'second'); assert.equal(state.first.length,2); assert.equal(state.second.length,1);
 state.second=[]; assert.equal(state.first.length,2);
 assert.deepEqual(readState('{broken'),{half:'first',first:[],second:[],firstRunning:[],secondRunning:[]});
 assert.deepEqual(readState('{"first":[{},null,5,"rice"]}').first,['rice']);
});
test('all current tasks can complete', () => {
 const done = nodes.map(n => n.id);
 const state = derive(nodes,done);
 assert.equal(state.done.length,state.total); assert.equal(state.recommended,null);
 assert.equal(state.available.length,0);
});

test('started tasks allow parallel work but block their appliance until marked complete', () => {
 const done = ['cold-first','prep-salmon','air-heat-start'];
 const view = derive(nodes,done,'first',['air-heat']);
 assert.ok(view.available.some(n=>n.id==='oven-heat-start'));
 assert.ok(!view.available.some(n=>n.id==='air-heat' || n.id==='salmon'));
 const after = toggle(nodes,done,'first','air-heat',true,['air-heat']);
 assert.equal(derive(nodes,after,'first',['air-heat']).recommended,'salmon');
 assert.deepEqual(derive(nodes,after,'first',['air-heat']).running,[]);
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
 assert.ok(derive(nodes,state.first).done.includes('chicken'));
});
