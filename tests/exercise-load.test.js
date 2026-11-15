const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {calculate,label}=require('../assets/exercise-load');
const lb=2.20462262185;
test('bodyweight plus both dumbbells changes only the body component',()=>{
 const action={weight:'25',weightKind:'each',bodyFactor:'.9'};
 const a=calculate(action,80),b=calculate(action,70);
 assert.equal(a.external,50);assert.equal(b.external,50);
 assert.equal(a.total,80*lb*.9+50);
 assert.ok(Math.abs(a.total-b.total-10*lb*.9)<1e-9);
 assert.equal(calculate({weight:'20',weightKind:'each'},70).total,40);
});
test('body-only work and support equipment are not double counted',()=>{
 assert.equal(calculate({weight:'0',weightKind:'bodyweight',bodyFactor:'.3'},80).total,80*lb*.3);
 assert.equal(calculate({weight:'20',weightKind:'dumbbell',bodyFactor:'.3',loadRole:'support'},80).total,80*lb*.3);
 assert.equal(calculate({weight:'20',weightKind:'plates',bodyFactor:'.9'},80).external,40);
 assert.equal(calculate({weight:'65',weightKind:'machine',bodyFactor:'.3'},80).total,65+80*lb*.3);
});
test('missing private weight leaves body-dependent totals unknown, never zero',()=>{
 for(const weight of [null,undefined,NaN,0]) {
  assert.ok(Number.isNaN(calculate({weight:'25',weightKind:'dumbbell',bodyFactor:'.5'},weight).total));
  assert.equal(calculate({weight:'25',weightKind:'dumbbell'},weight).total,25);
  assert.match(label({weight:'0',weightKind:'bodyweight',bodyFactor:'.3'},weight).text,/—/);
 }
 assert.match(label({weight:'25',weightKind:'dumbbell',bodyFactor:'.5'},80,true).detail,/50%/);
});
test('both location tables share body factors and the helper loads before all renderers',()=>{
 for(const mode of ['home','gym']) {
  const html=fs.readFileSync(`_includes/strength-${mode}-table.html`,'utf8');
  const links=[...html.matchAll(/<a\b([^>]+)>([^<]+)<\/a>/g)];
  for(const [,attrs,name] of links) {
   if(/深蹲|弓步|分腿蹲|提踵|硬拉|臀桥|臀推|卷腹|侧屈/.test(name)) assert.match(attrs,/data-body-factor=/,name);
  }
 }
 const layout=fs.readFileSync('_layouts/default.html','utf8');
 for(const file of ['today.js','visual-tables.js','strength-volume.js']) {
  assert.ok(layout.indexOf('/assets/body-metrics.js')<layout.indexOf('/assets/'+file));
  assert.ok(layout.indexOf('/assets/exercise-load.js')<layout.indexOf('/assets/'+file));
 }
});
