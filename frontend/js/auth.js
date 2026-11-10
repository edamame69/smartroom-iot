/* Lưu token/phiên đăng nhập. "Ghi nhớ đăng nhập" -> localStorage, ngược lại sessionStorage. */
const Auth = (() => {
  const TOKEN = 'sr_token';
  const USER = 'sr_user';

  function store() {
    return localStorage.getItem(TOKEN) ? localStorage : sessionStorage;
  }

  function save(token, user, remember) {
    clear();
    const s = remember ? localStorage : sessionStorage;
    s.setItem(TOKEN, token);
    s.setItem(USER, JSON.stringify(user));
  }

  function clear() {
    [localStorage, sessionStorage].forEach(s => { s.removeItem(TOKEN); s.removeItem(USER); });
  }

  function token() {
    return localStorage.getItem(TOKEN) || sessionStorage.getItem(TOKEN);
  }

  function user() {
    try { return JSON.parse(store().getItem(USER)); } catch (e) { return null; }
  }

  function setUser(u) {
    store().setItem(USER, JSON.stringify(u));
  }

  function isLoggedIn() {
    return !!token();
  }

  /** Gọi đầu mỗi trang cần đăng nhập. */
  function requireLogin() {
    if (!isLoggedIn()) {
      location.replace('login.html');
      return false;
    }
    return true;
  }

  function logout() {
    if (token() && typeof Api !== 'undefined') Api.logout().catch(() => {});
    clear();
    location.replace('login.html');
  }

  return { save, clear, token, user, setUser, isLoggedIn, requireLogin, logout };
})();
