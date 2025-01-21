'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import { IoChevronForwardOutline, IoChevronBackOutline, IoCloseOutline, IoPlayCircle, IoVolumeMediumOutline, IoVolumeMuteOutline, IoHeartOutline, IoHeart } from 'react-icons/io5'
import VideoPlayer from './VideoPlayer'
import AlertMessage from './AlertMessage'
import Navbar from './Navbar'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import WishlistButton from './WishlistButton'

interface Movie {
  imdbID: string
  Title: string
  Poster: string
  Year: string
  Type: string
  imdbRating?: string
  Genre?: string
}

type ContentType = 'movie' | 'series'

// Add this interface for trailer data
interface TrailerData {
  Title: string
  Plot: string
  Year: string
  Runtime: string
  imdbRating: string
  imdbID: string
  Poster: string
  Trailer?: {
    url: string
    type: string
    title: string
    description: string
    thumbnails: {
      default: { url: string }
      medium: { url: string }
      high: { url: string }
    }
    viewCount: string
    genres: string[]
    rating: string
    language: string
  }
}

// Remove the POPULAR_MOVIES array since we're now fetching dynamically
// Instead, let's add a function to get trending movies
const getTrendingMovieId = async () => {
  try {
    // Specifically query for 2024 movies with a more targeted search
    const currentYear = '2024'
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&s=*&type=movie&y=${currentYear}&r=json`
    )
    const data = await response.json()

    if (data.Search && data.Search.length > 0) {
      // Filter out any non-2024 movies (extra safety check)
      const movies2024 = data.Search.filter(movie => movie.Year === '2024')
      
      if (movies2024.length > 0) {
        // Get a random movie from the filtered list
        const randomIndex = Math.floor(Math.random() * movies2024.length)
        return movies2024[randomIndex].imdbID
      }
    }

    // Fallback to some known 2024 movies if the search fails
    const fallbackMovies = [
      'tt11389872', // Dune: Part Two
      'tt11762114', // Madame Web
      'tt9362722',  // Anyone But You
      'tt15789038', // Aquaman and the Lost Kingdom
      'tt11304740', // Bob Marley: One Love
    ]
    const randomFallback = Math.floor(Math.random() * fallbackMovies.length)
    return fallbackMovies[randomFallback]

  } catch (error) {
    console.error('Error fetching trending movie:', error)
    return null
  }
}

const getFirstSentence = (text: string) => {
  const firstSentence = text.split('.')[0]
  return firstSentence + '.'
}

const GlowingBackground = () => (
  <div className="fixed inset-0 overflow-hidden -z-10">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
    <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl" />
  </div>
)

const ToggleButton = ({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    className={`px-8 py-3 rounded-full transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20' 
        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.button>
)

// Add these animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 }
}

const TrailerHero = ({ onPlay, contentType }: { 
  onPlay: (movieId: string) => void;
  contentType: 'movie' | 'series';
}) => {
  const [trailerData, setTrailerData] = useState<TrailerData | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Move getTrendingContent inside useEffect to avoid dependency issues
  useEffect(() => {
    const getTrendingContent = async () => {
      try {
        const currentYear = '2024'
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&s=*&type=${contentType}&y=${currentYear}&r=json`
        )
        const data = await response.json()

        if (data.Search && data.Search.length > 0) {
          const content2024 = data.Search.filter(item => item.Year === '2024')
          
          if (content2024.length > 0) {
            const randomIndex = Math.floor(Math.random() * content2024.length)
            return content2024[randomIndex].imdbID
          }
        }

        // Fallback content based on type
        const fallbackContent = contentType === 'movie' ? [
          'tt11389872', // Dune: Part Two
          'tt11762114', // Madame Web
          'tt9362722',  // Anyone But You
        ] : [
          'tt14230458', // Fallout
          'tt13016388', // House of the Dragon
          'tt15007206', // The Last of Us
        ]

        const randomFallback = Math.floor(Math.random() * fallbackContent.length)
        return fallbackContent[randomFallback]
      } catch (error) {
        console.error('Error fetching trending content:', error)
        return null
      }
    }

    const fetchTrailerData = async () => {
      try {
        const contentId = await getTrendingContent()
        if (!contentId) return

        const omdbResponse = await fetch(
          `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&i=${contentId}&plot=short`
        )
        const omdbData = await omdbResponse.json()
        
        const trailerResponse = await fetch(
          `/api/trailer?imdbId=${contentId}`
        )
        const trailerData = await trailerResponse.json()
        
        setTrailerData({
          ...omdbData,
          Trailer: trailerData
        })
      } catch (error) {
        console.error('Error fetching trailer data:', error)
      }
    }

    fetchTrailerData()
  }, [contentType]) // contentType is now the only dependency

  // Enhanced muting function
  const muteTrailer = () => {
    if (iframeRef.current) {
      // Send mute command multiple times to ensure it works
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ 
          event: 'command', 
          func: 'mute',
          args: [] 
        }), 
        '*'
      )
      setIsMuted(true)
    }
  }

  // Listen for player state from parent
  useEffect(() => {
    const handlePlayerState = (e: CustomEvent<{ isOpen: boolean }>) => {
      setIsPlayerOpen(e.detail.isOpen)
      if (e.detail.isOpen) {
        muteTrailer()
      }
    }

    window.addEventListener('videoPlayerState' as any, handlePlayerState)
    return () => {
      window.removeEventListener('videoPlayerState' as any, handlePlayerState)
    }
  }, [])

  // Update iframe src to include enablejsapi and origin
  const getIframeSrc = () => {
    const baseUrl = trailerData?.Trailer?.url || ''
    const videoId = baseUrl.split('/').pop()
    return `${baseUrl}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`
  }

  const toggleVolume = () => {
    if (iframeRef.current) {
      const message = isMuted ? 'unMute' : 'mute'
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: message }), 
        '*'
      )
      setIsMuted(!isMuted)
    }
  }

  if (!trailerData) return null

  return (
    <div className="relative w-full min-h-[85vh] mb-12">
      <div className="absolute inset-0 overflow-hidden bg-black/40 z-[1]">
        {trailerData?.Trailer ? (
          <motion.div 
            className="relative w-full h-full"
            animate={{ 
              opacity: isPlayerOpen ? 0.2 : 0.75 
            }}
            transition={{ duration: 0.5 }}
          >
            <iframe
              ref={iframeRef}
              src={getIframeSrc()}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                width: '100%',
                height: '100%',
                transform: 'scale(1.5)',
                transformOrigin: 'center center'
              }}
            />
          </motion.div>
        ) : null}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/40 to-black" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-8">
        <div className="absolute top-80 left-8 max-w-lg z-[2]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_4px_3px_rgba(0,0,0,0.4)]">
              {trailerData.Title}
            </h1>

            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-md text-white font-medium">
                {trailerData.Trailer?.rating || 'PG-13'}
              </span>
              <span className="text-white">
                {trailerData.Runtime}
              </span>
              <span className="text-gray-400">
                {trailerData.Year}
              </span>
            </div>
            
            <p className="text-base text-white/90 max-w-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
              {`${trailerData.Plot.split('.')[0]}.`}
            </p>

            {trailerData.Trailer?.genres && (
              <div className="flex flex-wrap gap-3">
                {trailerData.Trailer.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="text-white/90 text-xs font-medium drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]"
                  >
                    {index > 0 && <span className="mr-3 text-white/60">|</span>}
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pt-3">
              <motion.button
                onClick={() => onPlay(trailerData?.imdbID || '')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium text-base shadow-[0_4px_6px_rgba(0,0,0,0.2)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IoPlayCircle size={24} />
                Watch Now
              </motion.button>

              <motion.button
                onClick={toggleVolume}
                className="flex items-center justify-center w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-colors shadow-[0_4px_6px_rgba(0,0,0,0.2)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? (
                  <IoVolumeMuteOutline size={20} className="text-white" />
                ) : (
                  <IoVolumeMediumOutline size={20} className="text-white" />
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [contentType, setContentType] = useState<ContentType>('movie')
  const [showAlert, setShowAlert] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(searchQuery, 500)

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Updated search functionality
  useEffect(() => {
    const searchContent = async () => {
      if (debouncedSearch.trim() === '') {
        setSearchResults([])
        setShowSearchResults(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&s=${debouncedSearch}&type=${contentType}`
        )
        const data = await response.json()
        
        if (data.Response === "True" && data.Search) {
          const detailedContent = await Promise.all(
            data.Search.slice(0, 9).map(async (item: Movie) => {
              const detailResponse = await fetch(
                `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&i=${item.imdbID}`
              )
              return detailResponse.json()
            })
          )
          setSearchResults(detailedContent)
          setShowSearchResults(true)
          setShowAlert(false)
        } else {
          setSearchResults([])
          setShowAlert(true)
        }
      } catch (error) {
        console.error('Error searching content:', error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchContent()
  }, [debouncedSearch, contentType])

  const handleContentClick = (imdbId: string) => {
    setSelectedContent(imdbId)
    setIsPlayerOpen(true)
  }

  // Dispatch player state changes
  const handlePlayerStateChange = (isOpen: boolean) => {
    window.dispatchEvent(
      new CustomEvent('videoPlayerState', { 
        detail: { isOpen } 
      })
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-black via-black/95 to-black relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GlowingBackground />
      <Navbar />
      
      <AlertMessage
        isVisible={showAlert}
        message={`No ${contentType === 'movie' ? 'movies' : 'TV shows'} found matching your search.`}
        onClose={() => setShowAlert(false)}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[41]"
      />
      
      {/* Search Section - Moved to top */}
      <div className="absolute top-24 left-0 right-0 z-[20] px-8">
        <motion.div 
          className="relative max-w-2xl mx-auto mb-4"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center space-x-4">
            <ToggleButton
              active={contentType === 'movie'}
              onClick={() => setContentType('movie')}
            >
              <motion.span
                animate={{ scale: contentType === 'movie' ? 1 : 0.9 }}
                transition={{ duration: 0.2 }}
              >
                Movies
              </motion.span>
            </ToggleButton>
            <ToggleButton
              active={contentType === 'series'}
              onClick={() => setContentType('series')}
            >
              TV Shows
            </ToggleButton>
          </div>
        </motion.div>

        <motion.div 
          className="relative max-w-2xl mx-auto"
          ref={searchRef}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-white/20 transition-colors"
              placeholder={`Search ${contentType === 'movie' ? 'movies' : 'TV shows'}...`}
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute w-full mt-4 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[21]"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                      Search Results
                    </h2>
                    <button 
                      onClick={() => setShowSearchResults(false)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <IoCloseOutline size={24} className="text-white/70 hover:text-white" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide">
                    {searchResults.map((movie) => (
                      <motion.div
                        key={movie.imdbID}
                        layout
                        className="relative group rounded-xl overflow-hidden cursor-pointer bg-white/5"
                        onClick={() => handleContentClick(movie.imdbID)}
                      >
                        <div className="aspect-[2/3] relative">
                          {movie.Poster !== 'N/A' ? (
                            <Image
                              src={movie.Poster}
                              alt={movie.Title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-black/40 flex items-center justify-center">
                              <span className="text-gray-400">No Poster</span>
                            </div>
                          )}
                          {/* Overlay with gradient and content */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                            <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">
                              {movie.Title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300 text-xs">{movie.Year}</span>
                              {movie.imdbRating && (
                                <div className="flex items-center">
                                  <span className="text-yellow-500 mr-1 text-xs">★</span>
                                  <span className="text-gray-300 text-xs">{movie.imdbRating}</span>
                                </div>
                              )}
                            </div>
                            {movie.Genre && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {movie.Genre.split(',').slice(0, 2).map((genre, index) => (
                                  <span 
                                    key={index}
                                    className="px-2.5 py-1 rounded-full bg-black/50 text-xs text-white/90 backdrop-blur-sm"
                                  >
                                    {genre.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <WishlistButton
                          movie={movie}
                          className="absolute top-2 right-2 z-10"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <TrailerHero 
        onPlay={(movieId: string) => {
          setSelectedContent(movieId)
          setIsPlayerOpen(true)
          handlePlayerStateChange(true)
        }}
        contentType={contentType}
      />
      
      <VideoPlayer
        imdbId={selectedContent || ''}
        contentType={contentType}
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false)
          setSelectedContent(null)
          handlePlayerStateChange(false)
        }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[40]"
      />
    </motion.div>
  )
} 