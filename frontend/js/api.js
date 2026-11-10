class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const Api = (() => {
  localStorage.removeItem('sr_demo_data_v2');
  if (Auth.token() === 'frontend-demo') Auth.clear();
  let data = { sensors: [], actions: [], devices: [], online: false };
  async function request(path, method = 'GET', body) {
    const response = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-SR-CSRF': Auth.token() || '' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 && Auth.isLoggedIn() && path !== '/auth/login') Auth.logout();
      throw new ApiError(response.status, result.message || 'Không thể kết nối máy chủ');
    }
    return result;
  }
  const newest = rows => [...rows].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt) || b.id - a.id);
  function pageOf(rows, params = {}) {
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const total = rows.length;
    const page = Math.min(Math.max(1, Number(params.page) || 1), Math.max(1, Math.ceil(total / limit)));
    return { items: rows.slice((page - 1) * limit, page * limit), page, limit, total };
  }
  function valueMatches(value, query) {
    if (/^[+-]?\d+[.,]$/.test(query)) {
      const whole = Number(query.slice(0, -1));
      return Math.trunc(value) === whole && value !== whole;
    }
    if (/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(query)) return value === Number(query.replace(',', '.'));
    return false;
  }
  const inTime = (iso, range) => range && new Date(iso) >= range.start && new Date(iso) <= range.end;
  return {
    login: (username, password) => request('/auth/login', 'POST', { username, password }),
    register: (username, email, password) => request('/auth/register', 'POST', { username, email, password }),
    logout: () => request('/auth/logout', 'POST'),
    me: () => request('/auth/me'),
    updateProfile: (fullName, email) => request('/profile', 'PUT', { fullName, email }),
    changePassword: (current, next) => request('/profile/password', 'PUT', { current, next }),
    async refresh() {
      data = await request('/state');
      document.dispatchEvent(new CustomEvent('backend:data'));
      return data;
    },
    online: () => data.online,
    counts: () => ({ sensors: data.sensors.length, actions: data.actions.length }),
    sensorsLatest() {
      const rows = newest(data.sensors);
      return Object.fromEntries(['TEMPERATURE', 'HUMIDITY', 'LIGHT'].map(type => [
        type === 'TEMPERATURE' ? 'temperature' : type === 'HUMIDITY' ? 'humidity' : 'light',
        rows.find(row => row.type === type) || null,
      ]));
    },
    sensorsHistory(params = {}) {
      const type = params.searchType || 'ALL';
      const query = String(params.keyword || '').trim().toLowerCase();
      const time = Utils.parseSmartDatetime(query);
      const numeric = /^[+-]?[\d.,]+$/.test(query);
      const rows = newest(data.sensors).filter(row => {
        if (type !== 'ALL' && type !== 'TIME' && row.type !== type) return false;
        if (!query) return true;
        if (type === 'TIME') return inTime(row.recordedAt, time) || Utils.fmtDateTime(row.recordedAt).includes(query);
        if (type === 'ALL') return valueMatches(row.value, query) || inTime(row.recordedAt, time) ||
          (!numeric && (row.name.toLowerCase().includes(query) || Utils.fmtDateTime(row.recordedAt).includes(query)));
        return valueMatches(row.value, query);
      });
      const chart = ['TEMPERATURE', 'HUMIDITY', 'LIGHT'].flatMap(sensorType => rows.filter(row => row.type === sensorType).slice(0, 30).reverse());
      return { ...pageOf(rows, params), chart };
    },
    actuators: () => data.devices,
    async setDevice(type, nextState) {
      const result = await request('/devices/' + encodeURIComponent(type), 'POST', { state: nextState });
      for (let i = 0; i < 24; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.refresh();
        const action = data.actions.find(row => row.id === result.actionId);
        if (action?.status === 'SUCCESS') return data.devices.find(row => row.type === type);
        if (action?.status === 'FAILED') throw new ApiError(504, action.result || 'Thiết bị không phản hồi');
      }
      throw new ApiError(504, 'Thiết bị không phản hồi');
    },
    actions(params = {}) {
      const range = Utils.parseSmartDatetime(String(params.time || '').trim());
      const rows = data.actions.filter(row =>
        (!params.actuator || row.actuatorType === params.actuator) &&
        (!params.action || row.action === params.action) &&
        (!params.status || row.status === params.status) &&
        (!params.time || inTime(row.createdAt, range) || Utils.fmtDateTime(row.createdAt).includes(params.time))
      ).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
      return { ...pageOf(rows, params), summary: {
        total: rows.length,
        success: rows.filter(row => row.status === 'SUCCESS').length,
        pending: rows.filter(row => row.status === 'PENDING').length,
        failed: rows.filter(row => row.status === 'FAILED').length,
      } };
    },
  };
})();
