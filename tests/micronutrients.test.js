const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const micro = JSON.parse(read('_data/micronutrient_basis.json'));
const macro = JSON.parse(read('_data/nutrition_basis.json'));
const meals = JSON.parse(read('_data/meal_nutrition.json')).meals;
test('all six micronutrients have explicit recipe coverage, values and sources', () => {
 const recipes = {...Object.fromEntries(macro.mealKeys.map((k,i)=>[k,macro.recipes[i]])),...micro.extraRecipes};
 for (const [meal, recipe] of Object.entries(recipes)) for (const field of micro.fields) {
  let sum=0;
  for (const [food, amount] of Object.entries(recipe)) {
   const entry=micro.foods[food];
   assert.ok(entry?.basis && entry.sources.every(s=>micro.sources[s]),food);
   assert.ok(Number.isFinite(entry.values[field]) && entry.values[field]>=0,`${food}/${field}`);
   sum+=entry.values[field]*amount;
  }
  assert.ok(Math.abs(Number(meals[meal][field])-sum)<.001,`${meal}/${field}`);
 }
});
test('Canadian soy fortification and current seafood servings use their stated units', () => {
 assert.equal(micro.foods.soy.values.vitaminD, .8); // 2 mcg per 250 mL, not US formula
 assert.equal(micro.foods.cereal.values.vitaminB12,0);
 assert.equal(meals.fruit_snack.vitaminD,'2.160');
 assert.equal(micro.foods.tuna.values.vitaminD,4); // one 55 g drained half-can
 assert.equal(micro.foods.haddock.values.potassium,300); // one fillet, not per 100 g
 const weeklySalt=macro.recipes.reduce((s,r)=>s+2*(r.salt||0),0);
 assert.equal(weeklySalt,0); // no added table salt in the current recipes
});
test('recalculation is repeatable and refuses missing micronutrients instead of silently zeroing them', () => {
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fitness-nutrition-'));
 const files=['scripts/recalculate-nutrition.py','_data/nutrition_basis.json','_data/micronutrient_basis.json','_data/meal_nutrition.json','_data/plan_metrics.yml','stats.md'];
 try {
  for(const file of files){const dest=path.join(tmp,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,file),dest);}
  const run=()=>execFileSync('python3',[path.join(tmp,'scripts/recalculate-nutrition.py')],{stdio:'pipe'});
  run();
  for(const file of ['_data/meal_nutrition.json','_data/plan_metrics.yml','stats.md'])assert.equal(fs.readFileSync(path.join(tmp,file),'utf8'),read(file));
  const invalid=structuredClone(micro);delete invalid.foods.salmon.values.vitaminD;
  fs.writeFileSync(path.join(tmp,'_data/micronutrient_basis.json'),JSON.stringify(invalid));
  assert.throws(run);
 } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});

test('breakfast and bedtime fruit use one tray and twelve kiwis without OLLY', () => {
 const recipes=micro.extraRecipes;
 const sumFood=food=>3*((recipes.fruit_breakfast[food]||0)+(recipes.fruit_snack[food]||0))+4*((recipes.kiwi_breakfast[food]||0)+(recipes.kiwi_snack[food]||0));
 assert.ok(Math.abs(sumFood('fruit')*100-1000)<.001);
 assert.ok(Math.abs(sumFood('kiwi')*100-12*69)<.001);
 assert.ok(Math.abs(sumFood('soy')*100-3780)<.001);
 assert.equal(recipes.kiwi_breakfast.kiwi,.69);
 assert.equal(recipes.kiwi_snack.kiwi,1.38);
 assert.ok(!micro.foods.olly);
 assert.equal(macro.breakfastExtras.length,0);
 for(const key of ['fruit_breakfast','kiwi_breakfast']) {
  assert.equal(meals[key].foodEn.split(', ').length,4);
  assert.equal(meals[key].foodZh.split('，').length,4);
 }
});
