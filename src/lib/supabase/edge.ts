import { createClient } from '@supabase/supabase-js'

export const createEdgeClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your-supabase-url');

    if (!isValidUrl || !key) {
        const createGhostProxy = (): any => {
            const ghost: any = new Proxy(() => ghost, {
                get: (target, prop) => {
                    if (prop === 'then') return undefined;
                    if (prop === 'data') return new Proxy({ user: null }, {
                        get: (t, p) => p === 'length' ? 0 : (t as any)[p] ?? ghost
                    });
                    if (prop === 'error') return null;
                    if (prop === 'count') return 0;
                    return ghost;
                },
                apply: (target, thisArg, args) => {
                    return ghost;
                }
            });
            return ghost;
        };
        return createGhostProxy();
    }

    return createClient(url, key)
}
