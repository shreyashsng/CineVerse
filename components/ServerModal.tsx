import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCloseOutline } from 'react-icons/io5'

interface ServerData {
  name: string
  movie_url: string
  tv_url: string
  description: string
  id?: string
  isDefault?: boolean
  color?: string
}

interface ServerModalProps {
  show: boolean
  server: ServerData | null
  onClose: () => void
  onSave: (data: ServerData) => void
}

export default function ServerModal({ show, server, onClose, onSave }: ServerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    movie_url: '',
    tv_url: '',
    description: ''
  })

  useEffect(() => {
    if (server) {
      setFormData(server)
    } else {
      setFormData({
        name: '',
        movie_url: '',
        tv_url: '',
        description: ''
      })
    }
  }, [server])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-[#25262B] rounded-xl overflow-hidden w-full max-w-md"
          >
            <div className="px-4 py-3 bg-white/5 flex items-center justify-between">
              <h2 className="font-medium">
                {server ? 'Edit Server' : 'Add Server'}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg"
              >
                <IoCloseOutline size={18} />
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={(e) => {
                e.preventDefault()
                onSave(formData)
              }} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm"
                    placeholder="e.g., Jupiter"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Movie URL</label>
                  <input
                    type="text"
                    value={formData.movie_url}
                    onChange={e => setFormData(prev => ({ ...prev, movie_url: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm"
                    placeholder="e.g., https://example.com/embed/movie/{imdbId}"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">TV Show URL</label>
                  <input
                    type="text"
                    value={formData.tv_url}
                    onChange={e => setFormData(prev => ({ ...prev, tv_url: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm"
                    placeholder="e.g., https://example.com/embed/tv/{imdbId}/{season}/{episode}"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 hover:bg-white/5 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
                  >
                    {server ? 'Update' : 'Add'} Server
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 