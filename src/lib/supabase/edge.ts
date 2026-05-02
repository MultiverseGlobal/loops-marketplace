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
                    if (prop === 'data') return null;
                    if (prop === 'error') {
                        return { message: "Supabase configuration missing or invalid on Edge." };
                    }
                    if (prop === 'count') return 0;

                    if (typeof prop === 'string' && (prop === 'auth' || prop === 'from' || prop === 'storage')) {
                        console.error(`❌ Supabase Ghost Client (Edge): Attempted to access '${prop}' but keys are missing.`);
                    }

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
