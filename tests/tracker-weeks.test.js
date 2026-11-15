const test=require('node:test');
const assert=require('node:assert/strict');
const {groupWeeks}=require('../assets/tracker');
test('weekly rows run Monday to Sunday, newest week first, retaining repeated entries',()=>{
 const rows=[{date:'2026-11-08',steps:100},{date:'2026-11-09',steps:200},{date:'2026-11-09',steps:300},{date:'2026-11-14',steps:400}];
 const before=JSON.stringify(rows),weeks=groupWeeks(rows);
 assert.deepEqual(weeks.map(w=>w.start),['2026-11-09','2026-11-02']);
 assert.equal(weeks[0].end,'2026-11-15');assert.equal(weeks[0].days.length,7);
 assert.equal(weeks[0].days[0].rows.length,2);
 assert.equal(weeks[0].days[5].rows[0].steps,400);
 assert.equal(weeks[0].days[6].rows.length,0);
 assert.equal(weeks[1].days[6].rows[0].steps,100);
 assert.equal(JSON.stringify(rows),before);
});
test('calendar grouping is stable across DST and year boundaries',()=>{
 for(const start of ['2026-03-02','2026-10-26','2026-12-28']) {
  const rows=Array.from({length:7},(_,i)=>{const d=new Date(start+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);return {date:d.toISOString().slice(0,10)};});
  const weeks=groupWeeks(rows);assert.equal(weeks.length,1);
  assert.equal(weeks[0].start,start);assert.ok(weeks[0].days.every(d=>d.rows.length===1));
 }
});
test('undated and invalid records are never invented as dated measurements',()=>{
 assert.deepEqual(groupWeeks([{date:'当前数据',weight:80},{date:'2026-02-30'},{date:'bad'},{date:undefined}]),[]);
 assert.deepEqual(groupWeeks([]),[]);
});
