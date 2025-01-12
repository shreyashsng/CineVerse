'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce'
import { IoChevronForwardOutline, IoChevronBackOutline, IoCloseOutline } from 'react-icons/io5'
import VideoPlayer from './VideoPlayer'
import AlertMessage from './AlertMessage'
import Navbar from './Navbar'
import Image from 'next/image'

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

export default function DashboardClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [trendingShows, setTrendingShows] = useState<Movie[]>([])
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

  // Fetch trending content
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Extended list of popular movie and show IDs
        const movieIds = [
          'tt0111161', 'tt0068646', 'tt0468569', 'tt0071562', 'tt0050083',
          'tt0108052', 'tt0167260', 'tt0110912', 'tt0060196', 'tt0120737',
          'tt0109830', 'tt0137523', 'tt0167261', 'tt0080684', 'tt0133093'
        ]
        const showIds = [
          'tt0944947', 'tt0903747', 'tt0108778', 'tt1475582', 'tt0475784',
          'tt0386676', 'tt0185906', 'tt4574334', 'tt0098904', 'tt0141842',
          'tt0306414', 'tt0417299', 'tt2442560', 'tt0773262', 'tt0121955'
        ]

        const fetchDetails = async (ids: string[]) => {
          return Promise.all(
            ids.map(async (id) => {
              const response = await fetch(
                `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&i=${id}&plot=short`
              )
              return response.json()
            })
          )
        }

        const movies = await fetchDetails(movieIds)
        const shows = await fetchDetails(showIds)

        setTrendingMovies(movies)
        setTrendingShows(shows)
      } catch (error) {
        console.error('Error fetching trending content:', error)
      }
    }

    fetchTrending()
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

  const ContentRow = ({ title, items }: { title: string; items: Movie[] }) => {
    const rowRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = useState(false)
    const [showRightArrow, setShowRightArrow] = useState(true)

    // Check if we need to show arrows
    const checkScroll = () => {
      if (rowRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
        setShowLeftArrow(scrollLeft > 0)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }

    useEffect(() => {
      const row = rowRef.current
      if (row) {
        row.addEventListener('scroll', checkScroll)
        // Initial check
        checkScroll()
        return () => row.removeEventListener('scroll', checkScroll)
      }
    }, [])

    const scroll = (direction: 'left' | 'right') => {
      if (rowRef.current) {
        const { current } = rowRef
        const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }

    return (
      <motion.div 
        className="mb-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <motion.h2 
          className="text-2xl font-bold mb-4"
          variants={fadeInUp}
        >
          {title}
        </motion.h2>
        <div className="group relative">
          <AnimatePresence>
            {showLeftArrow && (
              <motion.button
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                onClick={() => scroll('left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-black/90 hover:bg-black p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-white/10 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IoChevronBackOutline className="w-6 h-6 text-white" />
              </motion.button>
            )}
          </AnimatePresence>

          <div 
            className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth px-4"
            ref={rowRef}
            onScroll={checkScroll}
          >
            {items.map((item, index) => (
              <motion.div
                key={item.imdbID}
                variants={{
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0 }
                }}
                transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.1 }}
                className="relative flex-none w-[200px] group/item"
              >
                <motion.div 
                  className="relative w-full aspect-[2/3] rounded-lg overflow-hidden cursor-pointer shadow-lg"
                  onClick={() => handleContentClick(item.imdbID)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {item.Poster && item.Poster !== 'N/A' ? (
                    <Image
                      src={item.Poster}
                      alt={item.Title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover/item:scale-110"
                      sizes="200px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">No Poster</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-medium text-sm line-clamp-2">
                      {item.Title}
                    </h3>
                    <p className="text-gray-300 text-xs mt-1">
                      {item.Year}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {showRightArrow && (
              <motion.button
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                onClick={() => scroll('right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-black/90 hover:bg-black p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-white/10 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IoChevronForwardOutline className="w-6 h-6 text-white" />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" 
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" 
          />
        </div>
      </motion.div>
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
      />
      
      <div className="px-8 py-6 pt-24">
        <motion.div 
          className="relative max-w-2xl mx-auto mb-8"
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
          className="relative max-w-2xl mx-auto mb-12"
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
              placeholder={`Search for ${contentType === 'movie' ? 'movies' : 'TV shows'}...`}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-md rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-white/10"
            />
            <motion.div
              className="absolute inset-0 -z-10 rounded-full opacity-25"
              style={{
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                filter: 'blur(20px)',
              }}
              animate={{
                opacity: [0.15, 0.25, 0.15],
                scale: [0.98, 1.01, 0.98],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            {isLoading && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <motion.div
                  className="w-5 h-5 border-2 border-blue-500 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute top-full left-0 right-0 mt-4 bg-black/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl z-50 border border-white/10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Search Results
                  </h2>
                  <button 
                    onClick={() => setShowSearchResults(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <IoCloseOutline size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-4 scrollbar-hide">
                  {searchResults.map((movie) => (
                    <motion.div
                      key={movie.imdbID}
                      layout
                      className="relative group rounded-xl overflow-hidden cursor-pointer"
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
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-400">No Poster</span>
                          </div>
                        )}
                        {/* Overlay with gradient and content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 z-10">
                          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
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
                            <div className="mt-2 flex flex-wrap gap-1">
                              {movie.Genre.split(',').slice(0, 2).map((genre, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-0.5 rounded-full bg-black/30 text-xs text-gray-300 backdrop-blur-sm"
                                >
                                  {genre.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait">
          {!searchResults.length && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ContentRow 
                title={contentType === 'movie' ? "Trending Movies" : "Trending TV Shows"} 
                items={contentType === 'movie' ? trendingMovies : trendingShows} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <VideoPlayer
        imdbId={selectedContent || ''}
        contentType={contentType}
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false)
          setSelectedContent(null)
        }}
      />
    </motion.div>
  )
} 