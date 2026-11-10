/* Dựng thanh phân trang: Trước | < 1 2 3 ... N > | Sau */
const Pager = (() => {
  function pages(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, 2, 3, total, current - 1, current, current + 1]);
    const list = [...set].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
    const out = [];
    list.forEach((p, i) => {
      if (i > 0 && p - list[i - 1] > 1) out.push('…');
      out.push(p);
    });
    return out;
  }

  /** @param {HTMLElement} el  @param {(page:number)=>void} onPage */
  function render(el, current, totalPages, onPage) {
    if (totalPages <= 1) { el.innerHTML = ''; return; }
    const btn = (label, page, cls = '', disabled = false) =>
      `<button type="button" class="${cls}" data-page="${page}" ${disabled ? 'disabled' : ''}>${label}</button>`;
    el.innerHTML =
      btn(`${Utils.icon('chevronLeft')}Trước`, current - 1, '', current <= 1) +
      pages(current, totalPages).map(p => p === '…'
        ? '<span class="gap">…</span>'
        : btn(p, p, p === current ? 'active' : '')).join('') +
      btn(`Sau${Utils.icon('chevronRight')}`, current + 1, '', current >= totalPages);
    el.querySelectorAll('button[data-page]').forEach(b => {
      b.style.display = 'inline-flex'; b.style.alignItems = 'center'; b.style.gap = '4px'; b.style.justifyContent = 'center';
      b.addEventListener('click', () => onPage(Number(b.dataset.page)));
    });
  }

  return { render };
})();
