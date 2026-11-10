(() => {
  if (!Auth.requireLogin()) return;
  Layout.mount({ active: 'sensor-history.html' });
  Utils.hydrateIcons();
  const $ = id => document.getElementById(id);
  const state = { searchType: 'ALL', keyword: '', page: 1, limit: 10 };
  const icon = { TEMPERATURE: 'thermometer', HUMIDITY: 'droplet', LIGHT: 'sun' };
  function hint() {
    const type = $('search-type').value;
    const parsed = Utils.parseSmartDatetime($('keyword').value);
    $('precision-hint').textContent = parsed && (type === 'TIME' || type === 'ALL') ? parsed.label : '';
  }
  function load() {
    const res = Api.sensorsHistory(state);
    $('tbody').innerHTML = res.items.length ? res.items.map(row => `<tr>
      <td class="row-id">#${String(row.id).padStart(3, '0')}</td>
      <td><span class="sensor-name"><span class="sensor-icon sensor-${row.type.toLowerCase()}">${Utils.icon(icon[row.type])}</span>
        ${Utils.esc(row.name)}</span></td>
      <td><span class="value-tag tag-${row.type.toLowerCase()}">${Utils.fmtNumber(row.value)} ${Utils.esc(row.unit)}</span></td>
      <td class="date-cell">${Utils.timeWithCopy(row.recordedAt)}</td></tr>`).join('')
      : '<tr><td class="empty" colspan="4">Không tìm thấy dữ liệu cảm biến phù hợp.</td></tr>';
    const from = res.total ? (res.page - 1) * res.limit + 1 : 0;
    $('count-text').textContent = `${res.total} bản ghi phù hợp`;
    $('total-chip').textContent = `${Api.counts().sensors} bản ghi`;
    $('range-text').textContent = `Hiển thị ${from}–${Math.min(res.page * res.limit, res.total)} / ${res.total}`;
    Pager.render($('pager'), res.page, Math.ceil(res.total / res.limit), page => { state.page = page; load(); });
  }
  Utils.bindTimeCopy($('tbody'));
  $('keyword').addEventListener('input', hint);
  $('search-type').addEventListener('change', hint);
  $('search-form').addEventListener('submit', event => {
    event.preventDefault();
    const keyword = $('keyword').value.trim();
    if ($('keyword').value && !keyword) {
      Utils.setFieldError('keyword', 'Vui lòng nhập từ khóa hợp lệ');
      return;
    }
    if ($('search-type').value === 'TIME' && keyword && !Utils.parseSmartDatetime(keyword)) {
      Utils.setFieldError('keyword', 'Nhập thời gian từ năm đến giây, ví dụ 2026-10-15 10:30');
      return;
    }
    Utils.setFieldError('keyword', '');
    Object.assign(state, { keyword, searchType: $('search-type').value, page: 1 });
    load();
  });
  $('btn-reset').addEventListener('click', () => {
    $('keyword').value = ''; $('search-type').value = 'ALL'; $('precision-hint').textContent = '';
    Utils.setFieldError('keyword', '');
    Object.assign(state, { searchType: 'ALL', keyword: '', page: 1 });
    load();
  });
  $('page-size').addEventListener('change', () => {
    const input = $('page-size'), limit = Number(input.value);
    if (!input.validity.valid || !Number.isInteger(limit) || limit < 1 || limit > 100) { input.reportValidity(); return; }
    state.limit = limit; state.page = 1; load();
  });
  $('page-size').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } });
  document.addEventListener('backend:data', load);
  Api.refresh().catch(error => Utils.toast(error.message, 'error'));
  setInterval(() => Api.refresh().catch(() => {}), 5000);
})();
