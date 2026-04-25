import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { subscribe, removeToast, type ToastType } from '../../lib/toast'

interface Toast {
  id: string
  type: ToastType
  message: string
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return subscribe(setToasts)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    error: <AlertCircle className="h-4 w-4 text-rose-400" />,
    info: <Info className="h-4 w-4 text-blue-400" />,
  }

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/[0.06]',
    error: 'border-rose-500/20 bg-rose-500/[0.06]',
    info: 'border-blue-500/20 bg-blue-500/[0.06]',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 4, x: 100 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${colors[toast.type]}`}
    >
      {icons[toast.type]}
      <span className="text-white/80">{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/40 hover:text-white/60 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}
