const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=require('../_data/meal_plan_content/plan-2/nutrition.json');
const definition=require('../assets/meal-plans/plan-2/cooking-definition.js');
const {derive}=require('../assets/cooking-progress');
test('restored repeating menu has fourteen meals, old quantities and independent nutrition',()=>{
 const schedule=read('_includes/meal-plans/plan-2/diet-schedule.html');
 const keys=[...schedule.matchAll(/data-nutrition-key="([^"]+)"/g)].map(x=>x[1]);
 const half=['rice','pasta','potato','wrap','rice','pasta','potato'];
 assert.deepEqual(keys,[...half,...half]);
 assert.equal((schedule.match(/data-drink="sparkling-ice"/g)||[]).length,2);
 for(const k of keys)assert.ok(data.meals[k]);
 const intake=(3*+data.meals.fruit_breakfast.kcal+4*+data.meals.kiwi_breakfast.kcal+7*+data.meals.outside_drink.kcal+keys.reduce((s,k)=>s+(+data.meals[k].kcal),0))/7;
 const metrics=read('_data/meal_plan_content/plan-2/metrics.yml');
 const planned=+metrics.match(/intake_daily: ([\d.]+)/)[1];
 assert.ok(Math.abs(planned-intake)<1,'historical rounded meal calories agree with daily budget');
 const burn=+metrics.match(/weekly_burn: ([\d.]+)/)[1];
 const deficit=+metrics.match(/weekly_deficit_precise: ([\d.]+)/)[1];
 assert.ok(Math.abs(burn-planned*7-deficit)<.1);
 for(const file of ['index.html','diet.md','stats.md'])assert.doesNotMatch(read('plans/plan-2/'+file),/site\.data\.(meal_nutrition|plan_metrics|nutrition_basis)/);
 assert.equal((read('_includes/meal-plans/plan-2/nutrition-meal-summary.html').match(/<tr><th scope="row">/g)||[]).length,7);
});
test('restored cooking tasks are all reachable with exactly one bilingual instruction each',()=>{
 const {nodes,instructionSections}=definition;
 const ids=new Set(nodes.map(n=>n.id));
 assert.equal(ids.size,nodes.length);
 for(const n of nodes)for(const dep of n.before)assert.ok(ids.has(dep),dep);
 let done=[];
 for(let i=0;i<nodes.length;i++){
  const next=derive(nodes,done).available[0]; if(!next)break; done.push(next.id);
 }
 assert.equal(done.length,nodes.length);
 assert.equal(derive(nodes,done).recommended,null);
 const html=read('plans/plan-2/cooking.md');
 const mapped=instructionSections.flatMap(s=>s[2]);
 assert.deepEqual([...mapped].sort(),[...ids].sort());
 for(const [id,group,steps] of instructionSections){
  const section=html.split('id="'+id+'"')[1].split('<h2')[0];
  assert.equal((section.match(/class="cooking-task-source"/g)||[]).length,steps.length);
  assert.equal((section.match(/class="cooking-source-en"/g)||[]).length,steps.length);
 }
 const initial=derive(nodes,[]).available.map(n=>n.id);
 assert.ok(initial.includes('spinach')&&initial.includes('ground'));
 assert.ok(initial.includes('prep-bread'));
});
test('restored shopping subtotal matches its own groceries, and current menu is not used',()=>{
 const text=read('plans/plan-2/shopping.md');
 const sum=[...text.matchAll(/data-weekly-cost="([\d.]+)"/g)].reduce((s,m)=>s+ +m[1],0);
 const total=+text.split('每周合计')[1].match(/\$([\d.]+)/)[1];
 assert.ok(Math.abs(sum-total)<.01);
 assert.doesNotMatch(text,/金枪鱼|水饺|扁米粉/);
 assert.match(text,/2盒（4块）\/ 周/);
 assert.match(text,/12个 \/ 盒/);
 assert.match(text, /data-price-id="5" data-weekly-cost="3.93" data-purchase-group="weekly"/);
 const eggRow = text.match(/<tr[^>]*data-price-id="5"[\s\S]*?<\/tr>/)[0];
 assert.match(eggRow, /1 Carton \/ Week/);
 assert.match(eggRow, /Great Value Large Eggs/);
 assert.doesNotMatch(eggRow, /18个|18-Eggs|3 Weeks/);
 const schedule = read('_includes/meal-plans/plan-2/diet-schedule.html');
 const weeklyEggs = [...schedule.matchAll(/水煮蛋(\d+)个/g)].reduce((sum, match) => sum + Number(match[1]), 0);
 assert.equal(weeklyEggs, 12);
 assert.match(read('plans/plan-2/cooking.md'), /鸡蛋6个/);
});

test('Plan 2 uses four salmon and four tilapia portions, no haddock, and twelve eggs weekly',()=>{
 const schedule=read('_includes/meal-plans/plan-2/diet-schedule.html');
 assert.equal((schedule.match(/三文鱼1块/g)||[]).length,4);
 assert.equal((schedule.match(/水煮蛋2个/g)||[]).length*2,12);
 const shopping=read('plans/plan-2/shopping.md');
 const cooking=read('plans/plan-2/cooking.md');
 for(const text of [schedule,shopping,cooking,read('_includes/meal-plans/plan-2/nutrition-meal-summary.html')])assert.doesNotMatch(text,/haddock|黑线鳕/i);
 assert.match(shopping,/2盒（4块）\/ 周/);
 assert.match(cooking,/三文鱼2块（320 g）/);
 assert.match(cooking,/三文鱼放第2、6盘，罗非鱼放第3、7盘/);
 assert.ok(!definition.nodes.some(n=>n.id==='haddock'));
 assert.equal(+data.meals.pasta.kcal,703);
 assert.equal(+data.meals.pasta.protein,64.1);
});

test('Plan 2 meals begin at Sunday lunch and Wednesday dinner, matching prep cards', () => {
 const rows=[...read('_includes/meal-plans/plan-2/diet-schedule.html').matchAll(/<tr data-nutrition-key="([^"]+)"[^>]*>([\s\S]*?)<\/tr>/g)];
 const days=['周日','周一','周二','周三','周四','周五','周六'];
 const labels={};
 rows.forEach((row,index)=>{
  const cells=[...row[2].matchAll(/<td[^>]*>(.*?)<\/td>/g)].map(m=>m[1]);
  const day=days[Math.floor(index/2)],meal=index%2===0?'午餐':'晚餐';
  assert.equal(cells[1],day);assert.equal(cells[2],meal);
  (labels[row[1]]??=[]).push(day+(index%2===0?'午':'晚'));
 });
 assert.equal(rows.length,14);
 assert.match(rows[0][2],/<td>上1<\/td>/);
 assert.match(rows[7][2],/<td>下1<\/td>/);
 for(const [key,dates] of Object.entries(labels)) assert.equal(data.meals[key].label,dates.join('／'));
 assert.doesNotMatch(read('plans/plan-2/diet.md'),/午餐后做饭|晚餐后做饭/);
});
