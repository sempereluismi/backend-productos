/* ─────────────────────────────────────────────────────────────────
   app.js  –  Gestión de Productos
   Conecta el frontend HTML/CSS con la API FastAPI en /product
   ───────────────────────────────────────────────────────────────── */

const API_BASE = 'http://localhost:8000';

/* ── Estado global ─────────────────────────────────────────────── */
let state = {
  page:      1,
  pageSize:  10,
  total:     0,
  search:    '',
  sortField: '',
  sortDir:   '',   // 'asc' | 'desc'
};

/* ── Elementos del DOM ─────────────────────────────────────────── */
const productsBody   = document.getElementById('productsBody');
const pagination     = document.getElementById('pagination');
const searchInput    = document.getElementById('searchInput');
const newProductBtn  = document.getElementById('newProductBtn');
const modalOverlay   = document.getElementById('modalOverlay');
const modalTitle     = document.getElementById('modalTitle');
const modalClose     = document.getElementById('modalClose');
const cancelBtn      = document.getElementById('cancelBtn');
const productForm    = document.getElementById('productForm');
const productIdField = document.getElementById('productId');
const fieldName      = document.getElementById('fieldName');
const fieldDesc      = document.getElementById('fieldDescription');
const fieldPrice     = document.getElementById('fieldPrice');
const fieldStock     = document.getElementById('fieldStock');
const toast          = document.getElementById('toast');

/* ── Utilidades ────────────────────────────────────────────────── */
function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className   = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function openModal(title) {
  modalTitle.textContent = title;
  modalOverlay.classList.add('open');
  fieldName.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  productForm.reset();
  productIdField.value = '';
  clearErrors();
}

function clearErrors() {
  ['Name','Price','Stock'].forEach(f => {
    document.getElementById(`field${f}`).classList.remove('error');
    document.getElementById(`error${f}`).textContent = '';
  });
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
}

function stockBadge(n) {
  if (n === 0)  return `<span class="badge-stock badge-out">Sin stock</span>`;
  if (n <= 5)   return `<span class="badge-stock badge-low">${n}</span>`;
  return `<span class="badge-stock badge-ok">${n}</span>`;
}

/* ── API ────────────────────────────────────────────────────────── */
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

/* ── Cargar productos ──────────────────────────────────────────── */
async function loadProducts() {
  productsBody.innerHTML = '<tr><td colspan="5" class="loading">Cargando…</td></tr>';

  const params = new URLSearchParams({
    page: state.page,
    size: state.pageSize,
  });

  if (state.search)    params.set('filter',  `name:like:${state.search}`);
  if (state.sortField) params.set('sort',    `${state.sortField}:${state.sortDir || 'asc'}`);

  try {
    const data = await apiFetch(`/product?${params}`);
    const products = data.data?.items ?? [];
    state.total = data.data?.pagination?.total ?? 0;

    if (products.length === 0) {
      productsBody.innerHTML = '<tr><td colspan="5" class="empty-state">No se encontraron productos.</td></tr>';
    } else {
      productsBody.innerHTML = products.map(renderRow).join('');
      attachRowActions();
    }

    renderPagination();
  } catch (err) {
    productsBody.innerHTML = `<tr><td colspan="5" class="empty-state">Error: ${err.message}</td></tr>`;
  }
}

function renderRow(p) {
  return `
    <tr data-id="${p.id}">
      <td>${escHtml(p.name)}</td>
      <td>${escHtml(p.description || '—')}</td>
      <td>${formatPrice(p.price)}</td>
      <td>${stockBadge(p.stock)}</td>
      <td class="actions-cell">
        <button class="btn btn-edit"    data-action="edit"   data-id="${p.id}">Editar</button>
        <button class="btn btn-danger"  data-action="delete" data-id="${p.id}">Eliminar</button>
      </td>
    </tr>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function attachRowActions() {
  productsBody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { action, id } = btn.dataset;
      if (action === 'edit')   openEdit(id);
      if (action === 'delete') confirmDelete(id, btn.closest('tr').querySelector('td').textContent);
    });
  });
}

/* ── Paginación ────────────────────────────────────────────────── */
function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
  pagination.innerHTML = '';

  const prev = makePagBtn('‹', () => { state.page--; loadProducts(); });
  prev.disabled = state.page === 1;
  pagination.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = makePagBtn(i, () => { state.page = i; loadProducts(); });
    if (i === state.page) btn.classList.add('active');
    pagination.appendChild(btn);
  }

  const next = makePagBtn('›', () => { state.page++; loadProducts(); });
  next.disabled = state.page === totalPages;
  pagination.appendChild(next);
}

function makePagBtn(label, onClick) {
  const btn = document.createElement('button');
  btn.className   = 'page-btn';
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

/* ── Ordenamiento ──────────────────────────────────────────────── */
document.querySelectorAll('th.sortable').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sort;
    if (state.sortField === field) {
      state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortField = field;
      state.sortDir   = 'asc';
    }
    state.page = 1;

    document.querySelectorAll('th').forEach(h => h.classList.remove('sort-asc','sort-desc'));
    th.classList.add(`sort-${state.sortDir}`);
    loadProducts();
  });
});

/* ── Búsqueda ──────────────────────────────────────────────────── */
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = searchInput.value.trim();
    state.page   = 1;
    loadProducts();
  }, 350);
});

/* ── Crear producto ────────────────────────────────────────────── */
newProductBtn.addEventListener('click', () => {
  openModal('Nuevo producto');
});

/* ── Editar producto ───────────────────────────────────────────── */
async function openEdit(id) {
  try {
    const data = await apiFetch(`/product/${id}`);
    const p    = data.data;
    productIdField.value  = p.id;
    fieldName.value        = p.name;
    fieldDesc.value        = p.description ?? '';
    fieldPrice.value       = p.price;
    fieldStock.value       = p.stock;
    openModal('Editar producto');
  } catch (err) {
    showToast(`No se pudo cargar el producto: ${err.message}`, 'error');
  }
}

/* ── Eliminar producto ─────────────────────────────────────────── */
function confirmDelete(id, name) {
  if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
  deleteProduct(id);
}

async function deleteProduct(id) {
  try {
    await apiFetch(`/product/${id}`, { method: 'DELETE' });
    showToast('Producto eliminado');
    loadProducts();
  } catch (err) {
    showToast(`Error al eliminar: ${err.message}`, 'error');
  }
}

/* ── Guardar formulario (crear / actualizar) ───────────────────── */
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  if (!validate()) return;

  const payload = {
    name:        fieldName.value.trim(),
    description: fieldDesc.value.trim() || null,
    price:       parseFloat(fieldPrice.value),
    stock:       parseInt(fieldStock.value, 10),
  };

  const id = productIdField.value;

  try {
    if (id) {
      await apiFetch(`/product/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Producto actualizado');
    } else {
      await apiFetch('/product', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Producto creado');
    }
    closeModal();
    loadProducts();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
});

function validate() {
  let ok = true;
  if (!fieldName.value.trim()) {
    setError('Name', 'El nombre es obligatorio');
    ok = false;
  }
  if (!fieldPrice.value || isNaN(parseFloat(fieldPrice.value)) || parseFloat(fieldPrice.value) < 0) {
    setError('Price', 'Introduce un precio válido (≥ 0)');
    ok = false;
  }
  if (!fieldStock.value || isNaN(parseInt(fieldStock.value, 10)) || parseInt(fieldStock.value, 10) < 0) {
    setError('Stock', 'Introduce un stock válido (≥ 0)');
    ok = false;
  }
  return ok;
}

function setError(field, msg) {
  document.getElementById(`field${field}`).classList.add('error');
  document.getElementById(`error${field}`).textContent = msg;
}

/* ── Cerrar modal ──────────────────────────────────────────────── */
modalClose.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── Inicialización ────────────────────────────────────────────── */
loadProducts();
