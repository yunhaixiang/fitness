(() => {
  'use strict';
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const torontoWeekday = (date = new Date()) => weekdayNames.indexOf(new Intl.DateTimeFormat('en-US', {timeZone: 'America/Toronto', weekday: 'short'}).format(date));
  const eventsForDay = (events, day) => events.filter(event => !Array.isArray(event.days) || event.days.includes(day));
  if (typeof module !== 'undefined' && module.exports) module.exports = {torontoWeekday, eventsForDay};
  if (typeof document === 'undefined') return;
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
  document.getElementById('sleep-empty').hidden = true;
  const timeline = document.getElementById('sleep-timeline');
  const weekdays = document.getElementById('daily-weekdays');
  const heading = document.getElementById('daily-selected-day');
  const dayNames = en ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] : ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const today = torontoWeekday();
  const buttons = new Map();
  function render(day) {
    timeline.replaceChildren();
    heading.textContent = en ? `${dayNames[day]} Schedule` : `${dayNames[day]}安排`;
    for (const [index, button] of buttons) button.setAttribute('aria-pressed', String(index === day));
    for (const event of eventsForDay(plan.events, day)) {
      const row = node('li');
      const details = node('div');
      details.append(node('strong', label(event.title)), node('p', label(event.description)));
      row.append(node('span', en ? (event.timeEn || event.time) : event.time, 'sleep-time'), details);
      timeline.append(row);
    }
  }
  weekdays.hidden = false;
  weekdays.setAttribute('aria-label', en ? 'Choose a day' : '选择星期');
  for (const day of [1, 2, 3, 4, 5, 6, 0]) {
    const button = node('button', `${en ? weekdayNames[day] : dayNames[day]}${day === today ? (en ? ' · Today' : ' · 今天') : ''}`, 'weekday-tab');
    button.type = 'button';
    button.setAttribute('aria-controls', 'sleep-timeline');
    button.addEventListener('click', () => render(day));
    buttons.set(day, button);
    weekdays.append(button);
  }
  render(today);
})();
