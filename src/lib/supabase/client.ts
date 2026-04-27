import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // During build, environment variables might be missing. 
    // We provide placeholders to satisfy the Supabase library's validation.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.warn("⚠️ Supabase Environment Variables are missing. Using placeholders for build/SSR.");
    }

    return createBrowserClient(url, key);
}
