const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { resolve, scopedKey } = require('../assets/meal-plans.js');
const original = require('../_data/meal_plans.json');
const catalog = original;
const second = catalog.plans.find(plan => plan.id === 'plan-2');
test('Plan 1 is the default and explicit routes keep both plans independently reachable', () => {
 for (const [page, url] of Object.entries(original.plans[0].pages)) {
  assert.equal(resolve(catalog, url).active.id, 'plan-1');
  assert.equal(resolve(catalog, url, 'plan-2').active.id, 'plan-1');
  assert.equal(resolve(catalog, second.pages[page]).active.id, 'plan-2');
  assert.equal(resolve(catalog, second.pages[page]).redirect, null);
  assert.equal(resolve(catalog, url, null, 'plan-2').redirect, second.pages[page]);
  assert.equal(resolve(catalog, second.pages[page], null, 'plan-1').redirect, url);
 }
 assert.equal(resolve(catalog, '/strength/', 'plan-2').active.id,'plan-2');
 assert.equal(resolve(catalog, '/strength/', 'missing').active.id,'plan-1');
 assert.equal(resolve(catalog, '/diet/', null, 'missing').active.id,'plan-1');
});
test('shopping and cooking progress is isolated while preserving original saved data', () => {
 for (const key of ['fitness-shopping:2026-10-26:菠菜','fitness-cooking-guide-v1']) {
  assert.equal(scopedKey(key,'plan-1','plan-1'),key);
  assert.notEqual(scopedKey(key,'plan-2','plan-1'),key);
  assert.notEqual(scopedKey(key,'plan-2','plan-1'),scopedKey(key,'plan-3','plan-1'));
 }
});
test('new plan has independent source data, activities and cooking tasks', () => {
 const repo=path.join(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'meal-plan-test-'));
 try {
  const files=['scripts/create-meal-plan.py','_data/meal_plans.json','_data/meal_nutrition.json','_data/plan_metrics.yml','_includes/diet-schedule.html','assets/meal-activities.js','assets/cooking-flow.js','assets/cooking-guide.js','index.html','diet.md','stats.md','shopping.md','cooking.md'];
  for(const name of files){const target=path.join(temp,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(repo,name),target);}
  fs.writeFileSync(path.join(temp,'_data/meal_plans.json'),JSON.stringify({...original,plans:[original.plans[0]]}));
  const args=[path.join(temp,'scripts/create-meal-plan.py'),'plan-2','--name-zh','周计划 2','--name-en','Weekly Plan 2'];
  execFileSync('python3',args);
  const read=(name)=>fs.readFileSync(path.join(temp,name),'utf8');
  const built=JSON.parse(read('_data/meal_plans.json'));
  assert.equal(built.plans.length,2);
  assert.match(read('plans/plan-2/index.html'),/overview: true/);
  for(const name of ['diet.md','stats.md','index.html']){
   assert.doesNotMatch(read('plans/plan-2/'+name),/site\.data\.(meal_nutrition|plan_metrics)/);
  }
  assert.match(read('plans/plan-2/cooking.md'),/cooking_flow_script: \/assets\/meal-plans\/plan-2\/cooking-flow.js/);
  assert.match(read('plans/plan-2/diet.md'),/include meal-plans\/plan-2\/diet-schedule.html/);
  fs.writeFileSync(path.join(temp,'_data/meal_plan_content/plan-2/nutrition.json'),'{}');
  assert.notEqual(read('_data/meal_nutrition.json'),'{}');
  assert.throws(()=>execFileSync('python3',args,{stdio:'pipe'}));
 } finally {fs.rmSync(temp,{recursive:true,force:true});}
});
