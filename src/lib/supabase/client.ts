import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn("⚠️ Supabase keys missing. Activating Ghost Client for build.");
        // Return a Proxy that handles any property access or method call without crashing
        return new Proxy({} as any, {
            get: () => () => ({ data: null, error: null, count: 0 })
        });
    }

    return createBrowserClient(url, key);
}
