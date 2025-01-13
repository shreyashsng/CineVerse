'use client'
import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import AdminDashboard from '../../components/AdminDashboard'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div>
      <div className="fixed top-0 right-0 p-4 z-50">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300"
        >
          Sign Out
        </button>
      </div>
      <AdminDashboard />
    </div>
  )
} 