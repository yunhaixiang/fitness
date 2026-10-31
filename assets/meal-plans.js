/* Shared plan selection. A catalog entry owns a complete set of food pages. */
(() => {
  'use strict';
  const normalize = (path) => path === '/' ? '/' : '/' + path.split('/').filter(Boolean).join('/') + '/';
  function resolve(catalog, path, savedId, requestedId) {
    const plans = catalog.plans;
    const defaultPlan = plans.find((plan) => plan.id === catalog.default) || plans[0];
    const route = plans.flatMap((plan) => Object.entries(plan.pages).map(([page, url]) => ({ plan, page, url })))
      .find((entry) => normalize(entry.url) === normalize(path));
    const requested = plans.find((plan) => plan.id === requestedId);
    const saved = plans.find((plan) => plan.id === savedId);
    const active = requested || (route?.plan.id !== defaultPlan.id ? route?.plan : null) || saved || defaultPlan;
    return { active, page: route?.page, redirect: route && normalize(active.pages[route.page]) !== normalize(path) ? active.pages[route.page] : null };
  }
  const scopedKey = (key, id, defaultId) => id === defaultId ? key : `${key}:meal-plan:${id}`;
  if (typeof module !== 'undefined' && module.exports) { module.exports = { resolve, scopedKey }; return; }
  const source = document.getElementById('meal-plan-catalog');
  if (!source) return;
  let catalog;
  try { catalog = JSON.parse(source.textContent); } catch (_) { return; }
  if (!catalog.plans?.length) return;
  const storageKey = 'fitness-meal-plan';
  const base = document.body.dataset.baseurl || '';
  const path = location.pathname.startsWith(base + '/') ? location.pathname.slice(base.length) : location.pathname;
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch (_) { /* storage unavailable */ }
  const result = resolve(catalog, path, saved, new URL(location.href).searchParams.get('plan'));
  const active = result.active;
  const urlFor = (page, plan = active) => {
    const url = new URL(base + plan.pages[page], location.origin);
    url.searchParams.set('plan', plan.id);
    return url;
  };
  try { localStorage.setItem(storageKey, active.id); } catch (_) { /* the URL also preserves selection */ }
  window.fitnessMealPlan = { id: active.id, urlFor: (page) => urlFor(page).href, storageKey: (key) => scopedKey(key, active.id, catalog.default) };
  if (result.redirect) { location.replace(urlFor(result.page).href); return; }

  // Update navigation and overview shortcuts, while leaving training and records shared.
  const routes = new Map(catalog.plans.flatMap((plan) => Object.entries(plan.pages).map(([page, url]) => [normalize(base + url), page])));
  for (const link of document.querySelectorAll('a[href]')) {
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) continue;
    const page = routes.get(normalize(url.pathname));
    if (!page || url.hash) continue;
    link.href = urlFor(page).href;
    if (link.closest('.main-nav')) {
      if (page === result.page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }
  if (!result.page) return;
  let en = false;
  try { en = localStorage.getItem('yunhai-fitness-language') === 'en'; } catch (_) { /* default Chinese */ }
  const language = en ? 'en' : 'zh';
  const section = document.createElement('section');
  section.className = 'meal-plan-switcher';
  section.setAttribute('aria-label', en ? 'Weekly Meal Plan' : '周饮食计划');
  const label = document.createElement('label');
  label.htmlFor = 'meal-plan-select';
  label.textContent = en ? 'Weekly Meal Plan' : '周饮食计划';
  const select = document.createElement('select');
  select.id = 'meal-plan-select';
  for (const plan of catalog.plans) {
    const option = document.createElement('option');
    option.value = plan.id;
    option.textContent = plan.name[language];
    select.append(option);
  }
  select.value = active.id;
  const summary = document.createElement('p');
  summary.className = 'meal-plan-summary';
  summary.textContent = active.summary?.[language] || '';
  const count = document.createElement('span');
  count.className = 'meal-plan-count';
  count.textContent = en ? `${catalog.plans.length} ${catalog.plans.length === 1 ? 'Plan' : 'Plans'}` : `${catalog.plans.length} 套计划`;
  const control = document.createElement('div');
  control.className = 'meal-plan-control';
  control.append(label, select);
  const detail = document.createElement('div');
  detail.className = 'meal-plan-detail';
  detail.append(summary, count);
  section.append(control, detail);
  select.addEventListener('change', () => {
    const plan = catalog.plans.find((item) => item.id === select.value);
    if (!plan) return;
    try { localStorage.setItem(storageKey, plan.id); } catch (_) { /* the URL preserves selection */ }
    location.assign(urlFor(result.page, plan).href);
  });
  const main = document.getElementById('main');
  const heading = main?.querySelector(':scope > .page-heading');
  if (heading) heading.after(section);
  else main?.prepend(section);
})();
