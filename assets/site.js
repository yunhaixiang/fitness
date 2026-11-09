// Read-only shopping search; no completion or plan data is written by visitors.
const shoppingTable = document.querySelector('.shopping-table');
if (shoppingTable) {
  const rows = [...shoppingTable.querySelectorAll('tbody tr')];
  for (const row of rows) {
    const name = row.cells[0]?.textContent.trim();
    row.dataset.itemKey = window.fitnessI18n?.original(row.cells[0]?.firstChild) || name;
    row.dataset.restock = String(/按需|as needed/i.test(row.cells[2]?.textContent || ''));
  }
  document.querySelector('#shopping-search')?.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLocaleLowerCase();
    for (const row of rows) row.hidden = !!query && !row.textContent.toLocaleLowerCase().includes(query);
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
