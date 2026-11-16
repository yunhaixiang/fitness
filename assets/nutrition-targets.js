/* Personal meal-planning bands, NOT diagnostic thresholds or nutrient ULs.
 * Evidence, deliberate planning margins and exceptions: docs/nutrition-targets.md.
 * Private body/profile values arrive at runtime only; never persist them here.
 */
(() => {
  'use strict';
  const range = (low, high = Infinity, openHigh = false) => ({low, high, openHigh});
  const rule = (best, acceptable, extra = {}) => ({best, acceptable, ...extra});
  const rounded = n => Math.round(n / 5) * 5;
  const valid = (n, low, high) => typeof n === 'number' && Number.isFinite(n) && n >= low && n <= high;
  function targets({kcal, body = {}, profile = {}, dailyBurn} = {}) {
    if (!valid(kcal, 1, 10000)) return {};
    const weight = valid(body.weight, 20, 350) ? body.weight : null;
    const bf = valid(body.bf, 2, 70) ? body.bf : null;
    const lean = weight && bf !== null ? weight * (1 - bf / 100) : null;
    const female = profile.sex === 'female';
    const age = Number(profile.ageYears);
    const profileReady = ['male', 'female'].includes(profile.sex) && valid(age, 18, 120);
    const calcium = age > 70 || female && age > 50 ? 1200 : 1000;
    const iron = female && age <= 50 ? 18 : 8;
    const potassium = female ? 2600 : 3400;
    const vitaminD = age > 70 ? 20 : 15;
    const ala = female ? 1.1 : 1.6;
    const protein = weight ? rule(
      range(rounded(lean ? lean * 2.3 : weight * 1.6), rounded(lean ? lean * 2.8 : weight * 2.0)),
      range(rounded(lean ? lean * 2.0 : weight * 1.4), rounded(lean ? lean * 3.1 : weight * 2.2)),
      {factor: 4, basis: lean ? 'lean' : 'weight'}) : {pending: 'body', factor: 4};
    // Residual carbohydrate budget after protein and fat, not an unrelated AMDR.
    const carbs = protein.best ? rule(
      range(Math.max(130, kcal * .70 / 4 - protein.best.high), Math.max(130, kcal * .75 / 4 - protein.best.low)),
      range(Math.max(130, kcal * .65 / 4 - protein.acceptable.high), Math.max(130, kcal * .80 / 4 - protein.acceptable.low)),
      {factor: 4, basis: 'remainder'}) : {pending: 'body', factor: 4};
    // These fixed adult requirements do NOT shrink with body weight.
    const result = {
      energy: valid(dailyBurn, 651, 10000) ? rule(range(dailyBurn - 500, dailyBurn - 300), range(dailyBurn - 650, dailyBurn - 150), {basis: 'deficit'}) : {pending: 'energy'},
      protein, carbs,
      fat: rule(range(kcal * .25 / 9, kcal * .30 / 9), range(kcal * .20 / 9, kcal * .35 / 9), {factor: 9}),
      saturatedFat: rule(range(0, kcal * .06 / 9, true), range(0, kcal * .10 / 9, true), {factor: 9}),
      fibre: rule(range(30, 40), range(25, 50)),
      addedSugar: rule(range(0, kcal * .05 / 4, true), range(0, kcal * .10 / 4, true), {factor: 4, basis: 'added'}),
      // Proxy evaluations are clearly labelled; no invented total-sugar/cholesterol limit.
      sugar: {proxy: 'addedSugar'},
      cholesterol: {proxy: 'saturatedFat'},
      sodium: rule(range(1500, 2000), range(1000, 2300)),
      calcium: rule(range(calcium, 2000), range(calcium * .8, age > 50 ? 2000 : 2500)),
      iron: rule(range(iron, 20), range(iron * .8, 45)),
      potassium: rule(range(potassium), range(potassium * .8)),
      vitaminD: rule(range(vitaminD, 50), range(vitaminD * .8, 100)),
      vitaminB12: rule(range(2.4), range(2)),
      iodine: rule(range(150, 600), range(120, 1100)),
      ala: rule(range(ala), range(ala * .8)),
      epaDha: rule(range(.25, 2), range(.2, 3))
    };
    // Require private age/sex for the recommendations that depend on them.
    if (!profileReady) for (const key of ['calcium', 'iron', 'potassium', 'vitaminD', 'ala']) result[key] = {pending: 'profile'};
    return result;
  }
  function contains(band, value) {
    return value >= band.low - 1e-9 && (band.openHigh ? value < band.high - 1e-9 : value <= band.high + 1e-9);
  }
  function classify(policy, values) {
    if (!policy?.best || !values || !values.every(v => valid(v, 0, 1e7))) return null;
    if (values.every(v => contains(policy.best, v))) return 'best';
    if (values.every(v => contains(policy.acceptable, v))) return 'acceptable';
    return 'adjust'; // Estimated ranges are graded conservatively, not by their midpoint.
  }
  function parse(text) {
    const values = [...text.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map(m => Number(m[0].replaceAll(',', '')));
    if (!values.length) return null;
    return {values: [values[0], values[1] ?? values[0]], unit: (text.match(/µg|mg|kcal|g/) || [''])[0]};
  }
  const api = {targets, classify, parse};
  if (typeof module !== 'undefined' && module.exports) {module.exports = api; return;}
  window.fitnessNutritionTargets = api;
  api.render = (table, {el, tr, en, val}) => {
    const rows = [...table.tBodies[0].rows].filter(row => row.dataset.nutrient);
    const data = Object.fromEntries(rows.map(row => [row.dataset.nutrient, parse(val(row, 1))]));
    const kcal = data.energy?.values[0];
    let records = {};
    try {records = JSON.parse(document.getElementById('tracking-records')?.textContent || '{}');} catch (_) {}
    const policies = targets({kcal, body: window.fitnessBodyMetrics, profile: records.profile, dailyBurn: window.fitnessEnergyBudget?.dailyBurn});
    const grid = el('div', 'visual-card-grid visual-nutrient-grid');
    const names = {best: tr('最佳', 'Best'), acceptable: tr('可接受', 'Acceptable'), adjust: tr('需调整', 'Adjust')};
    const fmt = n => new Intl.NumberFormat(en ? 'en-CA' : 'zh-CN', {maximumFractionDigits: Math.abs(n) < 10 ? 2 : 1}).format(n);
    const interval = (band, unit, scale = 1) => {
      const lo = band.low * scale, hi = band.high * scale;
      if (lo === 0 && Number.isFinite(hi)) return `${band.openHigh ? '<' : '≤'}${fmt(hi)} ${unit}`;
      if (!Number.isFinite(hi)) return `≥${fmt(lo)} ${unit}`;
      return `${fmt(lo)}–${band.openHigh ? '<' : ''}${fmt(hi)} ${unit}`;
    };
    const outside = (band, unit, scale = 1) => {
      const parts = [];
      if (band.low > 0) parts.push(`<${fmt(band.low * scale)} ${unit}`);
      if (Number.isFinite(band.high)) parts.push(`${band.openHigh ? '≥' : '>'}${fmt(band.high * scale)} ${unit}`);
      return parts.join(tr(' 或 ', ' or ')) || tr('未设上界；不建议为追求数值额外补充', 'No upper bound; do not supplement just to raise this value');
    };
    const withShare = (text, ratio) => ratio ? `${text} · ${ratio}` : text;
    for (const row of rows) {
      const key = row.dataset.nutrient, own = policies[key];
      if (!own) continue;
      const proxy = own.proxy, policy = proxy ? policies[proxy] : own;
      const current = data[key];
      const compared = data[proxy || key];
      const state = classify(policy, compared?.values);
      const card = el('article', 'visual-card visual-nutrient-card nutrient-tier-card');
      card.dataset.nutrient = key;
      if (state) card.dataset.tier = state;
      const head = el('div', 'nutrient-card-heading');
      head.append(el('h3', '', val(row, 0)), el('span', `nutrient-tier-badge tier-${state || 'pending'}`, state ? (proxy ? (key === 'sugar' ? tr('参考添加糖：', 'Added sugar: ') : tr('参考饱和脂肪：', 'Saturated fat: ')) : '') + names[state] : tr('待同步', 'Awaiting data')));
      card.append(head, el('strong', 'visual-metric-large', val(row, 1)));
      if (current && own.factor) {
        const [low, high] = current.values.map(v => fmt(v * own.factor / kcal * 100));
        card.append(el('span', 'nutrient-energy-share', `${low === high ? low : low + '–' + high}% ${tr('总热量', 'of total calories')}`));
      }
      const bottom = el('div', 'visual-nutrient-bottom');
      if (proxy) bottom.append(el('p', 'nutrient-rule-note', key === 'sugar'
        ? tr('总糖不设独立上限；以下评价仅针对添加糖，不代表总糖达标。', 'No separate total-sugar limit. The rating below is for added sugar only.')
        : tr('以下仅评价饱和脂肪；胆固醇需结合血脂，不能据此判断达标。', 'The rating below is for saturated fat only; cholesterol needs blood-lipid context.')));
      if (policy?.best && compared) {
        if (proxy) bottom.append(el('strong', 'nutrient-proxy-value', tr('关联指标：', 'Linked metric: ') + (key === 'sugar' ? tr('添加糖 ', 'Added sugar ') : tr('饱和脂肪 ', 'Saturated fat ')) + compared.values.map(fmt).filter((v, i, a) => i === 0 || v !== a[0]).join('–') + ' ' + compared.unit));
        const track = el('div', 'visual-nutrient-track nutrient-tier-track');
        track.setAttribute('aria-hidden', 'true');
        const ceiling = Math.max(compared.values[1] * 1.15, Number.isFinite(policy.acceptable.high) ? policy.acceptable.high * 1.15 : policy.best.low * 1.8, 1);
        const position = n => Math.max(0, Math.min(100, n / ceiling * 100));
        for (const tier of ['acceptable', 'best']) {
          const band = policy[tier];
          const zone = el('span', `nutrient-band tier-${tier}`);
          zone.style.left = `${position(band.low)}%`;
          zone.style.width = `${position(band.high) - position(band.low)}%`;
          track.append(zone);
        }
        const valueRange = el('span', 'visual-nutrient-value-range');
        valueRange.style.left = `${position(compared.values[0])}%`;
        valueRange.style.width = `${Math.max(0, position(compared.values[1]) - position(compared.values[0]))}%`;
        if (compared.values[0] !== compared.values[1]) track.append(valueRange);
        const marker = el('span', 'visual-nutrient-marker');
        marker.style.left = `${position((compared.values[0] + compared.values[1]) / 2)}%`;
        track.append(marker);
        bottom.append(track);
        const unit = compared.unit;
        const scale = policy.factor ? policy.factor / kcal * 100 : null;
        const labels = [
          ['best', withShare(interval(policy.best, unit), scale && interval(policy.best, '%', scale))],
          ['acceptable', tr('最佳以外，', 'Outside Best, ') + withShare(interval(policy.acceptable, unit), scale && interval(policy.acceptable, '%', scale))],
          ['adjust', withShare(outside(policy.acceptable, unit), scale && outside(policy.acceptable, '%', scale))]
        ];
        // One-sided limits have a simpler, non-overlapping middle band.
        if (policy.best.low === 0 && policy.acceptable.low === 0) {
          const mid = range(policy.best.high, policy.acceptable.high, policy.acceptable.openHigh);
          labels[1][1] = withShare(interval(mid, unit), scale && interval(mid, '%', scale));
        }
        const list = el('dl', 'nutrient-tier-ranges');
        for (const [tier, text] of labels) {
          const line = el('div', `nutrient-tier-line tier-${tier}${tier === state ? ' is-current' : ''}`);
          line.append(el('dt', '', names[tier]), el('dd', '', text));
          list.append(line);
        }
        bottom.append(list);
        const notes = {
          lean: tr('按最新去脂体重估算，取整至5 g；计划目标，非精确生理需求。', 'Estimated from latest fat-free mass, rounded to 5 g; a planning target.'),
          weight: tr('暂缺体脂率，按最新体重估算。', 'Body fat unavailable; based on latest weight.'),
          remainder: tr('先满足蛋白质，再按脂肪预算分配剩余热量。', 'Remaining calories after the protein and fat budgets.'),
          deficit: tr('日均赤字：最佳300–500 kcal；可接受150–650 kcal。', 'Daily deficit: best 300–500 kcal; acceptable 150–650 kcal.'),
          added: tr('按添加糖估算；不含完整水果中的天然糖。', 'Added-sugar estimate; excludes natural sugar in whole fruit.')
        };
        if (!proxy && notes[policy.basis]) bottom.append(el('small', 'nutrient-rule-note', notes[policy.basis]));
      } else {
        const pendingTrack = el('div', 'visual-nutrient-track nutrient-tier-track is-pending');
        pendingTrack.setAttribute('aria-hidden', 'true');
        bottom.append(pendingTrack);
        bottom.append(el('span', 'nutrient-rule-note', policy?.pending === 'profile'
          ? tr('等待私人资料中的年龄和性别。', 'Awaiting age and sex from your private profile.')
          : policy?.pending === 'energy' ? tr('等待体重、个人资料和步数计算消耗。', 'Awaiting weight, profile and steps to estimate expenditure.')
          : tr('等待最新有效体重；不会使用历史固定值代替。', 'Awaiting a valid latest weight; no fixed historical value is substituted.')));
      }
      card.append(bottom); grid.append(card);
    }
    const shell = el('div', 'nutrition-targets');
    shell.append(el('p', 'nutrition-targets-note', tr('按减脂保肌目标分档；是计划评价，不是缺乏或疾病诊断。', 'Bands reflect fat-loss and muscle-retention goals, not diagnoses.')), grid);
    return shell;
  };
})();
