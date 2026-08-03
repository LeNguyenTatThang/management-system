import api from './api';

export async function getSetups() {
  return (await api.get('/setups')) || [];
}

export async function getSetup(id) {
  return await api.get(`/setups/${id}`);
}

export async function createSetup(data) {
  return await api.post('/setups', data);
}

export async function updateSetup(id, data) {
  return await api.patch(`/setups/${id}`, data);
}

export async function deleteSetup(id) {
  return api.delete(`/setups/${id}`);
}
