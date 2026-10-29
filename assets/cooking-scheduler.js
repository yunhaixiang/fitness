(() => {
  'use strict';

  // One slot is one minute. Active work uses the cook; heating can overlap.
  const horizon = 210;
  const beamWidth = 24;
  const pans = new Set(['mushroom', 'spinach', 'tomato', 'ground']);
  const continuous = new Set(['wrap', 'finish']);
  const activeTail = { tomato: 3, ground: 4 };
  const capacity = { rice: 1, oven: 3, air: 1, 'pot-1': 1, 'pot-2': 1, saucepan: 1, wok: 1, counter: 1 };
  const resource = (task) => {
    if (task.id === 'egg-water' || task.id === 'eggs') return 'pot-1';
    if (task.id === 'pasta-water' || task.id === 'pasta') return 'pot-2';
    return ({ 'small-wok': 'saucepan', 'large-wok': 'wok', prep: 'counter', wrap: 'counter', finish: 'counter' })[task.group] || task.group;
  };
  const demand = (task) => task.id === 'oven-heat' ? 3 : 1;
  const attentionOffsets = (task, minutes, stirEvery) => {
    if (continuous.has(task.id) || task.group === 'prep') return Array.from({ length: minutes }, (_, index) => index);
    const slots = new Set([0, minutes - 1]);
    const tail = Math.max(1, minutes - (activeTail[task.id] || 0));
    if (pans.has(task.id)) for (let minute = stirEvery; minute < tail; minute += stirEvery) slots.add(minute);
    if (activeTail[task.id]) for (let minute = tail; minute < minutes; minute++) slots.add(minute);
    return [...slots].sort((a, b) => a - b);
  };

  function schedule({ tasks, minutes, done, running, ready, stirEvery = 3, now = Date.now() }) {
    if (!ready) return null;
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const finished = new Set(done);
    // Boiling is confirmed by the cook. Until then, omit its dependent chain
    // from the estimate while still scheduling independent preparation.
    const blocked = new Set(tasks.filter((task) => task.manual && !finished.has(task.id)).map((task) => task.id));
    let changed;
    do {
      changed = false;
      for (const task of tasks) if (!finished.has(task.id) && !blocked.has(task.id) && task.before.some((id) => blocked.has(id))) {
        blocked.add(task.id);
        changed = true;
      }
    } while (changed);
    const planned = tasks.filter((task) => !task.manual && !blocked.has(task.id));
    const active = Object.entries(running).filter(([id]) => planned.some((task) => task.id === id));
    const pending = planned.filter((task) => !finished.has(task.id) && !running[task.id]);
    const minuteLength = (id) => Math.max(1, Math.ceil(minutes[id] || 1));
    const base = {
      starts: {}, ends: Object.fromEntries([...finished].map((id) => [id, 0])),
      human: new Uint8Array(horizon),
      machines: Object.fromEntries(Object.keys(capacity).map((id) => [id, new Uint8Array(horizon)])),
      maxEnd: 0, score: 0
    };

    for (const [id, run] of active) {
      const task = byId.get(id);
      const remaining = Math.max(1, Math.ceil((run.startedAt + run.minutes * 60000 - now) / 60000));
      base.ends[id] = remaining;
      base.maxEnd = Math.max(base.maxEnd, remaining);
      const machine = base.machines[resource(task)];
      for (let time = 0; time < Math.min(remaining, horizon); time++) machine[time] += demand(task);
      const tail = activeTail[id] || 0;
      if (continuous.has(id) || (tail && remaining <= tail)) {
        for (let time = 0; time < Math.min(remaining, horizon); time++) base.human[time]++;
      } else {
        for (let time = Math.max(0, remaining - Math.max(1, tail)); time < remaining && time < horizon; time++) base.human[time]++;
        if (pans.has(id)) {
          const last = run.stirredAt || run.startedAt;
          let due = Math.max(0, Math.ceil((last + stirEvery * 60000 - now) / 60000));
          for (; due < remaining - Math.max(1, tail) && due < horizon; due += stirEvery) base.human[due]++;
        }
      }
    }

    const eligible = (state) => pending.filter((task) => state.ends[task.id] === undefined &&
      task.before.every((id) => id === 'ready' || state.ends[id] !== undefined));
    const bound = (state) => {
      const memo = new Map();
      const endOf = (id) => {
        if (id === 'ready') return 0;
        if (state.ends[id] !== undefined) return state.ends[id];
        if (memo.has(id)) return memo.get(id);
        const task = byId.get(id);
        const end = minuteLength(id) + Math.max(0, ...task.before.map(endOf));
        memo.set(id, end);
        return end;
      };
      return Math.max(state.maxEnd, ...planned.map((task) => endOf(task.id)));
    };
    const place = (state, task) => {
      const length = minuteLength(task.id);
      const first = Math.max(0, ...task.before.map((id) => id === 'ready' ? 0 : state.ends[id]));
      const machineName = resource(task);
      const machine = state.machines[machineName];
      const load = demand(task);
      const offsets = attentionOffsets(task, length, stirEvery);
      for (let start = first; start <= horizon - length; start++) {
        let fits = true;
        for (let time = start; time < start + length; time++) {
          if (machine[time] + load > capacity[machineName]) { fits = false; break; }
        }
        if (!fits || offsets.some((offset) => state.human[start + offset])) continue;
        const next = {
          starts: { ...state.starts, [task.id]: start },
          ends: { ...state.ends, [task.id]: start + length },
          human: state.human.slice(),
          machines: { ...state.machines, [machineName]: machine.slice() },
          maxEnd: Math.max(state.maxEnd, start + length),
          score: 0
        };
        for (let time = start; time < start + length; time++) next.machines[machineName][time] += load;
        for (const offset of offsets) next.human[start + offset]++;
        next.score = bound(next);
        return next;
      }
      return null;
    };

    const rank = (a, b) => a.score - b.score || a.maxEnd - b.maxEnd ||
      Object.values(a.starts).reduce((sum, value) => sum + value, 0) -
      Object.values(b.starts).reduce((sum, value) => sum + value, 0);
    const trim = (states) => {
      states.sort(rank);
      const seen = new Set();
      const beam = [];
      for (const state of states) {
        const key = Object.entries(state.starts).sort(([a], [b]) => a.localeCompare(b))
          .map(([id, start]) => `${id}:${start}`).join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        beam.push(state);
        if (beam.length === beamWidth) break;
      }
      return beam;
    };
    const firstChoices = eligible(base);
    const roots = pending.length ? firstChoices.map((task) => place(base, task)).filter(Boolean) : [base];
    let solutions = [];
    for (const root of roots) {
      let beam = [root];
      for (let depth = 1; depth < pending.length; depth++) {
        const next = [];
        for (const state of beam) for (const task of eligible(state)) {
          const result = place(state, task);
          if (result) next.push(result);
        }
        if (!next.length) { beam = []; break; }
        beam = trim(next);
      }
      solutions.push(...beam);
    }
    if (!solutions.length) return null;
    const best = solutions.sort((a, b) => a.maxEnd - b.maxEnd || rank(a, b))[0];
    return { starts: best.starts, ends: best.ends, minutes: best.maxEnd, partial: blocked.size > 0,
      order: Object.keys(best.starts).sort((a, b) => best.starts[a] - best.starts[b] || best.ends[b] - best.ends[a]) };
  }

  window.fitnessCookingScheduler = { schedule, pans, activeTail };
  if (typeof module !== 'undefined') module.exports = { schedule, attentionOffsets };
})();
