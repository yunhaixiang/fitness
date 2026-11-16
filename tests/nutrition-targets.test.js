const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {targets, classify, parse} = require('../assets/nutrition-targets.js');
const {resolve} = require('../assets/body-metrics.js');
// Synthetic fixtures: never copy the owner's private measurements into tests.
const base = {kcal:2000, body:{weight:80,bf:25}, profile:{sex:'male',ageYears:35},dailyBurn:2400};
test('protein follows latest fat-free mass; fat loss alone does not reduce its target',()=>{
 const first=targets(base);
 const fatLoss=targets({...base,body:{weight:75,bf:20}});
 assert.deepEqual(first.protein.best,fatLoss.protein.best);
 assert.equal(first.protein.best.low,140);
 assert.equal(first.protein.best.high,170);
 const lowerLean=targets({...base,body:{weight:70,bf:25}});
 assert.ok(lowerLean.protein.best.low<first.protein.best.low);
 assert.equal(classify(first.protein,[150,150]),'best');
 assert.equal(classify(first.protein,[125,125]),'acceptable');
 assert.equal(classify(first.protein,[110,110]),'adjust');
});
test('latest available measurement is used even without a measurement today',()=>{
 const body=resolve({},[{date:'2026-01-03',weight:80,bf:25},{date:'2026-01-01',weight:90,bf:30}]);
 assert.deepEqual(targets({...base,body}).protein,targets(base).protein);
 const noFat=targets({...base,body:{weight:80}});
 assert.equal(noFat.protein.basis,'weight');
 assert.equal(targets({...base,body:{}}).protein.pending,'body');
 assert.equal(targets({...base,body:{}}).carbs.pending,'body');
 assert.equal(targets({...base,dailyBurn:null}).energy.pending,'energy');
});
test('gram and percentage targets are the same budget at different intake levels',()=>{
 for(const kcal of [1700,2000,2300]){
  const p=targets({...base,kcal});
  assert.ok(Math.abs(p.fat.best.low*9/kcal-.25)<1e-9);
  assert.ok(Math.abs(p.fat.best.high*9/kcal-.30)<1e-9);
  assert.ok(Math.abs(p.carbs.best.low-Math.max(130,(kcal-p.protein.best.high*4-p.fat.best.high*9)/4))<1e-9);
  assert.ok(Math.abs((p.carbs.best.high+p.protein.best.low)*4+p.fat.best.low*9-kcal)<1e-9);
 }
});
test('saturated fat is best below 6%, acceptable below 10%, then needs adjustment',()=>{
 const p=targets(base).saturatedFat;
 const rate=x=>x*base.kcal/900;
 for(const [percent,tier] of [[5.9,'best'],[6,'acceptable'],[7,'acceptable'],[9.9,'acceptable'],[10,'adjust'],[11,'adjust']])assert.equal(classify(p,[rate(percent),rate(percent)]),tier);
 assert.equal(classify(p,[rate(5),rate(7)]),'acceptable');
 assert.equal(classify(p,[rate(7),rate(11)]),'adjust');
});
test('energy bands use current expenditure, not a frozen historical calorie target',()=>{
 assert.equal(classify(targets(base).energy,[2000,2000]),'best');
 assert.equal(classify(targets({...base,dailyBurn:2100}).energy,[2000,2000]),'adjust');
});
test('micronutrients use private age and sex and consider excessive intake',()=>{
 const p=targets(base);
 assert.equal(p.iron.best.low,8);
 const female=targets({...base,profile:{sex:'female',ageYears:35}});
 assert.equal(female.iron.best.low,18);
 assert.equal(female.potassium.best.low,2600);
 const older=targets({...base,profile:{sex:'male',ageYears:75}});
 assert.equal(older.calcium.best.low,1200);
 assert.equal(older.vitaminD.best.low,20);
 assert.equal(older.calcium.acceptable.high,2000);
 assert.equal(classify(p.iodine,[114,114]),'adjust');
 assert.equal(classify(p.iodine,[130,130]),'acceptable');
 assert.equal(classify(p.iodine,[200,200]),'best');
 assert.equal(classify(p.iodine,[1200,1200]),'adjust');
 assert.equal(classify(p.vitaminD,[101,101]),'adjust');
 assert.equal(classify(p.iron,[46,46]),'adjust');
 assert.deepEqual(targets({...base,body:{weight:60,bf:15}}).iodine,p.iodine);
 assert.equal(targets({...base,profile:{}}).iron.pending,'profile');
});
test('total sugar and cholesterol have explicitly linked ratings, not invented independent limits',()=>{
 const p=targets(base);
 assert.equal(p.sugar.proxy,'addedSugar');
 assert.equal(p.cholesterol.proxy,'saturatedFat');
 assert.equal(p.sugar.best,undefined);
 assert.equal(p.cholesterol.best,undefined);
 assert.deepEqual(parse('1,234 mg'),{values:[1234,1234],unit:'mg'});
 assert.deepEqual(parse('1.8–2.0 g'),{values:[1.8,2],unit:'g'});
 assert.equal(parse('—'),null);
});
test('nutrition loads the existing authenticated profile injection, with no public personal defaults',()=>{
 const layout=fs.readFileSync('_layouts/default.html','utf8');
 assert.match(layout,/{% if page.nutrition or page.strength[^]*?id="tracking-records"/);
 assert.ok(layout.indexOf('assets/nutrition-targets.js')<layout.indexOf('assets/visual-tables.js'));
 const records=JSON.parse(fs.readFileSync('_data/tracking_records.json','utf8'));
 assert.deepEqual(records.currentBody,{});
 assert.equal(records.profile,undefined);
});
