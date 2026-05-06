import { useRef } from 'react'

export default function Toolbar({ search, onSearch, onNewProduct }) {
  const timer = useRef(null)

  const handleInput = (e) => {
    const value = e.target.value
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch(value.trim()), 350)
  }

  return (
    <section className="toolbar">
      <input
        type="text"
        className="search-input"
        defaultValue={search}
        placeholder="Buscar por nombre…"
        onChange={handleInput}
      />
      <button className="btn btn-primary" onClick={onNewProduct}>
        + Nuevo producto
      </button>
    </section>
  )
}
