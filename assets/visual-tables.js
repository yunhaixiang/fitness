(() => {
  'use strict';

  const en = window.fitnessI18n?.language === 'en';
  const tr = (zh, english) => en ? english : zh;
  const el = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
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
    const days = { '一': ['周一', 'Monday'], '二': ['周二', 'Tuesday'], '四': ['周四', 'Thursday'], '五': ['周五', 'Friday'] };
    for (const table of tables) {
      const stack = el('div', 'visual-training-stack');
      for (const body of table.tBodies) {
        const first = body.rows[0];
        if (!first) continue;
        const key = val(first, 0);
        const day = el('section', 'visual-training-day');
        const head = el('div', 'visual-training-head');
        const title = el('h3', '', tr(...(days[key] || [key, key])));
        const progress = el('span', 'visual-training-progress');
        head.append(title, el('span', 'visual-training-duration', val(first, 1)), progress);
        day.append(head);
        const list = el('div', 'visual-training-list');
        const boxes = [];
        for (const row of body.rows) {
          const offset = row === first ? 2 : 0;
          const card = el('article', 'visual-card visual-exercise-card');
          const name = el('h4', 'visual-exercise-name');
          copy(name, row.cells[offset]);
          const dose = el('strong', 'visual-exercise-dose', val(row, offset + 1));
          const sets = el('div', 'visual-set-list');
          for (const label of [...row.cells[offset + 2].querySelectorAll('label')]) {
            boxes.push(label.querySelector('input'));
            sets.append(label);
          }
          card.append(name, dose, el('p', 'visual-exercise-muscles', val(row, offset + 3)), sets);
          list.append(card);
        }
        const refresh = () => {
          const done = boxes.filter((box) => box.checked).length;
          progress.textContent = `${done}/${boxes.length} ${tr('组', 'sets')}`;
        };
        for (const box of boxes) box.addEventListener('change', refresh);
        refresh();
        day.append(list);
        stack.append(day);
      }
      mount(table, stack);
    }
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
    const names = {
      chest: '胸肌', 'front-delts': '肩前侧', 'side-delts': '肩外侧',
      'rear-delts': '肩后侧', lats: '背阔肌', traps: '斜方肌', biceps: '二头肌',
      triceps: '三头肌', forearms: '小臂', abs: '腹肌', obliques: '侧腹',
      'lower-back': '下背', glutes: '臀部', quads: '大腿前侧',
      hamstrings: '大腿后侧', calves: '小腿'
    };
    const sides = [
      { side: 'front', left: ['chest', 'biceps', 'forearms', 'quads'], right: ['front-delts', 'side-delts', 'abs', 'obliques'] },
      { side: 'back', left: ['rear-delts', 'lats', 'glutes', 'calves'], right: ['traps', 'triceps', 'lower-back', 'hamstrings'] }
    ];
    const shapes = {
      front: `
        <path data-muscle="chest" d="M65 94 Q84 82 108 95 L108 131 Q84 140 67 125 Z M112 95 Q136 82 155 94 L153 125 Q136 140 112 131 Z"/>
        <path data-muscle="front-delts" d="M64 81 Q76 75 87 81 L77 101 Q67 103 62 96 Z M156 81 Q144 75 133 81 L143 101 Q153 103 158 96 Z"/>
        <path data-muscle="side-delts" d="M53 90 Q58 81 65 80 L67 105 L56 113 Z M167 90 Q162 81 155 80 L153 105 L164 113 Z"/>
        <path data-muscle="biceps" d="M55 120 L67 117 L68 157 L56 160 Z M165 120 L153 117 L152 157 L164 160 Z"/>
        <path data-muscle="forearms" d="M55 167 L68 164 L61 215 L47 211 Z M165 167 L152 164 L159 215 L173 211 Z"/>
        <path data-muscle="abs" d="M96 137 L124 137 L126 208 Q110 215 94 208 Z"/>
        <path data-muscle="obliques" d="M76 142 L94 139 L92 203 L81 197 Z M144 142 L126 139 L128 203 L139 197 Z"/>
        <path data-muscle="quads" d="M78 244 Q91 236 103 246 L101 331 Q89 348 77 331 Z M142 244 Q129 236 117 246 L119 331 Q131 348 143 331 Z"/>`,
      back: `
        <path data-muscle="traps" d="M98 63 L110 74 L122 63 L148 90 L127 111 L110 103 L93 111 L72 90 Z"/>
        <path data-muscle="rear-delts" d="M59 88 Q70 79 83 82 L79 113 L56 112 Z M161 88 Q150 79 137 82 L141 113 L164 112 Z"/>
        <path data-muscle="lats" d="M78 116 L105 111 L102 196 L82 188 Z M142 116 L115 111 L118 196 L138 188 Z"/>
        <path data-muscle="triceps" d="M56 119 L70 115 L65 161 L53 160 Z M164 119 L150 115 L155 161 L167 160 Z"/>
        <path data-muscle="lower-back" d="M103 175 L117 175 L128 222 L110 226 L92 222 Z"/>
        <path data-muscle="glutes" d="M80 228 Q94 222 109 230 L108 270 Q91 279 77 263 Z M140 228 Q126 222 111 230 L112 270 Q129 279 143 263 Z"/>
        <path data-muscle="hamstrings" d="M79 278 Q94 270 104 279 L100 353 L80 355 Z M141 278 Q126 270 116 279 L120 353 L140 355 Z"/>
        <path data-muscle="calves" d="M84 370 Q95 362 101 373 L98 435 L88 444 Z M136 370 Q125 362 119 373 L122 435 L132 444 Z"/>`
    };
    const svg = (side) => {
      const host = el('div', 'volume-body');
      host.innerHTML = `<svg viewBox="0 0 220 480" role="img" aria-label="${tr(side === 'front' ? '正面肌群示意图' : '背面肌群示意图', side === 'front' ? 'Front muscle map' : 'Back muscle map')}" xmlns="http://www.w3.org/2000/svg">
        <ellipse class="volume-silhouette" cx="110" cy="35" rx="21" ry="27"/>
        <path class="volume-silhouette" d="M99 58 L99 66 Q67 71 54 87 L52 147 L42 214 Q42 226 50 230 L60 229 L72 166 L76 111 L79 211 Q74 230 77 245 L78 355 L86 452 L100 455 L108 355 L110 261 L112 355 L120 455 L134 452 L142 355 L143 245 Q146 230 141 211 L144 111 L148 166 L160 229 L170 230 Q178 226 178 214 L168 147 L166 87 Q153 71 121 66 L121 58 Z"/>
        <g class="volume-muscles">${shapes[side]}</g>
        <path class="volume-midline" d="M110 76 L110 221 M110 274 L110 353"/>
      </svg>`;
      return host;
    };
    const primarySets = (row) => {
      const node = row.cells[1].firstChild;
      const source = node ? (window.fitnessI18n?.original(node) || node.textContent) : '';
      return [...source.split('；')[0].matchAll(/(\d+)\s*组/g)].reduce((sum, match) => sum + Number(match[1]), 0);
    };
    const muscleKey = (row) => row.cells[0].lastChild.textContent.trim().toLowerCase().replaceAll(' ', '-');
    const unit = (count, key) => `${count} ${tr('组', 'sets')}${key === 'obliques' && count === 6 ? tr('／侧', '/side') : ''}`;

    for (const table of tables) {
      const byMuscle = new Map([...table.tBodies[0].rows].map((row) => [muscleKey(row), row]));
      const shell = el('div', 'volume-view');
      const maps = el('div', 'volume-map-grid');
      const details = el('details', 'volume-details');
      const detailSummary = el('summary', '', tr('查看全部动作与辅助刺激', 'See all exercises and secondary work'));
      const detailGrid = el('div', 'visual-card-grid volume-detail-grid');
      details.append(detailSummary, detailGrid);
      const cards = new Map();

      for (const row of table.tBodies[0].rows) {
        const key = muscleKey(row);
        const card = el('article', 'visual-card visual-volume-card');
        card.id = `${table === tables[0] ? 'home' : 'gym'}-${key}`;
        card.tabIndex = -1;
        const top = el('div', 'visual-card-top');
        const name = el('h3');
        name.textContent = tr(names[key] || key, row.cells[0].lastChild.textContent.trim());
        top.append(name, el('span', 'visual-badge', val(row, 3)));
        card.append(top);
        card.append(el('strong', 'volume-card-dose', unit(primarySets(row), key)));
        for (const [column, zh, english] of [[1, '主要', 'Primary'], [2, '辅助', 'Secondary']]) {
          const line = el('div', 'visual-volume-line');
          line.append(el('span', '', tr(zh, english)), el('strong', '', val(row, column)));
          card.append(line);
        }
        cards.set(key, card);
        detailGrid.append(card);
      }

      for (const config of sides) {
        const figure = el('figure', 'volume-map');
        const heading = el('figcaption', 'volume-map-title', tr(config.side === 'front' ? '正面' : '背面', config.side === 'front' ? 'Front' : 'Back'));
        const diagram = svg(config.side);
        const pins = (keys, className) => {
          const list = el('div', `volume-pins ${className}`);
          for (const key of keys) {
            const row = byMuscle.get(key);
            if (!row) continue;
            const count = primarySets(row);
            const pin = el('button', 'volume-pin');
            pin.type = 'button';
            pin.setAttribute('aria-label', `${tr(names[key], row.cells[0].lastChild.textContent.trim())}: ${unit(count, key)}. ${tr('查看动作', 'View exercises')}`);
            pin.append(el('span', 'volume-pin-name', tr(names[key], row.cells[0].lastChild.textContent.trim())), el('strong', 'volume-pin-count', unit(count, key)));
            if (count === 0) pin.classList.add('is-indirect');
            pin.addEventListener('click', () => {
              details.open = true;
              const card = cards.get(key);
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              card.focus({ preventScroll: true });
            });
            list.append(pin);
            const region = diagram.querySelector(`[data-muscle="${key}"]`);
            if (region) region.style.opacity = String(0.28 + Math.min(count / 17, 1) * 0.68);
          }
          return list;
        };
        figure.append(heading, pins(config.left, 'volume-pins-left'), diagram, pins(config.right, 'volume-pins-right'));
        maps.append(figure);
      }
      shell.append(maps, details);
      mount(table, shell);
    }
  }

})();
