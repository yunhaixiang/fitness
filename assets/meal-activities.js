(() => {
  'use strict';

  // Order activities relative to meals without inventing fixed clock times.
  const activities = [
    { day: 0, after: 'lunch', kind: 'cooking', time: ['午餐后', 'After Lunch'], detail: ['准备上1–上7', 'Prepare Meals 1–7 for the First Half of the Week'] },
    { day: 3, after: 'dinner', kind: 'cooking', time: ['晚餐后', 'After Dinner'], detail: ['准备下1–下7', 'Prepare Meals 1–7 for the Second Half of the Week'] },
    { day: 6, after: 'lunch', kind: 'shopping', time: ['下午', 'Afternoon'], detail: ['购买整周食材', 'Buy Groceries for the Week'] }
  ];
  const names = { cooking: ['做饭', 'Cooking'], shopping: ['购物', 'Shopping'] };
  const paths = {
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
      const link = make('a', 'meal-activity-link', event.kind === 'cooking'
        ? ['开始做饭', 'Start Cooking'][language] : ['查看购物清单', 'View Shopping List'][language]);
      link.href = document.querySelector(`.main-nav a[href$="/${event.kind}/"]`)?.href
        || new URL(`${event.kind}/`, document.querySelector('.brand')?.href || location.origin + '/').href;
      card.append(link);
      container.append(card);
    }
  }
  window.fitnessMealActivities = { append };
})();
