import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {validateTraining,readTraining,saveTraining,todayToronto} from '../cloudflare/training.mjs';
import viewer from '../cloudflare/viewer.mjs';
import catalog from '../_data/strength_exercises.json' with {type:'json'};
import logic from '../assets/training-progress.js';
const exercise=Object.values(catalog).find(x=>x.kind==='each'),owner='owner@example.com';
const now=new Date('2026-11-27T22:00:00Z');
const sample=(changes={})=>({date:'2026-11-26',exercise:exercise.id,plan:exercise.plan,sets:Array.from({length:3},()=>({weight:20,reps:exercise.max,state:'done'})),effort:'1-2',version:0,...changes});
function db(){
 const sql=new DatabaseSync(':memory:');
 sql.exec(readFileSync('cloudflare/migrations/0006_training_entries.sql','utf8'));
 return {sql,prepare(q){
  const stmt=sql.prepare(q);
  return {bind(...v){return {first:async()=>stmt.get(...v)||null,all:async()=>({results:stmt.all(...v)})};}};
 }};
}

const context=email=>({access:{getIdentity:async()=>({email})}});
const env=()=>({DB:db(),OWNER_EMAIL:owner,VIEWER_EMAILS:owner+',reader@example.com'});
const request=(body=sample(),headers={})=>new Request('https://private.example/api/training',{method:'POST',headers:{Origin:'https://private.example','X-Fitness-Action':'save-training','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
test('training input enforces whole reps, real past dates, known exercises, three sets and explicit completion',()=>{
 assert.equal(todayToronto(new Date('2026-11-28T02:00:00Z')),'2026-11-27');
 assert.deepEqual(validateTraining(sample(),now),sample());
 for(const changes of [{date:'2026-02-30'},{date:'2027-01-01'},{exercise:'__proto__'},{plan:'unknown'},{version:-1},{effort:'lots'},{sets:[]},{sets:[...sample().sets.slice(1),{weight:20,reps:null,state:'done'}]},{sets:[...sample().sets.slice(1),{weight:'20',reps:10,state:'done'}]},{sets:[...sample().sets.slice(1),{weight:20,reps:2.5,state:'done'}]}])assert.throws(()=>validateTraining(sample(changes),now));
 assert.equal(validateTraining(sample({sets:Array.from({length:3},()=>({weight:20,reps:null,state:'skip'}))}),now).sets[0].state,'skip');
});
test('training updates use optimistic versions, reject stale writes and retain earlier dates',async()=>{
 const d=db(),first=await saveTraining(d,sample());assert.equal(first.version,1);
 assert.equal(await saveTraining(d,sample()),null);
 const revised=await saveTraining(d,sample({version:1,effort:'0'}));assert.equal(revised.version,2);
 assert.equal(await saveTraining(d,sample({date:'2026-11-25',version:8})),null);
 await saveTraining(d,sample({date:'2026-11-25'}));
 const result=await readTraining(d,'2026-11-26');assert.equal(result.entries.length,1);assert.equal(result.entries[0].effort,'0');assert.equal(result.history[0].date,'2026-11-25');
 assert.equal((await readTraining(d,'2026-11-27')).entries.length,0);
});
test('training history is capped per exercise, not globally, and never includes future or selected date',async()=>{
 const d=db();for(let i=1;i<=12;i++)await saveTraining(d,sample({date:`2026-11-${String(i).padStart(2,'0')}`}));
 const h=(await readTraining(d,'2026-11-12')).history;assert.equal(h.length,8);assert.equal(h[0].date,'2026-11-11');assert.equal(h.at(-1).date,'2026-11-04');
});
test('only trusted Access owner can write; whitelist can read; CSRF, missing auth and large bodies are rejected',async()=>{
 const e=env();
 for(const ctx of [{},context('stranger@example.com')])assert.equal((await viewer.fetch(request(),e,ctx)).status,403);
 assert.equal((await viewer.fetch(request(),e,context('reader@example.com'))).status,403);
 for(const headers of [{Origin:'https://evil.example'},{'X-Fitness-Action':''}])assert.equal((await viewer.fetch(request(sample(),headers),e,context(owner))).status,403);
 assert.equal((await viewer.fetch(request(sample(),{'Content-Type':'text/plain'}),e,context(owner))).status,415);
 assert.equal((await viewer.fetch(request({...sample(),padding:'a'.repeat(5000)}),e,context(owner))).status,413);
 assert.equal((await viewer.fetch(request(),e,context(owner))).status,200);
 assert.equal((await viewer.fetch(request(),e,context(owner))).status,409);
 const r=await viewer.fetch(new Request('https://private.example/api/training?date=2026-11-26'),e,context('reader@example.com'));
 assert.equal(r.status,200);assert.equal(r.headers.get('Cache-Control'),'private, no-store');assert.equal((await r.json()).canWrite,false);
});
test('progress defaults never invent reps; partial and skipped sessions cannot trigger weight progression',()=>{
 const x=exercise,previous=sample();assert.ok(logic.defaults(x,previous).every(s=>s.reps===null&&s.state==='pending'&&s.weight===20));
 assert.equal(logic.advice(x,previous),'increase');assert.equal(logic.advice(x,{...previous,effort:'0'}),'increase');
 assert.equal(logic.advice(x,{...previous,sets:previous.sets.map((s,i)=>i? s:{...s,state:'skip'})}),'incomplete');
 assert.equal(logic.advice({...x,support:true},previous),'harder');
 assert.equal(logic.comparison(previous,{...previous,sets:previous.sets.map(s=>({...s,reps:s.reps-1}))}),3);
 assert.equal(logic.comparison(previous,{...previous,sets:previous.sets.map(s=>({...s,weight:25}))}),null);
});
test('catalog IDs, defaults and dose ranges cover every home and gym table row',()=>{
 for(const plan of ['home','gym']){
 const html=readFileSync(`_includes/strength-${plan}-table.html`,'utf8');
 const ids=[...html.matchAll(/data-exercise-id="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,24);
 for(const id of ids){assert.equal(catalog[id].plan,plan);assert.ok(catalog[id].max>catalog[id].min);assert.equal(catalog[id].sets,3);}
 }
 assert.match(readFileSync('assets/site.js','utf8'),/dataset.trainingRecording \? \[\]/);
});
