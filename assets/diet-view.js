(() => {
  'use strict';

  const en = window.fitnessI18n?.language === 'en';
  const label = (zh, english) => en ? english : zh;
  const titleCase = (value) => en ? window.fitnessI18n.titleCase(value) : value;
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = /^h[1-6]$/.test(tag) ? titleCase(value) : value;
    return node;
  };
  const value = (row, index) => row.cells[index]?.textContent.trim() || '';
  const putContent = (target, cell) => {
    for (const child of cell.childNodes) target.append(child.cloneNode(true));
    if (en) {
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) walker.currentNode.textContent = titleCase(walker.currentNode.textContent);
    }
  };
  const mount = (table, view) => {
    const source = table.closest('.table-wrap');
    source.after(view);
    source.hidden = true;
  };

  const schedule = document.querySelector('[data-diet-view="schedule"]');
  if (schedule) {
    const rows = [...schedule.tBodies[0].rows];
    const nutrition = JSON.parse(document.getElementById('diet-nutrition-data').textContent);
    const view = make('div', 'diet-schedule-view');
    const tabs = make('div', 'weekday-tabs diet-day-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', label('选择星期', 'Choose a day'));
    const grid = make('div', 'diet-week-grid');
    const kinds = ['wrap', 'rice', 'pasta', 'potato', 'rice', 'pasta', 'potato'];
    const buttons = [];
    const panels = [];
    const nutrientFields = [
      ['protein', '蛋白质', 'Protein', 'g'],
      ['carbs', '碳水', 'Carbs', 'g'],
      ['fat', '脂肪', 'Fat', 'g'],
      ['saturatedFat', '饱和脂肪', 'Saturated fat', 'g'],
      ['fibre', '纤维', 'Fibre', 'g'],
      ['sugar', '总糖', 'Sugar', 'g'],
      ['cholesterol', '胆固醇', 'Cholesterol', 'mg'],
      ['sodium', '钠', 'Sodium', 'mg'],
      ['calcium', '钙', 'Calcium', 'mg'],
      ['iron', '铁', 'Iron', 'mg'],
      ['potassium', '钾', 'Potassium', 'mg']
    ];
    const addNutrition = (card, meal) => {
      const nutrientPanel = make('section', 'diet-meal-nutrition');
      nutrientPanel.setAttribute('aria-label', label('每餐营养估算', 'Estimated meal nutrition'));
      nutrientPanel.append(make('h5', '', label('每餐营养', 'Meal nutrition')));
      const metrics = make('dl', 'diet-nutrient-grid');
      for (const [field, zh, english, unit] of nutrientFields) {
        const metric = make('div', 'diet-nutrient');
        metric.append(make('dt', '', label(zh, english)));
        metric.append(make('dd', '', `${meal[field]} ${unit}`));
        metrics.append(metric);
      }
      nutrientPanel.append(metrics);
      card.append(nutrientPanel);
    };
    const days = [
      label('周日', 'Sunday'), label('周一', 'Monday'), label('周二', 'Tuesday'),
      label('周三', 'Wednesday'), label('周四', 'Thursday'), label('周五', 'Friday'),
      label('周六', 'Saturday')
    ];
    const addIngredients = (card, entries) => {
      const ingredients = make('div', 'diet-meal-ingredients');
      for (const [zh, english, content] of entries) {
        const line = make('div', 'diet-ingredient');
        line.append(make('span', '', label(zh, english)), make('strong', '', titleCase(content)));
        ingredients.append(line);
      }
      card.append(ingredients);
    };
    const fruitCard = (dayIndex, snack) => {
      const key = `${dayIndex < 3 ? 'fruit' : 'kiwi'}_${snack ? 'snack' : 'breakfast'}`;
      const meal = nutrition[key];
      const card = make('article', `diet-meal-card diet-kind-${snack ? 'snack' : 'breakfast'}`);
      const top = make('div', 'diet-meal-top');
      const when = make('div', 'diet-meal-when');
      when.append(make('span', '', days[dayIndex]));
      top.append(when, make('strong', 'diet-meal-kcal', `${meal.kcal} kcal`));
      card.append(top, make('h4', 'diet-meal-title', snack ? label('加餐', 'Snack') : label('早餐', 'Breakfast')));
      const food = en ? meal.foodEn : meal.foodZh;
      if (snack) {
        const [fruit, drink] = food.split(en ? ', ' : '，');
        addIngredients(card, [
          ['水果', 'Fruit', fruit],
          ['饮料', 'Drink', drink]
        ]);
      } else {
        const separator = en ? ', ' : '，';
        const parts = food.split(separator);
        addIngredients(card, parts.length === 4 ? [
          ['主食', 'Staple', [parts[1], parts[0]].join(separator)],
          ['水果', 'Fruit', parts[3]],
          ['补剂', 'Supplement', parts[2]]
        ] : [['食物', 'Food', food]]);
      }
      addNutrition(card, meal);
      return card;
    };
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayRows = rows.filter((row) => value(row, 1) === days[dayIndex])
        .sort((a, b) => Number(value(a, 2) === label('晚餐', 'Dinner')) - Number(value(b, 2) === label('晚餐', 'Dinner')));
      const button = make('button', 'weekday-tab');
      button.type = 'button';
      button.id = `diet-day-tab-${dayIndex}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `diet-day-panel-${dayIndex}`);
      button.textContent = days[dayIndex];
      tabs.append(button);
      buttons.push(button);
      const week = make('section', 'diet-week');
      week.id = `diet-day-panel-${dayIndex}`;
      week.setAttribute('role', 'tabpanel');
      week.setAttribute('aria-labelledby', button.id);
      week.hidden = true;
      const list = make('div', 'diet-meal-list');
      list.append(fruitCard(dayIndex, false));
      for (const row of dayRows) {
        const index = rows.indexOf(row);
        const card = make('article', `diet-meal-card diet-kind-${kinds[index % 7]}`);
        const top = make('div', 'diet-meal-top');
        const when = make('div', 'diet-meal-when');
        when.append(make('span', '', value(row, 1)));
        top.append(when, make('strong', 'diet-meal-kcal', `${value(row, 6)} kcal`));
        card.append(top, make('h4', 'diet-meal-title', value(row, 2)));
        addIngredients(card, [
          ['主食', 'Starch', value(row, 3)],
          ['蛋白质', 'Protein', value(row, 4)],
          ['蔬菜', 'Vegetables', value(row, 5)],
          ['饮料', 'Drink', row.dataset.nutritionKey.endsWith('_soy')
            ? label('无糖豆奶 355 mL', '355 mL unsweetened soy milk')
            : label('Fresca 1罐（355 mL）', '1 can of Fresca (355 mL)')]
        ]);
        const meal = nutrition[row.dataset.nutritionKey];
        if (meal) addNutrition(card, meal);
        list.append(card);
      }
      list.append(fruitCard(dayIndex, true));
      week.append(list);
      grid.append(week);
      panels.push(week);
    }
    const activate = (dayIndex) => {
      buttons.forEach((button, index) => {
        const selected = index === dayIndex;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        panels[index].hidden = !selected;
      });
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(index));
      button.addEventListener('keydown', (event) => {
        const next = event.key === 'ArrowRight' ? (index + 1) % buttons.length
          : event.key === 'ArrowLeft' ? (index + buttons.length - 1) % buttons.length
          : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : null;
        if (next === null) return;
        event.preventDefault();
        activate(next);
        buttons[next].focus();
      });
    });
    let selectedDate = new Date().toDateString();
    const selectToday = () => {
      const today = new Date();
      selectedDate = today.toDateString();
      activate(today.getDay());
    };
    const selectTodayIfDateChanged = () => {
      if (new Date().toDateString() !== selectedDate) selectToday();
    };
    selectToday();
    const scheduleToday = () => {
      const next = new Date();
      next.setHours(24, 0, 0, 100);
      setTimeout(() => { selectTodayIfDateChanged(); scheduleToday(); }, next - new Date());
    };
    scheduleToday();
    window.addEventListener('pageshow', selectToday);
    window.addEventListener('focus', selectToday);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) selectToday(); });
    view.append(tabs, grid);
    mount(schedule, view);
    const prep = view.nextElementSibling;
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
      impact.append(make('span', '', titleCase(label('占每周参考赤字', 'Share of weekly deficit'))),
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
      for (const [column, zh, english] of [[4, '剩余每周赤字', 'Weekly deficit left'], [5, '剩余日均赤字', 'Average daily deficit left']]) {
        const metric = make('div', 'diet-treat-metric');
        metric.append(make('span', '', titleCase(label(zh, english))), make('strong', '', `${value(row, column)} kcal`));
        remaining.append(metric);
      }
      card.append(remaining);
      grid.append(card);
    }
    mount(treats, grid);
  }

})();
