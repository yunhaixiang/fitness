import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {metabolicEnergy} from '../cloudflare/metabolism.mjs';
const require=createRequire(import.meta.url);
const {energy}=require('../assets/cardio-plans.js');
// Synthetic fixtures only; no owner profile or measurement values.
const records={currentBody:{weight:80, measuredAt:'2026-01-01T12:00:00Z'},profile:{heightCm:180,ageYears:30,sex:'male',exerciseReferenceWeightKg:80}};
const baseline={intake_daily:1900,reference_strength_weekly:450};
const plan={netKcal:200};
test('resting, sedentary and exercise estimates follow current weight',()=>{
 const before=metabolicEnergy(records);
 assert.equal(before.dailyResting,1780);
 assert.equal(before.dailyActivity,356);
 assert.equal(before.exerciseWeightRatio,1);
 const after=metabolicEnergy({...records,currentBody:{weight:70}});
 assert.equal(after.dailyResting,1680);
 assert.equal(after.dailyActivity,336);
 assert.equal(after.exerciseWeightRatio,.875);
 const old=energy(baseline,plan,2,{weeklyKcal:280},before);
 const next=energy(baseline,plan,2,{weeklyKcal:245},after);
 assert.equal(next.weeklyCardio,350);
 assert.equal(next.weeklyStrength,393.75);
 assert.equal(next.weeklyBurn,1680*7+336*7+393.75+350+245);
 assert.ok(next.dailyDeficit<old.dailyDeficit);
 assert.equal(next.weeklyDeficit,next.weeklyBurn-1900*7);
});
test('updated profile changes formula, and body fat noise does not change resting estimate',()=>{
 const calc=patch=>metabolicEnergy({...records,profile:{...records.profile,...patch}}).dailyResting;
 assert.equal(calc({sex:'female'}),1614);
 assert.equal(calc({ageYears:31}),1775);
 assert.equal(calc({heightCm:184}),1805);
 assert.equal(metabolicEnergy({...records,currentBody:{weight:80,bf:15}}).dailyResting,1780);
});
test('missing private data cannot fall back to obsolete public calorie estimates',()=>{
 for(const data of [{},{profile:records.profile},{currentBody:{weight:80}}, {...records,profile:{...records.profile,ageYears:null}}, {...records,currentBody:{weight:NaN}}]) {
  const m=metabolicEnergy(data);
  assert.equal(m.dailyResting,null);
  const b=energy({...baseline,weekly_burn:20000},plan,2,{weeklyKcal:280},m);
  assert.equal(b.dailyBurn,null);assert.equal(b.dailyDeficit,null);
 }
 const missingReference=metabolicEnergy({...records,profile:{...records.profile,exerciseReferenceWeightKg:null}});
 assert.equal(missingReference.exerciseWeightRatio,null);
 assert.equal(energy(baseline,plan,2,{weeklyKcal:280},missingReference).dailyDeficit,null);
 const missingSteps=energy(baseline,plan,2,{},metabolicEnergy(records));
 assert.equal(missingSteps.weeklyResting,1780*7);assert.equal(missingSteps.weeklyBurn,null);
 assert.ok(Number.isFinite(energy(baseline,plan,2,{weeklyKcal:0},metabolicEnergy(records)).dailyDeficit));
});
test('changing meal plans changes intake only; surplus and partial data remain honest',()=>{
 const m=metabolicEnergy(records);
 const a=energy(baseline,plan,2,{weeklyKcal:280},m);
 const b=energy({...baseline,intake_daily:2100},plan,2,{weeklyKcal:280},m);
 assert.equal(a.weeklyBurn,b.weeklyBurn);
 assert.ok(Math.abs(a.dailyDeficit-b.dailyDeficit-200)<1e-8);
 assert.ok(energy({...baseline,intake_daily:3000},plan,2,{weeklyKcal:280},m).dailyDeficit<0);
});

test('browser updates every breakdown row and deficit before charts render',async()=>{
 const {readFileSync}=await import('node:fs');
 const {runInNewContext}=await import('node:vm');
 const catalog=require('../_data/cardio_plans.json');
 const m=metabolicEnergy(records);
 const walking={weeklyKcal:280,dailyKcal:40,days:7,averageSteps:1000};
 const values={'cardio-plan-catalog':catalog,'cardio-energy-baseline':baseline,'walking-energy':walking,'metabolic-energy':m};
 const rows=Object.fromEntries(['resting','activity','strength','cardio','walking','total'].map(key=>[key,{cells:[{},{},{}]}]));
 const summary={dataset:{energy:'dailyDeficit'},querySelector(){return null;},replaceChildren(value){this.value=value;}};
 const heading={dataset:{energyLabel:'dailyDeficit'}};
 const window={fitnessI18n:{language:'en'}};
 const document={
  getElementById(id){return values[id]?{textContent:JSON.stringify(values[id])}:null;},
  querySelector(selector){return rows[selector.match(/data-energy-row="(\w+)"/)?.[1]]||null;},
  querySelectorAll(selector){return selector==='[data-energy]'?[summary]:selector==='[data-energy-label]'?[heading]:[];},
  createTextNode(value){return value;}
 };
 runInNewContext(readFileSync('assets/cardio-plans.js','utf8'),{window,document,Intl});
 const expected=energy(baseline,catalog.plans[0],2,walking,m);
 for(const [row,key] of [['resting','weeklyResting'],['activity','weeklyActivity'],['strength','weeklyStrength'],['cardio','weeklyCardio'],['total','weeklyBurn']]) {
  assert.equal(rows[row].cells[1].textContent,new Intl.NumberFormat('en-CA',{minimumFractionDigits:2,maximumFractionDigits:2}).format(expected[key]));
 }
 assert.equal(summary.value,new Intl.NumberFormat('en-CA',{maximumFractionDigits:0}).format(Math.abs(expected.dailyDeficit))+' ');
 assert.equal(summary.dataset.energyBalance,'deficit');
 assert.equal(heading.textContent,'Daily Deficit');
 assert.equal(window.fitnessCardioPlan.netKcal,200);
 values['cardio-energy-baseline']={...baseline,intake_daily:5000};
 runInNewContext(readFileSync('assets/cardio-plans.js','utf8'),{window,document,Intl});
 assert.equal(summary.dataset.energyBalance,'surplus');
 assert.equal(heading.textContent,'Daily Surplus');
 assert.match(summary.value,/^[0-9]/);
 assert.doesNotMatch(summary.value,/[+−-]/);
 assert.ok(readFileSync('_layouts/default.html','utf8').includes('id="metabolic-energy">{}</script>'));
 for(const file of ['stats.md','plans/plan-2/stats.md']) for(const type of ['resting','activity','strength']) assert.ok(readFileSync(file,'utf8').includes(`data-energy-row="${type}"`));
});
