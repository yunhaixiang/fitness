(() => {
  'use strict';

  const en = window.fitnessI18n?.language === 'en';
  const tr = (zh, english) => en ? english : zh;
  const titleCase = (value) => en ? window.fitnessI18n.titleCase(value) : value;
  const el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = /^h[1-6]$/.test(tag) ? titleCase(content) : content;
    return node;
  };
  const val = (row, index) => row.cells[index]?.textContent.trim() || '';
  const copy = (target, cell) => {
    for (const child of cell.childNodes) target.append(child.cloneNode(true));
  };
  const number = (value) => Number((value.replaceAll(',', '').match(/\d+(?:\.\d+)?/) || [0])[0]);
  const mount = (table, view) => {
    const wrap = table.closest('.table-wrap');
    wrap.after(view);
    wrap.hidden = true;
  };
  const tables = [...document.querySelectorAll('.plan-table')];
  const page = location.pathname.split('/').filter(Boolean).at(-1);

  if (page === 'shopping' && tables[0]) {
    const table = tables[0];
    const rows = [...table.tBodies[0].rows];
    const items = rows.filter((row) => row.dataset.itemKey && row.dataset.itemKey !== '每周合计');
    const checkableItems = items.filter((row) => row.querySelector('input[type="checkbox"]'));
    const shell = el('div', 'visual-shopping');
    const total = rows.at(-1);
    const feesConfig = document.querySelector('#shopping-fees-config');
    if (feesConfig && window.fitnessShoppingCosts) {
      const config = JSON.parse(feesConfig.textContent);
      const costs = window.fitnessShoppingCosts.calculateShoppingCosts(items.map(row => ({
        id: row.dataset.priceId, weeklyCost: row.dataset.weeklyCost, taxable: row.dataset.taxable === 'true'
      })), config);
      const money = cents => `$${(cents / 100).toFixed(2)}`;
      shell.append(el('p', 'visual-shopping-total', tr('每周合计', 'Weekly Total') + ` · ≈${money(costs.total)} CAD`));
      const breakdown = el('dl', 'shopping-cost-breakdown');
      for (const [label, amount, detail] of [
        [tr('商品', 'Groceries & Supplements'), money(costs.goods), ''],
        [tr('配送小费', 'Delivery Tip'), money(costs.tip), ''],
        [tr('Uber Eats配送', 'Uber Eats Delivery'), '≈' + money(costs.delivery + costs.service),
          tr('配送$5，服务费$15', '$5 Delivery + $15 Service Fee')],
        [tr('消费税', 'Sales Tax'), '≈' + money(costs.tax), tr('HST 13% · 仅应税项目', '13% HST · Taxable Items Only')]
      ]) {
        const line = el('div', 'shopping-cost-line');
        const term = el('dt', '', label);
        if (detail) term.append(el('small', '', detail));
        line.append(term, el('dd', '', amount));
        breakdown.append(line);
      }
      shell.append(breakdown, el('p', 'shopping-cost-note', tr(
        '每周1单，非Uber One；配送和税费按预算计，按需补货另计，实际以结账为准。',
        'One order per week without Uber One. Fees and tax are budget estimates; extra restocking is not included. Actual checkout charges may differ.'
      )));
    } else if (total && !total.querySelector('input')) {
      shell.append(el('p', 'visual-shopping-total', titleCase(`${val(total, 1)} · ${val(total, 4)}`)));
    }
    const overview = el('div', 'visual-shopping-overview');
    const count = el('strong', 'visual-shopping-count');
    const countLabel = el('span', '', tr('项已买', 'Items Bought'));
    const track = el('div', 'visual-progress-track');
    const fill = el('span', 'visual-progress-fill');
    track.append(fill);
    overview.append(count, countLabel, track);
    shell.append(overview);
    const weekly = el('div', 'visual-card-grid');
    const fortnightly = el('div', 'visual-card-grid');
    const restock = el('div', 'visual-card-grid');
    const cards = new Map();
    const refresh = () => {
      const done = checkableItems.filter((row) => row.querySelector('input').checked).length;
      count.textContent = `${done} / ${checkableItems.length}`;
      fill.style.width = `${checkableItems.length ? 100 * done / checkableItems.length : 0}%`;
    };
    for (const row of items) {
      const card = el('article', 'visual-card visual-shopping-card');
      const top = el('div', 'visual-card-top');
      const box = row.querySelector('input[type="checkbox"]');
      const cardBox = box?.cloneNode(true);
      const check = el(box ? 'label' : 'div', 'visual-shopping-check');
      if (cardBox) {
        cardBox.checked = box.checked;
        check.append(cardBox);
      }
      check.append(el('span', '', titleCase(val(row, 1))));
      const price = el('strong', 'visual-price');
      copy(price, row.cells[4]);
      price.title = tr('商品单价（CAD）', 'Unit Price (CAD)');
      top.append(check, price);
      card.append(top);
      const product = el('div', 'visual-shopping-product');
      copy(product, row.cells[2]);
      card.append(product, el('span', 'visual-badge', titleCase(val(row, 3))));
      if (row.dataset.weeklyCost) card.append(el('span', 'visual-badge', tr('每周金额', 'Weekly Cost') + ` · $${row.dataset.weeklyCost}`));
      if (box) {
        const updateCard = () => {
          cardBox.checked = box.checked;
          card.classList.toggle('is-checked', box.checked);
          refresh();
        };
        box.addEventListener('change', updateCard);
        cardBox.addEventListener('change', () => {
          box.checked = cardBox.checked;
          box.dispatchEvent(new Event('change', { bubbles: true }));
        });
        updateCard();
      }
      cards.set(row, card);
      const group = row.dataset.purchaseGroup || (row.dataset.restock === 'true' ? 'restock' : 'weekly');
      ({ weekly, fortnightly, restock }[group] || restock).append(card);
    }
    const section = (title, grid) => {
      if (!grid.children.length) return;
      shell.append(el('h2', 'visual-section-label', title), grid);
    };
    section(tr('每周购买', 'Weekly'), weekly);
    section(tr('每两周购买', 'Every Two Weeks'), fortnightly);
    section(tr('三周及以上／按需补充', 'Every Three Weeks or Longer / As Needed'), restock);
    mount(table, shell);
    document.querySelector('#shopping-search')?.addEventListener('input', () => {
      for (const [row, card] of cards) card.hidden = row.hidden;
    });
    document.querySelector('#shopping-reset')?.addEventListener('click', () => {
      for (const [row, card] of cards) {
        const box = row.querySelector('input');
        if (!box) continue;
        const checked = box.checked;
        card.querySelector('input').checked = checked;
        card.classList.toggle('is-checked', checked);
      }
      refresh();
    });
    refresh();
  }

  if (page === 'cooking' && tables.length === 5) {
    const portions = el('div', 'visual-card-grid');
    for (const row of tables[0].tBodies[0].rows) {
      const card = el('article', 'visual-card visual-portion-card');
      card.append(el('h3', '', val(row, 0)), el('p', '', val(row, 1)));
      portions.append(card);
    }
    mount(tables[0], portions);
    for (let index = 1; index < tables.length; index++) {
      const table = tables[index];
      const names = [...table.tHead.rows[0].cells].map((cell) => cell.textContent.trim());
      const grid = el('div', 'visual-card-grid');
      for (const row of table.tBodies[0].rows) {
        const card = el('article', 'visual-card visual-season-card');
        card.append(el('h3', '', val(row, 0)));
        const tags = el('div', 'visual-season-list');
        for (let column = 1; column < row.cells.length; column++) {
          if (!val(row, column) || val(row, column) === '—') continue;
          const tag = el('div', 'visual-season-tag');
          tag.append(el('span', '', titleCase(names[column])), el('strong', '', val(row, column)));
          tags.append(tag);
        }
        card.append(tags);
        grid.append(card);
      }
      mount(table, grid);
    }
  }

  if (page === 'strength' && tables.length === 2) {
    const root = document.querySelector('#strength-root');
    if (!root) return;
    const days = { '一': ['周一', 'Monday'], '二': ['周二', 'Tuesday'], '四': ['周四', 'Thursday'], '五': ['周五', 'Friday'], Mon: ['周一', 'Monday'], Tue: ['周二', 'Tuesday'], Thu: ['周四', 'Thursday'], Fri: ['周五', 'Friday'] };
    const weekdays = [['周日', 'Sunday'], ['周一', 'Monday'], ['周二', 'Tuesday'], ['周三', 'Wednesday'], ['周四', 'Thursday'], ['周五', 'Friday'], ['周六', 'Saturday']];
    const trainingDays = [1, 2, 4, 5];
    let activeDay = new Date().getDay();
    const dayTabs = el('div', 'weekday-tabs strength-day-tabs');
    dayTabs.setAttribute('role', 'group');
    dayTabs.setAttribute('aria-label', tr('选择星期', 'Choose a day'));
    const dayButtons = weekdays.map(([zh, english], index) => {
      const button = el('button', 'weekday-tab', tr(zh, english));
      button.type = 'button';
      button.addEventListener('click', () => showDay(index));
      dayTabs.append(button);
      return button;
    });
    root.append(dayTabs);
    const modes = [['home', '在家', 'Home'], ['gym', '健身馆', 'Gym']];
    const toolbar = el('section', 'meal-plan-switcher strength-switch');
    const control = el('div', 'meal-plan-control');
    const label = el('label', '', tr('力量计划', 'Strength Plan'));
    label.htmlFor = 'strength-plan-select';
    const choices = el('select');
    choices.id = 'strength-plan-select';
    const panels = new Map();
    for (const [mode, zh, english] of modes) {
      const option = el('option', '', mode === 'home' ? tr('当前 · 在家', 'Current · Home') : tr('计划 2 · 健身馆', 'Plan 2 · Gym'));
      option.value = mode;
      choices.append(option);
    }
    choices.addEventListener('change', () => show(choices.value));
    control.append(label, choices);
    toolbar.append(control);
    root.append(toolbar);
    const gymWeightNote = document.querySelector('#gym-weight-note');
    for (const [index, [mode]] of modes.entries()) {
      const table = tables[index];
      const panel = el('section', 'strength-mode-panel');
      panel.id = `strength-${mode}`;
      panel.setAttribute('aria-label', tr(modes[index][1], modes[index][2]));
      if (mode === 'gym' && gymWeightNote) panel.append(gymWeightNote);
      const stack = el('div', 'visual-training-stack');
      const sections = new Map();
      for (const [bodyIndex, body] of [...table.tBodies].entries()) {
        const first = body.rows[0];
        if (!first) continue;
        const key = val(first, 0);
        const day = el('section', 'visual-training-day');
        day.dataset.weekday = trainingDays[bodyIndex];
        const head = el('div', 'visual-training-head');
        const title = el('h3', '', tr(...(days[key] || [key, key])));
        const progress = el('span', 'visual-training-progress');
        head.append(title, el('span', 'visual-training-duration', val(first, 1)), progress);
        day.append(head);
        const list = el('div', 'visual-training-list');
        const boxes = [];
        for (const row of body.rows) {
          const offset = row === first ? 2 : 0;
          const action = row.cells[offset].querySelector('a');
          const label = titleCase(action?.textContent.trim() || val(row, offset));
          const card = el('article', 'visual-card visual-exercise-card');
          const media = el('a', 'visual-exercise-media');
          media.href = action?.href || '#';
          media.target = '_blank';
          media.rel = 'noopener noreferrer';
          media.setAttribute('aria-label', `${tr('观看动作示范：', 'Watch demonstration: ')}${label}`);
          const video = new URL(media.href, location.href).searchParams.get('v');
          if (video && /^[A-Za-z0-9_-]{11}$/.test(video)) {
            const preview = el('img', 'visual-exercise-thumbnail');
            preview.src = `https://i.ytimg.com/vi/${video}/mqdefault.jpg`;
            preview.alt = '';
            preview.loading = 'lazy';
            preview.decoding = 'async';
            preview.addEventListener('error', () => { preview.hidden = true; });
            media.append(preview);
          }
          media.append(el('span', 'visual-exercise-play', '▶'));
          const content = el('div', 'visual-exercise-content');
          const name = el('h4', 'visual-exercise-name');
          const nameLink = el('a', '', label);
          nameLink.href = media.href;
          nameLink.target = '_blank';
          nameLink.rel = 'noopener noreferrer';
          name.append(nameLink);
          const dose = el('strong', 'visual-exercise-dose', val(row, offset + 1));
          const weight = action?.dataset.weight;
          const kind = action?.dataset.weightKind;
          const suffix = kind === 'bodyweight' ? tr('（自重）', ' (bodyweight)')
            : kind === 'each' ? tr('／只', ' per dumbbell')
            : kind === 'plates' ? tr('（加片总重）', ' (total plates)') : '';
          const weightLine = el('span', 'visual-exercise-weight', kind === 'bodyweight' ? tr('自重', 'Bodyweight') : `${tr('配重：', 'Weight: ')}${weight} lbs${suffix}${action?.dataset.loadRole === 'support' ? tr('（支撑用）', ' (Support Only)') : ''}`);
          const sets = el('div', 'visual-set-list');
          for (const setLabel of [...row.cells[offset + 2].querySelectorAll('label')]) {
            boxes.push(setLabel.querySelector('input'));
            sets.append(setLabel);
          }
          const details = el('div', 'visual-exercise-details');
          details.append(weightLine);
          if (Number(action?.dataset.bodyFactor) > 0) {
            const load = window.fitnessExerciseLoad.label(action.dataset, window.fitnessBodyMetrics?.weight, en);
            const loadLine = el('span', 'visual-exercise-load', load.text);
            loadLine.title = load.detail;
            details.append(loadLine);
          }
          details.append(el('span', 'visual-exercise-muscles', titleCase(val(row, offset + 3))));
          content.append(name, dose, details, sets);
          card.append(media, content);
          list.append(card);
        }
        const refresh = () => {
          const done = boxes.filter((box) => box.checked).length;
          progress.textContent = `${done}/${boxes.length} ${tr('组', 'sets')}`;
        };
        for (const box of boxes) box.addEventListener('change', refresh);
        document.addEventListener('fitness:training-day-reset', refresh);
        refresh();
        day.append(list);
        sections.set(trainingDays[bodyIndex], day);
      }
      for (let weekday = 0; weekday < 7; weekday++) {
        if (sections.has(weekday)) {
          stack.append(sections.get(weekday));
          continue;
        }
        const rest = el('section', 'visual-training-day visual-rest-day');
        rest.dataset.weekday = weekday;
        rest.append(el('h3', '', tr(...weekdays[weekday])), el('p', '', tr('今天没有安排力量训练。', 'No strength training scheduled today.')));
        stack.append(rest);
      }
      panel.append(stack);
      panels.set(mode, panel);
      root.append(panel);
    }
    function show(mode) {
      choices.value = mode;
      for (const [name, panel] of panels) panel.hidden = name !== mode;
      showDay(activeDay);
    }
    function showDay(weekday) {
      activeDay = weekday;
      dayButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === weekday)));
      for (const panel of panels.values()) {
        for (const day of panel.querySelectorAll('.visual-training-day')) {
          day.hidden = Number(day.dataset.weekday) !== weekday;
        }
      }
    }
    for (const table of tables) {
      const wrap = table.closest('.table-wrap');
      if (wrap.previousElementSibling?.tagName === 'H2') wrap.previousElementSibling.hidden = true;
      wrap.hidden = true;
    }
    show('home');
    let selectedDate = new Date().toDateString();
    const selectToday = () => {
      const today = new Date();
      selectedDate = today.toDateString();
      showDay(today.getDay());
    };
    const selectTodayIfDateChanged = () => {
      if (new Date().toDateString() !== selectedDate) selectToday();
    };
    const scheduleToday = () => {
      const next = new Date();
      next.setHours(24, 0, 0, 100);
      setTimeout(() => { selectTodayIfDateChanged(); scheduleToday(); }, next - new Date());
    };
    scheduleToday();
    window.addEventListener('pageshow', selectToday);
    window.addEventListener('focus', selectToday);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) selectToday(); });
  }

  if (page === 'cardio' && tables.length === 1) {
    const week = el('div', 'visual-week-strip');
    for (const row of tables[0].tBodies[0].rows) {
      const rest = row.dataset.cardio === 'rest';
      const card = el('article', `visual-card visual-day-card${rest ? ' is-rest' : ''}`);
      card.append(el('strong', 'visual-day-name', val(row, 0)), el('span', '', val(row, 1)));
      week.append(card);
    }
    mount(tables[0], week);
  }

  if (page === 'stats' && tables.length === 2) {
    const energyRows = [...tables[0].tBodies[0].rows];
    const breakdown = energyRows.slice(0, -1);
    const totalRow = energyRows.at(-1);
    const incomplete = breakdown.some(row => val(row,1).includes('—'));
    const total = incomplete ? 0 : breakdown.reduce((sum, row) => sum + number(val(row, 1)), 0);
    const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
    const chart = el('figure', 'visual-expenditure');
    const plot = el('div', 'visual-expenditure-plot');
    const pie = el('div', 'visual-expenditure-pie');
    pie.setAttribute('role', 'img');
    const legend = el('ul', 'visual-expenditure-legend');
    const stops = [];
    const descriptions = [];
    let position = 0;
    for (const [index, row] of breakdown.entries()) {
      const name = val(row, 0);
      const share = total ? number(val(row, 1)) / total * 100 : 0;
      const end = index === breakdown.length - 1 ? 100 : position + share;
      const color = colors[index % colors.length];
      stops.push(`${color} ${position.toFixed(3)}% ${end.toFixed(3)}%`);
      position = end;
      const percentage = incomplete ? '—' : `${share.toFixed(1)}%`;
      descriptions.push(`${name} ${percentage}`);
      const item = el('li', 'visual-expenditure-item');
      const nameLine = el('div', 'visual-expenditure-name');
      const swatch = el('span', 'visual-expenditure-swatch');
      swatch.style.backgroundColor = color;
      swatch.setAttribute('aria-hidden', 'true');
      nameLine.append(swatch, el('span', '', name));
      item.append(nameLine, el('strong', 'visual-expenditure-percent', percentage));
      const values = el('div', 'visual-expenditure-values');
      values.append(el('span', '', `${tr('日均', 'Daily')} ${val(row, 2)} kcal`), el('span', '', `${tr('每周', 'Weekly')} ${val(row, 1)} kcal`));
      item.append(values);
      legend.append(item);
    }
    pie.style.background = incomplete ? 'var(--surface)' : `conic-gradient(${stops.join(', ')})`;
    pie.setAttribute('aria-label', descriptions.join(window.fitnessI18n?.language === 'en' ? '; ' : '；'));
    const totalLabel = el('div', 'visual-expenditure-total');
    totalLabel.append(el('span', '', tr('合计日均消耗', 'Total Daily Calories Burned')), el('strong', '', `${val(totalRow, 2)} kcal`), el('small', '', `${tr('每周', 'Weekly')} ${val(totalRow, 1)} kcal`));
    plot.append(pie, totalLabel);
    chart.append(plot, legend);
    mount(tables[0], chart);

    const intakeHost = document.querySelector('[data-intake-chart]');
    if (intakeHost) {
      // Normalize arc geometry only. Percentage labels use total food calories,
      // exactly like the merged nutrient cards; fibre/rounding can change the sum.
      const macros = [
        { key: 'protein', name: tr('蛋白质', 'Protein'), factor: 4 },
        { key: 'carbs', name: tr('碳水', 'Carbohydrates'), factor: 4 },
        { key: 'fat', name: tr('脂肪', 'Fat'), factor: 9 }
      ].map(macro => {
        const row = tables[1].querySelector(`[data-macro="${macro.key}"]`);
        const grams = number(row ? val(row, 1) : '0');
        return { ...macro, grams, kcal: grams * macro.factor };
      });
      const foodEnergy = number(val(tables[1].querySelector('[data-nutrient="energy"]'), 1));
      const macroEnergy = macros.reduce((sum, macro) => sum + macro.kcal, 0);
      const intake = el('figure', 'visual-expenditure visual-intake');
      const intakePlot = el('div', 'visual-expenditure-plot');
      const intakePie = el('div', 'visual-expenditure-pie');
      intakePie.setAttribute('role', 'img');
      const intakeLegend = el('ul', 'visual-expenditure-legend');
      const intakeStops = [];
      const intakeDescriptions = [];
      let start = 0;
      for (const [index, macro] of macros.entries()) {
        const share = macroEnergy ? macro.kcal / macroEnergy * 100 : 0;
        const end = index === macros.length - 1 ? 100 : start + share;
        const color = colors[index];
        intakeStops.push(`${color} ${start.toFixed(3)}% ${end.toFixed(3)}%`);
        start = end;
        const percent = `${(foodEnergy ? macro.kcal / foodEnergy * 100 : 0).toFixed(1)}%`;
        intakeDescriptions.push(`${macro.name}: ${macro.grams} g, ${percent}`);
        const item = el('li', 'visual-expenditure-item');
        const nameLine = el('div', 'visual-expenditure-name');
        const swatch = el('span', 'visual-expenditure-swatch');
        swatch.style.backgroundColor = color;
        swatch.setAttribute('aria-hidden', 'true');
        nameLine.append(swatch, el('span', '', macro.name));
        const values = el('div', 'visual-expenditure-values');
        values.append(el('span', '', `${macro.grams.toFixed(1)} g / ${tr('天', 'day')}`), el('span', '', `${macro.kcal.toFixed(1)} kcal / ${tr('天', 'day')}`));
        item.append(nameLine, el('strong', 'visual-expenditure-percent', percent), values);
        intakeLegend.append(item);
      }
      intakePie.style.background = `conic-gradient(${intakeStops.join(', ')})`;
      intakePie.setAttribute('aria-label', intakeDescriptions.join('; '));
      const intakeLabel = el('div', 'visual-expenditure-total');
      intakeLabel.append(el('strong', '', tr('占总热量比例', 'Share of Total Calories')), el('small', '', tr('按4/4/9折算；纤维及标签取整可能使合计偏离100%', '4/4/9 estimates; fibre and label rounding can shift the total from 100%')));
      intakePlot.append(intakePie, intakeLabel);
      intake.append(intakePlot, intakeLegend);
      intakeHost.replaceWith(intake);
    }

    const nutrients = window.fitnessNutritionTargets.render(tables[1], {el, tr, en, val});
    mount(tables[1], nutrients);
  }

})();
