import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/browse'

    console.log('🔍 Auth Callback Debug:', {
        code: code ? 'present' : 'missing',
        token_hash: token_hash ? 'present' : 'missing',
        type,
        fullUrl: request.url
    })

    const supabase = await createClient()

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Ensure profile exists for social users
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, campus_id')
                    .eq('id', user.id)
                    .single()

                if (!profile) {
                    await supabase.from('profiles').insert({
                        id: user.id,
                        full_name: user.user_metadata.full_name || user.user_metadata.name || 'User',
                        email_verified: true // Social login users are verified
                    })
                }

                const redirectTo = profile?.campus_id ? next : '/onboarding'
                return NextResponse.redirect(new URL(redirectTo, request.url))
            }
        }
    }

    if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (error) {
            console.error('❌ OTP Verification Error:', error)
        } else if (data.user) {
            console.log('✅ OTP Verified Successfully for:', data.user.email)

            // Update profile
            await supabase
                .from('profiles')
                .update({ email_verified: true })
                .eq('id', data.user.id)

            // Dynamic redirect based on setup status
            const { data: profile } = await supabase
                .from('profiles')
                .select('campus_id')
                .eq('id', data.user.id)
                .single()

            const redirectTo = profile?.campus_id ? '/browse?verified=true' : '/onboarding'
            return NextResponse.redirect(new URL(redirectTo, request.url))
        }
    } else if (!code) {
        console.error('❌ Missing code, token_hash or type in callback URL')
    }

    // fallback: return the user to an error page or login
    console.log('⚠️ Redirecting to login')
    return NextResponse.redirect(new URL('/login?error=auth', request.url))
}
