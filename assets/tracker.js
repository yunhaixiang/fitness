(() => {
  'use strict';
  const KEY = 'yunhai-fitness-records-v1';
  const DAYS = 56;
  const types = {
    body: { name: '身体组成', fields: [
      ['date', '日期'], ['weight', '体重 kg'], ['bf', '体脂率 %']
    ], chart: [['weight', '体重 kg'], ['bf', '体脂率 %']] },
    cheatMeals: { name: '放纵餐', fields: [
      ['date', '日期'], ['meal', '放纵餐'], ['portion', '份量'], ['kcal', '热量 kcal'], ['note', '备注']
    ] }
  };
  const names = Object.keys(types);
  const blank = () => Object.fromEntries(names.map((name) => [name, []]));
  let records = blank();
  let legacyRecords = {};
  let publishedCurrent = {};
  // Keep removed categories available in backups, without displaying or rewriting them.
  const storedRecords = () => ({ ...legacyRecords, ...records, currentBody: publishedCurrent });
  let active = 'body';
  const dateString = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => dateString(new Date());
  const cutoff = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - DAYS + 1); return dateString(d); };
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) { /* storage disabled */ }
  if (saved) { try { const parsed = JSON.parse(saved); legacyRecords = parsed; for (const name of names) if (Array.isArray(parsed[name])) records[name] = parsed[name]; } catch (_) { /* keep blank */ } }
  try {
    const published = JSON.parse(document.getElementById('tracking-records')?.textContent || '{}');
    publishedCurrent = published.currentBody || {};
    for (const name of names) {
      const canonical = Array.isArray(published[name]) ? published[name] : [];
      const ids = new Set(canonical.map((row) => row.id).filter(Boolean));
      records[name] = [...canonical, ...records[name].filter((row) => !ids.has(row.id))];
    }
  } catch (_) { /* Keep legacy history available if published data cannot be read. */ }
  const latest = (name) => [...records[name]].sort((a, b) => b.date.localeCompare(a.date))[0];
  const recent = (name) => records[name].filter((row) => row.date >= cutoff()).sort((a, b) => b.date.localeCompare(a.date));
  const metric = (label, value) => { const box = document.createElement('div'); box.className = 'metric-box'; const s = document.createElement('span'); s.textContent = label; const strong = document.createElement('strong'); strong.textContent = value || '—'; box.append(s, strong); return box; };
  function renderMetrics() {
    const host = document.querySelector('#latest-metrics'); host.replaceChildren();
    const body = window.fitnessBodyMetrics || latest('body');
    host.append(metric('当前体重', body?.weight ? `${body.weight} kg` : '—'), metric('当前体脂率', body?.bf ? `${body.bf}%` : '—'));
    if (!body?.weight && !body?.bf && names.every((name) => records[name].length === 0)) host.setAttribute('aria-label', '还没有记录');
    else host.removeAttribute('aria-label');
  }
  function buildPanel(name) {
    const config = types[name];
    const panel = document.createElement('section'); panel.className = 'tracker-panel'; panel.id = `panel-${name}`; panel.setAttribute('role', 'tabpanel');
    const chartCard = document.createElement('div'); chartCard.className = 'tracker-card';
    const chartTitle = document.createElement('h2'); chartTitle.textContent = '最近 8 周趋势';
    const chartSelect = document.createElement('select'); chartSelect.className = 'small-button'; chartSelect.setAttribute('aria-label', '选择趋势指标');
    for (const [key, label] of config.chart || []) { const opt = document.createElement('option'); opt.value = key; opt.textContent = label; chartSelect.append(opt); }
    chartCard.append(chartTitle);
    if (config.chart) { chartCard.append(chartSelect); const chart = document.createElement('div'); chart.className = 'chart-wrap'; chart.dataset.chart = name; chartCard.append(chart); }

    const listCard = document.createElement('div'); listCard.className = 'tracker-card';
    const listTitle = document.createElement('h2'); listTitle.textContent = '最近 8 周记录';
    const list = document.createElement('div'); list.className = 'record-list'; list.dataset.list = name;
    listCard.append(listTitle, list);
    if (config.chart) panel.append(chartCard);
    panel.append(listCard); return panel;
  }
  function renderList(name) {
    const host = document.querySelector(`[data-list="${name}"]`); host.replaceChildren();
    const rows = recent(name);
    // Show the shared current reading even when this browser has no dated history.
    // Do not invent a measurement date or add an undated reading to the chart.
    if (name === 'body' && (publishedCurrent.weight || publishedCurrent.bf) && !rows.some(row =>
      Number(row.weight) === Number(publishedCurrent.weight) && Number(row.bf) === Number(publishedCurrent.bf))) {
      rows.unshift({ ...publishedCurrent, date: '当前数据' });
    }
    if (!rows.length) { const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = '还没有最近 8 周的记录。'; host.append(empty); return; }
    const list = document.createElement('div'); list.className = 'record-card-grid';
    for (const row of rows) { const card = document.createElement('article'); card.className = 'record-card';
      const head = document.createElement('div'); head.className = 'record-card-head';
      const date = document.createElement('strong'); date.textContent = row.date;
      head.append(date); card.append(head);
      const fields = document.createElement('dl'); fields.className = 'record-card-fields';
      for (const [key, label] of types[name].fields.slice(1)) {
        if (row[key] === '' || row[key] == null) continue;
        const term = document.createElement('dt'); term.textContent = label;
        const value = document.createElement('dd'); value.textContent = row[key];
        fields.append(term, value);
      }
      card.append(fields); list.append(card); }
    host.append(list);
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
    for (let i = 0; i < 4; i++) { const yy = top + i * (height - top - bottom) / 3; const line = document.createElementNS(ns, 'line'); line.setAttribute('x1', left); line.setAttribute('x2', width - right); line.setAttribute('y1', yy); line.setAttribute('y2', yy); line.setAttribute('stroke', 'var(--line-strong)'); svg.append(line); const text = document.createElementNS(ns, 'text'); text.setAttribute('x', 4); text.setAttribute('y', yy + 4); text.setAttribute('fill', 'var(--muted)'); text.setAttribute('font-size', 11); text.textContent = (max - i * (max - min) / 3).toFixed(1); svg.append(text); }
    const path = document.createElementNS(ns, 'polyline'); path.setAttribute('points', values.map((value, i) => `${x(i)},${y(value)}`).join(' ')); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'var(--accent)'); path.setAttribute('stroke-width', 3); path.setAttribute('stroke-linejoin', 'round'); svg.append(path);
    values.forEach((value, i) => { const dot = document.createElementNS(ns, 'circle'); dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(value)); dot.setAttribute('r', 4); dot.setAttribute('fill', 'var(--accent)'); const tip = document.createElementNS(ns, 'title'); tip.textContent = `${points[i].date}: ${value}`; dot.append(tip); svg.append(dot); });
    for (const i of [0, points.length - 1]) { const label = document.createElementNS(ns, 'text'); label.setAttribute('x', x(i)); label.setAttribute('y', height - 6); label.setAttribute('text-anchor', i ? 'end' : 'start'); label.setAttribute('fill', 'var(--muted)'); label.setAttribute('font-size', 11); label.textContent = points[i].date.slice(5); svg.append(label); }
    host.append(svg);
  }
  function renderAll() { renderMetrics(); for (const name of names) { renderList(name); renderChart(name); } window.fitnessI18n?.apply(); }
  function show(name) { active = name; for (const button of document.querySelectorAll('[data-tab]')) button.setAttribute('aria-selected', button.dataset.tab === name ? 'true' : 'false'); for (const panel of document.querySelectorAll('.tracker-panel')) panel.classList.toggle('active', panel.id === `panel-${name}`); }
  function download(filename, data, type) { const blob = new Blob([data], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  document.querySelector('#tracker-panels').append(...names.map(buildPanel));
  document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => show(button.dataset.tab)));
  document.querySelectorAll('.chart-wrap').forEach((host) => host.previousElementSibling.addEventListener('change', () => { renderChart(host.dataset.chart); window.fitnessI18n?.apply(host); }));
  document.querySelector('#export-json').addEventListener('click', () => download(`fitness-backup-${today()}.json`, JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records: storedRecords() }, null, 2), 'application/json'));
  show(active); renderAll();
})();
