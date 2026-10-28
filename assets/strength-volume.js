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
  const positions = {
    front: {
      chest: ['left', 25], 'front-delts': ['right', 16], 'side-delts': ['right', 28],
      biceps: ['left', 36], forearms: ['left', 49], abs: ['right', 42],
      obliques: ['right', 53], quads: ['left', 69]
    },
    back: {
      'rear-delts': ['left', 22], traps: ['right', 17], lats: ['left', 38],
      triceps: ['right', 34], 'lower-back': ['right', 49], glutes: ['left', 59],
      hamstrings: ['right', 69], calves: ['left', 82]
    }
  };
  // An exercise contributes its full calculated load to every listed muscle.
  // These per-muscle totals are not additive across muscle groups.
  const movements = {
    '俯卧撑': { primary: ['chest'], secondary: ['front-delts', 'triceps', 'abs'], bodyFactor: .64 },
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
  section.append(maps, text('h3', 'volume-details-title', tr('肌群明细', 'Muscle Group Details')), details);
  root.prepend(toolbar, section);

  const siteRoot = document.querySelector('.brand')?.href || location.origin + '/';
  function show(mode) {
    maps.replaceChildren();
    details.replaceChildren();
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
      image.src = new URL(`assets/images/fitness-anatomy-${side}.webp`, siteRoot).href;
      image.alt = tr(side === 'front' ? '正面肌群示意图' : '背面肌群示意图', side === 'front' ? 'Front Muscle Diagram' : 'Back Muscle Diagram');
      image.width = 1024;
      image.height = 1536;
      figure.append(image);
      for (const [key, zh, english] of muscles) {
        const position = positions[side][key];
        if (!position) continue;
        const item = data[mode][key];
        const badge = text('button', `volume-photo-badge is-${position[0]}`, '');
        badge.type = 'button';
        badge.style[position[0]] = '0';
        badge.style.top = `${position[1]}%`;
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
        figure.append(badge);
      }
      maps.append(figure);
    }
  }
  const buttons = [...toolbar.querySelectorAll('.volume-switch-button')];
  buttons.forEach((button, index) => button.addEventListener('click', () => show(index === 0 ? 'home' : 'gym')));
  show(buttons[1]?.getAttribute('aria-pressed') === 'true' ? 'gym' : 'home');
})();
