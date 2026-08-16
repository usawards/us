const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_API_URL is not set - API calls will fail. See .env.example.');
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some responses (e.g. 204) have no body
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// ---- Public reads ----
export const getCategories = () => request('/api/categories');

export const getNominees = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  ).toString();
  return request(`/api/nominees${qs ? `?${qs}` : ''}`);
};

export const getNominee = (id) => request(`/api/nominees/${id}`);

export const getLeaderboard = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  ).toString();
  return request(`/api/leaderboard${qs ? `?${qs}` : ''}`);
};

export const getSettings = () => request('/api/settings');

// ---- Voting / payment ----
// Returns { reference, amount_usd, authorization_url, access_code }.
// Redirect the browser to authorization_url to land on Paystack's hosted
// checkout, which itself presents Apple Pay / card based on your Paystack
// account + channel settings and the visitor's device.
export const initiateVote = (payload) =>
  request('/api/votes/initiate', { method: 'POST', body: JSON.stringify(payload) });

export const verifyVote = (reference) => request(`/api/votes/verify/${reference}`);

// ---- Admin (token from POST /api/auth/login) ----
export const adminLogin = (email, password) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const authedRequest = (path, token, options = {}) =>
  request(path, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
