'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCloseOutline } from 'react-icons/io5'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Episode {
  title: string
  episode: number
}

interface Season {
  season: number
  episodes: Episode[]
}

interface VideoPlayerProps {
  imdbId: string
  contentType: 'movie' | 'series'
  isOpen: boolean
  onClose: () => void
}

// Add custom error type
type PlayerError = {
  message: string;
  code?: string;
}

interface StreamSource {
  name: string
  url: string
  isDefault?: boolean
  color?: string
}

export default function VideoPlayer({ imdbId, contentType, isOpen, onClose }: VideoPlayerProps) {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [totalSeasons, setTotalSeasons] = useState(1)
  const [selectedSource, setSelectedSource] = useState(0)
  const [additionalSources, setAdditionalSources] = useState<StreamSource[]>([])
  const supabase = createClientComponentClient()

  // Define default sources
  const defaultSources = [
    {
      name: 'Mercury',
      url: contentType === 'movie' 
        ? `https://vidsrc.xyz/embed/movie/${imdbId}`
        : `https://vidsrc.xyz/embed/tv/${imdbId}/${selectedSeason}/${selectedEpisode}`,
      isDefault: true,
      color: 'blue'
    },
    {
      name: 'Venus',
      url: contentType === 'movie'
        ? `https://www.2embed.cc/embed/${imdbId}`
        : `https://www.2embed.cc/embedtv/${imdbId}&s=${selectedSeason}&e=${selectedEpisode}`,
      isDefault: true,
      color: 'purple'
    }
  ]

  // Fetch additional sources from Supabase
  useEffect(() => {
    const fetchAdditionalSources = async () => {
      try {
        const { data: servers, error } = await supabase
          .from('streaming_servers')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error

        if (servers) {
          const formattedSources = servers.map(server => ({
            name: server.name,
            url: contentType === 'movie'
              ? server.movie_url.replace('{imdbId}', imdbId)
              : server.tv_url
                  .replace('{imdbId}', imdbId)
                  .replace('{season}', selectedSeason.toString())
                  .replace('{episode}', selectedEpisode.toString()),
            isDefault: false
          }))
          setAdditionalSources(formattedSources)
        }
      } catch (error) {
        console.error('Error fetching servers:', error)
      }
    }

    fetchAdditionalSources()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streaming_servers',
        },
        () => {
          console.log('VideoPlayer: Change received!')
          fetchAdditionalSources() // Refetch when any change occurs
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [imdbId, contentType, selectedSeason, selectedEpisode, supabase])

  // Combine default and additional sources
  const allSources = [...defaultSources, ...additionalSources]

  // First fetch total seasons when a TV show is loaded
  useEffect(() => {
    const fetchTotalSeasons = async () => {
      if (contentType !== 'series' || !imdbId) return

      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&i=${imdbId}&type=series`
        )
        const data = await response.json()
        if (data.totalSeasons) {
          setTotalSeasons(parseInt(data.totalSeasons))
        }
      } catch (error: unknown) {
        const playerError = error as PlayerError
        console.error('Error:', playerError.message)
      }
    }

    fetchTotalSeasons()
  }, [imdbId, contentType])

  // Then fetch episodes for the selected season
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (contentType !== 'series' || !imdbId) return

      setIsLoading(true)
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&i=${imdbId}&Season=${selectedSeason}`
        )
        const data = await response.json()
        
        if (data.Episodes) {
          const episodesList = data.Episodes.map((ep: any) => ({
            title: ep.Title,
            episode: parseInt(ep.Episode),
          }))
          
          setSeasons(prev => {
            const updated = [...prev]
            updated[selectedSeason - 1] = {
              season: selectedSeason,
              episodes: episodesList
            }
            return updated
          })
        }
      } catch (error: unknown) {
        const playerError = error as PlayerError
        console.error('Error:', playerError.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedSeason > 0) {
      fetchEpisodes()
    }
  }, [imdbId, contentType, selectedSeason])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-xl overflow-y-auto"
        >
          {/* Close Button - Always at top */}
          <button
            onClick={onClose}
            className="fixed top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white z-50"
          >
            <IoCloseOutline size={32} />
          </button>

          {/* Main Content */}
          <div className="w-full min-h-full flex flex-col md:flex-row gap-6 max-w-[1400px] mx-auto p-4 md:p-8 pt-16 md:pt-8">
            {/* Video Player Section */}
            <div className="flex-1 flex flex-col items-center">
              {/* Video Player with Glow */}
              <div className="relative w-full max-w-[900px]">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-xl blur-2xl" />
                <div className="absolute inset-0 bg-black/50 rounded-xl backdrop-blur-sm" />
                
                <div className="relative aspect-video">
                  <iframe
                    src={allSources[selectedSource].url}
                    className="w-full h-full rounded-xl"
                    allowFullScreen
                  />
                </div>
              </div>
              
              {/* Source Buttons */}
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center w-full max-w-[900px]">
                {allSources.map((source, index) => (
                  <button
                    key={source.name}
                    onClick={() => setSelectedSource(index)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2 ${
                      selectedSource === index
                        ? source.isDefault 
                          ? `bg-${source.color}-600 text-white`
                          : 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      source.isDefault 
                        ? `bg-${source.color}-400`
                        : 'bg-purple-400'
                    }`} />
                    {source.name}
                  </button>
                ))}
              </div>

              {/* Server Switch Note - Centered with player */}
              <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm w-full max-w-[900px] justify-center">
                <motion.div
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span>To switch servers, click the server name above</span>
              </div>
            </div>

            {/* TV Show Controls */}
            {contentType === 'series' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full md:w-80 bg-black/50 rounded-xl backdrop-blur-md border border-white/10 overflow-hidden flex flex-col h-auto md:h-[calc(100vh-4rem)]"
              >
                {/* Season Selector */}
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold mb-2 text-white">Select Season</h3>
                  <div className="relative">
                    <select
                      value={selectedSeason}
                      onChange={(e) => {
                        setSelectedSeason(Number(e.target.value))
                        setSelectedEpisode(1)
                      }}
                      className="w-full bg-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-white/10 hover:bg-white/20 transition-colors"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.5em 1.5em',
                      }}
                    >
                      {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((season) => (
                        <option 
                          key={season} 
                          value={season}
                          className="bg-black/90 text-white py-2"
                        >
                          Season {season}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Episodes List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                  <h3 className="text-lg font-semibold mb-3 text-white">Episodes</h3>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <motion.div
                        className="w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {seasons[selectedSeason - 1]?.episodes.map((episode) => (
                        <motion.button
                          key={episode.episode}
                          onClick={() => setSelectedEpisode(episode.episode)}
                          className={`w-full text-left p-4 rounded-lg transition-all ${
                            selectedEpisode === episode.episode
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="font-medium">Episode {episode.episode}</div>
                          <div className="text-sm text-gray-400 line-clamp-2 mt-1">
                            {episode.title}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 