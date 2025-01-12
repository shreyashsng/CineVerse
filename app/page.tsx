'use client'
import { useState, useEffect } from 'react'
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

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
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
  }

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
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <GlowingBackground />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            variants={fadeInUp}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent pb-2">
              CineVerse
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.h2
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            Your gateway to endless entertainment. Movies and TV shows, all in one place.
          </motion.h2>

          {/* Features */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {[
              {
                title: "Vast Library",
                description: "Access thousands of movies and TV shows instantly"
              },
              {
                title: "HD Streaming",
                description: "Enjoy high-quality video with smooth playback"
              },
              {
                title: "Cross Platform",
                description: "Watch on any device, anywhere, anytime"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={fadeInUp}
            className="relative inline-block group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <button
              onClick={handleStartStreaming}
              className="relative px-8 py-4 bg-black rounded-full text-white font-medium hover:bg-black/80 transition-colors"
            >
              Start Streaming
            </button>
          </motion.div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  )
}
