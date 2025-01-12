'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

export default function Hero() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.2, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
            }}
          />
        </div>
      </div>
      
      <motion.div 
        className="relative z-10 text-center max-w-4xl mx-auto px-4"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          variants={fadeIn}
        >
          Welcome to{' '}
          <span className="relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              CineVerse
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </span>
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto"
          variants={fadeIn}
        >
          Your gateway to endless entertainment. Discover a universe of movies and shows.
        </motion.p>

        <motion.div variants={fadeIn}>
          <button 
            onClick={() => router.push('/dashboard')}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
          >
            <motion.span 
              className="relative z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Streaming
            </motion.span>
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mt-12"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: '✨', text: 'Premium Content' },
            { icon: '🎬', text: '4K Ultra HD' },
            { icon: '🌟', text: 'Award-winning Shows' }
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              whileHover={{ scale: 1.05, y: -5 }}
              className="backdrop-blur-md bg-white/10 px-6 py-3 rounded-full text-sm border border-white/10 hover:border-white/20 transition-colors"
            >
              <span className="mr-2">{item.icon}</span>
              {item.text}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
} 