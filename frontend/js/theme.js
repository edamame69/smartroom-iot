/* Chế độ sáng/tối dùng chung. Chỉ lưu tùy chọn giao diện trong trình duyệt. */
const Theme = (() => {
  const key = 'sr_theme';
  let saved = 'light';
  try { saved = localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; } catch (e) { /* private mode */ }
  document.documentElement.dataset.theme = saved;

  const current = () => document.documentElement.dataset.theme;
  const buttonHtml = () => '<button class="btn theme-toggle" type="button" data-theme-toggle></button>';

  function updateButtons() {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const dark = current() === 'dark';
      const label = dark ? 'Chế độ sáng' : 'Chế độ tối';
      button.innerHTML = `${Utils.icon(dark ? 'sun' : 'moon')}<span>${label}</span>`;
      button.setAttribute('aria-label', `Chuyển sang ${label.toLowerCase()}`);
      button.setAttribute('aria-pressed', String(dark));
    });
  }

  function set(mode) {
    document.documentElement.dataset.theme = mode;
    try { localStorage.setItem(key, mode); } catch (e) { /* private mode */ }
    updateButtons();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: mode } }));
  }

  function mount() {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      if (button.dataset.themeBound) return;
      button.dataset.themeBound = 'true';
      button.addEventListener('click', () => set(current() === 'dark' ? 'light' : 'dark'));
    });
    updateButtons();
  }

  function styleChart(chart) {
    const css = getComputedStyle(document.documentElement);
    const muted = css.getPropertyValue('--muted').trim();
    const grid = css.getPropertyValue('--chart-grid').trim();
    Object.values(chart.options.scales).forEach(scale => {
      scale.ticks = { ...scale.ticks, color: muted };
      scale.grid = { ...scale.grid, color: grid };
      scale.border = { ...scale.border, color: grid };
    });
    chart.update();
  }

  document.addEventListener('DOMContentLoaded', mount);
  return { buttonHtml, mount, styleChart, current };
})();
