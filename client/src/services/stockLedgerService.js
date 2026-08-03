const API_URL = '/api/stock-ledger';

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

export async function getStockMovements(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.ingredientId) searchParams.append('ingredientId', params.ingredientId);
  if (params.type) searchParams.append('type', params.type);
  if (params.direction) searchParams.append('direction', params.direction);
  if (params.referenceType) searchParams.append('referenceType', params.referenceType);
  if (params.keyword) searchParams.append('keyword', params.keyword);
  if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) searchParams.append('dateTo', params.dateTo);
  if (params.page) searchParams.append('page', params.page);
  if (params.limit) searchParams.append('limit', params.limit);
  const qs = searchParams.toString();
  const url = qs ? `${API_URL}?${qs}` : API_URL;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  return handleResponse(res);
}

export async function getStockMovementById(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function getIngredientStockMovements(ingredientId, params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page);
  if (params.limit) searchParams.append('limit', params.limit);
  const qs = searchParams.toString();
  const url = qs ? `${API_URL}/ingredient/${ingredientId}?${qs}` : `${API_URL}/ingredient/${ingredientId}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  return handleResponse(res);
}

export async function getStockMovementSummary(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.ingredientId) searchParams.append('ingredientId', params.ingredientId);
  if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) searchParams.append('dateTo', params.dateTo);
  const qs = searchParams.toString();
  const url = qs ? `${API_URL}/summary?${qs}` : `${API_URL}/summary`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  return handleResponse(res);
}

export async function checkStockConsistency(ingredientId) {
  const res = await fetch(`${API_URL}/consistency/${ingredientId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}
