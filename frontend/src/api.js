const API_BASE = 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) {
    const msg = body?.detail || body?.message || 'Error desconocido';
    throw new Error(Array.isArray(msg) ? msg.map(e => e.msg).join(', ') : msg);
  }
  return body;
}

export async function fetchProducts({ page, pageSize, search, sortField, sortDir }) {
  const params = new URLSearchParams({ page, size: pageSize });
  if (search)    params.set('filter', `name:like:${search}`);
  if (sortField) params.set('sort',   `${sortField}:${sortDir || 'asc'}`);
  return apiFetch(`/product?${params}`);
}

export async function fetchProduct(id) {
  return apiFetch(`/product/${id}`);
}

export async function createProduct(payload) {
  return apiFetch('/product', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateProduct(id, payload) {
  return apiFetch(`/product/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteProduct(id) {
  return apiFetch(`/product/${id}`, { method: 'DELETE' });
}
