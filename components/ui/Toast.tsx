import { motion, AnimatePresence } from 'framer-motion'
import { createRoot } from 'react-dom/client'

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
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
        status === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      {title}
    </motion.div>
  )
}

export const toast = (options: ToastOptions) => {
  const { duration = 3000 } = options
  
  // Create container if it doesn't exist
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    document.body.appendChild(container)
  }

  // Create root and render toast
  const root = createRoot(container)
  
  root.render(
    <AnimatePresence>
      <ToastComponent
        {...options}
        onClose={() => {
          root.unmount()
          container?.remove()
        }}
      />
    </AnimatePresence>
  )

  // Auto remove after duration
  setTimeout(() => {
    root.unmount()
    container?.remove()
  }, duration)
} 