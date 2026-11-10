(() => {
  if (!Auth.requireLogin()) return;
  Layout.mount({ active: 'profile.html' });
  Utils.hydrateIcons();
  const $ = id => document.getElementById(id);
  let user = Auth.user();
  function render(u) {
    if (!u) return;
    user = u; Auth.setUser(u);
    $('avatar').textContent = (u.fullName || u.username || '?').trim().charAt(0).toUpperCase();
    $('cover-name').textContent = u.fullName || u.username;
    $('role-badge').textContent = u.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'NGƯỜI DÙNG';
    $('p-code').value = u.code || 'USR001';
    $('p-name').value = u.fullName || '';
    $('p-email').value = u.email || '';
    $('p-role').value = u.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng';
  }
  function edit(on) {
    ['p-name', 'p-email'].forEach(id => { $(id).readOnly = !on; });
    $('actions-view').classList.toggle('hidden', on);
    $('actions-edit').classList.toggle('hidden', !on);
    if (on) $('p-name').focus();
  }
  $('btn-edit').addEventListener('click', () => edit(true));
  $('btn-cancel').addEventListener('click', () => { render(user); edit(false); });
  $('btn-save').addEventListener('click', async () => {
    const name = $('p-name').value.trim(), email = $('p-email').value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    Utils.setFieldError('p-name', name ? '' : 'Vui lòng nhập họ và tên');
    Utils.setFieldError('p-email', validEmail ? '' : 'Email không hợp lệ');
    if (!name || !validEmail) return;
    try {
      render(await Api.updateProfile(name, email)); edit(false);
      Utils.toast('Đã lưu thông tin hồ sơ', 'success');
    } catch (error) { Utils.toast(error.message, 'error'); }
  });
  const passDialog = $('pass-dialog');
  $('btn-pass').addEventListener('click', () => passDialog.showModal());
  $('d-cancel').addEventListener('click', () => passDialog.close());
  $('pass-form').addEventListener('submit', async e => {
    e.preventDefault();
    const current = $('d-current').value, next = $('d-new').value, confirm = $('d-confirm').value;
    Utils.setFieldError('d-current', current ? '' : 'Vui lòng nhập mật khẩu hiện tại');
    Utils.setFieldError('d-new', next.length >= 6 ? '' : 'Tối thiểu 6 ký tự');
    Utils.setFieldError('d-confirm', next === confirm ? '' : 'Không khớp mật khẩu');
    if (!current || next.length < 6 || next !== confirm) return;
    try {
      await Api.changePassword(current, next);
      passDialog.close(); $('pass-form').reset();
      Utils.toast('Đã đổi mật khẩu', 'success');
    } catch (error) { Utils.toast(error.message, 'error'); }
  });
  const keys = ['github', 'figma', 'postman'];
  const LINKS_KEY = 'sr_project_links';
  const defaults = {
    github: 'https://github.com/edamame69/smartroom-iot',
    figma: 'https://www.figma.com/design/rwKJ8mWRWcIMwxa3AAYK8g/ESP8266-IoT-Dashboard?node-id=87-31',
    postman: 'https://documenter.getpostman.com/view/60095257/2sBYHYvdmt'
  };
  let links = {};
  try { links = JSON.parse(localStorage.getItem(LINKS_KEY)) || {}; } catch (_) { links = {}; }
  keys.forEach(key => { $('link-' + key).value = links[key] || defaults[key]; });
  let selected = 'github';
  keys.forEach(key => $('link-' + key).addEventListener('focus', () => { selected = key; updateOpen(); }));
  function updateOpen() {
    const value = $('link-' + selected).value.trim();
    $('open-link').disabled = !/^https?:\/\//i.test(value);
    $('open-link').textContent = 'Mở ' + selected.charAt(0).toUpperCase() + selected.slice(1) + ' ↗';
  }
  keys.forEach(key => $('link-' + key).addEventListener('input', updateOpen));
  $('save-links').addEventListener('click', () => {
    const next = {};
    for (const key of keys) {
      const value = $('link-' + key).value.trim();
      if (value && !/^https?:\/\//i.test(value)) {
        Utils.toast('Liên kết ' + key + ' phải bắt đầu bằng https:// hoặc http://', 'error'); return;
      }
      next[key] = value;
    }
    links = next; localStorage.setItem(LINKS_KEY, JSON.stringify(next));
    Utils.toast('Đã lưu liên kết dự án', 'success'); updateOpen();
  });
  $('open-link').addEventListener('click', () => {
    const value = $('link-' + selected).value.trim();
    if (/^https?:\/\//i.test(value)) window.open(value, '_blank', 'noopener,noreferrer');
  });
  updateOpen();
  render(user);
  Api.me().then(render).catch(error => Utils.toast(error.message, 'error'));
})();
