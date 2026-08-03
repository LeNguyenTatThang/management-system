import api from './api';

const STATUS_MAP = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const STATUS_LABEL = {
  active: 'Đang dùng',
  inactive: 'Ngừng dùng',
};

function toView(ingredient) {
  return {
    id: ingredient.id,
    name: ingredient.name,
    description: ingredient.description,
    unitId: ingredient.unitId,
    unit: ingredient.unit,
    category: ingredient.category,
    supplierId: ingredient.supplierId,
    supplier: ingredient.supplier ?? null,
    stock: ingredient.stock,
    minStock: ingredient.minStock,
    averageImportPrice: ingredient.averageImportPrice,
    costPrice: ingredient.costPrice,
    isFreeIngredient: ingredient.isFreeIngredient,
    status: STATUS_MAP[ingredient.status] || ingredient.status,
    rawStatus: ingredient.status,
    statusLabel: STATUS_LABEL[STATUS_MAP[ingredient.status]] || ingredient.status,
    createdAt: ingredient.createdAt,
    updatedAt: ingredient.updatedAt,
  };
}

function toPayload(data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.unitId !== undefined) payload.unitId = Number(data.unitId);
  if (data.category !== undefined) payload.category = data.category;
  if (data.supplierId !== undefined) payload.supplierId = data.supplierId ? Number(data.supplierId) : null;
  if (data.stock !== undefined) payload.stock = Number(data.stock);
  if (data.minStock !== undefined) payload.minStock = data.minStock ? Number(data.minStock) : null;
  if (data.costPrice !== undefined) payload.costPrice = data.costPrice ? Number(data.costPrice) : null;
  if (data.isFreeIngredient !== undefined) payload.isFreeIngredient = data.isFreeIngredient;
  if (data.status !== undefined) {
    payload.status = data.status === 'active' || data.status === 'Đang dùng' ? 'ACTIVE' : 'INACTIVE';
  }
  return payload;
}

export async function getIngredients(query) {
  const data = await api.get('/ingredients', query);
  return (data || []).map(toView);
}

export async function getUnits() {
  return (await api.get('/ingredients/units')) || [];
}

export async function getIngredient(id) {
  const data = await api.get(`/ingredients/${id}`);
  return data ? toView(data) : null;
}

export async function createIngredient(data) {
  const result = await api.post('/ingredients', toPayload(data));
  return result ? toView(result) : null;
}

export async function updateIngredient(id, data) {
  const result = await api.patch(`/ingredients/${id}`, toPayload(data));
  return result ? toView(result) : null;
}

export async function deleteIngredient(id) {
  return api.delete(`/ingredients/${id}`);
}

export { STATUS_LABEL };
