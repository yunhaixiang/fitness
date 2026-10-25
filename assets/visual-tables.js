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

  if (page === 'stats' && tables.length === 5) {
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

    for (let index = 3; index < 5; index++) {
      const grid = el('div', 'visual-card-grid visual-volume-grid');
      for (const row of tables[index].tBodies[0].rows) {
        const card = el('article', 'visual-card visual-volume-card');
        const top = el('div', 'visual-card-top');
        const name = el('h3');
        copy(name, row.cells[0]);
        top.append(name, el('span', 'visual-badge', val(row, 3)));
        card.append(top);
        for (const [column, zh, english] of [[1, '主要', 'Primary'], [2, '辅助', 'Secondary']]) {
          const line = el('div', 'visual-volume-line');
          line.append(el('span', '', tr(zh, english)), el('strong', '', val(row, column)));
          card.append(line);
        }
        grid.append(card);
      }
      mount(tables[index], grid);
    }
  }
})();
