'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCloseOutline } from 'react-icons/io5'
import { FcGoogle } from 'react-icons/fc'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'signin' | 'signup' | 'forgotPassword'

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [username, setUsername] = useState('')

  const supabase = createClientComponentClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        if (data.user) {
          onClose()
          router.push('/dashboard')
          router.refresh()
        }
      } else if (mode === 'signup') {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              display_name: username || email.split('@')[0],
            }
          }
        })
        if (signUpError) throw signUpError

        if (data.user) {
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select()
            .eq('id', data.user.id)
            .single()

          // Only create profile if it doesn't exist
          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id,
                  display_name: username || email.split('@')[0],
                  email: email,
                  updated_at: new Date().toISOString(),
                },
              ])
            if (profileError) throw profileError
          }

          // Automatically sign in after successful signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (signInError) throw signInError

          // Redirect to dashboard
          onClose()
          router.push('/dashboard')
          router.refresh()
        }
      } else if (mode === 'forgotPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        })
        if (error) throw error
        setMessage('Check your email for the password reset link')
      }
    } catch (error: any) {
      setError(error?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setError('Error signing in with Google. Please try again.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-[#121212] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">
                {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-medium transition-colors border border-gray-200"
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#121212] text-gray-400">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                    {message}
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      placeholder="Enter your display name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {mode !== 'forgotPassword' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
                </button>

                <div className="flex flex-col items-center gap-2 pt-2 text-sm text-gray-400">
                  {mode === 'signin' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setMode('forgotPassword')}
                        className="hover:text-white transition-colors"
                      >
                        Forgot your password?
                      </button>
                      <div>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setMode('signup')}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Sign up
                        </button>
                      </div>
                    </>
                  ) : mode === 'signup' ? (
                    <div>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('signin')}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Sign in
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Back to sign in
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 