const weekStart = new Date();
weekStart.setHours(0, 0, 0, 0);
weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
const weekKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
document.querySelectorAll('input[type="checkbox"][aria-label]').forEach((box) => {
  const key = `fitness-check:${weekKey}:${box.getAttribute('aria-label')}`;
  try { box.checked = localStorage.getItem(key) === '1'; } catch (_) { /* storage disabled */ }
  box.addEventListener('change', () => {
    try { localStorage.setItem(key, box.checked ? '1' : '0'); } catch (_) { /* storage disabled */ }
  });
});

const mermaidBlocks = [...document.querySelectorAll('pre > code.language-mermaid')];
if (mermaidBlocks.length) {
  for (const code of mermaidBlocks) {
    const diagram = document.createElement('div');
    diagram.className = 'mermaid';
    diagram.textContent = code.textContent;
    code.parentElement.replaceWith(diagram);
  }
  import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
    .then(({ default: mermaid }) => { mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' }); return mermaid.run({ querySelector: '.mermaid' }); })
    .catch(() => {
      document.querySelectorAll('.mermaid').forEach((el) => { const pre = document.createElement('pre'); pre.textContent = el.textContent; el.replaceWith(pre); });
    });
}
