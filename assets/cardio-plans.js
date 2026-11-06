/* Cardio is selected independently of meal plans. Apply the energy delta before
   the nutrition chart and cheat-meal cards read their source data. */
(() => {
  'use strict';
  function resolve(catalog, savedId, requestedId) {
    return catalog.plans.find((p) => p.id === requestedId)
      || catalog.plans.find((p) => p.id === savedId)
      || catalog.plans.find((p) => p.id === catalog.default) || catalog.plans[0];
  }
  function energy(baseline, plan, sessions) {
    const weeklyCardio = plan.netKcal * sessions;
    const delta = weeklyCardio - baseline.reference_cardio_weekly;
    const weeklyBurn = baseline.weekly_burn + delta;
    const weeklyDeficit = baseline.weekly_deficit_precise + delta;
    return { weeklyCardio, weeklyBurn, weeklyDeficit, dailyBurn: weeklyBurn / 7,
      dailyDeficit: weeklyDeficit / 7, fatEquivalent: weeklyDeficit / 7700,
      intakeShare: baseline.intake_daily / (weeklyBurn / 7) * 100 };
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { resolve, energy }; return; }
  const source = document.getElementById('cardio-plan-catalog');
  if (!source) return;
  const catalog = JSON.parse(source.textContent);
  const key = 'fitness-cardio-plan';
  let saved;
  try { saved = localStorage.getItem(key); } catch (_) { /* URL/default remains available */ }
  const requested = new URL(location.href).searchParams.get('cardio-plan');
  const plan = resolve(catalog, saved, requested);
  if (!plan) return;
  try { localStorage.setItem(key, plan.id); } catch (_) { /* storage unavailable */ }
  window.fitnessCardioPlan = plan;
  const en = window.fitnessI18n?.language === 'en';
  const lang = en ? 'en' : 'zh';
  const tr = (zh, english) => en ? english : zh;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const format = (value, digits = 0) => new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: digits, maximumFractionDigits: digits
  }).format(value);
  const budgetNode = document.getElementById('cardio-energy-baseline');
  if (budgetNode) {
    const baseline = JSON.parse(budgetNode.textContent);
    const budget = energy(baseline, plan, catalog.sessionsPerWeek);
    for (const node of document.querySelectorAll('[data-energy]')) {
      const unit = node.querySelector('small');
      node.replaceChildren(document.createTextNode(format(budget[node.dataset.energy], node.dataset.energy === 'fatEquivalent' ? 2 : 0) + ' '));
      if (unit) node.append(unit);
    }
    const ring = document.querySelector('.nutrition-ring');
    if (ring) {
      ring.style.setProperty('--intake-share', `${Math.max(0, Math.min(100, budget.intakeShare))}%`);
      ring.setAttribute('aria-label', tr(`日均摄入占消耗${Math.round(budget.intakeShare)}%`, `Daily intake is ${Math.round(budget.intakeShare)}% of calories burned`));
    }
    for (const [type, weekly] of [['cardio', budget.weeklyCardio], ['total', budget.weeklyBurn]]) {
      const row = document.querySelector(`[data-energy-row="${type}"]`);
      if (!row) continue;
      row.cells[1].textContent = format(weekly, 2);
      row.cells[2].textContent = format(weekly / 7, 2);
    }
    for (const section of document.querySelectorAll('[data-weekly-deficit]')) section.dataset.weeklyDeficit = String(Math.round(budget.weeklyDeficit));
    const overview = document.querySelector('.nutrition-overview');
    if (overview) {
      const link = el('a', 'cardio-budget-link', `${plan.name[lang]} · ${tr('每周', 'Weekly')} ≈${format(budget.weeklyCardio)} kcal`);
      link.href = `${document.body.dataset.baseurl || ''}/cardio/`;
      overview.append(link);
    }
  }

  const root = document.getElementById('cardio-options');
  if (root) {
    const switcher = el('section', 'meal-plan-switcher cardio-plan-switcher');
    const control = el('div', 'meal-plan-control');
    const label = el('label', '', tr('周有氧计划', 'Weekly Cardio Plan'));
    label.htmlFor = 'cardio-plan-select';
    const select = el('select');
    select.id = label.htmlFor;
    for (const item of catalog.plans) {
      const option = el('option', '', item.name[lang]);
      option.value = item.id;
      select.append(option);
    }
    select.value = plan.id;
    control.append(label, select);
    const detail = el('div', 'meal-plan-detail');
    detail.append(el('p', 'meal-plan-summary', tr(`每次 ${plan.options.length} 选一 · 净消耗 ≈${plan.netKcal} kcal · 每周 ${catalog.sessionsPerWeek} 次`,
      `Choose one per session · ≈${plan.netKcal} net kcal · ${catalog.sessionsPerWeek} sessions/week`)),
      el('span', 'meal-plan-count', tr(`${catalog.plans.length} 套计划`, `${catalog.plans.length} ${catalog.plans.length === 1 ? 'Plan' : 'Plans'}`)));
    switcher.append(control, detail);
    document.querySelector('.page-heading')?.after(switcher);
    select.addEventListener('change', () => {
      try { localStorage.setItem(key, select.value); } catch (_) { /* URL fallback */ }
      const url = new URL(location.href);
      url.searchParams.set('cardio-plan', select.value);
      location.assign(url.href);
    });
    for (const option of plan.options) {
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
        link.append(media, el('span', 'cardio-video-label', tr('Juice & Toya 跟练视频 ↗', 'Juice & Toya Workout Video ↗')));
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
  // Refresh stale pages when the choice changes in another tab or via Back.
  window.addEventListener('storage', (event) => { if (event.key === key && event.newValue !== plan.id) location.reload(); });
  window.addEventListener('pageshow', (event) => { if (event.persisted) location.reload(); });
})();
