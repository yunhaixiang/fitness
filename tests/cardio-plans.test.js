const test = require('node:test');
const assert = require('node:assert/strict');
const { resolve, energy } = require('../assets/cardio-plans.js');
const catalog = require('../_data/cardio_plans.json');
const fs = require('node:fs');
const path = require('node:path');
const baseline = Object.fromEntries(fs.readFileSync(path.join(__dirname, '../_data/plan_metrics.yml'), 'utf8').split('\n').filter(line => /^[a-z_]+: [\d.]+$/.test(line)).map(line => { const [k,v] = line.split(': '); return [k, Number(v)]; }));
test('merged plan resolves stale saved choices and links', () => {
 assert.equal(catalog.plans.length, 1);
 assert.equal(resolve(catalog).id, 'cardio-1');
 assert.equal(resolve(catalog, 'cardio-2').id, 'cardio-1');
 assert.equal(resolve(catalog, 'cardio-2', 'cardio-2').id, 'cardio-1');
 assert.equal(resolve(catalog, 'plan-1', 'removed').id, 'cardio-1');
});
test('merged budget uses original plan without double counting exercise', () => {
 const current = energy(baseline, catalog.plans[0], catalog.sessionsPerWeek);
 assert.equal(current.weeklyCardio, 720);
 assert.equal(current.weeklyBurn, baseline.weekly_burn);
 assert.equal(current.weeklyDeficit, baseline.weekly_deficit_precise);
 assert.equal(Math.round(current.dailyDeficit), 579);
 assert.equal(current.fatEquivalent.toFixed(2), '0.53');
 const different = energy(baseline, {netKcal: 300}, catalog.sessionsPerWeek);
 assert.equal(different.weeklyBurn - current.weeklyBurn, 480);
 assert.ok(Math.abs(different.weeklyDeficit - current.weeklyDeficit - 480) < 1e-8);
});
test('one plan retains both videos and only the original three alternatives', () => {
 const plan = catalog.plans[0];
 assert.deepEqual(plan.options.map(o=>o.id), ['hiit','hiit-30','swim','treadmill','bike']);
 assert.deepEqual(plan.options.filter(o=>o.video).map(o=>o.video), ['M0uO8X3_tEA','tgm_QjUiwlk']);
 for (const option of plan.options) for (const lang of ['zh','en']) {
  assert.ok(option.name[lang]); assert.ok(option.duration[lang]);
  for (const step of option.steps) assert.ok(step[lang]);
 }
});
const net = parts => parts.reduce((sum, {minutes, met}) => sum + (met-1)*3.5*catalog.weightKg/200*minutes, 0);
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
 assert.ok(Math.abs(computed-h.centralNetKcal)<1e-6);
 assert.equal(Math.round(computed/25)*25, h.planningNetKcal);
 assert.ok(Math.abs(h.centralGrossKcal-computed-1935/60*3.5*catalog.weightKg/200)<1e-6);
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
 assert.ok(Math.abs(computed-h.centralNetKcal)<1e-6);
 assert.equal(Math.round(computed/10)*10,catalog.plans[0].netKcal);
 assert.ok(Math.abs(h.centralGrossKcal-computed-seconds/60*3.5*catalog.weightKg/200)<1e-6);
});
test('original-plan alternatives follow the revised 180 kcal budget', () => {
 for(const [id,audit] of Object.entries(catalog.estimation.originalAlternatives)) {
  const kcal=net(audit.segments);
  assert.ok(Math.abs(kcal-audit.netKcal)<1e-6);
  assert.ok(Math.abs(kcal-catalog.plans[0].netKcal)<catalog.plans[0].netKcal*0.05);
  const minutes=audit.segments.reduce((n,s)=>n+s.minutes,0);
  assert.equal(catalog.plans[0].options.find(o=>o.id===id).duration.en,`${minutes} min`);
 }
});
