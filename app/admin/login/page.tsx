'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { IoLockClosedOutline, IoMailOutline } from 'react-icons/io5'
import Image from 'next/image'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'shreyashsng@gmail.com',
        password
      })

      if (error) throw error

      router.push('/admin')
      router.refresh()
    } catch (err) {
      setErrorMsg('Invalid login credentials')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex">
      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to access admin dashboard</p>
          </div>

          <div className="bg-[#1A1B1E] rounded-2xl p-8 shadow-2xl border border-white/5">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <IoMailOutline size={20} />
                  </div>
                  <input
                    type="email"
                    value="shreyashsng@gmail.com"
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-gray-400 opacity-75"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <IoLockClosedOutline size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600/20 to-blue-600/20 items-center justify-center p-8">
        <div className="relative w-full max-w-lg aspect-square">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full blur-3xl opacity-20" />
          <div className="relative bg-[#1A1B1E] rounded-2xl p-8 border border-white/5">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-2xl bg-purple-600 flex items-center justify-center">
                <IoLockClosedOutline size={40} className="text-white" />
              </div>
            </div>
            <div className="mt-16 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Admin Access Only</h2>
              <p className="text-gray-400 text-sm">
                This area is restricted to authorized administrators only. Please sign in with your credentials to continue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 