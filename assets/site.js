const weekStart = new Date();
weekStart.setHours(0, 0, 0, 0);
weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
const trainingBoxes = [...document.querySelectorAll('.training-table input[type="checkbox"][aria-label]')];
const localDay = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
let trainingDay = localDay();
const clearPreviousTrainingChecks = () => {
  try {
    if (localStorage.getItem('fitness-check-date') === trainingDay) return;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('fitness-check:')) localStorage.removeItem(key);
    }
    localStorage.setItem('fitness-check-date', trainingDay);
  } catch (_) { /* storage disabled */ }
};
const syncTrainingDay = () => {
  const today = localDay();
  if (today === trainingDay) return;
  trainingDay = today;
  clearPreviousTrainingChecks();
  for (const box of trainingBoxes) box.checked = false;
  document.dispatchEvent(new Event('fitness:training-day-reset'));
};
if (trainingBoxes.length) {
  clearPreviousTrainingChecks();
  for (const box of trainingBoxes) {
    const label = window.fitnessI18n?.originalAttribute(box, 'aria-label') || box.getAttribute('aria-label');
    try { box.checked = localStorage.getItem(`fitness-check:${trainingDay}:${label}`) === '1'; } catch (_) { /* storage disabled */ }
    box.addEventListener('change', () => {
      const checked = box.checked;
      syncTrainingDay();
      box.checked = checked;
      try { localStorage.setItem(`fitness-check:${trainingDay}:${label}`, checked ? '1' : '0'); } catch (_) { /* storage disabled */ }
    });
  }
  const scheduleDayReset = () => {
    const next = new Date();
    next.setHours(24, 0, 0, 100);
    setTimeout(() => { syncTrainingDay(); scheduleDayReset(); }, next - new Date());
  };
  scheduleDayReset();
  window.addEventListener('focus', syncTrainingDay);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncTrainingDay(); });
}

const shoppingTable = document.querySelector('.shopping-table');
if (shoppingTable) {
  const heading = document.createElement('th');
  heading.className = 'check-head';
  heading.scope = 'col';
  heading.textContent = '已买';
  shoppingTable.querySelector('thead tr').prepend(heading);
  const rows = [...shoppingTable.querySelectorAll('tbody tr')];
  for (const row of rows) {
    const name = row.cells[0]?.textContent.trim();
    const originalName = window.fitnessI18n?.original(row.cells[0]?.firstChild) || name;
    row.dataset.itemKey = originalName;
    const cell = document.createElement('td');
    cell.className = 'check-cell';
    if (name && originalName !== '每周合计') {
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.setAttribute('aria-label', `已购买${name}`);
      const key = `fitness-shopping:${weekKey}:${originalName}`;
      try { box.checked = localStorage.getItem(key) === '1'; } catch (_) { /* storage disabled */ }
      row.classList.toggle('is-checked', box.checked);
      box.addEventListener('change', () => {
        row.classList.toggle('is-checked', box.checked);
        try { localStorage.setItem(key, box.checked ? '1' : '0'); } catch (_) { /* storage disabled */ }
      });
      cell.append(box);
    }
    row.prepend(cell);
  }
  document.querySelector('#shopping-search')?.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLocaleLowerCase();
    for (const row of rows) row.hidden = !!query && !row.textContent.toLocaleLowerCase().includes(query);
  });
  document.querySelector('#shopping-reset')?.addEventListener('click', () => {
    for (const row of rows) {
      const box = row.querySelector('input[type="checkbox"]');
      if (!box) continue;
      box.checked = false;
      row.classList.remove('is-checked');
      try { localStorage.removeItem(`fitness-shopping:${weekKey}:${row.dataset.itemKey}`); } catch (_) { /* storage disabled */ }
    }
  });
}
window.fitnessI18n?.apply();

const mermaidBlocks = [...document.querySelectorAll('pre > code.language-mermaid')];
if (mermaidBlocks.length) {
  for (const code of mermaidBlocks) {
    const diagram = document.createElement('div');
    diagram.className = 'mermaid';
    diagram.textContent = code.textContent;
    code.parentElement.replaceWith(diagram);
  }
  import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
    .then(({ default: mermaid }) => { mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict', themeVariables: { background: '#1c252e', primaryColor: '#253b40', primaryTextColor: '#e6edf2', primaryBorderColor: '#6b9b9b', lineColor: '#91d8d1', secondaryColor: '#25313b', tertiaryColor: '#1c252e' } }); return mermaid.run({ querySelector: '.mermaid' }); })
    .catch(() => {
      document.querySelectorAll('.mermaid').forEach((el) => { const pre = document.createElement('pre'); pre.textContent = el.textContent; el.replaceWith(pre); });
    });
}
