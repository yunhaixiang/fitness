(() => {
  'use strict';
  // Calendar-only arithmetic avoids DST shifts. Keep the existing rolling 56-day window.
  function groupWeeks(rows) {
    const weeks = new Map();
    for (const row of rows) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) continue;
      const date = new Date(`${row.date}T12:00:00Z`);
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== row.date) continue;
      date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
      const start = date.toISOString().slice(0, 10);
      if (!weeks.has(start)) {
        const days = Array.from({length: 7}, (_, index) => {
          const day = new Date(date); day.setUTCDate(day.getUTCDate() + index);
          return {date: day.toISOString().slice(0, 10), rows: []};
        });
        weeks.set(start, {start, end: days[6].date, days});
      }
      weeks.get(start).days.find(day => day.date === row.date).rows.push(row);
    }
    return [...weeks.values()].sort((a, b) => b.start.localeCompare(a.start));
  }
  const dayMs = 86400000;
  function calendarDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
    const time = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : NaN;
  }
  // A day contributes once, even if it has multiple measurements or sync snapshots.
  function buildTrend(rows, key, through, days = 56) {
    const end = calendarDay(through);
    if (!Number.isFinite(end)) return {daily: [], rolling: [], average: null, count: 0};
    const start = end - (days - 1) * dayMs;
    const byDay = new Map();
    for (const row of rows) {
      const time = calendarDay(row.date), value = Number(row[key]);
      if (!Number.isFinite(time) || time > end || time < start - 6 * dayMs || row[key] == null || row[key] === '' || !Number.isFinite(value)) continue;
      if (key === 'steps' ? value < 0 : value <= 0 || (key === 'bf' && value > 100)) continue;
      const stamp = Date.parse(row.collectedAt || row.measuredAt || '');
      const rank = Number.isFinite(stamp) ? stamp : time;
      if (!byDay.has(time) || rank >= byDay.get(time).rank) byDay.set(time, {date: row.date, time, value, rank});
    }
    const rolling = Array.from({length: days}, (_, i) => {
      const time = start + i * dayMs;
      const window = [...byDay.values()].filter(point => point.time >= time - 6 * dayMs && point.time <= time);
      return {date: new Date(time).toISOString().slice(0, 10), time, count: window.length,
        value: window.length ? window.reduce((sum, point) => sum + point.value, 0) / window.length : null};
    });
    const last = rolling.at(-1);
    return {daily: [...byDay.values()].filter(point => point.time >= start).sort((a,b) => a.time-b.time),
      rolling, average: last.value, count: last.count,
      from: new Date(end - 6 * dayMs).toISOString().slice(0,10), through};
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = {groupWeeks, buildTrend}; return; }
  const KEY = 'yunhai-fitness-records-v1';
  const DAYS = 56;
  const types = {
    body: { name: '身体组成', fields: [
      ['date', '日期'], ['weight', '体重 kg'], ['bf', '体脂率 %']
    ], chart: [['weight', '体重 kg'], ['bf', '体脂率 %']] },
    steps: { name: '步数', fields: [['date', '日期'], ['steps', '步数']], chart: [['steps', '步数']] },
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
  if (saved) { try { const parsed = JSON.parse(saved); legacyRecords = {cheatMeals: Array.isArray(parsed.cheatMeals) ? parsed.cheatMeals : []}; records.cheatMeals = legacyRecords.cheatMeals; } catch (_) { /* keep blank */ } }
  try {
    const published = JSON.parse(document.getElementById('tracking-records')?.textContent || '{}');
    publishedCurrent = published.currentBody || {};
    for (const name of names) {
      const canonical = Array.isArray(published[name]) ? published[name] : [];
      const ids = new Set(canonical.map((row) => row.id).filter(Boolean));
      records[name] = [...canonical, ...records[name].filter((row) => !ids.has(row.id))];
    }
  } catch (_) { /* Health records stay empty unless supplied by the private server. */ }
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
    function recordCard(row, heading) {
      const card = document.createElement('article'); card.className = 'record-card';
      if (heading) {
        const head = document.createElement('div'); head.className = 'record-card-head';
        const date = document.createElement('strong'); date.textContent = heading;
        head.append(date); card.append(head);
      }
      const fields = document.createElement('dl'); fields.className = 'record-card-fields';
      for (const [key, label] of types[name].fields.slice(1)) {
        if (row[key] === '' || row[key] == null) continue;
        const term = document.createElement('dt'); term.textContent = label;
        const value = document.createElement('dd'); value.textContent = row[key];
        fields.append(term, value);
      }
      card.append(fields); return card;
    }
    // An undated current reading is separate; never assign it to a made-up calendar day.
    for (const row of rows.filter(row => row.date === '当前数据')) host.append(recordCard(row, row.date));
    const list = document.createElement('div'); list.className = 'record-weeks';
    const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    for (const week of groupWeeks(rows)) {
      const section = document.createElement('section'); section.className = 'record-week';
      const title = document.createElement('h3'); title.className = 'record-week-title';
      title.id = `${name}-week-${week.start}`;
      title.textContent = `${week.start} — ${week.end}`;
      const scroll = document.createElement('div'); scroll.className = 'record-week-scroll';
      scroll.tabIndex = 0; scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-labelledby', title.id);
      const grid = document.createElement('div'); grid.className = 'record-week-grid';
      week.days.forEach((day, index) => {
        const cell = document.createElement('div'); cell.className = 'record-day';
        const head = document.createElement('div'); head.className = 'record-day-heading';
        const label = document.createElement('strong'); label.textContent = weekdays[index];
        const date = document.createElement('time'); date.dateTime = day.date; date.textContent = day.date.slice(5);
        head.append(label, date); cell.append(head);
        if (day.rows.length) day.rows.forEach(row => cell.append(recordCard(row)));
        else { const empty = document.createElement('span'); empty.className = 'record-day-empty'; empty.textContent = '—'; cell.append(empty); }
        grid.append(cell);
      });
      scroll.append(grid); section.append(title, scroll); list.append(section);
    }
    host.append(list);
  }

  function renderChart(name) {
    const host = document.querySelector(`[data-chart="${name}"]`); if (!host) return;
    const key = host.previousElementSibling.value;
    const en = window.fitnessI18n?.language === 'en';
    const t = (zh, english) => en ? english : zh;
    const trend = buildTrend(records[name], key, today(), DAYS);
    const unit = key === 'weight' ? ' kg' : key === 'bf' ? '%' : t(' 步', ' steps');
    const format = value => value == null ? '—' : new Intl.NumberFormat(en ? 'en-CA' : 'zh-CN', {maximumFractionDigits: key === 'steps' ? 0 : 2}).format(value);
    const label = key === 'weight' ? t('体重', 'Weight') : key === 'bf' ? t('体脂率', 'Body Fat') : t('步数', 'Steps');
    host.replaceChildren();
    const summary = document.createElement('div'); summary.className = 'trend-summary'; summary.setAttribute('aria-live', 'polite');
    const heading = document.createElement('span'); heading.textContent = t('最近7天平均', 'Last 7 Days Average');
    const value = document.createElement('strong'); value.textContent = format(trend.average) + (trend.average == null ? '' : unit);
    const coverage = document.createElement('small'); coverage.textContent = `${trend.from} — ${trend.through} · ${t(`已记录 ${trend.count}/7 天`, `${trend.count}/7 days recorded`)}`;
    summary.append(heading, value, coverage); host.append(summary);
    const legend = document.createElement('div'); legend.className = 'trend-legend';
    for (const [className, text] of [['trend-key-raw', t('每日记录', 'Daily Reading')], ['trend-key-average', t('7天移动平均', '7-Day Moving Average')]]) {
      const item = document.createElement('span'); item.className = className; item.textContent = text; legend.append(item);
    }
    host.append(legend);
    const points = trend.daily;
    if (!points.length) { const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = t('还没有最近8周的有效记录。', 'No valid records in the last 8 weeks.'); host.append(empty); return; }
    const averages = trend.rolling.filter(point => point.time >= points[0].time);
    const values = [...points, ...averages].filter(point => point.value != null).map(point => point.value);
    const low = Math.min(...values), high = Math.max(...values), pad = Math.max((high-low)*.15, key === 'steps' ? 100 : 1);
    const min = key === 'steps' ? Math.max(0, low-pad) : low-pad, max = high+pad;
    const width = 760, height = 235, left = key === 'steps' ? 62 : 50, right = 18, top = 18, bottom = 35;
    const first = points[0].time, last = calendarDay(today());
    const x = time => first === last ? (left+width-right)/2 : left + (time-first)*(width-left-right)/(last-first);
    const y = value => top + (max-value)*(height-top-bottom)/(max-min);
    const ns = 'http://www.w3.org/2000/svg';
    const node = (tag, attrs = {}, text) => {
      const element = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
      if (text !== undefined) element.textContent = text;
      return element;
    };
    const svg = node('svg', {viewBox: `0 0 ${width} ${height}`, class: 'trend-svg', role: 'img',
      'aria-label': `${label} · ${t('每日记录与7天移动平均；最近7天平均', 'Daily readings and 7-day moving average; last 7 days average')}: ${format(trend.average)}${trend.average == null ? '' : unit}`});
    for (let i=0; i<4; i++) {
      const yy=top+i*(height-top-bottom)/3;
      svg.append(node('line', {x1:left,x2:width-right,y1:yy,y2:yy,stroke:'var(--line-strong)'}));
      svg.append(node('text', {x:4,y:yy+4,fill:'var(--muted)','font-size':11}, key==='steps' ? Math.round(max-i*(max-min)/3).toLocaleString(en?'en-CA':'zh-CN') : (max-i*(max-min)/3).toFixed(1)));
    }
    function draw(series, color, dashed) {
      let segments = [], segment = [];
      for (const point of series) {
        if (point.value == null) { if (segment.length) segments.push(segment); segment=[]; }
        else segment.push(point);
      }
      if (segment.length) segments.push(segment);
      for (const part of segments) {
        svg.append(node('polyline', {points:part.map(point=>`${x(point.time)},${y(point.value)}`).join(' '),fill:'none',stroke:color,'stroke-width':dashed?3:2,'stroke-dasharray':dashed?'7 5':'none','stroke-linejoin':'round'}));
        for (const point of part) {
          const dot=node('circle',{cx:x(point.time),cy:y(point.value),r:dashed?2.5:3.5,fill:color});
          dot.append(node('title',{}, `${point.date} · ${dashed?t('7天平均','7-day average'):label}: ${format(point.value)}${unit}${dashed?` · ${point.count}/7 ${t('天','days')}`:''}`));
          svg.append(dot);
        }
      }
    }
    draw(points, 'var(--accent)', false);
    draw(averages, 'var(--gold)', true);
    const endpoints=first===last?[points[0]]:[points[0],{time:last,date:today()}];
    endpoints.forEach((point,i)=>svg.append(node('text',{x:x(point.time),y:height-6,'text-anchor':first===last?'middle':i?'end':'start',fill:'var(--muted)','font-size':11},point.date.slice(5))));
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
