'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { IoSettingsOutline, IoLogOutOutline, IoHeartOutline } from 'react-icons/io5'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import AccountSettings from './AccountSettings'
import ChangelogModal from './ChangelogModal'

export default function Navbar() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()
  const [userProfile, setUserProfile] = useState<{
    display_name: string
    email: string
  } | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isChangelogOpen, setIsChangelogOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUserProfile(profile)
        }
      }
    }

    fetchProfile()
  }, [supabase, refreshTrigger])

  useEffect(() => {
    const fetchWishlistCount = async () => {
      const { count } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
      
      setWishlistCount(count || 0)
    }

    fetchWishlistCount()

    const channel = supabase
      .channel('wishlist_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wishlists' },
        () => fetchWishlistCount()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Close dropdown and redirect to home page
      setIsDropdownOpen(false)
      router.push('/')
      router.refresh() // Refresh to update auth state
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <motion.nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-white">
                CineVerse
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsChangelogOpen(true)}
                className="hidden md:block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                Changelog
              </button>

              <Link 
                href="/wishlist" 
                className="relative p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <IoHeartOutline size={24} className="text-gray-400 hover:text-white" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <div className="relative" ref={dropdownRef}>
                <motion.div 
                  className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-sm font-medium text-gray-300">
                    {userProfile?.display_name || 'User'}
                  </span>
                  <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300">
                    <Image
                      src="/avatar.png"
                      alt="User avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-72 rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-[3000]"
                    >
                      {/* User Info Section */}
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20">
                            <Image
                              src="/avatar.png"
                              alt="User avatar"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {userProfile?.display_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{userProfile?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setIsSettingsOpen(true)
                            setIsDropdownOpen(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <IoSettingsOutline size={18} />
                          Account Settings
                        </button>
                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <IoLogOutOutline size={18} />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      <AccountSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onProfileUpdate={() => setRefreshTrigger(prev => prev + 1)}
      />

      <ChangelogModal 
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </>
  )
} 