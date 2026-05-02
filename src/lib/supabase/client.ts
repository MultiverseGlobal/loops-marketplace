import { createBrowserClient } from '@supabase/ssr'

let browserClient: any;

export function createClient() {
    if (browserClient) return browserClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Robust validation: check if url exists and looks like a valid HTTP/HTTPS URL
    const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your-supabase-url');

    if (!isValidUrl || !key) {
        if (typeof window !== 'undefined') {
            console.warn("⚠️ Supabase keys missing or invalid in Browser. Using Ghost Client.");
        }
        
        // Recursive Proxy that handles both property access and function calls
        const createGhostProxy = (): any => {
            const ghost: any = new Proxy(() => ghost, {
                get: (target, prop) => {
                    if (prop === 'then') return undefined;
                    if (prop === 'data') return null;
                    if (prop === 'error') {
                        return { message: "Supabase configuration missing or invalid. Check your .env.local file." };
                    }
                    if (prop === 'count') return 0;
                    
                    // Log a warning when accessing properties that look like auth or database calls
                    if (typeof prop === 'string' && (prop === 'auth' || prop === 'from' || prop === 'storage')) {
                        console.error(`❌ Supabase Ghost Client: Attempted to access '${prop}' but keys are missing.`);
                    }
                    
                    return ghost;
                },
                apply: (target, thisArg, args) => {
                    return ghost;
                }
            });
            return ghost;
        };
        
        browserClient = createGhostProxy();
        return browserClient;
    }

    browserClient = createBrowserClient(url, key);
    return browserClient;
}
