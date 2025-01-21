'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { IoTrashOutline, IoPlayOutline, IoHeartOutline, IoTimeOutline } from 'react-icons/io5'
import Navbar from '@/components/Navbar'
import VideoPlayer from '@/components/VideoPlayer'
import { format } from 'date-fns'
import { toast } from '@/components/ui/Toast'

interface WishlistItem {
  id: string
  content_id: string
  content_type: string
  title: string
  poster: string
  added_at: string
}

interface DeleteState {
  isDeleting: boolean
  itemId: string | null
}

interface VideoPlayerProps {
  imdbId: string
  contentType: 'movie' | 'series'
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie')
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [deleteState, setDeleteState] = useState<DeleteState>({
    isDeleting: false,
    itemId: null
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setIsLoading(true)
        const { data } = await supabase
          .from('wishlists')
          .select()
          .order('added_at', { ascending: false })
        
        setItems(data || [])
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()

    const channel = supabase
      .channel('wishlist_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wishlists' },
        () => fetchWishlist()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const removeFromWishlist = async (contentId: string, itemId: string) => {
    try {
      setDeleteState({ isDeleting: true, itemId })
      
      setItems(prev => prev.filter(item => item.id !== itemId))

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('content_id', contentId)

      if (error) {
        const { data } = await supabase
          .from('wishlists')
          .select()
          .order('added_at', { ascending: false })
        
        setItems(data || [])
        throw error
      }

      toast({
        title: 'Removed from wishlist',
        status: 'success'
      })
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast({
        title: 'Failed to remove from wishlist',
        status: 'error'
      })
    } finally {
      setDeleteState({ isDeleting: false, itemId: null })
    }
  }

  const handlePlay = useCallback((item: WishlistItem) => {
    try {
      if (!item.content_id || !item.content_type) {
        throw new Error('Invalid content data')
      }
      
      setContentType(item.content_type as 'movie' | 'series')
      setSelectedContent(item.content_id)
      setIsPlayerOpen(true)
    } catch (error) {
      console.error('Error playing content:', error)
      toast({
        title: 'Failed to play content',
        status: 'error'
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <Navbar />
      
      {/* Background Gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="pt-28 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                My Wishlist
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                {items.length} {items.length === 1 ? 'title' : 'titles'} saved
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-[50vh]">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-purple-500/20" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && items.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-[50vh] text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                <IoHeartOutline size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">Your wishlist is empty</h2>
              <p className="text-gray-400 max-w-md text-lg">
                Start adding movies and TV shows to your wishlist by clicking the heart icon
              </p>
            </motion.div>
          )}
          
          {/* Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }
                  }}
                  exit={{ 
                    opacity: 0,
                    scale: 0.8,
                    y: 20,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 25
                    }
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative rounded-xl overflow-hidden 
                    bg-gradient-to-br from-white/10 to-white/5 
                    backdrop-blur-sm border border-white/10 
                    hover:border-white/20 transition-all duration-300
                    max-w-[200px] w-full mx-auto
                    hover:shadow-xl hover:shadow-purple-500/10"
                >
                  <div className="relative">
                    <Image
                      src={item.poster}
                      alt={item.title}
                      width={200}
                      height={300}
                      className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/fallback-poster.jpg'
                      }}
                    />
                    
                    <div className="absolute top-2 left-2 px-2 py-1 
                      rounded-full text-[10px] font-medium
                      bg-black/50 backdrop-blur-sm border border-white/10
                      text-white/90"
                    >
                      {item.content_type === 'movie' ? 'Movie' : 'TV Series'}
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t 
                    from-black via-black/50 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <div className="absolute bottom-0 p-3 w-full">
                      <h3 className="text-sm font-medium mb-1.5 line-clamp-2">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3
                        bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 w-fit"
                      >
                        <IoTimeOutline className="w-3.5 h-3.5" />
                        <span>Added {format(new Date(item.added_at), 'MMM d, yyyy')}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <motion.button
                          onClick={() => handlePlay(item)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-1.5 
                            px-3 py-1.5 
                            bg-gradient-to-r from-purple-600 to-blue-600 
                            hover:from-purple-500 hover:to-blue-500
                            text-white rounded-full text-xs font-medium
                            transition-colors duration-300
                            shadow-lg shadow-purple-500/20
                            border border-white/10"
                        >
                          <IoPlayOutline className="w-3.5 h-3.5" />
                          Play
                        </motion.button>
                        <motion.button
                          onClick={() => removeFromWishlist(item.content_id, item.id)}
                          disabled={deleteState.isDeleting && deleteState.itemId === item.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-1.5 rounded-full 
                            transition-colors duration-300
                            backdrop-blur-sm border border-white/10
                            ${deleteState.isDeleting && deleteState.itemId === item.id
                              ? 'bg-red-500/20 text-red-300 cursor-not-allowed'
                              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            }`}
                        >
                          <IoTrashOutline className={`w-4 h-4 ${
                            deleteState.isDeleting && deleteState.itemId === item.id
                              ? 'animate-spin'
                              : ''
                          }`} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <VideoPlayer
        imdbId={selectedContent || ''}
        contentType={contentType}
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false)
          setSelectedContent(null)
        }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[40]"
      />
    </div>
  )
} 