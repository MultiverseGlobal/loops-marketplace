import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Robust validation: check if url exists and looks like a valid HTTP/HTTPS URL
    const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your-supabase-url');

    if (!isValidUrl || !key) {
        if (typeof window !== 'undefined') {
            console.warn("⚠️ Supabase keys missing or invalid in Browser. Using Ghost Client.");
        }
        
        // Recursive Proxy to handle nested property access like supabase.auth.getUser()
        const createGhostProxy = (): any => {
            return new Proxy(() => ({ data: null, error: null, count: 0 }), {
                get: (target, prop) => {
                    if (prop === 'then') return undefined; // Avoid issues with async/await
                    return createGhostProxy();
                }
            });
        };
        
        return createGhostProxy();
    }

    return createBrowserClient(url, key);
}
