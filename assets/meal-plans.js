/* Read-only plan routing: the repository catalog chooses the active plan. */
(() => {
  'use strict';
  const normalize = (path) => path === '/' ? '/' : '/' + path.split('/').filter(Boolean).join('/') + '/';
  function resolve(catalog, path) {
    const plans = catalog.plans;
    const defaultPlan = plans.find((plan) => plan.id === catalog.default) || plans[0];
    const route = plans.flatMap((plan) => Object.entries(plan.pages).map(([page, url]) => ({ plan, page, url })))
      .find((entry) => normalize(entry.url) === normalize(path));
    const active = defaultPlan;
    return { active, page: route?.page, redirect: route && normalize(active.pages[route.page]) !== normalize(path) ? active.pages[route.page] : null };
  }
  const scopedKey = (key, id, defaultId) => id === defaultId ? key : `${key}:meal-plan:${id}`;
  if (typeof module !== 'undefined' && module.exports) { module.exports = { resolve, scopedKey }; return; }
  const source = document.getElementById('meal-plan-catalog');
  if (!source) return;
  let catalog;
  try { catalog = JSON.parse(source.textContent); } catch (_) { return; }
  if (!catalog.plans?.length) return;
  const base = document.body.dataset.baseurl || '';
  const path = location.pathname.startsWith(base + '/') ? location.pathname.slice(base.length) : location.pathname;
  const result = resolve(catalog, path);
  const active = result.active;
  const urlFor = (page) => new URL(base + active.pages[page], location.origin);
  window.fitnessMealPlan = { id: active.id, urlFor: (page) => urlFor(page).href, storageKey: (key) => scopedKey(key, active.id, catalog.default) };
  if (result.redirect) location.replace(urlFor(result.page).href);
})();
