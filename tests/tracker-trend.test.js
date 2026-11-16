const test = require('node:test');
const assert = require('node:assert/strict');
const {buildTrend} = require('../assets/tracker');
test('rolling averages use seven calendar days, not seven readings', () => {
 const rows=[{date:'2026-11-01',weight:90},{date:'2026-11-10',weight:80},{date:'2026-11-16',weight:78}];
 const result=buildTrend(rows,'weight','2026-11-16');
 assert.equal(result.average,79); assert.equal(result.count,2);
 assert.equal(result.from,'2026-11-10');
 assert.equal(result.rolling.find(p=>p.date==='2026-11-09').value,null);
 assert.equal(buildTrend(rows,'weight','2026-11-23').average,null);
});
test('same-day snapshots use latest timestamp without double weighting or mutation',()=>{
 const rows=[{date:'2026-11-15',steps:600,collectedAt:'2026-11-16T12:00:00Z'},
 {date:'2026-11-15',steps:400,collectedAt:'2026-11-16T10:00:00Z'}, {date:'2026-11-16',steps:0}];
 const before=JSON.stringify(rows),result=buildTrend(rows,'steps','2026-11-16');
 assert.equal(result.average,300); assert.equal(result.count,2); assert.equal(result.daily.length,2);
 assert.equal(JSON.stringify(rows),before);
});
test('missing and invalid readings are excluded separately for each metric',()=>{
 const rows=[{date:'2026-11-15',weight:77,bf:null},{date:'2026-11-16',weight:'',bf:30},
 {date:'2026-11-17',weight:90,bf:80},{date:'2026-02-30',weight:80},
 {date:'Current Metrics',weight:80},{date:'2026-11-14',weight:-1,bf:101}];
 assert.equal(buildTrend(rows,'weight','2026-11-16').average,77);
 assert.equal(buildTrend(rows,'bf','2026-11-16').average,30);
 assert.equal(buildTrend([],'weight','2026-11-16').average,null);
});
test('first visible average includes the six preceding days and is stable across DST',()=>{
 const rows=[{date:'2026-10-28',weight:80},{date:'2026-11-01',weight:76},{date:'2026-11-03',weight:78}];
 const result=buildTrend(rows,'weight','2026-11-03',3);
 assert.equal(result.rolling[0].date,'2026-11-01');
 assert.equal(result.rolling[0].value,78); assert.equal(result.average,78);
 assert.equal(result.rolling[2].time-result.rolling[0].time,2*86400000);
});
