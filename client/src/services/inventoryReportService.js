const API_URL = '/api/inventory-reports';

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
  const token = getToken();
  return { Authorization: `Bearer ${token}` };
}

async function handleResponse(res) {
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || 'Lỗi không xác định');
  }
  const json = await res.json();
  return json.data;
}

function buildQuery(params) {
  const q = new URLSearchParams();
  if (params.dateFrom) q.set('dateFrom', params.dateFrom);
  if (params.dateTo) q.set('dateTo', params.dateTo);
  if (params.ingredientId) q.set('ingredientId', String(params.ingredientId));
  if (params.type) q.set('type', params.type);
  if (params.direction) q.set('direction', params.direction);
  if (params.referenceType) q.set('referenceType', params.referenceType);
  if (params.keyword) q.set('keyword', params.keyword);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.limit !== undefined) q.set('limit', String(params.limit));
  return q.toString();
}

export async function getSummary(params = {}) {
  const query = buildQuery(params);
  const res = await fetch(`${API_URL}/summary?${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function getMovements(params = {}) {
  const query = buildQuery(params);
  const res = await fetch(`${API_URL}/movements?${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function getImportExportReport(params = {}) {
  const query = buildQuery(params);
  const res = await fetch(`${API_URL}/import-export?${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function getTopIngredients(params = {}) {
  const query = buildQuery(params);
  const res = await fetch(`${API_URL}/top-ingredients?${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function getLowStockReport(params = {}) {
  const query = buildQuery(params);
  const res = await fetch(`${API_URL}/low-stock?${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function getStocktakeReport(params = {}) {
  const query = buildQuery(params);
  const res = await fetch(`${API_URL}/stocktake?${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function getIngredientReport(ingredientId, params = {}) {
  const query = buildQuery(params);
  const res = await fetch(
    `${API_URL}/ingredient/${ingredientId}?${query}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    },
  );
  return handleResponse(res);
}
