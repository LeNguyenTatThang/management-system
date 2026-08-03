const BASE_URL = '/api';

function getToken() {
  try {
    const raw = localStorage.getItem('management_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session.accessToken || null;
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, query } = {}) {
  let url = `${BASE_URL}${path}`;

  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        qs.set(key, value);
      }
    });
    const str = qs.toString();
    if (str) url += `?${str}`;
  }

  const token = getToken();
  const headers = { ...(body ? { 'Content-Type': 'application/json' } : {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });

  let json = null;
  try { json = await res.json(); } catch { /* ignore non-JSON */ }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('management_session');
      window.location.href = '/login';
    }
    const message = json?.message;
    const err = new Error(Array.isArray(message) ? message.join(', ') : message || `Lỗi ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return json?.data ?? null;
}

export default {
  get: (path, query) => request(path, { query }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
