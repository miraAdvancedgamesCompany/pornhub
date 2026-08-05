import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import './Toast.css'

const ToastContext = createContext(null)

let globalToastId = 0

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false)
  const Icon = ICONS[toast.type] || Info

  const handleClose = () => {
    setExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  // Auto-dismiss
  const timerRef = useRef(null)
  if (!timerRef.current) {
    timerRef.current = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 4000)
  }

  return (
    <div className={`toast-item toast-${toast.type} ${exiting ? 'toast-exit' : ''}`}>
      <Icon className="toast-icon" />
      <div className="toast-content">
        <div className="toast-message">{toast.message}</div>
      </div>
      <X className="toast-close" onClick={handleClose} />
      <div className="toast-timer" />
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++globalToastId
    setToasts(prev => [...prev.slice(-4), { id, message, type, duration }])
  }, [])

  const toast = useCallback({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info')
  }, [addToast])

  // Make object stable
  const contextValue = useRef({ toast, addToast })
  contextValue.current = { toast, addToast }

  return (
    <ToastContext.Provider value={contextValue.current}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
