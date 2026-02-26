const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://auoyugxdgvvgwrldgudx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3l1Z3hkZ3Z2Z3dybGRndWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTEzMDQsImV4cCI6MjA4Mzg4NzMwNH0.IO8RwQ0g6b5aX8hUjfWT3XxbIW74eN7UdxkMHHlpeZ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    const { data: policies, error } = await supabase
        .rpc('get_policies', { table_name: 'listings' }); // This RPC might not exist, let's try a direct query if we have permissions

    // If RPC doesn't exist, we can try querying the pg_policies view (but might need higher roles)
    // For now, let's just try to read listings as an anonymous user again but with a specific filter
    // to see if it works.

    const { data, error: lError } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active');

    fs.writeFileSync('rls_test.json', JSON.stringify({ data, error: lError }, null, 2));
}

checkPolicies();
