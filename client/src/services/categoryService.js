import api from './api';

export async function getCategories() {
  return (await api.get('/categories')) || [];
}

export async function getCategory(id) {
  return await api.get(`/categories/${id}`);
}

export async function createCategory(data) {
  return await api.post('/categories', data);
}

export async function updateCategory(id, data) {
  return await api.patch(`/categories/${id}`, data);
}

export async function deleteCategory(id) {
  return api.delete(`/categories/${id}`);
}
