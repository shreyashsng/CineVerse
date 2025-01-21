'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCloseCircleOutline } from 'react-icons/io5'

interface AlertMessageProps {
  isVisible: boolean
  message: string
  onClose: () => void
}

export default function AlertMessage({ isVisible, message, onClose }: AlertMessageProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[3000]"
        >
          <div className="flex items-center gap-3 px-6 py-4 bg-red-500/10 backdrop-blur-md rounded-full border border-red-500/20 text-red-500 shadow-lg">
            <IoCloseCircleOutline size={24} />
            <p className="text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="ml-2 hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 