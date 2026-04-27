import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your-supabase-url');

  if (!isValidUrl || !key) {
    console.warn('⚠️ Supabase Admin environment variables are missing or invalid. Using Ghost Client for build.');
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

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
