import api from './api';

export async function getRecipes(query) {
  return (await api.get('/recipes', query)) || [];
}

export async function getRecipe(id) {
  return await api.get(`/recipes/${id}`);
}

export async function createRecipe(data) {
  return await api.post('/recipes', data);
}

export async function updateRecipe(id, data) {
  return await api.patch(`/recipes/${id}`, data);
}

export async function deleteRecipe(id) {
  return api.delete(`/recipes/${id}`);
}
