export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

let listeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []
let nextId = 0

export function subscribe(callback: (toasts: Toast[]) => void) {
  listeners.push(callback)
  callback(toasts)
  return () => {
    listeners = listeners.filter(l => l !== callback)
  }
}

function notify() {
  listeners.forEach(l => l(toasts))
}

export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = String(nextId++)
  const toast: Toast = { id, type, message }
  toasts = [...toasts, toast]
  notify()

  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    notify()
  }, duration)

  return id
}

export function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id)
  notify()
}
