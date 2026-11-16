const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const catalog = require('../_data/cardio_plans.json');
const rows = [...fs.readFileSync('_includes/cardio-weekly-table.html','utf8').matchAll(/<tr data-cardio="(active|rest)"><td>(周.)<\/td>/g)].map(m=>({dataset:{cardio:m[1]},day:m[2]}));
function node(tag,className,textContent) { return {tag,className,textContent,dataset:{},children:[],append(...n){this.children.push(...n)},replaceChildren(){this.children=[]},setAttribute(){},addEventListener(){}}; }
const today = fs.readFileSync('assets/today.js','utf8');
const render = today.slice(today.indexOf('  function renderTraining(day)'),today.indexOf('  const localDate'));
for (const language of ['zh','en']) test(`weekend cardio renders independently of strength (${language})`,()=>{
 assert.equal(rows.filter(r=>r.dataset.cardio==='active').length,catalog.sessionsPerWeek);
 assert.deepEqual(rows.filter(r=>r.dataset.cardio==='active').map(r=>r.day),['周六','周日']);
 for(let day=0;day<7;day++) {
  const root=node('main');
  vm.runInNewContext(render+'\nrenderTraining(day);',{day,trainingRoot:root,cardioTable:{tBodies:[{rows}]},trainingDays:[1,2,4,5],strengthTables:[{tBodies:Array.from({length:4},()=>({rows:[]}))}],element:node,label:(a,b)=>language==='en'?b:a,en:language==='en',mode:'home',window:{fitnessCardioPlan:catalog.plans[0]},document:{querySelector:()=>({href:'/fitness/cardio/'})}});
  assert.equal(root.children.some(n=>n.className==='today-cardio'),[0,6].includes(day));
  assert.equal(root.children.some(n=>n.className==='today-rest'),day===3);
  assert.equal(root.children.some(n=>n.className==='today-exercise-list'),[1,2,4,5].includes(day));
  assert.equal(root.children.some(n=>n.className==='today-training-time'),day!==3);
 }
});
for(const file of ['assets/meal-activities.js','assets/meal-plans/plan-2/meal-activities.js']) test(`${file}: training cards appear between lunch and dinner`,()=>{
 const window={fitnessI18n:{language:'en'},fitnessMealPlan:{urlFor:kind=>'/fitness/'+kind+'/'}};
 const document={createElement:node,createElementNS:(_,tag)=>node(tag),querySelector:()=>({href:'/fitness/training/'})};
 vm.runInNewContext(fs.readFileSync(file,'utf8'),{window,document});
 for(let day=0;day<7;day++) for(const compact of [false,true]) {
  const root=node('main');window.fitnessMealActivities.append(root,day,'lunch',compact);
  const training=root.children.filter(n=>['cardio','strength'].includes(n.dataset.activity));
  assert.equal(training.length,day===3?0:1);
  if(training.length) {
   assert.equal(training[0].dataset.activity,[0,6].includes(day)?'cardio':'strength');
   assert.ok(training[0].children.some(n=>/Before Dinner/.test(n.textContent)));
  }
 }
});
