import catalog from '../_data/strength_exercises.json' with {type: 'json'};
import {json} from './measurements.mjs';
export const todayToronto = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function validateTraining(input, now = new Date()) {
  if (!input || !validDate(input.date) || input.date < '2020-01-01' || input.date > todayToronto(now)) throw Error('Invalid training date');
  const exercise = typeof input.exercise === 'string' && Object.hasOwn(catalog, input.exercise) && catalog[input.exercise];
  if (!exercise || input.plan !== exercise.plan) throw Error('Unknown exercise');
  if (!Number.isSafeInteger(input.version) || input.version < 0) throw Error('Invalid version');
  if (!Array.isArray(input.sets) || input.sets.length !== 3) throw Error('Three sets required');
  const sets = input.sets.map(set => {
    if (!set || !['pending','done','skip'].includes(set.state)) throw Error('Invalid set status');
    if (typeof set.weight !== 'number' || !Number.isFinite(set.weight) || set.weight < 0 || set.weight > 2000 || (exercise.kind === 'bodyweight' && set.weight !== 0)) throw Error('Invalid weight');
    if (set.reps !== null && (!Number.isSafeInteger(set.reps) || set.reps < 1 || set.reps > 200)) throw Error('Invalid repetitions');
    if (set.state === 'done' && set.reps === null) throw Error('Completed sets need repetitions');
    return {weight:set.weight,reps:set.reps,state:set.state};
  });
  if (![null,'3+','1-2','0'].includes(input.effort)) throw Error('Invalid effort');
  return {date:input.date,exercise:input.exercise,plan:exercise.plan,sets,effort:input.effort,version:input.version};
}
const unpack = row => ({date:row.date,exercise:row.exercise,plan:row.plan,sets:JSON.parse(row.sets_json),effort:row.effort,version:row.version,updatedAt:row.updated_at});
export async function readTraining(db, date) {
  const entries = await db.prepare('SELECT * FROM training_entries WHERE date = ?').bind(date).all();
  const history = await db.prepare(`SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY exercise ORDER BY date DESC) AS rank FROM training_entries WHERE date < ?) WHERE rank <= 8 ORDER BY date DESC`).bind(date).all();
  return {entries:entries.results.map(unpack),history:history.results.map(unpack)};
}
export async function saveTraining(db, entry) {
  // Compare-and-swap prevents stale browser/device writes from replacing newer data.
  const row = await db.prepare(`INSERT INTO training_entries(date,exercise,plan,sets_json,effort,version,updated_at)
    SELECT ?,?,?,?,?,?,? WHERE ? = 0 OR EXISTS(SELECT 1 FROM training_entries WHERE date=? AND exercise=?)
    ON CONFLICT(date,exercise) DO UPDATE SET sets_json=excluded.sets_json, effort=excluded.effort,
    version=excluded.version, updated_at=excluded.updated_at WHERE training_entries.version=excluded.version-1
    RETURNING *`).bind(entry.date,entry.exercise,entry.plan,JSON.stringify(entry.sets),entry.effort,entry.version+1,new Date().toISOString(),entry.version,entry.date,entry.exercise).first();
  return row ? unpack(row) : null;
}
export async function trainingHandler(request, env, email) {
  const url = new URL(request.url), owner = email === env.OWNER_EMAIL?.trim().toLowerCase();
  if (request.method === 'GET') {
    const date = url.searchParams.get('date') || todayToronto();
    if (!validDate(date) || date < '2020-01-01') return json({error:'Invalid date'},400);
    return json({...await readTraining(env.DB,date),canWrite:owner,today:todayToronto()});
  }
  if (request.method !== 'POST') return json({error:'Method not allowed'},405);
  if (!owner) return json({error:'Owner only'},403);
  if (request.headers.get('Origin') !== url.origin || request.headers.get('X-Fitness-Action') !== 'save-training') return json({error:'Invalid origin'},403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({error:'JSON required'},415);
  const reader=request.body?.getReader(); if(!reader)return json({error:'Empty body'},400);
  let size=0; const chunks=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4096){await reader.cancel();return json({error:'Payload too large'},413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  let entry;
  try{entry=validateTraining(JSON.parse(new TextDecoder().decode(bytes)));}catch(error){return json({error:error.message},400);}
  const saved=await saveTraining(env.DB,entry);
  return saved ? json({ok:true,entry:saved}) : json({error:'Record changed on another device. Reload before editing.'},409);
}
