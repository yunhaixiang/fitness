(() => {
  'use strict';
  const root = document.querySelector('#strength-root');
  const tables = [...document.querySelectorAll('.training-table')];
  const toolbar = root?.querySelector('.strength-switch');
  if (!root || tables.length !== 2 || !toolbar) return;

  const en = window.fitnessI18n?.language === 'en';
  const tr = (zh, english) => en ? english : zh;
  const numberFormat = new Intl.NumberFormat(en ? 'en-CA' : 'zh-CN', { maximumFractionDigits: 0 });
  const bodyWeightKg = (() => {
    try {
      const records = JSON.parse(localStorage.getItem('yunhai-fitness-records-v1') || '{}');
      const latest = (records.body || []).filter((row) => Number(row.weight) > 0)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      return latest ? Number(latest.weight) : 77.4;
    } catch (_) { return 77.4; }
  })();
  const bodyWeightLb = bodyWeightKg * 2.20462;
  const muscles = [
    ['chest', '胸肌', 'Chest'], ['front-delts', '肩前侧', 'Front Delts'],
    ['side-delts', '肩外侧', 'Side Delts'], ['rear-delts', '肩后侧', 'Rear Delts'],
    ['lats', '背阔肌', 'Lats'], ['traps', '斜方肌', 'Traps'],
    ['biceps', '二头肌', 'Biceps'], ['triceps', '三头肌', 'Triceps'],
    ['forearms', '小臂', 'Forearms'], ['abs', '腹肌', 'Abs'],
    ['obliques', '侧腹', 'Obliques'], ['lower-back', '下背', 'Lower Back'],
    ['glutes', '臀部', 'Glutes'], ['quads', '大腿前侧', 'Quads'],
    ['hamstrings', '大腿后侧', 'Hamstrings'], ['calves', '小腿', 'Calves']
  ];
  const labelSides = {
    front: {
      chest: 'left', 'front-delts': 'right', 'side-delts': 'right',
      biceps: 'left', forearms: 'left', abs: 'right',
      obliques: 'right', quads: 'left'
    },
    back: {
      'rear-delts': 'left', traps: 'right', lats: 'left',
      triceps: 'right', 'lower-back': 'right', glutes: 'left',
      hamstrings: 'right', calves: 'left'
    }
  };
  const musclePoints = {
    front: {
      chest: [420, 355], 'front-delts': [660, 317], 'side-delts': [704, 355],
      biceps: [320, 468], forearms: [295, 610], abs: [548, 520],
      obliques: [609, 568], quads: [424, 925]
    },
    back: {
      'rear-delts': [341, 345], traps: [570, 288], lats: [421, 459],
      triceps: [708, 464], 'lower-back': [557, 555], glutes: [428, 739],
      hamstrings: [584, 922], calves: [394, 1172]
    }
  };
  // An exercise contributes its full calculated load to every listed muscle.
  // These per-muscle totals are not additive across muscle groups.
  const movements = {
    '中立握哑铃地板卧推': { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
    '卷腹': { primary: ['abs'], secondary: ['obliques'], bodyFactor: .30 },
    '反向卷腹': { primary: ['abs'], secondary: ['obliques'], bodyFactor: .30 },
    '站姿哑铃肩推': { primary: ['front-delts'], secondary: ['side-delts', 'triceps', 'traps'] },
    '双哑铃俯身划船': { primary: ['lats', 'traps'], secondary: ['rear-delts', 'biceps', 'forearms', 'lower-back'] },
    '哑铃侧平举': { primary: ['side-delts'], secondary: ['traps'] },
    '哑铃反向飞鸟': { primary: ['rear-delts'], secondary: ['traps'] },
    '臀桥脚跟走步': { primary: ['hamstrings'], secondary: ['glutes'], bodyFactor: .50 },
    '哑铃高脚杯深蹲': { primary: ['quads', 'glutes'], secondary: ['abs', 'lower-back'] },
    '哑铃反向弓步': { primary: ['quads', 'glutes'], secondary: [] },
    '哑铃罗马尼亚硬拉': { primary: ['hamstrings', 'glutes'], secondary: ['lower-back', 'forearms'] },
    '哑铃双腿提踵': { primary: ['calves'], secondary: [] },
    '单手哑铃侧屈': { primary: ['obliques'], secondary: ['abs'] },
    '单臂支撑哑铃划船': { primary: ['lats'], secondary: ['traps', 'biceps', 'forearms'] },
    '哑铃弯举': { primary: ['biceps'], secondary: ['forearms'] },
    '哑铃分腿蹲': { primary: ['quads', 'glutes'], secondary: [] },
    '支撑式单腿哑铃罗马尼亚硬拉': { primary: ['hamstrings', 'glutes'], secondary: ['lower-back', 'forearms'] },
    '哑铃单腿臀桥': { primary: ['glutes'], secondary: ['hamstrings'] },
    '史密斯机平板卧推': { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
    '坐姿器械肩推': { primary: ['front-delts'], secondary: ['side-delts', 'triceps', 'traps'] },
    '坐姿器械划船': { primary: ['lats', 'traps'], secondary: ['rear-delts', 'biceps', 'forearms'] },
    '单臂绳索侧平举': { primary: ['side-delts'], secondary: ['traps'] },
    '绳索三头下压': { primary: ['triceps'], secondary: [] },
    '器械反向飞鸟': { primary: ['rear-delts'], secondary: ['traps'] },
    '坐姿器械卷腹': { primary: ['abs'], secondary: ['obliques'] },
    '史密斯机深蹲': { primary: ['quads', 'glutes'], secondary: ['abs', 'lower-back'] },
    '史密斯机反向弓步': { primary: ['quads', 'glutes'], secondary: [] },
    '史密斯机罗马尼亚硬拉': { primary: ['hamstrings', 'glutes'], secondary: ['lower-back', 'forearms', 'abs'] },
    '俯卧器械腿弯举': { primary: ['hamstrings'], secondary: [] },
    '史密斯机站姿提踵': { primary: ['calves'], secondary: [] },
    '高位下拉': { primary: ['lats'], secondary: ['traps', 'biceps', 'forearms'] },
    '绳索弯举': { primary: ['biceps'], secondary: ['forearms'] },
    '站姿绳索转体': { primary: ['obliques'], secondary: ['abs'] },
    '坐姿腿举': { primary: ['quads', 'glutes'], secondary: [] },
    '坐姿器械腿屈伸': { primary: ['quads'], secondary: [] },
    '史密斯机臀推': { primary: ['glutes'], secondary: ['hamstrings'] }
  };
  const original = (node) => node ? window.fitnessI18n?.original(node) || node.textContent : '';
  const format = (value) => `${numberFormat.format(value)} lb`;
  const text = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    return element;
  };
  const svgElement = (tag, className) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    element.setAttribute('class', className);
    return element;
  };
  const data = {};
  for (const [index, mode] of ['home', 'gym'].entries()) {
    const entries = Object.fromEntries(muscles.map(([key]) => [key, { primary: 0, secondary: 0, primaryMoves: new Map(), secondaryMoves: new Map() }]));
    for (const body of tables[index].tBodies) {
      for (const row of body.rows) {
        const offset = row === body.rows[0] ? 2 : 0;
        const action = row.cells[offset]?.querySelector('a');
        if (!action) continue;
        const name = original(action.firstChild).trim();
        const assignment = movements[name];
        if (!assignment) { console.warn(`Training volume: unmapped exercise ${name}`); continue; }
        const prescription = original(row.cells[offset + 1].firstChild) || row.cells[offset + 1].textContent;
        const sets = Number((prescription.match(/(\d+)\s*(?:组|sets?)/i) || [])[1]);
        const reps = Number((prescription.match(/(?:最少|at least)\s*(\d+)/i) || [])[1]);
        if (!sets || !reps) { console.warn(`Training volume: unreadable sets or reps for ${name}`); continue; }
        const sides = /[／/]\s*(?:腿|侧|leg|side)/i.test(prescription) ? 2 : 1;
        const listedWeight = Number(action.dataset.weight) || 0;
        const kind = action.dataset.weightKind;
        // Reverse-crunch dumbbell is held for balance, so use a bodyweight proxy instead.
        const weight = assignment.bodyFactor ? bodyWeightLb * assignment.bodyFactor
          : kind === 'plates' ? listedWeight + 20
          : kind === 'each' ? listedWeight * 2 : listedWeight;
        const volume = sets * reps * sides * weight;
        for (const category of ['primary', 'secondary']) {
          for (const muscle of assignment[category]) {
            const item = entries[muscle];
            item[category] += volume;
            const previous = item[`${category}Moves`].get(name) || 0;
            item[`${category}Moves`].set(name, previous + volume);
          }
        }
      }
    }
    data[mode] = entries;
  }

  const section = text('section', 'strength-volume', '');
  section.id = 'muscle-volume';
  section.append(text('h2', 'volume-training-title', tr('肌群训练量', 'Training Volume by Muscle Group')));
  const maps = text('div', 'volume-photo-grid', '');
  const details = text('div', 'visual-card-grid volume-detail-grid', '');
  const detailsSection = text('section', 'strength-volume strength-volume-details', '');
  detailsSection.append(text('h3', 'volume-details-title', tr('肌群明细', 'Muscle Group Details')), details);
  section.append(maps);
  root.prepend(toolbar, section);
  root.append(detailsSection);

  const siteRoot = document.querySelector('.brand')?.href || location.origin + '/';
  let leaderObserver;
  let updateLeaders = () => {};
  window.addEventListener('resize', () => updateLeaders());
  function show(mode) {
    leaderObserver?.disconnect();
    maps.replaceChildren();
    details.replaceChildren();
    const leaderUpdates = [];
    const cards = new Map();
    for (const [key, zh, english] of muscles) {
      const item = data[mode][key];
      const card = text('article', 'visual-card visual-volume-card', '');
      card.id = `volume-${mode}-${key}`;
      card.tabIndex = -1;
      card.append(text('h4', '', tr(zh, english)));
      const metrics = text('div', 'muscle-volume-metrics', '');
      for (const [label, value] of [[tr('主要', 'Primary'), item.primary], [tr('辅助', 'Secondary'), item.secondary], [tr('合计', 'Total'), item.primary + item.secondary]]) {
        const metric = text('div', 'muscle-volume-metric', '');
        metric.append(text('span', '', label), text('strong', '', format(value)));
        metrics.append(metric);
      }
      card.append(metrics);
      for (const [category, zhLabel, enLabel] of [['primary', '主要动作', 'Primary Exercises'], ['secondary', '辅助动作', 'Secondary Exercises']]) {
        const moves = [...item[`${category}Moves`]].map(([name, value]) => `${tr(name, window.fitnessI18n?.translate(name) || name)} ${format(value)}`);
        const line = text('div', 'visual-volume-line', '');
        line.append(text('span', '', tr(zhLabel, enLabel)), text('strong', '', moves.join(tr('、', ', ')) || '—'));
        card.append(line);
      }
      cards.set(key, card);
      details.append(card);
    }
    for (const side of ['front', 'back']) {
      const figure = text('figure', 'volume-photo', '');
      const image = document.createElement('img');
      image.src = new URL(side === 'back' ? 'assets/images/fitness-anatomy-back-v2.png' : 'assets/images/fitness-anatomy-front.webp', siteRoot).href;
      image.alt = tr(side === 'front' ? '正面肌群示意图' : '背面肌群示意图', side === 'front' ? 'Front Muscle Diagram' : 'Back Muscle Diagram');
      image.width = 1024;
      image.height = 1536;
      const leaders = svgElement('svg', 'volume-photo-leaders');
      leaders.setAttribute('aria-hidden', 'true');
      figure.append(image, leaders);
      const connectors = [];
      for (const [key, zh, english] of muscles) {
        const edge = labelSides[side][key];
        if (!edge) continue;
        const item = data[mode][key];
        const badge = text('button', `volume-photo-badge is-${edge}`, '');
        badge.type = 'button';
        badge.style[edge] = 'var(--volume-label-offset)';
        badge.append(text('span', 'volume-photo-name', tr(zh, english)));
        for (const [short, value, kind] of [[tr('主要', 'Primary'), item.primary, 'primary'], [tr('辅助', 'Secondary'), item.secondary, 'secondary'], [tr('合计', 'Total'), item.primary + item.secondary, 'total']]) {
          const line = text('span', `volume-photo-value is-${kind}`, '');
          line.append(text('span', '', short), text('strong', '', format(value)));
          badge.append(line);
        }
        badge.setAttribute('aria-label', `${tr(zh, english)}: ${tr('主要', 'Primary')} ${format(item.primary)}, ${tr('辅助', 'Secondary')} ${format(item.secondary)}, ${tr('合计', 'Total')} ${format(item.primary + item.secondary)}. ${tr('查看明细', 'View Details')}`);
        badge.addEventListener('click', () => {
          const card = cards.get(key);
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.focus({ preventScroll: true });
        });
        const connector = svgElement('g', 'volume-photo-connector');
        const outline = svgElement('path', 'volume-photo-leader-outline');
        const line = svgElement('path', 'volume-photo-leader-line');
        const halo = svgElement('circle', 'volume-photo-dot-halo');
        const dot = svgElement('circle', 'volume-photo-dot');
        halo.setAttribute('r', '6.5');
        dot.setAttribute('r', '3.5');
        connector.append(outline, line, halo, dot);
        leaders.append(connector);
        for (const [event, active] of [['pointerenter', true], ['pointerleave', false], ['focus', true], ['blur', false]]) {
          badge.addEventListener(event, () => connector.classList.toggle('is-active', active));
        }
        connectors.push({ badge, edge, point: musclePoints[side][key], outline, line, halo, dot });
        figure.append(badge);
      }
      const update = () => {
        const figureRect = figure.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        if (!figureRect.width || !imageRect.width) return;
        leaders.setAttribute('viewBox', `0 0 ${figureRect.width} ${figureRect.height}`);
        for (const edge of ['left', 'right']) {
          const entries = connectors.filter((item) => item.edge === edge)
            .sort((a, b) => a.point[1] - b.point[1]);
          const blocks = [];
          let offset = 0;
          entries.forEach((entry, index) => {
            entry.height = entry.badge.getBoundingClientRect().height;
            entry.dotY = imageRect.top - figureRect.top + entry.point[1] / 1536 * imageRect.height;
            if (index) offset += (entries[index - 1].height + entry.height) / 2 + 8;
            entry.offset = offset;
            blocks.push({ start: index, end: index, sum: entry.dotY - offset, count: 1 });
            while (blocks.length > 1) {
              const last = blocks[blocks.length - 1];
              const previous = blocks[blocks.length - 2];
              if (previous.sum / previous.count <= last.sum / last.count) break;
              previous.end = last.end;
              previous.sum += last.sum;
              previous.count += last.count;
              blocks.pop();
            }
          });
          for (const block of blocks) {
            const base = block.sum / block.count;
            for (let index = block.start; index <= block.end; index++) {
              entries[index].center = base + entries[index].offset;
            }
          }
          if (entries.length) {
            const first = entries[0];
            const last = entries[entries.length - 1];
            const shift = Math.max(first.height / 2 - first.center, 0)
              - Math.max(last.center + last.height / 2 - figureRect.height, 0);
            for (const entry of entries) entry.badge.style.top = `${entry.center + shift - entry.height / 2}px`;
          }
        }
        for (const { badge, edge, point, outline, line, halo, dot } of connectors) {
          const badgeRect = badge.getBoundingClientRect();
          const x1 = imageRect.left - figureRect.left + point[0] / 1024 * imageRect.width;
          const y1 = imageRect.top - figureRect.top + point[1] / 1536 * imageRect.height;
          const x2 = (edge === 'left' ? badgeRect.right : badgeRect.left) - figureRect.left;
          const y2 = badgeRect.top - figureRect.top + badgeRect.height / 2;
          const elbowX = x1 + (x2 - x1) * .68;
          for (const stroke of [outline, line]) {
            stroke.setAttribute('d', `M ${x1} ${y1} L ${elbowX} ${y2} H ${x2}`);
          }
          for (const circle of [halo, dot]) {
            circle.setAttribute('cx', x1);
            circle.setAttribute('cy', y1);
          }
        }
      };
      image.addEventListener('load', update);
      leaderUpdates.push(update);
      maps.append(figure);
    }
    updateLeaders = () => leaderUpdates.forEach((update) => update());
    if (typeof ResizeObserver !== 'undefined') {
      leaderObserver = new ResizeObserver(updateLeaders);
      for (const figure of maps.children) leaderObserver.observe(figure);
    }
    requestAnimationFrame(updateLeaders);
  }
  const buttons = [...toolbar.querySelectorAll('.volume-switch-button')];
  buttons.forEach((button, index) => button.addEventListener('click', () => show(index === 0 ? 'home' : 'gym')));
  show(buttons[1]?.getAttribute('aria-pressed') === 'true' ? 'gym' : 'home');
})();
