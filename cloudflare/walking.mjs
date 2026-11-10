// Planning estimate, not measured energy expenditure. Level walking net cost:
// 0.1 mL O2/kg/metre × ~5 kcal/L = 0.5 kcal/kg/km (ACSM).
// https://journals.physiology.org/doi/10.1152/japplphysiol.00504.2017
// Step length 0.70 m is an explicit provisional assumption, not measured gait.
// Sedentary allowance and planned exercise remain unchanged; overlapping exercise
// steps cannot be separated with daily step totals alone.
const day = date => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export function walkingEnergy(records, now = new Date()) {
  const today = day(now);
  const start = new Date(today+'T12:00:00Z'); start.setUTCDate(start.getUTCDate()-7);
  const from = start.toISOString().slice(0,10);
  const days = new Map();
  for (const row of records.steps || []) {
    if (!row || row.date < from || row.date >= today || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isInteger(row.steps) || row.steps < 0) continue;
    // Count only completed-day snapshots, never partial same-day uploads.
    if (!row.collectedAt || !Number.isFinite(Date.parse(row.collectedAt)) || day(new Date(row.collectedAt)) <= row.date) continue;
    const old=days.get(row.date);
    if (!old || Date.parse(row.collectedAt)>Date.parse(old.collectedAt)) days.set(row.date,row);
  }
  const weight=Number(records.currentBody?.weight);
  const count=days.size;
  const averageSteps=count ? [...days.values()].reduce((n,r)=>n+r.steps,0)/count : null;
  const dailyKcal=averageSteps!==null && weight>0 && Number.isFinite(weight) ? averageSteps*0.70/1000*weight*0.5 : null;
  return {days:count,from,through:new Date(new Date(today+'T12:00:00Z').getTime()-86400000).toISOString().slice(0,10),averageSteps,weightKg:weight>0?weight:null,stepLengthM:0.70,dailyKcal,weeklyKcal:dailyKcal===null?null:dailyKcal*7};
}
