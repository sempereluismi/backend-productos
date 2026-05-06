import { useEffect, useRef } from 'react'

export default function Toast({ toast, onDone }) {
  const timer = useRef(null)

  useEffect(() => {
    if (!toast) return
    clearTimeout(timer.current)
    timer.current = setTimeout(onDone, 3000)
    return () => clearTimeout(timer.current)
  }, [toast, onDone])

  return (
    <div className={`toast${toast ? ` ${toast.type} show` : ''}`}>
      {toast?.msg}
    </div>
  )
}
