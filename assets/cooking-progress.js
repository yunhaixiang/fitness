(function (host) {
  'use strict';
  function derive(nodes, saved, half = 'first') {
    const active = nodes;
    const byId = new Map(active.map(n => [n.id, n]));
    const done = new Set((Array.isArray(saved) ? saved : []).filter(id => byId.has(id)));
    const complete = id => done.has(id);
    const satisfied = n => n.before.every(complete);
    // Undoing a prerequisite invalidates only its downstream completion marks.
    let changed;
    do {
      changed = false;
      for (const id of done) if (!satisfied(byId.get(id))) { done.delete(id); changed = true; }
    } while (changed);
    const pending = active.filter(n => !done.has(n.id));
    const available = pending.filter(satisfied);
    const next = new Map(active.map(n => [n.id, active.filter(x => x.before.includes(n.id))]));
    const memo = new Map();
    const length = id => {
      if (memo.has(id)) return memo.get(id);
      const n = byId.get(id);
      const score = (complete(id) ? 0 : (n.manual ? 5 : n.minutes || 0)) + Math.max(0, ...next.get(id).map(x => length(x.id)));
      memo.set(id, score); return score;
    };
    // Use already-heated appliances promptly; otherwise prioritize the longest remaining chain.
    const urgent = n => n.id === 'salmon' && done.has('air-heat') ? 3
      : n.id === 'haddock' && done.has('air-heat') ? 2
      : ['eggs', 'pasta', 'dumplings', 'noodles'].includes(n.id) && n.before.some(id => id.endsWith('-water') && done.has(id)) ? 1 : 0;
    available.sort((a,b) => urgent(b) - urgent(a) || Number(!!a.confirmation) - Number(!!b.confirmation) || length(b.id) - length(a.id));
    return { done: [...done], active, available, recommended: available[0]?.id || null, ready: true, total: active.length };
  }
  function toggle(nodes, saved, half, id, checked) {
    const view = derive(nodes, saved, half);
    const done = new Set(view.done);
    if (checked && view.available.some(n => n.id === id)) done.add(id);
    if (!checked) done.delete(id);
    return derive(nodes, [...done], half).done;
  }
  function readState(raw) {
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
    const strings = value => Array.isArray(value) ? value.filter(x => typeof x === 'string') : [];
    // Both halves now have identical tasks. Keep the previously selected batch,
    // rather than merging marks from separate cooking sessions.
    const legacyHalf = parsed?.half === 'second' ? 'second' : 'first';
    const done = strings([2, 3, 4].includes(parsed?.version) ? parsed.done : parsed?.[legacyHalf]);
    for (const id of ['oven-heat', 'air-heat']) if (done.includes(id) && !done.includes(id + '-start')) done.push(id + '-start');
    // A completed legacy finish task included all three newly separated tasks.
    if (done.includes('finish')) {
      done.splice(done.indexOf('finish'), 1);
      for (const id of ['peas-carrots', 'refrigerate', 'clean']) if (!done.includes(id)) done.push(id);
    }
    // Previously, laying out bread was part of assembling either meal.
    if (done.some(id => ['wrap', 'sandwich'].includes(id)) && !done.includes('prep-bread')) done.push('prep-bread');
    // Older tasks included these preparation steps; migrate only old records.
    if (parsed?.version !== 4) {
      const split = { eggs: ['peel-eggs'], ground: ['prep-zucchini'],
        'season-noodles': ['prep-noodle-sauce'], wrap: ['prep-wrap'], sandwich: ['prep-sandwich'] };
      for (const [id, children] of Object.entries(split)) if (done.includes(id)) {
        for (const child of children) if (!done.includes(child)) done.push(child);
      }
    }
    // Legacy running tasks return to unchecked; only completion is persisted.
    return { version: 4, done };
  }
  const api = { derive, toggle, readState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (!host?.document) return;
  host.fitnessCookingProgress = api;
  const root = document.getElementById('cooking-flow'), plan = host.fitnessCookingFlow;
  if (!root || !plan) return;
  const en = host.fitnessI18n?.language === 'en';
  const t = (zh, english) => en ? english : zh;
  const key = host.fitnessMealPlan?.storageKey('fitness-cooking-checklist-v1') || 'fitness-cooking-checklist-v1';
  let state;
  try { state = readState(localStorage.getItem(key)); } catch (_) { state = readState(null); }
  const create = (tag, cls, text) => { const el = document.createElement(tag); el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const panel = create('section', 'cooking-progress');
  panel.setAttribute('aria-label', t('本次做饭进度', 'Cooking Progress'));
  const toolbar = create('div', 'cooking-progress-toolbar');
  const reset = create('button', 'cooking-guide-reset', t('重置本次', 'Reset This Batch')); reset.type = 'button';
  reset.addEventListener('click', () => {
    if (!host.confirm(t('清除本次做饭的完成记录，重新开始？', 'Clear progress for this batch and start again?'))) return;
    state.done = []; save(); render();
  });
  toolbar.append(reset);
  const status = create('div', 'cooking-progress-status'); status.setAttribute('role', 'status');
  const progress = create('progress', ''); progress.setAttribute('aria-label', t('完成进度', 'Completion Progress'));
  const suggestion = create('div', 'cooking-progress-suggestion');
  const readyList = create('div', 'cooking-progress-options');
  const warning = create('p', 'cooking-progress-warning'); warning.hidden = true;
  panel.append(toolbar, status, progress, suggestion, readyList, warning);
  root.prepend(panel);
  const controls = new Map();
  for (const node of plan.nodes) {
    const button = root.querySelector(`button[data-node="${node.id}"]`);
    if (!button) continue;
    const row = button.closest('.cooking-flow-step-row');
    const label = create('label', 'cooking-progress-check');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', node.confirmation ? t(...node.label) : t(`${node.label[0]}完成`, `Mark ${node.label[1]} complete`));
    const badge = create('small', 'cooking-progress-badge');
    button.querySelector('.cooking-flow-step-copy').append(badge);
    label.append(checkbox); row.prepend(label); row.classList.add('has-progress');
    checkbox.addEventListener('change', () => { state.done = toggle(plan.nodes, state.done, 'first', node.id, checkbox.checked); render(); save(); });
    controls.set(node.id, { checkbox, row, badge });
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); warning.hidden = true; }
    catch (_) { warning.textContent = t('浏览器未能保存进度，关闭页面后可能丢失。', 'Your browser could not save progress. It may be lost when you close this page.'); warning.hidden = false; }
  }
  function labelFor(n) {
    const group = plan.groups.find(g => g.id === (n.displayGroup || n.group));
    const name = n.resource === 'pot-1' ? t('煮锅一', 'Pot 1') : n.resource === 'pot-2' ? t('煮锅二', 'Pot 2') : t(...group.title);
    return `${name} · ${t(...n.label)}`;
  }
  function pick(n, cls) {
    const button = create('button', cls, labelFor(n)); button.type = 'button';
    button.addEventListener('click', () => {
      const target = root.querySelector(`button[data-node="${n.id}"]`); target.click(); target.scrollIntoView({ behavior: 'smooth', block: 'center' }); target.focus({ preventScroll: true });
    }); return button;
  }
  function render() {
    const view = derive(plan.nodes, state.done, 'first');
    state.done = view.done;
    const done = new Set(view.done), available = new Set(view.available.map(n => n.id));
    for (const [id, c] of controls) {
      const checked = done.has(id);
      c.checkbox.checked = checked;
      c.checkbox.disabled = !checked && !available.has(id);
      c.row.classList.toggle('is-complete', checked);
      c.row.classList.toggle('is-blocked', !checked && !available.has(id));
      c.row.classList.toggle('is-available', available.has(id));
      c.row.classList.toggle('is-recommended', id === view.recommended);
      c.badge.textContent = checked ? t('已完成', 'Done') : id === view.recommended ? t('推荐下一步', 'Recommended') : available.has(id) ? (plan.nodes.find(n => n.id === id).confirmation ? t('待确认预热完成', 'Confirm When Preheated') : t('现在可做', 'Ready')) : t('等待前置任务', 'Waiting');
    }
    progress.max = view.total; progress.value = done.size;
    status.textContent = t(`已完成 ${done.size} / ${view.total}`, `${done.size} / ${view.total} Completed`);
    suggestion.replaceChildren(); readyList.replaceChildren();
    function action(n, recommended) {
      const row = create('div', 'cooking-progress-action');
      row.append(pick(n, recommended ? 'cooking-progress-next' : 'cooking-flow-chip'));
      return row;
    }
    if (view.recommended) {
      suggestion.append(create('strong', '', t('推荐下一步', 'Recommended Next')), action(view.available[0], true));
      const next = view.available[0];
      const reason = ['salmon','haddock','eggs','pasta','dumplings','noodles'].includes(next.id) ? t('加热已就绪，优先接着烹调。', 'The appliance is ready; continue cooking promptly.') : t('优先启动耗时较长的后续流程。', 'Start the longer remaining chain first.');
      suggestion.append(create('span', 'cooking-progress-reason', next.confirmation ? t('达到预热温度后再确认。', 'Confirm once the target temperature is reached.') : reason));
      const others = view.available.slice(1);
      if (others.length) { readyList.append(create('strong', '', t('现在也可以做', 'Also Ready'))); const list = create('div', 'cooking-flow-chip-list'); others.forEach(n => list.append(action(n, false))); readyList.append(list); }
    } else suggestion.append(create('strong', '', done.size === view.total ? t('本次做饭已全部完成', 'This Batch Is Complete') : t('勾选已完成的前置任务，解锁下一步。', 'Check off completed prerequisites to unlock the next steps.')));
  }
  host.addEventListener('storage', event => { if (event.key === key) { state = readState(event.newValue); render(); } });
  render(); save();
})(typeof window === 'undefined' ? null : window);
