import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your-supabase-url');

  if (!isValidUrl || !key) {
    console.warn('⚠️ Supabase Admin environment variables are missing or invalid. Using Ghost Client for build.');
    const createGhostProxy = (): any => {
        const ghost: any = new Proxy(() => ghost, {
            get: (target, prop) => {
                if (prop === 'then') return undefined;
                if (prop === 'data') return null;
                if (prop === 'error') {
                    return { message: "Supabase configuration missing or invalid for Admin." };
                }
                if (prop === 'count') return 0;

                if (typeof prop === 'string' && (prop === 'auth' || prop === 'from' || prop === 'storage')) {
                    console.error(`❌ Supabase Ghost Client (Admin): Attempted to access '${prop}' but keys are missing.`);
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

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
