// Shared read-only summary; an undated current snapshot does not create a trend point.
(() => {
  'use strict';
  function resolve(current = {}, published = [], legacy = []) {
    const canonical = Array.isArray(published) ? published.filter(row => row && typeof row === 'object') : [];
    const ids = new Set(canonical.map(row => row.id).filter(Boolean));
    const rows = [...canonical, ...(Array.isArray(legacy) ? legacy : []).filter(row => row && !ids.has(row.id))]
      .filter(row => row && typeof row.date === 'string').sort((a, b) => b.date.localeCompare(a.date));
    const valid = (value, key) => value !== '' && value != null && Number.isFinite(Number(value)) && Number(value) > 0 && (key !== 'bf' || Number(value) <= 100);
    return Object.fromEntries(['weight', 'bf'].map(key => {
      const value = valid(current?.[key], key) ? current[key] : rows.find(row => valid(row[key], key))?.[key];
      return [key, valid(value, key) ? Number(value) : null];
    }));
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { resolve }; return; }
  let published = {};
  try { published = JSON.parse(document.getElementById('tracking-records')?.textContent || '{}'); } catch (_) {}
  const current = resolve(published.currentBody, published.body);
  window.fitnessBodyMetrics = current;
  for (const node of document.querySelectorAll('[data-body-value]')) node.textContent = current[node.dataset.bodyValue] ?? '—';
})();
