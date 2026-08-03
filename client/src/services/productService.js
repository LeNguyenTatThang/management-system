import api from './api';

const STATUS_MAP = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const STATUS_LABEL = {
  active: 'Đang bán',
  inactive: 'Ngừng bán',
};

function toView(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    costPrice: product.costPrice,
    image: product.image,
    size: product.size,
    categoryId: product.categoryId,
    category: product.category ?? null,
    categoryName: product.category?.name ?? null,
    status: STATUS_MAP[product.status] || product.status,
    rawStatus: product.status,
    statusLabel: STATUS_LABEL[STATUS_MAP[product.status]] || product.status,
    setups: product.setups || [],
    setupNames: (product.setups || []).map(s => s.name),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function toPayload(data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.price !== undefined) payload.price = Number(data.price);
  if (data.costPrice !== undefined) payload.costPrice = data.costPrice ? Number(data.costPrice) : null;
  if (data.image !== undefined) payload.image = data.image;
  if (data.size !== undefined) payload.size = data.size;
  if (data.categoryId !== undefined) payload.categoryId = data.categoryId ? Number(data.categoryId) : null;
  if (data.status !== undefined) {
    payload.status = data.status === 'active' || data.status === 'Đang bán' ? 'ACTIVE' : 'INACTIVE';
  }
  if (data.setupIds !== undefined) payload.setupIds = data.setupIds.map(Number);
  return payload;
}

export async function getProducts(query) {
  const data = await api.get('/products', query);
  return (data || []).map(toView);
}

export async function getProduct(id) {
  const data = await api.get(`/products/${id}`);
  return data ? toView(data) : null;
}

export async function createProduct(data) {
  const result = await api.post('/products', toPayload(data));
  return result ? toView(result) : null;
}

export async function updateProduct(id, data) {
  const result = await api.patch(`/products/${id}`, toPayload(data));
  return result ? toView(result) : null;
}

export async function deleteProduct(id) {
  return api.delete(`/products/${id}`);
}

export { STATUS_LABEL };
