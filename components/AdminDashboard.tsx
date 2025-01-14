'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { IoAddOutline, IoTrashOutline } from 'react-icons/io5'
import ServerModal from './ServerModal'
import ServerCard from './ServerCard'
import ChangelogEditor from './ChangelogEditor'

interface StreamServer {
  id?: string
  name: string
  movie_url: string
  tv_url: string
  isDefault?: boolean
  color?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [additionalServers, setAdditionalServers] = useState<StreamServer[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingServer, setEditingServer] = useState<StreamServer | null>(null)
  const [showChangelogEditor, setShowChangelogEditor] = useState(false)
  const [changelogs, setChangelogs] = useState<any[]>([])
  const supabase = createClientComponentClient()
  const [activeTab, setActiveTab] = useState<'servers' | 'changelogs'>('servers')

  // Default servers (read-only)
  const defaultServers: StreamServer[] = [
    {
      name: 'Mercury',
      movie_url: 'https://vidsrc.xyz/embed/movie/{imdbId}',
      tv_url: 'https://vidsrc.xyz/embed/tv/{imdbId}/{season}/{episode}',
      isDefault: true,
      color: 'blue'
    },
    {
      name: 'Venus',
      movie_url: 'https://www.2embed.cc/embed/{imdbId}',
      tv_url: 'https://www.2embed.cc/embedtv/{imdbId}&s={season}&e={episode}',
      isDefault: true,
      color: 'purple'
    }
  ]

  useEffect(() => {
    fetchAdditionalServers()
  }, [])

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== 'shreyashsng@gmail.com') {
        router.push('/admin/login')
      }
    }
    checkAuth()
  }, [supabase, router])

  const fetchAdditionalServers = async () => {
    try {
      const { data, error } = await supabase
        .from('streaming_servers')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setAdditionalServers(data || [])
    } catch (error) {
      console.error('Error fetching servers:', error)
    }
  }

  const handleSaveServer = async (serverData: StreamServer) => {
    try {
      const { error } = await supabase
        .from('streaming_servers')
        .insert([{
          name: serverData.name,
          movie_url: serverData.movie_url,
          tv_url: serverData.tv_url
        }])

      if (error) {
        throw new Error(error.message)
      }
      
      await fetchAdditionalServers()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving server:', error instanceof Error ? error.message : 'Unknown error')
      alert(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const handleDeleteServer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('streaming_servers')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchAdditionalServers()
    } catch (error: any) {
      console.error('Error deleting server:', error.message)
    }
  }

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
    fetchChangelogs()
  }, []) // Initial fetch

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

  const handleDeleteChangelog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('changelogs')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting changelog:', error)
      alert('Failed to delete changelog. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-8">
      {/* Tabs */}
      <div className="mb-8 border-b border-white/10">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('servers')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'servers' 
                ? 'text-purple-400 border-b-2 border-purple-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Streaming Servers
          </button>
          <button 
            onClick={() => setActiveTab('changelogs')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'changelogs' 
                ? 'text-purple-400 border-b-2 border-purple-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Changelogs
          </button>
        </div>
      </div>

      {/* Servers Content */}
      {activeTab === 'servers' && (
        <>
          {/* Default Servers Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Default Servers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defaultServers.map((server) => (
                <ServerCard
                  key={server.name}
                  server={server}
                  isDefault={true}
                />
              ))}
            </div>
          </div>

          {/* Additional Servers Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Additional Servers</h2>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                <IoAddOutline size={20} />
                Add Server
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {additionalServers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onEdit={() => {
                    setEditingServer(server)
                    setShowModal(true)
                  }}
                  onDelete={() => server.id && handleDeleteServer(server.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Changelogs Content */}
      {activeTab === 'changelogs' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Manage Changelogs</h2>
            <button
              onClick={() => setShowChangelogEditor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              <IoAddOutline size={20} />
              Add Entry
            </button>
          </div>

          <div className="space-y-4">
            {changelogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#1A1B1E] rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
                      v{log.version}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this changelog?')) {
                          handleDeleteChangelog(log.id)
                        }
                      }}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{log.title}</h3>
                <p className="text-gray-400 mb-4">{log.description}</p>
                
                <ul className="space-y-2">
                  {log.changes.map((change: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-purple-400 mt-1">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ServerModal
        show={showModal}
        server={editingServer}
        onClose={() => {
          setShowModal(false)
          setEditingServer(null)
        }}
        onSave={handleSaveServer}
      />

      {showChangelogEditor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <ChangelogEditor
              onClose={() => setShowChangelogEditor(false)}
              onSave={() => {
                fetchChangelogs()
                setShowChangelogEditor(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
} 