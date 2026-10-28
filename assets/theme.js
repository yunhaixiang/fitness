(() => {
  'use strict';
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const label = button.querySelector('.theme-toggle-text');
  const meta = document.querySelector('meta[name="theme-color"]');
  const en = window.fitnessI18n?.language === 'en';
  const apply = () => {
    const light = document.documentElement.dataset.theme === 'light';
    const next = light ? (en ? 'Dark' : '暗色') : (en ? 'Light' : '亮色');
    label.textContent = next;
    button.setAttribute('aria-label', en ? `Switch to ${next.toLowerCase()} mode` : `切换为${next}模式`);
    button.setAttribute('title', button.getAttribute('aria-label'));
    button.setAttribute('aria-pressed', String(light));
    if (meta) meta.content = light ? '#f3f1e8' : '#171a16';
    document.dispatchEvent(new CustomEvent('fitness:theme-change', { detail: { theme: light ? 'light' : 'dark' } }));
  };
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('fitness-theme', next); } catch (_) { /* storage unavailable */ }
    apply();
  });
  apply();
})();
