import { useState, useEffect, useRef } from 'react'
import { fetchProducts, deleteProduct } from '../api'

function formatPrice(n) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
}

function StockBadge({ n }) {
  if (n === 0) return <span className="badge-stock badge-out">Sin stock</span>
  if (n <= 5)  return <span className="badge-stock badge-low">{n}</span>
  return <span className="badge-stock badge-ok">{n}</span>
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <span className="sort-icon">↕</span>
  return <span className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>
}

export default function ProductTable({ query, refreshKey, onEdit, onDeleted, onDeleteError, onSort, onTotalChange }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const onTotalChangeRef        = useRef(onTotalChange)

  useEffect(() => { onTotalChangeRef.current = onTotalChange })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchProducts(query)
      .then(data => {
        if (cancelled) return
        setProducts(data.data?.items ?? [])
        onTotalChangeRef.current(data.data?.pagination?.total ?? 0)
        setError(null)
      })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [query, refreshKey])

  const handleDelete = (id, name) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    deleteProduct(id)
      .then(onDeleted)
      .catch(err => onDeleteError(`Error al eliminar: ${err.message}`))
  }

  const thClass = (field) =>
    `sortable${query.sortField === field ? ` sort-${query.sortDir}` : ''}`

  return (
    <section className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th className={thClass('name')} onClick={() => onSort('name')}>
              Nombre <SortIcon field="name" sortField={query.sortField} sortDir={query.sortDir} />
            </th>
            <th>Descripción</th>
            <th className={thClass('price')} onClick={() => onSort('price')}>
              Precio <SortIcon field="price" sortField={query.sortField} sortDir={query.sortDir} />
            </th>
            <th className={thClass('stock')} onClick={() => onSort('stock')}>
              Stock <SortIcon field="stock" sortField={query.sortField} sortDir={query.sortDir} />
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={5} className="loading">Cargando…</td></tr>
          )}
          {!loading && error && (
            <tr><td colSpan={5} className="empty-state">Error: {error}</td></tr>
          )}
          {!loading && !error && products.length === 0 && (
            <tr><td colSpan={5} className="empty-state">No se encontraron productos.</td></tr>
          )}
          {!loading && !error && products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.description || '—'}</td>
              <td>{formatPrice(p.price)}</td>
              <td><StockBadge n={p.stock} /></td>
              <td className="actions-cell">
                <button className="btn btn-edit"   onClick={() => onEdit(p)}>Editar</button>
                <button className="btn btn-danger" onClick={() => handleDelete(p.id, p.name)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
