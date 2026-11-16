(() => {
  'use strict';

  // Order activities relative to meals without inventing fixed clock times.
  const activities = [
    { day: 2, after: 'lunch', kind: 'thawing', time: ['中午', 'Midday'], detail: ['将后半周的鸡大腿肉、鸡肉末、三文鱼、排骨从冷冻移入冷藏解冻。', 'Move the second-half portions of chicken thighs, ground chicken, salmon, and ribs from the freezer to the fridge to thaw.'] },
    { day: 0, after: 'lunch', kind: 'cooking', time: ['午餐后', 'After Lunch'], detail: ['准备上1–上7', 'Prepare Meals 1–7 for the First Half of the Week'] },
    { day: 3, after: 'dinner', kind: 'cooking', time: ['晚餐后', 'After Dinner'], detail: ['准备下1–下7', 'Prepare Meals 1–7 for the Second Half of the Week'] },
    { day: 6, after: 'lunch', kind: 'shopping', time: ['下午', 'Afternoon'], detail: ['购买整周食材', 'Buy Groceries for the Week'] }
  ];
  for (const day of [0, 1, 2, 4, 5, 6]) activities.push({ day, after: 'lunch', kind: [0, 6].includes(day) ? 'cardio' : 'strength', time: ['18:00 · 晚饭前', '18:00 · Before Dinner'], detail: [0, 6].includes(day) ? ['有氧训练，按当前有氧计划选择一项。', 'Cardio: choose one option from the current plan.'] : ['完成当天力量训练。', 'Complete today’s strength workout.'] });
  const names = { cardio: ['有氧', 'Cardio'], strength: ['力量', 'Strength'], thawing: ['解冻', 'Thaw Ingredients'], cooking: ['做饭', 'Cooking'], shopping: ['购物', 'Shopping'] };
  const paths = {
    cardio: 'M3 12h4l3-8 4 16 3-8h4',
    strength: 'M3 8v8m4-10v12m10-12v12m4-10v8M7 12h10',
    thawing: 'M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9M9 5l3 3 3-3M9 19l3-3 3 3',
    cooking: 'M5 10h14v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-7Zm-3 2h3m14 0h3M4 7h16M10 4h4',
    shopping: 'M3 9h18l-2 11H5L3 9Zm4 0 3-6m7 6-3-6M9 12v5m6-5v5'
  };
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  function append(container, day, after, compact = false) {
    const language = window.fitnessI18n?.language === 'en' ? 1 : 0;
    for (const event of activities.filter((item) => item.day === day && item.after === after)) {
      const card = make('article', compact ? 'today-meal today-activity' : 'diet-meal-card diet-activity-card');
      card.dataset.activity = event.kind;
      const time = event.time[language];
      const heading = make('div', 'meal-activity-heading');
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'meal-activity-icon');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('stroke-width', '1.7');
      icon.setAttribute('stroke-linecap', 'round');
      icon.setAttribute('stroke-linejoin', 'round');
      icon.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', paths[event.kind]);
      icon.append(path);
      heading.append(icon, make(compact ? 'strong' : 'h4', compact ? '' : 'diet-meal-title', names[event.kind][language]));
      if (!compact) card.append(make('div', 'diet-meal-when', time));
      card.append(heading, make('p', 'meal-activity-detail', `${compact ? time + ' · ' : ''}${event.detail[language]}`));
      if (event.kind !== 'thawing') {
        const link = make('a', 'meal-activity-link', event.kind === 'cardio' ? ['查看有氧选项', 'View Cardio Options'][language] : event.kind === 'strength' ? ['查看力量计划', 'View Strength Plan'][language] : event.kind === 'cooking'
          ? ['开始做饭', 'Start Cooking'][language] : ['查看购物清单', 'View Shopping List'][language]);
        link.href = (!['cardio', 'strength'].includes(event.kind) && window.fitnessMealPlan?.urlFor(event.kind)) || document.querySelector(`.main-nav a[href$="/${event.kind}/"]`)?.href
          || new URL(`${event.kind}/`, new URL(`${document.body.dataset.baseurl || ''}/`, location.origin).href).href;
        card.append(link);
      }
      container.append(card);
    }
  }
  window.fitnessMealActivities = { append };
})();
