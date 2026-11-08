const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { derive, toggle, readState } = require('../assets/cooking-progress');
const flow = fs.readFileSync(require.resolve('../assets/cooking-flow.js'), 'utf8');
const nodes = JSON.parse(flow.match(/const nodes = (\[[\s\S]*?\n  \]);/)[1]);
test('only the chosen half-week preparation is offered, and it unlocks appliance tasks', () => {
 assert.deepEqual(derive(nodes, [], 'first').available.map(n => n.id), ['cold-first']);
 assert.deepEqual(derive(nodes, [], 'second').available.map(n => n.id), ['cold-second']);
 const state = derive(nodes, ['cold-first']);
 assert.ok(state.available.some(n => n.id === 'oven-heat'));
 assert.ok(state.available.some(n => n.id === 'prep-rice'));
 assert.ok(!state.available.some(n => n.id === 'chicken'));
 assert.equal(derive(nodes, ['cold-first'], 'second').ready, false);
});
test('blocked tasks cannot be checked and independent tasks stay available', () => {
 assert.deepEqual(toggle(nodes, ['cold-first'], 'first', 'chicken', true), ['cold-first']);
 const done = ['cold-first', 'prep-chicken', 'oven-heat'];
 assert.ok(derive(nodes, done).available.some(n => n.id === 'chicken'));
 const after = toggle(nodes, done, 'first', 'chicken', true);
 assert.ok(derive(nodes, after).available.some(n => n.id === 'prep-rice'));
});
test('undoing prep clears downstream marks without clearing unrelated progress', () => {
 const done = ['cold-first','prep-rice','rice','prep-salmon','air-heat','salmon','haddock'];
 const after = toggle(nodes, done, 'first', 'prep-salmon', false);
 assert.deepEqual(after, ['cold-first','prep-rice','rice']);
});
test('hot air fryer takes priority and long rice chain comes before short vegetables', () => {
 assert.equal(derive(nodes,['cold-first','prep-salmon','air-heat']).recommended, 'salmon');
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
test('all tasks complete without counting the unused cold branch or computed ready gate', () => {
 const done = nodes.filter(n => !['cold-second','ready'].includes(n.id)).map(n => n.id);
 const state = derive(nodes,done);
 assert.equal(state.done.length,state.total); assert.equal(state.recommended,null);
 assert.equal(state.available.length,0);
});

test('started tasks allow parallel work but block their appliance until marked complete', () => {
 const done = ['cold-first','prep-salmon'];
 const view = derive(nodes,done,'first',['air-heat']);
 assert.ok(view.available.some(n=>n.id==='oven-heat'));
 assert.ok(!view.available.some(n=>n.id==='air-heat' || n.id==='salmon'));
 const after = toggle(nodes,done,'first','air-heat',true,['air-heat']);
 assert.equal(derive(nodes,after,'first',['air-heat']).recommended,'salmon');
 assert.deepEqual(derive(nodes,after,'first',['air-heat']).running,[]);
});
