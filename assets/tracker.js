(() => {
  'use strict';
  const KEY = 'yunhai-fitness-records-v1';
  const DAYS = 56;
  const types = {
    body: { name: '身体组成', description: '建议起床如厕后、吃喝前记录；同一设备、同一条件下看趋势。', fields: [
      ['date', '日期', 'date', true], ['weight', '体重 kg', 'number'], ['bf', 'Hume 体脂率 %', 'number'],
      ['waist', '腰围 cm', 'number'], ['neck', '颈围 cm', 'number'], ['abdomen', '肚脐腹围 cm', 'number'],
      ['fatMass', '脂肪量 kg', 'number'], ['muscle', '骨骼肌量 kg', 'number'], ['visceral', '内脏脂肪（App 数值）', 'number'],
      ['water', '体水分 %', 'number']
    ], chart: [['weight', '体重 kg'], ['bf', '体脂率 %'], ['muscle', '骨骼肌 kg']] },
    food: { name: '饮食', description: '填当天实际摄入；不必为了凑满所有项目而放弃记录。', fields: [
      ['date', '日期', 'date', true], ['kcal', '热量 kcal', 'number'], ['protein', '蛋白质 g', 'number'],
      ['carbs', '碳水 g', 'number'], ['fat', '总脂肪 g', 'number'], ['satFat', '饱和脂肪 g', 'number'],
      ['fiber', '膳食纤维 g', 'number'], ['note', '备注', 'text']
    ], chart: [['kcal', '摄入 kcal'], ['protein', '蛋白质 g']] },
    strength: { name: '力量训练', description: '每个动作记一条；负重写实际使用重量，左右两侧次数可写在备注里。', fields: [
      ['date', '日期', 'date', true], ['place', '场地', 'select', false, ['在家', '健身馆']], ['exercise', '动作', 'text', true],
      ['sets', '组数', 'number'], ['reps', '每组次数', 'text'], ['weightLb', '单只哑铃／器械负重 lb', 'number'], ['note', '备注', 'text']
    ] },
    cardio: { name: '有氧训练', description: '记录实际完成量；热量是估计值，不必每次都填。', fields: [
      ['date', '日期', 'date', true], ['activity', '项目', 'select', true, ['HIIT', '游泳', '跑步机', '其他']],
      ['minutes', '时长 min', 'number'], ['distance', '距离 km', 'number'], ['kcal', '估计净消耗 kcal', 'number'], ['note', '备注', 'text']
    ], chart: [['minutes', '有氧时长 min']] },
    sleep: { name: '睡眠', description: '日期填起床当天；Oura 数值可选填，优先看长期趋势。', fields: [
      ['date', '起床日期', 'date', true], ['asleep', '实际入睡', 'time'], ['wake', '起床时间', 'time'],
      ['hours', '总睡眠 h', 'number'], ['latency', '入睡耗时 min', 'number'], ['efficiency', '睡眠效率 %', 'number'],
      ['score', '睡眠评分', 'number'], ['rhr', '最低静息心率 bpm', 'number'], ['hrv', '平均 HRV ms', 'number']
    ], chart: [['hours', '总睡眠 h'], ['score', '睡眠评分']] }
  };
  const names = Object.keys(types);
  const blank = () => Object.fromEntries(names.map((name) => [name, []]));
  let records = blank();
  let active = 'body';
  const dateString = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => dateString(new Date());
  const cutoff = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - DAYS + 1); return dateString(d); };
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) { /* storage disabled */ }
  if (saved) { try { const parsed = JSON.parse(saved); for (const name of names) if (Array.isArray(parsed[name])) records[name] = parsed[name]; } catch (_) { /* keep blank */ } }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(records)); return true; } catch (_) { alert('浏览器未能保存记录。请检查是否禁用了本地存储，或先导出备份。'); return false; } };
  const latest = (name) => [...records[name]].sort((a, b) => b.date.localeCompare(a.date))[0];
  const recent = (name) => records[name].filter((row) => row.date >= cutoff()).sort((a, b) => b.date.localeCompare(a.date));
  const metric = (label, value) => { const box = document.createElement('div'); box.className = 'metric-box'; const s = document.createElement('span'); s.textContent = label; const strong = document.createElement('strong'); strong.textContent = value || '—'; box.append(s, strong); return box; };
  function renderMetrics() {
    const host = document.querySelector('#latest-metrics'); host.replaceChildren();
    const body = latest('body'), food = latest('food'), sleep = latest('sleep');
    host.append(metric('最新体重', body?.weight ? `${body.weight} kg` : '—'), metric('最近体脂率', body?.bf ? `${body.bf}%` : '—'), metric('最近总睡眠', sleep?.hours ? `${sleep.hours} h` : '—'));
    if (!body && !food && !sleep) host.setAttribute('aria-label', '还没有记录');
  }
  function fieldControl(field) {
    const [key, label, type, required, options] = field;
    const wrapper = document.createElement('label'); wrapper.textContent = label;
    if (key === 'note') wrapper.className = 'wide-field';
    const control = type === 'select' ? document.createElement('select') : document.createElement('input');
    control.name = key; control.required = !!required;
    if (type === 'select') { for (const option of options) { const el = document.createElement('option'); el.value = option; el.textContent = option; control.append(el); } }
    else { control.type = type; if (type === 'number') { control.step = 'any'; control.min = '0'; } if (type === 'date') control.value = today(); }
    wrapper.append(control); return wrapper;
  }
  function buildPanel(name) {
    const config = types[name];
    const panel = document.createElement('section'); panel.className = 'tracker-panel'; panel.id = `panel-${name}`; panel.setAttribute('role', 'tabpanel');
    const formCard = document.createElement('div'); formCard.className = 'tracker-card';
    const title = document.createElement('h2'); title.textContent = `新增${config.name}记录`;
    const description = document.createElement('p'); description.textContent = config.description;
    const form = document.createElement('form'); form.className = 'tracker-form'; form.dataset.type = name;
    for (const field of config.fields) form.append(fieldControl(field));
    const action = document.createElement('div'); action.className = 'form-submit';
    const submit = document.createElement('button'); submit.type = 'submit'; submit.textContent = '保存记录';
    const feedback = document.createElement('span'); feedback.className = 'form-feedback'; feedback.setAttribute('role', 'status');
    action.append(submit, feedback); form.append(action); formCard.append(title, description, form);
    const chartCard = document.createElement('div'); chartCard.className = 'tracker-card';
    const chartTitle = document.createElement('h2'); chartTitle.textContent = '最近 8 周趋势';
    const chartSelect = document.createElement('select'); chartSelect.className = 'small-button'; chartSelect.setAttribute('aria-label', '选择趋势指标');
    for (const [key, label] of config.chart || []) { const opt = document.createElement('option'); opt.value = key; opt.textContent = label; chartSelect.append(opt); }
    chartCard.append(chartTitle);
    if (config.chart) { chartCard.append(chartSelect); const chart = document.createElement('div'); chart.className = 'chart-wrap'; chart.dataset.chart = name; chartCard.append(chart); }
    else { const none = document.createElement('p'); none.textContent = '训练动作按日期列在下方，便于比较组数和负重。'; chartCard.append(none); }
    const listCard = document.createElement('div'); listCard.className = 'tracker-card';
    const listTitle = document.createElement('h2'); listTitle.textContent = '最近 8 周记录';
    const csv = document.createElement('button'); csv.type = 'button'; csv.className = 'small-button'; csv.textContent = '导出此类 CSV'; csv.addEventListener('click', () => exportCsv(name));
    const list = document.createElement('div'); list.className = 'data-table-wrap'; list.dataset.list = name;
    listCard.append(listTitle, csv, list);
    panel.append(formCard, chartCard, listCard); return panel;
  }
  function renderList(name) {
    const host = document.querySelector(`[data-list="${name}"]`); host.replaceChildren();
    const rows = recent(name);
    if (!rows.length) { const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = '还没有最近 8 周的记录。'; host.append(empty); return; }
    const table = document.createElement('table'); table.className = 'data-table';
    const head = document.createElement('thead'), headRow = document.createElement('tr');
    for (const [, label] of types[name].fields) { const th = document.createElement('th'); th.textContent = label; headRow.append(th); }
    const last = document.createElement('th'); last.textContent = '操作'; headRow.append(last); head.append(headRow);
    const body = document.createElement('tbody');
    for (const row of rows) { const tr = document.createElement('tr'); for (const [key] of types[name].fields) { const td = document.createElement('td'); td.textContent = row[key] ?? '—'; tr.append(td); }
      const td = document.createElement('td'), button = document.createElement('button'); button.type = 'button'; button.className = 'delete-row'; button.textContent = '删除';
      button.addEventListener('click', () => { if (confirm('确定删除这条记录？')) { records[name] = records[name].filter((item) => item.id !== row.id); if (save()) renderAll(); } });
      td.append(button); tr.append(td); body.append(tr); }
    table.append(head, body); host.append(table);
  }
  function renderChart(name) {
    const host = document.querySelector(`[data-chart="${name}"]`); if (!host) return;
    const key = host.previousElementSibling.value;
    const points = recent(name).filter((row) => row[key] !== '' && Number.isFinite(Number(row[key]))).reverse();
    host.replaceChildren();
    if (points.length < 2) { const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = '至少记录两个日期才能显示趋势。'; host.append(empty); return; }
    const values = points.map((row) => Number(row[key])); const low = Math.min(...values), high = Math.max(...values), pad = Math.max((high - low) * .15, 1);
    const min = low - pad, max = high + pad, width = 760, height = 235, left = 50, right = 18, top = 18, bottom = 35;
    const x = (i) => left + i * (width - left - right) / (points.length - 1);
    const y = (value) => top + (max - value) * (height - top - bottom) / (max - min);
    const ns = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.setAttribute('class', 'trend-svg'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `${types[name].name}最近八周${key}变化，首值${values[0]}，末值${values.at(-1)}`);
    for (let i = 0; i < 4; i++) { const yy = top + i * (height - top - bottom) / 3; const line = document.createElementNS(ns, 'line'); line.setAttribute('x1', left); line.setAttribute('x2', width - right); line.setAttribute('y1', yy); line.setAttribute('y2', yy); line.setAttribute('stroke', '#dfe8dd'); svg.append(line); const text = document.createElementNS(ns, 'text'); text.setAttribute('x', 4); text.setAttribute('y', yy + 4); text.setAttribute('fill', '#69806e'); text.setAttribute('font-size', 11); text.textContent = (max - i * (max - min) / 3).toFixed(1); svg.append(text); }
    const path = document.createElementNS(ns, 'polyline'); path.setAttribute('points', values.map((value, i) => `${x(i)},${y(value)}`).join(' ')); path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#347654'); path.setAttribute('stroke-width', 3); path.setAttribute('stroke-linejoin', 'round'); svg.append(path);
    values.forEach((value, i) => { const dot = document.createElementNS(ns, 'circle'); dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(value)); dot.setAttribute('r', 4); dot.setAttribute('fill', '#347654'); const tip = document.createElementNS(ns, 'title'); tip.textContent = `${points[i].date}: ${value}`; dot.append(tip); svg.append(dot); });
    for (const i of [0, points.length - 1]) { const label = document.createElementNS(ns, 'text'); label.setAttribute('x', x(i)); label.setAttribute('y', height - 6); label.setAttribute('text-anchor', i ? 'end' : 'start'); label.setAttribute('fill', '#69806e'); label.setAttribute('font-size', 11); label.textContent = points[i].date.slice(5); svg.append(label); }
    host.append(svg);
  }
  function renderAll() { renderMetrics(); for (const name of names) { renderList(name); renderChart(name); } }
  function show(name) { active = name; for (const button of document.querySelectorAll('[data-tab]')) button.setAttribute('aria-selected', button.dataset.tab === name ? 'true' : 'false'); for (const panel of document.querySelectorAll('.tracker-panel')) panel.classList.toggle('active', panel.id === `panel-${name}`); }
  function download(filename, data, type) { const blob = new Blob([data], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  function exportCsv(name) { const fields = types[name].fields; const quoted = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`; const rows = [fields.map((item) => quoted(item[1])).join(','), ...records[name].map((row) => fields.map(([key]) => quoted(row[key])).join(','))]; download(`fitness-${name}-${today()}.csv`, '\uFEFF' + rows.join('\r\n'), 'text/csv;charset=utf-8'); }
  document.querySelector('#tracker-panels').append(...names.map(buildPanel));
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => show(button.dataset.tab)));
  document.querySelectorAll('.tracker-form').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); const name = form.dataset.type; const values = Object.fromEntries(new FormData(form).entries()); records[name].push({ id: crypto.randomUUID(), ...values }); if (save()) { form.reset(); form.querySelector('[name="date"]').value = today(); form.querySelector('.form-feedback').textContent = '已保存'; renderAll(); } }));
  document.querySelectorAll('.chart-wrap').forEach((host) => host.previousElementSibling.addEventListener('change', () => renderChart(host.dataset.chart)));
  document.querySelector('#export-json').addEventListener('click', () => download(`fitness-backup-${today()}.json`, JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records }, null, 2), 'application/json'));
  document.querySelector('#import-json').addEventListener('click', () => document.querySelector('#import-file').click());
  document.querySelector('#import-file').addEventListener('change', async (event) => { const file = event.target.files[0]; if (!file) return; try { const parsed = JSON.parse(await file.text()); if (parsed.version !== 1 || !parsed.records || typeof parsed.records !== 'object') throw new Error('格式不符'); let count = 0; for (const name of names) { const rows = parsed.records[name]; if (!Array.isArray(rows)) continue; const known = new Set(records[name].map((row) => row.id)); for (const row of rows) { if (!row || typeof row !== 'object' || typeof row.date !== 'string') continue; const id = typeof row.id === 'string' ? row.id : crypto.randomUUID(); if (known.has(id)) continue; const clean = { id, date: row.date }; for (const [key] of types[name].fields) if (key !== 'date' && (typeof row[key] === 'string' || typeof row[key] === 'number')) clean[key] = String(row[key]); records[name].push(clean); known.add(id); count++; } } if (save()) { renderAll(); alert(`导入完成，新增 ${count} 条记录。`); } } catch (_) { alert('这不是本站导出的有效 JSON 备份。'); } event.target.value = ''; });
  show(active); renderAll();
})();
