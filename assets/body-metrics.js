// Shared read-only summary; an undated current snapshot does not create a trend point.
(() => {
  'use strict';
  function resolve(current = {}, published = [], legacy = []) {
    const canonical = Array.isArray(published) ? published : [];
    const ids = new Set(canonical.map(row => row.id).filter(Boolean));
    const rows = [...canonical, ...(Array.isArray(legacy) ? legacy : []).filter(row => !ids.has(row.id))]
      .filter(row => row && typeof row.date === 'string').sort((a, b) => b.date.localeCompare(a.date));
    const valid = (value, key) => value !== '' && value != null && Number.isFinite(Number(value)) && Number(value) > 0 && (key !== 'bf' || Number(value) <= 100);
    return Object.fromEntries(['weight', 'bf'].map(key => {
      const value = rows.find(row => valid(row[key], key))?.[key] ?? current[key];
      return [key, valid(value, key) ? Number(value) : null];
    }));
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { resolve }; return; }
  let published = {}, legacy = {};
  try { published = JSON.parse(document.getElementById('tracking-records')?.textContent || '{}'); } catch (_) {}
  try { legacy = JSON.parse(localStorage.getItem('yunhai-fitness-records-v1') || '{}') || {}; } catch (_) {}
  const current = resolve(published.currentBody, published.body, legacy.body);
  window.fitnessBodyMetrics = current;
  for (const node of document.querySelectorAll('[data-body-value]')) node.textContent = current[node.dataset.bodyValue] ?? '—';
})();
