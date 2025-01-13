import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Add admin route protection
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const adminEmails = ['shreyashsng@gmail.com'] // Replace with your email
    if (!session || !adminEmails.includes(session.user.email || '')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard', '/admin']
} 