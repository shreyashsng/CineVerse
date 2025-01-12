'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCloseOutline } from 'react-icons/io5'

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

export default function VideoPlayer({ imdbId, contentType, isOpen, onClose }: VideoPlayerProps) {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [totalSeasons, setTotalSeasons] = useState(1)

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
      } catch (error) {
        console.error('Error fetching series info:', error)
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
      } catch (error) {
        console.error('Error fetching episodes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedSeason > 0) {
      fetchEpisodes()
    }
  }, [imdbId, contentType, selectedSeason])

  const videoUrl = contentType === 'movie'
    ? `https://vidsrc.xyz/embed/movie/${imdbId}`
    : `https://vidsrc.xyz/embed/tv/${imdbId}/${selectedSeason}/${selectedEpisode}`

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-8"
        >
          {/* Content Container */}
          <div className="w-full h-full flex gap-6 max-w-[1400px] mx-auto">
            {/* Video Player */}
            <div className="flex-1 h-full flex items-center flex-col">
              <div className="w-full max-w-[900px] mx-auto aspect-video">
                <iframe
                  src={videoUrl}
                  className="w-full h-full rounded-xl"
                  allowFullScreen
                />
              </div>
              {/* Server Note */}
              <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
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
                <span>To switch servers, click the cloud icon in the top-left corner of the player</span>
              </div>
            </div>

            {/* Episodes Panel for TV Shows */}
            {contentType === 'series' && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-black/50 rounded-xl backdrop-blur-md border border-white/10 overflow-hidden flex flex-col"
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

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white z-50"
          >
            <IoCloseOutline size={32} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 