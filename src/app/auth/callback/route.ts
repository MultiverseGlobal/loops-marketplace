import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'

    console.log('🔍 Auth Callback Debug:', {
        code: code ? 'present' : 'missing',
        token_hash: token_hash ? 'present' : 'missing',
        type,
        fullUrl: request.url
    })

    const supabase = await createClient()

    try {
        if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            if (exchangeError) {
                console.error('❌ Auth Callback: Code exchange failed:', exchangeError.message)
                return NextResponse.redirect(new URL(`/login?error=auth&details=${encodeURIComponent(exchangeError.message)}`, request.url))
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError || !user) {
                console.error('❌ Auth Callback: Failed to get user after exchange:', userError?.message)
                return NextResponse.redirect(new URL('/login?error=auth_no_user', request.url))
            }

            if (user) {
                // Ensure profile exists for social users
                const { data: profile, error: profileFetchError } = await supabase
                    .from('profiles')
                    .select('id, campus_id')
                    .eq('id', user.id)
                    .single()

                if (profileFetchError && profileFetchError.code !== 'PGRST116') {
                    console.error('❌ Auth Callback: Profile fetch error:', profileFetchError.message)
                }

                let currentProfile = profile;

                if (!profile) {
                    console.log('📝 Auth Callback: Creating new profile for user:', user.email)
                    const { data: newProfile, error: insertError } = await supabase.from('profiles').insert({
                        id: user.id,
                        full_name: user.user_metadata.full_name || user.user_metadata.name || 'User',
                        email_verified: true // Social login users are verified
                    }).select().single()
                    
                    if (insertError) {
                        console.error('❌ Auth Callback: Profile creation failed:', insertError.message)
                        // Even if profile creation fails, we might still want to let them in, 
                        // but they'll be prompted for onboarding anyway.
                    } else {
                        currentProfile = newProfile;
                    }
                }

                const redirectTo = currentProfile?.campus_id ? next : '/onboarding'
                console.log('✅ Auth Callback: Success, redirecting to:', redirectTo)
                return NextResponse.redirect(new URL(redirectTo, request.url))
            }
        }

        if (token_hash && type) {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
                type,
                token_hash,
            })

            if (verifyError) {
                console.error('❌ Auth Callback: OTP Verification Error:', verifyError.message)
                return NextResponse.redirect(new URL(`/login?error=otp&details=${encodeURIComponent(verifyError.message)}`, request.url))
            } else if (data.user) {
                console.log('✅ Auth Callback: OTP Verified Successfully for:', data.user.email)

                // Update profile
                await supabase
                    .from('profiles')
                    .update({ email_verified: true })
                    .eq('id', data.user.id)

                const redirectTo = '/auth/verify-success'
                return NextResponse.redirect(new URL(redirectTo, request.url))
            }
        } else if (!code) {
            console.error('❌ Auth Callback: Missing code, token_hash or type in URL')
        }
    } catch (err: any) {
        console.error('💥 Auth Callback: Unexpected crash:', err.message)
        return NextResponse.redirect(new URL(`/login?error=crash&details=${encodeURIComponent(err.message)}`, request.url))
    }

    // fallback: return the user to login
    console.log('⚠️ Auth Callback: No flow matched, redirecting to login')
    return NextResponse.redirect(new URL('/login?error=auth_fallback', request.url))
}
