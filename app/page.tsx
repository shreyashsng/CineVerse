'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AuthModal from '@/components/AuthModal'

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

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

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0B]">
      {/* Backdrop Image with Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/backdrop.webp')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-6">
            <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              CineVerse
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Your gateway to endless entertainment. Stream your favorite movies and TV shows in one place.
          </p>

          <motion.button
            onClick={handleStartStreaming}
            className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-violet-600 to-blue-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Streaming
          </motion.button>

          {/* Feature Badges */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-3 mt-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { icon: '✨', text: 'Premium Content' },
              { icon: '🎬', text: '4K Ultra HD' },
              { icon: '🌟', text: 'Award-winning Shows' }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="w-full sm:w-auto bg-[#111]/80 backdrop-blur-sm px-6 py-2.5 rounded-full text-sm text-gray-400 border border-white/5 flex items-center justify-center"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <span className="mr-2">{item.icon}</span>
                {item.text}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </main>
  )
}
