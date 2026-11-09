// Shared validation for the private Apple Health upload endpoint.
export function measurement(input, now = new Date()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected a JSON object.');
  const value = (key, min, max) => {
    const raw = input[key];
    if ((typeof raw !== 'number' && typeof raw !== 'string') || String(raw).trim() === '') throw new Error(`Missing ${key}.`);
    const n = Number(raw);
    if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Invalid ${key}; use kg and percentage points (31.2, not 0.312).`);
    return Math.round(n * 100) / 100;
  };
  const instant = key => {
    const raw = input[key];
    if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(raw)) throw new Error(`Invalid ${key}; include the timezone.`);
    const t = new Date(raw);
    if (!Number.isFinite(t.getTime()) || t.getUTCFullYear() < 2000 || t > new Date(now.getTime() + 600000)) throw new Error(`Invalid ${key}.`);
    return t;
  };
  const weight = value('weight_kg', 20, 350);
  const bf = value('body_fat_percent', 2, 70);
  const time = instant('measured_at');
  const fatTime = instant('body_fat_measured_at');
  if (Math.abs(time - fatTime) > 600000) throw new Error('Weight and body fat must be from the same measurement, within 10 minutes.');
  const date = new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit'}).format(time);
  return { date, weight, bf, measuredAt: time.toISOString(), bodyFatMeasuredAt: fatTime.toISOString() };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'
  }});
}

export async function tokenHash(token) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const saveSQL = `INSERT INTO measurements (date, weight, bf, measured_at, body_fat_measured_at)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT(date) DO UPDATE SET weight=excluded.weight, bf=excluded.bf,
measured_at=excluded.measured_at, body_fat_measured_at=excluded.body_fat_measured_at
WHERE excluded.measured_at >= measurements.measured_at`;

export async function readRecords(db) {
  const latest = await db.prepare('SELECT weight, bf, measured_at FROM measurements ORDER BY measured_at DESC LIMIT 1').first();
  const {results} = await db.prepare("SELECT * FROM measurements WHERE date >= date('now', '-56 days') ORDER BY date").all();
  const {results: steps} = await db.prepare("SELECT * FROM daily_steps WHERE date >= date('now', '-56 days') ORDER BY date").all();
  return {
    steps: steps.map(row => ({id: `apple-health-steps-${row.date}`, date: row.date, steps: row.steps, collectedAt: row.collected_at})),
    body: results.map(row => ({id: `apple-health-${row.date}`, date: row.date, weight: row.weight, bf: row.bf, measuredAt: row.measured_at})),
    currentBody: latest ? {weight: latest.weight, bf: latest.bf, measuredAt: latest.measured_at} : {},
    cheatMeals: []
  };
}

// Optional daily totals: independent of the date of the latest body measurement.
export function dailySteps(input, now = new Date()) {
  const keys = ['steps_count', 'steps_date', 'steps_collected_at'];
  if (!keys.some(key => Object.hasOwn(input, key))) return null;
  const raw = input.steps_count;
  const steps = Number(raw);
  if (!['number', 'string'].includes(typeof raw) || String(raw).trim() === '' || !Number.isInteger(steps) || steps < 0 || steps > 200000) throw new Error('Invalid steps_count; send a whole-day integer total.');
  const date = input.steps_date;
  const parsed = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + 'T12:00:00Z') : new Date(NaN);
  const today = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Toronto', year:'numeric', month:'2-digit', day:'2-digit'}).format(now);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10) !== date || date < '2000-01-01' || date > today) throw new Error('Invalid steps_date; use YYYY-MM-DD.');
  const rawTime = input.steps_collected_at;
  const collected = new Date(rawTime);
  if (typeof rawTime !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(rawTime) || !Number.isFinite(collected.getTime()) || collected > new Date(now.getTime()+600000) || collected < new Date(date+'T00:00:00Z')) throw new Error('Invalid steps_collected_at; use the query time in ISO 8601.');
  return {date, steps, collectedAt: collected.toISOString()};
}
export const saveStepsSQL = `INSERT INTO daily_steps (date, steps, collected_at) VALUES (?, ?, ?)
ON CONFLICT(date) DO UPDATE SET steps=excluded.steps, collected_at=excluded.collected_at
WHERE excluded.collected_at > daily_steps.collected_at`;
