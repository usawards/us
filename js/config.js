// Only file you should need to touch when deploying: point this at your
// live usea-backend Render URL. No trailing slash.
const API_BASE_URL = 'https://usea-backend.onrender.com';

// Price shown before the API confirms it (kept in sync with the backend's
// VOTE_PRICE_USD - purely cosmetic here, the real charge is calculated
// server-side in /api/votes/initiate).
const VOTE_PRICE_USD = 0.90;

// Same idea - cosmetic only, real amount is set server-side in
// /api/applications/initiate.
const APPLICATION_FEE_USD = 500;
