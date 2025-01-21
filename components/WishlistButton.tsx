'use client'
import { useState, useEffect } from 'react'
import { IoHeartOutline, IoHeart } from 'react-icons/io5'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from './ui/Toast'
import { Session } from '@supabase/supabase-js'

interface Movie {
  imdbID: string
  Title: string
  Poster: string
  Type: string
}

interface WishlistButtonProps {
  movie: Movie
  className?: string
}

export default function WishlistButton({ movie, className }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    const checkWishlist = async () => {
      if (!session?.user?.id || !movie.imdbID) return

      try {
        const { data } = await supabase
          .from('wishlists')
          .select()
          .eq('content_id', movie.imdbID)
          .eq('user_id', session.user.id)
          .single()
        
        setIsInWishlist(!!data)
      } catch (error) {
        if (error instanceof Error && error.message !== 'No rows found') {
          console.error('Error checking wishlist:', error)
        }
        setIsInWishlist(false)
      }
    }

    checkWishlist()
  }, [movie.imdbID, session, supabase])

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!session?.user) {
      toast({
        title: 'Please sign in to add to wishlist',
        status: 'error'
      })
      return
    }

    try {
      setIsLoading(true)
      
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('content_id', movie.imdbID)
          .eq('user_id', session.user.id)
        
        if (error) throw error
        setIsInWishlist(false)
        toast({
          title: 'Removed from wishlist',
          status: 'success'
        })
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: session.user.id,
            content_id: movie.imdbID,
            content_type: movie.Type,
            title: movie.Title,
            poster: movie.Poster,
            added_at: new Date().toISOString()
          })
        
        if (error) {
          if (error.code === '23505') { // Unique violation
            toast({
              title: 'Already in wishlist',
              status: 'error'
            })
            return
          }
          throw error
        }
        setIsInWishlist(true)
        toast({
          title: 'Added to wishlist',
          status: 'success'
        })
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast({
        title: 'Failed to update wishlist',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={`p-2 bg-black/50 backdrop-blur-sm rounded-full 
        hover:bg-black/70 transition-all duration-300 
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
        ${className}`}
    >
      {isInWishlist ? (
        <IoHeart className="w-5 h-5 text-red-500" />
      ) : (
        <IoHeartOutline className="w-5 h-5 text-white" />
      )}
    </button>
  )
} 