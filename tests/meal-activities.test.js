const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../assets/meal-activities.js'), 'utf8');
function node(tag) {
 return {tag, children:[], dataset:{}, append(...children){this.children.push(...children)}, setAttribute(){}};
}
for (const language of ['zh','en']) test(`Tuesday lunch thaw reminder appears in diet and overview (${language})`, () => {
 const window = {fitnessI18n:{language}};
 const document = {createElement:node,createElementNS:(_,tag)=>node(tag)};
 vm.runInNewContext(source,{window,document});
 for (const compact of [false,true]) {
  const root=node('main'); window.fitnessMealActivities.append(root,2,'lunch',compact);
  assert.equal(root.children.length,1);
  const card=root.children[0]; assert.equal(card.dataset.activity,'thawing');
  assert.ok(card.children.some(n=>n.className==='meal-activity-detail' && /冷藏|fridge/.test(n.textContent)));
  assert.ok(!card.children.some(n=>n.tag==='a'));
 }
 const other=node('main'); window.fitnessMealActivities.append(other,2,'dinner');
 assert.equal(other.children.length,0);
});

for (const language of ['zh','en']) test(`Metro fruit shopping appears twice per week (${language})`, () => {
 const window={fitnessI18n:{language},fitnessMealPlan:{urlFor:()=>'/fitness/shopping/'}};
 const document={createElement:node,createElementNS:(_,tag)=>node(tag)};
 vm.runInNewContext(source,{window,document});
 for (const compact of [false,true]) {
  let shopping=0;
  for(let day=0;day<7;day++) for(const slot of ['before-breakfast','lunch','dinner']) {
   const root=node('main');window.fitnessMealActivities.append(root,day,slot,compact);
   for(const card of root.children.filter(n=>n.dataset.activity==='shopping')) {
    shopping++;
    assert.ok((day===3 && slot==='before-breakfast') || (day===6 && slot==='lunch'));
    assert.ok(card.children.some(n=>n.className==='meal-activity-detail' && /Metro/.test(n.textContent)));
   }
  }
  assert.equal(shopping,2);
 }
});
