export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className="pagination">
      <button
        className="page-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
        <button
          key={i}
          className={`page-btn${i === page ? ' active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      ))}

      <button
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ›
      </button>
    </section>
  )
}
