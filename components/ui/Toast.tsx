'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { createRoot } from 'react-dom/client'
import { IoCheckmarkCircle, IoCloseCircle, IoClose } from 'react-icons/io5'

interface ToastOptions {
  title: string
  status: 'success' | 'error'
  duration?: number
}

interface ToastProps extends ToastOptions {
  onClose: () => void
}

function ToastComponent({ title, status, onClose }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="mb-4 last:mb-0"
    >
      <div className={`
        flex items-center gap-3 pl-4 pr-2 py-3 
        backdrop-blur-xl rounded-xl shadow-xl
        border border-white/10
        ${status === 'success' 
          ? 'bg-green-500/10 text-green-400' 
          : 'bg-red-500/10 text-red-400'
        }
      `}>
        {status === 'success' ? (
          <IoCheckmarkCircle className="w-5 h-5" />
        ) : (
          <IoCloseCircle className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{title}</span>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-2"
        >
          <IoClose className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Keep track of the toast container and root
let toastContainer: HTMLDivElement | null = null
let toastRoot: ReturnType<typeof createRoot> | null = null

interface ToastState {
  toasts: Array<{ id: string } & ToastOptions>
}

// Create a function to manage toast state
function ToastManager({ toasts, removeToast }: { 
  toasts: ToastState['toasts']
  removeToast: (id: string) => void 
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Initialize toast state
const state: ToastState = {
  toasts: []
}

export const toast = (options: ToastOptions) => {
  const { duration = 3000 } = options
  const id = Math.random().toString(36).substr(2, 9)

  // Initialize container and root if they don't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    document.body.appendChild(toastContainer)
    toastRoot = createRoot(toastContainer)
  }

  // Add new toast to state
  state.toasts.push({ ...options, id })

  // Function to remove a specific toast
  const removeToast = (toastId: string) => {
    state.toasts = state.toasts.filter(t => t.id !== toastId)
    renderToasts()

    // Clean up if no more toasts
    if (state.toasts.length === 0) {
      setTimeout(() => {
        if (toastRoot && toastContainer) {
          toastRoot.unmount()
          document.body.removeChild(toastContainer)
          toastRoot = null
          toastContainer = null
        }
      }, 300) // Wait for exit animation
    }
  }

  // Function to render all toasts
  const renderToasts = () => {
    if (toastRoot) {
      toastRoot.render(
        <ToastManager 
          toasts={state.toasts} 
          removeToast={removeToast} 
        />
      )
    }
  }

  // Initial render
  renderToasts()

  // Auto remove after duration
  setTimeout(() => {
    removeToast(id)
  }, duration)
} 