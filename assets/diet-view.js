(() => {
  'use strict';

  const en = window.fitnessI18n?.language === 'en';
  const label = (zh, english) => en ? english : zh;
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const value = (row, index) => row.cells[index]?.textContent.trim() || '';
  const putContent = (target, cell) => {
    for (const child of cell.childNodes) target.append(child.cloneNode(true));
  };
  const mount = (table, view) => {
    const source = table.closest('.table-wrap');
    source.after(view);
    source.hidden = true;
  };

  const schedule = document.querySelector('[data-diet-view="schedule"]');
  if (schedule) {
    const rows = [...schedule.tBodies[0].rows];
    const grid = make('div', 'diet-week-grid');
    const kinds = ['wrap', 'rice', 'pasta', 'potato', 'rice', 'pasta', 'potato'];
    for (const [half, halfRows] of [rows.slice(0, 7), rows.slice(7, 14)].entries()) {
      const week = make('section', 'diet-week');
      const heading = make('div', 'diet-week-heading');
      heading.append(make('h3', '', half ? label('后半周', 'Second half') : label('前半周', 'First half')));
      heading.append(make('span', 'diet-week-range', `${value(halfRows[0], 1)} → ${value(halfRows.at(-1), 1)}`));
      week.append(heading);
      const list = make('div', 'diet-meal-list');
      for (const [index, row] of halfRows.entries()) {
        const card = make('article', `diet-meal-card diet-kind-${kinds[index]}`);
        const top = make('div', 'diet-meal-top');
        const when = make('div', 'diet-meal-when');
        when.append(make('span', 'diet-meal-number', String(index + 1).padStart(2, '0')));
        when.append(make('span', '', `${value(row, 1)} · ${value(row, 2)}`));
        top.append(when, make('strong', 'diet-meal-kcal', `${value(row, 6)} kcal`));
        card.append(top, make('h4', 'diet-meal-base', value(row, 3)));
        const ingredients = make('div', 'diet-meal-ingredients');
        for (const [column, zh, english] of [[4, '蛋白质', 'Protein'], [5, '蔬菜', 'Vegetables']]) {
          const line = make('div', 'diet-ingredient');
          line.append(make('span', '', label(zh, english)), make('strong', '', value(row, column)));
          ingredients.append(line);
        }
        card.append(ingredients);
        list.append(card);
      }
      week.append(list);
      grid.append(week);
    }
    mount(schedule, grid);
    const prep = grid.nextElementSibling;
    if (prep?.tagName === 'P') prep.classList.add('diet-prep-note');
  }

  const treats = document.querySelector('[data-diet-view="treats"]');
  if (treats) {
    const grid = make('div', 'diet-treat-grid');
    for (const row of treats.tBodies[0].rows) {
      const card = make('article', 'diet-treat-card');
      const title = make('h4', 'diet-treat-title');
      putContent(title, row.cells[0]);
      const amount = make('div', 'diet-treat-amount');
      amount.append(make('strong', '', value(row, 2)), make('span', '', 'kcal'));
      card.append(title, make('p', 'diet-treat-portion', value(row, 1)), amount);
      const impact = make('div', 'diet-treat-impact');
      impact.append(make('span', '', label('占每周参考赤字', 'Share of reference weekly deficit')),
        make('strong', '', value(row, 3)));
      card.append(impact);
      const track = make('div', 'diet-impact-track');
      track.setAttribute('aria-hidden', 'true');
      const fill = make('span', 'diet-impact-fill');
      const percents = [...value(row, 3).matchAll(/\d+(?:\.\d+)?(?=%)/g)].map((match) => Number(match[0]));
      fill.style.width = `${Math.min(100, Math.max(0, ...percents))}%`;
      track.append(fill);
      card.append(track);
      const remaining = make('div', 'diet-treat-remaining');
      for (const [column, zh, english] of [[4, '剩余每周赤字', 'Weekly deficit left'], [5, '剩余日均赤字', 'Daily average left']]) {
        const metric = make('div', 'diet-treat-metric');
        metric.append(make('span', '', label(zh, english)), make('strong', '', `${value(row, column)} kcal`));
        remaining.append(metric);
      }
      card.append(remaining);
      grid.append(card);
    }
    mount(treats, grid);
  }

  const alternatives = document.querySelector('[data-diet-view="alternatives"]');
  if (alternatives) {
    const grid = make('div', 'diet-swap-grid');
    for (const row of alternatives.tBodies[0].rows) {
      const card = make('article', 'diet-swap-card');
      card.append(make('span', 'diet-swap-craving', value(row, 0)));
      const replacement = make('h4', 'diet-swap-replacement');
      putContent(replacement, row.cells[1]);
      card.append(replacement, make('p', 'diet-swap-portion', value(row, 2)));
      const foot = make('div', 'diet-swap-foot');
      foot.append(make('strong', '', `${value(row, 3)} kcal`), make('span', '', `${value(row, 4)} ${label('每周赤字', 'of weekly deficit')}`));
      card.append(foot);
      grid.append(card);
    }
    mount(alternatives, grid);
  }
})();
