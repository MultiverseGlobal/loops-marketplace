import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        // Only log warning during build to prevent crash
        console.warn("⚠️ Supabase Environment Variables are missing. Returning dummy client for build/SSR.");
        return createBrowserClient("", "");
    }

    return createBrowserClient(url, key);
}
