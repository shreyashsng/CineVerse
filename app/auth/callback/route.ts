import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user?.user_metadata) {
      // Get first name from full name or name
      const getFirstName = (fullName: string) => fullName.split(' ')[0]
      
      const displayName = user.user_metadata.full_name 
        ? getFirstName(user.user_metadata.full_name)
        : user.user_metadata.name
          ? getFirstName(user.user_metadata.name)
          : user.email?.split('@')[0]

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single()

      // Create or update profile with first name
      const profileData = {
        id: user.id,
        display_name: displayName,
        email: user.email,
        updated_at: new Date().toISOString(),
      }

      if (!existingProfile) {
        // Create new profile
        await supabase
          .from('profiles')
          .insert([profileData])
      } else {
        // Update existing profile
        await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id)
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
} 