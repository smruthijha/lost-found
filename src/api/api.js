const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("clf_token");

const headers = (isForm = false) => ({
  ...(!isForm && { "Content-Type": "application/json" }),
  ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
});

const handleRes = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
};

// ── Auth ────────────────────────────────────────────────────────────────────
export const apiRegister = (body) =>
  fetch(`${BASE}/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handleRes);

export const apiLogin = (body) =>
  fetch(`${BASE}/auth/login`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handleRes);

export const apiGetMe = () =>
  fetch(`${BASE}/auth/me`, { headers: headers() }).then(handleRes);

// ── Items ───────────────────────────────────────────────────────────────────
export const apiGetItems = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE}/items?${qs}`, { headers: headers() }).then(handleRes);
};

export const apiGetItem = (id) =>
  fetch(`${BASE}/items/${id}`, { headers: headers() }).then(handleRes);

export const apiGetItemFull = (id) =>
  fetch(`${BASE}/items/${id}/full`, { headers: headers() }).then(handleRes);

export const apiCreateItem = (formData) =>
  fetch(`${BASE}/items`, { method: "POST", headers: headers(true), body: formData }).then(handleRes);

export const apiDeleteItem = (id) =>
  fetch(`${BASE}/items/${id}`, { method: "DELETE", headers: headers() }).then(handleRes);

export const apiGetStats = () =>
  fetch(`${BASE}/items/stats`, { headers: headers() }).then(handleRes);

// ── Claims ──────────────────────────────────────────────────────────────────
export const apiSubmitClaim = (itemId, body) =>
  fetch(`${BASE}/claims/${itemId}`, { method: "POST", headers: headers(), body: JSON.stringify(body) }).then(handleRes);

export const apiReviewClaim = (itemId, claimId, action) =>
  fetch(`${BASE}/claims/${itemId}/${claimId}`, { method: "PATCH", headers: headers(), body: JSON.stringify({ action }) }).then(handleRes);

export const apiGetPendingClaims = () =>
  fetch(`${BASE}/claims/pending`, { headers: headers() }).then(handleRes);