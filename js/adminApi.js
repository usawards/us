// Thin fetch wrapper for admin endpoints. Mirrors api.js's style but
// attaches the admin JWT (stored in localStorage after login) to every
// request, and throws a human-readable Error on failure.

const ADMIN_TOKEN_KEY = 'usea_admin_token';
const ADMIN_INFO_KEY = 'usea_admin_info';

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}
function setAdminSession(token, admin) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(admin));
}
function clearAdminSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_INFO_KEY);
}
function getAdminInfo() {
  try { return JSON.parse(localStorage.getItem(ADMIN_INFO_KEY) || 'null'); } catch (_) { return null; }
}

async function adminRequest(path, options = {}) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    clearAdminSession();
    if (typeof onAdminUnauthorized === 'function') onAdminUnauthorized();
    throw new Error('Session expired. Please log in again.');
  }

  if (res.status === 204) return null;

  let data = null;
  try { data = await res.json(); } catch (_) { /* e.g. CSV export */ }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

const AdminApi = {
  login: (email, password) =>
    adminRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => adminRequest('/api/auth/me'),

  getStats: () => adminRequest('/api/admin/stats'),
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return adminRequest(`/api/admin/transactions${qs ? `?${qs}` : ''}`);
  },
  getAuditLogs: () => adminRequest('/api/admin/audit-logs'),

  getCategories: () => adminRequest('/api/categories'),
  createCategory: (payload) => adminRequest('/api/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id, payload) => adminRequest(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCategory: (id) => adminRequest(`/api/categories/${id}`, { method: 'DELETE' }),

  getNominees: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return adminRequest(`/api/nominees${qs ? `?${qs}` : ''}`);
  },
  createNominee: (payload) => adminRequest('/api/nominees', { method: 'POST', body: JSON.stringify(payload) }),
  updateNominee: (id, payload) => adminRequest(`/api/nominees/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteNominee: (id) => adminRequest(`/api/nominees/${id}`, { method: 'DELETE' }),
  addVotes: (id, quantity, reason) => adminRequest(`/api/nominees/${id}/add-votes`, { method: 'POST', body: JSON.stringify({ quantity, reason }) }),

  getApplications: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)).toString();
    return adminRequest(`/api/applications${qs ? `?${qs}` : ''}`);
  },
  approveApplication: (id, note) => adminRequest(`/api/applications/${id}/approve`, { method: 'POST', body: JSON.stringify({ note }) }),
  rejectApplication: (id, note) => adminRequest(`/api/applications/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) }),

  getSettings: () => adminRequest('/api/settings'),
  updateSetting: (key, value) => adminRequest('/api/settings', { method: 'PUT', body: JSON.stringify({ key, value }) }),
};
