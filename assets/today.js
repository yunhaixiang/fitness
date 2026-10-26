(() => {
  'use strict';

  const mealsRoot = document.getElementById('today-meals');
  const trainingRoot = document.getElementById('today-training');
  const dateNode = document.getElementById('today-date');
  const dietTable = document.querySelector('#today-diet-source')?.content.querySelector('[data-diet-view="schedule"]');
  const strengthTables = [...(document.querySelector('#today-strength-source')?.content.querySelectorAll('.training-table') || [])];
  const cardioTable = document.querySelector('#today-cardio-source')?.content.querySelector('.plan-table');
  const nutritionNode = document.getElementById('today-nutrition-data');
  if (!mealsRoot || !trainingRoot || !dateNode || !dietTable || strengthTables.length !== 2 || !cardioTable || !nutritionNode) return;

  const nutrition = JSON.parse(nutritionNode.textContent);
  const i18n = window.fitnessI18n;
  const en = i18n?.language === 'en';
  const label = (zh, english) => en ? english : zh;
  const translated = (value) => en ? i18n.titleCase(i18n.translate(value)) : value;
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const trainingDays = [1, 2, 4, 5];
  const cell = (row, index) => row?.cells[index]?.textContent.trim() || '';
  const element = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  let mode = 'home';
  try { mode = localStorage.getItem('yunhai-fitness-volume-mode') === 'gym' ? 'gym' : 'home'; } catch (_) { /* storage unavailable */ }

  function addMeal(kind, title, food, kcal) {
    const card = element('article', 'today-meal');
    card.dataset.meal = kind;
    const top = element('div', 'today-meal-top');
    top.append(element('span', '', title), element('strong', '', `${kcal} kcal`));
    card.append(top, element('p', '', food));
    mealsRoot.append(card);
  }

  function renderMeals(day) {
    mealsRoot.replaceChildren();
    const fruit = day <= 2 ? 'fruit' : 'kiwi';
    const breakfast = nutrition[`${fruit}_breakfast`];
    const snack = nutrition[`${fruit}_snack`];
    addMeal('breakfast', label('早餐', 'Breakfast'), en ? breakfast.foodEn : breakfast.foodZh, breakfast.kcal);
    const rows = [...dietTable.tBodies[0].rows].filter((row) => cell(row, 1) === weekdays[day]);
    for (const [kind, zh, english] of [['lunch', '午餐', 'Lunch'], ['dinner', '晚餐', 'Dinner']]) {
      const row = rows.find((item) => cell(item, 2) === zh);
      if (!row) continue;
      const food = [3, 4, 5].map((index) => translated(cell(row, index))).filter(Boolean).join(' · ');
      addMeal(kind, label(zh, english), food, cell(row, 6));
    }
    addMeal('snack', label('加餐 · 23:00', 'Snack · 23:00'), en ? snack.foodEn : snack.foodZh, snack.kcal);
  }

  function renderTraining(day) {
    trainingRoot.replaceChildren();
    const cardioRow = cardioTable.tBodies[0].rows[day === 0 ? 6 : day - 1];
    const summary = cell(cardioRow, 1);
    const cardio = cell(cardioRow, 2);
    if (!trainingDays.includes(day)) {
      trainingRoot.append(element('p', 'today-rest', label('今天休息', 'Rest Day')));
      return;
    }

    trainingRoot.append(element('p', 'today-training-summary', translated(summary)));
    const switcher = element('div', 'today-mode-switch');
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', label('训练场地', 'Training Location'));
    for (const [value, zh, english] of [['home', '在家', 'Home'], ['gym', '健身馆', 'Gym']]) {
      const button = element('button', '', label(zh, english));
      button.type = 'button';
      button.setAttribute('aria-pressed', String(mode === value));
      button.addEventListener('click', () => {
        mode = value;
        try { localStorage.setItem('yunhai-fitness-volume-mode', mode); } catch (_) { /* storage unavailable */ }
        renderTraining(day);
      });
      switcher.append(button);
    }
    trainingRoot.append(switcher);

    const body = strengthTables[mode === 'gym' ? 1 : 0].tBodies[trainingDays.indexOf(day)];
    const exercises = element('ul', 'today-exercise-list');
    for (const row of body.rows) {
      const offset = row.cells.length === 6 ? 2 : 0;
      const action = row.cells[offset].querySelector('a');
      const item = element('li');
      const name = element('a', '', translated(action?.textContent.trim() || cell(row, offset)));
      if (action?.href) {
        name.href = action.href;
        name.target = '_blank';
        name.rel = 'noopener noreferrer';
      }
      item.append(name, element('span', '', translated(cell(row, offset + 1))));
      exercises.append(item);
    }
    trainingRoot.append(exercises);
    const cardioLine = element('p', 'today-cardio');
    cardioLine.append(element('strong', '', label('有氧', 'Cardio')));
    const cardioLink = element('a', '', translated(cardio));
    cardioLink.href = document.querySelector('.main-nav a[href$="/cardio/"]')?.href || 'cardio/';
    cardioLine.append(cardioLink);
    trainingRoot.append(cardioLine);
  }

  const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  let shownDate = '';
  function refresh() {
    const now = new Date();
    const key = localDate(now);
    if (key === shownDate) return;
    shownDate = key;
    const day = now.getDay();
    dateNode.dateTime = key;
    const dayName = en ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day] : weekdays[day];
    dateNode.textContent = `${new Intl.DateTimeFormat(en ? 'en-CA' : 'zh-CN', { month: 'long', day: 'numeric' }).format(now)} · ${dayName}`;
    renderMeals(day);
    renderTraining(day);
  }
  function scheduleMidnight() {
    const next = new Date();
    next.setHours(24, 0, 0, 100);
    setTimeout(() => { refresh(); scheduleMidnight(); }, next - new Date());
  }
  refresh();
  scheduleMidnight();
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
