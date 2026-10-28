(() => {
  'use strict';

  const root = document.getElementById('cooking-guide');
  const plan = window.fitnessCookingFlow;
  if (!root || !plan) return;

  const en = window.fitnessI18n?.language === 'en';
  const t = (zh, english) => en ? english : zh;
  const key = 'fitness-cooking-guide-v1';
  const taskMinutes = {
    rice: 50, 'oven-heat': 15, chicken: 27, potato: 30, ribs: 18,
    'air-heat': 4, salmon: 8, 'egg-water': 8, eggs: 8,
    'pasta-water': 8, pasta: 8, mushroom: 7, spinach: 7,
    tomato: 6, ground: 15, wrap: 6, finish: 15
  };
  const tasks = plan.nodes.filter((node) => Object.hasOwn(taskMinutes, node.id));
  const byId = new Map(tasks.map((node) => [node.id, node]));
  const successors = new Map(tasks.map((node) => [node.id, tasks.filter((other) => other.before.includes(node.id)).map((other) => other.id)]));
  const validIds = new Set(tasks.map((task) => task.id));
  const emptyBatch = () => ({ ready: false, done: [], running: {}, startedAt: null, finishedAt: null });
  const initialState = () => ({ version: 1, selected: 'first', batches: { first: emptyBatch(), second: emptyBatch() } });
  const readState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved?.version !== 1 || !saved.batches) return initialState();
      const state = initialState();
      state.selected = saved.selected === 'second' ? 'second' : 'first';
      for (const half of ['first', 'second']) {
        const record = saved.batches[half] || {};
        state.batches[half] = {
          ready: record.ready === true,
          done: Array.isArray(record.done) ? record.done.filter((id) => validIds.has(id)) : [],
          running: Object.fromEntries(Object.entries(record.running || {}).filter(([id, run]) =>
            validIds.has(id) && Number.isFinite(run?.startedAt) && Number.isFinite(run?.minutes) && run.minutes >= 1 && run.minutes <= 180
          )),
          startedAt: Number.isFinite(record.startedAt) ? record.startedAt : null,
          finishedAt: Number.isFinite(record.finishedAt) ? record.finishedAt : null
        };
      }
      return state;
    } catch (_) { return initialState(); }
  };
  let state = readState();
  const batch = () => state.batches[state.selected];
  const done = (id) => batch().done.includes(id);
  const running = (id) => Boolean(batch().running[id]);
  const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) { /* private browsing */ } };
  const make = (tag, className, content) => {
    const element = document.createElement(tag);
    element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  };
  const button = (label, className, action) => {
    const element = make('button', className, label);
    element.type = 'button';
    element.addEventListener('click', action);
    return element;
  };
  const format = (seconds) => {
    const sign = seconds < 0 ? '+' : '';
    const n = Math.abs(Math.ceil(seconds));
    return `${sign}${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  };
  const remainingSeconds = (run) => (run.startedAt + run.minutes * 60000 - Date.now()) / 1000;
  const dependenciesDone = (task) => task.before.every((id) => id === 'ready' ? batch().ready : done(id));
  const activeTasks = () => tasks.filter((task) => running(task.id));
  const available = () => tasks.filter((task) => !done(task.id) && !running(task.id) && dependenciesDone(task));
  const pathMemo = new Map();
  const pathLength = (id) => {
    if (done(id)) return 0;
    if (pathMemo.has(id)) return pathMemo.get(id);
    const run = batch().running[id];
    const minutes = run ? Math.max(0, remainingSeconds(run) / 60) : taskMinutes[id];
    const length = minutes + Math.max(0, ...successors.get(id).map(pathLength));
    pathMemo.set(id, length);
    return length;
  };
  const rankedAvailable = () => {
    pathMemo.clear();
    return available().sort((a, b) => pathLength(b.id) - pathLength(a.id));
  };
  const appliance = (id) => {
    if (id === 'egg-water' || id === 'eggs') return t('煮锅一', 'Pot 1');
    if (id === 'pasta-water' || id === 'pasta') return t('煮锅二', 'Pot 2');
    const group = plan.groups.find((item) => item.id === byId.get(id)?.group);
    return group ? group.title[en ? 1 : 0] : '';
  };
  const instructions = (id) => {
    if (id === 'egg-water') return t('煮锅一加水，开始烧水；水沸后确认完成。', 'Add water to Pot 1 and bring it to a boil. Confirm when boiling.');
    if (id === 'pasta-water') return t('煮锅二加水，开始烧水；水沸后确认完成。', 'Add water to Pot 2 and bring it to a boil. Confirm when boiling.');
    if (id === 'finish') return t('按分盘表分盘，入冰箱，然后清洗。', 'Portion using the chart below, refrigerate and clean up.');
    if (id === 'wrap') return [document.getElementById('cook-wrap-sauce'), document.getElementById('cook-wrap')]
      .map((card) => card?.querySelector('.cooking-detail-copy')?.textContent.trim()).filter(Boolean).join(' ');
    return document.getElementById(`cook-${id}`)?.querySelector('.cooking-detail-copy')?.textContent.trim() || '';
  };
  const linkTo = (id) => {
    const link = make('a', 'cooking-guide-link', t('查看详细步骤 ↗', 'View Full Steps ↗'));
    link.href = byId.get(id)?.link || '#portions';
    return link;
  };
  const start = (id) => {
    const task = byId.get(id);
    if (!task || !available().some((item) => item.id === id)) return;
    const record = batch();
    const now = Date.now();
    record.startedAt ||= now;
    record.finishedAt = null;
    record.running[id] = { startedAt: now, minutes: taskMinutes[id], alerted: false };
    save();
    render();
  };
  const complete = (id) => {
    if (!running(id)) return;
    const record = batch();
    delete record.running[id];
    record.done.push(id);
    if (record.done.length === tasks.length) record.finishedAt = Date.now();
    save();
    render();
  };
  const adjust = (id, amount) => {
    const run = batch().running[id];
    if (!run) return;
    run.minutes = Math.max(1, Math.min(180, run.minutes + amount));
    run.alerted = false;
    save();
    render();
  };
  const playAlert = () => {
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) {
        const context = new Context();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 680;
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.36);
        oscillator.onended = () => context.close();
      }
      navigator.vibrate?.(150);
    } catch (_) { /* visual timer still works */ }
  };
  const taskCard = (task, variant) => {
    const card = make('article', `cooking-guide-task cooking-guide-task-${variant}`);
    const top = make('div', 'cooking-guide-task-top');
    const title = make('div', 'cooking-guide-task-title');
    title.append(make('strong', '', task.label[en ? 1 : 0]));
    title.append(make('small', '', `${appliance(task.id)} · ${t('计时', 'Timer')} ${batch().running[task.id]?.minutes || taskMinutes[task.id]} ${t('分钟', 'min')}`));
    top.append(title);
    if (variant === 'running') {
      const time = make('time', 'cooking-guide-timer');
      time.dataset.timerId = task.id;
      top.append(time);
    }
    card.append(top);
    const detail = instructions(task.id);
    if (detail) card.append(make('p', 'cooking-guide-instruction', detail));
    const actions = make('div', 'cooking-guide-actions');
    if (variant === 'running') {
      actions.append(button(t('−1 分', '−1 min'), 'cooking-guide-minor', () => adjust(task.id, -1)));
      actions.append(button(t('+1 分', '+1 min'), 'cooking-guide-minor', () => adjust(task.id, 1)));
      actions.append(button(t('确认完成', 'Mark Done'), 'cooking-guide-primary', () => complete(task.id)));
    } else {
      actions.append(button(t('开始计时', 'Start Timer'), 'cooking-guide-primary', () => start(task.id)));
    }
    actions.append(linkTo(task.id));
    card.append(actions);
    return card;
  };
  const render = () => {
    root.replaceChildren();
    const toolbar = make('div', 'cooking-guide-toolbar');
    const choice = make('div', 'cooking-guide-half');
    choice.setAttribute('role', 'group');
    choice.setAttribute('aria-label', t('选择半周', 'Select Half-Week'));
    for (const [id, zh, english] of [['first', '前半周', 'First Half'], ['second', '后半周', 'Second Half']]) {
      const item = button(t(zh, english), '', () => { state.selected = id; save(); render(); });
      item.setAttribute('aria-pressed', String(state.selected === id));
      choice.append(item);
    }
    toolbar.append(choice, button(t('重置本批', 'Reset This Batch'), 'cooking-guide-reset', () => {
      if (!batch().ready && !batch().done.length && !Object.keys(batch().running).length) return;
      if (!window.confirm(t('重新开始本批做饭？当前进度会清空。', 'Start this batch over? Its progress will be cleared.'))) return;
      state.batches[state.selected] = emptyBatch();
      save();
      render();
    }));
    root.append(toolbar);

    const record = batch();
    const progress = make('div', 'cooking-guide-progress');
    progress.append(make('strong', '', t(`已完成 ${record.done.length} / ${tasks.length}`, `${record.done.length} / ${tasks.length} Done`)));
    const bar = make('progress', '', '');
    bar.max = tasks.length;
    bar.value = record.done.length;
    bar.setAttribute('aria-label', t('做饭进度', 'Cooking Progress'));
    progress.append(bar);
    const elapsed = make('span', 'cooking-guide-elapsed');
    elapsed.dataset.elapsed = '';
    progress.append(elapsed);
    root.append(progress);

    const preflight = make('div', `cooking-guide-preflight${record.ready ? ' is-ready' : ''}`);
    const preflightText = make('div', '');
    preflightText.append(make('strong', '', record.ready ? t('食材已就绪', 'Ingredients Ready') : t('先确认食材', 'Check Ingredients')));
    preflightText.append(make('p', '', state.selected === 'first'
      ? t('本批食材备好；留给后半周的肉和半盒排骨冷冻。', 'Prepare this batch; freeze the meat and half-box of ribs for the second half.')
      : t('提前约36小时把冷冻的肉和半盒排骨移入冷藏解冻。', 'Move the frozen meat and half-box of ribs to the fridge about 36 hours ahead.')));
    preflight.append(preflightText);
    if (!record.ready) preflight.append(button(t('食材已就绪', 'Ingredients Ready'), 'cooking-guide-primary', () => { record.ready = true; save(); render(); }));
    root.append(preflight);

    const readyTasks = rankedAvailable();
    const active = activeTasks().sort((a, b) => remainingSeconds(record.running[a.id]) - remainingSeconds(record.running[b.id]));
    const imminent = active.find((task) => remainingSeconds(record.running[task.id]) <= 120);
    const focus = imminent || (!readyTasks.length && active[0]);
    const recommended = make('div', 'cooking-guide-recommendation');
    recommended.append(make('span', 'cooking-guide-eyebrow', focus
      ? imminent
        ? remainingSeconds(record.running[imminent.id]) <= 0 ? t('计时已到，请确认', 'Timer Finished — Check Now') : t('即将到点', 'Almost Done')
        : t('等待计时', 'Waiting on Timer')
      : t('推荐下一步', 'Recommended Next')));
    if (focus) {
      recommended.append(taskCard(focus, 'running'));
    } else if (readyTasks[0]) {
      recommended.append(taskCard(readyTasks[0], 'recommended'));
    } else {
      recommended.append(make('p', '', record.done.length === tasks.length
        ? t('本批已完成。', 'This batch is complete.')
        : t('先确认食材，或完成正在等待的前置任务。', 'Check the ingredients or finish the prerequisite steps.')));
    }
    root.append(recommended);

    const otherActive = active.filter((task) => task.id !== focus?.id);
    if (otherActive.length) {
      const section = make('section', 'cooking-guide-group');
      section.append(make('h3', '', t('进行中', 'In Progress')));
      const list = make('div', 'cooking-guide-task-list');
      otherActive.forEach((task) => list.append(taskCard(task, 'running')));
      section.append(list);
      root.append(section);
    }
    if (readyTasks.length > (focus ? 0 : 1)) {
      const section = make('section', 'cooking-guide-group');
      section.append(make('h3', '', t('还可并行开始', 'Also Ready to Start')));
      const list = make('div', 'cooking-guide-task-list');
      readyTasks.slice(focus ? 0 : 1).forEach((task) => list.append(taskCard(task, 'ready')));
      section.append(list);
      root.append(section);
    }
    if (record.done.length) {
      const completed = make('details', 'cooking-guide-completed');
      const summary = make('summary', '', t(`已完成的任务（${record.done.length}）`, `Completed Tasks (${record.done.length})`));
      completed.append(summary);
      completed.append(make('p', '', record.done.map((id) => byId.get(id).label[en ? 1 : 0]).join(' · ')));
      root.append(completed);
    }
    for (const task of tasks) {
      const buttonInFlow = document.querySelector(`#cooking-flow .cooking-flow-step[data-node="${task.id}"]`);
      buttonInFlow?.classList.toggle('is-guide-done', done(task.id));
      buttonInFlow?.classList.toggle('is-guide-running', running(task.id));
    }
    scheduleKey = scheduleState();
    tick();
  };
  const scheduleState = () => {
    const active = activeTasks().sort((a, b) => remainingSeconds(batch().running[a.id]) - remainingSeconds(batch().running[b.id]));
    const imminent = active.find((task) => remainingSeconds(batch().running[task.id]) <= 120);
    return `${available().map((task) => task.id).join(',')}|${imminent?.id || ''}|${imminent && remainingSeconds(batch().running[imminent.id]) <= 0 ? 'due' : ''}`;
  };
  let scheduleKey = '';
  const tick = () => {
    let changed = false;
    for (const [id, run] of Object.entries(batch().running)) {
      const remaining = remainingSeconds(run);
      const time = root.querySelector(`[data-timer-id="${id}"]`);
      if (time) {
        time.textContent = remaining <= 0 ? t('时间到', 'Time Up') : format(remaining);
        time.classList.toggle('is-due', remaining <= 0);
        time.setAttribute('aria-label', remaining <= 0 ? t('计时结束，请检查并确认完成', 'Timer finished. Check and mark done.') : '');
      }
      if (remaining <= 0 && !run.alerted) { run.alerted = true; changed = true; playAlert(); }
    }
    if (changed) save();
    const elapsed = root.querySelector('[data-elapsed]');
    if (elapsed) elapsed.textContent = batch().startedAt
      ? `${t('本批用时', 'Elapsed')}: ${format(((batch().finishedAt || Date.now()) - batch().startedAt) / 1000)}`
      : t('开始任务后计时', 'Time starts with the first task');
    if (scheduleState() !== scheduleKey) render();
  };
  render();
  window.setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
})();
