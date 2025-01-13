import { motion } from 'framer-motion'
import { IoTrashOutline, IoPencilOutline } from 'react-icons/io5'

interface ServerCardProps {
  server: {
    id?: string
    name: string
    movie_url: string
    tv_url: string
    description?: string
    isDefault?: boolean
    color?: string
  }
  isDefault?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export default function ServerCard({ server, isDefault, onEdit, onDelete }: ServerCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A1B1E] rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-colors"
    >
      <div className={`px-4 py-3 flex items-center justify-between ${
        isDefault ? `bg-${server.color}-500/10` : 'bg-purple-500/10'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isDefault ? `bg-${server.color}-400` : 'bg-purple-400'}`} />
          <h3 className="font-medium">{server.name}</h3>
        </div>
        {!isDefault && (
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
            >
              <IoPencilOutline size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"
            >
              <IoTrashOutline size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="p-4 text-xs space-y-3">
        <div>
          <span className="text-gray-400">Movie URL</span>
          <code className="block mt-1.5 bg-black/30 p-2 rounded text-purple-400 overflow-x-auto">
            {server.movie_url}
          </code>
        </div>
        <div>
          <span className="text-gray-400">TV URL</span>
          <code className="block mt-1.5 bg-black/30 p-2 rounded text-purple-400 overflow-x-auto">
            {server.tv_url}
          </code>
        </div>
        {server.description && (
          <div>
            <span className="text-gray-400">Description</span>
            <p className="mt-1 text-gray-300">{server.description}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 