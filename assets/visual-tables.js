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
    const items = rows.filter((row) => row.querySelector('input[type="checkbox"]'));
    const shell = el('div', 'visual-shopping');
    const overview = el('div', 'visual-shopping-overview');
    const count = el('strong', 'visual-shopping-count');
    const countLabel = el('span', '', tr('项已买', 'Items Bought'));
    const track = el('div', 'visual-progress-track');
    const fill = el('span', 'visual-progress-fill');
    track.append(fill);
    overview.append(count, countLabel, track);
    shell.append(overview);
    const weekly = el('div', 'visual-card-grid');
    const restock = el('div', 'visual-card-grid');
    const cards = new Map();
    const refresh = () => {
      const done = items.filter((row) => row.querySelector('input').checked).length;
      count.textContent = `${done} / ${items.length}`;
      fill.style.width = `${items.length ? 100 * done / items.length : 0}%`;
    };
    for (const row of items) {
      const card = el('article', 'visual-card visual-shopping-card');
      const top = el('div', 'visual-card-top');
      const box = row.querySelector('input[type="checkbox"]');
      const cardBox = box.cloneNode(true);
      cardBox.checked = box.checked;
      const check = el('label', 'visual-shopping-check');
      check.append(cardBox, el('span', '', titleCase(val(row, 1))));
      top.append(check, el('strong', 'visual-price', val(row, 4)));
      card.append(top);
      const product = el('div', 'visual-shopping-product');
      copy(product, row.cells[2]);
      card.append(product, el('span', 'visual-badge', titleCase(val(row, 3))));
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
      cards.set(row, card);
      (val(row, 3).includes('按需') || val(row, 3).toLowerCase().includes('as needed') ? restock : weekly).append(card);
    }
    const section = (title, grid) => {
      if (!grid.children.length) return;
      shell.append(el('h2', 'visual-section-label', title), grid);
    };
    section(tr('每周购买', 'Weekly groceries'), weekly);
    section(tr('按需补货', 'Restock as needed'), restock);
    const total = rows.at(-1);
    if (total && !total.querySelector('input')) shell.append(el('p', 'visual-shopping-total', titleCase(`${val(total, 1)} · ${val(total, 4)}`)));
    mount(table, shell);
    document.querySelector('#shopping-search')?.addEventListener('input', () => {
      for (const [row, card] of cards) card.hidden = row.hidden;
    });
    document.querySelector('#shopping-reset')?.addEventListener('click', () => {
      for (const [row, card] of cards) {
        const checked = row.querySelector('input').checked;
        card.querySelector('input').checked = checked;
        card.classList.toggle('is-checked', checked);
      }
      refresh();
    });
    refresh();
  }

  if (page === 'cooking' && tables.length === 4) {
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
    const toolbar = el('div', 'volume-switch strength-switch');
    toolbar.setAttribute('role', 'group');
    toolbar.setAttribute('aria-label', tr('训练场地', 'Training location'));
    const buttons = new Map();
    const panels = new Map();
    for (const [mode, zh, english] of modes) {
      const button = el('button', 'volume-switch-button', tr(zh, english));
      button.type = 'button';
      button.addEventListener('click', () => show(mode));
      buttons.set(mode, button);
      toolbar.append(button);
    }
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
          const weightLine = el('span', 'visual-exercise-weight', `${tr('配重：', 'Weight: ')}${weight} lbs${suffix}`);
          const sets = el('div', 'visual-set-list');
          for (const setLabel of [...row.cells[offset + 2].querySelectorAll('label')]) {
            boxes.push(setLabel.querySelector('input'));
            sets.append(setLabel);
          }
          content.append(name, dose, weightLine, el('p', 'visual-exercise-muscles', titleCase(val(row, offset + 3))), sets);
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
      for (const [name, button] of buttons) button.setAttribute('aria-pressed', String(name === mode));
      for (const [name, panel] of panels) panel.hidden = name !== mode;
      try { localStorage.setItem('yunhai-fitness-volume-mode', mode); } catch (_) { /* storage unavailable */ }
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
    let initial = 'home';
    try { if (localStorage.getItem('yunhai-fitness-volume-mode') === 'gym') initial = 'gym'; } catch (_) { /* storage unavailable */ }
    show(initial);
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
    const metric = (text) => {
      const values = [...text.matchAll(/[\d,]+(?:\.\d+)?/g)].map(([value]) => Number(value.replaceAll(',', '')));
      const unit = text.includes('%') ? '%' : (text.match(/µg|mg|kcal|g/) || [''])[0];
      const factor = { '%': 1, kcal: 1, g: 1, mg: 0.001, 'µg': 0.000001 }[unit] || 1;
      return { low: values[0] * factor, high: (values[1] ?? values[0]) * factor, unit, factor };
    };
    const amount = (value, daily) => {
      const n = value / daily.factor;
      return new Intl.NumberFormat(en ? 'en-CA' : 'zh-CN', { maximumFractionDigits: 2 }).format(n);
    };
    const difference = (low, high, daily) => {
      const first = amount(low, daily);
      const last = amount(high, daily);
      return `${first === last ? first : `${first}–${last}`}${daily.unit === '%' ? '' : ' '}${daily.unit}`;
    };
    const energyRows = [...tables[0].tBodies[0].rows];
    const breakdown = energyRows.slice(0, -1);
    const totalRow = energyRows.at(-1);
    const total = breakdown.reduce((sum, row) => sum + number(val(row, 1)), 0);
    const colors = ['#91d8d1', '#e5bc78', '#aca6e4', '#e5a58b', '#83b5d8'];
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
      const percentage = `${share.toFixed(1)}%`;
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
    pie.style.background = `conic-gradient(${stops.join(', ')})`;
    pie.setAttribute('aria-label', descriptions.join(window.fitnessI18n?.language === 'en' ? '; ' : '；'));
    const totalLabel = el('div', 'visual-expenditure-total');
    totalLabel.append(el('span', '', tr('合计日均消耗', 'Total Daily Calories Burned')), el('strong', '', `${val(totalRow, 2)} kcal`), el('small', '', `${tr('每周', 'Weekly')} ${val(totalRow, 1)} kcal`));
    plot.append(pie, totalLabel);
    chart.append(plot, legend);
    mount(tables[0], chart);

    const nutrients = el('div', 'visual-card-grid visual-nutrient-grid');
    for (const row of tables[1].tBodies[0].rows) {
      const card = el('article', 'visual-card visual-nutrient-card');
      const current = val(row, 1);
      const recommendation = val(row, 2);
      const daily = metric(current);
      card.append(el('h3', '', val(row, 0)), el('strong', 'visual-metric-large', current));
      const bottom = el('div', 'visual-nutrient-bottom');
      bottom.append(el('span', 'visual-nutrient-recommendation', `${tr('推荐', 'Recommended')}: ${recommendation === '–' ? tr('未设定', 'Not set') : recommendation}`));
      const track = el('div', 'visual-nutrient-track');
      track.setAttribute('aria-hidden', 'true');
      const comparison = el('span', 'visual-nutrient-comparison');
      const hasNumericGoal = /\d/.test(recommendation);
      if (recommendation === '–') {
        card.classList.add('is-unset');
        comparison.textContent = tr('无可比较的每日目标', 'No daily goal to compare');
      } else if (!hasNumericGoal) {
        card.classList.add('is-unset');
      } else {
        const goal = metric(recommendation);
        const kind = recommendation.startsWith('≤') ? 'maximum' : recommendation.startsWith('≥') ? 'minimum' : goal.low !== goal.high ? 'range' : 'reference';
        const upper = Math.max(goal.high, daily.high) * 1.18;
        const percent = (value) => Math.max(0, Math.min(100, value / upper * 100));
        const zone = el('span', 'visual-nutrient-zone');
        const zoneStart = kind === 'maximum' ? 0 : percent(goal.low);
        const zoneEnd = kind === 'minimum' ? 100 : percent(goal.high);
        zone.style.left = `${zoneStart}%`;
        zone.style.width = kind === 'reference' ? '2px' : `${zoneEnd - zoneStart}%`;
        const fill = el('span', 'visual-nutrient-fill');
        fill.style.width = `${percent(daily.low)}%`;
        track.append(zone, fill);
        if (daily.high !== daily.low) {
          const span = el('span', 'visual-nutrient-value-range');
          span.style.left = `${percent(daily.low)}%`;
          span.style.width = `${Math.max(2, percent(daily.high) - percent(daily.low))}%`;
          track.append(span);
        } else {
          const marker = el('span', 'visual-nutrient-marker');
          marker.style.left = `${percent(daily.low)}%`;
          track.append(marker);
        }
        if (kind === 'maximum') {
          if (daily.low > goal.high) {
            card.classList.add('is-high');
            comparison.textContent = `${tr('高于上限', 'Above limit')} ${difference(daily.low - goal.high, daily.high - goal.high, daily)}`;
          } else if (daily.high <= goal.high) {
            card.classList.add('is-ok');
            comparison.textContent = `${tr('低于上限', 'Below limit')} ${difference(goal.high - daily.high, goal.high - daily.low, daily)}`;
          } else {
            card.classList.add('is-low');
            comparison.textContent = tr('横跨建议上限', 'Spans the recommended limit');
          }
        } else if (daily.high < goal.low) {
          card.classList.add('is-low');
          const label = kind === 'range' ? tr('低于建议范围', 'Below range') : kind === 'reference' ? tr('低于参考值', 'Below reference') : tr('低于下限', 'Below minimum');
          comparison.textContent = `${label} ${difference(goal.low - daily.high, goal.low - daily.low, daily)}`;
        } else if (kind === 'range' && daily.low > goal.high) {
          card.classList.add('is-high');
          comparison.textContent = `${tr('高于建议范围', 'Above range')} ${difference(daily.low - goal.high, daily.high - goal.high, daily)}`;
        } else if (kind === 'reference' && daily.low === goal.low && daily.high === goal.high) {
          card.classList.add('is-ok');
          comparison.textContent = tr('等于参考值', 'At reference');
        } else if (kind === 'reference' && daily.low >= goal.low) {
          card.classList.add('is-ok');
          comparison.textContent = `${tr('高于参考值', 'Above reference')} ${difference(daily.low - goal.low, daily.high - goal.low, daily)}`;
        } else if (kind === 'minimum' && daily.low >= goal.low) {
          card.classList.add('is-ok');
          comparison.textContent = `${tr('高于下限', 'Above minimum')} ${difference(daily.low - goal.low, daily.high - goal.low, daily)}`;
        } else if (kind === 'range' && daily.low >= goal.low && daily.high <= goal.high) {
          card.classList.add('is-ok');
          comparison.textContent = tr('在建议范围内', 'Within range');
        } else {
          card.classList.add('is-low');
          comparison.textContent = tr(kind === 'reference' ? '包含参考值' : '与建议范围重叠', kind === 'reference' ? 'Includes reference' : 'Overlaps recommended range');
        }
      }
      if (recommendation === '–' || hasNumericGoal) bottom.append(track, comparison);
      card.append(bottom);
      nutrients.append(card);
    }
    mount(tables[1], nutrients);
  }

})();
