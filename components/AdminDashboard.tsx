'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { IoAddOutline, IoGridOutline, IoListOutline, IoSearchOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5'
import ServerModal from './ServerModal'
import ServerCard from './ServerCard'

interface AdditionalServer {
  id?: string
  name: string
  movie_url: string
  tv_url: string
  description: string
}

export default function AdminDashboard() {
  const [servers, setServers] = useState<AdditionalServer[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingServer, setEditingServer] = useState<AdditionalServer | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClientComponentClient()

  const defaultServers = [
    {
      name: 'Mercury',
      movie_url: 'https://vidsrc.xyz/embed/movie/{imdbId}',
      tv_url: 'https://vidsrc.xyz/embed/tv/{imdbId}/{season}/{episode}',
      color: 'blue',
      isDefault: true
    },
    {
      name: 'Venus',
      movie_url: 'https://www.2embed.cc/embed/{imdbId}',
      tv_url: 'https://www.2embed.cc/embedtv/{imdbId}&s={season}&e={episode}',
      color: 'purple',
      isDefault: true
    },
    {
      name: 'Mars',
      movie_url: 'https://embed.su/embed/movie/{imdbId}',
      tv_url: 'https://embed.su/embed/tv/{imdbId}/{season}/{episode}',
      color: 'red',
      isDefault: true
    }
  ]

  const filteredServers = [...defaultServers, ...servers].filter(server => 
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.movie_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.tv_url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      const { data } = await supabase
        .from('streaming_servers')
        .select('*')
        .order('created_at', { ascending: true })
      setServers(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Header */}
      <div className="bg-[#141517]/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Manage Servers</h1>
              <p className="text-sm text-gray-400 mt-1">Track and manage your streaming servers here</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search servers..."
                  className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <button
                onClick={() => {
                  setEditingServer(null)
                  setShowModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700"
              >
                <IoAddOutline size={20} />
                Add Server
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1A1B1E] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-4xl font-bold">{servers.length + 3}</h3>
              <span className="text-sm text-green-400 bg-green-400/10 px-2 py-1 rounded">Active</span>
            </div>
            <p className="text-gray-400">Total Servers</p>
          </div>
          <div className="bg-[#1A1B1E] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-4xl font-bold">3</h3>
              <span className="text-sm text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Default</span>
            </div>
            <p className="text-gray-400">Default Servers</p>
          </div>
          <div className="bg-[#1A1B1E] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-4xl font-bold">{servers.length}</h3>
              <span className="text-sm text-purple-400 bg-purple-400/10 px-2 py-1 rounded">Custom</span>
            </div>
            <p className="text-gray-400">Custom Servers</p>
          </div>
        </div>

        {/* View Toggle & Servers List */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Servers</h2>
          <div className="flex items-center gap-2 bg-[#1A1B1E] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600' : 'hover:bg-white/5'}`}
            >
              <IoGridOutline size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-white/5'}`}
            >
              <IoListOutline size={20} />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServers.map(server => (
              <ServerCard
                key={server.name}
                server={server}
                isDefault={server.isDefault}
                onEdit={!server.isDefault ? () => {
                  setEditingServer(server)
                  setShowModal(true)
                } : undefined}
                onDelete={!server.isDefault ? async () => {
                  if (server.id) {
                    await supabase
                      .from('streaming_servers')
                      .delete()
                      .eq('id', server.id)
                    fetchServers()
                  }
                } : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#1A1B1E] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">Movie URL</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-400">TV URL</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredServers.map(server => (
                  <tr key={server.name} className="hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${server.isDefault ? `bg-${server.color}-400` : 'bg-purple-400'}`} />
                        <span className="font-medium">{server.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm px-2 py-1 rounded ${
                        server.isDefault ? 'bg-blue-400/10 text-blue-400' : 'bg-purple-400/10 text-purple-400'
                      }`}>
                        {server.isDefault ? 'Default' : 'Custom'}
                      </span>
                    </td>
                    <td className="p-4">
                      <code className="text-xs text-purple-400">{server.movie_url}</code>
                    </td>
                    <td className="p-4">
                      <code className="text-xs text-purple-400">{server.tv_url}</code>
                    </td>
                    <td className="p-4 text-right">
                      {!server.isDefault && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingServer(server)
                              setShowModal(true)
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                          >
                            <IoPencilOutline size={16} />
                          </button>
                          <button
                            onClick={async () => {
                              if (server.id) {
                                await supabase
                                  .from('streaming_servers')
                                  .delete()
                                  .eq('id', server.id)
                                fetchServers()
                              }
                            }}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"
                          >
                            <IoTrashOutline size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ServerModal
        show={showModal}
        server={editingServer}
        onClose={() => {
          setShowModal(false)
          setEditingServer(null)
        }}
        onSave={async (serverData) => {
          if (editingServer?.id) {
            await supabase
              .from('streaming_servers')
              .update(serverData)
              .eq('id', editingServer.id)
          } else {
            await supabase
              .from('streaming_servers')
              .insert([serverData])
          }
          fetchServers()
          setShowModal(false)
          setEditingServer(null)
        }}
      />
    </div>
  )
} 