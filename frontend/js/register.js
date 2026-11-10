(() => {
  if (Auth.isLoggedIn()) { location.replace('dashboard.html'); return; }

  Utils.hydrateIcons();
  Utils.bindPasswordToggles();
  Theme.mount();

  const form = document.getElementById('register-form');
  const btn = document.getElementById('submit');
  const formError = document.getElementById('form-error');

  document.querySelectorAll('.soft-link').forEach(a =>
    a.addEventListener('click', e => { e.preventDefault(); Utils.toast('Nội dung đang được cập nhật'); }));

  const val = id => document.getElementById(id).value;

  function validate() {
    const username = val('username').trim();
    const email = val('email').trim();
    const password = val('password');
    const confirm = val('confirm');
    const errors = {};

    if (!username) errors.username = 'Vui lòng nhập tên đăng nhập';
    else if (!/^[A-Za-z0-9_.]{3,30}$/.test(username)) errors.username = 'Tên đăng nhập 3-30 ký tự: chữ, số, dấu chấm, gạch dưới';

    if (!email) errors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';

    if (!password) errors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự';

    if (!confirm) errors.confirm = 'Vui lòng nhập lại mật khẩu';
    else if (confirm !== password) errors.confirm = 'Mật khẩu xác nhận không khớp';

    if (!document.getElementById('terms').checked) errors.terms = 'Bạn cần đồng ý với điều khoản để tiếp tục';

    ['username', 'email', 'password', 'confirm'].forEach(f => Utils.setFieldError(f, errors[f]));
    document.getElementById('terms-error').textContent = errors.terms || '';
    return Object.keys(errors).length === 0;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    formError.classList.add('hidden');
    if (!validate()) return;

    btn.disabled = true;
    try {
      await Api.register(val('username').trim(), val('email').trim(), val('password'));
      location.replace('login.html?registered=1');
    } catch (err) {
      // 409: trùng username / email -> gắn vào đúng trường
      if (err.status === 409 && /email/i.test(err.message)) Utils.setFieldError('email', err.message);
      else if (err.status === 409) Utils.setFieldError('username', err.message);
      else {
        formError.textContent = err.message;
        formError.classList.remove('hidden');
      }
    } finally {
      btn.disabled = false;
    }
  });
})();
