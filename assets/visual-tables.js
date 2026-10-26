(() => {
  'use strict';

  const en = window.fitnessI18n?.language === 'en';
  const tr = (zh, english) => en ? english : zh;
  const sentenceCase = (value) => en ? value.replace(/^(\s*)([a-z])/, (_, space, letter) => space + letter.toUpperCase()) : value;
  const el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = /^h[1-6]$/.test(tag) ? sentenceCase(content) : content;
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
    const countLabel = el('span', '', tr('项已买', 'items bought'));
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
      check.append(cardBox, el('span', '', val(row, 1)));
      top.append(check, el('strong', 'visual-price', val(row, 4)));
      card.append(top);
      const product = el('div', 'visual-shopping-product');
      copy(product, row.cells[2]);
      card.append(product, el('span', 'visual-badge', val(row, 3)));
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
    if (total && !total.querySelector('input')) shell.append(el('p', 'visual-shopping-total', `${val(total, 1)} · ${val(total, 4)}`));
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
          tag.append(el('span', '', names[column]), el('strong', '', val(row, column)));
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
    const selectionKey = 'fitness-strength-selected-day';
    let activeDay = new Date().getDay();
    try {
      const saved = JSON.parse(localStorage.getItem(selectionKey));
      if (saved.date === new Date().toDateString() && Number.isInteger(saved.day) && saved.day >= 0 && saved.day < 7) activeDay = saved.day;
    } catch (_) { /* storage unavailable */ }
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
    const note = document.querySelector('#home-dumbbell-note');
    for (const [index, [mode]] of modes.entries()) {
      const table = tables[index];
      const panel = el('section', 'strength-mode-panel');
      panel.id = `strength-${mode}`;
      panel.setAttribute('aria-label', tr(modes[index][1], modes[index][2]));
      if (mode === 'home' && note) panel.append(note);
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
          const label = sentenceCase(action?.textContent.trim() || val(row, offset));
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
          const sets = el('div', 'visual-set-list');
          for (const setLabel of [...row.cells[offset + 2].querySelectorAll('label')]) {
            boxes.push(setLabel.querySelector('input'));
            sets.append(setLabel);
          }
          content.append(name, dose, el('p', 'visual-exercise-muscles', val(row, offset + 3)), sets);
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
      try { localStorage.setItem(selectionKey, JSON.stringify({ date: new Date().toDateString(), day: weekday })); } catch (_) { /* storage unavailable */ }
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
      if (today.toDateString() === selectedDate) return;
      selectedDate = today.toDateString();
      showDay(today.getDay());
    };
    const scheduleToday = () => {
      const next = new Date();
      next.setHours(24, 0, 0, 100);
      setTimeout(() => { selectToday(); scheduleToday(); }, next - new Date());
    };
    scheduleToday();
    window.addEventListener('focus', selectToday);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) selectToday(); });
  }

  if (page === 'cardio' && tables.length === 2) {
    const week = el('div', 'visual-week-strip');
    for (const row of tables[0].tBodies[0].rows) {
      const rest = val(row, 1) === val(row, 2);
      const card = el('article', `visual-card visual-day-card${rest ? ' is-rest' : ''}`);
      card.append(el('strong', 'visual-day-name', val(row, 0)), el('span', '', val(row, 1)), el('small', '', val(row, 2)));
      week.append(card);
    }
    mount(tables[0], week);
    const options = el('div', 'visual-card-grid');
    for (const row of tables[1].tBodies[0].rows) {
      const card = el('article', 'visual-card visual-hiit-card');
      card.append(el('h3', '', val(row, 0)));
      for (const [column, zh, english] of [[1, '总消耗', 'Gross burn'], [2, '净消耗', 'Net burn']]) {
        const metric = el('div', 'visual-hiit-metric');
        metric.append(el('span', '', tr(zh, english)), el('strong', '', `${val(row, column)} kcal`));
        card.append(metric);
      }
      options.append(card);
    }
    mount(tables[1], options);
  }

  if (page === 'sleep' && tables[0]) {
    const timeline = el('ol', 'visual-timeline');
    for (const row of tables[0].tBodies[0].rows) {
      const item = el('li', 'visual-timeline-item');
      item.append(el('time', '', val(row, 0)), el('strong', '', val(row, 1)));
      timeline.append(item);
    }
    mount(tables[0], timeline);
  }

  if (page === 'stats' && tables.length === 3) {
    const energy = el('div', 'visual-energy');
    const energyRows = [...tables[0].tBodies[0].rows];
    const total = number(val(energyRows.at(-1), 1));
    const energyGrid = el('div', 'visual-card-grid');
    for (const row of energyRows) {
      const card = el('article', 'visual-card visual-energy-card');
      card.append(el('h3', '', val(row, 0)), el('strong', 'visual-metric-large', `${val(row, 2)} kcal`), el('small', '', `${tr('每周', 'Weekly')} ${val(row, 1)} kcal`));
      const bar = el('div', 'visual-progress-track');
      const fill = el('span', 'visual-progress-fill');
      fill.style.width = `${Math.min(100, total ? number(val(row, 1)) / total * 100 : 0)}%`;
      bar.append(fill);
      card.append(bar);
      energyGrid.append(card);
    }
    energy.append(energyGrid);
    mount(tables[0], energy);

    const nutrients = el('div', 'visual-card-grid visual-nutrient-grid');
    for (const row of tables[1].tBodies[0].rows) {
      const card = el('article', 'visual-card visual-nutrient-card');
      card.append(el('h3', '', val(row, 0)), el('strong', 'visual-metric-large', val(row, 2)));
      const bottom = el('div', 'visual-nutrient-bottom');
      bottom.append(el('span', '', `${tr('每周', 'Weekly')} ${val(row, 1)}`), el('span', '', `${tr('参考', 'Reference')} ${val(row, 3)}`));
      card.append(bottom);
      nutrients.append(card);
    }
    mount(tables[1], nutrients);

    const mealTable = tables[2];
    const headers = [...mealTable.tHead.rows[0].cells].map((cell) => cell.textContent.trim());
    const meals = el('div', 'visual-card-grid visual-meal-nutrition-grid');
    for (const row of mealTable.tBodies[0].rows) {
      const card = el('article', 'visual-card visual-meal-nutrition-card');
      card.append(el('h3', '', val(row, 0)), el('strong', 'visual-metric-large', `${val(row, 1)} kcal`));
      const macro = el('div', 'visual-macro-labels');
      for (const column of [2, 3, 5]) macro.append(el('span', '', `${headers[column]} ${val(row, column)}`));
      card.append(macro);
      const amounts = [number(val(row, 2)) * 4, number(val(row, 3)) * 9, number(val(row, 5)) * 4];
      const sum = amounts.reduce((a, b) => a + b, 0) || 1;
      const bar = el('div', 'visual-macro-bar');
      for (const [index, amount] of amounts.entries()) {
        const segment = el('span', `visual-macro-${index}`);
        segment.style.width = `${amount / sum * 100}%`;
        bar.append(segment);
      }
      card.append(bar);
      const details = el('details', 'visual-more');
      details.append(el('summary', '', tr('全部营养', 'All nutrients')));
      const extra = el('dl', 'visual-detail-list');
      for (let column = 4; column < row.cells.length; column++) {
        if (column === 5) continue;
        extra.append(el('dt', '', headers[column]), el('dd', '', val(row, column)));
      }
      details.append(extra);
      card.append(details);
      meals.append(card);
    }
    mount(mealTable, meals);
  }
  if (page === 'volume' && tables.length === 2) {
    const root = document.querySelector('#volume-root');
    if (!root) return;
    const names = {
      chest: '胸肌', 'front-delts': '肩前侧', 'side-delts': '肩外侧',
      'rear-delts': '肩后侧', lats: '背阔肌', traps: '斜方肌', biceps: '二头肌',
      triceps: '三头肌', forearms: '小臂', abs: '腹肌', obliques: '侧腹',
      'lower-back': '下背', glutes: '臀部', quads: '大腿前侧',
      hamstrings: '大腿后侧', calves: '小腿'
    };
    const positions = {
      front: {
        chest: [14, 22.7], 'front-delts': [73, 16.5], 'side-delts': [82, 26.4],
        biceps: [5, 34.5], forearms: [5, 48.8], abs: [82, 39.7],
        obliques: [83, 48.8], quads: [7, 68.5]
      },
      back: {
        'rear-delts': [8, 22.8], traps: [75, 18.7], lats: [8, 37.7],
        triceps: [83, 33.5], 'lower-back': [83, 48.4], glutes: [8, 59.4],
        hamstrings: [80, 69.3], calves: [9, 82.3]
      }
    };
    const primarySets = (row) => {
      const node = row.cells[1].firstChild;
      const source = node ? (window.fitnessI18n?.original(node) || node.textContent) : '';
      return [...source.split('；')[0].matchAll(/(\d+)\s*组/g)].reduce((sum, match) => sum + Number(match[1]), 0);
    };
    const muscleKey = (row) => row.cells[0].lastChild.textContent.trim().toLowerCase().replaceAll(' ', '-');
    const englishName = (row) => row.cells[0].lastChild.textContent.trim();
    const dose = (count, key) => `${count} ${tr('组', 'sets')}${key === 'obliques' && count === 6 ? tr('／侧', '/side') : ''}`;
    const data = {
      home: [...tables[0].tBodies[0].rows],
      gym: [...tables[1].tBodies[0].rows]
    };
    const siteRoot = document.querySelector('.brand')?.href || location.origin + '/';
    const toolbar = el('div', 'volume-switch');
    toolbar.setAttribute('role', 'group');
    toolbar.setAttribute('aria-label', tr('训练场地', 'Training location'));
    const buttons = new Map();
    for (const [mode, zh, english] of [['home', '在家', 'Home'], ['gym', '健身馆', 'Gym']]) {
      const button = el('button', 'volume-switch-button', tr(zh, english));
      button.type = 'button';
      button.addEventListener('click', () => show(mode));
      buttons.set(mode, button);
      toolbar.append(button);
    }
    const maps = el('div', 'volume-photo-grid');
    const details = el('details', 'volume-details');
    const detailsTitle = el('summary', '', tr('查看全部动作与辅助刺激', 'See all exercises and secondary work'));
    const detailGrid = el('div', 'visual-card-grid volume-detail-grid');
    details.append(detailsTitle, detailGrid);
    root.append(toolbar, maps, details);

    function show(mode) {
      for (const [name, button] of buttons) button.setAttribute('aria-pressed', String(name === mode));
      try { localStorage.setItem('yunhai-fitness-volume-mode', mode); } catch (_) { /* storage unavailable */ }
      maps.replaceChildren();
      detailGrid.replaceChildren();
      details.open = false;
      const cards = new Map();
      const rows = data[mode];
      for (const row of rows) {
        const key = muscleKey(row);
        const card = el('article', 'visual-card visual-volume-card');
        card.id = `volume-${mode}-${key}`;
        card.tabIndex = -1;
        const top = el('div', 'visual-card-top');
        top.append(el('h3', '', tr(names[key] || key, englishName(row))), el('span', 'visual-badge', val(row, 3)));
        card.append(top, el('strong', 'volume-card-dose', dose(primarySets(row), key)));
        for (const [column, zh, english] of [[1, '主要', 'Primary'], [2, '辅助', 'Secondary']]) {
          const line = el('div', 'visual-volume-line');
          line.append(el('span', '', tr(zh, english)), el('strong', '', val(row, column)));
          card.append(line);
        }
        cards.set(key, card);
        detailGrid.append(card);
      }
      for (const side of ['front', 'back']) {
        const figure = el('figure', 'volume-photo');
        const image = el('img');
        image.src = new URL(`assets/images/fitness-muscles-${side}.png`, siteRoot).href;
        image.alt = tr(side === 'front' ? '主要肌群正面图' : '主要肌群背面图', side === 'front' ? 'Front muscle diagram' : 'Back muscle diagram');
        image.width = 1024;
        image.height = 1536;
        figure.append(image);
        for (const row of rows) {
          const key = muscleKey(row);
          const position = positions[side][key];
          if (!position) continue;
          const count = primarySets(row);
          const badge = el('button', 'volume-photo-badge', dose(count, key));
          badge.type = 'button';
          badge.style.left = `${position[0]}%`;
          badge.style.top = `${position[1]}%`;
          badge.setAttribute('aria-label', `${tr(names[key], englishName(row))}: ${dose(count, key)}. ${tr('查看动作', 'View exercises')}`);
          if (count === 0) badge.classList.add('is-indirect');
          badge.addEventListener('click', () => {
            details.open = true;
            const card = cards.get(key);
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.focus({ preventScroll: true });
          });
          figure.append(badge);
        }
        maps.append(figure);
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
  }

})();
