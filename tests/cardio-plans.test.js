const test = require('node:test');
const assert = require('node:assert/strict');
const { resolve, energy } = require('../assets/cardio-plans.js');
const catalog = require('../_data/cardio_plans.json');
const fs = require('node:fs');
const path = require('node:path');
const baseline = Object.fromEntries(fs.readFileSync(path.join(__dirname, '../_data/plan_metrics.yml'), 'utf8').split('\n').filter(line => /^[a-z_]+: [\d.]+$/.test(line)).map(line => { const [k,v] = line.split(': '); return [k, Number(v)]; }));
test('new plan is default; saved and explicit choices remain independent of meal-plan IDs', () => {
 assert.equal(resolve(catalog).id, 'cardio-2');
 assert.equal(resolve(catalog, 'cardio-1').id, 'cardio-1');
 assert.equal(resolve(catalog, 'cardio-2', 'cardio-1').id, 'cardio-1');
 assert.equal(resolve(catalog, 'plan-1', 'removed').id, 'cardio-2');
});
test('reference plan and alternate budgets do not double count exercise', () => {
 const current = energy(baseline, catalog.plans[1], catalog.sessionsPerWeek);
 assert.equal(current.weeklyCardio, 800);
 assert.equal(current.weeklyBurn, baseline.weekly_burn);
 assert.equal(current.weeklyDeficit, baseline.weekly_deficit_precise);
 assert.equal(Math.round(current.dailyDeficit), 591);
 assert.equal(current.fatEquivalent.toFixed(2), '0.54');
 const different = energy(baseline, {netKcal: 300}, catalog.sessionsPerWeek);
 assert.equal(different.weeklyBurn - current.weeklyBurn, 400);
 assert.equal(different.weeklyDeficit - current.weeklyDeficit, 400);
 assert.deepEqual(energy(baseline, catalog.plans[0], 4), current);
});
test('all plans offer four alternatives and the new video starts at the beginning', () => {
 for (const plan of catalog.plans) {
  assert.deepEqual(plan.options.map(o=>o.id), ['hiit','swim','treadmill','bike']);
  for (const option of plan.options) for(const lang of ['zh','en']) {
   assert.ok(option.name[lang]); assert.ok(option.duration[lang]);
   for (const step of option.steps) assert.ok(step[lang]);
  }
 }
 assert.equal(catalog.plans[1].options[0].video, 'tgm_QjUiwlk');
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
 assert.equal(Math.round(computed/25)*25, catalog.plans[1].netKcal);
 assert.ok(Math.abs(h.centralGrossKcal-computed-1935/60*3.5*catalog.weightKg/200)<1e-6);
});
test('steady-state alternatives match the net target and card durations', () => {
 for (const [id, audit] of Object.entries(catalog.estimation.alternatives)) {
  const kcal=net(audit.segments);
  assert.ok(Math.abs(kcal-audit.netKcal)<1e-6);
  assert.ok(Math.abs(kcal-catalog.plans[1].netKcal)<catalog.plans[1].netKcal*0.05);
  const minutes=audit.segments.reduce((n,s)=>n+s.minutes,0);
  assert.equal(catalog.plans[1].options.find(o=>o.id===id).duration.en, `${minutes} min`);
 }
});
