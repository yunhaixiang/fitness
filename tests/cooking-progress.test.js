const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { derive, toggle, readState } = require('../assets/cooking-progress');
const flow = fs.readFileSync(require.resolve('../assets/cooking-flow.js'), 'utf8');
const current = JSON.parse(flow.match(/const nodes = (\[[\s\S]*?\n  \]);/)[1]);
const historical = require('../assets/meal-plans/plan-2/cooking-definition').nodes;
function complete(nodes, saved, id) {
 const done = toggle(nodes,saved,'first',id,true);
 assert.ok(done.includes(id), `${id} should be available`);
 return done;
}
function prerequisites(nodes,id) {
 const byId=new Map(nodes.map(n=>[n.id,n])); const out=new Set();
 function visit(key){for(const dep of byId.get(key).before){visit(dep);out.add(dep);}}
 visit(id); return [...out];
}
for(const [plan,nodes] of [['current',current],['historical',historical]]) {
 test(`${plan}: water heating, boiling confirmation, loading and removal are independent checkpoints`,()=>{
  const loading='eggs-start';
  let done=complete(nodes,[],'egg-water-start');
  let view=derive(nodes,done);
  assert.ok(view.available.some(n=>n.id==='egg-water'));
  assert.ok(view.available.some(n=>n.id==='prep-rice'));
  assert.ok(!view.available.some(n=>n.id===loading));
  assert.notEqual(view.recommended,'egg-water');
  done=complete(nodes,done,'egg-water');
  done=complete(nodes,done,loading);
  assert.ok(derive(nodes,done).available.some(n=>n.id==='eggs'));
  assert.ok(!derive(nodes,done).available.some(n=>n.id==='peel-eggs'));
  done=complete(nodes,done,'eggs');
  assert.ok(derive(nodes,done).available.some(n=>n.id==='peel-eggs'));
 });
 test(`${plan}: starting the rice cooker leaves prep available without marking rice cooked`,()=>{
  let done=complete(nodes,[],'prep-rice');done=complete(nodes,done,'rice-start');
  const view=derive(nodes,done);
  assert.ok(!view.done.includes('rice'));
  assert.ok(view.available.some(n=>n.id==='rice'));
  assert.ok(view.available.some(n=>n.id==='prep-chicken'));
  assert.notEqual(view.recommended,'rice');
 });
 test(`${plan}: preheat confirmation unlocks loading, not removal`,()=>{
  let done=complete(nodes,[],'prep-chicken');done=complete(nodes,done,'oven-heat-start');
  assert.ok(!derive(nodes,done).available.some(n=>n.id==='chicken-start'));
  done=complete(nodes,done,'oven-heat');done=complete(nodes,done,'chicken-start');
  assert.ok(!done.includes('chicken'));
  assert.ok(derive(nodes,done).available.some(n=>n.id==='chicken'));
  assert.ok(!derive(nodes,done).available.some(n=>n.id==='wrap'));
 });
 test(`${plan}: every task is reachable without a cycle or resource deadlock; cleanup is last`,()=>{
  const ids=new Set(nodes.map(n=>n.id));assert.equal(ids.size,nodes.length);
  let done=[];
  for(let i=0;i<nodes.length;i++){
   const view=derive(nodes,done);assert.ok(view.recommended,`stuck after ${done.join(',')}`);
   if(view.recommended==='clean') assert.equal(done.length,nodes.length-1);
   done=complete(nodes,done,view.recommended);
  }
  assert.equal(derive(nodes,done).recommended,null);
 });
 test(`${plan}: legacy completed tasks migrate and remain complete after reload`,()=>{
  const newIds=nodes.filter(n=>n.id.endsWith('-start')||['potato-turn','prep-haddock','broccoli','cauliflower'].includes(n.id)).map(n=>n.id);
  const oldDone=nodes.flatMap(n=>n.id==='fish'?['salmon','haddock']:n.id).filter(id=>!newIds.includes(id));
  const state=readState(JSON.stringify({version:4,done:oldDone}));
  assert.equal(state.version,5);
  const migrated=derive(nodes,state.done).done;
  const newlyRequired=nodes.some(n=>n.id==='breaded-fish') ? ['breaded-fish-start','breaded-fish','sandwich','refrigerate','clean'] : nodes.some(n=>n.id==='broccoli') ? ['broccoli-start','broccoli','cauliflower-start','cauliflower','curry-start','curry','refrigerate','clean'] : [];
  assert.equal(migrated.length,nodes.length-newlyRequired.length);
  newlyRequired.forEach(id=>assert.ok(!migrated.includes(id),'new food tasks must not inherit completion'));

  assert.deepEqual(readState(JSON.stringify(state)),state);
 });
 test(`${plan}: undoing loading invalidates completion and dependents, preserving unrelated work`,()=>{
  let done=[...prerequisites(nodes,'chicken'),'chicken','prep-rice','rice-start','rice'];
  const after=toggle(nodes,done,'first','chicken-start',false);
  assert.ok(!after.includes('chicken'));assert.ok(after.includes('rice'));
 });
}
test('all spaghetti cooks independently in Pot2 while eggs use Pot1',()=>{
 let done=['egg-water-start','egg-water','pasta-water-start','pasta-water'];
 done=complete(current,done,'eggs-start');
 done=complete(current,done,'pasta-start');
 assert.ok(derive(current,done).available.some(n=>n.id==='eggs'));
 done=complete(current,done,'pasta');
 assert.ok(!done.includes('eggs'));
 assert.ok(derive(current,done).available.some(n=>n.id==='eggs'));
 assert.ok(!current.some(n=>n.id==='eggs-pasta-start'));
});
test('dumplings wait for egg removal and a separately confirmed reboil; peeling is independent',()=>{
 let done=['egg-water-start','egg-water'];
 done=complete(current,done,'eggs-start');
 assert.ok(!derive(current,done).available.some(n=>n.id==='dumpling-water-start'));
 done=complete(current,done,'eggs');
 assert.ok(derive(current,done).available.some(n=>n.id==='peel-eggs'));
 done=complete(current,done,'dumpling-water-start');
 assert.ok(!derive(current,done).available.some(n=>n.id==='dumplings-start'));
 done=complete(current,done,'dumpling-water');
 done=complete(current,done,'dumplings-start');
 assert.ok(derive(current,done).available.some(n=>n.id==='dumplings'));
 assert.ok(derive(current,done).available.some(n=>n.id==='peel-eggs'));
 const undone=toggle(current,done,'first','dumpling-water',false);
 assert.ok(!undone.includes('dumplings-start'));
 assert.ok(undone.includes('eggs'));
});
test('old combined-pot completion migrates once and does not undo new edits',()=>{
 const state=readState(JSON.stringify({version:5,done:['egg-water-start','egg-water','eggs-pasta-start','eggs','pasta','dumplings-start','dumplings']}));
 const done=derive(current,state.done).done;
 for(const id of ['eggs','pasta','dumplings']) assert.ok(done.includes(id));
 assert.ok(!state.done.includes('eggs-pasta-start'));
 const undone=toggle(current,done,'first','dumpling-water',false);
 assert.ok(!readState(JSON.stringify({version:5,done:undone})).done.includes('dumpling-water'));
});
test('both fish share loading and removal after both preparations',()=>{
 let done=['air-heat-start','air-heat','prep-salmon'];
 assert.ok(!derive(current,done).available.some(n=>n.id==='fish-start'));
 done=complete(current,done,'prep-haddock');
 assert.equal(derive(current,done).recommended,'fish-start');
 done=complete(current,done,'fish-start');
 assert.ok(!done.includes('fish'));
 assert.ok(derive(current,done).available.some(n=>n.id==='fish'));
 assert.ok(derive(current,done).available.some(n=>n.id==='prep-bread'));
 done=complete(current,done,'fish');
 assert.ok(done.includes('fish'));
});
test('old fish marks merge only when both fish are complete',()=>{
 const prep=['air-heat-start','air-heat','prep-salmon','prep-haddock'];
 const one=[...prep,'salmon-start','salmon'];
 assert.ok(!derive(current,one).done.includes('fish'));
 const both=[...one,'haddock-start','haddock'];
 assert.ok(derive(current,both).done.includes('fish'));
 assert.ok(derive(current,both).done.includes('fish-start'));
 assert.deepEqual(derive(current,derive(current,both).done).done,derive(current,both).done);
});
test('cooking chicken before finishing pasta reserves only the saucepan, not the wok or preparation',()=>{
 let done=complete(current,[...prerequisites(current,'tomato'),...prerequisites(current,'chicken')],'chicken');
 const view=derive(current,done);
 assert.ok(!view.available.some(n=>n.id==='season-noodles'));
 assert.ok(view.available.some(n=>n.id==='spinach'));
 assert.ok(view.available.some(n=>n.id==='prep-bread'));
 done=complete(current,done,'tomato');assert.ok(derive(current,done).available.some(n=>n.id==='season-noodles'));
});
test('potato turning is separate from loading and final doneness',()=>{
 let done=prerequisites(current,'potato-start');done=complete(current,done,'potato-start');
 assert.ok(!derive(current,done).available.some(n=>n.id==='potato'));
 done=complete(current,done,'potato-turn');assert.ok(derive(current,done).available.some(n=>n.id==='potato'));
 assert.ok(!done.includes('potato'));
});
test('completed water heating does not reappear as a newly completed boil after reload',()=>{
 const saved={version:5,done:['egg-water-start','prep-rice','rice-start']};
 assert.deepEqual(readState(JSON.stringify(saved)),saved);
 assert.ok(!readState(JSON.stringify(saved)).done.includes('egg-water'));
});
test('old sessions keep only the selected batch and never turn running work into completion',()=>{
 const s=readState(JSON.stringify({half:'second',first:['prep-rice'],second:['prep-salmon'],secondRunning:['salmon']}));
 assert.deepEqual(s,{version:5,done:['prep-salmon']});
 assert.deepEqual(readState('{broken'),{version:5,done:[]});
 const v4=readState(JSON.stringify({version:4,done:['egg-water','eggs']}));
 assert.ok(!v4.done.includes('peel-eggs'));
 assert.ok(readState(JSON.stringify({version:3,done:['egg-water','eggs']})).done.includes('peel-eggs'));
});
test('assembly waits for cooked chicken and peeled eggs, while bread can be laid out immediately',()=>{
 assert.ok(derive(current,[]).available.some(n=>n.id==='prep-bread'));
 const done=prerequisites(current,'wrap');
 assert.ok(derive(current,done).available.some(n=>n.id==='wrap'));
 const beforeRemoval=done.filter(id=>!['chicken','eggs','peel-eggs'].includes(id));
 assert.ok(!derive(current,beforeRemoval).available.some(n=>n.id==='wrap'));
});

test('shared fish batch removes plain fish before resuming breaded fish',()=>{
 let done=prerequisites(current,'fish-start');
 assert.equal(current.find(n=>n.id==='fish-start').durationHint,8);
 assert.ok(!derive(current,done).available.some(n=>n.id==='breaded-fish-start'));
 done=complete(current,done,'fish-start');
 assert.ok(!derive(current,done).available.some(n=>n.id==='breaded-fish-start'));
 done=complete(current,done,'fish');
 done=complete(current,done,'breaded-fish-start');
 assert.ok(derive(current,done).available.some(n=>n.id==='breaded-fish'));
 assert.equal(current.find(n=>n.id==='breaded-fish-start').durationHint,8);
 done=complete(current,done,'breaded-fish');
 const undone=toggle(current,done,'first','fish',false);
 assert.ok(!undone.includes('breaded-fish-start'));
 assert.ok(!undone.includes('breaded-fish'));
});
