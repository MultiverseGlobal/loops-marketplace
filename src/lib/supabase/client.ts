import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing.");
        throw new Error("Supabase Environment Variables are missing. Please check your deployment settings.");
    }
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
