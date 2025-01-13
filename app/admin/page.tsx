import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  // Additional admin check
  const adminEmails = ['shreyashsng@gmail.com']
  if (!adminEmails.includes(session.user.email || '')) {
    redirect('/')
  }

  return <AdminDashboard />
} 