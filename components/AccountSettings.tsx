'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoChevronBackOutline, IoCloseOutline } from 'react-icons/io5'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface AccountSettingsProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdate: () => void
}

export default function AccountSettings({ isOpen, onClose, onProfileUpdate }: AccountSettingsProps) {
  const supabase = createClientComponentClient()
  const [userProfile, setUserProfile] = useState<{
    display_name: string
    email: string
  } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const fetchUserProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', session.user.id)
        .single()
      
      if (profile) {
        setUserProfile(profile)
        setDisplayName(profile.display_name)
      }
    }
  }, [supabase])

  // Fetch user profile when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile()
    }
  }, [isOpen, fetchUserProfile])

  const handleSave = async () => {
    if (displayName.trim() !== '') {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({ 
              display_name: displayName,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

          if (error) throw error
          
          setIsEditing(false)
          onProfileUpdate() // Call the callback to update parent
          await fetchUserProfile() // Refresh local state
        }
      } catch (error) {
        console.error('Error updating display name:', error)
      }
    }
  }

  const handlePasswordChange = async () => {
    // Reset errors
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    // Validate
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(errors)

    if (!Object.values(errors).some(error => error)) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: passwordForm.newPassword
        })

        if (error) throw error

        setIsChangingPassword(false)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } catch (error) {
        console.error('Error changing password:', error)
        setPasswordErrors({
          ...errors,
          currentPassword: 'Invalid current password'
        })
      }
    }
  }

  return (
    <AnimatePresence>
      {(isOpen || isChangingPassword) && (
        <>
          {/* Main Settings Modal */}
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
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                  >
                    <IoChevronBackOutline size={24} />
                  </button>
                  <h2 className="text-lg font-semibold text-white">My Account</h2>
                </div>

                {/* Profile Section */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/20">
                      <Image
                        src="/avatar.png"
                        alt="User avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{userProfile?.display_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs bg-white/10 rounded-full text-gray-300">
                          PREMIUM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="p-4 space-y-4">
                  {/* Display Name */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex-1 mr-4">
                      <p className="text-sm text-gray-400">Display Name</p>
                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
                            placeholder="Enter display name"
                          />
                          <button
                            onClick={handleSave}
                            className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setDisplayName(userProfile?.display_name || '')
                              setIsEditing(false)
                            }}
                            className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-white">{userProfile?.display_name}</p>
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{userProfile?.email}</p>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm text-gray-400">Password</p>
                      <p className="text-white">••••••••</p>
                    </div>
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  {/* Subscription */}
                  <div className="mt-6 p-4 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-400">Subscription</p>
                        <p className="text-white font-medium">Premium Plan</p>
                      </div>
                      <button 
                        className="px-4 py-2 text-sm bg-purple-500/30 text-purple-300 rounded-full cursor-not-allowed opacity-50"
                        disabled
                      >
                        Upgrade to PREMIUM
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      You are currently on the Premium plan. Enjoy all premium features!
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Password Change Modal */}
          {isChangingPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md bg-[#121212] rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold text-white">Change Password</h2>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                      setPasswordErrors({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                    }}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                  >
                    <IoCloseOutline size={24} />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      placeholder="Enter current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-400">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      placeholder="Enter new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-400">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      placeholder="Confirm new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                        setPasswordErrors({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
} 