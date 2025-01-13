'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { IoAddOutline } from 'react-icons/io5'
import ServerModal from './ServerModal'
import ServerCard from './ServerCard'

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
  const supabase = createClientComponentClient()

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

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-8">
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

      <ServerModal
        show={showModal}
        server={editingServer}
        onClose={() => {
          setShowModal(false)
          setEditingServer(null)
        }}
        onSave={handleSaveServer}
      />
    </div>
  )
} 