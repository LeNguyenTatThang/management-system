import api from './api';

const API_URL = '/api/inventory-import';

export async function getImports(query = {}) {
  const params = new URLSearchParams();
  if (query.status) params.append('status', query.status);
  if (query.keyword) params.append('keyword', query.keyword);
  const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${api.getToken()}` },
  });
  if (!res.ok) throw new Error('Lỗi khi tải danh sách nhập kho');
  const data = await res.json();
  return data.data;
}

export async function getImportById(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${api.getToken()}` },
  });
  if (!res.ok) throw new Error('Lỗi khi tải thông tin nhập kho');
  const data = await res.json();
  return data.data;
}

export async function createImport(dto) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api.getToken()}`,
    },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lỗi khi tạo phiếu nhập kho');
  }
  const data = await res.json();
  return data.data;
}

export async function updateImport(id, dto) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api.getToken()}`,
    },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lỗi khi cập nhật phiếu nhập kho');
  }
  const data = await res.json();
  return data.data;
}

export async function confirmImport(id) {
  const res = await fetch(`${API_URL}/${id}/confirm`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${api.getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lỗi khi xác nhận phiếu nhập kho');
  }
  const data = await res.json();
  return data.data;
}

export async function receiveImport(id) {
  const res = await fetch(`${API_URL}/${id}/receive`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${api.getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lỗi khi nhận hàng');
  }
  const data = await res.json();
  return data.data;
}

export async function cancelImport(id) {
  const res = await fetch(`${API_URL}/${id}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${api.getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lỗi khi hủy phiếu nhập kho');
  }
  const data = await res.json();
  return data.data;
}

export async function deleteImport(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${api.getToken()}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lỗi khi xóa phiếu nhập kho');
  }
  const data = await res.json();
  return data.data;
}
