import { useState, useCallback } from 'react'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import ProductTable from './components/ProductTable'
import Pagination from './components/Pagination'
import ProductModal from './components/ProductModal'
import Toast from './components/Toast'

export default function App() {
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    sortField: '',
    sortDir: '',
  })
  const [total, setTotal] = useState(0)
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState({ open: false, product: null })
  const [refreshKey, setRefreshKey] = useState(0)

  const showToast = (msg, type = 'success') => setToast({ msg, type })
  const refresh   = () => setRefreshKey(k => k + 1)

  const handleSearch = useCallback((search) => {
    setQuery(prev => ({ ...prev, search, page: 1 }))
  }, [])

  const handleSort = useCallback((field) => {
    setQuery(prev => {
      const dir = prev.sortField === field
        ? (prev.sortDir === 'asc' ? 'desc' : 'asc')
        : 'asc'
      return { ...prev, sortField: field, sortDir: dir, page: 1 }
    })
  }, [])

  const handlePageChange = useCallback((page) => {
    setQuery(prev => ({ ...prev, page }))
  }, [])

  const handleTotalChange = useCallback((t) => setTotal(t), [])

  const openNew  = () => setModal({ open: true, product: null })
  const openEdit = (product) => setModal({ open: true, product })
  const closeModal = () => setModal({ open: false, product: null })

  return (
    <>
      <Toast toast={toast} onDone={() => setToast(null)} />
      <Header />
      <main>
        <Toolbar
          search={query.search}
          onSearch={handleSearch}
          onNewProduct={openNew}
        />
        <ProductTable
          query={query}
          refreshKey={refreshKey}
          onEdit={openEdit}
          onDeleted={() => { showToast('Producto eliminado'); refresh() }}
          onDeleteError={(msg) => showToast(msg, 'error')}
          onSort={handleSort}
          onTotalChange={handleTotalChange}
        />
        <Pagination
          page={query.page}
          pageSize={query.pageSize}
          total={total}
          onPageChange={handlePageChange}
        />
        {modal.open && (
          <ProductModal
            product={modal.product}
            onClose={closeModal}
            onSaved={(isEdit) => {
              showToast(isEdit ? 'Producto actualizado' : 'Producto creado')
              closeModal()
              refresh()
            }}
            onError={(msg) => showToast(msg, 'error')}
          />
        )}
      </main>
    </>
  )
}
