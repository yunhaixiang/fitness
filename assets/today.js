(() => {
  'use strict';

  function splitFoods(text) {
    const parts = []; let depth = 0, part = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if ('(（'.includes(c)) depth++;
      if (')）'.includes(c)) depth = Math.max(0, depth - 1);
      const thousands = c === ',' && /[0-9]/.test(text[i-1] || '') && /[0-9]/.test(text[i+1] || '');
      if (!depth && !thousands && '，、,·'.includes(c)) { if (part.trim()) parts.push(part.trim()); part = ''; }
      else part += c;
    }
    if (part.trim()) parts.push(part.trim());
    return parts;
  }
  function foodEmoji(text) {
    for (const [pattern, emoji] of [
      [/意面|spaghetti|pasta/i,'🍝'], [/虾|shrimp/i,'🦐'], [/三文鱼|黑线鳕|罗非鱼|金枪鱼|salmon|haddock|tilapia|tuna/i,'🐟'],
      [/蛋黄酱|mayonnaise|chipotle|sauce/i,'🥄'], [/鸡蛋|水煮蛋|boiled egg|eggs?/i,'🥚'], [/鸡|chicken/i,'🍗'], [/排骨|ribs|pork/i,'🍖'],
      [/饺|dumpling/i,'🥟'], [/卷饼|wrap|tortilla/i,'🌯'], [/面包|bread/i,'🍞'], [/米饭|rice/i,'🍚'], [/土豆|potato/i,'🥔'],
      [/西葫芦|zucchini/i,'🥒'], [/菠菜|spinach/i,'🥬'], [/胡萝卜|carrot/i,'🥕'], [/豌豆|peas/i,'🫛'], [/鹰嘴豆|chickpea/i,'🫘'],
      [/豆奶|soy milk/i,'🥛'], [/kiwi|奇异果/i,'🥝'], [/水果|fruit/i,'🍇'], [/核桃|walnut/i,'🌰'], [/谷物|cereal/i,'🥣'],
      [/Fresca|Sparkling Ice|Fuze|气泡水|冰茶/i,'🥤'], [/肌酸|维生素|镁|creatine|vitamin|magnesium|omega/i,'💊']
    ]) if (pattern.test(text)) return emoji;
    return '🍽️';
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = {splitFoods, foodEmoji}; return; }
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

  function addMeal(kind, title, food, kcal) {
    const card = element('article', 'today-meal');
    card.dataset.meal = kind;
    const top = element('div', 'today-meal-top');
    top.append(element('span', '', title), element('strong', '', `${kcal} kcal`));
    const list = element('ul', 'today-food-list');
    const entries = Array.isArray(food) ? food : splitFoods(food).map(text => ({text,emoji:foodEmoji(text)}));
    for (const entry of entries) {
      const text = entry.text ?? (en ? entry.en : entry.zh);
      if (!text) continue;
      const item = element('li');
      const icon = element('span','today-food-emoji',entry.emoji || foodEmoji(text));
      icon.setAttribute('aria-hidden','true');
      item.append(icon,element('span','today-food-text',text));
      list.append(item);
    }
    card.append(top, list);
    mealsRoot.append(card);
  }

  function renderMeals(day) {
    mealsRoot.replaceChildren();
    const fruit = day <= 2 ? 'fruit' : (nutrition.late_fruit_breakfast ? 'late_fruit' : 'kiwi');
    const breakfast = nutrition[`${fruit}_breakfast`];
    const snack = nutrition[`${fruit}_snack`];
    const drink = snack || nutrition.outside_drink;
    window.fitnessMealActivities.append(mealsRoot, day, 'before-breakfast', true);
    addMeal('breakfast', label('🥣 早餐', '🥣 Breakfast'), breakfast.foodItems || (en ? breakfast.foodEn : breakfast.foodZh), breakfast.kcal);
    const rows = [...dietTable.tBodies[0].rows].filter((row) => cell(row, 1) === weekdays[day]);
    for (const [kind, zh, english] of [['lunch', '午餐', 'Lunch'], ['dinner', '晚餐', 'Dinner']]) {
      const row = rows.find((item) => cell(item, 2) === zh);
      if (!row) continue;
      const drink = row.dataset.drink === 'sparkling-ice'
            ? label('Sparkling Ice 橙芒果味气泡水 251.5 mL', '251.5 mL Sparkling Ice Orange Mango')
            : row.dataset.drink === 'fuze' ? label('Fuze Tea 无糖冰茶 250 mL', '250 mL Fuze Tea Zero Sugar')
        : label('Fresca 1罐（355 mL）', '1 can of Fresca (355 mL)');
      const food = [...[3, 4, 5].map((index) => (en && row.cells[index]?.dataset.en ? row.cells[index].dataset.en : translated(cell(row, index)))).filter(Boolean), drink].flatMap(text => splitFoods(text).map(text => ({text,emoji:foodEmoji(text)})));
      window.fitnessMealActivities.append(mealsRoot, day, `before-${kind}`, true);
      addMeal(kind, `${kind === 'lunch' ? '🍱' : '🍽️'} ${label(zh, english)}`, food, cell(row, 6));
      window.fitnessMealActivities.append(mealsRoot, day, kind, true);
    }
    addMeal('beverage', snack ? label('🌙 睡前加餐', '🌙 Bedtime Snack') : label('🥛 餐外饮品', '🥛 Between-Meal Drinks'), drink.foodItems || (en ? drink.foodEn : drink.foodZh), drink.kcal);
  }

  function renderTraining(day) {
    trainingRoot.replaceChildren();
    const cardioRow = cardioTable.tBodies[0].rows[day === 0 ? 6 : day - 1];
    const cardioActive = cardioRow?.dataset.cardio === 'active';
    const strengthActive = trainingDays.includes(day);
    if (strengthActive || cardioActive) trainingRoot.append(element('p', 'today-training-time', label('17:30 · 晚饭前', '17:30 · Before Dinner')));
    if (cardioActive) {
      const cardioLine = element('p', 'today-cardio');
      const plan = window.fitnessCardioPlan;
      cardioLine.append(element('strong', '', plan
        ? plan.name[en ? 'en' : 'zh']
        : label('有氧', 'Cardio')));
      const cardioLink = element('a', '', label('查看选项', 'View Options'));
      cardioLink.href = document.querySelector('.main-nav a[href$="/cardio/"]')?.href || 'cardio/';
      cardioLine.append(cardioLink);
      trainingRoot.append(cardioLine);
    }
    if (!strengthActive) {
      if (!cardioActive) trainingRoot.append(element('p', 'today-rest', label('今天休息', 'Rest Day')));
      return;
    }

    const switcher = element('div', 'today-mode-switch');
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', label('训练场地', 'Training Location'));
    for (const [value, zh, english] of [['home', '在家', 'Home'], ['gym', '健身馆', 'Gym']]) {
      const button = element('button', '', value === 'home' ? label('在家 · 当前', 'Home · Current') : label(zh, english));
      button.type = 'button';
      button.setAttribute('aria-pressed', String(mode === value));
      button.addEventListener('click', () => {
        mode = value;
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
      const kind = action?.dataset.weightKind;
      const suffix = kind === 'bodyweight' ? label('（自重）', ' (bodyweight)')
        : kind === 'each' ? label('／只', ' per dumbbell')
        : kind === 'plates' ? label('（加片总重）', ' (total plates)') : '';
      const weight = kind === 'bodyweight' ? label('自重', 'Bodyweight') : `${label('配重：', 'Weight: ')}${action?.dataset.weight} lbs${suffix}${action?.dataset.loadRole === 'support' ? label('（支撑用）', ' (Support Only)') : ''}`;
      item.append(name, element('span', '', `${translated(cell(row, offset + 1))} · ${weight}`));
      if (Number(action?.dataset.bodyFactor) > 0) {
        const load = window.fitnessExerciseLoad.label(action.dataset, window.fitnessBodyMetrics?.weight, en);
        const loadLine = element('span', 'today-exercise-load', load.text);
        loadLine.title = load.detail;
        item.append(loadLine);
      }
      exercises.append(item);
    }
    trainingRoot.append(exercises);

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
