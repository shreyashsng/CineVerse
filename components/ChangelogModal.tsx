import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCloseOutline } from 'react-icons/io5'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'

interface Changelog {
  id: string
  version: string
  title: string
  description: string
  changes: string[]
  created_at: string
}

interface ChangelogModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const [changelogs, setChangelogs] = useState<Changelog[]>([])
  const supabase = createClientComponentClient()

  const fetchChangelogs = async () => {
    try {
      const { data, error } = await supabase
        .from('changelogs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setChangelogs(data || [])
    } catch (error) {
      console.error('Error fetching changelogs:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchChangelogs()
    }
  }, [isOpen])

  useEffect(() => {
    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'changelogs',
        },
        () => {
          fetchChangelogs() // Refresh when any change occurs
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="w-full max-w-2xl max-h-[80vh] bg-[#1A1B1E] rounded-xl overflow-hidden shadow-xl relative"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1A1B1E] z-10">
              <h2 className="text-xl font-semibold text-white">Changelog</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <IoCloseOutline size={20} className='text-white' />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
              <div className="space-y-8">
                {changelogs.map((log) => (
                  <div key={log.id} className="relative pl-8 pb-8 last:pb-0">
                    {/* Timeline line */}
                    <div className="absolute left-0 top-2 bottom-0 w-px bg-gradient-to-b from-purple-500 to-transparent" />
                    
                    {/* Timeline dot */}
                    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-purple-500" />

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
                          v{log.version}
                        </span>
                        <span className="text-sm text-gray-400">
                          {format(new Date(log.created_at), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {log.title}
                      </h3>
                      
                      <p className="text-gray-400 mb-4">
                        {log.description}
                      </p>

                      <ul className="space-y-2">
                        {log.changes.map((change, index) => (
                          <li 
                            key={index}
                            className="flex items-start gap-2 text-gray-300"
                          >
                            <span className="text-purple-400 mt-1">•</span>
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 