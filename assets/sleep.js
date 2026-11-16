(() => {
  'use strict';
  const root = document.getElementById('sleep-plan');
  if (!root) return;
  let plan;
  try { plan = JSON.parse(root.textContent); } catch (_) { return; }
  if (!plan.wakeTime || !plan.bedTime || !Array.isArray(plan.events)) return;
  const en = window.fitnessI18n?.language === 'en';
  const label = item => en ? (item.en || item.zh) : item.zh;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const minutes = time => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  const hours = ((minutes(plan.wakeTime) - minutes(plan.bedTime) + 1440) % 1440) / 60;
  const summary = document.getElementById('sleep-summary');
  for (const [title, value] of [
    [en ? 'Wake up' : '起床', plan.wakeTime],
    [en ? 'Lights out' : '关灯上床', plan.bedTime],
    [en ? 'Sleep opportunity' : '预留睡眠时间', `${hours} ${en ? 'hours' : '小时'}`]
  ]) {
    const item = node('div');
    item.append(node('span', title), node('strong', value));
    summary.append(item);
  }
  summary.after(node('p', en ? 'Time in bed is not the same as actual time asleep.' : '预留时间不等于实际睡着的时长。', 'sleep-caption'));
  document.getElementById('sleep-empty').hidden = true;
  const timeline = document.getElementById('sleep-timeline');
  for (const event of plan.events) {
    const row = node('li');
    const details = node('div');
    details.append(node('strong', label(event.title)), node('p', label(event.description)));
    row.append(node('span', event.time, 'sleep-time'), details);
    timeline.append(row);
  }
  if (plan.medicationNotes?.length) {
    document.getElementById('sleep-medications').hidden = false;
    const notes = document.getElementById('sleep-medication-notes');
    for (const note of plan.medicationNotes) notes.append(node('li', label(note)));
    for (const source of plan.sources || []) {
      if (!source.url?.startsWith('https://')) continue;
      const link = node('a', label(source));
      link.href = source.url;
      document.getElementById('sleep-medication-sources').append(link);
    }
  }
})();
