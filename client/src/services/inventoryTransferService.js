const API_URL = '/api/inventory-transfer';

function getToken() {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed.token || parsed.accessToken || '';
  } catch {
    return '';
  }
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

async function handleResponse(res) {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Đã xảy ra lỗi');
  }
  return json.data;
}

function buildQuery(params) {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.keyword) q.set('keyword', params.keyword);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  return q.toString();
}

export async function getTransfers(params = {}) {
  const query = buildQuery(params);
  const res = await fetch(
    `${API_URL}${query ? `?${query}` : ''}`,
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );
  return handleResponse(res);
}

export async function getTransferById(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function createTransfer(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateTransfer(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function confirmTransfer(id) {
  const res = await fetch(`${API_URL}/${id}/confirm`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function transferTransfer(id) {
  const res = await fetch(`${API_URL}/${id}/transfer`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function cancelTransfer(id) {
  const res = await fetch(`${API_URL}/${id}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function deleteTransfer(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}
