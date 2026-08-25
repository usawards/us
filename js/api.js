// Thin fetch wrapper around usea-backend. Every function here returns a
// Promise that resolves to the parsed JSON body, or throws an Error with
// a human-readable message on failure.

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });

  let data = null;
  try { data = await res.json(); } catch (_) { /* e.g. 204 No Content */ }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

function toQuery(params) {
  const clean = Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null);
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : '';
}

const Api = {
  getCategories: () => apiRequest('/api/categories'),
  getNominees: (params = {}) => apiRequest(`/api/nominees${toQuery(params)}`),
  getNominee: (id) => apiRequest(`/api/nominees/${id}`),
  getLeaderboard: (params = {}) => apiRequest(`/api/leaderboard${toQuery(params)}`),
  getSettings: () => apiRequest('/api/settings'),

  // Returns { reference, amount_usd, authorization_url, access_code }.
  // Redirect the browser to authorization_url to reach Paystack's hosted
  // checkout, which presents Apple Pay / card itself.
  initiateVote: (payload) =>
    apiRequest('/api/votes/initiate', { method: 'POST', body: JSON.stringify(payload) }),

  verifyVote: (reference) => apiRequest(`/api/votes/verify/${reference}`),

  // Nominee application - $500 fee, same Paystack checkout flow as voting.
  initiateApplication: (payload) =>
    apiRequest('/api/applications/initiate', { method: 'POST', body: JSON.stringify(payload) }),

  verifyApplication: (reference) => apiRequest(`/api/applications/verify/${reference}`),
};
