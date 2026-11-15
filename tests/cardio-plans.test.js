const test = require('node:test');
const assert = require('node:assert/strict');
const { resolve, energy } = require('../assets/cardio-plans.js');
const catalog = require('../_data/cardio_plans.json');
const fs = require('node:fs');
const path = require('node:path');
const baseline = Object.fromEntries(fs.readFileSync(path.join(__dirname, '../_data/plan_metrics.yml'), 'utf8').split('\n').filter(line => /^[a-z_]+: [\d.]+$/.test(line)).map(line => { const [k,v] = line.split(': '); return [k, Number(v)]; }));
const metabolism = {dailyResting:1600, dailyActivity:320, exerciseWeightRatio:1}; // Synthetic fixture.
test('repository controls cardio even with stale stored or explicit URL choices', () => {
 assert.equal(catalog.plans.length, 2);
 assert.equal(resolve(catalog).id, 'cardio-2');
 assert.equal(resolve(catalog, 'cardio-1', 'cardio-1').id, 'cardio-2');
 assert.equal(resolve({...catalog, default: 'removed'}, 'cardio-2', 'cardio-2').id, 'cardio-2');
 assert.equal(resolve(catalog, 'cardio-1', 'cardio-2').id, 'cardio-2');
 assert.equal(resolve(catalog, 'removed').id, 'cardio-2');
});
test('current 200 kcal budget and alternative 300 kcal budget do not double count', () => {
 const current = energy(baseline, catalog.plans[0], catalog.sessionsPerWeek, {weeklyKcal:474}, metabolism);
 const other = energy(baseline, catalog.plans[1], catalog.sessionsPerWeek, {weeklyKcal:474}, metabolism);
 assert.equal(current.weeklyCardio, 400);
 assert.equal(other.weeklyCardio, 600);
 assert.equal(current.weeklyBurn, 1920*7 + baseline.reference_strength_weekly + 400 + 474);
 assert.equal(current.weeklyDeficit, current.weeklyBurn - baseline.intake_daily*7);
 assert.ok(Math.abs(current.dailyDeficit - (current.weeklyBurn / 7 - baseline.intake_daily)) < 0.001);
 assert.ok(Math.abs(other.dailyDeficit - (current.dailyDeficit + 200 / 7)) < 1e-8);
 assert.ok(Math.abs(current.fatEquivalent - current.weeklyDeficit / 7700) < 1e-8);
 assert.ok(Math.abs(other.weeklyDeficit - current.weeklyDeficit - 200) < 1e-8);
});
test('each plan has its own HIIT and three matching alternatives', () => {
 assert.deepEqual(catalog.plans.map(p=>p.netKcal), [200,300]);
 assert.deepEqual(catalog.plans.map(p=>p.options[0].video), ['tgm_QjUiwlk','l54F-KHzKhA']);
 for(const plan of catalog.plans) {
  assert.deepEqual(plan.options.map(o=>o.id), ['hiit','swim','treadmill','bike']);
  for(const lang of ['zh','en']) assert.ok(plan.name[lang].includes(String(plan.netKcal)));
  for (const option of plan.options) for (const lang of ['zh','en']) {
   assert.ok(option.name[lang]); assert.ok(option.duration[lang]);
   for (const step of option.steps) assert.ok(step[lang]);
  }
 }
});
const net = parts => parts.reduce((sum, {minutes, met}) => sum + (met-1)*3.5/200*minutes, 0);
test('audited video accounts for every work pair once and all interval recovery', () => {
 const h = catalog.estimation.hiit;
 const active = h.segments.filter(s => s.pairs);
 assert.deepEqual(active.flatMap(s=>s.pairs).sort((a,b)=>a-b), Array.from({length:20}, (_,i)=>i+1));
 assert.equal(h.exercisePairs.length, 20);
 assert.equal(active.reduce((n,s)=>n+s.seconds,0), h.workBouts*h.workSecondsPerBout);
 for(const s of active) assert.equal(s.seconds, s.pairs.length*50);
 assert.equal(h.segments.find(s=>s.id==='interval-recovery').seconds,20*10+19*20);
 assert.equal(h.segments.reduce((n,s)=>n+s.seconds,0),1935);
 const computed = net(h.segments.map(s=>({minutes:s.seconds/60,met:s.met})));
 assert.ok(Math.abs(computed-h.centralNetKcalPerKg)<1e-6);
 assert.ok(Math.abs(h.centralGrossKcalPerKg-computed-1935/60*3.5/200)<1e-6);
});
test('original video audit counts 20 work bouts and one midpoint break', () => {
 const h = catalog.estimation.originalHiit;
 const active = h.segments.filter(s=>s.exercises);
 assert.deepEqual(active.flatMap(s=>s.exercises).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i+1));
 assert.equal(h.exercises.length,20);
 assert.equal(active.reduce((sum,s)=>sum+s.seconds,0),20*50);
 for(const s of active) assert.equal(s.seconds,s.exercises.length*50);
 assert.equal(h.segments.find(s=>s.id==='interval-recovery').seconds,18*10+60);
 const seconds=h.segments.reduce((sum,s)=>sum+s.seconds,0);
 assert.equal(seconds,1590);
 const computed=net(h.segments.map(s=>({minutes:s.seconds/60,met:s.met})));
 assert.ok(Math.abs(computed-h.centralNetKcalPerKg)<1e-6);
 assert.ok(Math.abs(h.centralGrossKcalPerKg-computed-seconds/60*3.5/200)<1e-6);
});
test('alternatives preserve weight-independent MET models and displayed duration', () => {
 for(const [index,audits] of [catalog.estimation.plan2Alternatives,catalog.estimation.higherEnergyAlternatives].entries()) {
  const plan = catalog.plans[index];
  for(const [id,audit] of Object.entries(audits)) {
   const kcal=net(audit.segments);
   assert.ok(Math.abs(kcal-audit.netKcalPerKg)<1e-6);
   const minutes=audit.segments.reduce((n,s)=>n+s.minutes,0);
   assert.equal(plan.options.find(o=>o.id===id).duration.en,`${minutes} min`);
  }
 }
});

test('step energy replaces the old walking allowance in both meal plans', () => {
 for (const intake of [1810.14286,1731]) {
  const b={...baseline,intake_daily:intake,weekly_deficit_precise:baseline.weekly_burn-intake*7};
  const result=energy(b,catalog.plans[0],catalog.sessionsPerWeek,{weeklyKcal:140}, metabolism);
  assert.ok(Math.abs(result.weeklyBurn-(1920*7+baseline.reference_strength_weekly+400+140))<1e-8);
  assert.ok(Math.abs(result.dailyDeficit-(result.weeklyBurn/7-intake))<1e-8);
  assert.equal(energy(b,catalog.plans[0],catalog.sessionsPerWeek,{}, metabolism).dailyDeficit,null);
  assert.ok(Number.isFinite(energy(b,catalog.plans[0],catalog.sessionsPerWeek,{weeklyKcal:0}, metabolism).dailyDeficit));
 }
});

test('higher-energy video audit and alternatives support the new planning tier', () => {
 const h=catalog.estimation.higherEnergyHiit;
 assert.equal(h.workBouts*h.workSecondsPerBout,2050);
 assert.equal(h.segments.slice(0,5).reduce((n,s)=>n+s.seconds,0),2050);
 assert.equal(h.segments.reduce((n,s)=>n+s.seconds,0),2760);
 for(const key of ['swim','treadmill','bike']) {
  const current=net(catalog.estimation.plan2Alternatives[key].segments);
  const other=net(catalog.estimation.higherEnergyAlternatives[key].segments);
  assert.ok(Math.abs(other/current-1.5)<0.03);
 }
});
