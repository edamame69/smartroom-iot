(() => {
  if (Auth.isLoggedIn()) { location.replace('dashboard.html'); return; }

  Utils.hydrateIcons();
  Utils.bindPasswordToggles();
  Theme.mount();

  const form = document.getElementById('login-form');
  const btn = document.getElementById('submit');
  const formError = document.getElementById('form-error');

  if (new URLSearchParams(location.search).get('registered')) {
    const ok = document.getElementById('form-ok');
    ok.textContent = 'Đăng ký thành công. Hãy đăng nhập bằng tài khoản vừa tạo.';
    ok.classList.remove('hidden');
  }

  document.getElementById('forgot').addEventListener('click', e => {
    e.preventDefault();
    Utils.toast('Chức năng quên mật khẩu chưa được hỗ trợ');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    formError.classList.add('hidden');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Frontend kiểm tra 2 trường không được để trống (báo cáo UC01)
    Utils.setFieldError('username', username ? '' : 'Vui lòng nhập tên đăng nhập');
    Utils.setFieldError('password', password ? '' : 'Vui lòng nhập mật khẩu');
    if (!username || !password) return;

    btn.disabled = true;
    try {
      const remember = document.getElementById('remember').checked;
      const res = await Api.login(username, password, remember);
      Auth.save(res.token, res.user, remember);
      location.replace('dashboard.html');
    } catch (err) {
      document.getElementById('password').value = ''; // xóa mật khẩu khi thất bại
      formError.textContent = err.message;
      formError.classList.remove('hidden');
    } finally {
      btn.disabled = false;
    }
  });
})();
