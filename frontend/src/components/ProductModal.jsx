import { useState, useEffect, useRef } from 'react'
import { createProduct, updateProduct } from '../api'

export default function ProductModal({ product, onClose, onSaved, onError }) {
  const isEdit = !!product
  const [form, setForm] = useState({
    name:        '',
    description: '',
    price:       '',
    stock:       '',
  })
  const [errors, setErrors] = useState({})
  const nameRef = useRef(null)

  useEffect(() => {
    if (product) {
      setForm({
        name:        product.name,
        description: product.description ?? '',
        price:       product.price,
        stock:       product.stock,
      })
    }
    nameRef.current?.focus()
  }, [product])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const validate = () => {
    const errs = {}
    if (!form.name.trim())
      errs.name = 'El nombre es obligatorio'
    if (form.price === '' || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)
      errs.price = 'Introduce un precio válido (≥ 0)'
    if (form.stock === '' || isNaN(parseInt(form.stock, 10)) || parseInt(form.stock, 10) < 0)
      errs.stock = 'Introduce un stock válido (≥ 0)'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || null,
      price:       parseFloat(form.price),
      stock:       parseInt(form.stock, 10),
    }

    try {
      if (isEdit) {
        await updateProduct(product.id, payload)
      } else {
        await createProduct(payload)
      }
      onSaved(isEdit)
    } catch (err) {
      onError(`Error: ${err.message}`)
    }
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form id="productForm" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Nombre <span className="required">*</span></label>
            <input
              ref={nameRef}
              type="text"
              className={errors.name ? 'error' : ''}
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Ej. Camiseta básica"
            />
            <span className="field-error">{errors.name}</span>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Descripción opcional…"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio (€) <span className="required">*</span></label>
              <input
                type="number"
                className={errors.price ? 'error' : ''}
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange('price')}
                placeholder="0.00"
              />
              <span className="field-error">{errors.price}</span>
            </div>

            <div className="form-group">
              <label>Stock <span className="required">*</span></label>
              <input
                type="number"
                className={errors.stock ? 'error' : ''}
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange('stock')}
                placeholder="0"
              />
              <span className="field-error">{errors.stock}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
