import { createClient } from './src/lib/supabase/client';

console.log('Testing Supabase Client initialization...');
try {
    const client = createClient();
    console.log('Client created.');
    // Check if it's a proxy (ghost client)
    if (client.toString().includes('Proxy')) {
        console.log('Detected Ghost Client! Environment variables are likely missing or invalid.');
    } else {
        console.log('Real Supabase Client initialized.');
    }
} catch (e) {
    console.error('Error creating client:', e);
}
