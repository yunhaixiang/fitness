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
  // Derived estimates use a single measurement pair; never mix dates or substitute
  // current measurements into historical rows. Standard, not height-adjusted FFMI.
  // https://pubmed.ncbi.nlm.nih.gov/2239792/
  function composition(row = {}, heightCm) {
    const number = value => value !== '' && value != null && Number.isFinite(Number(value)) ? Number(value) : null;
    const weight = number(row.weight), bf = number(row.bf), height = number(heightCm);
    if (weight == null || weight <= 0 || bf == null || bf <= 0 || bf >= 100)
      return {fatMass: null, fatFreeMass: null, ffmi: null};
    const fatMass = weight * bf / 100, fatFreeMass = weight - fatMass;
    return {fatMass, fatFreeMass, ffmi: height != null && height >= 50 && height <= 250 ? fatFreeMass / (height / 100) ** 2 : null};
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { resolve, composition }; return; }
  let published = {};
  try { published = JSON.parse(document.getElementById('tracking-records')?.textContent || '{}'); } catch (_) {}
  const current = resolve(published.currentBody, published.body);
  window.fitnessBodyMetrics = current;
  window.fitnessBodyComposition = composition;
  for (const node of document.querySelectorAll('[data-body-value]')) node.textContent = current[node.dataset.bodyValue] ?? '—';
})();
