export async function readSleepPlan(db) {
  const row = await db.prepare('SELECT plan_json FROM private_sleep_plan WHERE id = 1').first();
  return row ? JSON.parse(row.plan_json) : {};
}

export function sleepPlanHandler(plan) {
  return {element(el) {
    el.setInnerContent(JSON.stringify(plan).replaceAll('<', '\\u003c'), {html: true});
  }};
}
