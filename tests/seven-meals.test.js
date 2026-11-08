const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const nutrition = JSON.parse(read('_data/meal_nutrition.json')).meals;
const basis = JSON.parse(read('_data/nutrition_basis.json'));
const flow = vm.runInNewContext(read('assets/cooking-flow.js').match(/const nodes = (\[[\s\S]*?\n  \]);/)[1]);
test('seven distinct meals repeat symmetrically, retaining all 14 meal slots and two Fuze servings',()=>{
 const source=read('_includes/diet-schedule.html');
 const rows=[...source.matchAll(/<tr data-nutrition-key="([^"]+)"([^>]*)>([\s\S]*?)<\/tr>/g)];
 assert.equal(rows.length,14);
 assert.deepEqual(rows.slice(0,7).map(m=>m[1]),basis.mealKeys);
 assert.deepEqual(rows.slice(7).map(m=>m[1]),basis.mealKeys);
 assert.equal(rows.filter(m=>m[2].includes('fuze')).length,2);
 for(const row of rows){assert.ok(nutrition[row[1]]);assert.equal((row[3].match(/<td/g)||[]).length,7);}
});
test('weekly meat, eggs, grains and portions match whole-package purchase cycles',()=>{
 const weekly=food=>basis.recipes.reduce((s,r)=>s+2*(r[food]||0),0);
 const close=(a,b)=>assert.ok(Math.abs(a-b)<.01,`${a} != ${b}`);
 close(weekly('thigh')*100,930); close(weekly('ground')*100,454);
 close(weekly('shrimp')*100,340); close(weekly('salmon')*100,320);
 close(weekly('ball')*85,907*6/60); close(weekly('haddock'),2); close(weekly('dumpling')*96,336);
 close(weekly('egg'),12); close(weekly('potato')*100,340);
 close(weekly('sweetpotato'),0);
 close(weekly('rice')*100,70); close(weekly('pasta')*85,120);
 close(weekly('noodle')*100,90); close(weekly('sauce')*125,300);
 close(weekly('chickpea'),0); close(weekly('tuna'),4); close(weekly('mayo'),9); close(weekly('spinach')*100,284);
 close(weekly('mushroom')*100,227); close(weekly('pc')*100,520);
 close(weekly('oil'),9.5); // 4.75 tsp each half-week, including all three fried eggs
});
test('daily intake and deficit use the same meal data as the cards',()=>{
 const daily=(basis.mealKeys.reduce((s,k)=>s+2*Number(nutrition[k].kcal),0)+3*Number(nutrition.fruit_breakfast.kcal)+4*Number(nutrition.kiwi_breakfast.kcal)+7*Number(nutrition.outside_drink.kcal))/7;
 const metrics=Object.fromEntries([...read('_data/plan_metrics.yml').matchAll(/^(\w+): ([\d.]+)$/gm)].map(m=>[m[1],Number(m[2])]));
 assert.ok(Math.abs(daily-metrics.intake_daily)<.01);
 assert.ok(Math.abs(metrics.weekly_burn-daily*7-metrics.weekly_deficit_precise)<.01);
});
test('all cooking prerequisites are valid, acyclic, and have matching instructions',()=>{
 const byId=new Map(flow.map(n=>[n.id,n])); const visited=new Set(),active=new Set();
 function visit(n){assert.ok(!active.has(n.id),'dependency cycle: '+n.id);if(visited.has(n.id))return;active.add(n.id);for(const id of n.before){assert.ok(byId.has(id),'missing '+id);visit(byId.get(id));}active.delete(n.id);visited.add(n.id);}
 flow.forEach(visit);
 const page=read('cooking.md');
 const sections=vm.runInNewContext(read('assets/cooking-flow.js').match(/const instructionSections = (\[[^\n]+\]);/)[1]);
 const instructionIds=new Set();
 for(const [id,group,steps] of sections){const fragment=page.split('<h2 id="'+id+'"')[1].split('<h2 ')[0];assert.equal((fragment.match(/<li /g)||[]).length,steps.length,id);steps.forEach(s=>instructionIds.add('cook-'+s));}
 for(const n of flow)assert.ok(instructionIds.has(n.link.slice(1))||['cold','portions'].includes(n.link.slice(1)),n.link);
 assert.ok(page.includes('裹粉黑线鳕'));
 assert.match(page,/第2盘2个，第3盘1个/);
});
test('routine shopping subtotal agrees with both stored prices and all shopping cards',()=>{
 const sum=[...read('shopping.md').matchAll(/data-weekly-cost="([\d.]+)"/g)].reduce((s,m)=>s+Number(m[1]),0);
 assert.equal(sum.toFixed(2),JSON.parse(read('_data/shopping_prices.json')).weekly_total_cad);
 assert.match(read('shopping.md'),new RegExp('\\$'+sum.toFixed(2).replace('.','\\.')));
});

test('repeated main ingredients stay separated across the half-week boundary',()=>{
 const avoidAdjacent=[['wrap','bread','noodles'],['rice','noodles'],['potato','dumpling'],['pasta','noodles'],['wrap','bread']];
 for(let i=0;i<basis.mealKeys.length;i++){
  const a=basis.mealKeys[i],b=basis.mealKeys[(i+1)%basis.mealKeys.length];
  for(const group of avoidAdjacent)assert.ok(!(group.includes(a)&&group.includes(b)),`${a} next to ${b}`);
 }
});
