'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AuthModal from '@/components/AuthModal'

const GlowingBackground = () => (
  <div className="fixed inset-0 overflow-hidden">
    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-black/80 rounded-full blur-[120px]" />
  </div>
)

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.04, 0.62, 0.23, 0.98]
    }
  }
}

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoading(false)
      if (session) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsLoading(false)
    }
  }, [supabase.auth, router])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const handleStartStreaming = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      } else {
        setIsAuthModalOpen(true)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setIsAuthModalOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black pointer-events-none" />

      {/* Content container with adjusted padding */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-20 md:pt-24">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
          CineVerse
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
          Your gateway to endless entertainment. Stream your favorite movies and TV shows in one place.
        </p>
        {/* ... rest of the content ... */}
      </div>
    </main>
  )
}
