import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastIdCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être dans <ToastProvider>')

  const success = useCallback((msg, dur) => ctx.addToast(msg, 'success', dur), [ctx.addToast])
  const error = useCallback((msg, dur) => ctx.addToast(msg, 'error', dur), [ctx.addToast])
  const info = useCallback((msg, dur) => ctx.addToast(msg, 'info', dur), [ctx.addToast])
  const warning = useCallback((msg, dur) => ctx.addToast(msg, 'warning', dur), [ctx.addToast])

  return {
    success,
    error,
    info,
    warning,
    toasts:  ctx.toasts,
    remove:  ctx.removeToast,
  }
}
