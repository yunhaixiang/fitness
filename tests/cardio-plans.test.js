const test = require('node:test');
const assert = require('node:assert/strict');
const { resolve, energy } = require('../assets/cardio-plans.js');
const catalog = require('../_data/cardio_plans.json');
const baseline = { reference_cardio_weekly: 1200, weekly_burn: 16635.96, weekly_deficit_precise: 4535.43097, intake_daily: 1728.65 };
test('new plan is default; saved and explicit choices remain independent of meal-plan IDs', () => {
 assert.equal(resolve(catalog).id, 'cardio-2');
 assert.equal(resolve(catalog, 'cardio-1').id, 'cardio-1');
 assert.equal(resolve(catalog, 'cardio-2', 'cardio-1').id, 'cardio-1');
 assert.equal(resolve(catalog, 'plan-1', 'removed').id, 'cardio-2');
});
test('switching plans changes only exercise energy, without double counting', () => {
 const original = energy(baseline, catalog.plans[0], catalog.sessionsPerWeek);
 const next = energy(baseline, catalog.plans[1], catalog.sessionsPerWeek);
 assert.equal(original.weeklyCardio, 800);
 assert.equal(next.weeklyCardio, 1200);
 assert.equal(next.weeklyBurn - original.weeklyBurn, 400);
 assert.equal(next.weeklyDeficit - original.weeklyDeficit, 400);
 assert.equal(Math.round(original.dailyDeficit), 591);
 assert.equal(Math.round(next.dailyDeficit), 648);
 assert.equal(next.fatEquivalent.toFixed(2), '0.59');
 assert.deepEqual(energy(baseline, catalog.plans[0], 4), original);
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
test('new steady-state alternatives are within 5% of the common net calorie target', () => {
 const net = parts => parts.reduce((total, [min, met]) => total + (met-1)*3.5*catalog.weightKg/200*min, 0);
 for (const parts of [[[48,5.55],[2,1.5]], [[27,8.5],[5,3.5],[5,2.8]], [[38,6],[10,4]]]) {
  assert.ok(Math.abs(net(parts)-catalog.plans[1].netKcal) < 15);
 }
});
