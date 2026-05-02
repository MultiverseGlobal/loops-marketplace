/**
 * A robust no-op Supabase client that prevents client-side crashes
 * when environment variables are missing or invalid.
 */
export const createGhostClient = (type: 'Browser' | 'Server' | 'Edge' = 'Browser') => {
    console.warn(`⚠️ Supabase keys missing or invalid in ${type}. Activating Ghost Client.`);

    const ghostProxy: any = new Proxy(() => ghostProxy, {
        get: (target, prop) => {
            // Handle thenable/await
            if (prop === 'then') return undefined;
            
            // Handle common Supabase response properties
            if (prop === 'data') return {}; // Empty object for destructuring
            if (prop === 'error') return { message: `Supabase config missing in ${type}.` };
            if (prop === 'count') return 0;
            
            // Handle array methods to prevent crashes on data.map/filter
            if (typeof prop === 'string' && ['filter', 'map', 'forEach', 'reduce', 'find', 'some', 'every'].includes(prop)) {
                return () => [];
            }

            // Handle auth methods
            if (prop === 'auth') {
                return {
                    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
                    signOut: () => Promise.resolve({ error: null })
                };
            }

            // Log access to major modules
            if (typeof prop === 'string' && (prop === 'from' || prop === 'storage' || prop === 'functions')) {
                console.error(`❌ Supabase Ghost Client (${type}): Attempted to access '${prop}' but keys are missing.`);
            }

            return ghostProxy;
        },
        apply: () => ghostProxy
    });

    return ghostProxy;
};
