import { createBrowserClient } from '@supabase/ssr'

let browserClient: any;

export function createClient() {
    if (browserClient) return browserClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Robust validation: check if url exists and looks like a valid HTTP/HTTPS URL
    const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your-supabase-url');

    if (!isValidUrl || !key) {
        const { createGhostClient } = require('./ghost');
        browserClient = createGhostClient('Browser');
        return browserClient;
    }

    browserClient = createBrowserClient(url, key);
    return browserClient;
}
