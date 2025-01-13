import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCloseOutline, IoInformationCircleOutline } from 'react-icons/io5'

interface StreamServer {
  id?: string
  name: string
  movie_url: string
  tv_url: string
}

interface ServerModalProps {
  show: boolean
  server: StreamServer | null
  onClose: () => void
  onSave: (data: StreamServer) => void
}

export default function ServerModal({ show, server, onClose, onSave }: ServerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    movie_url: '',
    tv_url: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (server) {
      setFormData(server)
    } else {
      setFormData({
        name: '',
        movie_url: '',
        tv_url: ''
      })
    }
    setError('')
  }, [server])

  const validateAndFormatUrl = (url: string, type: 'movie' | 'tv'): string => {
    try {
      // Remove any existing placeholders first
      const cleanUrl = url
        .replace('{imdbId}', 'placeholder')
        .replace('{season}', '1')
        .replace('{episode}', '1')

      // Test if it's a valid URL
      new URL(cleanUrl)

      // Now format the URL with our placeholders
      if (type === 'movie') {
        // Find where the IMDb ID should go
        if (!url.includes('{imdbId}')) {
          // Try to detect the IMDb ID position using 'placeholder'
          url = url.replace('placeholder', '{imdbId}')
        }
      } else {
        // For TV shows, ensure all required placeholders are present
        if (!url.includes('{imdbId}')) {
          throw new Error('TV URL must include {imdbId} placeholder')
        }
        if (!url.includes('{season}')) {
          throw new Error('TV URL must include {season} placeholder')
        }
        if (!url.includes('{episode}')) {
          throw new Error('TV URL must include {episode} placeholder')
        }
      }

      return url
    } catch (error) {
      throw new Error(`Invalid ${type} URL format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Validate and format both URLs
      const formattedMovieUrl = validateAndFormatUrl(formData.movie_url, 'movie')
      const formattedTvUrl = validateAndFormatUrl(formData.tv_url, 'tv')

      onSave({
        ...formData,
        movie_url: formattedMovieUrl,
        tv_url: formattedTvUrl
      })
    } catch (error: any) {
      setError(error.message)
    }
  }

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
            className="bg-[#1A1B1E] rounded-xl overflow-hidden w-full max-w-md"
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
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <IoInformationCircleOutline className="mt-0.5 text-blue-400" size={16} />
                  <div className="text-gray-400">
                    <p className="mb-2">Required placeholders:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><code className="text-blue-400">{'{imdbId}'}</code> - For both movie and TV URLs</li>
                      <li><code className="text-blue-400">{'{season}'}</code> - For TV URL only</li>
                      <li><code className="text-blue-400">{'{episode}'}</code> - For TV URL only</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Server Name</label>
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
                  <label className="block text-sm text-gray-400 mb-1.5">Movie URL</label>
                  <input
                    type="text"
                    value={formData.movie_url}
                    onChange={e => setFormData(prev => ({ ...prev, movie_url: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm font-mono"
                    placeholder="https://example.com/embed/movie/{imdbId}"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">TV Show URL</label>
                  <input
                    type="text"
                    value={formData.tv_url}
                    onChange={e => setFormData(prev => ({ ...prev, tv_url: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/30 rounded-lg text-sm font-mono"
                    placeholder="https://example.com/embed/tv/{imdbId}/{season}/{episode}"
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