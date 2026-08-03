const API_URL = '/api/inventory-export';

function getToken() {
  try {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || parsed.accessToken || '';
    }
  } catch {}
  return '';
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

export async function getExportReceipts(query = {}) {
  const params = new URLSearchParams();
  if (query.status) params.append('status', query.status);
  if (query.keyword) params.append('keyword', query.keyword);
  const qs = params.toString();
  const url = qs ? `${API_URL}?${qs}` : API_URL;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  return handleResponse(res);
}

export async function getExportReceipt(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function createExportReceipt(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateExportReceipt(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function confirmExportReceipt(id) {
  const res = await fetch(`${API_URL}/${id}/confirm`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function exportReceipt(id) {
  const res = await fetch(`${API_URL}/${id}/export`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function cancelExportReceipt(id) {
  const res = await fetch(`${API_URL}/${id}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function deleteExportReceipt(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}
