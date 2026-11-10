/* Khung trang dùng chung, giữ nguyên HTML/CSS/JS thuần. */
const Layout = (() => {
  const links = [
    ['dashboard.html', 'home', 'Bảng điều khiển'],
    ['sensor-history.html', 'database', 'Dữ liệu cảm biến'],
    ['action-history.html', 'activity', 'Lịch sử hoạt động'],
    ['profile.html', 'user', 'Thông tin tài khoản'],
  ];
  function sidebarHtml(active) {
    const user = Auth.user() || {};
    return `<div class="side-brand">
      <span class="side-logo">${Utils.icon('activity')}</span>
      <span><strong>SMART ROOM</strong><small>IoT MONITORING</small></span>
    </div>
    <div class="side-label">DANH MỤC</div>
    <div class="side-links">${links.map(([href, icon, title]) =>
      `<a href="${href}" class="${href === active ? 'active' : ''}" ${href === active ? 'aria-current="page"' : ''}>
        ${Utils.icon(icon)}<span>${title}</span></a>`).join('')}</div>
    <div class="side-bottom">
      <div class="side-status"><span class="status-dot"></span>
        <span><strong>ESP8266</strong><small id="node-status">Đang kiểm tra</small></span></div>
      <div class="side-user"><span class="side-avatar">${Utils.esc((user.fullName || user.username || 'U')[0].toUpperCase())}</span>
        <span><strong>${Utils.esc(user.fullName || user.username || 'Người dùng')}</strong><small>Giao diện Smart Room</small></span>
        <button id="side-logout" type="button" aria-label="Đăng xuất" title="Đăng xuất">${Utils.icon('logout')}</button></div>
    </div>`;
  }
  function topbarHtml() {
    return `<header class="topbar">
      <div class="topbar-heading"><span class="topbar-kicker">SMART ROOM / IOT</span>
        <h1 id="topbar-title">Bảng điều khiển</h1></div>
      <div class="topbar-right">
        <span class="topbar-clock">${Utils.icon('clock')}<time id="live-clock"></time></span>
        <span class="chip chip-live"><span class="dot"></span>Dữ liệu ESP8266</span>
        ${Theme.buttonHtml()}
      </div>
    </header>`;
  }
  function mount({ active } = {}) {
    const page = active || location.pathname.split('/').pop();
    const heading = Object.fromEntries(links.map(([href, , label]) => [href, label]));
    document.getElementById('topbar').innerHTML = topbarHtml();
    document.getElementById('topbar-title').textContent = heading[page] || 'Smart Room IoT';
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.innerHTML = sidebarHtml(page);
    document.getElementById('side-logout')?.addEventListener('click', Auth.logout);
    Theme.mount();
    const tick = () => { const el = document.getElementById('live-clock'); if (el) el.textContent = Utils.fmtDateTime(new Date().toISOString()); };
    tick(); setInterval(tick, 1000);
    document.addEventListener('backend:data', () => {
      const status = document.getElementById('node-status');
      if (status) status.textContent = Api.online() ? 'Đang kết nối' : 'Ngoại tuyến';
    });
  }
  function setMqtt() { /* API tương thích với bản cũ. */ }
  return { mount, setMqtt, sidebarHtml };
})();
