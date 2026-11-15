/* One load model shared by exercise cards, Today and muscle-volume totals.
 * Body fractions are planning proxies, not measured forces or validated
 * exercise-specific percentages: squat/lunge .90, calf raise .95, hinge/bridge
 * .50, side bend .40, crunch .30. They approximate the moving body portion.
 * Keep stationary support/grip loads out (including reverse-crunch dumbbells).
 * Background: https://pubmed.ncbi.nlm.nih.gov/19130641/ includes body mass minus
 * shank mass in a squat volume method; it does not validate our other fractions.
 * Tonnage ignores range of motion/leverage and cannot compare hypertrophy dose.
 */
(() => {
  'use strict';
  const poundsPerKg = 2.20462262185;
  function calculate(data = {}, bodyWeightKg) {
    const listed = Number(data.weight);
    const factor = Number(data.bodyFactor || 0);
    const external = data.weightKind === 'bodyweight' || data.loadRole === 'support' ? 0
      : !Number.isFinite(listed) || listed < 0 ? NaN
      : data.weightKind === 'each' ? listed * 2
      : data.weightKind === 'plates' ? listed + 20 : listed;
    const weight = Number(bodyWeightKg);
    const body = factor > 0 ? (Number.isFinite(weight) && weight >= 20 && weight <= 350 ? weight * poundsPerKg * factor : NaN) : 0;
    return {external, body, total: external + body, factor};
  }
  function label(data, weight, en = false) {
    const load = calculate(data, weight);
    const format = n => Number.isFinite(n) ? new Intl.NumberFormat(en ? 'en-CA' : 'zh-CN', {maximumFractionDigits:1}).format(n) : '—';
    const text = `${en ? 'Volume Load: ' : '统计负重：'}${Number.isFinite(load.total) ? '≈' : ''}${format(load.total)} lbs`;
    const detail = en
      ? `Estimated body load (${load.factor * 100}% of current weight): ${format(load.body)} lbs; external load: ${format(load.external)} lbs. Planning proxy, not measured muscle force.`
      : `估算自重（最新体重的${load.factor * 100}%）：${format(load.body)} lbs；外部负重：${format(load.external)} lbs。用于计划统计，不代表实测肌肉受力。`;
    return {text, detail};
  }
  const api = {calculate, label};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.fitnessExerciseLoad = api;
})();
