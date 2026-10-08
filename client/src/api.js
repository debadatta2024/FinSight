// All calls to the backend live here, so components never touch fetch directly.
const BASE = '/api';
const TOKEN_KEY = 'finsight_token';

// The login token is kept in localStorage so you stay logged in after a refresh.
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

// App.jsx registers a function here that logs the user out when the server says 401.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });

  // 401 on a normal request means the token expired or is invalid: log out.
  // (Login/register also return 401 for bad credentials, so skip those.)
  if (res.status === 401 && !path.startsWith('/auth/')) onUnauthorized();

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Request failed');
  }
  // DELETE returns 204 (no content), so there is no JSON to parse.
  return res.status === 204 ? null : res.json();
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  // params example: { month: '2026-10', page: 1, limit: 10, search: 'food' }
  getTransactions: (params) => request(`/transactions?${new URLSearchParams(params)}`),
  getSummary: (month) => request(`/transactions/summary?month=${month}`),
  getAllTimeSummary: () => request('/transactions/summary'), // no month = every transaction ever
  getTrend: (months = 6) => request(`/transactions/trend?months=${months}`),
  addTransaction: (data) =>
    request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id, data) =>
    request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),

  getGoal: () => request('/goal'),
  saveGoal: (name, target) =>
    request('/goal', { method: 'PUT', body: JSON.stringify({ name, target }) }),
  deleteGoal: () => request('/goal', { method: 'DELETE' }),

  getBudgets: () => request('/budgets'),
  saveBudget: (category, limit) =>
    request(`/budgets/${encodeURIComponent(category)}`, {
      method: 'PUT',
      body: JSON.stringify({ limit }),
    }),
  deleteBudget: (category) =>
    request(`/budgets/${encodeURIComponent(category)}`, { method: 'DELETE' }),

  // A plain <a href> can't send the Authorization header, so we fetch the file
  // ourselves, turn it into a blob, and trigger the browser download.
  async downloadCsv(month) {
    const res = await fetch(`${BASE}/transactions/export?month=${month}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Could not export transactions');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finsight-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
