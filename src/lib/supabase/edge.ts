import { createClient } from '@supabase/supabase-js'

export const createEdgeClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your-supabase-url');

    if (!isValidUrl || !key) {
        const { createGhostClient } = require('./ghost');
        return createGhostClient('Edge');
    }

    return createClient(url, key)
}
