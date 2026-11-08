(function (host) {
  'use strict';
  const branchId = half => half === 'second' ? 'cold-second' : 'cold-first';
  function derive(nodes, saved, half = 'first', started = []) {
    const branch = branchId(half);
    const active = nodes.filter(n => !['cold-first', 'cold-second'].includes(n.id) || n.id === branch);
    const byId = new Map(active.map(n => [n.id, n]));
    const done = new Set((Array.isArray(saved) ? saved : []).filter(id => byId.has(id) && id !== 'ready'));
    const complete = id => id === 'ready' ? done.has(branch) : done.has(id);
    const satisfied = n => n.id === 'ready' ? done.has(branch) : n.before.every(complete);
    // Undoing a prerequisite invalidates only its downstream completion marks.
    let changed;
    do {
      changed = false;
      for (const id of done) if (!satisfied(byId.get(id))) { done.delete(id); changed = true; }
    } while (changed);
    const pending = active.filter(n => n.id !== 'ready' && !done.has(n.id));
    const running = new Set((Array.isArray(started) ? started : []).filter(id => pending.some(n => n.id === id && satisfied(n))));
    const appliance = n => n.group === 'prep' ? null : n.resource || (['air','rice','small-wok','large-wok'].includes(n.group) ? n.group : null);
    const busy = new Set(pending.filter(n => running.has(n.id)).map(appliance).filter(Boolean));
    const available = pending.filter(n => satisfied(n) && !running.has(n.id) && !busy.has(appliance(n)));
    const next = new Map(active.map(n => [n.id, active.filter(x => x.before.includes(n.id))]));
    const memo = new Map();
    const length = id => {
      if (memo.has(id)) return memo.get(id);
      const n = byId.get(id);
      const score = (complete(id) ? 0 : (n.manual ? 5 : n.minutes || 0)) + Math.max(0, ...next.get(id).map(x => length(x.id)));
      memo.set(id, score); return score;
    };
    // Use already-heated appliances promptly; otherwise prioritize the longest remaining chain.
    const urgent = n => n.id === 'salmon' && done.has('air-heat') || n.id === 'haddock' && done.has('salmon') || ['eggs', 'pasta', 'dumplings', 'noodles'].includes(n.id) && n.before.some(id => id.endsWith('-water') && done.has(id));
    available.sort((a,b) => Number(urgent(b)) - Number(urgent(a)) || length(b.id) - length(a.id));
    return { done: [...done], running: [...running], active, available, recommended: available[0]?.id || null, ready: done.has(branch), total: active.filter(n => n.id !== 'ready').length };
  }
  function toggle(nodes, saved, half, id, checked, started = []) {
    const view = derive(nodes, saved, half, started);
    const done = new Set(view.done);
    if (checked && (view.available.some(n => n.id === id) || view.running.includes(id))) done.add(id);
    if (!checked) done.delete(id);
    return derive(nodes, [...done], half).done;
  }
  function readState(raw) {
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
    const strings = value => Array.isArray(value) ? value.filter(x => typeof x === 'string') : [];
    return { half: parsed?.half === 'second' ? 'second' : 'first', first: strings(parsed?.first), second: strings(parsed?.second), firstRunning: strings(parsed?.firstRunning), secondRunning: strings(parsed?.secondRunning) };
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
  const halves = create('div', 'cooking-guide-half');
  const halfButtons = new Map();
  for (const [id, label] of [['first', t('前半周', 'First Half')], ['second', t('后半周', 'Second Half')]]) {
    const button = create('button', '', label); button.type = 'button';
    button.addEventListener('click', () => { state.half = id; save(); render(); });
    halfButtons.set(id, button); halves.append(button);
  }
  const reset = create('button', 'cooking-guide-reset', t('重置本次', 'Reset This Batch')); reset.type = 'button';
  reset.addEventListener('click', () => {
    if (!host.confirm(t('清除当前半周的完成记录，重新开始？', 'Clear completion marks for this half-week and start again?'))) return;
    state[state.half] = []; state[state.half + 'Running'] = []; save(); render();
  });
  toolbar.append(halves, reset);
  const status = create('div', 'cooking-progress-status'); status.setAttribute('role', 'status');
  const progress = create('progress', ''); progress.setAttribute('aria-label', t('完成进度', 'Completion Progress'));
  const suggestion = create('div', 'cooking-progress-suggestion');
  const readyList = create('div', 'cooking-progress-options');
  const runningList = create('div', 'cooking-progress-options');
  const warning = create('p', 'cooking-progress-warning'); warning.hidden = true;
  panel.append(toolbar, status, progress, suggestion, runningList, readyList, warning);
  root.prepend(panel);
  const controls = new Map();
  for (const node of plan.nodes) {
    const button = root.querySelector(`button[data-node="${node.id}"]`);
    if (!button) continue;
    const row = button.closest('.cooking-flow-step-row');
    const label = create('label', 'cooking-progress-check');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
    checkbox.setAttribute('aria-label', t(`${node.label[0]}完成`, `Mark ${node.label[1]} complete`));
    const badge = create('small', 'cooking-progress-badge');
    button.querySelector('.cooking-flow-step-copy').append(badge);
    label.append(checkbox); row.prepend(label); row.classList.add('has-progress');
    checkbox.addEventListener('change', () => { state[state.half] = toggle(plan.nodes, state[state.half], state.half, node.id, checkbox.checked, state[state.half + 'Running']); render(); save(); });
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
    const view = derive(plan.nodes, state[state.half], state.half, state[state.half + 'Running']);
    state[state.half] = view.done;
    state[state.half + 'Running'] = view.running;
    const done = new Set(view.done), available = new Set(view.available.map(n => n.id));
    for (const [id, c] of controls) {
      c.row.hidden = ['cold-first', 'cold-second'].includes(id) && id !== branchId(state.half);
      const checked = id === 'ready' ? view.ready : done.has(id);
      c.checkbox.checked = checked;
      c.checkbox.disabled = id === 'ready' || (!checked && !available.has(id) && !view.running.includes(id));
      c.row.classList.toggle('is-complete', checked);
      c.row.classList.toggle('is-running', view.running.includes(id));
      c.row.classList.toggle('is-available', available.has(id));
      c.row.classList.toggle('is-recommended', id === view.recommended);
      c.badge.textContent = checked ? t('已完成', 'Done') : view.running.includes(id) ? t('进行中', 'In Progress') : id === view.recommended ? t('推荐下一步', 'Recommended') : available.has(id) ? t('现在可做', 'Ready') : t('等待前置任务', 'Waiting');
    }
    for (const [id, button] of halfButtons) button.setAttribute('aria-pressed', String(state.half === id));
    progress.max = view.total; progress.value = done.size;
    status.textContent = t(`已完成 ${done.size} / ${view.total}`, `${done.size} / ${view.total} Completed`);
    suggestion.replaceChildren(); readyList.replaceChildren(); runningList.replaceChildren();
    function action(n, recommended) {
      const row = create('div', 'cooking-progress-action');
      row.append(pick(n, recommended ? 'cooking-progress-next' : 'cooking-flow-chip'));
      const start = create('button', 'cooking-guide-minor', t('开始', 'Start')); start.type = 'button';
      start.setAttribute('aria-label', t(`开始${n.label[0]}`, `Start ${n.label[1]}`));
      start.addEventListener('click', () => { state[state.half + 'Running'].push(n.id); render(); save(); });
      row.append(start); return row;
    }
    if (view.running.length) {
      runningList.append(create('strong', '', t('正在做', 'In Progress')));
      for (const id of view.running) {
        const n = plan.nodes.find(n => n.id === id), row = create('div', 'cooking-progress-action');
        row.append(pick(n, 'cooking-flow-chip'));
        const cancel = create('button', 'cooking-guide-minor', t('取消开始', 'Undo Start')); cancel.type = 'button';
        cancel.setAttribute('aria-label', t(`取消开始${n.label[0]}`, `Undo Start ${n.label[1]}`));
        cancel.addEventListener('click', () => { state[state.half + 'Running'] = state[state.half + 'Running'].filter(x => x !== id); render(); save(); });
        row.append(cancel); runningList.append(row);
      }
    }
    if (view.recommended) {
      suggestion.append(create('strong', '', t('推荐下一步', 'Recommended Next')), action(view.available[0], true));
      const next = view.available[0];
      const reason = ['salmon','haddock','eggs','pasta','dumplings','noodles'].includes(next.id) ? t('加热已就绪，优先接着烹调。', 'The appliance is ready; continue cooking promptly.') : t('优先启动耗时较长的后续流程。', 'Start the longer remaining chain first.');
      suggestion.append(create('span', 'cooking-progress-reason', next.group === 'cold' ? t('先确认本次食材就绪。', 'Confirm the ingredients are ready first.') : reason));
      const others = view.available.slice(1);
      if (others.length) { readyList.append(create('strong', '', t('现在也可以做', 'Also Ready'))); const list = create('div', 'cooking-flow-chip-list'); others.forEach(n => list.append(action(n, false))); readyList.append(list); }
    } else suggestion.append(create('strong', '', done.size === view.total ? t('本次做饭已全部完成', 'This Batch Is Complete') : t('等待进行中的任务完成，再勾选解锁下一步。', 'Finish an ongoing task and check it off to unlock the next steps.')));
  }
  host.addEventListener('storage', event => { if (event.key === key) { state = readState(event.newValue); render(); } });
  render();
})(typeof window === 'undefined' ? null : window);
