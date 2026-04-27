import { createClient } from '@supabase/supabase-js'

export const createEdgeClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your-supabase-url');

    if (!isValidUrl || !key) {
        const createGhostProxy = (): any => {
            return new Proxy(() => ({ data: null, error: null, count: 0 }), {
                get: (target, prop) => {
                    if (prop === 'then') return undefined;
                    return createGhostProxy();
                }
            });
        };
        return createGhostProxy();
    }

    return createClient(url, key)
}
