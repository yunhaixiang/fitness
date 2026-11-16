/* Browsing alternatives does not change the repository-selected energy budget. */
(() => {
  'use strict';
  function resolve(catalog) {
    return catalog.plans.find((p) => p.id === catalog.default) || catalog.plans[0];
  }
  function energy(baseline, plan, sessions, walking, metabolism = {}) {
    const valid = value => Number.isFinite(value) && value >= 0;
    const ratio = metabolism.exerciseWeightRatio;
    const weeklyCardio = valid(ratio) && ratio > 0 ? plan.netKcal * sessions * ratio : null;
    const weeklyStrength = valid(ratio) && ratio > 0 && valid(baseline.reference_strength_weekly) ? baseline.reference_strength_weekly * ratio : null;
    const weeklyResting = valid(metabolism.dailyResting) && metabolism.dailyResting > 0 ? metabolism.dailyResting * 7 : null;
    const weeklyActivity = valid(metabolism.dailyActivity) ? metabolism.dailyActivity * 7 : null;
    const parts = [weeklyResting, weeklyActivity, weeklyStrength, weeklyCardio, walking?.weeklyKcal];
    const weeklyBurn = parts.every(valid) ? parts.reduce((sum, value) => sum + value, 0) : null;
    const weeklyDeficit = weeklyBurn !== null && valid(baseline.intake_daily) ? weeklyBurn - baseline.intake_daily * 7 : null;
    return {weeklyResting, weeklyActivity, weeklyStrength, weeklyCardio, weeklyBurn, weeklyDeficit,
      dailyBurn: weeklyBurn === null ? null : weeklyBurn / 7,
      dailyDeficit: weeklyDeficit === null ? null : weeklyDeficit / 7,
      fatEquivalent: weeklyDeficit === null ? null : weeklyDeficit / 7700,
      intakeShare: weeklyBurn > 0 && valid(baseline.intake_daily) ? baseline.intake_daily / (weeklyBurn / 7) * 100 : null};
  }
  // Internal deficits stay positive; display net intake minus expenditure.
  function balance(deficit, digits = 0) {
    if (deficit == null || !Number.isFinite(deficit)) return {value:null,state:'unavailable'};
    const rounded = Number((-deficit).toFixed(digits));
    const value = rounded === 0 ? 0 : rounded;
    return {value,state:value < 0 ? 'deficit' : value > 0 ? 'surplus' : 'balanced'};
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { resolve, energy, balance }; return; }
  const source = document.getElementById('cardio-plan-catalog');
  if (!source) return;
  const catalog = JSON.parse(source.textContent);
  const plan = resolve(catalog);
  if (!plan) return;
  const metabolism = JSON.parse(document.getElementById('metabolic-energy')?.textContent || '{}');
  const ratio = metabolism.exerciseWeightRatio;
  // Names identify the 200/300 kcal planning tiers; actual energy still scales with private weight below.
  const planName = entry => entry.name;
  window.fitnessCardioPlan = {...plan, name: planName(plan), netKcal: Number.isFinite(ratio) && ratio > 0 ? plan.netKcal * ratio : null};
  const en = window.fitnessI18n?.language === 'en';
  const lang = en ? 'en' : 'zh';
  const tr = (zh, english) => en ? english : zh;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const format = (value, digits = 0) => value == null || !Number.isFinite(value) ? '—' : new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: digits, maximumFractionDigits: digits
  }).format(value);
  const formatBalance = (deficit, digits = 0) => {
    const result = balance(deficit, digits);
    return result.value == null ? '—' : new Intl.NumberFormat(en ? 'en-CA' : 'zh-CN', {minimumFractionDigits:digits,maximumFractionDigits:digits,signDisplay:'exceptZero'}).format(result.value);
  };
  window.fitnessEnergyDisplay = {balance, formatBalance};
  const budgetNode = document.getElementById('cardio-energy-baseline');
  if (budgetNode) {
    const baseline = JSON.parse(budgetNode.textContent);
    const walking = JSON.parse(document.getElementById('walking-energy')?.textContent || '{}');
    const budget = energy(baseline, plan, catalog.sessionsPerWeek, walking, metabolism);
    window.fitnessEnergyBudget = budget;
    const walkingRow = document.querySelector('[data-energy-row="walking"]');
    const walkingLabel = walking.days ? tr(`步行（日均 ${format(walking.averageSteps)} 步；近7天已同步 ${walking.days}/7 天）`, `Walking (${format(walking.averageSteps)} Steps/Day; ${walking.days}/7 Days Synced)`) : tr('步行（等待完整日步数）', 'Walking (Awaiting Full-Day Steps)');
    if (walkingRow) {
      walkingRow.cells[0].textContent = walkingLabel;
      walkingRow.cells[1].textContent = format(walking.weeklyKcal,2);
      walkingRow.cells[2].textContent = format(walking.dailyKcal,2);
    }
    for (const node of document.querySelectorAll('[data-energy]')) {
      const unit = node.querySelector('small');
      const key = node.dataset.energy, digits = key === 'fatEquivalent' ? 2 : 0;
      const isBalance = ['dailyDeficit','weeklyDeficit','fatEquivalent'].includes(key);
      if (isBalance) {
        const result = balance(budget[key], digits);
        node.dataset.energyBalance = result.state;
        node.title = result.state === 'deficit' ? tr('赤字：摄入少于消耗','Deficit: intake below expenditure') : result.state === 'surplus' ? tr('盈余：摄入多于消耗','Surplus: intake above expenditure') : result.state === 'balanced' ? tr('收支平衡','Balanced') : tr('等待数据','Awaiting data');
      }
      node.replaceChildren(document.createTextNode((isBalance ? formatBalance(budget[key], digits) : format(budget[key], digits)) + ' '));
      if (unit) node.append(unit);
    }
    const ring = document.querySelector('.nutrition-ring');
    if (ring) {
      ring.style.setProperty('--intake-share', `${Math.max(0, Math.min(100, budget.intakeShare ?? 0))}%`);
      ring.setAttribute('aria-label', budget.intakeShare == null ? tr('等待步数', 'Awaiting Steps') : tr(`日均摄入占消耗${Math.round(budget.intakeShare)}%`, `Daily intake is ${Math.round(budget.intakeShare)}% of calories burned`));
    }
    for (const [type, weekly] of [['resting', budget.weeklyResting], ['activity', budget.weeklyActivity], ['strength', budget.weeklyStrength], ['cardio', budget.weeklyCardio], ['total', budget.weeklyBurn]]) {
      const row = document.querySelector(`[data-energy-row="${type}"]`);
      if (!row) continue;
      row.cells[1].textContent = format(weekly, 2);
      row.cells[2].textContent = format(weekly == null ? null : weekly / 7, 2);
    }
    for (const section of document.querySelectorAll('[data-weekly-deficit]')) section.dataset.weeklyDeficit = budget.weeklyDeficit == null ? '' : String(budget.weeklyDeficit);

  }

  const root = document.getElementById('cardio-options');
  if (root) {
    const switcher = el('section', 'meal-plan-switcher cardio-plan-switcher');
    const control = el('div', 'meal-plan-control');
    const label = el('label', '', tr('有氧计划', 'Cardio Plan'));
    label.htmlFor = 'cardio-plan-select';
    const choices = el('select');
    choices.id = 'cardio-plan-select';
    // The configured current plan always comes first; additional plans remain browsable.
    const ordered = [plan, ...catalog.plans.filter(entry => entry.id !== plan.id)];
    for (const entry of ordered) {
      const option = el('option', '', planName(entry)[lang]);
      option.value = entry.id;
      choices.append(option);
    }
    choices.value = plan.id;
    const summary = el('p', 'meal-plan-summary', `${tr('每周', 'Weekly')} ${catalog.sessionsPerWeek} ${tr('次', 'Sessions')}`);
    if (catalog.plans.length > 1) control.append(label, choices);
    else control.append(el('strong', '', planName(plan)[lang]));
    switcher.append(control, summary);
    const main = document.getElementById('main');
    const heading = main?.querySelector(':scope > .page-heading');
    if (heading) heading.after(switcher);
    else root.before(switcher);
    function show(viewedPlan) {
      root.replaceChildren();
      for (const option of viewedPlan.options) {
        const card = el('article', 'cardio-option-card');
        const head = el('div', 'cardio-option-head');
        head.append(el('h3', '', option.name[lang]), el('span', '', option.duration[lang]));
        card.append(head);
        if (option.video) {
          const link = el('a', 'cardio-video-link');
          link.href = `https://www.youtube.com/watch?v=${option.video}`;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          const media = el('span', 'cardio-video-image');
          const img = el('img');
          img.src = `https://i.ytimg.com/vi/${option.video}/hqdefault.jpg`;
          img.alt = '';
          img.loading = 'lazy';
          const play = el('span', 'cardio-video-play', '▶');
          play.setAttribute('aria-hidden', 'true');
          media.append(img, play);
          link.append(media, el('span', 'cardio-video-label', `${option.creator || ''}${tr(' 跟练视频 ↗', ' Workout Video ↗')}`));
          card.append(link);
        }
        if (option.description[lang]) card.append(el('p', '', option.description[lang]));
        if (option.steps.length) {
          const steps = el('ol');
          option.steps.forEach((step) => steps.append(el('li', '', step[lang])));
          card.append(steps);
        }
        root.append(card);
      }
    }
    choices.addEventListener('change', () => {
      show(catalog.plans.find(entry => entry.id === choices.value) || plan);
    });
    show(plan);
  }
})();
