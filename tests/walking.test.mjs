import {test} from 'node:test';
import assert from 'node:assert/strict';
import {walkingEnergy} from '../cloudflare/walking.mjs';
const now=new Date('2026-11-10T00:30:00Z'); // Still Nov 9 in Toronto.
const row=(date,steps,collectedAt='2026-11-09T20:00:00Z')=>({date,steps,collectedAt});
test('rolling window uses Toronto days; ignores missing days, current-day and partial samples',()=>{
 const r=walkingEnergy({currentBody:{weight:80},steps:[row('2026-11-01',9999),row('2026-11-02',0),row('2026-11-08',1000),row('2026-11-09',9999),row('2026-11-07',9999,'2026-11-07T20:00:00Z')]},now);
 assert.equal(r.days,2); assert.equal(r.averageSteps,500);
 assert.equal(r.dailyKcal,14); assert.equal(r.weeklyKcal,98);
 assert.equal(r.from,'2026-11-02'); assert.equal(r.through,'2026-11-08');
});
test('latest duplicate snapshot wins and zero steps is valid',()=>{
 const r=walkingEnergy({currentBody:{weight:80},steps:[row('2026-11-08',1000),row('2026-11-08',0,'2026-11-09T21:00:00Z')]},now);
 assert.equal(r.days,1); assert.equal(r.weeklyKcal,0);
 assert.equal(walkingEnergy({steps:[]},now).weeklyKcal,null);
 assert.equal(walkingEnergy({steps:[row('2026-11-08',1000)]},now).weeklyKcal,null);
});
test('stale totals are not projected into a new week',()=>{
 assert.equal(walkingEnergy({currentBody:{weight:80},steps:[row('2026-11-08',1000)]},new Date('2026-11-20T20:00:00Z')).days,0);
});
