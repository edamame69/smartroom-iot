/* Tiện ích dùng chung: icon, format, toast, nhãn hiển thị */
const Utils = (() => {
  const paths = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 6.1A9.8 9.8 0 0112 6c6.4 0 10 6 10 6a17 17 0 01-3.2 3.9M6.5 7.6A17 17 0 002 12s3.6 7 10 7a9.700 9.700 0 004-.9"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    refresh: '<path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.700 3.600 3 8 3s8-1.300 8-3V5"/><path d="M4 11v6c0 1.700 3.600 3 8 3s8-1.300 8-3v-6"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.500 6.500l4 4"/>',
    logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    userPlus: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6.500 7-6.500s7 2.500 7 6.500"/><path d="M19 8v6M16 11h6"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    chevronLeft: '<path d="M15 18l-6-6 6-6"/>',
    chevronRight: '<path d="M9 6l6 6-6 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20.8 14.3A8.5 8.5 0 019.7 3.2 8.5 8.5 0 1020.8 14.3z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 10-13h-7z"/>',
    thermometer: '<path d="M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0z"/><path d="M12 10v8"/>',
    droplet: '<path d="M12 2C8 8 5 11 5 15a7 7 0 0014 0c0-4-3-7-7-13z"/>',
    bulb: '<path d="M9 18h6M9 21h6M8 15c-1.5-1.2-2-3-2-5a6 6 0 0112 0c0 2-.5 3.8-2 5l-1 2H9z"/>',
    fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10C8 2 15 1 16 5c.3 2-1 4-2 5M14 12c8-3 11 3 7 5-2 1-5 0-7-2M12 14c-4 8-10 5-9 1 .5-2 3-3 7-3"/>',
    file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h4M9 12h6M9 16h6"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 18v3h16v-3"/>',
    sparkles: '<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8zM19 17l.7 1.3L21 19l-1.3.7L19 21l-.7-1.3L17 19l1.3-.7z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2h2"/>',
  };

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
  }

  /** Thay mọi <i data-icon="x"></i> trong root bằng svg. */
  function hydrateIcons(root = document) {
    root.querySelectorAll('i[data-icon]').forEach(el => {
      el.outerHTML = icon(el.dataset.icon);
    });
  }

  const pad = n => String(n).padStart(2, '0');

  function parseDate(iso) {
    return iso ? new Date(iso) : null;
  }
  function fmtTime(iso) {
    const d = parseDate(iso);
    return d ? `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` : '--';
  }
  function fmtDate(iso) {
    const d = parseDate(iso);
    return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '--';
  }
  function fmtDateTime(iso) {
    return iso ? `${fmtDate(iso)} ${fmtTime(iso)}` : '--';
  }
  function timeWithCopy(iso) {
    const formatted = fmtDateTime(iso);
    return `<span class="date-time-wrap"><span>${esc(formatted)}</span><button type="button" class="copy-time" data-copy-time="${esc(formatted)}" aria-label="Sao chép thời gian ${esc(formatted)}" title="Sao chép thời gian">${icon('copy')}</button></span>`;
  }
  function bindTimeCopy(root) {
    root.addEventListener('click', async event => {
      const button = event.target.closest('button[data-copy-time]');
      if (!button || !root.contains(button)) return;
      try {
        await navigator.clipboard.writeText(button.dataset.copyTime);
        toast('Đã sao chép thời gian', 'success');
      } catch (_) {
        toast('Không thể sao chép thời gian', 'error');
      }
    });
  }
  /* Nhận diện năm → giây, kiểm tra ngày hợp lệ trước khi lọc. */
  function parseSmartDatetime(input) {
    const text = String(input || '').trim().replaceAll('/', '-');
    const match = text.match(/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?)?)?$/);
    if (!match) return null;
    const parts = match.slice(1).map((v, i) => v === undefined ? (i === 1 || i === 2 ? 1 : 0) : Number(v));
    const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = parts;
    const start = new Date(year, month - 1, day, hour, minute, second);
    if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day
      || start.getHours() !== hour || start.getMinutes() !== minute || start.getSeconds() !== second) return null;
    const precision = match[6] ? 'giây' : match[5] ? 'phút' : match[4] ? 'giờ'
      : match[3] ? 'ngày' : match[2] ? 'tháng' : 'năm';
    const end = new Date(start);
    if (precision === 'năm') { end.setFullYear(year + 1); }
    else if (precision === 'tháng') { end.setMonth(month); }
    else if (precision === 'ngày') { end.setDate(day + 1); }
    else if (precision === 'giờ') { end.setHours(hour + 1); }
    else if (precision === 'phút') { end.setMinutes(minute + 1); }
    else { end.setSeconds(second + 1); }
    end.setMilliseconds(end.getMilliseconds() - 1);
    return { start, end, precision, label: `Đang tìm theo ${precision}: ${text}` };
  }
  /** Số đo: tối đa 1 chữ số thập phân. */
  function fmtNumber(v) {
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10);
  }

  const TYPE_LABEL = { TEMPERATURE: 'Nhiệt độ', HUMIDITY: 'Độ ẩm', LIGHT: 'Ánh sáng' };
  const COLORS = { TEMPERATURE: '#2563eb', HUMIDITY: '#16a34a', LIGHT: '#f59e0b' };
  const ACTION_LABEL = { ON: 'BẬT', OFF: 'TẮT' };
  const STATUS_LABEL = { SUCCESS: 'THÀNH CÔNG', PENDING: 'ĐANG CHỜ', FAILED: 'THẤT BẠI' };
  const STATUS_CLASS = { SUCCESS: 'st-success', PENDING: 'st-pending', FAILED: 'st-failed' };

  function toast(message, type = '') {
    let root = document.getElementById('toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toast-root';
      document.body.appendChild(root);
    }
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /** Gắn nút ẩn/hiện mật khẩu: <button class="toggle-eye" data-target="inputId"> */
  function bindPasswordToggles(root = document) {
    root.querySelectorAll('.toggle-eye').forEach(btn => {
      btn.innerHTML = icon('eye');
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = icon(show ? 'eyeOff' : 'eye');
      });
    });
  }

  function setFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(inputId + '-error');
    if (input) input.classList.toggle('invalid', !!message);
    if (err) err.textContent = message || '';
  }

  return { icon, hydrateIcons, fmtTime, fmtDate, fmtDateTime, timeWithCopy, bindTimeCopy, parseSmartDatetime, fmtNumber, toast, esc, bindPasswordToggles,
    setFieldError, TYPE_LABEL, COLORS, ACTION_LABEL, STATUS_LABEL, STATUS_CLASS };
})();
