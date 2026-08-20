import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../hooks/useToast.jsx'

const TOAST_CONFIG = {
  success: { icon: CheckCircle,  border: 'border-green-500/40',  bg: 'bg-green-500/10',  text: 'text-green-400'  },
  error:   { icon: XCircle,      border: 'border-red-500/40',    bg: 'bg-red-500/10',    text: 'text-red-400'    },
  warning: { icon: AlertTriangle, border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  info:    { icon: Info,          border: 'border-blue-500/40',   bg: 'bg-blue-500/10',   text: 'text-blue-400'   },
}

function ToastItem({ toast, onRemove }) {
  const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info
  const Icon = cfg.icon
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md
                  bg-white/95 dark:bg-academy-surfaceDark/95 ${cfg.border} shadow-soft animate-slide-in
                  min-w-[300px] max-w-[420px]`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.text}`} />
      <p className="flex-1 text-academy-textMain/90 text-sm leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-academy-textMain/30 hover:text-academy-textMain/70 transition-colors flex-shrink-0 ml-1"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function Toast() {
  const { toasts, remove } = useToast()
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={remove} />
        </div>
      ))}
    </div>
  )
}
